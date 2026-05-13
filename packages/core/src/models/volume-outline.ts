import { z } from "zod";

// -----------------------------------------------------------------------------/
// Core building blocks
// -----------------------------------------------------------------------------/

export const ChapterNodeSchema = z.object({
  chapter: z.number().int().min(1),
  event: z.string().min(1),
  beat: z.string().min(1),
  /** Detailed scene-by-scene breakdown including chapter-end hook (章末钩子). Target 200-500 chars for 3000+ word expansion. */
  description: z.string().optional(),
  /** Optional POV character for this chapter */
  pov: z.string().optional(),
  /** Hook IDs (Phase 2 — populated by hook governance integration) */
  hookIds: z.array(z.string()).optional(),
  /**
   * Chapter type / rhythm label.
   * Phase 2 — populated by LLM classification.
   */
  chapterType: z
    .enum(["opening", "rising", "climax", "falling", "resolution", "transition"])
    .optional(),
});

export type ChapterNode = z.infer<typeof ChapterNodeSchema>;

// -----------------------------------------------------------------------------/
// Volume structure
// -----------------------------------------------------------------------------/

/**
 * Sub-phase within a volume (e.g. Volume 3 has 5 sub-phases).
 * Only present when the volume outline explicitly subdivides.
 */
export const VolumePhaseSchema = z.object({
  /** Human-readable label, e.g. "【第一阶段：第61-70章】威胁初显" */
  label: z.string().min(1),
  /** Inclusive chapter range for this phase */
  range: z.tuple([z.number().int().min(1), z.number().int().min(1)]),
  /** Chapters belonging to this phase */
  chapters: z.array(ChapterNodeSchema),
});

export type VolumePhase = z.infer<typeof VolumePhaseSchema>;

export const VolumeNodeSchema = z.object({
  volumeId: z.number().int().min(1),
  /** Human-readable volume title, e.g. "第一卷：暗流" */
  volumeTitle: z.string().min(1),
  /** Inclusive chapter range [start, end] */
  chapterRange: z.tuple([
    z.number().int().min(1),
    z.number().int().min(1),
  ]),
  /** Core dramatic conflict of this volume */
  coreConflict: z.string().default(""),
  /** Primary key-turn chapter number */
  keyTurnChapter: z.number().int().min(1),
  /** Human-readable description of the primary key turn */
  keyTurnEvent: z.string().default(""),
  /**
   * Extended list of key-turn chapters (Phase 2 — multi-turn volumes).
   * When absent the single `keyTurnChapter` is the only key turn.
   */
  keyTurnChapters: z.array(z.number().int().min(1)).optional(),
  keyTurnEvents: z.array(z.string()).optional(),
  /** Harvest / payoff goals for this volume */
  harvestGoals: z.array(z.string()).default([]),
  /**
   * Sub-phases only when the volume outline explicitly subdivides
   * (e.g. Volume 3 with 5 sub-phases).
   */
  phases: z.array(VolumePhaseSchema).optional(),
  /** Flat chapter list — always present even when phases exist (for fast lookup) */
  chapters: z.array(ChapterNodeSchema),
});

export type VolumeNode = z.infer<typeof VolumeNodeSchema>;

// -----------------------------------------------------------------------------/
// Root schema
// -----------------------------------------------------------------------------/

export const VolumeOutlineSchema = z.object({
  schemaVersion: z.literal(1),
  meta: z.object({
    bookTitle: z.string().min(1),
    /** Path to the source Markdown file used during migration */
    sourceFile: z.string().min(1),
    /** ISO-8601 timestamp when the JSON was generated */
    generatedAt: z.string().min(1),
    /** Total chapters — may be 0 when outline has no per-chapter table (books using bullet/prose outlines) */
    totalChapters: z.number().int().min(0),
    totalVolumes: z.number().int().min(1),
  }),
  volumes: z.array(VolumeNodeSchema),
});

export type VolumeOutlineSchema = z.infer<typeof VolumeOutlineSchema>;
export type VolumeOutline = z.infer<typeof VolumeOutlineSchema>;

// -----------------------------------------------------------------------------/
// Convenience helpers (pure, no I/O)
// -----------------------------------------------------------------------------/

/** Find the volume node containing a given chapter number. */
export function findVolumeForChapter(
  outline: z.infer<typeof VolumeOutlineSchema>,
  chapter: number,
): z.infer<typeof VolumeNodeSchema> | null {
  return (
    outline.volumes.find(
      (vol) => chapter >= vol.chapterRange[0] && chapter <= vol.chapterRange[1],
    ) ?? null
  );
}

/** Build a flat index: chapter number → ChapterNode */
export function buildChapterIndex(
  outline: z.infer<typeof VolumeOutlineSchema>,
): Map<number, ChapterNode> {
  const index = new Map<number, ChapterNode>();
  for (const vol of outline.volumes) {
    for (const ch of vol.chapters) index.set(ch.chapter, ch);
  }
  return index;
}

/** Result returned by PipelineRunner.initOutline() */
export interface OutlineInitResult {
  chaptersFilled: number;
  chaptersTotal: number;
  completenessBefore: number;
  completenessAfter: number;
}

/** Return chapters in [start, end] across all volumes (chapters are globally unique). */
export function getChaptersInRange(
  outline: z.infer<typeof VolumeOutlineSchema>,
  start: number,
  end: number,
): ChapterNode[] {
  return outline.volumes.flatMap((vol) =>
    vol.chapters.filter((ch) => ch.chapter >= start && ch.chapter <= end),
  );
}
