import Phaser from 'phaser';

export class Ball extends Phaser.Physics.Arcade.Sprite {
  private ballColor: number;
  private picked: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, color: number) {
    super(scene, x, y, 'chair'); // Geçici olarak chair sprite'ını kullanıyoruz, top görseli eklenebilir
    this.ballColor = color;

    // Sahneye ekle
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Top boyutunu ayarla
    this.setScale(0.08); // Sandalyeden daha küçük
    this.setTint(color);

    // Yuvarlak collision body
    const body = this.body as Phaser.Physics.Arcade.Body;
    const radius = (this.width * 0.8) / 2;
    body.setCircle(radius);

    // Hafif zıplama animasyonu
    scene.tweens.add({
      targets: this,
      y: y - 10,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  getColor(): number {
    return this.ballColor;
  }

  isPicked(): boolean {
    return this.picked;
  }

  pickup() {
    this.picked = true;
    this.destroy();
  }
}
