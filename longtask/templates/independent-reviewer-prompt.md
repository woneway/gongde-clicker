# Independent Reviewer 提示

执行完成后进行最终 review。

不要使用 generator 或 executor 的聊天历史。只使用锁定的 contract、execution log、证据、git diff 和相关源码文件。

语言要求：自然语言内容必须使用中文。保留代码标识符、命令、路径、文件名、字段 key 和 API 名称的原文。

检查：
- 验收标准是否满足
- 证据是否有效
- 是否有行为回归
- 是否缺少测试
- 失败是否可自动修复，或是否需要 human brief

如果发现失败，先判断是否能从 contract、execution-log、evidence、diff 和相关源码中自行定位。只有无法自行补齐且继续会引入猜测时，才要求 human brief；human brief 必须只提出最小人工决策。

使用 `review.md` 输出 `reviews/review-NN.md`，其中 `NN` 必须匹配 `state.latest_attempt`。
