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
exports.Player = void 0;
const THREE = __importStar(require("three"));
const GLTFLoader_1 = require("three/examples/jsm/loaders/GLTFLoader");
const HealthBar_1 = require("../System/HealthBar");
const CSS2DRenderer_1 = require("three/examples/jsm/renderers/CSS2DRenderer");
class Player {
    constructor(scene) {
        this.scene = scene;
        this.actions = {};
        this.isPunching = false;
        this.hitCooldown = false;
        this.velocity = new THREE.Vector3(0, -0.01, 0);
        this.gravity = -0.03;
        this.healthBar = new HealthBar_1.HealthBar(document.body, 100);
        this.healthBar.setPosition(20, 20);
    }
    setHealth(health) {
        this.healthBar.setHealth(health);
        if (this.healthBar.isDead()) {
            this.playAnimation("Death");
        }
    }
    async takeHit(amount) {
        this.healthBar.damage(amount);
        this.playAnimation("HitReceive_2");
        if (this.healthBar.isDead()) {
            this.playAnimation("Death");
        }
    }
    async setPosition(x, y, z) {
        if (!this.model)
            return;
        this.model.position.set(x, y, z);
    }
    async load(path) {
        const loader = new GLTFLoader_1.GLTFLoader();
        const gltf = await loader.loadAsync(path);
        this.model = gltf.scene;
        this.model.scale.set(1, 1, 1);
        this.model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                const mesh = child;
                const mat = mesh.material;
                mat.metalness = 0;
                mat.roughness = 1;
            }
        });
        this.scene.add(this.model);
        this.mixer = new THREE.AnimationMixer(this.model);
        gltf.animations.forEach((clip) => {
            this.actions[clip.name] =
                this.mixer.clipAction(clip);
        });
        console.log("Loaded animations:", gltf.animations.map((c) => c.name));
        this.activeAction = this.actions["Idle"];
        this.activeAction?.play();
    }
    move(keys) {
        if (!this.model || this.isPunching)
            return;
        const speed = 0.05;
        const direction = new THREE.Vector3();
        if (keys.w.pressed)
            direction.z -= 1;
        if (keys.s.pressed)
            direction.z += 1;
        if (keys.a.pressed)
            direction.x -= 1;
        if (keys.d.pressed)
            direction.x += 1;
        if (direction.lengthSq() > 0) {
            direction.normalize();
            this.model.position.addScaledVector(direction, speed);
            const angle = Math.atan2(direction.x, direction.z);
            this.model.rotation.y = angle;
        }
        this.playAnimation(direction.lengthSq() > 0 ? "Run" : "Idle");
    }
    punch() {
        const punchAction = this.actions["Punch_Left"];
        if (!punchAction || this.isPunching) {
            console.warn("❌ Punch not triggered — missing animation or already punching.");
            return;
        }
        console.log("✅ Punch animation playing");
        this.isPunching = true;
        this.activeAction?.stop();
        this.activeAction = punchAction;
        punchAction.reset();
        punchAction.setLoop(THREE.LoopOnce, 3);
        punchAction.clampWhenFinished = true;
        punchAction.play();
    }
    playAnimation(name) {
        if (this.actions[name] &&
            this.activeAction !== this.actions[name]) {
            this.activeAction?.fadeOut(0.2);
            this.activeAction = this.actions[name];
            this.activeAction.reset().fadeIn(0.2).play();
        }
    }
    // updatePhysics(ground: Box) {
    //   if (!this.model) return;
    //   this.velocity.y += this.gravity;
    //   const bbox = new THREE.Box3().setFromObject(this.model);
    //   const modelBottom = bbox.min.y + this.velocity.y;
    //   const groundTop = -ground.position.y + ground.height / 2;
    // }
    update(delta) {
        this.mixer?.update(delta);
        if (this.isPunching) {
            console.log("🔁 isPunching still active");
            const punchAction = this.actions["Punch_Left"];
            if (punchAction &&
                punchAction.time >=
                    punchAction.getClip().duration) {
                console.log("✅ Punch finished, resetting to Idle");
                this.isPunching = false;
                this.playAnimation("Idle");
            }
        }
    }
    isOnGround(ground) {
        const bbox = new THREE.Box3().setFromObject(this.model);
        const modelBottomY = bbox.min.y;
        const groundTopY = ground.position.y + ground.height / 2;
        return modelBottomY <= groundTopY + 0.01;
    }
}
exports.Player = Player;
function addPlayerNameTag(model, name) {
    const nameDiv = document.createElement("div");
    nameDiv.className = "player-label";
    nameDiv.textContent = name;
    nameDiv.style.color = "white";
    nameDiv.style.fontSize = "12px";
    nameDiv.style.background = "rgba(0, 0, 0, 0.5)";
    nameDiv.style.padding = "2px 5px";
    nameDiv.style.borderRadius = "5px";
    const nameLabel = new CSS2DRenderer_1.CSS2DObject(nameDiv);
    nameLabel.position.set(0, 1.8, 0); // Y position matters!
    model.add(nameLabel); // Must attach to player model
}
