/**
 * Player model (server-side)
 */
class Player {
  constructor(socket, id, data = {}, registry) {
    this.socket   = socket;
    this.id       = id;
    this.registry = registry;

    this.position = data.position ?? { x: 0, y: 0, z: 0 };
    this.vector   = data.vector   ?? { x: 0, y: 0, z: 0 };
    this.angle    = typeof data.angle === "number" ? data.angle : 0;
  }

  setPosition(pos, vector = this.vector, angle = this.angle) {
    this.position = { ...this.position, ...pos };
    this.vector   = { ...this.vector,   ...vector };
    this.angle    = angle;
  }

  setVector(vector) {
    this.vector = { ...this.vector, ...vector };
  }

  send(type, payload = {}) {
    // RedWeb sockets expose sendJson; fallback to raw send if needed
    const message = { type, ...payload, timestamp: Date.now() };
    if (typeof this.socket.sendJson === "function") {
      this.socket.sendJson(message);
    } else if (typeof this.socket.send === "function") {
      this.socket.send(JSON.stringify(message));
    }
  }

  getSanitized() {
    // hide non-serializable / internal props
    const { socket, registry, ...clean } = this;
    return clean;
  }
}

module.exports = Player;
