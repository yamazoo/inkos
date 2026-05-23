/**
 * outline-init-prompts.ts
 *
 * Prompt builders for OutlineInitAgent — generates structured ChapterNode[]
 * from volume prose text.
 */

export interface OutlineInitPromptInput {
  readonly bookTitle: string;
  readonly volumeTitle: string;
  readonly volumeProse: string;
  readonly storyFrame: string;
  readonly chapterRange: [number, number];
  readonly language?: "zh" | "en";
  /** User creation brief — highest priority for identity/setting preservation. */
  readonly brief?: string;
  /** Concatenated role cards — used for protagonist identity detection. */
  readonly characterContext?: string;
  /** Available satisfaction types from genre profile. LLM picks one per chapter. */
  readonly satisfactionTypes?: readonly string[];
}

/**
 * System prompt for outline initialization.
 * Instructs the LLM to output a pure JSON array of chapter objects.
 */
export function buildOutlineInitSystemPrompt(lang: "zh" | "en" = "zh"): string {
  if (lang === "en") {
    return `You are a professional novel outline architect. Your task is to extract structured chapter outlines from volume prose text.

Output ONLY a JSON array — no prose, no markdown, no code fences.

Each element must have exactly these fields:
- "chapter": number (sequential starting from the given start)
- "event": string (the core event/conflict of this chapter, 10-50 chars)
- "beat": string (the pacing beat / turning point, 10-50 chars)
- "description": string (detailed scene-by-scene breakdown, 200-500 chars)

Rules:
1. Chapter numbers must be sequential with no gaps
2. Each chapter must have a distinct event and beat
3. Description must cover 2-5 concrete scene beats with: who does what, where, key sensory detail, and a chapter-end hook (cliffhanger or question). Write each scene beat as a short clause separated by "；". The description is the primary input for downstream planning — it must contain enough narrative substance for a 3000+ word chapter.
4. Maintain narrative arc: setup → rising action → climax → resolution
5. Do NOT repeat the same event across chapters
6. If the prose is vague, create plausible content that fits the volume theme
7. Strictly respect event boundaries from the source — events described separately (e.g., awakening vs. clan competition) MUST be in different chapters, never merged
8. Strictly follow exact quantities from the source — if it says "first sword intent" that is 1, not 3; if it says "clan competition" that is one event, not multiple

Pacing constraints (mandatory, same priority as rules above):
9. Satisfaction beat ceiling: every 3 chapters must include at least one reader payoff (face-slap, breakthrough, reversal, surprise gain, enemy setback). Pure setup/training/suffering cannot exceed 2 consecutive chapters
10. Opening acceleration: the protagonist's golden finger (special ability) must be DISCOVERED in chapter 1 and COMBAT-TRIGGERED (used against a real enemy, not just awakened or tested on animals) by chapter 3 at the latest. "Discovery" or "awakening" does NOT count as a highlight — only the moment it produces a visible, irreversible result in conflict counts. No all-setup/all-suffering openings
11. Chapter type rotation: no more than 2 consecutive chapters of the same pacing type (e.g., no 3 chapters of pure "passive suffering" or "training montage"). Rotate between conflict, scheming, breakthrough, payoff, and suspense
12. Every chapter must end with clear "page-turn drive" — a question or conflict the reader must turn the page to resolve. No "summarizing" or "calm" endings. The final paragraph must contain an external anchor (concrete action, dialogue, or environmental detail) — pure internal monologue, emotional declarations, or vague announcements are forbidden
13. The protagonist must have at least 2 proactive actions (setting traps, counterattacking, initiating offense) within the first 10 chapters — no purely passive suffering
14. Golden finger pacing: the "learning/discovery" phase cannot exceed 1 chapter. After the ability is first noticed, the protagonist must attempt combat use in the very next chapter. Do NOT spread awakening → learning → first test → first real use across 4+ chapters. The reader wants to see it WORK, not study it
15. If the story frame or character background contains identity tags (transmigration, reincarnation, isekai, system, rebirth), at least 1 of the first 3 chapters MUST have a description that explicitly includes the protagonist's "identity awareness" inner activity — e.g., "recalling past life", "comparing this world to the previous one", "applying prior-life knowledge to analyze the situation". This is a core setting, not optional
16. satisfactionType annotation: for each chapter, add a "satisfactionType" field chosen from the genre's satisfaction type list. Use null for pure setup chapters. No more than 2 consecutive chapters may reuse the same type. When fewer than 5 types are available, consecutive-reuse limit relaxes to 3`;
  }

  return `你是一位专业的小说细纲架构师。你的任务是从卷纲散文中提取结构化的章节细纲。

只输出 JSON 数组——不要输出任何散文、Markdown 或代码块标记。

每个元素必须包含以下字段：
- "chapter": 数字（从指定的起始章节号顺序递增）
- "event": 字符串（本章核心事件/冲突，10-50字）
- "beat": 字符串（本章节奏转折点，10-50字）
- "description": 字符串（详细场景分解，200-500字）

规则：
1. 章节号必须连续递增，不能有间隔
2. 每章必须有独立的事件和节奏点
3. description 必须覆盖 2-5 个具体场景节拍：谁做了什么、在哪里、关键感官细节、章末钩子（悬念或疑问）。每个场景节拍用短句描述，以"；"分隔。description 是下游规划的核心输入——必须包含足够的叙事细节来支撑 3000 字以上的章节正文
4. 保持叙事弧线：铺垫 → 上升 → 高潮 → 收束
5. 不同章节不能重复相同的事件
6. 如果散文内容模糊，请根据卷主题创建合理内容
7. 严格尊重源材料中的事件边界——散文中分开描述的事件（如觉醒与族比）必须分配到不同章节，不能合并为一章
8. 严格遵守源材料中的数量——散文说"第一道剑意"就是1道，不能自行增加为多道；说"族比"就是一场，不能拆为多场

节奏约束（强制执行，与上述规则同等优先级）：
9. 爽点间距上限：连续不超过3章必须出现至少一个读者爽点（打脸、突破、逆转、意外收获、敌人吃亏）。纯铺垫/修炼/受辱不能连续超过2章
10. 开篇加速：金手指（主角特殊能力）必须在第1章末尾或第2章初被发现，在第3章之前必须完成首次战斗触发（对真实敌人使用，产生可见的不可逆结果）。"觉醒""感知到""发现机制"不算高光时刻——只有金手指在冲突中产生实际战果才算。不允许前3章全是铺垫和受辱
11. 章节类型轮换：不能连续3章使用同一种节奏类型（如不能连续3章都是"被动受辱"或"修炼成长"）。必须在冲突、布局、突破、打脸、悬念之间轮换
12. 每章结尾必须有明确的「翻页驱动力」——一个读者必须翻到下一章才能知道答案的问题或冲突。不能以"总结式"或"平静式"收尾。最后一段必须包含外部锚点（具体动作/对话/环境细节），禁止以纯心理活动、情绪声明或模糊预告收尾
13. 主角在前10章内必须有至少2次主动行动（设计陷阱、反击、主动出击），不能全是被动承受
14. 金手指节奏：「学习/发现」阶段不超过1章。能力被发现后，下一章就必须尝试战斗使用。不要把觉醒→学习→首次测试→首次实战分散到4章以上。读者想看到它起作用，而不是研究它
15. 如果故事框架或角色背景中包含「穿越」「重生」「魂穿」「系统」「异世界」等身份标签，前3章中必须有至少1章的description明确包含主角的「身份意识」内心活动——例如「回忆前世经历」「对比异世界与前世的认知差异」「用前世知识分析当前处境」等。这是核心设定，不是可选项
16. satisfactionType 标注：每章必须添加一个 "satisfactionType" 字段，从本类型的爽感类型列表中选择。纯铺垫章使用 null。连续不超过2章使用相同类型。当可用类型少于5种时，连续重复上限放宽到3`;
}

