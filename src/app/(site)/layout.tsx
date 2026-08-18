import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { MobileStickyCta } from "@/components/layout/MobileStickyCta";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pb-16 lg:pb-0">
      <Header />
      <main>{children}</main>
      <Footer />
      <WhatsAppFloat />
      <MobileStickyCta />
    </div>
  );
}
