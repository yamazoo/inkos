"""GEPA evaluator for InkOS prompt optimization.

Implements the GEPA evaluator interface: given a candidate parameter dict,
runs InkOS pipeline and returns multi-objective scores.
"""

from __future__ import annotations

import json
import os
import logging
from pathlib import Path
from typing import Any, Callable

from gepa_wrapper.parameter_space import (
    WriterParams,
    ContinuityParams,
    SettlerParams,
    PARAM_BOUNDS,
)
from gepa_wrapper.inkos_runner import InkOSRunner, write_config

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Score normalization helpers
# ---------------------------------------------------------------------------


def _normalize(value: float, lo: float, hi: float) -> float:
    """Normalize value to [0, 1] range given bounds."""
    if hi == lo:
        return 1.0
    return max(0.0, min(1.0, (value - lo) / (hi - lo)))


def _clamp(v: float, lo: float = 0.0, hi: float = 1.0) -> float:
    return max(lo, min(hi, v))


# ---------------------------------------------------------------------------
# Multi-objective scorer
# ---------------------------------------------------------------------------


class MultiObjectiveScorer:
    """Aggregate per-chapter scores into multi-objective metrics.

    All objectives are normalized to [0, 1] where higher = better.
    """

    def __init__(
        self,
        audit_weight: float = 0.35,
        aigc_weight: float = 0.30,
        wordcount_weight: float = 0.20,
        aitell_weight: float = 0.15,
    ):
        self.weights = {
            "audit_pass_rate": audit_weight,
            "aigc_resistance": aigc_weight,
            "wordcount_accuracy": wordcount_weight,
            "ai_tell_density": aitell_weight,
        }

    def score_chapter(self, raw: dict[str, Any]) -> dict[str, float]:
        """Score a single chapter result. All returned values ∈ [0, 1], higher = better."""
        scores = {}

        # 1. Audit pass (from ContinuityAuditor)
        # Raw: audit_pass (bool) or audit_score (0-1)
        audit_raw = raw.get("audit_pass", raw.get("audit_score", 0))
        if isinstance(audit_raw, bool):
            scores["audit_pass_rate"] = 1.0 if audit_raw else 0.0
        else:
            scores["audit_pass_rate"] = float(audit_raw)

        # 2. AIGC resistance (higher = more human-like)
        # Raw: aigc_score (0=AI, 1=human)
        aigc_raw = raw.get("aigc_resistance", raw.get("aigc_score", 0))
        scores["aigc_resistance"] = _clamp(float(aigc_raw), 0.0, 1.0)

        # 3. Word count accuracy (1 = exact match, 0 = way off)
        # Raw: wordcount_deviation_pct (e.g. 0.05 = 5% off target)
        wc_dev = abs(float(raw.get("wordcount_deviation_pct", 0)))
        scores["wordcount_accuracy"] = _normalize(wc_dev, 0.0, 0.40)

        # 4. AI-tell density (lower raw = better)
        # Raw: ai_tell_density (0-1, 0 = no AI tells, 1 = maximum AI tells)
        aitell_raw = float(raw.get("ai_tell_density", 0.5))
        scores["ai_tell_density"] = 1.0 - _clamp(aitell_raw, 0.0, 1.0)

        return scores

    def aggregate(self, chapter_scores: list[dict[str, Any]]) -> dict[str, float]:
        """Aggregate per-chapter scores into a single multi-objective score dict."""
        if not chapter_scores:
            return {
                "audit_pass_rate": 0.0,
                "aigc_resistance": 0.0,
                "wordcount_accuracy": 0.0,
                "ai_tell_density": 0.0,
                "composite": 0.0,
            }

        # Average each objective across chapters
        n = len(chapter_scores)
        agg = {}
        for key in ["audit_pass_rate", "aigc_resistance", "wordcount_accuracy", "ai_tell_density"]:
            agg[key] = sum(s[key] for s in chapter_scores) / n

        # Composite = weighted sum
        agg["composite"] = sum(
            agg[k] * w for k, w in self.weights.items()
        )
        return agg


# ---------------------------------------------------------------------------
# GEPA evaluator
# ---------------------------------------------------------------------------


