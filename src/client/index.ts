import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Player } from "./game1/characters/Player";
import { GameState } from "./game1/utils/GameState";
import { Box } from "./game1/utils/Box";
import io from "socket.io-client";

// Avatar map: type → model path
const avatarMap: Record<string, string> = {
	adventurer: "Adventurer",
	knight: "Knight",
};
const keys: Record<string, { pressed: boolean }> = {
	w: { pressed: false },
	a: { pressed: false },
	s: { pressed: false },
	d: { pressed: false },
};

let selectedType: string;

// 👇 Wait for avatar selection BEFORE starting the game
document.querySelectorAll(".avatar-btn").forEach((btn) => {
	btn.addEventListener("click", (e) => {
		const target = e.currentTarget as HTMLButtonElement;

		// Make sure the button has the text content (avatar name)
		const avatarName = target.textContent?.trim(); // .trim() removes whitespace
		console.log("avatarName ", avatarName);

		if (!avatarName) {
			console.error("Avatar name is empty!");
			return;
		}

		// Hide UI
		document.getElementById("avatar-screen")!.style.display =
			"none";

		// Start game AFTER avatar chosen
		startGame(avatarName);
	});
});

async function startGame(avatarName: string) {
	const socket = io("http://localhost:3000");

	socket.on("connect", () => {
		console.log("✅ Connected to server with ID:", socket.id);

		
	});
	socket.on("new-remote-player", (remotePlayerData) => {
		console.log("👥 New player joined:", remotePlayerData);
		console.log(
			`✅ Remote player ${remotePlayerData.id} loaded with avatar: ${remotePlayerData.avatarName}`
		);

		if (remotePlayerData.id !== socket.id) {
			createRemotePlayer(
				remotePlayerData.id,
				remotePlayerData.x,
				remotePlayerData.y,
				remotePlayerData.avatarName
			);
		}
	});

	let playerId: string;
	const remotePlayers: Record<string, Player> = {};

	const scene = new THREE.Scene();
	scene.background = new THREE.Color("white");

	const camera = new THREE.PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	);
	camera.position.set(0, 2, 5);

	const renderer = new THREE.WebGLRenderer({
		alpha: true,
		antialias: true,
	});
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	const ground = new Box(
		20,
		0.5,
		20,
		"#226622",
		new THREE.Vector3(0, 0, 0),
		new THREE.Vector3(0, 0, 0)
	);
	ground.receiveShadow = true;
	scene.add(ground);



	new OrbitControls(camera, renderer.domElement);

	const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
	hemiLight.position.set(0, 20, 0);
	scene.add(hemiLight);

	const dirLight = new THREE.DirectionalLight(0xffffff, 1);
	dirLight.position.set(5, 10, 5);
	dirLight.castShadow = true;
	scene.add(dirLight);

	const localPlayer = new Player(scene);

	const avatarNamePath =
		"/3D_objects/characters/male/gltf/" + avatarName + ".gltf";

	await localPlayer.load(avatarNamePath);
  socket.emit("player-creation", avatarName);

	socket.on("existing-players", (players) => {
		console.log("Received existing players:", players); // 👈 debug log

		for (const id in players) {
			if (id !== socket.id) {
				const p = players[id];
				createRemotePlayer(
					p.id,
					p.x,
					p.z,
					p.avatarName
				);
			}
		}
	});

  // Show world axes
scene.add(new THREE.AxesHelper(200));

// Show player bounding box
const playerBox = new THREE.Box3().setFromObject(localPlayer.model);
const playerBoxHelper = new THREE.Box3Helper(playerBox, 0xff0000);
scene.add(playerBoxHelper);

