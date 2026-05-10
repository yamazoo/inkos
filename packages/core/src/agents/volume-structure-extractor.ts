/**
 * volume-structure-extractor.ts
 *
 * Single LLM call to extract volume-level metadata from narrative prose.
 * Returns VolumeNode[] with `chapters: []` (skeleton only — no chapter data).
 */

import { z } from "zod";
import { BaseAgent } from "./base.js";
import type { VolumeNode } from "../models/volume-outline.js";

// ---------------------------------------------------------------------------
// Extraction output schema (LLM returns this)
// ---------------------------------------------------------------------------

const ExtractedVolumeSchema = z.object({
  volumeId: z.number().int().min(1),
  volumeTitle: z.string().min(1),
  chapterRange: z.tuple([z.number().int().min(1), z.number().int().min(1)]),
  coreConflict: z.string().default(""),
  keyTurnChapter: z.number().int().min(1),
  keyTurnEvent: z.string().default(""),
  harvestGoals: z.array(z.string()).default([]),
});

const ExtractionResponseSchema = z.array(ExtractedVolumeSchema);

// ---------------------------------------------------------------------------
// Prompts
// ---------------------------------------------------------------------------

function buildSystemPrompt(lang: "zh" | "en"): string {
  if (lang === "en") {
    return `You are a novel structure analyst. Extract volume-level metadata from the narrative prose.

Output ONLY a JSON array. Each element:
- "volumeId": number (sequential from 1)
- "volumeTitle": string (volume name, e.g. "Volume 1: Awakening")
- "chapterRange": [start, end] (inclusive chapter range for this volume)
- "coreConflict": string (main dramatic conflict)
- "keyTurnChapter": number (chapter number of the primary turning point)
- "keyTurnEvent": string (what happens at the turning point)
- "harvestGoals": string[] (payoff goals for this volume)

Rules:
1. chapterRange must not overlap between volumes
2. chapterRange must cover the full book continuously
3. keyTurnChapter must be within chapterRange
4. If unsure about chapter count, estimate based on content density`;
  }

  return `你是一位小说结构分析师。从叙事散文中提取卷级元数据。

只输出 JSON 数组。每个元素：
- "volumeId": 数字（从1顺序递增）
- "volumeTitle": 字符串（卷名，如"第一卷：暗流"）
- "chapterRange": [起始章, 结束章]（本卷包含的章节范围，闭区间）
- "coreConflict": 字符串（本卷核心戏剧冲突）
- "keyTurnChapter": 数字（关键转折章节号）
- "keyTurnEvent": 字符串（关键转折事件描述）
- "harvestGoals": 字符串[]（本卷收获/兑现目标）

规则：
1. 各卷 chapterRange 不能重叠
2. chapterRange 必须连续覆盖全书
3. keyTurnChapter 必须在 chapterRange 范围内
4. 不确定章节数时根据内容密度估算`;
}

function buildUserPrompt(
  prose: string,
  bookTitle: string,
  lang: "zh" | "en",
): string {
  if (lang === "en") {
    return `Extract volume structure from this narrative prose.

Book: ${bookTitle}

Prose:
${prose}`;
  }

  return `从以下叙事散文中提取卷结构。

书名：${bookTitle}

散文：
${prose}`;
}

// ---------------------------------------------------------------------------
// Agent
// ---------------------------------------------------------------------------

export class VolumeStructureExtractor extends BaseAgent {
  get name(): string {
    return "volume-structure-extractor";
  }

  /**
   * Extract volume-level metadata from narrative prose.
   * Returns VolumeNode[] with `chapters: []` for each volume.
   */
  async extract(
    prose: string,
    bookTitle: string,
    lang: "zh" | "en" = "zh",
  ): Promise<VolumeNode[]> {
    const systemPrompt = buildSystemPrompt(lang);
    const userPrompt = buildUserPrompt(prose, bookTitle, lang);

    const response = await this.chat(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      { temperature: 0.2, maxTokens: 4096 },
    );

    const volumes = this._parseResponse(response.content);
    return volumes.map((v) => ({
      ...v,
      chapters: [],
    }));
  }

  private _parseResponse(raw: string): z.infer<typeof ExtractionResponseSchema> {
    // Try fenced code block, then bare array
    const fenced = raw.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
    const jsonStr = fenced?.[1] ?? raw.match(/(\[[\s\S]*\])/)?.[1];
    if (!jsonStr) {
      throw new Error("[volume-structure-extractor] No JSON array found in LLM output");
    }

    const parsed: unknown = JSON.parse(jsonStr);
    return ExtractionResponseSchema.parse(parsed);
  }
}
