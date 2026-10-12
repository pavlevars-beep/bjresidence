import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { blogPosts } from "@/content/blog";

export const metadata: Metadata = {
  title: "Blog | BJ Residence Belgrade",
  description:
    "Practical guides on cheap and private accommodation in Belgrade — real prices, where budget hostels are located, and what long-term stays actually cost.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog | BJ Residence Belgrade",
    description:
      "Practical guides on cheap and private accommodation in Belgrade — real prices, where budget hostels are located, and what long-term stays actually cost.",
    url: "/blog",
    type: "website",
  },
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
}

export default function BlogIndexPage() {
  const posts = [...blogPosts].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));

  return (
    <section className="py-16 sm:py-24">
      <Container>
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-wood">Blog</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Accommodation in Belgrade, explained
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink/70">
            Honest guides on what cheap accommodation in Belgrade actually costs, where the budget beds are, and
            when a private monthly stay works out cheaper than a hostel.
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-soft transition-transform duration-200 hover:-translate-y-1"
            >
              <div className="relative h-44 w-full overflow-hidden">
                <Image
                  src={post.coverImage}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-wood">{post.category}</p>
                <h2 className="mt-2 text-lg font-semibold leading-snug text-ink group-hover:text-olive-dark">
                  {post.title}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/60">{post.excerpt}</p>
                <div className="mt-4 flex items-center gap-2 text-xs text-ink/40">
                  <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                  <span>·</span>
                  <span>{post.readingTime}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
