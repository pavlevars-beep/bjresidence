"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface WebsiteSettings {
  announcementEnabled: boolean;
  announcementTextSr: string;
  announcementTextEn: string;
}

export function AnnouncementBanner() {
  const { locale } = useLanguage();
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/website-settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setSettings(data))
      .catch(() => {});
  }, []);

  const text = locale === "sr" ? settings?.announcementTextSr : settings?.announcementTextEn;
  if (!settings?.announcementEnabled || !text || dismissed) return null;

  return (
    <div className="relative bg-olive-dark px-5 py-2.5 text-center text-sm font-medium text-cream sm:px-8">
      <p className="mx-auto max-w-3xl pr-6">{text}</p>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Zatvori"
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-cream/70 hover:bg-cream/10 hover:text-cream"
      >
        <X size={15} />
      </button>
    </div>
  );
}
