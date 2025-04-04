import * as THREE from "three";
export class GravityHandler {
    constructor(options = {}) {
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.gravity = options.gravity ?? -0.015;
        this.maxFallSpeed = options.maxFallSpeed ?? -0.5;
    }
    applyGravity(dt) {
        this.velocity.y += this.gravity * dt;
        if (this.velocity.y < this.maxFallSpeed) {
            this.velocity.y = this.maxFallSpeed;
        }
    }
    updatePosition(model, groundY) {
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
