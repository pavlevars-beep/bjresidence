import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getBlogPost, type BlogSection } from "@/content/blog";
import { LinkButton } from "@/components/ui/Button";
import { CompanyQuoteCta } from "./CompanyQuoteCta";

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
          case "ol":
            return (
              <ol key={i} className="list-decimal space-y-2 pl-5 text-base leading-relaxed text-ink/75">
                {section.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ol>
            );
          case "table":
            return (
              <div key={i} className="overflow-x-auto rounded-2xl border border-ink/10">
                <table className="w-full min-w-[420px] border-collapse text-sm">
                  <thead>
                    <tr className="bg-beige/50">
                      {section.headers.map((h, j) => (
                        <th key={j} className="px-4 py-3 text-left font-semibold text-ink">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.rows.map((row, j) => (
                      <tr key={j} className={j % 2 === 1 ? "bg-beige/20" : ""}>
                        {row.map((cell, k) => (
                          <td key={k} className={`px-4 py-3 text-ink/80 ${k === 0 ? "" : "font-medium text-ink"}`}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {section.note && <p className="border-t border-ink/10 bg-cream/60 px-4 py-2.5 text-xs text-ink/50">{section.note}</p>}
              </div>
            );
          case "faq":
            return (
              <div key={i} className="space-y-5">
                {section.items.map((item, j) => (
                  <div key={j}>
                    <h3 className="text-base font-semibold text-ink">{item.q}</h3>
                    <p className="mt-1.5 text-base leading-relaxed text-ink/75">{item.a}</p>
                  </div>
                ))}
              </div>
            );
          case "image":
            return (
              <figure key={i} className="my-2">
                <div className="relative h-56 w-full overflow-hidden rounded-3xl sm:h-72">
                  <Image src={section.src} alt={section.alt} fill className="object-cover" />
                </div>
                {section.caption && (
                  <figcaption className="mt-2 text-center text-xs text-ink/45">{section.caption}</figcaption>
                )}
              </figure>
            );
          case "relatedPost": {
            const related = getBlogPost(section.slug);
            if (!related) return null;
            return (
              <Link
                key={i}
                href={`/blog/${related.slug}`}
                className="group my-2 flex items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-beige/30 px-5 py-4 transition-colors hover:border-olive-dark/30 hover:bg-beige/50"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-wood">Related reading</p>
                  <p className="mt-1 text-sm font-medium text-ink">{related.title}</p>
                </div>
                <ArrowRight size={18} className="shrink-0 text-ink/40 transition-transform group-hover:translate-x-0.5" />
              </Link>
            );
          }
          case "cta":
            return <BlogCta key={i} />;
          case "companyCta":
            return <CompanyQuoteCta key={i} />;
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
