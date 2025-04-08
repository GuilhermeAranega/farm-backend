import fastify from "fastify";

import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";

import cors from "@fastify/cors";

// ? Routes
import { getAllEnvironmentalMetrics } from "./routes/get-all-environmental-metrics";
import { getEnvironmentalMetricByDate } from "./routes/get-environmental-metric-by-date";
import { getNotifications } from "./routes/get-notifications";
import { readNotification } from "./routes/read-notification";
import { hasUnreadNotifications } from "./routes/has-unread-notifications";
import { generateReport } from "./routes/generate-report";
import { getAllEnergyMetrics } from "./routes/get-all-energy-metrics";
import { readAllNotifications } from "./routes/read-all-notifications";

export const app = fastify().withTypeProvider<ZodTypeProvider>();
app.register(cors, { origin: "*", methods: ["GET", "POST", "PATCH"] });

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

app.listen({ port: PORT, host: "0.0.0.0" }).then(() => {
  console.log(`server listening on port ${PORT}`);
});
