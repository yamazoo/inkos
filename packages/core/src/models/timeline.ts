import { z } from "zod";

// ── Story Day ─────────────────────────────────────────────────

export const StoryDaySchema = z.object({
  chapter: z.number().int().min(1),
  storyDay: z.number().int().min(1),
  label: z.string().default(""),
});
export type StoryDay = z.infer<typeof StoryDaySchema>;

// ── Event Anchor ──────────────────────────────────────────────

export const EventMentionSchema = z.object({
  chapter: z.number().int().min(1),
  raw: z.string().min(1),
});
export type EventMention = z.infer<typeof EventMentionSchema>;

export const CrossReferenceSchema = z.object({
  chapter: z.number().int().min(1),
  raw: z.string().min(1),
  impliedDay: z.number().int(),
});
export type CrossReference = z.infer<typeof CrossReferenceSchema>;

export const CountdownSchema = z.object({
  chapter: z.number().int().min(1),
  raw: z.string().min(1),
  daysLeft: z.number().int().min(0),
});
export type Countdown = z.infer<typeof CountdownSchema>;

export const EventAnchorSchema = z.object({
  eventId: z.string().min(1),
  label: z.string().min(1),
  storyDay: z.number().int().min(1),
  firstMentioned: EventMentionSchema,
  crossReferences: z.array(CrossReferenceSchema).default([]),
  countdowns: z.array(CountdownSchema).default([]),
});
export type EventAnchor = z.infer<typeof EventAnchorSchema>;

// ── Conflict ──────────────────────────────────────────────────

export const TimelineConflictSeveritySchema = z.enum(["critical", "warning"]);
export type TimelineConflictSeverity = z.infer<typeof TimelineConflictSeveritySchema>;

export const TimelineConflictTypeSchema = z.enum([
  "countdown-mismatch",
  "anchor-mismatch",
  "day-gap",
]);
export type TimelineConflictType = z.infer<typeof TimelineConflictTypeSchema>;

export const TimelineConflictSchema = z.object({
  conflictId: z.string().min(1),
  severity: TimelineConflictSeveritySchema,
  type: TimelineConflictTypeSchema,
  description: z.string().min(1),
  chapters: z.array(z.number().int().min(1)),
  detectedAtChapter: z.number().int().min(1),
});
export type TimelineConflict = z.infer<typeof TimelineConflictSchema>;

// ── Timeline State (state/timeline.json) ──────────────────────

export const TimelineStateSchema = z.object({
  storyDays: z.array(StoryDaySchema).default([]),
  eventAnchors: z.array(EventAnchorSchema).default([]),
  conflicts: z.array(TimelineConflictSchema).default([]),
  lastUpdatedChapter: z.number().int().min(0).default(0),
});
export type TimelineState = z.infer<typeof TimelineStateSchema>;

// ── Timeline Delta (=== TIMELINE === block from Settler) ──────

export const TimelineEventRefSchema = z.object({
  id: z.string().min(1),
  reference: z.string().min(1),
  impliedOffset: z.number().int().optional(),
  countdown: z.number().int().min(0).optional(),
});
export type TimelineEventRef = z.infer<typeof TimelineEventRefSchema>;

export const TimelineDeltaSchema = z.object({
  storyDay: z.number().int().min(1),
  dayLabel: z.string().default(""),
  events: z.array(TimelineEventRefSchema).default([]),
});
export type TimelineDelta = z.infer<typeof TimelineDeltaSchema>;
