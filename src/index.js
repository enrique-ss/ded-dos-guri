const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const dotenv = require('dotenv');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const { applySchema, dbPath } = require('./setup');

dotenv.config({ quiet: true });

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3001;
const requestedMode = (process.env.APP_MODE || 'offline').toLowerCase();
const hasSupabaseConfig = Boolean(
  process.env.SUPABASE_URL &&
  process.env.SUPABASE_ANON_KEY &&
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const runtimeMode = requestedMode === 'online' && hasSupabaseConfig ? 'online' : 'offline';
const supabaseEnabled = runtimeMode === 'online';
const jwtSecret = process.env.JWT_SECRET || 'offline-rpg-dev-secret';

let offlineDb = null;
if (!supabaseEnabled) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  offlineDb = new Database(dbPath);
  applySchema(offlineDb);
}

// Estado global dos jogadores conectados: { socketId: state }
let gamePlayers = {};

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

app.get('/env.js', (req, res) => {
  const publicConfig = {
    APP_MODE: runtimeMode,
    SUPABASE_URL: supabaseEnabled ? process.env.SUPABASE_URL : '',
    SUPABASE_ANON_KEY: supabaseEnabled ? process.env.SUPABASE_ANON_KEY : ''
  };

  res.type('application/javascript');
  res.send(
    `window.APP_MODE = ${JSON.stringify(publicConfig.APP_MODE)};\n` +
    `window.SUPABASE_URL = ${JSON.stringify(publicConfig.SUPABASE_URL)};\n` +
    `window.SUPABASE_ANON_KEY = ${JSON.stringify(publicConfig.SUPABASE_ANON_KEY)};\n`
  );
});

app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, '../public/index.html');
  res.type('html').send(fs.readFileSync(indexPath, 'utf8'));
});

const supabaseAdmin = supabaseEnabled
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

function serializeCharacter(row) {
  return {
    id: row.id,
    user_id: row.user_id,
    owner_email: row.owner_email,
    data: JSON.parse(row.data)
  };
}

function readAuthToken(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
}

function requireOfflineAuth(req, res, next) {
  if (supabaseEnabled) {
    res.status(400).json({ error: 'Este endpoint existe apenas no modo offline.' });
    return;
  }

  const token = readAuthToken(req);
  if (!token) {
    res.status(401).json({ error: 'Sessao offline nao encontrada.' });
    return;
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    const user = offlineDb
      .prepare('SELECT id, email, created_at FROM users WHERE id = ?')
      .get(payload.sub);

    if (!user) {
      res.status(401).json({ error: 'Usuario offline invalido.' });
      return;
    }

    req.authUser = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token offline invalido.' });
  }
}

function ensureSupabaseEnabled(res) {
  if (supabaseEnabled) {
    return true;
  }

  res.status(503).json({
    error: 'Modo offline/local ativo. Endpoints administrativos do Supabase estao desabilitados.'
  });
  return false;
}

function createOfflineSession(user) {
  const token = jwt.sign(
    { sub: user.id, email: user.email, mode: 'offline' },
    jwtSecret,
    { expiresIn: '30d' }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      created_at: user.created_at
    }
  };
}

