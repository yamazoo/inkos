import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  loadTimeline,
  saveTimeline,
  applyTimelineDelta,
  computeDeterministicTimelineIssues,
  formatTimelineAuditSummary,
} from "../utils/timeline.js";
import type { TimelineState, TimelineDelta, EventAnchor, TimelineConflict } from "../models/timeline.js";
import type { AuditIssue } from "../agents/continuity.js";

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await mkdtemp(join(tmpdir(), "timeline-utils-"));
});

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true });
});

// ── loadTimeline ────────────────────────────────────────────────

describe("loadTimeline", () => {
  it("returns empty timeline on ENOENT (missing file)", async () => {
    const result = await loadTimeline(tmpDir);
    expect(result.storyDays).toEqual([]);
    expect(result.eventAnchors).toEqual([]);
    expect(result.conflicts).toEqual([]);
    expect(result.lastUpdatedChapter).toBe(0);
  });

  it("parses valid timeline JSON", async () => {
    const data: TimelineState = {
      storyDays: [{ chapter: 1, storyDay: 1, label: "start" }],
      eventAnchors: [],
      conflicts: [],
      lastUpdatedChapter: 1,
    };
    const stateDir = join(tmpDir, "story", "state");
    await mkdir(stateDir, { recursive: true });
    await writeFile(join(stateDir, "timeline.json"), JSON.stringify(data), "utf-8");

    const result = await loadTimeline(tmpDir);
    expect(result.storyDays).toHaveLength(1);
    expect(result.storyDays[0]!.storyDay).toBe(1);
    expect(result.lastUpdatedChapter).toBe(1);
  });

  it("returns empty timeline on invalid JSON (Zod validation failure)", async () => {
    const stateDir = join(tmpDir, "story", "state");
    await mkdir(stateDir, { recursive: true });
    await writeFile(
      join(stateDir, "timeline.json"),
      JSON.stringify({ storyDays: "not-an-array", invalid: true }),
      "utf-8",
    );

    const result = await loadTimeline(tmpDir);
    expect(result.storyDays).toEqual([]);
    expect(result.lastUpdatedChapter).toBe(0);
  });

  it("returns empty timeline on malformed JSON syntax", async () => {
    const stateDir = join(tmpDir, "story", "state");
    await mkdir(stateDir, { recursive: true });
    await writeFile(join(stateDir, "timeline.json"), "{invalid json", "utf-8");

    const result = await loadTimeline(tmpDir);
    expect(result.storyDays).toEqual([]);
    expect(result.lastUpdatedChapter).toBe(0);
  });
});

// ── saveTimeline ────────────────────────────────────────────────

describe("saveTimeline", () => {
  it("writes timeline to correct path", async () => {
    const state: TimelineState = {
      storyDays: [{ chapter: 1, storyDay: 1, label: "day one" }],
      eventAnchors: [],
      conflicts: [],
      lastUpdatedChapter: 1,
    };

    await saveTimeline(tmpDir, state);

    const raw = await readFile(join(tmpDir, "story", "state", "timeline.json"), "utf-8");
    const parsed = JSON.parse(raw);
    expect(parsed.lastUpdatedChapter).toBe(1);
    expect(parsed.storyDays[0].label).toBe("day one");
  });

  it("creates state directory if it does not exist", async () => {
    const state: TimelineState = {
      storyDays: [],
      eventAnchors: [],
      conflicts: [],
      lastUpdatedChapter: 0,
    };

    await saveTimeline(tmpDir, state);

    const raw = await readFile(join(tmpDir, "story", "state", "timeline.json"), "utf-8");
    expect(JSON.parse(raw).lastUpdatedChapter).toBe(0);
  });

  it("round-trips through save and load", async () => {
    const state: TimelineState = {
      storyDays: [
        { chapter: 1, storyDay: 1, label: "begin" },
        { chapter: 2, storyDay: 3, label: "skip" },
      ],
      eventAnchors: [
        {
          eventId: "wedding",
          label: "wedding",
          storyDay: 5,
          firstMentioned: { chapter: 1, raw: "the wedding" },
          crossReferences: [{ chapter: 2, raw: "the wedding was day 5", impliedDay: 5 }],
          countdowns: [],
        },
      ],
      conflicts: [
        {
          conflictId: "test-conflict",
          severity: "warning",
          type: "day-gap",
          description: "gap test",
          chapters: [1, 2],
          detectedAtChapter: 2,
        },
      ],
      lastUpdatedChapter: 2,
    };

    await saveTimeline(tmpDir, state);
    const loaded = await loadTimeline(tmpDir);

    expect(loaded.storyDays).toHaveLength(2);
    expect(loaded.eventAnchors).toHaveLength(1);
    expect(loaded.eventAnchors[0]!.eventId).toBe("wedding");
    expect(loaded.conflicts).toHaveLength(1);
    expect(loaded.lastUpdatedChapter).toBe(2);
  });
});

