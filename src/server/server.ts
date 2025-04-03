import { debug } from "console";
import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: "http://localhost:5173",
		methods: ["GET", "POST"],
	},
});

app.use(express.static("public"));

// object of socket id : player object
const playersListOnServer: Record<
	string,
	{
		id: string;
		avatarName: string;
		x: number;
		z: number;
		health: number;
	}
> = {};

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
	// 🔥 Wait for avatar info before adding to player list
	socket.on("player-creation", ( avatarName ) => {
    // Re-add or update the player
    playersListOnServer[socket.id] = {
      id: socket.id,
      avatarName,
      x: 0,
      z: 0,
      health: 100,
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

    // Send to everyone *except* the sender
    socket.broadcast.emit("move", {
      id: socket.id,
      x: pos.x,

      z: pos.z,
    });
  }
});


	socket.on("action", (action) => {
		console.log("Player action:", socket.id, action);
    const debugLine = " player:" + playersListOnServer[socket.id] + " action:" + action + " out of list:" + playersListOnServer;
    console.log(debugLine);

		if (action.type === "punch" && playersListOnServer[socket.id]) {
		

			io.emit("action", {
				id: socket.id,
				type: "punch",
			});
		}
	});

  socket.on("hit", ({ targetId }) => {
    const target = playersListOnServer[targetId];
    if (!target) return;
  
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
});

server.listen(3000, () =>
	console.log("Server running on http://localhost:3000")
);
