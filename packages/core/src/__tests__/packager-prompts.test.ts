import { describe, it, expect } from "vitest";
import {
  buildPackagerSystemPrompt,
  buildPackagerUserPrompt,
} from "../agents/packager-prompts.js";

describe("buildPackagerSystemPrompt", () => {
  it("includes role description", () => {
    const prompt = buildPackagerSystemPrompt();
    expect(prompt).toContain("番茄小说");
    expect(prompt).toContain("标题");
    expect(prompt).toContain("简介");
  });

  it("includes character limit constraints", () => {
    const prompt = buildPackagerSystemPrompt();
    expect(prompt).toContain("30");
    expect(prompt).toContain("200");
  });

  it("includes JSON output format instruction", () => {
    const prompt = buildPackagerSystemPrompt();
    expect(prompt).toContain("candidates");
    expect(prompt).toContain("suspense");
    expect(prompt).toContain("genreClarity");
    expect(prompt).toContain("contentAlignment");
  });
});

describe("buildPackagerUserPrompt", () => {
  const params = {
    bookTitle: "骨刀行",
    genre: "xuanhuan",
    currentSynopsis: "一个少年踏上修仙之路的故事",
    competitivePatterns: "热门标题模式：悬念式开局、系统流、重生穿越",
    count: 5,
  };

  it("includes book title", () => {
    const prompt = buildPackagerUserPrompt(params);
    expect(prompt).toContain("骨刀行");
  });

  it("includes genre", () => {
    const prompt = buildPackagerUserPrompt(params);
    expect(prompt).toContain("xuanhuan");
  });

  it("includes competitive patterns", () => {
    const prompt = buildPackagerUserPrompt(params);
    expect(prompt).toContain("悬念式开局");
  });

  it("includes requested candidate count", () => {
    const prompt = buildPackagerUserPrompt(params);
    expect(prompt).toContain("5");
  });

  it("includes current synopsis when provided", () => {
    const prompt = buildPackagerUserPrompt(params);
    expect(prompt).toContain("一个少年踏上修仙之路的故事");
  });

  it("works without currentSynopsis", () => {
    const prompt = buildPackagerUserPrompt({
      ...params,
      currentSynopsis: undefined,
    });
    expect(prompt).toContain("骨刀行");
    expect(prompt).not.toContain("undefined");
  });
});
