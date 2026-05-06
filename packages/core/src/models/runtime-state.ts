import { z } from "zod";

export const RuntimeStateLanguageSchema = z.enum(["zh", "en"]);
export type RuntimeStateLanguage = z.infer<typeof RuntimeStateLanguageSchema>;

export const StateManifestSchema = z.object({
  schemaVersion: z.literal(2),
  language: RuntimeStateLanguageSchema,
  lastAppliedChapter: z.number().int().min(0),
  projectionVersion: z.number().int().min(1),
  migrationWarnings: z.array(z.string()).default([]),
});

export type StateManifest = z.infer<typeof StateManifestSchema>;

export const HookStatusSchema = z.enum(["open", "progressing", "deferred", "resolved"]);
export type HookStatus = z.infer<typeof HookStatusSchema>;

export const HookPayoffTimingSchema = z.enum([
  "immediate",
  "near-term",
  "mid-arc",
  "slow-burn",
  "endgame",
]);
export type HookPayoffTiming = z.infer<typeof HookPayoffTimingSchema>;

export const HookRecordSchema = z.object({
  hookId: z.string().min(1),
  startChapter: z.number().int().min(0),
  type: z.string().min(1),
  status: HookStatusSchema,
  lastAdvancedChapter: z.number().int().min(0),
  expectedPayoff: z.string().default(""),
  payoffTiming: HookPayoffTimingSchema.optional(),
  notes: z.string().default(""),
  // Phase 7 — hook causality / promotion metadata.
  // All optional so hooks parsed from pre-Phase-7 markdown still validate
  // and so callers constructing HookRecord inline can omit them.
  dependsOn: z.array(z.string().min(1)).optional(),
  paysOffInArc: z.string().optional(),
  coreHook: z.boolean().optional(),
  halfLifeChapters: z.number().int().positive().optional(),
  advancedCount: z.number().int().min(0).optional(),
  // Phase 7 hotfix 2 — promotion flag. Undefined on legacy 11/12-column
  // ledgers; architect-seed and consolidator-rerun both populate it going
  // forward. Reviewer uses it to gate critical severity for stale hooks.
  promoted: z.boolean().optional(),
});

export type HookRecord = z.infer<typeof HookRecordSchema>;

export const HooksStateSchema = z.object({
  hooks: z.array(HookRecordSchema).default([]),
});

export type HooksState = z.infer<typeof HooksStateSchema>;

export const ChapterSummaryRowSchema = z.object({
  chapter: z.number().int().min(1),
  title: z.string().min(1),
  characters: z.string().default(""),
  events: z.string().default(""),
  stateChanges: z.string().default(""),
  hookActivity: z.string().default(""),
  mood: z.string().default(""),
  chapterType: z.string().default(""),
});

export type ChapterSummaryRow = z.infer<typeof ChapterSummaryRowSchema>;

export const ChapterSummariesStateSchema = z.object({
  rows: z.array(ChapterSummaryRowSchema).default([]),
});

export type ChapterSummariesState = z.infer<typeof ChapterSummariesStateSchema>;

export const CurrentStateFactSchema = z.object({
  subject: z.string().min(1),
  predicate: z.string().min(1),
  object: z.string().min(1),
  validFromChapter: z.number().int().min(0),
  validUntilChapter: z.number().int().min(0).nullable(),
  sourceChapter: z.number().int().min(0),
});

export type CurrentStateFact = z.infer<typeof CurrentStateFactSchema>;

export const CurrentStateStateSchema = z.object({
  chapter: z.number().int().min(0),
  facts: z.array(CurrentStateFactSchema).default([]),
});

export type CurrentStateState = z.infer<typeof CurrentStateStateSchema>;

export const CurrentStatePatchSchema = z.object({
  currentLocation: z.string().optional(),
  protagonistState: z.string().optional(),
  currentGoal: z.string().optional(),
  currentConstraint: z.string().optional(),
  currentAlliances: z.string().optional(),
  currentConflict: z.string().optional(),
});

export type CurrentStatePatch = z.infer<typeof CurrentStatePatchSchema>;

