import { FastifyInstance } from "fastify";
import { z } from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { createSession, validateUser } from "../services/auth";

export async function loginAccount(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/accounts/login",
    {
      schema: {
        body: z.object({
          email: z.string().email(),
          password: z.string().min(6),
        }),
        response: {
          200: z.object({
            name: z.string(),
            email: z.string().email(),
            message: z.string(),
            status: z.boolean(),
            accountId: z.string(),
            token: z.string().optional(),
          }),
          401: z.object({
            message: z.string(),
            status: z.boolean(),
          }),
        },
      },
    },
    async (req, res) => {
      const { email, password } = req.body;

      const user = await validateUser(email, password);

      if (!user) {
        return res
          .status(401)
          .send({ message: "Invalid credentials", status: false });
      }

      const token = await createSession(user.id);

      return res.status(200).send({
        name: user.username,
        email: user.email,
        status: true,
        message: "Login successful",
        accountId: user.id,
        token,
      });
    }
  );
}
