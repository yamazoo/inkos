import type { ChapterType } from "../models/input-governance.js";
import type { BeatPlannerInput } from "../models/input-governance.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const COMBAT_BEATS = `| 节拍名称 | 默认占比 | 代价 | 收获 | 要求 |
|---|---|---|---|---|
| 悬念引入 | 10% | — | — | 自然引出悬念 |
| 局势升级 | 15% | — | — | 冲突预兆 |
| 冲突爆发 | 35%+ | — | — | 战斗展开，主视角清晰 |
| 小高潮 | 15% | 势均力敌→轻伤；险胜→心境波动；碾压局→暴露底牌 | 战胜方获战利品/情报 | — |
| 章末悬念 | 10% | 代价显现 | 额外收获/新目标浮现 | 代价+收获构成转折 |
| 回收伏笔 | 可选 | — | 伏笔回收 | — |`;

const UPGRADE_BEATS = `| 节拍名称 | 默认占比 | 代价 | 收获 | 要求 |
|---|---|---|---|---|
| 悬念引入 | 10% | — | 困境/瓶颈呈现 | — |
| 局势升级 | 20% | 寻找契机暴露需求 | 发现突破方向/机缘 | — |
| 冲突爆发 | 25% | 心魔/外界干扰 | — | — |
| 小高潮 | 30%+ | 突破有隐患（根基不稳/心魔残留） | 境界提升/新能力解锁 | 感官细节≥3维 |
| 章末悬念 | 15% | 新困境（代价） | 新机遇（收获） | 代价+收获构成转折 |`;

const SCHEME_BEATS = `| 节拍名称 | 默认占比 | 代价 | 收获 | 要求 |
|---|---|---|---|---|
| 悬念引入 | 15% | — | 阴谋/阴谋者入场 | — |
| 局势升级 | 35%+ | 触怒潜在盟友 | 情报获取/识破敌人 | — |
| 冲突爆发 | 20% | 阴谋部分暴露/陷入被动 | 主角做出关键决定 | — |
| 小高潮 | 10% | 决定带来风险 | 掌握主动权/获得信任 | — |
| 章末悬念 | 15%+ | 新困境 | 新盟友/新线索 | 代价+收获构成转折 |`;

const PAYOFF_BEATS = `| 节拍名称 | 默认占比 | 代价 | 收获 | 要求 |
|---|---|---|---|---|
| 悬念引入 | 10% | — | 上章钩子入场 | — |
| 局势升级 | 15% | — | 伏笔相关人物/场景入场 | — |
| 冲突爆发 | 35% | 回收触发连锁反应 | — | — |
| 小高潮 | 25%+ | 复仇引新敌/真相带来牺牲 | 复仇成功/真相大白/宝物到手 | — |
| 章末悬念 | 15% | 新困境 | 新目标/新机遇 | 代价+收获构成转折 |`;

const TRANSITION_BEATS = `| 节拍名称 | 默认占比 | 代价 | 收获 | 要求 |
|---|---|---|---|---|
| 悬念引入 | 15% | — | 承接上章余波 | — |
| 局势升级 | 25% | 暴露弱点 | 关系网铺设/关键信息 | — |
| 冲突爆发 | 20% | 日常冲突 | 误会解开/关系深化 | — |
| 小高潮 | 15% | 和好/误会加深 | 情感升温/意外帮助 | — |
| 章末悬念 | 20%+ | 意外事件打断平静 | 下章大事件预告 | 代价+收获构成转折 |`;

const TRIBULATION_BEATS = `| 节拍名称 | 默认占比 | 代价 | 收获 | 要求 |
|---|---|---|---|---|
| 悬念引入 | 15% | — | 劫云聚集/天象异变 | — |
| 局势升级 | 20% | 道心动摇 | 埋因果伏笔/坚定道心 | — |
| 冲突爆发 | 30% | 天雷/心魔/外魔三劫连发 | — | — |
| 小高潮 | 25%+ | 渡劫后极度虚弱 | 道心稳固/天雷淬体/天道认可 | 感官细节≥4维 |
| 章末悬念 | 15% | 虚弱期被旧敌/天罚追击 | 护道之物/新机缘显现 | 代价+收获构成转折 |`;

const ENLIGHTENMENT_BEATS = `| 节拍名称 | 默认占比 | 代价 | 收获 | 要求 |
|---|---|---|---|---|
| 悬念引入 | 15% | — | 修行瓶颈/心境动摇 | — |
| 局势升级 | 20% | 外出寻机缘暴露行踪 | 偶遇古修遗迹/前辈遗泽 | — |
| 冲突爆发 | 25% | 悟道中心魔/幻境试炼 | — | — |
| 小高潮 | 30%+ | 感悟引动旧因果反噬 | 道心提升/新法则感悟/与天道共鸣 | 感官细节≥4维 |
| 章末悬念 | 15% | 新道引动天地异象/旧因果纠缠 | 新能力解锁 | 代价+收获构成转折 |`;

const BEAT_TABLES: Record<ChapterType, string> = {
  combat: COMBAT_BEATS,
  upgrade: UPGRADE_BEATS,
  scheme: SCHEME_BEATS,
  payoff: PAYOFF_BEATS,
  transition: TRANSITION_BEATS,
  tribulation: TRIBULATION_BEATS,
  enlightenment: ENLIGHTENMENT_BEATS,
};

// ---------------------------------------------------------------------------
// English beat tables
// ---------------------------------------------------------------------------

const EN_COMBAT_BEATS = `| Beat | Default % | Cost | Gain | Requirement |
|---|---|---|---|---|
| Hook Intro | 10% | — | — | Naturally introduce the hook |
| Escalation | 15% | — | — | Conflict brewing |
| Conflict Explosion | 35%+ | — | — | Battle unfolds, clear POV |
| Mini Climax | 15% | Even match→minor injury; close win→mood swing; stomp→reveals trump card | Victor gains spoils/info | — |
| Chapter Cliffhanger | 10% | Cost manifests | Extra gain / new goal emerges | Cost + Gain form the turning point |
| Payoff (optional) | — | — | Hook payoff | — |`;

const EN_UPGRADE_BEATS = `| Beat | Default % | Cost | Gain | Requirement |
|---|---|---|---|---|
| Hook Intro | 10% | — | Dilemma/bottleneck presented | — |
| Escalation | 20% | Search exposes need | Breakthrough direction/discovery found | — |
| Conflict Explosion | 25% | Inner demon / external interference | — | — |
| Mini Climax | 30%+ | Breakthrough carries hidden cost (unstable foundation / residual demon) | Cultivation level up / new ability unlocked | Sensory details ≥3 dimensions |
| Chapter Cliffhanger | 15% | New dilemma (cost) | New opportunity (gain) | Cost + Gain form the turning point |`;

const EN_SCHEME_BEATS = `| Beat | Default % | Cost | Gain | Requirement |
|---|---|---|---|---|
| Hook Intro | 15% | — | Conspiracy/conspirator enters | — |
| Escalation | 35%+ | Offends potential ally | Intel gathered / enemy identified | — |
| Conflict Explosion | 20% | Partial exposure / caught off-guard | Protagonist makes key decision | — |
| Mini Climax | 10% | Decision brings risk | Gains initiative / earns trust | — |
| Chapter Cliffhanger | 15%+ | New dilemma | New ally / new clue | Cost + Gain form the turning point |`;

const EN_PAYOFF_BEATS = `| Beat | Default % | Cost | Gain | Requirement |
|---|---|---|---|---|
| Hook Intro | 10% | — | Previous chapter hook enters | — |
| Escalation | 15% | — | Hook-related character/scene enters | — |
| Conflict Explosion | 35% | Payoff triggers chain reaction | — | — |
| Mini Climax | 25%+ | Revenge creates new enemy / truth requires sacrifice | Revenge success / truth revealed / treasure obtained | — |
| Chapter Cliffhanger | 15% | New dilemma | New goal / new opportunity | Cost + Gain form the turning point |`;

const EN_TRANSITION_BEATS = `| Beat | Default % | Cost | Gain | Requirement |
|---|---|---|---|---|
| Hook Intro | 15% | — | Pick up previous chapter's aftermath | — |
| Escalation | 25% | Weakness exposed | Relationship network laid out / key intel | — |
| Conflict Explosion | 20% | Daily conflict | Misunderstanding cleared / bond deepens | — |
| Mini Climax | 15% | Reconciliation / misunderstanding deepens | Emotional warmth / unexpected help | — |
| Chapter Cliffhanger | 20%+ | Unexpected event disrupts peace | Next chapter's big event teased | Cost + Gain form the turning point |`;

