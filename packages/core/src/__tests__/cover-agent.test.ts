import { describe, it, expect, vi, beforeEach } from "vitest";
import { CoverAgent } from "../agents/cover-agent.js";
import type { AgentContext } from "../agents/base.js";

vi.mock("node:fs/promises", () => ({
  readFile: vi.fn().mockResolvedValue(""),
}));

vi.mock("../utils/outline-paths.js", () => ({
  readStoryFrame: vi.fn().mockResolvedValue(""),
  readCharacterContext: vi.fn().mockResolvedValue(""),
}));

function createMockCtx(overrides: Partial<AgentContext> = {}): AgentContext {
  return {
    client: { provider: "openai", apiFormat: "chat" } as AgentContext["client"],
    model: "test-model",
    projectRoot: "/tmp/test",
    bookId: "test-book",
    ...overrides,
  };
}

function makeCandidate(index: number, overrides: Record<string, unknown> = {}) {
  return {
    index,
    title: `候选标题${index}`,
    coverPrompt: "中国玄幻小说封面，600x800竖版，".repeat(5) + "金色主色调，仙气缭绕",
    synopsis: "穿越修仙世界，绑定签到系统，第一天就获得荒古圣体。从此踏上巅峰之路。".repeat(2),
    styleTag: `style-${index}`,
    ...overrides,
  };
}

function makeValidResponse(count = 6) {
  return JSON.stringify({
    candidates: Array.from({ length: count }, (_, i) => makeCandidate(i + 1)),
  });
}

