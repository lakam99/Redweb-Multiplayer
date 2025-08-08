// ClientPlayer.js
import { ClientEntity } from "./ClientEntity.js";
import { resolveAABBAgainstWalls, clampToBounds } from "./Collision.js";
import { SMOOTH_POS, SMOOTH_ANGLE } from "./config.js";
import { lerp, lerpAngle } from "./utils.js";
import { PLAYER_SPEED, SIZE } from "./config.js";

export class ClientPlayer extends ClientEntity {
  constructor(id, position = {x: 400, y: 300}, angle = 0, hp = 3) {
    super(id, position, angle);
    this.hp = hp;
    this.speed = PLAYER_SPEED;
    this.size = SIZE;
    // local vs remote
    this.sceneWalls = null;
    // local vs remote
    this.isLocal = false;
    // smoothing targets for remote players
    this.targetPosition = { ...this.position };
    this.targetAngle = this.angle;
    this.targetVector = { ...this.vector };
  }

  setSceneWalls(rects) { this.sceneWalls = rects; }

  update(deltaTime) {
    if (this.isLocal) {
      // LOCAL_COLLISION: integrate + resolve against walls
      const dx = this.vector.x * this.speed * deltaTime;
      const dy = this.vector.y * this.speed * deltaTime;
      // propose move
      let next = { x: this.position.x + dx, y: this.position.y + dy };
      // AABB is centered
      const half = this.size / 2;
      let aabb = { x: next.x - half, y: next.y - half, w: this.size, h: this.size };
      const fixed = resolveAABBAgainstWalls(aabb, this.sceneWalls || []);
      const clamped = clampToBounds({ x: fixed.x + half, y: fixed.y + half }, 800, 600, half);
      this.position = clamped;
      // sprite sync happens in parent draw/update hooks
    } else {
      // Smoothly move toward last known server state
      const t = Math.min(1, deltaTime * SMOOTH_POS);
      this.position.x = lerp(this.position.x, this.targetPosition.x, t);
      this.position.y = lerp(this.position.y, this.targetPosition.y, t);
      this.angle = lerpAngle(this.angle, this.targetAngle, Math.min(1, deltaTime * SMOOTH_ANGLE));
      // No local integration of vector for remotes; server is source of truth
      if (this.spriteRef) {
        this.spriteRef.pos = vec2(this.position.x, this.position.y);
        this.spriteRef.angle = this.angle * 180 / Math.PI;
      }
    }
  }

  setTarget(position, angle, vector) {
    if (position) this.targetPosition = { x: position.x, y: position.y };
    if (typeof angle === "number") this.targetAngle = angle;
    if (vector) this.targetVector = { x: vector.x, y: vector.y };
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
          drawLine({ p1: vec2(0, 0), p2: dir, width: 3 });
        }
      },
      "player",
    ];
  }

  afterSpawn() {
    // Create an HP label that follows this player
    const self = this;
    const yOff = this.size/2 + 14;
    this.hpRef = add([
      text({ text: String(self.hp) }),
      pos(self.position.x, self.position.y - yOff),
      anchor("center"),
      z(3),
      {
        update() {
          // follow player position and hp
          this.pos = vec2(self.position.x, self.position.y - yOff);
          // update text when hp changes
          this.text = String(self.hp);
        },
        destroy() { /* nothing */ }
      }
    ]);
  }

  getState() {
    return { ...super.getState(), hp: this.hp };
  }
}
