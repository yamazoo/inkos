# 时间线一致性检测系统设计

**日期**: 2026-05-17
**状态**: 已批准
**范围**: 状态层 + 审计层 + 修复层

## 问题

InkOS 的审计系统（维度2 Timeline Check）仅做章节间倒计时值比较，无法检测跨章事件时间锚点矛盾。

**示例失效场景**：
- 第1章细纲说"考核前三日去后山打狼"
- 第2章正文说"三天前在后山打狼" + "考核还有三天"
- 推算：打狼发生在考核前6天，与第1章的"考核前三日"矛盾
- 系统只比较倒计时值（3=3），未验证事件锚点一致性

## 方案：混合确定性提取 + LLM 语义补充

### 设计节 1/4：数据模型 — `state/timeline.json`

```json
{
  "storyDays": [
    { "chapter": 1, "storyDay": 1, "label": "退婚日" },
    { "chapter": 2, "storyDay": 2, "label": "对赌挑衅" },
    { "chapter": 3, "storyDay": 4, "label": "考核日" }
  ],
  "eventAnchors": [
    {
      "eventId": "wolf-fight",
      "label": "后山打狼（心之钢觉醒）",
      "storyDay": 1,
      "firstMentioned": { "chapter": 1, "raw": "后山独处时" },
      "crossReferences": [
        { "chapter": 2, "raw": "三天前在后山", "impliedDay": -2 }
      ]
    },
    {
      "eventId": "exam",
      "label": "年度考核",
      "storyDay": 4,
      "firstMentioned": { "chapter": 1, "raw": "考核前三日" },
      "countdowns": [
        { "chapter": 1, "raw": "考核前三日", "daysLeft": 3 },
        { "chapter": 2, "raw": "考核还有三天", "daysLeft": 3 }
      ]
    }
  ],
  "conflicts": [],
  "lastUpdatedChapter": 2
}
```

核心字段：
- **storyDays**：每章发生在故事内第几天（Settler 填写）
- **eventAnchors**：关键事件的时间锚点 + 跨章引用 + 倒计时追踪
- **crossReferences**：记录事件在不同章节中被引用时的时间描述
- **conflicts**：检测到的矛盾列表（供审计层读取）

### 设计节 2/4：状态层 — Settler 时间线提取与更新

在 Settler（第6步 Reflector）中新增 `=== TIMELINE ===` delta 标签：

```
=== TIMELINE ===
{
  "storyDay": 2,
  "dayLabel": "对赌挑衅日",
  "events": [
    { "id": "wolf-fight", "reference": "三天前在后山", "impliedOffset": -3 },
    { "id": "exam", "reference": "考核还有三天", "countdown": 3 }
  ]
}
```

**storyDay 推算规则：**
- 首章：storyDay = 1
- 后续章：Settler 从上一章的 storyDay 出发，结合本章文本中的时间标记推算
  - 无时间推进标记 → storyDay = 上章 storyDay（同日续写）
  - "第二天" / "翌日" → storyDay = 上章 + 1
  - "三天后" → storyDay = 上章 + 3
  - 倒计时标记（"考核还有N天"）→ storyDay = 事件锚点storyDay - N
- 若多个标记冲突，取最可靠的（倒计时 > 固定相对词 > 推算）

**处理流程：**

1. **提取阶段**：Settler 在结算时输出 `=== TIMELINE ===` 块，包含本章的故事日和事件引用
2. **合并阶段**：`applyTimelineDelta()` 读取现有 `timeline.json`，将新数据合并：
   - 更新 `storyDays` 数组（追加本章条目）
   - 对每个 event reference：查找已有 anchor，计算 `impliedDay = currentStoryDay - offset`
   - 若 `impliedDay` 与已有 anchor 的 `storyDay` 不一致 → 记录到 `conflicts`
3. **冲突标记**：冲突不在此阶段阻断，只在 timeline.json 中记录供审计层读取

