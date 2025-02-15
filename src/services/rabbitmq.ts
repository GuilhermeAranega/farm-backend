import amqplib from "amqplib";

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";

let connection: amqplib.Connection;
let channel: amqplib.Channel;

export async function connectRabbitMQ() {
  if (!connection) {
    connection = await amqplib.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    console.log("✅ Conectado ao RabbitMQ!");
  }
  return channel;
}

export async function sendToQueue(queue: string, message: object) {
  const ch = await connectRabbitMQ();
  ch.assertQueue(queue, { durable: true });
  ch.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });
}

export async function consumeFromQueue(
  queue: string,
  callback: (msg: amqplib.ConsumeMessage | null) => void
) {
  const ch = await connectRabbitMQ();
  ch.assertQueue(queue, { durable: true });
  ch.consume(queue, callback, { noAck: false });
}
