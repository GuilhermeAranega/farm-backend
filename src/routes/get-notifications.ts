import { ZodTypeProvider } from "fastify-type-provider-zod";
import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { authenticate } from "../hooks/authenticate";

export async function getNotifications(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/notifications",
    {
      schema: {
        response: {
          200: z.object({
            message: z.string(),
            status: z.boolean(),
            notifications: z.array(
              z.object({
                id: z.string(),
                type: z.string(),
                message: z.string(),
                timestamp: z.date(),
                isRead: z.boolean(),
              })
            ),
          }),
        },
      },
      preHandler: [authenticate],
    },
    async (req, res) => {
      const notifications = await prisma.notification.findMany({
        orderBy: {
          timestamp: "desc",
        },
      });

      return res.status(200).send({
        message: "Found notifications",
        status: true,
        notifications,
      });
    }
  );
}
