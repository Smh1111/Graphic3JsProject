"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const path_1 = __importDefault(require("path"));
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*", // during dev
    },
});
const PORT = process.env.PORT || 3000;
// 🔥 Serve static frontend (built by Vite)
app.use(express_1.default.static(path_1.default.join(__dirname, "../client")));
app.get("*", (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "../client/index.html"));
});
server.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
// object of socket id : player object
const playersListOnServer = {};
io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);
    // 🔥 Wait for avatar info before adding to player list
    socket.on("player-creation", ({ avatarName, playerName }) => {
        // Re-add or update the player
        playersListOnServer[socket.id] = {
            id: socket.id,
            avatarName,
            playerName,
            x: 0,
            z: 0,
            health: 100,
            rotationY: 0,
        };
        // Send existing players to the joining player
        socket.emit("existing-players", playersListOnServer);
        // ✅ Re-broadcast player to others
        socket.broadcast.emit("new-remote-player", playersListOnServer[socket.id]);
    });
    socket.on("move", (pos) => {
        //console.log("Pos: ", pos)
        if (playersListOnServer[socket.id]) {
            // Update the server's player data
            playersListOnServer[socket.id].x = pos.x;
            playersListOnServer[socket.id].z = pos.z;
            playersListOnServer[socket.id].rotationY =
                pos.rotationY;
            playersListOnServer[socket.id].x = pos.x;
            playersListOnServer[socket.id].z = pos.z;
            playersListOnServer[socket.id].rotationY =
                pos.rotationY;
            socket.broadcast.emit("move", {
                id: socket.id,
                x: pos.x,
                z: pos.z,
                rotationY: pos.rotationY,
                anim: pos.anim, // ✅ include animation
            });
        }
    });
    socket.on("action", (action) => {
        console.log("Player action:", socket.id, action);
        const debugLine = " player:" +
            playersListOnServer[socket.id] +
            " action:" +
            action +
            " out of list:" +
            playersListOnServer;
        console.log(debugLine);
        if (action.type === "punch" &&
            playersListOnServer[socket.id]) {
            io.emit("action", {
                id: socket.id,
                type: "punch",
            });
        }
    });
    socket.on("hit", ({ targetId }) => {
        const target = playersListOnServer[targetId];
        if (!target)
            return;
        target.health -= 20;
        console.log(`💥 ${targetId} was hit. New health: ${target.health}`);
        io.emit("update-health", {
            id: targetId,
            health: target.health,
        });
        if (target.health <= 0) {
            io.emit("remove-player", targetId);
            delete playersListOnServer[targetId];
        }
    });
    socket.on("disconnect", () => {
        console.log("Player disconnected:", socket.id);
        delete playersListOnServer[socket.id];
        io.emit("remove-player", socket.id);
    });
    socket.on("chat-message", ({ name, message }) => {
        io.emit("chat-message", {
            id: socket.id,
            name,
            message,
        });
    });
});
