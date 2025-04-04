"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Box = void 0;
exports.boxCollision = boxCollision;
const THREE = __importStar(require("three"));
class Box extends THREE.Mesh {
    constructor(width, height, depth, color, velocity, position, zAcceleration = false) {
        super(new THREE.BoxGeometry(width, height, depth), new THREE.MeshStandardMaterial({ color }));
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
    update(ground) {
        this.updateSides();
        if (this.zAcceleration) {
            this.velocity.z += 0.0003;
        }
        this.position.x += this.velocity.x;
        this.position.z += this.velocity.z;
        this.applyGravity(ground);
    }
    applyGravity(ground) {
        this.velocity.y += this.gravity;
        const isColliding = boxCollision(this, ground);
        if (isColliding) {
            if (Math.abs(this.velocity.y) < 0.01) {
                this.velocity.y = 0; // stop bouncing
            }
            else {
                this.velocity.y = -this.velocity.y * 0.5; // bounce
            }
            // snap to ground
            this.position.y = ground.top + this.height / 2;
        }
        else {
            // keep falling
            this.position.y += this.velocity.y;
        }
    }
}
exports.Box = Box;
// Collision between two Box instances
function boxCollision(box1, box2) {
    const xCollision = box1.right >= box2.left && box1.left <= box2.right;
    const yCollision = box1.bottom + box1.velocity.y <= box2.top && box1.top >= box2.bottom;
    const zCollision = box1.front >= box2.back && box1.back <= box2.front;
    return xCollision && yCollision && zCollision;
}
