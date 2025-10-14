import { FastifyInstance } from "fastify";
import { z } from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { authenticate } from "../hooks/authenticate";
import { changeDeviceTime } from "../services/time-controller";

export async function changeTime(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/devices/change-time",
    {
      schema: {
        querystring: z.object({
          time: z.coerce.number().min(3).max(30),
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
      const { time } = req.query;

      changeDeviceTime(time);

      return res
        .status(200)
        .send({ status: true, message: "Reading time changed" });
    }
  );
}