describe("CoverAgent", () => {
  let agent: CoverAgent;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let chatSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    agent = new CoverAgent(createMockCtx());
    chatSpy = vi.spyOn(agent as any, "chat").mockResolvedValue({
      content: makeValidResponse(),
      usage: { promptTokens: 0, completionTokens: 0 },
    });
  });

  it("returns name property", () => {
    expect(agent.name).toBe("cover");
  });

  it("generates 6 valid candidates", async () => {
    const result = await agent.generate({
      bookId: "test-book",
      bookTitle: "骨刀行",
      genre: "xuanhuan",
      bookDir: "/tmp/test/books/test-book",
    });

    expect(result.candidates).toHaveLength(6);
    expect(result.bookId).toBe("test-book");
    expect(result.candidates[0].title).toBeTruthy();
    expect(result.candidates[0].coverPrompt).toBeTruthy();
    expect(result.candidates[0].synopsis).toBeTruthy();
    expect(result.candidates[0].styleTag).toBeTruthy();
  });

  it("parses JSON from markdown code fence", async () => {
    chatSpy.mockResolvedValue({
      content: "```json\n" + makeValidResponse() + "\n```",
      usage: { promptTokens: 0, completionTokens: 0 },
    });

    const result = await agent.generate({
      bookId: "test-book",
      bookTitle: "骨刀行",
      genre: "xuanhuan",
      bookDir: "/tmp/test/books/test-book",
    });

    expect(result.candidates).toHaveLength(6);
  });

  it("truncates synopsis at sentence boundary when > 200 chars", async () => {
    // Build text with sentence endings spread across >200 chars so truncation finds a boundary
    const longSynopsis = Array.from({ length: 20 }, (_, i) => `第${i + 1}段内容描写场景人物。`).join("");
    chatSpy.mockResolvedValue({
      content: JSON.stringify({
        candidates: Array.from({ length: 6 }, (_, i) =>
          i === 0 ? makeCandidate(i + 1, { synopsis: longSynopsis }) : makeCandidate(i + 1),
        ),
      }),
      usage: { promptTokens: 0, completionTokens: 0 },
    });

    const result = await agent.generate({
      bookId: "test-book",
      bookTitle: "骨刀行",
      genre: "xuanhuan",
      bookDir: "/tmp/test/books/test-book",
    });

    expect(result.candidates[0].synopsis.length).toBeLessThanOrEqual(200);
    // Should end at a sentence boundary
    expect(result.candidates[0].synopsis).toMatch(/[。！？!?.…]$/);
  });

  it("truncates coverPrompt at sentence boundary when > 600 chars", async () => {
    // Build text with sentence endings spread across >600 chars
    const longPrompt = Array.from({ length: 30 }, (_, i) => `画面第${i + 1}层描绘金色光芒万丈仙气缭绕。`).join("");
    chatSpy.mockResolvedValue({
      content: JSON.stringify({
        candidates: Array.from({ length: 6 }, (_, i) =>
          i === 0 ? makeCandidate(i + 1, { coverPrompt: longPrompt }) : makeCandidate(i + 1),
        ),
      }),
      usage: { promptTokens: 0, completionTokens: 0 },
    });

    const result = await agent.generate({
      bookId: "test-book",
      bookTitle: "骨刀行",
      genre: "xuanhuan",
      bookDir: "/tmp/test/books/test-book",
    });

    expect(result.candidates[0].coverPrompt.length).toBeLessThanOrEqual(600);
  });

  it("includes extraContext in user prompt when provided", async () => {
    await agent.generate({
      bookId: "test-book",
      bookTitle: "骨刀行",
      genre: "xuanhuan",
      bookDir: "/tmp/test/books/test-book",
      extraContext: "重点突出签到系统的设定",
    });

    const userMessage = chatSpy.mock.calls[0][0][1];
    expect(userMessage.content).toContain("重点突出签到系统的设定");
  });

  it("uses correct genre style for urban genre", async () => {
    await agent.generate({
      bookId: "test-book",
      bookTitle: "都市之最强高手",
      genre: "urban",
      bookDir: "/tmp/test/books/test-book",
    });

    const systemMessage = chatSpy.mock.calls[0][0][0];
    expect(systemMessage.content).toContain("深蓝");
    expect(systemMessage.content).toContain("都市夜景");
  });

  it("falls back to xuanhuan style for unknown genre", async () => {
    const warnSpy = vi.fn();
    const agentWithLogger = new CoverAgent(createMockCtx({ logger: { info: vi.fn(), warn: warnSpy, error: vi.fn(), debug: vi.fn(), child: vi.fn() } }));
    const spy = vi.spyOn(agentWithLogger as any, "chat").mockResolvedValue({
      content: makeValidResponse(),
      usage: { promptTokens: 0, completionTokens: 0 },
    });

    await agentWithLogger.generate({
      bookId: "test-book",
      bookTitle: "测试书籍",
      genre: "unknown-genre",
      bookDir: "/tmp/test/books/test-book",
    });

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("unknown-genre"),
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const systemMessage = (spy.mock.calls[0] as any)[0][0];
    expect(systemMessage.content).toContain("金色");
  });

  it("throws on invalid JSON", async () => {
    chatSpy.mockResolvedValue({
      content: "not valid json",
      usage: { promptTokens: 0, completionTokens: 0 },
    });

    await expect(
      agent.generate({
        bookId: "test-book",
        bookTitle: "骨刀行",
        genre: "xuanhuan",
        bookDir: "/tmp/test/books/test-book",
      }),
    ).rejects.toThrow(/no JSON found/);
  });
});

