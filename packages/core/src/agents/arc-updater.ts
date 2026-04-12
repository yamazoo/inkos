import { BaseAgent } from "./base.js";
import {
  ArcTrackerSchema,
  FactionLedgerSchema,
  MoodArcSchema,
  type ChapterCompletionReport,
  type ArcTracker,
  type FactionLedger,
  type MoodArc,
} from "../models/runtime-state.js";
import { buildArcUpdaterSystemPrompt, buildArcUpdaterUserPrompt } from "./arc-updater-prompts.js";
import { loadTracker, saveTracker, bootstrapArcTracker, bootstrapFactionLedger, bootstrapMoodArc } from "../state/tracker-store.js";

export interface ArcUpdaterInput {
  readonly bookId: string;
  readonly bookDir: string;
  readonly chapter: number;
  readonly completionReport: ChapterCompletionReport;
  readonly chapterContent: string;
  readonly language?: "zh" | "en";
}

export interface ArcUpdaterOutput {
  readonly arcTracker: ArcTracker;
  readonly factionLedger: FactionLedger;
  readonly moodArc: MoodArc;
  readonly errors: Array<{ type: string; detail: string }>;
}

export class ArcUpdaterAgent extends BaseAgent {
  get name(): string {
    return "arc-updater";
  }

  async updateTrackers(input: ArcUpdaterInput): Promise<ArcUpdaterOutput> {
    const lang = input.language ?? "zh";

    const [loadedArc, loadedFaction, loadedMood] = await Promise.all([
      loadTracker(input.bookDir, "arc-tracker", ArcTrackerSchema),
      loadTracker(input.bookDir, "faction-ledger", FactionLedgerSchema),
      loadTracker(input.bookDir, "mood-arc", MoodArcSchema),
    ]);

    // ?? on T | null yields T | null; use ! to narrow to T (bootstrap always valid fallback)
    const arcTrackerCurrent = (loadedArc ?? bootstrapArcTracker("", "未命名卷", [1, 1], "H001", "主悬念")) as ArcTracker;
    const factionLedgerCurrent = (loadedFaction ?? bootstrapFactionLedger("主角")) as FactionLedger;
    const moodArcCurrent = (loadedMood ?? bootstrapMoodArc("vol-1")) as MoodArc;

    const prompt = buildArcUpdaterUserPrompt(
      input.completionReport,
      input.chapterContent,
      {
        arcTrackerJson: JSON.stringify(arcTrackerCurrent, null, 2),
        factionLedgerJson: JSON.stringify(factionLedgerCurrent, null, 2),
        moodArcJson: JSON.stringify(moodArcCurrent, null, 2),
      },
      lang,
    );

    this.log?.info(`[arc-updater] Validating chapter ${input.chapter} completion report`);

    let response;
    try {
      response = await this.chat([
        { role: "system", content: buildArcUpdaterSystemPrompt(lang) },
        { role: "user", content: prompt },
      ], { temperature: 0.2, maxTokens: 4096 });
    } catch (err) {
      this.log?.warn(`[arc-updater] LLM call failed: ${err}`);
      return {
        arcTracker: arcTrackerCurrent,
        factionLedger: factionLedgerCurrent,
        moodArc: moodArcCurrent,
        errors: [{ type: "llm_failure", detail: String(err) }],
      };
    }

    // Parse JSON from LLM response
    const jsonMatch =
      response.content.match(/```(?:json)?\n([\s\S]*?)\n```/)
      ?? response.content.match(/\{[\s\S]*\}/);
    let parsed: Record<string, unknown> | null = null;
    if (jsonMatch) {
      try { parsed = JSON.parse(jsonMatch[1] ?? jsonMatch[0]); } catch { /* ignore */ }
    }

    const errors: Array<{ type: string; detail: string }> = [];
    if (parsed && "errors" in parsed && Array.isArray(parsed.errors)) {
      for (const e of parsed.errors) {
        errors.push({
          type: String((e as Record<string, unknown>).type),
          detail: String((e as Record<string, unknown>).detail),
        });
      }
    }

    let arcTracker: ArcTracker = arcTrackerCurrent;
    let factionLedger: FactionLedger = factionLedgerCurrent;
    let moodArc: MoodArc = moodArcCurrent;

    if (errors.length === 0 && parsed) {
      try {
        if (parsed.arcTracker) arcTracker = ArcTrackerSchema.parse(parsed.arcTracker) as ArcTracker;
        if (parsed.factionLedger) factionLedger = FactionLedgerSchema.parse(parsed.factionLedger) as FactionLedger;
        if (parsed.moodArc) moodArc = MoodArcSchema.parse(parsed.moodArc) as MoodArc;
      } catch (parseErr) {
        this.log?.warn(`[arc-updater] Tracker parse error: ${parseErr}`);
      }
    }

    await Promise.all([
      saveTracker(input.bookDir, "arc-tracker", arcTracker),
      saveTracker(input.bookDir, "faction-ledger", factionLedger),
      saveTracker(input.bookDir, "mood-arc", moodArc),
    ]);

    this.log?.info(`[arc-updater] Chapter ${input.chapter} updated, errors: ${errors.length}`);

    return { arcTracker, factionLedger, moodArc, errors };
  }
}
