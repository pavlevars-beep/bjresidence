export interface Env {
  TARGET_URL: string;
  CRON_SECRET: string;
}

/**
 * Standalone Worker whose only job is to call the main app's existing cron
 * route on a schedule — Cloudflare has no vercel.json-style app-level cron,
 * so this stands in for that. The route itself (src/app/api/cron/residence-reminders/route.ts
 * in the main app) is unchanged and host-agnostic: it just checks the
 * Authorization header.
 */
export default {
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(
      fetch(env.TARGET_URL, {
        headers: { Authorization: `Bearer ${env.CRON_SECRET}` },
      }).then(async (res) => {
        if (!res.ok) {
          console.error(`[bjresidence-cron] reminder sweep failed: ${res.status} ${await res.text()}`);
        }
      })
    );
  },
};
