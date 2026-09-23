const test = require('node:test');
const assert = require('node:assert/strict');
const WebSocket = require('ws');
const { createApp } = require('../index');

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

test('Redweb serves HTTP, isolated rooms, match events, and resumable players', async () => {
  const app = createApp({ port: 0, signals: false, logger: { log() {}, error() {} } });
  const clients = [];
  try {
    await app.run();
    const registry = app.sockets.routes[0].registry;
    const port = app.server.address().port;
    const health = await fetch(`http://127.0.0.1:${port}/health`);
    assert.deepEqual(await health.json(), { ready: true });
    const page = await fetch(`http://127.0.0.1:${port}/`);
    assert.equal(page.status, 200);
    assert.match(await page.text(), /Redsea Shooter/);
    const url = `ws://127.0.0.1:${port}/match`;
    const first = new WebSocket(url);
    clients.push(first);
    await new Promise(resolve => first.once('open', resolve));
    const firstJoined = waitForMessage(first, 'joined');
    first.send(JSON.stringify({ type: 'join', id: 'first' }));
    assert.equal((await firstJoined).id, 'first');

    const second = new WebSocket(url);
    clients.push(second);
    await new Promise(resolve => second.once('open', resolve));
    const secondJoined = waitForMessage(second, 'joined');
    const playerJoined = waitForMessage(first, 'player_joined');
    const started = waitForMessage(first, 'match_started');
    second.send(JSON.stringify({ type: 'join', id: 'second' }));
    const secondIdentity = await secondJoined;
    assert.equal(secondIdentity.id, 'second');
    assert.match(secondIdentity.session, /^[0-9a-f-]{36}$/);
    assert.equal((await playerJoined).player.id, 'second');

    // A match starts when the second player joins the same room.
    assert.equal((await started).roomId, 'lobby');

    const players = waitForMessage(second, 'players_list');
    second.send(JSON.stringify({ type: 'get-players' }));
    assert.deepEqual((await players).players.map(player => player.id).sort(), ['first', 'second']);

    const moved = waitForMessage(first, 'player_moved');
    second.send(JSON.stringify({ type: 'move', position: { x: 4, y: 5 } }));
    assert.equal((await moved).player.position.x, 4);

    const invalid = waitForMessage(second, 'error');
    second.send(JSON.stringify({ type: 'move', position: { x: 'bad', y: 5 } }));
    assert.equal((await invalid).message, 'Invalid movement');

    const other = new WebSocket(url);
    clients.push(other);
    await new Promise(resolve => other.once('open', resolve));
    const otherJoined = waitForMessage(other, 'joined');
    other.send(JSON.stringify({ type: 'join', id: 'other', roomId: 'side' }));
    assert.equal((await otherJoined).roomId, 'side');
    const otherPlayers = waitForMessage(other, 'players_list');
    other.send(JSON.stringify({ type: 'get-players' }));
    assert.deepEqual((await otherPlayers).players.map(player => player.id), ['other']);

    let leaked = false;
    const detectLeak = event => {
      if (JSON.parse(event.data).type === 'chat') leaked = true;
    };
    other.addEventListener('message', detectLeak);
    const chat = waitForMessage(first, 'chat');
    second.send(JSON.stringify({ type: 'chat', message: 'lobby only' }));
    assert.equal((await chat).player.message, 'lobby only');
    await new Promise(resolve => setTimeout(resolve, 30));
    other.removeEventListener('message', detectLeak);
    assert.equal(leaked, false);

    const left = waitForMessage(first, 'player_left');
    const over = waitForMessage(first, 'match_over');
    second.close();
    assert.equal((await left).id, 'second');
    assert.equal((await over).roomId, 'lobby');
    assert.equal(registry.getById('second'), null);

    const resumedSocket = new WebSocket(url);
    clients.push(resumedSocket);
    await new Promise(resolve => resumedSocket.once('open', resolve));
    const resumed = waitForMessage(resumedSocket, 'joined');
    const rejoined = waitForMessage(first, 'player_joined');
    resumedSocket.send(JSON.stringify({ type: 'resume', session: secondIdentity.session }));
    const resumedIdentity = await resumed;
    assert.equal(resumedIdentity.id, 'second');
    assert.equal(resumedIdentity.resumed, true);
    assert.equal((await rejoined).player.id, 'second');

    const takeoverSocket = new WebSocket(url);
    clients.push(takeoverSocket);
    await new Promise(resolve => takeoverSocket.once('open', resolve));
    const takeover = waitForMessage(takeoverSocket, 'joined');
    takeoverSocket.send(JSON.stringify({ type: 'resume', session: secondIdentity.session }));
    assert.equal((await takeover).resumed, true);
    assert.equal(registry.getById('second').socket !== resumedSocket, true);
    assert.equal(registry.inRoom('lobby').length, 2);
  } finally {
    for (const client of clients) client.close();
    await app.shutdown();
  }
});

test('two application instances keep player registries and sessions separate', async () => {
  const options = { port: 0, signals: false, logger: { log() {}, error() {} } };
  const firstApp = createApp(options);
  const secondApp = createApp(options);
  const sockets = [];
  try {
    await Promise.all([firstApp.run(), secondApp.run()]);
    assert.notStrictEqual(firstApp.sockets.routes[0].registry, secondApp.sockets.routes[0].registry);
    for (const app of [firstApp, secondApp]) {
      const socket = new WebSocket(`ws://127.0.0.1:${app.server.address().port}/match`);
      sockets.push(socket);
      await new Promise(resolve => socket.once('open', resolve));
      const joined = waitForMessage(socket, 'joined');
      socket.send(JSON.stringify({ type: 'join', id: 'same' }));
      assert.equal((await joined).id, 'same');
    }
    assert.equal(firstApp.sockets.routes[0].registry.count(), 1);
    assert.equal(secondApp.sockets.routes[0].registry.count(), 1);
    sockets[0].close();
    await firstApp.shutdown();
    const players = waitForMessage(sockets[1], 'players_list');
    sockets[1].send(JSON.stringify({ type: 'get-players' }));
    assert.deepEqual((await players).players.map(player => player.id), ['same']);
  } finally {
    for (const socket of sockets) socket.close();
    await Promise.all([firstApp.shutdown(), secondApp.shutdown()]);
  }
});