export const HookOpsSchema = z.object({
  upsert: z.array(HookRecordSchema).default([]),
  mention: z.array(z.string().min(1)).default([]),
  resolve: z.array(z.string().min(1)).default([]),
  defer: z.array(z.string().min(1)).default([]),
});

export type HookOps = z.infer<typeof HookOpsSchema>;

export const NewHookCandidateSchema = z.object({
  type: z.string().min(1),
  expectedPayoff: z.string().default(""),
  payoffTiming: HookPayoffTimingSchema.optional(),
  notes: z.string().default(""),
});

export type NewHookCandidate = z.infer<typeof NewHookCandidateSchema>;

const LooseOpSchema = z.record(z.string(), z.unknown());

export const RuntimeStateDeltaSchema = z.object({
  chapter: z.number().int().min(1),
  currentStatePatch: CurrentStatePatchSchema.optional(),
  hookOps: HookOpsSchema.default({
    upsert: [],
    mention: [],
    resolve: [],
    defer: [],
  }),
  newHookCandidates: z.array(NewHookCandidateSchema).default([]),
  chapterSummary: ChapterSummaryRowSchema.optional(),
  subplotOps: z.array(LooseOpSchema).default([]),
  emotionalArcOps: z.array(LooseOpSchema).default([]),
  characterMatrixOps: z.array(LooseOpSchema).default([]),
  notes: z.array(z.string()).default([]),
});

export type RuntimeStateDelta = z.infer<typeof RuntimeStateDeltaSchema>;

// ── ArcTracker ────────────────────────────────────────────────
export const OutlineNodeSchema = z.object({
  nodeId: z.string(),
  title: z.string(),
  status: z.enum(["pending", "active", "completed"]),
  startChapter: z.number(),
  completedChapter: z.number().nullable(),
  completionNote: z.string().optional(),
  progress: z.number().min(0).max(100).default(0),
});

export const MainSuspenseSchema = z.object({
  hookId: z.string(),
  description: z.string(),
  plantedAt: z.number(),
  currentProgress: z.number().min(0).max(100).default(0),
  expectedPayoff: z.number().nullable(),
});

export const ArcTrackerSchema = z.object({
  schemaVersion: z.literal(1),
  volumeId: z.string(),
  volumeTitle: z.string(),
  chapterRange: z.tuple([z.number(), z.number()]),
  currentChapter: z.number(),
  outlineNodes: z.array(OutlineNodeSchema),
  mainSuspense: MainSuspenseSchema,
  nextChapterDirection: z.object({
    targetNodeId: z.string().nullable(),
    targetProgress: z.number(),
    tone: z.enum(["intensify", "relief", "transition", "breakthrough"]),
  }),
});

export type ArcTracker = z.infer<typeof ArcTrackerSchema>;

// ── FactionLedger ─────────────────────────────────────────────
export const FactionPowerLevelSchema = z.object({
  power: z.number().min(0).max(100).default(50),
  resources: z.number().min(0).max(100).default(50),
  influence: z.number().min(0).max(100).default(50),
  morale: z.number().min(0).max(100).default(50),
});

export const FactionDeltaSchema = z.object({
  chapter: z.number(),
  powerDelta: z.number().optional(),
  stanceDelta: z.number().optional(),
  event: z.string(),
});

export const FactionLedgerEntrySchema = z.object({
  factionId: z.string(),
  factionName: z.string(),
  stance: z.enum(["ally", "neutral", "hostile", "unknown"]),
  stanceTowardsProtagonist: z.number().min(-100).max(100).default(0),
  powerLevel: FactionPowerLevelSchema,
  keyMembers: z.array(z.object({
    name: z.string(),
    status: z.enum(["active", "missing", "dead"]),
    disposition: z.enum(["friendly", "neutral", "hostile"]),
  })).default([]),
  recentDeltas: z.array(FactionDeltaSchema).default([]),
});

export const RelationshipSchema = z.object({
  from: z.string(),
  to: z.string(),
  type: z.enum(["trust", "rivalry", "debt", "secret"]),
  strength: z.number().min(-100).max(100).default(0),
  lastChangedChapter: z.number(),
  event: z.string().optional(),
});

