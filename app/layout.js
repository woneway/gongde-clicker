import "./globals.css";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/next";

export const metadata = {
  title: "功德敲敲 - 上班摸鱼，在线敲木鱼",
  description: "Gongde Clicker 是一个搞笑解压的在线电子木鱼功德点击器。",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
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
