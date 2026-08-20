export const GAME_SIZE = {
  width: 1280,
  height: 720,
  worldWidth: 4800,
  worldHeight: 720,
} as const;

export const CONTROL_KEYS = {
  start: 'ENTER',
  left: 'LEFT',
  right: 'RIGHT',
  jump: 'UP',
  shoot: 'A',
} as const;

export const PLAYER_CONFIG = {
  maxHp: 100,
  moveSpeed: 180,
  jumpVelocity: 400,
  bulletDamage: 10,
  bulletSpeed: 500,
  shootCooldownMs: 250,
  invincibleTimeMs: 1000,
} as const;

export const ENEMY_CONFIG = {
  maxHp: 30,
  moveSpeed: 60,
  attackDamage: 10,
  attackCooldownMs: 2000,
  detectionRange: 300,
  bulletSpeed: 260,
} as const;

export const BOSS_CONFIG = {
  maxHp: 300,
  moveSpeed: 40,
  attackDamage: 20,
  attackCooldownMs: 1500,
  bulletSpeed: 320,
} as const;

export const GAME_RULES = {
  hasTimeLimit: false,
  goalRequiresBossDefeat: true,
  defeatAtHp: 0,
} as const;

export type GameResult = 'victory' | 'defeat';