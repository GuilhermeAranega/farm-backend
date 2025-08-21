import { FastifyInstance } from "fastify";
import { z } from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../lib/prisma";
import { hashPassword, createSession } from "../services/auth";

export async function createAccount(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/accounts",
    {
      schema: {
        body: z.object({
          name: z.string(),
          email: z.string().email(),
          password: z.string().min(6),
        }),
        response: {
          200: z.object({
            message: z.string(),
            status: z.boolean(),
            accountId: z.string(),
            token: z.string(),
          }),
          400: z.object({
            message: z.string(),
            status: z.boolean(),
          }),
        },
      },
    },
    async (req, res) => {
      const { name, email, password } = req.body;

      const account = await prisma.user.findFirst();

      if (account != null) {
        return res.status(400).send({
          status: false,
          message: "An account already exists",
        });
      }

      const passwordHash = await hashPassword(password);

      const createdUser = await prisma.user.create({
        data: {
          username: name,
          email,
          passwordHash,
        },
      });

      const token = await createSession(createdUser.id);

      return res.status(200).send({
        status: true,
        message: "Account created successfully",
        accountId: createdUser.id,
        token,
      });
    }
  );
}
