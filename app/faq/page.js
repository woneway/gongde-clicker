export const metadata = {
  title: "FAQ - 功德敲敲",
  description: "了解 Gongde Clicker 的计数、隐私、键盘操作和使用边界。",
};

const faqs = [
  {
    question: "Gongde Clicker 是什么？",
    answer:
      "它是一个轻量的在线电子木鱼工具。你可以点击木鱼或按空格键，给今天加一点玩笑式的功德计数，用来放松、转移注意力或给工作间隙一个小仪式。",
  },
  {
    question: "这个网站收费吗？",
    answer:
      "当前网站免费使用，不需要注册账号，也不需要下载应用。后续如果接入广告，广告只会用于支持网站维护，不会改变核心点击功能。",
  },
  {
    question: "网站会保存我的个人信息吗？",
    answer:
      "不会主动收集你的姓名、手机号或账号信息。今日功德、累计功德和最高连击保存在你自己的浏览器 localStorage 里，用来让同一台设备记住计数。",
  },
  {
    question: "可以用键盘操作吗？",
    answer:
      "可以。打开页面后按空格键即可敲木鱼。为了避免打字时误触，如果焦点在输入框、文本域或选择框里，空格键不会触发敲击。",
  },
  {
    question: "为什么今日功德会重置？",
    answer:
      "今日功德会按你设备的本地日期重置，这样每天都可以从零开始。累计功德和最高连击会继续保留在同一浏览器里。",
  },
  {
    question: "这是宗教服务吗？",
    answer:
      "不是。功德敲敲是一个带有中文互联网幽默感的解压小工具，不提供宗教指导，也不代表真实功德、修行成果或任何精神承诺。",
  },
];

export default function FaqPage() {
  return (
    <main className="info-page">
      <section className="info-panel">
        <p className="eyebrow">FAQ</p>
        <h1>常见问题</h1>
        <div className="faq-list">
          {faqs.map((item) => (
            <article className="faq-item" key={item.question}>
              <h2>{item.question}</h2>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
