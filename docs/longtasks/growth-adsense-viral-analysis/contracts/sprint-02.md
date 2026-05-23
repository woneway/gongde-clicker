---
sprint: sprint-02
status: proposed
---

# Sprint 合同：sprint-02

> 语言要求：自然语言内容必须使用中文。保留代码标识符、命令、路径、文件名、字段 key 和 API 名称的原文。

- **Status**: proposed
- **Goal**: 在 `analysis.md` 中基于 sprint-01 的事实基线和诊断，补齐增长闭环 backlog、产品改进建议和 Google AdSense 风险控制策略。
- **Plan Blocks**: Block 3: 增长闭环与产品改进 backlog；Block 4: AdSense 风险控制与放置策略。
- **Outcome Links**: O2 closed: 后续增长闭环任务可被实现 agent 直接拆 contract 执行；O3 closed: AdSense 策略不会鼓励误点、诱导点击或把广告放在高频操作路径旁；O4 closed: 报告不会把缺失的数据闭环伪装成已验证增长效果。
- **Visible Completion**: done when `docs/longtasks/growth-adsense-viral-analysis/analysis.md` exists and is complete for Block 3 and Block 4, including prioritized backlog, AdSense risk table, allowed low-risk exploration, and pre-launch checks, and Acceptance Criteria are verified.
- **Acceptance Criteria**:
  1. **backlog 可执行** - `analysis.md` 至少按 P0/P1/P2 或同等优先级列出分享事件埋点、保存图片事件埋点、分享 URL 参数或轻量 landing variant、社交预览图、SEO/短内容页、连续天数或回访提醒、隐私说明更新，每项包含目标、建议修改文件、验收现象、测试或手动验证、风险边界。
     - Verify by: 人工检查 `analysis.md` 的 backlog 章节
  2. **不做项明确** - 报告明确不做公开 UGC、排行榜、账号、社交 OAuth、诱导分享、诱导广告点击和刷量。
     - Verify by: `rg -n "公开 UGC|排行榜|账号|社交 OAuth|诱导分享|诱导广告点击|刷量" docs/longtasks/growth-adsense-viral-analysis/analysis.md`
  3. **AdSense 风险表映射当前界面** - 报告基于 `components/gongde-clicker.jsx` 的木鱼、分享按钮、保存图片按钮、导航和输入框位置，列出禁止靠近的交互区域、禁止文案和禁止伪装方式。
     - Verify by: `rg -n "木鱼|分享按钮|保存图片|导航|输入框|误点|禁止|AdSense" docs/longtasks/growth-adsense-viral-analysis/analysis.md`
  4. **官方政策引用完整** - 报告引用 plan 中列出的 Google AdSense 官方 URL：`https://support.google.com/adsense/answer/1346295`、`https://support.google.com/adsense/answer/2768340`、`https://support.google.com/adsense/answer/16737`、`https://support.google.com/adsense/answer/7299563`、`https://support.google.com/adsense/answer/9724`。
     - Verify by: `rg -n "1346295|2768340|16737|7299563|9724" docs/longtasks/growth-adsense-viral-analysis/analysis.md`
  5. **低风险广告策略有边界** - 报告说明当前先保持审核脚本、不在首页主点击区放广告；后续如测试广告，优先考虑信息页或主体验之后的清晰内容区，并要求移动端截图检查。
     - Verify by: 人工检查 `analysis.md` 的 AdSense 策略章节
- **Required Evidence**:
  - [ ] `rg -n "P0|P1|P2|分享事件|保存图片|分享 URL|社交预览|SEO|连续天数|隐私" docs/longtasks/growth-adsense-viral-analysis/analysis.md` 输出必须在执行后捕获到 `evidence/attempt-01/sprint-02-backlog.txt`
  - [ ] `rg -n "AdSense|误点|禁止|低风险|1346295|2768340|16737|7299563|9724|移动端截图" docs/longtasks/growth-adsense-viral-analysis/analysis.md` 输出必须在执行后捕获到 `evidence/attempt-01/sprint-02-adsense-risk.txt`
- **Context Map**: Required Reads: `docs/longtasks/growth-adsense-viral-analysis/intake.md`, `docs/longtasks/growth-adsense-viral-analysis/plan.md`, `components/gongde-clicker.jsx`, `lib/gongde-growth.js`, `lib/wish-card.js`, `app/layout.js`, `app/privacy/page.js`; planned output dependency: producer sprint `sprint-01`, expected path `docs/longtasks/growth-adsense-viral-analysis/analysis.md`, producer Visible Completion `done when analysis.md exists and is complete for Block 1 and Block 2...`, producer Required Evidence `evidence/attempt-01/sprint-01-analysis-head.txt` and `evidence/attempt-01/sprint-01-analysis-key-sections.txt`, producer Allowed Write Scope includes `analysis.md`; current use: extend the existing fact baseline and viral diagnosis into actionable backlog and AdSense controls without re-litigating baseline conclusions. Optional Reads: `test/gongde-growth.test.js`, `test/wish-card.test.js`, `test/site-structure.test.js`, `test/mobile-interaction-css.test.js`, information pages, `public/sitemap.xml`, `public/robots.txt`, Google AdSense 官方政策页面；Forbidden Context: runner 历史、旧会话日志、workflow 内部资料、无关 skill 文档、未明确关联本任务的仓库大范围扫描；Budget: <=40%; Subagent Payload: 如使用 subagent，仅传入 sprint-01 `analysis.md`、intake、plan 和上述源码/测试指针，要求返回 backlog/AdSense 风险草稿，不允许新增 plan 外结果承诺。
- **Allowed Write Scope**: 允许修改 `docs/longtasks/growth-adsense-viral-analysis/analysis.md` 的 backlog、AdSense 风控、风险边界和相关引用部分，允许写入 `docs/longtasks/growth-adsense-viral-analysis/evidence/attempt-01/sprint-02-*.txt` 和执行记录需要的本 sprint evidence 文件；禁止修改 `app/**`、`components/**`、`lib/**`、`test/**`、`public/**`、`docs/longtasks/growth-adsense-viral-analysis/plan.md`、`docs/longtasks/growth-adsense-viral-analysis/intake.md`、`phase-checks/**` 和其他 longtask runner 状态文件。
- **Verification Plan**: 执行前确认 producer sprint `sprint-01` 的 `analysis.md` 已存在；按 Acceptance Criteria 1、5 人工检查报告；运行 Required Evidence 中的两个 `rg` 命令并保存输出；不运行 `npm test` 或 `npm run lint`，除非执行者越界修改了源码，此时必须记录原因并回到合同范围修正。
- **Reviewer Routing**: security-reviewer
- **Out-of-Scope**: 不实现 backlog 中的产品功能，不新增广告位，不接入后端、账号、排行榜、公开 UGC、社交 OAuth 或真实 analytics 后台，不预测收入或审核通过率，不运行 longtask-state、runner 或 lint 命令。
- **Risk Notes**: 本 sprint 依赖 sprint-01 的 planned output；执行期必须重新确认 `docs/longtasks/growth-adsense-viral-analysis/analysis.md` 已存在并包含事实基线/诊断，否则不能把 backlog 和 AdSense 风控写成已基于完整诊断。Google 政策可能变更，报告必须保留“上线前重新核对官方政策和实际页面截图”的风险说明。
- **Phase Check**: phase-checks/contract-check-02.md
