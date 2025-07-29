// main.js
import kaboom from "https://unpkg.com/kaboom@3000.0.1/dist/kaboom.mjs";
import { WS_URL, PLAYER_SPEED, BULLET_SPEED, SIZE, MAX_HP } from "./config.js";
import { radToDeg, lerpAngle } from "./utils.js";
import { send, on, onOpen } from "./net.js";
import { spawnBox, spawnHPBar, ensureRemote, updateRemote, remotePlayers } from "./entities.js";

kaboom({ global: true, background: [15, 15, 25], width: 800, height: 600 });

let playerHP = MAX_HP;
const player    = spawnBox(center(), rgb(80,180,255), "player");
const playerBar = spawnHPBar(player);

[{ x: 150, y: 200, w: 120, h: 20 }, { x: 500, y: 300, w: 200, h: 20 }, { x: 300, y: 450, w:  20, h:100 }].forEach(w => add([
  pos(w.x, w.y), rect(w.w, w.h), area(), body({ isStatic: true }), color(120,120,120), "wall",
]));

let prevPos = vec2(player.pos.x, player.pos.y);
let prevRad = 0;

function broadcastState(vec, rad) {
  send("move", {
    position: { x: player.pos.x, y: player.pos.y },
    vector:   { x: vec.x, y: vec.y },
    angle:    rad,
  });
}

onUpdate(() => {
  const dir = vec2(isKeyDown("d") - isKeyDown("a"), isKeyDown("s") - isKeyDown("w")).unit().scale(PLAYER_SPEED);
  player.move(dir.x, dir.y);
  playerBar.pos   = player.pos.add(vec2(0,-30));
  playerBar.width = SIZE * (playerHP / MAX_HP);

  const moved = player.pos.dist(prevPos) > 0;
  if (moved) {
    broadcastState(dir, prevRad);
    prevPos = vec2(player.pos.x, player.pos.y);
  }

  remotePlayers.forEach(box => {
    if (!box.data) return;
    box.pos = box.pos.lerp(box.data.targetPos, 0.15);
    box.angle = radToDeg(lerpAngle(box.angle * Math.PI/180, box.data.targetRad, 0.2));
  });
});

onMouseMove(() => {
  const rad = Math.atan2(mousePos().y - player.pos.y, mousePos().x - player.pos.x);
  player.angle = radToDeg(rad);
  prevRad = rad;
  const dir = vec2(isKeyDown("d") - isKeyDown("a"), isKeyDown("s") - isKeyDown("w")).unit().scale(PLAYER_SPEED);
  broadcastState(dir, rad);
});

onKeyPress(["w","a","s","d"], () => broadcastState(vec2(isKeyDown("d") - isKeyDown("a"), isKeyDown("s") - isKeyDown("w")).unit().scale(PLAYER_SPEED), prevRad));
onKeyRelease(["w","a","s","d"], () => broadcastState(vec2(0,0), prevRad));

onClick(() => {
  const dir = mousePos().sub(player.pos).unit();
  const bullet = add([
    pos(player.pos), move(dir, BULLET_SPEED), circle(8), outline(1), color(255,255,255), area(), anchor("center"), "bullet",
  ]);
  bullet.onCollide("wall", () => destroy(bullet));
});

onUpdate("bullet", b => {
  const { x, y } = b.pos;
  if (x < 0 || x > width() || y < 0 || y > height()) destroy(b);
});

on("players_list", msg => msg.players.forEach(p => ensureRemote(p.id, p.position, p.angle)));
on("player_joined", msg => ensureRemote(msg.player.id, msg.player.position, msg.player.angle));
on("player_moved",  msg => updateRemote(msg.player.id, msg.player.position, msg.player.angle));

onOpen(() => send("join", { id: crypto.randomUUID(), position: { x: center().x, y: center().y }, vector: { x: 0, y: 0 }, angle: 0 }));
