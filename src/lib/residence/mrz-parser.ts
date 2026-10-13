/**
 * Deterministic MRZ parsers per ICAO Doc 9303 — used to cross-check Claude's
 * vision-based extraction, since the MRZ is a checksum-validated, structured
 * source that a vision model can still misread (0/O, 1/I, 5/S confusions in
 * particular). Covers TD3 (passports, 2×44-char) and TD1 (national ID cards
 * and residence permits, 3×30-char — e.g. Serbian biometric lična karta and
 * boravišna dozvola both print this on the back).
 */

export interface MrzParseResult {
  valid: boolean; // both lines well-formed and the composite check digit matches
  surname: string;
  givenNames: string;
  passportNumber: string;
  passportNumberValid: boolean;
  issuingCountry: string;
  nationality: string;
  dob: string; // ISO date, "" if unparseable
  dobValid: boolean;
  sex: string; // "M" | "F" | ""
  expiryDate: string; // ISO date, "" if unparseable
  expiryValid: boolean;
}

function charValue(c: string): number {
  if (c === "<") return 0;
  if (c >= "0" && c <= "9") return c.charCodeAt(0) - 48;
  if (c >= "A" && c <= "Z") return c.charCodeAt(0) - 55; // A=10 ... Z=35
  return 0;
}

function computeCheckDigit(input: string): number {
  const weights = [7, 3, 1];
  let sum = 0;
  for (let i = 0; i < input.length; i++) {
    sum += charValue(input[i]) * weights[i % 3];
  }
  return sum % 10;
}

function checkDigitMatches(field: string, digit: string): boolean {
  const expected = Number(digit);
  if (!Number.isInteger(expected)) return false;
  return computeCheckDigit(field) === expected;
}

