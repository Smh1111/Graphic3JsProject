import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Player } from "./game1/characters/Player";
import { Enemy } from "./game1/characters/Enemy";
import { GameState } from "./game1/utils/GameState";
import { Box } from "./game1/utils/Box";
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

// === Characters ===
const player = new Player(scene);
const enemy = new Enemy(scene);
const enemy2 = new Enemy(scene);
Promise.all([
  player.load("/3D_objects/characters/male/gltf/Adventurer.gltf"),
  player.load("/3D_objects/characters/male/gltf/Adventurer.gltf"),
  
]);

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

// === Animate ===
const clock = new THREE.Clock();
function animate() {
	requestAnimationFrame(animate);
        
	const delta = clock.getDelta();
        
	if (!GameState.getInstance().isGameOver) {
	  player.move(keys);
	  player.update(delta);
	  enemy.update(delta);
    enemy2.update(delta);
        
	  // 👇 Update health bar positions
    if (player?.model && enemy?.model) {
      player.updatePhysics(ground);
      enemy.updatePhysics(ground);
      enemy2.updatePhysics(ground);
    
      player.healthBar.updateFromObject(player.model, camera, 2.2);
      enemy.healthBar.updateFromObject(enemy.model, camera, 2.2);
      enemy2.healthBar.updateFromObject(enemy2.model, camera, 2.2);
    }
    
    
	}
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  
	renderer.render(scene, camera);
        }
animate();        