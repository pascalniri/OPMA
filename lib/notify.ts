import { pool, prisma } from "@/lib/prisma";
import type { NotificationType } from "@prisma/client";

// Sends a PostgreSQL NOTIFY on the given channel.
// Consumers subscribe via LISTEN in the SSE endpoint.
export async function pgNotify(channel: string, payload: object) {
  await pool.query("SELECT pg_notify($1, $2)", [channel, JSON.stringify(payload)]);
}

export async function notifyProject(projectId: string, event: object) {
  await pgNotify(`project_${projectId}`, event);
}

export async function notifyUser(userId: string, event: object) {
  await pgNotify(`user_${userId}`, event);
}

export async function createNotification({
  userId,
  type,
  message,
  payload,
}: {
  userId: string;
  type: NotificationType;
  message: string;
  payload?: object;
}) {
  const notification = await prisma.notification.create({
    data: { userId, type, message, payload },
  });
  await notifyUser(userId, { type: "notification.created", notification });
  return notification;
}
