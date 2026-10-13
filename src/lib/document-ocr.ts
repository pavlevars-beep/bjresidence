/**
 * Identity-document field extraction via Anthropic's vision API — a
 * convenience only. Nothing here persists anything; the caller (the
 * document-extract API route) returns the parsed fields to the browser, and
 * nothing becomes part of a Resident record until the admin explicitly
 * reviews and confirms it.
 *
 * Handles any identity document an admin photographs — passport, national
 * ID card, residence permit, or anything else — and any number of images of
 * it (a residence permit's back side carries data the front doesn't). The
 * only fields treated as a fixed shape are the ones nearly every document
 * has (name, date of birth, a document/ID number); everything else a
 * document happens to show (JMBG/personal number, issuing authority, permit
 * category, address, ...) comes back as a flexible list of label/value pairs
 * instead of being forced into a rigid passport-shaped schema.
 *
 * Uses a raw fetch to the Messages API with a tool-use ("structured output")
 * call rather than asking for free-text JSON — the model must return
 * arguments matching a fixed schema, which is far more reliable to parse
 * than regexing prose. No SDK dependency, matching the project's existing
 * preference (see telegram.ts).
 */

import { parseMRZAuto } from "./residence/mrz-parser";

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";

export interface ExtractedFieldPair {
  label: string;
  value: string;
}

export interface DocumentExtractionResult {
  documentType: string; // model's own guess: "passport" | "national_id" | "residence_permit" | "other"
  firstName: string;
  lastName: string;
  documentNumber: string;
  personalIdNumber: string; // JMBG / matični broj / national personal number, when the document shows one
  nationality: string;
  dob: string;
  placeOfBirth: string;
  sex: string;
  issueDate: string;
  expiryDate: string;
  issuingCountry: string;
  issuingAuthority: string;
  /** Anything else clearly visible that doesn't fit the fields above (permit category, address, employer, parents' names, ...). */
  additionalFields: ExtractedFieldPair[];
  mrzRaw: string;
  mrzFormat: "TD3" | "TD1" | "";
  /** Field keys (matching this interface's own names) that need a human look before trusting them. */
  needsReview: string[];
  /** Short human-readable reason per flagged field key. */
  reviewReasons: Record<string, string>;
  /** Whether the MRZ checksum validated overall (false if no MRZ was visible/readable). */
  mrzValid: boolean;
}

const TOOL_NAME = "extract_identity_document_data";

const PROMPT = `You are extracting structured data from one or more photos of the SAME identity document, supplied by an authorized residence administrator for guest registration. This is a legitimate, authorized use. The document may be a passport, a national ID card, a residence permit, or something else — you may be given more than one image (e.g. front and back of the same card), since some documents carry data on both sides.

Return only fields that are clearly visible across the supplied image(s). Never infer or invent a value you cannot actually read. If a character is ambiguous (for example 0 vs O, 1 vs I, 5 vs S), do not silently guess — add that field's name to uncertain_fields instead.

Identify document_type as one of: "passport", "national_id", "residence_permit", or "other".

If a Machine Readable Zone (MRZ — monospaced lines with "<" filler characters) is visible on any image, transcribe every line EXACTLY as printed, character for character, into mrz_lines — this will be independently checksum-validated, so precision matters more here than anywhere else. A passport MRZ is 2 lines of 44 characters; an ID card or residence permit MRZ is usually 3 lines of 30 characters. Include only the actual MRZ lines, nothing else, one array entry per line in order.

Use document_number for whatever the document's own primary identifying number is (passport number, ID card number, permit number — whichever applies). If the document separately shows a national personal/civil registry number (e.g. a Serbian JMBG or a similar "matični broj"), put that in personal_id_number instead — do not conflate the two.

Put anything else clearly visible that isn't covered by the named fields — permit category/type, issuing authority or office, a printed address, employer, parents' names, visa or endorsement text, etc. — into additional_fields as {label, value} pairs, using short human-readable labels. Leave it empty if there's nothing else to add.

Call the extract_identity_document_data tool with your findings. Use empty strings (or an empty array for additional_fields/mrz_lines/uncertain_fields) for anything not clearly visible. Do not include any commentary outside the tool call.`;

function hasOcrConfig(): boolean {
  return !!process.env.ANTHROPIC_API_KEY && !!process.env.ANTHROPIC_PASSPORT_MODEL;
}

export function isDocumentOcrConfigured(): boolean {
  return hasOcrConfig();
}

interface ToolResult {
  document_type?: unknown;
  first_name?: unknown;
  last_name?: unknown;
  nationality?: unknown;
  date_of_birth?: unknown;
  place_of_birth?: unknown;
  document_number?: unknown;
  personal_id_number?: unknown;
  issuing_country?: unknown;
  issuing_authority?: unknown;
  issue_date?: unknown;
  expiry_date?: unknown;
  sex?: unknown;
  mrz_lines?: unknown;
  additional_fields?: unknown;
  uncertain_fields?: unknown;
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function strArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(str).filter(Boolean);
}

function fieldPairs(value: unknown): ExtractedFieldPair[] {
  if (!Array.isArray(value)) return [];
  const out: ExtractedFieldPair[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const label = str((entry as Record<string, unknown>).label);
    const fieldValue = str((entry as Record<string, unknown>).value);
    if (label && fieldValue) out.push({ label, value: fieldValue });
  }
  return out;
}

const UNCERTAIN_KEY_MAP: Record<string, keyof DocumentExtractionResult> = {
  first_name: "firstName",
  last_name: "lastName",
  nationality: "nationality",
  date_of_birth: "dob",
  place_of_birth: "placeOfBirth",
  document_number: "documentNumber",
  personal_id_number: "personalIdNumber",
  issuing_country: "issuingCountry",
  issuing_authority: "issuingAuthority",
  issue_date: "issueDate",
  expiry_date: "expiryDate",
  sex: "sex",
};

