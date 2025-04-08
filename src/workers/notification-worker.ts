import { PrismaClient } from "@prisma/client";
import { connectRabbitMQ } from "../services/rabbitmq";
import { broadcastNotification } from "../services/websocket";

const prisma = new PrismaClient();

export async function startNotificationWorker() {
  const channel = await connectRabbitMQ();
  await channel.assertQueue("notifications", { durable: true });
  console.log("🚀 notification worker started");

  channel.consume(
    "notifications",
    async (msg: { content: { toString: () => string } }) => {
      if (!msg) return;

      const { type, message, wsType } = JSON.parse(msg.content.toString());
      console.log(`🔔 new notification: ${type} - ${message} - ${wsType}`);

      await prisma.notification.create({
        data: { type, message },
      });

      broadcastNotification({ type, message, wsType });

      channel.ack(msg);
    }
  );
}
