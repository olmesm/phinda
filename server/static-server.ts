import { config } from "./config";
import type { pReq, pRes } from ".";
import path from "path";

export async function staticServer(req: pReq, _res: pRes) {
  if (req.url.pathname.startsWith(config.public_static.url)) {
    const filePath = req.url.pathname.replace(config.public_static.url, "");

    const localFilePath = path.resolve(
      process.cwd(),
      config.public_static.dir + filePath
    );

    throw new Response(Bun.file(localFilePath));
  }
}
