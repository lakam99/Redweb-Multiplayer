class Player {
    constructor(socket, id, data, registry) {
        this.socket = socket;
        this.id = id;
        this.registry = registry;

        this.position = data?.position || { x: 0, y: 0, z: 0 };
        this.vector = data?.vec || { x: 0, y: 0, z: 0 };
    }

    setPosition(pos) {
        this.position = pos;
        this.registry.broadcast({
            type: 'player_moved',
            player: { id: this.id, position: this.position }
        }, this.socket);
    }

    send(type, payload = {}) {
        this.socket.sendJson({ type, ...payload, timestamp: Date.now() });
    }

    getSanitized() {
        const { socket, registry, ...clean } = this;
        return clean;
    }
}

module.exports = Player;