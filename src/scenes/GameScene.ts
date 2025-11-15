import Phaser from 'phaser';
import { MECHANICS, MechanicData } from '../config/LevelConfig';
import { Player } from '../entities/Player';
import { BotPlayer } from '../entities/BotPlayer';
import { Chair } from '../entities/Chair';
import { AudioManager } from '../managers/AudioManager';
import { VirtualJoystick } from '../ui/VirtualJoystick';

export class GameScene extends Phaser.Scene {
  private currentMechanic!: MechanicData;
  private player!: Player;
  private bots: BotPlayer[] = [];
  private chairs: Chair[] = [];
  private isRoundActive: boolean = false;
  private isMusicPlaying: boolean = false;
  private roundTimer?: Phaser.Time.TimerEvent;
  private countdownText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private roundNumberText!: Phaser.GameObjects.Text;
  private audioManager!: AudioManager;
  private virtualJoystick?: VirtualJoystick;

  // Round bilgileri
  private currentRound: number = 1;
  private totalPlayers: number = 6; // 1 player + 5 bot

  constructor() {
    super('GameScene');
  }

  init() {
    // Oyun her başladığında sıfırla
    this.currentRound = 1;
    this.totalPlayers = 6;
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Arka plan görseli
    try {
      const background = this.add.image(width / 2, height / 2, 'level1-background');
      const scaleX = width / background.width;
      const scaleY = height / background.height;
      const scale = Math.max(scaleX, scaleY);
      background.setScale(scale);
      background.setDepth(-2);
    } catch (error) {
      // Arka plan yüklenemezse renkli arka plan kullan
      this.cameras.main.setBackgroundColor('#1a1a2e');
    }

    // Physics world sınırlarını ayarla
    this.physics.world.setBounds(0, 0, width, height);

    // Görsel sınır çizgisi ekle (opsiyonel - oyun alanını göster)
    const borderGraphics = this.add.graphics();
    borderGraphics.lineStyle(4, 0xffffff, 0.5);
    borderGraphics.strokeRect(10, 10, width - 20, height - 20);
    borderGraphics.setDepth(1000); // En üstte görünsün

    // Audio Manager'ı başlat
    this.audioManager = new AudioManager(this);

    // UI - Round bilgisi
    this.roundNumberText = this.add.text(20, 20, '', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
    });

    // Countdown text
    this.countdownText = this.add.text(width / 2, 60, '', {
      fontSize: '32px',
      color: '#ffff00',
      fontStyle: 'bold',
    });
    this.countdownText.setOrigin(0.5);

    // Status text
    this.statusText = this.add.text(width / 2, height - 50, '', {
      fontSize: '24px',
      color: '#ffffff',
    });
    this.statusText.setOrigin(0.5);

    // Virtual Joystick (mobil için)
    if (this.sys.game.device.input.touch) {
      this.virtualJoystick = new VirtualJoystick(this, 100, height - 100);
    }

