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
exports.HealthBar = void 0;
const THREE = __importStar(require("three"));
class HealthBar {
    container;
    bar;
    maxHealth;
    currentHealth;
    constructor(parent, maxHealth = 100) {
        this.maxHealth = maxHealth;
        this.currentHealth = maxHealth;
        this.container = document.createElement("div");
        this.container.style.position = "absolute";
        this.container.style.width = "120px";
        this.container.style.height = "20px";
        this.container.style.border = "2px solid black";
        this.container.style.background = "gray";
        this.container.style.pointerEvents = "none";
        this.container.style.zIndex = "1000";
        this.container.style.transform = "translate(-50%, -50%)";
        this.container.style.transition = "opacity 0.5s ease-in-out";
        this.bar = document.createElement("div");
        this.bar.style.height = "100%";
        this.bar.style.width = "100%";
        this.bar.style.background = "limegreen";
        this.bar.style.transition = "width 0.5s ease-in-out";
        this.container.appendChild(this.bar);
        parent.appendChild(this.container);
    }
    setPosition(x, y) {
        this.container.style.left = `${x}px`;
        this.container.style.top = `${y}px`;
    }
    setHealth(health) {
        this.currentHealth = Math.max(0, health);
        const percent = (this.currentHealth / this.maxHealth) * 100;
        this.bar.style.width = `${percent}%`;
        this.bar.style.background = percent < 30 ? "red" : "limegreen";
        this.container.style.display = "block";
    }
    damage(amount) {
        this.setHealth(this.currentHealth - amount);
    }
    isDead() {
        return this.currentHealth <= 0;
    }
    destroy() {
        this.container.remove(); // ✅ Actually remove from DOM
    }
    updateFromObject(object, camera, offsetY = 0.2) {
        const position = new THREE.Vector3();
        object.getWorldPosition(position);
        position.y += offsetY;
        const screenPosition = position.project(camera);
        const widthHalf = window.innerWidth / 2;
        const heightHalf = window.innerHeight / 2;
        this.setPosition(screenPosition.x * widthHalf + widthHalf, -screenPosition.y * heightHalf + heightHalf);
        this.container.style.display = "block";
        this.container.style.opacity = "1";
        // Update width/color (redundant if already done by setHealth, but safe)
        const percent = (this.currentHealth / this.maxHealth) * 100;
        this.bar.style.width = `${percent}%`;
        this.bar.style.background = percent < 30 ? "red" : "limegreen";
    }
}
exports.HealthBar = HealthBar;
