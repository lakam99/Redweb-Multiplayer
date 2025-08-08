// ClientBullet.js
import { ClientEntity } from "./ClientEntity.js";
import { raycastAgainstRects } from "./Raycast.js";

export class ClientBullet extends ClientEntity {
  constructor(id, position, direction, speed = 480) {
    super(id, position, 0, direction);
    this.speed = speed;
    this.radius = 4;
    this.life = 1.5;
    this.alive = true;
    this.sceneWalls = null;
  }


  setSceneWalls(rects) { this.sceneWalls = rects; }

  update(deltaTime) {
    if (!this.alive) return;
    // Pre-trim life to first wall impact if walls are known
    if (this.sceneWalls) {
      const hit = raycastAgainstRects(this.position, this.vector, this.sceneWalls, 2000);
      if (hit) {
        const dist = Math.hypot(hit.point.x - this.position.x, hit.point.y - this.position.y);
        const tti = dist / this.speed;
        this.life = Math.min(this.life, tti);
      }
    }
    super.update(deltaTime);
    this.life -= deltaTime;
    if (this.life <= 0) this.destroy();
  }

  getSpriteComponents() {
    const self = this;
    return [
      circle(this.radius),
      color(255, 230, 120),
      pos(this.position.x, this.position.y),
      anchor("center"),
      z(1),
      {
        id: "bulletSync",
        update() {
          this.pos = vec2(self.position.x, self.position.y);
          if (!self.alive) this.destroy();
        }
      },
      "bullet"
    ];
  }
}
