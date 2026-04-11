# BeatPlanner Agent Design — 章级节拍规划器

**Date:** 2026-04-12
**Author:** Claude
**Status:** Approved

---

## 1. Overview

InkOS currently generates chapter structure implicitly through `PlannerAgent` (goal + outlineNode) and `WriterAgent` (self-directed scene planning). There is no explicit per-chapter beat sheet, scene breakdown, or structural template beyond the volume outline.

This design introduces an independent **BeatPlannerAgent** that generates a per-chapter beat sheet before writing begins, giving the Writer a structured skeleton to follow while preserving creative autonomy.

---

## 2. Pipeline Position

```
prepareWriteInput()
  ├── PlannerAgent    → intent.md (goal / outlineNode / mustKeep / mustAvoid)
  ├── ComposerAgent   → context + rule-stack + lastChapterEnding + globalState
  │
  └── [NEW] BeatPlannerAgent  → chapter-XXXX-beats.md   ← inserted here

WriterAgent.writeChapter(beatSheet + context + intent)
```

- BeatPlanner runs inside `prepareWriteInput()`, after Composer, before Writer
- Output is written to `books/<id>/story/runtime/chapter-XXXX-beats.md`
- BeatPlanner output is a **soft constraint** — Writer retains creative freedom
- If BeatPlanner LLM call fails or times out, the pipeline degrades gracefully: Writer writes using intent alone with a warning logged

---

## 3. BeatSheet Output Format

File: `books/<id>/story/runtime/chapter-XXXX-beats.md`

```markdown
# Chapter N 节拍骨架

## 章节点锚定
- **卷纲节点**: 第N章归属卷纲节点（引用原文）
- **本章goal**: [来自PlannerAgent的goal]
- **本章类型**: [战斗章/过渡章/布局章/回收章/升级章]

## 节拍序列

| 顺序 | 节拍名称 | 场景/位置 | 目的 | 预期字数占比 |
|------|----------|-----------|------|-------------|
| 1 | 悬念引入 | [场景] | 承接上章钩子 | ~10% |
| 2 | 局势升级 | [场景] | 铺垫新冲突 | ~15% |
| 3 | 冲突爆发 | [场景] | 核心战斗/对峙 | ~35% |
| 4 | 小高潮 | [场景] | 爽点释放 | ~15% |
| 5 | 章尾悬念 | [场景] | 钩子留存 | ~10% |
| 6 | 回收伏笔 | [可选] | 本章内伏笔回收 | ~15% |

## 章末转折（代价 + 收获 成对出现）
> **代价**: [一句话说明本章代价：新困境/损失/隐患]
> **收获**: [一句话说明本章收获：新能力/情报/关系/机遇]
> **新困境+新机遇**: [两者成对出现的具体描述]

## 本章必须避免
- [来自PlannerAgent mustAvoid]
```

---

## 4. Writer Integration

### 4.1 Prompt Injection

WriterAgent's system prompt (in `writer-prompts.ts`) adds:

```markdown
## 章节节拍骨架（必须遵守）
{beatSheet内容内联嵌入}

## 写作要求
- 每个节拍需有对应的场景/段落，不得跳过节拍顺序
- 节拍1-2控制在{wordCount * 25%}字内，不得拖沓
- 节拍3冲突爆发需有具体场景描写（环境+对手+压力）
- 节拍4小高潮需有明确感官细节（视觉/听觉/心理三选二）
- 节拍5章尾悬念禁止以内心独白结尾，必须是外部事件或他人介入
- 章末钩子字数不限，但不得泄露答案
- **每章必须有明确的代价与收获，且在章末节拍中成对出现**
- **章末转折公式：新困境（代价） + 新机遇（收获）**
```

### 4.2 PRE_WRITE_CHECK Augmentation

Writer's `PRE_WRITE_CHECK` block adds one row:
```
节拍骨架: [节拍1名称] → [节拍2] → [节拍3] → [节拍4] → [节拍5]
```

---

## 5. Fantasy/Xuanhuan Beat Templates

### 5.1 Chapter Type Definitions

**玄幻（通用）**

| 类型 | 触发条件 |
|------|---------|
| 战斗章 | 卷纲含"战斗"/"大比"/"秘境"，或pendingHooks含战斗事件 |
| 升级章 | 全局状态含"突破"事件，或emotionalArcs含修炼进展 |
| 布局章 | 卷纲含"布局"/"谋划"/"阴谋" |
| 回收章 | 全局状态有前期伏笔到期需回收 |
| 过渡章 | 前3章有≥2章是战斗/升级类型 |

**仙侠专属**

| 类型 | 触发条件 |
|------|---------|
| 渡劫章 | pendingHooks含"渡劫"/"天劫"，或卷纲节点含"飞升"/"雷劫" |
| 悟道章 | emotionalArcs含"道心"事件，或卷纲含"顿悟"/"感悟" |

