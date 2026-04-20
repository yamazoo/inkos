// DOM globals injected by Playwright into the browser context of page.evaluate()
declare const window: Window & typeof globalThis;
declare const document: Document;
interface Element {
  tagName: string;
  id: string;
  className: string;
  getBoundingClientRect(): DOMRect;
  getAttribute(name: string): string | null;
  isContentEditable: boolean;
  nodeType: number;
  textContent: string | null;
  closest(selector: string): Element | null;
  parentElement: Element | null;
  children: HTMLCollectionOf<Element>;
}
interface HTMLElement extends Element {
  className: string;
}
interface HTMLInputElement extends HTMLElement {
  name: string;
  placeholder: string;
}
interface Document {
  querySelector(selector: string): Element | null;
  querySelectorAll(selector: string): NodeListOf<Element>;
}
interface Window {
  getComputedStyle(el: Element): CSSStyleDeclaration;
}
interface DOMRect {
  width: number;
  height: number;
  top: number;
}
interface CSSStyleDeclaration {
  visibility: string;
  display: string;
}
interface NodeListOf<T> {
  length: number;
  [index: number]: T;
  [Symbol.iterator](): Iterator<T>;
}
interface HTMLCollectionOf<T> {
  length: number;
  [index: number]: T;
  [Symbol.iterator](): Iterator<T>;
}
import type { Page } from "@playwright/test";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";
import { existsSync } from "node:fs";
import { chromium } from "@playwright/test";
import type { SelectorBundle } from "../models/upload.js";
import { SelectorBundleSchema } from "../models/upload.js";

export const SELECTOR_TEMPLATE_DIR = join(homedir(), ".inkos", "cookies", "tomato");

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

// ─── Internal helpers ──────────────────────────────────────────────────────────

function escapeForSelector(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function extractFirstCssClass(rawClass: string): string {
  for (const token of rawClass.split(/\s+/)) {
    if (/^[A-Za-z_][A-Za-z0-9_\-]*$/.test(token)) {
      return token;
    }
  }
  return "";
}

export function dedupeKeepOrder(items: string[]): string[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const trimmed = item.trim();
    if (!trimmed || seen.has(trimmed)) return false;
    seen.add(trimmed);
    return true;
  });
}

export function joinOrFallback(items: string[], fallback: string): string {
  const deduped = dedupeKeepOrder(items);
  if (deduped.length > 0) {
    return deduped.slice(0, 6).join("||");
  }
  return fallback;
}

function containsWeight(text: string, keywords: string[]): number {
  let score = 0;
  for (const kw of keywords) {
    if (kw && text.includes(kw.toLowerCase())) score += 8;
  }
  return score;
}

function topPositionBonus(rectTop: number): number {
  if (rectTop < 280) return 5;
  if (rectTop < 520) return 2;
  return 0;
}

function normalizedHint(item: EditableSnapshot): string {
  return [item.placeholder, item.name, item.aria_label, item.label_text, item.class_name, item.id]
    .map((s) => (s || "").toLowerCase())
    .join(" ");
}

function normalizedButtonText(item: ButtonSnapshot): string {
  return [item.text, item.aria_label, item.class_name, item.id]
    .map((s) => (s || "").toLowerCase())
    .join(" ");
}

// ─── Scoring functions ─────────────────────────────────────────────────────────

function titleScore(item: EditableSnapshot): number {
  const hint = normalizedHint(item);
  let score = containsWeight(hint, ["标题", "章节", "章名", "title", "chapter"]);
  if (item.tag === "input") score += 8;
  if (item.tag === "textarea") score += 3;
  if (item.is_contenteditable) score -= 6;
  score += topPositionBonus(item.rect_top);
  return score;
}

function chapterNoScore(item: EditableSnapshot): number {
  const hint = normalizedHint(item);
  let score = containsWeight(hint, ["章", "章节", "chapter", "number"]);
  if (item.tag === "input") score += 8;
  if (item.tag === "textarea") score -= 3;
  if (item.is_contenteditable) score -= 5;
  score += topPositionBonus(item.rect_top);
  return score;
}

function contentScore(item: EditableSnapshot): number {
  const hint = normalizedHint(item);
  let score = containsWeight(hint, ["正文", "内容", "文章", "content", "article"]);
  if (item.tag === "textarea") score += 10;
  if (item.is_contenteditable) score += 8;
  if (item.tag === "input") score -= 5;
  score += topPositionBonus(item.rect_top);
  return score;
}

