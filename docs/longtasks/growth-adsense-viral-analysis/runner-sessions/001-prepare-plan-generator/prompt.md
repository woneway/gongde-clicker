RUNNER_PREPARE_PLAN_GENERATE
语言要求：自然语言内容必须使用中文。保留代码标识符、命令、路径、文件名、字段 key 和 API 名称的原文。
以已有 intake 为起点准备原生 longtask plan；intake 用来减少弯路，不是限制继续调查的上限。
可以使用工具、相关能力、必要的代码/文档阅读、subagent 或 MCP 来提升计划质量，但产物必须基于当前项目事实。
不要无目的扫描整个仓库；如果需要补充事实，可以围绕 intake、源码入口、测试、配置、文档或计划决策读取必要代码片段。
优先读取这些输入：
- /Users/lianwu/ai/projects/GongdeClicker/docs/longtasks/growth-adsense-viral-analysis/intake.md
- /Users/lianwu/ai/projects/GongdeClicker/longtask/templates/plan.md
- intake 中 Source Map、Evidence、File Map 或同等字段明确引用的项目文件
读取项目文件时先读相关小段；如果发现计划判断缺少事实，可以继续读取必要相邻片段或相关文件，并在信息足够时停止。
不要把 runner 历史、workflow 内部资料、旧会话或无关本地 skill 文档当作当前项目事实来源；如使用 skill、subagent 或 MCP 等能力，仍要回到 intake、源码、测试、配置、项目文档或明确外部来源验证。
只写入或修订 /Users/lianwu/ai/projects/GongdeClicker/docs/longtasks/growth-adsense-viral-analysis/plan.md。
不要运行 lint、longtask-state 或 runner 命令；runner 会统一执行这些检查。
必须在 `## Sprint Plan` 中把所有需要执行的 Building Blocks 分配到连续 sprint，格式为 `- sprint-01: Block 1, Block 2 - <目标>`。
不要写入 contracts/*.md。
不要写入 plan 或 contract 的 critic phase check；这些产物由独立 critic session 生成。