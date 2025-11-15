import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Arka plan görseli
    const background = this.add.image(width / 2, height / 2, 'menu-background');
    background.setDisplaySize(width, height);

    // Butonlar için pozisyonlar - alt kısımda ortada yan yana
    const buttonY = height * 0.75; // Alt kısımda
    const centerX = width / 2;
    const buttonSpacing = 160; // Butonlar arası mesafe

    const baslaX = centerX - buttonSpacing / 2 - 75; // Sol buton
    const leaderboardX = centerX + buttonSpacing / 2 + 75; // Sağ buton

    // BAŞLA butonu
    this.createButton(baslaX, buttonY, 'BAŞLA', () => {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('GameScene');
      });
    });

    // LEADERBOARD butonu
    this.createButton(leaderboardX, buttonY, 'LEADERBOARD', () => {
      // Leaderboard fonksiyonu - şimdilik boş
      console.log('Leaderboard tıklandı');
    });
  }

  private createButton(x: number, y: number, text: string, onClick: () => void) {
    const buttonContainer = this.add.container(x, y);

    // İç glow efekti için arka plan
    const glowBg = this.add.rectangle(0, 0, 160, 55, 0xFF8C00, 0.3);
    glowBg.setStrokeStyle(0);
    buttonContainer.add(glowBg);

    // Ana buton arka planı - koyu gradient efekti ile
    const buttonBg = this.add.rectangle(0, 0, 150, 50, 0x1a0f0a, 0.85);
    buttonBg.setStrokeStyle(3, 0xFF8C00); // Turuncu parlak çerçeve
    buttonContainer.add(buttonBg);

    // Buton metni - parlak turuncu
    const buttonText = this.add.text(0, 0, text, {
      fontSize: '18px',
      color: '#FFA500',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    });
    buttonText.setOrigin(0.5);
    buttonContainer.add(buttonText);

    // İnteraktif yap
    buttonBg.setInteractive({ useHandCursor: true });

    buttonBg.on('pointerover', () => {
      this.tweens.add({
        targets: buttonContainer,
        scale: 1.08,
        duration: 150,
      });
      buttonBg.setFillStyle(0x2a1f1a, 0.9);
      buttonBg.setStrokeStyle(3, 0xFFAA33); // Daha parlak turuncu
      buttonText.setColor('#FFB833');

      // Glow efekti güçlendir
      this.tweens.add({
        targets: glowBg,
        alpha: 0.5,
        duration: 150,
      });
    });

    buttonBg.on('pointerout', () => {
      this.tweens.add({
        targets: buttonContainer,
        scale: 1,
        duration: 150,
      });
      buttonBg.setFillStyle(0x1a0f0a, 0.85);
      buttonBg.setStrokeStyle(3, 0xFF8C00);
      buttonText.setColor('#FFA500');

      // Glow efekti azalt
      this.tweens.add({
        targets: glowBg,
        alpha: 0.3,
        duration: 150,
      });
    });

    buttonBg.on('pointerdown', () => {
      this.tweens.add({
        targets: buttonContainer,
        scale: 0.95,
        duration: 80,
        yoyo: true,
        onComplete: onClick,
      });
    });

    // Hafif parıldama animasyonu
    this.tweens.add({
      targets: glowBg,
      alpha: { from: 0.3, to: 0.45 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    return buttonContainer;
  }
}
