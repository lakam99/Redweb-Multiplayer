// shooting.js
import { spawnBullet } from "./bullet.js";
import { send } from "./net.js";
import { remotePlayers } from "./entities.js";

// Spawns a bullet and handles local collision check + network broadcast
export function handleShoot(localPlayer, shooterId) {
  const dirVec = mousePos().sub(localPlayer.pos).unit();
  const pos = vec2(localPlayer.pos.x, localPlayer.pos.y);

  // Notify server so other clients spawn bullet
  send("shoot", {
    shooterId,
    position: { x: pos.x, y: pos.y },
    direction: { x: dirVec.x, y: dirVec.y },
  });

  // Local visual bullet
  const bullet = spawnBullet(pos, dirVec, "bullet", shooterId);
  checkBulletCollision(bullet, shooterId);
}

function checkBulletCollision(bullet, shooterId) {
  bullet.onUpdate(() => {
    for (const [id, player] of remotePlayers) {
      if (id === shooterId) continue;
      if (bullet.pos.dist(player.pos) < 20) {
        send("hit", { targetId: id, shooterId });
        destroy(bullet);
        break;
      }
    }
  });
}
