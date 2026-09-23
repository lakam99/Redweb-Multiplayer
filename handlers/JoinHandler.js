const { BaseHandler } = require("redweb");
const { v4: uuidv4 } = require("uuid");
const { randomUUID } = require('node:crypto');
const registry = require("./PlayerRegistry");
const { validMotion } = require('./validate');

class JoinHandler extends BaseHandler {
    constructor() {
        super("join");
    }

    onMessage(socket, message) {
        if (!validMotion(message) || (message.id !== undefined &&
            (typeof message.id !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(message.id)))) {
            socket.sendJson({ type: 'error', message: 'Invalid player data' });
            return;
        }
        const roomId = message.roomId ?? 'lobby';
        if (typeof roomId !== 'string' || !/^[a-zA-Z0-9_-]{1,32}$/.test(roomId)) {
            socket.sendJson({ type: 'error', message: 'Invalid room ID' });
            return;
        }
        if (registry.getBySocket(socket)) {
            socket.sendJson({ type: 'error', message: 'Already joined' });
            return;
        }
        if (!socket.joinRoom(roomId)) {
            socket.sendJson({ type: 'error', message: 'Room is full' });
            return;
        }
        const id = message.id || uuidv4();
        const player = registry.create(socket, id, { ...message, roomId });
        const success = registry.add(player);
        if (!success) {
            socket.leaveRoom(roomId);
            socket.sendJson({ type: "error", message: "Join rejected" });
            return;
        }

        const session = randomUUID();
        if (!socket.createSession(session, player)) {
            registry.remove(player);
            socket.leaveRoom(roomId);
            socket.sendJson({ type: 'error', message: 'Session capacity reached' });
            return;
        }

        player.send("joined", { id, roomId, session });

        registry.broadcast({
            type: "player_joined",
            player: { id: player.id, position: player.position, vector: player.vector }
        }, socket, roomId);
    }
}

module.exports = { JoinHandler };