### 5.2 Beat Template Per Type

**通用原则：每章必须同时包含代价和收获，成对出现在章末转折中。**

#### 战斗章
| 节拍 | 占比 | 代价（条件触发） | 收获 |
|------|------|----------------|------|
| 悬念引入 | 10% | — | — |
| 局势升级 | 15% | — | — |
| **冲突爆发** | **35%+** | — | — |
| 小高潮 | 15% | **势均力敌→轻伤；碾压局→暴露底牌；险胜→心境波动** | 战胜方获战利品/领地/情报 |
| **章尾悬念** | **10%** | 代价显现（若无代价则无悬念钩子） | **额外收获**：敌方情报/新追随者/新目标浮现 |
| 回收伏笔 | 可选 | — | 本章内小伏笔回收 |

> 节拍4代价触发条件（三选一）：势均力敌→轻伤/灵力损耗；碾压局→底牌暴露/树敌；险胜→道心/心境波动。无代价的战斗章可跳过节拍4，直接以收获作为高潮。

#### 布局章
| 节拍 | 占比 | 代价 | 收获 |
|------|------|------|------|
| 悬念引入 | 15% | — | 引入阴谋/阴谋者 |
| **局势升级** | **35%+** | 阴谋推进中触怒潜在盟友 | 情报获取/识破敌人伪装 |
| 冲突爆发 | 20% | 阴谋部分暴露/陷入被动 | 主角做出关键决定 |
| 小高潮 | 10% | 决定带来风险 | 掌握主动权/获得盟友信任 |
| **章尾悬念** | **15%+** | 新困境出现 | 新盟友/新线索/新机遇浮现 |

#### 过渡章
| 节拍 | 占比 | 代价 | 收获 |
|------|------|------|------|
| 悬念引入 | 15% | 承接上章余波 | — |
| 局势升级 | 25% | 信息交代中暴露弱点 | 关系网铺设/获得关键信息 |
| 冲突爆发 | 20% | 日常冲突 | 误会解开/关系深化/新冲突浮现 |
| 小高潮 | 15% | 和好/误会加深 | 情感升温/获得意外帮助 |
| **章尾悬念** | **20%+** | 代价：意外事件打断平静 | **收获：下章大事件预告** |

#### 回收章
| 节拍 | 占比 | 代价 | 收获 |
|------|------|------|------|
| 悬念引入 | 10% | — | 上章钩子入场 |
| 局势升级 | 15% | — | 伏笔相关人物/场景入场 |
| **冲突爆发** | **35%** | 回收过程触发连锁反应 | — |
| **小高潮** | **25%+** | 代价：复仇成功引新敌/真相带来牺牲 | **收获：复仇成功/真相大白/宝物到手** |
| 章尾悬念 | 15% | 新困境（更深的阴谋/更强的敌人） | 新目标/新机遇 |

#### 升级章
| 节拍 | 占比 | 代价 | 收获 |
|------|------|------|------|
| 悬念引入 | 10% | — | 困境/瓶颈呈现 |
| 局势升级 | 20% | 代价：寻找契机过程中暴露需求 | 收获：发现突破方向/获得机缘 |
| 冲突爆发 | 25% | 代价：心魔/外界干扰 | — |
| **小高潮** | **30%+** | 代价：突破有隐患（根基不稳/心魔残留） | **收获：境界提升/新能力解锁** |
| **章尾悬念** | **15%** | **困境 + 机遇成对出现** |

#### 渡劫章（仙侠专属）
| 节拍 | 占比 | 代价 | 收获 |
|------|------|------|------|
| 悬念引入 | 15% | — | 劫云聚集/天象异变 |
| 局势升级 | 20% | 代价：回忆修行历程中道心动摇 | 收获：埋下因果伏笔/坚定道心 |
| **冲突爆发** | **30%** | 代价：天雷/心魔/外魔三劫连发 | — |
| **小高潮** | **25%+** | 代价：渡劫后极度虚弱 | **收获：道心稳固/天雷淬体/天道认可** |
| **章尾悬念** | **15%** | 代价：虚弱期被旧敌/天罚继续追击 | **收获：护道之物/新机缘显现** |

#### 悟道章（仙侠专属）
| 节拍 | 占比 | 代价 | 收获 |
|------|------|------|------|
| 悬念引入 | 15% | — | 修行瓶颈/心境动摇 |
| 局势升级 | 20% | 代价：外出寻机缘暴露行踪 | 收获：偶遇古修遗迹/前辈遗泽 |
| 冲突爆发 | 25% | 代价：悟道中心魔/幻境试炼 | — |
| **小高潮** | **30%+** | 代价：感悟天道引动旧因果反噬 | **收获：道心提升/新法则感悟/与天道共鸣** |
| **章尾悬念** | **15%** | 代价：新道引动天地异象/旧因果纠缠 | **收获：新能力解锁** |

---

