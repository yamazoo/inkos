import { z } from "zod";
import { HookPayoffTimingSchema } from "./runtime-state.js";

export const ChapterConflictSchema = z.object({
  type: z.string().min(1),
  resolution: z.string().min(1),
  detail: z.string().optional(),
});

export type ChapterConflict = z.infer<typeof ChapterConflictSchema>;

export const HookPressurePhaseSchema = z.enum(["opening", "middle", "late"]);
export type HookPressurePhase = z.infer<typeof HookPressurePhaseSchema>;

export const HookMovementSchema = z.enum([
  "quiet-hold",
  "refresh",
  "advance",
  "partial-payoff",
  "full-payoff",
]);
export type HookMovement = z.infer<typeof HookMovementSchema>;

export const HookPressureLevelSchema = z.enum(["low", "medium", "high", "critical"]);
export type HookPressureLevel = z.infer<typeof HookPressureLevelSchema>;

export const HookPressureReasonSchema = z.enum([
  "fresh-promise",
  "building-debt",
  "stale-promise",
  "ripe-payoff",
  "overdue-payoff",
  "long-arc-hold",
]);
export type HookPressureReason = z.infer<typeof HookPressureReasonSchema>;

export const HookPressureSchema = z.object({
  hookId: z.string().min(1),
  type: z.string().min(1),
  movement: HookMovementSchema,
  pressure: HookPressureLevelSchema,
  payoffTiming: HookPayoffTimingSchema.optional(),
  phase: HookPressurePhaseSchema,
  reason: HookPressureReasonSchema,
  blockSiblingHooks: z.boolean().default(false),
});

export type HookPressure = z.infer<typeof HookPressureSchema>;

export const HookAgendaSchema = z.object({
  pressureMap: z.array(HookPressureSchema).default([]),
  mustAdvance: z.array(z.string().min(1)).default([]),
  eligibleResolve: z.array(z.string().min(1)).default([]),
  staleDebt: z.array(z.string().min(1)).default([]),
  avoidNewHookFamilies: z.array(z.string().min(1)).default([]),
});

export type HookAgenda = z.infer<typeof HookAgendaSchema>;

export const ChapterIntentSchema = z.object({
  chapter: z.number().int().min(1),
  goal: z.string().min(1),
  outlineNode: z.string().optional(),
  sceneDirective: z.string().min(1).optional(),
  arcDirective: z.string().min(1).optional(),
  moodDirective: z.string().min(1).optional(),
  titleDirective: z.string().min(1).optional(),
  conflictDirective: z.string().min(1).optional(),
  mustKeep: z.array(z.string()).default([]),
  mustAvoid: z.array(z.string()).default([]),
  styleEmphasis: z.array(z.string()).default([]),
  conflicts: z.array(ChapterConflictSchema).default([]),
  hookAgenda: HookAgendaSchema.default({
    pressureMap: [],
    mustAdvance: [],
    eligibleResolve: [],
    staleDebt: [],
    avoidNewHookFamilies: [],
  }),
});

export type ChapterIntent = z.infer<typeof ChapterIntentSchema>;

export const ContextSourceSchema = z.object({
  source: z.string().min(1),
  reason: z.string().min(1),
  excerpt: z.string().optional(),
});

export type ContextSource = z.infer<typeof ContextSourceSchema>;

export const ContextPackageSchema = z.object({
  chapter: z.number().int().min(1),
  selectedContext: z.array(ContextSourceSchema).default([]),
});

export type ContextPackage = z.infer<typeof ContextPackageSchema>;

export const RuleLayerScopeSchema = z.enum(["global", "book", "arc", "local"]);
export type RuleLayerScope = z.infer<typeof RuleLayerScopeSchema>;

export const RuleLayerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  precedence: z.number().int(),
  scope: RuleLayerScopeSchema,
});

export type RuleLayer = z.infer<typeof RuleLayerSchema>;

export const OverrideEdgeSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  allowed: z.boolean(),
  scope: z.string().min(1),
});

export type OverrideEdge = z.infer<typeof OverrideEdgeSchema>;

export const ActiveOverrideSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  target: z.string().min(1),
  reason: z.string().min(1),
});

export type ActiveOverride = z.infer<typeof ActiveOverrideSchema>;

