import { afterEach, describe, expect, it, vi } from "vitest";
import { BeatPlannerAgent } from "../agents/beat-planner.js";
import type { AgentContext } from "../agents/base.js";

const mockLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

function makeCtx(overrides: Partial<AgentContext> = {}): AgentContext {
  return {
    client: { provider: "openai" } as AgentContext["client"],
    model: "claude-sonnet-4-6",
    projectRoot: "/tmp",
    logger: mockLogger,
    ...overrides,
  };
}

const minimalIntent = {
  chapter: 1,
  goal: "主角展示实力",
  outlineNode: "第一章：宗门测试",
  mustKeep: [],
  mustAvoid: [],
  styleEmphasis: [],
  conflicts: [],
  hookAgenda: {
    mustAdvance: [],
    eligibleResolve: [],
    staleDebt: [],
    avoidNewHookFamilies: [],
    pressureMap: [],
  },
  structuredDirectives: {
    sceneDirective: "",
    arcDirective: "",
    moodDirective: "",
    titleDirective: "",
    conflictDirective: "",
  },
};

describe("BeatPlannerAgent", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns null when LLM call throws", async () => {
    const agent = new BeatPlannerAgent(makeCtx());
    vi.spyOn(agent as unknown as { chat: (...args: unknown[]) => Promise<unknown> }, "chat").mockRejectedValue(new Error("network error"));
    const result = await agent.planBeats(
      {
        bookId: "test-book",
        chapterNumber: 1,
        intent: minimalIntent as any,
        lastChapterEnding: "主角离开宗门。",
        recentEndings: [],
        currentState: "# 当前状态\n...",
        pendingHooks: [],
        emotionalArcs: "",
        chapterTypeHint: null,
        wordCount: { min: 2000, target: 3000, max: 4000 },
        genreChapterTypes: ["战斗章", "过渡章", "布局章"],
        language: "zh",
      },
      "/tmp/runtime",
    );
    expect(result).toBeNull();
    expect(mockLogger.warn).toHaveBeenCalled();
  });

  it("has name beat-planner", () => {
    const agent = new BeatPlannerAgent(makeCtx());
    expect(agent.name).toBe("beat-planner");
  });
});
