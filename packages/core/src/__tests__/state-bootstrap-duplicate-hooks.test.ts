import { describe, expect, it, vi, beforeEach } from "vitest";
import { bootstrapStructuredStateFromMarkdown } from "../state/state-bootstrap.js";

const BOOK_DIR = "/tmp/book";

const hooksJsonWithDuplicates = JSON.stringify({
  hooks: [
    {
      hookId: "H120（新）阿纱的过去（野路子郎中）",
      startChapter: 71,
      type: "**新伏笔**",
      status: "open",
      lastAdvancedChapter: 71,
      expectedPayoff: "待展开",
      notes: "First entry.",
    },
    {
      hookId: "H121（新）阿纱的解毒药",
      startChapter: 71,
      type: "**新伏笔**",
      status: "open",
      lastAdvancedChapter: 71,
      expectedPayoff: "待展开",
      notes: "First entry.",
    },
    {
      hookId: "H120（新）阿纱的过去（野路子郎中）",
      startChapter: 0,
      type: "open",
      status: "open",
      lastAdvancedChapter: 0,
      expectedPayoff: "中程",
      notes: "Duplicate entry.",
    },
    {
      hookId: "H121（新）阿纱的解毒药",
      startChapter: 0,
      type: "open",
      status: "open",
      lastAdvancedChapter: 0,
      expectedPayoff: "中程",
      notes: "Duplicate entry.",
    },
  ],
});

const { readFile, writeFile, stat, readdir, mkdir } = vi.hoisted(() => ({
  readFile: vi.fn(),
  writeFile: vi.fn().mockResolvedValue(undefined),
  stat: vi.fn(),
  readdir: vi.fn().mockResolvedValue([]),
  mkdir: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("node:fs/promises", () => ({
  mkdir,
  readFile,
  writeFile,
  readdir,
  stat,
}));

describe("bootstrapStructuredStateFromMarkdown", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    stat.mockImplementation(async (path: any) => {
      const p = String(path);
      if (
        p.endsWith("manifest.json") ||
        p.endsWith("current_state.json") ||
        p.endsWith("hooks.json") ||
        p.endsWith("chapter_summaries.json")
      ) {
        return {};
      }
      throw Object.assign(new Error("ENOENT"), { code: "ENOENT" });
    });

    readFile.mockImplementation(async (path: any) => {
      const p = String(path);
      if (p.endsWith("manifest.json")) {
        return JSON.stringify({
          schemaVersion: 2,
          language: "zh",
          lastAppliedChapter: 71,
          projectionVersion: 1,
          migrationWarnings: [],
        });
      }
      if (p.endsWith("current_state.json")) {
        return JSON.stringify({ chapter: 71, facts: [] });
      }
      if (p.endsWith("hooks.json")) {
        return hooksJsonWithDuplicates;
      }
      if (p.endsWith("chapter_summaries.json")) {
        return JSON.stringify({ rows: [] });
      }
      if (
        p.endsWith("pending_hooks.md") ||
        p.endsWith("current_state.md") ||
        p.endsWith("chapter_summaries.md")
      ) {
        return "";
      }
      throw Object.assign(new Error("ENOENT"), { code: "ENOENT" });
    });
  });

  it("repairs hooks.json duplicates on load (self-healing)", async () => {
    let hooksJsonWritten: string | null = null;
    writeFile.mockImplementation(async (path: any, content: any) => {
      if (String(path).endsWith("hooks.json")) {
        hooksJsonWritten = String(content);
      }
      return undefined;
    });

    await bootstrapStructuredStateFromMarkdown({ bookDir: BOOK_DIR });

    // hooks.json must have been written with deduplicated content
    expect(hooksJsonWritten).not.toBeNull();
    const repaired = JSON.parse(hooksJsonWritten!);
    const ids = repaired.hooks.map((h: { hookId: string }) => h.hookId);
    const uniqueIds = [...new Set(ids)];
    expect(ids).toHaveLength(uniqueIds.length); // no duplicates
  });
});
