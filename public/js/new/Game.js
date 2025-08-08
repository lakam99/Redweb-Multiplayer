// Game.js
import { EntityManager } from "./EntityManager.js";
import { ClientPlayer } from "./ClientPlayer.js";
import { setupPlayerInput } from "./PlayerInputManager.js";
import { setupNetworkHandlers } from "./NetworkHandlers.js";
import { handleShoot } from "./ShootingManager.js";
import Net from "./Net.js";
import { WS_URL } from "./config.js";
import { randId } from "./utils.js";

export class Game {
  constructor(kaboom) {
    this.k = kaboom;
    this.entityManager = new EntityManager();
    this.player = null;
    this.playerId = `p_${randId(6)}`;
  }

  async start() {
    const k = this.k;
    const { add, rect, text, pos, color, anchor, onUpdate, dt, vec2 } = k;

    // connect
    try { await Net.connect(WS_URL); } catch (e) { console.warn('WS connect failed, will retry automatically'); }

    // create local player
    this.player = this.entityManager.spawn("player", this.playerId, {
      position: { x: 400, y: 300 },
      angle: 0,
      hp: 3,
    });

    this.player.isLocal = true;

    // join (retry until connected)
    this.joined = false;
    const tryJoin = () => {
      const s = Net.socket;
      if (this.joined) return;
      if (s && s.readyState === WebSocket.OPEN) {
        Net.send("join", { id: this.playerId, position: this.player.position });
        this.joined = true;
      }
    };
    tryJoin();
    setInterval(tryJoin, 1000);

    // network
    setupNetworkHandlers(
      this.entityManager,
      this.playerId,
      (pos, dir) => this.spawnBulletVisual(pos, dir),
      (hp) => {},
    );

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
