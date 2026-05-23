import { Command } from "commander";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import {
  CoverAgent,
  StateManager,
  type CoverOutput,
} from "@actalk/inkos-core";
import { loadConfig, createClient, findProjectRoot, resolveBookId, log, logError } from "../utils.js";

function renderCoverMarkdown(output: CoverOutput): string {
  const lines: string[] = [
    `# 封面候选 — ${output.bookId}`,
    "",
    `> 生成时间：${output.generatedAt}`,
    "",
  ];

  for (const c of output.candidates) {
    lines.push("---", "");
    lines.push(`## ${c.index}. ${c.title}`);
    lines.push("");
    lines.push(`**风格标签**：${c.styleTag}`);
    lines.push("");
    lines.push("**封面提示词**：");
    lines.push("");
    lines.push("```");
    lines.push(c.coverPrompt);
    lines.push("```");
    lines.push("");
    lines.push("**爽点简介**：");
    lines.push("");
    lines.push(c.synopsis);
    lines.push("");
  }

  return lines.join("\n");
}

export const coverCommand = new Command("cover")
  .description("Generate book cover prompts + hook synopses (6 variants for Doubao)")
  .argument("[book-id]", "Book ID (auto-detected if only one book exists)")
  .option("--json", "Output JSON")
  .option("--context <text>", "Extra context or requirements")
  .action(async (bookIdArg: string | undefined, opts: { json?: boolean; context?: string }) => {
    try {
      const root = findProjectRoot();
      const bookId = await resolveBookId(bookIdArg, root);
      const state = new StateManager(root);
      const book = await state.loadBookConfig(bookId);

      if (!opts.json) log(`Generating 6 cover candidates for "${book.title}"...`);

      const config = await loadConfig({ requireApiKey: true });
      const client = createClient(config);
      const agent = new CoverAgent({
        client,
        model: config.llm.model,
        projectRoot: root,
        bookId,
      });

      const result = await agent.generate({
        bookId,
        bookTitle: book.title,
        genre: book.genre,
        bookDir: join(root, "books", bookId),
        extraContext: opts.context,
      });

      // Save outputs
      const coverDir = join(root, "books", bookId, "story", "cover");
      await mkdir(coverDir, { recursive: true });

      const jsonPath = join(coverDir, "cover_candidates.json");
      const mdPath = join(coverDir, "cover_candidates.md");

      await writeFile(jsonPath, JSON.stringify(result, null, 2), "utf-8");
      await writeFile(mdPath, renderCoverMarkdown(result), "utf-8");

      if (opts.json) {
        log(JSON.stringify({ ...result, savedTo: jsonPath }, null, 2));
      } else {
        log(`\nGenerated ${result.candidates.length} cover candidates:\n`);
        for (const c of result.candidates) {
          log(`  ${c.index}. 「${c.title}」 [${c.styleTag}]`);
          log(`     简介: ${c.synopsis.slice(0, 80)}${c.synopsis.length > 80 ? "..." : ""}`);
          log(`     提示词长度: ${c.coverPrompt.length}字符`);
          log("");
        }
        log(`JSON saved to: ${jsonPath}`);
        log(`Markdown saved to: ${mdPath}`);
        log(`\n将封面提示词粘贴到豆包生成 600x800 封面图。`);
      }
    } catch (e) {
      if (opts?.json) {
        log(JSON.stringify({ error: String(e) }));
      } else {
        logError(`Cover generation failed: ${e}`);
      }
      process.exit(1);
    }
  });
