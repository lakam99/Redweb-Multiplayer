// NetworkHandlers.js
import Net from "./Net.js";

export function setupNetworkHandlers(entityManager, localId, spawnBulletVisual, updateLocalHP) {
  Net.on("players_list", (msg) => {
    for (const p of msg.players) {
      if (!entityManager.has(p.id)) {
        entityManager.spawn("player", p.id, p);
      }
    }
  });

  Net.on("player_joined", (msg) => {
    if (!entityManager.has(msg.player.id)) {
      entityManager.spawn("player", msg.player.id, msg.player);
    }
  });

  Net.on("player_left", (msg) => {
    entityManager.despawn(msg.id);
  });

  Net.on("player_moved", (msg) => {
    const p = msg.player;
    const ent = entityManager.get(p.id);
    if (!ent) return;
    if (p.position) ent.setPosition?.(p.position);
    if (p.vector) ent.setVector?.(p.vector);
    if (typeof p.angle === "number") ent.setAngle?.(p.angle);
  });

  Net.on("player_hit", (msg) => {
    const ent = entityManager.get(msg.id);
    if (ent?.updateHP) ent.updateHP(msg.hp);
    if (msg.id === localId && updateLocalHP) updateLocalHP(msg.hp);
  });

  Net.on("player_shot", (msg) => {
    if (msg.shooterId === localId) return;
    spawnBulletVisual(msg.position, msg.direction, msg.shooterId);
  });
}
