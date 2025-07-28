const { BaseHandler } = require("redweb");
const PlayerRegistry = require("./PlayerRegistry");

class GetPlayersHandler extends BaseHandler {
    constructor() {
        super('get-players');
    }

    onMessage(socket, _) {
        const players = PlayerRegistry.getSanitizedList();
        socket.sendJson({
            type: 'players_list',
            players
        });
    }
}

module.exports = { GetPlayersHandler };