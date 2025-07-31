// client_bullet.js
import { ClientEntity } from "./client_entity.js";

export class ClientBullet extends ClientEntity {
  constructor(id, position, direction, speed = 400) {
    super(id, position, 0, direction);
    this.speed = speed;
    this.isAlive = true;
  }

  update(dt) {
    if (!this.isAlive) return;
    super.update(dt);
  }

  destroy() {
    this.isAlive = false;
  }

  getState() {
    return {
      ...super.getState(),
    };
  }
}
