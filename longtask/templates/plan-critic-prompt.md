# Plan Critic 提示

在创建 contract 前评审 `plan.md`。

不要使用 generator 或 executor 的聊天历史。只使用 `intake.md`、`plan.md`、引用的源码指针和文件地图。

语言要求：自然语言内容必须使用中文。保留代码标识符、命令、路径、文件名、字段 key 和 API 名称的原文。

`Context Boundary` 字段必须明确写出被隔离的上下文，并包含 lint 可识别的短语，例如：
`without generator or executor chat history` 或 `did not receive generator or executor chat history`。

检查：
- 是否偏离 intake
- Finished Picture 是否让人能判断最终形态
- Building Blocks 是否足够小、边界清楚、能映射到 contracts
- Assembly Order 是否符合依赖关系
- Progress Checkpoints 是否能在执行阶段逐块验证
- 文件地图是否具体
- 任务步骤是否可执行
- 验证命令
- 上下文预算和检查点边界
- implementer subagents 是否能基于该 plan 工作

发现问题时，先判断是否能通过当前产物、源码指针、已有证据或必要查询自行补齐。只有无法自行补齐、且继续会引入猜测或偏移时，才把 Verdict 设为 `escalate` 并写明最小人工决策。

使用 `phase-check.md` 输出 `phase-checks/plan-check-NN.md` 产物。
