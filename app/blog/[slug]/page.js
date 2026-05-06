import { notFound } from "next/navigation";
import { PublicFooter } from "../../../components/PublicFooter";
import { PublicHeader } from "../../../components/PublicHeader";
import { escapeHtml, formatDate, getAllPosts, getPostBySlug } from "../../../lib/blog";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({
    slug: `${post.slug}.html`,
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {};
  }

  return {
    title: `${post.title} | Maxine Blog`,
    description: post.description,
    alternates: {
      canonical: `https://maxine-app.com/blog/${post.slug}.html`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://maxine-app.com/blog/${post.slug}.html`,
      type: "article",
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <PublicHeader current="blog" />
      <main className="py-16">
        <article className="mx-auto max-w-3xl px-6 text-white lg:px-8">
          <p className="text-sm text-gray-300">{formatDate(post.date)}</p>
          <h1 className="mt-3 text-4xl font-medium tracking-tight sm:text-5xl">
            {post.title}
          </h1>
          <div
            className="mt-10 space-y-6 text-lg leading-8 text-white/85 [&_a]:font-semibold [&_a]:text-white [&_code]:rounded [&_code]:bg-white/10 [&_code]:px-1.5 [&_h2]:pt-6 [&_h2]:text-3xl [&_h2]:font-semibold [&_h3]:pt-4 [&_h3]:text-2xl [&_h3]:font-semibold [&_li]:ml-6 [&_li]:list-disc [&_ol_li]:list-decimal [&_p]:text-white/85 [&_strong]:text-white"
            dangerouslySetInnerHTML={{ __html: escapeUnsafePostHtml(post.html) }}
          />
        </article>
      </main>
      <PublicFooter />
    </>
  );
}

function escapeUnsafePostHtml(html) {
  // The blog helper escapes markdown content before adding its small HTML grammar.
  return html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, escapeHtml);
}
