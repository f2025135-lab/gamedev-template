import Phaser from 'phaser';
import { BOSS_CONFIG } from '../config/gameConstants';
import { Bullet } from './Bullet';
import { Player } from './Player';

export type BossState = 'waiting' | 'battle' | 'defeated';

export class Boss extends Phaser.GameObjects.Rectangle {
  private hp: number = BOSS_CONFIG.maxHp;
  private state: BossState = 'waiting';
  private nextAttackAt = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 88, 104, 0xdc2626);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setAllowGravity(false);
    body.setImmovable(true);
  }

  update(player: Player, time: number): Bullet | null {
    if (this.isDefeated()) {
      this.state = 'defeated';
      return null;
    }

    const distance = Math.abs(player.x - this.x);
    if (distance > 650) {
      this.state = 'waiting';
      return null;
    }

    this.state = 'battle';
    if (time < this.nextAttackAt) {
      return null;
    }

    this.nextAttackAt = time + BOSS_CONFIG.attackCooldownMs;
    const direction: -1 | 1 = player.x < this.x ? -1 : 1;
    return new Bullet(
      this.scene,
      this.x + direction * 55,
      this.y,
      direction,
      BOSS_CONFIG.bulletSpeed,
      BOSS_CONFIG.attackDamage,
      0xa855f7,
      54,
      24,
      true,
      true,
    );
  }

  takeDamage(amount: number): void {
    if (this.isDefeated()) {
      return;
    }

    this.hp = Math.max(0, this.hp - amount);
    if (this.hp === 0) {
      this.state = 'defeated';
      this.destroy();
      return;
    }

    this.setFillStyle(0xfca5a5);
    this.scene.time.delayedCall(120, () => {
      if (this.active) {
        this.setFillStyle(0xdc2626);
      }
    });
  }

  getHp(): number {
    return this.hp;
  }

  getState(): BossState {
    return this.state;
  }

  isDefeated(): boolean {
    return this.hp <= 0 || !this.active;
  }
}