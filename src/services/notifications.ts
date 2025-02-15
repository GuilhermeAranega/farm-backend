import { connectRabbitMQ } from "./rabbitmq";

export async function sendNotification(type: string, message: string) {
  const channel = await connectRabbitMQ();
  channel.sendToQueue(
    "notifications",
    Buffer.from(JSON.stringify({ type, message }))
  );
}
