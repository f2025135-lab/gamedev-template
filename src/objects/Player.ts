import Phaser from 'phaser';
import { CONTROL_KEYS, PLAYER_CONFIG } from '../config/gameConstants';

export class Player extends Phaser.GameObjects.Rectangle {
  private readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private hp: number = PLAYER_CONFIG.maxHp;
  private invincibleUntil = 0;
  private facingDirection: -1 | 1 = 1;
  private readonly shootKey: Phaser.Input.Keyboard.Key;
  private nextShotAt = 0;
  private dashUntil = 0;
  private nextDashAt = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 40, 56, 0x38bdf8);
    scene.add.existing(this);

    if (!scene.input.keyboard) {
      throw new Error('Player requires keyboard input.');
    }
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.shootKey = scene.input.keyboard.addKey(CONTROL_KEYS.shoot);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
  }

  update(time: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;

    if (time >= this.dashUntil && !body.allowGravity) {
      body.setAllowGravity(true);
    }

    if (Phaser.Input.Keyboard.JustDown(this.cursors.space) && time >= this.nextDashAt) {
      this.dashUntil = time + PLAYER_CONFIG.dashDurationMs;
      this.nextDashAt = time + PLAYER_CONFIG.dashCooldownMs;
      body.setAllowGravity(false);
      body.setVelocityY(0);
    }

    if (time < this.dashUntil) {
      body.setVelocityX(this.facingDirection * PLAYER_CONFIG.dashSpeed);
      return;
    }

    const left = this.cursors.left?.isDown ?? false;
    const right = this.cursors.right?.isDown ?? false;

    if (left) {
      body.setVelocityX(-PLAYER_CONFIG.moveSpeed);
      this.facingDirection = -1;
      this.setScale(-1, 1);
    } else if (right) {
      body.setVelocityX(PLAYER_CONFIG.moveSpeed);
      this.facingDirection = 1;
      this.setScale(1, 1);
    } else {
      body.setVelocityX(0);
    }

    if (Phaser.Input.Keyboard.JustDown(this.cursors.up) && body.blocked.down) {
      body.setVelocityY(-PLAYER_CONFIG.jumpVelocity);
    }

    if (this.cursors.up.isUp && body.velocity.y < -PLAYER_CONFIG.smallJumpVelocity) {
      body.setVelocityY(-PLAYER_CONFIG.smallJumpVelocity);
    }
  }

  shouldShoot(time: number): boolean {
    if (!Phaser.Input.Keyboard.JustDown(this.shootKey) || time < this.nextShotAt) {
      return false;
    }

    this.nextShotAt = time + PLAYER_CONFIG.shootCooldownMs;
    return true;
  }

  getFacingDirection(): -1 | 1 {
    return this.facingDirection;
  }

  takeDamage(amount: number, time: number): boolean {
    if (time < this.invincibleUntil || this.isDefeated()) {
      return false;
    }

    this.hp = Math.max(0, this.hp - amount);
    this.invincibleUntil = time + PLAYER_CONFIG.invincibleTimeMs;
    this.setAlpha(0.45);
    this.scene.time.delayedCall(PLAYER_CONFIG.invincibleTimeMs, () => {
      if (!this.isPlayerInactive()) {
        this.setAlpha(1);
      }
    });
    return true;
  }

  getHp(): number {
    return this.hp;
  }

  isDefeated(): boolean {
    return this.hp <= 0;
  }

  private isPlayerInactive(): boolean {
    return !this.scene || !this.active;
  }
}