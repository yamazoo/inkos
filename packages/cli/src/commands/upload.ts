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

      const { launchBrowser, saveCookies } = await import("@actalk/inkos-core");

      log(`Launching browser for ${platform} login...`);

      const { context, page, close } = await launchBrowser(false);
      try {
        const { TomatoPlatformAdapter } = await import("@actalk/inkos-core");
        const adapter = new TomatoPlatformAdapter();
        await adapter.login(page, "");

        log("Waiting for login in browser window...");
        const { waitForUserLogin } = await import("@actalk/inkos-core");

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

        const { calibrateSelectors, saveSelectorTemplate, launchBrowser, loadCookies } = await import("@actalk/inkos-core");

        log("Opening browser for selector calibration...");

        const { context, page, close } = await launchBrowser(false);

        try {
          // Load cookies and navigate to chapter management
          await loadCookies(context, "tomato", "default");
          const platformBookId = book.platformBookId;
          if (!platformBookId) {
            logError("platformBookId not set in book.json. Run 'inkos book update' first.");
            process.exit(1);
          }
          const manageUrl = `https://fanqienovel.com/main/writer/chapter-manage/${platformBookId}&${encodeURIComponent(book.title)}?type=1`;
          await page.goto(manageUrl, { waitUntil: "networkidle", timeout: 60_000 });
          await page.waitForTimeout(3000);
          log("已打开章节管理页面，点击新建章节...");

          // Click "新建章节" and switch to new tab
          const newPagePromise = context.waitForEvent("page", { timeout: 30_000 });
          const createBtn = page.locator("text=新建章节").first();
          await createBtn.click({ timeout: 30_000 });
          const editorPage = await newPagePromise;
          await editorPage.waitForLoadState("domcontentloaded");
          log("已进入编辑器页面，开始校准...");

          log("等待编辑器页面加载...");
          await editorPage.waitForLoadState("networkidle");
          await editorPage.waitForTimeout(3000);

          // Run calibration on the existing editor page
          const { capturePageSnapshot, deriveSelectorBundle } = await import("@actalk/inkos-core");
          log("正在检测编辑器控件...");
          const snapshot = await capturePageSnapshot(editorPage);
          log(`检测到: 可编辑=${snapshot.editables.length}, 按钮=${snapshot.buttons.length}`);
          const bundle = deriveSelectorBundle(snapshot);

          const editorUrl = editorPage.url();
          const path = await saveSelectorTemplate(bundle, editorUrl);
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

        const { Uploader } = await import("@actalk/inkos-core");

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

  // Mark-uploaded subcommand
  upload
    .command("mark-uploaded")
    .description("Mark chapters as already uploaded (e.g. uploaded manually on platform)")
    .argument("[book-id]", "Book ID (auto-detected if only one book)")
    .requiredOption("--up-to <number>", "Mark all chapters up to this number as uploaded")
    .action(async (bookIdArg: string | undefined, opts) => {
      try {
        const root = findProjectRoot();
        const bookId = await resolveBookId(bookIdArg, root);
        const state = new StateManager(root);
        const index = await state.loadChapterIndex(bookId);
        const book = await state.loadBookConfig(bookId);

        const { Uploader, UploadStateManager } = await import("@actalk/inkos-core");

        const uploader = new Uploader(root, bookId, book.platform as Platform, index);
        await uploader.initialize();

        const sm = new UploadStateManager(root, bookId);
        const count = await sm.markChaptersUploaded(Number(opts.upTo), index);
        log(`Marked ${count} chapters as uploaded (up to chapter ${opts.upTo})`);
      } catch (e) {
        logError(`Failed: ${e}`);
        process.exit(1);
      }
    });

  // Main upload command
  upload
    .command("run")
    .description("Upload chapters to publishing platform")
    .argument("[book-id]", "Book ID (auto-detected if only one book)")
    .option("--chapters <range>", "Chapter range, e.g. 1-10 or 5 (default: all pending)")
    .option("--draft", "Save as draft instead of publishing")
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

        const { Uploader } = await import("@actalk/inkos-core");

        const uploader = new Uploader(root, bookId, book.platform as Platform, index, {
          chapters: opts.chapters,
          approvedOnly: Boolean(opts.approvedOnly),
          dryRun: Boolean(opts.dryRun),
          draftMode: Boolean(opts.draft),
          maxChaptersPerHour: Number(opts.maxPerHour),
          bookTitle: book.title,
        });

        await uploader.initialize();

        const summary = await uploader.uploadChapters();

        if (opts.json) {
          log(JSON.stringify(summary, null, 2));
        } else {
          const modeLabel = opts.draft ? "Draft" : "Upload";
          if (opts.dryRun) {
            log(`\nDry run — ${summary.total} chapters would be ${opts.draft ? "saved as draft" : "uploaded"}:`);
          } else {
            log(`\n${modeLabel} complete: ${summary.uploaded}/${summary.total} succeeded`);
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
