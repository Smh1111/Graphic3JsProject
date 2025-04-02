import * as THREE from "three";


export class HealthBar {
	container: HTMLDivElement;
	bar: HTMLDivElement;
	maxHealth: number;
	currentHealth: number;
        
	constructor(parent: HTMLElement, maxHealth = 100) {
	  this.maxHealth = maxHealth;
	  this.currentHealth = maxHealth;
        
	  this.container = document.createElement("div");
	  this.container.style.position = "absolute";
	  this.container.style.width = "120px";
	  this.container.style.height = "20px";
	  this.container.style.border = "2px solid black";
	  this.container.style.background = "gray";
        
	  this.bar = document.createElement("div");
	  this.bar.style.height = "100%";
	  this.bar.style.width = "100%";
	  this.bar.style.background = "limegreen";
        
	  this.container.appendChild(this.bar);
	  parent.appendChild(this.container);
	}
        
	setPosition(x: number, y: number) {
	  this.container.style.left = `${x}px`;
	  this.container.style.top = `${y}px`;
	}
        
	damage(amount: number) {
	  this.currentHealth = Math.max(this.currentHealth - amount, 0);
	  const percent = (this.currentHealth / this.maxHealth) * 100;
	  this.bar.style.width = `${percent}%`;
	  this.bar.style.background = percent < 30 ? "red" : "limegreen";
	}
        
	isDead() {
	  return this.currentHealth <= 0;
	}
        
	hide() {
	  this.container.style.display = "none";
	}
	updateFromObject(object: THREE.Object3D, camera: THREE.Camera, offsetY = 1.5) {
		const position = new THREE.Vector3();
		object.getWorldPosition(position);
		//console.log("Object Position:", object.position);
		position.y += offsetY;
	        
		const screenPos = position.clone().project(camera);
		const x = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
		const y = (-screenPos.y * 0.5 + 0.5) * window.innerHeight;
	        
		this.setPosition(x - 60, y); // center it horizontally
	        }
	        
        }
        
