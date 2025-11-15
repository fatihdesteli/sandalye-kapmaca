import Phaser from 'phaser';
import { Chair } from './Chair';
import { GAME_CONFIG } from '../config/LevelConfig';

export class BotPlayer extends Phaser.Physics.Arcade.Sprite {
  private seated: boolean = false;
  private playerName: string;
  private difficulty: 'easy' | 'medium' | 'hard';
  private targetAngle: number = 0;
  private centerX: number;
  private centerY: number;
  private circleRadius: number = 200;
  private reactionDelay: number = 0;
  private botChar: string;
  private lastPosition: { x: number; y: number } = { x: 0, y: 0 };
  private stuckTimer: number = 0;
  private randomMoveTimer: number = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    difficulty: 'easy' | 'medium' | 'hard',
    botIndex: number
  ) {
    // Bot sprite'ı için karakteri belirle (sadece bot1 ve bot2 - memory tasarrufu)
    const botChar = `bot${((botIndex - 1) % 2) + 1}`;
    super(scene, x, y, `${botChar}-idle-0`);

    this.botChar = botChar;
    this.difficulty = difficulty;
    this.playerName = `Bot ${botIndex}`;
    this.centerX = scene.cameras.main.width / 2;
    this.centerY = scene.cameras.main.height / 2;

    // Sahneye ekle
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Animasyonları oluştur
    this.createAnimations(scene, this.botChar);

    // Sprite boyutunu ayarla (2048x2048 çok büyük, scale ile küçült)
    this.setScale(0.045); // 2048 * 0.045 = ~92 piksel (%50 daha büyük)

    // Collision body'yi ayarla
    this.setSize(1024, 1024);
    this.setOffset(512, 512);

    // Dünya sınırlarıyla çarpışmayı aktif et
    this.setCollideWorldBounds(true);

    // Idle animasyonunu başlat
    this.play(`${this.botChar}-idle`);

    // Label
    const nameText = scene.add.text(0, -35, this.playerName, {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 4, y: 2 },
    });
    nameText.setOrigin(0.5);
    this.setData('nameText', nameText);

    // Başlangıç açısı
    this.targetAngle = Math.atan2(y - this.centerY, x - this.centerX);

    // Zorluk seviyesine göre reaksiyon gecikmesi
    switch (difficulty) {
      case 'easy':
        this.reactionDelay = Phaser.Math.Between(500, 1000);
        break;
      case 'medium':
        this.reactionDelay = Phaser.Math.Between(200, 500);
        break;
      case 'hard':
        this.reactionDelay = Phaser.Math.Between(0, 150);
        break;
    }
  }

  private createAnimations(scene: Phaser.Scene, botChar: string) {
    // Idle animasyonu
    if (!scene.anims.exists(`${botChar}-idle`)) {
      scene.anims.create({
        key: `${botChar}-idle`,
        frames: Array.from({ length: 6 }, (_, i) => ({
          key: `${botChar}-idle-${i}`,
        })),
        frameRate: 10,
        repeat: -1,
      });
    }

    // Walk animasyonu
    if (!scene.anims.exists(`${botChar}-walk`)) {
      scene.anims.create({
        key: `${botChar}-walk`,
        frames: Array.from({ length: 8 }, (_, i) => ({
          key: `${botChar}-walk-${i}`,
        })),
        frameRate: 12,
        repeat: -1,
      });
    }

    // Death animasyonu
    if (!scene.anims.exists(`${botChar}-death`)) {
      scene.anims.create({
        key: `${botChar}-death`,
        frames: Array.from({ length: 10 }, (_, i) => ({
          key: `${botChar}-death-${i}`,
        })),
        frameRate: 10,
        repeat: 0, // Bir kez oynat
      });
    }
  }

  update(canMove: boolean, chairs: Chair[]) {
    // Name text pozisyonunu güncelle
    const nameText = this.getData('nameText') as Phaser.GameObjects.Text;
    if (nameText) {
      nameText.setPosition(this.x, this.y - 35);
    }

    if (this.seated) {
      this.setVelocity(0, 0);
      return;
    }

    if (canMove) {
      // Müzik çalıyorsa dairesel hareket
      this.moveInCircle(canMove);
    } else {
      // Müzik durduğunda sandalyeye koş
      this.tryToSit(chairs, canMove);
    }
  }

  private moveInCircle(canMove: boolean) {
    // Dairesel hareket
    const speed = this.getSpeed(canMove);
    this.targetAngle += 0.02;

    const targetX = this.centerX + Math.cos(this.targetAngle) * this.circleRadius;
    const targetY = this.centerY + Math.sin(this.targetAngle) * this.circleRadius;

    const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
    this.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

    // Walk animasyonunu çal
    if (this.anims.currentAnim?.key !== `${this.botChar}-walk`) {
      this.play(`${this.botChar}-walk`);
    }

    // Sprite'ı yöne göre çevir
    const velocityX = Math.cos(angle) * speed;
    if (velocityX < 0) {
      this.setFlipX(true);
    } else if (velocityX > 0) {
      this.setFlipX(false);
    }
  }

  private tryToSit(chairs: Chair[], canMove: boolean) {
    if (this.seated) return;

    // Reaksiyon gecikmesi simülasyonu
    if (this.reactionDelay > 0) {
      this.reactionDelay -= 16; // ~60fps
      this.setVelocity(0, 0);
      return;
    }

    // En yakın boş sandalyeyi bul
    let closestChair: Chair | null = null;
    let closestDistance = Infinity;

    chairs.forEach(chair => {
      if (chair.isAvailable()) {
        const distance = Phaser.Math.Distance.Between(this.x, this.y, chair.x, chair.y);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestChair = chair;
        }
      }
    });

    if (!closestChair) return;

    // Takılma kontrolü - eğer bot hareket edemiyorsa
    const distanceMoved = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      this.lastPosition.x,
      this.lastPosition.y
    );

    if (distanceMoved < 5) {
      // Bot hareket edemiyor, takılmış
      this.stuckTimer += 16;

      if (this.stuckTimer > 200) {
        // 200ms takılı kaldıysa, engelden kaçma modu
        this.randomMoveTimer = 1500; // 1.5 saniye engelden kaçma
        this.stuckTimer = 0;
      }
    } else {
      this.stuckTimer = 0;
    }

    this.lastPosition = { x: this.x, y: this.y };

    // Engelden kaçma modunda
    if (this.randomMoveTimer > 0) {
      this.randomMoveTimer -= 16;

      // Hedef sandalyeye olan açıyı hesapla
      const targetAngle = Phaser.Math.Angle.Between(this.x, this.y, closestChair.x, closestChair.y);

      // Her 100ms'de yeni bir kaçış açısı belirle
      if (this.randomMoveTimer % 100 < 16) {
        // Hedefe doğru olan açıdan +/- 90 derece sapma ile hareket et
        // Bu sayede hem engellerden kaçar hem de genel olarak hedefe doğru gider
        const angleOffset = (Math.random() - 0.5) * Math.PI; // -90 ile +90 derece arası
        const escapeAngle = targetAngle + angleOffset;

        const speed = this.getSpeed(canMove) * 1.3; // Biraz daha hızlı
        this.setVelocity(Math.cos(escapeAngle) * speed, Math.sin(escapeAngle) * speed);

        // Sprite'ı yöne göre çevir
        const velocityX = Math.cos(escapeAngle) * speed;
        if (velocityX < 0) {
          this.setFlipX(true);
        } else if (velocityX > 0) {
          this.setFlipX(false);
        }
      }

      // Walk animasyonunu çal
      if (this.anims.currentAnim?.key !== `${this.botChar}-walk`) {
        this.play(`${this.botChar}-walk`);
      }

      return;
    }

    // Normal mod: Sandalyeye doğru koş
    const angle = Phaser.Math.Angle.Between(this.x, this.y, closestChair.x, closestChair.y);
    const speed = this.getSpeed(canMove);

    this.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

    // Walk animasyonunu çal
    if (this.anims.currentAnim?.key !== `${this.botChar}-walk`) {
      this.play(`${this.botChar}-walk`);
    }

    // Sprite'ı yöne göre çevir
    const velocityX = Math.cos(angle) * speed;
    if (velocityX < 0) {
      this.setFlipX(true);
    } else if (velocityX > 0) {
      this.setFlipX(false);
    }

    // Yeterince yakınsa otur (daha geniş mesafe - rekabet için)
    if (closestDistance < 80) {
      this.sitOnChair(closestChair);
    }
  }

  private sitOnChair(chair: Chair) {
    // Eğer sandalye henüz aktif değilse, kısa bir süre bekle
    if (!chair.isAvailable()) {
      return; // Sandalye henüz hazır değil, bir sonraki frame'de tekrar dene
    }

    chair.occupy(this);
    this.seated = true;
    this.setPosition(chair.x, chair.y);
    this.setVelocity(0, 0);

    // Idle animasyonuna geç ve yeşil renk ver
    this.play(`${this.botChar}-idle`);
    this.setTint(0x00ff00); // Yeşil renk - oturdu

    // Oturma sesi çal
    this.scene.sound.play('sit', { volume: 0.6 });
  }

  private getSpeed(canMove: boolean): number {
    let baseSpeed: number;
    switch (this.difficulty) {
      case 'easy':
        baseSpeed = GAME_CONFIG.BOT_EASY_SPEED;
        break;
      case 'medium':
        baseSpeed = GAME_CONFIG.BOT_MEDIUM_SPEED;
        break;
      case 'hard':
        baseSpeed = GAME_CONFIG.BOT_HARD_SPEED;
        break;
      default:
        baseSpeed = GAME_CONFIG.BOT_EASY_SPEED;
    }

    return baseSpeed;
  }

  isSeated(): boolean {
    return this.seated;
  }

  getName(): string {
    return this.playerName;
  }

  playDeathAnimation() {
    this.setVelocity(0, 0);
    this.play(`${this.botChar}-death`);
    this.setTint(0xff0000); // Kırmızı renk - elendi
  }

  teleportToRandomCorner(width: number, height: number) {
    // Durdur
    this.setVelocity(0, 0);

    // Rastgele bir köşe seç (4 köşeden biri)
    const corners = [
      { x: 100, y: 100 },           // Sol üst
      { x: width - 100, y: 100 },   // Sağ üst
      { x: 100, y: height - 100 },  // Sol alt
      { x: width - 100, y: height - 100 } // Sağ alt
    ];

    const randomCorner = Phaser.Math.RND.pick(corners);

    // Işınlanma efekti
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 100,
      yoyo: true,
      onYoyo: () => {
        this.setPosition(randomCorner.x, randomCorner.y);
      },
      onComplete: () => {
        this.setAlpha(1);
      }
    });
  }

  destroy(fromScene?: boolean) {
    const nameText = this.getData('nameText') as Phaser.GameObjects.Text;
    if (nameText) {
      nameText.destroy();
    }
    super.destroy(fromScene);
  }
}
