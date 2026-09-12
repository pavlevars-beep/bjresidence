"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Bus,
  MapPin,
  MessageCircle,
  MonitorSmartphone,
  ShieldAlert,
  Utensils,
  Wifi,
  Briefcase,
  type LucideIcon,
} from "lucide-react";
import { useInfoPointLanguage } from "@/i18n/InfoPointLanguageContext";
import type { InfoPointCategoryKey, InfoPointConfig } from "@/lib/info-point";
import { InfoPointHeader } from "./Header";
import { QuickActions } from "./QuickActions";
import { SearchBar } from "./SearchBar";
import { CategoryCard } from "./CategoryCard";
import { Sheet } from "./Sheet";
import { WifiSection } from "./WifiSection";
import { HouseRulesSection } from "./HouseRulesSection";
import { IssueReportForm } from "./IssueReportForm";
import { DeviceGuidesSection } from "./DeviceGuidesSection";
import { NearbySection } from "./NearbySection";
import { TransportSection } from "./TransportSection";
import { FoodDeliverySection } from "./FoodDeliverySection";
import { WorkDestinationsSection } from "./WorkDestinationsSection";
import { EmergencySection } from "./EmergencySection";
import { ContactSection } from "./ContactSection";

const CATEGORY_ICON: Record<InfoPointCategoryKey, LucideIcon> = {
  wifi: Wifi,
  houseRules: BookOpen,
  issues: AlertTriangle,
  deviceGuides: MonitorSmartphone,
  nearby: MapPin,
  transport: Bus,
  foodDelivery: Utensils,
  workDestinations: Briefcase,
  emergency: ShieldAlert,
  contact: MessageCircle,
};

export function InfoPoint({ config, isKiosk = false }: { config: InfoPointConfig; isKiosk?: boolean }) {
  const { locale, dict } = useInfoPointLanguage();
  const [openKey, setOpenKey] = useState<InfoPointCategoryKey | null>(null);

  const categories = [...config.categories].filter((c) => c.enabled).sort((a, b) => a.order - b.order);
  const enabledKeys = new Set(categories.map((c) => c.key));

  const sheetTitle = openKey ? categories.find((c) => c.key === openKey) : null;
  const title = sheetTitle ? (locale === "sr" ? sheetTitle.titleSr : sheetTitle.titleEn) : "";

  function renderSheetContent(key: InfoPointCategoryKey) {
    switch (key) {
      case "wifi":
        return <WifiSection wifi={config.wifi} />;
      case "houseRules":
        return <HouseRulesSection houseRules={config.houseRules} />;
      case "issues":
        return <IssueReportForm />;
      case "deviceGuides":
        return <DeviceGuidesSection guides={config.deviceGuides} />;
      case "nearby":
        return <NearbySection places={config.nearbyPlaces} />;
      case "transport":
        return <TransportSection routes={config.transportRoutes} taxiOptions={config.taxiOptions} />;
      case "foodDelivery":
        return <FoodDeliverySection links={config.foodLinks} />;
      case "workDestinations":
        return <WorkDestinationsSection destinations={config.workDestinations} />;
      case "emergency":
        return <EmergencySection contacts={config.emergencyContacts} />;
      case "contact":
        return <ContactSection contact={config.contact} />;
      default:
        return null;
    }
  }

  return (
    <div className="mx-auto min-h-screen max-w-xl pb-16">
      {isKiosk && (
        <Link
          href="/infopult"
          className="sticky top-0 z-40 flex items-center justify-center gap-2 bg-olive-dark px-5 py-3 text-sm font-semibold text-cream shadow-soft"
        >
          <ArrowLeft size={16} /> {dict.kiosk.backToBoard}
        </Link>
      )}

      <InfoPointHeader settings={config.settings} />

      <div className="mt-6">
        <QuickActions enabledKeys={enabledKeys} onOpen={setOpenKey} />
      </div>

      <div className="mt-5">
        <SearchBar config={config} onOpen={setOpenKey} />
      </div>

      <div className="mt-6 flex flex-col gap-3 px-5 sm:px-8">
        {categories.map((category) => {
          const Icon = CATEGORY_ICON[category.key];
          return (
            <CategoryCard
              key={category.key}
              icon={Icon}
              title={locale === "sr" ? category.titleSr : category.titleEn}
              onClick={() => setOpenKey(category.key)}
            />
          );
        })}
      </div>

      <p className="mt-8 px-5 text-center text-xs text-ink/35 sm:px-8">{dict.header.scanHint}</p>

      <Sheet open={openKey !== null} onClose={() => setOpenKey(null)} title={title}>
        {openKey && renderSheetContent(openKey)}
      </Sheet>
    </div>
  );
}
