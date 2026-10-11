"use client";

/**
 * Fetches a file and triggers a real browser download — unlike a plain
 * `<a href download>`, this checks the response actually succeeded first.
 * A plain anchor with `download` saves whatever comes back verbatim, so an
 * expired session or any other JSON error response gets silently saved as
 * a file (e.g. a ".json" file instead of the expected .docx) with no
 * indication anything went wrong.
 */
export async function downloadFile(url: string, fallbackFilename: string): Promise<{ ok: true } | { ok: false; error: string }> {
  let res: Response;
  try {
    res = await fetch(url);
  } catch {
    return { ok: false, error: "Mrežna greška — pokušajte ponovo." };
  }

  if (!res.ok) {
    if (res.status === 401) return { ok: false, error: "Sesija je istekla — osvežite stranicu i prijavite se ponovo." };
    return { ok: false, error: "Preuzimanje nije uspelo — pokušajte ponovo." };
  }

  const disposition = res.headers.get("content-disposition") ?? "";
  const match = disposition.match(/filename="([^"]+)"/);
  const filename = match?.[1] ?? fallbackFilename;

  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(blobUrl);

  return { ok: true };
}
