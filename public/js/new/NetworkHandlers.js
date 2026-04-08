// NetworkHandlers.js
import Net from "./Net.js";

export function setupNetworkHandlers(entityManager, localId, spawnBulletVisual, updateLocalHP) {
  Net.on("joined", () => {
    // Populate state of players who were already connected
    Net.send("get-players");
  });
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


  Net.on("bullet_impact", (msg) => {
    // 1) Remove bullet by id if it exists locally
    const b = entityManager.get(msg.bulletId);
    if (b) entityManager.despawn(msg.bulletId);

    // Skip VFX if disabled or in performance mode
    if (!VFX.enabled || VFX.performanceMode) return;

    const weapon = (msg.weaponType && VFX.perWeapon[msg.weaponType]) ? VFX.perWeapon[msg.weaponType] : VFX.perWeapon[VFX.defaultWeapon];
    const { tracerWidth, tracerLife, tracerColor, sparkLife, sparkColor, sparkRadius } = weapon;

    const p1 = vec2(msg.position.x, msg.position.y);
    const p2 = vec2(msg.impact.x, msg.impact.y);

    // Tracer line
    add([
      {
        life: tracerLife,
        update() { this.life -= dt(); if (this.life <= 0) this.destroy(); },
        draw() { color(...tracerColor); drawLine({ p1, p2, width: tracerWidth }); },
      },
      z(3)
    ]);

    // Impact spark
    add([
      pos(p2),
      {
        r: sparkRadius,
        life: sparkLife,
        update() { this.life -= dt(); this.r *= 0.8; if (this.life <= 0) this.destroy(); },
        draw() { color(...sparkColor); drawCircle({ center: vec2(0,0), radius: this.r }); },
      },
      anchor("center"),
      z(3)
    ]);
  });
