"use client";

import { useState } from "react";
import { DocumentsList } from "./DocumentsList";
import type { ResidentDocument } from "@/lib/residence/types";

export function DocumentsClient({ initial }: { initial: (ResidentDocument & { residentName: string })[] }) {
  const [documents, setDocuments] = useState(initial);
  return (
    <DocumentsList
      documents={documents}
      onDeleted={(id) => setDocuments((prev) => prev.filter((d) => d.id !== id))}
      showResidentName
    />
  );
}
