import { AdsenseUnit } from "../../components/adsense-unit";

export const metadata = {
  title: "关于赛博木鱼 Cyber Muyu - 在线电子木鱼解压工具",
  description:
    "了解赛博木鱼 Cyber Muyu 这个在线电子木鱼、功德点击器和上班摸鱼解压工具的用途、设计原则和使用边界。",
  alternates: {
    canonical: "https://gongdeclicker.com/about",
  },
};

export default function AboutPage() {
  return (
    <main className="info-page">
      <section className="info-panel">
        <p className="eyebrow">About</p>
        <h1>关于赛博木鱼</h1>
        <p>
          Cyber Muyu / 赛博木鱼 是一个在线电子木鱼解压工具。打开网页，
          点击木鱼或按空格键，就能给今天的精神状态加一点功德。
        </p>
        <p>
          它适合放在工作间隙、学习休息、等待构建、开会前后这些短暂空档里使用。
          你不需要注册，也不需要完成任务，只要用一个很小的动作把注意力从紧绷里抽出来。
        </p>
        <p>
          这里的功德计数是一种玩笑式表达，不代表真实宗教功德、修行成果或任何精神承诺。
          我们更关心的是：页面打开够快、反馈够清楚、使用起来不打扰。
        </p>
        <p>
          网站会继续保持轻量。后续如果接入广告或统计，也会优先避免影响主要点击区域，
          并在隐私政策中说明相关第三方服务。
        </p>
      </section>

      <AdsenseUnit slot="5762213705" />
    </main>
  );
}
