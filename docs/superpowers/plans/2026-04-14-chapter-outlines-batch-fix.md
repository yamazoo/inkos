# 章节细纲分批生成修复 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复 `generateAll()` 的 maxTokens 截断问题，改为分批生成（每批 20 章，maxTokens 15000），支持 200+ 章书籍。

**Architecture:** `generateAll()` 改为循环调用 `this.chat()`，每次生成 20 章，拼接结果。新增 `buildBatchContinuationPrompt()` 在 `detailed-outline-prompts.ts` 中。

**Tech Stack:** TypeScript, BaseAgent, existing `detailed-outline.ts` and `detailed-outline-prompts.ts`

---

## File Map

| 文件 | 操作 | 职责 |
|------|------|------|
| `packages/core/src/agents/detailed-outline-prompts.ts` | 修改 | 新增 `buildBatchContinuationPrompt()` |
| `packages/core/src/agents/detailed-outline.ts` | 修改 | `generateAll()` 改为分批逻辑 |
| `packages/core/src/__tests__/detailed-outline.test.ts` | 修改 | 新增分批 prompt 生成测试 |
| `books/苟到天荒地老/story/chapter_outlines.md` | 删除重建 | 验证 200 章全部生成 |

---

## Task 1: 新增分批接续 prompt 函数

**Files:**
- Modify: `packages/core/src/agents/detailed-outline-prompts.ts`

- [ ] **Step 1: 在 `detailed-outline-prompts.ts` 末尾新增函数**

在文件末尾 `}` 之前添加：

```ts
export interface BatchContinuationInput {
  readonly previousChaptersCount: number;
  readonly nextBatchStart: number;
  readonly nextBatchEnd: number;
  readonly previousSummary: string;
  readonly language?: string;
}

export function buildBatchContinuationPrompt(input: BatchContinuationInput): string {
  const isZh = (input.language ?? "zh") !== "en";

  if (isZh) {
    return `【全书规划】前 ${input.previousChaptersCount} 章已生成（见下方）。请继续生成第 ${input.nextBatchStart} 至第 ${input.nextBatchEnd} 章。
确保情节连贯、风格一致。

【前 ${input.previousChaptersCount} 章摘要】
${input.previousSummary}

【输出格式】
## 第${input.nextBatchStart}章
1. [场景/事件标题] 描述内容，50-150字...
...
## 第${input.nextBatchEnd}章
...`;
  }

  return `[Book plan] Chapters 1–${input.previousChaptersCount} have been generated (see below). Continue with chapters ${input.nextBatchStart}–${input.nextBatchEnd}.
Ensure narrative continuity and consistent style.

[Summary of previous chapters]
${input.previousSummary}

[Output format]
## Chapter ${input.nextBatchStart}
1. [Scene/Event Title] Description (50-150 chars)...
...
## Chapter ${input.nextBatchEnd}
...`;
}
```

- [ ] **Step 2: 运行构建确认无错误**

```bash
cd packages/core && pnpm build 2>&1 | tail -5
```

Expected: no errors

- [ ] **Step 3: 提交**

```bash
git add packages/core/src/agents/detailed-outline-prompts.ts
git commit -m "feat: add buildBatchContinuationPrompt for batched outline generation"
```

---

## Task 2: 重写 generateAll() 为分批逻辑

**Files:**
- Modify: `packages/core/src/agents/detailed-outline.ts`

- [ ] **Step 1: 重写 `generateAll()` 方法**

用以下新实现替换现有的 `generateAll()` 方法（保留其他代码不变）：

