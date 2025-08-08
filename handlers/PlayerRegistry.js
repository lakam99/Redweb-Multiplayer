const { SocketRegistry } = require("redweb");
const Player = require("./Player");

class PlayerRegistry extends SocketRegistry {
  constructor() {
    super();
    this.items = []; // ensure array exists if base class doesn't initialize
    this.maxPlayers = Infinity;
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
    if (this.items.find(p => p.id === player.id)) return false;
    if (this.items.length >= this.maxPlayers) {
      // Let listeners know the cap was reached
      try { this.emit && this.emit("maxPlayersReached"); } catch {}
      return false;
    }
    if (this._createValidator && !this._createValidator(player)) return false;

    this.items.push(player);

    if (this.items.length >= this.maxPlayers) {
      try { this.emit && this.emit("maxPlayersReached"); } catch {}
    }
    return true;
  }

  remove(target) {
    const idx = this._indexOf(target);
    if (idx < 0) return false;

    const player = this.items[idx];
    if (this._removeValidator && !this._removeValidator(player)) return false;

    this.items.splice(idx, 1);
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

  broadcast(data, excludeSocket = null) {
    this.items.forEach(p => {
      if (excludeSocket && p.socket === excludeSocket) return;
      p.send(data.type, data);
    });
  }
}

module.exports = new PlayerRegistry();
