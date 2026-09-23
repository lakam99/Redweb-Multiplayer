const { BaseHandler } = require('redweb');
const registry = require('./PlayerRegistry');

class ResumeHandler extends BaseHandler {
  constructor() {
    super('resume');
  }

  onMessage(socket, message) {
    if (registry.getBySocket(socket) || typeof message.session !== 'string' ||
        !/^[0-9a-f-]{36}$/i.test(message.session)) {
      socket.sendJson({ type: 'error', message: 'Invalid resume request' });
      return;
    }
    const player = socket.resumeSession(message.session);
    if (!player) {
      socket.sendJson({ type: 'error', message: 'Session expired or unknown' });
      return;
    }
    const existing = registry.getById(player.id);
    if (existing && existing !== player) {
      socket.sendJson({ type: 'error', message: 'Player ID is already active' });
      return;
    }
    if (existing && player.socket !== socket) player.socket.leaveRoom(player.roomId);
    if (!socket.joinRoom(player.roomId)) {
      socket.sendJson({ type: 'error', message: 'Room is full' });
      return;
    }
    player.socket = socket;
    if (!existing && !registry.add(player)) {
      socket.leaveRoom(player.roomId);
      socket.sendJson({ type: 'error', message: 'Resume rejected' });
      return;
    }
    player.send('joined', { id: player.id, roomId: player.roomId, session: message.session, resumed: true });
    registry.broadcast({ type: 'player_joined', player: player.getSanitized() }, socket, player.roomId);
  }
}

module.exports = { ResumeHandler };
