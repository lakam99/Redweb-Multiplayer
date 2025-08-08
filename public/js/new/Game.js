// Game.js
import { EntityManager } from "./EntityManager.js";
import { ClientPlayer } from "./ClientPlayer.js";
import { setupPlayerInput } from "./PlayerInputManager.js";
import { setupNetworkHandlers } from "./NetworkHandlers.js";
import { handleShoot } from "./ShootingManager.js";
import Net from "./Net.js";
import { WS_URL } from "./config.js";
import { randId } from "./utils.js";
import { VFX } from "./VFXConfig.js";
import { HUD } from "./HUD.js";
import { loadWallRects } from "./WallMap.js";
export class Game {
  constructor(kaboom) {
    this.k = kaboom;
    this.entityManager = new EntityManager();
    this.player = null;
    this.playerId = `p_${randId(6)}`;
    this.weaponType = VFX.defaultWeapon;
    this.hud = null;
  }

  async start() {
    const { add, rect, text, pos, color, anchor, onUpdate, onKeyPress, dt, vec2 } = this.k;
    // Load wall rects
    const { rects: WALLS, bounds } = await loadWallRects();
    this.WALLS = WALLS;
    this.bounds = bounds;
    this.hud = new HUD();
    // draw walls
    WALLS.forEach(w => add([rect(w.w, w.h), pos(w.x + w.w/2, w.y + w.h/2), anchor("center"), color(120,120,120), area(), z(0), "wall"]));
    // RENDER_WALLS
    WALLS.forEach(w => add([rect(w.w, w.h), pos(w.x + w.w/2, w.y + w.h/2), anchor("center"), color(120,120,120), area(), z(0), "wall"]));
    const k = this.k;

    // connect
    try { await Net.connect(WS_URL); } catch (e) { console.warn('WS connect failed, will retry automatically'); }

    // create local player
    this.player = this.entityManager.spawn("player", this.playerId, {
      position: { x: 400, y: 300 },
      angle: 0,
      hp: 3,
    });

    this.player.isLocal = true;
    this.player.setSceneWalls(this.WALLS);

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
    setupPlayerInput(this.k, this.player, () => this.player.angle, () => handleShoot(this.entityManager, this.player, this.WALLS, this.weaponType));

    // keybinds for quick testing
    onKeyPress('1', () => { this.weaponType = 'rifle'; this.hud?.setWeapon(this.weaponType); });
    onKeyPress('2', () => { this.weaponType = 'pistol'; this.hud?.setWeapon(this.weaponType); });
    onKeyPress('3', () => { this.weaponType = 'smg'; this.hud?.setWeapon(this.weaponType); });
    onKeyPress('v', () => { VFX.performanceMode = !VFX.performanceMode; this.hud?.setVFX(VFX.performanceMode); });

    // game loop
    onUpdate(() => this.entityManager.updateAll(dt()));
  }

  spawnBulletVisual(position, direction) {
    const id = `rb_${randId(6)}`;
    const b = this.entityManager.spawn("bullet", id, { position, direction });
    b.setSceneWalls?.(this.WALLS);
  }
}
