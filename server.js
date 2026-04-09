const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Estado global dos jogadores conectados: { socketId: state }
let gamePlayers = {};

app.use(express.static(path.join(__dirname, './')));

// Rota para a página de admin
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Ponte para listar usuários reais do Supabase (Apenas para Admin)
const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient(
    'https://wnsjluwxqkgjttpsrrtp.supabase.co', 
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Induc2psdXd4cWtnanR0cHNycnRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTc0NDI1NCwiZXhwIjoyMDkxMzIwMjU0fQ.Qlmhp4kG3y0_X6d2O7aetFj8eYLLfLhobotP-Kk8bCI'
);

app.get('/api/admin/users', async (req, res) => {
    try {
        const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
        if (error) throw error;
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

io.on('connection', (socket) => {
    // Envia a lista atual de jogadores para quem acabou de conectar (útil para o Mestre)
    socket.emit('updatePlayersList', gamePlayers);

    // Jogador se identifica e envia sua ficha atual
    socket.on('playerIdentify', (playerData) => {
        gamePlayers[socket.id] = playerData;
        
        const identifier = playerData.userEmail ? `${playerData.name} (${playerData.userEmail})` : (playerData.name || 'Herói');


        // Notifica todos (especialmente o mestre) sobre a lista atualizada
        io.emit('updatePlayersList', gamePlayers);
        
        // --- LOG AUTOMÁTICO ---
        
        io.emit('newLogEntry', { 
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: `🟢 <strong>${identifier}</strong> entrou na aventura!` 
        });
    });

    // Jogador atualiza sua própria ficha (ex: mudou HP no celular dele)
    socket.on('playerUpdate', (updatedData) => {
        gamePlayers[socket.id] = updatedData;
        // Envia para todos os outros (Mestre e outros jogadores se necessário)
        socket.broadcast.emit('playerChanged', { id: socket.id, data: updatedData });
    });

    // Mestre altera a ficha de um jogador específico
    socket.on('masterUpdatePlayer', ({ targetId, data }) => {
        if (gamePlayers[targetId]) {
            gamePlayers[targetId] = data;
            // Envia a atualização especificamente para o celular do jogador alvo
            io.to(targetId).emit('serverUpdateSheet', data);
            // Notifica o mestre (e outros) sobre a mudança refletida
            socket.broadcast.emit('playerChanged', { id: targetId, data: data });
        }
    });

    // --- NOVOS EVENTOS DO MESTRE ---
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
        const p = gamePlayers[socket.id];
        if (p) {
            io.emit('newLogEntry', { 
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                text: `🔴 <strong>${p.name || 'Herói'}</strong> desconectou.` 
            });
        }

        delete gamePlayers[socket.id];
        io.emit('updatePlayersList', gamePlayers);
    });
});

// Escuta em 0.0.0.0 para permitir conexões externas na intranet
server.listen(PORT, '0.0.0.0', () => {
    console.log(`D&D dos Guri - Servidor Iniciado!`);
    console.log(`URL: http://localhost:${PORT}`);
    console.log(`=========================================`);
});
