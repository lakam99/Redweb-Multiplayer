// ShootHandler.js

const { BaseHandler } = require("redweb");
const registry = require("./PlayerRegistry");

class ShootHandler extends BaseHandler {
  constructor() {
    super("shoot");
  }

  onMessage(socket, data) {
    const player = registry.getBySocket(socket);
    if (!player) {
      socket.sendJson({ type: "error", message: "Player not found" });
      return;
    }

    const { position, direction } = data;
    if (!position || !direction) return;

    registry.broadcast(
      {
        type: "player_shot",
        shooterId: player.id,
        position,
        direction,
      },
      socket // don't echo to sender
    );
  }
}

module.exports = { ShootHandler };
