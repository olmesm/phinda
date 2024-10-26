import deepmerge from "@fastify/deepmerge";
import { type HtmlPageFn, type LayoutPageFn } from "./lib";
import { db } from "./db";
import { z } from "zod";
import { Template as VerificationEmailTemplate } from "@/emails/verify";
import path from "path";
import { loginUser, registerUser, verifyUser } from "./users/user-management";
import {
  createSession,
  generateSessionToken,
  invalidateSession,
} from "./users/session-management";
import { config } from "./config";

import {
  handleRequest,
  setSessionTokenCookie,
  deleteSessionTokenCookie,
} from "./users/client-middleware";
import type { Session, User } from "@prisma/client";
import { renderEmail, sendVerificationMail } from "./email";
import { log } from "./log";
import type { Children } from "@kitajs/html";

const router = new Bun.FileSystemRouter({
  style: "nextjs",
  dir: path.resolve(process.cwd(), config.pages.root),
});

const respDefaults = {
  headers: {
    "content-type": "text/html; charset=UTF-8",
  },
} satisfies ResponseInit;

const server = Bun.serve({
  async fetch(req) {
    return await main(req);
  },
});

const serverUrl = new URL(config.auth.domain ?? server.url.toString());

log.info(`Phinda started.
Listening: ${server.url.toString()}`);

// ---

export type pRes = Pick<ResponseInit, "status" | "headers"> & {};
export type pReq = Pick<Request, "headers" | "credentials" | "method"> & {
  url: URL;
  raw: Request;
  parseBody(): Promise<unknown>;
  parseBodyWithSchema: <Z extends z.ZodSchema>(
    zodSchema: Z
  ) => Promise<z.SafeParseReturnType<z.infer<Z>, z.infer<Z>>>;
  user: User | null;
  session: Session | null;
  params: Record<string, string>;
  query: Record<string, string>;
};

const enhanceRequest = (__req: Request): pReq => ({
  params: {},
  query: {},
  session: null,
  user: null,
  raw: __req.clone(),
  url: new URL(__req.url),
  headers: __req.headers,
  credentials: __req.credentials,
  method: __req.method,
  parseBody: async () => await parseBody(__req.clone()),
  parseBodyWithSchema: async (zodSchema) =>
    zodSchema.safeParse(await parseBody(__req.clone())),
});

const parseBody = async (req: Request) => {
  const contentType = req.headers.get("content-type") ?? "---";

  if (
    ["multipart/form-data", "application/x-www-form-urlencoded"].includes(
      contentType
    )
  ) {
    const formData = await req.formData();
    if (!formData) return {};
    return Object.fromEntries(formData as any);
  }

  if (contentType.includes("application/json")) {
    return await req.formData();
  }

  return await req.text();
};

const defaultLayout = (await import(
  path.resolve(process.cwd(), config.pages.layout)
)) as {
  default: LayoutPageFn;
};

async function main(req: Request): Promise<Response> {
  const pRes: pRes = {
    headers: {
      "content-type": "text/html; charset=UTF-8",
    },
  };
  const pReq: pReq = enhanceRequest(req);

  return handleRoute(pReq, pRes);
}

const getHtmlPageFn = async (pageRoute: string) =>
  (await import(pageRoute)) as {
    default: HtmlPageFn;
    Layout?: LayoutPageFn;
  };

async function handleRoute(req: pReq, res: pRes) {
  const ctx = {
    req,
    res,
    db,
  };

  try {
    await handleRequest(req, res);
    await handleAuthRoutes(req, res);

    const matchedRoute = router.match(req.url.href);

    if (matchedRoute) {
      const HtmlPageFn = await getHtmlPageFn(matchedRoute.filePath);

      ctx.req.params = matchedRoute.params;
      ctx.req.query = matchedRoute.query;

      let body = await HtmlPageFn.default(ctx);
      const layout = HtmlPageFn.Layout ?? defaultLayout.default;

      body = await layout(ctx, body as Children);

      return new Response(body, deepmerge({ all: true })(respDefaults, res));
    }

    const pageNotFound = await getHtmlPageFn(
      path.resolve(process.cwd(), config.pages.not_found)
    );
    const layout = pageNotFound.Layout ?? defaultLayout.default;

    let body = await pageNotFound.default(ctx);
    body = await layout(ctx, body as Children);

    return new Response(body, deepmerge({ all: true })(respDefaults, res));
  } catch (e) {
    if (e instanceof Response) {
      return e;
    }

    log.trace(e);

    const pageError = await getHtmlPageFn(
      path.resolve(process.cwd(), config.pages.error)
    );
    const layout = pageError.Layout ?? defaultLayout.default;

    let body = await pageError.default(ctx);
    body = await layout(ctx, body as Children);

    return new Response(body, deepmerge({ all: true })(respDefaults, res));
  }
}

