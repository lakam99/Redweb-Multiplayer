// ClientPlayer.js
import { ClientEntity } from "./ClientEntity.js";
import { PLAYER_SPEED, SIZE } from "./config.js";

export class ClientPlayer extends ClientEntity {
  constructor(id, position = {x: 400, y: 300}, angle = 0, hp = 3) {
    super(id, position, angle);
    this.hp = hp;
    this.speed = PLAYER_SPEED;
    this.size = SIZE;
  }

  update(deltaTime) {
    super.update(deltaTime);
  }

  updateHP(hp) {
    this.hp = hp;
  }

  setVector(v) {
    this.vector = { x: v.x, y: v.y };
  }

  setPosition(pos) {
    this.position = { x: pos.x, y: pos.y };
  }

  setAngle(rad) {
    this.angle = rad;
  }

  getSpriteComponents() {
    // simple player rectangle with an orientation line
    const half = this.size / 2;
    const self = this;
    return [
      rect(this.size, this.size),
      color(80, 180, 255),
      pos(this.position.x, this.position.y),
      anchor("center"),
      area(),
      z(2),
      {
        id: "playerSync",
        update() {
          this.pos = vec2(self.position.x, self.position.y);
          this.angle = (self.angle * 180) / Math.PI;
        },
        draw() {
          // draw a facing line
          const dir = vec2(Math.cos(self.angle), Math.sin(self.angle)).scale(half);
          drawLine(vec2(0,0), dir, { width: 3 });
        }
      },
      "player",
    ];
  }

  getState() {
    return { ...super.getState(), hp: this.hp };
  }
}
