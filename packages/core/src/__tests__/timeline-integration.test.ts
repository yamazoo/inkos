import { describe, expect, it } from "vitest";
import {
  applyTimelineDelta,
  computeDeterministicTimelineIssues,
  formatTimelineAuditSummary,
} from "../utils/timeline.js";
import { parseSettlerDeltaOutput } from "../agents/settler-delta-parser.js";
import type { TimelineState } from "../models/timeline.js";

describe("Timeline end-to-end flow", () => {
  it("simulates the wolf-fight contradiction scenario from spec", () => {
    // Step 1: Parse Ch1 Settler output with TIMELINE block
    const ch1SettlerOutput = `=== POST_SETTLEMENT ===
chapter 1 settled

=== RUNTIME_STATE_DELTA ===
\`\`\`json
{"chapter":1,"hookOps":{"upsert":[],"mention":[],"resolve":[],"defer":[]},"newHookCandidates":[],"subplotOps":[],"emotionalArcOps":[],"characterMatrixOps":[],"notes":[]}
\`\`\`

=== TIMELINE ===
\`\`\`json
{"storyDay":1,"dayLabel":"退婚日","events":[{"id":"wolf-fight","reference":"后山独处时","impliedOffset":0}]}
\`\`\``;

    const ch1Parsed = parseSettlerDeltaOutput(ch1SettlerOutput);
    expect(ch1Parsed.timelineDelta).toBeDefined();
    expect(ch1Parsed.timelineDelta!.storyDay).toBe(1);

    // Step 2: Apply Ch1 timeline delta
    const emptyTimeline: TimelineState = {
      storyDays: [],
      eventAnchors: [],
      conflicts: [],
      lastUpdatedChapter: 0,
    };
    const ch1Result = applyTimelineDelta(
      emptyTimeline,
      ch1Parsed.timelineDelta!,
      1,
    );
    expect(ch1Result.updated.eventAnchors).toHaveLength(1);
    expect(ch1Result.updated.eventAnchors[0]!.storyDay).toBe(1);
    expect(ch1Result.conflicts).toEqual([]);

    // Step 3: Parse Ch2 Settler output
    const ch2SettlerOutput = `=== POST_SETTLEMENT ===
chapter 2 settled

=== RUNTIME_STATE_DELTA ===
\`\`\`json
{"chapter":2,"hookOps":{"upsert":[],"mention":[],"resolve":[],"defer":[]},"newHookCandidates":[],"subplotOps":[],"emotionalArcOps":[],"characterMatrixOps":[],"notes":[]}
\`\`\`

=== TIMELINE ===
\`\`\`json
{"storyDay":2,"dayLabel":"对赌挑衅","events":[{"id":"wolf-fight","reference":"三天前在后山","impliedOffset":-3},{"id":"exam","reference":"考核还有三天","countdown":3}]}
\`\`\``;

    const ch2Parsed = parseSettlerDeltaOutput(ch2SettlerOutput);
    expect(ch2Parsed.timelineDelta).toBeDefined();

    // Step 4: Apply Ch2 — should detect wolf-fight contradiction
    const ch2Result = applyTimelineDelta(
      ch1Result.updated,
      ch2Parsed.timelineDelta!,
      2,
    );
    expect(ch2Result.conflicts).toHaveLength(1);
    expect(ch2Result.conflicts[0]!.type).toBe("anchor-mismatch");
    expect(ch2Result.conflicts[0]!.severity).toBe("critical");
    expect(ch2Result.conflicts[0]!.description).toContain("wolf-fight");

    // Step 5: Compute deterministic issues for auditor
    const issues = computeDeterministicTimelineIssues(ch2Result.updated);
    expect(issues.length).toBeGreaterThanOrEqual(1);
    expect(issues.some((i) => i.severity === "critical")).toBe(true);

    // Step 6: Format audit summary — should show conflict marker
    const summary = formatTimelineAuditSummary(ch2Result.updated, "zh");
    expect(summary).toContain("[矛盾!]");
    expect(summary).toContain("wolf-fight");
  });

  it("handles the exam countdown consistency scenario", () => {
    const empty: TimelineState = {
      storyDays: [],
      eventAnchors: [],
      conflicts: [],
      lastUpdatedChapter: 0,
    };

    // Ch1: first mention of "exam" with countdown=3 at storyDay=1
    // Anchor should be at storyDay = 1+3 = 4, and the countdown is recorded
    const ch1Delta = {
      storyDay: 1,
      dayLabel: "",
      events: [{ id: "exam", reference: "考核前三日", countdown: 3 }],
    };
    const ch1 = applyTimelineDelta(empty, ch1Delta, 1);
    expect(ch1.updated.eventAnchors).toHaveLength(1);
    expect(ch1.updated.eventAnchors[0]!.eventId).toBe("exam");
    expect(ch1.updated.eventAnchors[0]!.storyDay).toBe(4);
    expect(ch1.updated.eventAnchors[0]!.countdowns).toHaveLength(1);
    expect(ch1.updated.eventAnchors[0]!.countdowns[0]!.daysLeft).toBe(3);

    // Ch2: countdown=2 at storyDay=2, impliedDay = 2+2=4, anchor=4 → consistent, no conflict
    const ch2Delta = {
      storyDay: 2,
      dayLabel: "",
      events: [{ id: "exam", reference: "考核还有2天", countdown: 2 }],
    };
    const ch2 = applyTimelineDelta(ch1.updated, ch2Delta, 2);
    expect(ch2.conflicts).toHaveLength(0);
    expect(ch2.updated.eventAnchors[0]!.countdowns).toHaveLength(2);
  });

  it("no conflict when references are consistent", () => {
    const empty: TimelineState = {
      storyDays: [],
      eventAnchors: [],
      conflicts: [],
      lastUpdatedChapter: 0,
    };

    // Ch1: wolf-fight at day 1
    const ch1 = applyTimelineDelta(
      empty,
      {
        storyDay: 1,
        dayLabel: "",
        events: [{ id: "wolf-fight", reference: "后山", impliedOffset: 0 }],
      },
      1,
    );

    // Ch2: "昨天在后山" → impliedOffset=-1, impliedDay=2+(-1)=1, anchor=1 → OK
    const ch2 = applyTimelineDelta(
      ch1.updated,
      {
        storyDay: 2,
        dayLabel: "",
        events: [
          { id: "wolf-fight", reference: "昨天在后山", impliedOffset: -1 },
        ],
      },
      2,
    );
    expect(ch2.conflicts).toEqual([]);

    // Summary should have no conflict markers
    const summary = formatTimelineAuditSummary(ch2.updated, "zh");
    expect(summary).not.toContain("[矛盾!]");
  });

  it("L3 day gap warning for large jumps", () => {
    const state: TimelineState = {
      storyDays: [
        { chapter: 1, storyDay: 1, label: "" },
        { chapter: 2, storyDay: 50, label: "" },
      ],
      eventAnchors: [],
      conflicts: [],
      lastUpdatedChapter: 2,
    };
    const issues = computeDeterministicTimelineIssues(state);
    const gapWarning = issues.find((i) => i.category === "Timeline Day Gap");
    expect(gapWarning).toBeDefined();
    expect(gapWarning!.severity).toBe("warning");
  });
});
