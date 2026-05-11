# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

InkOS is a multi-agent novel production system. It orchestrates a 10-agent pipeline to generate, audit, and revise fiction content with long-term consistency via structured state per book.

## Critical Rule

**禁止直接修改 `books/` 目录下的任何文件。** 所有书籍、章节、状态文件的创建和修改必须通过 InkOS CLI 框架管理（`inkos` 命令）。唯一例外：当框架因 bug 无法完成操作时，可在明确告知用户并获得确认后，临时写入运行时产物（如 `story/runtime/*.plan.md`）以绕过故障点，但章节正文和 `story/state/*.json` 仍必须由框架生成。

## Commands

```bash
pnpm install                           # Install dependencies
pnpm build                             # Build all packages
pnpm dev                               # Watch mode for both packages
pnpm test                              # Run all tests (Vitest)
pnpm typecheck                         # Type-check without emitting
pnpm lint                              # Run linting

# Test a single package
pnpm --filter @actalk/inkos-core test
pnpm --filter @actalk/inkos test

# Run specific test pattern
pnpm --filter @actalk/inkos-core test -- hook-governance

# GEPA Python dependencies (for prompt optimization)
pip install gepa
pip install -e packages/gepa          # Install from local monorepo
```

### Common InkOS Commands

```bash
# Project setup
inkos init [name]                      # Initialize project (omit name for current dir)
inkos doctor                           # Diagnose config issues

# Writing pipeline
inkos write next <book-id>                  # Full pipeline: draft → audit → revise (--count N for multiple)
inkos write rewrite <book-id> <n>          # Rewrite chapter N from snapshot (--force skip confirm)
inkos draft <book-id>                       # Draft only (no audit/revise)
inkos revise <book-id> <n>                  # Revise chapter N (default mode: local-fix)
inkos audit <book-id> <n>                   # Audit chapter N only

# Planning (offline — no LLM required)
inkos plan chapter <book-id> --context "..."  # Generate chapter-XXXX.intent.md
inkos compose chapter <book-id>              # Generate context.json + rule-stack.yaml + trace.json

# Review workflow
inkos review list <book-id>                  # List chapters awaiting review
inkos review approve <book-id> <n>           # Approve chapter N and advance state
inkos review approve-all <book-id>           # Batch approve all ready chapters

# GEPA prompt optimization (requires: pip install gepa && pip install -e packages/gepa)
inkos optimize prompts <book-id>              # Run GEPA optimization (50 evals by default)
inkos optimize prompts <book-id> -e 100      # More evaluations for better results
inkos optimize prompts <book-id> --train-chapters 1-10 --val-chapters 11-15
inkos optimize prompts <book-id> --reflection-lm "openai/MiniMax-M2.7"
inkos optimize prompts <book-id> --dry-run   # Evaluate without applying
inkos optimize history <book-id>             # View optimization history
inkos optimize trajectory <book-id>           # View score trajectory across runs

# Book management
inkos book create --title "..." --genre ...  # Create new book (--brief <file> for creation brief)
inkos book list / status <book-id>            # List or check status
inkos book update <book-id>                   # Update book settings
inkos book delete <book-id> [--force]         # Delete book and all data
inkos import chapters <book-id> --from <path> # Import existing chapters for continuation
inkos import canon <book-id> --from <parent>  # Import canon state into fanfic book
inkos export <book-id> [--format md|txt|epub] [--approved-only] # Export book
inkos consolidate <book-id>                   # Rebuild state/*.json from truth files
inkos update                                  # Update book state after editing truth files manually

# Fanfic
inkos fanfic init --from <file> --mode canon|au|ooc|cp  # Create fanfic from source text

# Quality
inkos eval <book-id> [--json] [--chapters 1-20]  # Structured quality report
inkos detect <book-id> [--all] [--stats]          # AIGC detection
inkos analytics <book-id> / inkos stats <book-id> # Book analytics

# Configuration
inkos config set-global --provider ... --model ...  # Global LLM config (saved to ~/.inkos/.env)
inkos config set-model <agent> <model>           # Per-agent model override
inkos config show-models                          # View routing table
inkos doctor                                       # Diagnose config issues

# Style
inkos style analyze <file>           # Extract style fingerprint from reference text
inkos style import <file> <book-id>  # Import style into book

# Studio & Daemon
inkos studio [-p <port>]             # Start InkOS Studio web workbench (default port 4567)
inkos up / inkos down               # Start/stop background write loop (-q silent)

# Agent mode
inkos agent "instruction"            # Natural language agent mode (18 tools, --json for structured output)
```

