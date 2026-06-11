import "./globals.css";
import Link from "next/link";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";

export const metadata = {
  metadataBase: new URL("https://gongdeclicker.com/"),
  title: "赛博木鱼 Cyber Muyu - 在线电子木鱼功德点击器",
  description:
    "赛博木鱼 Cyber Muyu 是免费的在线电子木鱼和木鱼模拟器，点一下功德 +1，适合上班摸鱼、学习间隙和日常解压。",
  keywords: [
    "赛博木鱼",
    "Cyber Muyu",
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
    title: "赛博木鱼 Cyber Muyu - 在线电子木鱼",
    description:
      "打开网页，点击木鱼或按空格键，使用免费的在线电子木鱼给今天加一点功德。",
    url: "https://gongdeclicker.com/",
    siteName: "赛博木鱼",
    locale: "zh_CN",
    type: "website",
    images: [
      {
        url: "https://gongdeclicker.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "赛博木鱼 Cyber Muyu - 在线电子木鱼",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "赛博木鱼 Cyber Muyu - 在线电子木鱼",
    description: "在线电子木鱼解压工具，点击一下，功德 +1。",
    images: ["https://gongdeclicker.com/og-image.png"],
  },
};

const webApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "赛博木鱼",
  "alternateName": "Cyber Muyu",
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
      "name": "赛博木鱼",
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
      </head>
      <body>
        <header className="site-header">
          <Link className="brand" href="/">
            <span className="brand-mark">鱼</span>
            <span>
              <strong>赛博木鱼</strong>
              <small>Cyber Muyu</small>
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
            赛博木鱼 Cyber Muyu 是 gongdeclicker.com 的在线电子木鱼工具。
          </p>
          <p>
            <Link href="/">gongdeclicker.com</Link>
            <span aria-hidden="true"> · </span>
            <Link href="/about">关于赛博木鱼</Link>
            <span aria-hidden="true"> · </span>
            <Link href="/faq">FAQ</Link>
          </p>
        </footer>
        {process.env.VERCEL &&
        process.env.NEXT_PUBLIC_DISABLE_ANALYTICS !== "1" ? (
          <Analytics />
        ) : null}
        <Script
          id="cloudflare-insights"
          strategy="afterInteractive"
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "2ca047e8f5da4980b15b6fc1cc988554"}'
        />
      </body>
    </html>
  );
}
