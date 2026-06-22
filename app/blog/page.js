import { getAllPosts } from "../../lib/blog";
import { PostCard } from "../../components/blog/post-card";
import { AdsenseUnit } from "../../components/adsense-unit";

export const metadata = {
  title: "木鱼文化与解压指南 - 赛博木鱼 Cyber Muyu",
  description:
    "关于电子木鱼、功德文化与解压方法的原创文章：木鱼的由来、功德与福德、赛博木鱼爆红简史，以及上班摸鱼微休息指南。",
  alternates: {
    canonical: "https://gongdeclicker.com/blog",
  },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "赛博木鱼 · 木鱼文化与解压指南",
    url: "https://gongdeclicker.com/blog",
    inLanguage: "zh-CN",
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      datePublished: post.date,
      url: `https://gongdeclicker.com/blog/${post.slug}`,
      description: post.description,
    })),
  };

  return (
    <main className="info-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      <section className="info-panel">
        <p className="eyebrow">Blog</p>
        <h1>木鱼文化与解压指南</h1>
        <p>
          关于电子木鱼、功德文化与日常解压的原创文章。从木鱼为什么是鱼形，到「功德」与「福德」的区别，
          再到敲木鱼到底能不能解压——把这个小工具背后的来龙去脉讲清楚。
        </p>
        <div className="post-list">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>

      <AdsenseUnit slot="5762213705" />
    </main>
  );
}