## Architecture

### Monorepo Structure

```
packages/
  core/    # Models, agents, pipeline runner, state management, LLM providers
  cli/     # Commander.js commands, thin wrappers around core
  studio/  # Web workbench: React + Hono API server (tsx via studio.ts entry)
```

### InkOS Studio

`inkos studio` launches a local web workbench. It resolves the entry point in order:
1. Monorepo TypeScript sources (`packages/studio/src/api/index.ts`) via local tsx loader
2. Monorepo TypeScript sources via `npx tsx`
3. Published npm package `dist/api/index.js`

On Windows, path separators in tests use `\` — mock path assertions must handle both `/` and `\` (e.g., use `path.replace(/\\/g, "/")` normalization or regex like `[\\/]`).

### Core Package Exports (`packages/core/src/index.ts`)

The `@actalk/inkos-core` package exports:
- **Models**: Zod schemas for BookConfig, ChapterMeta, ProjectConfig, runtime state, input governance, length governance
- **Agents**: BaseAgent (abstract), ArchitectAgent, WriterAgent, ContinuityAuditor, ReviserAgent, RadarAgent, PlannerAgent, ComposerAgent, LengthNormalizerAgent, StateValidatorAgent, ChapterAnalyzerAgent
- **Pipeline**: PipelineRunner (orchestrates draft → audit → revise), Scheduler
- **State**: StateManager (file-based persistence with locking), RuntimeStateStore, MemoryDB
- **LLM**: createLLMClient, chatCompletion, chatWithTools (OpenAI/Anthropic/custom providers)
- **Prompt Tuning**: OptimizePrompts class, OptimizationRun/Candidate schemas, HistoryReader, PromptParameterApplier, splitChaptersForOptimization (see `packages/core/src/prompt-tuning/`)

### 10-Agent Pipeline (`packages/core/src/pipeline/runner.ts`)

`PipelineRunner.writeNextChapter()` orchestrates:
1. **Planner** — reads author intent + current focus + memory retrieval, outputs `intent.md` with must-keep/must-avoid
2. **Composer** — selects relevant context from truth files, compiles rule stack and runtime artifacts
3. **Architect** — plans chapter structure: outline, scene beats, pacing
4. **Writer** — generates chapter text (two-phase: creative → settlement)
5. **Observer** — extracts 9 categories of facts from the draft
6. **Reflector** — outputs JSON delta (not full markdown) for immutable apply
7. **Normalizer** — single-pass compression/expansion to bring word count into range
8. **ContinuityAuditor** — audits against truth files (33 dimensions)
9. **Reviser** — auto-fixes critical issues
10. **StateManager** — snapshots for rollback support

The Settler (Reflector) outputs **JSON delta** rather than full markdown. The code layer applies it via `applyRuntimeStateDelta()` with Zod validation before writing. Markdown projections are regenerated from JSON on each read.

### GEPA Evaluation Pipeline

When InkOS is called by the GEPA Python wrapper (via `python -m gepa_wrapper.cli`), it uses `--gepa-eval` mode to emit structured score markers. The flow:

```
GEPA Python (gepa_wrapper/cli.py)
  → spawns InkOS CLI: inkos revise <book> <ch> --gepa-eval --writer-params <json>
  → InkOS runs PipelineRunner.reviseDraft() with writerParamsOverride
  → emits to stdout: <!-- GEPA_SCORES {"audit_pass":true,"aigc_resistance":0.9,...} GEPA_SCORES -->
  → Python captures via regex → val_aggregate_subscores → GEPA result JSON
