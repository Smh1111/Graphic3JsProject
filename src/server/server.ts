import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const port = 8000;

io.on("connection", (socket) => {
  console.log(`🟢 ${socket.id} connected`);

  socket.on("updatePlayer", (data) => {
    socket.broadcast.emit("playerData", { id: socket.id, ...data });
  });

  socket.on("disconnect", () => {
    console.log(`🔴 ${socket.id} disconnected`);
    socket.broadcast.emit("playerDisconnected", socket.id);
  });
});

server.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