const EN_TRIBULATION_BEATS = `| Beat | Default % | Cost | Gain | Requirement |
|---|---|---|---|---|
| Hook Intro | 15% | — | Tribulation clouds gather / celestial signs | — |
| Escalation | 20% | Dao heart wavers | Plant causal hook / solidify Dao heart | — |
| Conflict Explosion | 30% | Heavenly thunder / inner demon / outer demon triple strike | — | — |
| Mini Climax | 25%+ | Extremely weakened post-tribulation | Dao heart stabilized / heavenly thunder tempered body / heavenly认可 | Sensory details ≥4 dimensions |
| Chapter Cliffhanger | 15% | Old enemies / heavenly punishment pursue in weakened state | Guardian artifact / new opportunity emerges | Cost + Gain form the turning point |`;

const EN_ENLIGHTENMENT_BEATS = `| Beat | Default % | Cost | Gain | Requirement |
|---|---|---|---|---|
| Hook Intro | 15% | — | Cultivation bottleneck / mood unstable | — |
| Escalation | 20% | Journey reveals location | Encounter ancient cultivator ruin / predecessor's legacy | — |
| Conflict Explosion | 25% | Inner demon / illusion trial during enlightenment | — | — |
| Mini Climax | 30%+ | Enlightenment triggers old karma backlash | Dao heart elevated / new law comprehension / resonates with heaven | Sensory details ≥4 dimensions |
| Chapter Cliffhanger | 15% | New path triggers celestial phenomenon / old karma entangles | New ability unlocked | Cost + Gain form the turning point |`;

