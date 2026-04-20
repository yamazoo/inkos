import type { Page } from "@playwright/test";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { ChapterContent, UploadResult, SelectorBundle } from "../../models/upload.js";
import { SelectorBundleSchema } from "../../models/upload.js";
import type { PlatformAdapter } from "./base.js";

const LOGIN_URL = "https://fanqienovel.com/main/writer/book-manage";
const BOOK_MANAGE_URL = "https://fanqienovel.com/main/writer/book-manage";
const CHAPTER_EDITOR_URL = "https://fanqienovel.com/main/writer/chapter-edit";

interface TomatoConfig {
  minDelaySec?: number;
  maxDelaySec?: number;
  actionDelaySec?: number;
  successWaitSec?: number;
  maxRetries?: number;
  dailyCharLimit?: number;
  scheduleIntervalMinutes?: number;
  selectors?: SelectorBundle;
}

function parseChineseNumber(text: string): number {
  // Regex-based parse: scan left-to-right, each match is one (group, scale) pair.
  // - Group (digits + optional scale word) → value × scale
  // - "万" scales all accumulated pairs so far × 10000, then starts a new chain
  //
  // Chinese numerals have these scale units: 十=10, 百=100, 千=1000, 万=10000.
  // Each unit is a separate "layer" — "三百二十五" has two layers:
  //   三 (layer 100, value 3) + 二十五 (layer 10, value 25) = 325.
  //
  // Arabic digits (0-9) are treated as plain decimal numbers under the current scale.

  const DIGIT: Record<string, number> = {
    零: 0, 一: 1, 二: 2, 三: 3, 四: 4, 五: 5,
    六: 6, 七: 7, 八: 8, 九: 9, 两: 2, 〇: 0,
  };
  const SCALE_VAL: Record<string, number> = {
    十: 10, 百: 100, 千: 1000, 万: 10000,
  };

  function groupToInt(chars: string): number {
    return chars
      .split("")
      .filter((c) => DIGIT[c] !== undefined || (c >= "0" && c <= "9"))
      .reduce((acc, c) => acc * 10 + (DIGIT[c] ?? parseInt(c, 10)), 0);
  }

  let result = 0;
  let pending: Array<{ value: number; scale: number }> = [];

  // Scan: every (optional digit sequence)(scale word) is one layer
  // Regex captures: (digits)(scale_word) — scale word IS optional in last group
  const regex = /([零一二三四五六七八九十〇两0-9]+)([十百千万])?/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const raw = match[1];
    const scaleWord = match[2];

    if (!raw) continue;

    const value = groupToInt(raw);
    if (!scaleWord) {
      // No trailing scale word: this group uses scale=1
      pending.push({ value, scale: 1 });
    } else if (scaleWord === "万") {
      // 万: this group × 1, plus accumulate pending, then × 10000
      for (const { value: v, scale: s } of pending) {
        result += v * s;
      }
      result = (result + value) * 10000;
      pending = [];
    } else {
      // 十, 百, 千: this layer uses its scale, accumulated into pending
      pending.push({ value, scale: SCALE_VAL[scaleWord] });
    }
  }

  // Finalize all pending layers
  for (const { value: v, scale: s } of pending) {
    result += v * s;
  }

  return result;
}

