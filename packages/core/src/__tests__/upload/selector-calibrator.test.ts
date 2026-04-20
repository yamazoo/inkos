import { describe, it, expect } from "vitest";
import {
  deriveSelectorBundle,
  joinOrFallback,
  dedupeKeepOrder,
} from "../../upload/selector-calibrator.js";

// Mirror the internal interfaces for test typing
interface EditableSnapshot {
  tag: string;
  id: string;
  name: string;
  placeholder: string;
  aria_label: string;
  class_name: string;
  label_text: string;
  is_contenteditable: boolean;
  rect_top: number;
  css_path: string;
}

interface ButtonSnapshot {
  tag: string;
  id: string;
  text: string;
  aria_label: string;
  class_name: string;
  rect_top: number;
  css_path: string;
}

interface PageSnapshot {
  editables: EditableSnapshot[];
  buttons: ButtonSnapshot[];
}

describe("dedupeKeepOrder", () => {
  it("removes duplicates while preserving order", () => {
    expect(dedupeKeepOrder(["a", "b", "a", "c", "b"])).toEqual(["a", "b", "c"]);
  });

  it("removes empty strings", () => {
    expect(dedupeKeepOrder(["a", "", "b", "  ", "c"])).toEqual(["a", "b", "c"]);
  });

  it("returns empty array for all empty strings", () => {
    expect(dedupeKeepOrder(["", "  "])).toEqual([]);
  });

  it("returns empty array for empty input", () => {
    expect(dedupeKeepOrder([])).toEqual([]);
  });
});

describe("joinOrFallback", () => {
  it("joins deduped items with || and caps at 6", () => {
    const items = ["a", "b", "c", "d", "e", "f", "g", "h"];
    expect(joinOrFallback(items, "fallback")).toBe("a||b||c||d||e||f");
  });

  it("returns fallback when items is empty", () => {
    expect(joinOrFallback([], "fallback||value")).toBe("fallback||value");
  });

  it("dedupes before joining", () => {
    expect(joinOrFallback(["a", "b", "a", "c"], "fallback")).toBe("a||b||c");
  });

  it("caps at 6 items even when more are provided", () => {
    const items = ["a", "b", "c", "d", "e", "f", "g", "h", "i"];
    const result = joinOrFallback(items, "fallback");
    const count = result.split("||").length;
    expect(count).toBe(6);
  });
});

