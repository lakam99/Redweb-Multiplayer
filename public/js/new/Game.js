// Game.js
import { EntityManager } from "./EntityManager.js";
import { ClientPlayer } from "./ClientPlayer.js";
import { setupPlayerInput } from "./PlayerInputManager.js";
import { setupNetworkHandlers } from "./NetworkHandlers.js";
import { handleShoot } from "./ShootingManager.js";
import Net from "./Net.js";
import { randId } from "./utils.js";

export class Game {
  constructor(kaboom) {
    this.k = kaboom;
    this.entityManager = new EntityManager();
    this.player = null;
    this.playerId = `p_${randId(6)}`;
    this.session = null;
  }

  async start() {
    const k = this.k;
    const { add, rect, text, pos, color, anchor, onUpdate, dt, vec2 } = k;

    // create local player
    this.player = this.entityManager.spawn("player", this.playerId, {
      position: { x: 400, y: 300 },
      angle: 0,
      hp: 3,
    });

    this.player.isLocal = true;

    // network
    setupNetworkHandlers(
      this.entityManager,
      this.playerId,
      (pos, dir) => this.spawnBulletVisual(pos, dir),
      (hp) => {},
    );

    const roomId = new URLSearchParams(location.search).get('room') || 'lobby';
    Net.on('connected', () => {
      if (this.session) Net.send('resume', { session: this.session });
      else Net.send('join', { id: this.playerId, roomId, position: this.player.position });
    });
    Net.on('joined', message => { this.session = message.session; });
    Net.on('error', message => {
      if (message.message !== 'Session expired or unknown') return;
      this.session = null;
      Net.send('join', { id: this.playerId, roomId, position: this.player.position });
    });
    Net.connect().catch(() => console.warn('WebSocket connection failed; retrying'));

    // input
    setupPlayerInput(this.k, this.player, () => this.player.angle, () => handleShoot(this.entityManager, this.player));

    // game loop
    onUpdate(() => this.entityManager.updateAll(dt()));
  }

  spawnBulletVisual(position, direction) {
    const id = `rb_${randId(6)}`;
    this.entityManager.spawn("bullet", id, { position, direction });
  }
}
