// client_player.js
import { PLAYER_SPEED, SIZE, MAX_HP } from "./config.js";
import { ClientEntity } from "./ClientEntity.js";

export class ClientPlayer extends ClientEntity {
  constructor(id, position, angle = 0, hp = MAX_HP) {
    super(id, position, angle);
    this.hp = hp;
    this.size = SIZE;
    this.speed = PLAYER_SPEED;
  }

  updateHP(hp) {
    this.hp = hp;
    this.sendUpdate("player_hit");
  }

  shoot() {
    this.sendUpdate("shoot");
  }

  getState() {
    return {
      ...super.getState(),
      hp: this.hp,
    };
  }
}
