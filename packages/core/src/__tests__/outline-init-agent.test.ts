import { afterEach, describe, expect, it, vi } from "vitest";
import { OutlineInitAgent } from "../agents/outline-init-agent.js";
import * as llmProvider from "../llm/provider.js";
import type { LLMClient } from "../llm/provider.js";
import { ChapterNodeSchema } from "../models/volume-outline.js";

const ZERO_USAGE = {
  promptTokens: 0,
  completionTokens: 0,
  totalTokens: 0,
} as const;

const STUB_CLIENT: LLMClient = {
  provider: "openai",
  apiFormat: "chat",
  stream: false,
  defaults: {
    temperature: 0.7,
    maxTokens: 2048,
    thinkingBudget: 0,
    maxTokensCap: null, stripThinkingBlocks: true,
    extra: {},
  },
};

/** Build a JSON response body containing N chapters starting from `start`. */
function chapterJson(start: number, count: number): string {
  const chapters = Array.from({ length: count }, (_, i) => ({
    chapter: start + i,
    event: `核心事件第${start + i}章——主角遭遇关键转折，敌人现身，盟友出现，局势彻底改变`,
    beat: `节奏转折第${start + i}章——从平静到紧张再到爆发的氛围三段切换，每段五到六个自然段推进`,
    description: `详细描述第${start + i}章的剧情推进：主角在本章面临重要抉择，通过内心挣扎展现角色成长弧线，随后在中段遭遇核心冲突的第一次正面碰撞，最终在章末留下引人深思的钩子为下一章的冲突升级做好铺垫。场景描写兼具视觉冲击力与情感张力。`,
  }));
  return `\`\`\`json\n${JSON.stringify(chapters, null, 2)}\n\`\`\``;
}

function stubChat(content: string) {
  return vi.spyOn(llmProvider, "chatCompletion").mockResolvedValue({
    content,
    usage: ZERO_USAGE,
  });
}

const BASE_INPUT = {
  bookTitle: "测试书",
  volumeTitle: "第一卷：困龙出渊",
  volumeProse: "本卷讲述主角从底层崛起的故事。前三章是日常铺垫，第四章开始出现冲突。",
  chapterRange: [1, 5] as [number, number],
  storyFrame: "都市异能小说，主角获得超能力后保护家人。",
  language: "zh" as const,
};

afterEach(() => vi.restoreAllMocks());

