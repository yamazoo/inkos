import { describe, it, expect } from "vitest";
import {
  PackageScoreSchema,
  PackageCandidateSchema,
  PackageResultSchema,
  PackageCandidatesStateSchema,
  TOMATO_TITLE_MAX,
  TOMATO_SYNOPSIS_MAX,
} from "../models/packaging.js";

describe("PackageScoreSchema", () => {
  it("accepts valid scores", () => {
    const result = PackageScoreSchema.parse({
      suspense: 8,
      genreClarity: 7,
      contentAlignment: 9,
    });
    expect(result.suspense).toBe(8);
  });

  it("rejects scores above 10", () => {
    expect(() =>
      PackageScoreSchema.parse({ suspense: 11, genreClarity: 7, contentAlignment: 9 }),
    ).toThrow();
  });

  it("rejects negative scores", () => {
    expect(() =>
      PackageScoreSchema.parse({ suspense: -1, genreClarity: 7, contentAlignment: 9 }),
    ).toThrow();
  });

  it("rejects missing fields", () => {
    expect(() =>
      PackageScoreSchema.parse({ suspense: 8, genreClarity: 7 }),
    ).toThrow();
  });
});

describe("PackageCandidateSchema", () => {
  const validCandidate = {
    title: "开局签到荒古圣体",
    synopsis: "穿越到修仙世界，绑定签到系统，开局获得荒古圣体。",
    score: { suspense: 8, genreClarity: 9, contentAlignment: 7 },
  };

  it("accepts a valid candidate", () => {
    const result = PackageCandidateSchema.parse(validCandidate);
    expect(result.title).toBe("开局签到荒古圣体");
  });

  it("rejects empty title", () => {
    expect(() =>
      PackageCandidateSchema.parse({ ...validCandidate, title: "" }),
    ).toThrow();
  });

  it(`rejects title longer than ${TOMATO_TITLE_MAX} chars`, () => {
    const longTitle = "这是一个超级无敌长的标题用来测试番茄小说的字符数限制不能超过三十个字哦";
    expect(longTitle.length).toBeGreaterThan(TOMATO_TITLE_MAX);
    expect(() =>
      PackageCandidateSchema.parse({ ...validCandidate, title: longTitle }),
    ).toThrow();
  });

  it(`accepts title exactly ${TOMATO_TITLE_MAX} chars`, () => {
    const exactTitle = "一二三四五六七八九十壹贰叁肆伍陆柒捌玖拾一二三四五六七八九零";
    // Trim to exactly TOMATO_TITLE_MAX
    const title = exactTitle.slice(0, TOMATO_TITLE_MAX);
    expect(title.length).toBe(TOMATO_TITLE_MAX);
    const result = PackageCandidateSchema.parse({ ...validCandidate, title });
    expect(result.title).toBe(title);
  });

  it("rejects empty synopsis", () => {
    expect(() =>
      PackageCandidateSchema.parse({ ...validCandidate, synopsis: "" }),
    ).toThrow();
  });

  it(`rejects synopsis longer than ${TOMATO_SYNOPSIS_MAX} chars`, () => {
    const longSynopsis = "字".repeat(TOMATO_SYNOPSIS_MAX + 1);
    expect(() =>
      PackageCandidateSchema.parse({ ...validCandidate, synopsis: longSynopsis }),
    ).toThrow();
  });
});

describe("PackageResultSchema", () => {
  const validResult = {
    candidates: [
      {
        title: "开局签到荒古圣体",
        synopsis: "穿越到修仙世界，绑定签到系统。",
        score: { suspense: 8, genreClarity: 9, contentAlignment: 7 },
      },
    ],
    genre: "xuanhuan",
    sourcePatternSummary: "Top 10 标题偏好悬念式开头",
  };

  it("accepts a valid result", () => {
    const result = PackageResultSchema.parse(validResult);
    expect(result.candidates).toHaveLength(1);
    expect(result.genre).toBe("xuanhuan");
  });

  it("rejects empty candidates array", () => {
    expect(() =>
      PackageResultSchema.parse({ ...validResult, candidates: [] }),
    ).toThrow();
  });

  it("rejects empty genre", () => {
    expect(() =>
      PackageResultSchema.parse({ ...validResult, genre: "" }),
    ).toThrow();
  });

  it("accepts multiple candidates", () => {
    const multiCandidate = {
      ...validResult,
      candidates: [
        validResult.candidates[0],
        {
          title: "重生之都市修仙",
          synopsis: "重生回到十年前，凭借修仙记忆逆天改命。",
          score: { suspense: 7, genreClarity: 8, contentAlignment: 9 },
        },
      ],
    };
    const result = PackageResultSchema.parse(multiCandidate);
    expect(result.candidates).toHaveLength(2);
  });
});

describe("PackageCandidatesStateSchema", () => {
  const validState = {
    bookId: "test-book",
    generatedAt: "2026-01-01T00:00:00Z",
    expiresAt: "2026-01-08T00:00:00Z",
    candidates: [
      {
        title: "开局签到荒古圣体",
        synopsis: "穿越到修仙世界，绑定签到系统。",
        score: { suspense: 8, genreClarity: 9, contentAlignment: 7 },
      },
    ],
    genre: "xuanhuan",
    sourcePatternSummary: "Top 10 标题偏好悬念式开头",
  };

  it("accepts valid state", () => {
    const result = PackageCandidatesStateSchema.parse(validState);
    expect(result.bookId).toBe("test-book");
    expect(result.expiresAt).toBe("2026-01-08T00:00:00Z");
  });

  it("rejects invalid datetime", () => {
    expect(() =>
      PackageCandidatesStateSchema.parse({
        ...validState,
        generatedAt: "not-a-date",
      }),
    ).toThrow();
  });

  it("rejects missing bookId", () => {
    expect(() =>
      PackageCandidatesStateSchema.parse({ ...validState, bookId: "" }),
    ).toThrow();
  });
});
