import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("node:fs/promises", () => ({
  readFile: vi.fn(),
}));

import { readFile } from "node:fs/promises";
import { loadSubGenreConstraints } from "../agents/architect.js";

const mockedReadFile = vi.mocked(readFile);

const MORTAL_FLOW_BODY = `## 角色设计约束（凡人流专属）

凡人流的核心是"无依无靠的普通人靠努力和机缘逆袭"。角色设计必须遵守以下禁忌：

### 主角身世禁忌
- **禁止血统论**：主角不得拥有特殊血脉、隐藏贵族血统、远古神族后裔等设定
- **禁止神秘父辈**：主角的父母/祖辈不得是被驱逐的强者、隐藏的高手、失势的贵族
- **禁止继承型金手指**：主角的能力不得来自父母遗物（神秘功法、封印力量、传承法宝）
- **禁止宿命论**：主角不得是"天选之人""命运之子""预言中的人"`;

const MORTAL_FLOW_RAW = `---
name: 凡人流修仙
id: 凡人流
chapterTypes: ["战斗章", "悟道章", "布局章", "过渡章", "回收章"]
fatigueWords: ["冷笑", "蝼蚁", "倒吸凉气", "瞳孔骤缩", "仿佛", "不禁", "宛如", "竟然"]
numericalSystem: true
powerScaling: true
pacingRule: "修炼/悟道与战斗交替，每3-5章一次小突破或关键收获"
satisfactionTypes: ["悟道突破", "斗法碾压", "法宝收获", "绝地反击", "收获认同", "力挽狂澜"]
auditDimensions: [1,2,3,4,5,6,7,8,9,10,11,13,14,15,16,17,18,19,24,25,26]
---

${MORTAL_FLOW_BODY}`;

describe("loadSubGenreConstraints", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("merges mortal-flow body when externalContext contains '凡人流'", async () => {
    mockedReadFile.mockResolvedValueOnce(MORTAL_FLOW_RAW);

    const result = await loadSubGenreConstraints(
      "类型：男频·凡人流修仙",
      "原始 genre body",
    );

    expect(result).toContain("原始 genre body");
    expect(result).toContain("禁止血统论");
    expect(result).toContain("禁止神秘父辈");
    expect(mockedReadFile).toHaveBeenCalledOnce();
    expect(mockedReadFile.mock.calls[0]![0]).toContain("mortal-flow.md");
  });

  it("merges mortal-flow body when externalContext contains '凡人修仙'", async () => {
    mockedReadFile.mockResolvedValueOnce(MORTAL_FLOW_RAW);

    const result = await loadSubGenreConstraints(
      "这是一本凡人修仙小说",
      "原始 genre body",
    );

    expect(result).toContain("禁止血统论");
  });

  it("returns original genreBody when externalContext is undefined", async () => {
    const result = await loadSubGenreConstraints(undefined, "原始 genre body");

    expect(result).toBe("原始 genre body");
    expect(mockedReadFile).not.toHaveBeenCalled();
  });

  it("returns original genreBody when externalContext is empty string", async () => {
    const result = await loadSubGenreConstraints("", "原始 genre body");

    expect(result).toBe("原始 genre body");
    expect(mockedReadFile).not.toHaveBeenCalled();
  });

  it("returns original genreBody when externalContext does not match keywords", async () => {
    const result = await loadSubGenreConstraints(
      "类型：天才流修仙",
      "原始 genre body",
    );

    expect(result).toBe("原始 genre body");
    expect(mockedReadFile).not.toHaveBeenCalled();
  });

  it("returns original genreBody when mortal-flow.md file is missing", async () => {
    mockedReadFile.mockRejectedValueOnce(new Error("ENOENT"));

    const result = await loadSubGenreConstraints(
      "类型：男频·凡人流修仙",
      "原始 genre body",
    );

    expect(result).toBe("原始 genre body");
  });

  it("returns original genreBody with console.warn when mortal-flow.md has corrupt frontmatter", async () => {
    mockedReadFile.mockResolvedValueOnce("not valid yaml: [[[");
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = await loadSubGenreConstraints(
      "类型：凡人流修仙",
      "原始 genre body",
    );

    expect(result).toBe("原始 genre body");
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("mortal-flow.md exists but failed to parse"),
    );
    warnSpy.mockRestore();
  });
});
