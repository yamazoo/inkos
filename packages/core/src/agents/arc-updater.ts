import { BaseAgent } from "./base.js";
import {
  ArcTrackerSchema,
  FactionLedgerSchema,
  HooksStateSchema,
  MoodArcSchema,
  ChapterCompletionReportSchema,
  type ChapterCompletionReport,
  type ArcTracker,
  type FactionLedger,
  type MoodArc,
  type HooksState,
} from "../models/runtime-state.js";
import {
  loadTracker,
  saveTracker,
  bootstrapArcTracker,
  bootstrapFactionLedger,
  bootstrapMoodArc,
} from "../state/tracker-store.js";
import { buildArcUpdaterSystemPrompt, buildArcUpdaterUserPrompt } from "./arc-updater-prompts.js";

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
  readonly hookLedger: HooksState;
  readonly moodArc: MoodArc;
  readonly errors: Array<{ type: string; detail: string }>;
}

export class ArcUpdaterAgent extends BaseAgent {
  get name(): string {
    return "arc-updater";
  }

  /**
   * Validate the completion report against the chapter content,
   * then update all four trackers. Returns errors if validation fails.
   */
  async updateTrackers(input: ArcUpdaterInput): Promise<ArcUpdaterOutput> {
    const lang = input.language ?? "zh";

    // Load existing trackers (null means not yet bootstrapped)
    const [arcTrackerRaw, factionLedgerRaw, hookLedgerRaw, moodArcRaw] = await Promise.all([
      loadTracker(input.bookDir, "arc-tracker", ArcTrackerSchema),
      loadTracker(input.bookDir, "faction-ledger", FactionLedgerSchema),
      loadTracker(input.bookDir, "hook-ledger", HooksStateSchema),
      loadTracker(input.bookDir, "mood-arc", MoodArcSchema),
    ]);

    const arcTrackerCurrent: ArcTracker = arcTrackerRaw !== null
      ? (arcTrackerRaw as ArcTracker)
      : bootstrapArcTracker("（未命名卷）", "vol-1", [1, 1], "H001", "主悬念");
    const factionLedgerCurrent: FactionLedger = factionLedgerRaw !== null
      ? (factionLedgerRaw as FactionLedger)
      : bootstrapFactionLedger("主角");
    const moodArcCurrent: MoodArc = moodArcRaw !== null
      ? (moodArcRaw as MoodArc)
      : bootstrapMoodArc("vol-1");
    const hookLedger: HooksState = hookLedgerRaw !== null
      ? (hookLedgerRaw as HooksState)
      : { hooks: [] };

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
      response = await this.chat(
        [
          { role: "system", content: buildArcUpdaterSystemPrompt(lang) },
          { role: "user", content: prompt },
        ],
        { temperature: 0.2, maxTokens: 4096 },
      );
    } catch (err) {
      this.log?.warn(`[arc-updater] LLM call failed: ${err}`);
      // Degrade gracefully — return trackers unchanged with error flag
      return {
        arcTracker: arcTrackerCurrent,
        factionLedger: factionLedgerCurrent,
        hookLedger,
        moodArc: moodArcCurrent,
        errors: [{ type: "llm_failure", detail: String(err) }],
      };
    }

    // Parse LLM response — try to extract JSON blocks
    const jsonMatch =
      response.content.match(/```(?:json)?\n([\s\S]*?)\n```/)
      ?? response.content.match(/\{[\s\S]*\}/);
    let parsed: Record<string, unknown> | null = null;
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[1] ?? jsonMatch[0]);
      } catch {
        /* ignore parse errors */
      }
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

    // Apply updates if no errors
    let arcTracker = arcTrackerCurrent;
    let factionLedger = factionLedgerCurrent;
    let moodArc = moodArcCurrent;

    if (errors.length === 0 && parsed) {
      try {
        if (parsed.arcTracker) arcTracker = ArcTrackerSchema.parse(parsed.arcTracker);
        if (parsed.factionLedger) factionLedger = FactionLedgerSchema.parse(parsed.factionLedger);
        if (parsed.moodArc) moodArc = MoodArcSchema.parse(parsed.moodArc);
      } catch (parseErr) {
        this.log?.warn(`[arc-updater] Tracker parse error, using current state: ${parseErr}`);
      }
    }

    // Persist updated trackers
    // (skip hook-ledger write — HooksState uses existing state/reducer pipeline)
    await Promise.all([
      saveTracker(input.bookDir, "arc-tracker", arcTracker),
      saveTracker(input.bookDir, "faction-ledger", factionLedger),
      saveTracker(input.bookDir, "mood-arc", moodArc),
    ]);

    this.log?.info(`[arc-updater] Chapter ${input.chapter} trackers updated, errors: ${errors.length}`);

    return { arcTracker, factionLedger, hookLedger, moodArc, errors };
  }
}
