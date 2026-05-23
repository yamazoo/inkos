import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const generateMock = vi.fn();
const loadBookConfigMock = vi.fn();
const saveBookConfigAtMock = vi.fn();
const logMock = vi.fn();
const logErrorMock = vi.fn();
const readFileMock = vi.fn();
const writeFileMock = vi.fn();
const mkdirMock = vi.fn();
const unlinkMock = vi.fn();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let exitSpy: any;

vi.mock("@actalk/inkos-core", () => ({
  PackagerAgent: class {
    generate = generateMock;
  },
  StateManager: class {
    loadBookConfig = loadBookConfigMock;
    saveBookConfigAt = saveBookConfigAtMock;
  },
  PackageCandidatesStateSchema: {
    parse: (val: unknown) => val,
  },
}));

vi.mock("../utils.js", () => ({
  loadConfig: vi.fn(async () => ({ llm: { model: "test-model" } })),
  createClient: vi.fn(() => ({ provider: "openai" })),
  findProjectRoot: vi.fn(() => "/project"),
  resolveBookId: vi.fn(async (bookId?: string) => bookId ?? "auto-book"),
  log: logMock,
  logError: logErrorMock,
}));

vi.mock("node:fs/promises", () => ({
  readFile: vi.fn((...args: unknown[]) => readFileMock(...args)),
  writeFile: vi.fn((...args: unknown[]) => writeFileMock(...args)),
  mkdir: vi.fn((...args: unknown[]) => mkdirMock(...args)),
  unlink: vi.fn((...args: unknown[]) => unlinkMock(...args)),
}));

const MOCK_CANDIDATES_RESULT = {
  candidates: [
    {
      title: "开局签到荒古圣体",
      synopsis: "穿越到修仙世界，绑定签到系统",
      score: { suspense: 9, genreClarity: 8, contentAlignment: 7 },
    },
    {
      title: "重生之都市修仙",
      synopsis: "重生回到十年前",
      score: { suspense: 7, genreClarity: 9, contentAlignment: 8 },
    },
  ],
  genre: "xuanhuan",
  sourcePatternSummary: "热门标题偏好悬念式开局",
};

const MOCK_BOOK_CONFIG = {
  id: "test-book",
  title: "骨刀行",
  genre: "xuanhuan",
  platform: "tomato",
  status: "active",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

describe("inkos package generate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    exitSpy = vi.spyOn(process, "exit").mockImplementation((() => {}) as any);
    generateMock.mockResolvedValue(MOCK_CANDIDATES_RESULT);
    loadBookConfigMock.mockResolvedValue(MOCK_BOOK_CONFIG);
    saveBookConfigAtMock.mockResolvedValue(undefined);
    mkdirMock.mockResolvedValue(undefined);
    writeFileMock.mockResolvedValue(undefined);
  });

  afterEach(() => {
    exitSpy.mockRestore();
  });

  it("generates candidates and saves to file", async () => {
    const { packageCommand } = await import("../commands/package.js");

    await packageCommand.parseAsync(["node", "package", "test-book", "-n", "2"], { from: "node" });

    expect(generateMock).toHaveBeenCalledWith({
      bookTitle: "骨刀行",
      genre: "xuanhuan",
      count: 2,
    });
    expect(writeFileMock).toHaveBeenCalled();
    expect(logMock).toHaveBeenCalledWith(expect.stringContaining("Generated 2 candidates"));
  });

  it("outputs JSON for generate", async () => {
    const { packageCommand } = await import("../commands/package.js");

    await packageCommand.parseAsync(["node", "package", "test-book", "--json", "-n", "2"], { from: "node" });

    const allLogged = logMock.mock.calls.map((c: unknown[]) => String(c[0])).join("\n");
    expect(allLogged).toContain('"candidates"');
  });

  it("reports error on generation failure", async () => {
    generateMock.mockRejectedValue(new Error("LLM unavailable"));

    const { packageCommand } = await import("../commands/package.js");

    await packageCommand.parseAsync(["node", "package", "test-book"], { from: "node" });

    expect(logErrorMock).toHaveBeenCalledWith(expect.stringContaining("LLM unavailable"));
  });
});

describe("inkos package list", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    exitSpy = vi.spyOn(process, "exit").mockImplementation((() => {}) as any);
  });

  afterEach(() => {
    exitSpy.mockRestore();
  });

  it("displays stored candidates", async () => {
    const storedState = {
      bookId: "test-book",
      generatedAt: "2026-05-20T00:00:00Z",
      expiresAt: "2099-12-31T00:00:00Z",
      candidates: MOCK_CANDIDATES_RESULT.candidates,
      genre: "xuanhuan",
      sourcePatternSummary: "test",
    };
    readFileMock.mockResolvedValue(JSON.stringify(storedState));

    const { packageCommand } = await import("../commands/package.js");

    await packageCommand.parseAsync(["node", "package", "list", "test-book"], { from: "node" });

    expect(logMock).toHaveBeenCalledWith(expect.stringContaining("test-book"));
    expect(logMock).toHaveBeenCalledWith(expect.stringContaining("开局签到荒古圣体"));
  });

  it("shows message when no candidates found", async () => {
    readFileMock.mockRejectedValue(new Error("ENOENT"));

    const { packageCommand } = await import("../commands/package.js");

    await packageCommand.parseAsync(["node", "package", "list", "test-book"], { from: "node" });

    expect(logMock).toHaveBeenCalledWith(expect.stringContaining("No packaging candidates"));
  });

  it("treats expired candidates as missing and auto-cleans", async () => {
    const expiredState = {
      bookId: "test-book",
      generatedAt: "2020-01-01T00:00:00Z",
      expiresAt: "2020-01-08T00:00:00Z",
      candidates: MOCK_CANDIDATES_RESULT.candidates,
      genre: "xuanhuan",
      sourcePatternSummary: "test",
    };
    readFileMock.mockResolvedValue(JSON.stringify(expiredState));
    unlinkMock.mockResolvedValue(undefined);

    const { packageCommand } = await import("../commands/package.js");

    await packageCommand.parseAsync(["node", "package", "list", "test-book"], { from: "node" });

    expect(unlinkMock).toHaveBeenCalled();
    expect(logMock).toHaveBeenCalledWith(expect.stringContaining("cleaned"));
  });
});

