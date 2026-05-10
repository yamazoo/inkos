import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import type { Platform } from "../models/book.js";
import {
  UploadStateSchema,
  UploadChapterStatusSchema,
  type UploadState,
  type UploadChapterResult,
} from "../models/upload.js";

export class UploadStateManager {
  constructor(
    private readonly projectRoot: string,
    private readonly bookId: string,
  ) {}

  private statePath(): string {
    return join(this.projectRoot, "books", this.bookId, "story", "state", "upload_state.json");
  }

  private storyDir(): string {
    return join(this.projectRoot, "books", this.bookId, "story", "state");
  }

  async load(): Promise<UploadState | null> {
    try {
      const raw = await readFile(this.statePath(), "utf-8");
      return UploadStateSchema.parse(JSON.parse(raw)) as UploadState;
    } catch {
      return null;
    }
  }

  async save(state: UploadState): Promise<void> {
    await mkdir(this.storyDir(), { recursive: true });
    const validated = UploadStateSchema.parse(state);
    await writeFile(this.statePath(), JSON.stringify(validated, null, 2), "utf-8");
  }

  async init(platform: Platform, maxChaptersPerHour = 3): Promise<UploadState> {
    const existing = await this.load();
    if (existing) {
      return existing;
    }
    const state: UploadState = {
      platform,
      maxChaptersPerHour,
      chapters: {},
    };
    await this.save(state);
    return state;
  }

  async getChapterState(chapterNumber: number): Promise<UploadChapterResult | null> {
    const state = await this.load();
    return (state?.chapters[String(chapterNumber)] ?? null) as UploadChapterResult | null;
  }

  async updateChapter(
    chapterNumber: number,
    title: string,
    result: UploadChapterResult,
  ): Promise<void> {
    const state = await this.load();
    if (!state) {
      throw new Error("Upload state not initialized");
    }
    const updated: UploadState = {
      ...state,
      lastUploadAt: new Date().toISOString(),
      lastUploadChapter: chapterNumber,
      chapters: {
        ...state.chapters,
        [String(chapterNumber)]: { ...result, title },
      },
    };
    await this.save(updated);
  }

  async getPendingChapters(
    approvedOnly: boolean,
    chapterIndex: ReadonlyArray<{ number: number; title: string; status: string; wordCount: number }>,
  ): Promise<ReadonlyArray<{ number: number; title: string; status: string; wordCount: number }>> {
    const state = await this.load();
    return chapterIndex.filter((ch) => {
      if (approvedOnly && ch.status !== "approved") return false;
      const uploaded = state?.chapters[String(ch.number)];
      return !uploaded || uploaded.status === "failed";
    });
  }

  async markChaptersUploaded(
    upTo: number,
    chapterIndex: ReadonlyArray<{ number: number; title: string }>,
  ): Promise<number> {
    const state = await this.load();
    if (!state) {
      throw new Error("Upload state not initialized");
    }
    let count = 0;
    const updatedChapters = { ...state.chapters };
    for (const ch of chapterIndex) {
      if (ch.number > upTo) break;
      if (!updatedChapters[String(ch.number)] || updatedChapters[String(ch.number)].status !== "uploaded") {
        updatedChapters[String(ch.number)] = {
          number: ch.number,
          title: ch.title,
          status: "uploaded",
          uploadedAt: new Date().toISOString(),
          retryCount: 0,
        };
        count++;
      }
    }
    await this.save({ ...state, chapters: updatedChapters });
    return count;
  }
}
