"use client";

import { AlertTriangle, BookOpen, Bus, MapPin, ShieldAlert, Wifi } from "lucide-react";
import { useInfoPointLanguage } from "@/i18n/InfoPointLanguageContext";
import type { InfoPointCategoryKey } from "@/lib/info-point";

const QUICK_ACTIONS: { key: InfoPointCategoryKey; icon: typeof Wifi }[] = [
  { key: "wifi", icon: Wifi },
  { key: "issues", icon: AlertTriangle },
  { key: "houseRules", icon: BookOpen },
  { key: "nearby", icon: MapPin },
  { key: "transport", icon: Bus },
  { key: "emergency", icon: ShieldAlert },
];

const LABEL_KEY: Record<InfoPointCategoryKey, "wifi" | "reportIssue" | "houseRules" | "nearby" | "transport" | "emergency"> = {
  wifi: "wifi",
  issues: "reportIssue",
  houseRules: "houseRules",
  nearby: "nearby",
  transport: "transport",
  emergency: "emergency",
  deviceGuides: "wifi",
  foodDelivery: "wifi",
  workDestinations: "wifi",
  contact: "wifi",
};

export function QuickActions({
  enabledKeys,
  onOpen,
}: {
  enabledKeys: Set<InfoPointCategoryKey>;
  onOpen: (key: InfoPointCategoryKey) => void;
}) {
  const { dict } = useInfoPointLanguage();
  const visible = QUICK_ACTIONS.filter((a) => enabledKeys.has(a.key));
  if (visible.length === 0) return null;

  return (
    <div className="grid grid-cols-3 gap-3 px-5 sm:px-8">
      {visible.map(({ key, icon: Icon }) => (
        <button
          key={key}
          type="button"
          onClick={() => onOpen(key)}
          className="flex flex-col items-center gap-2 rounded-2xl border border-ink/8 bg-white/70 px-2 py-4 text-center shadow-soft transition-transform active:scale-95"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-olive-dark/10 text-olive-dark">
            <Icon size={22} strokeWidth={1.8} />
          </span>
          <span className="text-xs font-semibold leading-tight text-ink sm:text-sm">{dict.quickActions[LABEL_KEY[key]]}</span>
        </button>
      ))}
    </div>
  );
}
