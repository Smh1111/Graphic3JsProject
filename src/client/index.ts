import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const dimension = 2000;
const worldBounds = {
  minX: -dimension,
  maxX: dimension,
  minY: -dimension,
  maxY: dimension,
  minZ: -24,
  maxZ: 25,
};



function clampCameraToBounds() {
  camera.position.x = THREE.MathUtils.clamp(camera.position.x, worldBounds.minX, worldBounds.maxX);
  camera.position.y = THREE.MathUtils.clamp(camera.position.y, worldBounds.minY, worldBounds.maxY);
  camera.position.z = THREE.MathUtils.clamp(camera.position.z, worldBounds.minZ, worldBounds.maxZ);
}

// === KEYBOARD INPUT TRACKING ===
const keyboardKeys: Record<string, boolean> = {};

window.addEventListener("keydown", (e) => {
  keyboardKeys[e.key] = true;
});
window.addEventListener("keyup", (e) => {
  keyboardKeys[e.key] = false;
});

// === CAMERA MOVEMENT LOGIC ===
// Place this inside your animate() function:
const moveSpeed = 0.8;


function handleCameraMovementXYZ() {
  // Left/Right → X axis
  if (keyboardKeys["ArrowLeft"]) {
    camera.position.x -= moveSpeed;
  }
  if (keyboardKeys["ArrowRight"]) {
    camera.position.x += moveSpeed;
  }

  // Up/Down → Y axis
  if (keyboardKeys["ArrowUp"]) {
    camera.position.y += moveSpeed;
  }
  if (keyboardKeys["ArrowDown"]) {
    camera.position.y -= moveSpeed;
  }

  // Optional: Z axis movement
  if (keyboardKeys["z"]) {
    camera.position.z -= moveSpeed; // forward
  }
  if (keyboardKeys["x"]) {
    camera.position.z += moveSpeed; // backward
  }
}



// === Scene & Camera ===
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 2, 5);


const worldSize = new THREE.Vector3(
  worldBounds.maxX - worldBounds.minX,
  worldBounds.maxY - worldBounds.minY,
  worldBounds.maxZ - worldBounds.minZ
);

const worldCenter = new THREE.Vector3(
  (worldBounds.minX + worldBounds.maxX) / 2,
  (worldBounds.minY + worldBounds.maxY) / 2,
  (worldBounds.minZ + worldBounds.maxZ) / 2
);

const worldBox = new THREE.BoxHelper(
  new THREE.Mesh(new THREE.BoxGeometry(worldSize.x, worldSize.y, worldSize.z)),
  0xffff00
);
worldBox.position.copy(worldCenter);
scene.add(worldBox);



// === Renderer ===
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector(".webgl") as HTMLCanvasElement,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// === Lighting ===
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(2, 5, 2);
scene.add(light);

// === Floor / Ground ===
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100),
  new THREE.MeshStandardMaterial({ color: "red" })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = 0; // keep at base level
floor.receiveShadow = true;
scene.add(floor);


const axesHelper = new THREE.AxesHelper(1000); // 5 = length of each axis line
scene.add(axesHelper);


// === Player Cube ===
const player = new THREE.Mesh(
  new THREE.BoxGeometry(100, 100, 100),
  new THREE.MeshStandardMaterial({ color: 0x00ff00 })
);
player.position.y = 20;
const axes = new THREE.AxesHelper(100);
player.add(axes); // show axis on player

scene.add(player);


// Create loader
const loader = new GLTFLoader();

// Load model

  
loader.load(
  "3D_objects/house_interior/scene.gltf",
  (gltf) => {
    console.log("✅ Model loaded!", gltf);
    scene.add(gltf.scene);
  },
  (progress) => {
    console.log(`📦 Loading progress: ${(progress.loaded / progress.total) * 100}%`);
  },
  (error) => {
    console.error("❌ Failed to load model:", error);
  }
);

// === Movement Controls ===
const keys: Record<string, boolean> = {};
window.addEventListener("keydown", (e) => (keys[e.key.toLowerCase()] = true));
window.addEventListener("keyup", (e) => (keys[e.key.toLowerCase()] = false));

// Physics
let velocityY = 0;
const gravity = -0.01;
let canJump = true;



// === Third-person camera follow ===
const cameraOffset = new THREE.Vector3(0, 4, 6); // above and behind

function animate() {
  requestAnimationFrame(animate);

  // Movement (same as before)
  const speed = 0.1;
  if (keys["w"]) player.position.z -= speed;
  if (keys["s"]) player.position.z += speed;
  if (keys["a"]) player.position.x -= speed;
  if (keys["d"]) player.position.x += speed;

  // Jump
  if (keys[" "] && canJump) {
    velocityY = 0.2;
    canJump = false;
  }

  velocityY += gravity;
  player.position.y += velocityY;

  if (player.position.y < 0.5) {
    player.position.y = 0.5;
    velocityY = 0;
    canJump = true;
  }

  
 
  
  const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.panSpeed = 0.2;

controls.target.set(0, 0, 0); // free orbit from world center


controls.zoomSpeed = 0.5;
controls.enableDamping = true;
controls.dampingFactor = 0.05;

  controls.update();
  handleCameraMovementXYZ();
  clampCameraToBounds();
  renderer.render(scene, camera);
}
animate();