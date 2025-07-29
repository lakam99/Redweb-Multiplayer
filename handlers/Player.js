// Player.js
class Player {
    constructor(socket, id, data, registry) {
      this.socket   = socket;
      this.id       = id;
      this.registry = registry;
  
      this.position = data?.position || { x: 0, y: 0, z: 0 };
      this.vector   = data?.vector   || { x: 0, y: 0, z: 0 };
      this.angle    = data?.angle    ?? 0;
    }
  
    setPosition(pos, vector = this.vector, angle = this.angle) {
      this.position = pos;
      this.vector   = vector;
      this.angle    = angle;
  
      this.registry.broadcast(
        {
          type: "player_moved",
          player: {
            id:       this.id,
            position: this.position,
            vector:   this.vector,
            angle:    this.angle,
          },
        },
        this.socket,
      );
    }
  
    setVector(vector) {
      this.vector = vector;
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
  