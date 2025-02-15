import WebSocket from "ws";

const wss = new WebSocket.Server({ port: 8080 });
const clients = new Set<WebSocket>();

wss.on("connection", (ws) => {
  clients.add(ws);
  console.log("✅ client connected");

  ws.on("close", () => {
    clients.delete(ws);
    console.log("❌ client disconnected");
  });
});

export function broadcastNotification(notification: {
  type: string;
  message: string;
}) {
  for (const client of clients) {
    client.send(JSON.stringify(notification));
  }
}
