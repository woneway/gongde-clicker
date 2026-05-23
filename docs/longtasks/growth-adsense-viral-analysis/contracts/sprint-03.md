---
sprint: sprint-03
status: proposed
---

# Sprint 合同：sprint-03

> 语言要求：自然语言内容必须使用中文。保留代码标识符、命令、路径、文件名、字段 key 和 API 名称的原文。

- **Status**: proposed
- **Goal**: 将前两个 sprint 的分析内容整合为可独立阅读的最终报告，并补齐证据索引、验证清单、后续执行路线和执行期测试记录。
- **Plan Blocks**: Block 5: 最终分析报告与验证清单。
- **Outcome Links**: O1 closed: 明确回答当前项目是否具备推广基础，并给出“可推广但未形成强病毒闭环”的判断；O2 closed: 后续增长闭环任务可被实现 agent 直接拆 contract 执行；O3 closed: AdSense 策略不会鼓励误点、诱导点击或把广告放在高频操作路径旁；O4 closed: 报告不会把缺失的数据闭环伪装成已验证增长效果；O5 closed: 验证路径覆盖文档一致性和现有测试，不破坏当前产品。
- **Visible Completion**: done when `docs/longtasks/growth-adsense-viral-analysis/analysis.md` exists and is complete as the final analysis report, `npm test` passes with evidence captured, and all Acceptance Criteria are verified.
- **Acceptance Criteria**:
  1. **最终报告可独立阅读** - `analysis.md` 包含摘要、现状等级或评分、证据索引、传播诊断、增长 backlog、AdSense 风险表、验证清单和后续执行建议，且章节之间没有明显重复、冲突或占位符。
     - Verify by: 人工通读 `docs/longtasks/growth-adsense-viral-analysis/analysis.md`
  2. **计划结论闭环** - 报告清楚回答当前项目可以小范围推广、但未形成强病毒闭环，并把优势、短板、下一步路线和 AdSense 边界串成单一结论。
     - Verify by: `rg -n "小范围推广|可推广但未形成强病毒闭环|优势|短板|下一步|AdSense" docs/longtasks/growth-adsense-viral-analysis/analysis.md`
  3. **验证命令记录完整** - 执行阶段运行 `npm test`，预期现有 Node test 全部通过，并把输出捕获到 evidence；如果未运行 `npm run lint`，报告或执行记录说明因为只修改文档所以未运行。
     - Verify by: `test -f docs/longtasks/growth-adsense-viral-analysis/evidence/attempt-01/npm-test.txt`
  4. **没有超出边界的承诺** - 报告没有收入预测、审核通过率承诺、伪造流量数据、诱导点击广告、广告伪装成按钮/导航/下载、广告贴近木鱼或分享按钮、自动刷新广告、弹窗广告等高风险建议。
     - Verify by: 人工检查 `analysis.md`
  5. **后续执行路线可拆分** - 报告的后续 sprint 建议仍限定在 plan 的 closed outcomes 范围内，能让实现 agent 选择分享回流、社交预览、埋点、内容入口、复访机制或 AdSense 布局检查作为后续独立任务。
     - Verify by: 人工检查 `analysis.md` 的后续执行建议
- **Required Evidence**:
  - [ ] `npm test` 输出必须在执行后捕获到 `evidence/attempt-01/npm-test.txt`
  - [ ] `sed -n '1,260p' docs/longtasks/growth-adsense-viral-analysis/analysis.md` 输出必须在执行后捕获到 `evidence/attempt-01/sprint-03-final-analysis-head.txt`
  - [ ] `rg -n "摘要|证据索引|传播诊断|backlog|AdSense|验证清单|后续执行|可推广但未形成强病毒闭环" docs/longtasks/growth-adsense-viral-analysis/analysis.md` 输出必须在执行后捕获到 `evidence/attempt-01/sprint-03-final-analysis-sections.txt`
- **Context Map**: Required Reads: `docs/longtasks/growth-adsense-viral-analysis/intake.md`, `docs/longtasks/growth-adsense-viral-analysis/plan.md`; planned output dependency: producer sprint `sprint-01`, expected path `docs/longtasks/growth-adsense-viral-analysis/analysis.md`, producer Visible Completion `done when analysis.md exists and is complete for Block 1 and Block 2...`, producer Required Evidence `evidence/attempt-01/sprint-01-analysis-head.txt` and `evidence/attempt-01/sprint-01-analysis-key-sections.txt`, producer Allowed Write Scope includes `analysis.md`, current use: preserve and refine fact baseline and viral diagnosis; planned output dependency: producer sprint `sprint-02`, expected path `docs/longtasks/growth-adsense-viral-analysis/analysis.md`, producer Visible Completion `done when analysis.md exists and is complete for Block 3 and Block 4...`, producer Required Evidence `evidence/attempt-01/sprint-02-backlog.txt` and `evidence/attempt-01/sprint-02-adsense-risk.txt`, producer Allowed Write Scope includes `analysis.md`, current use: integrate backlog and AdSense risk controls into final report. Optional Reads: all File Map read targets from `plan.md` if needed to resolve contradictions during final edit; Forbidden Context: runner 历史、旧会话日志、workflow 内部资料、无关 skill 文档、未明确关联本任务的仓库大范围扫描；Budget: <=40%; Subagent Payload: 如使用 subagent，仅传入 intake、plan、current `analysis.md` 和 evidence 指针，要求做最终一致性检查，不允许新增 plan 外承诺。
- **Allowed Write Scope**: 允许修改 `docs/longtasks/growth-adsense-viral-analysis/analysis.md` 的整体结构、摘要、证据索引、验证清单和后续执行建议，允许写入 `docs/longtasks/growth-adsense-viral-analysis/evidence/attempt-01/npm-test.txt`、`docs/longtasks/growth-adsense-viral-analysis/evidence/attempt-01/sprint-03-*.txt` 和执行记录需要的本 sprint evidence 文件；禁止修改 `app/**`、`components/**`、`lib/**`、`test/**`、`public/**`、`docs/longtasks/growth-adsense-viral-analysis/plan.md`、`docs/longtasks/growth-adsense-viral-analysis/intake.md`、`phase-checks/**` 和其他 longtask runner 状态文件。
- **Verification Plan**: 执行前确认 producer sprint `sprint-01` 和 `sprint-02` 的 `analysis.md` 内容与 evidence 已存在；通读最终 `analysis.md` 验证 Acceptance Criteria 1、2、4、5；运行 `npm test` 并保存到 `evidence/attempt-01/npm-test.txt`；运行 Required Evidence 中的 `sed` 和 `rg` 命令并保存输出；如果只修改文档，不运行 `npm run lint`，但必须在报告或执行记录中说明原因。
- **Reviewer Routing**: architect
- **Out-of-Scope**: 不新增分析报告以外的产品文档，不实现增长 backlog 或广告位，不修改源码、测试或站点配置，不写 contract critic phase check，不运行 longtask-state、runner 或 lint 命令。
- **Risk Notes**: 本 sprint 依赖 sprint-01 和 sprint-02 的 planned output；执行期必须重新确认 `analysis.md` 已包含前两 sprint 内容，且相应 evidence 已产生。`npm test` 是执行期验证，不要求 prepare 阶段已存在 evidence；如果测试失败，不能通过删改测试或源码来绕过，必须记录失败并按执行/修复流程处理。
- **Phase Check**: phase-checks/contract-check-03.md
