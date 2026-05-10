import { describe, it, expect } from "vitest";
import { stripThinkBlocks } from "../utils/strip-think-blocks.js";

describe("stripThinkBlocks", () => {
  it("removes closed <think>...</think> blocks", () => {
    const input = "before<think>reasoning here</think>after";
    expect(stripThinkBlocks(input)).toBe("beforeafter");
  });

  it("removes unclosed <think> blocks (truncated response)", () => {
    const input = "before<think>reasoning that was truncated";
    expect(stripThinkBlocks(input)).toBe("before");
  });

  it("removes multiline <think> blocks", () => {
    const input = `paragraph 1

<think>
line 1 of thinking
line 2 of thinking
</think>

paragraph 2`;
    const result = stripThinkBlocks(input);
    expect(result).toContain("paragraph 1");
    expect(result).toContain("paragraph 2");
    expect(result).not.toContain("<think>");
    expect(result).not.toContain("line 1 of thinking");
  });

  it("removes multiple <think> blocks", () => {
    const input = "a<think>first</think>b<think>second</think>c";
    expect(stripThinkBlocks(input)).toBe("abc");
  });

  it("removes <thought> blocks", () => {
    const input = "before<thought>inner reasoning</thought>after";
    expect(stripThinkBlocks(input)).toBe("beforeafter");
  });

  it("removes <thinking> blocks", () => {
    const input = "before<thinking>inner reasoning</thinking>after";
    expect(stripThinkBlocks(input)).toBe("beforeafter");
  });

  it("removes unclosed <thinking> blocks", () => {
    const input = "before<thinking>truncated reasoning";
    expect(stripThinkBlocks(input)).toBe("before");
  });

  it("returns clean text unchanged", () => {
    const input = "陈渊第三次从剑冢里退出来时，窗外的天色已经从鱼肚白转成了淡金色。";
    expect(stripThinkBlocks(input)).toBe(input);
  });

  it("handles empty string", () => {
    expect(stripThinkBlocks("")).toBe("");
  });

  it("handles Chinese thinking content in <think> blocks", () => {
    const input = `天黑了，又亮了。

<think>
用户要求我作为章节长度修正器，将当前章节压缩到3000字左右。
当前字数：4712字
目标字数：3000字
让我开始重构文本。
</think>

陈渊第三次从剑冢里退出来时`;
    const result = stripThinkBlocks(input);
    expect(result).toContain("天黑了，又亮了。");
    expect(result).toContain("陈渊第三次从剑冢里退出来时");
    expect(result).not.toContain("章节长度修正器");
    expect(result).not.toContain("<think>");
  });

  it("strips case-insensitive <think> blocks", () => {
    const input = "before<Think>reasoning</Think>after";
    expect(stripThinkBlocks(input)).toBe("beforeafter");
  });
});
