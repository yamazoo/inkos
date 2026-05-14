import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PipelineRunner } from "../pipeline/runner.js";
import { StateManager } from "../state/manager.js";
import { WriterAgent, type WriteChapterOutput } from "../agents/writer.js";
import { StateValidatorAgent } from "../agents/state-validator.js";
import { ChapterAnalyzerAgent } from "../agents/chapter-analyzer.js";
import { LengthNormalizerAgent } from "../agents/length-normalizer.js";
import { ReviserAgent } from "../agents/reviser.js";
import { ArchitectAgent } from "../agents/architect.js";
import { PlannerAgent } from "../agents/planner.js";
import { ComposerAgent } from "../agents/composer.js";
import { ContinuityAuditor } from "../agents/continuity.js";
import { FoundationReviewerAgent } from "../agents/foundation-reviewer.js";
import { MemoryDB } from "../state/memory-db.js";
import * as memoryDbModule from "../state/memory-db.js";
import { countChapterLength } from "../utils/length-metrics.js";

const ZERO_USAGE = {
  promptTokens: 0,
  completionTokens: 0,
  totalTokens: 0,
} as const;

function createWriterOutput(overrides: Partial<WriteChapterOutput> = {}): WriteChapterOutput {
  return {
    chapterNumber: 1,
    title: "Test Chapter",
    content: "Original chapter body.",
    wordCount: "Original chapter body.".length,
    preWriteCheck: "check",
    postSettlement: "settled",
    updatedState: "# Current State\n\n| Field | Value |\n| Current Chapter | 1 |\n| Current Location | Test location |\n| Protagonist State | Test state |\n| Current Goal | Test goal |\n| Current Constraint | Test constraint |\n| Current Alliances | Test alliances |\n| Current Conflict | Test conflict |\n",
    updatedLedger: "# Particle Ledger\n\n- test particle\n",
    updatedHooks: "# Pending Hooks\n\n- new hook\n",
    chapterSummary: "| 1 | Test Chapter | Test character | Test event | Test state change | new hook | test mood | normal |\n",
    updatedSubplots: "# Subplot Board\n\n- subplot1: active\n",
    updatedEmotionalArcs: "# Emotional Arcs\n\n- character: neutral\n",
    updatedCharacterMatrix: "# Character Matrix\n\n| character | test |\n",
    postWriteErrors: [],
    postWriteWarnings: [],
    tokenUsage: ZERO_USAGE,
    ...overrides,
  };
}

function createAnalyzedOutput(overrides: Partial<WriteChapterOutput> = {}): WriteChapterOutput {
  return createWriterOutput({
    content: "Analyzed final chapter body.",
    wordCount: "Analyzed final chapter body.".length,
    updatedState: "# Current State\n\n| Field | Value |\n| Current Chapter | 1 |\n| Current Location | Analyzed location |\n| Protagonist State | Analyzed state |\n| Current Goal | Analyzed goal |\n| Current Constraint | Analyzed constraint |\n| Current Alliances | Analyzed alliances |\n| Current Conflict | Analyzed conflict |\n",
    updatedHooks: "# Pending Hooks\n\n- analyzed hook\n",
    chapterSummary: "| 1 | Analyzed Chapter | Analyzed character | Analyzed event | Analyzed state change | analyzed hook | analyzed mood | normal |\n",
    updatedSubplots: "# Subplot Board\n\n- subplot1: analyzed\n",
    updatedEmotionalArcs: "# Emotional Arcs\n\n- character: analyzed\n",
    updatedCharacterMatrix: "# Character Matrix\n\n| character | analyzed |\n",
    ...overrides,
  });
}

