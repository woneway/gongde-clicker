export const metadata = {
  title: "联系 - 功德敲敲",
  description: "联系 Gongde Clicker，反馈问题、提出建议或沟通合作。",
};

export default function ContactPage() {
  return (
    <main className="info-page">
      <section className="info-panel">
        <p className="eyebrow">Contact</p>
        <h1>联系</h1>
        <p>
          如果你遇到页面问题、想反馈文案、提出功能建议，或希望沟通合作，
          可以通过下面的方式联系。
        </p>
        <p className="contact-line">
          <strong>微信</strong>
          <span>VVE_1001</span>
        </p>
        <p>
          <a className="mail-link" href="mailto:woneway.ww@gmail.com">
            woneway.ww@gmail.com
          </a>
        </p>
        <p>
          反馈问题时，最好附上访问地址、设备类型、浏览器和你看到的现象。
          这能帮助我们更快判断是页面、网络还是浏览器兼容问题。
        </p>
      </section>
    </main>
  );
}
