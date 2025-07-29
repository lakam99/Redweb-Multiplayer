// main.js
import kaboom from "https://unpkg.com/kaboom@3000.0.1/dist/kaboom.mjs";
import { PLAYER_SPEED, SIZE, MAX_HP } from "./config.js";
import { radToDeg, lerpVec2, lerp } from "./utils.js";
import { send, on, onOpen } from "./net.js";
import { remotePlayers, remoteBars, ensureRemote, updateRemote, spawnBox, spawnHPBar } from "./entities.js";
import { setupInput } from "./input.js";
import { setupShooting } from "./shooting.js";

kaboom({ background: [15, 15, 25], width: 800, height: 600 });

/* ── Local Player ─────────────────────────── */
const playerId   = crypto.randomUUID();
let   playerHP   = MAX_HP;
const localPlayer    = spawnBox(center(), rgb(80, 180, 255), "player");
const localPlayerBar = spawnHPBar(localPlayer);

/* ── Static Walls ─────────────────────────── */
[
  { x: 150, y: 200, w: 120, h: 20 },
  { x: 500, y: 300, w: 200, h: 20 },
  { x: 300, y: 450, w:  20, h:100 },
].forEach(w => add([
  pos(w.x, w.y), rect(w.w, w.h), color(120,120,120), area(), body({ isStatic: true }), "wall",
]));

/* ── Networking Hooks ─────────────────────── */
on("players_list", ({ players }) => players.forEach(p => ensureRemote(p.id, p.position, p.angle, p.hp)));
on("player_joined", ({ player })   => ensureRemote(player.id, player.position, player.angle, player.hp));
on("player_moved",  ({ player })   => updateRemote(player.id, player.position, player.angle, player.hp));

on("player_hit", ({ id, hp }) => {
  if (id === playerId) {
    playerHP = hp;
    localPlayerBar.width = SIZE * (playerHP / MAX_HP);
  } else if (remoteBars[id]) {
    remoteBars[id].use(rect(SIZE * (hp / MAX_HP), 5));
  }
});

/* Remote bullets arrive via net.js listener */

onOpen(() => send("join", {
  id: playerId,
  position: { x: localPlayer.pos.x, y: localPlayer.pos.y },
  vector:   { x: 0, y: 0 },
  angle:    0,
}));

/* ── Helpers ──────────────────────────────── */
const moveVec = () => vec2(isKeyDown("d") - isKeyDown("a"), isKeyDown("s") - isKeyDown("w")).unit().scale(PLAYER_SPEED);
const faceRad = () => Math.atan2(mousePos().y - localPlayer.pos.y, mousePos().x - localPlayer.pos.x);

function broadcastState(vec, rad) {
  send("move", {
    id:       playerId,
    position: { x: localPlayer.pos.x, y: localPlayer.pos.y },
    vector:   { x: vec.x, y: vec.y },
    angle:    rad,
  });
}

/* ── Main Update Loop ─────────────────────── */
let prevPos = vec2(localPlayer.pos.x, localPlayer.pos.y);

onUpdate(() => {
  const dir = moveVec();
  localPlayer.move(dir.x, dir.y);

  const rad = faceRad();
  localPlayer.angle = radToDeg(rad);

  // Broadcast only if moved
  if (localPlayer.pos.dist(prevPos) > 0) {
    broadcastState(dir, rad);
    prevPos = vec2(localPlayer.pos.x, localPlayer.pos.y);
  }

  // Update local HP bar position / size
  localPlayerBar.pos   = localPlayer.pos.add(vec2(0, -30));
  localPlayerBar.width = SIZE * (playerHP / MAX_HP);

  // Interpolate remote players
  for (const [id, obj] of remotePlayers) {
    const { targetPos, targetRad, hp } = obj.data;
    obj.pos   = lerpVec2(obj.pos, targetPos, 0.25);
    obj.angle = lerp(obj.angle, radToDeg(targetRad), 0.25);
    const bar = remoteBars[id];
    if (bar) {
      bar.pos = obj.pos.add(vec2(0, -30));
      bar.use(rect(SIZE * (hp / MAX_HP), 5));
    }
  }
});

/* ── Modules: Input & Shooting ─────────────── */
setupInput(localPlayer, faceRad, broadcastState);
setupShooting(localPlayer, playerId);
