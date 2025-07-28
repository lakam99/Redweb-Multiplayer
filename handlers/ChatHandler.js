const { BaseHandler } = require("redweb");
const registry = require("./PlayerRegistry");

class ChatHandler extends BaseHandler {
    constructor() {
        super("chat");
    }

    onMessage(socket, message) {
        const player = registry.getBySocket(socket);
        if (!player) {
            socket.sendJson({ type: "error", message: "Player not found" });
            return;
        }

        registry.broadcast({
            type: "chat",
            player: { id: player.id, message: message.message }
        }, socket);
    }
}

module.exports = { ChatHandler };