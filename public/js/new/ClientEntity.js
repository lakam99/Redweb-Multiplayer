// client_entity.js
import Net from "./net.js";

export class ClientEntity {
  constructor(id, position = { x: 0, y: 0 }, angle = 0, vector = { x: 0, y: 0 }) {
    this.id = id;
    this.position = { ...position };
    this.angle = angle;
    this.vector = { ...vector };
  }

  update(deltaTime) {
    this.updatePosition(deltaTime);
  }

  updatePosition(deltaTime) {
    this.position.x += this.vector.x * deltaTime;
    this.position.y += this.vector.y * deltaTime;
  }

  setPosition(pos) {
    this.position = { ...pos };
    this.sendUpdate("move");
  }

  setVector(vec) {
    this.vector = { ...vec };
    this.sendUpdate("move");
  }

  setAngle(rad) {
    this.angle = rad;
    this.sendUpdate("move");
  }

  sendUpdate(type) {
    Net.send(type, this.getState());
  }

  getSpriteComponents() {
    throw new Error("getSprite() must be implemented in subclass");
  }

  getState() {
    return {
      id: this.id,
      position: this.position,
      vector: this.vector,
      angle: this.angle,
    };
  }
} 
