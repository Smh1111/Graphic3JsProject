import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

// === Scene, Camera, Renderer ===
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 100, 300);

const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector(".webgl") as HTMLCanvasElement });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// === Lighting ===
scene.add(new THREE.AmbientLight(0xffffff, 1));
const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(100, 200, 100);
scene.add(dirLight);

// === Controls ===
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.zoomSpeed = 0.5;
controls.panSpeed = 0.5;
controls.target.set(0, 0, 0);

// === World Bounds ===
const worldBounds = {
  minX: -1500,
  maxX: 1500,
  minY: 0,
  maxY: 500,
  minZ: -1000,
  maxZ: 1000,
};

function clampCameraToBounds() {
  camera.position.x = THREE.MathUtils.clamp(camera.position.x, worldBounds.minX, worldBounds.maxX);
  camera.position.y = THREE.MathUtils.clamp(camera.position.y, worldBounds.minY, worldBounds.maxY);
  camera.position.z = THREE.MathUtils.clamp(camera.position.z, worldBounds.minZ, worldBounds.maxZ);
}

// === Player Cube ===
const playerSize = new THREE.Vector3(50, 50, 50);
const player = new THREE.Mesh(
  new THREE.BoxGeometry(...playerSize.toArray()),
  new THREE.MeshStandardMaterial({ color: 0x00ff00 })
);



player.position.set(0, 5000, 0);
scene.add(player);
const debugBox = new THREE.Box3Helper(
  new THREE.Box3().setFromCenterAndSize(player.position, playerSize),
  0x00ff00
);
scene.add(debugBox);
const playerHelper = new THREE.BoxHelper(player, 0x00ff00);
scene.add(playerHelper);
// asix helper
const axesHelper = new THREE.AxesHelper(100);
scene.add(axesHelper);
// === Input Tracking ===
const keys: Record<string, boolean> = {};
window.addEventListener("keydown", (e) => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", (e) => keys[e.key.toLowerCase()] = false);

const keyboardKeys: Record<string, boolean> = {};
window.addEventListener("keydown", (e) => keyboardKeys[e.key] = true);
window.addEventListener("keyup", (e) => keyboardKeys[e.key] = false);

// === Player Physics ===
let velocityY = 0;
const gravity = -0.5;
let canJump = true;

// === Camera Movement ===
const cameraMoveSpeed = 2;
function handleCameraMovementXYZ() {
  if (keyboardKeys["ArrowLeft"])  camera.position.x -= cameraMoveSpeed;
  if (keyboardKeys["ArrowRight"]) camera.position.x += cameraMoveSpeed;
  if (keyboardKeys["ArrowUp"])    camera.position.y += cameraMoveSpeed;
  if (keyboardKeys["ArrowDown"])  camera.position.y -= cameraMoveSpeed;
  if (keyboardKeys["z"])          camera.position.z -= cameraMoveSpeed;
  if (keyboardKeys["x"])          camera.position.z += cameraMoveSpeed;
}

// === Collision Setup ===
const colliders: THREE.Box3[] = [];
let floorY = 0; // This will hold the detected floor height

function isColliding(pos: THREE.Vector3): boolean {
  const box = new THREE.Box3().setFromCenterAndSize(pos.clone(), playerSize);
  for (const collider of colliders) {
    if (box.intersectsBox(collider)) {
      console.log("🟥 Collision with:", collider);
      return true;
    }
  }
  return false;
}


// === Load GLTF Scene ===
const loader = new GLTFLoader();
loader.load(
  "3D_objects/house_interior/scene.gltf",
  (gltf) => {
     gltf.scene.scale.set(1, 1, 1);

   
    let minY = Infinity;

    gltf.scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.updateWorldMatrix(true, false);
        const box = new THREE.Box3().setFromObject(mesh);
        const size = new THREE.Vector3();
        box.getSize(size);
        if (box.min.y < minY) minY = box.min.y;
        if (size.length() < 10) return;
        colliders.push(box);

        // Track the lowest Y point (floor level)
       
        
        // Visualize bounding boxes
        const helper = new THREE.Box3Helper(box, 0xff0000);
        scene.add(helper);
      }
    });

    // Set floor height
    floorY = minY;

    // Place player on floor
    player.position.set(0, floorY , 100); // instead of 200

    

    scene.add(gltf.scene);
  },
  undefined,
  (error) => console.error("❌ Failed to load model:", error)
);

// === Animate ===
function animate() {
  requestAnimationFrame(animate);

  const speed = 2;
const horizontal = player.position.clone();

// Move left/right/forward/back
if (keys["w"]) horizontal.z -= speed;
if (keys["s"]) horizontal.z += speed;
if (keys["a"]) horizontal.x -= speed;
if (keys["d"]) horizontal.x += speed;

// Horizontal collision only
const horizontalTest = horizontal.clone();
horizontalTest.y = player.position.y; // keep Y the same

if (!isColliding(horizontalTest)) {
  player.position.x = horizontal.x;
  player.position.z = horizontal.z;
}

// Gravity and jump
if (keys[" "] && canJump) {
  velocityY = 5;
  canJump = false;
}

velocityY += gravity;
const vertical = player.position.clone();
vertical.y += velocityY;

if (!isColliding(vertical)) {
  player.position.y = vertical.y;
} else {
  if (player.position.y > vertical.y) {
    velocityY = 0;
    canJump = true;
  }
}


  controls.target.lerp(player.position.clone(), 0.1);
  controls.update();
  playerHelper.update();
  handleCameraMovementXYZ();
  clampCameraToBounds();


  debugBox.box.setFromCenterAndSize(player.position, playerSize);
  renderer.render(scene, camera);
}
animate();
