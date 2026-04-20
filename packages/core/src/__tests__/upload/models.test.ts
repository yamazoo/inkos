import { describe, it, expect } from "vitest";
import {
  SelectorBundleSchema,
  UploadStateSchema,
  UploadChapterStatusSchema,
} from "../../models/upload.js";

describe("SelectorBundleSchema", () => {
  it("接受有效的完整 bundle", () => {
    const bundle = {
      chapter_no_selectors: "input[placeholder*='章']",
      title_selectors: "input[placeholder*='标题']",
      content_selectors: "textarea",
      publish_button_selectors: "button:has-text('发布')",
      confirm_button_selectors: "button:has-text('确认')",
      next_step_button_selectors: "button:has-text('下一步')",
      risk_confirm_selectors: "button:has-text('确定')",
      publish_setting_confirm_selectors: "button:has-text('确认发布')",
      ai_no_selectors: "label:has-text('否')",
      schedule_toggle_selectors: "[role='switch']",
      schedule_date_selectors: "input[placeholder*='日期']",
      schedule_time_selectors: "input[placeholder*='时间']",
      create_chapter_selectors: "button:has-text('创建章节')",
      success_text_keywords: "发布成功",
      error_text_keywords: "发布失败",
    };
    const result = SelectorBundleSchema.parse(bundle);
    expect(result.chapter_no_selectors).toBe("input[placeholder*='章']");
    expect(result.schedule_toggle_selectors).toBe("[role='switch']");
  });

  it("缺少必填字段时报错", () => {
    const bundle = {
      chapter_no_selectors: "input",
      // 缺少其他字段
    };
    expect(() => SelectorBundleSchema.parse(bundle)).toThrow();
  });
});

describe("UploadStateSchema", () => {
  it("接受最小有效 state", () => {
    const state = {
      platform: "tomato",
      maxChaptersPerHour: 3,
      chapters: {},
    };
    const result = UploadStateSchema.parse(state);
    expect(result.platform).toBe("tomato");
    expect(result.dailyRemainingChars).toBeUndefined();
  });

  it("支持 dailyRemainingChars 和 dailyScheduleSlots", () => {
    const state = {
      platform: "tomato",
      maxChaptersPerHour: 3,
      chapters: {},
      dailyRemainingChars: { "2026-04-20": 32000 },
      dailyScheduleSlots: { "2026-04-21": 5 },
    };
    const result = UploadStateSchema.parse(state);
    expect(result.dailyRemainingChars).toEqual({ "2026-04-20": 32000 });
    expect(result.dailyScheduleSlots).toEqual({ "2026-04-21": 5 });
  });

  it("支持 calibratedSelectors", () => {
    const bundle = {
      chapter_no_selectors: "input",
      title_selectors: "input",
      content_selectors: "textarea",
      publish_button_selectors: "button",
      confirm_button_selectors: "button",
      next_step_button_selectors: "button",
      risk_confirm_selectors: "button",
      publish_setting_confirm_selectors: "button",
      ai_no_selectors: "label",
      schedule_toggle_selectors: "[role='switch']",
      schedule_date_selectors: "input",
      schedule_time_selectors: "input",
      create_chapter_selectors: "button",
      success_text_keywords: "成功",
      error_text_keywords: "失败",
    };
    const state = {
      platform: "tomato",
      maxChaptersPerHour: 3,
      chapters: {},
      calibratedSelectors: bundle,
    };
    const result = UploadStateSchema.parse(state);
    expect(result.calibratedSelectors?.chapter_no_selectors).toBe("input");
  });
});
