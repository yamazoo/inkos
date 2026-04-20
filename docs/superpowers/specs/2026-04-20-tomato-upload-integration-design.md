# 番茄上传完整集成设计

**日期**: 2026-04-20
**状态**: 已批准
**负责人**: Claude
**相关项目**: fanqie-novel-auto-uploader (nianhua666)

## 背景

InkOS 已有基础的番茄小说上传能力（`TomatoPlatformAdapter`），但实现粗糙：选择器硬编码、流程不完整、缺少防风控策略。fanqie-novel-auto-uploader 是功能完整的 Python 桌面应用，其核心能力（选择器自动校准、多步上传流程、日配额管理、防风控节流）值得移植到 InkOS。

## 目标

将 fanqie-novel-auto-uploader 的核心功能以 TypeScript 形式集成进 InkOS，作为 `inkos upload` 命令的底层实现，上传 InkOS 已生成的章节文件（`books/<id>/chapters/`）到番茄作家助手。

## 不在范围内

- PyQt GUI 界面（InkOS 是 CLI）
- Python 依赖或 subprocess 调用 Python
- 非番茄平台（飞卢、起点等）
- 外部 TXT 文件导入（仅处理 InkOS 已有的章节文件）

---

## 设计

### 1. 增强 `browser.ts` — 支持 Edge 浏览器

**文件**: `packages/core/src/upload/browser.ts`

**改动**: 将 Chromium-only 改为 Edge-first 多策略启动。

```typescript
// 启动顺序
1. Edge channel ("msedge") + Edge 用户目录
2. Edge 可执行文件路径（探测 Program Files）
3. Chromium fallback
```

- 复用 `BrowserSession` 接口，新增 `launchEdge()` 内部方法
- Edge persistent context 用于登录态隔离（与 fanqie-uploader 一致）
- Edge profile 目录：`~/.inkos/cookies/tomato/{username}/`

### 2. 新建 `selector-calibrator.ts` — 选择器自动校准

**文件**: `packages/core/src/upload/selector-calibrator.ts`

**核心逻辑**:

```
1. 打开 headed 浏览器，用户手动登录并进入章节发布编辑页
2. JS 注入 → 捕获页面快照：
   - 所有 input/textarea/contenteditable（含 placeholder、aria-label、class、rect_top、css_path）
   - 所有 button（含 text、aria-label、class、rect_top、css_path）
3. deriveSelectorBundle() 算法：
   - 按控件类型分组（章节号、标题、正文、发布按钮等）
   - 对每类控件：用关键词匹配 + 位置评分（rect_top < 280 得最高分）排序
   - 取 top N 生成 || 链式选择器
4. 输出到 ~/.inkos/cookies/tomato/selector_template.json
```

**评分维度**（每类控件权重不同）：

| 控件类型 | 评分依据 |
|---------|---------|
| 标题输入框 | placeholder 含"标题/章节"、input 标签、正文附近位置 |
| 章节号输入框 | placeholder 含"章"、input type="number" |
| 正文区域 | textarea 或 contenteditable、大内容区域 |
| 发布按钮 | text 含"发布/提交"、button 标签 |
| 确认按钮 | text 含"确认/确定/继续发布" |
| 定时发布 | schedule_toggle、schedule_date、schedule_time 选择器 |

**输出文件** (`selector_template.json`):

```json
{
  "generated_at": "2026-04-20T10:00:00",
  "publish_url": "https://...",
  "selectors": {
    "chapter_no_selectors": "...",
    "title_selectors": "...",
    "content_selectors": "...",
    "publish_button_selectors": "...",
    "confirm_button_selectors": "...",
    "next_step_button_selectors": "...",
    "risk_confirm_selectors": "...",
    "publish_setting_confirm_selectors": "...",
    "ai_no_selectors": "...",
    "schedule_toggle_selectors": "...",
    "schedule_date_selectors": "...",
    "schedule_time_selectors": "...",
    "create_chapter_selectors": "...",
    "success_text_keywords": "发布成功||保存成功||提交成功",
    "error_text_keywords": "发布失败||请求过于频繁||超过当日上限"
  }
}
```

### 3. 重写 `TomatoPlatformAdapter` — 完整多步上传流程

**文件**: `packages/core/src/upload/platforms/tomato.ts`

**上传流程**:

