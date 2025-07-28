# Redweb Multiplayer – Redsea MVP

**Redsea** is a plug-and-play multiplayer backend engine built on top of [RedWeb](https://www.npmjs.com/package/redweb), offering dynamic WebSocket routing, modular handler logic, and ready-to-extend multiplayer support for indie game developers.

This repository serves as an MVP demo showcasing RedWeb’s architecture in a multiplayer context — with real-time lobby management, messaging, and match logic, all using simple JSON over WebSockets.

---

## 🚀 Features

- 🔌 **WebSocket server** via RedWeb
- 🧱 **Modular message handling** with RedWeb handlers
- 🎮 **Player registry** with join/leave hooks and broadcasting
- ⏱ **Match service** with start/end conditions (auto-timer)
- 🧠 Built-in event-driven architecture using `SocketRegistry`
- 🛠 Extendable: add your own logic with clean base classes

---

## 📦 Installation

```bash
git clone https://github.com/lakam99/Redweb-Multiplayer.git
cd Redweb-Multiplayer
npm install
node index.js
````

Server runs at `ws://localhost:3000/`

---

## 🧠 Architecture Overview

### Core Files

| File                            | Purpose                                                              |
| ------------------------------- | -------------------------------------------------------------------- |
| `index.js`                      | Bootstraps the RedWeb `SocketServer`                                 |
| `DefaultRoute.js`               | Declares the root WebSocket path `/` and loads all handlers/services |
| `handlers/JoinHandler.js`       | Handles player joining and registry addition                         |
| `handlers/ChatHandler.js`       | Sends chat messages to all other clients                             |
| `handlers/MoveHandler.js`       | Updates and broadcasts player position/vector                        |
| `handlers/MatchHandler.js`      | Emits messages like match status or win conditions                   |
| `services/MatchService.js`      | Autonomous logic: match start/end when max players are reached       |
| `handlers/GetPlayersHandler.js` | Sends sanitized list of players back to the requesting socket        |
| `handlers/PlayerRegistry.js`    | Tracks connected players using event-driven logic                    |

---

## 📡 WebSocket Message Types

Every handler listens for a `type` field in incoming messages.

### 📥 Join (Minimum Payload)

```json
{ "type": "join" }
```

Optionally include:

```json
{
  "type": "join",
  "id": "optional-custom-id",
  "position": { "x": 0, "y": 0, "z": 0 },
  "vec": { "x": 1, "y": 0, "z": 0 }
}
```

> If required fields are missing, the handler will return a meaningful error. Otherwise, defaults like a generated ID or (0,0,0) spawn position may be used.

---

### 💬 Chat

```json
{
  "type": "chat",
  "message": "Hello everyone!"
}
```

---

### 🎮 Move

```json
{
  "type": "move",
  "position": { "x": 5, "y": 0, "z": 2 },
  "vector": { "x": 0, "y": 0, "z": 1 }
}
```

---

### 🧍 Get Players

```json
{ "type": "getPlayers" }
```

Returns list of currently joined players.

---

### 🛑 Disconnect

```json
{ "type": "disconnect" }
```

Manually trigger player removal (usually automatic on socket close).

---

## 🧩 Extendability

Handlers extend `BaseHandler` and can register to a `type` like this:

```js
class MyHandler extends BaseHandler {
    constructor() {
        super('custom_event'); // Listens for { type: "custom_event" }
    }

    onMessage(socket, message) {
        // Your logic here
        socket.sendJson({ type: "response", msg: "Handled!" });
    }
}
```

Services extend `SocketService` and can run game loops or timers:

```js
class MyGameLoop extends SocketService {
    constructor() {
        super('myLoop', 1000); // Run every second
    }

    onInit(route) {
        // Access clients, registries, etc.
    }

    onTick() {
        // Game logic
    }
}
```

---

## 🧠 Behind the Scenes

### Player Registry

Backed by `SocketRegistry`, it provides:

* Event-driven lifecycle (`playerJoined`, `playerLeft`, `maxPlayersReached`)
* Max player limits
* Player broadcasting
* Join/leave validation hooks

### Match Service

Starts a match timer when lobby is full. Emits `matchStarted` and `matchOver` messages via `MatchHandler`. Can be replaced or extended to support your own win conditions, rounds, etc.

---

## 📈 Roadmap

* [ ] Route-based lobby IDs (e.g. `/lobby/:id`)
* [ ] Lobby timeout cleanup
* [ ] Sample HTML multiplayer client
* [ ] Built-in matchmaking & queuing
* [ ] Redis-backed persistence

---

## 🧠 Philosophy

Redsea helps you **prototype multiplayer games fast**, using readable, clean JavaScript with full control. No vendor lock-in, no giant SDKs, no mystery boxes.

---

## 🛠 Author

Developed by [@lakam99](https://github.com/lakam99)
Powered by [RedWeb](https://www.npmjs.com/package/redweb)
