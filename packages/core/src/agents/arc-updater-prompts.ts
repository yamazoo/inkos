import type { ChapterCompletionReport } from "../models/runtime-state.js";

export function buildArcUpdaterSystemPrompt(_language: "zh" | "en" = "zh"): string {
  return `你是 ArcUpdaterAgent，负责校验和更新三大追踪器（arcTracker, factionLedger, moodArc）。

## 你的任务
1. 读取 Writer 输出的章完成报告（结构化 JSON）
2. 对照章节正文，校验报告中的 factionChanges / hookChanges 是否与正文事实一致
3. 如果校验通过，更新三个追踪器文件
4. 如果校验失败，返回错误详情，要求 Writer 重填报告（不重写正文）

## 校验规则
### 校验1: FactionChanges
对每个 factionChange，在正文中搜索关键词（如faction名、相关事件）。
找不到匹配 → error: "faction_change_unverified"

### 校验2: HookAdvance
对每个 advanced hook，在正文中搜索该 hook 的种子关键词。
找不到匹配 → error: "hook_advance_unverified"

### 校验3: BeatCoverage
每个 beatId 必须在正文中至少被一个场景覆盖。

### 校验4: keyDialogue（Warning 级别，不阻断）
每个 requiredLine 应在正文中出现。未出现 → warning: "dialogue_missing"（不阻断）

## 追踪器更新规则
### FactionLedger
将每个 factionChange 的 delta 追加到对应 faction 的 recentDeltas，更新 protagonist 的 exposureRisk / socialCapital

### MoodArc
将本章的 MoodChange 追加到 entries 数组

### ArcTracker
更新 currentChapter 为本章编号，如果 arcProgress 表明节点完成 → status → "completed"，下一个 pending 节点 → "active"

## 输出格式
校验通过：返回 { arcTracker, factionLedger, moodArc } 三个追踪器的完整 JSON
校验失败：返回 { error: "validation_failed", errors: [{ type: "...", detail: "..." }] }`;
}

export function buildArcUpdaterUserPrompt(
  completionReport: ChapterCompletionReport,
  chapterContent: string,
  existingTrackers: {
    arcTrackerJson: string;
    factionLedgerJson: string;
    moodArcJson: string;
  },
  language: "zh" | "en" = "zh",
): string {
  if (language === "zh") {
    return `## 章完成报告
\`\`\`json
${JSON.stringify(completionReport, null, 2)}
\`\`\`

## 章节正文
${chapterContent.slice(0, 8000)}

## 当前追踪器状态

### ArcTracker
\`\`\`json
${existingTrackers.arcTrackerJson}
\`\`\`

### FactionLedger
\`\`\`json
${existingTrackers.factionLedgerJson}
\`\`\`

### MoodArc
\`\`\`json
${existingTrackers.moodArcJson}
\`\`\`

请执行校验并返回更新后的追踪器 JSON，或错误详情。`;
  }
  return `## Chapter Completion Report
\`\`\`json
${JSON.stringify(completionReport, null, 2)}
\`\`\`

## Chapter Content
${chapterContent.slice(0, 8000)}

## Existing Trackers
${existingTrackers.arcTrackerJson}
${existingTrackers.factionLedgerJson}
${existingTrackers.moodArcJson}`;
}
