const { SocketRoute } = require("redweb");
const { JoinHandler } = require("./handlers/JoinHandler");
const { ChatHandler } = require("./handlers/ChatHandler");
const { MoveHandler } = require("./handlers/MoveHandler");
const { MatchHandler } = require("./handlers/MatchHandler");
const { MatchService } = require("./services/MatchService");
const { GetPlayersHandler } = require("./handlers/GetPlayersHandler");

class DefaultRoute extends SocketRoute {
    constructor() {
        super({
            "path": "/",
            "handlers": [JoinHandler, ChatHandler, MoveHandler, MatchHandler, GetPlayersHandler],
            allowDuplicateConnections: true,
            services: [MatchService]
        })
    }
}

module.exports = { DefaultRoute };