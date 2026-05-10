import { beforeEach, describe, expect, it, vi } from "vitest";

const consolidateMock = vi.fn();
const loadConfigMock = vi.fn();
const buildPipelineConfigMock = vi.fn();
const findProjectRootMock = vi.fn();
const resolveBookIdMock = vi.fn();
const logMock = vi.fn();
const logErrorMock = vi.fn();

vi.mock("@actalk/inkos-core", () => ({
  ConsolidatorAgent: class {
    consolidate = consolidateMock;
  },
  StateManager: class {
    bookDir = vi.fn(() => "/project/books/test-book");
  },
}));

vi.mock("../utils.js", () => ({
  loadConfig: loadConfigMock,
  buildPipelineConfig: buildPipelineConfigMock,
  findProjectRoot: findProjectRootMock,
  resolveBookId: resolveBookIdMock,
  log: logMock,
  logError: logErrorMock,
}));

describe("consolidate CLI command", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loadConfigMock.mockResolvedValue({ llm: {} });
    buildPipelineConfigMock.mockReturnValue({});
    findProjectRootMock.mockReturnValue("/project");
    resolveBookIdMock.mockResolvedValue("test-book");
  });

  it("logs informational message when no completed volumes exist", async () => {
    consolidateMock.mockResolvedValue({
      archivedVolumes: 0,
      retainedChapters: 0,
    });

    const { consolidateCommand } = await import("../commands/consolidate.js");
    await consolidateCommand.parseAsync(["node", "consolidate", "test-book"], { from: "node" });

    expect(consolidateMock).toHaveBeenCalledWith("/project/books/test-book");
    expect(logMock).toHaveBeenCalledWith("No completed volumes found to consolidate.");
  });

  it("logs volume count and chapter count when consolidation succeeds", async () => {
    consolidateMock.mockResolvedValue({
      archivedVolumes: 2,
      retainedChapters: 5,
    });

    const { consolidateCommand } = await import("../commands/consolidate.js");
    await consolidateCommand.parseAsync(["node", "consolidate", "test-book"], { from: "node" });

    expect(logMock).toHaveBeenCalledWith("Consolidated 2 volume(s).");
    expect(logMock).toHaveBeenCalledWith("Retained 5 recent chapter summaries.");
    expect(logMock).toHaveBeenCalledWith("Volume summaries saved to story/volume_summaries.md");
    expect(logMock).toHaveBeenCalledWith("Detailed summaries archived to story/summaries_archive/");
  });

  it("outputs JSON when --json flag is provided", async () => {
    consolidateMock.mockResolvedValue({
      archivedVolumes: 1,
      retainedChapters: 3,
    });

    const { consolidateCommand } = await import("../commands/consolidate.js");
    await consolidateCommand.parseAsync(["node", "consolidate", "test-book", "--json"], { from: "node" });

    const jsonCall = logMock.mock.calls.find(([msg]) => {
      try { JSON.parse(msg as string); return true; } catch { return false; }
    });
    expect(jsonCall).toBeDefined();
    const data = JSON.parse(jsonCall![0] as string);
    expect(data.archivedVolumes).toBe(1);
    expect(data.retainedChapters).toBe(3);
  });

  it("logs error and exits with code 1 when consolidation throws", async () => {
    consolidateMock.mockRejectedValue(new Error("LLM provider unavailable"));

    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => { throw new Error("exit"); });

    const { consolidateCommand } = await import("../commands/consolidate.js");
    await expect(
      consolidateCommand.parseAsync(["node", "consolidate", "test-book"], { from: "node" }),
    ).rejects.toThrow("exit");

    expect(logErrorMock).toHaveBeenCalledWith("Consolidation failed: Error: LLM provider unavailable");
    expect(exitSpy).toHaveBeenCalledWith(1);

    exitSpy.mockRestore();
  });

  it("outputs JSON error when --json is set and consolidation throws", async () => {
    consolidateMock.mockRejectedValue(new Error("LLM provider unavailable"));

    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => { throw new Error("exit"); });

    const { consolidateCommand } = await import("../commands/consolidate.js");
    await expect(
      consolidateCommand.parseAsync(["node", "consolidate", "test-book", "--json"], { from: "node" }),
    ).rejects.toThrow("exit");

    const jsonCall = logMock.mock.calls.find(([msg]) => {
      try { JSON.parse(msg as string); return true; } catch { return false; }
    });
    expect(jsonCall).toBeDefined();
    const data = JSON.parse(jsonCall![0] as string);
    expect(data.error).toBe("Error: LLM provider unavailable");

    exitSpy.mockRestore();
  });
});