// ── applyTimelineDelta ──────────────────────────────────────────

describe("applyTimelineDelta", () => {
  const emptyTimeline: TimelineState = {
    storyDays: [],
    eventAnchors: [],
    conflicts: [],
    lastUpdatedChapter: 0,
  };

  it("creates initial storyDay entry", () => {
    const delta: TimelineDelta = {
      storyDay: 1,
      dayLabel: "Chapter One",
      events: [],
    };

    const { updated } = applyTimelineDelta(emptyTimeline, delta, 1);
    expect(updated.storyDays).toHaveLength(1);
    expect(updated.storyDays[0]!.chapter).toBe(1);
    expect(updated.storyDays[0]!.storyDay).toBe(1);
    expect(updated.storyDays[0]!.label).toBe("Chapter One");
    expect(updated.lastUpdatedChapter).toBe(1);
  });

  it("appends without overwriting different chapters", () => {
    const base: TimelineState = {
      storyDays: [{ chapter: 1, storyDay: 1, label: "day 1" }],
      eventAnchors: [],
      conflicts: [],
      lastUpdatedChapter: 1,
    };

    const delta: TimelineDelta = {
      storyDay: 3,
      dayLabel: "day 3",
      events: [],
    };

    const { updated } = applyTimelineDelta(base, delta, 2);
    expect(updated.storyDays).toHaveLength(2);
    expect(updated.storyDays[0]!.chapter).toBe(1);
    expect(updated.storyDays[1]!.chapter).toBe(2);
    expect(updated.storyDays[1]!.storyDay).toBe(3);
  });

  it("replaces same-chapter entry", () => {
    const base: TimelineState = {
      storyDays: [{ chapter: 1, storyDay: 1, label: "old" }],
      eventAnchors: [],
      conflicts: [],
      lastUpdatedChapter: 1,
    };

    const delta: TimelineDelta = {
      storyDay: 1,
      dayLabel: "updated label",
      events: [],
    };

    const { updated } = applyTimelineDelta(base, delta, 1);
    expect(updated.storyDays).toHaveLength(1);
    expect(updated.storyDays[0]!.label).toBe("updated label");
  });

  it("sorts storyDays by chapter after merge", () => {
    const base: TimelineState = {
      storyDays: [
        { chapter: 3, storyDay: 5, label: "ch3" },
        { chapter: 1, storyDay: 1, label: "ch1" },
      ],
      eventAnchors: [],
      conflicts: [],
      lastUpdatedChapter: 3,
    };

    const delta: TimelineDelta = {
      storyDay: 2,
      dayLabel: "ch2",
      events: [],
    };

    const { updated } = applyTimelineDelta(base, delta, 2);
    expect(updated.storyDays.map((d) => d.chapter)).toEqual([1, 2, 3]);
  });

  it("creates a new anchor for first event mention", () => {
    const delta: TimelineDelta = {
      storyDay: 1,
      dayLabel: "",
      events: [{ id: "wedding", reference: "the wedding ceremony" }],
    };

    const { updated } = applyTimelineDelta(emptyTimeline, delta, 1);
    expect(updated.eventAnchors).toHaveLength(1);
    expect(updated.eventAnchors[0]!.eventId).toBe("wedding");
    expect(updated.eventAnchors[0]!.storyDay).toBe(1);
    expect(updated.eventAnchors[0]!.firstMentioned.chapter).toBe(1);
    expect(updated.eventAnchors[0]!.firstMentioned.raw).toBe("the wedding ceremony");
  });

  it("adds cross-reference for repeated event mention without conflict", () => {
    const base: TimelineState = {
      storyDays: [{ chapter: 1, storyDay: 1, label: "" }],
      eventAnchors: [
        {
          eventId: "wedding",
          label: "wedding",
          storyDay: 1,
          firstMentioned: { chapter: 1, raw: "wedding day" },
          crossReferences: [],
          countdowns: [],
        },
      ],
      conflicts: [],
      lastUpdatedChapter: 1,
    };

    const delta: TimelineDelta = {
      storyDay: 1,
      dayLabel: "",
      events: [{ id: "wedding", reference: "remembering the wedding", impliedOffset: 0 }],
    };

    const { updated, conflicts } = applyTimelineDelta(base, delta, 2);
    expect(updated.eventAnchors[0]!.crossReferences).toHaveLength(1);
    expect(updated.eventAnchors[0]!.crossReferences[0]!.impliedDay).toBe(1);
    expect(conflicts).toHaveLength(0);
  });

  it("detects cross-reference anchor-mismatch conflict", () => {
    const base: TimelineState = {
      storyDays: [{ chapter: 1, storyDay: 1, label: "" }],
      eventAnchors: [
        {
          eventId: "wedding",
          label: "wedding",
          storyDay: 1,
          firstMentioned: { chapter: 1, raw: "wedding day" },
          crossReferences: [],
          countdowns: [],
        },
      ],
      conflicts: [],
      lastUpdatedChapter: 1,
    };

    // Chapter 2 is at storyDay 5, and references wedding with impliedOffset 10
    // impliedDay = 5 + 10 = 15, but anchor is at day 1
    const delta: TimelineDelta = {
      storyDay: 5,
      dayLabel: "",
      events: [{ id: "wedding", reference: "ten days after the wedding", impliedOffset: 10 }],
    };

    const { updated, conflicts } = applyTimelineDelta(base, delta, 2);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]!.type).toBe("anchor-mismatch");
    expect(conflicts[0]!.severity).toBe("critical");
    expect(conflicts[0]!.description).toContain("wedding");
    expect(conflicts[0]!.description).toContain("15");
    expect(conflicts[0]!.description).toContain("day 1");
    expect(updated.conflicts).toHaveLength(1);
  });

  it("detects countdown-mismatch conflict", () => {
    const base: TimelineState = {
      storyDays: [{ chapter: 1, storyDay: 1, label: "" }],
      eventAnchors: [
        {
          eventId: "deadline",
          label: "deadline",
          storyDay: 10,
          firstMentioned: { chapter: 1, raw: "the deadline" },
          crossReferences: [],
          countdowns: [],
        },
      ],
      conflicts: [],
      lastUpdatedChapter: 1,
    };

    // Chapter 2 at storyDay 3, countdown says 5 days left → impliedDay = 3 + 5 = 8 ≠ anchor 10
    const delta: TimelineDelta = {
      storyDay: 3,
      dayLabel: "",
      events: [{ id: "deadline", reference: "5 days until deadline", countdown: 5 }],
    };

    const { updated, conflicts } = applyTimelineDelta(base, delta, 2);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]!.type).toBe("countdown-mismatch");
    expect(conflicts[0]!.severity).toBe("critical");
    expect(updated.eventAnchors[0]!.countdowns).toHaveLength(1);
    expect(updated.eventAnchors[0]!.countdowns[0]!.daysLeft).toBe(5);
  });

  it("does not create conflict when countdown matches anchor day", () => {
    const base: TimelineState = {
      storyDays: [{ chapter: 1, storyDay: 1, label: "" }],
      eventAnchors: [
        {
          eventId: "deadline",
          label: "deadline",
          storyDay: 8,
          firstMentioned: { chapter: 1, raw: "the deadline" },
          crossReferences: [],
          countdowns: [],
        },
      ],
      conflicts: [],
      lastUpdatedChapter: 1,
    };

    // Chapter 2 at storyDay 3, countdown 5 → impliedDay = 3 + 5 = 8 = anchor
    const delta: TimelineDelta = {
      storyDay: 3,
      dayLabel: "",
      events: [{ id: "deadline", reference: "5 days until deadline", countdown: 5 }],
    };

    const { conflicts } = applyTimelineDelta(base, delta, 2);
    expect(conflicts).toHaveLength(0);
  });

  it("does not create duplicate anchors for the same eventId", () => {
    const base: TimelineState = {
      storyDays: [{ chapter: 1, storyDay: 1, label: "" }],
      eventAnchors: [
        {
          eventId: "wedding",
          label: "wedding",
          storyDay: 1,
          firstMentioned: { chapter: 1, raw: "the wedding" },
          crossReferences: [],
          countdowns: [],
        },
      ],
      conflicts: [],
      lastUpdatedChapter: 1,
    };

    const delta: TimelineDelta = {
      storyDay: 1,
      dayLabel: "",
      events: [{ id: "wedding", reference: "the wedding again", impliedOffset: 0 }],
    };

    const { updated } = applyTimelineDelta(base, delta, 3);
    expect(updated.eventAnchors).toHaveLength(1);
    expect(updated.eventAnchors[0]!.crossReferences).toHaveLength(1);
  });

  it("preserves existing conflicts and appends new ones", () => {
    const existingConflict: TimelineConflict = {
      conflictId: "old-conflict",
      severity: "critical",
      type: "anchor-mismatch",
      description: "old conflict",
      chapters: [1, 2],
      detectedAtChapter: 2,
    };

    const base: TimelineState = {
      storyDays: [{ chapter: 1, storyDay: 1, label: "" }],
      eventAnchors: [
        {
          eventId: "wedding",
          label: "wedding",
          storyDay: 1,
          firstMentioned: { chapter: 1, raw: "wedding" },
          crossReferences: [],
          countdowns: [],
        },
      ],
      conflicts: [existingConflict],
      lastUpdatedChapter: 1,
    };

    const delta: TimelineDelta = {
      storyDay: 5,
      dayLabel: "",
      events: [{ id: "wedding", reference: "days since wedding", impliedOffset: 10 }],
    };

    const { updated, conflicts } = applyTimelineDelta(base, delta, 2);
    expect(updated.conflicts).toHaveLength(2);
    expect(updated.conflicts[0]!.conflictId).toBe("old-conflict");
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]!.conflictId).not.toBe("old-conflict");
  });

  it("does not mutate the input timeline", () => {
    const base: TimelineState = {
      storyDays: [{ chapter: 1, storyDay: 1, label: "" }],
      eventAnchors: [
        {
          eventId: "e1",
          label: "e1",
          storyDay: 1,
          firstMentioned: { chapter: 1, raw: "e1" },
          crossReferences: [],
          countdowns: [],
        },
      ],
      conflicts: [],
      lastUpdatedChapter: 1,
    };

    const snapshot = JSON.parse(JSON.stringify(base));

    const delta: TimelineDelta = {
      storyDay: 2,
      dayLabel: "day2",
      events: [{ id: "e1", reference: "e1 again", impliedOffset: 0 }],
    };

    applyTimelineDelta(base, delta, 2);
    expect(base).toEqual(snapshot);
  });
});

