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
- "description": string (detailed plot summary including chapter-end hook, 50-200 chars)

Rules:
1. Chapter numbers must be sequential with no gaps
2. Each chapter must have a distinct event and beat
3. Description must include a chapter-end hook (cliffhanger or question)
4. Maintain narrative arc: setup → rising action → climax → resolution
5. Do NOT repeat the same event across chapters
6. If the prose is vague, create plausible content that fits the volume theme`;
  }

  return `你是一位专业的小说细纲架构师。你的任务是从卷纲散文中提取结构化的章节细纲。

只输出 JSON 数组——不要输出任何散文、Markdown 或代码块标记。

每个元素必须包含以下字段：
- "chapter": 数字（从指定的起始章节号顺序递增）
- "event": 字符串（本章核心事件/冲突，10-50字）
- "beat": 字符串（本章节奏转折点，10-50字）
- "description": 字符串（详细剧情概述，含章末钩子，50-200字）

规则：
1. 章节号必须连续递增，不能有间隔
2. 每章必须有独立的事件和节奏点
3. description 必须包含章末钩子（悬念或疑问）
4. 保持叙事弧线：铺垫 → 上升 → 高潮 → 收束
5. 不同章节不能重复相同的事件
6. 如果散文内容模糊，请根据卷主题创建合理内容`;
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
    return `Generate exactly ${count} chapter outlines (chapters ${start}–${end}) for this volume.

Book: ${input.bookTitle}
Volume: ${input.volumeTitle}

Volume Prose:
${input.volumeProse}

Story Frame:
${input.storyFrame}

Output exactly ${count} chapter objects in a JSON array, with chapter numbers from ${start} to ${end}.`;
  }

  return `为以下卷生成恰好 ${count} 章的细纲（第${start}章～第${end}章）。

书名：${input.bookTitle}
卷名：${input.volumeTitle}

卷纲散文：
${input.volumeProse}

故事框架：
${input.storyFrame}

输出恰好 ${count} 个章节对象的 JSON 数组，chapter 字段从 ${start} 到 ${end}。`;
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
    return `Continue generating chapter outlines for chapters ${batchStart}–${batchEnd} (${count} chapters).

Previous chapters summary:
${previousSummary}

Volume prose:
${input.volumeProse}

Maintain narrative continuity with the previous chapters. Output only the JSON array.`;
  }

  return `继续生成第${batchStart}章～第${batchEnd}章的细纲（共${count}章）。

前面章节摘要：
${previousSummary}

卷纲散文：
${input.volumeProse}

保持与前面章节的叙事连贯性。只输出 JSON 数组。`;
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
