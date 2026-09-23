// Net.js (Singleton WebSocket Client)

class NetClient {
  constructor() {
    this.socket = null;
    this.listeners = new Map(); // type -> Set(callback)
    this._url = null;
    this._retryTimer = null;
  }

  connect(url) {
    this._url = url;
    if (this.socket && this.socket.readyState <= WebSocket.OPEN) return;
    const socket = new WebSocket(url);
    this.socket = socket;

    socket.onmessage = (event) => {
      let msg;
      try { msg = JSON.parse(event.data); } catch { return; }
      this.emit(msg.type, msg);
    };

    return new Promise((resolve, reject) => {
      socket.onopen = () => {
        this.emit('connected');
        resolve();
      };
      socket.onerror = () => reject(new Error('WebSocket connection failed'));
      socket.onclose = () => {
        if (this.socket !== socket) return;
        this.emit('disconnected');
        clearTimeout(this._retryTimer);
        this._retryTimer = setTimeout(() => this.connect(this._url)?.catch(() => {}), 1500);
      };
    });
  }

  emit(type, message) {
    const list = this.listeners.get(type);
    if (list) for (const fn of list) try { fn(message); } catch (error) { console.error(error); }
  }

  on(type, fn) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(fn);
    return () => this.off(type, fn);
  }

  off(type, fn) {
    const s = this.listeners.get(type);
    if (s) s.delete(fn);
  }

  send(type, payload = {}) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
    this.socket.send(JSON.stringify({ type, ...payload }));
  }
}

const Net = new NetClient();
export default Net;