export const RuleStackSectionsSchema = z.object({
  hard: z.array(z.string()).default([]),
  soft: z.array(z.string()).default([]),
  diagnostic: z.array(z.string()).default([]),
});

export type RuleStackSections = z.infer<typeof RuleStackSectionsSchema>;

export const RuleStackSchema = z.object({
  layers: z.array(RuleLayerSchema).min(1),
  sections: RuleStackSectionsSchema.default({
    hard: [],
    soft: [],
    diagnostic: [],
  }),
  overrideEdges: z.array(OverrideEdgeSchema).default([]),
  activeOverrides: z.array(ActiveOverrideSchema).default([]),
});

export type RuleStack = z.infer<typeof RuleStackSchema>;

export const ChapterTraceSchema = z.object({
  chapter: z.number().int().min(1),
  plannerInputs: z.array(z.string()),
  composerInputs: z.array(z.string()),
  selectedSources: z.array(z.string()),
  notes: z.array(z.string()).default([]),
});

export type ChapterTrace = z.infer<typeof ChapterTraceSchema>;

export const ChapterTypeSchema = z.enum([
  "combat",      // 战斗章
  "upgrade",     // 升级章
  "scheme",      // 布局章
  "payoff",      // 回收章
  "transition",  // 过渡章
  "tribulation", // 渡劫章 (xianxia only)
  "enlightenment", // 悟道章 (xianxia only)
]);
export type ChapterType = z.infer<typeof ChapterTypeSchema>;

/** Input passed to BeatPlannerAgent.planBeats() */
export interface BeatPlannerInput {
  readonly bookId: string;
  readonly chapterNumber: number;
  /** Parsed chapter intent from PlannerAgent */
  readonly intent: ChapterIntent;
  /** Last 2-3 paragraphs of previous chapter (from Composer.buildRecentEndingTrail) */
  readonly lastChapterEnding: string | undefined;
  /** Last 3 chapter endings for structural dedup (from Composer) */
  readonly recentEndings: readonly string[];
  /** Global state summary text */
  readonly currentState: string;
  /** Pending hooks from pending_hooks.md */
  readonly pendingHooks: readonly {
    readonly hookId: string;
    readonly type: string;
    readonly status: string;
    readonly expectedPayoff: string;
    readonly notes: string;
  }[];
  /** Emotional arcs data */
  readonly emotionalArcs: string;
  /** Optional chapter type hint from genre profile (null = auto-detect) */
  readonly chapterTypeHint: ChapterType | null;
  /** Target word count for this chapter */
  readonly wordCount: { readonly min: number; readonly target: number; readonly max: number };
  /** Genre profile chapterTypes list */
  readonly genreChapterTypes: readonly string[];
  /** Language */
  readonly language: "zh" | "en";
}

/** Output from BeatPlannerAgent.planBeats() */
export interface BeatPlannerOutput {
  readonly beatSheet: string;
  readonly chapterType: ChapterType;
  readonly hookToAdvance: string | null;
  readonly beatCount: number;
}

// ── SceneSchema（Layer 3）─────────────────────────────────────────────
export const SceneSchema = z.object({
  sceneId: z.string().min(1),
  beatId: z.string().min(1),
  location: z.string(),
  sceneType: z.enum(["action", "dialogue", "revelation", "reflection", "transition"]),
  event: z.string(),
  protagonistReaction: z.string(),
  keyDialogue: z.object({
    speaker: z.string(),
    line: z.string(),
    protagonistResponse: z.string().optional(),
    dramaticMeaning: z.string().optional(),
  }).optional(),
  povCharacter: z.string(),
  pacing: z.object({
    speed: z.enum(["slow", "moderate", "fast", "urgent", "breath"]),
    technique: z.array(z.enum([
      "short-sentences", "long-sentences", "no-internal-monologue",
      "sensory-detail", "action-verbs", "ellipsis",
      "dialogue-heavy", "narration-heavy",
    ])).default([]),
    mood: z.string(),
    wordCountTarget: z.number(),
    notes: z.string().optional(),
  }),
  factionActivity: z.array(z.object({
    faction: z.string(),
    action: z.string(),
    powerDelta: z.number().optional(),
  })).default([]),
  hooksTouched: z.array(z.string()).default([]),
  transitionToNext: z.string().optional(),
});
export type Scene = z.infer<typeof SceneSchema>;

