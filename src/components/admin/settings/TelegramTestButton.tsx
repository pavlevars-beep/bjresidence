"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function TelegramTestButton({ configured }: { configured: boolean }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSend() {
    setStatus("sending");
    try {
      const res = await fetch("/api/admin/telegram/test", { method: "POST" });
      if (!res.ok) throw new Error("failed");
      setStatus("sent");
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
    }
  }

  if (!configured) {
    return <p className="text-sm text-red-700">TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID nisu podešeni.</p>;
  }

  return (
    <div className="flex items-center gap-3">
      <Button type="button" variant="outline" onClick={handleSend} disabled={status === "sending"}>
        <Send size={15} /> {status === "sending" ? "Slanje..." : "Pošalji test poruku"}
      </Button>
      {status === "sent" && <span className="text-sm text-olive-dark">Poslato — proverite Telegram.</span>}
      {status === "error" && <span className="text-sm text-red-700">Greška pri slanju.</span>}
    </div>
  );
}
