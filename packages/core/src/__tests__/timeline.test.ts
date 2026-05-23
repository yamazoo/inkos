import { describe, expect, it } from "vitest";
import {
  TimelineStateSchema,
  TimelineDeltaSchema,
  TimelineConflictSchema,
  EventAnchorSchema,
  type TimelineState,
  type TimelineDelta,
} from "../models/timeline.js";

describe("TimelineStateSchema", () => {
  it("accepts a valid empty timeline", () => {
    const result = TimelineStateSchema.parse({
      storyDays: [],
      eventAnchors: [],
      conflicts: [],
      lastUpdatedChapter: 0,
    });
    expect(result.storyDays).toEqual([]);
    expect(result.conflicts).toEqual([]);
  });

  it("accepts a timeline with storyDays and anchors", () => {
    const input = {
      storyDays: [
        { chapter: 1, storyDay: 1, label: "退婚日" },
        { chapter: 2, storyDay: 2, label: "对赌挑衅" },
      ],
      eventAnchors: [
        {
          eventId: "wolf-fight",
          label: "后山打狼",
          storyDay: 1,
          firstMentioned: { chapter: 1, raw: "后山独处时" },
          crossReferences: [
            { chapter: 2, raw: "三天前在后山", impliedDay: -2 },
          ],
          countdowns: [],
        },
      ],
      conflicts: [],
      lastUpdatedChapter: 2,
    };
    const result = TimelineStateSchema.parse(input);
    expect(result.storyDays).toHaveLength(2);
    expect(result.eventAnchors[0]!.eventId).toBe("wolf-fight");
  });

  it("rejects storyDays with non-integer chapter", () => {
    expect(() =>
      TimelineStateSchema.parse({
        storyDays: [{ chapter: 1.5, storyDay: 1, label: "" }],
        eventAnchors: [],
        conflicts: [],
        lastUpdatedChapter: 0,
      }),
    ).toThrow();
  });

  it("rejects negative storyDay", () => {
    expect(() =>
      TimelineStateSchema.parse({
        storyDays: [{ chapter: 1, storyDay: -1, label: "" }],
        eventAnchors: [],
        conflicts: [],
        lastUpdatedChapter: 0,
      }),
    ).toThrow();
  });

  it("accepts conflicts with severity levels", () => {
    const result = TimelineStateSchema.parse({
      storyDays: [],
      eventAnchors: [],
      conflicts: [
        {
          conflictId: "c1",
          severity: "critical",
          type: "anchor-mismatch",
          description: "wolf-fight anchor day=1 but ch2 implies day=-2",
          chapters: [1, 2],
          detectedAtChapter: 2,
        },
      ],
      lastUpdatedChapter: 2,
    });
    expect(result.conflicts[0]!.severity).toBe("critical");
  });
});

describe("TimelineDeltaSchema", () => {
  it("accepts a valid delta with events", () => {
    const delta: TimelineDelta = {
      storyDay: 2,
      dayLabel: "对赌挑衅日",
      events: [
        { id: "wolf-fight", reference: "三天前在后山", impliedOffset: -3 },
        { id: "exam", reference: "考核还有三天", countdown: 3 },
      ],
    };
    const result = TimelineDeltaSchema.parse(delta);
    expect(result.storyDay).toBe(2);
    expect(result.events).toHaveLength(2);
  });

  it("accepts a delta with no events", () => {
    const result = TimelineDeltaSchema.parse({
      storyDay: 1,
      dayLabel: "",
      events: [],
    });
    expect(result.events).toEqual([]);
  });

  it("rejects storyDay < 1", () => {
    expect(() =>
      TimelineDeltaSchema.parse({
        storyDay: 0,
        dayLabel: "",
        events: [],
      }),
    ).toThrow();
  });

  it("coerces string storyDay to number", () => {
    const result = TimelineDeltaSchema.parse({
      storyDay: "5",
      dayLabel: "",
      events: [],
    });
    expect(result.storyDay).toBe(5);
    expect(typeof result.storyDay).toBe("number");
  });

  it("coerces float storyDay to integer", () => {
    const result = TimelineDeltaSchema.parse({
      storyDay: 3.0,
      dayLabel: "",
      events: [],
    });
    expect(result.storyDay).toBe(3);
  });

  it("coerces string countdown and float impliedOffset", () => {
    const result = TimelineDeltaSchema.parse({
      storyDay: 1,
      dayLabel: "",
      events: [
        { id: "exam", reference: "考核还有三天", countdown: "3" },
        { id: "wolf-fight", reference: "三天前", impliedOffset: -3.0 },
      ],
    });
    expect(result.events[0]!.countdown).toBe(3);
    expect(typeof result.events[0]!.countdown).toBe("number");
    expect(result.events[1]!.impliedOffset).toBe(-3);
    expect(typeof result.events[1]!.impliedOffset).toBe("number");
  });
});

describe("EventAnchorSchema", () => {
  it("accepts valid anchor", () => {
    const result = EventAnchorSchema.parse({
      eventId: "wolf-fight",
      label: "后山打狼",
      storyDay: 1,
      firstMentioned: { chapter: 1, raw: "后山独处时" },
      crossReferences: [],
      countdowns: [],
    });
    expect(result.eventId).toBe("wolf-fight");
  });

  it("accepts anchor with countdowns", () => {
    const result = EventAnchorSchema.parse({
      eventId: "exam",
      label: "年度考核",
      storyDay: 4,
      firstMentioned: { chapter: 1, raw: "考核前三日" },
      crossReferences: [],
      countdowns: [
        { chapter: 1, raw: "考核前三日", daysLeft: 3 },
        { chapter: 2, raw: "考核还有三天", daysLeft: 3 },
      ],
    });
    expect(result.countdowns).toHaveLength(2);
  });

  it("accepts recurring anchor", () => {
    const result = EventAnchorSchema.parse({
      eventId: "chenyuan-routine",
      label: "陈远日常",
      storyDay: 1,
      firstMentioned: { chapter: 1, raw: "吃冷馒头" },
      crossReferences: [],
      countdowns: [],
      recurring: true,
    });
    expect(result.recurring).toBe(true);
  });

  it("accepts anchor without recurring (backward compat)", () => {
    const result = EventAnchorSchema.parse({
      eventId: "wolf-fight",
      label: "后山打狼",
      storyDay: 1,
      firstMentioned: { chapter: 1, raw: "后山独处时" },
      crossReferences: [],
      countdowns: [],
    });
    expect(result.recurring).toBeUndefined();
  });
});