describe("CoverAgent context reading", () => {
  let agent: CoverAgent;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let chatSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    agent = new CoverAgent(createMockCtx());
    chatSpy = vi.spyOn(agent as any, "chat").mockResolvedValue({
      content: makeValidResponse(),
      usage: { promptTokens: 0, completionTokens: 0 },
    });
  });

  it("includes brief sections in user prompt", async () => {
    const { readFile } = await import("node:fs/promises");
    vi.mocked(readFile).mockResolvedValueOnce(
      "# 故事简介\n\n## 核心概念\n主角获得金手指系统\n\n## 金手指\n每日签到获得奖励\n\n## 主角\n李天，普通大学生",
    );

    await agent.generate({
      bookId: "test-book",
      bookTitle: "骨刀行",
      genre: "xuanhuan",
      bookDir: "/tmp/test/books/test-book",
    });

    const userMessage = chatSpy.mock.calls[0][0][1];
    expect(userMessage.content).toContain("主角获得金手指系统");
    expect(userMessage.content).toContain("每日签到获得奖励");
  });

  it("includes story frame content in user prompt", async () => {
    const { readStoryFrame } = await import("../utils/outline-paths.js");
    vi.mocked(readStoryFrame).mockResolvedValueOnce(
      "世界观：修仙世界分为九大境界，每个境界对应不同实力。",
    );

    await agent.generate({
      bookId: "test-book",
      bookTitle: "骨刀行",
      genre: "xuanhuan",
      bookDir: "/tmp/test/books/test-book",
    });

    const userMessage = chatSpy.mock.calls[0][0][1];
    expect(userMessage.content).toContain("九大境界");
  });

  it("includes character appearance in user prompt", async () => {
    const { readCharacterContext } = await import("../utils/outline-paths.js");
    vi.mocked(readCharacterContext).mockResolvedValueOnce(
      "## 主要角色\n\n### 李天\n外貌：黑发少年，身穿青色道袍，手持骨刀。",
    );

    await agent.generate({
      bookId: "test-book",
      bookTitle: "骨刀行",
      genre: "xuanhuan",
      bookDir: "/tmp/test/books/test-book",
    });

    const userMessage = chatSpy.mock.calls[0][0][1];
    expect(userMessage.content).toContain("黑发少年");
  });
});

describe("CoverAgent retry logic", () => {
  it("retries when fewer than 6 candidates are returned", async () => {
    const agent = new CoverAgent(createMockCtx());

    const partialResponse = JSON.stringify({
      candidates: Array.from({ length: 4 }, (_, i) => makeCandidate(i + 1)),
    });

    const fullResponse = makeValidResponse(6);

    const chatSpy = vi.spyOn(agent as any, "chat")
      .mockResolvedValueOnce({
        content: partialResponse,
        usage: { promptTokens: 0, completionTokens: 0 },
      })
      .mockResolvedValueOnce({
        content: fullResponse,
        usage: { promptTokens: 0, completionTokens: 0 },
      });

    const result = await agent.generate({
      bookId: "test-book",
      bookTitle: "骨刀行",
      genre: "xuanhuan",
      bookDir: "/tmp/test/books/test-book",
    });

    expect(result.candidates).toHaveLength(6);
    expect(chatSpy).toHaveBeenCalledTimes(2);
  });
});

describe("resolveGenreCoverStyle", () => {
  it("resolves xuanhuan correctly", async () => {
    const { resolveGenreCoverStyle } = await import("../agents/cover-prompts.js");
    const result = resolveGenreCoverStyle("xuanhuan");
    expect(result.isFallback).toBe(false);
    expect(result.style.colorPalette).toContain("金色");
  });

  it("resolves xianxia to xuanhuan style", async () => {
    const { resolveGenreCoverStyle } = await import("../agents/cover-prompts.js");
    const result = resolveGenreCoverStyle("xianxia");
    expect(result.isFallback).toBe(false);
    expect(result.style.mood).toContain("热血");
  });

  it("resolves urban correctly", async () => {
    const { resolveGenreCoverStyle } = await import("../agents/cover-prompts.js");
    const result = resolveGenreCoverStyle("urban");
    expect(result.isFallback).toBe(false);
    expect(result.style.colorPalette).toContain("深蓝");
  });

  it("falls back to xuanhuan for unknown genre", async () => {
    const { resolveGenreCoverStyle } = await import("../agents/cover-prompts.js");
    const result = resolveGenreCoverStyle("romance");
    expect(result.isFallback).toBe(true);
    expect(result.style.colorPalette).toContain("金色");
  });
});
