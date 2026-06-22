import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "../../../lib/blog";
import { ArticleBody } from "../../../components/blog/article-body";
import { AdsenseUnit } from "../../../components/adsense-unit";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    return {};
  }

  const url = `https://gongdeclicker.com/blog/${post.slug}`;
  return {
    title: `${post.title} - 赛博木鱼 Cyber Muyu`,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: "article",
      locale: "zh_CN",
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    notFound();
  }

  const url = `https://gongdeclicker.com/blog/${post.slug}`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    inLanguage: "zh-CN",
    datePublished: post.date,
    dateModified: post.date,
    mainEntityOfPage: url,
    author: { "@type": "Organization", name: "赛博木鱼 Cyber Muyu" },
    publisher: {
      "@type": "Organization",
      name: "赛博木鱼 Cyber Muyu",
      url: "https://gongdeclicker.com/",
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "赛博木鱼", item: "https://gongdeclicker.com/" },
      { "@type": "ListItem", position: 2, name: "文章", item: "https://gongdeclicker.com/blog" },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };

  return (
    <main className="info-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <article className="info-panel article">
        <p className="eyebrow">Blog</p>
        <h1>{post.title}</h1>
        <p className="post-meta">
          {post.date}
          <span aria-hidden="true"> · </span>
          约 {post.readingMinutes} 分钟
        </p>

        <ArticleBody blocks={post.blocks} />

        {post.faq?.length ? (
          <section className="article-faq" aria-label="常见问题">
            <h2>常见问题</h2>
            {post.faq.map((item) => (
              <div className="faq-item" key={item.q}>
                <h3>{item.q}</h3>
                <p>{item.a}</p>
              </div>
            ))}
          </section>
        ) : null}

        {post.sources?.length ? (
          <section className="article-sources" aria-label="参考资料">
            <h2>参考资料</h2>
            <ul>
              {post.sources.map((source) => (
                <li key={source.url}>
                  <a href={source.url} target="_blank" rel="noopener noreferrer nofollow">
                    {source.title}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <p className="article-back">
          <Link href="/blog">← 返回文章列表</Link>
        </p>
      </article>

      <AdsenseUnit slot="5762213705" />
    </main>
  );
}