```
1. navigateToChapterEditor() → 打开编辑页
2. _waitForEditorReady() → 等待表单控件加载
3. _setFieldValue() → 填章节序号（从标题推导，如"第001章"→001）
4. _setFieldValue() → 填章节标题
5. _setFieldValue() → 填正文（click×3 → fill，避免追加）
6. _clickNextStep() → 点"下一步"或"继续"
7. _handleContinuePrompt() → 处理"继续发布/去提交"弹窗
8. _handleRiskConfirm() → 处理风险检测弹窗
9. _handleAiPrompt() → 处理AI辅助提示，点"否"
10. _handlePublishSetting() →
    - 若日配额充足：点"发布"
    - 若日配额不足：切换定时发布开关 → 选次日日期时间 → 确认
11. _waitForPublishFeedback() → 等待"发布成功"文本
12. 成功 → 返回；失败 → 重试（maxRetries 次）
```

**防风控策略**:

| 策略 | 参数 | 说明 |
|------|------|------|
| 随机延时 | min_delay=15s, max_delay=35s | 每章发布后随机等 15~35s |
| 动作间隔 | action_delay=0.9s | 点击/填写之间等待 0.9s |
| 有限重试 | max_retries=2 | 失败最多重试 2 次 |
| 单线程顺序 | — | 不并发，所有请求串行 |

**日配额管理**:

- `remaining_daily_chars`: 默认 50,000 字/天
- 跟踪每日已用字数，超额自动切定时发布
- 定时发布槽位：`schedule_interval=5` 分钟一粒
- 定时到次日最早可用时间

**选择器链 fallback**:

每个控件按优先级尝试多个选择器：

```typescript
const titleSelectors = [
  calibratedSelector,          // 校准结果（优先）
  "input[placeholder*='章节']", // 默认 fallback
  "textarea[placeholder*='标题']",
];
```

### 4. 扩展 `UploadState` — 新增日配额和校准数据

**文件**: `packages/core/src/models/upload.ts`

```typescript
// UploadState 新增字段
{
  platform: "tomato",
  lastUploadAt: string,
  lastUploadChapter: number,
  maxChaptersPerHour: number,
  chapters: Record<string, UploadChapterResult>,
  // 新增
  dailyRemainingChars: Record<string, number>,   // {"2026-04-20": 32000}
  dailyScheduleSlots: Record<string, number>,   // {"2026-04-21": 3}
  calibratedSelectors?: SelectorBundle,           // 校准后的选择器（可选）
  edgeProfileDir?: string,                        // Edge profile 目录路径
}
```

### 5. 增强 CLI `upload.ts` — 新增 calibrate 子命令

**文件**: `packages/cli/src/commands/upload.ts`

```bash
# 校准选择器（首次使用需运行）
inkos upload calibrate <book-id>

# 登录（已有）
inkos upload login <book-id>

# 查看状态（已有）
inkos upload status <book-id> [--json]

# 上传（行为已增强）
inkos upload <book-id> [options]
```

**`inkos upload calibrate` 流程**:

```
1. 打开 headed Edge 浏览器
2. 用户手动登录番茄作家助手并进入章节发布编辑页
3. 等待编辑器控件加载（最多 180s）
4. 捕获页面快照
5. deriveSelectorBundle() 生成选择器链
6. 保存到 ~/.inkos/cookies/tomato/selector_template.json
7. 打印结果，关闭浏览器
```

---

## 文件变更汇总

| 文件 | 改动类型 |
|------|---------|
| `packages/core/src/upload/browser.ts` | 增强：Edge 多策略启动 |
| `packages/core/src/upload/selector-calibrator.ts` | 新建：选择器校准模块 |
| `packages/core/src/upload/platforms/tomato.ts` | 重写：完整多步上传 |
| `packages/core/src/models/upload.ts` | 扩展：UploadState 新增字段 |
| `packages/cli/src/commands/upload.ts` | 增强：新增 calibrate 子命令 |
| `packages/core/src/upload/state.ts` | 扩展：UploadStateManager 支持新字段 |
| `packages/core/src/index.ts` | 扩展：导出 selector-calibrator |

---

## 测试策略

- 单元测试：`selector-calibrator.ts` 的评分算法和选择器链生成逻辑
- 集成测试：mock Playwright，测试 `TomatoPlatformAdapter` 各步骤的调用顺序
- 手动测试：首次校准后执行真实上传，验证流程完整性

---

## 风险与注意事项

1. **页面改版**: 番茄小说页面可能随时更新， selector_calibrator 提供自助校准能力
2. **登录态失效**: Edge profile 目录的 cookies 可能过期，需要定期重新登录
3. **日配额 API**: 日配额数据依赖页面文本识别，未必精准，建议用户自行监控
4. **Edge on non-Windows**: 本功能优先 Windows/macOS，Linux 用户 fallback 到 Chromium
