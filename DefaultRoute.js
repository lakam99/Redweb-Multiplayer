const { SocketRoute } = require("redweb");
const { JoinHandler } = require("./handlers/JoinHandler");
const { ChatHandler } = require("./handlers/ChatHandler");
const { MoveHandler } = require("./handlers/MoveHandler");
const { MatchService } = require("./services/MatchService");
const { GetPlayersHandler } = require("./handlers/GetPlayersHandler");
const { ShootHandler } = require("./handlers/ShootHandler");
const registry = require("./handlers/PlayerRegistry");

class DefaultRoute extends SocketRoute {
    constructor() {
        super({
            "path": "/",
            "handlers": [
                JoinHandler,
                ChatHandler,
                MoveHandler,
                GetPlayersHandler,
                ShootHandler],
            allowDuplicateConnections: true,
            services: [MatchService]
        })
    }

    connectionCloseCallback(socket) {
        const player = registry.getBySocket(socket);
        if (player && registry.remove(player)) {
            registry.broadcast({ type: "player_left", id: player.id });
        }
    }
}

module.exports = { DefaultRoute };
