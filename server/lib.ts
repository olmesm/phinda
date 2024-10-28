import { type Children as kChildren } from "@kitajs/html";
import type { DB } from "./db";
import type { pReq, pRes } from ".";
import { hotReloadScript } from "./hot-reload";

type Awaitable<T> = T | PromiseLike<T>;

export type Children = kChildren;
type Context = {
  req: pReq;
  res: pRes;
  db: DB;
};
export type HtmlPageFn = (ctx: Context) => Awaitable<Returnable>;
export type LayoutPageFn = (
  ctx: Context,
  children: Children
) => Awaitable<Returnable>;

type Returnable = BodyInit | null | undefined;

export const HtmlPage = (fn: HtmlPageFn) => fn;
export const LayoutPage = (fn: LayoutPageFn) => fn;

export function redirect(to: string, status = 302) {
  const headers = new Headers();
  headers.append("location", to);

  throw new Response(undefined, {
    headers,
    status: status,
  });
}

export const PhindaScripts = () => {
  const isProd = process.env.NODE_ENV?.includes("prod");

  const hotReload = isProd ? "" : hotReloadScript;

  return "".concat(hotReload);
};
