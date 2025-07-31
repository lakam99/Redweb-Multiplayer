// entity_manager.js

import { ENTITY_TYPES } from "./config.js";

export class EntityManager {
  constructor() {
    this.entities = new Map(); // id → instance
    this.types = ENTITY_TYPES; // type → class constructor
  }

  spawn(type, id, data) {
    const Constructor = this.types[type];
    if (!Constructor) throw new Error(`No constructor found for type: ${type}`);
    const entity = new Constructor(id, data);
    this.entities.set(id, entity);
    return entity;
  }

  despawn(id) {
    const entity = this.entities.get(id);
    if (entity?.destroy) entity.destroy();
    this.entities.delete(id);
  }

  get(id) {
    return this.entities.get(id);
  }

  has(id) {
    return this.entities.has(id);
  }

  updateAll(dt) {
    for (const entity of this.entities.values()) {
      if (typeof entity.update === "function") {
        entity.update(dt);
      }
    }
  }
}