// ── computeDeterministicTimelineIssues ──────────────────────────

describe("computeDeterministicTimelineIssues", () => {
  it("returns empty array when no conflicts and no day gaps", () => {
    const timeline: TimelineState = {
      storyDays: [
        { chapter: 1, storyDay: 1, label: "" },
        { chapter: 2, storyDay: 3, label: "" },
      ],
      eventAnchors: [],
      conflicts: [],
      lastUpdatedChapter: 2,
    };

    const issues = computeDeterministicTimelineIssues(timeline);
    expect(issues).toEqual([]);
  });

  it("returns critical issues for stored critical conflicts", () => {
    const timeline: TimelineState = {
      storyDays: [],
      eventAnchors: [],
      conflicts: [
        {
          conflictId: "cd-e1-ch2",
          severity: "critical",
          type: "countdown-mismatch",
          description: "e1 countdown mismatch at ch2",
          chapters: [1, 2],
          detectedAtChapter: 2,
        },
        {
          conflictId: "xr-e2-ch3",
          severity: "critical",
          type: "anchor-mismatch",
          description: "e2 anchor mismatch at ch3",
          chapters: [1, 3],
          detectedAtChapter: 3,
        },
      ],
      lastUpdatedChapter: 3,
    };

    const issues = computeDeterministicTimelineIssues(timeline);
    expect(issues).toHaveLength(2);
    expect(issues[0]!.severity).toBe("critical");
    expect(issues[0]!.category).toBe("Timeline Countdown Conflict");
    expect(issues[1]!.severity).toBe("critical");
    expect(issues[1]!.category).toBe("Timeline Anchor Conflict");
  });

  it("returns warning for day gaps exceeding threshold", () => {
    const timeline: TimelineState = {
      storyDays: [
        { chapter: 1, storyDay: 1, label: "" },
        { chapter: 2, storyDay: 15, label: "" },
      ],
      eventAnchors: [],
      conflicts: [],
      lastUpdatedChapter: 2,
    };

    const issues = computeDeterministicTimelineIssues(timeline);
    expect(issues).toHaveLength(1);
    expect(issues[0]!.severity).toBe("warning");
    expect(issues[0]!.category).toBe("Timeline Day Gap");
    expect(issues[0]!.description).toContain("14");
  });

  it("does not warn for small day gaps (within threshold)", () => {
    const timeline: TimelineState = {
      storyDays: [
        { chapter: 1, storyDay: 1, label: "" },
        { chapter: 2, storyDay: 10, label: "" },
      ],
      eventAnchors: [],
      conflicts: [],
      lastUpdatedChapter: 2,
    };

    const issues = computeDeterministicTimelineIssues(timeline);
    expect(issues).toEqual([]);
  });

  it("handles empty timeline with no storyDays", () => {
    const timeline: TimelineState = {
      storyDays: [],
      eventAnchors: [],
      conflicts: [],
      lastUpdatedChapter: 0,
    };

    const issues = computeDeterministicTimelineIssues(timeline);
    expect(issues).toEqual([]);
  });

  it("skips non-critical stored conflicts (warnings)", () => {
    const timeline: TimelineState = {
      storyDays: [],
      eventAnchors: [],
      conflicts: [
        {
          conflictId: "gap-1",
          severity: "warning",
          type: "day-gap",
          description: "day gap between ch1 and ch2",
          chapters: [1, 2],
          detectedAtChapter: 2,
        },
      ],
      lastUpdatedChapter: 2,
    };

    const issues = computeDeterministicTimelineIssues(timeline);
    expect(issues).toEqual([]);
  });
});

