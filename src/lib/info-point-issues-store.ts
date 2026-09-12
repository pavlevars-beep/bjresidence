import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { IssueCategory, IssueLocation, IssueReport, IssueStatus } from "./info-point-issues";

/**
 * Resident-submitted issue reports, stored separately from the main Info
 * Point content (info-point-store.ts) since these are append/patch records
 * rather than admin-authored content. Same JSON-file pattern/caveats as the
 * rest of the project's storage — see info-point-store.ts's note on Vercel.
 */
const filePath = path.join(process.cwd(), "data", "info-point-issues.json");

async function readAll(): Promise<IssueReport[]> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeAll(reports: IssueReport[]): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(reports, null, 2));
}

export async function getIssueReports(): Promise<IssueReport[]> {
  const reports = await readAll();
  return reports.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export interface NewIssueReportInput {
  category: IssueCategory;
  location: IssueLocation;
  description: string;
  photoFilename: string | null;
  residentName: string | null;
}

export async function addIssueReport(input: NewIssueReportInput): Promise<IssueReport> {
  const reports = await readAll();
  const now = new Date().toISOString();
  const report: IssueReport = {
    id: randomUUID(),
    createdAt: now,
    statusUpdatedAt: now,
    status: "new",
    ...input,
  };
  reports.push(report);
  await writeAll(reports);
  return report;
}

export async function updateIssueStatus(id: string, status: IssueStatus): Promise<IssueReport | null> {
  const reports = await readAll();
  const index = reports.findIndex((r) => r.id === id);
  if (index === -1) return null;
  reports[index] = { ...reports[index], status, statusUpdatedAt: new Date().toISOString() };
  await writeAll(reports);
  return reports[index];
}
