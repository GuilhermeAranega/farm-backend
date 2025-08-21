import { ZodTypeProvider } from "fastify-type-provider-zod";
import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { authenticate } from "../hooks/authenticate";

export async function hasUnreadNotifications(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/notifications/unread",
    {
      schema: {
        response: {
          200: z.object({
            hasUnread: z.boolean(),
            message: z.string(),
            status: z.boolean(),
          }),
        },
      },
      preHandler: [authenticate],
    },
    async (req, res) => {
      const hasUnread = await prisma.notification.count({
        where: {
          isRead: false,
        },
      });

      if (hasUnread <= 0) {
        return res.status(200).send({
          message: "Todas as notificações já foram lidas",
          status: true,
          hasUnread: false,
        });
      }

      return res.status(200).send({
        message: "Notificações não lidas",
        status: false,
        hasUnread: true,
      });
    }
  );
}
