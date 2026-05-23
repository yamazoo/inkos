import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { BaseAgent } from "./base.js";
import { readStoryFrame, readCharacterContext } from "../utils/outline-paths.js";
import { CoverOutputSchema, type CoverOutput } from "../models/cover.js";
import {
  buildCoverSystemPrompt,
  buildCoverUserPrompt,
  resolveGenreCoverStyle,
} from "./cover-prompts.js";

export interface CoverGenerateParams {
  readonly bookId: string;
  readonly bookTitle: string;
  readonly genre: string;
  readonly bookDir: string;
  readonly extraContext?: string;
}

const MAX_STORY_FRAME_CHARS = 2000;
const MAX_CHARACTER_CHARS = 1500;
const MAX_PARSE_RETRIES = 2;

const BRIEF_SECTIONS = ["核心概念", "金手指", "主角", "世界观"];

async function readOrEmpty(path: string): Promise<string> {
  try {
    return await readFile(path, "utf-8");
  } catch {
    return "";
  }
}

function extractBriefSections(raw: string): string {
  if (!raw.trim()) return "";

  const lines = raw.split("\n");
  const sections: string[] = [];
  let currentSection: string | null = null;
  let currentLines: string[] = [];

  for (const line of lines) {
    const headingMatch = line.match(/^#{1,3}\s+(.+)/);
    if (headingMatch) {
      if (currentSection && currentLines.length > 0) {
        sections.push(`### ${currentSection}\n${currentLines.join("\n")}`);
      }
      const heading = headingMatch[1]!.trim();
      const matched = BRIEF_SECTIONS.some((s) => heading.includes(s));
      currentSection = matched ? heading : null;
      currentLines = [];
    } else if (currentSection !== null) {
      currentLines.push(line);
    }
  }

  if (currentSection && currentLines.length > 0) {
    sections.push(`### ${currentSection}\n${currentLines.join("\n")}`);
  }

  return sections.length > 0 ? sections.join("\n\n") : raw.slice(0, 1500);
}

function truncateAtSentence(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;

  const truncated = text.slice(0, maxChars);
  const sentenceEnders = /[。！？!?.…]/g;
  let lastEnd = -1;
  let match: RegExpExecArray | null;

  while ((match = sentenceEnders.exec(truncated)) !== null) {
    lastEnd = match.index + match[0].length;
  }

  return lastEnd > maxChars * 0.5 ? truncated.slice(0, lastEnd) : truncated;
}

function parseCandidates(content: string): unknown {
  // Try code fence first
  const fenceMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (fenceMatch) {
    return JSON.parse(fenceMatch[1]!);
  }

  // Fallback: raw JSON
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("CoverAgent: no JSON found in LLM response");
  }
  return JSON.parse(jsonMatch[0]);
}

export class CoverAgent extends BaseAgent {
  get name(): string {
    return "cover";
  }

  async generate(params: CoverGenerateParams): Promise<CoverOutput> {
    const { style, isFallback } = resolveGenreCoverStyle(params.genre);
    if (isFallback) {
      this.log?.warn(
        `[cover] Genre "${params.genre}" has no cover style mapping, using xuanhuan default`,
      );
    }

    const storyDir = join(params.bookDir, "story");
    const [briefRaw, storyFrame, characterContext] = await Promise.all([
      readOrEmpty(join(storyDir, "brief.md")),
      readStoryFrame(params.bookDir),
      readCharacterContext(params.bookDir),
    ]);

    const briefExtract = extractBriefSections(briefRaw);
    const storyFrameExtract = storyFrame.slice(0, MAX_STORY_FRAME_CHARS);
    const characterAppearance = characterContext.slice(0, MAX_CHARACTER_CHARS);

    const systemPrompt = buildCoverSystemPrompt(style);
    const userPrompt = buildCoverUserPrompt({
      bookTitle: params.bookTitle,
      genre: params.genre,
      briefExtract,
      storyFrameExtract,
      characterAppearance,
      extraContext: params.extraContext,
    });

    const response = await this.chat(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      { temperature: 0.8 },
    );

    return this.parseResult(response.content, params.bookId);
  }

  private async parseResult(
    content: string,
    bookId: string,
  ): Promise<CoverOutput> {
    let parsed: unknown;

    try {
      parsed = parseCandidates(content);
    } catch (e) {
      throw new Error(`CoverAgent: failed to parse LLM response: ${e}`);
    }

    // Apply post-processing to candidates before validation
    if (parsed && typeof parsed === "object" && "candidates" in parsed) {
      const obj = parsed as Record<string, unknown> & { candidates: Array<Record<string, unknown>> };
      obj.candidates = obj.candidates.map((c) => ({
        ...c,
        synopsis:
          typeof c.synopsis === "string"
            ? truncateAtSentence(c.synopsis, 200)
            : c.synopsis,
        coverPrompt:
          typeof c.coverPrompt === "string"
            ? truncateAtSentence(c.coverPrompt, 600)
            : c.coverPrompt,
      }));

      // Always set from code — never trust LLM for these fields
      obj.generatedAt = new Date().toISOString();
      obj.bookId = bookId;
    }

    try {
      return CoverOutputSchema.parse(parsed);
    } catch (validationError) {
      // Retry if < 6 candidates (model may have produced fewer)
      if (
        parsed &&
        typeof parsed === "object" &&
        "candidates" in parsed
      ) {
        const obj = parsed as { candidates: unknown[] };
        if (obj.candidates.length < 6) {
          this.log?.warn(
            `[cover] Got ${obj.candidates.length}/6 candidates, retrying for remaining...`,
          );
          return this.retryForMoreCandidates(
            content,
            bookId,
            obj.candidates as Array<Record<string, unknown>>,
          );
        }
      }
      throw new Error(
        `CoverAgent: Zod validation failed: ${validationError}`,
      );
    }
  }

  private async retryForMoreCandidates(
    originalContent: string,
    bookId: string,
    existingCandidates: Array<Record<string, unknown>>,
  ): Promise<CoverOutput> {
    const existingStyleTags = existingCandidates
      .map((c) => c.styleTag)
      .filter(Boolean);

    for (let attempt = 0; attempt < MAX_PARSE_RETRIES; attempt++) {
      const retryPrompt = `之前的输出只生成了${existingCandidates.length}个候选，缺少${6 - existingCandidates.length}个。
已有风格标签：${existingStyleTags.join(", ")}
请只输出缺少的候选，确保每个都不同且不与已有标签重复。输出完整JSON（含全部6个候选）。

原始输出：
${originalContent}`;

      const response = await this.chat(
        [{ role: "user", content: retryPrompt }],
        { temperature: 0.8 },
      );

      try {
        return await this.parseResult(response.content, bookId);
      } catch {
        this.log?.warn(
          `[cover] Retry ${attempt + 1}/${MAX_PARSE_RETRIES} failed, trying again...`,
        );
      }
    }

    throw new Error(
      `CoverAgent: could not generate 6 valid candidates after ${MAX_PARSE_RETRIES} retries`,
    );
  }
}
