import type { User } from "@prisma/client";
import { db } from "../db";

class UserExists extends Error {}
class UserNotFound extends Error {}
class UserIncorrectPassword extends Error {}
class TokenNotFound extends Error {}
class TokenExpired extends Error {}

const HOUR = 1000 * 60 * 60;

export async function registerUser(
  email: string,
  password: string,
  firstName: string,
  lastName: string
): Promise<User> {
  const isExisting = await db.user.findUnique({ where: { email } });

  if (isExisting) throw new UserExists();

  const hash = await Bun.password.hash(password);

  const user = await db.user.create({
    data: {
      email,
      firstName,
      lastName,
      passwordHash: hash,
    },
  });

  return user;
}

export async function loginUser(
  email: string,
  password: string
): Promise<User> {
  const user = await db.user.findUnique({ where: { email } });
  if (!user) throw new UserNotFound();

  const isMatch = await Bun.password.verify(password, user.passwordHash);
  if (!isMatch) throw new UserIncorrectPassword();

  return user;
}

export async function verifyUser(token: string): Promise<User> {
  const maybeToken = await db.verificationToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!maybeToken) throw new TokenNotFound();

  if (
    maybeToken.createdAt.valueOf() +
      1 * //hour
        HOUR <
    Date.now()
  )
    throw new TokenExpired();

  const [user] = await db.$transaction([
    db.user.update({
      where: { id: maybeToken.userId },
      data: { emailVerified: new Date(Date.now()) },
    }),
    db.verificationToken.delete({ where: { token } }),
  ]);

  return user;
}
