import { useEffect, useRef, useState } from "react";

function loadCache<T>(key: string): T | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function saveCache(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full/unavailable — non-fatal, board keeps working from in-memory state.
  }
}

/**
 * Polls a same-origin JSON endpoint on a fixed interval, caching the last good
 * response in localStorage so a reload (or the tablet losing network briefly)
 * still shows the last known state instead of a blank card. Requests chain via
 * setTimeout rather than setInterval so a slow response never overlaps the next
 * poll, and every timer is cleared on unmount — safe for months of uptime.
 *
 * Any response body without `ok: true` is treated as "no update" and the
 * previously cached value is kept, rather than clearing the board.
 *
 * Initial state is always `null` (matching what the server renders) — the
 * cached value is only applied after mount, inside the effect below, so the
 * client's first render matches the server's and React never hits a
 * hydration mismatch from localStorage content the server can't see.
 */
export function usePolledResource<T extends { ok?: boolean }>(url: string, intervalMs: number, cacheKey: string) {
  const [data, setData] = useState<T | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const cached = loadCache<T>(cacheKey);
    if (cached) setData(cached);

    async function load() {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
        clearTimeout(timeout);
        if (res.ok) {
          const json = (await res.json()) as T;
          if (json && json.ok !== false && mountedRef.current) {
            setData(json);
            saveCache(cacheKey, json);
          }
        }
      } catch {
        // network hiccup — keep showing the last known good data, try again next tick.
      } finally {
        if (mountedRef.current) {
          timer = setTimeout(load, intervalMs);
        }
      }
    }

    load();
    return () => {
      mountedRef.current = false;
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return data;
}
