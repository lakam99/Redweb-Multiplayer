const { SocketRoute } = require("redweb");
const { LobbyHandler } = require("./LobbyHandler");
const { MovementLobbyHandler } = require("./MovementLobbyHandler");

class DefaultRoute extends SocketRoute {
    constructor() {
        super({
            "path": "/",
            "handlers": [MovementLobbyHandler],
            allowDuplicateConnections: true
        })
    }
}

module.exports = { DefaultRoute };