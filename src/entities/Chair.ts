import Phaser from 'phaser';

export class Chair extends Phaser.Physics.Arcade.Sprite {
  private occupied: boolean = false;
  private chairActive: boolean = false;
  private occupant: Phaser.Physics.Arcade.Sprite | null = null;
  private movementTween?: Phaser.Tweens.Tween;
  private isFake: boolean = false;
  private revealed: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, isFake: boolean = false) {
    super(scene, x, y, 'chair');
    this.isFake = isFake;

    // Sahneye ekle
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Sprite boyutunu ayarla (sandalye görseline göre)
    this.setScale(0.12); // Görselin boyutuna göre ayarla
    this.setAlpha(0.5); // Başlangıçta pasif

    // Physics ayarları
    if (this.isFake) {
      // Fake sandalyeler overlap için body'ye ihtiyaç var ama collision yapmaz
      const body = this.body as Phaser.Physics.Arcade.Body;
      const bodyWidth = this.width * 0.5;
      const bodyHeight = this.height * 0.5;
      body.setSize(bodyWidth, bodyHeight);
      body.setOffset(
        (this.width - bodyWidth) / 2,
        (this.height - bodyHeight) / 2
      );
    } else {
      // Gerçek sandalyeler - hareket etmemeli (küçük collision body)
      this.setImmovable(true);
      const body = this.body as Phaser.Physics.Arcade.Body;
      const bodyWidth = this.width * 0.5;
      const bodyHeight = this.height * 0.5;
      body.setSize(bodyWidth, bodyHeight);
      body.setOffset(
        (this.width - bodyWidth) / 2,
        (this.height - bodyHeight) / 2
      );
    }
  }

  setChairActive(isActive: boolean) {
    this.chairActive = isActive;
    this.setAlpha(isActive ? 1 : 0.5);

    if (isActive) {
      // Aktif olduğunda hafif bir animasyon (mevcut scale'den başla)
      const currentScale = this.scale;
      this.scene.tweens.add({
        targets: this,
        scale: { from: currentScale, to: currentScale * 1.1 },
        duration: 200,
        yoyo: true,
        repeat: 2,
      });
    }
  }

  occupy(player: Phaser.Physics.Arcade.Sprite) {
    // Fake sandalyeye oturulamaz
    if (this.isFake) {
      this.revealFake();
      return;
    }

    if (this.occupied || !this.chairActive) return;

    this.occupied = true;
    this.occupant = player;

    // Sandalye dolu - yeşil yap
    this.setTint(0x00ff00);
  }

  isAvailable(): boolean {
    // Fake sandalyeler asla available değil
    if (this.isFake) return false;
    return !this.occupied && this.chairActive;
  }

  revealFake() {
    if (!this.revealed) {
      this.revealed = true;
      // Fake sandalye kırmızıya döner
      this.setTint(0xff0000);
    }
  }

  getIsFake(): boolean {
    return this.isFake;
  }

  isOccupied(): boolean {
    return this.occupied;
  }

  getOccupant(): Phaser.Physics.Arcade.Sprite | null {
    return this.occupant;
  }

  startMoving(width: number, height: number) {
    // Sandalyeyi sürekli hareket ettir
    this.moveToRandomPosition(width, height);
  }

  private moveToRandomPosition(width: number, height: number) {
    const padding = 100;
    const randomX = Phaser.Math.Between(padding, width - padding);
    const randomY = Phaser.Math.Between(padding + 100, height - padding - 100);

    // Rastgele bir süre belirle
    const duration = Phaser.Math.Between(2000, 4000);

    // Hareket animasyonu
    this.movementTween = this.scene.tweens.add({
      targets: this,
      x: randomX,
      y: randomY,
      duration: duration,
      ease: 'Linear',
      onComplete: () => {
        // Hareket tamamlandığında yeni bir pozisyona git
        this.moveToRandomPosition(width, height);
      }
    });
  }

  stopMoving() {
    // Hareket animasyonunu durdur
    if (this.movementTween) {
      this.movementTween.stop();
    }
  }

  teleportToRandomPosition(width: number, height: number) {
    // Hareketi durdur
    this.stopMoving();

    // Rastgele bir pozisyona ışınlan
    const padding = 100;
    const randomX = Phaser.Math.Between(padding, width - padding);
    const randomY = Phaser.Math.Between(padding + 100, height - padding - 100);

    // Işınlanma efekti
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 100,
      yoyo: true,
      onYoyo: () => {
        this.setPosition(randomX, randomY);
      },
      onComplete: () => {
        // Sandalye aktifse alpha 1, değilse 0.5
        this.setAlpha(this.chairActive ? 1 : 0.5);
      }
    });
  }
}
