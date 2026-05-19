export const metadata = {
  title: "联系 - 功德敲敲",
};

export default function ContactPage() {
  return (
    <main className="info-page">
      <section className="info-panel">
        <p className="eyebrow">Contact</p>
        <h1>联系</h1>
        <p>如果你想反馈梗、提出建议或聊聊合作，可以先联系：</p>
        <p className="contact-line">
          <strong>微信</strong>
          <span>VVE_1001</span>
        </p>
        <p>
          <a className="mail-link" href="mailto:woneway.ww@gmail.com">
            woneway.ww@gmail.com
          </a>
        </p>
      </section>
    </main>
  );
}