function publishButtonScore(item: ButtonSnapshot): number {
  const text = normalizedButtonText(item);
  let score = containsWeight(text, ["发布", "提交", "保存并发布", "publish", "submit"]);
  if (item.tag === "button") score += 2;
  score += topPositionBonus(item.rect_top);
  return score;
}

function confirmButtonScore(item: ButtonSnapshot): number {
  const text = normalizedButtonText(item);
  let score = containsWeight(text, ["确认", "确定", "继续发布", "继续", "confirm"]);
  if (item.tag === "button") score += 2;
  score += topPositionBonus(item.rect_top);
  return score;
}

// ─── Selector builders ─────────────────────────────────────────────────────────

function buildEditableSelectors(item: EditableSnapshot): string[] {
  const selectors: string[] = [];
  const tag = item.tag || "input";

  if (item.id && /^[A-Za-z_][A-Za-z0-9_\-]*$/.test(item.id)) {
    selectors.push(`#${item.id}`);
  }
  if (item.name && tag === "input") {
    selectors.push(`${tag}[name='${escapeForSelector(item.name)}']`);
  }
  if (item.placeholder && (tag === "input" || tag === "textarea")) {
    selectors.push(`${tag}[placeholder*='${escapeForSelector(item.placeholder.slice(0, 14))}']`);
  }
  if (item.aria_label && (tag === "input" || tag === "textarea")) {
    selectors.push(`${tag}[aria-label*='${escapeForSelector(item.aria_label.slice(0, 14))}']`);
  }
  if (item.is_contenteditable) {
    selectors.push("div[contenteditable='true']");
  }
  if (item.css_path) selectors.push(item.css_path);
  const cls = extractFirstCssClass(item.class_name);
  if (cls) selectors.push(`${tag}.${cls}`);
  return selectors;
}

function buildButtonSelectors(item: ButtonSnapshot): string[] {
  const selectors: string[] = [];
  const tag = item.tag || "button";

  if (item.id && /^[A-Za-z_][A-Za-z0-9_\-]*$/.test(item.id)) {
    selectors.push(`#${item.id}`);
  }
  if (item.text) {
    const short = escapeForSelector(item.text.slice(0, 20));
    selectors.push(`button:has-text('${short}')`);
    if (tag !== "button") {
      selectors.push(`${tag}:has-text('${short}')`);
      selectors.push(`[role='button']:has-text('${short}')`);
    }
  }
  if (item.css_path) selectors.push(item.css_path);
  const cls = extractFirstCssClass(item.class_name);
  if (cls) selectors.push(`button.${cls}`);
  return selectors;
}

function deriveButtonByKeywords(buttons: ButtonSnapshot[], keywords: string[]): string[] {
  const output: string[] = [];
  for (const item of buttons) {
    const text = normalizedButtonText(item);
    if (keywords.some((kw) => kw && text.includes(kw.toLowerCase()))) {
      output.push(...buildButtonSelectors(item));
    }
  }
  return output;
}

function deriveTitleSelectors(editables: EditableSnapshot[]): string[] {
  const ranked = [...editables].sort((a, b) => titleScore(b) - titleScore(a));
  const output: string[] = [];
  for (const item of ranked.slice(0, 6)) {
    output.push(...buildEditableSelectors(item));
  }
  output.push("input[placeholder*='标题']", "input[placeholder*='章节']", "textarea[placeholder*='标题']");
  return output;
}

function deriveChapterNoSelectors(editables: EditableSnapshot[]): string[] {
  const ranked = [...editables].sort((a, b) => chapterNoScore(b) - chapterNoScore(a));
  const output: string[] = [];
  for (const item of ranked.slice(0, 6)) {
    output.push(...buildEditableSelectors(item));
  }
  output.push("input[placeholder*='章']", "input[placeholder*='章节']", "input[aria-label*='章节']", "input[type='number']");
  return output;
}

function deriveContentSelectors(editables: EditableSnapshot[]): string[] {
  const ranked = [...editables].sort((a, b) => contentScore(b) - contentScore(a));
  const output: string[] = [];
  for (const item of ranked.slice(0, 6)) {
    output.push(...buildEditableSelectors(item));
  }
  output.push("textarea[placeholder*='正文']", "textarea[placeholder*='内容']", "div[contenteditable='true']", ".ProseMirror");
  return output;
}

function derivePublishButtonSelectors(buttons: ButtonSnapshot[]): string[] {
  const ranked = [...buttons].sort((a, b) => publishButtonScore(b) - publishButtonScore(a));
  const output: string[] = [];
  for (const item of ranked.slice(0, 8)) {
    output.push(...buildButtonSelectors(item));
  }
  output.push("button:has-text('发布')", "button:has-text('提交')", "button:has-text('保存并发布')", "button.ant-btn-primary");
  return output;
}

