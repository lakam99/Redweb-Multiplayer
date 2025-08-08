// MoveHandler.js
const { BaseHandler } = require("redweb");
const registry        = require("./PlayerRegistry");

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

    if (shouldBroadcast) {
      registry.broadcast({
        type:   "player_moved",
        player: player.getSanitized(),
      }, socket);
    }
  }
}

module.exports = { MoveHandler };