```ts
async generateAll(input: DetailedOutlineInput): Promise<string> {
  const lang = input.language === "en" ? "en" : "zh";
  const BATCH_SIZE = 20;
  const MAX_TOKENS = 15000;

  this.log?.info(`[detailed-outline] Batch generating ${input.targetChapters} chapters (batch size: ${BATCH_SIZE})`);

  // First batch: generate initial outline
  const firstBatchEnd = Math.min(BATCH_SIZE, input.targetChapters);
  this.log?.info(`[detailed-outline] Batch 1: chapters 1–${firstBatchEnd}`);

  const firstUserPrompt = buildDetailedOutlineUserPrompt(input);
  const systemPrompt = buildDetailedOutlineSystemPrompt(lang);

  const firstResponse = await this.chat(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: firstUserPrompt },
    ],
    { temperature: 0.3, maxTokens: MAX_TOKENS },
  );

  let result = firstResponse.content.trim();
  this.log?.info(`[detailed-outline] Batch 1 done, ${result.length} chars`);

  // Subsequent batches
  let completedChapters = firstBatchEnd;

  while (completedChapters < input.targetChapters) {
    const batchStart = completedChapters + 1;
    const batchEnd = Math.min(completedChapters + BATCH_SIZE, input.targetChapters);

    this.log?.info(`[detailed-outline] Batch ${Math.ceil(batchStart / BATCH_SIZE)}: chapters ${batchStart}–${batchEnd}`);

    // Extract a brief summary of the last 2 chapters from previous output for continuity
    const lastTwoChapters = extractLastNChaptersSummary(result, 2, lang);
    const continuationPrompt = buildBatchContinuationPrompt({
      previousChaptersCount: completedChapters,
      nextBatchStart: batchStart,
      nextBatchEnd: batchEnd,
      previousSummary: lastTwoChapters,
      language: lang,
    });

    const continuationResponse = await this.chat(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: continuationPrompt },
      ],
      { temperature: 0.3, maxTokens: MAX_TOKENS },
    );

    const batchContent = continuationResponse.content.trim();
    this.log?.info(`[detailed-outline] Batch ${Math.ceil(batchStart / BATCH_SIZE)} done, ${batchContent.length} chars`);

    result += "\n\n" + batchContent;
    completedChapters = batchEnd;
  }

  this.log?.info(`[detailed-outline] All ${completedChapters} chapters generated, total ${result.length} chars`);
  return result;
}
```

- [ ] **Step 2: 添加辅助函数 `extractLastNChaptersSummary`**

在 `extractChapterOutline` 函数之前添加：

```ts
/**
 * Extract a brief summary of the last N chapters from existing outline content.
 * Used for continuity when generating subsequent batches.
 */
function extractLastNChaptersSummary(content: string, n: number, lang: "zh" | "en"): string {
  const sections = content.split(/(?:^|\n)(?=##)/);
  if (sections.length <= 1) return "(无前章内容)";

  // Get the last N sections (excluding the root header if present)
  const chapters = sections.filter((s) => {
    const t = s.trim();
    if (!t) return false;
    const m = t.match(/^##\s*(?:第\s*(\d+)\s*章|Chapter\s*(\d+)\b/i);
    return m !== null;
  });

  const lastN = chapters.slice(-n);
  return lastN
    .map((s) => {
      const trimmed = s.trim();
      // Return first 150 chars of each chapter's content as summary
      return trimmed.length > 200 ? trimmed.slice(0, 200) + "..." : trimmed;
    })
    .join("\n\n");
}
```

- [ ] **Step 3: 更新 import 引入 `buildBatchContinuationPrompt`**

确认 `detailed-outline-prompts.ts` 的 import 包含新函数：

```ts
import {
  buildDetailedOutlineSystemPrompt,
  buildDetailedOutlineUserPrompt,
  buildBatchContinuationPrompt, // ← 新增
  type DetailedOutlineInput,
  type BatchContinuationInput,
} from "./detailed-outline-prompts.js";
```

- [ ] **Step 4: 运行构建确认无错误**

```bash
cd packages/core && pnpm build 2>&1 | tail -10
```

Expected: no TypeScript errors

- [ ] **Step 5: 提交**

```bash
git add packages/core/src/agents/detailed-outline.ts
git commit -m "fix: batch outline generation to handle 200+ chapters without token truncation"
```

---

## Task 3: 添加分批 prompt 生成测试

**Files:**
- Modify: `packages/core/src/__tests__/detailed-outline.test.ts`

- [ ] **Step 1: 添加 `buildBatchContinuationPrompt` 测试**

在测试文件末尾添加：

