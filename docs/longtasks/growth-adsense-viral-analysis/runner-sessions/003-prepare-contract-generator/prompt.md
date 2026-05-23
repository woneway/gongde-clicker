RUNNER_PREPARE_CONTRACT_GENERATE
语言要求：自然语言内容必须使用中文。保留代码标识符、命令、路径、文件名、字段 key 和 API 名称的原文。
只基于已有 intake 和 plan 准备完整 sprint contract 包。
可以使用工具、相关能力、必要的代码/文档阅读、subagent 或 MCP 来提升合同质量，但 contract 必须基于 intake、plan 和当前项目事实。
任务目录：/Users/lianwu/ai/projects/GongdeClicker/docs/longtasks/growth-adsense-viral-analysis
优先读取这些输入：
- /Users/lianwu/ai/projects/GongdeClicker/docs/longtasks/growth-adsense-viral-analysis/intake.md
- /Users/lianwu/ai/projects/GongdeClicker/docs/longtasks/growth-adsense-viral-analysis/plan.md
- /Users/lianwu/ai/projects/GongdeClicker/longtask/templates/contract.md
如果 contract 边界、验证或写入范围缺少事实，可以读取 plan 明确指向的项目文件小片段。
不要把 runner 历史、workflow 内部资料、旧会话或无关本地 skill 文档当作当前项目事实来源；如使用 skill、subagent 或 MCP 等能力，仍要回到 intake、plan、源码、测试、配置、项目文档或明确外部来源验证。
不要运行 lint、longtask-state 或 runner 命令；runner 会在 critic 写入 phase check 后统一 lint。
读取 plan.md 的 Sprint Plan，并为其中每个 sprint 写入对应 `contracts/sprint-NN.md`。
本次必须写入这些合同：contracts/sprint-01.md, contracts/sprint-02.md, contracts/sprint-03.md
每个 contract 的 `Visible Completion` 必须直接包含 lint 可识别的完成信号词：`done when`、`complete`、`passes`、`exists` 或 `verified`；优先写成 `done when <artifact> exists and is complete ... Acceptance Criteria are verified`。
Outcome Links 只能引用 plan 中 Status 为 closed 的 Outcome ID；可以细化 closed outcome 的验收标准，但不要新增结果承诺。
如果后续 sprint 依赖前序 sprint 计划产生的文件或证据，必须在 Context Map、Verification Plan 或 Risk Notes 中写清 producer sprint、预期路径、生产方 completion/evidence/write scope 和当前用途；prepare 阶段不要求这些前序 planned output 已存在。
不要把普通外部输入、当前 sprint 自身必须先存在的输入，或没有前序生产来源的路径标成 planned output。
保持 contract Status 为 proposed，并在 execute 前停止。
不要写入 contract critic phase check；该产物由独立 critic session 生成。