if (!supabaseEnabled) {
  app.post('/api/auth/register', async (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    if (!email || !password) {
      res.status(400).json({ error: 'Informe email e senha.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'A senha precisa ter pelo menos 6 caracteres.' });
      return;
    }

    const existing = offlineDb
      .prepare('SELECT id FROM users WHERE email = ?')
      .get(email);

    if (existing) {
      res.status(409).json({ error: 'Ja existe uma conta com este email.' });
      return;
    }

    const now = new Date().toISOString();
    const user = {
      id: crypto.randomUUID(),
      email,
      created_at: now
    };
    const passwordHash = await bcrypt.hash(password, 10);

    offlineDb
      .prepare('INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)')
      .run(user.id, user.email, passwordHash, user.created_at);

    res.status(201).json(createOfflineSession(user));
  });

  app.post('/api/auth/login', async (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    const row = offlineDb
      .prepare('SELECT id, email, password_hash, created_at FROM users WHERE email = ?')
      .get(email);

    if (!row) {
      res.status(401).json({ error: 'Credenciais invalidas.' });
      return;
    }

    const valid = await bcrypt.compare(password, row.password_hash);
    if (!valid) {
      res.status(401).json({ error: 'Credenciais invalidas.' });
      return;
    }

    res.json(createOfflineSession(row));
  });

  app.get('/api/auth/me', requireOfflineAuth, (req, res) => {
    res.json({ user: req.authUser });
  });

  app.get('/api/characters', requireOfflineAuth, (req, res) => {
    const rows = offlineDb
      .prepare('SELECT id, user_id, owner_email, data FROM characters WHERE user_id = ? ORDER BY updated_at DESC')
      .all(req.authUser.id);

    res.json(rows.map(serializeCharacter));
  });

  app.post('/api/characters', requireOfflineAuth, (req, res) => {
    const state = req.body?.state;
    if (!state || typeof state !== 'object') {
      res.status(400).json({ error: 'Ficha invalida.' });
      return;
    }

    if (state.isDeleted && state.id) {
      offlineDb
        .prepare('DELETE FROM characters WHERE id = ? AND user_id = ?')
        .run(state.id, req.authUser.id);
      res.json({ success: true, deleted: true, id: state.id });
      return;
    }

    const id = state.id || crypto.randomUUID();
    const now = new Date().toISOString();
    const nextState = { ...state, id };

    offlineDb.prepare(`
      INSERT INTO characters (id, user_id, owner_email, name, data, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        user_id = excluded.user_id,
        owner_email = excluded.owner_email,
        name = excluded.name,
        data = excluded.data,
        updated_at = excluded.updated_at
    `).run(
      id,
      req.authUser.id,
      req.authUser.email,
      nextState.name || 'Heroi Sem Nome',
      JSON.stringify(nextState),
      now
    );

    res.json({
      success: true,
      character: {
        id,
        user_id: req.authUser.id,
        owner_email: req.authUser.email,
        data: nextState
      }
    });
  });

  app.delete('/api/characters/:id', requireOfflineAuth, (req, res) => {
    offlineDb
      .prepare('DELETE FROM characters WHERE id = ? AND user_id = ?')
      .run(req.params.id, req.authUser.id);

    res.json({ success: true });
  });

  app.get('/api/master-state', requireOfflineAuth, (req, res) => {
    const row = offlineDb
      .prepare('SELECT data FROM master_data WHERE user_id = ?')
      .get(req.authUser.id);

    res.json({ data: row ? JSON.parse(row.data) : null });
  });

  app.put('/api/master-state', requireOfflineAuth, (req, res) => {
    const state = req.body?.state;
    if (!state || typeof state !== 'object') {
      res.status(400).json({ error: 'Estado do mestre invalido.' });
      return;
    }

    const now = new Date().toISOString();
    const rowId = `master-${req.authUser.id}`;

    offlineDb.prepare(`
      INSERT INTO master_data (id, user_id, data, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        id = excluded.id,
        data = excluded.data,
        updated_at = excluded.updated_at
    `).run(rowId, req.authUser.id, JSON.stringify(state), now);

    res.json({ success: true });
  });

  app.get('/api/admin/users', requireOfflineAuth, (req, res) => {
    const rows = offlineDb
      .prepare('SELECT id, email, created_at FROM users ORDER BY created_at ASC')
      .all();

    res.json(rows);
  });

  app.post('/api/admin/characters/precreate', requireOfflineAuth, (req, res) => {
    const { targetUserId, charData } = req.body || {};
    if (!targetUserId || !charData) {
      res.status(400).json({ error: 'Dados insuficientes para pre-criacao.' });
      return;
    }

    const targetUser = offlineDb
      .prepare('SELECT id, email FROM users WHERE id = ?')
      .get(targetUserId);

    if (!targetUser) {
      res.status(404).json({ error: 'Usuario alvo nao encontrado.' });
      return;
    }

    const id = charData.id || crypto.randomUUID();
    const nextState = { ...charData, id };
    const now = new Date().toISOString();

    offlineDb.prepare(`
      INSERT INTO characters (id, user_id, owner_email, name, data, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        user_id = excluded.user_id,
        owner_email = excluded.owner_email,
        name = excluded.name,
        data = excluded.data,
        updated_at = excluded.updated_at
    `).run(
      id,
      targetUser.id,
      targetUser.email,
      nextState.name || 'Heroi Sem Nome',
      JSON.stringify(nextState),
      now
    );

    res.json({ success: true });
  });

  app.get('/api/admin/characters', requireOfflineAuth, (req, res) => {
    const rows = offlineDb
      .prepare('SELECT id, user_id, owner_email, data FROM characters ORDER BY updated_at DESC')
      .all();

    res.json(rows.map(serializeCharacter));
  });

  app.delete('/api/admin/characters/:id', requireOfflineAuth, (req, res) => {
    offlineDb.prepare('DELETE FROM characters WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });
} else {
  app.get('/api/admin/users', async (req, res) => {
    if (!ensureSupabaseEnabled(res)) return;
    try {
      const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
      if (error) throw error;
      // Formata os usuários para ter id e email no formato esperado pelo frontend
      const formattedUsers = users.map(u => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at
      }));
      res.json(formattedUsers);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/admin/characters/precreate', async (req, res) => {
    if (!ensureSupabaseEnabled(res)) return;
    try {
      const { targetUserId, charData } = req.body;
      const insertData = {
        user_id: targetUserId,
        name: charData.name,
        data: charData,
        updated_at: new Date().toISOString()
      };
      const { error } = await supabaseAdmin.from('characters').insert(insertData);
      if (error) throw error;
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/admin/characters', async (req, res) => {
    if (!ensureSupabaseEnabled(res)) return;
    try {
      const { data: chars, error: charError } = await supabaseAdmin
        .from('characters')
        .select('*')
        .order('updated_at', { ascending: false });
      if (charError) throw charError;

      const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers();
      if (userError) throw userError;

      const mappedChars = chars.map((c) => ({
        ...c,
        owner_email: users.find((u) => u.id === c.user_id)?.email || 'Desconhecido'
      }));

      res.json(mappedChars);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/admin/characters/:id', async (req, res) => {
    if (!ensureSupabaseEnabled(res)) return;
    try {
      const { id } = req.params;
      const { error } = await supabaseAdmin
        .from('characters')
        .delete()
        .eq('id', id);

      if (error) throw error;
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/characters/:id', async (req, res) => {
    if (!ensureSupabaseEnabled(res)) return;
    try {
      const { id } = req.params;
      const userId = req.authUser?.id;
      
      if (!userId) {
        res.status(401).json({ error: 'Não autorizado' });
        return;
      }

      const { error } = await supabaseAdmin
        .from('characters')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}

io.on('connection', (socket) => {
  socket.emit('updatePlayersList', gamePlayers);

  socket.on('playerIdentify', (playerData) => {
    gamePlayers[socket.id] = playerData;
    io.emit('updatePlayersList', gamePlayers);
  });

  socket.on('playerUpdate', (updatedData) => {
    gamePlayers[socket.id] = updatedData;
    socket.broadcast.emit('playerChanged', { id: socket.id, data: updatedData });
  });

  socket.on('playerLeave', () => {
    delete gamePlayers[socket.id];
    io.emit('updatePlayersList', gamePlayers);
  });

  socket.on('masterUpdatePlayer', ({ targetId, data }) => {
    if (gamePlayers[targetId]) {
      gamePlayers[targetId] = data;
      io.to(targetId).emit('serverUpdateSheet', data);
      socket.broadcast.emit('playerChanged', { id: targetId, data });
    }
  });

  socket.on('sendMessage', (msg) => {
    io.emit('newLogEntry', {
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: msg
    });
  });

  socket.on('sendAlert', (alert) => {
    io.emit('incomingAlert', alert);
  });

  socket.on('disconnect', () => {
    delete gamePlayers[socket.id];
    io.emit('updatePlayersList', gamePlayers);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`D&D dos Guri ativo em http://localhost:${PORT} (${runtimeMode})`);
});
