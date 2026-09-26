/**
 * Passport field extraction via Anthropic's vision API — a convenience only.
 * Nothing here persists anything; the caller (passport-extract API route)
 * returns the parsed fields to the browser, and nothing becomes part of a
 * Resident record until the admin explicitly reviews and confirms it.
 *
 * Uses a raw fetch to the Messages API with a tool-use ("structured output")
 * call rather than asking for free-text JSON — the model must return
 * arguments matching a fixed schema, which is far more reliable to parse
 * than regexing prose. No SDK dependency, matching the project's existing
 * preference (see telegram.ts).
 */

import { parseMRZ } from "./residence/mrz-parser";

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";

export interface PassportExtractionResult {
  firstName: string;
  lastName: string;
  passportNumber: string;
  nationality: string;
  dob: string;
  placeOfBirth: string;
  sex: string;
  passportIssueDate: string;
  passportExpiryDate: string;
  issuingCountry: string;
  mrzRaw: string;
  /** Field keys (matching this interface's own names) that need a human look before trusting them. */
  needsReview: string[];
  /** Short human-readable reason per flagged field key. */
  reviewReasons: Record<string, string>;
  /** Whether the MRZ checksum validated overall (false if no MRZ was visible/readable). */
  mrzValid: boolean;
}

const TOOL_NAME = "extract_passport_data";

const PROMPT = `You are extracting structured data from an identity document photo supplied by an authorized hostel administrator for guest registration. This is a legitimate, authorized use.

Return only fields that are clearly visible in the image. Never infer or invent a value you cannot actually read. If a character is ambiguous (for example 0 vs O, 1 vs I, 5 vs S), do not silently guess — add that field's name to uncertain_fields instead.

If a Machine Readable Zone (MRZ, the two monospaced lines with "<" filler characters at the bottom of the passport's photo page) is visible, transcribe both lines EXACTLY as printed, character for character, into mrz_line_1 and mrz_line_2 (44 characters each for a standard passport) — this will be independently checksum-validated, so precision matters more here than anywhere else on the page.

Call the extract_passport_data tool with your findings. Use empty strings for anything not clearly visible. Do not include any commentary outside the tool call.`;

function hasOcrConfig(): boolean {
  return !!process.env.ANTHROPIC_API_KEY && !!process.env.ANTHROPIC_PASSPORT_MODEL;
}

export function isPassportOcrConfigured(): boolean {
  return hasOcrConfig();
}

interface ToolResult {
  first_name?: unknown;
  last_name?: unknown;
  nationality?: unknown;
  date_of_birth?: unknown;
  place_of_birth?: unknown;
  passport_number?: unknown;
  issuing_country?: unknown;
  issue_date?: unknown;
  expiry_date?: unknown;
  sex?: unknown;
  mrz_line_1?: unknown;
  mrz_line_2?: unknown;
  uncertain_fields?: unknown;
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

const UNCERTAIN_KEY_MAP: Record<string, keyof PassportExtractionResult> = {
  first_name: "firstName",
  last_name: "lastName",
  nationality: "nationality",
  date_of_birth: "dob",
  place_of_birth: "placeOfBirth",
  passport_number: "passportNumber",
  issuing_country: "issuingCountry",
  issue_date: "passportIssueDate",
  expiry_date: "passportExpiryDate",
  sex: "sex",
};

function normalizeForCompare(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
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
      tools: [
        {
          name: TOOL_NAME,
          description: "Structured identity-document data extracted from the supplied image.",
          input_schema: {
            type: "object",
            properties: {
              first_name: { type: "string" },
              last_name: { type: "string" },
              nationality: { type: "string" },
              date_of_birth: { type: "string", description: "YYYY-MM-DD or empty" },
              place_of_birth: { type: "string" },
              passport_number: { type: "string" },
              issuing_country: { type: "string" },
              issue_date: { type: "string", description: "YYYY-MM-DD or empty" },
              expiry_date: { type: "string", description: "YYYY-MM-DD or empty" },
              sex: { type: "string", description: "M, F, or empty" },
              mrz_line_1: { type: "string" },
              mrz_line_2: { type: "string" },
              uncertain_fields: {
                type: "array",
                items: { type: "string" },
                description: "Names of the above fields (e.g. 'passport_number') the model is not fully confident about.",
              },
            },
            required: [
              "first_name",
              "last_name",
              "nationality",
              "date_of_birth",
              "place_of_birth",
              "passport_number",
              "issuing_country",
              "issue_date",
              "expiry_date",
              "sex",
              "mrz_line_1",
              "mrz_line_2",
              "uncertain_fields",
            ],
          },
        },
      ],
      tool_choice: { type: "tool", name: TOOL_NAME },
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
    console.error("[passport-ocr] Anthropic API request failed with status", res.status);
    throw new Error("extraction_failed");
  }

