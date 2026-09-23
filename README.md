# Redweb Multiplayer — Redsea

A runnable multiplayer game and an extension of the [Redweb 0.16.4 API examples](https://redweb.magnisolution.com/llms.txt). It uses one Redweb application to serve the browser client and a `/match` WebSocket route on the same port.

## Run

Requires Node.js 18 or newer. Use a maintained LTS release for deployment.

```bash
npm ci
npm start
```

Open `http://localhost:3000/`. Set `PORT` to change the listener. Open `http://localhost:3000/?room=side` in another browser to enter a separate room. `GET /health` reports route readiness. Run `npm test` for unit, HTTP/WebSocket, and Chromium browser checks; `npm run test:coverage` prints Node's coverage report. The browser test uses local Chrome or Edge when available and otherwise skips; set `CHROME_PATH` to select another Chromium executable.

The browser transport uses [redweb-client 0.3.1](https://www.npmjs.com/package/redweb-client) for connection state, message subscriptions, and bounded reconnection. The client build bundles it with Kaboom and the game into the checked-in `public/game.bundle.js`, so starting the app needs no external CDN. Run `npm run build:client` after changing frontend source; `npm test` rebuilds it automatically. The game owns the `join` and `resume` decisions after each connection opens; commands sent while offline are dropped instead of replayed.

The Node coverage report includes `client/Net.mjs` but does not measure all game and rendering modules executed in Chromium. The browser test verifies canvas startup, room join, and keyboard movement; it is an integration check, not a 100% frontend coverage claim.

## Redweb features demonstrated

| API | Use in this project |
| --- | --- |
| `defineApp` | Owns one HTTP/WebSocket listener, startup, signals, and shutdown. `createApp({ port: 0, signals: false })` creates an isolated test listener. |
| `SocketRoute` | Routes `/match` and applies message ordering, heartbeat, message rate, queue, connection, buffer, and payload limits. |
| `BaseHandler` | Dispatches `join`, `resume`, `get-players`, `move`, `chat`, and `shoot` by message `type`. |
| `RoomRegistry` | Caps rooms at 100 and players per room at 8. Room broadcasts keep match traffic isolated. |
| `SessionRegistry` | Holds short-lived player state for reconnects. A server-issued opaque session token expires 30 seconds after disconnect. |
| `SocketService` | Starts a 30-second match when two players enter a room and releases timers on shutdown. |
| `SocketRegistry` | Tracks game players separately from WebSocket connections and emits match lifecycle events. |
| HTTP services | Serves `/health` from the same listener as the static game and WebSocket route. |

The browser connects to `/match` on its current origin and attempts `resume` after a dropped connection. Room state and sessions live in one Node process; they are not durable or shared across workers. The game accepts client movement and shooting as a prototype and does not enforce authoritative physics or player authentication.

## WebSocket protocol

Connect to `ws://localhost:3000/match`. A room name contains 1–32 letters, digits, underscores, or hyphens. Omit `roomId` for the `lobby` room.

```json
{ "type": "join", "roomId": "lobby", "position": { "x": 400, "y": 300 } }
```

The server responds with `{ "type": "joined", "id": "...", "roomId": "lobby", "session": "..." }`. Treat the session as a bearer credential and keep it private. To reconnect within 30 seconds:

```json
{ "type": "resume", "session": "server-issued-token" }
```

After joining, clients can send:

```json
{ "type": "get-players" }
{ "type": "move", "position": { "x": 410, "y": 300 }, "vector": { "x": 1, "y": 0 }, "angle": 0 }
{ "type": "chat", "message": "Hello" }
{ "type": "shoot", "position": { "x": 410, "y": 300 }, "direction": { "x": 1, "y": 0 } }
```

The server emits `players_list`, `player_joined`, `player_left`, `player_moved`, `chat`, `player_shot`, `match_started`, and `match_over` to the relevant room. Invalid inputs receive a `{ "type": "error", "message": "..." }` response. A disconnect removes the player from the active room; resuming restores the player state and announces the return.

## Code map

- `index.js`: deferred application definition and process entry point.
- `DefaultRoute.js`: Redweb socket route and connection cleanup.
- `handlers/`: one class per inbound message type, plus player validation and registry.
- `services/MatchService.js`: route-scoped room timers.
- `public/js/new/`: browser game and rendering modules.
- `client/`: redweb-client adapter and browser entry, built with esbuild into `public/game.bundle.js`.
- `test/`: real browser, HTTP/WebSocket, transport, and registry tests.

Redweb's [application](https://redweb.magnisolution.com/docs/reference/0.16.4/application.md), [socket route](https://redweb.magnisolution.com/docs/reference/0.16.4/api/socketroute.md), [room](https://redweb.magnisolution.com/docs/reference/0.16.4/api/roomregistry.md), and [session](https://redweb.magnisolution.com/docs/reference/0.16.4/api/sessionregistry.md) references explain the underlying APIs.
