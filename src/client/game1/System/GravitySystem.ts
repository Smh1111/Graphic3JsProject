import * as THREE from "three";

type GravityOptions = {
          gravity?: number;
          maxFallSpeed?: number;
        };
        
        export class GravityHandler {
          velocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
          gravity: number;
          maxFallSpeed: number;
        
          constructor(options: GravityOptions = {}) {
            this.gravity = options.gravity ?? -0.015;
            this.maxFallSpeed = options.maxFallSpeed ?? -0.5;
          }
        
          applyGravity(dt: number) {
            this.velocity.y += this.gravity * dt;
            if (this.velocity.y < this.maxFallSpeed) {
              this.velocity.y = this.maxFallSpeed;
            }
          }
        
          updatePosition(model: THREE.Object3D, groundY: number) {
            model.position.y += this.velocity.y;
        
            const bbox = new THREE.Box3().setFromObject(model);
            const modelBottomY = bbox.min.y;
        
            if (modelBottomY <= groundY) {
              const height = bbox.max.y - bbox.min.y;
              model.position.y = groundY + height / 2;
        
              // Reset vertical velocity
              this.velocity.y = 0;
            }
          }
        }
        