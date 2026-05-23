# growth-adsense-viral-analysis 实施计划

> 语言要求：自然语言内容必须使用中文。保留代码标识符、命令、路径、文件名、字段 key 和 API 名称的原文。

## Goal
产出一份基于当前 Gongde Clicker 项目事实的推广基础、病毒传播潜力、增长闭环、产品改进和 Google AdSense 风险控制分析，让后续执行者能按优先级推进冷启动和变现前改造。

## Architecture
本 longtask 的主要交付物是文档化分析与执行路线图，不直接改动线上产品功能。计划围绕 `app/page.js`、`components/gongde-clicker.jsx`、`lib/gongde-growth.js`、`lib/wish-card.js`、`app/layout.js`、信息页、`public/sitemap.xml`、`public/robots.txt`、现有测试和 Google AdSense 官方政策页面做证据闭环，输出当前可推广判断、病毒传播缺口、可执行增长 backlog、埋点漏斗建议、AdSense 放置边界和验证清单。

边界：
- 不预测 AdSense RPM、CTR、收入或审核通过概率。
- 不新增广告位、不接入后端、不引入公开 UGC、排行榜、账号或社交 OAuth。
- 不建议诱导点击广告、刷量、误导跳转或任何违反 AdSense 政策的增长方式。
- 如果执行阶段发现真实流量、Search Console、AdSense、Analytics 或社媒后台数据不可用，只能作为待接入数据源记录，不能伪造结论。

## Finished Picture
完成后，仓库中会新增一份分析报告，清楚回答：
- 当前项目可以小范围推广，但基线是“可推广、未形成强病毒闭环”。
- 已有优势包括电子木鱼即时反馈、本地统计、每日功德签、愿望、成就、复制分享文案、愿望功德图、信息页、导航、sitemap、robots、AdSense 脚本和基础测试。
- 当前传播短板包括缺少分享后回流深链接、专门社交预览图片、分享/保存漏斗埋点、短内容/SEO 扩展页、连续复访机制和真实数据闭环。
- AdSense 风险控制会明确要求广告远离木鱼高频点击区、分享按钮、保存图片按钮、导航和下载/操作路径；不使用诱导点击文案；上线前以布局检查和政策清单作为门槛。
- 后续执行路线会按“先测量与分享回流，再补内容入口，再谨慎广告化”的顺序排序，并标明每项的验收现象、涉及文件和验证命令。

## Building Blocks
- Block 1: 事实基线与证据矩阵 - 汇总当前产品、增长、分享、SEO、AdSense-ready、测试和政策事实，明确哪些结论有源码或官方文档支撑，哪些只能作为假设。
- Block 2: 推广与病毒传播诊断 - 评估首访体验、5-30 秒分享触发、复访机制、个性化表达、分享后回流、平台传播适配和“可推广但未形成强病毒闭环”的原因。
- Block 3: 增长闭环与产品改进 backlog - 将诊断缺口转化为可执行优先级：分享链接参数、社交预览资产、分享/保存埋点、SEO/短内容页、连续天数或轻量回访机制、隐私边界和测试需求。
- Block 4: AdSense 风险控制与放置策略 - 基于当前高频点击界面和 Google 官方政策，制定广告脚本、广告位、页面布局、文案、误点风险、隐私政策和上线检查边界。
- Block 5: 最终分析报告与验证清单 - 写入完整报告，包含结论摘要、证据索引、风险表、下一步 sprint 建议、验证命令和人工验收路径。

## Assembly Order
1. 先完成 Block 1，因为后续传播判断、backlog 和 AdSense 风控都必须引用同一套项目事实，避免把已有能力重复规划或把不存在的数据当证据。
2. 再完成 Block 2，因为推广与病毒传播诊断决定哪些缺口是增长关键，哪些只是锦上添花。
3. 接着完成 Block 3，把诊断结果转成后续可执行产品和内容任务，并保持与当前 Next.js App Router、localStorage、Canvas 分享图和 Vercel Analytics 架构一致。
4. 然后完成 Block 4，因为 AdSense 方案必须在知道核心交互和增长路径后再定边界，尤其要避开木鱼、分享按钮、保存图片和导航等误点风险区域。
5. 最后完成 Block 5，将前四块整合为单一报告，并补齐验证清单和人工验收标准。

