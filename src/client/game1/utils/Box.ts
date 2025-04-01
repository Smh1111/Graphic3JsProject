import * as THREE from "three";

export class Box extends THREE.Mesh {
  velocity: THREE.Vector3;
  gravity: number;
  zAcceleration: boolean;

  width: number;
  height: number;
  depth: number;

  right!: number;
  left!: number;
  bottom!: number;
  top!: number;
  front!: number;
  back!: number;

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

    this.width = width;
    this.height = height;
    this.depth = depth;

    this.position.copy(position);

    this.velocity = velocity;
    this.gravity = -0.02;
    this.zAcceleration = zAcceleration;

    this.updateSides();
  }

  updateSides() {
    this.right = this.position.x + this.width / 2;
    this.left = this.position.x - this.width / 2;

    this.bottom = this.position.y - this.height / 2;
    this.top = this.position.y + this.height / 2;

    this.front = this.position.z + this.depth / 2;
    this.back = this.position.z - this.depth / 2;
  }

  update(ground: Box) {
    this.updateSides();

    if (this.zAcceleration) {
      this.velocity.z += 0.0003;
    }

    this.position.x += this.velocity.x;
    this.position.z += this.velocity.z;

    this.applyGravity(ground);
  }

  applyGravity(ground : Box) {
          this.velocity.y += this.gravity;
        
          const isColliding = boxCollision(
            this,
            ground
          );
        
          if (isColliding) {
            if (Math.abs(this.velocity.y) < 0.01) {
              this.velocity.y = 0; // stop bouncing
            } else {
              this.velocity.y = -this.velocity.y * 0.5; // bounce
            }
        
            // snap to ground
            this.position.y = ground.top + this.height / 2;
          } else {
            // keep falling
            this.position.y += this.velocity.y;
          }
        }
        
}

// Collision between two Box instances
export function boxCollision(box1: Box, box2: Box): boolean {
  const xCollision = box1.right >= box2.left && box1.left <= box2.right;
  const yCollision = box1.bottom + box1.velocity.y <= box2.top && box1.top >= box2.bottom;
  const zCollision = box1.front >= box2.back && box1.back <= box2.front;

  return xCollision && yCollision && zCollision;
}
