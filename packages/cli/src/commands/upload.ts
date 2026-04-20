import { Command } from "commander";
import { StateManager, type Platform } from "@actalk/inkos-core";
import { findProjectRoot, resolveBookId, log, logError } from "../utils.js";

export function createUploadCommand(): Command {
  const upload = new Command("upload")
    .description("Upload chapters to publishing platforms (番茄小说 etc.)");

  // Login subcommand
  upload
    .command("login")
    .description("Log in to a publishing platform (opens browser)")
    .requiredOption("--platform <platform>", "Platform: tomato")
    .action(async (opts) => {
      const root = findProjectRoot();
      const platform = opts.platform as Platform;

      if (platform !== "tomato") {
        logError(`Unsupported platform: ${platform}. Only 'tomato' is supported.`);
        process.exit(1);
      }

      const { Uploader } = await import("@actalk/inkos-core").catch(() => {
        throw new Error("Upload module not available. Install @actalk/inkos-core from source.");
      });

      const { launchBrowser, saveCookies, loadCookies } = await import(
        "@actalk/inkos-core"
      ).catch(() => {
        throw new Error("Upload module not available.");
      });

      log(`Launching browser for ${platform} login...`);

      const { browser, context, page, close } = await launchBrowser(false);
      try {
        const TomatoPlatform = (await import("@actalk/inkos-core").catch(() => {
          throw new Error("Upload module not available.");
        })).TomatoPlatformAdapter;

        const adapter = new TomatoPlatform();
        await adapter.login(page, "");

        log("Waiting for login in browser window...");
        const { waitForUserLogin } = await import("@actalk/inkos-core").catch(() => {
          throw new Error("Upload module not available.");
        });

        const success = await waitForUserLogin(page);
        if (!success) {
          logError("Login timed out. Please try again.");
          process.exit(1);
        }

        await saveCookies(context, platform, "default");
        log(`Login successful. Cookies saved to ~/.inkos/cookies/${platform}/default.json`);
      } finally {
        await close();
      }
    });

  // Calibrate subcommand
  upload
    .command("calibrate")
    .description("Auto-calibrate selectors for the upload page (opens browser, login, auto-detect)")
    .argument("[book-id]", "Book ID (auto-detected if only one book)")
    .action(async (bookIdArg: string | undefined) => {
      try {
        const root = findProjectRoot();
        const bookId = await resolveBookId(bookIdArg, root);
        const state = new StateManager(root);
        const book = await state.loadBookConfig(bookId);

        if (book.platform !== "tomato") {
          logError(`Calibration only supports 'tomato' platform. Current: '${book.platform}'`);
          process.exit(1);
        }

        const { calibrateSelectors, saveSelectorTemplate } = await import("@actalk/inkos-core");
        const { launchBrowser } = await import("@actalk/inkos-core");

        log(`Opening browser for selector calibration...`);
        log(`Please log in to fanqie novel and navigate to the chapter publish page.`);

        const { browser, page, close } = await launchBrowser(false);

        try {
          // Use a default publish URL for calibration — the page URL will be captured when ready
          const defaultUrl = "https://fanqienovel.com/main/writer/7615867694440516632/publish/7617813445257216574?enter_from=newchapter_1";
          await page.goto(defaultUrl, { waitUntil: "domcontentloaded", timeout: 90_000 });

          const bundle = await calibrateSelectors(
            defaultUrl,
            (msg: string) => log(msg),
          );

          const path = await saveSelectorTemplate(bundle, defaultUrl);
          log(`Selectors calibrated and saved to: ${path}`);
          log(`Chapter no selectors: ${bundle.chapter_no_selectors.split("||")[0]}`);
          log(`Content selectors: ${bundle.content_selectors.split("||")[0]}`);
          log(`Publish button: ${bundle.publish_button_selectors.split("||")[0]}`);
        } finally {
          await close();
        }
      } catch (e) {
        logError(`Calibration failed: ${e}`);
        process.exit(1);
      }
    });

  // Status subcommand
  upload
    .command("status")
    .description("Show upload status for all chapters")
    .argument("[book-id]", "Book ID (auto-detected if only one book)")
    .option("--json", "Output JSON")
    .action(async (bookIdArg: string | undefined, opts) => {
      try {
        const root = findProjectRoot();
        const bookId = await resolveBookId(bookIdArg, root);
        const state = new StateManager(root);
        const index = await state.loadChapterIndex(bookId);
        const book = await state.loadBookConfig(bookId);

        const { Uploader } = await import("@actalk/inkos-core").catch(() => {
          throw new Error("Upload module not available.");
        });

        const uploader = new Uploader(root, bookId, book.platform as Platform, index);

        const summary = await uploader.getUploadStatus();

        if (opts.json) {
          log(JSON.stringify(summary, null, 2));
        } else {
          log(`\nUpload status for "${book.title}" (${bookId}) on ${book.platform}:`);
          log(`  Total: ${summary.total} | Uploaded: ${summary.uploaded} | Failed: ${summary.failed} | Pending: ${summary.skipped}`);
          for (const ch of summary.chapters) {
            const icon = ch.status === "uploaded" ? "[✓]" : ch.status === "failed" ? "[✗]" : "[ ]";
            log(`  ${icon} Ch.${ch.chapter} "${ch.title}"${ch.error ? ` — ${ch.error}` : ""}`);
          }
        }
      } catch (e) {
        logError(`Failed to get upload status: ${e}`);
        process.exit(1);
      }
    });

  // Main upload command
  upload
    .description("Upload chapters to publishing platform")
    .argument("[book-id]", "Book ID (auto-detected if only one book)")
    .option("--chapters <range>", "Chapter range, e.g. 1-10 or 5 (default: all pending)")
    .option("--approved-only", "Only upload approved chapters (default: true for no --chapters)")
    .option("--dry-run", "Preview what would be uploaded without uploading")
    .option("--max-per-hour <number>", "Rate limit: max chapters per hour", String(3))
    .option("--json", "Output JSON")
    .action(async (bookIdArg: string | undefined, opts) => {
      try {
        const root = findProjectRoot();
        const bookId = await resolveBookId(bookIdArg, root);
        const state = new StateManager(root);
        const index = await state.loadChapterIndex(bookId);
        const book = await state.loadBookConfig(bookId);

        const { Uploader } = await import("@actalk/inkos-core").catch(() => {
          throw new Error("Upload module not available. Build the project with 'pnpm build'.");
        });

        const uploader = new Uploader(root, bookId, book.platform as Platform, index, {
          chapters: opts.chapters,
          approvedOnly: Boolean(opts.approvedOnly),
          dryRun: Boolean(opts.dryRun),
          maxChaptersPerHour: Number(opts.maxPerHour),
        });

        await uploader.initialize();

        const summary = await uploader.uploadChapters();

        if (opts.json) {
          log(JSON.stringify(summary, null, 2));
        } else {
          if (opts.dryRun) {
            log(`\nDry run — ${summary.total} chapters would be uploaded:`);
          } else {
            log(`\nUpload complete: ${summary.uploaded}/${summary.total} succeeded`);
          }
          for (const ch of summary.chapters) {
            const icon = ch.status === "uploaded" ? "[✓]" : ch.status === "failed" ? "[✗]" : "[ ]";
            log(`  ${icon} Ch.${ch.chapter} "${ch.title}"${ch.error ? ` — ${ch.error}` : ""}`);
          }
        }

        await uploader.close();
        process.exit(summary.failed > 0 ? 1 : 0);
      } catch (e) {
        logError(`Upload failed: ${e}`);
        process.exit(1);
      }
    });

  return upload;
}

export const uploadCommand = createUploadCommand();