const EN_BEAT_TABLES: Record<ChapterType, string> = {
  combat: EN_COMBAT_BEATS,
  upgrade: EN_UPGRADE_BEATS,
  scheme: EN_SCHEME_BEATS,
  payoff: EN_PAYOFF_BEATS,
  transition: EN_TRANSITION_BEATS,
  tribulation: EN_TRIBULATION_BEATS,
  enlightenment: EN_ENLIGHTENMENT_BEATS,
};

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------

function buildSystemPromptZh(): string {
  return `你是一个网文（玄幻/仙侠）章节节拍规划器。

## 核心职责

根据章节意图和全局状态，为当前章节规划节拍（Beat Sheet）。

## 核心规则

1. **自动检测章类**：根据待推进伏笔、情感弧线、卷纲节点、全局状态等上下文，按优先级自动匹配章类
2. **应用正确模板**：7种章类各有专属节拍模板，严格按模板占比规划
3. **章末转折铁律**：每章必须有 代价+收获，格式为：
   - 新困境（代价）+ 新机遇（收获）
4. **衔接上章**：节拍1（悬念引入）必须自然承接上章结尾的情绪与节奏
5. **遵守mustAvoid**：mustAvoid中的元素严禁出现在本章
6. **避免重复**：不要重复近期章节结尾的场景类型（战斗/升级/布局等），保持结构多样性
7. **字数容差**：目标字数±10%，节拍占比在合理范围内微调

## 章类自动检测（按优先级）

1. pendingHooks 含"渡劫"/"天劫"/"飞升" → tribulation（渡劫章）
2. emotionalArcs 含"道心" → enlightenment（悟道章）
3. 卷纲节点含"战斗"/"大比"/"秘境" → combat（战斗章）
4. 卷纲节点含"布局"/"谋划"/"阴谋" → scheme（布局章）
5. 全局状态有待回收伏笔 → payoff（回收章）
6. pendingHooks 含"突破"/"升级" → upgrade（升级章）
7. 前3章有≥2章是战斗/升级 → transition（过渡章）
8. Default → combat（战斗章）

## 节拍模板

### 战斗章（combat）

${COMBAT_BEATS}

### 升级章（upgrade）

${UPGRADE_BEATS}

### 布局章（scheme）

${SCHEME_BEATS}

### 回收章（payoff）

${PAYOFF_BEATS}

### 过渡章（transition）

${TRANSITION_BEATS}

### 渡劫章（tribulation）

${TRIBULATION_BEATS}

### 悟道章（enlightenment）

${ENLIGHTENMENT_BEATS}

## 输出格式

直接输出 Markdown 节拍表（不含 JSON 包装）：

\`\`\`markdown
# 第{章号}章 节拍规划

**章类**: {检测到的章类}
**目标字数**: {target}字（±10%）

## 节拍表

{节拍表}

## 节拍说明

- **节拍1（悬念引入）**: {承接上章结尾}
- **节拍2（局势升级）**: {说明}
- **节拍3（冲突爆发）**: {说明}
- **节拍4（小高潮）**: {代价} → {收获}
- **节拍5（章末转折）**: {代价} + {收获}
- **{回收伏笔（若有）}**: {说明}

## 伏笔推进

- 待推进伏笔: {来自pendingHooks的钩子列表}
- 本章推进: {推进的伏笔id及推进方式}
- 新伏笔: {若有则列出}
\`\`\`

**重要**：
- 小高潮和章末转折必须包含代价（cost）和收获（gain）两要素
- 章末转折的代价必须是新困境，收获必须是新机遇，两者缺一不可
- 节拍说明要具体（场景/人物/情绪），不要泛泛而谈`;
}

