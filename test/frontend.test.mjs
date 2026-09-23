import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import WebSocket from 'ws';
import { NetClient } from '../client/Net.mjs';

const require = createRequire(import.meta.url);
const { createApp } = require('../index.js');

function next(net, type) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => { off(); reject(new Error(`Timed out waiting for ${type}`)); }, 2000);
    const off = net.on(type, value => {
      clearTimeout(timeout);
      off();
      resolve(value);
    });
  });
}

test('browser adapter uses Redweb client for join and reconnect resume', async () => {
  const app = createApp({ port: 0, signals: false, logger: { log() {}, error() {} } });
  let net;
  try {
    await app.run();
    const port = app.server.address().port;
    const bundle = await fetch(`http://127.0.0.1:${port}/game.bundle.js`);
    assert.equal(bundle.status, 200);
    assert.ok((await bundle.text()).length > 1000);

    net = new NetClient(`ws://127.0.0.1:${port}/match`, {
      webSocketFactory: url => new WebSocket(url),
      reconnect: { enabled: true, maxAttempts: 3, initialDelayMs: 10,
        maxDelayMs: 20, factor: 1, jitter: 0 },
    });
    assert.equal(net.send('join', { id: 'front' }), false);
    const connected = next(net, 'connected');
    await net.connect();
    await connected;
    const joined = next(net, 'joined');
    assert.equal(net.send('join', { id: 'front' }), true);
    const identity = await joined;
    assert.equal(identity.id, 'front');

    const disconnected = next(net, 'disconnected');
    const reconnected = next(net, 'connected');
    net.client.socket.close(1012, 'test reconnect');
    await disconnected;
    assert.equal(net.send('move', { position: { x: 2, y: 3 } }), false);
    await reconnected;
    const resumed = next(net, 'joined');
    net.send('resume', { session: identity.session });
    assert.equal((await resumed).resumed, true);
  } finally {
    net?.dispose();
    await app.shutdown();
  }
});
