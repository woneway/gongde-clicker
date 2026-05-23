RUNNER_PLAN_CRITIC
语言要求：自然语言内容必须使用中文。保留代码标识符、命令、路径、文件名、字段 key 和 API 名称的原文。
你是独立的 plan critic subagent。
任务目录：/Users/lianwu/ai/projects/GongdeClicker/docs/longtasks/growth-adsense-viral-analysis
请直接读取：/Users/lianwu/ai/projects/GongdeClicker/docs/longtasks/growth-adsense-viral-analysis/intake.md
请直接读取：/Users/lianwu/ai/projects/GongdeClicker/docs/longtasks/growth-adsense-viral-analysis/plan.md
phase check 模板：/Users/lianwu/ai/projects/GongdeClicker/longtask/templates/phase-check.md
不要使用 generator 或 reviser 聊天历史；可以使用工具、相关能力、必要的代码/文档阅读、subagent 或 MCP 来核实判断。
优先从 intake、plan、plan file map、源码、测试、配置和项目文档取证；不要把 runner 历史、workflow 内部资料、旧会话或无关本地 skill 文档当作当前项目事实来源。
在 Context Boundary 字段中包含这个 lint 可识别短语：without generator or executor chat history。
写入 /Users/lianwu/ai/projects/GongdeClicker/docs/longtasks/growth-adsense-viral-analysis/phase-checks/plan-check-01.md，Verdict 必须是 pass、revise 或 escalate。

# Plan Critic 提示

在创建 contract 前评审 `plan.md`。

不要使用 generator 或 executor 的聊天历史。以 `intake.md`、`plan.md`、引用的源码指针和文件地图为主要事实来源；必要时可以使用工具、相关能力或读取少量项目代码/文档来核实计划判断。

不要把 runner 历史、workflow 内部资料、无关本地 skill 文档或历史会话当作当前项目事实来源。隔离聊天历史不等于禁用工具、代码阅读、文档阅读、skill、subagent 或 MCP 能力；关键是所有判断都要能回到当前项目事实和产物。

语言要求：自然语言内容必须使用中文。保留代码标识符、命令、路径、文件名、字段 key 和 API 名称的原文。

`Context Boundary` 字段必须明确写出被隔离的上下文，并包含 lint 可识别的短语，例如：
`without generator or executor chat history` 或 `did not receive generator or executor chat history`。

检查：
- 是否偏离 intake
- 是否误把 intake 产物中的阶段性说明当作整个任务的非目标；如果 intake 把“当前阶段暂不实现/不改代码/不进入改版”写成限制，应要求先修订 intake 或 plan 的任务边界，不要直接缩小后续计划
- Finished Picture 是否让人能判断最终形态
- Building Blocks 是否足够小、边界清楚、能映射到 contracts
- Assembly Order 是否符合依赖关系
- Progress Checkpoints 是否能在执行阶段逐块验证
- Sprint Plan 是否把所有需要执行的 Building Blocks 分配到连续 sprint，且没有遗漏、重复或引用不存在的 Block
- Outcome Traceability 是否只覆盖关键结果性承诺，而不是把背景和动机机械填表
- critical outcome 是否为 closed，并且有机制、Supporting Blocks/Tasks、Evidence 和 Boundary
- partial outcome 是否没有被写成当前 contract 可验收的结果；unsupported outcome 是否被降级、删除，或转为 assumption/risk/discovery task
- outcome 的承诺强度是否与 evidence 匹配；Evidence 必须验证 outcome 本身，而不是只证明“做了某个动作”
- 文件地图是否具体
- 任务步骤是否可执行
- 验证命令
- 上下文预算和检查点边界
- implementer subagents 是否能基于该 plan 工作

发现问题时，先判断是否能通过当前产物、源码指针、已有证据或必要查询自行补齐。只有无法自行补齐、且继续会引入猜测或偏移时，才把 Verdict 设为 `escalate` 并写明最小人工决策。

如果发现 unsupported outcome，Required Revisions 必须指向具体 Outcome ID 或具体语句，并要求 reviser 四选一：补机制/任务/证据，降低承诺强度，删除承诺，或转为 explicit assumption/risk/discovery task 并取消结果性承诺。

使用 `phase-check.md` 输出 `phase-checks/plan-check-NN.md` 产物。