// ── BeatSheetOutputSchemaV2 ─────────────────────────────────────────
export const BeatSheetOutputSchemaV2 = z.object({
  schemaVersion: z.literal(2),
  chapter: z.number().int().min(1),
  chapterType: ChapterTypeSchema,
  totalTargetWords: z.number(),
  beats: z.array(z.object({
    beatId: z.string().min(1),
    name: z.string(),
    targetWordsPct: z.number(),
    targetWords: z.number(),
    cost: z.string().optional(),
    gain: z.string().optional(),
    factionImpact: z.array(z.object({
      faction: z.string(),
      powerDelta: z.number().optional(),
      stanceDelta: z.number().optional(),
      note: z.string(),
    })).default([]),
    hookAdvance: z.array(z.string()).default([]),
    pacing: z.object({
      speed: z.enum(["slow", "moderate", "fast", "urgent", "breath"]),
      voice: z.enum(["narration", "dialogue-heavy", "mixed"]),
      mood: z.string(),
    }),
    mustInclude: z.array(z.string()).default([]),
    mustAvoid: z.array(z.string()).default([]),
    beatDescription: z.string(),
  })),
  chapterEndTwist: z.object({
    cost: z.string(),
    gain: z.string(),
    newDilemma: z.string(),
    newOpportunity: z.string(),
  }),
  expectedFactionChanges: z.array(z.object({
    faction: z.string(),
    metric: z.string(),
    delta: z.number(),
  })).default([]),
  expectedMoodChange: z.object({
    tensionDelta: z.number(),
    warmthDelta: z.number(),
  }),
});
export type BeatSheetOutputV2 = z.infer<typeof BeatSheetOutputSchemaV2>;

// ── ChapterIntentSchemaV2 ─────────────────────────────────────────
export const ArcPositionSchema = z.object({
  volumeId: z.string().min(1),
  currentNodeId: z.string().min(1),
  nodeProgress: z.number().min(0).max(100),
  overallProgress: z.number().min(0).max(100),
  nextNodeId: z.string().nullable(),
});

export const MustAdvanceSchema = z.object({
  arcNodeProgress: z.object({
    targetNodeId: z.string(),
    targetProgress: z.number(),
    expectedAfterChapter: z.number(),
  }),
  mainSuspenseProgress: z.object({
    hookId: z.string(),
    from: z.number(),
    to: z.number(),
  }),
});

export const FactionContextSchema = z.object({
  currentThreatLevel: z.number().min(0).max(100),
  protagonistExposureRisk: z.number().min(0).max(100),
  keyRelationshipChanges: z.array(z.object({
    faction: z.string(),
    change: z.string(),
  })).default([]),
});

export const MoodDirectiveSchema = z.object({
  tensionDirection: z.enum(["up", "down", "same"]),
  excitementDirection: z.enum(["up", "down", "same"]),
  warmthDirection: z.enum(["up", "down", "same"]),
  reason: z.string(),
  toneDescription: z.string(),
});

export const ChapterIntentSchemaV2 = ChapterIntentSchema.extend({
  schemaVersion: z.literal(2),
  arcPosition: ArcPositionSchema.optional(),
  chapterType: ChapterTypeSchema.optional(),
  mustAdvance: MustAdvanceSchema.optional(),
  factionContext: FactionContextSchema.optional(),
  moodDirective: MoodDirectiveSchema.optional(),
});
export type ChapterIntentV2 = z.infer<typeof ChapterIntentSchemaV2>;

// ── ScenePlanner Input/Output ────────────────────────────────────────
export interface ScenePlannerInput {
  readonly bookId: string;
  readonly chapterNumber: number;
  readonly beatSheet: string;
  readonly beatSheetV2?: BeatSheetOutputV2;
  readonly wordCount: { min: number; target: number; max: number };
  readonly language?: "zh" | "en";
}

export interface ScenePlannerOutput {
  readonly scenePlan: string;
  readonly scenes: Scene[];
  readonly totalScenes: number;
  readonly totalTargetWords: number;
}
