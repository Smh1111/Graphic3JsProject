import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Player } from "./game1/characters/Player";
import { Enemy } from "./game1/characters/Enemy";
import { GameState } from "./game1/utils/GameState";
import { Box } from "./game1/utils/Box";
import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";


// === Scene Setup ===
const scene = new THREE.Scene();
scene.background = new THREE.Color("white");

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 5);

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


// Ground as a Box (wide platform)
const ground = new Box(
  20, 0.5, 20,
  "#226622",
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, -2, 0)
);
ground.receiveShadow = true;
scene.add(ground);

new OrbitControls(camera, renderer.domElement);

// Replace this or add it
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

// Directional light
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 5);
dirLight.castShadow = true;
scene.add(dirLight);



// === Input ===
const keys = { w: { pressed: false }, a: { pressed: false }, s: { pressed: false }, d: { pressed: false } };

window.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    player.punch();
    const playerBox = new THREE.Box3().setFromObject(player.model);
    const enemyBox = new THREE.Box3().setFromObject(enemy.model);
    if (playerBox.intersectsBox(enemyBox)) {
      enemy.takeHit(10);
    }
  }

  if (keys[e.key as keyof typeof keys]) keys[e.key as keyof typeof keys].pressed = true;
});

window.addEventListener("keyup", (e) => {
  if (keys[e.key as keyof typeof keys]) keys[e.key as keyof typeof keys].pressed = false;
});


/*
// === Characters ===
const player = new Player(scene);
const enemy = new Enemy(scene);

Promise.all([
  player.load("/3D_objects/characters/male/gltf/Adventurer.gltf"),
  enemy.load("/3D_objects/characters/male/gltf/Adventurer.gltf")
]);



// === Animate ===
const clock = new THREE.Clock();
function animate() {
	requestAnimationFrame(animate);
        
	const delta = clock.getDelta();
        
	if (!GameState.getInstance().isGameOver) {
	  player.move(keys);
	  player.update(delta);
	  enemy.update(delta);
        
	  // 👇 Update health bar positions
    if (player?.model && enemy?.model) {
      player.updatePhysics(ground);
      enemy.updatePhysics(ground);
    
      player.healthBar.updateFromObject(player.model, camera, 2.2);
      enemy.healthBar.updateFromObject(enemy.model, camera, 2.2);
    }
    
    
	}
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  
	renderer.render(scene, camera);
        }
animate();        


*/

// === Game Initialization ===
let player: Player;
let enemy: Enemy;


const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = "absolute";
labelRenderer.domElement.style.top = "0px";
labelRenderer.domElement.style.pointerEvents = "none"; // 🔥 Fix added here
document.body.appendChild(labelRenderer.domElement);


// Wait for user input before starting the game
document.getElementById("startGameButton")?.addEventListener("click", () => {
  const playerNameInput = document.getElementById("playerName") as HTMLInputElement;
  const characterChoiceInput = document.getElementById("characterChoice") as HTMLSelectElement;

  if (playerNameInput && characterChoiceInput) {
    const playerName = playerNameInput.value;
    const characterChoice = characterChoiceInput.value;
    
    // Hide selection UI
    document.getElementById("playerSelection")?.setAttribute("style", "display: none;");
    
    document.getElementById("chatContainer")?.setAttribute("style", "display: block;");
    
    // Start the game with selected character
    startGame(playerName, characterChoice);
  }
});

function startGame(playerName: string, characterChoice: string): void {
  player = new Player(scene);
  enemy = new Enemy(scene);

  Promise.all([
    player.load(`/3D_objects/characters/male/gltf/${characterChoice.toLowerCase()}.gltf`),
    enemy.load("/3D_objects/characters/male/gltf/Adventurer.gltf"),
  ]).then(() => {
    if (player.model) {
      scene.add(player.model);
      addPlayerNameTag(player.model, playerName);
    }
    if (enemy.model) {
      scene.add(enemy.model);
    }
    animate();

    // Function to update playerInfo dynamically
    function updatePlayerInfo() {
      const otherPlayers = scene.children.filter(obj => obj !== player.model && obj !== ground);
      
      if (otherPlayers.length > 0) {
        document.getElementById("playerInfo")!.textContent = `You should attack Player: ${playerName} | Character: ${characterChoice}`;
        document.getElementById("playerInfo")!.style.display = "block";
      } else {
        document.getElementById("playerInfo")!.style.display = "none";
      }
    }

    // Check for players joining every 2 seconds
    setTimeout(updatePlayerInfo, 5000); 
    setInterval(updatePlayerInfo, 2000); 
  });
}


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
  nameLabel.position.set(0, 1.8, 0); // Adjust height above the player model
  model.add(nameLabel);
}

// Chat functionality
const chatMessages = document.getElementById("chatMessages") as HTMLDivElement;
const chatInput = document.getElementById("chatInput") as HTMLInputElement;
const sendMessageButton = document.getElementById("sendMessageButton") as HTMLButtonElement;

sendMessageButton.addEventListener("click", sendMessage);
chatInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  if (chatInput.value.trim() === "") return;

  const playerNameInput = document.getElementById("playerName") as HTMLInputElement;
  const playerName = playerNameInput?.value || "Player"; // Fallback if name is not set


  const messageDiv = document.createElement("div");
  messageDiv.textContent = `${playerName}: ${chatInput.value}`;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight; 

  chatInput.value = ""; 
}

// === Animation Loop ===
const clock = new THREE.Clock();
function animate(): void {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  if (!GameState.getInstance().isGameOver) {
    player.move(keys);
    player.update(delta);
    enemy.update(delta);

    if (player.model && enemy.model) {
      player.updatePhysics(ground);
      enemy.updatePhysics(ground);
      player.healthBar.updateFromObject(player.model, camera, 2.2);
      enemy.healthBar.updateFromObject(enemy.model, camera, 2.2);
    }
  }

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}

