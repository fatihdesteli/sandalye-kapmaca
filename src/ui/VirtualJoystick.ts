import Phaser from 'phaser';

export class VirtualJoystick {
  private scene: Phaser.Scene;
  private base: Phaser.GameObjects.Arc;
  private stick: Phaser.GameObjects.Arc;
  private isDragging: boolean = false;
  private baseX: number;
  private baseY: number;
  private radius: number = 60;
  private stickRadius: number = 30;

  // Normalized direction vector
  public direction: { x: number; y: number } = { x: 0, y: 0 };

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.baseX = x;
    this.baseY = y;

    // Base circle (outer)
    this.base = scene.add.circle(x, y, this.radius, 0x888888, 0.3);
    this.base.setStrokeStyle(2, 0xffffff, 0.5);
    this.base.setDepth(1000);
    this.base.setScrollFactor(0);

    // Stick circle (inner)
    this.stick = scene.add.circle(x, y, this.stickRadius, 0xffffff, 0.8);
    this.stick.setDepth(1001);
    this.stick.setScrollFactor(0);

    // Setup input
    this.setupInput();
  }

  private setupInput() {
    // Make base interactive
    this.base.setInteractive();

    // Pointer down
    this.base.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.isDragging = true;
      this.updateStickPosition(pointer.x, pointer.y);
    });

    // Pointer move
    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging) {
        this.updateStickPosition(pointer.x, pointer.y);
      }
    });

    // Pointer up
    this.scene.input.on('pointerup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.resetStick();
      }
    });
  }

  private updateStickPosition(pointerX: number, pointerY: number) {
    // Calculate distance from base
    const dx = pointerX - this.baseX;
    const dy = pointerY - this.baseY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Constrain stick within base radius
    const maxDistance = this.radius - this.stickRadius;

    if (distance > maxDistance) {
      // Clamp to edge
      const angle = Math.atan2(dy, dx);
      this.stick.x = this.baseX + Math.cos(angle) * maxDistance;
      this.stick.y = this.baseY + Math.sin(angle) * maxDistance;

      // Normalized direction (max 1)
      this.direction.x = Math.cos(angle);
      this.direction.y = Math.sin(angle);
    } else {
      // Move freely within radius
      this.stick.x = pointerX;
      this.stick.y = pointerY;

      // Normalized direction
      if (distance > 0) {
        this.direction.x = dx / maxDistance;
        this.direction.y = dy / maxDistance;
      } else {
        this.direction.x = 0;
        this.direction.y = 0;
      }
    }
  }

  private resetStick() {
    // Return stick to center
    this.stick.x = this.baseX;
    this.stick.y = this.baseY;
    this.direction.x = 0;
    this.direction.y = 0;
  }

  public getDirection(): { x: number; y: number } {
    return this.direction;
  }

  public setVisible(visible: boolean) {
    this.base.setVisible(visible);
    this.stick.setVisible(visible);
  }

  public destroy() {
    this.base.destroy();
    this.stick.destroy();
  }
}
