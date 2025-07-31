// handlers.js
import { ensureRemote, updateRemote, spawnBullet } from "./entities.js";
import { handleBulletCollision } from "./bullet.js";
import { send, on } from "./net.js";
import { MAX_HP, SIZE } from "./config.js";
import { localPlayer, localPlayerBar, playerId, updatePlayerHP, remoteBars } from "./state.js";

export function setupNetworkHandlers() {
  on("players_list", msg => msg.players.forEach(p => ensureRemote(p.id, p.position, p.angle, p.hp)));

  on("player_joined", msg => ensureRemote(msg.player.id, msg.player.position, msg.player.angle, msg.player.hp));

  on("player_moved", msg => updateRemote(msg.player.id, msg.player.position, msg.player.angle, msg.player.hp));

  on("player_hit", msg => {
    if (msg.id === playerId) {
      updatePlayerHP(msg.hp);
    } else {
      const bar = remoteBars[msg.id];
      if (bar) {
        bar.use(rect(SIZE * (msg.hp / MAX_HP), 5));
      }
    }
  });

  on("player_shot", msg => {
    if (msg.shooterId === playerId) return;
    const bullet = spawnBullet(msg.position, msg.direction, "bullet", msg.shooterId);
    handleBulletCollision(bullet, playerId, () => send("hit", { targetId: playerId }));
  });
}