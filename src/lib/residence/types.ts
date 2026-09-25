/**
 * Residence Management data model — private, admin-only. Every collection is
 * a JSON array persisted via blob-store.ts (Vercel Blob private access in
 * prod, local file in dev), matching every other store in the project.
 *
 * Cabin occupancy/reservation status is deliberately NOT stored here — see
 * derive.ts. Storing it would require every Stay/Reservation transition to
 * remember to keep it in sync, and a missed code path would silently lie.
 */

export interface Cabin {
  id: string;
  number: number;
  name: string;
  maintenanceFlag: boolean;
  maintenanceNote: string;
  monthlyRentDefault: number;
  currency: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type ResidentStatus = "active" | "planned" | "moved_out";

export interface Resident {
  id: string;
  firstName: string;
  lastName: string;
  nationality: string;
  dob: string; // ISO date, "" if unknown
  phone: string;
  email: string;
  notes: string;
  status: ResidentStatus;
  // Identification
  passportNumber: string;
  passportCountry: string;
  passportIssueDate: string;
  passportExpiryDate: string;
  otherDocType: string;
  otherDocNumber: string;
  createdAt: string;
  updatedAt: string;
}

export type StayStatus = "active" | "planned" | "ended";
export type ContinuationStatus = "undecided" | "continuing" | "moving_out";

export interface Stay {
  id: string;
  residentId: string;
  cabinId: string;
  moveInDate: string; // ISO date
  estimatedDurationLabel: string;
  expectedMoveOutDate: string | null;
  actualMoveOutDate: string | null;
  status: StayStatus;
  monthlyRent: number;
  currency: string;
  // Current paid-through period, derived from the latest rent Payment.
  currentPeriodStart: string;
  currentPeriodEnd: string;
  continuationStatus: ContinuationStatus;
  /** Dedupe marker for the 7-day reminder — cleared whenever the period advances. */
  reminder7dSentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type PaymentType = "rent" | "deposit" | "other" | "deposit_return";

export interface Payment {
  id: string;
  residentId: string;
  cabinId: string;
  stayId: string;
  type: PaymentType;
  amount: number;
  currency: string;
  paymentDate: string; // ISO date
  periodFrom: string | null;
  periodTo: string | null;
  method: string;
  note: string;
  createdAt: string;
}

export type ReservationStatus = "active" | "cancelled" | "converted";

export interface Reservation {
  id: string;
  cabinId: string;
  residentName: string;
  residentId: string | null;
  startDate: string;
  expectedEndDate: string | null;
  price: number;
  deposit: number;
  currency: string;
  notes: string;
  status: ReservationStatus;
  convertedStayId: string | null;
  convertedResidentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export type DocumentType = "passport" | "other";

export interface ResidentDocument {
  id: string;
  residentId: string;
  type: DocumentType;
  blobPathname: string;
  originalFilename: string;
  contentType: string;
  uploadedAt: string;
  /** Whether the original image is kept. Default false — privacy-by-default. */
  retained: boolean;
  /** The confirmed structured fields at upload time, for audit — never the raw image. */
  extractedFieldsSnapshot: Record<string, string> | null;
}

export interface ActivityLogEntry {
  id: string;
  at: string;
  action: string;
  summary: string;
  entityType: string;
  entityId: string;
}

export interface WebsiteSettings {
  monthlyPrice: number | null;
  currency: string;
  deposit: number | null;
  announcementEnabled: boolean;
  announcementTextSr: string;
  announcementTextEn: string;
  minimumStayLabel: string;
  promoTextSr: string;
  promoTextEn: string;
  acceptingInquiries: boolean;
  ctaTextSr: string;
  ctaTextEn: string;
  featuredNoticeSr: string;
  featuredNoticeEn: string;
  contactOverrideEnabled: boolean;
  phone: string;
  email: string;
  whatsapp: string;
  updatedAt: string;
}

export interface NotificationSettings {
  paymentReminder: boolean;
  stayContinuationDecision: boolean;
  expectedMoveOut: boolean;
  overduePayment: boolean;
  updatedAt: string;
}

export type PaymentStatus = "current" | "due_soon" | "overdue";

/** Computed, never stored — see derive.ts. */
export type CabinLiveStatus = "available" | "occupied" | "reserved" | "maintenance";
