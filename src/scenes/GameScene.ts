import Phaser from 'phaser';
import {
  GAME_RULES,
  GAME_SIZE,
  PLAYER_CONFIG,
  type GameResult,
} from '../config/gameConstants';
import { Bullet } from '../objects/Bullet';
import { Boss } from '../objects/Boss';
import { Enemy } from '../objects/Enemy';
import { Player } from '../objects/Player';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private enemies: Enemy[] = [];
  private boss!: Boss;
  private bullets: Bullet[] = [];
  private enemyBullets: Bullet[] = [];
  private hpText!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;
  private bossHpText!: Phaser.GameObjects.Text;
  private goal!: Phaser.GameObjects.Rectangle;
  private platforms: Phaser.GameObjects.Rectangle[] = [];
  private goalUnlocked = false;
  private gameEnded = false;
  private elapsedTimeMs = 0;

  constructor() {
    super('GameScene');
  }

  create(): void {
    this.gameEnded = false;
    this.goalUnlocked = false;
    this.bullets = [];
    this.enemyBullets = [];
    this.elapsedTimeMs = 0;
    this.cameras.main.setBackgroundColor('#172554');
    this.physics.world.setBounds(0, 0, GAME_SIZE.worldWidth, GAME_SIZE.worldHeight);

    this.platforms = this.createPlatforms();
    this.player = new Player(this, 180, 560);
    this.enemies = [
      new Enemy(this, 820, 460),
      new Enemy(this, 1510, 380),
      new Enemy(this, 2320, 480),
      new Enemy(this, 3200, 400),
      new Enemy(this, 4000, 460),
    ];
    this.boss = new Boss(this, 4520, 492);
    this.goal = this.add.rectangle(4730, 590, 36, 100, 0x64748b);

    this.platforms.forEach((platform) => {
      this.physics.add.collider(
        this.player as unknown as Phaser.Types.Physics.Arcade.ArcadeColliderType,
        platform,
      );
      this.enemies.forEach((enemy) => {
        this.physics.add.collider(
          enemy as unknown as Phaser.Types.Physics.Arcade.ArcadeColliderType,
          platform,
        );
      });
      this.physics.add.collider(
        this.boss as unknown as Phaser.Types.Physics.Arcade.ArcadeColliderType,
        platform,
      );
    });

    this.cameras.main.setBounds(0, 0, GAME_SIZE.worldWidth, GAME_SIZE.worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    this.add.text(32, 32, 'プレイ画面', {
      fontFamily: 'sans-serif',
      fontSize: '26px',
      color: '#f8fafc',
    }).setScrollFactor(0);
    this.add.text(32, 76, '左右: 移動  上: ジャンプ  Space: ダッシュ  A: 射撃', {
      fontFamily: 'sans-serif',
      fontSize: '20px',
      color: '#cbd5e1',
    }).setScrollFactor(0);
    this.hpText = this.add.text(32, 112, `HP: ${this.player.getHp()}`, {
      fontFamily: 'sans-serif',
      fontSize: '20px',
      color: '#f8fafc',
    }).setScrollFactor(0);
    this.timeText = this.add.text(32, 148, `残り時間: ${this.formatRemainingTime()}`, {
      fontFamily: 'sans-serif',
      fontSize: '20px',
      color: '#f8fafc',
    }).setScrollFactor(0);
    this.bossHpText = this.add.text(32, 148, `ボスHP: ${this.boss.getHp()}`, {
      fontFamily: 'sans-serif',
      fontSize: '20px',
      color: '#fecaca',
    }).setScrollFactor(0).setVisible(false).setY(184);
  }

  update(time: number, delta: number): void {
    if (this.gameEnded) {
      return;
    }

    this.elapsedTimeMs += delta;
    this.player.update(time);
    if (this.player.shouldShoot(time)) {
      this.createBullet();
    }
    this.updateEnemies(time);
    this.updateBoss(time);
    this.updateBullets();
    this.updateEnemyBullets();
    this.resolveCombat(time);
    this.hpText.setText(`HP: ${this.player.getHp()}`);
    this.timeText.setText(`残り時間: ${this.formatRemainingTime()}`);
    this.bossHpText.setText(`ボスHP: ${this.boss.getHp()}`);

    if (
      this.isPlayerInPit()
      || this.player.isDefeated()
      || this.isTimeUp()
    ) {
      this.endGame('defeat');
    } else if (
      this.goalUnlocked
      && Phaser.Geom.Intersects.RectangleToRectangle(
        this.player.getBounds(),
        this.goal.getBounds(),
      )
    ) {
      this.endGame('victory');
    }
  }

  private endGame(result: GameResult): void {
    this.gameEnded = true;
    this.scene.start('ResultScene', { result });
  }

  private formatRemainingTime(): string {
    const limitMs = GAME_RULES.timeLimitSeconds * 1000;
    const remainingSeconds = Math.max(0, Math.ceil((limitMs - this.elapsedTimeMs) / 1000));
    const minutes = Math.floor(remainingSeconds / 60).toString().padStart(2, '0');
    const seconds = (remainingSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  private isTimeUp(): boolean {
    return GAME_RULES.hasTimeLimit
      && this.elapsedTimeMs >= GAME_RULES.timeLimitSeconds * 1000;
  }

  private isPlayerInPit(): boolean {
    const isOverPit = [
      [900, 1200],
      [1900, 2200],
      [3000, 3300],
      [4000, 4350],
    ].some(([start, end]) => this.player.x >= start && this.player.x <= end);

    return isOverPit && this.player.y > GAME_SIZE.height - 80;
  }

  getBullets(): readonly Bullet[] {
    return this.bullets;
  }

  private createBullet(): void {
    const direction = this.player.getFacingDirection();
    const bullet = new Bullet(
      this,
      this.player.x + direction * 30,
      this.player.y,
      direction,
      PLAYER_CONFIG.bulletSpeed,
      PLAYER_CONFIG.bulletDamage,
    );
    this.bullets.push(bullet);
  }

  private updateBullets(): void {
    this.bullets = this.bullets.filter((bullet) => {
      if (
        (!bullet.unlimitedRange
          && bullet.isOutsideWorld(GAME_SIZE.worldWidth, GAME_SIZE.worldHeight))
        || (!bullet.passesThroughPlatforms && this.isBulletTouchingPlatform(bullet))
      ) {
        bullet.destroy();
        return false;
      }
      return true;
    });
  }

  private updateEnemies(time: number): void {
    this.enemies.forEach((enemy) => {
      const bullet = enemy.update(this.player, time);
      if (bullet) {
        this.enemyBullets.push(bullet);
      }
    });
    this.enemies = this.enemies.filter((enemy) => !enemy.isDefeated());
  }

  private updateBoss(time: number): void {
    const bossBullet = this.boss.update(this.player, time);
    this.bossHpText.setVisible(this.boss.getState() === 'battle');
    if (bossBullet) {
      this.enemyBullets.push(bossBullet);
    }

    if (!this.goalUnlocked && this.boss.isDefeated()) {
      this.goalUnlocked = true;
      this.goal.setFillStyle(0x22c55e);
      this.goal.setStrokeStyle(4, 0xbbf7d0);
    }
  }

  private updateEnemyBullets(): void {
    this.enemyBullets = this.enemyBullets.filter((bullet) => {
      if (
        (!bullet.unlimitedRange
          && bullet.isOutsideWorld(GAME_SIZE.worldWidth, GAME_SIZE.worldHeight))
        || (!bullet.passesThroughPlatforms && this.isBulletTouchingPlatform(bullet))
      ) {
        bullet.destroy();
        return false;
      }
      return true;
    });
  }

  private resolveCombat(time: number): void {
    this.bullets.forEach((bullet) => {
      const enemy = this.enemies.find((candidate) =>
        Phaser.Geom.Intersects.RectangleToRectangle(bullet.getBounds(), candidate.getBounds()),
      );
      if (enemy) {
        enemy.takeDamage(bullet.damage);
        this.removePlayerBullet(bullet);
      }

      if (!this.boss.isDefeated() && Phaser.Geom.Intersects.RectangleToRectangle(
        bullet.getBounds(),
        this.boss.getBounds(),
      )) {
        this.boss.takeDamage(bullet.damage);
        this.removePlayerBullet(bullet);
      }
    });

    this.enemyBullets.forEach((bullet) => {
      if (Phaser.Geom.Intersects.RectangleToRectangle(bullet.getBounds(), this.player.getBounds())) {
        this.player.takeDamage(bullet.damage, time);
        this.removeEnemyBullet(bullet);
      }
    });
  }

  private removePlayerBullet(bullet: Bullet): void {
    const index = this.bullets.indexOf(bullet);
    if (index !== -1) {
      this.bullets.splice(index, 1);
    }
    bullet.destroy();
  }

  private removeEnemyBullet(bullet: Bullet): void {
    const index = this.enemyBullets.indexOf(bullet);
    if (index !== -1) {
      this.enemyBullets.splice(index, 1);
    }
    bullet.destroy();
  }

  private isBulletTouchingPlatform(bullet: Bullet): boolean {
    return this.platforms.some((platform) =>
      Phaser.Geom.Intersects.RectangleToRectangle(bullet.getBounds(), platform.getBounds()),
    );
  }

  private createPlatforms(): Phaser.GameObjects.Rectangle[] {
    const platformData = [
      { x: 450, y: 680, width: 900, height: 80 },
      { x: 1550, y: 680, width: 700, height: 80 },
      { x: 2600, y: 680, width: 800, height: 80 },
      { x: 4200, y: 680, width: 1200, height: 80 },
      { x: 720, y: 520, width: 320, height: 32 },
      { x: 1400, y: 440, width: 280, height: 32 },
      { x: 2200, y: 540, width: 360, height: 32 },
      { x: 3100, y: 460, width: 300, height: 32 },
      { x: 3900, y: 520, width: 420, height: 32 },
      { x: 4300, y: 580, width: 48, height: 120 },
      { x: 4520, y: 560, width: 240, height: 32, oneWay: true },
    ];

    return platformData.map(({ x, y, width, height, oneWay }) => {
      const platform = this.add.rectangle(x, y, width, height, 0x334155);
      this.physics.add.existing(platform, true);
      const body = platform.body as Phaser.Physics.Arcade.StaticBody;
      body.setSize(width, height);
      if (oneWay) {
        body.checkCollision.down = false;
      }
      return platform;
    });
  }
}