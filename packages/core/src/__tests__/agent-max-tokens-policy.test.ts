import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// Agents that may legitimately set maxTokens because their output budget
// exceeds modelCard defaults (long-form chapter generation / polishing).
const ALLOWED_MAX_TOKENS = new Set([
  "../agents/polisher.ts",
  "../agents/writer.ts",
]);

const AGENT_FILES = [
  "../agents/architect.ts",
  "../agents/length-normalizer.ts",
  "../agents/planner.ts",
  "../agents/polisher.ts",
  "../agents/reviser.ts",
  "../agents/writer.ts",
] as const;

describe("creative agent maxTokens policy", () => {
  it("lets modelCard defaults own generation output budgets", async () => {
    const testDir = dirname(fileURLToPath(import.meta.url));
    const offenders: string[] = [];

    for (const relativePath of AGENT_FILES) {
      const source = await readFile(join(testDir, relativePath), "utf-8");
      if (/\bmaxTokens\s*:/.test(source) && !ALLOWED_MAX_TOKENS.has(relativePath)) {
        offenders.push(relativePath);
      }
    }

    expect(offenders).toEqual([]);
  });
});
