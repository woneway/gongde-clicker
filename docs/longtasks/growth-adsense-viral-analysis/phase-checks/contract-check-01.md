# 阶段检查：contract

> 语言要求：自然语言内容必须使用中文。保留代码标识符、命令、路径、文件名、字段 key 和 API 名称的原文。

- **Phase**: contract
- **Artifact**: `docs/longtasks/growth-adsense-viral-analysis/contracts/sprint-01.md`
- **Critic Role**: contract-critic
- **Verdict**: pass
- **Drift Check**: `sprint-01` 的 `Goal`、`Plan Blocks` 和 `Outcome Links` 对齐 `plan.md` 中的 Sprint Plan：`sprint-01: Block 1, Block 2`，并只链接 closed 的 O1、O4；未引入 plan 之外的增长实现、AdSense 广告位、收入预测或产品功能改动承诺。
- **Context Boundary**: 本次评审读取了 `intake.md`、`plan.md`、`contracts/sprint-01.md`、`longtask/templates/phase-check.md`，并用路径与源码指针检查 contract 引用是否存在；评审 without generator or executor chat history，未使用 runner 历史、旧会话日志、workflow 内部资料或无关 skill 文档作为事实来源。
- **Self-Recovery Attempted**: 已通过 `rg --files` 检查 contract 的 Required Reads、Optional Reads、Allowed Write Scope 和 phase-check 目录；通过 `rg -n` 抽查 `GongdeClicker`、`getWishShareText`、`renderWishCardToDataUrl`、`track(`、`metadata`、`adsbygoogle` 等关键源码指针，确认 contract 的证据方向可由当前项目文件支撑。未发现需要升级给人工决策的缺口。
- **Escalation Decision**: none
- **Required Revisions**: none
- **Evidence Checked**: `docs/longtasks/growth-adsense-viral-analysis/intake.md`; `docs/longtasks/growth-adsense-viral-analysis/plan.md`; `docs/longtasks/growth-adsense-viral-analysis/contracts/sprint-01.md`; `longtask/templates/phase-check.md`; `rg --files app components lib test public docs/superpowers docs/longtasks/growth-adsense-viral-analysis | sed -n '1,220p'`; `ls -la docs/longtasks/growth-adsense-viral-analysis docs/longtasks/growth-adsense-viral-analysis/phase-checks docs/longtasks/growth-adsense-viral-analysis/contracts`; `rg -n "track\\(|metadata|openGraph|twitter|adsbygoogle|GongdeClicker|getWishShareText|renderWishCardToDataUrl" app components lib test public docs/superpowers -g '!node_modules'`

## Findings
1. [pass] contract 的范围与 `plan.md` 的 sprint 分配一致。
   - Evidence: `plan.md` 将 `sprint-01` 分配给 Block 1 和 Block 2；`contracts/sprint-01.md` 的 `Plan Blocks` 为 “Block 1: 事实基线与证据矩阵；Block 2: 推广与病毒传播诊断”。
2. [pass] `Outcome Links` 只引用 plan 中 closed 的 outcome，且没有新增结果承诺。
   - Evidence: `plan.md` 中 O1、O4 均为 `Status: closed`；`contracts/sprint-01.md` 链接 O1、O4，并把边界限制在事实基线、证据矩阵、推广/病毒传播诊断和不伪造数据。
3. [pass] `Acceptance Criteria` 可追溯到 `Outcome Links`、`Plan Blocks` 和 `Required Evidence`。
   - Evidence: `contracts/sprint-01.md` 的验收标准覆盖事实基线、证据矩阵、传播诊断和未验证数据标注；`Required Evidence` 要求保存 `analysis.md` 头部输出和关键章节 `rg` 输出到 `evidence/attempt-01/sprint-01-*.txt`。
4. [pass] `Visible Completion` 满足 `lint-contract` 的可观察完成信号要求。
   - Evidence: `contracts/sprint-01.md` 的 `Visible Completion` 包含 `done when`、`exists`、`complete`、`verified`，可以由 `analysis.md` 文件存在性、章节内容和验收检查判断完成。
5. [pass] `Required Evidence` 包含可审计命令输出和 evidence artifact。
   - Evidence: `contracts/sprint-01.md` 要求 `sed -n '1,260p' .../analysis.md` 输出保存到 `evidence/attempt-01/sprint-01-analysis-head.txt`，并要求关键章节 `rg -n ... analysis.md` 输出保存到 `evidence/attempt-01/sprint-01-analysis-key-sections.txt`。
6. [pass] `Context Map` 具备硬性结构字段。
   - Evidence: `contracts/sprint-01.md` 的 `Context Map` 明确包含 `Required Reads`、`Optional Reads`、`Forbidden Context`、`Budget`、`Subagent Payload`，且 `Budget` 为 `<=40%`。
7. [pass] 写入范围足够且受控。
   - Evidence: `contracts/sprint-01.md` 的 `Allowed Write Scope` 允许写入 `analysis.md` 和本 sprint evidence 文件，同时禁止修改 `app/**`、`components/**`、`lib/**`、`test/**`、`public/**`、`plan.md`、`intake.md`、`phase-checks/**` 和其他 runner 状态文件；这与 sprint-01 文档分析目标一致。
8. [pass] prepare 阶段没有需要放行的前序 sprint planned output 依赖。
   - Evidence: `sprint-01` 是首个执行 sprint；contract 生产 `analysis.md`，并在 `Risk Notes` 中声明它会作为 sprint-02 和 sprint-03 的 planned output producer，包含生产方 Visible Completion、Required Evidence、Allowed Write Scope 和后续用途。
