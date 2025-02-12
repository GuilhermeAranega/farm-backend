import fastify from "fastify";

import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";

export const app = fastify().withTypeProvider<ZodTypeProvider>();

const PORT = parseInt(process.env.PORT || "3333");

app.listen({ port: PORT, host: "0.0.0.0" }).then(() => {
  console.log(`server listening on port ${PORT}`);
});
