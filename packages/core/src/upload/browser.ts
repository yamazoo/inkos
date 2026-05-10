import { chromium, type Browser, type BrowserContext, type Page } from "@playwright/test";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";
import { existsSync } from "node:fs";

export const COOKIES_DIR = join(homedir(), ".inkos", "cookies");

export interface BrowserDeps {
  readonly cookiesDir?: string;
}

export interface BrowserSession {
  readonly browser: Browser;
  readonly context: BrowserContext;
  readonly page: Page;
  readonly close: () => Promise<void>;
  readonly cookiesDir: string;
}

/**
 * Launch browser with Edge-first multi-strategy:
 * 1. Edge channel ("msedge")
 * 2. Edge executable path
 * 3. Chromium fallback
 *
 * Always uses headed mode since fanqienovel.com requires login.
 */
export async function launchBrowser(
  headless = false,
  deps: BrowserDeps = {},
): Promise<BrowserSession> {
  const cookiesDir = deps.cookiesDir ?? COOKIES_DIR;

  // Strategy 1: Edge channel
  try {
    const browser = await chromium.launch({
      headless,
      channel: "msedge",
      args: [
        "--disable-blink-features=AutomationControlled",
        "--no-sandbox",
        "--start-maximized",
      ],
    });
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });
    await injectAntiDetection(context);
    const page = await context.newPage();
    const close = async () => {
      await context.close();
      await browser.close();
    };
    return { browser, context, page, close, cookiesDir };
  } catch {
    // Fall through to strategy 2
  }

  // Strategy 2: Edge executable path
  const edgePath = findEdgeExecutable();
  if (edgePath) {
    try {
      const browser = await chromium.launch({
        headless,
        executablePath: edgePath,
        args: [
          "--disable-blink-features=AutomationControlled",
          "--no-sandbox",
          "--start-maximized",
        ],
      });
      const context = await browser.newContext({
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      });
      await injectAntiDetection(context);
      const page = await context.newPage();
      const close = async () => {
        await context.close();
        await browser.close();
      };
      return { browser, context, page, close, cookiesDir };
    } catch {
      // Fall through to strategy 3
    }
  }

  // Strategy 3: Chromium fallback
  const browser = await chromium.launch({
    headless,
    args: [
      "--disable-blink-features=AutomationControlled",
      "--no-sandbox",
      "--start-maximized",
    ],
  });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });
  await injectAntiDetection(context);
  const page = await context.newPage();
  const close = async () => {
    await context.close();
    await browser.close();
  };
  return { browser, context, page, close, cookiesDir };
}

function findEdgeExecutable(): string | null {
  const candidates = [
    join(process.env["ProgramFiles"] ?? "", "Microsoft", "Edge", "Application", "msedge.exe"),
    join(process.env["ProgramFiles(x86)"] ?? "", "Microsoft", "Edge", "Application", "msedge.exe"),
    join(process.env["LocalAppData"] ?? "", "Microsoft", "Edge", "Application", "msedge.exe"),
  ];
  for (const path of candidates) {
    if (existsSync(path)) {
      return path;
    }
  }
  return null;
}

async function injectAntiDetection(context: BrowserContext): Promise<void> {
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
  });
}

export async function saveCookies(
  context: BrowserContext,
  platform: string,
  username: string,
  cookiesDir = COOKIES_DIR,
): Promise<string> {
  const platformDir = join(cookiesDir, platform);
  await mkdir(platformDir, { recursive: true });
  const statePath = join(platformDir, `${username}.json`);
  const storageState = await context.storageState();
  await writeFile(statePath, JSON.stringify(storageState, null, 2), "utf-8");
  return statePath;
}

export async function loadCookies(
  context: BrowserContext,
  platform: string,
  username: string,
  cookiesDir = COOKIES_DIR,
): Promise<boolean> {
  const statePath = join(cookiesDir, platform, `${username}.json`);
  try {
    const raw = await readFile(statePath, "utf-8");
    const state = JSON.parse(raw) as {
      cookies?: unknown[];
      origins?: Array<{ localStorage?: Array<{ name: string; value: string }> }>;
    };

    if (state.cookies) {
      await context.addCookies(state.cookies as Parameters<typeof context.addCookies>[0]);
      if (state.origins) {
        const localStorageOrigin = state.origins.find((o) => o.localStorage?.length);
        if (localStorageOrigin?.localStorage) {
          await context.addInitScript(
            (items: Array<{ name: string; value: string }>) => {
              try {
                for (const item of items) {
                  localStorage.setItem(item.name, item.value);
                }
              } catch {
                // ignore
              }
            },
            localStorageOrigin.localStorage,
          );
        }
      }
    }
    return true;
  } catch {
    return false;
  }
}

export async function waitForUserLogin(
  page: Page,
  timeoutMs = 300_000,
): Promise<boolean> {
  console.error("[upload] 等待登录中（浏览器已打开，请在浏览器中操作）...");

  const loggedInIndicators = [
    "text=作品管理",
    "text=我的作品",
    "text=作者中心",
    "text=创作者中心",
  ];

  const deadline = Date.now() + timeoutMs;
  // Wait 5 seconds before first check to avoid false positives from stale cookies
  await new Promise((r) => setTimeout(r, 5000));

  while (Date.now() < deadline) {
    try {
      // Check for visible login-confirmed elements
      for (const sel of loggedInIndicators) {
        const visible = await page.locator(sel).first().isVisible({ timeout: 500 }).catch(() => false);
        if (visible) {
          console.error(`[upload] 检测到已登录标志: ${sel}`);
          return true;
        }
      }
    } catch {
      // page might be closed
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  console.error("[upload] 登录等待超时");
  return false;
}
