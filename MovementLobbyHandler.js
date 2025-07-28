const { LobbyHandler } = require("./LobbyHandler");

class MovementLobbyHandler extends LobbyHandler {
    constructor() {
        super();
    }

    onMessage(socket, message) {
        switch (message.action) {
            case 'move':
                this.handleMove(socket, message);
                break;
            default:
                super.onMessage(socket, message);
        }
    }

    create_new_player(socket, id, data) {
        const player = super.create_new_player(socket, id);
        // Initialize player position or other movement-related properties if needed
        player.position = data.position || { x: 0, y: 0, z: 0 }; // Example initial position
        player.vector = data.vec || { x: 0, y: 0, z: 0 }; // Example initial vector
        return player;
    }

    announce_new_player(player, data) {
        this.broadcast({ type: 'player_joined', player: { id: player.id, position: player.position, vector: player.vector } }, player);
    }

    handleMove(socket, message) {
        const player = this.get_player_by_socket(socket);
        if (!player) {
            socket.sendJson({ type: 'error', message: 'Player not found' });
            return;
        }
        
        // Process the move logic here
        if (message?.position) {
            player.position.x = message?.position.x || player.position.x || 0;
            player.position.y = message?.position.y || player.position.y || 0;
            player.position.z = message?.position.z || player.position.z || 0;
        }
        if (message?.vector) {
            player.vector.x = message?.vector?.x || player.vector.x || 0;
            player.vector.y = message?.vector?.y || player.vector.y || 0;
            player.vector.z = message?.vector?.z || player.vector.z || 0;
        }
        this.broadcast({
            type: 'player_moved',
            player: { id: player.id, position: message.position }
        }, player);
    }
}

module.exports = { MovementLobbyHandler };