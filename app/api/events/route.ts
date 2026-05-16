import { Client } from "pg";
import { requireAuth } from "@/lib/api";

// Force Node.js runtime — SSE + pg LISTEN requires persistent connections,
// not supported in the Edge runtime.
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { userId, unauthorized } = await requireAuth();
  if (!userId) return unauthorized!;

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  // Channels this connection listens to:
  //   user_<id>        — personal notifications, assignments
  //   project_<id>     — activity/milestone/board changes for a specific project
  const channels = [`user_${userId}`];
  if (projectId) channels.push(`project_${projectId}`);

  const encoder = new TextEncoder();
  let pgClient: Client | null = null;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        pgClient = new Client({ connectionString: process.env.DATABASE_URL });
        await pgClient.connect();

        for (const ch of channels) {
          await pgClient.query(`LISTEN "${ch}"`);
        }

        // Initial heartbeat so the client knows the connection is live
        controller.enqueue(encoder.encode(`: connected\n\n`));

        pgClient.on("notification", (msg) => {
          controller.enqueue(encoder.encode(`data: ${msg.payload}\n\n`));
        });

        pgClient.on("error", () => controller.close());
      } catch {
        controller.close();
      }
    },
    cancel() {
      pgClient?.end().catch(() => {});
    },
  });

  // Clean up when the client disconnects
  req.signal.addEventListener("abort", () => {
    pgClient?.end().catch(() => {});
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      // Disable Nginx / proxy buffering so events reach the client immediately
      "X-Accel-Buffering": "no",
    },
  });
}
