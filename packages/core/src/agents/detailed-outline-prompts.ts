export interface DetailedOutlineInput {
  readonly storyBible: string;
  readonly volumeOutline: string;
  readonly bookRules: string;
  readonly characterMatrix: string;
  readonly targetChapters: number;
  readonly language?: string;
}

export function buildDetailedOutlineSystemPrompt(lang: "zh" | "en"): string {
  if (lang === "en") {
    return `You are a story architect assistant. Generate a detailed chapter outline for an entire book.
Follow these rules:
1. Top-down design: start from the book's core conflict, then plan all chapters
2. Each chapter: 3-5 numbered beats (50-150 words each), total 200-500 words per chapter
3. No specific dialogue — describe scenes, events, and turning points only
4. Respect volume_outline as the upper framework; detailed outline expands it
5. Output one markdown file with "## Chapter X" as anchors
6. Write in the same language as the source material`;
  }
  return `你是故事架构师助手。为整本书生成章节细纲。
遵循以下原则：
1. 顶层设计：从书的核心冲突出发，先规划章节序列，再逐章展开
2. 每章3-5个编号情节点，每个情节点50-150字，全章合计200-500字
3. 不写具体对话，只描述场景、事件、转折
4. 尊重volume_outline作为上层框架，细纲在其内展开细节
5. 输出单个markdown文件，"## 第X章"作为锚点
6. 使用与素材相同的语言写作`;
}

export function buildDetailedOutlineUserPrompt(input: DetailedOutlineInput): string {
  const lang = input.language === "en" ? "en" : "zh";
  if (lang === "en") {
    return `## Story Bible (excerpt)
${input.storyBible}

## Volume Outline
${input.volumeOutline}

## Book Rules (excerpt)
${input.bookRules}

## Character Matrix (excerpt)
${input.characterMatrix}

## Task
Generate detailed outlines for all ${input.targetChapters} chapters. Output a complete chapter_outlines.md starting with "# Chapter Outlines".

Format per chapter:
## Chapter N
1. [Scene/Event Title] Description (50-150 chars)...
2. [Scene/Event Title] Description (50-150 chars)...
3. [Scene/Event Title] Description (50-150 chars)...

Follow the Golden Three Chapters rule: Chapter 1 throws the core conflict immediately, Chapter 2 shows the protagonist's edge, Chapter 3 establishes a concrete short-term goal.`;
  }
  return `## 世界观与人物（摘录）
${input.storyBible}

## 卷纲
${input.volumeOutline}

## 写作规则（摘录）
${input.bookRules}

## 角色矩阵（摘录）
${input.characterMatrix}

## 任务
为全书${input.targetChapters}章生成详细章节细纲。输出完整的 chapter_outlines.md，以"# 章节细纲"开头。

每章格式：
## 第N章
1. [场景/事件标题] 描述内容，50-150字...
2. [场景/事件标题] 描述内容，50-150字...
3. [场景/事件标题] 描述内容，50-150字...

遵循黄金三章法则：第1章立即抛出核心冲突，第2章展示主角金手指/优势，第3章确立具体短期目标。`;
}
