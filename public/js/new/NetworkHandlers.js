// NetworkHandlers.js
import Net from "./Net.js";

export function setupNetworkHandlers(entityManager, localId, spawnBulletVisual, updateLocalHP) {
  Net.on("joined", () => {
    // Populate state of players who were already connected
    Net.send("get-players");
  });
  Net.on("players_list", (msg) => {
    const present = new Set(msg.players.map(player => player.id));
    for (const [id, entity] of entityManager.entities) {
      if (entity instanceof entityManager.types.player && id !== localId && !present.has(id)) {
        entityManager.despawn(id);
      }
    }
    for (const p of msg.players) {
      if (!entityManager.has(p.id)) {
        entityManager.spawn("player", p.id, p).setTarget(p.position, p.angle, p.vector);
      } else if (p.id !== localId) {
        entityManager.get(p.id).setTarget(p.position, p.angle, p.vector);
      }
    }
  });

  Net.on("player_joined", (msg) => {
    if (!entityManager.has(msg.player.id)) {
      entityManager.spawn("player", msg.player.id, msg.player)
        .setTarget(msg.player.position, msg.player.angle, msg.player.vector);
    }
  });

  Net.on("player_left", (msg) => {
    entityManager.despawn(msg.id);
  });

  Net.on("player_moved", (msg) => {
    const p = msg.player;
    const ent = entityManager.get(p.id);
    if (!ent) return;
    if (p.id === localId) {
      // local echo (ignore or hard-sync if needed)
      return;
    }
    // drive remote via smoothing targets
    ent.setTarget(p.position, p.angle, p.vector);
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
