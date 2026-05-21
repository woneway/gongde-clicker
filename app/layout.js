import "./globals.css";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/next";

export const metadata = {
  metadataBase: new URL("https://gongdeclicker.com/"),
  title: "功德敲敲 - 上班摸鱼，在线敲木鱼",
  description: "Gongde Clicker 是一个搞笑解压的在线电子木鱼功德点击器。",
  keywords: [
    "功德敲敲",
    "Gongde Clicker",
    "在线木鱼",
    "电子木鱼",
    "功德点击器",
    "木鱼模拟器",
    "上班摸鱼",
    "解压工具",
  ],
  alternates: {
    canonical: "https://gongdeclicker.com/",
  },
  openGraph: {
    title: "功德敲敲 - 上班摸鱼，在线敲木鱼",
    description: "打开网页，点击木鱼或按空格键，给今天加一点功德。",
    url: "https://gongdeclicker.com/",
    siteName: "功德敲敲",
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "功德敲敲 - 上班摸鱼，在线敲木鱼",
    description: "在线电子木鱼解压工具，点击一下，功德 +1。",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <head>
        <script
          async
          crossOrigin="anonymous"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1739691894917552"
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
        {process.env.GITHUB_PAGES !== "1" ? <Analytics /> : null}
      </body>
    </html>
  );
}
