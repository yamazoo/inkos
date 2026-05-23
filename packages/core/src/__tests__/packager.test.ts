import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PackagerAgent } from "../agents/packager.js";
import type { AgentContext } from "../agents/base.js";
import type { RadarSource, PlatformRankings } from "../agents/radar-source.js";
import { FanqieRadarSource } from "../agents/radar-source.js";

function createMockCtx(overrides: Partial<AgentContext> = {}): AgentContext {
  return {
    client: { provider: "openai", apiFormat: "chat" } as AgentContext["client"],
    model: "test-model",
    projectRoot: "/tmp/test",
    bookId: "test-book",
    ...overrides,
  };
}

function createMockRadarSource(rankings: PlatformRankings): RadarSource {
  return {
    name: "mock",
    fetch: vi.fn().mockResolvedValue(rankings),
  };
}

const MOCK_LLM_RESPONSE = JSON.stringify({
  candidates: [
    {
      title: "开局签到荒古圣体",
      synopsis: "穿越到修仙世界，绑定签到系统，第一天就获得了传说中的荒古圣体！",
      score: { suspense: 9, genreClarity: 8, contentAlignment: 7 },
    },
    {
      title: "重生之都市修仙",
      synopsis: "重生回到十年前，凭借前世修仙记忆，这一世他要站在世界之巅。",
      score: { suspense: 7, genreClarity: 9, contentAlignment: 8 },
    },
  ],
  genre: "xuanhuan",
  sourcePatternSummary: "热门标题偏好悬念式开局和系统流设定",
});

