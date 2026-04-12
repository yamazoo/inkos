"""GEPA Wrapper Python CLI entry point for InkOS.

Usage:
    python -m gepa_wrapper.cli --config <config.json>

The config JSON is written by the TypeScript optimizer orchestrator.
This script reads it and runs GEPA optimization using optimize_anything.
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
from pathlib import Path
from typing import Any

# Load .env so INKOS_LLM_* vars are available to _setup_llm_env()
from dotenv import load_dotenv

# Resolve .env relative to this file's location:
#   cli.py → gepa_wrapper/ → src/ → gepa/ → packages/ → project_root/
# .env lives at project_root/.env
_env_path = Path(__file__).resolve().parents[4] / ".env"
if _env_path.exists():
    load_dotenv(_env_path)

try:
    import gepa.optimize_anything as oa
    from gepa.optimize_anything import GEPAConfig, EngineConfig, ReflectionConfig
except ImportError:
    oa = None
    GEPAConfig = None
    EngineConfig = None
    ReflectionConfig = None

from gepa_wrapper.parameter_space import PARAM_BOUNDS
from gepa_wrapper.inkos_runner import InkOSRunner
from gepa_wrapper.evaluator import MultiObjectiveScorer
from gepa.optimize_anything import _STR_CANDIDATE_KEY  # "current_candidate"

DEFAULT_OBJECTIVE = """
You are optimizing InkOS novel writing agent parameters.
Given evaluation scores for a candidate parameter set, diagnose WHY it underperformed
and propose targeted improvements to the parameter values.

Key dimensions:
- audit_pass_rate: Does the writing maintain character consistency and plot continuity?
- aigc_resistance: Does the text sound human-written (natural dialogue, varied sentence structure)?
- wordcount_accuracy: Is the chapter length within the governance target?
- ai_tell_density: Are there markers of AI writing (analysis terms, hedge words, uniform paragraphs)?

