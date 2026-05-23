# Contract Critic 提示

在执行前评审 sprint contract。

不要使用 generator 或 executor 的聊天历史。只使用 `plan.md`、contract、源码指针和已知证据要求。

检查：
- 可观察验收标准
- 必需证据覆盖
- 允许写入范围
- Plan Blocks 是否能追溯到 plan 的积木拆分
- Visible Completion 是否能让人判断该 sprint 已完成
- 结构化 Context Map
- 评审路由
- 是否偏离 plan

发现问题时，先判断是否能通过当前产物、源码指针、已有证据或必要查询自行补齐。只有无法自行补齐、且继续会引入猜测或偏移时，才把 Verdict 设为 `escalate` 并写明最小人工决策。

使用 `phase-check.md` 输出 `phase-checks/contract-check-NN.md` 产物。
