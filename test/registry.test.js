const test = require('node:test');
const assert = require('node:assert/strict');
const { PlayerRegistry } = require('../handlers/PlayerRegistry');
const { validMotion } = require('../handlers/validate');

test('movement validation rejects nonfinite and malformed coordinates', () => {
  assert.equal(validMotion({ position: { x: 1, y: 2 }, vector: { x: 0, y: -1 }, angle: 0 }), true);
  assert.equal(validMotion({ position: { x: '1', y: 2 } }), false);
  assert.equal(validMotion({ vector: { x: Infinity, y: 0 } }), false);
  assert.equal(validMotion({ angle: NaN }), false);
});

test('player registry enforces room capacity and emits base and match events', () => {
  const registry = new PlayerRegistry();
  registry.maxPlayersPerRoom = 2;
  const events = [];
  const added = player => events.push(`added:${player.id}`);
  const removed = player => events.push(`removed:${player.id}`);
  const ready = room => events.push(`ready:${room}`);
  registry.on('added', added);
  registry.on('removed', removed);
  registry.on('roomReady', ready);
  try {
    const player = id => ({ id, roomId: 'test', socket: { id } });
    assert.equal(registry.add(player('a')), true);
    assert.equal(registry.add(player('b')), true);
    assert.equal(registry.add(player('c')), false);
    assert.equal(registry.add(player('a')), false);
    assert.equal(registry.inRoom('test').length, 2);
    assert.equal(registry.remove('a'), true);
    assert.equal(registry.remove('a'), false);
    assert.deepEqual(events, ['added:a', 'added:b', 'ready:test', 'removed:a']);
  } finally {
    registry.off('added', added);
    registry.off('removed', removed);
    registry.off('roomReady', ready);
    registry.items.length = 0;
  }
});
