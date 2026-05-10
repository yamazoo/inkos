import { describe, expect, it, vi } from "vitest";
import { VolumeStructureExtractor } from "../agents/volume-structure-extractor.js";
import * as llmProvider from "../llm/provider.js";
import type { LLMClient } from "../llm/provider.js";

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
    stripThinkingBlocks: true,
    maxTokensCap: null,
    extra: {},
  },
};

function twoVolumeJson(): string {
  const volumes = [
    {
      volumeId: 1,
      volumeTitle: "第一卷：困龙出渊",
      chapterRange: [1, 50],
      coreConflict: "主角从底层觉醒异能，与黑暗势力初次交锋",
      keyTurnChapter: 30,
      keyTurnEvent: "主角首次使用异能击退敌人",
      harvestGoals: ["觉醒异能", "击退第一批敌人"],
    },
    {
      volumeId: 2,
      volumeTitle: "第二卷：暗流涌动",
      chapterRange: [51, 100],
      coreConflict: "幕后黑手浮出水面，主角陷入危机",
      keyTurnChapter: 75,
      keyTurnEvent: "发现幕后黑手的真实身份",
      harvestGoals: ["揭露幕后黑手", "获得新力量"],
    },
  ];
  return `\`\`\`json\n${JSON.stringify(volumes, null, 2)}\n\`\`\``;
}

function singleVolumeJson(): string {
  const volumes = [
    {
      volumeId: 1,
      volumeTitle: "第一卷",
      chapterRange: [1, 30],
      coreConflict: "主角穿越后适应新世界",
      keyTurnChapter: 15,
      keyTurnEvent: "主角决定投身修炼之路",
      harvestGoals: ["完成穿越适应"],
    },
  ];
  return `\`\`\`json\n${JSON.stringify(volumes, null, 2)}\n\`\`\``;
}

describe("VolumeStructureExtractor", () => {
  it("extracts correct number of volumes", async () => {
    vi.spyOn(llmProvider, "chatCompletion").mockResolvedValue({
      content: twoVolumeJson(),
      usage: ZERO_USAGE,
    });

    const extractor = new VolumeStructureExtractor({
      client: STUB_CLIENT,
      model: "test-model",
      projectRoot: "/tmp/test",
    });

    const result = await extractor.extract("散文内容", "测试书");

    expect(result).toHaveLength(2);
    expect(result[0]!.volumeId).toBe(1);
    expect(result[1]!.volumeId).toBe(2);
  });

  it("returns VolumeNodes with empty chapters arrays", async () => {
    vi.spyOn(llmProvider, "chatCompletion").mockResolvedValue({
      content: singleVolumeJson(),
      usage: ZERO_USAGE,
    });

    const extractor = new VolumeStructureExtractor({
      client: STUB_CLIENT,
      model: "test-model",
      projectRoot: "/tmp/test",
    });

    const result = await extractor.extract("散文内容", "测试书");

    expect(result).toHaveLength(1);
    expect(result[0]!.chapters).toEqual([]);
    expect(result[0]!.chapterRange).toEqual([1, 30]);
  });

  it("chapterRange does not overlap between volumes", async () => {
    vi.spyOn(llmProvider, "chatCompletion").mockResolvedValue({
      content: twoVolumeJson(),
      usage: ZERO_USAGE,
    });

    const extractor = new VolumeStructureExtractor({
      client: STUB_CLIENT,
      model: "test-model",
      projectRoot: "/tmp/test",
    });

    const result = await extractor.extract("散文内容", "测试书");

    expect(result[0]!.chapterRange[1]).toBeLessThan(result[1]!.chapterRange[0]);
  });

  it("keyTurnChapter is within chapterRange", async () => {
    vi.spyOn(llmProvider, "chatCompletion").mockResolvedValue({
      content: twoVolumeJson(),
      usage: ZERO_USAGE,
    });

    const extractor = new VolumeStructureExtractor({
      client: STUB_CLIENT,
      model: "test-model",
      projectRoot: "/tmp/test",
    });

    const result = await extractor.extract("散文内容", "测试书");

    for (const vol of result) {
      expect(vol.keyTurnChapter).toBeGreaterThanOrEqual(vol.chapterRange[0]);
      expect(vol.keyTurnChapter).toBeLessThanOrEqual(vol.chapterRange[1]);
    }
  });

  it("extracts coreConflict and harvestGoals", async () => {
    vi.spyOn(llmProvider, "chatCompletion").mockResolvedValue({
      content: singleVolumeJson(),
      usage: ZERO_USAGE,
    });

    const extractor = new VolumeStructureExtractor({
      client: STUB_CLIENT,
      model: "test-model",
      projectRoot: "/tmp/test",
    });

    const result = await extractor.extract("散文内容", "测试书");

    expect(result[0]!.coreConflict).toBeTruthy();
    expect(result[0]!.harvestGoals.length).toBeGreaterThan(0);
  });

  it("throws on invalid JSON response", async () => {
    vi.spyOn(llmProvider, "chatCompletion").mockResolvedValue({
      content: "这不是有效JSON",
      usage: ZERO_USAGE,
    });

    const extractor = new VolumeStructureExtractor({
      client: STUB_CLIENT,
      model: "test-model",
      projectRoot: "/tmp/test",
    });

    await expect(extractor.extract("散文", "测试书")).rejects.toThrow();
  });

  it("throws on schema-invalid response (missing required fields)", async () => {
    vi.spyOn(llmProvider, "chatCompletion").mockResolvedValue({
      content: `\`\`\`json\n${JSON.stringify([{ bad: "data" }])}\n\`\`\``,
      usage: ZERO_USAGE,
    });

    const extractor = new VolumeStructureExtractor({
      client: STUB_CLIENT,
      model: "test-model",
      projectRoot: "/tmp/test",
    });

    await expect(extractor.extract("散文", "测试书")).rejects.toThrow();
  });
});
