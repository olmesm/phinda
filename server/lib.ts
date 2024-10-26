import { type Children as kChildren } from "@kitajs/html";
import type { DB } from "./db";
import type { pReq, pRes } from ".";

type Awaitable<T> = T | PromiseLike<T>;

export type Children = kChildren;
type Context = {
  req: pReq;
  res: pRes;
  db: DB;
};
export type PageFn = (ctx: Context) => Awaitable<Returnable>;

type Returnable = BodyInit | null | undefined;

export const HtmlPage = (fn: PageFn) => fn;

export function redirect(to: string, status = 302) {
  const headers = new Headers();
  headers.append("location", to);

  throw new Response(undefined, {
    headers,
    status: status,
  });
}
