import { useEffect, useRef, useState } from "react";

export interface ServerEvent {
  type: string;
  [key: string]: unknown;
}

// Subscribes to the SSE stream for the current user (and optionally a project).
// Calls onEvent for every message received. Reconnects automatically via
// the browser's native EventSource retry mechanism.
//
// Usage:
//   useEvents({ projectId, onEvent: (e) => { ... } })
//
// Events emitted by the server:
//   activity.created | activity.updated | activity.deleted | activity.moved
//   milestone.created | milestone.updated | milestone.deleted
//   pow.submitted | pow.reviewed
//   vault.document.added | vault.document.deleted
//   board.column.created | board.column.updated | board.column.deleted
//   notification.created
//   project.updated

export default function useEvents({
  projectId,
  onEvent,
}: {
  projectId?: string;
  onEvent?: (event: ServerEvent) => void;
}) {
  const [connected, setConnected] = useState(false);
  // Keep a stable ref to onEvent to avoid restarting the connection on every render
  const onEventRef = useRef(onEvent);
  useEffect(() => { onEventRef.current = onEvent; }, [onEvent]);

  useEffect(() => {
    const url = projectId
      ? `/api/events?projectId=${encodeURIComponent(projectId)}`
      : "/api/events";

    const es = new EventSource(url);

    es.onopen = () => setConnected(true);

    es.onmessage = (e) => {
      if (!e.data || e.data.startsWith(":")) return; // skip comments/heartbeats
      try {
        const event: ServerEvent = JSON.parse(e.data);
        onEventRef.current?.(event);
      } catch {
        // malformed payload — ignore
      }
    };

    es.onerror = () => {
      setConnected(false);
      // EventSource will auto-reconnect with exponential back-off
    };

    return () => {
      es.close();
      setConnected(false);
    };
  }, [projectId]);

  return { connected };
}
