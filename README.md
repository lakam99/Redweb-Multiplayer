# Redweb Multiplayer – Redsea MVP

**Redsea** is a plug-and-play multiplayer backend engine built on top of [RedWeb](https://www.npmjs.com/package/redweb), offering dynamic WebSocket routing and ready-to-extend lobby support for indie game developers.

This repo provides the MVP implementation of Redsea – a multiplayer-ready lobby server with extensible handlers and real-time communication using RedWeb's powerful architecture.

---

## 🚀 Features

- 🔌 WebSocket server via RedWeb
- 🧠 Lobby-based architecture with player tracking
- 🗣 Real-time chat and movement broadcast
- ⚙️ Easily extendable via base class (`LobbyHandler`)
- 🧱 Movement example via `MovementLobbyHandler`
- 🧪 Dev-friendly: join, move, and chat without authentication

---

## 📦 Installation

```bash
git clone https://github.com/lakam99/Redweb-Multiplayer.git
cd Redweb-Multiplayer
npm install
node index.js
````

> Server runs on `ws://localhost:3000/`

---

## 🧠 Architecture Overview

### Core Files:

| File                      | Purpose                                                           |
| ------------------------- | ----------------------------------------------------------------- |
| `index.js`                | Starts the RedWeb socket server on port 3000                      |
| `DefaultRoute.js`         | Registers the root WebSocket path `/` with a lobby handler        |
| `LobbyHandler.js`         | Core lobby engine: handles players, join, chat, etc.              |
| `MovementLobbyHandler.js` | Extends lobby for movement support (`move`, `position`, `vector`) |

---

## 📡 Example Usage

### WebSocket Client Messages

#### Join

```json
{
  "action": "join",
  "id": "optional-custom-id",
  "position": { "x": 0, "y": 0, "z": 0 },
  "vec": { "x": 1, "y": 0, "z": 0 }
}
```

#### Chat

```json
{
  "action": "chat",
  "id": "player-id",
  "message": "Hello everyone!"
}
```

#### Move

```json
{
  "action": "move",
  "position": { "x": 5, "y": 0, "z": 2 },
  "vector": { "x": 0, "y": 0, "z": 1 }
}
```

#### Disconnect

```json
{
  "action": "disconnect",
  "id": "player-id"
}
```

---

## 🧩 Extendability

You can subclass `LobbyHandler` to define custom behavior:

```js
class MyCustomGameHandler extends LobbyHandler {
    onMessage(socket, data) {
        if (data.action === 'custom_event') {
            // Handle your game logic
        } else {
            super.onMessage(socket, data);
        }
    }
}
```

Then bind it in your route definition.

---

## 📈 Roadmap

* [ ] Lobby ID routing (e.g. `/lobby/:id`)
* [ ] Lobby timeout cleanup
* [ ] Built-in reconnection logic
* [ ] Sample HTML multiplayer client
* [ ] Matchmaking & queue system
* [ ] Persistent memory or Redis support

---

## 🧠 Philosophy

Redsea is built to help developers prototype and deploy multiplayer systems with **minimal overhead**, no vendor lock-in, and full control. Build fast, extend freely.

---

## 🛠 Author

Developed by [@lakam99](https://github.com/lakam99) using [RedWeb](https://www.npmjs.com/package/redweb)