// net.js
import { WS_URL } from "./config.js";

const ws = new WebSocket(WS_URL);
const listeners = new Map();

export function send(type, payload = {}) {
  if (ws.readyState === 1) ws.send(JSON.stringify({ type, ...payload }));
}

export function on(type, cb) {
  listeners.set(type, cb);
}

ws.addEventListener("message", (e) => {
  const msg = JSON.parse(e.data);
  const cb = listeners.get(msg.type);
  if (cb) cb(msg);
});

export function onOpen(cb) {
  ws.addEventListener("open", cb);
}