describe("OutlineInitAgent", () => {
  // -------------------------------------------------------------------------
  // generateChaptersForVolume
  // -------------------------------------------------------------------------

  describe("generateChaptersForVolume", () => {
    it("returns correct number of ChapterNodes matching chapterRange", async () => {
      stubChat(chapterJson(1, 5));

      const agent = new OutlineInitAgent({
        client: STUB_CLIENT,
        model: "test-model",
        projectRoot: "/tmp/test",
      });

      const result = await agent.generateChaptersForVolume(BASE_INPUT);

      expect(result).toHaveLength(5);
      expect(result[0]!.chapter).toBe(1);
      expect(result[4]!.chapter).toBe(5);
    });

    it("all returned nodes pass ChapterNodeSchema validation", async () => {
      stubChat(chapterJson(1, 5));

      const agent = new OutlineInitAgent({
        client: STUB_CLIENT,
        model: "test-model",
        projectRoot: "/tmp/test",
      });

      const result = await agent.generateChaptersForVolume(BASE_INPUT);

      for (const node of result) {
        expect(() => ChapterNodeSchema.parse(node)).not.toThrow();
        expect(node.event.length).toBeGreaterThan(0);
        expect(node.beat.length).toBeGreaterThan(0);
      }
    });

    it("uses batch continuation for volumes with >20 chapters", async () => {
      const spy = vi.spyOn(llmProvider, "chatCompletion");

      // First batch: chapters 1-20
      spy.mockResolvedValueOnce({
        content: chapterJson(1, 20),
        usage: ZERO_USAGE,
      });
      // Second batch: chapters 21-25
      spy.mockResolvedValueOnce({
        content: chapterJson(21, 5),
        usage: ZERO_USAGE,
      });

      const agent = new OutlineInitAgent({
        client: STUB_CLIENT,
        model: "test-model",
        projectRoot: "/tmp/test",
      });

      const input = {
        ...BASE_INPUT,
        chapterRange: [1, 25] as [number, number],
      };
      const result = await agent.generateChaptersForVolume(input);

      expect(result).toHaveLength(25);
      expect(result[0]!.chapter).toBe(1);
      expect(result[24]!.chapter).toBe(25);
      // Two LLM calls made
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it("batch continuation produces continuous chapter numbering", async () => {
      const spy = vi.spyOn(llmProvider, "chatCompletion");

      spy.mockResolvedValueOnce({
        content: chapterJson(1, 20),
        usage: ZERO_USAGE,
      });
      spy.mockResolvedValueOnce({
        content: chapterJson(21, 5),
        usage: ZERO_USAGE,
      });

      const agent = new OutlineInitAgent({
        client: STUB_CLIENT,
        model: "test-model",
        projectRoot: "/tmp/test",
      });

      const result = await agent.generateChaptersForVolume({
        ...BASE_INPUT,
        chapterRange: [1, 25] as [number, number],
      });

      for (let i = 0; i < result.length; i++) {
        expect(result[i]!.chapter).toBe(i + 1);
      }
    });

    it("handles single-chapter volume", async () => {
      stubChat(chapterJson(1, 1));

      const agent = new OutlineInitAgent({
        client: STUB_CLIENT,
        model: "test-model",
        projectRoot: "/tmp/test",
      });

      const result = await agent.generateChaptersForVolume({
        ...BASE_INPUT,
        chapterRange: [1, 1] as [number, number],
      });

      expect(result).toHaveLength(1);
      expect(result[0]!.chapter).toBe(1);
    });

    it("retries once on JSON parse failure", async () => {
      const spy = vi.spyOn(llmProvider, "chatCompletion");

      // First attempt: invalid JSON
      spy.mockResolvedValueOnce({
        content: "这不是有效的JSON",
        usage: ZERO_USAGE,
      });
      // Second attempt: valid JSON
      spy.mockResolvedValueOnce({
        content: chapterJson(1, 5),
        usage: ZERO_USAGE,
      });

      const agent = new OutlineInitAgent({
        client: STUB_CLIENT,
        model: "test-model",
        projectRoot: "/tmp/test",
      });

      const result = await agent.generateChaptersForVolume(BASE_INPUT);

      expect(result).toHaveLength(5);
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it("throws after retry exhaustion", async () => {
      const spy = vi.spyOn(llmProvider, "chatCompletion");

      // Both attempts return invalid content
      spy.mockResolvedValue({
        content: "无效输出",
        usage: ZERO_USAGE,
      });

      const agent = new OutlineInitAgent({
        client: STUB_CLIENT,
        model: "test-model",
        projectRoot: "/tmp/test",
      });

      await expect(
        agent.generateChaptersForVolume(BASE_INPUT),
      ).rejects.toThrow();
    });
  });

  // -------------------------------------------------------------------------
  // generateChaptersRange
  // -------------------------------------------------------------------------

  describe("generateChaptersRange", () => {
    it("generates only the specified range", async () => {
      stubChat(chapterJson(10, 10));

      const agent = new OutlineInitAgent({
        client: STUB_CLIENT,
        model: "test-model",
        projectRoot: "/tmp/test",
      });

      const result = await agent.generateChaptersRange(BASE_INPUT, 10, 19);

      expect(result).toHaveLength(10);
      expect(result[0]!.chapter).toBe(10);
      expect(result[9]!.chapter).toBe(19);
    });

    it("single-chapter range works", async () => {
      stubChat(chapterJson(5, 1));

      const agent = new OutlineInitAgent({
        client: STUB_CLIENT,
        model: "test-model",
        projectRoot: "/tmp/test",
      });

      const result = await agent.generateChaptersRange(BASE_INPUT, 5, 5);

      expect(result).toHaveLength(1);
      expect(result[0]!.chapter).toBe(5);
    });

    it("all returned nodes pass Zod validation", async () => {
      stubChat(chapterJson(10, 10));

      const agent = new OutlineInitAgent({
        client: STUB_CLIENT,
        model: "test-model",
        projectRoot: "/tmp/test",
      });

      const result = await agent.generateChaptersRange(BASE_INPUT, 10, 19);

      for (const node of result) {
        expect(() => ChapterNodeSchema.parse(node)).not.toThrow();
      }
    });
  });
});