**与现有 Settler 基础设施的集成：**
- 复用 `parseSettlementOutput()` 的标签解析机制
- 复用 `RuntimeStateDeltaSchema` 的 Zod 验证模式
- 复用 `applyRuntimeStateDelta()` 的不可变应用模式
- 新增 `TimelineDeltaSchema` 和 `applyTimelineDelta()`

### 设计节 3/4：审计层 — 增强维度2

增强现有的 `ContinuityAuditor` 维度2（Timeline Check），从"倒计时比较"升级为"时间线一致性验证"。

**审计提示词注入：**

在现有 temporal markers 块之外，额外注入 `timeline.json` 摘要：

```
## 时间线状态
故事日历：第1章=第1天"退婚日", 第2章=第2天"对赌挑衅"
关键事件锚点：
- wolf-fight(第1天): 后山打狼 | ch2引用"三天前"→应为第-2天[矛盾!]
- exam(第4天): 年度考核 | ch2倒计时"还有3天"→应为第1天[矛盾!]
```

**三级检测机制：**

| 级别 | 检测方式 | 示例 | 处理 |
|------|----------|------|------|
| L1 确定性 | 倒计时值矛盾（现有） | ch1"还有3天" vs ch2"还有4天" | critical |
| L2 锚点校验 | 事件引用推算日 vs 已知锚点日 | wolf-fight 锚点=第1天，ch2"三天前"推算=-2天 | critical |
| L3 日历连续性 | 本章storyDay vs 上章storyDay 不合理跳跃 | ch1=第1天, ch2=第100天（无解释） | warning |

**触发条件：**
- L1/L2 矛盾 → `critical` → audit-failed（阻断）
- L3 异常 → `warning`（不阻断，但记录）

### 设计节 4/4：修复层 — Revise 矛盾注入

当审计检测到时间线矛盾（L1/L2 critical）时，自动将矛盾详情注入 revise 上下文。

**注入格式：**

```
## 时间线修复指令
检测到以下矛盾，必须修正：

[矛盾1] wolf-fight 事件引用冲突
- 锚点：后山打狼发生在故事第1天（第1章）
- 当前章引用："三天前在后山"（暗示第-2天，矛盾）
- 修正方向：改为"昨天在后山"或"前天在后山"，使推算日=第1天

修复后，所有事件引用必须与timeline.json中的锚点一致。
```

**revise 流程变更：**

1. `auditChapter()` 返回 critical 时，检查是否为维度2时间线矛盾
2. 若是 → 从 `timeline.json` 的 `conflicts` 字段提取矛盾详情
3. 注入 revise 的 user prompt 中（追加到现有上下文后）
4. revise 完成后 → 重新走审计流程，验证矛盾是否已修复

**与现有 revise 模式的兼容：**
- `local-fix` / `spot-fix`：注入矛盾指令，只改时间线相关文本
- `rewrite`：注入矛盾指令，整体重写时保持时间线一致
- 不影响其他维度的修复逻辑

## 涉及文件

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `packages/core/src/utils/temporal-markers.ts` | 增强 | 添加事件锚点提取逻辑 |
| `packages/core/src/utils/timeline.ts` | 新建 | timeline.json 读写、合并、冲突检测 |
| `packages/core/src/models/timeline.ts` | 新建 | TimelineDeltaSchema, EventAnchorSchema 等 Zod schema |
| `packages/core/src/agents/continuity.ts` | 增强 | 维度2 提示词注入 timeline.json 摘要 |
| `packages/core/src/agents/settler-parser.ts` | 增强 | 解析 `=== TIMELINE ===` 标签 |
| `packages/core/src/pipeline/runner.ts` | 增强 | Settler 后调用 timeline 合并，revise 注入矛盾指令 |
| `packages/core/src/agents/settler.ts` | 增强 | 系统提示词要求输出 TIMELINE 块 |

## 不做的事

- 不追踪非关键事件的时间（如"吃饭"、"走路"）
- 不建立绝对日期系统（用相对故事天数）
- 不自动修改 state 文件（阻断后由 revise 处理）
- 不影响现有 temporal-markers.ts 的正则提取逻辑（复用，不替换）
