const { BaseHandler } = require("redweb");

class ChatHandler extends BaseHandler {
    constructor() {
        super("chat");
    }

    onMessage(socket, message) {
        const registry = socket.playerRegistry;
        if (typeof message.message !== 'string' || message.message.length > 500) {
            socket.sendJson({ type: 'error', message: 'Invalid chat message' });
            return;
        }
        const player = registry.getBySocket(socket);
        if (!player) {
            socket.sendJson({ type: "error", message: "Player not found" });
            return;
        }

        registry.broadcast({
            type: "chat",
            player: { id: player.id, message: message.message }
        }, socket, player.roomId);
    }
}

module.exports = { ChatHandler };
