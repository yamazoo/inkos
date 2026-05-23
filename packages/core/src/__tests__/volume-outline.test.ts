import { describe, expect, it } from "vitest";
import {
  ChapterNodeSchema,
  validateSatisfactionSchedule,
} from "../models/volume-outline.js";
import type { ChapterNode } from "../models/volume-outline.js";

describe("ChapterNodeSchema", () => {
  it("accepts a node without satisfactionType (backward compat)", () => {
    const node = {
      chapter: 1,
      event: "事件",
      beat: "节奏",
    };
    expect(() => ChapterNodeSchema.parse(node)).not.toThrow();
    const parsed = ChapterNodeSchema.parse(node);
    expect(parsed.satisfactionType).toBeUndefined();
  });

  it("accepts a node with satisfactionType", () => {
    const node = {
      chapter: 1,
      event: "事件",
      beat: "节奏",
      satisfactionType: "绝地反击",
    };
    expect(() => ChapterNodeSchema.parse(node)).not.toThrow();
    const parsed = ChapterNodeSchema.parse(node);
    expect(parsed.satisfactionType).toBe("绝地反击");
  });
});

describe("validateSatisfactionSchedule", () => {
  const make = (
    chapter: number,
    satisfactionType?: string,
  ): ChapterNode => ({
    chapter,
    event: `事件${chapter}`,
    beat: `节奏${chapter}`,
    satisfactionType,
  });

  it("returns empty for a clean schedule", () => {
    const nodes = [make(1, "绝地反击"), make(2, "悟道突破"), make(3, "绝地反击")];
    expect(validateSatisfactionSchedule(nodes)).toEqual([]);
  });

  it("returns empty when no nodes have satisfactionType", () => {
    const nodes = [make(1), make(2), make(3)];
    expect(validateSatisfactionSchedule(nodes)).toEqual([]);
  });

  it("returns empty for exactly maxConsecutive repeats (default 2)", () => {
    const nodes = [make(1, "绝地反击"), make(2, "绝地反击"), make(3, "悟道突破")];
    expect(validateSatisfactionSchedule(nodes)).toEqual([]);
  });

  it("flags 3 consecutive same-type with default limit", () => {
    const nodes = [
      make(1, "绝地反击"),
      make(2, "绝地反击"),
      make(3, "绝地反击"),
    ];
    const warnings = validateSatisfactionSchedule(nodes);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain("Chapter 3");
    expect(warnings[0]).toContain("绝地反击");
  });

  it("respects custom maxConsecutive", () => {
    const nodes = [
      make(1, "绝地反击"),
      make(2, "绝地反击"),
      make(3, "绝地反击"),
    ];
    // limit=3 → 3 consecutive is allowed
    expect(validateSatisfactionSchedule(nodes, 3)).toEqual([]);
    // limit=1 → 2 consecutive is flagged
    const warnings = validateSatisfactionSchedule(nodes, 1);
    expect(warnings).toHaveLength(2);
  });

  it("resets run on type change", () => {
    const nodes = [
      make(1, "绝地反击"),
      make(2, "绝地反击"),
      make(3, "悟道突破"),
      make(4, "绝地反击"),
      make(5, "绝地反击"),
    ];
    expect(validateSatisfactionSchedule(nodes)).toEqual([]);
  });

  it("handles null/undefined types as run breakers", () => {
    const nodes = [
      make(1, "绝地反击"),
      make(2, "绝地反击"),
      make(3), // no type — breaks the run
      make(4, "绝地反击"),
    ];
    expect(validateSatisfactionSchedule(nodes)).toEqual([]);
  });
});