function buildSystemPromptEn(): string {
  return `You are a web novel (fantasy/xianxia) chapter beat planner.

## Core Responsibilities

Based on chapter intent and global state, plan the beat sheet for the current chapter.

## Core Rules

1. **Auto-detect chapter type**: Match chapter type automatically by priority using pending hooks, emotional arcs, volume outline nodes, and global state
2. **Apply correct template**: 7 chapter types each have exclusive beat templates; strictly follow template proportions
3. **Chapter-ending turning point rule (铁律)**: Every chapter must have Cost + Gain, format:
   - New dilemma (cost) + New opportunity (gain)
4. **Connect to previous chapter**: Beat 1 (Hook Intro) must naturally follow the tone and rhythm of the previous chapter's ending
5. **Respect mustAvoid**: Elements in mustAvoid must NOT appear in this chapter
6. **Avoid repetition**: Do not repeat recent chapter-ending scene types (combat/upgrade/scheme etc.); maintain structural diversity
7. **Word count tolerance**: Target ±10%, beat proportions may be slightly adjusted within reason

## Chapter Type Detection (by priority)

1. pendingHooks contains "渡劫"/"天劫"/"飞升" → tribulation
2. emotionalArcs contains "道心" → enlightenment
3. Volume outline node contains "战斗"/"大比"/"秘境" → combat
4. Volume outline node contains "布局"/"谋划"/"阴谋" → scheme
5. Global state has pending hooks to pay off → payoff
6. pendingHooks contains "突破"/"升级" → upgrade
7. Previous 3 chapters have ≥2 that are combat/upgrade → transition
8. Default → combat

## Beat Templates

### Combat Chapter (combat)

${EN_COMBAT_BEATS}

### Upgrade Chapter (upgrade)

${EN_UPGRADE_BEATS}

### Scheme Chapter (scheme)

${EN_SCHEME_BEATS}

### Payoff Chapter (payoff)

${EN_PAYOFF_BEATS}

### Transition Chapter (transition)

${EN_TRANSITION_BEATS}

### Tribulation Chapter (tribulation)

${EN_TRIBULATION_BEATS}

### Enlightenment Chapter (enlightenment)

${EN_ENLIGHTENMENT_BEATS}

## Output Format

Output Markdown beat sheet directly (no JSON wrapper):

\`\`\`markdown
# Chapter {N} Beat Sheet

**Chapter Type**: {detected type}
**Target Word Count**: {target} words (±10%)

## Beat Table

{beat table}

## Beat Notes

- **Beat 1 (Hook Intro)**: {connect to previous chapter ending}
- **Beat 2 (Escalation)**: {description}
- **Beat 3 (Conflict Explosion)**: {description}
- **Beat 4 (Mini Climax)**: {cost} → {gain}
- **Beat 5 (Chapter Cliffhanger)**: {cost} + {gain}
- **{Payoff (if any)}**: {description}

## Hook Advancement

- Hooks to advance: {from pendingHooks list}
- Advanced this chapter: {hook id and method}
- New hooks: {if any}
\`\`\`

**Important**:
- Beat 4 (Mini Climax) and Beat 5 (Chapter Cliffhanger) must each include both cost and gain
- The chapter cliffhanger's cost must be a new dilemma, and gain must be a new opportunity; both are mandatory
- Beat notes should be specific (scene/character/emotion), not vague`;
}

// ---------------------------------------------------------------------------
// User prompt
// ---------------------------------------------------------------------------

