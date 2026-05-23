import {
  COVER_TITLE_MIN,
  COVER_TITLE_MAX,
  COVER_PROMPT_MIN,
  COVER_PROMPT_MAX,
  COVER_SYNOPSIS_MIN,
  COVER_SYNOPSIS_MAX,
  COVER_CANDIDATE_COUNT,
} from "../models/cover.js";

export interface GenreCoverStyle {
  readonly colorPalette: readonly string[];
  readonly composition: string;
  readonly keywords: readonly string[];
  readonly mood: string;
}

export const GENRE_COVER_STYLES: Record<string, GenreCoverStyle> = {
  xuanhuan: {
    colorPalette: ["金色", "暗红", "玄黑"],
    composition: "能量爆发+大字标题，人物居中偏下，上方留空放书名",
    keywords: ["仙气", "剑光", "龙", "雷劫", "山门"],
    mood: "热血、苍茫、大气",
  },
  urban: {
    colorPalette: ["深蓝", "银白", "霓虹紫"],
    composition: "城市天际线+人物剪影，侧光对比强",
    keywords: ["都市夜景", "西装", "手机屏幕", "摩天大楼"],
    mood: "冷峻、悬疑、现代感",
  },
  scifi: {
    colorPalette: ["机械银", "蓝光", "深空黑"],
    composition: "机甲/飞船+人物远景，科技HUD叠加",
    keywords: ["机甲", "星舰", "能量护盾", "全息界面"],
    mood: "科技感、宏大、未来",
  },
};

const GENRE_TO_STYLE: Record<string, string> = {
  xuanhuan: "xuanhuan",
  xianxia: "xuanhuan",
  cultivation: "xuanhuan",
  progression: "xuanhuan",
  "dungeon-core": "xuanhuan",
  "tower-climber": "xuanhuan",
  urban: "urban",
  "sci-fi": "scifi",
};

export function resolveGenreCoverStyle(genre: string): {
  style: GenreCoverStyle;
  isFallback: boolean;
} {
  const styleKey = GENRE_TO_STYLE[genre] ?? "xuanhuan";
  const isFallback = !(genre in GENRE_TO_STYLE);
  return { style: GENRE_COVER_STYLES[styleKey]!, isFallback };
}

export interface CoverUserPromptParams {
  readonly bookTitle: string;
  readonly genre: string;
  readonly briefExtract: string;
  readonly storyFrameExtract: string;
  readonly characterAppearance: string;
  readonly extraContext?: string;
}

export function buildCoverSystemPrompt(genreStyle: GenreCoverStyle): string {
  return `你是番茄小说的封面设计+爽点简介专家。你的任务是为指定书籍生成${COVER_CANDIDATE_COUNT}个（标题变体+封面提示词+爽点简介）组合，用于豆包AI图片生成。

## 6组合多样性策略

每个组合对应不同的标题路线和封面构图风格：

| # | 标题路线 | 封面构图 | 简介侧重 |
|---|----------|----------|----------|
| 1 | 金手指型（直白卖点） | 主角特写+力量爆发 | 金手指机制 |
| 2 | 悬念型（疑问/反转） | 一对多战斗场面 | 反杀爽点 |
| 3 | 扮猪吃虎型（身份反差） | 上下对比构图 | 打脸桥段 |
| 4 | 痛感型（代价共鸣） | 情绪特写/伤痕 | 代价与收获 |
| 5 | 崛起型（时间跨度） | 逆光/出关大场面 | 成长弧线 |
| 6 | 数据型（量化爽感） | 俯瞰/全景视角 | 系统化能力 |

## 品类封面风格参考

- 色板：${genreStyle.colorPalette.join(" / ")}
- 构图：${genreStyle.composition}
- 关键词：${genreStyle.keywords.join(" / ")}
- 氛围：${genreStyle.mood}

## 核心规则

1. **标题长度**：${COVER_TITLE_MIN}-${COVER_TITLE_MAX}字符，封面标题需要完整表意
2. **封面提示词长度**：${COVER_PROMPT_MIN}-${COVER_PROMPT_MAX}字符（200-400字符为最佳区间）
3. **简介长度**：${COVER_SYNOPSIS_MIN}-${COVER_SYNOPSIS_MAX}字符
4. **封面提示词必须包含**：艺术风格描述（如"中国玄幻小说封面"）、构图方式、色调、人物描述、光影氛围、以及字面文本"600x800竖版"
5. **简介必须**：前20字制造悬念或冲突，突出金手指和反转，让读者产生"想知道后面"的冲动
6. **反AI检测**：避免模板化表达、避免过度修饰语、不用"揭秘""震撼""不可思议"等AI腔词汇
7. **书名变体**：每个组合的标题要和封面风格配套，不是同一个书名的不同写法
8. **必须基于本书内容**：封面提示词和简介必须引用"故事核心"中提供的具体人物、地点、金手指设定，禁止使用与本书无关的通用玄幻描述。人物描述使用角色信息中的外貌/身份细节，而非通用模板

## 输出格式

严格输出JSON，不要添加其他文本。只输出candidates数组，不要包含bookId或generatedAt字段：
{
  "candidates": [
    {
      "index": 1,
      "title": "标题变体（${COVER_TITLE_MIN}-${COVER_TITLE_MAX}字符）",
      "coverPrompt": "完整中文封面提示词（${COVER_PROMPT_MIN}-${COVER_PROMPT_MAX}字符，含600x800竖版）",
      "synopsis": "爽点简介（${COVER_SYNOPSIS_MIN}-${COVER_SYNOPSIS_MAX}字符）",
      "styleTag": "风格标签"
    }
  ]
}`;
}

export function buildCoverUserPrompt(params: CoverUserPromptParams): string {
  const sections: string[] = [
    `## 书籍信息`,
    `- 书名：${params.bookTitle}`,
    `- 题材：${params.genre}`,
  ];

  if (params.briefExtract) {
    sections.push("", `## 故事核心`, params.briefExtract);
  }

  if (params.storyFrameExtract) {
    sections.push("", `## 世界观与视觉元素`, params.storyFrameExtract);
  }

  if (params.characterAppearance) {
    sections.push("", `## 角色信息（用于人物描述和视觉设计）`, params.characterAppearance);
  }

  if (params.extraContext) {
    sections.push("", `## 额外要求`, params.extraContext);
  }

  sections.push(
    "",
    `## 任务`,
    `请为这本书生成 ${COVER_CANDIDATE_COUNT} 个（标题变体+封面提示词+爽点简介）组合。`,
    `每个组合对应不同的标题路线（金手指型、悬念型、扮猪吃虎型、痛感型、崛起型、数据型）。`,
    `标题要和封面风格配套，封面提示词可以直接粘贴到豆包生成600x800的封面图。`,
    `重要：封面提示词必须引用"故事核心"中的具体人物名称、地点、金手指机制，禁止使用通用玄幻模板。`,
  );

  return sections.join("\n");
}