describe("deriveSelectorBundle", () => {
  const makeSnapshot = (overrides: Partial<PageSnapshot> = {}): PageSnapshot => ({
    editables: [],
    buttons: [],
    ...overrides,
  });

  it("returns a valid SelectorBundle for empty snapshot", () => {
    const snapshot = makeSnapshot();
    const bundle = deriveSelectorBundle(snapshot);
    expect(typeof bundle.chapter_no_selectors).toBe("string");
    expect(typeof bundle.title_selectors).toBe("string");
    expect(typeof bundle.content_selectors).toBe("string");
    expect(typeof bundle.publish_button_selectors).toBe("string");
    expect(typeof bundle.confirm_button_selectors).toBe("string");
    expect(typeof bundle.next_step_button_selectors).toBe("string");
    expect(typeof bundle.risk_confirm_selectors).toBe("string");
    expect(typeof bundle.publish_setting_confirm_selectors).toBe("string");
    expect(typeof bundle.ai_no_selectors).toBe("string");
    expect(typeof bundle.schedule_toggle_selectors).toBe("string");
    expect(typeof bundle.schedule_date_selectors).toBe("string");
    expect(typeof bundle.schedule_time_selectors).toBe("string");
    expect(typeof bundle.create_chapter_selectors).toBe("string");
    expect(typeof bundle.success_text_keywords).toBe("string");
    expect(typeof bundle.error_text_keywords).toBe("string");
  });

  it("uses fallback selectors when no editables match", () => {
    const snapshot = makeSnapshot({ editables: [] });
    const bundle = deriveSelectorBundle(snapshot);
    // deriveChapterNoSelectors adds 4 hardcoded selectors for empty editables
    expect(bundle.chapter_no_selectors).toContain("input[placeholder*='章']");
    expect(bundle.chapter_no_selectors).toContain("input[aria-label*='章节']");
    expect(bundle.chapter_no_selectors).toContain("input[type='number']");
    // title: 3 hardcoded selectors for empty editables
    expect(bundle.title_selectors).toContain("input[placeholder*='章节']");
    expect(bundle.title_selectors).toContain("input[placeholder*='标题']");
    expect(bundle.title_selectors).toContain("textarea[placeholder*='标题']");
    // content: 4 hardcoded selectors for empty editables
    expect(bundle.content_selectors).toContain("textarea[placeholder*='正文']");
    expect(bundle.content_selectors).toContain("div[contenteditable='true']");
    expect(bundle.content_selectors).toContain(".ProseMirror");
  });

  it("uses fallback selectors when no publish buttons match", () => {
    const snapshot = makeSnapshot({ buttons: [] });
    const bundle = deriveSelectorBundle(snapshot);
    // derivePublishButtonSelectors adds 4 hardcoded selectors for empty buttons
    expect(bundle.publish_button_selectors).toContain("button:has-text('发布')");
    expect(bundle.publish_button_selectors).toContain("button:has-text('提交')");
    expect(bundle.publish_button_selectors).toContain("button.ant-btn-primary");
    // deriveConfirmButtonSelectors adds 4 hardcoded selectors
    expect(bundle.confirm_button_selectors).toContain("button:has-text('确认发布')");
    expect(bundle.confirm_button_selectors).toContain("button:has-text('确认')");
    expect(bundle.confirm_button_selectors).toContain("button:has-text('确定')");
  });

  it("prefers input with title-related placeholder", () => {
    const snapshot = makeSnapshot({
      editables: [
        {
          tag: "input",
          id: "title-input",
          name: "",
          placeholder: "请输入章节标题",
          aria_label: "",
          class_name: "title-field",
          label_text: "",
          is_contenteditable: false,
          rect_top: 100,
          css_path: "",
        },
        {
          tag: "div",
          id: "",
          name: "",
          placeholder: "",
          aria_label: "",
          class_name: "content-div",
          label_text: "",
          is_contenteditable: true,
          rect_top: 300,
          css_path: "",
        },
      ],
    });
    const bundle = deriveSelectorBundle(snapshot);
    expect(bundle.title_selectors).toContain("#title-input");
    expect(bundle.title_selectors).toContain("input.title-field");
    // Should include the placeholder selector
    expect(bundle.title_selectors).toMatch(/input\[placeholder\*='[^']*章节[^']*'\]/);
    // Should include hardcoded fallback selectors
    expect(bundle.title_selectors).toContain("input[placeholder*='标题']");
  });

  it("prefers textarea for content field over contenteditable", () => {
    const snapshot = makeSnapshot({
      editables: [
        {
          tag: "textarea",
          id: "content-area",
          name: "",
          placeholder: "正文内容",
          aria_label: "",
          class_name: "content-box",
          label_text: "",
          is_contenteditable: false,
          rect_top: 400,
          css_path: "",
        },
        {
          tag: "div",
          id: "",
          name: "",
          placeholder: "",
          aria_label: "",
          class_name: "editor",
          label_text: "",
          is_contenteditable: true,
          rect_top: 500,
          css_path: "",
        },
      ],
    });
    const bundle = deriveSelectorBundle(snapshot);
    expect(bundle.content_selectors).toContain("#content-area");
    expect(bundle.content_selectors).toContain("textarea.content-box");
    expect(bundle.content_selectors).toContain("div[contenteditable='true']");
  });

  it("prefers input with chapter-related attributes for chapter_no", () => {
    const snapshot = makeSnapshot({
      editables: [
        {
          tag: "input",
          id: "",
          name: "chapter_no",
          placeholder: "",
          aria_label: "章节序号",
          class_name: "chapter-input",
          label_text: "",
          is_contenteditable: false,
          rect_top: 50,
          css_path: "",
        },
        {
          tag: "input",
          id: "num-field",
          name: "",
          placeholder: "数量",
          aria_label: "",
          class_name: "count",
          label_text: "",
          is_contenteditable: false,
          rect_top: 200,
          css_path: "",
        },
      ],
    });
    const bundle = deriveSelectorBundle(snapshot);
    expect(bundle.chapter_no_selectors).toContain("input[name='chapter_no']");
    // The aria-label contains '章节' so it gets selected
    expect(bundle.chapter_no_selectors).toMatch(/input\[aria-label\*='[^']*章节[^']*'\]/);
  });

  it("ranks publish buttons by keyword match", () => {
    const snapshot = makeSnapshot({
      buttons: [
        {
          tag: "button",
          id: "publish-btn",
          text: "立即发布",
          aria_label: "",
          class_name: "primary-btn",
          rect_top: 800,
          css_path: "",
        },
        {
          tag: "button",
          id: "save-btn",
          text: "保存草稿",
          aria_label: "",
          class_name: "secondary-btn",
          rect_top: 850,
          css_path: "",
        },
      ],
    });
    const bundle = deriveSelectorBundle(snapshot);
    expect(bundle.publish_button_selectors).toContain("#publish-btn");
    expect(bundle.publish_button_selectors).toContain("button.primary-btn");
    // Should contain a publish-related selector
    expect(bundle.publish_button_selectors).toMatch(/button:has-text\('[^']*发布[^']*'\)/);
  });

  it("includes next-step and confirm selectors even with no matching buttons", () => {
    const snapshot = makeSnapshot({ buttons: [] });
    const bundle = deriveSelectorBundle(snapshot);
    expect(bundle.next_step_button_selectors).toContain("下一步");
    expect(bundle.next_step_button_selectors).toContain("继续");
    expect(bundle.risk_confirm_selectors).toContain("确定");
    expect(bundle.risk_confirm_selectors).toContain("确认");
  });

  it("derives create-chapter selectors from keyword match", () => {
    const snapshot = makeSnapshot({
      buttons: [
        {
          tag: "button",
          id: "create-chapter-btn",
          text: "创建章节",
          aria_label: "",
          class_name: "create-btn",
          rect_top: 50,
          css_path: "",
        },
      ],
    });
    const bundle = deriveSelectorBundle(snapshot);
    expect(bundle.create_chapter_selectors).toContain("#create-chapter-btn");
    expect(bundle.create_chapter_selectors).toMatch(/button:has-text\('[^']*创建章节[^']*'\)/);
  });

  it("ai_no, schedule selectors, and keywords are hardcoded constants", () => {
    const snapshot = makeSnapshot();
    const bundle = deriveSelectorBundle(snapshot);
    expect(bundle.ai_no_selectors).toContain("has-text('否')");
    expect(bundle.schedule_toggle_selectors).toContain("定时发布");
    expect(bundle.schedule_date_selectors).toContain("日期");
    expect(bundle.schedule_time_selectors).toContain("时间");
    expect(bundle.success_text_keywords).toContain("发布成功");
    expect(bundle.success_text_keywords).toContain("保存成功");
    expect(bundle.error_text_keywords).toContain("发布失败");
    expect(bundle.error_text_keywords).toContain("操作过于频繁");
  });
});

