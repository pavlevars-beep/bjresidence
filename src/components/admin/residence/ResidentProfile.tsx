"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { Field, inputClass, SectionCard } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { ContinuationBadge, ResidentStatusBadge } from "./status-badges";
import { PaymentForm } from "./PaymentForm";
import { ResidentEditForm } from "./ResidentEditForm";
import { StayEditForm } from "./StayEditForm";
import { StayDecisionControl } from "./StayDecisionControl";
import { MoveCabinModal } from "./MoveCabinModal";
import { StartStayModal } from "./StartStayModal";
import { DocumentsList } from "./DocumentsList";
import { DocumentOcrPanel, type ExtractedDocumentFields } from "./DocumentOcrPanel";
import { ContractsSection } from "./ContractsSection";
import { formatDateDisplay } from "@/lib/residence/date-math";
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
  const [showStartStay, setShowStartStay] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [showAddDocument, setShowAddDocument] = useState(false);
  const [addingDocument, setAddingDocument] = useState(false);
  const [notesDraft, setNotesDraft] = useState(resident.notes);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(null);
  const [editingResident, setEditingResident] = useState(false);
  const [deletingResident, setDeletingResident] = useState(false);
  const [editingActiveStay, setEditingActiveStay] = useState(false);
  const [editingStayId, setEditingStayId] = useState<string | null>(null);
  const [deletingStayId, setDeletingStayId] = useState<string | null>(null);

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

  async function handleDeleteStay(id: string) {
    if (!confirm("Obrisati ovaj boravak? Sve uplate vezane za njega biće takođe obrisane. Ova radnja se ne može poništiti.")) return;
    setDeletingStayId(id);
    try {
      const res = await fetch(`/api/admin/residence/stays/${id}`, { method: "DELETE" });
      if (res.ok) {
        setStays((prev) => prev.filter((s) => s.id !== id));
        setPayments((prev) => prev.filter((p) => p.stayId !== id));
      }
    } finally {
      setDeletingStayId(null);
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

  async function handleAddDocument(documentType: string, fields: ExtractedDocumentFields, retain: boolean, files: File[]) {
    setAddingDocument(true);
    try {
      const formData = new FormData();
      formData.append("residentId", resident.id);
      formData.append("type", documentType);
      formData.append("retain", String(retain));
      const flatSnapshot: Record<string, string> = {};
      for (const [key, value] of Object.entries(fields)) {
        if (key === "additionalFields") continue;
        if (typeof value === "string" && value) flatSnapshot[key] = value;
      }
      for (const pair of fields.additionalFields) {
        flatSnapshot[`extra_${pair.label}`] = pair.value;
      }
      formData.append("extractedFieldsSnapshot", JSON.stringify(flatSnapshot));
      if (retain) {
        for (const file of files) formData.append("images", file);
      }
      const res = await fetch("/api/admin/residence/documents", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.ok && Array.isArray(data.documents)) {
        setDocuments((prev) => [...data.documents, ...prev]);
        setShowAddDocument(false);
      }
    } finally {
      setAddingDocument(false);
    }
  }

  async function handleDeleteResident() {
    if (
      !confirm(
        `Obrisati gosta ${resident.firstName} ${resident.lastName}? Ovo trajno briše i sve njihove boravke, uplate, dokumenta i ugovore. Ova radnja se ne može poništiti.`
      )
    )
      return;
    setDeletingResident(true);
    try {
      const res = await fetch(`/api/admin/residence/residents/${resident.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/admin/residence/residents");
      } else {
        setDeletingResident(false);
      }
    } catch {
      setDeletingResident(false);
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
          {activeStay ? (
            <>
              <Button type="button" variant="outline" onClick={() => setShowPaymentForm((v) => !v)}>Dodaj uplatu</Button>
              <Button type="button" variant="outline" onClick={() => setShowMoveCabin((v) => !v)}>Premesti kabinu</Button>
              <Button type="button" variant="outline" onClick={handleEndStay}>Završi boravak</Button>
            </>
          ) : (
            <Button type="button" onClick={() => setShowStartStay((v) => !v)}>Dodeli kabinu / pokreni boravak</Button>
          )}
          <button
            type="button"
            onClick={handleDeleteResident}
            disabled={deletingResident}
            className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            <Trash2 size={15} /> {deletingResident ? "Brisanje..." : "Obriši gosta"}
          </button>
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

      {showStartStay && !activeStay && (
        <StartStayModal
          residentId={resident.id}
          cabins={cabins}
          onStarted={({ stay, resident: updatedResident }) => {
            upsertStay(stay);
            setResident(updatedResident);
            setShowStartStay(false);
            router.refresh();
          }}
          onCancel={() => setShowStartStay(false)}
        />
      )}

      <SectionCard
        title="Osnovni podaci i identifikacija"
        headerRight={
          !editingResident && (
            <Button type="button" variant="outline" onClick={() => setEditingResident(true)}>
              <Pencil size={13} /> Izmeni
            </Button>
          )
        }
      >
        {editingResident ? (
          <ResidentEditForm
            resident={resident}
            onSaved={(updated) => {
              setResident(updated);
              setEditingResident(false);
            }}
            onCancel={() => setEditingResident(false)}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">Državljanstvo</p>
              <p className="mt-1 text-sm text-ink">{resident.nationality || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">Datum rođenja</p>
              <p className="mt-1 text-sm text-ink">{formatDateDisplay(resident.dob) || "—"}{resident.placeOfBirth ? `, ${resident.placeOfBirth}` : ""}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">Telefon / Email</p>
              <p className="mt-1 text-sm text-ink">{resident.phone || "—"}{resident.email ? ` · ${resident.email}` : ""}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">Broj pasoša</p>
              <p className="mt-1 text-sm text-ink">{resident.passportNumber || "—"}{resident.passportCountry ? ` (${resident.passportCountry})` : ""}</p>
            </div>
          </div>
        )}
      </SectionCard>

      {activeStay && (
        <SectionCard
          title="Trenutni boravak"
          headerRight={
            !editingActiveStay && (
              <Button type="button" variant="outline" onClick={() => setEditingActiveStay(true)}>
                <Pencil size={13} /> Izmeni
              </Button>
            )
          }
        >
          {editingActiveStay ? (
            <StayEditForm
              stay={activeStay}
              onSaved={(updated) => {
                upsertStay(updated);
                setEditingActiveStay(false);
              }}
              onCancel={() => setEditingActiveStay(false)}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">Useljenje</p>
                <p className="mt-1 text-sm text-ink">{formatDateDisplay(activeStay.moveInDate)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">Trenutni plaćeni period</p>
                <p className="mt-1 text-sm text-ink">{formatDateDisplay(activeStay.currentPeriodStart)} → {formatDateDisplay(activeStay.currentPeriodEnd)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">Mesečna kirija</p>
                <p className="mt-1 text-sm text-ink">{activeStay.monthlyRent} {activeStay.currency}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">Očekivano iseljenje</p>
                <p className="mt-1 text-sm text-ink">{formatDateDisplay(activeStay.expectedMoveOutDate) || "—"}</p>
              </div>
            </div>
          )}
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
            {sortedPayments.map((p) =>
              editingPaymentId === p.id ? (
                <li key={p.id}>
                  <PaymentForm
                    residentId={p.residentId}
                    cabinId={p.cabinId}
                    stayId={p.stayId}
                    currency={p.currency}
                    initial={p}
                    onSaved={(updated) => {
                      setPayments((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
                      setEditingPaymentId(null);
                    }}
                    onCancel={() => setEditingPaymentId(null)}
                  />
                </li>
              ) : (
                <li key={p.id} className="flex items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white p-3.5">
                  <div>
                    <p className="text-sm font-medium text-ink">{PAYMENT_TYPE_LABEL[p.type]} — {p.amount} {p.currency}</p>
                    <p className="text-xs text-ink/50">
                      {formatDateDisplay(p.paymentDate)}{p.periodFrom && p.periodTo ? ` · Period: ${formatDateDisplay(p.periodFrom)} – ${formatDateDisplay(p.periodTo)}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => setEditingPaymentId(p.id)}
                      className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-ink/60 hover:bg-ink/5"
                    >
                      <Pencil size={13} /> Izmeni
                    </button>
                    <button
                      onClick={() => handleDeletePayment(p.id)}
                      disabled={deletingPaymentId === p.id}
                      className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={13} /> Obriši
                    </button>
                  </div>
                </li>
              )
            )}
          </ul>
        )}
      </SectionCard>

      <SectionCard
        title="Dokumenta"
        headerRight={
          !showAddDocument && (
            <button
              type="button"
              onClick={() => setShowAddDocument(true)}
              className="rounded-full bg-ink/5 px-3 py-1.5 text-xs font-medium text-ink/70 hover:bg-ink/10"
            >
              + Dodaj dokument
            </button>
          )
        }
      >
        {showAddDocument && (
          <div className="mb-4">
            <DocumentOcrPanel onConfirm={handleAddDocument} />
            {addingDocument && <p className="mt-2 text-xs text-ink/50">Čuvanje...</p>}
            <button
              type="button"
              onClick={() => setShowAddDocument(false)}
              className="mt-2 text-xs font-medium text-ink/50 hover:underline"
            >
              Otkaži
            </button>
          </div>
        )}
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
            {sortedStays.map((s) =>
              editingStayId === s.id ? (
                <li key={s.id}>
                  <StayEditForm
                    stay={s}
                    onSaved={(updated) => {
                      upsertStay(updated);
                      setEditingStayId(null);
                    }}
                    onCancel={() => setEditingStayId(null)}
                  />
                </li>
              ) : (
                <li key={s.id} className="flex items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white p-3.5">
                  <div>
                    <span className="text-sm text-ink">{cabinById.get(s.cabinId)?.name ?? "—"}</span>
                    <span className="ml-2 text-xs text-ink/50">{formatDateDisplay(s.moveInDate)} → {s.actualMoveOutDate ? formatDateDisplay(s.actualMoveOutDate) : (s.status === "active" ? "sada" : "—")}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => setEditingStayId(s.id)}
                      className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-ink/60 hover:bg-ink/5"
                    >
                      <Pencil size={13} /> Izmeni
                    </button>
                    <button
                      onClick={() => handleDeleteStay(s.id)}
                      disabled={deletingStayId === s.id}
                      className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={13} /> Obriši
                    </button>
                  </div>
                </li>
              )
            )}
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
