import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { BlogSection } from "@/content/blog";
import { LinkButton } from "@/components/ui/Button";

export function BlogArticleBody({ sections }: { sections: BlogSection[] }) {
  return (
    <div className="space-y-5">
      {sections.map((section, i) => {
        switch (section.type) {
          case "h2":
            return (
              <h2 key={i} className="pt-4 text-2xl font-semibold tracking-tight text-ink sm:text-[28px]">
                {section.text}
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} className="pt-2 text-lg font-semibold text-ink">
                {section.text}
              </h3>
            );
          case "p":
            return (
              <p key={i} className="text-base leading-relaxed text-ink/75">
                {section.text}
              </p>
            );
          case "ul":
            return (
              <ul key={i} className="list-disc space-y-2 pl-5 text-base leading-relaxed text-ink/75">
                {section.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            );
          case "cta":
            return <BlogCta key={i} />;
          case "sources":
            return (
              <div key={i} className="mt-10 border-t border-ink/10 pt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">Sources</p>
                <ul className="mt-2 space-y-1 text-xs leading-relaxed text-ink/40">
                  {section.items.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

function BlogCta() {
  return (
    <div className="my-6 flex flex-col items-start gap-4 rounded-3xl bg-olive-dark/10 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-olive-dark">BJ Residence</p>
        <p className="mt-1 max-w-md text-base text-ink/75">
          A private room, a quiet residential address in Braće Jerković, and one monthly rate — built for stays of a
          month or longer.
        </p>
      </div>
      <LinkButton href="/#booking" className="shrink-0">
        Check availability <ArrowRight size={16} />
      </LinkButton>
    </div>
  );
}

export function BlogBackLink() {
  return (
    <Link href="/blog" className="text-sm font-medium text-olive-dark hover:underline">
      ← Back to the blog
    </Link>
  );
}
