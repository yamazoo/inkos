/**
 * outline-init-agent.ts
 *
 * Generates structured ChapterNode[] from volume prose text.
 * Supports batched generation (20 chapters per LLM call) with
 * automatic continuation and retry on parse failure.
 */

import { BaseAgent } from "./base.js";
import { ChapterNodeSchema, type ChapterNode } from "../models/volume-outline.js";
import {
  buildOutlineInitSystemPrompt,
  buildOutlineInitUserPrompt,
  buildBatchContinuationPrompt,
  extractLastChaptersSummary,
  type OutlineInitPromptInput,
} from "./outline-init-prompts.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BATCH_SIZE = 20;
const MAX_TOKENS = 15_000;
const TEMPERATURE = 0.3;
const RETRY_LIMIT = 2;

// ---------------------------------------------------------------------------
// JSON extraction helper
// ---------------------------------------------------------------------------

/**
 * Extract a JSON array from LLM output.
 * Tries fenced code block first, then bare `[...]`.
 */
function extractJsonArray(raw: string): unknown[] {
  const fenced = raw.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
  const jsonStr = fenced?.[1] ?? raw.match(/(\[[\s\S]*?\])/)?.[1];
  if (!jsonStr) {
    throw new OutlineInitParseError("No JSON array found in LLM output");
  }

  const parsed: unknown = JSON.parse(jsonStr);
  if (!Array.isArray(parsed)) {
    throw new OutlineInitParseError("Parsed JSON is not an array");
  }
  return parsed;
}

/**
 * Parse and validate a raw array into ChapterNode[].
 * Throws OutlineInitParseError on validation failure.
 */
function validateChapters(raw: unknown[], expectedStart: number): ChapterNode[] {
  const chapters: ChapterNode[] = [];
  for (let i = 0; i < raw.length; i++) {
    const result = ChapterNodeSchema.safeParse(raw[i]);
    if (!result.success) {
      throw new OutlineInitParseError(
        `Chapter at index ${i} failed validation: ${result.error.message}`,
      );
    }
    chapters.push(result.data);
  }

  // Verify sequential numbering
  for (let i = 0; i < chapters.length; i++) {
    const expected = expectedStart + i;
    if (chapters[i]!.chapter !== expected) {
      throw new OutlineInitParseError(
        `Expected chapter ${expected} at index ${i}, got ${chapters[i]!.chapter}`,
      );
    }
  }

  return chapters;
}

// ---------------------------------------------------------------------------
// Custom error
// ---------------------------------------------------------------------------

export class OutlineInitParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OutlineInitParseError";
  }
}

// ---------------------------------------------------------------------------
// Agent
// ---------------------------------------------------------------------------

export class OutlineInitAgent extends BaseAgent {
  get name(): string {
    return "outline-init";
  }

  /**
   * Generate all chapters for a volume based on its chapterRange.
   */
  async generateChaptersForVolume(
    input: OutlineInitPromptInput,
  ): Promise<ChapterNode[]> {
    const [start, end] = input.chapterRange;
    return this._generateRange(input, start, end);
  }

  /**
   * Generate chapters only for the specified range [start, end].
   * Used by the 10-chapter lookahead in the writing pipeline.
   */
  async generateChaptersRange(
    input: OutlineInitPromptInput,
    start: number,
    end: number,
  ): Promise<ChapterNode[]> {
    return this._generateRange(input, start, end);
  }

  // -------------------------------------------------------------------------
  // Internal: batched generation with retry
  // -------------------------------------------------------------------------

  private async _generateRange(
    input: OutlineInitPromptInput,
    start: number,
    end: number,
  ): Promise<ChapterNode[]> {
    const lang = input.language ?? "zh";
    const allChapters: ChapterNode[] = [];
    let batchStart = start;

    while (batchStart <= end) {
      const batchEnd = Math.min(batchStart + BATCH_SIZE - 1, end);
      const isFirstBatch = batchStart === start;

      const userPrompt = isFirstBatch
        ? buildOutlineInitUserPrompt(input, batchStart, batchEnd)
        : buildBatchContinuationPrompt(
            input,
            batchStart,
            batchEnd,
            extractLastChaptersSummary(allChapters, 2, lang),
          );

      const systemPrompt = buildOutlineInitSystemPrompt(lang);
      const chapters = await this._callWithRetry(
        systemPrompt,
        userPrompt,
        batchStart,
      );

      allChapters.push(...chapters);
      batchStart = batchEnd + 1;
    }

    return allChapters;
  }

  /**
   * Call the LLM and parse the result, retrying once on parse failure.
   */
  private async _callWithRetry(
    systemPrompt: string,
    userPrompt: string,
    expectedStart: number,
  ): Promise<ChapterNode[]> {
    let currentUserMessage = userPrompt;
    let lastError: OutlineInitParseError | undefined;

    for (let attempt = 0; attempt < RETRY_LIMIT; attempt++) {
      const response = await this.chat(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: currentUserMessage },
        ],
        { temperature: TEMPERATURE, maxTokens: MAX_TOKENS },
      );

      try {
        const raw = extractJsonArray(response.content);
        return validateChapters(raw, expectedStart);
      } catch (error) {
        if (!(error instanceof OutlineInitParseError)) {
          throw error;
        }
        lastError = error;
        this.log?.warn(
          `[outline-init] parse failed (attempt ${attempt + 1}/${RETRY_LIMIT}): ${error.message}`,
        );
        currentUserMessage = `${userPrompt}\n\n## 上次输出错误\n${error.message}\n请修正后重新输出。`;
      }
    }

    throw lastError ?? new OutlineInitParseError("outline-init exhausted retries");
  }
}
