/**
 * pacing-validator.ts
 *
 * LLM-based pacing validator for chapter outlines.
 * Checks whether the opening chapters (Ch1-3) satisfy golden finger pacing
 * constraints. If not, provides a regeneration prompt to fix them.
 */

import type { ChapterNode } from "../models/volume-outline.js";
import type { LLMMessage, LLMResponse } from "../llm/provider.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PacingValidationResult {
  readonly pass: boolean;
  readonly reason: string;
}

// ---------------------------------------------------------------------------
// Validator prompt
// ---------------------------------------------------------------------------

function buildValidationPrompt(
  chapters: ChapterNode[],
  lang: "zh" | "en",
): { system: string; user: string } {
  const chapterText = chapters
    .map(
      (ch) =>
        `Chapter ${ch.chapter}:\n  event: ${ch.event}\n  beat: ${ch.beat}\n  description: ${ch.description}`,
    )
    .join("\n\n");

  if (lang === "en") {
    return {
      system: `You are a pacing auditor for web novels. Your job is to evaluate whether the opening chapters satisfy a strict golden finger pacing rule.

Rule: The protagonist's special ability (golden finger) must produce a VISIBLE COMBAT RESULT against a REAL ENEMY by the end of chapter 3. "Awakening", "sensing", "discovering the ability", "testing on objects/animals" do NOT count. Only a moment where the ability directly causes damage, defeat, knockback, or a decisive combat advantage against a hostile human/intelligent enemy counts.

Answer with exactly one line: "PASS: <reason>" or "FAIL: <reason>".`,
      user: `Evaluate these opening chapters:\n\n${chapterText}`,
    };
  }

  return {
    system: `你是一位网文节奏审计师。你的任务是判断开篇章节是否满足金手指节奏硬性规则。

规则：主角的特殊能力（金手指）必须在第3章结束前对真实敌人产生可见的战斗结果。"觉醒""感知到""发现能力""对物体/动物测试"都不算。只有金手指直接导致对敌对人类/智慧生物造成伤害、击退、击倒或决定性战斗优势的瞬间才算。

回答格式严格为一行："PASS: <原因>" 或 "FAIL: <原因>"。`,
    user: `评估以下开篇章节：\n\n${chapterText}`,
  };
}

// ---------------------------------------------------------------------------
// Regeneration prompt
// ---------------------------------------------------------------------------

export function buildOpeningRegenerationPrompt(
  chapters: ChapterNode[],
  volumeProse: string,
  storyFrame: string,
  lang: "zh" | "en",
): { system: string; user: string } {
  const chapterNumbers = chapters.map((c) => c.chapter);
  const start = Math.min(...chapterNumbers);
  const end = Math.max(...chapterNumbers);
  const count = end - start + 1;

  const existingSummary = chapters
    .map((ch) => `Ch${ch.chapter}: ${ch.event} | ${ch.beat}`)
    .join("\n");

  if (lang === "en") {
    return {
      system: `You are a chapter outline specialist. Your task is to regenerate ${count} opening chapters with STRICT pacing requirements.

Output ONLY a JSON array — no prose, no markdown, no code fences.

Each element must have exactly these fields:
- "chapter": number (from ${start} to ${end})
- "event": string (10-50 chars)
- "beat": string (10-50 chars)
- "description": string (200-500 chars with 2-5 scene beats separated by "；")

CRITICAL PACING RULES:
1. The protagonist's golden finger MUST be discovered in chapter ${start} and COMBAT-TRIGGERED against a real enemy by chapter ${start + 2} at latest
2. "Combat-triggered" means: the ability directly causes damage/knockback/defeat against a hostile human or intelligent creature
3. "Testing on rocks/animals/objects" does NOT count as combat trigger
4. The learning/discovery phase CANNOT exceed 1 chapter
5. Each chapter must end with a page-turn hook`,
      user: `Regenerate chapters ${start}-${end} with faster golden finger pacing.

Volume prose:
${volumeProse}

Story frame:
${storyFrame}

Current outlines (too slow, need fixing):
${existingSummary}

Output exactly ${count} chapter objects in a JSON array, chapter ${start} to ${end}. The golden finger MUST produce a combat result by chapter ${start + 2}.`,
    };
  }

  return {
    system: `你是一位章节细纲专家。你的任务是重新生成${count}个开篇章节，严格满足节奏要求。

只输出 JSON 数组——不要输出任何散文、Markdown 或代码块标记。

每个元素必须包含以下字段：
- "chapter": 数字（从 ${start} 到 ${end}）
- "event": 字符串（10-50字）
- "beat": 字符串（10-50字）
- "description": 字符串（200-500字，2-5个场景节拍用"；"分隔）

关键节奏规则：
1. 金手指必须在第${start}章发现，在第${start + 2}章之前完成首次战斗触发
2. "战斗触发"= 金手指直接对敌对人类/智慧生物造成伤害/击退/击倒
3. "对石头/动物/物体测试"不算战斗触发
4. 学习/发现阶段不超过1章
5. 每章必须有翻页钩子`,
    user: `重新生成第${start}章～第${end}章，加快金手指节奏。

卷纲散文：
${volumeProse}

故事框架：
${storyFrame}

当前细纲（节奏太慢，需要修正）：
${existingSummary}

输出恰好 ${count} 个章节对象的 JSON 数组，chapter 从 ${start} 到 ${end}。金手指必须在第${start + 2}章之前产生战斗结果。`,
  };
}

// ---------------------------------------------------------------------------
// Core validation function
// ---------------------------------------------------------------------------

type ChatFn = (
  messages: ReadonlyArray<LLMMessage>,
  options?: { readonly temperature?: number; readonly maxTokens?: number },
) => Promise<LLMResponse>;

export async function validateOpeningPacing(
  chapters: ChapterNode[],
  chatFn: ChatFn,
  lang: "zh" | "en" = "zh",
): Promise<PacingValidationResult> {
  if (chapters.length === 0) {
    return { pass: true, reason: "no chapters to validate" };
  }

  const { system, user } = buildValidationPrompt(chapters, lang);

  const response = await chatFn(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { temperature: 0.1, maxTokens: 200 },
  );

  const text = response.content.trim();
  // LLMs sometimes prepend preamble; search for verdict keyword
  const hasPass = /\bPASS\b/i.test(text);
  const hasFail = /\bFAIL\b/i.test(text);
  const isPass = hasPass && !hasFail;

  return {
    pass: isPass,
    reason: text,
  };
}
