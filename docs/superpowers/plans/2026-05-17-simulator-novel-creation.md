# 《全球觉醒：我能模拟未来》创建与写作 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 使用 InkOS CLI 创建一本都市异能系统流小说，配置写作引导文件，生成大纲，然后批量写作前 10 章。

**Architecture:** 通过 InkOS 的 `book create` → 编辑引导文件 → `plan chapter` → `compose chapter` → `write next` 流水线完成。所有操作通过 CLI 命令执行，引导文件通过编辑器直接修改。

**Tech Stack:** InkOS CLI, Node.js, LLM API (配置在 inkos.json 或 ~/.inkos/.env)

**设计文档:** `docs/superpowers/specs/2026-05-17-simulator-urban-spirit-design.md`
**创作简报:** `docs/superpowers/specs/2026-05-17-simulator-brief.md`

---

### Task 1: 创建书籍

**Files:**
- Create: `books/<bookId>/book.json` (由 CLI 自动生成)
- Create: `books/<bookId>/story/author_intent.md` (模板)
- Create: `books/<bookId>/story/current_focus.md` (模板)
- Create: `books/<bookId>/story/style_guide.md` (模板)
- Create: `books/<bookId>/story/outline/` (空目录)
- Create: `books/<bookId>/story/roles/主要角色/` (空目录)
- Create: `books/<bookId>/story/roles/次要角色/` (空目录)

- [ ] **Step 1: 确认 LLM 配置**

检查 `inkos.json` 中的 LLM 配置是否已设置。如果 `llm.provider` 或 `llm.model` 为空，需要先配置：

```bash
inkos config set-global --provider <provider> --model <model> --api-key <key>
```

或者检查 `~/.inkos/.env` 中是否有全局配置。

- [ ] **Step 2: 创建书籍**

```bash
inkos book create --title "全球觉醒：我能模拟未来" --genre urban --platform tomato --chapter-words 3000 --brief docs/superpowers/specs/2026-05-17-simulator-brief.md --lang zh
```

Expected output: CLI 输出创建成功信息，显示 book-id（如 `quanqiujuexing` 或类似）。

- [ ] **Step 3: 记录 book-id**

从 Step 2 的输出中提取 book-id，后续所有命令都需要用到。如果项目中只有一本书，book-id 可省略。

- [ ] **Step 4: 验证创建结果**

```bash
inkos book status <book-id>
```

Expected: 显示书籍信息，状态正常。

- [ ] **Step 5: 提交**

```bash
git add books/<book-id>/
git commit -m "feat: create simulator novel book scaffold"
```

---

### Task 2: 编写 author_intent.md（作者意图）

**Files:**
- Modify: `books/<book-id>/story/author_intent.md`

- [ ] **Step 1: 读取当前文件**

读取 `books/<book-id>/story/author_intent.md`，了解模板结构。

- [ ] **Step 2: 写入作者意图**

将以下内容写入 `books/<book-id>/story/author_intent.md`：

```markdown
# 作者意图

## 书名
《全球觉醒：我能模拟未来》

## 一句话概括
普通大一新生在灵气复苏时代觉醒「未来模拟器」，靠模拟未来事件走向获取信息差优势，从F级废物一路逆袭至巅峰。

## 长期愿景
一本都市异能系统流纯爽文，以「未来模拟器」为核心卖点。主角林默是19岁大一新生，F级「微弱感知」觉醒者，通过模拟器获得信息差优势，在灵气复苏的现代社会中逆袭崛起。

## 核心卖点
1. **未来模拟器系统**：模拟未来24小时事件走向，获取信息差优势。不是数值碾压，而是智慧碾压
2. **都市异能背景**：灵气复苏三年后的现代社会，觉醒者学院+灵域探索+势力博弈
3. **谋定而后动**：主角永远先模拟再行动，从不打无准备之仗

## 世界观
- 灵气复苏三年，人类觉醒异能，等级F→E→D→C→B→A→S
- 异能管理局管控觉醒者，灵域产出资源被大家族垄断
- 觉醒者学院按等级分班，F级等同废物

## 系统：未来模拟器
- 消耗精神力模拟未来24小时内的具体事件
- 沉浸式第一人称体验，结束后获得模拟报告
- 信息保留，物质奖励需真正执行获取
- 初期每天2-3次，模拟中死亡造成精神损伤
- 成长路线：F→E每天2-3次/24小时，D→C每天5-8次/72小时，B→A每天10+/一周+分支模拟，S无限制

## 主角：林默
- 19岁，大一新生，F级「微弱感知」
- 普通家庭，无背景无资源
- 性格：表面低调，内心不服输，谋定而后动
- 不是圣母，不做亏本买卖，但有底线

## 核心配角
- 张昊：室友，D级力量觉醒者，热血莽夫，对照组
- 苏晴：C级治疗系，异能管理局实习成员，女主候选

## 写作要求
- 纯爽文，快节奏，高密度爽点
- 每章约3000字
- 第三人称有限视角（紧跟主角）
- 对话占比40-50%
- 每1-2章一个小爽点，每5-10章一个大爽点
- 模拟场景用分隔线标记，区分现实与模拟
- 每章必须有爽点，不能连续两章无进展
- 模拟器是核心卖点，不能边缘化
```

- [ ] **Step 3: 提交**

```bash
git add books/<book-id>/story/author_intent.md
git commit -m "feat: set author intent for simulator novel"
```

---

### Task 3: 编写 current_focus.md（当前焦点）

**Files:**
- Modify: `books/<book-id>/story/current_focus.md`

- [ ] **Step 1: 读取当前文件**

读取 `books/<book-id>/story/current_focus.md`，了解模板结构。

- [ ] **Step 2: 写入当前焦点**

