import Phaser from 'phaser';

export class Bullet extends Phaser.GameObjects.Rectangle {
  readonly damage: number;
  readonly passesThroughPlatforms: boolean;
  readonly unlimitedRange: boolean;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    direction: -1 | 1,
    speed: number,
    damage: number,
    color = 0xfacc15,
    width = 18,
    height = 6,
    passesThroughPlatforms = false,
    unlimitedRange = false,
  ) {
    super(scene, x, y, width, height, color);
    this.damage = damage;
    this.passesThroughPlatforms = passesThroughPlatforms;
    this.unlimitedRange = unlimitedRange;
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setVelocityX(direction * speed);
  }

  isOutsideWorld(worldWidth: number, worldHeight: number): boolean {
    return this.x < -50 || this.x > worldWidth + 50 || this.y < -50 || this.y > worldHeight + 50;
  }
}