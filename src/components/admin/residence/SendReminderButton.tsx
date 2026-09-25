"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function SendReminderButton({ notificationsEnabled }: { notificationsEnabled: boolean }) {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [result, setResult] = useState("");

  async function handleSend() {
    setStatus("sending");
    try {
      const res = await fetch("/api/admin/residence/reminders/send", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error("failed");
      setResult(`Poslato: ${data.sent}. Već poslato ranije: ${data.skippedAlreadySent}.`);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (!notificationsEnabled) {
    return (
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" disabled>
          <Send size={15} /> Pošalji podsetnike
        </Button>
        <span className="text-xs text-ink/45">Obaveštenja su isključena u Podešavanja → Obaveštenja.</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Button type="button" variant="outline" onClick={handleSend} disabled={status === "sending"}>
        <Send size={15} /> {status === "sending" ? "Slanje..." : "Pošalji podsetnike"}
      </Button>
      {status === "done" && <span className="text-sm text-olive-dark">{result}</span>}
      {status === "error" && <span className="text-sm text-red-700">Greška pri slanju.</span>}
    </div>
  );
}
