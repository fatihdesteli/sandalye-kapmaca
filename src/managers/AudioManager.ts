import Phaser from 'phaser';

export class AudioManager {
  private scene: Phaser.Scene;
  private backgroundMusic?: Phaser.Sound.BaseSound;
  private isMusicEnabled: boolean = true;
  private isSfxEnabled: boolean = true;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  playBackgroundMusic(key: string, loop: boolean = true) {
    if (!this.isMusicEnabled) return;

    // Önceki müzik varsa durdur
    if (this.backgroundMusic) {
      this.backgroundMusic.stop();
    }

    this.backgroundMusic = this.scene.sound.add(key, {
      loop: loop,
      volume: 0.5,
    });

    this.backgroundMusic.play();
  }

  stopBackgroundMusic() {
    if (this.backgroundMusic && this.backgroundMusic.isPlaying) {
      this.backgroundMusic.stop();
    }
  }

  pauseBackgroundMusic() {
    if (this.backgroundMusic && this.backgroundMusic.isPlaying) {
      (this.backgroundMusic as Phaser.Sound.WebAudioSound | Phaser.Sound.HTML5AudioSound).pause();
    }
  }

  resumeBackgroundMusic() {
    if (this.backgroundMusic) {
      (this.backgroundMusic as Phaser.Sound.WebAudioSound | Phaser.Sound.HTML5AudioSound).resume();
    }
  }

  playSoundEffect(key: string, volume: number = 1) {
    if (!this.isSfxEnabled) return;

    this.scene.sound.play(key, {
      volume: volume,
    });
  }

  setMusicEnabled(enabled: boolean) {
    this.isMusicEnabled = enabled;
    if (!enabled && this.backgroundMusic) {
      this.backgroundMusic.stop();
    }
  }

  setSfxEnabled(enabled: boolean) {
    this.isSfxEnabled = enabled;
  }

  destroy() {
    if (this.backgroundMusic) {
      this.backgroundMusic.destroy();
    }
  }
}
