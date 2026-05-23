# 阶段检查：contract

> 语言要求：自然语言内容必须使用中文。保留代码标识符、命令、路径、文件名、字段 key 和 API 名称的原文。

- **Phase**: contract
- **Artifact**: `docs/longtasks/growth-adsense-viral-analysis/contracts/sprint-03.md`
- **Critic Role**: contract-critic
- **Verdict**: pass
- **Drift Check**: `sprint-03` 对应 `plan.md` 的 `Sprint Plan` 分配：`sprint-03: Block 5 - 整合最终分析报告、证据索引、验证清单和后续执行路线`。合同的 `Plan Blocks` 只声明 Block 5，`Goal`、`Acceptance Criteria`、`Required Evidence` 和 `Verification Plan` 均围绕最终报告整合、验证清单、`npm test` evidence 和后续执行路线展开，没有要求实现增长 backlog、广告位、源码改造或 plan 外结果承诺。`Outcome Links` 引用 O1-O5 是为了最终报告闭环前序结论与验证路径，均为 `plan.md` 中 `Status: closed` 的 outcome。
- **Context Boundary**: 本次评审读取了 `intake.md`、`plan.md`、`contracts/sprint-03.md`、`contracts/sprint-01.md`、`contracts/sprint-02.md` 和 `longtask/templates/phase-check.md`，并用 `rg` 检查 contract 字段与跨 sprint dependency 声明；评审 without generator or executor chat history，未使用 runner 历史、旧会话日志、workflow 内部资料或无关本地 skill 文档作为事实来源。
- **Self-Recovery Attempted**: 已自行核对 `sprint-03` 的硬性字段、plan traceability、`Outcome Links` closed 状态、`Visible Completion` 可观察完成信号、`Required Evidence` 是否包含命令输出或 evidence artifact、`Context Map` 是否包含 `Required Reads`、`Optional Reads`、`Forbidden Context`、`Budget`、`Subagent Payload`，并补读 `sprint-01`、`sprint-02` contract 来验证 planned output dependency 的 producer、路径、生产方 completion/evidence/write scope 与当前用途。
- **Escalation Decision**: none
- **Required Revisions**: none
- **Evidence Checked**: `docs/longtasks/growth-adsense-viral-analysis/intake.md`; `docs/longtasks/growth-adsense-viral-analysis/plan.md`; `docs/longtasks/growth-adsense-viral-analysis/contracts/sprint-03.md`; `docs/longtasks/growth-adsense-viral-analysis/contracts/sprint-01.md`; `docs/longtasks/growth-adsense-viral-analysis/contracts/sprint-02.md`; `rg -n "Visible Completion|Required Evidence|Context Map|Required Reads|Optional Reads|Forbidden Context|Budget|Subagent Payload|Phase Check|Outcome Links|Plan Blocks" docs/longtasks/growth-adsense-viral-analysis/contracts/sprint-03.md`; `rg -n 'producer sprint `sprint-01`|producer sprint `sprint-02`|producer Visible Completion|producer Required Evidence|producer Allowed Write Scope|current use' docs/longtasks/growth-adsense-viral-analysis/contracts/sprint-03.md`; `rg -n "analysis.md|sprint-01-analysis-head|sprint-01-analysis-key-sections|sprint-02-backlog|sprint-02-adsense-risk|Allowed Write Scope|Visible Completion" docs/longtasks/growth-adsense-viral-analysis/contracts/sprint-01.md docs/longtasks/growth-adsense-viral-analysis/contracts/sprint-02.md`

## Findings
1. [pass] `Visible Completion` 满足可观察完成信号要求。
   - Evidence: `contracts/sprint-03.md` 的 `Visible Completion` 写明 `done when`、`analysis.md` `exists`、报告 `complete`、`npm test` `passes` 且 Acceptance Criteria `verified`，覆盖 `lint-contract` 要求的可识别完成表达。

2. [pass] `Required Evidence` 覆盖命令输出和 evidence artifact。
   - Evidence: `contracts/sprint-03.md` 要求将 `npm test` 输出捕获到 `evidence/attempt-01/npm-test.txt`，将 `sed -n '1,260p' .../analysis.md` 输出捕获到 `evidence/attempt-01/sprint-03-final-analysis-head.txt`，并将 `rg -n "摘要|证据索引|传播诊断|backlog|AdSense|验证清单|后续执行|可推广但未形成强病毒闭环" .../analysis.md` 输出捕获到 `evidence/attempt-01/sprint-03-final-analysis-sections.txt`。

3. [pass] `Context Map` 的结构化必需字段齐全。
   - Evidence: `contracts/sprint-03.md` 的 `Context Map` 包含 `Required Reads`、`Optional Reads`、`Forbidden Context`、`Budget` 和 `Subagent Payload`，并限制 subagent 只能接收 intake、plan、current `analysis.md` 和 evidence 指针，不允许新增 plan 外承诺。

4. [pass] Plan traceability 与 outcome traceability 成立。
   - Evidence: `plan.md` 的 `Sprint Plan` 将 `sprint-03` 分配给 Block 5；`contracts/sprint-03.md` 的 `Plan Blocks` 为 Block 5，`Acceptance Criteria` 覆盖最终报告可独立阅读、计划结论闭环、验证命令记录、边界承诺和后续执行路线。`Outcome Links` 只引用 `plan.md` 中 closed 的 O1-O5，没有新增未在 plan 中 closed 的 outcome。

5. [pass] 跨 sprint planned output dependency 已闭环，prepare 阶段无需因 `analysis.md` 或 evidence 尚未执行产生而 escalate。
   - Evidence: `contracts/sprint-03.md` 对 `sprint-01` 写明 producer sprint、expected path `docs/longtasks/growth-adsense-viral-analysis/analysis.md`、producer Visible Completion、producer Required Evidence、producer Allowed Write Scope 和 current use；对 `sprint-02` 也写明同类字段。`contracts/sprint-01.md` 的 `Visible Completion`、`Required Evidence`、`Allowed Write Scope` 和 `Risk Notes` 覆盖 `analysis.md` 事实基线/诊断生产；`contracts/sprint-02.md` 的 `Visible Completion`、`Required Evidence`、`Allowed Write Scope` 覆盖 backlog 与 AdSense 风控生产。

6. [pass] Allowed Write Scope 与 out-of-scope 边界符合 plan。
   - Evidence: `contracts/sprint-03.md` 仅允许修改 `analysis.md` 和写入本 sprint evidence 文件，禁止修改 `app/**`、`components/**`、`lib/**`、`test/**`、`public/**`、`plan.md`、`intake.md`、`phase-checks/**` 和 runner 状态文件；这与 `plan.md` 中“文档化分析与执行路线图，不直接改动线上产品功能”的 Architecture 边界一致。`phase-checks/**` 禁止项约束执行 sprint，不影响本 prepare critic 按用户指令写入当前 phase check。

7. [pass] `Phase Check` 字段形态正确。
   - Evidence: `contracts/sprint-03.md` 的 `Phase Check` 为 `phase-checks/contract-check-03.md`，符合 `phase-checks/contract-check-NN.md` 形态。