function createReviseOutput(overrides: Partial<{ revisedContent: string; wordCount: number; fixedIssues: string[]; updatedState: string; updatedLedger: string; updatedHooks: string; tokenUsage: typeof ZERO_USAGE }> = {}) {
  return {
    revisedContent: "Revised chapter body.",
    wordCount: "Revised chapter body.".length,
    fixedIssues: ["fixed"],
    updatedState: "# Current State\n\n| Field | Value |\n| Current Chapter | 1 |\n| Current Location | Revised location |\n| Protagonist State | Revised state |\n| Current Goal | Revised goal |\n| Current Constraint | Revised constraint |\n| Current Alliances | Revised alliances |\n| Current Conflict | Revised conflict |\n",
    updatedLedger: "# Particle Ledger\n\n- revised particle\n",
    updatedHooks: "# Pending Hooks\n\n- revised hook\n",
    tokenUsage: ZERO_USAGE,
    ...overrides,
  };
}

async function createRunnerFixture(
  configOverrides: Partial<ConstructorParameters<typeof PipelineRunner>[0]> = {},
): Promise<{
  root: string;
  runner: PipelineRunner;
  state: StateManager;
  bookId: string;
}> {
  const root = await mkdtemp(join(tmpdir(), "inkos-sync-test-"));
  const state = new StateManager(root);
  const bookId = "test-book";
  const now = "2026-03-19T00:00:00.000Z";
  const book = {
    id: bookId,
    title: "Test Book",
    platform: "tomato" as const,
    genre: "xuanhuan",
    status: "active" as const,
    targetChapters: 10,
    chapterWordCount: 3000,
    createdAt: now,
    updatedAt: now,
  };

  await state.saveBookConfig(bookId, book);
  await mkdir(join(state.bookDir(bookId), "story"), { recursive: true });
  await mkdir(join(state.bookDir(bookId), "chapters"), { recursive: true });

  const runner = new PipelineRunner({
    client: {
      provider: "openai",
      apiFormat: "chat",
      stream: false,
      defaults: {
        temperature: 0.7,
        maxTokens: 4096,
        thinkingBudget: 0, maxTokensCap: null, stripThinkingBlocks: true,
      },
    } as ConstructorParameters<typeof PipelineRunner>[0]["client"],
    model: "test-model",
    projectRoot: root,
    inputGovernanceMode: "legacy",
    ...configOverrides,
  });

  return { root, runner, state, bookId };
}

async function writeControlDocuments(bookDir: string): Promise<void> {
  await Promise.all([
    writeFile(join(bookDir, "story", "author_intent.md"), "# Author Intent\n\nTest author intent.\n", "utf-8"),
    writeFile(join(bookDir, "story", "current_focus.md"), "# Current Focus\n\nTest focus.\n", "utf-8"),
    writeFile(join(bookDir, "story", "current_state.md"), "# Current State\n\n| Field | Value |\n| --- | --- |\n| Current Chapter | 0 |\n| Current Location | Initial location |\n| Protagonist State | Initial state |\n| Current Goal | Initial goal |\n| Current Constraint | Initial constraint |\n| Current Alliances | Initial alliances |\n| Current Conflict | Initial conflict |\n", "utf-8"),
    writeFile(join(bookDir, "story", "pending_hooks.md"), "# Pending Hooks\n\n- initial hook\n", "utf-8"),
    writeFile(join(bookDir, "story", "particle_ledger.md"), "# Particle Ledger\n\n- initial particle\n", "utf-8"),
    writeFile(join(bookDir, "story", "chapter_summaries.md"), "# Chapter Summaries\n\n", "utf-8"),
    writeFile(join(bookDir, "story", "subplot_board.md"), "# Subplot Board\n\n", "utf-8"),
    writeFile(join(bookDir, "story", "emotional_arcs.md"), "# Emotional Arcs\n\n", "utf-8"),
    writeFile(join(bookDir, "story", "character_matrix.md"), "# Character Matrix\n\n| character | info |\n", "utf-8"),
    writeFile(join(bookDir, "story", "story_bible.md"), "# Story Bible\n\n- initial bible entry\n", "utf-8"),
    writeFile(join(bookDir, "story", "volume_outline.md"), "# Volume Outline\n\n## Chapter 1\nTest outline.\n", "utf-8"),
    writeFile(join(bookDir, "story", "book_rules.md"), "---\nversion: \"1.0\"\n---\n\n# Book Rules\n\n- rule1: test\n", "utf-8"),
    mkdir(join(bookDir, "story", "runtime"), { recursive: true }),
  ]);
}

