function list(items) {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : "- none";
}

function renderPrompt(pkg, budget) {
  const parts = [
    "你正在执行一个有边界的原生 longtask 工作包。",
    "",
    "语言要求：自然语言内容必须使用中文。保留代码标识符、命令、路径、文件名、字段 key 和 API 名称的原文。",
    "",
    "不要依赖之前的聊天历史。除非当前工作包明确允许，否则只使用下面列出的产物和源码指针。",
    "",
    `任务：${pkg.taskId}`,
    `阶段：${pkg.phase}`,
    `Sprint：${pkg.currentSprint}`,
    `最新 Attempt：${pkg.latestAttempt}`,
    "",
    "只处理这个 Plan Block：",
    pkg.planBlock,
    "",
    "本会话的验收标准：",
    list(pkg.acceptanceCriteria),
    "",
    "必须产出的证据：",
    list(pkg.requiredEvidence),
    "",
    "允许写入范围：",
    pkg.allowedWriteScope || "none",
    "",
    "验证计划：",
    pkg.verificationPlan || "none",
    "",
    "必须读取：",
    `- ${pkg.planRel}`,
    `- ${pkg.contractRel}`,
    `- ${pkg.executionLogRel}`,
    `- ${pkg.handoffRel}，如果该文件存在`,
    "",
    "上下文预算规则：",
    `- 上下文 soft limit ratio：${budget.softRatio}`,
    `- 上下文 hard limit ratio：${budget.hardRatio}`,
    `- 配置的上下文上限：${budget.contextLimit}`,
    "- 如果接近上下文 soft limit，完成当前原子动作，更新 evidence/logs，写入 `handoff.md`，然后退出。",
    "- 不要开始下一个 Plan Block。",
    "- 不要扩大写入范围。",
    "",
    "`handoff.md` 必须包含当前阶段和 sprint、已完成工作、当前原子动作状态、剩余工作、下一条推荐命令、必须读取的文件、证据路径、验证状态、风险或未解决问题，以及 git/worktree 状态摘要。",
    "",
  ];

  if (budget.templateText) {
    parts.push("原生 workflow prompt 模板：", "", budget.templateText.trim(), "");
  }

  return parts.join("\n");
}

module.exports = { renderPrompt };
