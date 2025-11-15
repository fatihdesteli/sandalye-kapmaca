import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {

    // Loading bar oluştur
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Yükleniyor...',
      style: {
        font: '20px Arial',
        color: '#ffffff',
      },
    });
    loadingText.setOrigin(0.5, 0.5);

    const percentText = this.make.text({
      x: width / 2,
      y: height / 2,
      text: '0%',
      style: {
        font: '18px Arial',
        color: '#ffffff',
      },
    });
    percentText.setOrigin(0.5, 0.5);

    // Error text (gizli başla)
    const errorText = this.make.text({
      x: width / 2,
      y: height / 2 + 40,
      text: '',
      style: {
        font: '14px Arial',
        color: '#ff0000',
      },
    });
    errorText.setOrigin(0.5, 0.5);

    // Loading event'leri
    this.load.on('progress', (value: number) => {
      percentText.setText(Math.floor(value * 100) + '%');
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    this.load.on('loaderror', (file: any) => {
      errorText.setText(`Hata: ${file.key}`);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
      errorText.destroy();
    });

    // Ses dosyalarını yükle
    this.load.audio('level1-music', 'assets/audio/level1-music.mp3');
    this.load.audio('music-stop', 'assets/audio/music-stop.mp3');
    this.load.audio('sit', 'assets/audio/sit.mp3');
    this.load.audio('win', 'assets/audio/win.mp3');
    this.load.audio('lose', 'assets/audio/lose.mp3');

    // Obje sprite'larını yükle
    this.load.image('chair', 'assets/sprites/objects/newbestchair.png');
    this.load.image('level1-background', 'assets/sprites/objects/arkaplantam.jpg');
    this.load.image('menu-background', 'assets/sprites/objects/girisarkaplan.jpg');

    // Karakter sprite'larını yükle (memory tasarrufu için sadece player ve 2 bot)
    this.loadCharacterSprites('player');
    this.loadCharacterSprites('bot1');
    this.loadCharacterSprites('bot2');
    // Diğer botlar için bot1 ve bot2 sprite'larını tekrar kullanacağız
  }

  private loadCharacterSprites(characterName: string) {
    const basePath = `assets/sprites/characters/${characterName}`;

    // Idle animasyonu (6 frames)
    for (let i = 0; i < 6; i++) {
      this.load.image(`${characterName}-idle-${i}`, `${basePath}/idle_${i}.png`);
    }

    // Walk animasyonu (8 frames)
    for (let i = 0; i < 8; i++) {
      this.load.image(`${characterName}-walk-${i}`, `${basePath}/walk_${i}.png`);
    }

    // Death animasyonu (10 frames)
    for (let i = 0; i < 10; i++) {
      this.load.image(`${characterName}-death-${i}`, `${basePath}/death_${i}.png`);
    }
  }

  create() {
    // Yükleme tamamlandı, menüye geç
    this.scene.start('MenuScene');
  }
}
