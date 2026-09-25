"use client";

import { useState } from "react";
import { FileText, Trash2 } from "lucide-react";
import type { ResidentDocument } from "@/lib/residence/types";

export function DocumentsList({
  documents,
  onDeleted,
  showResidentName,
}: {
  documents: (ResidentDocument & { residentName?: string })[];
  onDeleted: (id: string) => void;
  showResidentName?: boolean;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Obrisati ovaj dokument? Ova radnja se ne može poništiti.")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/residence/documents/${id}`, { method: "DELETE" });
      if (res.ok) onDeleted(id);
    } finally {
      setBusyId(null);
    }
  }

  if (documents.length === 0) {
    return <p className="text-sm text-ink/50">Nema dokumenata.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {documents.map((doc) => (
        <li key={doc.id} className="flex items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white p-3.5">
          <div className="flex items-center gap-3">
            <FileText size={18} className="shrink-0 text-ink/40" />
            <div>
              <p className="text-sm font-medium text-ink">
                {doc.type === "passport" ? "Pasoš" : "Dokument"}
                {showResidentName && doc.residentName ? ` — ${doc.residentName}` : ""}
              </p>
              <p className="text-xs text-ink/50">
                {new Date(doc.uploadedAt).toLocaleDateString("sr-RS")} · {doc.retained ? "Original sačuvan" : "Original nije zadržan (samo podaci)"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {doc.retained && (
              <a
                href={`/api/admin/residence/documents/${doc.id}/file`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-ink/5 px-3 py-1.5 text-xs font-medium text-ink/70 hover:bg-ink/10"
              >
                Pogledaj
              </a>
            )}
            <button
              onClick={() => handleDelete(doc.id)}
              disabled={busyId === doc.id}
              className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
            >
              <Trash2 size={13} /> Obriši
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
