import { RedwebClient } from 'redweb-client';

export class NetClient {
  constructor(url, options = {}) {
    this.listeners = new Map();
    this.client = new RedwebClient(url, {
      reconnect: {
        enabled: true,
        maxAttempts: 20,
        initialDelayMs: 250,
        maxDelayMs: 10_000,
        factor: 2,
        jitter: 0.2,
      },
      ...options,
    });
    this.client.onStateChange(state => {
      if (state === 'open') this.emit('connected');
      if (state === 'closed') this.emit('disconnected');
    });
    this.client.onAny(message => this.emit(message.type, message));
    this.client.onError(error => this.emit('transport_error', error));
  }

  connect() {
    return this.client.connect();
  }

  on(type, fn) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(fn);
    return () => this.off(type, fn);
  }

  off(type, fn) {
    this.listeners.get(type)?.delete(fn);
  }

  emit(type, value) {
    for (const fn of this.listeners.get(type) ?? []) fn(value);
  }

  send(type, payload = {}) {
    if (this.client.state !== 'open') return false;
    this.client.send(type, payload);
    return true;
  }

  dispose() {
    this.client.dispose();
    this.listeners.clear();
  }
}
