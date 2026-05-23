# Runner 报告：growth-adsense-viral-analysis

- 更新时间：2026-05-23T16:35:58.164Z
- Codex Exec 会话数：6
- 总耗时：11m 37s (697036 ms)
- 总有效 Token：395888
- 总原始 Token：1428336
- 输入 Token：1396216
- 缓存输入 Token：1032448
- 输出 Token：28880
- 推理输出 Token：3240

## 会话

| # | 会话 | 用途 | 状态 | 耗时 | 有效 Token | 原始 Token | 预算 | 产物 |
|---:|---|---|---|---:|---:|---:|---|---|
| 1 | prepare-plan-generator | 基于 intake 生成或修订 `plan.md`。 | 成功 | 2m 37s | 104734 | 331934 | running 40.6% | prompt：`runner-sessions/001-prepare-plan-generator/prompt.md`<br>stdout：`runner-sessions/001-prepare-plan-generator/stdout.jsonl`<br>summary：`runner-sessions/001-prepare-plan-generator/summary.json` |
| 2 | plan-critic-01 | 评审 `plan.md`，并写入对应 plan phase check。 | 成功 | 1m 38s | 58069 | 309973 | running 22.5% | prompt：`runner-sessions/002-plan-critic-01/prompt.md`<br>stdout：`runner-sessions/002-plan-critic-01/stdout.jsonl`<br>summary：`runner-sessions/002-plan-critic-01/summary.json` |
| 3 | prepare-contract-generator | 基于 intake 和 plan 生成完整 sprint contract 包。 | 成功 | 3m 1s | 70133 | 249845 | running 27.2% | prompt：`runner-sessions/003-prepare-contract-generator/prompt.md`<br>stdout：`runner-sessions/003-prepare-contract-generator/stdout.jsonl`<br>summary：`runner-sessions/003-prepare-contract-generator/summary.json` |
| 4 | contract-critic-01 | 评审 sprint contract，并写入对应 contract phase check。 | 成功 | 1m 56s | 68537 | 193337 | running 26.6% | prompt：`runner-sessions/004-contract-critic-01/prompt.md`<br>stdout：`runner-sessions/004-contract-critic-01/stdout.jsonl`<br>summary：`runner-sessions/004-contract-critic-01/summary.json` |
| 5 | contract-critic-02 | 评审 sprint contract，并写入对应 contract phase check。 | 成功 | 57s | 53500 | 127612 | running 20.7% | prompt：`runner-sessions/005-contract-critic-02/prompt.md`<br>stdout：`runner-sessions/005-contract-critic-02/stdout.jsonl`<br>summary：`runner-sessions/005-contract-critic-02/summary.json` |
| 6 | contract-critic-03 | 评审 sprint contract，并写入对应 contract phase check。 | 成功 | 1m 28s | 40915 | 215635 | running 15.9% | prompt：`runner-sessions/006-contract-critic-03/prompt.md`<br>stdout：`runner-sessions/006-contract-critic-03/stdout.jsonl`<br>summary：`runner-sessions/006-contract-critic-03/summary.json` |

## 说明

- 有效 Token 用于 runner 预算判断：输入减去缓存输入，再加输出和推理输出。
- 原始 Token 保留 provider 上报的完整输入总量，用于诊断。
- 完整 provider JSONL 输出保存在每个会话的 `stdout.jsonl`。
