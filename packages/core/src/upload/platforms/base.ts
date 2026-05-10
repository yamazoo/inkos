import type { Page } from "@playwright/test";
import type { ChapterContent, UploadResult } from "../../models/upload.js";

export type UploadMode = "publish" | "draft";

export interface PlatformAdapter {
  readonly name: string;
  readonly loginUrl: string;
  readonly maxChaptersPerHour: number;

  login(page: Page, cookiesPath: string, onReady?: () => void): Promise<void>;
  isLoggedIn(page: Page): Promise<boolean>;
  validateSession(page: Page): Promise<boolean>;
  uploadChapter(page: Page, chapter: ChapterContent, mode?: UploadMode, bookId?: string, bookTitle?: string): Promise<UploadResult>;
  navigateToBookList(page: Page): Promise<void>;
  navigateToChapterEditor(page: Page, bookId: string): Promise<void>;
}
