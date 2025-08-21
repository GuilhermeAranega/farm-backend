import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

export async function validateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.passwordHash);
  return isValid ? user : null;
}

export async function hashPassword(password: string) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

export async function createSession(userId: string) {
  await prisma.sessionToken.deleteMany({ where: { userId } });
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 dias

  await prisma.sessionToken.create({
    data: { token, userId, expiresAt },
  });

  return token;
}

export async function getUserByToken(token: string) {
  const session = await prisma.sessionToken.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date()) return null;
  return session.user;
}

export async function revokeSession(token: string) {
  await prisma.sessionToken.delete({ where: { token } });
}
