// entities.js
import { SIZE } from "./config.js";
import { radToDeg } from "./utils.js";

export const remotePlayers = new Map();

export function spawnBox(position, col, tag, isStatic = false) {
  return add([
    pos(position),
    rect(SIZE, SIZE),
    color(col),
    area(),
    body({ isStatic }),
    anchor("center"),
    rotate(0),
    tag,
    z(2),
  ]);
}

export function spawnHPBar(target) {
  return add([
    pos(target.pos.add(vec2(0, -30))),
    rect(SIZE, 5),
    color(255, 60, 60),
    anchor("center"),
    z(3),
  ]);
}

export function ensureRemote(id, pos, rad = 0) {
  if (remotePlayers.has(id)) return;
  const box = spawnBox(vec2(pos.x, pos.y), rgb(rand(50,255), rand(50,255), rand(50,255)), "remote", true);
  box.angle = radToDeg(rad);
  box.data = { targetPos: vec2(pos.x, pos.y), targetRad: rad };
  remotePlayers.set(id, box);
}

export function updateRemote(id, pos, rad) {
  const rp = remotePlayers.get(id);
  if (!rp) return;
  rp.data.targetPos = vec2(pos.x, pos.y);
  rp.data.targetRad = rad;
}
