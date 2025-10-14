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
import { getAllEnergyMetrics } from "./routes/get-all-energy-metrics";
import { readAllNotifications } from "./routes/read-all-notifications";
import { controlPump } from "./routes/control-pump";
import { getReportData } from "./routes/get-data-for-report";
import { changeTime } from "./routes/change-time";

import { startNotificationWorker } from "./workers/notification-worker";

import "./services/mqtt-broker";
import "./services/mqtt-subscriber";
import { createAccount } from "./routes/create-account";
import { loginAccount } from "./routes/login-account";
import { deleteAccount } from "./routes/delete-account";

export const app = fastify().withTypeProvider<ZodTypeProvider>();
app.register(cors, {
  origin: "*",
  methods: ["GET", "POST", "PATCH", "DELETE"],
});
const httpServer = createServer((req, res) => {
  app.server.emit("request", req, res);
});

setupWebSocket(httpServer);

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(getAllEnvironmentalMetrics);
app.register(getEnvironmentalMetricByDate);
app.register(getReportData);

app.register(getAllEnergyMetrics);

app.register(getNotifications);
app.register(readNotification);
app.register(hasUnreadNotifications);
app.register(readAllNotifications);

app.register(controlPump);
app.register(changeTime);

app.register(createAccount);
app.register(loginAccount);
app.register(deleteAccount);

const PORT = parseInt(process.env.PORT || "3333");

const start = async () => {
  try {
    await app.ready();
    httpServer.listen(PORT, () => {
      console.log("🚀 Servidor rodando em http://localhost:" + PORT);
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

startNotificationWorker();
start();
