import { parse, serialize } from "cookie";
import { validateSessionToken } from "./session-management";
import type { Session } from "@prisma/client";
import type { pReq, pRes } from "..";

const SESSION_KEY = "kiff-sesh2";

export async function handleRequest(
  request: pReq,
  response: pRes
): Promise<void> {
  // if (request.method !== "GET") {
  //   const origin = request.headers.get("Origin");
  //   if (origin === null || origin !== "https://example.com") {
  //     response.status = 403;
  //     return;
  //   }
  // }
  // session validation
  const cookies = parse(request.headers.get("Cookie") ?? "");
  if (!(SESSION_KEY in cookies)) {
    return;
  }
  const token = cookies[SESSION_KEY] ?? "";

  const { session, user } = await validateSessionToken(token);
  if (session === null) {
    deleteSessionTokenCookie(response);
    return;
  }

  setSessionTokenCookie(response, session);
  request.user = user;
  request.session = session;
}

export function setSessionTokenCookie(
  response: ResponseInit,
  session: Session
): void {
  const headers = new Headers(response.headers);

  response.headers = headers;

  headers.append(
    "Set-Cookie",
    serialize(SESSION_KEY, session.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV?.includes("prod"),
      maxAge: 60 * 60 * 24 * 7,
      expires: session.expiresAt,
      sameSite: "lax",
      path: "/",
    })
  );
}

export function deleteSessionTokenCookie(response: ResponseInit): void {
  const headers = new Headers(response.headers);

  response.headers = headers;

  headers.append(
    "Set-Cookie",
    serialize(SESSION_KEY, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV?.includes("prod"),
      maxAge: 0,
      sameSite: "lax",
      path: "/",
    })
  );
}
