// Import Three.js core and addons
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {Box, boxCollision} from "./game1/Box";

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color("white");

const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);
camera.position.set(4.61, 2.74, 8);

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);


// Player Cube
const cube = new Box(
	1,
	1,
	1,
	"#00ff00",
	new THREE.Vector3(0, -0.01, 0),
	new THREE.Vector3(0, 0, 0),
	
);

cube.castShadow = true;
scene.add(cube);

// Ground
const ground = new Box(
	10,
	0.5,
	50,
	"#0369a1",
	new THREE.Vector3(0, 0, 0),
	new THREE.Vector3(0, -2, 0)
);
ground.receiveShadow = true;
scene.add(ground);
// axis helper
const axesHelper = new THREE.AxesHelper(1000);
axesHelper.position.set(0, 0, 0);

scene.add(axesHelper);



// Add a grid helper
const gridHelper = new THREE.GridHelper(100, 50);
gridHelper.rotation.x = Math.PI / 2;
gridHelper.position.y = -0.5;
scene.add(gridHelper);
// Add a plane helper
const planeHelper = new THREE.PlaneHelper(
	new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.5),
	100,
	0xf0000
);
scene.add(planeHelper);


// Lighting
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 3, 1);
directionalLight.castShadow = true;
scene.add(directionalLight);
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
type KeyState = {
	pressed: boolean;
        };
        
        const keys: Record<'a' | 'd' | 's' | 'w', KeyState> = {
	a: { pressed: false },
	d: { pressed: false },
	s: { pressed: false },
	w: { pressed: false }
        };
        

// Enemy spawn and update
const enemies: Box[] = [];
let frames = 0;
let spawnRate = 200;

function spawnEnemy(): void {
	const enemy = new Box(
		1,
		1,
		1,
		"red",
		new THREE.Vector3(0, 0, 0),
		new THREE.Vector3((Math.random() - 0.5) * 10, 0, -20),
		false
	);
	enemy.castShadow = true;
	scene.add(enemy);
	enemies.push(enemy);
}

// Animate loop
function animate(): void {
	requestAnimationFrame(animate);

	// Movement logic
	cube.velocity.x = 0;
	cube.velocity.z = 0
    if (keys.a.pressed) cube.velocity.x = -0.05
    else if (keys.d.pressed) cube.velocity.x = 0.05

    if (keys.s.pressed) cube.velocity.z = 0.05
    else if (keys.w.pressed) cube.velocity.z = -0.05

	cube.update(ground);

	enemies.forEach((enemy) => {
		enemy.update(ground);
		if (boxCollision(cube, enemy)) {
			console.log("hit - game over");
		}
	});

	if (frames % spawnRate === 0) {
		if (spawnRate > 20) spawnRate -= 20;
		spawnEnemy();
	}

	frames++;
	renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener("resize", () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
});


      
        window.addEventListener('keydown', (event) => {
	switch (event.code) {
	  case 'KeyA':
	    keys.a.pressed = true
	    break
	  case 'KeyD':
	    keys.d.pressed = true
	    break
	  case 'KeyS':
	    keys.s.pressed = true
	    break
	  case 'KeyW':
	    keys.w.pressed = true
	    break
	  case 'Space':
	    cube.velocity.y = 0.08
	    break
	}
        })
      
        window.addEventListener('keyup', (event) => {
	switch (event.code) {
	  case 'KeyA':
	    keys.a.pressed = false
	    break
	  case 'KeyD':
	    keys.d.pressed = false
	    break
	  case 'KeyS':
	    keys.s.pressed = false
	    break
	  case 'KeyW':
	    keys.w.pressed = false
	    break
	}
        })
      