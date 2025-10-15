import { ZodTypeProvider } from "fastify-type-provider-zod";
import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { authenticate } from "../hooks/authenticate";

export async function updateDeviceName(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().patch(
    "/devices/:id",
    {
      schema: {
        params: z.object({
          id: z.coerce.number().int(),
        }),
        body: z.object({
          name: z.string().max(15),
        }),
        response: {
          200: z.object({
            message: z.string(),
            status: z.boolean(),
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
      const { id } = req.params;
      const { name } = req.body;

      const updatedDevice = await prisma.device.update({
        where: {
          deviceId: id,
        },
        data: {
          name,
        },
      });

      if (!updatedDevice) {
        return res
          .status(400)
          .send({ message: "Device not found", status: false });
      }

      return res.status(200).send({
        message: "Name updated",
        status: true,
      });
    }
  );
}
