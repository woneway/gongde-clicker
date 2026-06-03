"use client";

import { useEffect, useRef } from "react";

const AD_CLIENT = "ca-pub-1739691894917552";

// 响应式 AdSense 展示广告单元。
// adsbygoogle.js 已在 app/layout.js 全局加载，这里只负责渲染 <ins> 并触发一次 push。
export function AdsenseUnit({ slot, format = "auto", responsive = true }) {
  const pushed = useRef(false);

  useEffect(() => {
    // React 严格模式下 effect 会执行两次，ref 保证同一广告位只 push 一次，
    // 否则 adsbygoogle 会报 "already have ads in them"。
    if (pushed.current) {
      return;
    }

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // 脚本可能被广告拦截插件阻断或尚未就绪，属于外部不可恢复情况，
      // 不影响页面其余功能，保持静默即可。
    }
  }, []);

  return (
    <aside className="ad-slot" aria-label="赞助广告">
      <span className="ad-slot-label">广告</span>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </aside>
  );
}