    // İlk round'u başlat
    this.startRound();
  }

  private startRound() {
    // Mevcut entity'leri temizle
    this.clearEntities();

    // Mekanik seç
    if (this.currentRound === 1) {
      // İlk round her zaman Level 1 mekaniği (index 0)
      this.currentMechanic = MECHANICS[0];
    } else {
      // Sonraki roundlar Level 2,3,4,5'ten rastgele (index 1,2,3,4)
      const availableMechanics = MECHANICS.slice(1); // 0. index hariç
      this.currentMechanic = Phaser.Math.RND.pick(availableMechanics);
    }

    // Round ve mekanik bilgisini göster
    this.roundNumberText.setText(`Round ${this.currentRound} - ${this.currentMechanic.mechanicName}`);

    // Arka plan rengini değiştir
    this.cameras.main.setBackgroundColor(this.currentMechanic.backgroundColor);

    // Sandalyeleri oluştur
    this.createChairs();

    // Oyuncuları oluştur
    this.createPlayers();

    // Round'u başlat
    this.isRoundActive = true;
    this.isMusicPlaying = true;
    this.statusText.setText('MÜZİK ÇALIYOR - YÜRÜ!');

    // Müziği başlat
    this.audioManager.playBackgroundMusic('level1-music', true);

    // Özel mekanikler
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    if (this.currentMechanic.specialMechanic === 'movingChairs' ||
        this.currentMechanic.specialMechanic === 'movingChairsWithFakes') {
      this.chairs.forEach(chair => chair.startMoving(width, height));
    }

    // Müzik timer'ı başlat
    const duration = this.currentMechanic.musicDuration * 1000;
    this.roundTimer = this.time.delayedCall(duration, () => {
      this.stopMusic();
    });
  }

  private createChairs() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 200;
    const chairCount = this.totalPlayers - 1; // Her roundda 1 eksik sandalye

    // Fake sandalyeler varsa ekle
    const totalChairs = this.currentMechanic.specialMechanic === 'movingChairsWithFakes'
      ? chairCount + 3
      : chairCount;

    for (let i = 0; i < totalChairs; i++) {
      const angle = (i / totalChairs) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      // Son 3 sandalye fake (eğer movingChairsWithFakes mekanikse)
      const isFake = this.currentMechanic.specialMechanic === 'movingChairsWithFakes' && i >= chairCount;
      const chair = new Chair(this, x, y, isFake);
      this.chairs.push(chair);
    }
  }

  private createPlayers() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const playerCount = this.totalPlayers;
    const radius = 280;

    for (let i = 0; i < playerCount; i++) {
      const angle = (i / playerCount) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      if (i === 0) {
        // İlk oyuncu biziz
        this.player = new Player(this, x, y);
      } else {
        // Diğerleri botlar (1-5 arası bot karakteri)
        const botDifficulty = 'hard'; // Tüm botlar hard
        const bot = new BotPlayer(this, x, y, botDifficulty, i);
        this.bots.push(bot);
      }
    }

    // Collision ayarları
    this.chairs.forEach(chair => {
      if (chair.getIsFake()) {
        // Fake sandalyeler için overlap (içinden geçilir)
        this.physics.add.overlap(this.player, chair, () => {
          chair.revealFake();
        });
        this.bots.forEach(bot => {
          this.physics.add.overlap(bot, chair, () => {
            chair.revealFake();
          });
        });
      } else {
        // Gerçek sandalyeler için collision (içinden geçilemez)
        this.physics.add.collider(this.player, chair);
        this.bots.forEach(bot => {
          this.physics.add.collider(bot, chair);
        });
      }
    });
  }

  private stopMusic() {
    this.isMusicPlaying = false;
    this.statusText.setText('MÜZİK DURDU - SANDALYE KAP!');

    // Müziği durdur ve durma sesini çal
    this.audioManager.stopBackgroundMusic();
    this.audioManager.playSoundEffect('music-stop', 0.7);

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Özel mekaniklere göre işlemler
    if (this.currentMechanic.specialMechanic === 'movingChairsWithFakes') {
      // Sandalyelerin hareketini durdur
      this.chairs.forEach(chair => chair.stopMoving());
      // Hemen aktif et
      this.chairs.forEach(chair => chair.setChairActive(true));
    }
    else if (this.currentMechanic.specialMechanic === 'teleportPlayers') {
      // Tüm oyuncuları ışınla
      this.player.teleportToRandomCorner(width, height);
      this.bots.forEach(bot => bot.teleportToRandomCorner(width, height));
      // Işınlanma sonrası sandalyeleri aktif et
      this.time.delayedCall(300, () => {
        this.chairs.forEach(chair => chair.setChairActive(true));
      });
    }
    else if (this.currentMechanic.specialMechanic === 'movingChairs') {
      // Sandalyeleri ışınla
      this.chairs.forEach(chair => {
        chair.teleportToRandomPosition(width, height);
      });
      // Işınlanma sonrası aktif et
      this.time.delayedCall(300, () => {
        this.chairs.forEach(chair => chair.setChairActive(true));
      });
    }
    else if (this.currentMechanic.specialMechanic === 'randomChairPositions') {
      // Sandalyeleri random pozisyonlara taşı
      this.randomizeChairPositions();
      // Animasyon sonrası aktif et
      this.time.delayedCall(500, () => {
        this.chairs.forEach(chair => chair.setChairActive(true));
      });
    }
    else {
      // Normal mekanik - hemen aktif et
      this.chairs.forEach(chair => chair.setChairActive(true));
    }

    // Round'u bitir (6 saniye sonra - botlara yeterli zaman ver)
    this.time.delayedCall(6000, () => {
      this.checkRoundResult();
    });
  }

  private randomizeChairPositions() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const padding = 100;

    this.chairs.forEach(chair => {
      // Random pozisyon (ekranın ortasına yakın, ama kenarlardan uzak)
      const randomX = Phaser.Math.Between(padding, width - padding);
      const randomY = Phaser.Math.Between(padding + 100, height - padding - 100);

      // Animasyonlu hareket
      this.tweens.add({
        targets: chair,
        x: randomX,
        y: randomY,
        duration: 500,
        ease: 'Power2',
      });
    });
  }

  private checkRoundResult() {
    // Oturulmamış oyuncuları bul
    const allPlayers = [this.player, ...this.bots].filter(p => p && p.active);
    const unseatedPlayers = allPlayers.filter(p => !p.isSeated());

    // Elenmesi gereken oyuncu sayısı (her roundda 1 kişi)
    const expectedUnseated = 1;

    if (unseatedPlayers.length >= expectedUnseated && unseatedPlayers.length > 0) {
      // Eğer birden fazla kişi oturmadıysa, en uzakta olanı elen
      let eliminated = unseatedPlayers[0];

      if (unseatedPlayers.length > 1) {
        // Sandalyelere en uzak mesafedeki oyuncuyu bul
        let maxMinDistance = -1;

        unseatedPlayers.forEach(player => {
          // Bu oyuncunun tüm sandalyelere olan en kısa mesafesi
          let minDistance = Infinity;
          this.chairs.forEach(chair => {
            const distance = Phaser.Math.Distance.Between(
              player.x,
              player.y,
              chair.x,
              chair.y
            );
            if (distance < minDistance) {
              minDistance = distance;
            }
          });

          // En uzakta olan oyuncuyu bul
          if (minDistance > maxMinDistance) {
            maxMinDistance = minDistance;
            eliminated = player;
          }
        });
      }

      if (eliminated === this.player) {
        // Oyuncu elendi - death animasyonunu oynat
        this.player.playDeathAnimation();

        // Animasyon bittikten sonra oyun bitti ekranına git
        this.time.delayedCall(1000, () => {
          this.gameOver(false);
        });
      } else {
        // Bot elendi - death animasyonunu oynat
        const eliminatedBot = eliminated as BotPlayer;
        eliminatedBot.playDeathAnimation();

        this.statusText.setText(`${eliminated.getName()} elendi!`);

        // Elenen botu listeden çıkar
        const botIndex = this.bots.indexOf(eliminatedBot);
        if (botIndex > -1) {
          this.bots.splice(botIndex, 1);
        }

        this.time.delayedCall(2000, () => {
          // Oyuncu sayısını azalt ve round'u artır
          this.totalPlayers--;
          this.currentRound++;

          if (this.totalPlayers === 1) {
            // Sadece player kaldı - kazandı!
            this.gameOver(true);
          } else {
            // Bir sonraki round
            this.startRound();
          }
        });
      }
    }
  }

  private gameOver(won: boolean) {
    this.isRoundActive = false;

    // Tüm oyuncuları durdur
    if (this.player) {
      this.player.setVelocity(0, 0);
    }
    this.bots.forEach(bot => bot.setVelocity(0, 0));

    if (won) {
      this.statusText.setText('KAZANDIN! 🎉');
      this.audioManager.playSoundEffect('win', 0.8);

      this.time.delayedCall(2000, () => {
        // Ana menüye dön
        this.scene.start('MenuScene');
      });
    } else {
      this.statusText.setText('ELENDIN! 😢');
      this.audioManager.playSoundEffect('lose', 0.8);

      this.time.delayedCall(2000, () => {
        // Ana menüye dön
        this.scene.start('MenuScene');
      });
    }
  }

  private clearEntities() {
    if (this.player) {
      this.player.destroy();
    }

    this.bots.forEach(bot => bot.destroy());
    this.bots = [];

    this.chairs.forEach(chair => chair.destroy());
    this.chairs = [];
  }

  update() {
    if (!this.isRoundActive) return;

    // Müzik çalıyorsa countdown göster
    if (this.isMusicPlaying && this.roundTimer) {
      const remaining = Math.ceil(this.roundTimer.getRemaining() / 1000);
      this.countdownText.setText(`${remaining}`);
    } else {
      this.countdownText.setText('');
    }

    // Player update
    if (this.player && this.player.active) {
      const joystickInput = this.virtualJoystick?.getDirection();
      this.player.update(this.isMusicPlaying, this.chairs, joystickInput);
    }

    // Bot update
    this.bots.forEach(bot => {
      if (bot.active) {
        bot.update(this.isMusicPlaying, this.chairs);
      }
    });
  }
}
