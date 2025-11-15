import Phaser from 'phaser';
import { Chair } from './Chair';
import { GAME_CONFIG } from '../config/LevelConfig';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private seated: boolean = false;
  private playerName: string = 'Sen';
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd?: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player-idle-0');

    // Sahneye ekle
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Animasyonları oluştur
    this.createAnimations(scene);

    // Sprite boyutunu ayarla (2048x2048 çok büyük, scale ile küçült) - %10 büyütüldü
    this.setScale(0.0495); // 0.045 * 1.1 = 0.0495

    // Collision body'yi ayarla (sprite'ın gerçek boyutuna göre)
    this.setSize(1024, 1024); // Sprite'ın yarısı kadar collision
    this.setOffset(512, 512); // Merkeze hizala

    // Dünya sınırlarıyla çarpışmayı aktif et
    this.setCollideWorldBounds(true);

    // Idle animasyonunu başlat
    this.play('player-idle');

    // Label
    const nameText = scene.add.text(0, -35, this.playerName, {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 4, y: 2 },
    });
    nameText.setOrigin(0.5);
    this.setData('nameText', nameText);

    // Kontroller
    if (scene.input.keyboard) {
      this.cursors = scene.input.keyboard.createCursorKeys();
      this.wasd = scene.input.keyboard.addKeys({
        W: Phaser.Input.Keyboard.KeyCodes.W,
        A: Phaser.Input.Keyboard.KeyCodes.A,
        S: Phaser.Input.Keyboard.KeyCodes.S,
        D: Phaser.Input.Keyboard.KeyCodes.D,
      }) as any;
    }
  }

  private createAnimations(scene: Phaser.Scene) {
    // Idle animasyonu
    if (!scene.anims.exists('player-idle')) {
      scene.anims.create({
        key: 'player-idle',
        frames: Array.from({ length: 6 }, (_, i) => ({
          key: `player-idle-${i}`,
        })),
        frameRate: 10,
        repeat: -1,
      });
    }

    // Walk animasyonu
    if (!scene.anims.exists('player-walk')) {
      scene.anims.create({
        key: 'player-walk',
        frames: Array.from({ length: 8 }, (_, i) => ({
          key: `player-walk-${i}`,
        })),
        frameRate: 12,
        repeat: -1,
      });
    }

    // Death animasyonu
    if (!scene.anims.exists('player-death')) {
      scene.anims.create({
        key: 'player-death',
        frames: Array.from({ length: 10 }, (_, i) => ({
          key: `player-death-${i}`,
        })),
        frameRate: 10,
        repeat: 0, // Bir kez oynat
      });
    }
  }

  update(canMove: boolean, chairs: Chair[], joystickInput?: { x: number; y: number }) {
    // Name text pozisyonunu güncelle
    const nameText = this.getData('nameText') as Phaser.GameObjects.Text;
    if (nameText) {
      nameText.setPosition(this.x, this.y - 35);
    }

    // Oturmuşsa hareket etme
    if (this.seated) {
      this.setVelocity(0, 0);
      return;
    }

    // Hareket kontrolü - her zaman çalışmalı
    let velocityX = 0;
    let velocityY = 0;

    // Joystick input öncelikli (mobil için)
    if (joystickInput && (Math.abs(joystickInput.x) > 0.1 || Math.abs(joystickInput.y) > 0.1)) {
      velocityX = joystickInput.x * GAME_CONFIG.PLAYER_SPEED;
      velocityY = joystickInput.y * GAME_CONFIG.PLAYER_SPEED;
    }
    // Klavye kontrolü (fallback)
    else if (this.cursors) {
      if (this.cursors.left.isDown || this.wasd?.A.isDown) {
        velocityX = -GAME_CONFIG.PLAYER_SPEED;
      } else if (this.cursors.right.isDown || this.wasd?.D.isDown) {
        velocityX = GAME_CONFIG.PLAYER_SPEED;
      }

      if (this.cursors.up.isDown || this.wasd?.W.isDown) {
        velocityY = -GAME_CONFIG.PLAYER_SPEED;
      } else if (this.cursors.down.isDown || this.wasd?.S.isDown) {
        velocityY = GAME_CONFIG.PLAYER_SPEED;
      }
    }

    this.setVelocity(velocityX, velocityY);

    // Animasyon kontrolü
    if (velocityX !== 0 || velocityY !== 0) {
      // Hareket ediyor - walk animasyonu
      if (this.anims.currentAnim?.key !== 'player-walk') {
        this.play('player-walk');
      }

      // Sprite'ı yöne göre çevir
      if (velocityX < 0) {
        this.setFlipX(true);
      } else if (velocityX > 0) {
        this.setFlipX(false);
      }
    } else {
      // Duruyor - idle animasyonu
      if (this.anims.currentAnim?.key !== 'player-idle') {
        this.play('player-idle');
      }
    }

    // Müzik durduğunda otomatik olarak sandalyeye oturmayı dene
    if (!canMove) {
      this.tryToSit(chairs);
    }
  }

  private tryToSit(chairs: Chair[]) {
    if (this.seated) return;

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

    // Eğer yeterince yakınsa otur (daha geniş mesafe - rekabet için)
    if (closestChair && closestDistance < 100) {
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
    this.play('player-idle');
    this.setTint(0x00ff00); // Yeşil renk - oturdu

    // Oturma sesi çal
    this.scene.sound.play('sit', { volume: 0.6 });
  }

  isSeated(): boolean {
    return this.seated;
  }

  getName(): string {
    return this.playerName;
  }

  playDeathAnimation() {
    this.setVelocity(0, 0);
    this.play('player-death');
    this.setTint(0xff0000); // Kırmızı renk - elendi
  }

  teleportToRandomCorner(width: number, height: number) {
    // Durdur
    this.setVelocity(0, 0);

    // Physics world bounds'dan daraltılmış alanı al
    const bounds = (this.scene as Phaser.Scene).physics.world.bounds;
    const leftEdge = bounds.x + 100;
    const rightEdge = bounds.x + bounds.width - 100;
    const topEdge = 100;
    const bottomEdge = height - 100;

    // Rastgele bir köşe seç (4 köşeden biri) - daraltılmış alana göre
    const corners = [
      { x: leftEdge, y: topEdge },           // Sol üst
      { x: rightEdge, y: topEdge },          // Sağ üst
      { x: leftEdge, y: bottomEdge },        // Sol alt
      { x: rightEdge, y: bottomEdge }        // Sağ alt
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
