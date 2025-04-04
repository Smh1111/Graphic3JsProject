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
exports.GravityHandler = void 0;
const THREE = __importStar(require("three"));
class GravityHandler {
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
exports.GravityHandler = GravityHandler;
