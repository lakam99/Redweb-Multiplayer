// bullet.js
import { BULLET_SPEED, SIZE } from "./config.js";

const activeBullets = new Set();

export function spawnBullet(position, dir, tag = "bullet", shooterId = null) {
  const bullet = add([
    pos(vec2(position.x, position.y)),
    move(vec2(dir.x, dir.y), BULLET_SPEED),
    circle(6),
    color(255, 255, 255),
    area(),
    anchor("center"),
    tag,
    {
      shooterId,
      lifespan: 2,
    },
  ]);

  activeBullets.add(bullet);

  bullet.onUpdate(() => {
    bullet.lifespan -= dt();
    if (bullet.lifespan <= 0) destroy(bullet);
  });

  bullet.onDestroy(() => {
    activeBullets.delete(bullet);
  });

  return bullet;
}

export function handleBulletCollision(bullet, playerId, onHit = () => {}) {
  if (bullet.shooterId === playerId) return;
  if (typeof onHit === "function") onHit();
  destroy(bullet);
}
