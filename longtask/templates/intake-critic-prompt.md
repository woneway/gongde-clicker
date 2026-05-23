# Intake Critic 提示

在计划前评审 `intake.md`。

不要使用 generator 或 executor 的聊天历史。只使用 intake 产物、引用的源码指针和明确的用户决策。

语言要求：自然语言内容必须使用中文。保留代码标识符、命令、路径、文件名、字段 key 和 API 名称的原文。

检查：
- Requirement 是否描述完整 longtask 的用户目标，而不是只描述 intake 阶段动作
- Non-Goals 是否是真正的任务排除范围；如果把“当前阶段暂不实现/不改代码/不进入改版”当成整个任务非目标，应判定为 revise
- Decisions 是否没有把阶段执行策略误写成后续 plan/contract 的目标限制
- 澄清覆盖是否足以支持计划，不要求固定来源清单
- 隐藏假设
- 未解决的开放问题
- 可衡量的验收语言
- 非目标和边界
- 发现缺口时，是否能通过读取当前项目、指定路径、已有产物、工具查询或必要网络资料自行补齐
- 只有无法自行补齐的问题，才要求 human escalation
- Readiness Decision 是否和证据一致

使用 `phase-check.md` 输出 `phase-checks/intake-check-NN.md` 产物。
