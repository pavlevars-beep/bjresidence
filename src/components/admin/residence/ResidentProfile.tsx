"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Field, inputClass, SectionCard } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { ContinuationBadge, ResidentStatusBadge } from "./status-badges";
import { PaymentForm } from "./PaymentForm";
import { StayDecisionControl } from "./StayDecisionControl";
import { MoveCabinModal } from "./MoveCabinModal";
import { DocumentsList } from "./DocumentsList";
import { ContractsSection } from "./ContractsSection";
import type { Cabin, Contract, Payment, Resident, ResidentDocument, Stay } from "@/lib/residence/types";

const PAYMENT_TYPE_LABEL: Record<string, string> = {
  rent: "Kirija",
  deposit: "Depozit",
  other: "Ostalo",
  deposit_return: "Povraćaj depozita",
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ResidentProfile({
  resident: initialResident,
  stays: initialStays,
  payments: initialPayments,
  documents: initialDocuments,
  contracts: initialContracts,
  cabins,
}: {
  resident: Resident;
  stays: Stay[];
  payments: Payment[];
  documents: ResidentDocument[];
  contracts: Contract[];
  cabins: Cabin[];
  /** @deprecated depositHeld is now recomputed live from `payments` so deletes/adds reflect instantly. */
  depositHeld?: number;
}) {
  const router = useRouter();
  const [resident, setResident] = useState(initialResident);
  const [stays, setStays] = useState(initialStays);
  const [payments, setPayments] = useState(initialPayments);
  const [documents, setDocuments] = useState(initialDocuments);

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showMoveCabin, setShowMoveCabin] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState(resident.notes);
  const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(null);

  const cabinById = new Map(cabins.map((c) => [c.id, c]));
  const activeStay = stays.find((s) => s.status === "active") ?? null;
  const activeCabin = activeStay ? cabinById.get(activeStay.cabinId) : null;
  const sortedStays = [...stays].sort((a, b) => b.moveInDate.localeCompare(a.moveInDate));
  const sortedPayments = [...payments].sort((a, b) => b.paymentDate.localeCompare(a.paymentDate));
  const totalRentPaid = payments.filter((p) => p.type === "rent").reduce((s, p) => s + p.amount, 0);
  // Recomputed from the live payments list (not the server-provided initial
  // value) so a delete/add immediately reflects here without a full reload.
  const depositHeld =
    payments.filter((p) => p.type === "deposit").reduce((s, p) => s + p.amount, 0) -
    payments.filter((p) => p.type === "deposit_return").reduce((s, p) => s + p.amount, 0);

  async function handleDeletePayment(id: string) {
    if (!confirm("Obrisati ovu uplatu? Ova radnja se ne može poništiti.")) return;
    setDeletingPaymentId(id);
    try {
      const res = await fetch(`/api/admin/residence/payments/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPayments((prev) => prev.filter((p) => p.id !== id));
      }
    } finally {
      setDeletingPaymentId(null);
    }
  }

  function upsertStay(updated: Stay) {
    setStays((prev) => {
      const idx = prev.findIndex((s) => s.id === updated.id);
      if (idx === -1) return [...prev, updated];
      const next = [...prev];
      next[idx] = updated;
      return next;
    });
  }

  async function handleEndStay() {
    if (!activeStay) return;
    const date = prompt("Datum iseljenja (GGGG-MM-DD):", todayISO());
    if (!date) return;
    const res = await fetch(`/api/admin/residence/stays/${activeStay.id}/end`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actualMoveOutDate: date }),
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      upsertStay(data.stay);
      setResident((r) => ({ ...r, status: "moved_out" }));
      router.refresh();
    }
  }

  async function handleSaveNotes() {
    const res = await fetch(`/api/admin/residence/residents/${resident.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: notesDraft }),
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      setResident(data.resident);
      setEditingNotes(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-ink">{resident.firstName} {resident.lastName}</h1>
            <ResidentStatusBadge status={resident.status} />
          </div>
          <p className="mt-1 text-sm text-ink/55">{activeCabin ? `Kabina ${activeCabin.name}` : "Bez dodeljene kabine"}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {activeStay && (
            <>
              <Button type="button" variant="outline" onClick={() => setShowPaymentForm((v) => !v)}>Dodaj uplatu</Button>
              <Button type="button" variant="outline" onClick={() => setShowMoveCabin((v) => !v)}>Premesti kabinu</Button>
              <Button type="button" variant="outline" onClick={handleEndStay}>Završi boravak</Button>
            </>
          )}
        </div>
      </div>

      {showPaymentForm && activeStay && (
        <PaymentForm
          residentId={resident.id}
          cabinId={activeStay.cabinId}
          stayId={activeStay.id}
          currency={activeStay.currency}
          onSaved={(p) => {
            setPayments((prev) => [...prev, p]);
            setShowPaymentForm(false);
            router.refresh();
          }}
          onCancel={() => setShowPaymentForm(false)}
        />
      )}

      {showMoveCabin && activeStay && (
        <MoveCabinModal
          stay={activeStay}
          cabins={cabins}
          onMoved={({ endedStay, newStay }) => {
            upsertStay(endedStay);
            upsertStay(newStay);
            setShowMoveCabin(false);
            router.refresh();
          }}
          onCancel={() => setShowMoveCabin(false)}
        />
      )}

      {activeStay && (
        <SectionCard title="Trenutni boravak">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">Useljenje</p>
              <p className="mt-1 text-sm text-ink">{activeStay.moveInDate}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">Trenutni plaćeni period</p>
              <p className="mt-1 text-sm text-ink">{activeStay.currentPeriodStart} → {activeStay.currentPeriodEnd}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">Mesečna kirija</p>
              <p className="mt-1 text-sm text-ink">{activeStay.monthlyRent} {activeStay.currency}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">Očekivano iseljenje</p>
              <p className="mt-1 text-sm text-ink">{activeStay.expectedMoveOutDate ?? "—"}</p>
            </div>
          </div>
          <div className="mt-5">
            <StayDecisionControl stay={activeStay} onUpdated={upsertStay} />
          </div>
        </SectionCard>
      )}

      <SectionCard title="Finansijski pregled">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">Ukupno plaćena kirija</p>
            <p className="mt-1 text-lg font-semibold text-ink">{totalRentPaid} {activeStay?.currency ?? "€"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">Depozit na čuvanju</p>
            <p className="mt-1 text-lg font-semibold text-ink">{depositHeld} {activeStay?.currency ?? "€"}</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Istorija uplata">
        {sortedPayments.length === 0 ? (
          <p className="text-sm text-ink/50">Još nema uplata.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {sortedPayments.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white p-3.5">
                <div>
                  <p className="text-sm font-medium text-ink">{PAYMENT_TYPE_LABEL[p.type]} — {p.amount} {p.currency}</p>
                  <p className="text-xs text-ink/50">
                    {p.paymentDate}{p.periodFrom && p.periodTo ? ` · Period: ${p.periodFrom} – ${p.periodTo}` : ""}
                  </p>
                </div>
                <button
                  onClick={() => handleDeletePayment(p.id)}
                  disabled={deletingPaymentId === p.id}
                  className="flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                >
                  <Trash2 size={13} /> Obriši
                </button>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard title="Dokumenta">
        <DocumentsList
          documents={documents}
          onDeleted={(id) => setDocuments((prev) => prev.filter((d) => d.id !== id))}
        />
      </SectionCard>

      <SectionCard title="Ugovori">
        <ContractsSection
          residentId={resident.id}
          stayId={(activeStay ?? sortedStays[0])?.id ?? null}
          contracts={initialContracts}
        />
      </SectionCard>

      <SectionCard title="Istorija boravaka">
        {sortedStays.length === 0 ? (
          <p className="text-sm text-ink/50">Nema boravaka.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {sortedStays.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white p-3.5">
                <span className="text-sm text-ink">{cabinById.get(s.cabinId)?.name ?? "—"}</span>
                <span className="text-xs text-ink/50">{s.moveInDate} → {s.actualMoveOutDate ?? (s.status === "active" ? "sada" : "—")}</span>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard
        title="Napomene"
        headerRight={
          editingNotes ? (
            <div className="flex gap-2">
              <Button type="button" onClick={handleSaveNotes}>Sačuvaj</Button>
              <Button type="button" variant="ghost" onClick={() => { setEditingNotes(false); setNotesDraft(resident.notes); }}>Otkaži</Button>
            </div>
          ) : (
            <Button type="button" variant="outline" onClick={() => setEditingNotes(true)}>Izmeni</Button>
          )
        }
      >
        {editingNotes ? (
          <Field label="Napomena">
            <textarea value={notesDraft} onChange={(e) => setNotesDraft(e.target.value)} rows={3} className={inputClass} />
          </Field>
        ) : (
          <p className="text-sm text-ink/70">{resident.notes || "Nema napomena."}</p>
        )}
      </SectionCard>

      {activeStay && (
        <p className="text-xs text-ink/40">
          Odluka o nastavku: <ContinuationBadge status={activeStay.continuationStatus} />
        </p>
      )}
    </div>
  );
}
