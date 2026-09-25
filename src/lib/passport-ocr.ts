/**
 * Passport field extraction via Anthropic's vision API — a convenience only.
 * Nothing here persists anything; the caller (passport-extract API route)
 * returns the parsed fields to the browser, and nothing becomes part of a
 * Resident record until the admin explicitly reviews and confirms it.
 *
 * Uses a raw fetch to the Messages API rather than the SDK — the project
 * already prefers this (see telegram.ts) and it avoids a new dependency for
 * a single endpoint.
 */

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";

export interface PassportExtractionResult {
  firstName: string;
  lastName: string;
  passportNumber: string;
  nationality: string;
  dob: string;
  sex: string;
  passportIssueDate: string;
  passportExpiryDate: string;
  issuingCountry: string;
  mrzRaw: string;
}

const FIELD_KEYS: (keyof PassportExtractionResult)[] = [
  "firstName",
  "lastName",
  "passportNumber",
  "nationality",
  "dob",
  "sex",
  "passportIssueDate",
  "passportExpiryDate",
  "issuingCountry",
  "mrzRaw",
];

const PROMPT = `You are reading a passport photo for a hostel admin's guest-registration workflow. Extract the identity fields as accurately as possible.

If a Machine Readable Zone (MRZ, the two lines of monospaced text with "<<" fillers at the bottom of the photo page) is visible, prefer it as the source of truth for name, passport number, nationality, date of birth, sex, and expiry date, since it is structured and checksum-validated on real passports — cross-check against the printed fields and prefer the MRZ where they disagree.

Respond with ONLY a single JSON object (no markdown fences, no commentary) with exactly these string keys — use "" for any field you cannot read with reasonable confidence, never guess:
{
  "firstName": "",
  "lastName": "",
  "passportNumber": "",
  "nationality": "",
  "dob": "YYYY-MM-DD or empty",
  "sex": "M, F, or empty",
  "passportIssueDate": "YYYY-MM-DD or empty",
  "passportExpiryDate": "YYYY-MM-DD or empty",
  "issuingCountry": "",
  "mrzRaw": "the two MRZ lines verbatim if visible, else empty"
}`;

function hasOcrConfig(): boolean {
  return !!process.env.ANTHROPIC_API_KEY && !!process.env.ANTHROPIC_PASSPORT_MODEL;
}

export function isPassportOcrConfigured(): boolean {
  return hasOcrConfig();
}

function extractJsonObject(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("no_json_found");
  return JSON.parse(candidate.slice(start, end + 1));
}

function normalize(raw: unknown): PassportExtractionResult {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const result = {} as PassportExtractionResult;
  for (const key of FIELD_KEYS) {
    const value = obj[key];
    result[key] = typeof value === "string" ? value.trim() : "";
  }
  return result;
}

export async function extractPassportFields(imageBase64: string, mediaType: string): Promise<PassportExtractionResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const model = process.env.ANTHROPIC_PASSPORT_MODEL;
  if (!apiKey || !model) {
    throw new Error("ocr_not_configured");
  }

  const res = await fetch(ANTHROPIC_API, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: imageBase64 } },
            { type: "text", text: PROMPT },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    // Never log response bodies here — they can echo back extracted PII.
    console.error("[passport-ocr] Anthropic API request failed with status", res.status);
    throw new Error("extraction_failed");
  }

  const data = (await res.json()) as { content?: { type: string; text?: string }[] };
  const textBlock = data.content?.find((b) => b.type === "text")?.text ?? "";

  try {
    return normalize(extractJsonObject(textBlock));
  } catch {
    console.error("[passport-ocr] failed to parse model response as JSON");
    throw new Error("extraction_unparseable");
  }
}
