import { describe, it, expect } from "vitest";
import { extractChapterOutline, extractLastNChaptersSummary } from "../agents/detailed-outline.js";
import { buildBatchContinuationPrompt } from "../agents/detailed-outline-prompts.js";

describe("extractChapterOutline", () => {
  const content = `# 章节细纲

## 第 1 章
1. 赵恒发现暗主留下的信物，信物指向一处遗迹入口。
2. 赵恒与墨兰商议，决定趁暗主尚未察觉时抢先进入遗迹。
3. 遗迹入口开启，阵法反噬，赵恒受轻伤但成功进入。

## 第 2 章
1. 遗迹内部空间错乱，赵恒在迷宫中遇到机关兽伏击。
2. 赵恒利用阵法知识破解第二道门，获得一枚古修士丹药。
3. 墨兰在外部发现暗主追兵的动向，局势紧张。

## 第 3 章
1. 赵恒深入遗迹核心，发现一块刻有法则碎片的玉碑。
2. 玉碑认主触发禁制，赵恒被迫做出抉择：带走碎片或留下线索。
3. 赵恒带走碎片，遗迹开始崩塌，他在最后时刻留下坐标给墨兰。`;

  it("extracts chapter 1 outline", () => {
    const result = extractChapterOutline(content, 1);
    expect(result).toContain("赵恒发现暗主留下的信物");
    expect(result).toContain("遗迹入口开启");
  });

  it("extracts chapter 2 outline", () => {
    const result = extractChapterOutline(content, 2);
    expect(result).toContain("遗迹内部空间错乱");
  });

  it("returns undefined for non-existent chapter", () => {
    const result = extractChapterOutline(content, 99);
    expect(result).toBeUndefined();
  });

  it("handles English chapter anchors", () => {
    const en = `## Chapter 5\n1. Event one.\n2. Event two.`;
    const result = extractChapterOutline(en, 5);
    expect(result).toContain("Event one");
  });

  it("returns undefined for empty content", () => {
    expect(extractChapterOutline("", 1)).toBeUndefined();
    expect(extractChapterOutline("  ", 1)).toBeUndefined();
  });

  it("extracts the last chapter without trailing separator", () => {
    const doc = `## 第 2 章
1. Event.
2. Event.`;
    const result = extractChapterOutline(doc, 2);
    expect(result).toContain("Event");
    expect(result).not.toContain("##");
  });
});

describe("buildBatchContinuationPrompt", () => {
  it("generates Chinese continuation prompt", () => {
    const prompt = buildBatchContinuationPrompt({
      previousChaptersCount: 20,
      nextBatchStart: 21,
      nextBatchEnd: 40,
      previousSummary: "第19章摘要\n第20章摘要",
      language: "zh",
    });
    expect(prompt).toContain("前 20 章已生成");
    expect(prompt).toContain("第 21 至第 40 章");
    expect(prompt).toContain("第19章摘要");
  });

  it("generates English continuation prompt", () => {
    const prompt = buildBatchContinuationPrompt({
      previousChaptersCount: 20,
      nextBatchStart: 21,
      nextBatchEnd: 40,
      previousSummary: "Chapter 19 summary\nChapter 20 summary",
      language: "en",
    });
    expect(prompt).toContain("Chapters 1\u201320 have been generated");
    expect(prompt).toContain("chapters 21\u201340");
  });

  it("falls back to zh for unknown language", () => {
    const prompt = buildBatchContinuationPrompt({
      previousChaptersCount: 0,
      nextBatchStart: 1,
      nextBatchEnd: 20,
      previousSummary: "",
      language: "french",
    });
    expect(prompt).toContain("前 "); // zh fallback
  });
});

describe("extractLastNChaptersSummary", () => {
  const zhContent = `# 章节细纲

## 第1章 杂役
青云宗外门，杂役院破旧木屋中，十七岁的林岁安在昏暗油灯下擦拭着永远擦不完的地板。

## 第2章 窥寿
林岁安的脚步顿住，世界在这一刻变得不同。

## 第3章 代价
代价随之而来，他感到一阵剧烈的眩晕。`;

  it("extracts last N chapters from content", () => {
    const result = extractLastNChaptersSummary(zhContent, 2, "zh");
    expect(result).toContain("代价");
    expect(result).toContain("窥寿");
  });

  it("returns placeholder for empty content", () => {
    const result = extractLastNChaptersSummary("", 2, "zh");
    expect(result).toBe("(无前章内容)");
  });
});
