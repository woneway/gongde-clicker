import { ArticleBody } from "./blog/article-body";
import { PostCard } from "./blog/post-card";
import { AdsenseUnit } from "./adsense-unit";
import { homeIntroBlocks } from "../lib/blog/home-intro";
import { getAllPosts } from "../lib/blog";

// 首页折叠线下方的原创正文区：给搜索引擎和读者足够的实质内容，
// 同时把流量引到博客文章。放在木鱼组件之后，不影响首屏聚焦。
export function HomeContent() {
  const posts = getAllPosts();

  return (
    <section className="home-content" aria-label="关于赛博木鱼">
      <div className="info-panel">
        <ArticleBody blocks={homeIntroBlocks} />
      </div>

      <div className="info-panel home-more">
        <h2>了解更多</h2>
        <div className="post-list">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </div>

      <AdsenseUnit slot="5762213705" />
    </section>
  );
}