IMPORTANT: Your output should be a JSON dict with parameter names as keys and new values.
Only change parameters that were identified as problematic.
"""


def setup_logging(verbose: bool = False) -> None:
    level = logging.DEBUG if verbose else logging.INFO
    # Use stderr for all logging to avoid contaminating stdout (which is read as JSON)
    handler = logging.StreamHandler(sys.stderr)
    handler.setFormatter(
        logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s", datefmt="%H:%M:%S")
    )
    # Configure root logger
    root = logging.getLogger()
    root.setLevel(level)
    root.handlers.clear()
    root.addHandler(handler)
    # Silence overly verbose third-party loggers
    for noisy in ["httpx", "httpcore", "openai", "litellm", "gepa"]:
        logging.getLogger(noisy).setLevel(logging.WARNING)


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        description="GEPA prompt optimization runner for InkOS",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    p.add_argument(
        "--config",
        type=str,
        required=True,
        help="Path to JSON config written by TypeScript optimizer",
    )
    p.add_argument(
        "--output",
        type=str,
        default=None,
        help="Path to write results JSON (default: stdout)",
    )
    p.add_argument(
        "--max-evals",
        type=int,
        default=50,
        help="Max GEPA evaluations (default: 50)",
    )
    p.add_argument(
        "--reflection-lm",
        type=str,
        default="openai/gpt-4.1-mini",
        help="LLM for GEPA reflection step",
    )
    p.add_argument(
        "--task-lm",
        type=str,
        default=None,
        help="LLM for InkOS task execution (defaults to reflection-lm)",
    )
    p.add_argument(
        "--verbose", "-v", action="store_true", help="Enable debug logging"
    )
    return p


# ---------------------------------------------------------------------------
# String <-> numeric conversion
# ---------------------------------------------------------------------------


def params_to_string(params: dict[str, float | bool]) -> str:
    """Serialize numeric params to a string representation for GEPA.

    Format: "writer__temperature_creative=0.7000\\n..."
    The double-underscore (__) separates the agent prefix from the param name,
    allowing seedToParams in TypeScript to unambiguously split on "__".
    IMPORTANT: Use fixed 4-decimal format for floats so TypeScript's JSON parse
    produces the same float values (e.g. 0.2 not 0.2000), ensuring exact key
    match when the seed string is stored in _EVALUATOR_SCORES.
    """
    parts = []
    for k, v in sorted(params.items()):
        if isinstance(v, bool):
            parts.append(f"{k}={int(v)}")
        elif isinstance(v, float):
            parts.append(f"{k}={v:.4f}")
        else:
            parts.append(f"{k}={v}")
    return "\n".join(parts)


def string_to_params(text: str) -> dict[str, float | bool]:
    """Parse string representation back to numeric params.

    Handles both:
    - Double-underscore prefixed: "writer__temperature_creative=0.7\n..."
      (preferred format from TypeScript optimizer)
    - GEPA-reflected candidates that may have extra text/metadata after values
    - GEPA LLM reflection format: "key: value,\n..." (colon + comma, no equals)
    """
    params: dict[str, float | bool] = {}

    # Normalize: replace \r\n with \n, strip
    text = text.strip().replace("\r", "")

    import re

    # Match key=value  (TypeScript / seed format)
    pattern_eq = re.compile(
        r"^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+?)\s*$",
        re.MULTILINE,
    )
    # Match key: value,  or  key: value  (GEPA LLM reflection format)
    pattern_colon = re.compile(
        r"^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(.+?)\s*[,]?\s*$",
        re.MULTILINE,
    )

    patterns = [pattern_eq, pattern_colon]

    def parse_match(m: re.Match) -> bool:
        key = m.group(1).strip()
        raw_val = m.group(2).strip().rstrip(",")
        val = raw_val

        if val in ("True", "true", "1"):
            params[key] = True
        elif val in ("False", "false", "0"):
            params[key] = False
        elif "." in val:
            try:
                params[key] = float(val)
            except ValueError:
                try:
                    params[key] = float(val.split()[0])
                except ValueError:
                    pass
        else:
            try:
                params[key] = float(val)
            except ValueError:
                pass
        return True

    found = False
    for pat in patterns:
        ms = list(pat.finditer(text))
        if ms:
            for m in ms:
                parse_match(m)
            found = True
            break  # use first matching pattern only

    return params


# ---------------------------------------------------------------------------
# Evaluator factory
# ---------------------------------------------------------------------------

# Side-channel dict: candidate_str -> per-objective scores (populated by evaluate())
_EVALUATOR_SCORES: dict[str, dict[str, float]] = {}


def create_oa_evaluator(
    project_root: Path,
    book_id: str,
    train_chapters: list[int],
    objectives: dict[str, float],
) -> callable:
    """Create a GEPA optimize_anything compatible evaluator callable."""

    scorer = MultiObjectiveScorer(
        audit_weight=objectives.get("audit_pass_rate", 0.35),
        aigc_weight=objectives.get("aigc_resistance", 0.30),
        wordcount_weight=objectives.get("wordcount_accuracy", 0.20),
        aitell_weight=objectives.get("ai_tell_density", 0.15),
    )

    runner = InkOSRunner(
        project_root=str(project_root),
        book_id=book_id,
    )

    def evaluate(
        candidate: str,
        example: object | None = None,
        opt_state: object | None = None,
    ) -> tuple[float, dict[str, Any]]:
        """GEPA evaluate callback: runs InkOS with candidate params, returns composite score.

        In multi-instance mode (dataset=list of chapters), GEPA calls this once per chapter
        with example=<chapter-number>. When example is provided, run only that chapter.
        When example is None (single-instance mode), run all train_chapters.
        """
        try:
            params = string_to_params(candidate)
        except Exception as e:
            oa.log(f"PARSE ERROR: {e} for candidate: {candidate[:200]}")
            return 0.0, {}

        candidate_id = params.get("_candidate_id", "unknown")
        numeric_params = {k: float(v) for k, v in params.items() if k != "_candidate_id"}

        # Determine which chapters to run
        chapters_to_run = [example] if example is not None else train_chapters
        if not chapters_to_run:
            chapters_to_run = train_chapters

        # DEBUG: log what params will actually be sent to inkos
        import logging as _log
        _debug = _log.getLogger("gepa_wrapper.inkos_runner")
        _debug.debug(
            f"  [cli.evaluate] Running chapters={chapters_to_run} "
            f"with params={numeric_params}"
        )

        try:
            chapter_results = runner.evaluate_chapters(
                chapters=chapters_to_run,
                params={"candidate_id": candidate_id, "params": numeric_params},
            )
        except Exception as e:
            oa.log(f"PIPELINE ERROR: {e}")
            return 0.0, {}

        # Score each chapter
        chapter_scores = []
        for result in chapter_results:
            parsed = {
                "audit_pass": result.get("audit_pass", False),
                "audit_score": result.get("audit_score", 0.0),
                "aigc_resistance": result.get("aigc_resistance", 0.0),
                "wordcount_deviation_pct": result.get("wordcount_deviation_pct", 0.0),
                "ai_tell_density": result.get("ai_tell_density", 0.5),
            }
            _debug.debug(
                f"  [cli.evaluate] Raw result for chapter {result.get('chapter','?')}: "
                f"exit={result.get('exit_code')}, "
                f"audit_pass={parsed['audit_pass']}, "
                f"aigc={parsed['aigc_resistance']}, "
                f"wc_dev={parsed['wordcount_deviation_pct']}, "
                f"ai_tell={parsed['ai_tell_density']}, "
                f"stdout_tail={str(result.get('stdout_tail',''))[-100]!r}"
            )
            scored = scorer.score_chapter(parsed)
            chapter_scores.append(scored)

            # Log per-chapter scores for GEPA reflection
            oa.log(
                f"  Chapter {result.get('chapter', '?')}: "
                f"audit={scored['audit_pass_rate']:.2f} "
                f"aigc={scored['aigc_resistance']:.2f} "
                f"wc={scored['wordcount_accuracy']:.2f} "
                f"aitell={scored['ai_tell_density']:.2f}"
            )

        agg = scorer.aggregate(chapter_scores)
        composite = agg["composite"]

        oa.log(
            f"  COMPOSITE={composite:.4f} "
            f"(audit={agg['audit_pass_rate']:.2f}, "
            f"aigc={agg['aigc_resistance']:.2f}, "
            f"wc={agg['wordcount_accuracy']:.2f}, "
            f"aitell={agg['ai_tell_density']:.2f})"
        )

        # Store per-objective scores in side-channel for result extraction (flat format)
        _EVALUATOR_SCORES[candidate] = {
            "audit_pass_rate": agg["audit_pass_rate"],
            "aigc_resistance": agg["aigc_resistance"],
            "wordcount_accuracy": agg["wordcount_accuracy"],
            "ai_tell_density": agg["ai_tell_density"],
            "composite": composite,
        }

        # Return (score, side_info) — GEPA EvaluatorWrapper._wrapped unpacks as 2-tuple
        return composite, {
            "scores": {
                "audit_pass_rate": agg["audit_pass_rate"],
                "aigc_resistance": agg["aigc_resistance"],
                "wordcount_accuracy": agg["wordcount_accuracy"],
                "ai_tell_density": agg["ai_tell_density"],
                "composite": composite,
            }
        }

    return evaluate


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


# ---------------------------------------------------------------------------
# Random search fallback (no LLM required)
# ---------------------------------------------------------------------------

import random


def run_random_search(
    seed_dict: dict[str, float],
    evaluate_fn: callable,
    bounds: dict[str, tuple[float, float]],
    max_evals: int,
) -> tuple[list[dict], dict]:
    """Simple random perturbation search (no LLM needed).

    Returns (pareto_front, best_candidate).
    """
    candidates = []

    # Evaluate seed first
    seed_str = params_to_string(seed_dict)
    seed_score = evaluate_fn(seed_str)
    seed_result = {"params": dict(seed_dict), "score": seed_score, "params_str": seed_str}
    candidates.append(seed_result)
    logging.info(f"[RandomSearch] Seed score: {seed_score:.4f}")

    best = seed_result
    for i in range(1, max_evals):
        # Mutate: perturb each param within bounds
        perturbed = {}
        BOOLEAN_KEYS = {
            "writer__disable_analysis_terms",
            "writer__enforce_golden_chapters",
            "writer__enforce_sensory_details",
            "writer__enforce_ledger_verification",
        }
        for key, val in seed_dict.items():
            if key in BOOLEAN_KEYS:
                # Boolean params: flip randomly with 10% probability
                perturbed[key] = not val if random.random() > 0.1 else val
            else:
                lo, hi = bounds.get(key, (0.0, 1.0))
                # Gaussian perturbation centered on current best value
                std = (hi - lo) * 0.1
                new_val = max(lo, min(hi, val + random.gauss(0, std)))
                perturbed[key] = new_val

        cand_str = params_to_string(perturbed)
        score = evaluate_fn(cand_str)
        result = {"params": perturbed, "score": score, "params_str": cand_str}
        candidates.append(result)

        if score > best["score"]:
            best = result
            logging.info(f"[RandomSearch] Eval {i}: NEW BEST = {score:.4f}")
        else:
            logging.info(f"[RandomSearch] Eval {i}: score={score:.4f} (best={best['score']:.4f})")

    # Pareto front: top candidates by score (simple non-dominated sort for single objective)
    sorted_candidates = sorted(candidates, key=lambda x: x["score"], reverse=True)
    pareto = sorted_candidates[: min(5, len(sorted_candidates))]

    return pareto, best


def _setup_llm_env() -> None:
    """Map InkOS .env vars to what GEPA's LLM clients (LiteLLM) expect.

    LiteLLM uses OPENAI_API_KEY for openai/* models and ANTHROPIC_API_KEY
    for anthropic/* models. InkOS uses INKOS_LLM_API_KEY / INKOS_LLM_BASE_URL.

    MiniMax custom proxy (api.minimaxi.com):
    - Set OPENAI_API_KEY and OPENAI_BASE_URL = https://api.minimaxi.com/v1
    - Use model name "openai/MiniMax-M2.1" (LiteLLM routes openai/* to OPENAI_BASE_URL)
    """
    import os
    if os.environ.get("INKOS_LLM_API_KEY"):
        if not os.environ.get("OPENAI_API_KEY"):
            os.environ["OPENAI_API_KEY"] = os.environ["INKOS_LLM_API_KEY"]
        if not os.environ.get("ANTHROPIC_API_KEY"):
            os.environ["ANTHROPIC_API_KEY"] = os.environ["INKOS_LLM_API_KEY"]
    if os.environ.get("INKOS_LLM_BASE_URL"):
        base = os.environ["INKOS_LLM_BASE_URL"].rstrip("/")
        # MiniMax Anthropic proxy: https://api.minimaxi.com/anthropic → OpenAI compat: https://api.minimaxi.com/v1
        if "/anthropic" in base:
            openai_base = base.replace("/anthropic", "/v1")
        else:
            openai_base = base + "/v1" if not base.endswith("/v1") else base
        if not os.environ.get("OPENAI_BASE_URL"):
            os.environ["OPENAI_BASE_URL"] = openai_base
        if not os.environ.get("ANTHROPIC_BASE_URL"):
            os.environ["ANTHROPIC_BASE_URL"] = base


def check_llm_available() -> bool:
    """Check if LLM API is accessible for GEPA reflection.

    Supports:
    - OPENAI_API_KEY / ANTHROPIC_API_KEY (standard)
    - INKOS_LLM_API_KEY (InkOS .env convention)
    - INKOS_LLM_BASE_URL for custom proxy endpoints
    """
    _setup_llm_env()
    import os
    # Standard keys
    if os.environ.get("OPENAI_API_KEY") or os.environ.get("ANTHROPIC_API_KEY"):
        return True
    return False


def run_gepa(config: dict[str, Any], args: argparse.Namespace) -> dict[str, Any]:
    """Run GEPA optimize_anything for InkOS, with random-search fallback."""
    if oa is None:
        raise RuntimeError(
            "gepa not installed. Run: pip install gepa\n"
            "Or install in dev mode: pip install -e packages/gepa"
        )

    project_root = Path(config["project_root"])
    book_id = config["book_id"]
    agent = config.get("agent", "all")
    train_chapters = config["train_chapters"]
    val_chapters = config.get("val_chapters", [])
    objectives = config.get("objectives", {})
    seed_candidate_dict = config.get("seed_candidate", {})

    logging.info(
        f"Starting optimization: book={book_id} agent={agent} "
        f"train_chapters={train_chapters} max_evals={args.max_evals}"
    )

    # Build evaluator
    evaluator = create_oa_evaluator(
        project_root=project_root,
        book_id=book_id,
        train_chapters=train_chapters,
        objectives=objectives,
    )

    # Check if LLM is available for GEPA reflection
    if check_llm_available() and args.reflection_lm:
        # Use GEPA with LLM-based reflection
        return run_gepa_with_llm(
            config, args, seed_candidate_dict, evaluator
        )
    else:
        # Fallback: random perturbation search (no LLM needed)
        logging.warning(
            "No LLM API key found (checked OPENAI_API_KEY, ANTHROPIC_API_KEY, INKOS_LLM_API_KEY). "
            "Falling back to random perturbation search (no LLM-based reflection)."
        )
        return run_random_search_fallback(
            config, args, seed_candidate_dict, evaluator
        )


def run_gepa_with_llm(
    config: dict[str, Any],
    args: argparse.Namespace,
    seed_candidate_dict: dict[str, float],
    evaluator: callable,
) -> dict[str, Any]:
    """Run GEPA with LLM-based reflection (requires API key)."""
    _setup_llm_env()

    project_root = Path(config["project_root"])
    book_id = config["book_id"]
    agent = config.get("agent", "all")
    train_chapters = config["train_chapters"]
    val_chapters = config.get("val_chapters", [])
    objectives = config.get("objectives", {})
    max_evals = args.max_evals

    seed_str = params_to_string(seed_candidate_dict)
    logging.info(f"Seed candidate:\n{seed_str}")

    gepa_config = GEPAConfig(
        engine=EngineConfig(
            max_metric_calls=max_evals,
            candidate_selection_strategy="pareto",
            frontier_type="hybrid",
        ),
        reflection=ReflectionConfig(
            reflection_lm=args.reflection_lm,
        ),
    )

    # Cap valset to at most 5 chapters so the seed evaluation doesn't consume
    # the entire max_metric_calls budget, leaving room for exploration.
    MAX_VALSET_SIZE = 5
    valset_for_gepa = train_chapters[:MAX_VALSET_SIZE] if len(train_chapters) > MAX_VALSET_SIZE else train_chapters

    result = oa.optimize_anything(
        seed_candidate=seed_str,
        evaluator=evaluator,
        objective=DEFAULT_OBJECTIVE,
        dataset=train_chapters,       # Evaluate all train chapters per candidate (side-channel)
        valset=valset_for_gepa,      # Aggregate valscore from a small subset → leaves budget for exploration
        config=gepa_config,
    )

    # Parse result using GEPA GEPAResult fields directly
    raw_candidates: list[dict[str, str]] = getattr(result, "candidates", []) or []
    val_scores: list[float] = getattr(result, "val_aggregate_scores", []) or []
    val_subscores: list[dict[str, float]] | None = getattr(result, "val_aggregate_subscores", None)

    pareto_front = []
    best_candidate = None
    best_score = -1

    for i, cand in enumerate(raw_candidates):
        cand_str = cand.get(_STR_CANDIDATE_KEY, "") if isinstance(cand, dict) else str(cand)
        score = val_scores[i] if i < len(val_scores) else 0.0
        params = string_to_params(cand_str)

        # Prefer val_aggregate_subscores (from our evaluate() returning (score, {"scores": subscores}))
        subscores: dict[str, float] = {}
        if val_subscores and i < len(val_subscores) and val_subscores[i]:
            raw_sub = val_subscores[i]
            # GEPA stores objective_scores directly as flat dict, or wrapped under "scores"
            subscores = raw_sub.get("scores", raw_sub) if isinstance(raw_sub, dict) else {}
        elif cand_str in _EVALUATOR_SCORES:
            subscores = _EVALUATOR_SCORES[cand_str]

        scores_dict = {
            "audit_pass_rate": subscores.get("audit_pass_rate", 0.0),
            "aigc_resistance": subscores.get("aigc_resistance", 0.0),
            "wordcount_accuracy": subscores.get("wordcount_accuracy", 0.0),
            "ai_tell_density": subscores.get("ai_tell_density", 0.5),
            "composite": subscores.get("composite", score),
        }

        if score > best_score:
            best_score = score
            best_candidate = {"params": params, "score": score, "scores": scores_dict}
        pareto_front.append({"params": params, "score": score, "scores": scores_dict})

    return {
        "status": "success",
        "mode": "gepa-llm",
        "book_id": book_id,
        "agent": agent,
        "train_chapters": train_chapters,
        "val_chapters": val_chapters,
        "max_evals": max_evals,
        "candidates": pareto_front,
        "best_candidate": best_candidate or {"params": seed_candidate_dict, "score": 0.0},
    }


def _normalize_seed_keys(seed_dict: dict[str, float]) -> dict[str, float]:
    """Normalize seed candidate keys to double-underscore prefix convention.

    Converts legacy single-underscore keys (writer_temperature_creative) and
    TypeScript double-underscore keys (writer__temperature_creative) to the
    consistent writer__ format used throughout the optimization pipeline.
    """
    normalized = {}
    for k, v in seed_dict.items():
        if "__" in k:
            # Double-underscore format: writer__temperature_creative
            # Strip prefix: "writer__temperature_creative" → "writer_temperature_creative"
            prefix, rest = k.split("__", 1)
            normalized[f"{prefix}__{rest}"] = v
        elif k.startswith("writer_") and not k.startswith("writer__"):
            # Legacy single-underscore: writer_temperature_creative → writer__temperature_creative
            normalized[f"writer__{k[len('writer_'):]}"] = v
        elif k.startswith("continuity_") and not k.startswith("continuity__"):
            normalized[f"continuity__{k[len('continuity_'):]}"] = v
        elif k.startswith("settler_") and not k.startswith("settler__"):
            normalized[f"settler__{k[len('settler_'):]}"] = v
        else:
            normalized[k] = v
    return normalized


def run_random_search_fallback(
    config: dict[str, Any],
    args: argparse.Namespace,
    seed_candidate_dict: dict[str, float],
    evaluator: callable,
) -> dict[str, Any]:
    """Run random perturbation search (no LLM needed)."""
    # Normalize seed keys to writer__ prefix convention
    seed_candidate_dict = _normalize_seed_keys(seed_candidate_dict)

    project_root = Path(config["project_root"])
    book_id = config["book_id"]
    agent = config.get("agent", "all")
    train_chapters = config["train_chapters"]
    val_chapters = config.get("val_chapters", [])
    max_evals = args.max_evals

    # Use PARAM_BOUNDS for perturbation ranges (param names without writer__ prefix)
    from gepa_wrapper.parameter_space import PARAM_BOUNDS

    # Filter to only params that are in our seed, stripping the writer__ prefix for lookup
    bounds = {}
    for k in seed_candidate_dict:
        # k is like "writer__temperature_creative", PARAM_BOUNDS key is "temperature_creative"
        param_name = k.split("__", 1)[1] if "__" in k else k
        bounds[k] = PARAM_BOUNDS.get(param_name, (0.0, 1.0))

    def evaluate_wrapper(candidate_str: str) -> float:
        """Wrapper that logs using oa.log if available."""
        try:
            params = string_to_params(candidate_str)
        except Exception as e:
            logging.warning(f"Parse error: {e}")
            return 0.0
        # Strip writer__/continuity__/settler__ prefix for inkos CLI (expects bare param names)
        numeric_params = {}
        for k, v in params.items():
            if "__" in k:
                # "writer__temperature_creative" → "temperature_creative"
                _, bare = k.split("__", 1)
                numeric_params[bare] = float(v)
            else:
                numeric_params[k] = float(v)

        runner = InkOSRunner(
            project_root=str(project_root),
            book_id=book_id,
        )

        try:
            chapter_results = runner.evaluate_chapters(
                chapters=train_chapters,
                params={"candidate_id": "random", "params": numeric_params},
            )
        except Exception as e:
            logging.warning(f"Pipeline error: {e}")
            return 0.0

        # Score
        scorer = MultiObjectiveScorer()
        chapter_scores = []
        for result in chapter_results:
            parsed = {
                "audit_pass": result.get("audit_pass", False),
                "audit_score": result.get("audit_score", 0.0),
                "aigc_resistance": result.get("aigc_resistance", 0.0),
                "wordcount_deviation_pct": result.get("wordcount_deviation_pct", 0.0),
                "ai_tell_density": result.get("ai_tell_density", 0.5),
            }
            scored = scorer.score_chapter(parsed)
            chapter_scores.append(scored)
            logging.debug(
                f"  Ch {result.get('chapter','?')}: audit={scored['audit_pass_rate']:.2f} "
                f"aigc={scored['aigc_resistance']:.2f} wc={scored['wordcount_accuracy']:.2f} "
                f"aitell={scored['ai_tell_density']:.2f}"
            )

        agg = scorer.aggregate(chapter_scores)

        # Store per-objective scores in side-channel for result extraction
        _EVALUATOR_SCORES[candidate] = {
            "audit_pass_rate": agg["audit_pass_rate"],
            "aigc_resistance": agg["aigc_resistance"],
            "wordcount_accuracy": agg["wordcount_accuracy"],
            "ai_tell_density": agg["ai_tell_density"],
            "composite": agg["composite"],
        }

        return agg["composite"]

    pareto, best = run_random_search(
        seed_dict=seed_candidate_dict,
        evaluate_fn=evaluate_wrapper,
        bounds=bounds,
        max_evals=max_evals,
    )

    # Enrich pareto and best with per-objective scores from side-channel
    def enrich(c: dict) -> dict:
        extra = _EVALUATOR_SCORES.get(c.get("params_str", ""), {})
        if extra:
            c = dict(c)
            c["scores"] = {
                "audit_pass_rate": extra.get("audit_pass_rate", 0.0),
                "aigc_resistance": extra.get("aigc_resistance", 0.0),
                "wordcount_accuracy": extra.get("wordcount_accuracy", 0.0),
                "ai_tell_density": extra.get("ai_tell_density", 0.0),
                "composite": extra.get("composite", c.get("score", 0.0)),
            }
        return c

    pareto = [enrich(c) for c in pareto]
    best = enrich(dict(best))

    return {
        "status": "success",
        "mode": "random-search",
        "book_id": book_id,
        "agent": agent,
        "train_chapters": train_chapters,
        "val_chapters": val_chapters,
        "max_evals": max_evals,
        "candidates": pareto,
        "best_candidate": best,
        "note": "Random perturbation search (no LLM). For LLM-based GEPA reflection, set OPENAI_API_KEY or ANTHROPIC_API_KEY.",
    }


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    setup_logging(args.verbose)

    try:
        config = json.loads(Path(args.config).read_text(encoding="utf-8"))
    except FileNotFoundError:
        logging.error(f"Config file not found: {args.config}")
        return 1
    except json.JSONDecodeError as e:
        logging.error(f"Invalid JSON in config: {e}")
        return 1

    try:
        result = run_gepa(config, args)
    except Exception as e:
        logging.exception(f"GEPA optimization failed: {e}")
        result = {"status": "error", "error": str(e)}

    output_text = json.dumps(result, ensure_ascii=False, indent=2, default=str)
    if args.output:
        Path(args.output).write_text(output_text, encoding="utf-8")
        logging.info(f"Results written to {args.output}")
    # Always print to stdout so parent processes can capture it
    sys.stdout.flush()
    print(output_text)
    sys.stdout.flush()

    return 0 if result.get("status") == "success" else 1


if __name__ == "__main__":
    sys.exit(main())
