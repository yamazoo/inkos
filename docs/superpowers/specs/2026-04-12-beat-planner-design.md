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

## 章末钩子
> **钩子描述**: [一句话说明本章结尾悬念]

## 情绪走向
- **起点情绪**: [紧张/压抑/期待]
- **终点情绪**: [震惊/愤怒/悬念]
- **弧线**: 低→高→骤降（战斗后代价）

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
```

### 4.2 PRE_WRITE_CHECK Augmentation

Writer's `PRE_WRITE_CHECK` block adds one row:
```
节拍骨架: [节拍1名称] → [节拍2] → [节拍3] → [节拍4] → [节拍5]
```

---

## 5. Fantasy/Xuanhuan Beat Templates

### 5.1 Chapter Type Definitions

| 类型 | 触发条件 |
|------|---------|
| 战斗章 | 卷纲含"战斗"/"大比"/"秘境"，或pendingHooks含战斗事件 |
| 升级章 | 全局状态含"突破"事件，或emotionalArcs含修炼进展 |
| 布局章 | 卷纲含"布局"/"谋划"/"阴谋" |
| 回收章 | 全局状态有前期伏笔到期需回收 |
| 过渡章 | 前3章有≥2章是战斗/升级类型 |

### 5.2 Beat Template Per Type

#### 战斗章
| 节拍 | 占比 | 特殊要求 |
|------|------|---------|
| 悬念引入 | 10% | 上章钩子 + 对手登场 |
| 局势升级 | 15% | 压低主角，制造以少敌多/实力差距 |
| **冲突爆发** | **40%+** | 环境描写 + 对手实力 + 压力渲染 |
| **小高潮** | **15%** | 胜负转折（惨胜/惜败/逆转） |
| 章尾悬念 | 10% | 代价显现（轻伤/底牌暴露/新敌出现） |
| 回收伏笔 | 可选15% | 本章内小伏笔回收 |

#### 布局章
| 节拍 | 占比 | 特殊要求 |
|------|------|---------|
| 悬念引入 | 15% | 引入阴谋/阴谋者 |
| **局势升级** | **35%+** | 阴谋逐步揭露，情报获取 |
| 冲突爆发 | 20% | 阴谋暴露或关键抉择 |
| 小高潮 | 10% | 主角做出决定 |
| **章尾悬念** | **15%+** | 关键信息暴露（不能是内心独白） |

#### 过渡章
| 节拍 | 占比 | 特殊要求 |
|------|------|---------|
| 悬念引入 | 15% | 承接上章余波 |
| 局势升级 | 25% | 信息交代，关系网铺设 |
| 冲突爆发 | 20% | 日常冲突（误会/争执/谈判） |
| 小高潮 | 15% | 情绪微起伏（和好/误会加深/新发现） |
| **章尾悬念** | **20%+** | 下章大事件预告 |

#### 回收章
| 节拍 | 占比 | 特殊要求 |
|------|------|---------|
| 悬念引入 | 10% | 上章钩子入场 |
| 局势升级 | 15% | 伏笔相关人物/场景入场 |
| **冲突爆发** | **35%** | 伏笔正式引爆 |
| **小高潮** | **25%+** | 爽感释放（复仇成功/真相大白/宝物到手） |
| 章尾悬念 | 15% | 新钩（更深的阴谋/更强的敌人/新目标） |

#### 升级章
| 节拍 | 占比 | 特殊要求 |
|------|------|---------|
| 悬念引入 | 10% | 困境/瓶颈呈现 |
| 局势升级 | 20% | 寻找突破契机 |
| 冲突爆发 | 25% | 修炼中的心魔/外界干扰 |
| **小高潮** | **30%+** | 突破描写（≥3感官细节：视觉/听觉/触觉/心理） |
| **章尾悬念** | **15%** | 新困境（新境界新敌人/副作用/根基不稳） |

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
1. Check genre chapterTypes list
2. If pendingHooks has "upgrade" → 升级章
3. If volume outline node contains 战斗/大比/秘境 → 战斗章
4. If volume outline node contains 布局/阴谋/谋划 → 布局章
5. If currentState has due回收 events → 回收章
6. If last 3 chapters have ≥2 战斗/升级 → 过渡章
7. Default: 战斗章
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
| `packages/core/src/agents/beat-planner.ts` | Create |
| `packages/core/src/agents/beat-planner-prompts.ts` | Create |
| `packages/core/src/agents/index.ts` | Add BeatPlannerAgent export |
| `packages/core/src/pipeline/runner.ts` | Add BeatPlanner call in `prepareWriteInput()` |
| `packages/core/src/agents/writer-prompts.ts` | Inject beat sheet into Writer prompt |
| `packages/core/src/models/input-governance.ts` | Add BeatPlannerInput/Output types |
| `packages/core/src/index.ts` | Export new types |
| `docs/superpowers/specs/YYYY-MM-DD-beat-planner-design.md` | This document |