describe("inkos package select", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    exitSpy = vi.spyOn(process, "exit").mockImplementation((() => {}) as any);
    loadBookConfigMock.mockResolvedValue(MOCK_BOOK_CONFIG);
    mkdirMock.mockResolvedValue(undefined);
    writeFileMock.mockResolvedValue(undefined);
    saveBookConfigAtMock.mockResolvedValue(undefined);
  });

  afterEach(() => {
    exitSpy.mockRestore();
  });

  it("applies selected title and synopsis to book config", async () => {
    const { packageCommand } = await import("../commands/package.js");

    await packageCommand.parseAsync([
      "node", "package", "select", "test-book",
      "--title", "开局签到荒古圣体",
      "--synopsis", "穿越到修仙世界",
    ], { from: "node" });

    expect(saveBookConfigAtMock).toHaveBeenCalledWith(
      expect.stringContaining("test-book"),
      expect.objectContaining({
        title: "开局签到荒古圣体",
        synopsis: "穿越到修仙世界",
      }),
    );
  });

  it("creates snapshot before updating", async () => {
    const { packageCommand } = await import("../commands/package.js");

    await packageCommand.parseAsync([
      "node", "package", "select", "test-book",
      "--title", "新标题",
      "--synopsis", "新简介",
    ], { from: "node" });

    expect(writeFileMock).toHaveBeenCalledWith(
      expect.stringContaining("snapshot"),
      expect.any(String),
      "utf-8",
    );
  });

  it("outputs JSON for select", async () => {
    const { packageCommand } = await import("../commands/package.js");

    await packageCommand.parseAsync([
      "node", "package", "select", "test-book",
      "--title", "新标题",
      "--synopsis", "新简介",
      "--json",
    ], { from: "node" });

    const allLogged = logMock.mock.calls.map((c: unknown[]) => String(c[0])).join("\n");
    expect(allLogged).toContain("新标题");
  });

  it("reports error on select failure", async () => {
    saveBookConfigAtMock.mockRejectedValue(new Error("disk full"));

    const { packageCommand } = await import("../commands/package.js");

    await packageCommand.parseAsync([
      "node", "package", "select", "test-book",
      "--title", "新标题",
      "--synopsis", "新简介",
    ], { from: "node" });

    expect(logErrorMock).toHaveBeenCalledWith(expect.stringContaining("disk full"));
  });
});

describe("inkos package clean", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    exitSpy = vi.spyOn(process, "exit").mockImplementation((() => {}) as any);
    unlinkMock.mockResolvedValue(undefined);
  });

  afterEach(() => {
    exitSpy.mockRestore();
  });

  it("deletes expired candidates file", async () => {
    const expiredState = {
      bookId: "test-book",
      generatedAt: "2020-01-01T00:00:00Z",
      expiresAt: "2020-01-08T00:00:00Z",
      candidates: MOCK_CANDIDATES_RESULT.candidates,
      genre: "xuanhuan",
      sourcePatternSummary: "test",
    };
    readFileMock.mockResolvedValue(JSON.stringify(expiredState));

    const { packageCommand } = await import("../commands/package.js");

    await packageCommand.parseAsync(["node", "package", "clean", "test-book"], { from: "node" });

    expect(unlinkMock).toHaveBeenCalled();
    expect(logMock).toHaveBeenCalledWith(expect.stringContaining("Cleaned"));
  });

  it("reports no expired candidates when file is valid", async () => {
    const validState = {
      bookId: "test-book",
      generatedAt: "2026-05-20T00:00:00Z",
      expiresAt: "2099-12-31T00:00:00Z",
      candidates: MOCK_CANDIDATES_RESULT.candidates,
      genre: "xuanhuan",
      sourcePatternSummary: "test",
    };
    readFileMock.mockResolvedValue(JSON.stringify(validState));

    const { packageCommand } = await import("../commands/package.js");

    await packageCommand.parseAsync(["node", "package", "clean", "test-book"], { from: "node" });

    expect(unlinkMock).not.toHaveBeenCalled();
    expect(logMock).toHaveBeenCalledWith(expect.stringContaining("No expired"));
  });

  it("reports no candidates when file missing", async () => {
    readFileMock.mockRejectedValue(new Error("ENOENT"));

    const { packageCommand } = await import("../commands/package.js");

    await packageCommand.parseAsync(["node", "package", "clean", "test-book"], { from: "node" });

    expect(unlinkMock).not.toHaveBeenCalled();
    expect(logMock).toHaveBeenCalledWith(expect.stringContaining("No expired"));
  });
});