function mrzDateToISO(yymmdd: string, assumePast: boolean): string {
  if (!/^\d{6}$/.test(yymmdd)) return "";
  const yy = Number(yymmdd.slice(0, 2));
  const mm = Number(yymmdd.slice(2, 4));
  const dd = Number(yymmdd.slice(4, 6));
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return "";

  let century: number;
  if (assumePast) {
    const currentYY = new Date().getFullYear() % 100;
    century = yy > currentYY ? 1900 : 2000;
  } else {
    century = 2000; // expiry dates are always modern-era
  }
  const year = century + yy;
  return `${year}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
}

function parseNameField(field: string): { surname: string; givenNames: string } {
  const parts = field.split("<<");
  const surname = parts[0].replace(/</g, " ").trim();
  const givenNames = (parts[1] ?? "").replace(/</g, " ").trim();
  return { surname, givenNames };
}

/** Returns null if the input clearly isn't two 44-char TD3 MRZ lines. */
export function parseMRZ(rawLine1: string, rawLine2: string): MrzParseResult | null {
  const line1 = rawLine1.trim().toUpperCase();
  const line2 = rawLine2.trim().toUpperCase();
  if (line1.length !== 44 || line2.length !== 44) return null;
  if (line1[0] !== "P") return null;

  const issuingCountry = line1.slice(2, 5).replace(/</g, "");
  const { surname, givenNames } = parseNameField(line1.slice(5));

  const passportField = line2.slice(0, 9);
  const passportCheck = line2[9];
  const passportNumber = passportField.replace(/</g, "");
  const passportNumberValid = checkDigitMatches(passportField, passportCheck);

  const nationality = line2.slice(10, 13).replace(/</g, "");

  const dobField = line2.slice(13, 19);
  const dobCheck = line2[19];
  const dobValid = checkDigitMatches(dobField, dobCheck);
  const dob = mrzDateToISO(dobField, true);

  const sexChar = line2[20];
  const sex = sexChar === "M" || sexChar === "F" ? sexChar : "";

  const expiryField = line2.slice(21, 27);
  const expiryCheck = line2[27];
  const expiryValid = checkDigitMatches(expiryField, expiryCheck);
  const expiryDate = mrzDateToISO(expiryField, false);

  const composite = line2.slice(0, 10) + line2.slice(13, 20) + line2.slice(21, 43);
  const compositeCheck = line2[43];
  const compositeValid = checkDigitMatches(composite, compositeCheck);

  return {
    valid: compositeValid && passportNumberValid && dobValid && expiryValid,
    surname,
    givenNames,
    passportNumber,
    passportNumberValid,
    issuingCountry,
    nationality,
    dob,
    dobValid,
    sex,
    expiryDate,
    expiryValid,
  };
}

export interface MrzTD1ParseResult {
  valid: boolean; // composite check digit matches (document number, DOB and expiry individually valid too)
  surname: string;
  givenNames: string;
  documentNumber: string;
  documentNumberValid: boolean;
  issuingCountry: string;
  nationality: string;
  dob: string;
  dobValid: boolean;
  sex: string;
  expiryDate: string;
  expiryValid: boolean;
}

/**
 * TD1 — 3 lines × 30 chars, used on ID cards and residence-permit cards
 * (as opposed to TD3's 2×44 used on passport photo pages).
 */
export function parseMRZTD1(rawLine1: string, rawLine2: string, rawLine3: string): MrzTD1ParseResult | null {
  const line1 = rawLine1.trim().toUpperCase();
  const line2 = rawLine2.trim().toUpperCase();
  const line3 = rawLine3.trim().toUpperCase();
  if (line1.length !== 30 || line2.length !== 30 || line3.length !== 30) return null;

  const issuingCountry = line1.slice(2, 5).replace(/</g, "");

  const docNumberField = line1.slice(5, 14);
  const docNumberCheck = line1[14];
  const documentNumber = docNumberField.replace(/</g, "");
  const documentNumberValid = checkDigitMatches(docNumberField, docNumberCheck);
  const optional1 = line1.slice(15, 30);

  const dobField = line2.slice(0, 6);
  const dobCheck = line2[6];
  const dobValid = checkDigitMatches(dobField, dobCheck);
  const dob = mrzDateToISO(dobField, true);

  const sexChar = line2[7];
  const sex = sexChar === "M" || sexChar === "F" ? sexChar : "";

  const expiryField = line2.slice(8, 14);
  const expiryCheck = line2[14];
  const expiryValid = checkDigitMatches(expiryField, expiryCheck);
  const expiryDate = mrzDateToISO(expiryField, false);

  const nationality = line2.slice(15, 18).replace(/</g, "");
  const optional2 = line2.slice(18, 29);
  const compositeCheck = line2[29];

  const composite = line1.slice(5, 30) + line2.slice(0, 7) + line2.slice(8, 15) + optional2;
  const compositeValid = checkDigitMatches(composite, compositeCheck);

  const { surname, givenNames } = parseNameField(line3);

  void optional1; // not currently surfaced — some issuers put a personal/JMBG-style number here

  return {
    valid: compositeValid && documentNumberValid && dobValid && expiryValid,
    surname,
    givenNames,
    documentNumber,
    documentNumberValid,
    issuingCountry,
    nationality,
    dob,
    dobValid,
    sex,
    expiryDate,
    expiryValid,
  };
}

export interface MrzNormalized {
  format: "TD3" | "TD1";
  valid: boolean;
  surname: string;
  givenNames: string;
  documentNumber: string;
  documentNumberValid: boolean;
  issuingCountry: string;
  nationality: string;
  dob: string;
  dobValid: boolean;
  sex: string;
  expiryDate: string;
  expiryValid: boolean;
}

/**
 * Tries to parse whatever MRZ lines were transcribed, regardless of document
 * type — 2 lines of 44 chars (TD3 passport) or 3 lines of 30 chars (TD1 ID
 * card / residence permit). Returns null if the lines don't match either
 * shape (e.g. no MRZ was visible on the document at all).
 */
export function parseMRZAuto(rawLines: string[]): MrzNormalized | null {
  const lines = rawLines.map((l) => l.trim()).filter(Boolean);

  if (lines.length >= 2) {
    const td3 = parseMRZ(lines[0], lines[1]);
    if (td3) {
      return {
        format: "TD3",
        valid: td3.valid,
        surname: td3.surname,
        givenNames: td3.givenNames,
        documentNumber: td3.passportNumber,
        documentNumberValid: td3.passportNumberValid,
        issuingCountry: td3.issuingCountry,
        nationality: td3.nationality,
        dob: td3.dob,
        dobValid: td3.dobValid,
        sex: td3.sex,
        expiryDate: td3.expiryDate,
        expiryValid: td3.expiryValid,
      };
    }
  }

  if (lines.length >= 3) {
    const td1 = parseMRZTD1(lines[0], lines[1], lines[2]);
    if (td1) return { format: "TD1", ...td1 };
  }

  return null;
}
