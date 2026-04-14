import { describe, it, expect } from "vitest";
import { extractChapterOutline } from "../agents/detailed-outline.js";

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
});