function normalizeForCompare(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export interface DocumentImageInput {
  base64: string;
  mediaType: string;
}

export async function extractDocumentFields(images: DocumentImageInput[]): Promise<DocumentExtractionResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const model = process.env.ANTHROPIC_PASSPORT_MODEL;
  if (!apiKey || !model) {
    throw new Error("ocr_not_configured");
  }
  if (images.length === 0) {
    throw new Error("no_images");
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
      max_tokens: 1536,
      tools: [
        {
          name: TOOL_NAME,
          description: "Structured identity-document data extracted from the supplied image(s).",
          input_schema: {
            type: "object",
            properties: {
              document_type: { type: "string", description: "passport, national_id, residence_permit, or other" },
              first_name: { type: "string" },
              last_name: { type: "string" },
              nationality: { type: "string" },
              date_of_birth: { type: "string", description: "YYYY-MM-DD or empty" },
              place_of_birth: { type: "string" },
              sex: { type: "string", description: "M, F, or empty" },
              document_number: { type: "string" },
              personal_id_number: { type: "string", description: "National personal/civil registry number (e.g. JMBG), if shown separately" },
              issuing_country: { type: "string" },
              issuing_authority: { type: "string" },
              issue_date: { type: "string", description: "YYYY-MM-DD or empty" },
              expiry_date: { type: "string", description: "YYYY-MM-DD or empty" },
              mrz_lines: {
                type: "array",
                items: { type: "string" },
                description: "Every MRZ line transcribed exactly as printed, in order; empty array if no MRZ is visible.",
              },
              additional_fields: {
                type: "array",
                items: {
                  type: "object",
                  properties: { label: { type: "string" }, value: { type: "string" } },
                  required: ["label", "value"],
                },
                description: "Anything else clearly visible not covered by the named fields.",
              },
              uncertain_fields: {
                type: "array",
                items: { type: "string" },
                description: "Names of the above fields (e.g. 'document_number') the model is not fully confident about.",
              },
            },
            required: [
              "document_type",
              "first_name",
              "last_name",
              "nationality",
              "date_of_birth",
              "place_of_birth",
              "sex",
              "document_number",
              "personal_id_number",
              "issuing_country",
              "issuing_authority",
              "issue_date",
              "expiry_date",
              "mrz_lines",
              "additional_fields",
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
            ...images.map((img) => ({
              type: "image" as const,
              source: { type: "base64" as const, media_type: img.mediaType, data: img.base64 },
            })),
            { type: "text", text: PROMPT },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    console.error("[document-ocr] Anthropic API request failed with status", res.status);
    throw new Error("extraction_failed");
  }

  const data = (await res.json()) as { content?: { type: string; input?: unknown }[] };
  const toolUse = data.content?.find((b) => b.type === "tool_use");
  if (!toolUse || typeof toolUse.input !== "object" || toolUse.input === null) {
    console.error("[document-ocr] no tool_use block in response");
    throw new Error("extraction_unparseable");
  }

  const raw = toolUse.input as ToolResult;
  const mrzLines = strArray(raw.mrz_lines);

  const result: DocumentExtractionResult = {
    documentType: str(raw.document_type) || "other",
    firstName: str(raw.first_name),
    lastName: str(raw.last_name),
    nationality: str(raw.nationality),
    dob: str(raw.date_of_birth),
    placeOfBirth: str(raw.place_of_birth),
    sex: str(raw.sex),
    documentNumber: str(raw.document_number),
    personalIdNumber: str(raw.personal_id_number),
    issuingCountry: str(raw.issuing_country),
    issuingAuthority: str(raw.issuing_authority),
    issueDate: str(raw.issue_date),
    expiryDate: str(raw.expiry_date),
    additionalFields: fieldPairs(raw.additional_fields),
    mrzRaw: mrzLines.join("\n"),
    mrzFormat: "",
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
  // Handles both TD3 (passport, 2×44) and TD1 (ID card / residence permit, 3×30).
  if (mrzLines.length >= 2) {
    const mrz = parseMRZAuto(mrzLines);
    if (mrz) {
      result.mrzValid = mrz.valid;
      result.mrzFormat = mrz.format;

      const flag = (key: keyof DocumentExtractionResult, reason: string) => {
        if (!result.needsReview.includes(key)) result.needsReview.push(key);
        result.reviewReasons[key] = reason;
      };

      if (mrz.documentNumberValid && normalizeForCompare(result.documentNumber) !== normalizeForCompare(mrz.documentNumber)) {
        result.documentNumber = mrz.documentNumber; // MRZ checksum passed — more trustworthy than free-text OCR
        flag("documentNumber", "Broj dokumenta ispravljen prema MRZ zoni (proverite).");
      } else if (!mrz.documentNumberValid) {
        flag("documentNumber", "MRZ kontrolna cifra za broj dokumenta se ne poklapa.");
      }

      if (mrz.dobValid && mrz.dob && result.dob !== mrz.dob) {
        result.dob = mrz.dob;
        flag("dob", "Datum rođenja ispravljen prema MRZ zoni (proverite).");
      } else if (!mrz.dobValid) {
        flag("dob", "MRZ kontrolna cifra za datum rođenja se ne poklapa.");
      }

      if (mrz.expiryValid && mrz.expiryDate && result.expiryDate !== mrz.expiryDate) {
        result.expiryDate = mrz.expiryDate;
        flag("expiryDate", "Datum isteka ispravljen prema MRZ zoni (proverite).");
      } else if (!mrz.expiryValid) {
        flag("expiryDate", "MRZ kontrolna cifra za datum isteka se ne poklapa.");
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
