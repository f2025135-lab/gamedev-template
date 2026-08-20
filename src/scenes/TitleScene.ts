import Phaser from 'phaser';
import { CONTROL_KEYS, GAME_SIZE } from '../config/gameConstants';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  create(): void {
    const centerX = GAME_SIZE.width / 2;
    const centerY = GAME_SIZE.height / 2;

    this.cameras.main.setBackgroundColor('#101827');
    this.add.text(centerX, centerY - 80, '横スクロールアクション', {
      fontFamily: 'sans-serif',
      fontSize: '48px',
      color: '#f8fafc',
    }).setOrigin(0.5);

    this.add.text(centerX, centerY + 20, 'Enterキーでスタート', {
      fontFamily: 'sans-serif',
      fontSize: '28px',
      color: '#93c5fd',
    }).setOrigin(0.5);

    const startKey = this.input.keyboard?.addKey(CONTROL_KEYS.start);
    startKey?.once('down', () => {
      this.scene.start('GameScene');
    });
  }
}