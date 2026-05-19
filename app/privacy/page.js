export const metadata = {
  title: "隐私政策 - 功德敲敲",
};

export default function PrivacyPage() {
  return (
    <main className="info-page">
      <section className="info-panel">
        <p className="eyebrow">Privacy</p>
        <h1>隐私政策</h1>
        <p>功德敲敲不提供账号系统，不需要登录，也不会主动收集你的个人身份信息。</p>
        <p>
          网站会使用浏览器 localStorage 保存今日功德、累计功德和最高连击，用于在同一设备上保留你的计数。
        </p>
        <p>
          为了了解页面访问和功能使用情况，网站可能使用匿名统计工具记录页面访问量、点击次数和功能事件。
          这些统计用于改进体验，不用于识别具体个人。
        </p>
        <p>
          如果未来接入第三方内容或服务，对方可能会根据其隐私政策使用 Cookie 或类似技术。
        </p>
      </section>
    </main>
  );
}
