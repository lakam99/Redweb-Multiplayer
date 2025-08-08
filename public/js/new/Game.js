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

    // HUD
    add([text("Redsea Demo"), pos(10, 10), color(255,255,255), anchor("topleft")]);

    // connect
    await Net.connect(WS_URL);

    // create local player
    this.player = this.entityManager.spawn("player", this.playerId, {
      position: { x: 400, y: 300 },
      angle: 0,
      hp: 3,
    });

    // join
    Net.send("join", {
      id: this.playerId,
      position: this.player.position,
    });

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