function deriveConfirmButtonSelectors(buttons: ButtonSnapshot[]): string[] {
  const ranked = [...buttons].sort((a, b) => confirmButtonScore(b) - confirmButtonScore(a));
  const output: string[] = [];
  for (const item of ranked.slice(0, 8)) {
    output.push(...buildButtonSelectors(item));
  }
  output.push("button:has-text('确认发布')", "button:has-text('确认')", "button:has-text('确定')", "button:has-text('继续发布')");
  return output;
}

// ─── Main API ────────────────────────────────────────────────────────────────

export function deriveSelectorBundle(snapshot: PageSnapshot): SelectorBundle {
  const { editables, buttons } = snapshot;

  const nextStepSelectors = joinOrFallback(
    [
      ...deriveButtonByKeywords(buttons, ["下一步", "继续"]),
      "button:has-text('下一步')",
      "button:has-text('继续')",
    ],
    "button:has-text('下一步')||button:has-text('继续')",
  );

  const riskConfirmSelectors = joinOrFallback(
    [
      ...deriveButtonByKeywords(buttons, ["确定", "确认"]),
      "button:has-text('确定')",
      "button:has-text('确认')",
    ],
    "button:has-text('确定')||button:has-text('确认')",
  );

  const publishSettingConfirmSelectors = joinOrFallback(
    [
      ...deriveButtonByKeywords(buttons, ["确认发布", "提交", "确认"]),
      "button:has-text('确认发布')",
      "button:has-text('提交')",
      "button:has-text('确认')",
    ],
    "button:has-text('确认发布')||button:has-text('提交')||button:has-text('确认')",
  );

  const createChapterSelectors = joinOrFallback(
    [
      ...deriveButtonByKeywords(buttons, ["创建章节", "新建章节"]),
      "button:has-text('创建章节')",
      "a:has-text('创建章节')",
      "button:has-text('新建章节')",
      "a:has-text('新建章节')",
    ],
    "button:has-text('创建章节')||button:has-text('新建章节')",
  );

  return {
    chapter_no_selectors: joinOrFallback(deriveChapterNoSelectors(editables), "input[placeholder*='章']||input[aria-label*='章节']||input[type='number']"),
    title_selectors: joinOrFallback(deriveTitleSelectors(editables), "input[placeholder*='章节']||input[placeholder*='标题']||textarea[placeholder*='标题']"),
    content_selectors: joinOrFallback(deriveContentSelectors(editables), "textarea[placeholder*='正文']||div[contenteditable='true']||.ProseMirror"),
    publish_button_selectors: joinOrFallback(derivePublishButtonSelectors(buttons), "button:has-text('发布')||button:has-text('提交')||button.ant-btn-primary"),
    confirm_button_selectors: joinOrFallback(deriveConfirmButtonSelectors(buttons), "button:has-text('确认发布')||button:has-text('确认')||button:has-text('确定')"),
    next_step_button_selectors: nextStepSelectors,
    risk_confirm_selectors: riskConfirmSelectors,
    publish_setting_confirm_selectors: publishSettingConfirmSelectors,
    ai_no_selectors: "label:has-text('否')||[role='radio']:has-text('否')||span:has-text('否')||div:has-text('否')",
    schedule_toggle_selectors: "label:has-text('定时发布') [role='switch']||[role='switch']||button[role='switch']",
    schedule_date_selectors: "input[placeholder*='日期']||input[placeholder*='YYYY']||input[aria-label*='日期']",
    schedule_time_selectors: "input[placeholder*='时间']||input[placeholder*='HH']||input[aria-label*='时间']",
    create_chapter_selectors: createChapterSelectors,
    success_text_keywords: "发布成功||保存成功||提交成功||已保存到云端",
    error_text_keywords: "发布失败||请求过于频繁||操作过于频繁||异常||超过当日上限||5万字||当日字数",
  };
}

