import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { BlogArticleBody, BlogBackLink } from "@/components/blog/BlogArticleBody";
import { blogPosts, getBlogPost } from "@/content/blog";
import { siteConfig } from "@/config/site";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getBlogPost(params.slug);
  if (!post) return {};

  return {
    title: post.seoTitle ?? `${post.title} | BJ Residence Blog`,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      images: [{ url: post.coverImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [post.coverImage],
    },
  };
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getBlogPost(params.slug);
  if (!post) notFound();

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    image: `${siteConfig.url}${post.coverImage}`,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { "@type": "Organization", name: siteConfig.brand.name },
    publisher: { "@type": "Organization", name: siteConfig.brand.name },
    mainEntityOfPage: `${siteConfig.url}/blog/${post.slug}`,
  };

  const faqSection = post.sections.find((s) => s.type === "faq");
  const faqSchema =
    faqSection && faqSection.type === "faq"
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqSection.items.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }
      : null;

  return (
    <article className="py-16 sm:py-24">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <Container className="max-w-2xl">
        <BlogBackLink />

        <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-wood">{post.category}</p>
        <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
          {post.title}
        </h1>
        <div className="mt-3 flex items-center gap-2 text-sm text-ink/50">
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          <span>·</span>
          <span>{post.readingTime}</span>
        </div>

        <div className="relative mt-8 h-56 w-full overflow-hidden rounded-3xl sm:h-72">
          <Image src={post.coverImage} alt="" fill priority className="object-cover" />
        </div>

        <div className="mt-10">
          <BlogArticleBody sections={post.sections} />
        </div>
      </Container>
    </article>
  );
}
