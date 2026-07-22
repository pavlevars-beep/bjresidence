"use client";

import { MessageCircle } from "lucide-react";
import { siteConfig } from "@/config/site";
import { whatsappLink } from "@/lib/utils";

export function WhatsAppFloat() {
  return (
    <a
      href={whatsappLink(siteConfig.contact.whatsapp)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
      className="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-card transition-transform hover:scale-105 lg:bottom-6"
    >
      <MessageCircle size={26} strokeWidth={2} />
    </a>
  );
}
