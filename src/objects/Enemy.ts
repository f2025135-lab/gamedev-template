import Phaser from 'phaser';
import { ENEMY_CONFIG } from '../config/gameConstants';
import { Bullet } from './Bullet';
import { Player } from './Player';

export type EnemyState = 'idle' | 'chase' | 'attack' | 'defeated';

export class Enemy extends Phaser.GameObjects.Rectangle {
  private hp: number = ENEMY_CONFIG.maxHp;
  private enemyState: EnemyState = 'idle';
  private nextAttackAt = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 42, 52, 0xf97316);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setVelocityX(0);
  }

  update(player: Player, time: number): Bullet | null {
    if (this.isDefeated()) {
      this.enemyState = 'defeated';
      return null;
    }

    const horizontalDistance = Math.abs(player.x - this.x);
    const verticalDistance = Math.abs(player.y - this.y);
    const canDetect = horizontalDistance <= ENEMY_CONFIG.detectionRange && verticalDistance <= 120;
    const attackRange = 160;

    if (!canDetect) {
      this.enemyState = 'idle';
      (this.body as Phaser.Physics.Arcade.Body).setVelocityX(0);
      return null;
    }

    const direction: -1 | 1 = player.x < this.x ? -1 : 1;
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (horizontalDistance > attackRange) {
      this.enemyState = 'chase';
      body.setVelocityX(direction * ENEMY_CONFIG.moveSpeed);
    } else {
      this.enemyState = 'attack';
      body.setVelocityX(0);
    }

    if (time < this.nextAttackAt) {
      return null;
    }

    this.nextAttackAt = time + ENEMY_CONFIG.attackCooldownMs;
    return new Bullet(
      this.scene,
      this.x + direction * 28,
      this.y,
      direction,
      ENEMY_CONFIG.bulletSpeed,
      ENEMY_CONFIG.attackDamage,
      0xef4444,
    );
  }

  takeDamage(amount: number): void {
    if (this.isDefeated()) {
      return;
    }

    this.hp = Math.max(0, this.hp - amount);
    if (this.hp === 0) {
      this.enemyState = 'defeated';
      this.destroy();
      return;
    }

    this.setFillStyle(0xfde047);
    this.scene.time.delayedCall(120, () => {
      if (this.active) {
        this.setFillStyle(0xf97316);
      }
    });
  }

  getHp(): number {
    return this.hp;
  }

  getState(): EnemyState {
    return this.enemyState;
  }

  isDefeated(): boolean {
    return this.hp <= 0 || !this.active;
  }
}