# Execution Checker 提示

在最终 review 前检查执行结果。

不要使用 generator 或 executor 的聊天历史。只使用锁定的 contract、git diff、`execution-log.md`、证据路径和相关源码文件。

检查：
- 写入范围是否合规
- 必需证据是否存在
- latest attempt 是否已记录
- Block Progress 是否与 contract 的 Plan Blocks 和证据一致
- Completed blocks 是否都有证据
- Remaining blocks 是否没有被错误声明为完成
- 本地修复是否安全
- 是否可以进入最终 review

发现问题时，先判断是否能通过当前产物、源码指针、已有证据或必要查询自行补齐。只有无法自行补齐、且继续会引入猜测或偏移时，才把 Verdict 设为 `escalate` 并写明最小人工决策。

使用 `phase-check.md` 输出 `phase-checks/execute-check-NN.md` 产物。
