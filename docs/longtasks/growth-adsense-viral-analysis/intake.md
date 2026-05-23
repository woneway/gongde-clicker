# Longtask Intake: growth-adsense-viral-analysis

## Requirement
用户需要了解当前 Gongde Clicker 项目是否已经具备推广基础，并评估通过 Google AdSense 获利前，产品本身能否引发用户主动使用、复访和病毒式传播。当前阶段先做 intake 和事实基线，不直接进入改版实现。

## Context
- 项目是 Next.js App Router 站点，入口为 `app/page.js`，核心产品组件为 `components/gongde-clicker.jsx`。
- 当前首页已实现电子木鱼点击、空格键敲击、本地今日/累计/最高连击计数、声音、震动、浮动反馈、阶段进度、每日功德签、成就、今日愿望、复制分享文案、保存愿望功德图。
- 增长逻辑集中在 `lib/gongde-growth.js`：每日签、默认愿望、成就、分享文案、愿望本地存储和归一化。
- 分享图逻辑集中在 `lib/wish-card.js`，测试覆盖在 `test/wish-card.test.js`。
- AdSense 审核面已经有 `app/how-it-works/page.js`、`app/faq/page.js`、`app/about/page.js`、`app/privacy/page.js`、`app/contact/page.js`，导航在 `app/layout.js` 暴露这些页面，`public/sitemap.xml` 和 `public/robots.txt` 可供抓取。
- `app/layout.js` 当前已加载 AdSense 脚本：`pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1739691894917552`。
- 现有设计文档显示项目已经做过 AdSense-ready、local growth、wish share card、achievement/share polish 迭代：`docs/superpowers/specs/2026-05-21-adsense-ready-site-design.md`、`docs/superpowers/specs/2026-05-22-local-growth-features-design.md`、`docs/superpowers/specs/2026-05-23-local-wish-share-card-design.md`、`docs/superpowers/plans/2026-05-23-achievement-share-polish.md`。
- `npm test` 在 2026-05-23 本地通过，30 项测试全绿，覆盖增长 helper、存储、站点结构、移动交互 CSS 和分享卡。
- Google 官方 AdSense 帮助页要求站点有独特、相关、能提供良好用户体验的内容，导航要清晰易用，内容要原创且能让用户保持参与；广告放置政策禁止鼓励点击广告、误导式广告标题、广告与按钮/应用/游戏区域过近造成误点，以及不能评估的内容。

## Assumptions
- 目标用户主要是中文互联网用户，尤其是上班族、学生、程序员、设计/运营/销售等对“电子木鱼”“功德”“打工人许愿”梗有语境的人。
- 推广目标优先是低成本自然传播和搜索流量，AdSense 是后续变现方式，不应让广告逻辑破坏主体验。
- “病毒式传播”在此任务中定义为：用户能在 5-30 秒内获得可截图/可转发的个人化结果，并愿意把它发给朋友、微信群、朋友圈、小红书、微博或聊天场景。
- 当前不评估真实线上流量、广告收入和转化率，因为本地仓库没有 Search Console、AdSense、Analytics 报表或社媒投放数据。

## Non-Goals
- 本阶段不实现新功能、不修改 UI、不新增广告位、不改 AdSense 脚本。
- 不预测具体 AdSense RPM、点击率、收入或审核通过概率的精确数值。
- 不设计付费投放预算、素材矩阵或渠道日历。
- 不引入账号、排行榜、后端、公开 UGC、评论区或社交 OAuth。
- 不建议任何诱导点击广告、刷量、误导用户或违反 AdSense 政策的增长方式。

## Decisions
- 当前项目可以进入推广分析和下一步计划阶段，因为代码和文档已足以判断产品增长基础，不需要先向用户追问业务背景。
- 评估结论采用“可推广但未形成强病毒闭环”的基线：产品有即时反馈和分享资产，适合开始小范围冷启动；但缺少外部可传播落地页、社交预览资产、数据闭环和内容矩阵，暂不应期待自发爆发式传播。
- AdSense 策略应先保持广告与主点击区域隔离。电子木鱼是高频点击界面，广告靠近木鱼、分享按钮、保存图片按钮或连续点击路径会增加误点和政策风险。
- 下一阶段计划应优先补足增长闭环：可验证分享图质量、社交预览、短内容/SEO 页面、埋点漏斗、首访到分享的路径，而不是先堆广告位。

## Open Questions
- none

## Clarification Coverage
- Needed to understand: 当前产品是否有核心可玩性、复访机制、个性化表达、分享触发、AdSense 审核面、抓取基础、政策风险和已验证状态。
- Resolved by: 读取 `components/gongde-clicker.jsx`、`lib/gongde-growth.js`、`lib/wish-card.js`、`app/layout.js`、信息页、`public/sitemap.xml`、`public/robots.txt`、已有 specs/plans 和测试；运行 `npm test`；查询 Google AdSense 官方帮助文档。
- Not needed: 暂不需要 Search Console、AdSense 后台、Vercel Analytics 或社交平台后台，因为用户当前要求是项目现状和传播潜力 intake，不是投放复盘或收入归因。

## Resolved Unknowns
- 是否只是薄单页：否。首页是可交互工具，信息页、导航、sitemap、robots 和隐私/联系页面已存在。
- 是否有可分享资产：有。复制文案和愿望功德图均已实现，分享文本带 `https://gongdeclicker.com`。
- 是否有留存机制：有弱留存。每日签、今日愿望、本地计数、成就和每日重置能支持轻量复访，但没有连续天数、提醒、收藏引导或跨设备状态。
- 是否有病毒传播钩子：有初步钩子。个性化愿望、职场梗和图片保存适合聊天传播；但缺少分享后回流的深链接参数、社交 OG 图片、平台化标题素材和可追踪的分享事件。
- 是否存在 AdSense 政策注意点：存在。高频点击型页面必须避免把广告放在木鱼、按钮、下载/保存图片、导航或其他操作控件附近；隐私政策已有第三方广告说明，但后续真实广告位仍需单独设计。
- 是否可以开始推广：可以小范围开始，但更适合作为验证型冷启动。要追求稳定自然增长和 AdSense 收益，需要先补数据闭环和内容/分享落地面。

## Readiness Decision
- Ready for planning: yes
- Reason: 项目现状、源码入口、增长资产、AdSense 审核面、政策边界和验证状态均已查清；剩余未知项不会阻塞制定下一阶段推广与产品增长计划，可以在计划中作为数据验证任务处理。

## Phase Check
- `phase-checks/intake-check-01.md`
