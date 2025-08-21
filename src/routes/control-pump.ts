import { FastifyInstance } from "fastify";
import { z } from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { turnPumpOn, turnPumpOff } from "../services/pump-controller";
import { authenticate } from "../hooks/authenticate";

export async function controlPump(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/pumps",
    {
      schema: {
        body: z.object({
          action: z.enum(["ON", "OFF"]),
          deviceId: z.number(),
        }),
        response: {
          200: z.object({
            message: z.string(),
            status: z.boolean(),
          }),
        },
      },
      preHandler: [authenticate],
    },
    async (req, res) => {
      const { action, deviceId } = req.body;

      if (action === "ON") turnPumpOn(deviceId);
      if (action === "OFF") turnPumpOff(deviceId);

      return res
        .status(200)
        .send({ status: true, message: "Pump action executed" });
    }
  );
}
