const { BaseHandler } = require("redweb");

class GetPlayersHandler extends BaseHandler {
    constructor() {
        super('get-players');
    }

    onMessage(socket, _) {
        const PlayerRegistry = socket.playerRegistry;
        const player = PlayerRegistry.getBySocket(socket);
        if (!player) {
            socket.sendJson({ type: 'error', message: 'Join first' });
            return;
        }
        const players = PlayerRegistry.inRoom(player.roomId).map(p => p.getSanitized());
        socket.sendJson({
            type: 'players_list',
            players
        });
    }
}

module.exports = { GetPlayersHandler };
