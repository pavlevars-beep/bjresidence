"use client";

import { useEffect, useState } from "react";
import { SectionCard, inputClass } from "../ui";
import { ISSUE_STATUSES, type IssueReport, type IssueStatus } from "@/lib/info-point-issues";

const STATUS_LABEL: Record<IssueStatus, string> = {
  new: "Novo",
  in_progress: "U toku",
  resolved: "Rešeno",
};

const STATUS_COLOR: Record<IssueStatus, string> = {
  new: "bg-red-50 text-red-700",
  in_progress: "bg-wood/10 text-wood",
  resolved: "bg-olive-dark/10 text-olive-dark",
};

export function IssueReportsPanel() {
  const [reports, setReports] = useState<IssueReport[] | null>(null);

  useEffect(() => {
    fetch("/api/admin/info-point/issues")
      .then((res) => res.json())
      .then((data) => setReports(data.reports ?? []));
  }, []);

  async function changeStatus(id: string, status: IssueStatus) {
    setReports((rs) => rs?.map((r) => (r.id === id ? { ...r, status } : r)) ?? null);
    await fetch(`/api/admin/info-point/issues/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  return (
    <SectionCard title="Prijave kvarova" description="Sve prijave poslate kroz Info Point.">
      {!reports ? (
        <p className="text-sm text-ink/40">Učitavanje...</p>
      ) : reports.length === 0 ? (
        <p className="text-sm text-ink/40">Nema prijava.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map((report) => (
            <div key={report.id} className="rounded-2xl border border-ink/10 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-ink/45">{new Date(report.createdAt).toLocaleString("sr-RS")}</span>
                <select
                  value={report.status}
                  onChange={(e) => changeStatus(report.id, e.target.value as IssueStatus)}
                  className={`${inputClass} w-auto`}
                >
                  {ISSUE_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLOR[report.status]}`}>
                  {STATUS_LABEL[report.status]}
                </span>
                <span className="rounded-full bg-ink/5 px-2.5 py-1 text-xs font-medium text-ink/60">{report.category}</span>
                <span className="rounded-full bg-ink/5 px-2.5 py-1 text-xs font-medium text-ink/60">{report.location}</span>
              </div>
              <p className="mt-2 text-sm text-ink/75">{report.description}</p>
              {report.residentName && <p className="mt-1 text-xs text-ink/45">{report.residentName}</p>}
              {report.photoFilename && (
                <a
                  href={`/api/info-point/uploads/${report.photoFilename}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-xs font-medium text-olive-dark underline"
                >
                  Pogledaj fotografiju
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
