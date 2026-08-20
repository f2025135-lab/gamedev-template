import Phaser from 'phaser';
import { GAME_SIZE } from './config/gameConstants';
import { GameScene } from './scenes/GameScene';
import { ResultScene } from './scenes/ResultScene';
import { TitleScene } from './scenes/TitleScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#101827',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_SIZE.width,
    height: GAME_SIZE.height,
  },
  scene: [TitleScene, GameScene, ResultScene],
};

const game = new Phaser.Game(config);

// HMR: src 配下を編集したら、古い Game インスタンスを破棄して作り直す
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    game.destroy(true);
  });
  import.meta.hot.accept();
}