/**
 * User prompt for generating chapters for a specific range.
 */
export function buildOutlineInitUserPrompt(
  input: OutlineInitPromptInput,
  start: number,
  end: number,
): string {
  const lang = input.language ?? "zh";
  const count = end - start + 1;

  if (lang === "en") {
    const briefBlock = input.brief
      ? `\n## User Creation Brief (highest priority)\n${input.brief}\n\nKey settings from the brief (protagonist identity, worldbuilding premises, power mechanics) MUST be realized in the outline — do not omit or defer them.\n`
      : "";

    const characterBlock = input.characterContext
      ? `\n## Character Profiles\n${input.characterContext}\n`
      : "";

    return `Generate exactly ${count} chapter outlines (chapters ${start}–${end}) for this volume.
${briefBlock}${characterBlock}
Book: ${input.bookTitle}
Volume: ${input.volumeTitle}

Volume Prose:
${input.volumeProse}

Story Frame:
${input.storyFrame}

Output exactly ${count} chapter objects in a JSON array, with chapter numbers from ${start} to ${end}.${input.satisfactionTypes?.length ? `\n\nAvailable satisfaction types (choose one per chapter, null for pure setup):\n${input.satisfactionTypes.map((t) => `- ${t}`).join("\n")}` : ""}`;
  }

  const briefBlock = input.brief
    ? `\n## 用户创作简报（最高优先级）\n${input.brief}\n\n简报中的核心设定（主角身份、世界观前提、金手指机制）必须在细纲中落地，不能省略或推迟。\n`
    : "";

  const characterBlock = input.characterContext
    ? `\n## 角色档案\n${input.characterContext}\n`
    : "";

  return `为以下卷生成恰好 ${count} 章的细纲（第${start}章～第${end}章）。
${briefBlock}${characterBlock}
书名：${input.bookTitle}
卷名：${input.volumeTitle}

卷纲散文：
${input.volumeProse}

故事框架：
${input.storyFrame}

输出恰好 ${count} 个章节对象的 JSON 数组，chapter 字段从 ${start} 到 ${end}。${input.satisfactionTypes?.length ? `\n\n可用爽感类型（每章选一个，纯铺垫章用 null）：\n${input.satisfactionTypes.map((t) => `- ${t}`).join("\n")}` : ""}`;
}

