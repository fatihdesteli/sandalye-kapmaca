import Phaser from 'phaser';
import { GameConfig } from './config/GameConfig';
import { PreloadScene } from './scenes/PreloadScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';

// Sahneleri config'e ekle
GameConfig.scene = [PreloadScene, MenuScene, GameScene];

// Oyunu başlat
window.addEventListener('load', () => {
  const game = new Phaser.Game(GameConfig);

  // Global erişim için (debug amaçlı)
  (window as any).game = game;
});
