import { FastifyInstance } from "fastify";
import { z } from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../lib/prisma";
import { hashPassword } from "../services/auth";
import { authenticate } from "../hooks/authenticate";

export async function editAccount(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().patch(
    "/accounts",
    {
      schema: {
        body: z.object({
          name: z.string().optional(),
          email: z.string().email().optional(),
          password: z.string().min(6).optional(),
        }),
        response: {
          200: z.object({
            message: z.string(),
            status: z.boolean(),
          }),
          400: z.object({
            message: z.string(),
            status: z.boolean(),
          }),
        },
      },
      preHandler: [authenticate],
    },
    async (req, res) => {
      const { name, email, password } = req.body;

      const data: any = {};
      if (name) data.username = name;
      if (email) data.email = email;
      if (password) data.passwordHash = await hashPassword(password);

      if (Object.keys(data).length === 0) {
        return res.status(400).send({
          status: false,
          message: "No data provided to update",
        });
      }

      await prisma.user.updateMany({
        where: {},
        data,
      });

      return res.status(200).send({
        status: true,
        message: "Account updated successfully",
      });
    }
  );
}
