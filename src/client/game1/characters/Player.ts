import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { HealthBar } from "../ui/HealthBar";
import { Box } from "../utils/Box";

export class Player {
  model!: THREE.Group;
  mixer!: THREE.AnimationMixer;
  actions: Record<string, THREE.AnimationAction> = {};
  activeAction!: THREE.AnimationAction;
  healthBar: HealthBar;
  isPunching = false;


  constructor(private scene: THREE.Scene) {
    this.healthBar = new HealthBar(document.body, 100);
    this.healthBar.setPosition(20, 20);
  }

  async load(path: string): Promise<void> {
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync(path);

    this.model = gltf.scene;
    this.model.scale.set(1, 1, 1);
    this.model.position.set(0, 5, 0);

    this.model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) 
      {child.castShadow = true;
    child.receiveShadow = true;

    const mesh = child as THREE.Mesh;
    const mat = mesh.material as THREE.MeshStandardMaterial;
    mat.metalness = 0;
    mat.roughness = 1;}
    });

    this.scene.add(this.model);

    this.mixer = new THREE.AnimationMixer(this.model);

    gltf.animations.forEach((clip) => {
      this.actions[clip.name] = this.mixer.clipAction(clip);
    });

    this.activeAction = this.actions["Idle"];
    this.activeAction?.play();
  }

  move(keys: Record<string, { pressed: boolean }>) {
    if (!this.model || this.isPunching) return;
  
    const speed = 0.05;
    const direction = new THREE.Vector3();
  
    if (keys.w.pressed) direction.z -= 1;
    if (keys.s.pressed) direction.z += 1;
    if (keys.a.pressed) direction.x -= 1;
    if (keys.d.pressed) direction.x += 1;
  
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
    if (!punchAction || this.isPunching) return;
  
    this.isPunching = true;
  
    this.activeAction?.stop();
    this.activeAction = punchAction;
  
    punchAction.reset();
    punchAction.setLoop(THREE.LoopOnce, 1);
    punchAction.clampWhenFinished = true;
    punchAction.play();
  }
  
  
  

  playAnimation(name: string) {
    if (this.actions[name] && this.activeAction !== this.actions[name]) {
      this.activeAction?.fadeOut(0.2);
      this.activeAction = this.actions[name];
      this.activeAction.reset().fadeIn(0.2).play();
    }
  }
   velocity = new THREE.Vector3(0, -0.01, 0);
    gravity = -0.002;
    
    updatePhysics(ground: Box) {
      if (!this.model) return;
    
      this.velocity.y += this.gravity;
    
      const bbox = new THREE.Box3().setFromObject(this.model);
      const modelBottom = bbox.min.y + this.velocity.y;
      const groundTop = ground.position.y + ground.height / 2;
    
      if (modelBottom <= groundTop) {
        console.log("modelBottom, groundTop ", modelBottom, groundTop);

        if (Math.abs(this.velocity.y) < 0.0001) {
          this.velocity.y = 0; // ✅ stop bouncing
        } else if (Math.abs(this.velocity.y) < 0) {
          this.velocity.y *= -0.5; // ✅ bounce
        } 
    
        const modelHeight = bbox.max.y - bbox.min.y;
        this.model.position.y = groundTop + modelHeight / 2;
      } else {
        this.model.position.y += this.velocity.y;
      }
    }
    
    update(delta: number) {
      this.mixer?.update(delta);
    
      if (this.isPunching) {
        const punchAction = this.actions["Punch_Left"];
        if (punchAction && punchAction.time >= punchAction.getClip().duration) {
          this.isPunching = false;
          this.playAnimation("Idle");
        }
      }
    }
    
}
