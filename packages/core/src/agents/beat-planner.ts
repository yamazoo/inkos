import { BaseAgent } from "./base.js";
import type { BeatPlannerInput, BeatPlannerOutput, ChapterType } from "../models/input-governance.js";
import { buildBeatPlannerSystemPrompt, buildBeatPlannerUserPrompt } from "./beat-planner-prompts.js";

export class BeatPlannerAgent extends BaseAgent {
  get name(): string {
    return "beat-planner";
  }

  async planBeats(input: BeatPlannerInput, runtimeDir: string): Promise<BeatPlannerOutput | null> {
    const lang = input.language ?? "zh";
    const systemPrompt = buildBeatPlannerSystemPrompt(lang);
    const userPrompt = buildBeatPlannerUserPrompt(input, lang);

    this.log?.info(`[beat-planner] Generating beat sheet for chapter ${input.chapterNumber}`);

    let response;
    try {
      response = await this.chat([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ], { temperature: 0.3, maxTokens: 2048 });
    } catch (err) {
      this.log?.warn(`[beat-planner] LLM call failed for chapter ${input.chapterNumber}: ${err}`);
      return null;
    }

    const beatSheet = response.content.trim();
    const chapterSlug = `chapter-${String(input.chapterNumber).padStart(4, "0")}`;
    const beatsPath = `${runtimeDir}/${chapterSlug}-beats.md`;

    // Parse chapter type from beatSheet (format: "**章类**: 战斗章" or "**Chapter Type**: combat")
    const chapterTypeMatch = beatSheet.match(/\*\*(?:章类|Chapter Type)\*\*[:：]\s*(\S+)/);
    const rawType = chapterTypeMatch?.[1]?.replace(/[`*\[\]]/g, "") ?? "combat";
    const chapterType: ChapterType = rawType as ChapterType;

    // Parse hook to advance (format: "推进钩子: hook-xxx")
    const hookMatch = beatSheet.match(/推进钩子[:：]\s*(\S+)/);
    const hookToAdvance = hookMatch?.[1] ?? null;

    // Count beats from table rows (lines starting with | and a digit)
    const beatCount = (beatSheet.match(/^\|\s*\d+\s*\|/gm) ?? []).length;

    const { writeFile, mkdir } = await import("node:fs/promises");
    await mkdir(runtimeDir, { recursive: true });
    await writeFile(beatsPath, beatSheet, "utf-8");

    this.log?.info(`[beat-planner] Beat sheet written to ${beatsPath}`);

    return { beatSheet, chapterType, hookToAdvance, beatCount };
  }
}
