# 章节细纲（Chapter Outlines）设计规格

## 概述

在书籍创建时一次性生成全书的章节细纲（每章 200-500 字，3-5 个情节点），作为卷级粗纲（volume_outline）与章级意图（intent）之间的中间层。PlannerAgent 在写作计划阶段引用细纲，约束章节写作方向。若某章细纲为空，增量补生成。

## 设计决策

| 决策 | 选择 |
|------|------|
| 生成时机 | `inkos book create` 时一次性生成全书；`inkos plan chapter` 时增量补生空章 |
| 存储位置 | `books/<id>/story/chapter_outlines.md` |
| 细纲格式 | 每章 `## 第 X 章`，下接 3-5 个编号情节点，全章 200-500 字 |
| 目标章节数 | 从 `inkos.json` 的 `targetChapters` 读取 |
| 与 volume_outline 冲突处理 | 合并：细纲在粗纲框架内展开细节，冲突时以 volume_outline 为准 |
| 增量同步 | `PlannerAgent.planChapter()` 执行时，若该章细纲为空则自动补生成 |

## 架构位置

```
inkos book create
  ├── ArchitectAgent.generateFoundation()     ← 现有，生成基础设定
  └── DetailedOutlineAgent.generateAll()    ← 新增，生成 chapter_outlines.md

inkos plan chapter
  └── PlannerAgent.planChapter()            ← 读取 chapter_outlines.md，注入 intent.md
        └── 若该章细纲为空 → DetailedOutlineAgent.generateSingle() 补生成

inkos write next
  └── WriterAgent                           ← 通过 context.json 间接获得本章细纲约束
```

## 文件格式

**`chapter_outlines.md`**：

```markdown
# 章节细纲

## 第 1 章：<标题占位，作者可编辑>
1. [场景/事件标题] 情节点描述内容，50-150 字...
2. [场景/事件标题] 情节点描述内容，50-150 字...
3. [场景/事件标题] 情节点描述内容，50-150 字...

## 第 2 章：<标题占位>
...
```

- 每个情节点 50-150 字，每章合计 200-500 字
- `## 第 X 章` 作为锚点，支持精确截取
- 标题占位符 `< >` 提示作者可编辑，正式使用时 PlannerAgent 自行判断是否引用标题

## DetailedOutlineAgent

### 输入（读取的文件）

| 文件 | 用途 |
|------|------|
| `story_bible.md` | 世界观、人物设定 |
| `volume_outline.md` | 卷级粗纲，每章的核心任务/事件 |
| `book_rules.md` | 题材规则与禁忌 |
| `character_matrix.md` | 角色关系与信息边界 |
| `inkos.json` | `targetChapters` 决定生成章数 |

### 输出

`chapter_outlines.md` 写入 `books/<id>/story/`。

### 生成原则

1. **顶层设计**：从书的核心冲突和主题出发，全书统一规划情节点
2. **从上到下**：先生成章节序列，再逐章展开 3-5 个情节点
3. **从整体到局部**：先确定每章在全书结构中的位置（铺垫/发展/高潮/收束），再分配具体情节
4. **尊重 volume_outline**：细纲是粗纲的详细展开，不偏离粗纲指定的方向
5. **不写具体对话**：情节点描述场景/事件/转折，不包含具体台词

### 失败处理

生成失败时抛出错误，阻止 `inkos book create` 完成。细纲是必须生成的构件。

## PlannerAgent 修改

### 读取新增源文件

在 `sourcePaths` 中新增：

```ts
chapterOutlines: join(storyDir, "chapter_outlines.md"),
```

### 注入 intent.md（上下文防膨胀）

**`PlannerAgent` 按需截取，不将全文加载进 LLM prompt。**

在 `intent.md` 的 `## Goal` 之前（或之后）新增区块：

```
## 本章细纲
<从 chapter_outlines.md 截取的该章内容，如无内容则标记"[待生成]">
```

`extractChapterOutline()` 用正则精确提取该章内容（见下方实现）。单章 200-500 字，100 章全书文件也不会撑爆上下文。

**`extractChapterOutline()` 实现：**

```ts
private extractChapterOutline(content: string, chapterNumber: number): string | undefined {
  const patterns = [
    // 中文：## 第 X 章 ... 开头，截取到下一章之前
    new RegExp(
      `(?:^|\\n)##\\s*第\\s*${chapterNumber}\\s*章[^\\n]*\\n([\\s\\S]*?)(?=\\n##\\s*第\\s*\\d+\\s*章|\\Z)`,
      "i",
    ),
    // 英文：## Chapter X ...
    new RegExp(
      `(?:^|\\n)##\\s*Chapter\\s*${chapterNumber}\\b[\\s\\S]*?\\n([\\s\\S]*?)(?=\\n##\\s*Chapter\\s*\\d+\\b|\\Z)`,
      "i",
    ),
  ];
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match?.[1]?.trim()) return match[1].trim();
  }
  return undefined;
}
```

如果该章锚点不存在或内容为空，显示 `[待生成]`，并在 `planChapter()` 返回前触发增量补生成。

### 增量补生成逻辑

```ts
// 检查该章细纲是否存在且有实质内容
const chapterOutline = extractChapterOutline(chapterOutlines, input.chapterNumber);
if (!chapterOutline || isEmptyOutline(chapterOutline)) {
  // 调用 DetailedOutlineAgent.generateSingle() 补生成
  const singleOutline = await detailedOutlineAgent.generateSingle({
    chapterNumber: input.chapterNumber,
    bookDir: input.bookDir,
  });
  // 写入 chapter_outlines.md 对应位置
  await patchChapterOutline(input.bookDir, input.chapterNumber, singleOutline);
  // 重新读取
  chapterOutline = extractChapterOutline(...);
}
```

## 增量补生成的输入

`DetailedOutlineAgent.generateSingle()` 需要：

| 输入 | 来源 |
|------|------|
| 该章在 volume_outline 中的内容 | `volume_outline.md` 解析 |
| 前一章细纲（作为上下文） | `chapter_outlines.md` 读取 |
| 前一章 summary | `chapter_summaries.md` 读取 |
| 当前 state | `current_state.md` 读取 |
| 该章目标字数 | 从 `book.json` 或 `length-governance` 配置读取 |

## 测试要点

1. `inkos book create` 成功生成 `chapter_outlines.md`，章节数等于 `targetChapters`
2. `chapter_outlines.md` 每章包含 3-5 个编号情节点，全章 200-500 字
3. PlannerAgent 在 `intent.md` 中正确引用本章细纲
4. 如果某章细纲为空，PlannerAgent 触发增量补生成并写入文件
5. volume_outline 中无内容的章节也能生成细纲（依赖 story_bible + 上下文推断）

## 待确认（设计时未决策，留待实现时决定）

- [ ] DetailedOutlineAgent 的 prompt 模板放在哪个文件？
- [ ] 增量补生成时，是否需要通知用户（log 或 output）？
- [ ] `chapter_outlines.md` 是否需要纳入 state version tracking（manifest.json）？
