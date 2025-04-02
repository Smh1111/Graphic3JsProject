// utils/loadGLTFModel.ts
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

export type LoadedGLTF = {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
  mixer: THREE.AnimationMixer;
};

export async function loadGLTFModel(
  path: string,
  onProgress?: (event: ProgressEvent<EventTarget>) => void
): Promise<LoadedGLTF> {
  const loader = new GLTFLoader();

  return new Promise((resolve, reject) => {
    loader.load(
      path,
      (gltf: GLTF) => {
        const scene = gltf.scene;
        const animations = gltf.animations;
        const mixer = new THREE.AnimationMixer(scene);

        // Enable shadow casting
        scene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
          }
        });

        resolve({ scene, animations, mixer });
      },
      onProgress,
      (error) => reject(error)
    );
  });
}
