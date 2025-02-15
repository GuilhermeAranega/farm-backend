import fastify from "fastify";

import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";

// ? Routes
import { getAllEnvironmentalData } from "./routes/get-all-environmental-data";
import { getEnvironmentalDataByDate } from "./routes/get-environmental-data-by-date";

export const app = fastify().withTypeProvider<ZodTypeProvider>();
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(getAllEnvironmentalData);
app.register(getEnvironmentalDataByDate);

const PORT = parseInt(process.env.PORT || "3333");

app.listen({ port: PORT, host: "0.0.0.0" }).then(() => {
  console.log(`server listening on port ${PORT}`);
});
