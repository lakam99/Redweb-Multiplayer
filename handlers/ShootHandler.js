// ShootHandler.js

const { BaseHandler } = require("redweb");

function isVec2(v) {
  return v && Number.isFinite(v.x) && Number.isFinite(v.y);
}

class ShootHandler extends BaseHandler {
  constructor() {
    super("shoot");
  }

  onMessage(socket, data = {}) {
    const registry = socket.playerRegistry;
    const player = registry.getBySocket(socket);
    if (!player) {
      socket.sendJson({ type: "error", message: "Player not found" });
      return;
    }

    const position  = data.position  && isVec2(data.position)  ? data.position  : { x: player.position.x, y: player.position.y };
    const direction = data.direction && isVec2(data.direction) ? data.direction : { x: player.vector.x,   y: player.vector.y };

    registry.broadcast(
      {
        type: "player_shot",
        shooterId: player.id,
        position,
        direction,
      },
      socket, player.roomId // don't echo to sender
    );
  }
}

module.exports = { ShootHandler };
