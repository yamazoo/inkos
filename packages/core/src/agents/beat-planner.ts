import { BaseAgent } from "./base.js";
import type { BeatPlannerInput, BeatPlannerOutput, ChapterType, BeatSheetOutputV2 } from "../models/input-governance.js";
import { ChapterTypeSchema } from "../models/input-governance.js";
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
    const parsed = ChapterTypeSchema.safeParse(rawType);
    const chapterType: ChapterType = parsed.success ? parsed.data : "combat";

    // Parse hook to advance (format: "推进钩子: hook-xxx")
    const hookMatch = beatSheet.match(/推进钩子[:：]\s*(\S+)/);
    const hookToAdvance = hookMatch?.[1] ?? null;

    // Count beats from table rows (lines starting with | and a digit)
    const beatCount = (beatSheet.match(/^\|\s*\d+\s*\|/gm) ?? []).length;

    // Try to extract structured V2 data from the beatSheet markdown
    let beatSheetV2: BeatSheetOutputV2 | undefined;
    try {
      const rows = beatSheet.match(/^\|\s*([^|]+?)\s*\|\s*(\d+)%[^\|]*\|/gm) ?? [];
      const beats = rows.map((row, i) => {
        const cols = row.split("|").map((c) => c.trim()).filter(Boolean);
        const pct = parseInt(cols[1] ?? "10", 10);
        return {
          beatId: `B${i + 1}`,
          name: cols[0] ?? "",
          targetWordsPct: pct,
          targetWords: Math.round((input.wordCount.target * pct) / 100),
          cost: undefined,
          gain: undefined,
          factionImpact: [],
          hookAdvance: [],
          pacing: { speed: "moderate" as const, voice: "mixed" as const, mood: "" },
          mustInclude: [],
          mustAvoid: [],
          beatDescription: cols[4] ?? "",
        };
      });
      beatSheetV2 = {
        schemaVersion: 2 as const,
        chapter: input.chapterNumber,
        chapterType,
        totalTargetWords: input.wordCount.target,
        beats,
        chapterEndTwist: { cost: "", gain: "", newDilemma: "", newOpportunity: "" },
        expectedFactionChanges: [],
        expectedMoodChange: { tensionDelta: 0, warmthDelta: 0 },
      };
    } catch {
      // V2 parsing failed — beatSheetV2 stays undefined
    }

    const { writeFile, mkdir } = await import("node:fs/promises");
    await mkdir(runtimeDir, { recursive: true });
    await writeFile(beatsPath, beatSheet, "utf-8");

    this.log?.info(`[beat-planner] Beat sheet written to ${beatsPath}`);
    this.log?.info(`[beat-planner] chapter type: ${chapterType}, beat count: ${beatCount}, hook: ${hookToAdvance}`);

    return { beatSheet, chapterType, hookToAdvance, beatCount, beatSheetV2 };
  }
}
