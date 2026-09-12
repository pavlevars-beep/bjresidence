"use client";

import { Mail, MessageCircle, Navigation, Phone } from "lucide-react";
import { useInfoPointLanguage } from "@/i18n/InfoPointLanguageContext";
import type { ContactInfo } from "@/lib/info-point";

export function ContactSection({ contact }: { contact: ContactInfo }) {
  const { dict } = useInfoPointLanguage();

  return (
    <div className="flex flex-col gap-3">
      {contact.managerName && (
        <p className="text-sm text-ink/60">
          {dict.contact.manager}: <span className="font-medium text-ink">{contact.managerName}</span>
        </p>
      )}

      {contact.phone && (
        <a href={`tel:${contact.phone.replace(/\s+/g, "")}`} className="flex items-center gap-3 rounded-2xl border border-ink/8 bg-white p-4">
          <Phone size={18} className="text-olive-dark" />
          <span className="font-medium text-ink">{contact.phone}</span>
        </a>
      )}

      {contact.whatsapp && (
        <a
          href={`https://wa.me/${contact.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-2xl border border-ink/8 bg-white p-4"
        >
          <MessageCircle size={18} className="text-olive-dark" />
          <span className="font-medium text-ink">WhatsApp</span>
        </a>
      )}

      {contact.viber && (
        <a
          href={`viber://chat?number=${contact.viber}`}
          className="flex items-center gap-3 rounded-2xl border border-ink/8 bg-white p-4"
        >
          <MessageCircle size={18} className="text-olive-dark" />
          <span className="font-medium text-ink">Viber</span>
        </a>
      )}

      {contact.email && (
        <a href={`mailto:${contact.email}`} className="flex items-center gap-3 rounded-2xl border border-ink/8 bg-white p-4">
          <Mail size={18} className="text-olive-dark" />
          <span className="font-medium text-ink">{contact.email}</span>
        </a>
      )}

      {contact.address && (
        <div className="rounded-2xl border border-ink/8 bg-white p-4">
          <p className="text-sm text-ink/60">{contact.address}</p>
          {contact.mapsUrl && (
            <a
              href={contact.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-olive-dark px-3 py-1.5 text-sm font-medium text-cream"
            >
              <Navigation size={14} /> {dict.common.openMaps}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
