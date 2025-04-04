// utils/loadGLTFModel.ts
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
export async function loadGLTFModel(path, onProgress) {
    const loader = new GLTFLoader();
    return new Promise((resolve, reject) => {
        loader.load(path, (gltf) => {
            const scene = gltf.scene;
            const animations = gltf.animations;
            const mixer = new THREE.AnimationMixer(scene);
            // Enable shadow casting
            scene.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                }
            });
            resolve({ scene, animations, mixer });
        }, onProgress, (error) => reject(error));
    });
}
