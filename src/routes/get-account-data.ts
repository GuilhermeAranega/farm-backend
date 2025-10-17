import { ZodTypeProvider } from "fastify-type-provider-zod";
import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { authenticate } from "../hooks/authenticate";

export async function getAccountData(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/accounts",
    {
      schema: {
        response: {
          200: z.object({
            message: z.string(),
            status: z.boolean(),
            account: z.object({
              id: z.string(),
              username: z.string(),
              email: z.string().email(),
              createdAt: z.date().nullable(),
            }),
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
      const account = await prisma.user.findFirst({});

      if (!account) {
        return res
          .status(400)
          .send({ message: "No account found", status: false });
      }

      return res.status(200).send({
        message: "Found account data",
        status: true,
        account: {
          id: account.id,
          username: account.username,
          email: account.email,
          createdAt: account.createdAt,
        },
      });
    }
  );
}
