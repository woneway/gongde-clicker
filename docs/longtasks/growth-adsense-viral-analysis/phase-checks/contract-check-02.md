# 阶段检查：contract

> 语言要求：自然语言内容必须使用中文。保留代码标识符、命令、路径、文件名、字段 key 和 API 名称的原文。

- **Phase**: contract
- **Artifact**: `docs/longtasks/growth-adsense-viral-analysis/contracts/sprint-02.md`
- **Critic Role**: contract-critic
- **Verdict**: pass
- **Drift Check**: `sprint-02` 的 `Plan Blocks` 对应 plan 中的 Block 3 和 Block 4；`Outcome Links` 仅引用 plan 中 `Status: closed` 的 O2、O3、O4；`Acceptance Criteria` 覆盖 Task 3 与 Task 4 的 backlog、AdSense 风险控制、官方政策引用和低风险广告策略要求，未新增 plan 外结果承诺。
- **Context Boundary**: 本次评审读取了 `intake.md`、`plan.md`、`contracts/sprint-02.md`、`contracts/sprint-01.md`、`longtask/templates/phase-check.md` 和当前 longtask 文件列表，without generator or executor chat history；未使用 runner 历史、workflow 内部资料、旧会话日志或无关本地 skill 文档作为事实来源。
- **Self-Recovery Attempted**: 已自行核对 `sprint-01` producer contract，以确认 `sprint-02` 依赖的 planned output `docs/longtasks/growth-adsense-viral-analysis/analysis.md` 在前序 sprint 的 `Visible Completion`、`Required Evidence`、`Allowed Write Scope` 和 `Risk Notes` 中闭环；也核对了 plan 的 `Sprint Plan`、`Outcome Traceability`、`Tasks`、`Verification` 和 `Context Budget`。
- **Escalation Decision**: none
- **Required Revisions**: none
- **Evidence Checked**: `docs/longtasks/growth-adsense-viral-analysis/intake.md`; `docs/longtasks/growth-adsense-viral-analysis/plan.md`; `docs/longtasks/growth-adsense-viral-analysis/contracts/sprint-02.md`; `docs/longtasks/growth-adsense-viral-analysis/contracts/sprint-01.md`; `longtask/templates/phase-check.md`; `find docs/longtasks/growth-adsense-viral-analysis -maxdepth 3 -type f | sort`

## Findings
1. [pass] `Visible Completion` 满足 lint-contract 的可观察完成信号要求。
   - Evidence: `contracts/sprint-02.md` 中写明 `done when docs/longtasks/growth-adsense-viral-analysis/analysis.md exists and is complete ... and Acceptance Criteria are verified`，包含 `done when`、`exists`、`complete`、`verified`。

2. [pass] `Required Evidence` 包含可审计的命令输出和 evidence artifact。
   - Evidence: `contracts/sprint-02.md` 要求将 backlog 相关 `rg` 输出保存到 `evidence/attempt-01/sprint-02-backlog.txt`，并将 AdSense 风险相关 `rg` 输出保存到 `evidence/attempt-01/sprint-02-adsense-risk.txt`。

3. [pass] `Context Map` 包含硬性要求的结构项。
   - Evidence: `contracts/sprint-02.md` 的 `Context Map` 明确列出 `Required Reads`、`Optional Reads`、`Forbidden Context`、`Budget`、`Subagent Payload`。

4. [pass] 跨 sprint planned output 依赖链闭环；prepare 阶段不要求该输出已经存在。
   - Evidence: `contracts/sprint-02.md` 写明 producer sprint `sprint-01`、expected path `docs/longtasks/growth-adsense-viral-analysis/analysis.md`、producer `Visible Completion`、producer `Required Evidence`、producer `Allowed Write Scope` 和 current use；`contracts/sprint-01.md` 对应声明 `analysis.md` 为本 sprint 输出，并将 `evidence/attempt-01/sprint-01-analysis-head.txt`、`evidence/attempt-01/sprint-01-analysis-key-sections.txt` 作为 Required Evidence。

5. [pass] `Outcome Links` 未偏离 plan。
   - Evidence: `plan.md` 中 O2、O3、O4 均为 `Status: closed`；`contracts/sprint-02.md` 仅链接 O2、O3、O4，且内容分别对应 Block 3、Block 4 和“不把缺失的数据闭环伪装成已验证增长效果”的边界。

6. [pass] `Allowed Write Scope` 与本 sprint 目标一致，并排除了产品代码和上游计划产物。
   - Evidence: `contracts/sprint-02.md` 允许修改 `analysis.md` 的 backlog、AdSense 风控、风险边界和相关引用部分，允许写入本 sprint evidence 文件；禁止修改 `app/**`、`components/**`、`lib/**`、`test/**`、`public/**`、`plan.md`、`intake.md`、`phase-checks/**` 和其他 runner 状态文件。

7. [info] `Phase Check` 字段形态正确。
   - Evidence: `contracts/sprint-02.md` 的 `Phase Check` 为 `phase-checks/contract-check-02.md`，符合 `phase-checks/contract-check-NN.md` 形态。
