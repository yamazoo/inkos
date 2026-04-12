# GEPA Wrapper for InkOS

GEPA（遗传-帕累托进化提示优化）封装层，为 InkOS 多智能体小说生产系统提供超参数调优能力。

## 安装

```bash
# 安装 GEPA 核心 + 本封装
pip install gepa
pip install -e packages/gepa

# 或从 GitHub 安装
pip install git+https://github.com/gepa-ai/gepa.git
pip install -e packages/gepa
```

## 使用方法（Python API）

```python
from gepa_wrapper import create_evaluator, InkOSEvaluator

evaluator = create_evaluator(
    project_root="E:/workspace/inkos",
    book_id="my-book",
    train_chapters=[1, 2, 3, 4, 5],
)

# 与 gepa.optimize() 配合使用：
import gepa
result = gepa.optimize(
    seed_candidate={"writer_temperature_creative": 0.7},
    evaluator=evaluator,
    objective="Improve audit pass rate and AIGC resistance",
    config=gepa.GEPAConfig(max_metric_calls=50),
)
```

## CLI

```bash
# 运行 GEPA 优化（50 次评估，推荐用于快速迭代）
npx inkos optimize prompts my-book -e 50

# 指定训练集和验证集章节范围
npx inkos optimize prompts my-book --train-chapters 1-30 --val-chapters 31-36

# 只优化特定目标
npx inkos optimize prompts my-book --objectives audit,aigc

# 先 dry-run 验证，不实际应用结果
npx inkos optimize prompts my-book --dry-run

# 指定 LLM（MiniMax 通过 openai/MiniMax-M2.7 路由）
npx inkos optimize prompts my-book --reflection-lm "openai/MiniMax-M2.7"

# 查看历史和轨迹
npx inkos optimize history my-book --last 5
npx inkos optimize trajectory my-book
```

### CLI 选项详解

| 选项 | 说明 |
|------|------|
| `-e, --evaluations <n>` | GEPA 评估次数，默认 50；越多越精细但越慢 |
| `--train-chapters <range>` | 训练集范围，如 `1-30`；GEPA 在这些章节上驱动进化 |
| `--val-chapters <range>` | 验证集范围，如 `31-36`；候选质量在验证集上评估 |
| `--objectives <list>` | 优化目标，逗号分隔：`audit`（通过率）、`aigc`（抗AI检测）、`wordcount`（字数准确度）、`aitells`（AI特征密度）、`all` |
| `--reflection-lm <model>` | GEPA 反思步骤使用的 LLM（默认 `openai/gpt-4.1-mini`） |
| `--task-lm <model>` | InkOS 任务执行使用的 LLM（默认同 reflection-lm） |
| `--dry-run` | 只评估不应用结果，适合先验证配置是否正确 |
| `--agent <name>` | 只优化指定智能体：`writer` / `auditor` / `settler` / `all` |

### 训练集与验证集

GEPA 优化需要把书的章节划分为两个集合：
- **训练集（train）**：每次 GEPA 迭代在这上面跑 `inkos revise`，收集分数信号，用来驱动进化搜索
- **验证集（val）**：最终候选在这上面评分；取所有 val 章节的平均分作为候选的综合质量

> ⚠️ **验证集章节必须状态为 `approved`**，否则 ContinuityAuditor 会因为是草稿阶段而全部失败（得 0 分），导致所有候选的 val 分数都是 0，无法区分优劣。

不指定时，`--train-chapters` 和 `--val-chapters` 从书的 `inkos.json` 中读取 `optimization.trainChapters` 和 `optimization.valChapters` 配置。

## 参数空间

完整文档位于：
- `src/gepa_wrapper/parameter_space.py`（Python / Pydantic）
- `packages/core/src/prompt-tuning/parameter-space.ts`（TypeScript / Zod）

两者必须保持同步——它们是参数边界和默认值的权威来源。

### Writer（写手）智能体参数

