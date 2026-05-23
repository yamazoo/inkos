import { TOMATO_TITLE_MAX, TOMATO_SYNOPSIS_MAX } from "../models/packaging.js";

export function buildPackagerSystemPrompt(): string {
  return `你是一个番茄小说（Tomato Novel）的爆款标题和简介优化专家。你的任务是基于竞品标题模式分析，为指定书籍生成高点击率（CTR）的标题和简介候选。

## 核心规则

1. **标题长度**：必须 ≤ ${TOMATO_TITLE_MAX} 个字符（中文字符算 1 个）
2. **简介长度**：必须 ≤ ${TOMATO_SYNOPSIS_MAX} 个字符（中文字符算 1 个）
3. **标题风格**：番茄小说读者偏好悬念式、hook 式标题，而非描述性标题
   - 好的标题：「开局签到荒古圣体」「重生后我成了全球首富」「全民转职：我觉醒了SSS级天赋」
   - 差的标题：「一个修仙者的成长故事」「关于重生的那些事」
4. **简介风格**：前 20 字必须制造悬念或冲突，让读者产生「想知道后面」的冲动
5. **反 AI 检测**：标题和简介不能有 AI 生成的痕迹（避免模板化、避免过度修饰语）

## 评分维度（每项 0-10 分）

- **suspense**（悬念感）：标题是否让人想点进去？
- **genreClarity**（类型清晰度）：看标题能否判断这是什么类型的小说？
- **contentAlignment**（内容匹配度）：标题/简介是否准确反映小说内容？

## 输出格式

严格输出 JSON，不要添加其他文本：
{
  "candidates": [
    {
      "title": "标题文本（≤${TOMATO_TITLE_MAX}字符）",
      "synopsis": "简介文本（≤${TOMATO_SYNOPSIS_MAX}字符）",
      "score": { "suspense": 8, "genreClarity": 9, "contentAlignment": 7 }
    }
  ],
  "genre": "题材类型",
  "sourcePatternSummary": "对竞品标题模式的简要分析"
}`;
}

export interface PackagerUserPromptParams {
  readonly bookTitle: string;
  readonly genre: string;
  readonly currentSynopsis?: string;
  readonly competitivePatterns: string;
  readonly count: number;
}

export function buildPackagerUserPrompt(params: PackagerUserPromptParams): string {
  const sections: string[] = [
    `## 书籍信息`,
    `- 书名：${params.bookTitle}`,
    `- 题材：${params.genre}`,
  ];

  if (params.currentSynopsis) {
    sections.push(`- 当前简介：${params.currentSynopsis}`);
  }

  sections.push(
    "",
    `## 竞品标题模式分析`,
    params.competitivePatterns,
    "",
    `## 任务`,
    `请为这本书生成 ${params.count} 个标题+简介候选。每个候选都需要独立评分。`,
    `确保标题之间有差异化（不要都是同一种套路），覆盖不同的悬念角度。`,
  );

  return sections.join("\n");
}
