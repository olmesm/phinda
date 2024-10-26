import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { db } from "../db";
import type { Session, User } from "@prisma/client";
import { sha256 } from "@oslojs/crypto/sha2";

export type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null };

export function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
}

export async function createSession(userId: string): Promise<Session> {
  const sessionToken = generateSessionToken();

  const session = await db.session.create({
    data: {
      sessionToken: sessionToken,
      userId,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    },
  });

  return session;
}

export async function validateSessionToken(
  sessionToken: string
): Promise<SessionValidationResult> {
  const result = await db.session.findUnique({
    where: {
      sessionToken,
    },
    include: {
      user: true,
    },
  });
  if (!result) {
    return { session: null, user: null };
  }

  const { user, ...session } = result;
  if (Date.now() >= session.expiresAt.getTime()) {
    await db.session.delete({ where: { sessionToken } });
    return { session: null, user: null };
  }

  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await db.session.update({
      where: {
        sessionToken: session.sessionToken,
      },
      data: {
        expiresAt: session.expiresAt,
      },
    });
  }

  return { session, user };
}

export async function invalidateSession(sessionToken: string): Promise<void> {
  await db.session.delete({ where: { sessionToken: sessionToken } });

  return;
}
