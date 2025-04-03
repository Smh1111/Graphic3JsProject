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

  setPosition(x: number, y: number) {
    this.container.style.left = `${x}px`;
    this.container.style.top = `${y}px`;
  }

  setHealth(health: number) {
    this.currentHealth = Math.max(0, health);
    const percent = (this.currentHealth / this.maxHealth) * 100;
    this.bar.style.width = `${percent}%`;
    this.bar.style.background = percent < 30 ? "red" : "limegreen";
    this.container.style.display = "block";
  }

  damage(amount: number) {
    this.setHealth(this.currentHealth - amount);
  }

  isDead(): boolean {
    return this.currentHealth <= 0;
  }

  destroy() {
    this.container.remove(); // ✅ Actually remove from DOM
  }

  updateFromObject(object: THREE.Object3D, camera: THREE.Camera, offsetY = 0.2) {
    const position = new THREE.Vector3();
    object.getWorldPosition(position);
    position.y += offsetY;

    const screenPosition = position.project(camera);
    const widthHalf = window.innerWidth / 2;
    const heightHalf = window.innerHeight / 2;

    this.setPosition(
      screenPosition.x * widthHalf + widthHalf,
      -screenPosition.y * heightHalf + heightHalf
    );

    this.container.style.display = "block";
    this.container.style.opacity = "1";

    // Update width/color (redundant if already done by setHealth, but safe)
    const percent = (this.currentHealth / this.maxHealth) * 100;
    this.bar.style.width = `${percent}%`;
    this.bar.style.background = percent < 30 ? "red" : "limegreen";
  }
}
