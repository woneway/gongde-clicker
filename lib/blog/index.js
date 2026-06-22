import cyberMuyuHistory from "./posts/cyber-muyu-history";
import gongdeVsFude from "./posts/gongde-vs-fude";
import muyuWhyFish from "./posts/muyu-why-fish";
import tappingAndStressRelief from "./posts/tapping-and-stress-relief";
import muyuVsMeditationApps from "./posts/muyu-vs-meditation-apps";
import officeMicroBreakGuide from "./posts/office-micro-break-guide";

// 新增文章时：在 posts/ 下加一个数据文件，再在此 import 并加入数组。
// 日期相同的文章保持数组顺序（Array.sort 在现代引擎中是稳定的）。
const posts = [
  cyberMuyuHistory,
  gongdeVsFude,
  muyuWhyFish,
  tappingAndStressRelief,
  muyuVsMeditationApps,
  officeMicroBreakGuide,
];

export const allPosts = [...posts].sort((a, b) =>
  a.date < b.date ? 1 : a.date > b.date ? -1 : 0
);

export function getAllPosts() {
  return allPosts;
}

export function getPostBySlug(slug) {
  return allPosts.find((post) => post.slug === slug) || null;
}