## Progress Checkpoints
- Block 1 done when 报告中存在证据矩阵，逐项列出 `components/gongde-clicker.jsx`、`lib/gongde-growth.js`、`lib/wish-card.js`、`app/layout.js`、信息页、`public/sitemap.xml`、`public/robots.txt`、`test/*.test.js` 和 Google AdSense 官方页面支持了哪些判断。
- Block 2 done when 报告给出“可推广但未形成强病毒闭环”的明确诊断，并分别覆盖首访、复访、分享资产、回流、平台适配和真实数据缺口。
- Block 3 done when backlog 至少按 P0/P1/P2 或同等优先级列出后续增长任务，每项包含目标、建议文件、验收标准、需要的测试或手动验证。
- Block 4 done when AdSense 风险表明确列出禁止做法、允许探索的低风险位置、上线前检查项，并引用 Google 官方政策 URL。
- Block 5 done when 最终报告能独立阅读，结论、证据、下一步、风险和验证命令完整闭环，且没有把未验证数据写成事实。

## Sprint Plan
- sprint-01: Block 1, Block 2 - 建立项目事实基线，并完成推广基础与病毒传播潜力诊断。
- sprint-02: Block 3, Block 4 - 输出增长闭环 backlog 和 AdSense 风险控制策略。
- sprint-03: Block 5 - 整合最终分析报告、证据索引、验证清单和后续执行路线。

## Outcome Traceability
- **Outcome ID**: O1
  - **Level**: critical
  - **Status**: closed
  - **Outcome**: 明确回答当前项目是否具备推广基础，并给出“可推广但未形成强病毒闭环”的判断。
  - **Mechanism**: 用源码入口、增长 helper、分享图、信息页、sitemap、robots、测试和现有设计文档建立证据矩阵。
  - **Supporting Blocks/Tasks**: Block 1, Block 2, Task 1, Task 2
  - **Evidence**: 报告中每个关键判断都能回指到具体文件路径或官方 URL；人工检查报告的“现状结论”和“证据矩阵”即可验证。
  - **Boundary**: 不承诺真实线上流量、收入、审核通过率或社媒传播数据。

- **Outcome ID**: O2
  - **Level**: critical
  - **Status**: closed
  - **Outcome**: 后续增长闭环任务可被实现 agent 直接拆 contract 执行。
  - **Mechanism**: backlog 每项包含目标、建议文件、验收标准、测试或手动验证，不停留在抽象建议。
  - **Supporting Blocks/Tasks**: Block 3, Task 3
  - **Evidence**: 报告中存在优先级 backlog，且覆盖分享回流、社交预览、埋点、内容入口和复访机制。
  - **Boundary**: 本 longtask 不直接实现这些功能；真实执行前仍需根据当时产品目标选择 sprint。

- **Outcome ID**: O3
  - **Level**: critical
  - **Status**: closed
  - **Outcome**: AdSense 策略不会鼓励误点、诱导点击或把广告放在高频操作路径旁。
  - **Mechanism**: 依据 Google AdSense 官方政策建立禁止清单、低风险探索区和上线前人工检查项。
  - **Supporting Blocks/Tasks**: Block 4, Task 4
  - **Evidence**: 报告引用 `https://support.google.com/adsense/answer/1346295`、`https://support.google.com/adsense/answer/2768340`、`https://support.google.com/adsense/answer/16737`、`https://support.google.com/adsense/answer/7299563`、`https://support.google.com/adsense/answer/9724`，并把政策映射到当前 `components/gongde-clicker.jsx` 的高频点击与分享按钮布局。
  - **Boundary**: Google 政策可能变更；广告上线前必须重新核对官方政策和实际页面截图。

