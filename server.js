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

io.on('connection', (socket) => {
    // Envia a lista atual de jogadores para quem acabou de conectar (útil para o Mestre)
    socket.emit('updatePlayersList', gamePlayers);

    // Jogador se identifica e envia sua ficha atual
    socket.on('playerIdentify', (playerData) => {
        gamePlayers[socket.id] = playerData;
        
        const identifier = playerData.userEmail ? `${playerData.name} (${playerData.userEmail})` : (playerData.name || 'Herói');
        console.log(`[LOGIN] ${identifier} entrou na sessão.`);

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
        console.log('Aventureiro desconectado:', socket.id);
        delete gamePlayers[socket.id];
        io.emit('updatePlayersList', gamePlayers);
    });
});

// Escuta em 0.0.0.0 para permitir conexões externas na intranet
server.listen(PORT, '0.0.0.0', () => {
    console.log(`=========================================`);
    console.log(`RPG dos Guri - Servidor Iniciado!`);
    console.log(`PC: http://localhost:${PORT}`);
    console.log(`=========================================`);
});
