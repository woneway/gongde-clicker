# Phase Check: <phase>

- **Phase**: <intake | plan | contract | execute>
- **Artifact**: <相对产物路径>
- **Critic Role**: <intake-critic | plan-critic | contract-critic | execution-checker>
- **Verdict**: <pass | revise | escalate>
- **Drift Check**: <该产物如何与上游产物保持一致>
- **Context Boundary**: <critic 读取了什么，以及没有接收哪些历史/上下文>
- **Self-Recovery Attempted**: <critic 在升级前读取、查询或检查了什么来尝试自行补齐缺口>
- **Escalation Decision**: <none，或需要人类做出的最小决策以及为什么无法自行补齐>
- **Required Revisions**: <none 或精确修订要求>
- **Evidence Checked**: <证据路径、命令或源码指针>

## Findings
1. [info] <发现项>
   - Evidence: `<路径或命令输出>`
