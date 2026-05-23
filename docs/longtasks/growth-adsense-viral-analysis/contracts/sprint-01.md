---
sprint: sprint-01
status: proposed
---

# Sprint 合同：sprint-01

> 语言要求：自然语言内容必须使用中文。保留代码标识符、命令、路径、文件名、字段 key 和 API 名称的原文。

- **Status**: proposed
- **Goal**: 基于 intake、plan 和当前项目文件，创建 `analysis.md` 的事实基线、证据矩阵和推广/病毒传播诊断部分，明确“可推广但未形成强病毒闭环”的判断边界。
- **Plan Blocks**: Block 1: 事实基线与证据矩阵；Block 2: 推广与病毒传播诊断。
- **Outcome Links**: O1 closed: 明确回答当前项目是否具备推广基础，并给出“可推广但未形成强病毒闭环”的判断；O4 closed: 报告不会把缺失的数据闭环伪装成已验证增长效果。
- **Visible Completion**: done when `docs/longtasks/growth-adsense-viral-analysis/analysis.md` exists and is complete for Block 1 and Block 2, including evidence matrix, verified facts, reasonable inferences, missing data, and viral diagnosis, and Acceptance Criteria are verified.
- **Acceptance Criteria**:
  1. **事实基线可追溯** - `analysis.md` 包含“结论摘要”“证据矩阵”“已验证事实”“合理推断”“未验证数据/待接入数据”等等价章节，关键判断回指到源码、测试、项目文档或 Google 官方 URL。
     - Verify by: 人工检查 `docs/longtasks/growth-adsense-viral-analysis/analysis.md`
  2. **证据矩阵覆盖 plan 要求** - 证据矩阵逐项覆盖 `components/gongde-clicker.jsx`、`lib/gongde-growth.js`、`lib/wish-card.js`、`app/layout.js`、信息页、`public/sitemap.xml`、`public/robots.txt`、`test/*.test.js` 和 Google AdSense 官方页面支持的判断。
     - Verify by: `rg -n "components/gongde-clicker.jsx|lib/gongde-growth.js|lib/wish-card.js|app/layout.js|public/sitemap.xml|public/robots.txt|Google|AdSense" docs/longtasks/growth-adsense-viral-analysis/analysis.md`
  3. **传播诊断完整** - 报告给出“可推广但未形成强病毒闭环”的明确诊断，并覆盖首访动机、5-30 秒内反馈、个性化表达、分享资产、复访动机、分享后回流、平台适配和真实数据缺口。
     - Verify by: 人工检查 `analysis.md` 的传播诊断章节
  4. **不伪造数据** - 报告把 Search Console、AdSense、Analytics、社媒后台、真实分享回流数据列为缺口或待接入数据，不写成已验证增长效果、收入或审核结论。
     - Verify by: `rg -n "Search Console|AdSense|Analytics|社媒|真实分享|未验证|待接入" docs/longtasks/growth-adsense-viral-analysis/analysis.md`
- **Required Evidence**:
  - [ ] `sed -n '1,260p' docs/longtasks/growth-adsense-viral-analysis/analysis.md` 输出必须在执行后捕获到 `evidence/attempt-01/sprint-01-analysis-head.txt`
  - [ ] `rg -n "证据矩阵|已验证事实|合理推断|未验证|可推广但未形成强病毒闭环|分享后回流|平台适配" docs/longtasks/growth-adsense-viral-analysis/analysis.md` 输出必须在执行后捕获到 `evidence/attempt-01/sprint-01-analysis-key-sections.txt`
- **Context Map**: Required Reads: `docs/longtasks/growth-adsense-viral-analysis/intake.md`, `docs/longtasks/growth-adsense-viral-analysis/plan.md`, `app/page.js`, `components/gongde-clicker.jsx`, `lib/gongde-growth.js`, `lib/wish-card.js`, `app/layout.js`, `app/how-it-works/page.js`, `app/faq/page.js`, `app/about/page.js`, `app/privacy/page.js`, `app/contact/page.js`, `public/sitemap.xml`, `public/robots.txt`, `test/gongde-growth.test.js`, `test/wish-card.test.js`, `test/site-structure.test.js`, `test/mobile-interaction-css.test.js`; Optional Reads: `docs/superpowers/specs/2026-05-21-adsense-ready-site-design.md`, `docs/superpowers/specs/2026-05-22-local-growth-features-design.md`, `docs/superpowers/specs/2026-05-23-local-wish-share-card-design.md`, `docs/superpowers/plans/2026-05-23-achievement-share-polish.md`, Google AdSense 官方政策页面；Forbidden Context: runner 历史、旧会话日志、workflow 内部资料、无关 skill 文档、未明确关联本任务的仓库大范围扫描；Budget: <=40%; Subagent Payload: 如使用 subagent，仅传入 intake、plan、上述源码/测试/文档路径和要求其返回事实矩阵草稿，不允许其依据旧会话或 runner 输出扩展结论。
- **Allowed Write Scope**: 允许创建或修改 `docs/longtasks/growth-adsense-viral-analysis/analysis.md`，允许写入 `docs/longtasks/growth-adsense-viral-analysis/evidence/attempt-01/sprint-01-*.txt` 和执行记录需要的本 sprint evidence 文件；禁止修改 `app/**`、`components/**`、`lib/**`、`test/**`、`public/**`、`docs/longtasks/growth-adsense-viral-analysis/plan.md`、`docs/longtasks/growth-adsense-viral-analysis/intake.md`、`phase-checks/**` 和其他 longtask runner 状态文件。
- **Verification Plan**: 先人工检查 `analysis.md` 是否按 Acceptance Criteria 1、3、4 完成；再运行 Required Evidence 中的 `sed` 和 `rg` 命令并保存输出；本 sprint 不要求运行 `npm test`，因为未修改产品代码，完整测试由 sprint-03 汇总验证。
- **Reviewer Routing**: architect
- **Out-of-Scope**: 不制定完整 backlog，不写 AdSense 广告位策略，不运行 `npm test`、`npm run lint`、longtask-state 或 runner 命令，不预测 RPM、CTR、收入、审核通过率，不实现任何产品功能。
- **Risk Notes**: Google AdSense 政策页面属于外部来源，执行期如果无法联网，必须在报告中标注基于 intake/plan 已记录 URL 的政策摘要并把重新核对官方页面列为后续检查；`analysis.md` 是 sprint-02 和 sprint-03 的 planned output producer，生产方 Visible Completion 为本合同的 `Visible Completion`，生产方 Required Evidence 为 `evidence/attempt-01/sprint-01-analysis-head.txt` 和 `evidence/attempt-01/sprint-01-analysis-key-sections.txt`，生产方 Allowed Write Scope 覆盖 `analysis.md`，后续 sprint 使用它作为已写入的事实基线与诊断草稿。
- **Phase Check**: phase-checks/contract-check-01.md