export function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export class TomatoPlatformAdapter implements PlatformAdapter {
  readonly name = "tomato";
  readonly loginUrl = LOGIN_URL;
  readonly maxChaptersPerHour = 3;

  private readonly minDelaySec: number;
  private readonly maxDelaySec: number;
  private readonly actionDelaySec: number;
  private readonly successWaitSec: number;
  private readonly maxRetries: number;
  private readonly scheduleIntervalMinutes: number;
  private readonly selectors: SelectorBundle;
  private lastError = "";

  constructor(config: TomatoConfig = {}) {
    this.minDelaySec = config.minDelaySec ?? 15;
    this.maxDelaySec = config.maxDelaySec ?? 35;
    this.actionDelaySec = config.actionDelaySec ?? 0.9;
    this.successWaitSec = config.successWaitSec ?? 8;
    this.maxRetries = config.maxRetries ?? 2;
    this.scheduleIntervalMinutes = config.scheduleIntervalMinutes ?? 5;
    this.selectors = config.selectors ?? getDefaultSelectors();
  }

  deriveChapterNumber(title: string): string {
    const match = title.match(/第\s*([0-9零〇一二三四五六七八九十百千万两]+)\s*章/);
    if (!match) return "";
    const num = parseChineseNumber(match[1]);
    return String(num).padStart(3, "0");
  }

  async login(page: Page, _cookiesPath: string): Promise<void> {
    await page.goto(LOGIN_URL, { waitUntil: "domcontentloaded", timeout: 30_000 });
  }

  async isLoggedIn(page: Page): Promise<boolean> {
    try {
      await page.goto(LOGIN_URL, { waitUntil: "load", timeout: 15_000 });
      await page.waitForTimeout(2000);
      const url = page.url();
      if (
        url.includes("/login")
        || url.includes("/author/login")
        || url.includes("passport")
      ) {
        return false;
      }
      const selectors = [
        "text=作品管理",
        "text=我的作品",
        "text=作者中心",
        "text=创作者中心",
      ];
      for (const sel of selectors) {
        const visible = await page.locator(sel).first().isVisible({ timeout: 1000 }).catch(() => false);
        if (visible) return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async navigateToBookList(page: Page): Promise<void> {
    await page.goto(BOOK_MANAGE_URL, { waitUntil: "networkidle", timeout: 15_000 });
  }

  async navigateToChapterEditor(page: Page, _bookId: string): Promise<void> {
    await page.goto(CHAPTER_EDITOR_URL, { waitUntil: "networkidle", timeout: 15_000 });
  }

  async uploadChapter(page: Page, chapter: ChapterContent): Promise<UploadResult> {
    const screenshotDir = join(tmpdir(), "inkos-upload");
    const screenshotPath = join(screenshotDir, `tomato-ch-${chapter.number}-${Date.now()}.png`);

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        await this.navigateToChapterEditor(page, "");
        await page.waitForLoadState("networkidle");
        await this._waitForEditorReady(page);

        const chapterNo = this.deriveChapterNumber(chapter.title);

        if (chapterNo) {
          const ok = await this._setFieldValue(page, "chapter_no_selectors", chapterNo);
          if (!ok) {
            await this._maybeScreenshot(page, screenshotPath);
            return { success: false, error: `章节号填写失败: ${this.lastError}` };
          }
        }

        await this._actionDelay();

        const ok = await this._setFieldValue(page, "title_selectors", chapter.title);
        if (!ok) {
          await this._maybeScreenshot(page, screenshotPath);
          return { success: false, error: `标题填写失败: ${this.lastError}` };
        }

        await this._actionDelay();

        const ok2 = await this._setFieldValue(page, "content_selectors", chapter.content);
        if (!ok2) {
          await this._maybeScreenshot(page, screenshotPath);
          return { success: false, error: `正文填写失败: ${this.lastError}` };
        }

        await this._actionDelay();

        await this._clickNextStep(page);
        await this._actionDelay();

        await this._handleContinuePrompt(page);
        await this._actionDelay();

        await this._handleRiskConfirm(page);
        await this._actionDelay();

        await this._handleAiPrompt(page);
        await this._actionDelay();

        await this._handlePublishSetting(page);
        await this._actionDelay();

        const success = await this._waitForPublishFeedback(page);
        if (success) {
          return { success: true };
        }

        this.lastError = "未检测到发布成功反馈";
      } catch (err) {
        this.lastError = err instanceof Error ? err.message : String(err);
      }

      if (attempt < this.maxRetries) {
        await this._randomDelay();
      }
    }

    await this._maybeScreenshot(page, screenshotPath);
    return { success: false, error: this.lastError };
  }

  private async _waitForEditorReady(page: Page): Promise<void> {
    const selectors = this._splitSelectors(this.selectors.content_selectors);
    for (const sel of selectors) {
      try {
        await page.locator(sel).first().waitFor({ timeout: 8000 });
        return;
      } catch {
        // try next
      }
    }
    await page.waitForTimeout(2000);
  }

  private _splitSelectors(raw: string): string[] {
    return raw.split("||").map((s) => s.trim()).filter(Boolean);
  }

  private async _findVisibleLocator(
    page: Page,
    selectorKey: keyof SelectorBundle,
  ): Promise<{ locator: ReturnType<Page["locator"]>; found: boolean }> {
    const rawSelectors = this.selectors[selectorKey] as string;
    const selectors = this._splitSelectors(rawSelectors);

    for (const sel of selectors) {
      try {
        const locator = page.locator(sel).first();
        const visible = await locator.isVisible({ timeout: 2000 });
        if (visible) {
          return { locator, found: true };
        }
      } catch {
        // try next selector
      }
    }

    return { locator: page.locator("body"), found: false };
  }

  private async _setFieldValue(
    page: Page,
    selectorKey: keyof SelectorBundle,
    value: string,
  ): Promise<boolean> {
    const { locator, found } = await this._findVisibleLocator(page, selectorKey);

    if (!found) {
      this.lastError = `未找到控件: ${selectorKey}`;
      return false;
    }

    try {
      if (selectorKey === "content_selectors") {
        await locator.click({ clickCount: 3 });
        await this._actionDelay();
        await locator.fill(value);
      } else {
        await locator.fill(value);
      }
      return true;
    } catch (err) {
      this.lastError = err instanceof Error ? err.message : String(err);
      return false;
    }
  }

  private async _clickNextStep(page: Page): Promise<void> {
    const { locator, found } = await this._findVisibleLocator(page, "next_step_button_selectors");
    if (found) {
      // Button may not be present on all chapter types — non-presence is acceptable.
      await locator.click({ timeout: 5000 }).catch(() => {});
    }
  }

  private async _handleContinuePrompt(page: Page): Promise<void> {
    const keywords = ["继续", "去提交", "继续发布", "提交", "确定提交"];
    for (const kw of keywords) {
      try {
        const locator = page.locator(`button:has-text('${kw}')`).first();
        const visible = await locator.isVisible({ timeout: 500 });
        if (visible) {
          await locator.click({ timeout: 3000 });
          return;
        }
      } catch {
        // try next keyword
      }
    }
  }

  private async _handleRiskConfirm(page: Page): Promise<void> {
    const { locator, found } = await this._findVisibleLocator(page, "risk_confirm_selectors");
    if (found) {
      // Risk confirm dialog may not appear on every upload — non-presence is acceptable.
      await locator.click({ timeout: 3000 }).catch(() => {});
    }
  }

  private async _handleAiPrompt(page: Page): Promise<void> {
    const selectors = this._splitSelectors(this.selectors.ai_no_selectors);
    for (const sel of selectors) {
      try {
        const locator = page.locator(sel).first();
        const visible = await locator.isVisible({ timeout: 1000 });
        if (visible) {
          await locator.click({ timeout: 3000 });
          return;
        }
      } catch {
        // try next
      }
    }
  }

  private async _handlePublishSetting(page: Page): Promise<void> {
    const { locator, found } = await this._findVisibleLocator(page, "publish_button_selectors");
    if (found) {
      // Publish button may not be present in all flows — non-presence is acceptable.
      await locator.click({ timeout: 5000 }).catch(() => {});
    }
  }

  private async _waitForPublishFeedback(page: Page): Promise<boolean> {
    const keywords = this._splitSelectors(this.selectors.success_text_keywords);

    try {
      await page.waitForLoadState("networkidle");
    } catch {
      // Network state may not be reached; continue with timeout wait.
    }
    await page.waitForTimeout(this.successWaitSec * 1000);

    for (const keyword of keywords) {
      try {
        const visible = await page.locator(`text=${keyword}`).first().isVisible({ timeout: 3000 });
        if (visible) return true;
      } catch {
        // try next keyword
      }
    }

    const errorKeywords = this._splitSelectors(this.selectors.error_text_keywords);
    for (const kw of errorKeywords) {
      try {
        const visible = await page.locator(`text=${kw}`).first().isVisible({ timeout: 500 });
        if (visible) return false;
      } catch {
        // ignore
      }
    }

    return false;
  }

  private async _actionDelay(): Promise<void> {
    await new Promise((r) => setTimeout(r, this.actionDelaySec * 1000));
  }

  private async _randomDelay(): Promise<void> {
    const delaySec = randomBetween(this.minDelaySec, this.maxDelaySec);
    await new Promise((r) => setTimeout(r, delaySec * 1000));
  }

  private async _maybeScreenshot(page: Page, screenshotPath: string): Promise<void> {
    try {
      await page.screenshot({ path: screenshotPath });
    } catch (err) {
      console.error(`[upload] 截图保存失败 ${screenshotPath}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}

function getDefaultSelectors(): SelectorBundle {
  return SelectorBundleSchema.parse({
    chapter_no_selectors: "input[placeholder*='章']||input[aria-label*='章节']||input[type='number']",
    title_selectors: "input[placeholder*='章节']||input[placeholder*='标题']||textarea[placeholder*='标题']",
    content_selectors: "textarea[placeholder*='正文']||div[contenteditable='true']||.ProseMirror",
    publish_button_selectors: "button:has-text('发布')||button:has-text('提交')||button.ant-btn-primary",
    confirm_button_selectors: "button:has-text('确认发布')||button:has-text('确认')||button:has-text('确定')",
    next_step_button_selectors: "button:has-text('下一步')||button:has-text('继续')",
    risk_confirm_selectors: "button:has-text('确定')||button:has-text('确认')",
    publish_setting_confirm_selectors: "button:has-text('确认发布')||button:has-text('提交')||button:has-text('确认')",
    ai_no_selectors: "label:has-text('否')||[role='radio']:has-text('否')||span:has-text('否')||div:has-text('否')",
    schedule_toggle_selectors: "label:has-text('定时发布') [role='switch']||[role='switch']||button[role='switch']",
    schedule_date_selectors: "input[placeholder*='日期']||input[placeholder*='YYYY']||input[aria-label*='日期']",
    schedule_time_selectors: "input[placeholder*='时间']||input[placeholder*='HH']||input[aria-label*='时间']",
    create_chapter_selectors: "button:has-text('创建章节')||a:has-text('创建章节')||button:has-text('新建章节')||a:has-text('新建章节')",
    success_text_keywords: "发布成功||保存成功||提交成功||已保存到云端",
    error_text_keywords: "发布失败||请求过于频繁||操作过于频繁||异常||超过当日上限||5万字||当日字数",
  });
}