describe("PackagerAgent", () => {
  let agent: PackagerAgent;
  let mockSource: RadarSource;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let chatSpy: any;

  beforeEach(() => {
    mockSource = createMockRadarSource({
      platform: "番茄小说",
      entries: [
        { title: "开局签到荒古圣体", author: "作者A", category: "玄幻", extra: "[热门榜]" },
        { title: "重生之都市修仙", author: "作者B", category: "都市", extra: "[黑马榜]" },
      ],
    });

    agent = new PackagerAgent(createMockCtx(), [mockSource]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chatSpy = vi.spyOn(agent as any, "chat").mockResolvedValue({
      content: MOCK_LLM_RESPONSE,
      usage: { promptTokens: 0, completionTokens: 0 },
    });
  });

  it("generates candidates with valid structure", async () => {
    const result = await agent.generate({
      bookTitle: "骨刀行",
      genre: "xuanhuan",
      count: 2,
    });

    expect(result.candidates).toHaveLength(2);
    expect(result.candidates[0].title).toBe("开局签到荒古圣体");
    expect(result.genre).toBe("xuanhuan");
    expect(result.sourcePatternSummary).toBeTruthy();
  });

  it("uses built-in patterns as fallback when source has no fetchBookDetails", async () => {
    await agent.generate({ bookTitle: "骨刀行", genre: "xuanhuan", count: 2 });

    // Plain RadarSource (not FanqieRadarSource) → skip step 1,
    // built-in patterns always succeed → step 3 (fetch) is never reached
    expect(mockSource.fetch).not.toHaveBeenCalled();
    const userMessage = chatSpy.mock.calls[0][0][1];
    expect(userMessage.content).toMatch(/悬念开局|重生穿越|系统流/);
  });

  it("passes competitive patterns to LLM prompt", async () => {
    await agent.generate({ bookTitle: "骨刀行", genre: "xuanhuan", count: 2 });

    const userMessage = chatSpy.mock.calls[0][0][1];
    expect(userMessage.content).toContain("开局签到荒古圣体");
  });

  it("includes current synopsis in prompt when provided", async () => {
    await agent.generate({
      bookTitle: "骨刀行",
      genre: "xuanhuan",
      currentSynopsis: "一个少年踏上修仙之路",
      count: 2,
    });

    const userMessage = chatSpy.mock.calls[0][0][1];
    expect(userMessage.content).toContain("一个少年踏上修仙之路");
  });

  it("throws on malformed LLM output", async () => {
    chatSpy.mockResolvedValue({
      content: "not valid json at all",
      usage: { promptTokens: 0, completionTokens: 0 },
    });

    await expect(
      agent.generate({ bookTitle: "骨刀行", genre: "xuanhuan", count: 2 }),
    ).rejects.toThrow(/JSON/);
  });

  it("throws on LLM output with invalid schema", async () => {
    chatSpy.mockResolvedValue({
      content: JSON.stringify({ candidates: [], genre: "" }),
      usage: { promptTokens: 0, completionTokens: 0 },
    });

    await expect(
      agent.generate({ bookTitle: "骨刀行", genre: "xuanhuan", count: 2 }),
    ).rejects.toThrow();
  });

  it("handles RadarSource failure gracefully", async () => {
    const failingSource: RadarSource = {
      name: "failing",
      fetch: vi.fn().mockRejectedValue(new Error("network error")),
    };

    const agentWithFailingSource = new PackagerAgent(createMockCtx(), [failingSource]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.spyOn(agentWithFailingSource as any, "chat").mockResolvedValue({
      content: MOCK_LLM_RESPONSE,
      usage: { promptTokens: 0, completionTokens: 0 },
    });

    const result = await agentWithFailingSource.generate({
      bookTitle: "骨刀行",
      genre: "xuanhuan",
      count: 2,
    });

    expect(result.candidates).toHaveLength(2);
  });

  it("returns name property", () => {
    expect(agent.name).toBe("packager");
  });
});

describe("PackagerAgent fallback chain", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fetchSpy: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let detailsSpy: any;

  afterEach(() => {
    fetchSpy?.mockRestore();
    detailsSpy?.mockRestore();
  });

  it("uses fetchBookDetails when FanqieRadarSource returns data", async () => {
    detailsSpy = vi.spyOn(FanqieRadarSource.prototype, "fetchBookDetails").mockResolvedValue({
      titles: ["开局签到荒古圣体", "重生之都市修仙"],
      synopses: ["穿越到修仙世界", "重生回到十年前"],
    });
    fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: true, json: () => Promise.resolve({}) } as Response);

    const agent = new PackagerAgent(createMockCtx());
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chatSpy: any = vi.spyOn(agent as any, "chat").mockResolvedValue({
      content: MOCK_LLM_RESPONSE,
      usage: { promptTokens: 0, completionTokens: 0 },
    });

    await agent.generate({ bookTitle: "骨刀行", genre: "xuanhuan", count: 2 });

    expect(detailsSpy).toHaveBeenCalledWith("xuanhuan");
    const userMessage = chatSpy.mock.calls[0][0][1];
    expect(userMessage.content).toContain("番茄小说热门榜");
    expect(userMessage.content).toContain("穿越到修仙世界");
  });

  it("falls back to built-in patterns when fetchBookDetails returns empty", async () => {
    detailsSpy = vi.spyOn(FanqieRadarSource.prototype, "fetchBookDetails").mockResolvedValue({
      titles: [],
      synopses: [],
    });
    fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: true, json: () => Promise.resolve({}) } as Response);

    const agent = new PackagerAgent(createMockCtx());
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chatSpy: any = vi.spyOn(agent as any, "chat").mockResolvedValue({
      content: MOCK_LLM_RESPONSE,
      usage: { promptTokens: 0, completionTokens: 0 },
    });

    await agent.generate({ bookTitle: "骨刀行", genre: "xuanhuan", count: 2 });

    const userMessage = chatSpy.mock.calls[0][0][1];
    // title-patterns.json contains these pattern group names
    expect(userMessage.content).toMatch(/悬念开局|重生穿越|系统流/);
  });

  it("falls back to built-in patterns when fetchBookDetails throws", async () => {
    detailsSpy = vi.spyOn(FanqieRadarSource.prototype, "fetchBookDetails").mockRejectedValue(new Error("api down"));

    const mockSource: RadarSource = {
      name: "fallback",
      fetch: vi.fn().mockResolvedValue({
        platform: "Fallback平台",
        entries: [{ title: "后备标题", author: "", category: "", extra: "[fallback]" }],
      }),
    };

    const agent = new PackagerAgent(createMockCtx(), [mockSource]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chatSpy: any = vi.spyOn(agent as any, "chat").mockResolvedValue({
      content: MOCK_LLM_RESPONSE,
      usage: { promptTokens: 0, completionTokens: 0 },
    });

    await agent.generate({ bookTitle: "骨刀行", genre: "xuanhuan", count: 2 });

    const userMessage = chatSpy.mock.calls[0][0][1];
    // Should contain built-in pattern group names, NOT the generic source fallback
    expect(userMessage.content).toMatch(/悬念开局|重生穿越|系统流/);
    expect(userMessage.content).not.toContain("后备标题");
  });

  it("skips fetchBookDetails for non-Fanqie sources and uses built-in patterns", async () => {
    detailsSpy = vi.spyOn(FanqieRadarSource.prototype, "fetchBookDetails");

    const plainSource: RadarSource = {
      name: "plain",
      fetch: vi.fn().mockResolvedValue({
        platform: "Plain平台",
        entries: [{ title: "普通标题", author: "", category: "", extra: "[plain]" }],
      }),
    };

    const agent = new PackagerAgent(createMockCtx(), [plainSource]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chatSpy: any = vi.spyOn(agent as any, "chat").mockResolvedValue({
      content: MOCK_LLM_RESPONSE,
      usage: { promptTokens: 0, completionTokens: 0 },
    });

    await agent.generate({ bookTitle: "骨刀行", genre: "xuanhuan", count: 2 });

    expect(detailsSpy).not.toHaveBeenCalled();
    const userMessage = chatSpy.mock.calls[0][0][1];
    // Built-in patterns take priority over generic fetch
    expect(userMessage.content).toMatch(/悬念开局|重生穿越|系统流/);
  });
});
