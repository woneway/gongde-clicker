# 修复交接

> 语言要求：自然语言内容必须使用中文。保留代码标识符、命令、路径、文件名、字段 key 和 API 名称的原文。

- **Source Review**: review-01
- **Failure Classification**: implementation-bug
- **Fail Type**: auto
- **Routing Reason**: <为什么修复是安全的>
- **Allowed Repair Scope**: <路径>
- **Register Command**: `node longtask/scripts/longtask-state.js docs/longtasks/<task-id> set-handoff handoff.md`
- **Required Findings**:
  - <从 review 复制的 finding>
- **Required Evidence After Repair**:
  - `<命令>` 输出已捕获到 `evidence/attempt-02/`
