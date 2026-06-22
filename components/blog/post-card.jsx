import Link from "next/link";

// 文章卡片：博客列表页与首页「了解更多」共用，保证样式一致。
export function PostCard({ post }) {
  return (
    <article className="post-card">
      <Link className="post-card-link" href={`/blog/${post.slug}`}>
        <h2>{post.title}</h2>
      </Link>
      <p className="post-meta">
        {post.date}
        <span aria-hidden="true"> · </span>
        约 {post.readingMinutes} 分钟
      </p>
      <p>{post.excerpt}</p>
      {post.tags?.length ? (
        <p className="post-tags">
          {post.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </p>
      ) : null}
    </article>
  );
}
