// net.js (Singleton WebSocket Client)

class NetClient {
  constructor() {
    this.socket = null;
    this.listeners = {};
  }

  connect(url) {
    this.socket = new WebSocket(url);

    this.socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (this.listeners[msg.type]) {
          this.listeners[msg.type].forEach(fn => fn(msg));
        }
      } catch (err) {
        console.error("Failed to parse WebSocket message:", event.data);
      }
    };
  }

  send(type, data = {}) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, ...data }));
    } else {
      console.warn("WebSocket not open. Unable to send:", type);
    }
  }

  on(type, callback) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(callback);
  }

  onOpen(callback) {
    if (!this.socket) return;
    this.socket.onopen = callback;
  }

  getSocket() {
    return this.socket;
  }
}

const Net = new NetClient();
export default Net;
