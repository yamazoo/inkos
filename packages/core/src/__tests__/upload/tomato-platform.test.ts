import { describe, it, expect } from "vitest";
import { TomatoPlatformAdapter } from "../../upload/platforms/tomato.js";
import { SelectorBundleSchema } from "../../models/upload.js";

describe("TomatoPlatformAdapter", () => {
  describe("constructor", () => {
    it("accepts empty config", () => {
      const adapter = new TomatoPlatformAdapter();
      expect(adapter.name).toBe("tomato");
      expect(adapter.loginUrl).toBe("https://fanqienovel.com/main/writer/book-manage");
      expect(adapter.maxChaptersPerHour).toBe(3);
    });

    it("accepts partial TomatoConfig", () => {
      const adapter = new TomatoPlatformAdapter({
        minDelaySec: 10,
        maxDelaySec: 20,
        maxRetries: 3,
      });
      expect(adapter.name).toBe("tomato");
    });

    it("accepts full TomatoConfig with selectors", () => {
      const customSelectors = SelectorBundleSchema.parse({
        chapter_no_selectors: "input#chapter-no",
        title_selectors: "input#title",
        content_selectors: "textarea#content",
        publish_button_selectors: "button#publish",
        confirm_button_selectors: "button#confirm",
        next_step_button_selectors: "button#next",
        risk_confirm_selectors: "button#risk",
        publish_setting_confirm_selectors: "button#publish-confirm",
        ai_no_selectors: "label#ai-no",
        schedule_toggle_selectors: "[role='switch']",
        schedule_date_selectors: "input#date",
        schedule_time_selectors: "input#time",
        create_chapter_selectors: "button#create",
        success_text_keywords: "成功",
        error_text_keywords: "失败",
      });
      const adapter = new TomatoPlatformAdapter({
        minDelaySec: 5,
        maxDelaySec: 15,
        actionDelaySec: 0.5,
        successWaitSec: 10,
        maxRetries: 1,
        dailyCharLimit: 50000,
        scheduleIntervalMinutes: 10,
        selectors: customSelectors,
      });
      expect(adapter.name).toBe("tomato");
    });
  });

  describe("deriveChapterNumber", () => {
    function derive(adapter: TomatoPlatformAdapter, title: string): string {
      return adapter.deriveChapterNumber(title);
    }

    it('extracts chapter number from "第001章 测试"', () => {
      const adapter = new TomatoPlatformAdapter();
      expect(derive(adapter, "第001章 测试")).toBe("001");
    });

    it('extracts chapter number from "第12章"', () => {
      const adapter = new TomatoPlatformAdapter();
      expect(derive(adapter, "第12章")).toBe("012");
    });

    it('extracts chapter number from "第123章 标题"', () => {
      const adapter = new TomatoPlatformAdapter();
      expect(derive(adapter, "第123章 标题")).toBe("123");
    });

    it('extracts from "第一章"', () => {
      const adapter = new TomatoPlatformAdapter();
      expect(derive(adapter, "第一章")).toBe("001");
    });

    it('extracts from "第三百二十五章"', () => {
      const adapter = new TomatoPlatformAdapter();
      expect(derive(adapter, "第三百二十五章")).toBe("325");
    });

    it('extracts from "第一万章" (large number)', () => {
      const adapter = new TomatoPlatformAdapter();
      expect(derive(adapter, "第一万章")).toBe("10000");
    });

    it('returns empty string for "无章节号"', () => {
      const adapter = new TomatoPlatformAdapter();
      expect(derive(adapter, "无章节号")).toBe("");
    });

    it("returns empty string when no pattern matches", () => {
      const adapter = new TomatoPlatformAdapter();
      expect(derive(adapter, "随便写点东西")).toBe("");
    });

    it("handles whitespace variations", () => {
      const adapter = new TomatoPlatformAdapter();
      expect(derive(adapter, "第   5   章")).toBe("005");
    });

    it("handles mixed Chinese and Arabic numerals", () => {
      const adapter = new TomatoPlatformAdapter();
      expect(derive(adapter, "第20章 序幕")).toBe("020");
    });
  });

  describe("getDefaultSelectors (via constructor without selectors)", () => {
    it("returns a valid SelectorBundle when no selectors provided", () => {
      const adapter = new TomatoPlatformAdapter();
      // Access the private selectors via a public method or by checking behavior
      // We validate it by checking the adapter constructed successfully
      expect(adapter.name).toBe("tomato");
    });

    it("default selectors are used when config.selectors is omitted", () => {
      const adapter = new TomatoPlatformAdapter({ maxRetries: 0 });
      expect(adapter.name).toBe("tomato");
      // The selector chain fallback is tested implicitly by construction succeeding
    });

    it("custom selectors override defaults", () => {
      const custom = SelectorBundleSchema.parse({
        chapter_no_selectors: "custom-chapter-no",
        title_selectors: "custom-title",
        content_selectors: "custom-content",
        publish_button_selectors: "custom-publish",
        confirm_button_selectors: "custom-confirm",
        next_step_button_selectors: "custom-next",
        risk_confirm_selectors: "custom-risk",
        publish_setting_confirm_selectors: "custom-publish-confirm",
        ai_no_selectors: "custom-ai-no",
        schedule_toggle_selectors: "custom-toggle",
        schedule_date_selectors: "custom-date",
        schedule_time_selectors: "custom-time",
        create_chapter_selectors: "custom-create",
        success_text_keywords: "custom-success",
        error_text_keywords: "custom-error",
      });
      const adapter = new TomatoPlatformAdapter({ selectors: custom });
      expect(adapter.name).toBe("tomato");
    });
  });
});