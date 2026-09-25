import { NextResponse } from "next/server";
import { getWebsiteSettings } from "@/lib/residence/website-settings-store";

export const dynamic = "force-dynamic";

/**
 * Public, read-only — everything in WebsiteSettings is operational marketing
 * content meant to be shown on the site (price, deposit, announcement, CTA
 * text, accepting-inquiries flag), nothing resident-sensitive.
 */
export async function GET() {
  const settings = await getWebsiteSettings();
  return NextResponse.json(settings);
}