// ── formatTimelineAuditSummary ──────────────────────────────────

describe("formatTimelineAuditSummary", () => {
  it("returns minimal block for empty timeline (zh)", () => {
    const timeline: TimelineState = {
      storyDays: [],
      eventAnchors: [],
      conflicts: [],
      lastUpdatedChapter: 0,
    };

    const result = formatTimelineAuditSummary(timeline, "zh");
    expect(result).toContain("时间线状态");
    expect(result).toContain("尚无数据");
  });

  it("returns minimal block for empty timeline (en)", () => {
    const timeline: TimelineState = {
      storyDays: [],
      eventAnchors: [],
      conflicts: [],
      lastUpdatedChapter: 0,
    };

    const result = formatTimelineAuditSummary(timeline, "en");
    expect(result).toContain("Timeline Status");
    expect(result).toContain("no data yet");
  });

  it("formats storyDays in calendar format", () => {
    const timeline: TimelineState = {
      storyDays: [
        { chapter: 1, storyDay: 1, label: "退婚日" },
        { chapter: 2, storyDay: 2, label: "对赌挑衅" },
      ],
      eventAnchors: [],
      conflicts: [],
      lastUpdatedChapter: 2,
    };

    const result = formatTimelineAuditSummary(timeline, "zh");
    expect(result).toContain('ch1=day1"退婚日"');
    expect(result).toContain('ch2=day2"对赌挑衅"');
  });

  it("formats event anchors with cross-references", () => {
    const timeline: TimelineState = {
      storyDays: [],
      eventAnchors: [
        {
          eventId: "wedding",
          label: "the wedding",
          storyDay: 5,
          firstMentioned: { chapter: 1, raw: "wedding" },
          crossReferences: [
            { chapter: 2, raw: "the wedding was great", impliedDay: 5 },
          ],
          countdowns: [],
        },
      ],
      conflicts: [],
      lastUpdatedChapter: 2,
    };

    const result = formatTimelineAuditSummary(timeline, "zh");
    expect(result).toContain("wedding");
    expect(result).toContain("day5");
    expect(result).toContain('ch2 "the wedding was great"');
  });

  it("marks conflicting anchors with [矛盾!]", () => {
    const timeline: TimelineState = {
      storyDays: [],
      eventAnchors: [
        {
          eventId: "wedding",
          label: "the wedding",
          storyDay: 5,
          firstMentioned: { chapter: 1, raw: "wedding" },
          crossReferences: [
            { chapter: 2, raw: "ten days after wedding", impliedDay: 15 },
          ],
          countdowns: [],
        },
      ],
      conflicts: [
        {
          conflictId: "xr-wedding-ch2",
          severity: "critical",
          type: "anchor-mismatch",
          description: "wedding reference mismatch at ch2",
          chapters: [1, 2],
          detectedAtChapter: 2,
        },
      ],
      lastUpdatedChapter: 2,
    };

    const result = formatTimelineAuditSummary(timeline, "zh");
    expect(result).toContain("[矛盾!]");
  });

  it("marks conflicting cross-references individually", () => {
    const timeline: TimelineState = {
      storyDays: [],
      eventAnchors: [
        {
          eventId: "wedding",
          label: "the wedding",
          storyDay: 5,
          firstMentioned: { chapter: 1, raw: "wedding" },
          crossReferences: [
            { chapter: 2, raw: "after wedding", impliedDay: 15 },
            { chapter: 3, raw: "at wedding", impliedDay: 5 },
          ],
          countdowns: [],
        },
      ],
      conflicts: [
        {
          conflictId: "xr-wedding-ch2",
          severity: "critical",
          type: "anchor-mismatch",
          description: "wedding mismatch",
          chapters: [1, 2],
          detectedAtChapter: 2,
        },
      ],
      lastUpdatedChapter: 3,
    };

    const result = formatTimelineAuditSummary(timeline, "zh");
    // The conflicting cross-ref (impliedDay 15 != anchor 5) should be marked
    const lines = result.split("\n");
    const mismatchLine = lines.find((l) => l.includes("after wedding") && l.includes("day15"));
    expect(mismatchLine).toBeDefined();
    expect(mismatchLine!).toContain("[矛盾!]");
    // The matching cross-ref (impliedDay 5 == anchor 5) should NOT be marked
    const matchLine = lines.find((l) => l.includes("at wedding") && l.includes("day5"));
    expect(matchLine).toBeDefined();
    expect(matchLine!).not.toContain("[矛盾!]");
  });

  it("formats countdowns with days-left info", () => {
    const timeline: TimelineState = {
      storyDays: [{ chapter: 1, storyDay: 3, label: "" }],
      eventAnchors: [
        {
          eventId: "deadline",
          label: "deadline",
          storyDay: 10,
          firstMentioned: { chapter: 1, raw: "deadline" },
          crossReferences: [],
          countdowns: [{ chapter: 1, raw: "7 days to go", daysLeft: 7 }],
        },
      ],
      conflicts: [],
      lastUpdatedChapter: 1,
    };

    const result = formatTimelineAuditSummary(timeline, "zh");
    expect(result).toContain('countdown "7 days to go"');
    expect(result).toContain("7d left");
    expect(result).toContain("day10");
  });

  it("uses EN labels when language is en", () => {
    const timeline: TimelineState = {
      storyDays: [{ chapter: 1, storyDay: 1, label: "day1" }],
      eventAnchors: [
        {
          eventId: "e1",
          label: "event one",
          storyDay: 1,
          firstMentioned: { chapter: 1, raw: "event one" },
          crossReferences: [],
          countdowns: [],
        },
      ],
      conflicts: [
        {
          conflictId: "c1",
          severity: "critical",
          type: "anchor-mismatch",
          description: "e1 mismatch",
          chapters: [1, 2],
          detectedAtChapter: 2,
        },
      ],
      lastUpdatedChapter: 2,
    };

    const result = formatTimelineAuditSummary(timeline, "en");
    expect(result).toContain("## Timeline Status");
    expect(result).toContain("Story Calendar:");
    expect(result).toContain("Key Event Anchors:");
    expect(result).toContain("[CONFLICT!]");
  });

  it("handles countdowns without matching chapterDay gracefully", () => {
    const timeline: TimelineState = {
      storyDays: [],
      eventAnchors: [
        {
          eventId: "deadline",
          label: "deadline",
          storyDay: 10,
          firstMentioned: { chapter: 1, raw: "deadline" },
          crossReferences: [],
          countdowns: [{ chapter: 1, raw: "7 days left", daysLeft: 7 }],
        },
      ],
      conflicts: [],
      lastUpdatedChapter: 1,
    };

    const result = formatTimelineAuditSummary(timeline, "zh");
    expect(result).toContain("countdown");
    // When no matching chapterDay, impliedDay falls back to daysLeft itself
    expect(result).toContain("day7");
  });
});
