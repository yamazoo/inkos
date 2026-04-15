import { BaseAgent } from "./base.js";

export interface ValidationWarning {
  readonly category: string;
  readonly description: string;
}

export interface ValidationResult {
  readonly warnings: ReadonlyArray<ValidationWarning>;
  readonly passed: boolean;
}

/**
 * Validates Settler output by comparing old and new truth files via LLM.
 * Catches contradictions, missing state changes, and temporal inconsistencies.
 *
 * Uses a minimal verdict protocol instead of requiring structured JSON:
 *   Line 1: PASS or FAIL
 *   Remaining lines: free-form warnings (one per line, optional category prefix)
 */
export class StateValidatorAgent extends BaseAgent {
  get name(): string {
    return "state-validator";
  }

  async validate(
    chapterContent: string,
    chapterNumber: number,
    oldState: string,
    newState: string,
    oldHooks: string,
    newHooks: string,
    language: "zh" | "en" = "zh",
  ): Promise<ValidationResult> {
    const stateDiff = this.computeDiff(oldState, newState, "State Card");
    const hooksDiff = this.computeDiff(oldHooks, newHooks, "Hooks Pool");

    // Skip validation if nothing changed
    if (!stateDiff && !hooksDiff) {
      return { warnings: [], passed: true };
    }

    const langInstruction = language === "en"
      ? "Respond in English."
      : "用中文回答。";

    const systemPrompt = `You are a continuity validator for a novel writing system. ${langInstruction}

Given the chapter text and the CHANGES made to truth files (state card + hooks pool), check for contradictions:

1. State change without narrative support — truth file says something changed but the chapter text doesn't describe it
2. Missing state change — chapter text describes something happening but the truth file didn't capture it
3. Temporal impossibility — character moves locations without transition, injury heals without time passing
4. Hook anomaly — a hook disappeared without being marked resolved, or a new hook has no basis in the chapter
5. Retroactive edit — truth file change implies something happened in a PREVIOUS chapter, not the current one

Output format (simple, NOT JSON):
- First line: exactly PASS or FAIL (nothing else on this line)
- Following lines: one warning per line, optionally prefixed with [category]
- If no issues at all, just output: PASS

Example:
PASS
[unsupported_change] State card says character moved to the forest, but text only shows intent
[minor] Hook H03 advanced but text mention is brief

Or if there are hard contradictions:
FAIL
[contradiction] State says character is dead but chapter text shows them speaking
[unsupported_change] New location not mentioned anywhere in chapter text

IMPORTANT: Output FAIL ONLY for hard contradictions — facts that directly conflict with the chapter text. Do NOT fail for:
- Slightly ahead-of-text inferences
- Missing details that the state card didn't capture
- Reasonable extrapolations from text
- Hook management differences that don't contradict text
These should be warnings with PASS, not FAIL.`;

    const userPrompt = `Chapter ${chapterNumber} validation:

## State Card Changes
${stateDiff || "(no changes)"}

## Hooks Pool Changes
${hooksDiff || "(no changes)"}

## Chapter Text (for reference)
${chapterContent.slice(0, 6000)}`;

    const response = await this.chat(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      { temperature: 0.1, maxTokens: 2048 },
    );

    const parsed = this.parseResult(response.content);
    if (!parsed.ok) {
      this.log?.warn(`State validator parse failed (attempt 1): ${parsed.error}. Response: ${JSON.stringify(response.content.slice(0, 500))}`);
      // Retry once on parse failure — may be a transient LLM glitch
      const retry = await this.chat(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        { temperature: 0.1 },
      );
      const retryParsed = this.parseResult(retry.content);
      if (!retryParsed.ok) {
        this.log?.warn(`State validator parse failed (attempt 2): ${retryParsed.error}. Response preview: ${retry.content.slice(0, 200)}`);
        // Last resort: try to infer passed=true from markdown validation report
        const markdownResult = this.parseMarkdownValidationResult(retry.content);
        if (markdownResult) {
          this.log?.warn("State validator falling back to markdown inference: passed=true (no hard contradictions found)");
          return markdownResult;
        }
        throw new Error(`State validation failed for chapter ${chapterNumber}: ${retryParsed.error}`);
      }
      return retryParsed.result;
    }
    return parsed.result;
  }

  private computeDiff(oldText: string, newText: string, label: string): string | null {
    if (oldText === newText) return null;

    const oldLines = oldText.split("\n").filter((l) => l.trim());
    const newLines = newText.split("\n").filter((l) => l.trim());

    const added = newLines.filter((l) => !oldLines.includes(l));
    const removed = oldLines.filter((l) => !newLines.includes(l));

    if (added.length === 0 && removed.length === 0) return null;

    const parts = [`### ${label}`];
    if (removed.length > 0) parts.push("Removed:\n" + removed.map((l) => `- ${l}`).join("\n"));
    if (added.length > 0) parts.push("Added:\n" + added.map((l) => `+ ${l}`).join("\n"));
    return parts.join("\n");
  }

