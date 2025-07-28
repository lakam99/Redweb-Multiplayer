const { BaseHandler } = require("redweb");
const { v4: uuidv4 } = require('uuid');

class LobbyHandler extends BaseHandler {
    constructor() {
        super('lobby');
        this.players = [];
    }

    create_new_player(socket, id) {
        if (!id) id = uuidv4();
        return {
            socket,
            id
        }
    }

    announce_new_player(player, data) {
        this.broadcast({ type: 'player_joined', player: { id: player.id } }, player);
    }

    add_player(socket, id, data) {
        const player = this.create_new_player(socket, id, data);
        this.players.push(player);
        socket.sendJson({ type: 'joined', id: player.id });
        this.announce_new_player(player, data);
        return player;
    }

    remove_player(id) {
        this.players = this.players.filter(player => player.id !== id);
    }

    /**
     * 
     * @param {{socket: WebSocket, id: string}} player 
     * @param {string} message 
     */
    chat(player, message) {
        this.broadcast({
            type: 'chat',
            player: {
                id: player.id,
                message: message
            }
        }, player);
    }

    broadcast(data, exclude_player = null) {
        this.players.filter(player => player !== exclude_player).forEach(player => {
            player.socket.sendJson({...data, timestamp: Date.now()});
        });
    }

    /**
     * 
     * @param {string} id 
     * @returns {socket: WebSocket, id: string} player
     */
    get_player(id) {
        return this.players.find(player => player.id === id);
    }

    get_players() {
        return this.players.map(({ socket, ...player }) => player);
    }

    get_player_by_socket(socket) {
        return this.players.find(player => player.socket === socket);
    }

    onMessage(socket, data) {
        let player;
        switch (data.action) {
            case 'join':
                player = this.add_player(socket, data.id, data);
                break;
            case 'disconnect':
                this.remove_player(data.id);
                socket.sendJson({ type: 'disconnected', id: data.id });
                break;
            case 'chat':
                player = this.get_player(data.id);
                if (!player) {
                    socket.sendJson({ type: 'error', message: 'Player not found. Join first.' });
                    return;
                }
                this.chat(player, data.message);
                break;
            case 'get_players':
                socket.sendJson({ type: 'players_list', players: this.get_players() });
                break;
            case 'get_player':
                player = this.get_player(data.id);
                if (!player) {
                    socket.sendJson({ type: 'error', message: 'Player not found' });    
                }
                const { _, ...playerData } = player;
                socket.sendJson({ type: 'player_data', player: playerData });
                break;
            default:
                console.warn(`Unknown message action: ${data.type}`);
                socket.sendJson({ type: 'error', message: 'Unknown message type' });
                socket.close();
                break;
        }
    }
}

module.exports = { LobbyHandler}