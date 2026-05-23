import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { FanqieRadarSource } from "../agents/radar-source.js";

const MOCK_RANK_RESPONSE = {
  data: {
    result: [
      {
        book_name: "开局签到荒古圣体",
        author: "作者A",
        category: "玄幻",
        abstract: "穿越到修仙世界，绑定签到系统",
      },
      {
        book_name: "重生之都市修仙",
        author: "作者B",
        category: "都市",
        abstract: "重生回到十年前",
      },
    ],
  },
};

describe("FanqieRadarSource.fetchBookDetails", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fetchSpy: any;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(MOCK_RANK_RESPONSE),
    } as Response);
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it("fetches book details from rank_list API", async () => {
    const source = new FanqieRadarSource();
    const result = await source.fetchBookDetails("xuanhuan");

    expect(result.titles).toContain("开局签到荒古圣体");
    expect(result.synopses.length).toBeGreaterThan(0);
  });

  it("returns empty arrays on API failure", async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      status: 500,
    } as Response);

    const source = new FanqieRadarSource();
    const result = await source.fetchBookDetails("xuanhuan");

    expect(result.titles).toEqual([]);
    expect(result.synopses).toEqual([]);
  });

  it("returns empty arrays on network error", async () => {
    fetchSpy.mockRejectedValue(new Error("network timeout"));

    const source = new FanqieRadarSource();
    const result = await source.fetchBookDetails("xuanhuan");

    expect(result.titles).toEqual([]);
  });

  it("handles missing abstract field gracefully", async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: {
            result: [
              { book_name: "测试书名", author: "作者", category: "玄幻" },
            ],
          },
        }),
    } as Response);

    const source = new FanqieRadarSource();
    const result = await source.fetchBookDetails("xuanhuan");

    expect(result.titles).toContain("测试书名");
    expect(result.synopses).toContain("");
  });

  it("deduplicates titles", async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: {
            result: [
              { book_name: "重复书名", author: "A", category: "玄幻", abstract: "简介1" },
              { book_name: "重复书名", author: "A", category: "都市", abstract: "简介2" },
            ],
          },
        }),
    } as Response);

    const source = new FanqieRadarSource();
    const result = await source.fetchBookDetails("xuanhuan");

    expect(result.titles.filter((t) => t === "重复书名")).toHaveLength(1);
  });
});
