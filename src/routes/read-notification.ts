import { ZodTypeProvider } from "fastify-type-provider-zod";
import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { authenticate } from "../hooks/authenticate";

export async function readNotification(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().patch(
    "/notifications/:id",
    {
      schema: {
        params: z.object({
          id: z.string(),
        }),
        response: {
          200: z.object({
            message: z.string(),
            status: z.boolean(),
            notification: z.object({
              id: z.string(),
              message: z.string(),
              timestamp: z.date(),
              isRead: z.boolean(),
            }),
          }),
        },
      },
      preHandler: [authenticate],
    },
    async (req, res) => {
      const { id } = req.params;

      const notification = await prisma.notification.update({
        where: {
          id,
        },
        data: {
          isRead: true,
        },
      });

      return res.status(200).send({
        message: "Notification read",
        status: true,
        notification,
      });
    }
  );
}
