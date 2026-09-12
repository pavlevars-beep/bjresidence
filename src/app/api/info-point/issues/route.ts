import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { addIssueReport } from "@/lib/info-point-issues-store";
import { ISSUE_CATEGORIES, ISSUE_LOCATIONS, type IssueCategory, type IssueLocation } from "@/lib/info-point-issues";
import { isAllowedImageType, saveIssuePhoto, MAX_UPLOAD_BYTES } from "@/lib/info-point-uploads";
import { formatIssueReport, sendTelegramMessage } from "@/lib/telegram";

export const dynamic = "force-dynamic";

/**
 * Best-effort in-memory rate limit (per server instance — not durable across
 * serverless cold starts, but cheap and stops naive spam without adding
 * infrastructure the project doesn't already have).
 */
const RATE_LIMIT_WINDOW_MS = 10 * 60_000;
const RATE_LIMIT_MAX = 5;
const hits = new Map<string, { count: number; windowStart: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    hits.set(ip, { count: 1, windowStart: now });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

function getClientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const category = String(formData.get("category") ?? "");
  const location = String(formData.get("location") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const residentName = String(formData.get("residentName") ?? "").trim();
  const photo = formData.get("photo");

  if (!ISSUE_CATEGORIES.includes(category as IssueCategory) || !ISSUE_LOCATIONS.includes(location as IssueLocation)) {
    return NextResponse.json({ ok: false, error: "invalid_fields" }, { status: 400 });
  }
  if (!description || description.length > 2000) {
    return NextResponse.json({ ok: false, error: "invalid_description" }, { status: 400 });
  }

  let photoFilename: string | null = null;
  let photoSaveFailed = false;
  if (photo instanceof File && photo.size > 0) {
    if (!isAllowedImageType(photo.type)) {
      return NextResponse.json({ ok: false, error: "unsupported_photo_type" }, { status: 400 });
    }
    if (photo.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ ok: false, error: "photo_too_large" }, { status: 400 });
    }
    try {
      photoFilename = await saveIssuePhoto(photo);
    } catch (err) {
      // Local disk isn't writable on some hosts (e.g. Vercel's serverless
      // filesystem) — don't let that block the report itself from getting
      // through; the resident's text still matters even without the photo.
      photoSaveFailed = true;
      // eslint-disable-next-line no-console
      console.error("[info-point-issues] photo save failed:", err);
    }
  }

  // Storage (for the admin Issue Reports list) and the Telegram notification
  // are independent — a host with a read-only filesystem can still fail to
  // persist the report while Telegram delivery succeeds, and that must count
  // as a successful submission from the resident's point of view.
  let stored = true;
  let reportId: string;
  try {
    const report = await addIssueReport({
      category: category as IssueCategory,
      location: location as IssueLocation,
      description: description.slice(0, 2000),
      photoFilename,
      residentName: residentName ? residentName.slice(0, 200) : null,
    });
    reportId = report.id;
  } catch (err) {
    stored = false;
    reportId = randomUUID();
    // eslint-disable-next-line no-console
    console.error("[info-point-issues] failed to persist report:", err);
  }

  const telegramText = formatIssueReport({
    category,
    location,
    description,
    residentName,
    hasPhoto: !!photoFilename,
  });
  const telegramSent = await sendTelegramMessage(
    photoSaveFailed ? `${telegramText}\n\n(Fotografija je poslata ali nije mogla da se sačuva.)` : telegramText
  )
    .then(() => true)
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error("[info-point-issues] telegram notify failed:", err);
      return false;
    });

  if (!stored && !telegramSent) {
    // Neither channel worked — this genuinely didn't reach anyone.
    return NextResponse.json({ ok: false, error: "delivery_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: reportId, stored, telegramSent });
}
