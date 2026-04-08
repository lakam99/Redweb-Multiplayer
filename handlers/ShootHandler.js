// ShootHandler.js
const { BaseHandler } = require("redweb");
const registry = require("./PlayerRegistry");
const { WALL_RECTS } = require("../world/WallMap");
const { raycastAgainstRects } = require("../world/Geometry");

function isVec2(v) { return v && typeof v.x === "number" && typeof v.y === "number"; }

class ShootHandler extends BaseHandler {
  constructor() { super("shoot"); }

  onMessage(socket, data = {}) {
    const player = registry.getBySocket(socket);
    if (!player) { socket.sendJson({ type: "error", message: "Player not found" }); return; }

    const bulletId = data.bulletId || `srv_${Date.now()}_${Math.floor(Math.random()*9999)}`;
    const weaponType = data.weaponType || 'rifle';
    const position  = data.position  && isVec2(data.position)  ? data.position  : { x: player.position.x, y: player.position.y };
    const direction = data.direction && isVec2(data.direction) ? data.direction : { x: Math.cos(player.angle), y: Math.sin(player.angle) };

    // Raycast vs walls to find impact
    const hitWall = raycastAgainstRects(position, direction, WALL_RECTS, 2000);
    let impact = hitWall ? hitWall.point : { x: position.x + direction.x * 2000, y: position.y + direction.y * 2000 };

    // Raycast vs players (simple: test AABB centers as small rects) for hit registration
    let hitPlayer = null;
    let bestT = hitWall ? hitWall.t : Infinity;
    for (const p of registry.items) {
      if (p.id === player.id) continue;
      const aabb = { x: p.position.x - 14, y: p.position.y - 14, w: 28, h: 28 };
      const t = require("../world/Geometry").raycastRect(position, direction, aabb);
      if (t != null && t >= 0 && t < bestT) {
        bestT = t;
        impact = { x: position.x + direction.x * t, y: position.y + direction.y * t };
        hitPlayer = p;
      }
    }

    // If we hit a player, apply simple HP deduction and broadcast
    if (hitPlayer) {
      hitPlayer.hp = Math.max(0, (hitPlayer.hp ?? 3) - 1);
      registry.broadcast({ type: "player_hit", id: hitPlayer.id, hp: hitPlayer.hp });
    }

    // Broadcast bullet ray + impact so clients can render and delete the bullet
    registry.broadcast({ type: "bullet_impact", bulletId, position, impact, shooterId: player.id, weaponType }, null);
  }
}

module.exports = { ShootHandler };
