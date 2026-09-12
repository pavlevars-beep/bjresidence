import Image from "next/image";
import { SectionCard } from "@/components/admin/ui";

const SWATCHES: { name: string; hex: string }[] = [
  { name: "Olive dark", hex: "#59624F" },
  { name: "Beige", hex: "#E8DDCC" },
  { name: "Cream", hex: "#F7F4EE" },
  { name: "Ink", hex: "#1E1F1C" },
  { name: "Wood", hex: "#A9784E" },
];

export default function AppearancePage() {
  return (
    <SectionCard
      title="Izgled"
      description="Info Point koristi isti dizajn-sistem kao ostatak BJ Residence sajta — boje, tipografiju i logotip nije potrebno posebno podešavati."
    >
      <div className="flex items-center gap-3">
        <Image src="/images/brand/icon-mark.png" alt="" width={40} height={40} className="h-10 w-10" />
        <span className="text-lg font-bold text-ink">BJ Residence</span>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        {SWATCHES.map((s) => (
          <div key={s.hex} className="flex items-center gap-2 rounded-full border border-ink/10 bg-white py-1.5 pl-1.5 pr-3.5">
            <span className="h-6 w-6 rounded-full border border-ink/10" style={{ backgroundColor: s.hex }} />
            <span className="text-sm font-medium text-ink">{s.name}</span>
            <span className="text-xs text-ink/40">{s.hex}</span>
          </div>
        ))}
      </div>

      <p className="mt-5 text-sm text-ink/50">
        Ova stranica postoji da bi drugi budući objekti (druge rezidencije/smeštajni objekti) mogli imati sopstvenu
        paletu i logotip bez izmene koda — trenutno BJ Residence identitet je fiksan po dizajnu, jer je i sam sajt
        izlog proizvoda.
      </p>
    </SectionCard>
  );
}
