const { SocketRegistry } = require("redweb");
const Player = require("./Player");

class PlayerRegistry extends SocketRegistry {
    constructor() {
        super();
        this.maxPlayers = Infinity;
        this._createValidator = null;
        this._removeValidator = null;
    }

    setCreateValidator(fn) {
        this._createValidator = fn;
    }

    setRemoveValidator(fn) {
        this._removeValidator = fn;
    }

    setMaxPlayers(limit) {
        this.maxPlayers = limit;
    }

    create(socket, id, data) {
        return new Player(socket, id, data, this);
    }

    add(player) {
        if (this.count() >= this.maxPlayers) return false;
        if (this._createValidator && this._createValidator(player) === false) return false;

        super.add(player); // uses SocketRegistry.add()
        this.emit("playerJoined", player);

        if (this.count() >= this.maxPlayers) {
            setTimeout(() => this.emit("maxPlayersReached", player), 1000);
        }

        return true;
    }

    remove(id) {
        const player = this.getById(id);
        if (!player) return false;
        if (this._removeValidator && this._removeValidator(player) === false) return false;

        const success = super.remove(id); // uses SocketRegistry.remove()
        if (success) this.emit("playerLeft", player);
        return success;
    }

    getById(id) {
        return this.items.find(p => p.id === id);
    }

    getBySocket(socket) {
        return this.items.find(p => p.socket === socket);
    }

    allWithout(socket) {
        return this.items.filter(p => p.socket !== socket);
    }

    getSanitizedList() {
        return this.items.map(p => p.getSanitized());
    }

    broadcast(data, excludeSocket = null) {
        this.items.forEach(p => {
            if (p.socket !== excludeSocket) {
                p.send(data.type, data);
            }
        });
    }
}

module.exports = new PlayerRegistry();
