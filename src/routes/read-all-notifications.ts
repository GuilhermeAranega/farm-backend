import { ZodTypeProvider } from "fastify-type-provider-zod";
import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { z } from "zod";

export async function readAllNotifications(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().patch(
    "/notifications/read-all",
    {
      schema: {
        response: {
          200: z.object({
            message: z.string(),
            status: z.boolean(),
          }),
        },
      },
    },
    async (req, res) => {
      await prisma.notification.updateMany({
        data: {
          isRead: true,
        },
      });

      return res.status(200).send({
        message: "Notification read",
        status: true,
      });
    }
  );
}
