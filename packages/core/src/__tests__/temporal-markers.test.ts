import { describe, it, expect } from "vitest";
import {
  extractTemporalMarkers,
  formatTemporalMarkerBlock,
} from "../utils/temporal-markers.js";

describe("extractTemporalMarkers", () => {
  it("returns empty for short or empty text", () => {
    expect(extractTemporalMarkers("")).toEqual([]);
    expect(extractTemporalMarkers("短")).toEqual([]);
  });

  it("extracts numeric relative time markers (Chinese numerals)", () => {
    const text = "三天前他离开了那个地方，两天后又回到了这里开始新的生活。";
    const markers = extractTemporalMarkers(text);
    expect(markers.length).toBeGreaterThanOrEqual(2);
    const past = markers.find((m) => m.raw === "三天前");
    expect(past).toBeDefined();
    expect(past!.numericValue).toBe(-3);
    expect(past!.direction).toBe("past");
    const future = markers.find((m) => m.raw === "两天后");
    expect(future).toBeDefined();
    expect(future!.numericValue).toBe(2);
    expect(future!.direction).toBe("future");
  });

  it("extracts numeric relative time markers (Arabic digits)", () => {
    const text = "3天前他离开了那个地方，2天后又回到了这里开始新的生活。";
    const markers = extractTemporalMarkers(text);
    expect(markers.length).toBeGreaterThanOrEqual(2);
    const past = markers.find((m) => m.raw === "3天前");
    expect(past).toBeDefined();
    expect(past!.numericValue).toBe(-3);
    expect(past!.direction).toBe("past");
    const future = markers.find((m) => m.raw === "2天后");
    expect(future).toBeDefined();
    expect(future!.numericValue).toBe(2);
    expect(future!.direction).toBe("future");
  });

  it("extracts countdown markers (还剩/还有)", () => {
    const text = "距离大比还有三天的时间准备，他必须抓紧修炼才行啊。";
    const markers = extractTemporalMarkers(text);
    const countdown = markers.find((m) => m.raw.includes("还有"));
    expect(countdown).toBeDefined();
    expect(countdown!.numericValue).toBe(3);
    expect(countdown!.direction).toBe("future");
  });

  it("extracts fixed relative terms", () => {
    const text = "昨天他去了集市，今天回到家中，明天还要再去一趟购买药材。";
    const markers = extractTemporalMarkers(text);
    expect(markers.length).toBeGreaterThanOrEqual(3);
    expect(markers.find((m) => m.raw === "昨天")?.numericValue).toBe(-1);
    expect(markers.find((m) => m.raw === "今天")?.numericValue).toBe(0);
    expect(markers.find((m) => m.raw === "明天")?.numericValue).toBe(1);
  });

  it("extracts Chinese numeral relative markers", () => {
    const text = "五天前的那场战斗改变了所有人的命运，三天后大家才明白过来。";
    const markers = extractTemporalMarkers(text);
    expect(markers.length).toBeGreaterThanOrEqual(2);
    expect(markers.find((m) => m.raw === "五天前")?.numericValue).toBe(-5);
    expect(markers.find((m) => m.raw === "三天后")?.numericValue).toBe(3);
  });

  it("normalizes months and years to days", () => {
    const text = "三个月前他来到此地，一年后才终于找到了回去的道路和方向。";
    const markers = extractTemporalMarkers(text);
    const months = markers.find((m) => m.raw === "三个月前");
    expect(months?.numericValue).toBe(-90);
    const years = markers.find((m) => m.raw === "一年后");
    expect(years?.numericValue).toBe(365);
  });

  it("caps at 10 markers", () => {
    const text = "一天前两天前三天前四天前五天前六天前七天前八天前九天前十天前十一天前十二天前。";
    const markers = extractTemporalMarkers(text);
    expect(markers.length).toBeLessThanOrEqual(10);
  });

  it("deduplicates identical raw strings", () => {
    const text = "三天前的事，三天前的人都还记得三天前的那个夜晚和故事。";
    const markers = extractTemporalMarkers(text);
    const threeDays = markers.filter((m) => m.raw === "三天前");
    expect(threeDays).toHaveLength(1);
  });

  it("provides context snippets", () => {
    const text = "他在五天前的那场大战中负了重伤，至今仍未痊愈令人担忧。";
    const markers = extractTemporalMarkers(text);
    const marker = markers.find((m) => m.raw === "五天前");
    expect(marker?.context).toContain("五天前");
    expect(marker?.context.length).toBeLessThanOrEqual(30);
  });
});

describe("formatTemporalMarkerBlock", () => {
  it("returns empty string when both arrays are empty", () => {
    expect(formatTemporalMarkerBlock([], [])).toBe("");
  });

  it("formats a comparison block in Chinese", () => {
    const current = extractTemporalMarkers("还有三天就到大比了，他必须加速修炼。");
    const previous = extractTemporalMarkers("还有五天就到大比了，他心中暗自着急。");
    const block = formatTemporalMarkerBlock(current, previous, "zh");
    expect(block).toContain("## 时间标记比对");
    expect(block).toContain("前章");
    expect(block).toContain("当前章");
  });

  it("formats a comparison block in English", () => {
    const current = [{ raw: "还有三天", numericValue: 3, direction: "future" as const, context: "..." }];
    const previous = [{ raw: "还有五天", numericValue: 5, direction: "future" as const, context: "..." }];
    const block = formatTemporalMarkerBlock(current, previous, "en");
    expect(block).toContain("## Temporal Markers");
    expect(block).toContain("Prev");
    expect(block).toContain("Curr");
  });

  it("caps output at 200 characters", () => {
    const manyMarkers = Array.from({ length: 10 }, (_, i) => ({
      raw: `还有${i + 1}天`,
      numericValue: i + 1,
      direction: "future" as const,
      context: "...",
    }));
    const block = formatTemporalMarkerBlock(manyMarkers, manyMarkers);
    expect(block.length).toBeLessThanOrEqual(200);
  });
});
