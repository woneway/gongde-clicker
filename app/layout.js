import "./globals.css";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/next";

export const metadata = {
  metadataBase: new URL("https://gongdeclicker.com/"),
  title: "功德敲敲 Gongde Clicker - 在线电子木鱼功德点击器",
  description:
    "功德敲敲 Gongde Clicker 是免费的在线电子木鱼和木鱼模拟器，适合上班摸鱼、学习间隙和日常解压。",
  keywords: [
    "功德敲敲",
    "Gongde Clicker",
    "在线木鱼",
    "在线电子木鱼",
    "电子木鱼",
    "功德点击器",
    "木鱼模拟器",
    "上班摸鱼",
    "上班摸鱼解压",
    "解压工具",
  ],
  alternates: {
    canonical: "https://gongdeclicker.com/",
  },
  openGraph: {
    title: "功德敲敲 Gongde Clicker - 在线电子木鱼",
    description:
      "打开网页，点击木鱼或按空格键，使用免费的在线电子木鱼给今天加一点功德。",
    url: "https://gongdeclicker.com/",
    siteName: "功德敲敲",
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "功德敲敲 Gongde Clicker - 在线电子木鱼",
    description: "在线电子木鱼解压工具，点击一下，功德 +1。",
  },
};

const webApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "功德敲敲",
  "alternateName": "Gongde Clicker",
  "url": "https://gongdeclicker.com/",
  "applicationCategory": "EntertainmentApplication",
  "operatingSystem": "Any",
  "inLanguage": "zh-CN",
  "isAccessibleForFree": true,
  "description":
    "免费的在线电子木鱼和功德点击器，适合上班摸鱼、学习间隙和日常解压。",
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "功德敲敲",
      "item": "https://gongdeclicker.com/",
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(webApplicationJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbJsonLd),
          }}
        />
        <script
          async
          crossOrigin="anonymous"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1739691894917552"
        />
        <script
          defer
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "2ca047e8f5da4980b15b6fc1cc988554"}'
        />
      </head>
      <body>
        <header className="site-header">
          <Link className="brand" href="/">
            <span className="brand-mark">功</span>
            <span>
              <strong>功德敲敲</strong>
              <small>Gongde Clicker</small>
            </span>
          </Link>
          <nav className="site-nav" aria-label="主导航">
            <Link href="/how-it-works">玩法</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/about">关于</Link>
            <Link href="/privacy">隐私</Link>
            <Link href="/contact">联系</Link>
          </nav>
        </header>
        {children}
        <footer className="site-footer">
          <p className="brand-binding">
            功德敲敲 Gongde Clicker 是 gongdeclicker.com 的在线电子木鱼工具。
          </p>
          <p>
            <Link href="/">gongdeclicker.com</Link>
            <span aria-hidden="true"> · </span>
            <Link href="/about">关于功德敲敲</Link>
            <span aria-hidden="true"> · </span>
            <Link href="/faq">FAQ</Link>
          </p>
        </footer>
        {process.env.VERCEL &&
        process.env.NEXT_PUBLIC_DISABLE_ANALYTICS !== "1" ? (
          <Analytics />
        ) : null}
      </body>
    </html>
  );
}
