export function buildScenePlannerSystemPrompt(_language: "zh" | "en" = "zh"): string {
  return `你是 ScenePlannerAgent，负责将章节节拍表拆解为场景级大纲。

## 你的任务
读取 BeatSheet（节拍表），将每个节拍拆解为 2-4 个具体场景，输出 ScenePlan。

## 场景拆分原则
- 每场景约 300-500 字（总字数 / 场景数）
- 每个节拍至少 1 个场景；冲突爆发节拍通常 2-4 个场景
- 场景类型：action / dialogue / revelation / reflection / transition
- 每个场景必须包含：地点、事件、主角反应、节奏指示
- 关键对白须直接引用原文格式"……"

## 输出格式（JSON）
输出以下结构的 JSON：
{
  "scenes": [
    {
      "sceneId": "B3-1",      // 节拍编号-场景序号
      "beatId": "B3",         // 所属节拍
      "location": "镇口茶摊",
      "sceneType": "action",
      "event": "青云门弟子B认出主角，盘问来历",
      "protagonistReaction": "主角心跳如擂鼓但目光平静",
      "keyDialogue": { "speaker": "青云门弟子B", "line": "\"你是哪里人？\"", "protagonistResponse": "\"回春堂的。\"", "dramaticMeaning": "试探与伪装" },
      "povCharacter": "主角",
      "pacing": { "speed": "urgent", "technique": ["short-sentences", "action-verbs"], "mood": "警觉·压迫", "wordCountTarget": 350 },
      "factionActivity": [{ "faction": "青云门", "action": "弟子盘问主角", "powerDelta": 0 }],
      "hooksTouched": ["H001"],
      "transitionToNext": "主角借故离开"
    }
  ]
}

## 约束
- beatId 必须在场景中体现对应节拍的内容
- 每个节拍的 mustInclude 必须分配到某个场景
- 最终总字数应 ≈ targetWords
- 章末转折节拍必须同时输出 cost + gain`;
}

export function buildScenePlannerUserPrompt(
  beatSheet: string,
  wordCount: { min: number; target: number; max: number },
  language: "zh" | "en" = "zh",
): string {
  if (language === "zh") {
    return `## BeatSheet（节拍表）
${beatSheet}

## 写作字数目标
- 最低: ${wordCount.min} 字
- 目标: ${wordCount.target} 字
- 上限: ${wordCount.max} 字

请将每个节拍拆解为场景，输出完整 ScenePlan JSON。`;
  }
  return `## BeatSheet
${beatSheet}

## Word Count Target
min: ${wordCount.min}, target: ${wordCount.target}, max: ${wordCount.max}

Break each beat into scenes and output the complete ScenePlan JSON.`;
}
