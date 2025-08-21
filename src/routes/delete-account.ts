import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../lib/prisma";
import { authenticate } from "../hooks/authenticate";

export async function deleteAccount(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .delete("/accounts", { preHandler: [authenticate] }, async (req, res) => {
      const token = await prisma.sessionToken.deleteMany();

      if (token.count <= 0) {
        return res.status(400).send({
          status: false,
          message: "Error deleting token",
        });
      }

      const account = await prisma.user.deleteMany();

      if (account.count <= 0) {
        return res.status(400).send({
          status: false,
          message: "Error deleting account",
        });
      }

      return res.status(204).send();
    });
}
