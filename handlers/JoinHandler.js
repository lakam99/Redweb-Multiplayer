const { BaseHandler } = require("redweb");
const { v4: uuidv4 } = require("uuid");
const registry = require("./PlayerRegistry");

class JoinHandler extends BaseHandler {
    constructor() {
        super("join");
    }

    onMessage(socket, message) {
        const id = message.id || uuidv4();
        const player = registry.create(socket, id, message);
        const success = registry.add(player);
        if (!success) {
            socket.sendJson({ type: "error", message: "Join rejected" });
            return;
        }

        player.send("joined", { id });

        registry.broadcast({
            type: "player_joined",
            player: { id: player.id, position: player.position, vector: player.vector }
        }, socket);
    }
}

module.exports = { JoinHandler };