// Show ground bounding box
const groundBox = new THREE.Box3().setFromObject(ground);
const groundHelper = new THREE.Box3Helper(groundBox, 0x00ff45);
scene.add(groundHelper);
  
	window.addEventListener("keydown", (e) => {
		if (e.code === "Space") {
			localPlayer.punch();
			console.log("Punching");
			socket.emit("action", { type: "punch" });
		}

		if (keys[e.key]) keys[e.key].pressed = true;
	});

	window.addEventListener("keyup", (e) => {
		if (keys[e.key]) keys[e.key].pressed = false;
	});

  
	

	
  
  socket.on("move", ({ id, x, z }) => {
    const remote = remotePlayers[id];
    if (remote) {
      remote.setPosition(x, 0, z); // or use .model.position.set(...)
    }
  });
  socket.emit("move", {
    x: localPlayer.model.position.x,
    z: localPlayer.model.position.z,
  });

  socket.on("update-health", ({ id, health }) => {
    const target = id === socket.id ? localPlayer : remotePlayers[id];
  
    if (target) {
      target.setHealth(health);
  
      // ✅ If this is the local player and they're dead
      if (id === socket.id && target.healthBar.isDead()) {
        scene.remove(target.model);
        target.healthBar.destroy(); // 💀 Remove UI from DOM
      }
  
      // ✅ If remote player is dead
      if (id !== socket.id && target.healthBar.isDead()) {
        scene.remove(target.model);
        target.healthBar.destroy(); // Remove remote UI
        delete remotePlayers[id];
      }
    }
  });
  
  
  
  socket.on("remove-player", (id) => {
    if (remotePlayers[id]) {
      scene.remove(remotePlayers[id].model);
      remotePlayers[id].healthBar.destroy();
      delete remotePlayers[id];
    }
  });
  
    
  

	async function createRemotePlayer(
		id: string,
		x: number,
		z: number,
		avatarName: string
	) {
		const newP = new Player(scene);
		await newP
			.load(
				"/3D_objects/characters/male/gltf/" +
					avatarName +
					".gltf"
			)
			.then(() => {
				newP.setPosition(x, 0, z);
				remotePlayers[id] = newP;

				newP.healthBar.setHealth(100);
				newP.healthBar.updateFromObject(
					newP.model,
					camera,
					0.7
				);
			});
	}

	const clock = new THREE.Clock();
	function animate() {
		requestAnimationFrame(animate);
		const delta = clock.getDelta();

		localPlayer.move(keys);
    socket.emit("move", {
      x: localPlayer.model.position.x,
      z: localPlayer.model.position.z,
    });
    
		localPlayer.update(delta);
		//localPlayer.updatePhysics(ground);
		if (localPlayer?.model) {
			//localPlayer.updatePhysics(ground);

			localPlayer.healthBar.updateFromObject(
				localPlayer.model,
				camera,
				2.2
			);
		}
    
		if (localPlayer.isPunching) {
			const playerBox = new THREE.Box3().setFromObject(
				localPlayer.model
			);

			for (const id in remotePlayers) {
        
				const enemy = remotePlayers[id];
				if (!enemy?.model) continue;

				enemy.update(delta);
				//enemy.updatePhysics(ground);

				if (localPlayer.isPunching && !localPlayer.hitCooldown) {
          const playerBox = new THREE.Box3().setFromObject(localPlayer.model);
        
          for (const id in remotePlayers) {
            const enemy = remotePlayers[id];
            if (!enemy?.model) continue;
        
            const enemyBox = new THREE.Box3().setFromObject(enemy.model);
        
            if (playerBox.intersectsBox(enemyBox)) {
              console.log(`👊 Punch hit player ${id}`);
        
              socket.emit("hit", { targetId: id });
        
              // ✅ Prevent further hits until cooldown ends
              localPlayer.hitCooldown = true;
        
              // ⏱️ Reset cooldown after 0.5 sec
              setTimeout(() => {
                localPlayer.hitCooldown = false;
              }, 1200);
        
              break;
            }
          }
        }
      }        
		}

		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		renderer.render(scene, camera);
	}

	animate();
}
