// Import Three.js core and addons
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// Box class with gravity and collision handling
class Box extends THREE.Mesh {
	velocity: THREE.Vector3;
	gravity: number = -0.002;
	zAcceleration: boolean;
	width: number;
	height: number;
	depth: number;
	right: number;
	left: number;
	bottom: number;
	top: number;
	front: number;
	back: number;

	constructor(
		width: number,
		height: number,
		depth: number,
		color: string,
		velocity: THREE.Vector3,
		position: THREE.Vector3,
		zAcceleration: boolean = false
	) {
		super(
			new THREE.BoxGeometry(width, height, depth),
			new THREE.MeshStandardMaterial({ color })
		);

		this.width = width
      this.height = height
      this.depth = depth

      this.position.set(position.x, position.y, position.z)

      this.right = this.position.x + this.width / 2
      this.left = this.position.x - this.width / 2

      this.bottom = this.position.y - this.height / 2
      this.top = this.position.y + this.height / 2

      this.front = this.position.z + this.depth / 2
      this.back = this.position.z - this.depth / 2

      this.velocity = velocity
      this.gravity = -0.002

      this.zAcceleration = zAcceleration
	}

	updateSides() {
		this.right = this.position.x + this.width / 2
		this.left = this.position.x - this.width / 2
	
		this.bottom = this.position.y - this.height / 2
		this.top = this.position.y + this.height / 2
	
		this.front = this.position.z + this.depth / 2
		this.back = this.position.z - this.depth / 2
	    }
	
	    update(ground: Box) {
		this.updateSides()
	
		if (this.zAcceleration) this.velocity.z += 0.0003
	
		this.position.x += this.velocity.x
		this.position.z += this.velocity.z
	
		this.applyGravity(ground)
	    }

	applyGravity(ground: Box): void {
		this.velocity.y += this.gravity;

		if (boxCollision(this, ground)) {
			const friction = 0.5
        this.velocity.y *= friction
        this.velocity.y = -this.velocity.y
		} else {
			this.position.y += this.velocity.y;
		}
	}
}
function boxCollision(box1: Box, box2: Box): boolean {
	const xCollision = box1.right >= box2.left && box1.left <= box2.right
    const yCollision =
      box1.bottom + box1.velocity.y <= box2.top && box1.top >= box2.bottom
    const zCollision = box1.front >= box2.back && box1.back <= box2.front

    return xCollision && yCollision && zCollision
}

export { Box, boxCollision };