**章末转折公式：代价 + 收获 = 新困境 + 新机遇**（两者必须同时出现）

---

## 6. BeatPlannerAgent Implementation

### 6.1 File Structure

```
packages/core/src/agents/
  beat-planner.ts              ← Agent implementation
  beat-planner-prompts.ts      ← Prompt templates (separate for maintainability)
packages/core/src/agents/index.ts  ← Export BeatPlannerAgent
packages/core/src/pipeline/runner.ts ← Integrate into prepareWriteInput
```

### 6.2 Input Schema

```typescript
interface BeatPlannerInput {
  bookId: string
  chapterNumber: number
  intent: ChapterIntent          // PlannerAgent output
  lastChapterEnding: string     // Composer: last 2-3 paragraphs of prev chapter
  recentEndings: string[]       // Composer: last 3 chapter endings (for dedup)
  currentState: object          // Composer: global state summary
  pendingHooks: Hook[]          // Composer: active hooks
  emotionalArcs: object         // Composer: character emotional arcs
  chapterType: string | null    // Optional hint from genre (null = auto-detect)
  wordCount: { min: number; target: number; max: number }
  genreConfig: GenreConfig      // chapterTypes, pacingRule, etc.
}
```

### 6.3 Output Schema

```typescript
interface BeatPlannerOutput {
  beatSheet: string             // Markdown beat sheet
  chapterType: string           // Confirmed/adjusted chapter type
  hookToAdvance: string | null  // Hook ID advanced by this chapter (if any)
  beatCount: number             // Number of beats (5 or 6)
}
```

### 6.4 Chapter Type Auto-Detection Logic

```
玄幻通用判断：
1. Check genre chapterTypes list
2. If volume outline node contains 战斗/大比/秘境 → 战斗章
3. If volume outline node contains 布局/阴谋/谋划 → 布局章
4. If currentState has due回收 events → 回收章
5. If pendingHooks has 突破/升级 → 升级章
6. If last 3 chapters have ≥2 战斗/升级 → 过渡章
7. Default: 战斗章

仙侠专属判断（优先级高于通用）：
1. If pendingHooks has 渡劫/天劫/飞升 → 渡劫章
2. If emotionalArcs has 道心 event → 悟道章
3. If volume outline node has 顿悟/感悟 → 悟道章
4. Fall through to 玄幻通用判断
```

### 6.5 BeatPlanner Prompt Core Logic

The prompt instructs the LLM to:
1. Read `lastChapterEnding` and design Beat 1 to naturally承接 it
2. Read `pendingHooks` and select 1 hook to advance in this chapter
3. Read `emotionalArcs` for the protagonist's emotional starting point
4. Apply the appropriate beat template based on auto-detected `chapterType`
5. Allocate word counts proportionally per `wordCount` target
6. Verify no `mustAvoid` items are triggered by any beat
7. Reference `recentEndings` to avoid repetitive scene types
8. **For each chapter, explicitly designate a 代价 beat and a 收获 beat** — the two must be present in every chapter (even if subtle for 过渡章)
9. **章末转折必须是代价+收获成对出现**：新困境与新机遇必须同时出现在章末节拍中

---

## 7. Error Handling & Degradation

| Failure Scenario | Handling |
|-----------------|----------|
| BeatPlanner LLM timeout/error | Skip beat sheet; Writer writes with intent only; log.warn |
| BeatSheet word count > ±30% of target | Writer adapts by expanding/compressing final beat |
| Beat sequence conflicts with mustAvoid | BeatPlanner retries once; if still conflict, skip beat sheet |
| ContinuityAuditor flags beat mismatch | Reviser may reference beat sheet for targeted repair |

---

## 8. Evaluation Metrics (Future)

```
beat_adherence_rate     = % of beats actually executed in final chapter
beat_type_accuracy      = BeatPlanner chapterType vs post-write classification
hook_advance_coverage   = active hooks advanced/repaid within N chapters
beat_mismatch_incidents = BeatPlanner beat ≠ actual chapter content (audit fails)
```

---

## 9. Files to Create/Modify

| File | Action |
|------|--------|
| `packages/core/src/agents/beat-planner.ts` | Create — BeatPlannerAgent implementation |
| `packages/core/src/agents/beat-planner-prompts.ts` | Create — prompt templates with 代价/收获 per type |
| `packages/core/src/agents/index.ts` | Add BeatPlannerAgent export |
| `packages/core/src/pipeline/runner.ts` | Add BeatPlanner call in `prepareWriteInput()` after Composer |
| `packages/core/src/agents/writer-prompts.ts` | Inject beat sheet + 代价收获 requirement into Writer prompt |
| `packages/core/src/models/input-governance.ts` | Add BeatPlannerInput/Output types + 渡劫章/悟道章 enums |
| `packages/core/src/index.ts` | Export new types |
| `docs/superpowers/specs/2026-04-12-beat-planner-design.md` | This document |
