"use strict";
// import * as THREE from "three";
// import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
// import { HealthBar } from "../System/HealthBar";
// import { GameState } from "../utils/GameState";
// import { Box } from "../utils/Box";
// export class Enemy {
// 	model!: THREE.Group;
// 	mixer!: THREE.AnimationMixer;
// 	actions: Record<string, THREE.AnimationAction> = {};
// 	activeAction!: THREE.AnimationAction;
// 	healthBar: HealthBar;
// 	constructor(private scene: THREE.Scene) {
// 		this.healthBar = new HealthBar(document.body, 100);
// 		this.healthBar.setPosition(window.innerWidth - 160, 20);
// 	}
// 	async load(path: string): Promise<void> {
// 		const loader = new GLTFLoader();
// 		const gltf = await loader.loadAsync(path);
// 		this.model = gltf.scene;
// 		this.model.scale.set(1, 1, 1);
// 		this.model.position.set(2, 0, 0);
// 		this.model.traverse((child) => {
// 			if ((child as THREE.Mesh).isMesh)
// 				child.castShadow = true;
// 		});
// 		this.scene.add(this.model);
// 		this.mixer = new THREE.AnimationMixer(this.model);
// 		gltf.animations.forEach((clip) => {
// 			this.actions[clip.name] =
// 				this.mixer.clipAction(clip);
// 		});
// 		this.activeAction = this.actions["Idle"];
// 		this.activeAction?.play();
// 	}
// 	takeHit(amount: number) {
// 		this.healthBar.damage(amount);
// 		this.playAnimation("HitReceive_2");
// 		if (this.healthBar.isDead()) {
// 			this.playAnimation("Death");
// 			GameState.getInstance().gameOver();
// 		}
// 	}
// 	playAnimation(name: string) {
// 		if (
// 			this.actions[name] &&
// 			this.activeAction !== this.actions[name]
// 		) {
// 			this.activeAction?.fadeOut(0.2);
// 			this.activeAction = this.actions[name];
// 			this.activeAction.reset().fadeIn(0.2).play();
// 		}
// 	}
// 	velocity = new THREE.Vector3(0, -0.01, 0);
// 	gravity = -0.002;
// 	updatePhysics(ground: Box) {
// 		if (!this.model) return;
// 		this.velocity.y += this.gravity;
// 		const bbox = new THREE.Box3().setFromObject(this.model);
// 		const modelBottom = bbox.min.y + this.velocity.y;
// 		const groundTop = ground.position.y + ground.height / 2;
// 		if (modelBottom <= groundTop) {
// 			if (Math.abs(this.velocity.y) < 0.01) {
// 				this.velocity.y = 0; // ✅ stop bouncing
// 			} else {
// 				this.velocity.y *= -0.5; // ✅ bounce
// 			}
// 			const modelHeight = bbox.max.y - bbox.min.y;
// 			this.model.position.y =
// 				groundTop + modelHeight / 2;
// 		} else {
// 			this.model.position.y += this.velocity.y;
// 		}
// 	}
// 	update(delta: number) {
// 		this.mixer?.update(delta);
// 	}
// }
