// MoveHandler.js
const { BaseHandler } = require("redweb");
const registry        = require("./PlayerRegistry");
const { resolveAABBAgainstWalls, clampToBounds } = require("../world/World");

class MoveHandler extends BaseHandler {
  constructor() {
    super("move");
  }

  /**
   * Message shape expected from client
   * {
   *   position: { x, y, z }  // optional – absolute position
   *   vector:   { x, y, z }  // optional – movement delta
   *   angle:    Number       // optional – facing direction (rad)
   * }
   */
  onMessage(socket, msg = {}) {
    const player = registry.getBySocket(socket);
    if (!player) {
      socket.sendJson({ type: "error", message: "Player not found" });
      return;
    }

    let shouldBroadcast = false;

    if (msg.position) {
      // setPosition uses explicit angle/vector if provided, else keeps existing
      const angle = (typeof msg.angle === "number") ? msg.angle : player.angle;
      const vector = msg.vector ? msg.vector : player.vector;
      player.setPosition(msg.position, vector, angle);
      shouldBroadcast = true;
    }

    if (msg.vector) {
      player.setVector(msg.vector);
      shouldBroadcast = true;
    }

    if (typeof msg.angle === "number" && !msg.position) {
      player.angle = msg.angle;
      shouldBroadcast = true;
    }

    // COLLISION_RESOLVE: enforce authoritative wall & bounds
    const half = 14; // roughly half player size (keep in sync with client SIZE/2)
    const aabb = { x: player.position.x - half, y: player.position.y - half, w: half*2, h: half*2 };
    const fixed = resolveAABBAgainstWalls(aabb);
    const clamped = clampToBounds({ x: fixed.x + half, y: fixed.y + half }, 800, 600, half);
    player.setPosition(clamped, player.vector, player.angle);

    if (shouldBroadcast) {
      registry.broadcast({
        type:   "player_moved",
        player: player.getSanitized(),
      }, socket);
    }
  }
}

module.exports = { MoveHandler };
