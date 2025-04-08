import fastify from "fastify";

import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";

import cors from "@fastify/cors";
import { createServer } from "http";
import { setupWebSocket } from "./services/websocket";

// ? Routes
import { getAllEnvironmentalMetrics } from "./routes/get-all-environmental-metrics";
import { getEnvironmentalMetricByDate } from "./routes/get-environmental-metric-by-date";
import { getNotifications } from "./routes/get-notifications";
import { readNotification } from "./routes/read-notification";
import { hasUnreadNotifications } from "./routes/has-unread-notifications";
import { generateReport } from "./routes/generate-report";
import { getAllEnergyMetrics } from "./routes/get-all-energy-metrics";
import { readAllNotifications } from "./routes/read-all-notifications";
import { startNotificationWorker } from "./workers/notification-worker";

export const app = fastify().withTypeProvider<ZodTypeProvider>();
app.register(cors, { origin: "*", methods: ["GET", "POST", "PATCH"] });
const httpServer = createServer((req, res) => {
  app.server.emit("request", req, res);
});

setupWebSocket(httpServer);

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(getAllEnvironmentalMetrics);
app.register(getEnvironmentalMetricByDate);

app.register(getAllEnergyMetrics);

app.register(getNotifications);
app.register(readNotification);
app.register(hasUnreadNotifications);
app.register(readAllNotifications);

app.register(generateReport);

const PORT = parseInt(process.env.PORT || "3333");

const start = async () => {
  try {
    await app.ready(); // garante que tudo está registrado
    httpServer.listen(PORT, () => {
      console.log("🚀 Servidor rodando em http://localhost:3333");
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

startNotificationWorker();
start();
