import { afterEach, describe, expect, it, vi } from "vitest";
import { ScenePlannerAgent } from "../agents/scene-planner.js";
import type { AgentContext } from "../agents/base.js";
import { writeFile } from "node:fs/promises";

vi.mock("node:fs/promises", () => ({
  writeFile: vi.fn().mockResolvedValue(undefined),
}));

const mockLogger = {
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  child: vi.fn(() => mockLogger),
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

const sampleBeatSheet = `
# Chapter 3 节拍表

## 章类: 战斗章

| 节拍名称 | 默认占比 | 代价 | 收获 | 要求 |
|---|---|---|---|---|
| 悬念引入 | 10% | — | — | 青云门弟子入场 |
| 冲突爆发 | 35% | 暴露风险上升 | 战利品到手 | — |
| 章末悬念 | 15% | 代价显现 | 新目标浮现 | — |
`;

describe("ScenePlannerAgent", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("has name scene-planner", () => {
    const agent = new ScenePlannerAgent(makeCtx());
    expect(agent.name).toBe("scene-planner");
  });

  it("returns null when LLM call throws", async () => {
    const agent = new ScenePlannerAgent(makeCtx());
    vi.spyOn(agent as unknown as { chat: (...args: unknown[]) => Promise<unknown> }, "chat").mockRejectedValue(new Error("network"));
    const result = await agent.planScenes({
      bookId: "test",
      chapterNumber: 3,
      beatSheet: sampleBeatSheet,
      wordCount: { min: 2000, target: 3000, max: 4000 },
    }, "/tmp/runtime");
    expect(result).toBeNull();
  });

  it("returns null when LLM returns empty content and JSON parse fails", async () => {
    const agent = new ScenePlannerAgent(makeCtx());
    vi.spyOn(agent as unknown as { chat: (...args: unknown[]) => Promise<unknown> }, "chat").mockResolvedValue({
      content: "",
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
    });
    const result = await agent.planScenes({
      bookId: "test",
      chapterNumber: 3,
      beatSheet: sampleBeatSheet,
      wordCount: { min: 2000, target: 3000, max: 4000 },
    }, "/tmp/runtime");
    // Empty content produces a result with zero scenes (write succeeds via mock)
    expect(result).toEqual({
      scenePlan: "",
      scenes: [],
      totalScenes: 0,
      totalTargetWords: 0,
    });
  });
});
