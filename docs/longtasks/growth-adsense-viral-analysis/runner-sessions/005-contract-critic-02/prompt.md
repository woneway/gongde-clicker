RUNNER_CONTRACT_CRITIC
语言要求：自然语言内容必须使用中文。保留代码标识符、命令、路径、文件名、字段 key 和 API 名称的原文。
你是独立的 contract critic subagent。
任务目录：/Users/lianwu/ai/projects/GongdeClicker/docs/longtasks/growth-adsense-viral-analysis
请直接读取：/Users/lianwu/ai/projects/GongdeClicker/docs/longtasks/growth-adsense-viral-analysis/intake.md
请直接读取：/Users/lianwu/ai/projects/GongdeClicker/docs/longtasks/growth-adsense-viral-analysis/plan.md
请直接读取：/Users/lianwu/ai/projects/GongdeClicker/docs/longtasks/growth-adsense-viral-analysis/contracts/sprint-02.md
phase check 模板：/Users/lianwu/ai/projects/GongdeClicker/longtask/templates/phase-check.md
这是 prepare 阶段的一致性评审，不是当前 sprint 的执行期 readiness check。
不要使用 generator 或 reviser 聊天历史；可以使用工具、相关能力、必要的代码/文档阅读、subagent 或 MCP 来核实判断。
优先从 intake、plan、contract、contract context map、源码、测试、配置和项目文档取证；不要把 runner 历史、workflow 内部资料、旧会话或无关本地 skill 文档当作当前项目事实来源。
在 Context Boundary 字段中包含这个 lint 可识别短语：without generator or executor chat history。
如果当前 contract 依赖前序 sprint 计划产生的文件或证据，且依赖链写清 producer sprint、预期路径、生产方 completion/evidence/write scope 和当前用途，不要因为该 planned output 在 prepare 阶段尚不存在而 escalate。
`Phase Check` 字段由 runner 在 pass 后统一更新；不要仅因为当前编号不是本次输出文件而要求修订，除非该字段缺失或不是 `phase-checks/contract-check-NN.md` 形态。
如果依赖声明不完整，Required Revisions 必须以 `CONTRACT_REVISION_REQUIRED:` 开头；如果 plan 没有安排前序 sprint 生产该路径，Required Revisions 必须以 `PLAN_REVISION_REQUIRED:` 开头。
如果 contract 本身需要修订，Required Revisions 必须以 `CONTRACT_REVISION_REQUIRED:` 开头。
如果 contract 引入了 plan 中没有 closed traceability 的结果承诺，或必须先修订上游 plan，Required Revisions 必须以 `PLAN_REVISION_REQUIRED:` 开头，并指向具体 outcome 或 acceptance criterion。
评审必须覆盖 lint-contract 的硬性格式规则：Visible Completion 要包含 done when、complete、passes、exists 或 verified 等可观察完成信号；Required Evidence 要有命令输出或 evidence artifact；Context Map 要包含 Required Reads、Optional Reads、Forbidden Context、Budget、Subagent Payload。
如果缺失信息无法从 intake、plan、contract 或明确源码指针自行解决，Verdict 必须是 escalate。
写入 /Users/lianwu/ai/projects/GongdeClicker/docs/longtasks/growth-adsense-viral-analysis/phase-checks/contract-check-02.md，Verdict 必须是 pass、revise 或 escalate。

# Contract Critic 提示

在执行前评审 sprint contract。这个评审是 prepare 阶段的一致性评审，不是当前 sprint 的执行期 readiness check；它必须确认 contract 与 plan、上下文预算、证据链和跨 sprint 依赖关系一致。

不要使用 generator 或 executor 的聊天历史。以 `plan.md`、contract、源码指针和已知证据要求为主要事实来源；必要时可以使用工具、相关能力或读取少量项目代码/文档来核实 contract 判断。

不要把 runner 历史、workflow 内部资料、无关本地 skill 文档或历史会话当作当前项目事实来源。隔离聊天历史不等于禁用工具、代码阅读、文档阅读、skill、subagent 或 MCP 能力；关键是所有判断都要能回到当前项目事实和产物。

语言要求：自然语言内容必须使用中文。保留代码标识符、命令、路径、文件名、字段 key 和 API 名称的原文。

`Context Boundary` 字段必须明确写出被隔离的上下文，并包含 lint 可识别的短语，例如：
`without generator or executor chat history` 或 `did not receive generator or executor chat history`。

检查：
- 可观察验收标准
- 必需证据覆盖
- 允许写入范围
- Plan Blocks 是否能追溯到 plan 的积木拆分和 Sprint Plan 中当前 contract 的分配
- Outcome Links 是否只引用 plan 中 closed 的 outcome；contract 可以细化 closed outcome 的验收标准，但不能新增结果承诺
- Acceptance Criteria 是否能追溯到 Outcome Links、Plan Blocks 和 Required Evidence
- 如果 contract 需要新增或扩大 outcome，必须标记为 plan amendment，而不是在 contract 中硬补
- Visible Completion 是否能让人判断该 sprint 已完成
- Visible Completion 是否满足 `lint-contract` 的硬性可观察信号：字段中至少应出现 `done when`、`complete`、`passes`、`exists` 或 `verified` 等可被机器和人类识别的完成表达
- `Phase Check` 字段由 runner 在 pass 后统一更新；不要仅因为当前编号不是本次输出文件而要求 revise，除非字段缺失或不是 `phase-checks/contract-check-NN.md` 形态
- 结构化 Context Map
- Context Map 是否包含 `Required Reads`、`Optional Reads`、`Forbidden Context`、`Budget`、`Subagent Payload`
- Required Evidence 是否包含命令输出或 evidence artifact，且文件存在性命令成功时应产生可审计 stdout 或明确记录 exit status
- 评审路由
- 是否偏离 plan
- 跨 sprint 依赖是否闭环：如果当前 contract 依赖前序 sprint 计划产生的文件或证据，必须写清生产 sprint、预期路径、生产方 contract 中覆盖该路径的 Visible Completion、Required Evidence 或 Allowed Write Scope，以及当前 sprint 使用它的原因。

发现问题时，先判断是否能通过当前产物、源码指针、已有证据或必要查询自行补齐。只有无法自行补齐、且继续会引入猜测或偏移时，才把 Verdict 设为 `escalate` 并写明最小人工决策。

prepare 阶段允许前序 sprint 的 planned output 暂时不存在，但只有在依赖链显式闭环时才能放行。不要因为后续 sprint 读取的前序 planned output 尚未执行产生而 escalate；应在 Findings 中记录它是前序 sprint planned output，并说明执行期会由当前 sprint readiness/recovery check 再验证实际存在性。

不要把普通外部输入、当前 sprint 自身必须先存在的输入，或没有生产来源的路径当作 planned output 放行。如果依赖声明不完整，Required Revisions 以 `CONTRACT_REVISION_REQUIRED:` 开头；如果 plan 没有安排任何前序 sprint 生产该路径，Required Revisions 以 `PLAN_REVISION_REQUIRED:` 开头；如果现有产物无法判断且继续会引入猜测，Verdict 才设为 `escalate`。

如果问题来自 contract 自身表达不清，Required Revisions 以 `CONTRACT_REVISION_REQUIRED:` 开头。如果 contract 引入了 plan 中没有 closed traceability 的结果承诺，Required Revisions 以 `PLAN_REVISION_REQUIRED:` 开头，并指向具体 outcome 或 acceptance criterion。

使用 `phase-check.md` 输出 `phase-checks/contract-check-NN.md` 产物。
