import Phaser from 'phaser';
import { GAME_SIZE } from '../config/gameConstants';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#1e293b');
    this.add.rectangle(
      GAME_SIZE.width / 2,
      GAME_SIZE.height - 40,
      GAME_SIZE.width,
      80,
      0x334155,
    );
    this.add.text(32, 32, 'プレイ画面（タスク3でステージを実装）', {
      fontFamily: 'sans-serif',
      fontSize: '26px',
      color: '#f8fafc',
    });
    this.add.text(32, 76, '左右: 移動  上: ジャンプ  A: 射撃', {
      fontFamily: 'sans-serif',
      fontSize: '20px',
      color: '#cbd5e1',
    });
  }
}