- **Outcome ID**: O4
  - **Level**: important
  - **Status**: closed
  - **Outcome**: 报告不会把缺失的数据闭环伪装成已验证增长效果。
  - **Mechanism**: 将 Search Console、AdSense、Analytics、社媒后台和真实分享回流数据列为缺口或后续接入任务。
  - **Supporting Blocks/Tasks**: Block 1, Block 2, Block 3, Task 1, Task 2, Task 3
  - **Evidence**: 报告中有“已验证事实”和“未验证假设/待接入数据”分区。
  - **Boundary**: 如果用户后续提供线上报表，可另起分析任务更新结论。

- **Outcome ID**: O5
  - **Level**: important
  - **Status**: closed
  - **Outcome**: 验证路径覆盖文档一致性和现有测试，不破坏当前产品。
  - **Mechanism**: 执行阶段修改分析文档为主；验证使用 `npm test`，必要时补充 `npm run lint` 或人工文件检查。
  - **Supporting Blocks/Tasks**: Block 5, Task 5
  - **Evidence**: 最终报告和执行记录包含验证命令与结果；若未运行某命令，必须记录原因。
  - **Boundary**: 本计划生成阶段不运行 lint、longtask-state 或 runner 命令；由 runner 统一执行对应检查。

## File Map
- Create: `docs/longtasks/growth-adsense-viral-analysis/analysis.md` - 最终推广基础、病毒传播潜力、增长闭环和 AdSense 风控分析报告。
- Modify: `docs/longtasks/growth-adsense-viral-analysis/plan.md` - 当前实施计划。
- Read: `docs/longtasks/growth-adsense-viral-analysis/intake.md` - 需求、已知事实、边界和 readiness。
- Read: `app/page.js` - 首页入口，确认产品由 `GongdeClicker` 驱动。
- Read: `components/gongde-clicker.jsx` - 核心点击、分享、愿望、成就、Vercel Analytics 事件和交互布局事实。
- Read: `lib/gongde-growth.js` - 每日签、默认愿望、成就、分享文案和愿望存储事实。
- Read: `lib/wish-card.js` - Canvas 愿望功德图模型和输出内容事实。
- Read: `app/layout.js` - metadata、openGraph、twitter、导航、AdSense 脚本和 Vercel Analytics 事实。
- Read: `app/how-it-works/page.js`, `app/faq/page.js`, `app/about/page.js`, `app/privacy/page.js`, `app/contact/page.js` - AdSense 审核面与用户说明事实。
- Read: `public/sitemap.xml`, `public/robots.txt` - 抓取与 canonical URL 事实。
- Read: `test/gongde-growth.test.js`, `test/wish-card.test.js`, `test/site-structure.test.js`, `test/mobile-interaction-css.test.js` - 现有验证覆盖事实。
- Read: `docs/superpowers/specs/2026-05-21-adsense-ready-site-design.md`, `docs/superpowers/specs/2026-05-22-local-growth-features-design.md`, `docs/superpowers/specs/2026-05-23-local-wish-share-card-design.md`, `docs/superpowers/plans/2026-05-23-achievement-share-polish.md` - 已完成产品迭代背景。

## Tasks

### Task 1: 建立事实基线与证据矩阵

- [ ] Step 1: 读取 `intake.md` 和 File Map 中必要片段，确认当前产品能力、增长资产、AdSense-ready 面和测试覆盖。
- [ ] Step 2: 在 `analysis.md` 中新增“结论摘要”和“证据矩阵”，把每个现状判断映射到文件路径、测试或官方 URL。
- [ ] Step 3: 单独列出“已验证事实”“合理推断”“未验证数据”，防止把没有线上报表支撑的内容写成结果。

### Task 2: 完成推广基础与病毒传播诊断

- [ ] Step 1: 从首访动机、5-30 秒内反馈、个性化表达、分享资产、复访动机、分享后回流和平台适配七个维度评估当前项目。
- [ ] Step 2: 写出“可推广但未形成强病毒闭环”的理由，并说明可以小范围冷启动但不应期待自发爆发式传播。
- [ ] Step 3: 将传播缺口与当前代码事实对应，例如 `getWishShareText` 只有 canonical URL、`renderWishCardToDataUrl` 生成本地图片、`track("gongde_click")` 未覆盖分享动作、`metadata.twitter.card` 仍是 `summary`。

