import { ZodTypeProvider } from "fastify-type-provider-zod";
import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { authenticate } from "../hooks/authenticate";

export async function getDevices(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/devices",
    {
      schema: {
        response: {
          200: z.object({
            message: z.string(),
            status: z.boolean(),
            devices: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
                deviceId: z.number(),
                status: z.boolean(),
                lastUpdate: z.date().nullable(),
              })
            ),
          }),
          401: z.object({
            message: z.string(),
            status: z.boolean(),
          }),
        },
      },
      preHandler: [authenticate],
    },
    async (req, res) => {
      const devices = await prisma.device.findMany({});

      if (devices.length === 0) {
        return res
          .status(400)
          .send({ message: "No devices found", status: false });
      }

      return res.status(200).send({
        message: "Found devices",
        status: true,
        devices,
      });
    }
  );
}
