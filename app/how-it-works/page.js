import { AdsenseUnit } from "../../components/adsense-unit";

export const metadata = {
  title: "在线电子木鱼玩法说明 - 赛博木鱼 Cyber Muyu",
  description:
    "了解赛博木鱼 Cyber Muyu 在线电子木鱼如何计数、保存数据、播放声音、支持空格键敲击和每日重置。",
  alternates: {
    canonical: "https://gongdeclicker.com/how-it-works",
  },
};

const steps = [
  {
    title: "敲一下",
    text: "点击页面中央的木鱼，或按键盘空格键。每次敲击都会让今日功德和累计功德增加一。",
  },
  {
    title: "连起来",
    text: "连续敲击会显示连击提示。停顿一小会儿后连击会归零，但最高连击会保留在当前浏览器里。",
  },
  {
    title: "留在本机",
    text: "计数保存在浏览器 localStorage 中，不需要登录，也不会同步到其他设备。清理浏览器数据后，计数可能会被删除。",
  },
  {
    title: "每天重来",
    text: "今日功德按照你设备的本地日期重置。累计功德会继续保留，让你能看到长期的轻松小记录。",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="info-page">
      <section className="info-panel">
        <p className="eyebrow">How it works</p>
        <h1>玩法说明</h1>
        <p>
          Cyber Muyu 的核心很简单：给一个日常的小动作配上即时反馈，
          让休息、摸鱼或切换状态时多一点轻松感。
        </p>
        <div className="step-list">
          {steps.map((step, index) => (
            <article className="step-item" key={step.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h2>{step.title}</h2>
                <p>{step.text}</p>
              </div>
            </article>
          ))}
        </div>
        <p>
          声音由浏览器实时生成，震动反馈取决于你的设备和浏览器权限。
          如果设备不支持这些能力，点击计数仍然会正常工作。
        </p>
      </section>

      <AdsenseUnit slot="5762213705" />
    </main>
  );
}
