// shooting.js
import { spawnBullet, handleBulletCollision } from "./bullet.js";
import { send } from "./net.js";

export function setupShooting(localPlayer, playerId, getAngle, getHPBar) {
  onClick(() => {
    const dirVec = mousePos().sub(localPlayer.pos).unit();
    const bullet = spawnBullet(localPlayer.pos, dirVec, "bullet", playerId);

    send("shoot", {
      shooterId: playerId,
      position:  { x: localPlayer.pos.x, y: localPlayer.pos.y },
      direction: { x: dirVec.x, y: dirVec.y },
    });

    handleBulletCollision(bullet, playerId, () => {
      console.log("Hit: self-render only for now");
    });
  });
}
