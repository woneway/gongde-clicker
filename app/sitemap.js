import { getAllPosts } from "../lib/blog";

// 静态导出（output: export）要求显式声明。
export const dynamic = "force-static";

const BASE = "https://gongdeclicker.com";

// 动态生成 sitemap（静态导出时输出为 /sitemap.xml），自动包含全部博客文章。
export default function sitemap() {
  const staticEntries = [
    { path: "/", changeFrequency: "weekly", priority: 1.0, lastModified: "2026-06-21" },
    { path: "/blog", changeFrequency: "weekly", priority: 0.8, lastModified: "2026-06-21" },
    { path: "/about", changeFrequency: "monthly", priority: 0.5, lastModified: "2026-05-26" },
    { path: "/how-it-works", changeFrequency: "monthly", priority: 0.5, lastModified: "2026-05-26" },
    { path: "/faq", changeFrequency: "monthly", priority: 0.5, lastModified: "2026-05-26" },
    { path: "/privacy", changeFrequency: "monthly", priority: 0.4, lastModified: "2026-05-26" },
    { path: "/contact", changeFrequency: "monthly", priority: 0.4, lastModified: "2026-05-26" },
  ].map((entry) => ({
    url: `${BASE}${entry.path}`,
    lastModified: entry.lastModified,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));

  const postEntries = getAllPosts().map((post) => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: post.date,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticEntries, ...postEntries];
}
