import { readJsonBlob, writeJsonBlob } from "../blob-store";
import type { WebsiteSettings } from "./types";

const BLOB_PATH = "data/website-settings.json";

function defaults(): WebsiteSettings {
  return {
    monthlyPrice: null,
    currency: "€",
    deposit: null,
    announcementEnabled: false,
    announcementTextSr: "",
    announcementTextEn: "",
    announcementTextRu: "",
    minimumStayLabel: "",
    promoTextSr: "",
    promoTextEn: "",
    promoTextRu: "",
    acceptingInquiries: true,
    ctaTextSr: "",
    ctaTextEn: "",
    ctaTextRu: "",
    featuredNoticeSr: "",
    featuredNoticeEn: "",
    featuredNoticeRu: "",
    contactOverrideEnabled: false,
    phone: "",
    email: "",
    whatsapp: "",
    updatedAt: new Date().toISOString(),
  };
}

export async function getWebsiteSettings(): Promise<WebsiteSettings> {
  const parsed = await readJsonBlob<Partial<WebsiteSettings>>(BLOB_PATH);
  if (!parsed) return defaults();
  return { ...defaults(), ...parsed };
}

export async function setWebsiteSettings(patch: Partial<WebsiteSettings>): Promise<WebsiteSettings> {
  const current = await getWebsiteSettings();
  const next: WebsiteSettings = { ...current, ...patch, updatedAt: new Date().toISOString() };
  await writeJsonBlob(BLOB_PATH, next);
  return next;
}
