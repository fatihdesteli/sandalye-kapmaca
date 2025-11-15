import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Arka plan gradient efekti
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
    graphics.fillRect(0, 0, width, height);

    // Parçacık efekti (azaltılmış)
    this.createParticles(width, height);

    // Ana başlık container - yatay ekran için üst kısma taşı
    const titleContainer = this.add.container(width / 2, 60);

    // Başlık arka plan - yatay için daha kompakt
    const titleBg = this.add.rectangle(0, 0, 500, 90, 0x0f3460, 0.8);
    titleBg.setStrokeStyle(3, 0xffd700);
    titleContainer.add(titleBg);

    // Ana başlık - daha küçük font
    const title = this.add.text(0, -8, 'SANDALYE KAPMACA', {
      fontSize: '38px',
      color: '#ffd700',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    });
    title.setOrigin(0.5);
    titleContainer.add(title);

    // Alt başlık
    const subtitle = this.add.text(0, 25, 'MUSICAL CHAIRS', {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'italic',
    });
    subtitle.setOrigin(0.5);
    titleContainer.add(subtitle);

    // Başlık animasyonu - daha az hareket
    this.tweens.add({
      targets: title,
      scale: { from: 1, to: 1.03 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Sol taraf - Oyun bilgileri ve Başla butonu
    this.createLeftSide(width, height);

    // Sağ taraf - Mekanik kartları
    this.createRightSide(width, height);

    // Alt bilgi
    const footer = this.add.text(
      width / 2,
      height - 15,
      'Klavye: WASD/Ok Tuşları | Mobil: Joystick',
      {
        fontSize: '12px',
        color: '#888888',
      }
    );
    footer.setOrigin(0.5);
  }

  private createLeftSide(width: number, height: number) {
    const leftX = width * 0.28;
    const centerY = height / 2;

    // Oyun bilgileri
    const infoTexts = [
      '👥 6 Oyuncu',
      '🎵 5 Round',
      '🏆 1 Kazanan',
    ];

    infoTexts.forEach((text, index) => {
      const infoText = this.add.text(
        leftX,
        centerY - 60 + index * 35,
        text,
        {
          fontSize: '20px',
          color: '#ffffff',
          fontStyle: 'bold',
        }
      );
      infoText.setOrigin(0.5);
    });

    // Başla butonu
    const buttonContainer = this.add.container(leftX, centerY + 60);

    const buttonBg = this.add.rectangle(0, 0, 200, 60, 0x4CAF50);
    buttonBg.setStrokeStyle(3, 0xffffff);
    buttonContainer.add(buttonBg);

    const buttonText = this.add.text(0, 0, '▶ BAŞLA', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    buttonText.setOrigin(0.5);
    buttonContainer.add(buttonText);

    // İnteraktif yap
    buttonBg.setInteractive({ useHandCursor: true });

    buttonBg.on('pointerover', () => {
      this.tweens.add({
        targets: buttonContainer,
        scale: 1.1,
        duration: 200,
      });
      buttonBg.setFillStyle(0x66BB6A);
    });

    buttonBg.on('pointerout', () => {
      this.tweens.add({
        targets: buttonContainer,
        scale: 1,
        duration: 200,
      });
      buttonBg.setFillStyle(0x4CAF50);
    });

    buttonBg.on('pointerdown', () => {
      this.tweens.add({
        targets: buttonContainer,
        scale: 0.95,
        duration: 100,
        yoyo: true,
        onComplete: () => {
          this.cameras.main.fadeOut(500, 0, 0, 0);
          this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('GameScene');
          });
        },
      });
    });
  }

  private createRightSide(width: number, height: number) {
    const rightX = width * 0.72;
    const centerY = height / 2;

    const title = this.add.text(
      rightX,
      centerY - 80,
      '5 FARKLI MEKANİK',
      {
        fontSize: '18px',
        color: '#ffd700',
        fontStyle: 'bold',
      }
    );
    title.setOrigin(0.5);

    const mechanics = [
      { name: 'Normal', icon: '🪑' },
      { name: 'Random', icon: '🎲' },
      { name: 'Moving', icon: '💨' },
      { name: 'Teleport', icon: '⚡' },
      { name: 'Fake', icon: '❌' },
    ];

    mechanics.forEach((mechanic, index) => {
      const y = centerY - 40 + index * 30;

      const text = this.add.text(
        rightX,
        y,
        `${mechanic.icon} ${mechanic.name}`,
        {
          fontSize: '16px',
          color: '#ffffff',
        }
      );
      text.setOrigin(0.5);
    });
  }

  private createParticles(width: number, height: number) {
    // Yıldız parçacıkları - azaltılmış performance için
    const particles = this.add.particles(0, 0, 'chair', {
      x: { min: 0, max: width },
      y: { min: -100, max: -50 },
      lifespan: 10000,
      speedY: { min: 15, max: 30 },
      scale: { start: 0.015, end: 0 },
      alpha: { start: 0.4, end: 0 },
      frequency: 1000, // 500'den 1000'e - daha az parçacık
      rotate: { start: 0, end: 360 },
      maxParticles: 15, // Maksimum 15 parçacık
    });
  }
}