/**
 * Continuation prompt for subsequent batches.
 */
export function buildBatchContinuationPrompt(
  input: OutlineInitPromptInput,
  batchStart: number,
  batchEnd: number,
  previousSummary: string,
): string {
  const lang = input.language ?? "zh";
  const count = batchEnd - batchStart + 1;

  if (lang === "en") {
    const briefBlock = input.brief
      ? `\n## User Creation Brief (highest priority)\n${input.brief}\n`
      : "";

    return `Continue generating chapter outlines for chapters ${batchStart}–${batchEnd} (${count} chapters).
${briefBlock}
Previous chapters summary:
${previousSummary}

Volume prose:
${input.volumeProse}

Maintain narrative continuity with the previous chapters. Output only the JSON array.${input.satisfactionTypes?.length ? `\n\nAvailable satisfaction types (choose one per chapter, null for pure setup):\n${input.satisfactionTypes.map((t) => `- ${t}`).join("\n")}` : ""}`;
  }

  const briefBlock = input.brief
    ? `\n## 用户创作简报（最高优先级）\n${input.brief}\n`
    : "";

  return `继续生成第${batchStart}章～第${batchEnd}章的细纲（共${count}章）。
${briefBlock}
前面章节摘要：
${previousSummary}

卷纲散文：
${input.volumeProse}

保持与前面章节的叙事连贯性。只输出 JSON 数组。${input.satisfactionTypes?.length ? `\n\n可用爽感类型（每章选一个，纯铺垫章用 null）：\n${input.satisfactionTypes.map((t) => `- ${t}`).join("\n")}` : ""}`;
}

/**
 * Extract a short summary of the last N chapters from accumulated JSON text,
 * for use as batch continuation context.
 */
export function extractLastChaptersSummary(
  chapters: Array<{ chapter: number; event: string; beat: string }>,
  n: number,
  lang: "zh" | "en" = "zh",
): string {
  const tail = chapters.slice(-n);
  if (tail.length === 0) return lang === "en" ? "(none)" : "（无）";

  return tail
    .map(
      (ch) =>
        lang === "en"
          ? `Ch.${ch.chapter}: ${ch.event} | ${ch.beat}`
          : `第${ch.chapter}章：${ch.event} | ${ch.beat}`,
    )
    .join("\n");
}
