import { siteConfig } from "@/config/site";
import type { Cabin, ContractSettings, Resident, Stay } from "./types";

/**
 * Every variable a contract template may reference, with where its value
 * comes from — shown to the admin as the "template variable → data source"
 * mapping table, and used to flag unknown placeholders on template upload.
 */
export interface ContractVariableDef {
  key: string;
  label: string;
  source: string;
  required: boolean;
}

export const CONTRACT_VARIABLES: ContractVariableDef[] = [
  { key: "contract_date", label: "Datum ugovora", source: "Datum generisanja ugovora", required: true },
  { key: "resident_first_name", label: "Ime gosta", source: "Resident.firstName", required: true },
  { key: "resident_last_name", label: "Prezime gosta", source: "Resident.lastName", required: true },
  { key: "resident_full_name", label: "Ime i prezime gosta", source: "Resident.firstName + lastName", required: true },
  { key: "nationality", label: "Državljanstvo", source: "Resident.nationality", required: false },
  { key: "date_of_birth", label: "Datum rođenja", source: "Resident.dob", required: true },
  { key: "place_of_birth", label: "Mesto rođenja", source: "Resident.placeOfBirth", required: false },
  { key: "sex", label: "Pol", source: "Resident.sex", required: false },
  { key: "passport_number", label: "Broj pasoša", source: "Resident.passportNumber", required: true },
  { key: "passport_country", label: "Zemlja izdavanja pasoša", source: "Resident.passportCountry", required: false },
  { key: "passport_issue_date", label: "Datum izdavanja pasoša", source: "Resident.passportIssueDate", required: false },
  { key: "passport_expiry", label: "Datum isteka pasoša", source: "Resident.passportExpiryDate", required: false },
  { key: "cabin_number", label: "Broj kabine", source: "Cabin.number", required: true },
  { key: "cabin_name", label: "Naziv kabine", source: "Cabin.name", required: true },
  { key: "move_in_date", label: "Datum useljenja", source: "Stay.moveInDate", required: true },
  { key: "expected_move_out_date", label: "Očekivani datum iseljenja", source: "Stay.expectedMoveOutDate", required: false },
  { key: "expected_stay_label", label: "Očekivano trajanje boravka", source: "Stay.estimatedDurationLabel", required: false },
  { key: "monthly_rent", label: "Mesečna kirija", source: "Stay.monthlyRent", required: true },
  { key: "deposit_amount", label: "Iznos depozita", source: "Payment (deposit) / podrazumevana vrednost", required: true },
  { key: "currency", label: "Valuta", source: "Stay.currency", required: true },
  { key: "payment_date", label: "Datum prve uplate", source: "Payment (rent) / datum useljenja", required: false },
  { key: "property_name", label: "Naziv objekta", source: "Podešavanja sajta (siteConfig.brand.name)", required: true },
  { key: "property_address", label: "Adresa objekta", source: "Podešavanja sajta (siteConfig.location.address)", required: true },
  { key: "landlord_name", label: "Naziv/ime izdavaoca", source: "Podešavanja ugovora (ContractSettings.landlordName)", required: false },
  { key: "landlord_address", label: "Adresa izdavaoca", source: "Podešavanja ugovora (ContractSettings.landlordAddress)", required: false },
  { key: "landlord_id", label: "MB/PIB izdavaoca", source: "Podešavanja ugovora (ContractSettings.landlordId)", required: false },
];

export const KNOWN_VARIABLE_KEYS = new Set(CONTRACT_VARIABLES.map((v) => v.key));
export const REQUIRED_VARIABLE_KEYS = CONTRACT_VARIABLES.filter((v) => v.required).map((v) => v.key);

export interface BuildVariablesInput {
  resident: Resident;
  stay: Stay;
  cabin: Cabin;
  contractSettings: ContractSettings;
  initialPaymentDate?: string | null;
  depositAmount?: number | null;
}

/** Deterministic — no AI involved. Same inputs always produce the same output. */
export function buildContractVariables(input: BuildVariablesInput): Record<string, string> {
  const { resident, stay, cabin, contractSettings } = input;

  return {
    contract_date: new Date().toISOString().slice(0, 10),
    resident_first_name: resident.firstName,
    resident_last_name: resident.lastName,
    resident_full_name: `${resident.firstName} ${resident.lastName}`.trim(),
    nationality: resident.nationality,
    date_of_birth: resident.dob,
    place_of_birth: resident.placeOfBirth,
    sex: resident.sex,
    passport_number: resident.passportNumber,
    passport_country: resident.passportCountry,
    passport_issue_date: resident.passportIssueDate,
    passport_expiry: resident.passportExpiryDate,
    cabin_number: String(cabin.number),
    cabin_name: cabin.name,
    move_in_date: stay.moveInDate,
    expected_move_out_date: stay.expectedMoveOutDate ?? "",
    expected_stay_label: stay.estimatedDurationLabel,
    monthly_rent: String(stay.monthlyRent),
    deposit_amount: input.depositAmount != null ? String(input.depositAmount) : "",
    currency: stay.currency,
    payment_date: input.initialPaymentDate ?? stay.moveInDate,
    property_name: siteConfig.brand.name,
    property_address: siteConfig.location.address,
    landlord_name: contractSettings.landlordName,
    landlord_address: contractSettings.landlordAddress,
    landlord_id: contractSettings.landlordId,
  };
}

export function findMissingRequiredVariables(variables: Record<string, string>): ContractVariableDef[] {
  return CONTRACT_VARIABLES.filter((v) => v.required && !variables[v.key]);
}
