import type { BrowserContext, Page } from "@playwright/test";
import type { Platform } from "../models/book.js";
import type { ChapterContent, UploadResult, UploadChapterResult } from "../models/upload.js";
import type { PlatformAdapter, UploadMode } from "./platforms/base.js";
import { TomatoPlatformAdapter } from "./platforms/tomato.js";
import { launchBrowser, loadCookies, waitForUserLogin } from "./browser.js";
import { UploadStateManager } from "./state.js";
import { loadSelectorTemplate } from "./selector-calibrator.js";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

export interface UploadOptions {
  readonly chapters?: string; // e.g. "1-10" or "5"
  readonly approvedOnly?: boolean;
  readonly dryRun?: boolean;
  readonly maxChaptersPerHour?: number;
  readonly draftMode?: boolean;
  readonly username?: string;
  readonly bookTitle?: string;
}

export interface UploadProgress {
  readonly chapter: number;
  readonly title: string;
  status: "pending" | "uploading" | "uploaded" | "failed";
  error?: string;
  url?: string;
}

export interface UploadSummary {
  readonly total: number;
  readonly uploaded: number;
  readonly failed: number;
  readonly skipped: number;
  readonly chapters: ReadonlyArray<UploadProgress>;
}

function getAdapter(platform: Platform): PlatformAdapter {
  switch (platform) {
    case "tomato":
      return new TomatoPlatformAdapter();
    default:
      throw new Error(`Unsupported upload platform: ${platform}`);
  }
}

