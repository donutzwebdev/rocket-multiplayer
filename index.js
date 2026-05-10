const express = require('express');
const path = require('path'); // Added for reliable file paths
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
 
// 1. Serve all files in the 'public' folder (CSS, JS, Images)
app.use(express.static(path.join(__dirname, 'public')));

// 2. EXPLICITLY send index.html when someone visits the main URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

let players = {};

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Initial player state
    players[socket.id] = { x: 0, y: 0, angle: 0, throttle: 0, isBroken: false };

    // Sync players
    socket.emit('currentPlayers', players);
    socket.broadcast.emit('newPlayer', { id: socket.id, player: players[socket.id] });

    socket.on('playerMovement', (movementData) => {
        if (players[socket.id]) {
            players[socket.id] = movementData;
            socket.broadcast.emit('playerMoved', { id: socket.id, player: players[socket.id] });
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        delete players[socket.id];
        io.emit('playerDisconnected', socket.id);
    });
});

// Use Replit's port or 3000
// Use the port provided by the hosting service or 3000
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`🚀 Rocket Server is LIVE on port ${PORT}`);
});
