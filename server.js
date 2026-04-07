const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

// Estado global dos jogadores conectados: { socketId: state }
let gamePlayers = {};

app.use(express.static(path.join(__dirname, './')));

io.on('connection', (socket) => {
    console.log('Novo aventureiro conectado:', socket.id);

    // Jogador se identifica e envia sua ficha atual
    socket.on('playerIdentify', (playerData) => {
        gamePlayers[socket.id] = playerData;
        // Notifica todos (especialmente o mestre) sobre a lista atualizada
        io.emit('updatePlayersList', gamePlayers);
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

    socket.on('disconnect', () => {
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
