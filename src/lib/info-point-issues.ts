export type IssueCategory =
  | "electricity"
  | "plumbing"
  | "climate"
  | "internet"
  | "furniture"
  | "cleaning"
  | "other";

export type IssueLocation = "room" | "kitchen" | "bathroom" | "living_room" | "hallway" | "other";

export type IssueStatus = "new" | "in_progress" | "resolved";

export interface IssueReport {
  id: string;
  createdAt: string;
  category: IssueCategory;
  location: IssueLocation;
  description: string;
  photoFilename: string | null;
  residentName: string | null;
  status: IssueStatus;
  statusUpdatedAt: string;
}

export const ISSUE_CATEGORIES: IssueCategory[] = [
  "electricity",
  "plumbing",
  "climate",
  "internet",
  "furniture",
  "cleaning",
  "other",
];

export const ISSUE_LOCATIONS: IssueLocation[] = [
  "room",
  "kitchen",
  "bathroom",
  "living_room",
  "hallway",
  "other",
];

export const ISSUE_STATUSES: IssueStatus[] = ["new", "in_progress", "resolved"];
