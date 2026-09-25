import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { MobileStickyCta } from "@/components/layout/MobileStickyCta";
import { AnnouncementBanner } from "@/components/layout/AnnouncementBanner";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pb-16 lg:pb-0">
      <AnnouncementBanner />
      <Header />
      <main>{children}</main>
      <Footer />
      <WhatsAppFloat />
      <MobileStickyCta />
    </div>
  );
}
