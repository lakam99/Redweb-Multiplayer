const { SocketService } = require('redweb');

class MatchService extends SocketService {
  constructor() {
    super('MatchService');
    this.duration = 30_000;
    this.matches = new Map();
  }

  onInit(route) {
    super.onInit(route);
    this.onRoomReady = roomId => this.startMatch(roomId);
    this.onPlayerLeft = roomId => {
      if (this.registry.inRoom(roomId).length < 2) this.endMatch(roomId);
    };
  }

  bindRegistry(registry) {
    this.registry = registry;
    registry.on('roomReady', this.onRoomReady);
    registry.on('playerLeft', this.onPlayerLeft);
  }

  startMatch(roomId) {
    if (this.matches.has(roomId)) return;
    this.registry.broadcast({ type: 'match_started', roomId }, null, roomId);
    this.matches.set(roomId, setTimeout(() => this.endMatch(roomId), this.duration));
  }

  endMatch(roomId) {
    const timer = this.matches.get(roomId);
    if (!timer) return;
    clearTimeout(timer);
    this.matches.delete(roomId);
    this.registry.broadcast({ type: 'match_over', roomId }, null, roomId);
  }

  onShutdown() {
    this.registry?.off('roomReady', this.onRoomReady);
    this.registry?.off('playerLeft', this.onPlayerLeft);
    for (const timer of this.matches.values()) clearTimeout(timer);
    this.matches.clear();
    super.onShutdown();
  }
}

module.exports = { MatchService };
