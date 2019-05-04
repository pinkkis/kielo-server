const host = location.origin.replace(/^http/, "ws");
const ws = new WebSocket(host);
ws.onmessage = msg => console.log(msg.data);