### Task 3: 制定增长闭环与产品改进 backlog

- [ ] Step 1: 按优先级写出后续任务：分享事件埋点、保存图片事件埋点、分享 URL 参数或轻量 landing variant、社交预览图、SEO/短内容页、连续天数或回访提醒、隐私说明更新。
- [ ] Step 2: 每个 backlog 项写明建议修改文件、验收现象、测试建议和风险边界。
- [ ] Step 3: 明确不做项：公开 UGC、排行榜、账号、社交 OAuth、诱导分享、诱导广告点击和刷量。

### Task 4: 制定 AdSense 风险控制策略

- [ ] Step 1: 基于当前 `components/gongde-clicker.jsx` 的木鱼、分享按钮、保存图片按钮、导航和输入框位置，标出广告禁止靠近的交互区域。
- [ ] Step 2: 基于 Google AdSense 官方页面写出政策映射：唯一且有吸引力的内容、清晰导航、避免误点、不要鼓励点击、游戏/高频点击区域建议保持距离、避免无法评估内容。
- [ ] Step 3: 给出允许探索的低风险广告策略，例如先保持只有审核脚本、不在首页主点击区放广告；若后续试广告，优先在信息页或主体验之后的清晰内容区测试，并做移动端截图检查。

### Task 5: 整合最终报告并定义验证

- [ ] Step 1: 整合 `analysis.md`，确保包含摘要、现状评分或等级、证据矩阵、传播诊断、backlog、AdSense 风险表、验证清单和后续执行建议。
- [ ] Step 2: 运行 `npm test`，预期现有 Node test 全部通过。
- [ ] Step 3: 如执行阶段涉及文档以外的源码修改，运行 `npm run lint`，预期无 lint error；如果只写文档，可记录未运行 lint 的原因。
- [ ] Step 4: 人工检查 `analysis.md` 中没有收入预测、审核通过率承诺、伪造流量数据或违反 AdSense 政策的建议。

## Verification
- `npm test` 必须通过，并确认现有增长 helper、分享卡、站点结构和移动交互 CSS 测试未回退。
- `npm run lint` 在执行阶段修改源码或 JSX/CSS 时必须通过；如果只新增 `analysis.md`，可作为可选验证并在执行记录中说明。
- 人工检查 `docs/longtasks/growth-adsense-viral-analysis/analysis.md`，确认所有关键结论都有源码、测试、项目文档或 Google 官方 URL 支撑。
- 人工检查报告中的 AdSense 建议，确认没有“点击广告支持我们”、广告伪装成按钮/导航/下载、广告贴近木鱼或分享按钮、自动刷新广告、弹窗广告等高风险做法。

## Context Budget
- 必读：`intake.md`、`components/gongde-clicker.jsx`、`lib/gongde-growth.js`、`lib/wish-card.js`、`app/layout.js`、`test/site-structure.test.js`、`test/gongde-growth.test.js`、`test/wish-card.test.js`、Google AdSense 官方政策页面。
- 可选阅读：信息页、`public/sitemap.xml`、`public/robots.txt`、`test/mobile-interaction-css.test.js`、相关 `docs/superpowers/specs/*.md` 和 `docs/superpowers/plans/*.md`。
- 禁止上下文：runner 历史、旧会话日志、workflow 内部资料、无关 skill 文档、未明确关联本任务的仓库大范围扫描。
- 检查点边界：每个 sprint 的 contract 应控制在 <=40% 上下文；若需要实现后续 backlog，应另起 contract，不把全部产品改造塞进本分析任务。

## Phase Check
- plan critic phase check 由独立 critic session 生成；本次 plan 生成阶段不写入 `phase-checks/plan-check-01.md`，不运行 lint、longtask-state 或 runner 命令。