function buildUserPromptZh(input: BeatPlannerInput): string {
  const lines: string[] = [];
  const intent = input.intent;

  lines.push(`# 第${input.chapterNumber}章 节拍规划请求`);
  lines.push("");

  lines.push("## 章节目标");
  lines.push(intent.goal);
  lines.push("");

  if (intent.outlineNode) {
    lines.push("## 卷纲节点");
    lines.push(intent.outlineNode);
    lines.push("");
  }

  if (intent.mustKeep.length > 0) {
    lines.push("## 必须保留（mustKeep）");
    for (const item of intent.mustKeep) {
      lines.push(`- ${item}`);
    }
    lines.push("");
  }

  if (intent.mustAvoid.length > 0) {
    lines.push("## 禁止出现（mustAvoid）");
    for (const item of intent.mustAvoid) {
      lines.push(`- ${item}`);
    }
    lines.push("");
  }

  if (input.lastChapterEnding) {
    lines.push("## 上章结尾（lastChapterEnding）");
    lines.push(input.lastChapterEnding);
    lines.push("");
  }

  if (input.recentEndings.length > 0) {
    lines.push("## 近期章节结尾（recentEndings）");
    for (let i = 0; i < input.recentEndings.length; i++) {
      lines.push(`### 近${i + 1}章`);
      lines.push(input.recentEndings[i]);
    }
    lines.push("");
  }

  if (input.pendingHooks.length > 0) {
    lines.push("## 待推进伏笔（pendingHooks）");
    for (const hook of input.pendingHooks) {
      lines.push(`- **${hook.hookId}** [${hook.type}] [${hook.status}]: ${hook.expectedPayoff}`);
      if (hook.notes) lines.push(`  注: ${hook.notes}`);
    }
    lines.push("");
  }

  lines.push("## 全局状态摘要（currentState）");
  lines.push(input.currentState);
  lines.push("");

  if (input.emotionalArcs) {
    lines.push("## 情感弧线（emotionalArcs）");
    lines.push(input.emotionalArcs);
    lines.push("");
  }

  if (input.genreChapterTypes.length > 0) {
    lines.push("## 题材章类类型（genreChapterTypes）");
    lines.push(input.genreChapterTypes.join(" / "));
    lines.push("");
  }

  lines.push(`## 目标字数\n- 最低: ${input.wordCount.min}\n- 目标: ${input.wordCount.target}\n- 最高: ${input.wordCount.max}`);
  lines.push("");

  return lines.join("\n");
}

function buildUserPromptEn(input: BeatPlannerInput): string {
  const lines: string[] = [];
  const intent = input.intent;

  lines.push(`# Chapter ${input.chapterNumber} Beat Planning Request`);
  lines.push("");

  lines.push("## Chapter Goal");
  lines.push(intent.goal);
  lines.push("");

  if (intent.outlineNode) {
    lines.push("## Volume Outline Node");
    lines.push(intent.outlineNode);
    lines.push("");
  }

  if (intent.mustKeep.length > 0) {
    lines.push("## Must Keep");
    for (const item of intent.mustKeep) {
      lines.push(`- ${item}`);
    }
    lines.push("");
  }

  if (intent.mustAvoid.length > 0) {
    lines.push("## Must Avoid");
    for (const item of intent.mustAvoid) {
      lines.push(`- ${item}`);
    }
    lines.push("");
  }

  if (input.lastChapterEnding) {
    lines.push("## Previous Chapter Ending (lastChapterEnding)");
    lines.push(input.lastChapterEnding);
    lines.push("");
  }

  if (input.recentEndings.length > 0) {
    lines.push("## Recent Chapter Endings (recentEndings)");
    for (let i = 0; i < input.recentEndings.length; i++) {
      lines.push(`### ${i + 1} chapter(s) ago`);
      lines.push(input.recentEndings[i]);
    }
    lines.push("");
  }

  if (input.pendingHooks.length > 0) {
    lines.push("## Pending Hooks (pendingHooks)");
    for (const hook of input.pendingHooks) {
      lines.push(`- **${hook.hookId}** [${hook.type}] [${hook.status}]: ${hook.expectedPayoff}`);
      if (hook.notes) lines.push(`  Note: ${hook.notes}`);
    }
    lines.push("");
  }

  lines.push("## Global State Summary (currentState)");
  lines.push(input.currentState);
  lines.push("");

  if (input.emotionalArcs) {
    lines.push("## Emotional Arcs (emotionalArcs)");
    lines.push(input.emotionalArcs);
    lines.push("");
  }

  if (input.genreChapterTypes.length > 0) {
    lines.push("## Genre Chapter Types (genreChapterTypes)");
    lines.push(input.genreChapterTypes.join(" / "));
    lines.push("");
  }

  lines.push(`## Target Word Count\n- Minimum: ${input.wordCount.min}\n- Target: ${input.wordCount.target}\n- Maximum: ${input.wordCount.max}`);
  lines.push("");

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function buildBeatPlannerSystemPrompt(language: "zh" | "en"): string {
  return language === "en" ? buildSystemPromptEn() : buildSystemPromptZh();
}

export function buildBeatPlannerUserPrompt(input: BeatPlannerInput, language: "zh" | "en"): string {
  return language === "en" ? buildUserPromptEn(input) : buildUserPromptZh(input);
}