async function handleAuthRoutes(req: pReq, res: pRes) {
  const PREFIX = config.auth.prefix;

  if (req.url.pathname === `${PREFIX}${config.auth.route.logout}`) {
    if (req.session) invalidateSession(req.session.sessionToken);

    deleteSessionTokenCookie(res);

    const headers = new Headers(res.headers);
    headers.append("location", config.auth.route.logout_redirect);

    throw new Response(undefined, {
      headers,
      status: 302,
    });
  }

  if (req.url.pathname === `${PREFIX}${config.auth.route.verify}`) {
    const verificationToken = req.url.searchParams.get("token");

    if (!verificationToken) {
      throw new Response("Invalid token", {
        status: 400,
      });
    }

    const user = await verifyUser(verificationToken);
    const session = await createSession(user.id);

    setSessionTokenCookie(res, session);

    const headers = new Headers(res.headers);
    headers.append("location", config.auth.route.login_redirect);

    throw new Response(undefined, {
      headers,
      status: 302,
    });
  }

  if (req.url.pathname === `${PREFIX}${config.auth.route.login}`) {
    const data = await req.parseBody();
    const { email, password } = loginSchema.parse(data);

    const user = await loginUser(email, password);
    const session = await createSession(user.id);

    setSessionTokenCookie(res, session);

    const headers = new Headers(res.headers);
    headers.append("location", config.auth.route.login_redirect);

    throw new Response(undefined, {
      headers,
      status: 302,
    });
  }

  if (req.url.pathname === `${PREFIX}${config.auth.route.register}`) {
    const data = await req.parseBody();

    const { email, password, firstName, lastName } = registerSchema.parse(data);

    const user = await registerUser(email, password, firstName, lastName);

    const headers = new Headers(res.headers);

    if (config.auth.must_validate_email) {
      const token = await db.verificationToken.create({
        data: { token: generateSessionToken(), userId: user.id },
      });

      const verificationUrl = new URL(serverUrl);
      verificationUrl.pathname = `${PREFIX}${config.auth.route.verify}`;
      verificationUrl.searchParams.append("token", token.token);

      const renderedEmail = await renderEmail(
        VerificationEmailTemplate({
          userFirstname: user.firstName,
          verifyUrl: verificationUrl.toString(),
        })
      );

      await sendVerificationMail(user.email, renderedEmail);

      headers.append("location", config.auth.route.verify_redirect);
      throw new Response(undefined, {
        headers,
        status: 302,
      });
    }

    headers.append("location", config.auth.route.register_redirect);
    const session = await createSession(user.id);

    setSessionTokenCookie(res, session);

    throw new Response(undefined, {
      headers,
      status: 302,
    });
  }
}

const passwordSchema = z.string();
// .min(8, { message: "minLengthErrorMessage" })
// .max(20, { message: "maxLengthErrorMessage" })
// .refine((password) => /[A-Z]/.test(password), {
//   message: "uppercaseErrorMessage",
// })
// .refine((password) => /[a-z]/.test(password), {
//   message: "lowercaseErrorMessage",
// })
// .refine((password) => /[0-9]/.test(password), {
//   message: "numberErrorMessage",
// })
// .refine((password) => /[!@#$%^&*]/.test(password), {
//   message: "specialCharacterErrorMessage",
// });

const loginSchema = z.object({
  email: z.string().email(),
  password: passwordSchema,
});

const registerSchema = loginSchema.extend({
  firstName: z.string(),
  lastName: z.string(),
});

const zPassword = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine(
    (values) => {
      return values.password === values.confirmPassword;
    },
    {
      message: "Passwords must match!",
      path: ["confirmPassword"],
    }
  );
