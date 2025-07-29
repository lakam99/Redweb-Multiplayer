// ShootHandler.js

const { BaseHandler } = require("redweb");

class ShootHandler extends BaseHandler {
  constructor() {
    super("shoot");
  }

  handle(socket, data, services) {
    const player = socket.data.player;
    if (!player) return;

    const { position, direction } = data;
    if (!position || !direction) return;

    // Broadcast bullet event to other players
    services.registry.broadcast(
      {
        type: "player_shot",
        shooterId: player.id,
        position,
        direction,
      },
      socket // do not echo to sender
    );
  }
}

module.exports = { ShootHandler };
