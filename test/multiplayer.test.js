const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const WebSocket = require('ws');
const { SocketServer } = require('redweb');
const { DefaultRoute } = require('../DefaultRoute');
const registry = require('../handlers/PlayerRegistry');

function waitForMessage(socket, type) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => finish(new Error(`Timed out waiting for ${type}`)), 2000);
    function onMessage(event) {
      const message = JSON.parse(event.data);
      if (message.type === type) finish(null, message);
    }
    function finish(error, message) {
      clearTimeout(timeout);
      socket.removeEventListener('message', onMessage);
      if (error) reject(error);
      else resolve(message);
    }
    socket.addEventListener('message', onMessage);
  });
}

test('Redweb 0.16.4 serves multiplayer messages and removes disconnected players', async () => {
  const server = new SocketServer({ port: 0, routes: [DefaultRoute], logger: { log() {}, error() {} } });
  const clients = [];
  try {
    if (!server.server.listening) await once(server.server, 'listening');
    const url = `ws://127.0.0.1:${server.server.address().port}/`;
    const first = new WebSocket(url);
    clients.push(first);
    await once(first, 'open');
    const firstJoined = waitForMessage(first, 'joined');
    first.send(JSON.stringify({ type: 'join', id: 'first' }));
    assert.equal((await firstJoined).id, 'first');

    const second = new WebSocket(url);
    clients.push(second);
    await once(second, 'open');
    const secondJoined = waitForMessage(second, 'joined');
    const playerJoined = waitForMessage(first, 'player_joined');
    second.send(JSON.stringify({ type: 'join', id: 'second' }));
    assert.equal((await secondJoined).id, 'second');
    assert.equal((await playerJoined).player.id, 'second');

    const players = waitForMessage(second, 'players_list');
    second.send(JSON.stringify({ type: 'get-players' }));
    assert.deepEqual((await players).players.map(player => player.id).sort(), ['first', 'second']);

    const moved = waitForMessage(first, 'player_moved');
    second.send(JSON.stringify({ type: 'move', position: { x: 4, y: 5 } }));
    assert.equal((await moved).player.position.x, 4);

    const left = waitForMessage(first, 'player_left');
    second.close();
    assert.equal((await left).id, 'second');
    assert.equal(registry.getById('second'), null);
  } finally {
    for (const client of clients) client.close();
    await server.shutdown();
    registry.items.length = 0;
  }
});
