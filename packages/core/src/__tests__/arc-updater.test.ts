import { afterEach, describe, expect, it, vi } from "vitest";
import { ArcUpdaterAgent } from "../agents/arc-updater.js";
import type { AgentContext } from "../agents/base.js";
import type { ChapterCompletionReport } from "../models/runtime-state.js";
import { loadTracker, saveTracker } from "../state/tracker-store.js";

// Mock the tracker-store module
vi.mock("../state/tracker-store.js", () => ({
  loadTracker: vi.fn().mockResolvedValue(null),  // always return null (bootstrap)
  saveTracker: vi.fn().mockResolvedValue(undefined),  // no-op
  bootstrapArcTracker: vi.fn().mockReturnValue({
    schemaVersion: 1,
    volumeId: "vol-1",
    volumeTitle: "测试卷",
    chapterRange: [1, 50],
    currentChapter: 0,
    outlineNodes: [],
    mainSuspense: { hookId: "H001", description: "主悬念", plantedAt: 1, currentProgress: 0, expectedPayoff: null },
    nextChapterDirection: { targetNodeId: null, targetProgress: 30, tone: "intensify" as const },
  }),
  bootstrapFactionLedger: vi.fn().mockReturnValue({
    schemaVersion: 1,
    factions: {},
    protagonist: { name: "主角", powerLevel: { power: 30, resources: 20, influence: 10, morale: 50 }, exposureRisk: 0, socialCapital: 10, recentDeltas: [] },
    relationships: [],
  }),
  bootstrapMoodArc: vi.fn().mockReturnValue({
    schemaVersion: 1,
    volumeId: "vol-1",
    entries: [],
    arcShape: "alternating" as const,
    arcDescription: "",
    nextChapterMoodTarget: { tension: "up" as const, excitement: "same" as const, warmth: "same" as const, reason: "init" },
  }),
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
    client: { provider: "openai", defaults: { temperature: 0.7, maxTokens: 4096, maxTokensCap: null, thinkingBudget: 0, extra: {} } } as AgentContext["client"],
    model: "claude-sonnet-4-6",
    projectRoot: "/tmp",
    logger: mockLogger,
    ...overrides,
  };
}

function makeReport(chapter: number = 1): ChapterCompletionReport {
  return {
    schemaVersion: 1 as const,
    chapter,
    cost: "青云门盯上主角",
    gain: "结识帮腔者",
    factionChanges: [],
    moodChange: {
      tensionBefore: 50,
      tensionAfter: 60,
      warmthBefore: 30,
      warmthAfter: 25,
      overallShift: "tenser",
      chapterTone: "沉重",
    },
    hookChanges: {
      advanced: [],
      newlyPlanted: [],
      paidOff: [],
    },
    arcProgress: {
      nodeId: "node-1",
      progressBefore: 0,
      progressAfter: 30,
    },
    selfCheck: {
      beatCoverage: [],
      dialogueCheck: [],
    },
  };
}

describe("ArcUpdaterAgent", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("has name arc-updater", () => {
    const agent = new ArcUpdaterAgent(makeCtx());
    expect(agent.name).toBe("arc-updater");
  });

  it("returns llm_failure error when LLM call throws", async () => {
    const ctx = makeCtx();
    const agent = new ArcUpdaterAgent(ctx);
    // Spy on the agent's protected chat method via the base class
    vi.spyOn(agent as any, "chat")
      .mockRejectedValue(new Error("network error"));
    const result = await agent.updateTrackers({
      bookId: "test-book",
      bookDir: "/tmp",
      chapter: 1,
      completionReport: makeReport(1),
      chapterContent: "青云门弟子出现在镇口。主角被盯上了。",
    });
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]!.type).toBe("llm_failure");
  });

  it("gracefully skips when tracker files are missing (bootstrap)", async () => {
    const ctx = makeCtx();
    const agent = new ArcUpdaterAgent(ctx);
    vi.spyOn(agent as any, "chat")
      .mockResolvedValue({
        content: JSON.stringify({
          arcTracker: {
            schemaVersion: 1,
            volumeId: "vol-1",
            volumeTitle: "测试卷",
            chapterRange: [1, 50],
            currentChapter: 1,
            outlineNodes: [{
              nodeId: "node-1",
              title: "测试节点",
              status: "active",
              startChapter: 1,
              completedChapter: null,
              progress: 30,
            }],
            mainSuspense: {
              hookId: "H001",
              description: "主悬念",
              plantedAt: 1,
              currentProgress: 30,
              expectedPayoff: null,
            },
            nextChapterDirection: {
              targetNodeId: "node-1",
              targetProgress: 60,
              tone: "intensify",
            },
          },
          factionLedger: {
            schemaVersion: 1,
            factions: {},
            protagonist: {
              name: "主角",
              powerLevel: { power: 30, resources: 20, influence: 10, morale: 50 },
              exposureRisk: 5,
              socialCapital: 10,
              recentDeltas: [],
            },
            relationships: [],
          },
          moodArc: {
            schemaVersion: 1,
            volumeId: "vol-1",
            entries: [{
              chapter: 1,
              tension: 60,
              excitement: 50,
              mystery: 50,
              warmth: 25,
              overall: "tense",
              chapterTone: "沉重",
            }],
            arcShape: "alternating",
            arcDescription: "",
            nextChapterMoodTarget: {
              tension: "up",
              excitement: "same",
              warmth: "same",
              reason: "init",
            },
          },
        }),
      });

    // bookDir /tmp/nonexistent — no tracker files exist, should bootstrap
    const result = await agent.updateTrackers({
      bookId: "test-book",
      bookDir: "/tmp/nonexistent",
      chapter: 1,
      completionReport: makeReport(1),
      chapterContent: "青云门弟子出现在镇口。主角被盯上了。",
    });
    expect(result.errors).toHaveLength(0);
    expect(result.arcTracker.currentChapter).toBe(1);
    expect(result.factionLedger.protagonist.exposureRisk).toBe(5);
    // Verify saveTracker was called (no real disk I/O)
    expect(vi.mocked(saveTracker)).toHaveBeenCalled();
  });
});
