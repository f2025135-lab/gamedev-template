import Phaser from 'phaser';
import { GAME_SIZE, type GameResult } from '../config/gameConstants';

type ResultSceneData = {
  result?: GameResult;
};

export class ResultScene extends Phaser.Scene {
  private result: GameResult = 'defeat';

  constructor() {
    super('ResultScene');
  }

  init(data: ResultSceneData): void {
    this.result = data.result ?? 'defeat';
  }

  preload(): void {
    if (this.result === 'victory') {
      this.load.image('reward-character', 'reward.png');
    } else {
      this.load.image('lose-character', 'lose.png');
    }
  }

  create(): void {
    const isVictory = this.result === 'victory';
    const centerX = GAME_SIZE.width / 2;
    const centerY = GAME_SIZE.height / 2;

    this.cameras.main.setBackgroundColor(isVictory ? '#14532d' : '#450a0a');
    this.add.text(centerX, isVictory ? centerY - 340 : centerY - 340, isVictory ? '勝利！' : '敗北', {
      fontFamily: 'sans-serif',
      fontSize: '64px',
      color: '#f8fafc',
    }).setOrigin(0.5).setDepth(2);

    if (isVictory) {
      this.add.image(centerX, centerY - 30, 'reward-character')
        .setDisplaySize(360, 600);
      this.add.text(centerX, centerY + 285, 'ご褒美！', {
        fontFamily: 'sans-serif',
        fontSize: '26px',
        color: '#bbf7d0',
      }).setOrigin(0.5);
    } else {
      this.add.image(centerX, centerY - 30, 'lose-character')
        .setDisplaySize(360, 600);
    }

    this.add.text(centerX, isVictory ? centerY + 335 : centerY + 335, 'R: 再挑戦    T: タイトル画面', {
      fontFamily: 'sans-serif',
      fontSize: '24px',
      color: '#e2e8f0',
    }).setOrigin(0.5);

    const retryKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    const titleKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.T);
    retryKey?.once('down', () => {
      this.scene.start('GameScene');
    });
    titleKey?.once('down', () => {
      this.scene.start('TitleScene');
    });
  }
}