// main.js
import kaboom from "https://unpkg.com/kaboom@3000.0.1/dist/kaboom.mjs";
import { PLAYER_SPEED, BULLET_SPEED, SIZE, MAX_HP } from "./config.js";
import { radToDeg, lerpAngle, lerpVec2, lerp } from "./utils.js";
import { send, on, onOpen } from "./net.js";
import { remotePlayers, remoteBars, ensureRemote, updateRemote, spawnBox, spawnHPBar } from "./entities.js";
import { spawnBullet, handleBulletCollision } from "./bullet.js";

kaboom({ background: [15, 15, 25], width: 800, height: 600 });

// Local player setup
let playerHP = MAX_HP;
const localPlayer    = spawnBox(center(), rgb(80,180,255), "player");
const localPlayerBar = spawnHPBar(localPlayer);

// Unique ID
const playerId = crypto.randomUUID();

// Walls
[
  { x: 150, y: 200, w: 120, h: 20 },
  { x: 500, y: 300, w: 200, h: 20 },
  { x: 300, y: 450, w: 20,  h: 100 },
].forEach(w => add([
  pos(w.x, w.y), rect(w.w, w.h), color(120,120,120), area(), body({ isStatic: true }), "wall",
]));

// Networking
on("players_list", msg => msg.players.forEach(p => ensureRemote(p.id, p.position, p.angle, p.hp)));
on("player_joined", msg => ensureRemote(msg.player.id, msg.player.position, msg.player.angle, msg.player.hp));
on("player_moved",  msg => updateRemote(msg.player.id, msg.player.position, msg.player.angle, msg.player.hp));

onOpen(() => send("join", {
  id: playerId,
  position: { x: localPlayer.pos.x, y: localPlayer.pos.y },
  vector:   { x: 0, y: 0 },
  angle:    0,
}));

// Movement / interpolation
let prevPos = vec2(localPlayer.pos.x, localPlayer.pos.y);
let prevRad = 0;
function broadcastState(vec, rad) {
  send("move", {
    id: playerId,
    position: { x: localPlayer.pos.x, y: localPlayer.pos.y },
    vector:   { x: vec.x, y: vec.y },
    angle:    rad,
  });
}

onUpdate(() => {
  const dir = vec2(isKeyDown("d") - isKeyDown("a"), isKeyDown("s") - isKeyDown("w")).unit().scale(PLAYER_SPEED);
  localPlayer.move(dir.x, dir.y);
  localPlayerBar.pos   = localPlayer.pos.add(vec2(0,-30));
  localPlayerBar.width = SIZE * (playerHP / MAX_HP);

  const moved = localPlayer.pos.dist(prevPos) > 0;
  if (moved) {
    broadcastState(dir, prevRad);
    prevPos = vec2(localPlayer.pos.x, localPlayer.pos.y);
  }

  for (const [id, rp] of remotePlayers) {
    const { targetPos, targetRad, hp } = rp.data;
    if (targetPos && targetRad !== undefined) {
      rp.pos   = lerpVec2(rp.pos, targetPos, 0.25);
      rp.angle = lerp(rp.angle, radToDeg(targetRad), 0.25);
      const bar = remoteBars[id];
      if (bar) {
        bar.pos = rp.pos.add(vec2(0,-30));
        bar.use(rect(SIZE * (hp / MAX_HP), 5));
      }
    }
  }
});

// Mouse rotation & broadcast
onMouseMove(() => {
  const rad = Math.atan2(mousePos().y - localPlayer.pos.y, mousePos().x - localPlayer.pos.x);
  localPlayer.angle = radToDeg(rad);
  prevRad = rad;
  const dir = vec2(isKeyDown("d") - isKeyDown("a"), isKeyDown("s") - isKeyDown("w")).unit().scale(PLAYER_SPEED);
  broadcastState(dir, rad);
});

onKeyPress(["w","a","s","d"], () => {
  const dir = vec2(isKeyDown("d") - isKeyDown("a"), isKeyDown("s") - isKeyDown("w")).unit().scale(PLAYER_SPEED);
  broadcastState(dir, prevRad);
});

onKeyRelease(["w","a","s","d"], () => broadcastState(vec2(0,0), prevRad));

// Shooting
onClick(() => {
  const dirVec = mousePos().sub(localPlayer.pos).unit();
  const bullet = spawnBullet(localPlayer.pos, dirVec, "bullet", playerId);
  send("shoot", {
    shooterId: playerId,
    position:  { x: localPlayer.pos.x, y: localPlayer.pos.y },
    direction: { x: dirVec.x, y: dirVec.y },
  });
  handleBulletCollision(bullet, playerId, () => {
    console.log("Hit: self-render only for now");
  });
});