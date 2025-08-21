import { FastifyRequest, FastifyReply } from "fastify";
import { getUserByToken } from "../services/auth";

export async function authenticate(req: FastifyRequest, res: FastifyReply) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).send({ message: "Missing token" });

  const token = authHeader.replace("Bearer ", "");
  const user = await getUserByToken(token);
  if (!user)
    return res.status(401).send({ message: "Invalid or expired token" });
}
