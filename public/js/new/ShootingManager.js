// ShootingManager.js
import Net from "./Net.js";

export function handleShoot(entityManager, shooter, sceneWalls, weaponType = 'rifle') {
  const dir = vec2(Math.cos(shooter.angle), Math.sin(shooter.angle)).unit();
  const bulletId = `b_${Date.now()}_${Math.floor(Math.random()*9999)}`;

  // local visual
  const bullet = entityManager.spawn("bullet", bulletId, {
    position: { ...shooter.position },
    direction: { x: dir.x, y: dir.y },
  });

  bullet.setSceneWalls?.(sceneWalls);

  // server notify
  Net.send("shoot", {
    bulletId,
    position: { ...shooter.position },
    direction: { x: dir.x, y: dir.y },
  });
}