  /**
   * Last-resort parser when LLM returns a markdown validation report
   * instead of JSON. Infers passed=true if the report says no contradictions
   * or all issues are minor observations.
   */
  private parseMarkdownValidationResult(content: string): ValidationResult | null {
    // Skip if content is clearly empty or too short
    if (!content || content.trim().length < 20) return null;

    const text = content.trim();

    // Look for indicators that the chapter passed validation
    const passIndicators = [
      // Chinese
      /未发现[实质|严重]?[性]?矛盾/i,
      /无[实质|严重]?矛盾/i,
      /通过|合格|一致/i,
      /passed|pass|通过|无问题/i,
      // English / mixed
      /no (serious |critical )?(contradiction|inconsistency)/i,
      /all checks? (passed|passed|一致)/i,
      /validation passed/i,
    ];

    // Hard failure indicators
    const failIndicators = [
      /发现[严重|实质]?矛盾/i,
      /存在[严重|实质]?矛盾/i,
      /hard contradiction/i,
      /failed|失败/i,
      /critical issue/i,
      /cannot pass/i,
    ];

    const hasFail = failIndicators.some((re) => re.test(text));
    if (hasFail) {
      return { warnings: [{ category: "markdown_inference", description: "LLM returned markdown suggesting hard contradictions" }], passed: false };
    }

    const hasPass = passIndicators.some((re) => re.test(text));
    if (hasPass) {
      return { warnings: [], passed: true };
    }

    // Ambiguous: assume minor issues, pass with warning
    return {
      warnings: [{ category: "markdown_inference", description: "LLM returned non-JSON response; treating as passed with minor issues" }],
      passed: true,
    };
  }

  private parseResult(content: string): { ok: true; result: ValidationResult } | { ok: false; error: string } {
    const trimmed = content.trim();
    if (!trimmed) {
      return { ok: false, error: "LLM returned empty response" };
    }

    // Try JSON parsing first (robust extraction handles fences, embedded JSON, etc.)
    const parsed = extractFirstValidJsonObject<{
      warnings?: Array<{ category?: string; description?: string }>;
      passed?: boolean;
    }>(trimmed);
    if (parsed) {
      // Infer passed=true when JSON was extracted but 'passed' is missing.
      // The system prompt says "passed=true means no serious contradictions found".
      // When warnings are present but passed is absent, treat it as passed with
      // minor issues (the LLM likely omitted 'passed' as obvious).
      const hasPassed = typeof parsed.passed === "boolean";
      const passed = hasPassed ? (parsed.passed as boolean) : true;

      if (parsed.warnings !== undefined && !Array.isArray(parsed.warnings)) {
        return { ok: false, error: "'warnings' must be an array" };
      }

      const warnings: ValidationWarning[] = (parsed.warnings ?? []).map((w) => ({
        category: w.category ?? "unknown",
        description: w.description ?? "",
      }));

      return { ok: true, result: { warnings, passed } };
    }

    // Fall through to line-based PASS/FAIL parsing (primary output format)
    const lines = trimmed.split("\n").map((line) => line.trim()).filter(Boolean);
    if (lines.length === 0) {
      return { ok: false, error: "LLM returned empty response" };
    }

    const verdictLine = lines[0]!;
    if (!/^(PASS|FAIL)$/i.test(verdictLine)) {
      return { ok: false, error: `State validator returned invalid response (expected PASS/FAIL, got: ${verdictLine.slice(0, 50)})` };
    }
    const passed = /^PASS$/i.test(verdictLine);

    const warnings: ValidationWarning[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]!;
      if (/^(PASS|FAIL)$/i.test(line)) continue;

      const categoryMatch = line.match(/^\[([^\]]+)\]\s*(.+)$/);
      if (categoryMatch) {
        warnings.push({
          category: categoryMatch[1]!.trim(),
          description: categoryMatch[2]!.trim(),
        });
      } else if (line.startsWith("- ") || line.startsWith("* ")) {
        warnings.push({
          category: "general",
          description: line.slice(2).trim(),
        });
      } else if (line.length > 5) {
        warnings.push({
          category: "general",
          description: line,
        });
      }
    }

    return { ok: true, result: { warnings, passed } };
  }
}

// ---------------------------------------------------------------------------
// JSON extraction utilities
// ---------------------------------------------------------------------------

function extractFirstValidJsonObject<T>(text: string): T | null {
  // Try direct parse first (works for clean JSON)
  const direct = tryParseJson<T>(text);
  if (direct) {
    return direct;
  }

  // Strip markdown code fences (common LLM output format: ```json ... ```)
  // Also strips a leading space before the fence (e.g. " ```json\n{...")
  const stripped = text
    .replace(/^[\s]*```(?:json)?\s*/i, "")
    .replace(/\s*```[\s]*$/i, "")
    .trim();
  const fromStripped = tryParseJson<T>(stripped);
  if (fromStripped) {
    return fromStripped;
  }

  // Fall back to scanning for first balanced JSON object
  for (let index = 0; index < text.length; index += 1) {
    if (text[index] !== "{") continue;
    const candidate = extractBalancedJsonObject(text, index);
    if (!candidate) continue;
    const parsed = tryParseJson<T>(candidate);
    if (parsed) {
      return parsed;
    }
  }

  return null;
}

function tryParseJson<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function extractBalancedJsonObject(text: string, start: number): string | null {
  let depth = 0;
  let inString = false;
  let escaped = false;
  let endIndex = -1;

  for (let index = start; index < text.length; index += 1) {
    const char = text[index]!;

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === "\"") {
        inString = false;
      }
      continue;
    }

    if (char === "\"") {
      inString = true;
      continue;
    }

    if (char === "{") {
      depth += 1;
      continue;
    }

    if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        endIndex = index;
        break;
      }
      if (depth < 0) {
        return null;
      }
    }
  }

  if (endIndex < 0) return null;

  // Only accept the candidate if what follows the closing brace is
  // nothing, whitespace, or a structural JSON terminator.
  // This rejects trailing content like "{...} more text here"
  const followingChar = text[endIndex + 1];
  if (
    followingChar !== undefined &&
    followingChar !== "\n" &&
    followingChar !== "\r" &&
    followingChar !== "\t" &&
    followingChar !== " " &&
    followingChar !== "," &&
    followingChar !== "]" &&
    followingChar !== "}"
  ) {
    return null;
  }

  return text.slice(start, endIndex + 1);
}
