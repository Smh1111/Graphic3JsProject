import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const players: any = {};
const bullets: any[] = [];

io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);
    players[socket.id] = { x: 200, y: 200, id: socket.id };

    socket.emit('init', { id: socket.id, players, bullets });
    socket.broadcast.emit('new-player', players[socket.id]);

    socket.on('move', (pos) => {
        if (players[socket.id]) {
            players[socket.id].x = pos.x;
            players[socket.id].y = pos.y;
            io.emit('move', { id: socket.id, x: pos.x, y: pos.y });
        }
    });

    

    socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);
        delete players[socket.id];
        io.emit('remove-player', socket.id);
    });
});

server.listen(3000, () => console.log('Server running on http://localhost:3000'));