```ts
describe("buildBatchContinuationPrompt", () => {
  it("generates Chinese continuation prompt", () => {
    const prompt = buildBatchContinuationPrompt({
      previousChaptersCount: 20,
      nextBatchStart: 21,
      nextBatchEnd: 40,
      previousSummary: "第19章摘要...\\n第20章摘要...",
      language: "zh",
    });
    expect(prompt).toContain("前 20 章已生成");
    expect(prompt).toContain("第 21 至第 40 章");
    expect(prompt).toContain("第19章摘要");
  });

  it("generates English continuation prompt", () => {
    const prompt = buildBatchContinuationPrompt({
      previousChaptersCount: 20,
      nextBatchStart: 21,
      nextBatchEnd: 40,
      previousSummary: "Chapter 19 summary...\\nChapter 20 summary...",
      language: "en",
    });
    expect(prompt).toContain("Chapters 1–20 have been generated");
    expect(prompt).toContain("chapters 21–40");
  });

  it("handles non-en language as zh", () => {
    const prompt = buildBatchContinuationPrompt({
      previousChaptersCount: 0,
      nextBatchStart: 1,
      nextBatchEnd: 20,
      previousSummary: "",
      language: "french",
    });
    expect(prompt).toContain("前 "); // zh fallback
  });
});

describe("extractLastNChaptersSummary", () => {
  const zhContent = `# 章节细纲

## 第1章 杂役
青云宗外门，杂役院破旧木屋中，十七岁的林岁安在昏暗油灯下擦拭着永远擦不完的地板。

## 第2章 窥寿
林岁安的脚步顿住，世界在这一刻变得不同。

## 第3章 代价
代价随之而来，他感到一阵剧烈的眩晕。`;

  it("extracts last 2 chapters", () => {
    // Note: this tests the helper indirectly via integration in generateAll context
    const result = extractLastNChaptersSummary(zhContent, 2, "zh");
    expect(result).toContain("代价");
    expect(result).toContain("窥寿");
  });

  it("returns placeholder for empty content", () => {
    const result = extractLastNChaptersSummary("", 2, "zh");
    expect(result).toBe("(无前章内容)");
  });
});
```

Note: `extractLastNChaptersSummary` is a private module function — add `export` to it temporarily for test import, or test it indirectly. The simplest approach is to export it for testing:

在 `detailed-outline.ts` 中把 `extractLastNChaptersSummary` 改为 `export function`：

```ts
// 在函数声明处
export function extractLastNChaptersSummary(...)
```

- [ ] **Step 2: 运行测试确认通过**

```bash
cd packages/core && pnpm test -- detailed-outline
```

Expected: all tests pass

- [ ] **Step 3: 提交**

```bash
git add packages/core/src/__tests__/detailed-outline.test.ts
git commit -m "test: add batch prompt generation and continuation tests"
```

---

## Task 4: 删除旧细纲，重新生成验证

**Files:**
- Modify: `books/苟到天荒地老/story/chapter_outlines.md` (删除后重建)

- [ ] **Step 1: 删除旧的 chapter_outlines.md**

```bash
rm "books/苟到天荒地老/story/chapter_outlines.md"
```

- [ ] **Step 2: 重新生成书籍基础设定（含章节细纲）**

```bash
cd E:/workspace/inkos && inkos book create --title "苟到天荒地老" --genre xianxia --platform tomato --target-chapters 200 --chapter-words 3000
```

Expected: "生成章节细纲" 阶段多批次执行（"Batch 1...Batch 2..."），最终文件包含 200 章

- [ ] **Step 3: 验证章数**

```bash
grep -c "^## 第\|^## Chapter" books/苟到天荒地老/story/chapter_outlines.md
```

Expected: 200

---

## 验收标准

1. `pnpm build` 无编译错误
2. `pnpm test -- detailed-outline` 全部通过
3. `chapter_outlines.md` 包含 200 章（目标章节数全部生成）
4. 每批 20 章，共 10 次 LLM 调用（200 / 20 = 10）
5. 批次之间有前章摘要接续（情节连贯性）