  const data = (await res.json()) as { content?: { type: string; input?: unknown }[] };
  const toolUse = data.content?.find((b) => b.type === "tool_use");
  if (!toolUse || typeof toolUse.input !== "object" || toolUse.input === null) {
    console.error("[passport-ocr] no tool_use block in response");
    throw new Error("extraction_unparseable");
  }

  const raw = toolUse.input as ToolResult;

  const result: PassportExtractionResult = {
    firstName: str(raw.first_name),
    lastName: str(raw.last_name),
    nationality: str(raw.nationality),
    dob: str(raw.date_of_birth),
    placeOfBirth: str(raw.place_of_birth),
    passportNumber: str(raw.passport_number),
    issuingCountry: str(raw.issuing_country),
    passportIssueDate: str(raw.issue_date),
    passportExpiryDate: str(raw.expiry_date),
    sex: str(raw.sex),
    mrzRaw: [str(raw.mrz_line_1), str(raw.mrz_line_2)].filter(Boolean).join("\n"),
    needsReview: [],
    reviewReasons: {},
    mrzValid: false,
  };

  // Claude's own uncertainty flags.
  const uncertainRaw = Array.isArray(raw.uncertain_fields) ? raw.uncertain_fields : [];
  for (const u of uncertainRaw) {
    const key = UNCERTAIN_KEY_MAP[String(u)];
    if (key && !result.needsReview.includes(key)) {
      result.needsReview.push(key);
      result.reviewReasons[key] = "Model nije siguran u ovo polje — proverite ručno.";
    }
  }

  // Deterministic MRZ cross-check, independent of what Claude "thinks" it read.
  const mrzLine1 = str(raw.mrz_line_1);
  const mrzLine2 = str(raw.mrz_line_2);
  if (mrzLine1 && mrzLine2) {
    const mrz = parseMRZ(mrzLine1, mrzLine2);
    if (mrz) {
      result.mrzValid = mrz.valid;

      const flag = (key: keyof PassportExtractionResult, reason: string) => {
        if (!result.needsReview.includes(key)) result.needsReview.push(key);
        result.reviewReasons[key] = reason;
      };

      if (mrz.passportNumberValid && normalizeForCompare(result.passportNumber) !== normalizeForCompare(mrz.passportNumber)) {
        result.passportNumber = mrz.passportNumber; // MRZ checksum passed — more trustworthy than free-text OCR
        flag("passportNumber", "Broj pasoša ispravljen prema MRZ zoni (proverite).");
      } else if (!mrz.passportNumberValid) {
        flag("passportNumber", "MRZ kontrolna cifra za broj pasoša se ne poklapa.");
      }

      if (mrz.dobValid && mrz.dob && result.dob !== mrz.dob) {
        result.dob = mrz.dob;
        flag("dob", "Datum rođenja ispravljen prema MRZ zoni (proverite).");
      } else if (!mrz.dobValid) {
        flag("dob", "MRZ kontrolna cifra za datum rođenja se ne poklapa.");
      }

      if (mrz.expiryValid && mrz.expiryDate && result.passportExpiryDate !== mrz.expiryDate) {
        result.passportExpiryDate = mrz.expiryDate;
        flag("passportExpiryDate", "Datum isteka ispravljen prema MRZ zoni (proverite).");
      } else if (!mrz.expiryValid) {
        flag("passportExpiryDate", "MRZ kontrolna cifra za datum isteka se ne poklapa.");
      }

      if (mrz.sex && result.sex && result.sex.toUpperCase() !== mrz.sex) {
        flag("sex", `MRZ zona pokazuje "${mrz.sex}", vizuelno očitavanje "${result.sex}" — proverite.`);
      }

      if (mrz.nationality && result.nationality && normalizeForCompare(result.nationality) !== normalizeForCompare(mrz.nationality)) {
        flag("nationality", "MRZ i vizuelno očitana državljanstva se razlikuju — proverite.");
      }

      // Names: MRZ strips diacritics (Đ→D, Č→C...), so it's a sanity check
      // only — never overwrite the more accurate visually-read name with it.
      const mrzFullName = normalizeForCompare(`${mrz.surname}${mrz.givenNames}`);
      const visualFullName = normalizeForCompare(`${result.lastName}${result.firstName}`);
      if (mrz.valid && mrzFullName && visualFullName && !mrzFullName.includes(visualFullName.slice(0, 4))) {
        flag("firstName", "Ime u MRZ zoni značajno odstupa od vizuelno očitanog imena — proverite.");
        flag("lastName", "Prezime u MRZ zoni značajno odstupa od vizuelno očitanog prezimena — proverite.");
      }
    } else {
      result.reviewReasons["mrzRaw"] = "MRZ linije nisu prepoznate u očekivanom formatu.";
    }
  }

  return result;
}
