import { cn } from "@/lib/utils";
import type { CabinLiveStatus, ContinuationStatus, PaymentStatus, ReservationStatus, ResidentStatus } from "@/lib/residence/types";

const CABIN_STATUS: Record<CabinLiveStatus, { label: string; className: string }> = {
  available: { label: "Slobodno", className: "bg-olive-dark/10 text-olive-dark" },
  occupied: { label: "Zauzeto", className: "bg-wood/10 text-wood" },
  reserved: { label: "Rezervisano", className: "bg-blue-50 text-blue-700" },
  maintenance: { label: "Održavanje", className: "bg-red-50 text-red-700" },
};

export function CabinStatusBadge({ status }: { status: CabinLiveStatus }) {
  const { label, className } = CABIN_STATUS[status];
  return <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", className)}>{label}</span>;
}

const PAYMENT_STATUS: Record<PaymentStatus, { label: string; className: string }> = {
  current: { label: "Uredno", className: "bg-olive-dark/10 text-olive-dark" },
  due_soon: { label: "Dospeva uskoro", className: "bg-wood/10 text-wood" },
  overdue: { label: "Kasni", className: "bg-red-50 text-red-700" },
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const { label, className } = PAYMENT_STATUS[status];
  return <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", className)}>{label}</span>;
}

const CONTINUATION: Record<ContinuationStatus, { label: string; className: string }> = {
  undecided: { label: "Neodlučeno", className: "bg-ink/5 text-ink/60" },
  continuing: { label: "Nastavlja", className: "bg-olive-dark/10 text-olive-dark" },
  moving_out: { label: "Iseljava se", className: "bg-red-50 text-red-700" },
};

export function ContinuationBadge({ status }: { status: ContinuationStatus }) {
  const { label, className } = CONTINUATION[status];
  return <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", className)}>{label}</span>;
}

const RESIDENT_STATUS: Record<ResidentStatus, { label: string; className: string }> = {
  active: { label: "Aktivan", className: "bg-olive-dark/10 text-olive-dark" },
  planned: { label: "Planiran", className: "bg-blue-50 text-blue-700" },
  moved_out: { label: "Iseljen", className: "bg-ink/5 text-ink/50" },
};

export function ResidentStatusBadge({ status }: { status: ResidentStatus }) {
  const { label, className } = RESIDENT_STATUS[status];
  return <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", className)}>{label}</span>;
}

const RESERVATION_STATUS: Record<ReservationStatus, { label: string; className: string }> = {
  active: { label: "Aktivna", className: "bg-blue-50 text-blue-700" },
  cancelled: { label: "Otkazana", className: "bg-ink/5 text-ink/50" },
  converted: { label: "Pretvorena", className: "bg-olive-dark/10 text-olive-dark" },
};

export function ReservationStatusBadge({ status }: { status: ReservationStatus }) {
  const { label, className } = RESERVATION_STATUS[status];
  return <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", className)}>{label}</span>;
}
