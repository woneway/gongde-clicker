export const metadata = {
  title: "隐私政策 - 功德敲敲 Gongde Clicker",
  description:
    "了解功德敲敲 Gongde Clicker 在线电子木鱼如何使用 localStorage、匿名统计和未来可能接入的第三方广告服务。",
  alternates: {
    canonical: "https://gongdeclicker.com/privacy",
  },
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
          这些数据保存在你的设备浏览器中，不会因为你访问网站而自动上传到我们的服务器。
        </p>
        <p>
          为了了解页面访问和功能使用情况，网站可能使用匿名统计工具记录页面访问量、点击次数和功能事件。
          这些统计用于改进体验，不用于识别具体个人。
        </p>
        <p>
          如果未来接入第三方广告、统计或内容服务，对方可能会根据其隐私政策使用 Cookie、设备信息、
          页面访问记录或类似技术来提供、衡量和改进服务。
        </p>
        <p>
          你可以通过浏览器设置清除 localStorage、限制 Cookie 或关闭部分跟踪能力。
          这样做可能会重置计数，或影响未来第三方服务的展示和统计。
        </p>
        <p>
          如果你对隐私政策或数据使用方式有疑问，可以通过联系页面提供的邮箱与我们沟通。
        </p>
      </section>
    </main>
  );
}
