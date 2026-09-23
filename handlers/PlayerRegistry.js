const { SocketRegistry } = require("redweb");
const Player = require("./Player");

class PlayerRegistry extends SocketRegistry {
  constructor() {
    super();
    this.maxPlayers = 100;
    this.maxPlayersPerRoom = 8;
    this._createValidator = null;
    this._removeValidator = null;
  }

  setCreateValidator(fn) { this._createValidator = fn; }
  setRemoveValidator(fn) { this._removeValidator = fn; }

  create(socket, id, data = {}) {
    return new Player(socket, id, data, this);
  }

  add(player) {
    if (!player) return false;
    if (this.getBySocket(player.socket)) return false;
    if (this.items.find(p => p.id === player.id)) return false;
    if (this.items.length >= this.maxPlayers || this.inRoom(player.roomId).length >= this.maxPlayersPerRoom) return false;
    if (this._createValidator && !this._createValidator(player)) return false;

    super.add(player);

    if (this.inRoom(player.roomId).length === 2) this.emit('roomReady', player.roomId);
    return true;
  }

  remove(target) {
    const idx = this._indexOf(target);
    if (idx < 0) return false;

    const player = this.items[idx];
    if (this._removeValidator && !this._removeValidator(player)) return false;

    super.remove(player);
    this.emit('playerLeft', player.roomId);
    return true;
  }

  _indexOf(target) {
    if (!target) return -1;
    if (typeof target === "string") {
      return this.items.findIndex(p => p.id === target);
    }
    if (target.socket) {
      return this.items.findIndex(p => p.socket === target.socket);
    }
    if (target.id) {
      return this.items.findIndex(p => p.id === target.id);
    }
    // maybe the exact instance
    const i = this.items.indexOf(target);
    return i >= 0 ? i : -1;
  }

  getById(id) {
    return this.items.find(p => p.id === id) || null;
  }

  getBySocket(socket) {
    return this.items.find(p => p.socket === socket) || null;
  }

  getSanitizedList() {
    return this.items.map(p => p.getSanitized());
  }

  inRoom(roomId) {
    return this.items.filter(player => player.roomId === roomId);
  }

  broadcast(data, excludeSocket = null, roomId = null) {
    if (roomId) {
      const sender = this.inRoom(roomId)[0];
      return sender?.socket.roomBroadcast(roomId, data, { except: excludeSocket }) ?? 0;
    }
    this.items.forEach(player => {
      if (player.socket !== excludeSocket) player.send(data.type, data);
    });
  }
}

module.exports = new PlayerRegistry();
