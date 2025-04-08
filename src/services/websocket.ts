import WebSocket from "ws";

const clients = new Set<WebSocket>();

export function setupWebSocket(server: any) {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    clients.add(ws);
    console.log("✅ client connected");

    ws.on("close", () => {
      clients.delete(ws);
      console.log("❌ client disconnected");
    });
  });
}

export function broadcastNotification(notification: {
  type: string;
  message: string;
  wsType: string;
}) {
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(notification));
    }
  }
}
