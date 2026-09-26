/**
 * Deterministic TD3 (passport, 2×44-char) MRZ parser per ICAO Doc 9303 —
 * used to cross-check Claude's vision-based extraction, since the MRZ is a
 * checksum-validated, structured source that a vision model can still
 * misread (0/O, 1/I, 5/S confusions in particular).
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
