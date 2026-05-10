import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, writeFile, readFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  bootstrapStructuredStateFromMarkdown,
  rewriteStructuredStateFromMarkdown,
  resolveContiguousChapterPrefix,
} from "../state/state-bootstrap.js";
import type { StateManifest } from "../models/runtime-state.js";

describe("state-bootstrap", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "inkos-bootstrap-test-"));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  // -------------------------------------------------------------------------
  // resolveContiguousChapterPrefix
  // -------------------------------------------------------------------------

  describe("resolveContiguousChapterPrefix", () => {
    it("returns 0 for empty array", () => {
      expect(resolveContiguousChapterPrefix([])).toBe(0);
    });

    it("returns 0 when chapter 1 is not present", () => {
      expect(resolveContiguousChapterPrefix([5, 6, 7])).toBe(0);
    });

    it("returns the count of contiguous chapters starting from 1", () => {
      expect(resolveContiguousChapterPrefix([1, 2])).toBe(2);
    });

    it("returns longest prefix of contiguous chapters", () => {
      expect(resolveContiguousChapterPrefix([1, 2, 3, 5, 6, 7])).toBe(3);
    });

    it("returns the full set when fully contiguous", () => {
      expect(resolveContiguousChapterPrefix([1, 2, 3, 4, 5])).toBe(5);
    });

    it("ignores duplicate chapter numbers", () => {
      expect(resolveContiguousChapterPrefix([1, 1, 2, 2, 3])).toBe(3);
    });

    it("ignores non-integer values", () => {
      expect(resolveContiguousChapterPrefix([1, 2, 3.5, 4])).toBe(2);
    });

    it("ignores zero and negative chapter numbers", () => {
      // [0, 1, 2, -1, 3] → filter positive integers → {1, 2, 3} → contiguous prefix = 3
      expect(resolveContiguousChapterPrefix([0, 1, 2, -1, 3])).toBe(3);
    });
  });

  // -------------------------------------------------------------------------
  // bootstrapStructuredStateFromMarkdown — JSON missing → bootstraps from markdown
  // -------------------------------------------------------------------------

  it("bootstrap: JSON missing → bootstraps from markdown, creates all 4 JSON files", async () => {
    const bookDir = join(tempDir, "book-1");
    await mkdir(join(bookDir, "story"), { recursive: true });
    await mkdir(join(bookDir, "chapters"), { recursive: true });

    // Write book.json so language can be resolved
    await writeFile(join(bookDir, "book.json"), JSON.stringify({ language: "en" }), "utf-8");

    // Write markdown source files
    // Note: isCurrentChapterLabel expects "current chapter" (space), not underscore
    // Note: isStateTableHeaderRow expects "field | value", not "key | value"
    await writeFile(join(bookDir, "story", "current_state.md"), "| field | value |\n| current chapter | 3 |\n| hero_location | village |", "utf-8");
    await writeFile(join(bookDir, "story", "pending_hooks.md"), "| hook_id | start_chapter | type | status | last_advanced_chapter | expected_payoff | payoff_timing | notes |\n| hook-a | 1 | mystery | open | 1 | Solve it | mid-arc | notes here |", "utf-8");
    await writeFile(join(bookDir, "story", "chapter_summaries.md"), "| chapter | title | characters | events | state_changes | hook_activity | mood | chapter_type |\n| 1 | Ch1 Title | Alice | Event 1 | Change 1 | hook-a | tense | main |", "utf-8");

    const result = await bootstrapStructuredStateFromMarkdown({ bookDir });

    expect(result.manifest.schemaVersion).toBe(2);
    expect(result.manifest.language).toBe("en");
    expect([...result.createdFiles].sort()).toEqual(
      ["manifest.json", "current_state.json", "hooks.json", "chapter_summaries.json"].sort(),
    );
    // All 4 files are created when JSON is missing
    expect(result.createdFiles).toHaveLength(4);

    const manifest: StateManifest = JSON.parse(
      await readFile(join(bookDir, "story", "state", "manifest.json"), "utf-8"),
    );
    expect(manifest.schemaVersion).toBe(2);

    const currentState = JSON.parse(
      await readFile(join(bookDir, "story", "state", "current_state.json"), "utf-8"),
    );
    expect(currentState.chapter).toBe(3);
    expect(currentState.facts.some((f: { predicate: string; object: string }) => f.predicate === "hero_location" && f.object === "village")).toBe(true);

    const hooks = JSON.parse(
      await readFile(join(bookDir, "story", "state", "hooks.json"), "utf-8"),
    );
    expect(hooks.hooks).toHaveLength(1);
    expect(hooks.hooks[0].hookId).toBe("hook-a");

    const summaries = JSON.parse(
      await readFile(join(bookDir, "story", "state", "chapter_summaries.json"), "utf-8"),
    );
    expect(summaries.rows).toHaveLength(1);
    expect(summaries.rows[0].chapter).toBe(1);
  });

  // -------------------------------------------------------------------------
  // bootstrapStructuredStateFromMarkdown — JSON valid → no-op, no writes
  // -------------------------------------------------------------------------

  it("bootstrap: JSON valid → no-op, returns existing, createdFiles=[], no writes", async () => {
    const bookDir = join(tempDir, "book-2");
    await mkdir(join(bookDir, "story", "state"), { recursive: true });
    await mkdir(join(bookDir, "chapters"), { recursive: true });

    // Write chapter files so durableStoryProgress >= 5 (contiguous prefix = 5)
    for (let i = 1; i <= 5; i++) {
      await writeFile(join(bookDir, "chapters", `000${i}_ch.md`), `# Chapter ${i}`, "utf-8");
    }

    // Write book.json
    await writeFile(join(bookDir, "book.json"), JSON.stringify({ language: "en" }), "utf-8");

    // Write already-valid JSON state files
    const existingManifest: StateManifest = {
      schemaVersion: 2,
      language: "en",
      lastAppliedChapter: 5,
      projectionVersion: 1,
      migrationWarnings: [],
    };
    await writeFile(
      join(bookDir, "story", "state", "manifest.json"),
      JSON.stringify(existingManifest),
      "utf-8",
    );
    await writeFile(
      join(bookDir, "story", "state", "current_state.json"),
      JSON.stringify({ chapter: 5, facts: [] }),
      "utf-8",
    );
    await writeFile(
      join(bookDir, "story", "state", "hooks.json"),
      JSON.stringify({ hooks: [] }),
      "utf-8",
    );
    await writeFile(
      join(bookDir, "story", "state", "chapter_summaries.json"),
      JSON.stringify({ rows: [] }),
      "utf-8",
    );

    // Touch markdown files to record their mtimes
    await writeFile(join(bookDir, "story", "current_state.md"), "| current_chapter | 999 |\n", "utf-8");
    await writeFile(join(bookDir, "story", "pending_hooks.md"), "| hook_id | 1 | mystery | open | 1 | X | mid-arc | |", "utf-8");
    await writeFile(join(bookDir, "story", "chapter_summaries.md"), "| chapter | 1 | Title | | | | | |", "utf-8");

    const result = await bootstrapStructuredStateFromMarkdown({ bookDir });

    expect(result.manifest.lastAppliedChapter).toBe(5);
    // bootstrap is a no-op — no new files created when JSON is already valid
    expect(result.createdFiles).toHaveLength(0);
  });

  // -------------------------------------------------------------------------
  // bootstrapStructuredStateFromMarkdown — deduplicates hooks.json on load
  // -------------------------------------------------------------------------

  it("bootstrap: deduplicates hooks.json on load", async () => {
    const bookDir = join(tempDir, "book-3");
    await mkdir(join(bookDir, "story", "state"), { recursive: true });

    await writeFile(join(bookDir, "book.json"), JSON.stringify({ language: "en" }), "utf-8");

    // Write hooks.json with duplicate hook ids
    await writeFile(
      join(bookDir, "story", "state", "hooks.json"),
      JSON.stringify({
        hooks: [
          { hookId: "hook-1", startChapter: 1, type: "mystery", status: "open", lastAdvancedChapter: 1, expectedPayoff: "A", payoffTiming: undefined, notes: "" },
          { hookId: "hook-1", startChapter: 1, type: "mystery", status: "open", lastAdvancedChapter: 2, expectedPayoff: "B", payoffTiming: undefined, notes: "" },
          { hookId: "hook-2", startChapter: 3, type: "relationship", status: "open", lastAdvancedChapter: 3, expectedPayoff: "C", payoffTiming: undefined, notes: "" },
        ],
      }),
      "utf-8",
    );
    await writeFile(
      join(bookDir, "story", "state", "manifest.json"),
      JSON.stringify({ schemaVersion: 2, language: "en", lastAppliedChapter: 3, projectionVersion: 1, migrationWarnings: [] }),
      "utf-8",
    );
    await writeFile(join(bookDir, "story", "state", "current_state.json"), JSON.stringify({ chapter: 3, facts: [] }), "utf-8");
    await writeFile(join(bookDir, "story", "state", "chapter_summaries.json"), JSON.stringify({ rows: [] }), "utf-8");

    const result = await bootstrapStructuredStateFromMarkdown({ bookDir });

    // The duplicate hook-1 was deduplicated — latest record wins (by lastAdvancedChapter)
    const hooksAfter = JSON.parse(
      await readFile(join(bookDir, "story", "state", "hooks.json"), "utf-8"),
    );
    expect(hooksAfter.hooks).toHaveLength(2);
    const hook1 = hooksAfter.hooks.find((h: { hookId: string }) => h.hookId === "hook-1");
    expect(hook1?.lastAdvancedChapter).toBe(2); // newer record kept
    expect(hook1?.expectedPayoff).toBe("B");

    // A warning was collected for the duplicate repair
    expect(result.warnings.some((w: string) => w.includes("duplicate"))).toBe(true);
  });

  // -------------------------------------------------------------------------
  // bootstrapStructuredStateFromMarkdown — deduplicates chapter_summaries.json on load
  // -------------------------------------------------------------------------

  it("bootstrap: deduplicates chapter_summaries.json on load", async () => {
    const bookDir = join(tempDir, "book-4");
    await mkdir(join(bookDir, "story", "state"), { recursive: true });

    await writeFile(join(bookDir, "book.json"), JSON.stringify({ language: "en" }), "utf-8");

    // Write chapter_summaries.json with duplicate chapter rows
    await writeFile(
      join(bookDir, "story", "state", "chapter_summaries.json"),
      JSON.stringify({
        rows: [
          { chapter: 1, title: "Ch1 Old", characters: "", events: "", stateChanges: "", hookActivity: "", mood: "", chapterType: "" },
          { chapter: 2, title: "Ch2", characters: "", events: "", stateChanges: "", hookActivity: "", mood: "", chapterType: "" },
          { chapter: 1, title: "Ch1 New", characters: "", events: "", stateChanges: "", hookActivity: "", mood: "", chapterType: "" },
          { chapter: 3, title: "Ch3", characters: "", events: "", stateChanges: "", hookActivity: "", mood: "", chapterType: "" },
        ],
      }),
      "utf-8",
    );
    await writeFile(
      join(bookDir, "story", "state", "manifest.json"),
      JSON.stringify({ schemaVersion: 2, language: "en", lastAppliedChapter: 3, projectionVersion: 1, migrationWarnings: [] }),
      "utf-8",
    );
    await writeFile(join(bookDir, "story", "state", "current_state.json"), JSON.stringify({ chapter: 3, facts: [] }), "utf-8");
    await writeFile(join(bookDir, "story", "state", "hooks.json"), JSON.stringify({ hooks: [] }), "utf-8");

    const result = await bootstrapStructuredStateFromMarkdown({ bookDir });

    const summariesAfter = JSON.parse(
      await readFile(join(bookDir, "story", "state", "chapter_summaries.json"), "utf-8"),
    );
    // Chapter 1 deduplicated: latest wins (Map preserves insertion order, last one wins)
    expect(summariesAfter.rows).toHaveLength(3);
    const ch1Row = summariesAfter.rows.find((r: { chapter: number }) => r.chapter === 1);
    expect(ch1Row?.title).toBe("Ch1 New");
  });

  // -------------------------------------------------------------------------
  // bootstrapStructuredStateFromMarkdown — manifest language inferred from book.json
  // -------------------------------------------------------------------------

  it("bootstrap: manifest language inferred from book.json", async () => {
    const bookDir = join(tempDir, "book-5");
    await mkdir(join(bookDir, "story", "state"), { recursive: true });

    // book.json specifies Chinese
    await writeFile(join(bookDir, "book.json"), JSON.stringify({ language: "zh" }), "utf-8");
    await writeFile(join(bookDir, "story", "current_state.md"), "", "utf-8");
    await writeFile(join(bookDir, "story", "pending_hooks.md"), "", "utf-8");
    await writeFile(join(bookDir, "story", "chapter_summaries.md"), "", "utf-8");
    await writeFile(
      join(bookDir, "story", "state", "manifest.json"),
      JSON.stringify({ schemaVersion: 2, language: "zh", lastAppliedChapter: 0, projectionVersion: 1, migrationWarnings: [] }),
      "utf-8",
    );
    await writeFile(join(bookDir, "story", "state", "current_state.json"), JSON.stringify({ chapter: 0, facts: [] }), "utf-8");
    await writeFile(join(bookDir, "story", "state", "hooks.json"), JSON.stringify({ hooks: [] }), "utf-8");
    await writeFile(join(bookDir, "story", "state", "chapter_summaries.json"), JSON.stringify({ rows: [] }), "utf-8");

    const result = await bootstrapStructuredStateFromMarkdown({ bookDir });

    expect(result.manifest.language).toBe("zh");
  });

  it("bootstrap: defaults to en when book.json has no language field", async () => {
    const bookDir = join(tempDir, "book-5b");
    await mkdir(join(bookDir, "story", "state"), { recursive: true });

    await writeFile(join(bookDir, "book.json"), JSON.stringify({ title: "My Book" }), "utf-8");
    await writeFile(join(bookDir, "story", "current_state.md"), "", "utf-8");
    await writeFile(join(bookDir, "story", "pending_hooks.md"), "", "utf-8");
    await writeFile(join(bookDir, "story", "chapter_summaries.md"), "", "utf-8");
    await writeFile(
      join(bookDir, "story", "state", "manifest.json"),
      JSON.stringify({ schemaVersion: 2, language: "en", lastAppliedChapter: 0, projectionVersion: 1, migrationWarnings: [] }),
      "utf-8",
    );
    await writeFile(join(bookDir, "story", "state", "current_state.json"), JSON.stringify({ chapter: 0, facts: [] }), "utf-8");
    await writeFile(join(bookDir, "story", "state", "hooks.json"), JSON.stringify({ hooks: [] }), "utf-8");
    await writeFile(join(bookDir, "story", "state", "chapter_summaries.json"), JSON.stringify({ rows: [] }), "utf-8");

    const result = await bootstrapStructuredStateFromMarkdown({ bookDir });

    expect(result.manifest.language).toBe("en");
  });

  // -------------------------------------------------------------------------
  // bootstrapStructuredStateFromMarkdown — durable story progress from chapters dir
  // -------------------------------------------------------------------------

  it("bootstrap: durable story progress from chapters dir", async () => {
    const bookDir = join(tempDir, "book-6");
    await mkdir(join(bookDir, "story"), { recursive: true });
    await mkdir(join(bookDir, "chapters"), { recursive: true });

    await writeFile(join(bookDir, "book.json"), JSON.stringify({ language: "en" }), "utf-8");

    // No JSON state files — will bootstrap
    await writeFile(join(bookDir, "story", "current_state.md"), "", "utf-8");
    await writeFile(join(bookDir, "story", "pending_hooks.md"), "", "utf-8");
    await writeFile(join(bookDir, "story", "chapter_summaries.md"), "", "utf-8");

    // chapters/ has files 0001_ch.md and 0002_ch.md
    await writeFile(join(bookDir, "chapters", "0001_ch.md"), "# Chapter 1", "utf-8");
    await writeFile(join(bookDir, "chapters", "0002_ch.md"), "# Chapter 2", "utf-8");

    const result = await bootstrapStructuredStateFromMarkdown({ bookDir });

    expect(result.manifest.lastAppliedChapter).toBeGreaterThanOrEqual(2);
  });

  it("bootstrap: lastAppliedChapter respects index.json chapter numbers", async () => {
    const bookDir = join(tempDir, "book-6b");
    await mkdir(join(bookDir, "story"), { recursive: true });
    await mkdir(join(bookDir, "chapters"), { recursive: true });

    await writeFile(join(bookDir, "book.json"), JSON.stringify({ language: "en" }), "utf-8");
    await writeFile(join(bookDir, "story", "current_state.md"), "", "utf-8");
    await writeFile(join(bookDir, "story", "pending_hooks.md"), "", "utf-8");
    await writeFile(join(bookDir, "story", "chapter_summaries.md"), "", "utf-8");

    // index.json lists chapters 1,2,3,5 — contiguous prefix is 3
    await writeFile(
      join(bookDir, "chapters", "index.json"),
      JSON.stringify([{ number: 1 }, { number: 2 }, { number: 3 }, { number: 5 }]),
      "utf-8",
    );
    await writeFile(join(bookDir, "chapters", "0001_ch.md"), "# Ch1", "utf-8");
    await writeFile(join(bookDir, "chapters", "0002_ch.md"), "# Ch2", "utf-8");
    await writeFile(join(bookDir, "chapters", "0003_ch.md"), "# Ch3", "utf-8");
    await writeFile(join(bookDir, "chapters", "0005_ch.md"), "# Ch5", "utf-8");

    const result = await bootstrapStructuredStateFromMarkdown({ bookDir });

    expect(result.manifest.lastAppliedChapter).toBe(3);
  });

  // -------------------------------------------------------------------------
  // bootstrapStructuredStateFromMarkdown — migrationWarnings collected
  // -------------------------------------------------------------------------

  it("bootstrap: migrationWarnings collected and merged", async () => {
    const bookDir = join(tempDir, "book-7");
    await mkdir(join(bookDir, "story", "state"), { recursive: true });

    await writeFile(join(bookDir, "book.json"), JSON.stringify({ language: "en" }), "utf-8");

    // Existing manifest with prior warnings
    await writeFile(
      join(bookDir, "story", "state", "manifest.json"),
      JSON.stringify({ schemaVersion: 2, language: "en", lastAppliedChapter: 0, projectionVersion: 1, migrationWarnings: ["prior-warning-1", "prior-warning-2"] }),
      "utf-8",
    );
    // Invalid current_state.json triggers a rebuild warning
    await writeFile(join(bookDir, "story", "state", "current_state.json"), "{invalid json}", "utf-8");
    await writeFile(join(bookDir, "story", "state", "hooks.json"), JSON.stringify({ hooks: [] }), "utf-8");
    await writeFile(join(bookDir, "story", "state", "chapter_summaries.json"), JSON.stringify({ rows: [] }), "utf-8");
    await writeFile(join(bookDir, "story", "current_state.md"), "", "utf-8");
    await writeFile(join(bookDir, "story", "pending_hooks.md"), "", "utf-8");
    await writeFile(join(bookDir, "story", "chapter_summaries.md"), "", "utf-8");

    const result = await bootstrapStructuredStateFromMarkdown({ bookDir });

    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings).toContain("prior-warning-1");
    expect(result.warnings).toContain("prior-warning-2");
  });

  // -------------------------------------------------------------------------
  // rewriteStructuredStateFromMarkdown — forces rewrite, ignores existing JSON
  // -------------------------------------------------------------------------

  it("rewrite: forces rewrite ignoring existing JSON", async () => {
    const bookDir = join(tempDir, "book-8");
    await mkdir(join(bookDir, "story", "state"), { recursive: true });
    await mkdir(join(bookDir, "chapters"), { recursive: true });

    await writeFile(join(bookDir, "book.json"), JSON.stringify({ language: "en" }), "utf-8");

    // Stale but valid JSON
    await writeFile(
      join(bookDir, "story", "state", "manifest.json"),
      JSON.stringify({ schemaVersion: 2, language: "en", lastAppliedChapter: 99, projectionVersion: 1, migrationWarnings: [] }),
      "utf-8",
    );
    await writeFile(
      join(bookDir, "story", "state", "current_state.json"),
      JSON.stringify({ chapter: 99, facts: [{ subject: "x", predicate: "x", object: "x", validFromChapter: 99, validUntilChapter: null, sourceChapter: 99 }] }),
      "utf-8",
    );
    await writeFile(
      join(bookDir, "story", "state", "hooks.json"),
      JSON.stringify({ hooks: [{ hookId: "old-hook", startChapter: 50, type: "mystery", status: "resolved", lastAdvancedChapter: 50, expectedPayoff: "", payoffTiming: undefined, notes: "" }] }),
      "utf-8",
    );
    await writeFile(
      join(bookDir, "story", "state", "chapter_summaries.json"),
      JSON.stringify({ rows: [{ chapter: 99, title: "Old Ch99", characters: "", events: "", stateChanges: "", hookActivity: "", mood: "", chapterType: "" }] }),
      "utf-8",
    );

    // Fresh markdown with different data
    // Note: isCurrentChapterLabel expects "current chapter" (space), not underscore
    await writeFile(join(bookDir, "story", "current_state.md"), "| field | value |\n| current chapter | 10 |\n| location | new-village |", "utf-8");
    await writeFile(
      join(bookDir, "story", "pending_hooks.md"),
      "| hook_id | start_chapter | type | status | last_advanced_chapter | expected_payoff | payoff_timing | notes |\n| fresh-hook | 10 | plot | open | 10 | New payoff | mid-arc | Fresh note |",
      "utf-8",
    );
    await writeFile(
      join(bookDir, "story", "chapter_summaries.md"),
      "| chapter | title | characters | events | state_changes | hook_activity | mood | chapter_type |\n| 10 | Ch10 Fresh | Bob | New event | New change | fresh-hook | tense | main |",
      "utf-8",
    );
    await writeFile(join(bookDir, "chapters", "0001_ch.md"), "# Ch1", "utf-8");
    await writeFile(join(bookDir, "chapters", "0002_ch.md"), "# Ch2", "utf-8");
    await writeFile(join(bookDir, "chapters", "0003_ch.md"), "# Ch3", "utf-8");

    const result = await rewriteStructuredStateFromMarkdown({ bookDir });

    // lastAppliedChapter comes from durable story progress (3 chapter files → contiguous prefix = 3),
    // NOT from the markdown chapter field (10), which is only used for the current_state.chapter value
    expect(result.manifest.lastAppliedChapter).toBe(3);

    // current_state.json reflects markdown, not stale JSON
    const currentState = JSON.parse(
      await readFile(join(bookDir, "story", "state", "current_state.json"), "utf-8"),
    );
    expect(currentState.chapter).toBe(10);
    expect(currentState.facts.some((f: { predicate: string; object: string }) => f.predicate === "location" && f.object === "new-village")).toBe(true);

    // hooks.json reflects markdown, not stale JSON
    const hooks = JSON.parse(
      await readFile(join(bookDir, "story", "state", "hooks.json"), "utf-8"),
    );
    expect(hooks.hooks).toHaveLength(1);
    expect(hooks.hooks[0].hookId).toBe("fresh-hook");

    // chapter_summaries.json reflects markdown, not stale JSON
    const summaries = JSON.parse(
      await readFile(join(bookDir, "story", "state", "chapter_summaries.json"), "utf-8"),
    );
    expect(summaries.rows).toHaveLength(1);
    expect(summaries.rows[0].chapter).toBe(10);
  });

  // -------------------------------------------------------------------------
  // rewriteStructuredStateFromMarkdown — createdFiles is empty
  // -------------------------------------------------------------------------

  it("rewrite: createdFiles is empty", async () => {
    const bookDir = join(tempDir, "book-9");
    await mkdir(join(bookDir, "story"), { recursive: true });
    await mkdir(join(bookDir, "chapters"), { recursive: true });

    await writeFile(join(bookDir, "book.json"), JSON.stringify({ language: "en" }), "utf-8");
    await writeFile(join(bookDir, "story", "current_state.md"), "", "utf-8");
    await writeFile(join(bookDir, "story", "pending_hooks.md"), "", "utf-8");
    await writeFile(join(bookDir, "story", "chapter_summaries.md"), "", "utf-8");

    const result = await rewriteStructuredStateFromMarkdown({ bookDir });

    expect(result.createdFiles).toEqual([]);
  });

  // -------------------------------------------------------------------------
  // invalid markdown gracefully handled
  // -------------------------------------------------------------------------

  it("invalid markdown: corrupt current_state.md → valid default state", async () => {
    const bookDir = join(tempDir, "book-10");
    await mkdir(join(bookDir, "story"), { recursive: true });
    await mkdir(join(bookDir, "chapters"), { recursive: true });

    await writeFile(join(bookDir, "book.json"), JSON.stringify({ language: "en" }), "utf-8");
    // Corrupt markdown — bullet-style parsing will produce empty facts
    await writeFile(join(bookDir, "story", "current_state.md"), "NOT A VALID TABLE OR BULLETS \u0000 CORRUPT", "utf-8");
    await writeFile(join(bookDir, "story", "pending_hooks.md"), "completely broken", "utf-8");
    await writeFile(join(bookDir, "story", "chapter_summaries.md"), "also broken", "utf-8");

    const result = await bootstrapStructuredStateFromMarkdown({ bookDir });

    // Should not throw — returns valid default state
    expect(result.manifest.schemaVersion).toBe(2);
    expect(result.manifest.lastAppliedChapter).toBe(0);

    const currentState = JSON.parse(
      await readFile(join(bookDir, "story", "state", "current_state.json"), "utf-8"),
    );
    expect(currentState.chapter).toBe(0);
    expect(Array.isArray(currentState.facts)).toBe(true);

    const hooks = JSON.parse(
      await readFile(join(bookDir, "story", "state", "hooks.json"), "utf-8"),
    );
    expect(Array.isArray(hooks.hooks)).toBe(true);

    const summaries = JSON.parse(
      await readFile(join(bookDir, "story", "state", "chapter_summaries.json"), "utf-8"),
    );
    expect(Array.isArray(summaries.rows)).toBe(true);
  });

  it("invalid markdown: pending_hooks.md with bullet-style placeholder → placeholder hooks", async () => {
    const bookDir = join(tempDir, "book-11");
    await mkdir(join(bookDir, "story"), { recursive: true });

    await writeFile(join(bookDir, "book.json"), JSON.stringify({ language: "en" }), "utf-8");
    // pending_hooks.md has bullet points but no table → parsed as placeholder hooks
    await writeFile(
      join(bookDir, "story", "pending_hooks.md"),
      "- this is a placeholder hook note\n- another placeholder note",
      "utf-8",
    );
    await writeFile(join(bookDir, "story", "current_state.md"), "", "utf-8");
    await writeFile(join(bookDir, "story", "chapter_summaries.md"), "", "utf-8");

    const result = await bootstrapStructuredStateFromMarkdown({ bookDir });

    const hooks = JSON.parse(
      await readFile(join(bookDir, "story", "state", "hooks.json"), "utf-8"),
    );
    expect(hooks.hooks).toHaveLength(2);
    expect(hooks.hooks[0].notes).toBe("this is a placeholder hook note");
    expect(hooks.hooks[0].status).toBe("open");
    expect(hooks.hooks[0].startChapter).toBe(0);
  });

  // -------------------------------------------------------------------------
  // bootstrapStructuredStateFromMarkdown — fallbackChapter parameter
  // -------------------------------------------------------------------------

  it("bootstrap: fallbackChapter used when no durable artifacts exist", async () => {
    const bookDir = join(tempDir, "book-12");
    await mkdir(join(bookDir, "story"), { recursive: true });
    // No chapters dir, no index.json, no chapter files

    await writeFile(join(bookDir, "book.json"), JSON.stringify({ language: "en" }), "utf-8");
    await writeFile(join(bookDir, "story", "current_state.md"), "", "utf-8");
    await writeFile(join(bookDir, "story", "pending_hooks.md"), "", "utf-8");
    await writeFile(join(bookDir, "story", "chapter_summaries.md"), "", "utf-8");

    const result = await bootstrapStructuredStateFromMarkdown({ bookDir, fallbackChapter: 7 });

    // Without durable artifacts, fallbackChapter = 7 drives authoritative progress
    expect(result.manifest.lastAppliedChapter).toBe(7);
  });

  // -------------------------------------------------------------------------
  // rewrite: preserves projectionVersion from existing manifest
  // -------------------------------------------------------------------------

  it("rewrite: preserves projectionVersion from existing manifest", async () => {
    const bookDir = join(tempDir, "book-13");
    await mkdir(join(bookDir, "story", "state"), { recursive: true });
    await mkdir(join(bookDir, "chapters"), { recursive: true });

    await writeFile(join(bookDir, "book.json"), JSON.stringify({ language: "en" }), "utf-8");
    await writeFile(
      join(bookDir, "story", "state", "manifest.json"),
      JSON.stringify({ schemaVersion: 2, language: "en", lastAppliedChapter: 5, projectionVersion: 42, migrationWarnings: ["old-warning"] }),
      "utf-8",
    );
    await writeFile(join(bookDir, "story", "state", "current_state.json"), JSON.stringify({ chapter: 5, facts: [] }), "utf-8");
    await writeFile(join(bookDir, "story", "state", "hooks.json"), JSON.stringify({ hooks: [] }), "utf-8");
    await writeFile(join(bookDir, "story", "state", "chapter_summaries.json"), JSON.stringify({ rows: [] }), "utf-8");
    await writeFile(join(bookDir, "story", "current_state.md"), "", "utf-8");
    await writeFile(join(bookDir, "story", "pending_hooks.md"), "", "utf-8");
    await writeFile(join(bookDir, "story", "chapter_summaries.md"), "", "utf-8");

    const result = await rewriteStructuredStateFromMarkdown({ bookDir });

    expect(result.manifest.projectionVersion).toBe(42);
    expect(result.warnings).toContain("old-warning");
  });
});
