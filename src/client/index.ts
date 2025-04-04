import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Player } from "./game1/characters/Player";
import { Box } from "./game1/utils/Box";
import io from "socket.io-client";
import {
	CSS2DRenderer,
	CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer.js";

const keys: Record<string, { pressed: boolean }> = {
	w: { pressed: false },
	a: { pressed: false },
	s: { pressed: false },
	d: { pressed: false },
};

let lastSentAnim = "";

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = "absolute";
labelRenderer.domElement.style.top = "0px";
labelRenderer.domElement.style.pointerEvents = "none"; // 🔥 Fix added here
document.body.appendChild(labelRenderer.domElement);

function addPlayerNameTag(model: THREE.Object3D, name: string): void {
	const nameDiv = document.createElement("div");
	nameDiv.className = "player-label";
	nameDiv.textContent = name;
	nameDiv.style.color = "white";
	nameDiv.style.fontSize = "12px";
	nameDiv.style.background = "rgba(0, 0, 0, 0.5)";
	nameDiv.style.padding = "2px 5px";
	nameDiv.style.borderRadius = "5px";

	const nameLabel = new CSS2DObject(nameDiv);
	nameLabel.position.set(0, 1.8, 0);
	model.add(nameLabel);
}

// Wait for user input before starting the game
document.getElementById("startGameButton")?.addEventListener("click", () => {
	const playerNameInput = document.getElementById(
		"playerName"
	) as HTMLInputElement;
	const characterChoiceInput = document.getElementById(
		"characterChoice"
	) as HTMLSelectElement;

	if (playerNameInput && characterChoiceInput) {
		const playerName = playerNameInput.value;
		const avatarName = characterChoiceInput.value;

		// Hide selection UI
		document.getElementById("playerSelection")?.setAttribute(
			"style",
			"display: none;"
		);

		document.getElementById("chatContainer")?.setAttribute(
			"style",
			"display: block;"
		);

		// Start the game with selected character

		startGame(playerName, avatarName);
		playStartSound(); // Play sound when game starts
	}
});
// 🎧 Create an audio listener (needed for all positional sounds)
const listener = new THREE.AudioListener();

// 🔊 Intro/start sound
const introSound = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();
audioLoader.load("game1/sound/epic-hybrid-logo-157092.mp3", (buffer) => {
	introSound.setBuffer(buffer);
	introSound.setLoop(false);
	introSound.setVolume(0.8);
});

// 👊 Punch sound
const punchSound = new THREE.Audio(listener);
const punchAudioLoader = new THREE.AudioLoader();
punchAudioLoader.load("game1/sound/punch.mp3", (buffer) => {
	punchSound.setBuffer(buffer);
	punchSound.setLoop(false);
	punchSound.setVolume(1.0);
});

// 🎵 Background game music
const backgroundSound = new THREE.Audio(listener);
const backgroundAudioLoader = new THREE.AudioLoader();
backgroundAudioLoader.load("game1/sound/backgroundGame.mp3", (buffer) => {
	backgroundSound.setBuffer(buffer); // ✅ fixed
	backgroundSound.setLoop(true);
	backgroundSound.setVolume(0.3); // Lower volume for background music
});

// ▶️ Function to start intro music and transition to background music
function playStartSound() {
	if (introSound.isPlaying) backgroundSound.stop();
	

	introSound.onEnded = () => {
		console.log("🔊 Start music ended, starting background music...");
		if (backgroundSound.buffer && !backgroundSound.isPlaying) {
			backgroundSound.play();
		}
	};
}

// Chat functionality
const chatMessages = document.getElementById("chatMessages") as HTMLDivElement;
const chatInput = document.getElementById("chatInput") as HTMLInputElement;
const sendMessageButton = document.getElementById(
	"sendMessageButton"
) as HTMLButtonElement;

const cameraOffset = new THREE.Vector3(0, 3, 5); // Offset from player

async function startGame(playerName: string, avatarName: string) {
	let lastX = 0;
	let lastZ = 0;
	let lastSentAnim = "";

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
				remotePlayerData.avatarName,
				remotePlayerData.playerName
			);
		}
	});
	sendMessageButton.addEventListener("click", sendMessage);
	chatInput.addEventListener("keypress", (e) => {
		if (e.key === "Enter") sendMessage();
	});

	function sendMessage() {
		if (chatInput.value.trim() === "") return;

		const message = chatInput.value.trim();

		// Emit to server
		socket.emit("chat-message", {
			name: playerName,
			message,
		});

		chatInput.value = "";
	}
	socket.on("chat-message", ({ name, message }) => {
		const messageDiv = document.createElement("div");
		messageDiv.textContent = `${name}: ${message}`;
		chatMessages.appendChild(messageDiv);
		chatMessages.scrollTop = chatMessages.scrollHeight;
	});

	//let playerId: string;
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

	camera.add(listener); // Attach to camera
	// 🎶 Background music
	const bgMusic = new THREE.Audio(listener);
	const bgAudioLoader = new THREE.AudioLoader();

	bgAudioLoader.load("game1/sound/backgroundGame.mp3", (buffer) => {
		bgMusic.setBuffer(buffer);
		bgMusic.setLoop(true); // Keep looping
		bgMusic.setVolume(0.3); // Lower volume so it doesn't overpower effects
		bgMusic.play();
	});

	const canvas = document.querySelector(
		"canvas.webgl"
	) as HTMLCanvasElement;
	const renderer = new THREE.WebGLRenderer({
		canvas: canvas,
		alpha: true,
		antialias: true,
	});
	renderer.setSize(window.innerWidth, window.innerHeight);

	// Ground (Arena Floor)
	const ground = new Box(
		20,
		0.5,
		20,
		"#226622", // Dark red (like a battle ring)
		new THREE.Vector3(0, 0, 0),
		new THREE.Vector3(0, -0.3, 0)
	);
	ground.receiveShadow = true;
	scene.add(ground);

	// Left Wall (Rusty Metal Look)
	const leftWall = new Box(
		0.5,
		5,
		20,
		"#3B3B3B", // Dark gray, like a steel wall
		new THREE.Vector3(0, 0, 0),
		new THREE.Vector3(-10, 0, 0)
	);
	leftWall.receiveShadow = true;
	scene.add(leftWall);

	// Right Wall (Same as Left Wall)
	const rightWall = new Box(
		0.5,
		5,
		20,
		"#3B3B3B",
		new THREE.Vector3(0, 0, 0),
		new THREE.Vector3(10, 0, 0)
	);
	rightWall.receiveShadow = true;
	scene.add(rightWall);

	// Back Wall (Optional - Closes the Arena)
	const backWall = new Box(
		20,
		5,
		0.5,
		"#3B3B3B",
		new THREE.Vector3(0, 0, 0),
		new THREE.Vector3(0, 0, -10)
	);
	backWall.receiveShadow = true;
	scene.add(backWall);

	// Front Fence (Optional - Open Cage Look)
	const frontFence = new Box(
		20,
		2.5,
		0.2,
		"#777777", // Gray (represents metal bars)
		new THREE.Vector3(0, 0, 0),
		new THREE.Vector3(0, 0, 10)
	);
	frontFence.receiveShadow = true;
	scene.add(frontFence);

	// Tree 1 (Left Side)
	const trunk1 = new THREE.Mesh(
		new THREE.CylinderGeometry(0.3, 0.3, 3, 10),
		new THREE.MeshStandardMaterial({ color: "#8B5A2B" }) // Brown trunk
	);
	trunk1.position.set(-8, -0.5, -8);
	scene.add(trunk1);

	const leaves1 = new THREE.Mesh(
		new THREE.SphereGeometry(1.5, 10, 10),
		new THREE.MeshStandardMaterial({ color: "#2E8B57" }) // Green leaves
	);
	leaves1.position.set(-8, 1.5, -8);
	scene.add(leaves1);

	// Tree 2 (Right Side)
	const trunk2 = trunk1.clone();
	trunk2.position.set(8, -0.5, -8);
	scene.add(trunk2);

	const leaves2 = leaves1.clone();
	leaves2.position.set(8, 1.5, -8);
	scene.add(leaves2);

	const controls = new OrbitControls(camera, renderer.domElement);
	controls.enableDamping = true; // Smooth motion
	controls.dampingFactor = 0.05;

	controls.enablePan = false; // Disable panning
	controls.minDistance = 5;
	controls.maxDistance = 10;
	controls.maxPolarAngle = Math.PI / 2; // Limit vertical angle (so you don't go below the ground)

	const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
	hemiLight.position.set(0, 20, 0);
	scene.add(hemiLight);

	const dirLight = new THREE.DirectionalLight(0xffffff, 1);
	dirLight.position.set(5, 10, 5);
	dirLight.castShadow = true;
	scene.add(dirLight);

	// ---------------------------------------------------------------------------------------------

	const localPlayer = new Player(scene);

	const avatarNamePath =
		"/3D_objects/characters/male/gltf/" + avatarName + ".gltf";

	await localPlayer.load(avatarNamePath);
	localPlayer.playerName = playerName; // 👈 Set name here

	addPlayerNameTag(localPlayer.model, playerName); // 👈 right here

	socket.emit("player-creation", { avatarName, playerName });

	socket.on("existing-players", (players) => {
		console.log("Received existing players:", players); // 👈 debug log

		for (const id in players) {
			if (id !== socket.id) {
				const p = players[id];
				createRemotePlayer(
					p.id,
					p.x,
					p.z,
					p.avatarName,
					p.playerName
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
		// 👇 Prevent player from moving while typing
		if (
			(document.activeElement as HTMLElement)
				.tagName === "INPUT"
		)
			return;

		if (e.code === "Space") {
			localPlayer.punch();
			socket.emit("action", { type: "punch" });

			// 👇 Play punch sound locally
			if (punchSound.isPlaying) punchSound.stop();
			punchSound.play();
		}

		if (keys[e.key]) keys[e.key].pressed = true;
	});

	window.addEventListener("keyup", (e) => {
		// 👇 Prevent unintended key release triggers from chat
		if (
			(document.activeElement as HTMLElement)
				.tagName === "INPUT"
		)
			return;

		if (keys[e.key]) keys[e.key].pressed = false;
	});

	socket.on("move", ({ id, x, z, rotationY, anim }) => {
		const remote = remotePlayers[id];
		if (remote) {
			remote.setPosition(x, 0, z);
			remote.model.rotation.y = rotationY;

			// ✅ Only change animation if not punching
			if (anim && !remote.isPunching) {
				remote.playAnimation(anim);
			}
		}
	});

	const isRunning =
		keys.w.pressed ||
		keys.a.pressed ||
		keys.s.pressed ||
		keys.d.pressed;

	const currentX = localPlayer.model.position.x;
	const currentZ = localPlayer.model.position.z;
	const currentRotationY = localPlayer.model.rotation.y;
	const currentAnim = isRunning ? "Run" : "Idle";

	// 🧠 Emit only if movement or animation changed
	if (
		currentX !== lastX ||
		currentZ !== lastZ ||
		currentAnim !== lastSentAnim
	) {
		socket.emit("move", {
			x: currentX,
			z: currentZ,
			rotationY: currentRotationY,
			anim: currentAnim,
		});

		lastX = currentX;
		lastZ = currentZ;
		lastSentAnim = currentAnim;
	}

	socket.on("update-health", ({ id, health }) => {
		const target =
			id === socket.id
				? localPlayer
				: remotePlayers[id];

		if (target) {
			target.setHealth(health);

			// ✅ If this is the local player and they're dead
			if (
				id === socket.id &&
				target.healthBar.isDead()
			) {
				scene.remove(target.model);
				target.healthBar.destroy(); // 💀 Remove UI from DOM
			}

			// ✅ If remote player is dead
			if (
				id !== socket.id &&
				target.healthBar.isDead()
			) {
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
		avatarName: string,
		playerName: string
	) {
		const newP = new Player(scene);
		newP.playerName = playerName; // 👈 Set name here

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

		addPlayerNameTag(newP.model, playerName);
	}

	const clock = new THREE.Clock();
	function animate() {
		requestAnimationFrame(animate);

		const delta = clock.getDelta();

		localPlayer.move(keys);
		localPlayer.update(delta);
		for (const id in remotePlayers) {
			remotePlayers[id].update(delta); // 🔥 THIS LINE IS THE FIX
		}

		const isRunning =
			keys.w.pressed ||
			keys.a.pressed ||
			keys.s.pressed ||
			keys.d.pressed;

		socket.emit("move", {
			x: localPlayer.model.position.x,
			z: localPlayer.model.position.z,
			rotationY: localPlayer.model.rotation.y,
			anim: isRunning ? "Run" : "Idle", // ✅ add this
		});

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
				enemy.healthBar.updateFromObject(
					enemy.model,
					camera,
					0.7
				);
				if (
					localPlayer.isPunching &&
					!localPlayer.hitCooldown
				) {
					const playerBox =
						new THREE.Box3().setFromObject(
							localPlayer.model
						);

					for (const id in remotePlayers) {
						const enemy =
							remotePlayers[
								id
							];
						if (!enemy?.model)
							continue;

						const enemyBox =
							new THREE.Box3().setFromObject(
								enemy.model
							);

						if (
							playerBox.intersectsBox(
								enemyBox
							)
						) {
							console.log(
								`👊 Punch hit player ${id}`
							);

							socket.emit(
								"hit",
								{
									targetId: id,
								}
							);

							// ✅ Prevent further hits until cooldown ends
							localPlayer.hitCooldown =
								true;

							// ⏱️ Reset cooldown after 0.5 sec
							setTimeout(
								() => {
									localPlayer.hitCooldown =
										false;
								},
								1200
							);

							break;
						}
					}
				}
			}
		}

		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;

		// if (localPlayer?.model) {
		// 	const playerPos =
		// 		localPlayer.model.position.clone();
		// 	const targetPos = playerPos
		// 		.clone()
		// 		.add(cameraOffset);

		// 	// Smooth camera follow (optional)
		// 	camera.position.lerp(targetPos, 0.1); // Smooth interpolation
		// 	// camera.lookAt(playerPos);
		// }

		controls.update();
		localPlayer.healthBar.updateFromObject(
			localPlayer.model,
			camera,
			2.2
		);
		for (const id in remotePlayers) {
			const enemy = remotePlayers[id];
			if (!enemy?.model) continue;

			// Always update their health bar position
			enemy.healthBar.updateFromObject(
				enemy.model,
				camera,
				0.7
			);
		}

		renderer.render(scene, camera);
		labelRenderer.render(scene, camera);
	}

	animate();
	function chooseTargetByMinimax(
		aiPosition: THREE.Vector3
	): { id: string; score: number } | null {
		let bestTarget: { id: string; score: number } | null = null;

		for (const id in remotePlayers) {
			const enemy = remotePlayers[id];
			if (!enemy?.model || enemy.healthBar.isDead())
				continue;

			const targetHealth =
				enemy.healthBar.currentHealth;
			const distance = aiPosition.distanceTo(
				enemy.model.position
			);
			const distancePenalty = distance * 2; // tweak as needed

			// Minimax-inspired score
			const score =
				100 - targetHealth - distancePenalty;

			if (!bestTarget || score > bestTarget.score) {
				bestTarget = { id, score };
			}
		}

		return bestTarget;
	}

	function updatePlayerInfo() {
		if (!localPlayer?.model) return;

		const target = chooseTargetByMinimax(
			localPlayer.model.position
		);

		if (target) {
			const enemy = remotePlayers[target.id];
			document.getElementById(
				"playerInfo"
			)!.textContent = `🎯 You should punch: ${enemy.playerName} | Health: ${enemy.healthBar.currentHealth}`;
			document.getElementById(
				"playerInfo"
			)!.style.display = "block";
		} else {
			document.getElementById(
				"playerInfo"
			)!.style.display = "none";
		}
	}

	// Check for players joining every 2 seconds
	setTimeout(updatePlayerInfo, 5000);
	setInterval(updatePlayerInfo, 2000);
	socket.on("action", ({ id, type }) => {
		const player =
			id === socket.id
				? localPlayer
				: remotePlayers[id];

		if (!player) return;

		if (type === "punch") {
			player.punch();
			if (punchSound.isPlaying) punchSound.stop();
			punchSound.play();
		}
	});
}
