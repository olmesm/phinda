import type { pReq, pRes } from ".";
import { config } from "./config";

const html = String.raw;
const HEARTBEAT_MS = 5_000;
const RESTART_CHECK_MS = 100;

declare global {
  var connected: Set<number>;
}

globalThis.connected = new Set();

const eventsUrl = `${config.dev.prefix}/hot-reload`;

const EVENTS = {
  started: "started",
  reload: "reload",
} as const;

export const hotReloadScript = html`<script>
  const eventSource = new EventSource("${eventsUrl}");

  eventSource.onmessage = (event) => {
    if (event.data.startsWith("event:")) {
      const cmd = event.data.split(":")[1];
      if (cmd === "${EVENTS.reload}") {
        location.reload();
      }
    }
  };
</script>`;

export async function hotReload(req: pReq, _res: pRes) {
  if (req.url.pathname === eventsUrl) {
    let heartbeat: Timer | undefined;
    let restartCheck: Timer | undefined;
    const id = Date.now() + Math.random();

    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        controller.enqueue(encoder.encode(`data: connection-id:${id}\n\n`));
        controller.enqueue(encoder.encode(`data: event:${EVENTS.started}\n\n`));
        globalThis.connected.add(id);

        heartbeat = setInterval(() => {
          controller.enqueue(encoder.encode(": keep-alive\n\n"));
        }, HEARTBEAT_MS);

        restartCheck = setInterval(() => {
          if (!globalThis.connected.has(id)) {
            controller.enqueue(
              encoder.encode(`data: event:${EVENTS.reload}\n\n`)
            );
          }
        }, RESTART_CHECK_MS);

        controller.error = () => {
          clearInterval(heartbeat);
          clearInterval(restartCheck);
          controller.close();
        };
      },
      cancel() {
        clearInterval(heartbeat);
        clearInterval(restartCheck);
      },
    });

    throw new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "Transfer-Encoding": "chunked",
      },
    });
  }
}
