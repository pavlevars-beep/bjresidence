import { cn } from "@/lib/utils";
import type { BoardLocale } from "@/i18n/InfoBoardLanguageContext";

export function LanguageSwitcher({
  locale,
  setLocale,
}: {
  locale: BoardLocale;
  setLocale: (l: BoardLocale) => void;
}) {
  return (
    <div className="flex items-center rounded-full border border-ink/10 bg-white/60 p-1 text-sm font-semibold">
      <button
        type="button"
        onClick={() => setLocale("sr")}
        className={cn(
          "select-none rounded-full px-4 py-2 transition-colors",
          locale === "sr" ? "bg-olive-dark text-cream" : "text-ink/50"
        )}
      >
        SR
      </button>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={cn(
          "select-none rounded-full px-4 py-2 transition-colors",
          locale === "en" ? "bg-olive-dark text-cream" : "text-ink/50"
        )}
      >
        EN
      </button>
    </div>
  );
}
