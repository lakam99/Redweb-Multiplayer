const { BaseHandler } = require("redweb");
const registry = require("./PlayerRegistry");

class MoveHandler extends BaseHandler {
    constructor() {
        super("move");
    }

    onMessage(socket, message) {
        const player = registry.getBySocket(socket);
        if (!player) {
            socket.sendJson({ type: "error", message: "Player not found" });
            return;
        }

        player.setPosition(message.position || player.position);
        player.vector = message.vector || player.vector;
    }
}

module.exports = { MoveHandler };