export async function capturePageSnapshot(page: Page): Promise<PageSnapshot> {
  return page.evaluate<PageSnapshot>(() => {
    const normalize = (text: string) => (text || "").replace(/\s+/g, " ").trim();
    const isVisible = (el: Element) => {
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
    };

    const cssPath = (el: Element): string => {
      if (!el) return "";
      const parts: string[] = [];
      let node: Element | null = el;
      while (node && node.nodeType === 1 && parts.length < 8) {
        let part = node.tagName.toLowerCase();
        if (node.id) {
          part += `#${node.id}`;
          parts.unshift(part);
          break;
        }
        const className = normalize((node as HTMLElement).className || "");
        if (className) {
          const cls = className.split(/\s+/)[0];
          if (cls) part += `.${cls}`;
        }
        const parent: Element | null = node.parentElement;
        if (parent) {
          const siblings = Array.from(parent.children as unknown as Element[]).filter((c: Element) => c.tagName === node!.tagName);
          if (siblings.length > 1) {
            const pos = siblings.indexOf(node!) + 1;
            part += `:nth-of-type(${pos})`;
          }
        }
        parts.unshift(part);
        node = parent;
      }
      return parts.join(" > ");
    };

    const resolveLabel = (el: Element): string => {
      if (!el) return "";
      if (el.id) {
        const linked = document.querySelector(`label[for="${el.id}"]`);
        if (linked) return normalize(linked.textContent || "");
      }
      const parentLabel = el.closest("label");
      if (parentLabel) return normalize(parentLabel.textContent || "");
      return "";
    };

    const editables = Array.from(
      document.querySelectorAll("input, textarea, [contenteditable='true']"),
    )
      .filter((el) => isVisible(el))
      .slice(0, 60)
      .map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          tag: (el.tagName || "").toLowerCase(),
          id: el.id || "",
          name: (el as HTMLInputElement).name || "",
          placeholder: (el as HTMLInputElement).placeholder || "",
          aria_label: el.getAttribute("aria-label") || "",
          class_name: normalize((el as HTMLElement).className || ""),
          label_text: resolveLabel(el),
          is_contenteditable: el.isContentEditable,
          rect_top: Math.round(rect.top),
          css_path: cssPath(el),
        };
      });

    const buttons = Array.from(
      document.querySelectorAll("button, [role='button'], .ant-btn"),
    )
      .filter((el) => isVisible(el))
      .slice(0, 80)
      .map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          tag: (el.tagName || "").toLowerCase(),
          id: el.id || "",
          text: normalize(el.textContent || ""),
          aria_label: el.getAttribute("aria-label") || "",
          class_name: normalize((el as HTMLElement).className || ""),
          rect_top: Math.round(rect.top),
          css_path: cssPath(el),
        };
      });

    return { editables, buttons };
  });
}

export async function calibrateSelectors(
  publishUrl: string,
  log: (msg: string) => void,
  onReady?: () => void,
): Promise<SelectorBundle> {
  log("正在启动 Edge 浏览器进行选择器校准...");
  const browser = await chromium.launch({
    headless: false,
    channel: "msedge",
    args: [
      "--disable-blink-features=AutomationControlled",
      "--no-sandbox",
      "--start-maximized",
    ],
  });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });

  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
  });

  const page = await context.newPage();
  await page.goto(publishUrl, { waitUntil: "domcontentloaded", timeout: 90_000 });

  log("浏览器已打开。请手动登录并进入章节发布编辑页。");
  if (onReady) onReady();

  const deadline = Date.now() + 180_000;
  while (Date.now() < deadline) {
    const snapshot = await capturePageSnapshot(page);
    if (snapshot.editables.length > 0 && snapshot.buttons.length > 0) {
      log(`检测到编辑器控件：可编辑=${snapshot.editables.length}，按钮=${snapshot.buttons.length}`);
      const bundle = deriveSelectorBundle(snapshot);
      await browser.close();
      return bundle;
    }
    await page.waitForTimeout(1000);
  }

  await browser.close();
  throw new Error("校准超时：未检测到足够的编辑器控件。请确认已进入章节发布编辑页。");
}

export async function saveSelectorTemplate(
  bundle: SelectorBundle,
  publishUrl: string,
): Promise<string> {
  const data = {
    generated_at: new Date().toISOString(),
    publish_url: publishUrl,
    selectors: bundle,
  };
  await mkdir(SELECTOR_TEMPLATE_DIR, { recursive: true });
  const path = join(SELECTOR_TEMPLATE_DIR, "selector_template.json");
  await writeFile(path, JSON.stringify(data, null, 2), "utf-8");
  return path;
}

export async function loadSelectorTemplate(): Promise<{
  bundle: SelectorBundle;
  publishUrl: string;
} | null> {
  const path = join(SELECTOR_TEMPLATE_DIR, "selector_template.json");
  if (!existsSync(path)) return null;
  try {
    const raw = await readFile(path, "utf-8");
    const data = JSON.parse(raw);
    const bundle = SelectorBundleSchema.parse(data.selectors);
    return { bundle, publishUrl: data.publish_url ?? "" };
  } catch {
    return null;
  }
}
