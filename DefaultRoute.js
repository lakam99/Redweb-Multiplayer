const { SocketRoute } = require("redweb");
const { JoinHandler } = require("./handlers/JoinHandler");
const { ChatHandler } = require("./handlers/ChatHandler");
const { MoveHandler } = require("./handlers/MoveHandler");
const { MatchService } = require("./services/MatchService");
const { GetPlayersHandler } = require("./handlers/GetPlayersHandler");
const { ShootHandler } = require("./handlers/ShootHandler");
const { ResumeHandler } = require("./handlers/ResumeHandler");
const registry = require("./handlers/PlayerRegistry");

class DefaultRoute extends SocketRoute {
    constructor() {
        super({
            "path": "/match",
            "handlers": [
                JoinHandler,
                ChatHandler,
                MoveHandler,
                GetPlayersHandler,
                ShootHandler,
                ResumeHandler],
            allowDuplicateConnections: true,
            services: [MatchService],
            orderedMessages: true,
            heartbeat: { intervalMs: 30_000, timeoutMs: 10_000 },
            limits: {
                maxConnections: 100,
                maxPendingMessages: 32,
                maxBufferedBytes: 256 * 1024,
                messageRate: { capacity: 30, refillPerSecond: 20 }
            },
            websocketOptions: { maxPayload: 4 * 1024 },
            rooms: { maxRooms: 100, maxMembersPerRoom: 8, maxRoomsPerConnection: 1 },
            sessions: { ttlMs: 30_000, maxSessions: 100 }
        })
    }

    connectionCloseCallback(socket) {
        const player = registry.getBySocket(socket);
        if (player && registry.remove(player)) {
            registry.broadcast({ type: "player_left", id: player.id }, null, player.roomId);
        }
    }
}

module.exports = { DefaultRoute };