将以下内容写入 `books/<book-id>/story/current_focus.md`：

```markdown
# 当前焦点

## 活跃焦点

### 第一卷开篇：校园逆袭

**重点方向**：
1. 第1章直接激活模拟器，快速进入正题
2. 建立主角「低调但有实力」的人设
3. 引入张昊（室友）和苏晴（女主候选）
4. 展示觉醒者学院的等级歧视环境
5. 第一次利用模拟器获取好处（信息差碾压）

**场景设定**：觉醒者学院，灵气复苏三年后的现代都市大学

**节奏要求**：
- 第1章：入学+激活模拟器+第一次模拟
- 第2-3章：利用模拟器获取第一桶金/解决危机
- 第4-5章：引入张昊，展示学院等级制度
- 第6-10章：模拟考试/对战，逐步崭露头角

**必须避免**：
- 冗长的世界观说明（边写边展示）
- 连续两章没有爽点
- 模拟器沦为旁白解说工具（要沉浸式体验）
- 主角突然变强没有铺垫（模拟器提供信息，执行仍需努力）
```

- [ ] **Step 3: 提交**

```bash
git add books/<book-id>/story/current_focus.md
git commit -m "feat: set initial writing focus for simulator novel"
```

---

### Task 4: 生成大纲（plan chapter）

**Files:**
- Create: `books/<book-id>/story/runtime/chapter-XXXX.intent.md` (由 CLI 生成)

- [ ] **Step 1: 运行 plan chapter**

```bash
inkos plan chapter <book-id> --context "第1章：觉醒者学院入学，主角林默被嘲笑F级废物，意外激活未来模拟器，第一次模拟预见到当天下午的一场灵域事故，利用预知救人并获取第一桶金"
```

Expected output: 生成 `story/runtime/chapter-XXXX.intent.md`，包含章节意图、必须保留/必须避免的内容。

- [ ] **Step 2: 审查生成的 intent.md**

读取生成的 `intent.md`，确认：
- 系统机制描述准确（未来模拟器，不是传统升级系统）
- 主角性格符合设定（低调但不服输）
- 世界观细节正确（灵气复苏三年，F-S等级）
- 爽点设计合理（第1章就要有爽点）

如有偏差，手动编辑修正。

- [ ] **Step 3: 提交**

```bash
git add books/<book-id>/story/runtime/
git commit -m "feat: generate chapter outline via plan"
```

---

### Task 5: 编译运行时产物（compose chapter）

**Files:**
- Create: `books/<book-id>/story/runtime/context.json` (由 CLI 生成)
- Create: `books/<book-id>/story/runtime/rule-stack.yaml` (由 CLI 生成)
- Create: `books/<book-id>/story/runtime/trace.json` (由 CLI 生成)

- [ ] **Step 1: 运行 compose chapter**

```bash
inkos compose chapter <book-id>
```

Expected output: 生成 `context.json`（上下文选择）、`rule-stack.yaml`（规则栈）、`trace.json`（追踪信息）。

- [ ] **Step 2: 验证生成结果**

确认 `context.json` 中包含了 `author_intent.md` 和 `current_focus.md` 的相关内容。确认 `rule-stack.yaml` 中包含了正确的风格规则。

- [ ] **Step 3: 提交**

```bash
git add books/<book-id>/story/runtime/
git commit -m "feat: compose runtime artifacts for chapter 1"
```

---

### Task 6: 开始写作前 10 章

**Files:**
- Create: `books/<book-id>/chapters/` (由 CLI 生成)
- Modify: `books/<book-id>/story/state/*.json` (由 CLI 更新)

- [ ] **Step 1: 运行 write next（批量 10 章）**

```bash
inkos write next <book-id> --count 10 --words 3000 --context "前10章节奏：第1章激活模拟器+第一次模拟利用，第2-3章获取第一桶金+建立人设，第4-5章引入张昊展示学院环境，第6-8章模拟考试/对战崭露头角，第9-10章第一次灵域探索"
```

Expected: CLI 逐章执行完整流水线（Planner → Composer → Architect → Writer → Observer → Reflector → Normalizer → ContinuityAuditor → Reviser → StateManager），每章约 2-5 分钟，总计约 20-50 分钟。

- [ ] **Step 2: 监控写作进度**

观察 CLI 输出，确认：
- 每章的 ContinuityAuditor 是否通过（audit pass）
- 章节字数是否在目标范围内（约 3000 字）
- 状态文件是否正确更新

如果有章节 audit-failed，后续可以用 `inkos revise <book-id> <n>` 修复。

- [ ] **Step 3: 审查生成结果**

```bash
inkos review list <book-id>
inkos eval <book-id> --json
```

查看章节列表和质量报告。如有问题章节，用 `inkos revise` 修复。

- [ ] **Step 4: 批准所有章节**

```bash
inkos review approve-all <book-id>
```

- [ ] **Step 5: 提交**

```bash
git add books/<book-id>/
git commit -m "feat: generate first 10 chapters of simulator novel"
```

---

### Task 7: 验证与导出

**Files:**
- Create: `books/<book-id>/export/` (由 CLI 生成)

- [ ] **Step 1: 运行质量评估**

```bash
inkos eval <book-id> --json --chapters 1-10
```

Expected: 输出每章的质量评分，整体通过率应 > 80%。

- [ ] **Step 2: 导出为 EPUB**

```bash
inkos export <book-id> --format epub --approved-only
```

Expected: 在 `books/<book-id>/export/` 目录下生成 `.epub` 文件。

- [ ] **Step 3: 导出为 TXT（备用）**

```bash
inkos export <book-id> --format txt --approved-only
```

- [ ] **Step 4: 最终提交**

```bash
git add books/<book-id>/
git commit -m "feat: complete first 10 chapters and export simulator novel"
```
