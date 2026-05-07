import Link from "next/link";
import { PublicFooter } from "../../components/PublicFooter";
import { PublicHeader } from "../../components/PublicHeader";
import { formatDate, getAllPosts } from "../../lib/blog";

export const metadata = {
  title: "Maxine Blog",
  description: "Training tips, programming guides, and practical gym advice from Maxine.",
  alternates: {
    canonical: "https://maxine-app.com/blog/",
  },
};

export default function BlogIndexPage() {
  const posts = getAllPosts().slice(0, 10);

  return (
    <>
      <PublicHeader current="blog" />
      <main>
        <section className="py-20 sm:py-16 lg:pb-16">
          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            <h1 className="text-4xl font-medium tracking-tight text-white sm:text-5xl">
              Maxine Blog
            </h1>
            <p className="mt-4 text-lg text-white/80">
              Practical gym content, written in plain language. No fluff, just useful things you can use in your next workout.
            </p>
            <div className="mt-10 space-y-6">
              {posts.map((post) => (
                <article
                  className="rounded-3xl bg-white/5 p-8 shadow-sm ring-1 ring-white/20"
                  key={post.slug}
                >
                  <p className="text-sm text-gray-300">{formatDate(post.date)}</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    <Link className="hover:text-gray-200" href={`/blog/${post.slug}.html`}>
                      {post.title}
                    </Link>
                  </h2>
                  <p className="mt-4 text-white/80">
                    {post.firstParagraph || post.description}
                  </p>
                  <p className="mt-6 text-sm font-semibold text-white">
                    <Link href={`/blog/${post.slug}.html`}>Read more -&gt;</Link>
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