function parseChapterRange(range?: string): ReadonlyArray<number> | null {
  if (!range) return null;
  if (range.includes("-")) {
    const [start, end] = range.split("-").map(Number);
    const result: number[] = [];
    for (let i = start; i <= end; i++) result.push(i);
    return result;
  }
  return [Number(range)];
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class Uploader {
  private readonly stateManager: UploadStateManager;
  private adapter: PlatformAdapter;
  private readonly dryRun: boolean;
  private readonly draftMode: boolean;
  private readonly username: string;
  private readonly bookTitle: string;
  private readonly chapterRange: ReadonlyArray<number> | null;
  private readonly maxChaptersPerHour: number;
  private readonly uploadMode: UploadMode;

  private session:
    | { context: BrowserContext; page: Page; close: () => Promise<void> }
    | null = null;

  constructor(
    private readonly projectRoot: string,
    private readonly bookId: string,
    private readonly platform: Platform,
    private readonly chapterIndex: ReadonlyArray<{
      number: number;
      title: string;
      status: string;
      wordCount: number;
    }>,
    options: UploadOptions = {},
  ) {
    this.stateManager = new UploadStateManager(projectRoot, bookId);
    this.adapter = getAdapter(platform);
    this.dryRun = options.dryRun ?? false;
    this.draftMode = options.draftMode ?? false;
    this.username = options.username ?? "default";
    this.bookTitle = options.bookTitle ?? "";
    this.chapterRange = parseChapterRange(options.chapters);
    this.maxChaptersPerHour = options.maxChaptersPerHour ?? 3;
    this.uploadMode = this.draftMode ? "draft" : "publish";
  }

  async initialize(): Promise<void> {
    await this.stateManager.init(this.platform, this.maxChaptersPerHour);

    // Load calibrated selectors from template if available
    if (this.platform === "tomato") {
      const template = await loadSelectorTemplate();

      // Load platformBookId from book config
      let platformBookId: string | undefined;
      try {
        const raw = await readFile(join(this.projectRoot, "books", this.bookId, "book.json"), "utf-8");
        const cfg = JSON.parse(raw);
        platformBookId = cfg.platformBookId;
      } catch { /* ignore */ }

      if (template) {
        console.error("[upload] 已加载校准选择器模板");
        this.adapter = new TomatoPlatformAdapter({
          selectors: template.bundle,
          platformBookId,
          bookTitle: this.bookTitle,
        });
      } else {
        this.adapter = new TomatoPlatformAdapter({ platformBookId, bookTitle: this.bookTitle });
      }
    }
  }

  /**
   * Ensure a browser session is active.
   * Uses persistent context so cookies/localStorage survive across restarts.
   * Validates existing session before reuse; re-creates if expired.
   */
  private async ensureSession(): Promise<Page> {
    if (this.session) {
      const valid = await this.adapter.validateSession(this.session.page);
      if (valid) return this.session.page;
      // Session expired — close and re-create
      console.error("[upload] 会话已过期，重新登录...");
      await this.session.close();
      this.session = null;
    }

    // Launch browser context (cookies survive restarts)
    const { context, page, close } = await launchBrowser(false);
    this.session = { context, page, close };

    // Load saved cookies
    await loadCookies(context, this.platform, this.username);

    // Check if already logged in (persistent context may have valid cookies)
    const loggedIn = await this.adapter.isLoggedIn(page);
    if (!loggedIn) {
      await this.adapter.login(page, "");
      const ok = await waitForUserLogin(page);
      if (!ok) {
        await this.session.close();
        this.session = null;
        throw new Error("登录超时，请重试");
      }
      console.error("[upload] 登录成功，开始上传...");
    }

    return page;
  }

  async getUploadStatus(): Promise<UploadSummary> {
    const state = await this.stateManager.load();
    const allChapters = this.chapterIndex.map((ch) => {
      const record = state?.chapters[String(ch.number)];
      return {
        chapter: ch.number,
        title: ch.title,
        status: (record?.status as UploadProgress["status"]) ?? "pending",
        error: record?.error,
        url: record?.url,
      } satisfies UploadProgress;
    });

    const filtered = this.chapterRange
      ? allChapters.filter((c) => this.chapterRange!.includes(c.chapter))
      : allChapters;

    return {
      total: filtered.length,
      uploaded: filtered.filter((c) => c.status === "uploaded").length,
      failed: filtered.filter((c) => c.status === "failed").length,
      skipped: filtered.filter((c) => c.status === "pending").length,
      chapters: filtered,
    };
  }

  async uploadChapters(): Promise<UploadSummary> {
    let chaptersToUpload = await this.stateManager.getPendingChapters(
      this.chapterRange === null, // if no range specified, only upload approved
      this.chapterIndex,
    );

    // Filter by explicit range
    if (this.chapterRange) {
      chaptersToUpload = chaptersToUpload.filter((ch) => this.chapterRange!.includes(ch.number));

      // Scan file system for chapters in range but missing from index
      const indexedNumbers = new Set(chaptersToUpload.map((ch) => ch.number));
      const missingFromIndex = this.chapterRange.filter((n) => !indexedNumbers.has(n));
      if (missingFromIndex.length > 0) {
        const fsChapters = await this.scanChaptersFromFileSystem(missingFromIndex);
        if (fsChapters.length > 0) {
          console.error(`[upload] 从文件系统补充 ${fsChapters.length} 个索引外章节`);
          chaptersToUpload = [...chaptersToUpload, ...fsChapters];
        }
      }
    }

    if (this.dryRun) {
      return {
        total: chaptersToUpload.length,
        uploaded: 0,
        failed: 0,
        skipped: chaptersToUpload.length,
        chapters: chaptersToUpload.map((ch) => ({
          chapter: ch.number,
          title: ch.title,
          status: "pending" as const,
        })),
      };
    }

    const results: UploadProgress[] = [];

    for (const ch of chaptersToUpload) {
      const progress: UploadProgress = {
        chapter: ch.number,
        title: ch.title,
        status: "uploading",
      };
      results.push(progress);

      try {
        // EnsureSession validates or re-creates the session
        const page = await this.ensureSession();
        const chapterContent = await this.loadChapterContent(ch.number, ch.title);
        const result: UploadResult = await this.adapter.uploadChapter(page, chapterContent, this.uploadMode, this.bookId, this.bookTitle);

        if (result.success) {
          await this.stateManager.updateChapter(ch.number, ch.title, {
            number: ch.number,
            title: ch.title,
            status: "uploaded",
            uploadedAt: new Date().toISOString(),
            url: result.url,
            retryCount: 0,
          });
          progress.status = "uploaded";
          progress.url = result.url;
        } else {
          await this.stateManager.updateChapter(ch.number, ch.title, {
            number: ch.number,
            title: ch.title,
            status: "failed",
            error: result.error,
            retryCount: 0,
          });
          progress.status = "failed";
          progress.error = result.error;
        }
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err);

        // If login-related error, try re-login once
        if (error.includes("登录") || error.includes("session") || error.includes("cookie")) {
          console.error(`[upload] 会话异常，尝试重新登录...`);
          if (this.session) {
            await this.session.close().catch(() => {});
            this.session = null;
          }
          try {
            const page = await this.ensureSession();
            const chapterContent = await this.loadChapterContent(ch.number, ch.title);
            const result = await this.adapter.uploadChapter(page, chapterContent, this.uploadMode, this.bookId, this.bookTitle);
            if (result.success) {
              await this.stateManager.updateChapter(ch.number, ch.title, {
                number: ch.number, title: ch.title, status: "uploaded",
                uploadedAt: new Date().toISOString(), url: result.url, retryCount: 0,
              });
              progress.status = "uploaded";
              progress.url = result.url;
              await sleep(2000);
              continue;
            }
          } catch {
            // Re-login also failed — record as failed
          }
        }

        await this.stateManager.updateChapter(ch.number, ch.title, {
          number: ch.number,
          title: ch.title,
          status: "failed",
          error,
          retryCount: 0,
        });
        progress.status = "failed";
        progress.error = error;
      }

      // Small delay between chapters to avoid triggering anti-bot
      await sleep(2000);
    }

    return {
      total: results.length,
      uploaded: results.filter((r) => r.status === "uploaded").length,
      failed: results.filter((r) => r.status === "failed").length,
      skipped: 0,
      chapters: results,
    };
  }

  /**
   * Scan the file system for chapter files matching the given numbers.
   * Used when chapters exist on disk but are missing from the index.
   */
  private async scanChaptersFromFileSystem(
    numbers: ReadonlyArray<number>,
  ): Promise<ReadonlyArray<{ number: number; title: string; status: string; wordCount: number }>> {
    const chapterDir = join(this.projectRoot, "books", this.bookId, "chapters");
    let files: string[];
    try {
      files = await readdir(chapterDir);
    } catch {
      return [];
    }

    const state = await this.stateManager.load();
    const results: Array<{ number: number; title: string; status: string; wordCount: number }> = [];

    for (const num of numbers) {
      // Skip if already uploaded
      const existing = state?.chapters[String(num)];
      if (existing?.status === "uploaded") continue;

      const chapterFile = files.find(
        (f) => f.startsWith(String(num).padStart(4, "0")) || f.match(new RegExp(`^0*${num}[_\\-]`)),
      );
      if (!chapterFile) continue;

      // Derive title from filename: "0112_山间旅.md" → "山间旅"
      const titleFromName = chapterFile
        .replace(/^\d+[_\-\s]*/, "")
        .replace(/\.md$/, "")
        .replace(/_/g, " ");

      try {
        const content = await readFile(join(chapterDir, chapterFile), "utf-8");
        results.push({
          number: num,
          title: titleFromName,
          status: "ready-for-review",
          wordCount: content.replace(/[#*`\[\]]/g, "").length,
        });
      } catch {
        // Skip unreadable files
      }
    }

    return results;
  }

  private async loadChapterContent(number: number, title: string): Promise<ChapterContent> {
    const chapterDir = join(this.projectRoot, "books", this.bookId, "chapters");
    const files = await readdir(chapterDir);
    const chapterFile = files.find(
      (f) => f.startsWith(String(number).padStart(4, "0")) || f.includes(String(number)),
    );
    if (!chapterFile) {
      throw new Error(`Chapter file not found for chapter ${number}: "${title}"`);
    }
    let content = await readFile(join(chapterDir, chapterFile), "utf-8");

    // Strip leading chapter title line (with or without markdown # prefix)
    content = content.replace(/^#?\s*第?\s*\d+\s*章.*\n*/, "");
    // Also strip bare title header if it matches
    const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    content = content.replace(new RegExp(`^#?\\s*${escapedTitle}\\s*\\n*`), "").trimStart();

    const wordCount = content.replace(/[#*`\[\]]/g, "").length;

    // Strip markdown formatting from title
    const cleanTitle = title
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/={2,}/g, "")
      .trim();

    return { number, title: cleanTitle, content, wordCount };
  }

  async close(): Promise<void> {
    if (this.session) {
      await this.session.close();
      this.session = null;
    }
  }
}