class InkOSEvaluator:
    """GEPA-compatible evaluator for InkOS prompt optimization.

    Implements the callable interface expected by `gepa.optimize()`:
        evaluator(candidate: dict[str, float]) -> dict[str, float]

    Args:
        runner: InkOSRunner instance for executing the pipeline
        train_chapters: List of chapter numbers for training evaluation
        scorer: MultiObjectiveScorer instance
        objectives: List of objective names to include in returned scores
    """

    def __init__(
        self,
        runner: InkOSRunner,
        train_chapters: list[int],
        scorer: MultiObjectiveScorer | None = None,
        objectives: list[str] | None = None,
    ):
        self.runner = runner
        self.train_chapters = train_chapters
        self.scorer = scorer or MultiObjectiveScorer()
        self.objectives = objectives or [
            "audit_pass_rate",
            "aigc_resistance",
            "wordcount_accuracy",
            "ai_tell_density",
            "composite",
        ]

    def __call__(self, candidate: dict[str, float]) -> dict[str, float]:
        """GEPA evaluator callable: runs pipeline with candidate params, returns scores."""
        candidate_id = candidate.get("_candidate_id", "unknown")

        # Build params dict (ensure all values are JSON-serializable)
        params = {k: float(v) for k, v in candidate.items() if k != "_candidate_id"}
        params["candidate_id"] = candidate_id

        chapter_results = self.runner.evaluate_chapters(
            chapters=self.train_chapters,
            params=params,
        )

        # Score each chapter
        chapter_scores = []
        for result in chapter_results:
            parsed = self._extract_scores(result)
            scored = self.scorer.score_chapter(parsed)
            chapter_scores.append(scored)

        # Aggregate
        agg = self.scorer.aggregate(chapter_scores)

        # Filter to requested objectives
        return {k: agg[k] for k in self.objectives if k in agg}

    def _extract_scores(self, raw_result: dict[str, Any]) -> dict[str, Any]:
        """Extract and normalize raw chapter result into standard score fields."""
        return {
            "audit_pass": raw_result.get("audit_pass", False),
            "audit_score": raw_result.get("audit_score", 0.0),
            "aigc_resistance": raw_result.get("aigc_resistance", 0.0),
            "wordcount_deviation_pct": raw_result.get("wordcount_deviation_pct", 0.0),
            "ai_tell_density": raw_result.get("ai_tell_density", 0.5),
        }


# ---------------------------------------------------------------------------
# Default reflection prompt (used by GEPA for LLM-based mutation)
# ---------------------------------------------------------------------------

DEFAULT_REFLECTION_OBJECTIVE = """
You are optimizing InkOS novel writing agent prompts.
Given the evaluation scores for a candidate, diagnose WHY it failed and propose
targeted improvements to the parameters.

Key dimensions to consider:
- audit_pass_rate: Does the writing maintain character consistency and plot continuity?
- aigc_resistance: Does the text sound human-written (natural dialogue, varied sentence structure)?
- wordcount_accuracy: Is the chapter length within the governance target?
- ai_tell_density: Are there markers of AI writing (analysis terms, hedge words, uniform paragraphs)?
"""


# ---------------------------------------------------------------------------
# Convenience factory
# ---------------------------------------------------------------------------


def create_evaluator(
    project_root: str | Path,
    book_id: str,
    train_chapters: list[int],
    objectives: dict[str, float] | None = None,
) -> InkOSEvaluator:
    """Factory: create a configured InkOSEvaluator from book metadata."""
    runner = InkOSRunner(
        project_root=project_root,
        book_id=book_id,
    )

    weights = objectives or {
        "audit_pass_rate": 0.35,
        "aigc_resistance": 0.30,
        "wordcount_accuracy": 0.20,
        "ai_tell_density": 0.15,
    }

    scorer = MultiObjectiveScorer(
        audit_weight=weights.get("audit_pass_rate", 0.35),
        aigc_weight=weights.get("aigc_resistance", 0.30),
        wordcount_weight=weights.get("wordcount_accuracy", 0.20),
        aitell_weight=weights.get("ai_tell_density", 0.15),
    )

    return InkOSEvaluator(
        runner=runner,
        train_chapters=train_chapters,
        scorer=scorer,
    )