async function persistChapter(
  state: StateManager,
  bookId: string,
  chapterNumber: number,
  title: string,
  body: string,
  status: "drafted" | "ready-for-review" | "approved" | "state-degraded" = "ready-for-review",
): Promise<void> {
  const bookDir = state.bookDir(bookId);
  const paddedNum = String(chapterNumber).padStart(4, "0");
  const filename = `${paddedNum}_${title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "_")}.md`;
  await writeFile(
    join(bookDir, "chapters", filename),
    `# 第${chapterNumber}章 ${title}\n\n${body}`,
    "utf-8",
  );
  const index = [...(await state.loadChapterIndex(bookId))];
  const existing = index.findIndex((e) => e.number === chapterNumber);
  const entry = {
    number: chapterNumber,
    title,
    status: status as import("../models/chapter.js").ChapterStatus,
    wordCount: body.length,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    auditIssues: [] as string[],
    lengthWarnings: [] as string[],
  };
  if (existing >= 0) {
    index[existing] = entry;
  } else {
    index.push(entry);
    index.sort((a, b) => a.number - b.number);
  }
  await state.saveChapterIndex(bookId, index);
}

describe("PipelineRunner.resyncChapterArtifacts", () => {
  beforeEach(() => {
    vi.spyOn(FoundationReviewerAgent.prototype, "review").mockResolvedValue({
      passed: true,
      totalScore: 85,
      dimensions: [],
      overallFeedback: "auto-pass for test",
    });
    vi.spyOn(LengthNormalizerAgent.prototype, "normalizeChapter").mockImplementation(
      async ({ chapterContent, lengthSpec }) => ({
        normalizedContent: chapterContent,
        finalCount: countChapterLength(chapterContent, lengthSpec.countingMode),
        applied: false,
        mode: "none",
        tokenUsage: ZERO_USAGE,
      }),
    );
    vi.spyOn(MemoryDB.prototype, "resetFacts").mockResolvedValue(undefined);
    vi.spyOn(MemoryDB.prototype, "invalidateFact").mockReturnValue(undefined);
    vi.spyOn(MemoryDB.prototype, "addFact").mockReturnValue(1);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // Rejection: book has no persisted chapters
  // -------------------------------------------------------------------------
  it("rejects when the book has no persisted chapters", async () => {
    const { root, runner, state, bookId } = await createRunnerFixture();
    await writeControlDocuments(state.bookDir(bookId));

    try {
      await expect(runner.resyncChapterArtifacts(bookId)).rejects.toThrow(
        `has no persisted chapters to sync`,
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  // -------------------------------------------------------------------------
  // Rejection: chapter not found
  // -------------------------------------------------------------------------
  it("rejects when the specified chapter number does not exist", async () => {
    const { root, runner, state, bookId } = await createRunnerFixture();
    await writeControlDocuments(state.bookDir(bookId));
    await persistChapter(state, bookId, 1, "Chapter One", "Chapter one body.");

    try {
      await expect(runner.resyncChapterArtifacts(bookId, 99)).rejects.toThrow(
        "Chapter 99 not found",
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  // -------------------------------------------------------------------------
  // Rejection: not the latest chapter
  // -------------------------------------------------------------------------
  it("rejects when the target chapter is not the latest persisted chapter", async () => {
    const { root, runner, state, bookId } = await createRunnerFixture();
    await writeControlDocuments(state.bookDir(bookId));
    await persistChapter(state, bookId, 1, "Chapter One", "Chapter one body.", "approved");
    await persistChapter(state, bookId, 2, "Chapter Two", "Chapter two body.", "approved");
    await persistChapter(state, bookId, 3, "Chapter Three", "Chapter three body.", "approved");
    await persistChapter(state, bookId, 4, "Chapter Four", "Chapter four body.", "ready-for-review");

    try {
      // Try to sync chapter 3 when 4 is the latest
      await expect(runner.resyncChapterArtifacts(bookId, 3)).rejects.toThrow(
        "Only the latest persisted chapter can be synced safely (latest is 4)",
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("rejects when syncing the penultimate chapter even if latest has lower status", async () => {
    const { root, runner, state, bookId } = await createRunnerFixture();
    await writeControlDocuments(state.bookDir(bookId));
    await persistChapter(state, bookId, 1, "Chapter One", "Chapter one body.", "approved");
    await persistChapter(state, bookId, 2, "Chapter Two", "Chapter two body.", "ready-for-review");

    try {
      // Chapter 2 is latest even though it's only ready-for-review
      await expect(runner.resyncChapterArtifacts(bookId, 1)).rejects.toThrow(
        "Only the latest persisted chapter can be synced safely (latest is 2)",
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  // -------------------------------------------------------------------------
  // Happy path: state files are updated and snapshot is created
  // -------------------------------------------------------------------------
  it("happy path: syncs the latest chapter and updates all state files", async () => {
    const { root, runner, state, bookId } = await createRunnerFixture();
    await writeControlDocuments(state.bookDir(bookId));

    // Create chapter 5 as the latest (and only) chapter
    await persistChapter(state, bookId, 5, "Chapter Five", "Chapter five body.", "drafted");

    const settledOutput = createWriterOutput({
      chapterNumber: 5,
      title: "Chapter Five",
      content: "Chapter five body.",
      wordCount: "Chapter five body.".length,
      updatedState: "# Current State\n\n| Field | Value |\n| --- | --- |\n| Current Chapter | 5 |\n| Current Location | New location |\n| Protagonist State | New protagonist state |\n| Current Goal | New goal |\n| Current Constraint | New constraint |\n| Current Alliances | New alliances |\n| Current Conflict | New conflict |\n",
      updatedHooks: "# Pending Hooks\n\n- resolved: initial hook\n- new: chapter five hook\n",
      chapterSummary: "| 5 | Chapter Five | Protagonist | Event five | New state | new hook | mood5 | normal |\n",
      updatedSubplots: "# Subplot Board\n\n- subplot1: active\n- subplot2: introduced\n",
      updatedEmotionalArcs: "# Emotional Arcs\n\n- protagonist: determined\n",
      updatedCharacterMatrix: "# Character Matrix\n\n| protagonist | info5 |\n",
    });

    vi.spyOn(WriterAgent.prototype, "settleChapterState").mockResolvedValue(settledOutput);
    vi.spyOn(StateValidatorAgent.prototype, "validate").mockResolvedValue({ warnings: [], passed: true });
    vi.spyOn(StateManager.prototype, "snapshotState").mockResolvedValue(undefined);

    try {
      const result = await runner.resyncChapterArtifacts(bookId);

      expect(result.chapterNumber).toBe(5);
      expect(result.title).toBe("Chapter Five");
      expect(result.revised).toBe(false);
      expect(result.auditResult.passed).toBe(true);
      expect(["ready-for-review", "audit-failed"]).toContain(result.status);

      const bookDir = state.bookDir(bookId);
      const storyDir = join(bookDir, "story");

      // Verify current_state.md was updated
      const currentState = await readFile(join(storyDir, "current_state.md"), "utf-8");
      expect(currentState).toContain("New location");
      expect(currentState).toContain("New protagonist state");

      // Verify pending_hooks.md was updated
      const pendingHooks = await readFile(join(storyDir, "pending_hooks.md"), "utf-8");
      expect(pendingHooks).toContain("chapter five hook");

      // Verify chapter_summaries.md was updated
      const chapterSummaries = await readFile(join(storyDir, "chapter_summaries.md"), "utf-8");
      expect(chapterSummaries).toContain("5");
      expect(chapterSummaries).toContain("Chapter Five");

      // Verify subplot_board.md was updated
      const subplotBoard = await readFile(join(storyDir, "subplot_board.md"), "utf-8");
      expect(subplotBoard).toContain("subplot2");

      // Verify emotional_arcs.md was updated
      const emotionalArcs = await readFile(join(storyDir, "emotional_arcs.md"), "utf-8");
      expect(emotionalArcs).toContain("determined");

      // Verify character_matrix.md was updated
      const characterMatrix = await readFile(join(storyDir, "character_matrix.md"), "utf-8");
      expect(characterMatrix).toContain("info5");

      // Verify index status was updated to ready-for-review
      const index = await state.loadChapterIndex(bookId);
      const ch5 = index.find((e) => e.number === 5);
      expect(ch5?.status).toBe("ready-for-review");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  // -------------------------------------------------------------------------
  // Snapshot creation
  // -------------------------------------------------------------------------
  it("creates a snapshot after successful sync", async () => {
    const { root, runner, state, bookId } = await createRunnerFixture();
    await writeControlDocuments(state.bookDir(bookId));
    await persistChapter(state, bookId, 1, "Chapter One", "Chapter one body.", "drafted");

    const settledOutput = createWriterOutput({
      chapterNumber: 1,
      title: "Chapter One",
      content: "Chapter one body.",
      wordCount: "Chapter one body.".length,
      updatedState: "# Current State\n\n| Field | Value |\n| --- | --- |\n| Current Chapter | 1 |\n| Current Location | Post-ch1 location |\n| Protagonist State | Post-ch1 state |\n| Current Goal | Post-ch1 goal |\n| Current Constraint | Post-ch1 constraint |\n| Current Alliances | Post-ch1 alliances |\n| Current Conflict | Post-ch1 conflict |\n",
      updatedHooks: "# Pending Hooks\n\n- ch1 hook\n",
      chapterSummary: "| 1 | Chapter One | P1 | E1 | S1 | ch1 hook | mood1 | normal |\n",
      updatedSubplots: "# Subplot Board\n\n",
      updatedEmotionalArcs: "# Emotional Arcs\n\n",
      updatedCharacterMatrix: "# Character Matrix\n\n| p1 | info1 |\n",
    });

    vi.spyOn(WriterAgent.prototype, "settleChapterState").mockResolvedValue(settledOutput);
    vi.spyOn(StateValidatorAgent.prototype, "validate").mockResolvedValue({ warnings: [], passed: true });

    try {
      await runner.resyncChapterArtifacts(bookId);

      const bookDir = state.bookDir(bookId);
      const snapshotDir = join(bookDir, "story", "snapshots", "1");

      // Snapshot directory should exist
      const snapStat = await stat(snapshotDir);
      expect(snapStat.isDirectory()).toBe(true);

      // Snapshot should contain state files
      const snapState = await readFile(join(snapshotDir, "current_state.md"), "utf-8");
      expect(snapState).toContain("Post-ch1 location");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  // -------------------------------------------------------------------------
  // Retry on validation failure
  // -------------------------------------------------------------------------
  it("retries settlement when initial validation fails", async () => {
    const { root, runner, state, bookId } = await createRunnerFixture();
    await writeControlDocuments(state.bookDir(bookId));
    await persistChapter(state, bookId, 1, "Chapter One", "Chapter one body.", "drafted");

    const failedOutput = createWriterOutput({
      chapterNumber: 1,
      title: "Chapter One",
      content: "Chapter one body.",
      wordCount: "Chapter one body.".length,
      updatedState: "# Current State\n\n| Field | Value |\n| --- | --- |\n| Current Chapter | 1 |\n| Current Location | Failed location |\n| Protagonist State | Failed state |\n| Current Goal | Failed goal |\n| Current Constraint | Failed constraint |\n| Current Alliances | Failed alliances |\n| Current Conflict | Failed conflict |\n",
      updatedHooks: "# Pending Hooks\n\n- failed hook\n",
      chapterSummary: "| 1 | Chapter One | F | E | S | failed hook | mood | normal |\n",
      updatedSubplots: "# Subplot Board\n\n",
      updatedEmotionalArcs: "# Emotional Arcs\n\n",
      updatedCharacterMatrix: "# Character Matrix\n\n",
    });

    const recoveredOutput = createWriterOutput({
      chapterNumber: 1,
      title: "Chapter One",
      content: "Chapter one body.",
      wordCount: "Chapter one body.".length,
      updatedState: "# Current State\n\n| Field | Value |\n| --- | --- |\n| Current Chapter | 1 |\n| Current Location | Recovered location |\n| Protagonist State | Recovered state |\n| Current Goal | Recovered goal |\n| Current Constraint | Recovered constraint |\n| Current Alliances | Recovered alliances |\n| Current Conflict | Recovered conflict |\n",
      updatedHooks: "# Pending Hooks\n\n- recovered hook\n",
      chapterSummary: "| 1 | Chapter One | R | E | S | recovered hook | mood | normal |\n",
      updatedSubplots: "# Subplot Board\n\n",
      updatedEmotionalArcs: "# Emotional Arcs\n\n",
      updatedCharacterMatrix: "# Character Matrix\n\n",
    });

    let callCount = 0;
    vi.spyOn(WriterAgent.prototype, "settleChapterState").mockImplementation(async () => {
      callCount++;
      return callCount === 1 ? failedOutput : recoveredOutput;
    });

    // First validation fails, second passes
    vi.spyOn(StateValidatorAgent.prototype, "validate").mockImplementation(
      async (_content, _chapterNumber, _oldState, newState, _oldHooks, newHooks, _lang) => ({
        warnings: [],
        passed: callCount >= 2 && newState.includes("Recovered"),
      }),
    );

    try {
      const result = await runner.resyncChapterArtifacts(bookId);

      // settleChapterState should have been called twice (initial + retry)
      expect(WriterAgent.prototype.settleChapterState).toHaveBeenCalledTimes(2);
      expect(result.auditResult.passed).toBe(true);

      const bookDir = state.bookDir(bookId);
      const currentState = await readFile(join(bookDir, "story", "current_state.md"), "utf-8");
      expect(currentState).toContain("Recovered location");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  // -------------------------------------------------------------------------
  // Throws when retry also fails
  // -------------------------------------------------------------------------
  it("throws when retry settlement still fails validation", async () => {
    const { root, runner, state, bookId } = await createRunnerFixture();
    await writeControlDocuments(state.bookDir(bookId));
    await persistChapter(state, bookId, 1, "Chapter One", "Chapter one body.", "drafted");

    const badOutput = createWriterOutput({
      chapterNumber: 1,
      title: "Chapter One",
      content: "Chapter one body.",
      wordCount: "Chapter one body.".length,
      updatedState: "# Current State\n\n| Field | Value |\n| --- | --- |\n| Current Chapter | 1 |\n| Current Location | Bad location |\n| Protagonist State | Bad state |\n| Current Goal | Bad goal |\n| Current Constraint | Bad constraint |\n| Current Alliances | Bad alliances |\n| Current Conflict | Bad conflict |\n",
      updatedHooks: "# Pending Hooks\n\n- bad hook\n",
      chapterSummary: "| 1 | Chapter One | B | E | S | bad hook | mood | normal |\n",
      updatedSubplots: "# Subplot Board\n\n",
      updatedEmotionalArcs: "# Emotional Arcs\n\n",
      updatedCharacterMatrix: "# Character Matrix\n\n",
    });

    vi.spyOn(WriterAgent.prototype, "settleChapterState").mockResolvedValue(badOutput);
    vi.spyOn(StateValidatorAgent.prototype, "validate").mockResolvedValue({
      warnings: [{ category: "test-category", description: "validation still failing" }],
      passed: false,
    });

    try {
      await expect(runner.resyncChapterArtifacts(bookId)).rejects.toThrow("validation still failing");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  // -------------------------------------------------------------------------
  // Status resolution: state-degraded chapter without reviewNote → ready-for-review
  // -------------------------------------------------------------------------
  it("resolves status to ready-for-review when syncing a state-degraded chapter without reviewNote", async () => {
    const { root, runner, state, bookId } = await createRunnerFixture();
    await writeControlDocuments(state.bookDir(bookId));
    await persistChapter(state, bookId, 1, "Chapter One", "Chapter one body.", "state-degraded");

    const settledOutput = createWriterOutput({
      chapterNumber: 1,
      title: "Chapter One",
      content: "Chapter one body.",
      wordCount: "Chapter one body.".length,
      updatedState: "# Current State\n\n| Field | Value |\n| --- | --- |\n| Current Chapter | 1 |\n| Current Location | Fixed location |\n| Protagonist State | Fixed state |\n| Current Goal | Fixed goal |\n| Current Constraint | Fixed constraint |\n| Current Alliances | Fixed alliances |\n| Current Conflict | Fixed conflict |\n",
      updatedHooks: "# Pending Hooks\n\n- fixed hook\n",
      chapterSummary: "| 1 | Chapter One | F | E | S | fixed hook | mood | normal |\n",
      updatedSubplots: "# Subplot Board\n\n",
      updatedEmotionalArcs: "# Emotional Arcs\n\n",
      updatedCharacterMatrix: "# Character Matrix\n\n",
    });

    vi.spyOn(WriterAgent.prototype, "settleChapterState").mockResolvedValue(settledOutput);
    vi.spyOn(StateValidatorAgent.prototype, "validate").mockResolvedValue({ warnings: [], passed: true });

    try {
      const result = await runner.resyncChapterArtifacts(bookId);

      // state-degraded chapter without injected issues → resolveStateDegradedBaseStatus returns ready-for-review
      expect(result.status).toBe("ready-for-review");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  // -------------------------------------------------------------------------
  // Status resolution: regular chapter becomes ready-for-review
  // -------------------------------------------------------------------------
  it("sets status to ready-for-review after successful sync of a drafted chapter", async () => {
    const { root, runner, state, bookId } = await createRunnerFixture();
    await writeControlDocuments(state.bookDir(bookId));
    await persistChapter(state, bookId, 1, "Chapter One", "Chapter one body.", "drafted");

    const settledOutput = createWriterOutput({
      chapterNumber: 1,
      title: "Chapter One",
      content: "Chapter one body.",
      wordCount: "Chapter one body.".length,
      updatedState: "# Current State\n\n| Field | Value |\n| --- | --- |\n| Current Chapter | 1 |\n| Current Location | Ready location |\n| Protagonist State | Ready state |\n| Current Goal | Ready goal |\n| Current Constraint | Ready constraint |\n| Current Alliances | Ready alliances |\n| Current Conflict | Ready conflict |\n",
      updatedHooks: "# Pending Hooks\n\n- ready hook\n",
      chapterSummary: "| 1 | Chapter One | R | E | S | ready hook | mood | normal |\n",
      updatedSubplots: "# Subplot Board\n\n",
      updatedEmotionalArcs: "# Emotional Arcs\n\n",
      updatedCharacterMatrix: "# Character Matrix\n\n",
    });

    vi.spyOn(WriterAgent.prototype, "settleChapterState").mockResolvedValue(settledOutput);
    vi.spyOn(StateValidatorAgent.prototype, "validate").mockResolvedValue({ warnings: [], passed: true });

    try {
      const result = await runner.resyncChapterArtifacts(bookId);

      expect(result.status).toBe("ready-for-review");
      expect(result.auditResult.passed).toBe(true);

      const index = await state.loadChapterIndex(bookId);
      const ch1 = index.find((e) => e.number === 1);
      expect(ch1?.status).toBe("ready-for-review");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  // -------------------------------------------------------------------------
  // Explicit chapter number: syncs that specific chapter if it is latest
  // -------------------------------------------------------------------------
  it("accepts an explicit chapter number that is the latest chapter", async () => {
    const { root, runner, state, bookId } = await createRunnerFixture();
    await writeControlDocuments(state.bookDir(bookId));
    await persistChapter(state, bookId, 1, "Chapter One", "Chapter one body.", "approved");
    await persistChapter(state, bookId, 2, "Chapter Two", "Chapter two body.", "ready-for-review");

    const settledOutput = createWriterOutput({
      chapterNumber: 2,
      title: "Chapter Two",
      content: "Chapter two body.",
      wordCount: "Chapter two body.".length,
      updatedState: "# Current State\n\n| Field | Value |\n| --- | --- |\n| Current Chapter | 2 |\n| Current Location | Ch2 location |\n| Protagonist State | Ch2 state |\n| Current Goal | Ch2 goal |\n| Current Constraint | Ch2 constraint |\n| Current Alliances | Ch2 alliances |\n| Current Conflict | Ch2 conflict |\n",
      updatedHooks: "# Pending Hooks\n\n- ch2 hook\n",
      chapterSummary: "| 2 | Chapter Two | P2 | E2 | S2 | ch2 hook | mood2 | normal |\n",
      updatedSubplots: "# Subplot Board\n\n",
      updatedEmotionalArcs: "# Emotional Arcs\n\n",
      updatedCharacterMatrix: "# Character Matrix\n\n| p2 | info2 |\n",
    });

    vi.spyOn(WriterAgent.prototype, "settleChapterState").mockResolvedValue(settledOutput);
    vi.spyOn(StateValidatorAgent.prototype, "validate").mockResolvedValue({ warnings: [], passed: true });

    try {
      const result = await runner.resyncChapterArtifacts(bookId, 2);

      expect(result.chapterNumber).toBe(2);
      expect(result.title).toBe("Chapter Two");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  // -------------------------------------------------------------------------
  // Default to latest chapter when no number given
  // -------------------------------------------------------------------------
  it("defaults to the latest chapter when no chapter number is provided", async () => {
    const { root, runner, state, bookId } = await createRunnerFixture();
    await writeControlDocuments(state.bookDir(bookId));
    await persistChapter(state, bookId, 1, "Chapter One", "Chapter one body.", "approved");
    await persistChapter(state, bookId, 2, "Chapter Two", "Chapter two body.", "ready-for-review");

    const settledOutput = createWriterOutput({
      chapterNumber: 2,
      title: "Chapter Two",
      content: "Chapter two body.",
      wordCount: "Chapter two body.".length,
      updatedState: "# Current State\n\n| Field | Value |\n| --- | --- |\n| Current Chapter | 2 |\n| Current Location | Default latest |\n| Protagonist State | Default state |\n| Current Goal | Default goal |\n| Current Constraint | Default constraint |\n| Current Alliances | Default alliances |\n| Current Conflict | Default conflict |\n",
      updatedHooks: "# Pending Hooks\n\n- default hook\n",
      chapterSummary: "| 2 | Chapter Two | P2 | E2 | S2 | default hook | mood2 | normal |\n",
      updatedSubplots: "# Subplot Board\n\n",
      updatedEmotionalArcs: "# Emotional Arcs\n\n",
      updatedCharacterMatrix: "# Character Matrix\n\n",
    });

    vi.spyOn(WriterAgent.prototype, "settleChapterState").mockResolvedValue(settledOutput);
    vi.spyOn(StateValidatorAgent.prototype, "validate").mockResolvedValue({ warnings: [], passed: true });

    try {
      // Call without chapter number — should default to latest (chapter 2)
      const result = await runner.resyncChapterArtifacts(bookId);

      expect(result.chapterNumber).toBe(2);
      expect(WriterAgent.prototype.settleChapterState).toHaveBeenCalledWith(
        expect.objectContaining({ chapterNumber: 2 }),
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});