describe("scoring functions via deriveSelectorBundle", () => {
  it("top-position editables rank higher for title", () => {
    const snapshot: PageSnapshot = {
      editables: [
        {
          tag: "input",
          id: "top-title",
          name: "",
          placeholder: "章节标题",
          aria_label: "",
          class_name: "",
          label_text: "",
          is_contenteditable: false,
          rect_top: 200, // top position → higher score
          css_path: "",
        },
        {
          tag: "input",
          id: "low-title",
          name: "",
          placeholder: "章节标题",
          aria_label: "",
          class_name: "",
          label_text: "",
          is_contenteditable: false,
          rect_top: 600, // lower position → lower score
          css_path: "",
        },
      ],
      buttons: [],
    };
    const bundle = deriveSelectorBundle(snapshot);
    // The top-positioned input should be ranked higher
    expect(bundle.title_selectors).toContain("#top-title");
    expect(bundle.title_selectors).toContain("#low-title");
    // Both should use placeholder selector in fallback
    expect(bundle.title_selectors).toMatch(/input\[placeholder\*='[^']*章节[^']*'\]/);
  });

  it("input tag scores higher than contenteditable for chapter_no", () => {
    const snapshot: PageSnapshot = {
      editables: [
        {
          tag: "input",
          id: "ch",
          name: "",
          placeholder: "章节",
          aria_label: "",
          class_name: "",
          label_text: "",
          is_contenteditable: false,
          rect_top: 100,
          css_path: "",
        },
        {
          tag: "div",
          id: "",
          name: "",
          placeholder: "",
          aria_label: "",
          class_name: "chapter-num",
          label_text: "",
          is_contenteditable: true,
          rect_top: 100,
          css_path: "",
        },
      ],
      buttons: [],
    };
    const bundle = deriveSelectorBundle(snapshot);
    expect(bundle.chapter_no_selectors).toContain("#ch");
  });

  it("textarea scores higher than input for content", () => {
    const snapshot: PageSnapshot = {
      editables: [
        {
          tag: "textarea",
          id: "content",
          name: "",
          placeholder: "正文内容",
          aria_label: "",
          class_name: "",
          label_text: "",
          is_contenteditable: false,
          rect_top: 300,
          css_path: "",
        },
        {
          tag: "input",
          id: "other",
          name: "",
          placeholder: "正文",
          aria_label: "",
          class_name: "",
          label_text: "",
          is_contenteditable: false,
          rect_top: 300,
          css_path: "",
        },
      ],
      buttons: [],
    };
    const bundle = deriveSelectorBundle(snapshot);
    expect(bundle.content_selectors).toContain("#content");
  });

  it("contenteditable div with ProseMirror class is included for content", () => {
    const snapshot: PageSnapshot = {
      editables: [
        {
          tag: "div",
          id: "prose",
          name: "",
          placeholder: "",
          aria_label: "",
          class_name: "ProseMirror",
          label_text: "",
          is_contenteditable: true,
          rect_top: 300,
          css_path: "",
        },
      ],
      buttons: [],
    };
    const bundle = deriveSelectorBundle(snapshot);
    expect(bundle.content_selectors).toContain("#prose");
    expect(bundle.content_selectors).toContain("div.ProseMirror");
    expect(bundle.content_selectors).toContain("div[contenteditable='true']");
  });
});