export const FactionLedgerSchema = z.object({
  schemaVersion: z.literal(1),
  factions: z.record(z.string(), FactionLedgerEntrySchema),
  protagonist: z.object({
    name: z.string(),
    powerLevel: FactionPowerLevelSchema,
    exposureRisk: z.number().min(0).max(100).default(0),
    socialCapital: z.number().min(0).max(100).default(0),
    recentDeltas: z.array(FactionDeltaSchema).default([]),
  }),
  relationships: z.array(RelationshipSchema).default([]),
});

export type FactionLedger = z.infer<typeof FactionLedgerSchema>;

// ── MoodArc ────────────────────────────────────────────────────
export const MoodArcEntrySchema = z.object({
  chapter: z.number(),
  tension: z.number().min(0).max(100).default(50),
  excitement: z.number().min(0).max(100).default(50),
  mystery: z.number().min(0).max(100).default(50),
  warmth: z.number().min(0).max(100).default(50),
  overall: z.enum(["suppressed", "tense", "intense", "breakthrough", "relief"]),
  chapterTone: z.string(),
});

export const MoodArcSchema = z.object({
  schemaVersion: z.literal(1),
  volumeId: z.string(),
  entries: z.array(MoodArcEntrySchema).default([]),
  arcShape: z.enum(["escalating", "wave", "mounting-then-release", "steady-climax", "alternating"]),
  arcDescription: z.string(),
  nextChapterMoodTarget: z.object({
    tension: z.enum(["up", "down", "same"]),
    excitement: z.enum(["up", "down", "same"]),
    warmth: z.enum(["up", "down", "same"]),
    reason: z.string(),
  }),
});

export type MoodArc = z.infer<typeof MoodArcSchema>;

// ── ChapterCompletionReport ─────────────────────────────────────
export const FactionChangeSchema = z.object({
  faction: z.string(),
  metric: z.string(),
  before: z.number(),
  after: z.number(),
  delta: z.number(),
  evidenceFromText: z.string(),
});

export const HookAdvanceSchema = z.object({
  hookId: z.string(),
  fromProgress: z.number(),
  toProgress: z.number(),
  evidenceFromText: z.string(),
});

export const NewlyPlantedHookSchema = z.object({
  hookId: z.string(),
  type: z.string(),
  description: z.string(),
  seedText: z.string(),
  plantedAtScene: z.string(),
});

export const PaidOffHookSchema = z.object({
  hookId: z.string(),
  payoffChapter: z.number(),
  payoffNote: z.string(),
});

export const MoodChangeSchema = z.object({
  tensionBefore: z.number(),
  tensionAfter: z.number(),
  warmthBefore: z.number(),
  warmthAfter: z.number(),
  overallShift: z.enum(["tenser", "relieved", "same"]),
  chapterTone: z.string(),
});

export const ArcProgressSchema = z.object({
  nodeId: z.string(),
  progressBefore: z.number(),
  progressAfter: z.number(),
  completionNote: z.string().optional(),
});

export const BeatCoverageSchema = z.object({
  beatId: z.string(),
  covered: z.boolean(),
  coverageNote: z.string().optional(),
});

export const DialogueCheckSchema = z.object({
  requiredLine: z.string(),
  appeared: z.boolean(),
});

export const ChapterCompletionReportSchema = z.object({
  schemaVersion: z.literal(1),
  chapter: z.number(),
  cost: z.string(),
  gain: z.string(),
  factionChanges: z.array(FactionChangeSchema).default([]),
  moodChange: MoodChangeSchema,
  hookChanges: z.object({
    advanced: z.array(HookAdvanceSchema).default([]),
    newlyPlanted: z.array(NewlyPlantedHookSchema).default([]),
    paidOff: z.array(PaidOffHookSchema).default([]),
  }),
  arcProgress: ArcProgressSchema,
  selfCheck: z.object({
    beatCoverage: z.array(BeatCoverageSchema).default([]),
    dialogueCheck: z.array(DialogueCheckSchema).default([]),
  }),
});

export type ChapterCompletionReport = z.infer<typeof ChapterCompletionReportSchema>;
