const { SocketRoute } = require("redweb");
const { JoinHandler } = require("./handlers/JoinHandler");
const { ChatHandler } = require("./handlers/ChatHandler");
const { MoveHandler } = require("./handlers/MoveHandler");
const { MatchService } = require("./services/MatchService");
const { GetPlayersHandler } = require("./handlers/GetPlayersHandler");
const { ShootHandler } = require("./handlers/ShootHandler");

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
}

module.exports = { DefaultRoute };