| 参数 | 类型 | 默认值 | 取值范围 | 说明 |
|------|------|--------|----------|------|
| `writer_temperature_creative` | float | 0.7 | [0.5, 0.9] | 创意阶段（草稿生成）LLM 温度 |
| `writer_temperature_settlement` | float | 0.3 | [0.1, 0.4] | 结算阶段（写入后真值更新）LLM 温度 |
| `max_transition_markers_per_3k` | int | 1 | [0, 5] | 每 3000 字允许的 AI 味转折/惊讶标记词上限（仿佛/不禁/竟然 等） |
| `max_hedge_words_per_chapter` | int | 3 | [0, 10] | 每章允许的模糊词上限（似乎/好像/大概） |
| `paragraph_uniformity_cv_threshold` | float | 0.15 | [0.05, 0.35] | 段落长度均匀度变异系数阈值；CV 越高说明段落越规律、越像 AI |
| `disable_analysis_terms` | bool | true | — | 正文禁止出现分析框架术语（当前处境/核心动机/信息边界 等） |
| `length_soft_tolerance_pct` | float | 0.10 | [0.05, 0.25] | 目标字数的软容差百分比（softMin = 目标 × (1 − tol)） |
| `length_hard_tolerance_pct` | float | 0.20 | [0.10, 0.40] | 目标字数的硬容差百分比 |
| `enforce_golden_chapters` | bool | true | — | 前三章启用黄金三章特殊规则 |
| `max_consecutive_dialogue_paragraphs` | int | 4 | [2, 8] | 连续纯对话段落上限；超过后须插入动作描写 |
| `enforce_sensory_details` | bool | true | — | 每个重要场景要求 1–2 处五感细节 |
| `scene_beat_density` | int | 3 | [2, 8] | 每千字场景节拍数（切割/转折/Beat）；数值越高节奏越快 |
| `pacing_force_cuts` | bool | false | — | 以硬切（>>>）替代软过渡；启用快节奏模式 |
| `max_exposition_paragraphs` | int | 2 | [0, 5] | 每章纯交代段落上限（0 = 紧凑，5 = 宽松） |
| `inner_monologue_words_max` | int | 80 | [20, 200] | 单段内心独白最大字数；越小节奏越紧凑 |

### Continuity Auditor（连续性审计）参数

| 参数 | 类型 | 默认值 | 取值范围 | 说明 |
|------|------|--------|----------|------|
| `ooc_strictness` | float | 0.7 | [0.0, 1.0] | OOC（角色一致性）问题权重（0 = 忽略，1 = 致命） |
| `pacing_weight` | float | 0.6 | [0.0, 1.0] | 节奏问题权重 |
| `info_boundary_weight` | float | 0.7 | [0.0, 1.0] | 信息越界违规权重 |
| `power_scaling_weight` | float | 0.6 | [0.0, 1.0] | 战力崩坏问题权重 |
| `fatigue_scan_depth` | enum | medium | surface / medium / deep | 词汇疲劳扫描深度 |
| `critical_threshold` | int | 0 | [0, 5] | 致命级问题上限；超出会判定为 FAIL |
| `warning_threshold` | int | 5 | [0, 20] | 警告级问题上限；超出会判定为 FAIL |

### Settler（结算者）智能体参数

| 参数 | 类型 | 默认值 | 取值范围 | 说明 |
|------|------|--------|----------|------|
| `settler_temperature` | float | 0.2 | [0.1, 0.5] | Settler 阶段 LLM 温度 |
| `over_extract_bias` | float | 0.7 | [0.0, 1.0] | 过度抽取倾向（1.0 = 能抽就抽，0.0 = 只抽确定事实） |
| `enforce_ledger_verification` | bool | true | — | 账本数值验证（期初 + 增量 = 期末） |

### 节奏参数的作用机制

GEPA 进化出的节奏参数通过以下链路注入到 Writer 系统提示中：

`applyWriterParams()` → `defaults.ts` → `writer-prompts.ts`

- **scene_beat_density ↑** → 每千字节拍更多 → 节奏加快
- **pacing_force_cuts = true** → 软过渡词全部禁用，以 `>>>` 硬切替代 → 最快节奏
- **max_exposition_paragraphs ↓** → 交代段落压缩或删除 → 更紧凑
- **inner_monologue_words_max ↓** → 内心独白拆散为反应 + 动作 → 更紧凑

快节奏爽文系题材典型收敛值：`scene_beat_density=5–6`、`pacing_force_cuts=true`、`max_exposition_paragraphs=0–1`、`inner_monologue_words_max=40–60`。
慢节奏文艺向题材建议保持默认值。
