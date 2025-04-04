import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { HealthBar } from "../System/HealthBar";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer";
export class Player {
    constructor(scene) {
        this.scene = scene;
        this.actions = {};
        this.isPunching = false;
        this.hitCooldown = false;
        this.velocity = new THREE.Vector3(0, -0.01, 0);
        this.gravity = -0.03;
        this.healthBar = new HealthBar(document.body, 100);
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
        const loader = new GLTFLoader();
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
function addPlayerNameTag(model, name) {
    const nameDiv = document.createElement("div");
    nameDiv.className = "player-label";
    nameDiv.textContent = name;
    nameDiv.style.color = "white";
    nameDiv.style.fontSize = "12px";
    nameDiv.style.background = "rgba(0, 0, 0, 0.5)";
    nameDiv.style.padding = "2px 5px";
    nameDiv.style.borderRadius = "5px";
    const nameLabel = new CSS2DObject(nameDiv);
    nameLabel.position.set(0, 1.8, 0); // Y position matters!
    model.add(nameLabel); // Must attach to player model
}
