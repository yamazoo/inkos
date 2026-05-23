import { Command } from "commander";
import { readFile, writeFile, mkdir, unlink } from "node:fs/promises";
import { join } from "node:path";
import {
  PackagerAgent,
  StateManager,
  PackageCandidatesStateSchema,
  type PackageCandidatesState,
  type PackageResult,
} from "@actalk/inkos-core";
import { loadConfig, createClient, findProjectRoot, resolveBookId, log, logError } from "../utils.js";

const CANDIDATES_FILE = "package_candidates.json";
const EXPIRY_DAYS = 7;

function candidatesPath(root: string, bookId: string): string {
  return join(root, "books", bookId, "story", "runtime", CANDIDATES_FILE);
}

async function loadCandidates(root: string, bookId: string): Promise<PackageCandidatesState | null> {
  try {
    const raw = await readFile(candidatesPath(root, bookId), "utf-8");
    const parsed = JSON.parse(raw);
    const state = PackageCandidatesStateSchema.parse(parsed);
    if (new Date(state.expiresAt) < new Date()) return null;
    return state;
  } catch {
    return null;
  }
}

async function cleanExpiredCandidates(root: string, bookId: string): Promise<boolean> {
  try {
    const raw = await readFile(candidatesPath(root, bookId), "utf-8");
    const parsed = JSON.parse(raw);
    const state = PackageCandidatesStateSchema.parse(parsed);
    if (new Date(state.expiresAt) < new Date()) {
      await unlink(candidatesPath(root, bookId));
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

async function saveCandidates(root: string, bookId: string, result: PackageResult): Promise<string> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  const state: PackageCandidatesState = {
    bookId,
    generatedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    candidates: result.candidates,
    genre: result.genre,
    sourcePatternSummary: result.sourcePatternSummary,
  };

  const dir = join(root, "books", bookId, "story", "runtime");
  await mkdir(dir, { recursive: true });
  const filePath = candidatesPath(root, bookId);
  await writeFile(filePath, JSON.stringify(state, null, 2), "utf-8");
  return filePath;
}

export const packageCommand = new Command("package")
  .description("Generate optimized title/synopsis candidates for Tomato platform");

// Subcommand: generate (default action)
packageCommand
  .argument("[book-id]", "Book ID (auto-detected if only one book exists)")
  .option("-n, --count <n>", "Number of candidates to generate", "5")
  .option("--json", "Output JSON")
  .action(async (bookIdArg: string | undefined, opts: { count: string; json?: boolean }) => {
    try {
      const root = findProjectRoot();
      const bookId = await resolveBookId(bookIdArg, root);
      const state = new StateManager(root);
      const book = await state.loadBookConfig(bookId);
      const count = parseInt(opts.count, 10);

      if (!opts.json) log(`Generating ${count} packaging candidates for "${book.title}"...`);

      const config = await loadConfig({ requireApiKey: true });
      const client = createClient(config);
      const agent = new PackagerAgent({
        client,
        model: config.llm.model,
        projectRoot: root,
        bookId,
      });

      const result = await agent.generate({
        bookTitle: book.title,
        genre: book.genre,
        count,
      });

      const filePath = await saveCandidates(root, bookId, result);

      if (opts.json) {
        log(JSON.stringify({ ...result, savedTo: filePath }, null, 2));
      } else {
        log(`\nGenerated ${result.candidates.length} candidates:\n`);
        for (let i = 0; i < result.candidates.length; i++) {
          const c = result.candidates[i];
          const avg = ((c.score.suspense + c.score.genreClarity + c.score.contentAlignment) / 3).toFixed(1);
          log(`  ${i + 1}. 「${c.title}」 (avg: ${avg})`);
          log(`     ${c.synopsis}`);
          log(`     悬念:${c.score.suspense} 类型:${c.score.genreClarity} 匹配:${c.score.contentAlignment}`);
          log("");
        }
        log(`Pattern analysis: ${result.sourcePatternSummary}`);
        log(`\nCandidates saved to ${filePath}`);
        log(`Use: inkos package select ${bookId} --title "..." --synopsis "..."`);
      }
    } catch (e) {
      if (opts?.json) {
        log(JSON.stringify({ error: String(e) }));
      } else {
        logError(`Package generation failed: ${e}`);
      }
      process.exit(1);
    }
  });

// Subcommand: list
packageCommand
  .command("list")
  .description("Display stored packaging candidates")
  .argument("[book-id]", "Book ID")
  .option("--json", "Output JSON")
  .action(async (bookIdArg: string | undefined, opts: { json?: boolean }) => {
    try {
      const root = findProjectRoot();
      const bookId = await resolveBookId(bookIdArg, root);
      const stored = await loadCandidates(root, bookId);

      if (!stored) {
        // Auto-clean expired file if present
        const cleaned = await cleanExpiredCandidates(root, bookId);
        if (opts.json) {
          log(JSON.stringify({ candidates: [], message: cleaned ? "Expired candidates cleaned" : "No candidates found" }));
        } else {
          log(cleaned ? "Expired candidates cleaned up." : "No packaging candidates found. Run: inkos package <book-id>");
        }
        return;
      }

      if (opts.json) {
        log(JSON.stringify(stored, null, 2));
      } else {
        log(`Candidates for book "${stored.bookId}" (generated: ${stored.generatedAt}):\n`);
        for (let i = 0; i < stored.candidates.length; i++) {
          const c = stored.candidates[i];
          const avg = ((c.score.suspense + c.score.genreClarity + c.score.contentAlignment) / 3).toFixed(1);
          log(`  ${i + 1}. 「${c.title}」 (avg: ${avg})`);
          log(`     ${c.synopsis}`);
          log("");
        }
        log(`Expires: ${stored.expiresAt}`);
      }
    } catch (e) {
      if (opts?.json) {
        log(JSON.stringify({ error: String(e) }));
      } else {
        logError(`Package list failed: ${e}`);
      }
      process.exit(1);
    }
  });

// Subcommand: select
packageCommand
  .command("select")
  .description("Apply a title/synopsis choice to the book")
  .argument("[book-id]", "Book ID")
  .requiredOption("--title <title>", "Selected title")
  .requiredOption("--synopsis <synopsis>", "Selected synopsis")
  .option("--json", "Output JSON")
  .action(async (bookIdArg: string | undefined, opts: { title: string; synopsis: string; json?: boolean }) => {
    try {
      const root = findProjectRoot();
      const bookId = await resolveBookId(bookIdArg, root);
      const state = new StateManager(root);
      const book = await state.loadBookConfig(bookId);

      // Snapshot current book.json for rollback
      const snapshotDir = join(root, "books", bookId, "story", "snapshots");
      await mkdir(snapshotDir, { recursive: true });
      const snapshotFile = join(snapshotDir, `package_${Date.now()}.json`);
      await writeFile(snapshotFile, JSON.stringify(book, null, 2), "utf-8");

      // Apply new title/synopsis
      const updatedBook = {
        ...book,
        title: opts.title,
        synopsis: opts.synopsis,
        updatedAt: new Date().toISOString(),
      };
      const bookDir = join(root, "books", bookId);
      await state.saveBookConfigAt(bookDir, updatedBook);

      if (opts.json) {
        log(JSON.stringify({ bookId, title: opts.title, synopsis: opts.synopsis, snapshot: snapshotFile }, null, 2));
      } else {
        log(`Book "${bookId}" updated:`);
        log(`  Title: ${opts.title}`);
        log(`  Synopsis: ${opts.synopsis}`);
        log(`  Snapshot saved: ${snapshotFile}`);
        log(`\nTo undo: copy ${snapshotFile} back to books/${bookId}/book.json`);
      }
    } catch (e) {
      if (opts?.json) {
        log(JSON.stringify({ error: String(e) }));
      } else {
        logError(`Package select failed: ${e}`);
      }
      process.exit(1);
    }
  });

// Subcommand: clean
packageCommand
  .command("clean")
  .description("Remove expired packaging candidates")
  .argument("[book-id]", "Book ID")
  .option("--json", "Output JSON")
  .action(async (bookIdArg: string | undefined, opts: { json?: boolean }) => {
    try {
      const root = findProjectRoot();
      const bookId = await resolveBookId(bookIdArg, root);
      const cleaned = await cleanExpiredCandidates(root, bookId);

      if (opts.json) {
        log(JSON.stringify({ cleaned, bookId }));
      } else {
        log(cleaned
          ? `Cleaned expired candidates for "${bookId}".`
          : `No expired candidates found for "${bookId}".`);
      }
    } catch (e) {
      if (opts?.json) {
        log(JSON.stringify({ error: String(e) }));
      } else {
        logError(`Package clean failed: ${e}`);
      }
      process.exit(1);
    }
  });