```

Key GEPA-related types:
- `writerParamsOverride` in `PipelineConfig` — flat `writer_<key>` overrides applied to WriterAgent system prompts
- `GepaEvalScores` — computed by `computeGepaScores()` in pipeline runner; `auditPass = audit.blockingCount === 0`
- `--writer-params <json>` CLI option — raw JSON or `@file:path`, keys like `writer_temperature_creative`
- Results saved to `books/<id>/story/.optimization/history.jsonl` (JSONL, one run per line)

**GEPA val chapter caveat**: Val chapters must have status `approved` or `ready-for-review` to produce meaningful audit scores. Unapproved chapters all fail ContinuityAuditor → `audit_pass_rate=0`. Use `--val-chapters` to manually specify which chapters to use as val set.

### Structured State (per book in `books/<id>/story/`)

**Dual-layer architecture**: JSON files (`state/*.json`) are the authoritative source with Zod validation. Markdown files are human-readable projections regenerated from JSON on each read. Never edit markdown files directly — changes must go through the JSON delta pipeline.

| Path | Purpose |
|------|---------|
| `state/current_state.json` | World state: character positions, relationships, current conflicts, alliances |
| `state/hooks.json` | Unresolved foreshadowing (hook governance via `hook-governance.ts`) |
| `state/chapter_summaries.json` | Event summaries per chapter |
| `state/particle_ledger.json` | Resource/accounting ledger (genre-dependent) |
| `state/subplot_board.json` | Subplot progress tracking |
| `state/emotional_arcs.json` | Per-character emotional arc tracking |
| `state/character_matrix.json` | Character encounter records and information boundaries |
| `state/manifest.json` | State version tracking (last applied chapter) |
| `state/*.md` | Human-readable projections (auto-generated from JSON) |
| `memory.db` | SQLite temporal memory (Node 22+, keyed by relevance not time) |
| `runtime/chapter-XXXX.*` | Per-chapter intent, context, rule-stack, trace artifacts |

### JSON Delta Pipeline (Settler/Reflector)

Step 6 of the pipeline (**Reflector**, also called Settler) outputs tagged markdown sections (`=== UPDATED_STATE ===`, `=== UPDATED_HOOKS ===`, etc.) rather than JSON. These are parsed and validated:

```
Settler output (tagged markdown)
  → parseSettlerDeltaOutput() extracts JSON blobs
  → RuntimeStateDeltaSchema.parse() validates structure
  → applyRuntimeStateDelta() immutably applies changes
  → validateRuntimeState() runs Zod validation
  → bad data → rejection (no rollback, no corruption)
  → good data → write to state/*.json
  → markdown projections regenerated from JSON
```

The `hookGovernanceMode` and `hookOps` fields in the delta control hook admission (`mention` vs `advance` vs `resolve` vs `defer`). New hooks require a `type` and `expectedPayoff` — bare mentions without payoff signals are rejected by `evaluateHookAdmission()`.

### Two-Phase Writer Architecture

WriterAgent operates in two phases:
1. **Creative Phase** (temp 0.7): Generates chapter text
2. **Settlement Phase** (temp 0.3): Updates all truth files via Settler JSON delta (see JSON Delta Pipeline above)

### Chapter Status Workflow

After writing, a chapter has status `ready-for-review` or `audit-failed`:

```
audit-failed → inkos revise <book> <n> --mode rewrite   # full re-generate
audit-failed → inkos revise <book> <n>                  # local-fix / spot-fix (default)
ready-for-review → inkos review approve <book> <n>       # approve and continue
```

Valid revise modes: `local-fix` (default), `spot-fix` (alias for local-fix), `polish`, `rewrite`, `rework`, `anti-detect`.

### Adding a CLI Command

1. Create `packages/cli/src/commands/<name>.ts` exporting a Commander `Command`
2. Register in `packages/cli/src/index.ts`
3. Support `--json` output for structured data
4. Support book-id auto-detection when only one book exists

### Studio API Server

The `packages/studio/src/api/server.ts` exports `createStudioServer(config, root)` which returns a Hono app. The server uses SSE (`streamSSE`) for real-time pipeline events, broadcasting to all connected clients via an in-process subscriber set. All routes are prefixed with `/api/`. The frontend (React SPA) is served as static files from the build output.

### Book ID Resolution

Book IDs are directory names under `books/`. When only one book exists in the project, `<book-id>` can be omitted from most commands. The project root is detected by finding the nearest `inkos.json` upward from the current directory.

### Adding a Genre

Create `packages/core/genres/<id>.md` with YAML frontmatter:
- `chapterTypes`, `fatigueWords`, `numericalSystem`, `powerScaling`
- `pacingRule`, `satisfactionTypes`, `auditDimensions`, `language`
- Body contains genre-specific prohibitions, language rules, narrative guidance

## Code Style

- TypeScript strict mode, 2-space indentation
- Immutable patterns: `{ ...obj, key: value }` over mutation
- Functions < 50 lines, files < 800 lines
- Errors must surface (no silent catches without comment)
- Tests in `__tests__/` directories alongside source

## Testing

- Vitest framework, mock LLM calls (no real API requests)
- Run specific test: `pnpm --filter @actalk/inkos-core test -- <pattern>`
- Run specific package: `pnpm --filter @actalk/inkos-core test`, `pnpm --filter @actalk/inkos-studio test`
- **Windows compatibility**: `path.join` on Windows produces `\` separators. Mock path assertions must normalize with `path.replace(/\\/g, "/")` or use `[\\/]` in regex matchers. Tests using `spawnSync` with `npm`/`tar` may need `skipIf(process.platform === "win32")` in Git Bash environments.
- **CLI integration tests** use `test-project/` as a temporary working directory (initialized per test, cleaned up after)

## Key Patterns

### Agent Implementation

All agents extend `BaseAgent` and receive an `AgentContext` with LLM client, model, project root, and optional book ID. Use `this.chat()` for LLM calls.

### State Locking

Use `StateManager.acquireBookLock()` before any file mutations. It returns a release function — always call it in `finally`.

### Model Routing

`PipelineRunner.resolveOverride(agentName)` checks `modelOverrides` config to route different agents to different LLM providers/models.

### LLM Configuration

Per-project: `inkos.json` at project root (`llm.provider`, `llm.model`).
Global defaults: `~/.inkos/.env` (`INKOS_LLM_MODEL`, `INKOS_LLM_BASE_URL`, `INKOS_LLM_API_KEY`).
GEPA uses `--reflection-lm "openai/MiniMax-M2.7"` which routes via `OPENAI_BASE_URL=https://api.minimaxi.com/v1` to the MiniMax OpenAI-compatible endpoint. Use `openai/MiniMax-M2.7` (or M2.1) as the model name for MiniMax models.

### Hook Governance

Hook admission is guarded by bigram overlap detection (`hook-governance.ts`):
- Same-type hooks are rejected if they share ≥2 English term overlaps or ≥6 Chinese bigram overlaps
- The 6-bigram threshold prevents false positives in large hook pools (e.g., 50+ hooks of the same type sharing common characters like "赵恒", "暗主")

### Input Governance Workflow

The standard writing path is `plan → compose → write`:
```bash
inkos plan chapter <book-id> --context "focus here"
inkos compose chapter <book-id>
inkos write next <book-id>
```
`plan` and `compose` are **offline** (no LLM required) and compile control documents into runtime artifacts. `plan` reads `author_intent.md`, `current_focus.md`, `volume_outline.md`, and `current_state.md` to generate `intent.md`. `compose` selects relevant truth-file context for the chapter.

### Input Governance Modes

`PipelineRunner` supports two input modes configured via `inkos.json`:

| Mode | Behavior |
|------|----------|
| `v2` (default) | `plan → compose → write` — structured governance with conflict detection, hook scheduling, must-keep/must-avoid, and context relevance filtering |
| `legacy` | Direct prompt assembly — raw context concatenation without structured planning |

Set in `inkos.json`:
```json
{ "inputGovernanceMode": "v2" }
```

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore