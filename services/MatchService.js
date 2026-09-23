const { SocketService } = require('redweb');
const registry = require('../handlers/PlayerRegistry')

class MatchService extends SocketService {
  constructor() {
    super('MatchService');
    this.active = false;
    this.duration = 30_000;
  }

  onInit(route) {
    super.onInit(route);

    // start when player cap hit
    try {
      registry.on && registry.on('maxPlayersReached', () => {
        if (!this.active) this.startMatch();
      });
    } catch {}

    // or start if there are already players on init with a finite cap
    if (Number.isFinite(registry.maxPlayers) && registry.maxPlayers > 0 && registry.items?.length >= registry.maxPlayers) {
      this.startMatch();
    }
  }

  startMatch() {
    this.active = true;
    registry.broadcast({ type: 'match_started' });

    this.matchTimer = setTimeout(() => this.endMatch(), this.duration);
  }

  endMatch() {
    this.active = false;
    this.matchTimer = null;
    registry.broadcast({ type: 'match_over' });
  }

  onShutdown() {
    clearTimeout(this.matchTimer);
    this.matchTimer = null;
    super.onShutdown();
  }
}

module.exports = { MatchService };
