"""Parameter space definition for InkOS prompt optimization via GEPA.

All tunable knobs are defined here as Pydantic models with bounds.
These must stay in sync with packages/core/src/prompt-tuning/parameter-space.ts.
"""

from __future__ import annotations

from pydantic import BaseModel, Field
from typing import Literal


# ---------------------------------------------------------------------------
# Writer agent knobs
# ---------------------------------------------------------------------------


class WriterParams(BaseModel):
    """Tunable knobs for the Writer agent system prompt."""

    # Temperature
    writer_temperature_creative: float = Field(
        default=0.7,
        ge=0.5,
        le=0.9,
        description="LLM temperature during creative (draft) phase",
    )
    writer_temperature_settlement: float = Field(
        default=0.3,
        ge=0.1,
        le=0.4,
        description="LLM temperature during settlement (post-write truth update) phase",
    )

    # Anti-AI enforcement
    max_transition_markers_per_3k: int = Field(
        default=1,
        ge=0,
        le=5,
        description="Max transition/surprise markers (仿佛/不禁/竟然) per 3000 characters",
    )
    max_hedge_words_per_chapter: int = Field(
        default=3,
        ge=0,
        le=10,
        description="Max hedge words (似乎/好像/大概) per chapter",
    )
    paragraph_uniformity_cv_threshold: float = Field(
        default=0.15,
        ge=0.05,
        le=0.35,
        description="Coefficient-of-variation threshold for paragraph length uniformity check",
    )
    disable_analysis_terms: bool = Field(
        default=True,
        description="Whether to forbid analysis-framework terms in narrative (当前处境/核心动机/etc.)",
    )

    # Length governance
    length_soft_tolerance_pct: float = Field(
        default=0.10,
        ge=0.05,
        le=0.25,
        description="Soft tolerance percentage around target word count (softMin = target * (1 - tol))",
    )
    length_hard_tolerance_pct: float = Field(
        default=0.20,
        ge=0.10,
        le=0.40,
        description="Hard tolerance percentage around target word count",
    )

    # Golden chapters (1-3) special enforcement
    enforce_golden_chapters: bool = Field(
        default=True,
        description="Apply golden-three-chapters special rules for chapter 1-3",
    )

    # POV / immersion
    max_consecutive_dialogue_paragraphs: int = Field(
        default=4,
        ge=2,
        le=8,
        description="Max consecutive dialogue-only paragraphs before requiring action beat",
    )
    enforce_sensory_details: bool = Field(
        default=True,
        description="Require at least 1-2 sensory details per major scene",
    )

    # Pacing control (NEW — for fast-paced genre fiction)
    scene_beat_density: int = Field(
        default=3,
        ge=2,
        le=8,
        description="Target scene beats (cut/turn/beat) per 1000 words — higher = faster pacing",
    )
    pacing_force_cuts: bool = Field(
        default=False,
        description="Replace soft transitions with hard scene cuts (>>>) — activates fast pacing mode",
    )
    max_exposition_paragraphs: int = Field(
        default=2,
        ge=0,
        le=5,
        description="Max pure-exposition paragraphs per chapter (0=tight, 5=permissive)",
    )
    inner_monologue_words_max: int = Field(
        default=80,
        ge=20,
        le=200,
        description="Max words in any single inner monologue passage (shorter = tighter pacing)",
    )


# ---------------------------------------------------------------------------
# Continuity auditor knobs
# ---------------------------------------------------------------------------


class ContinuityParams(BaseModel):
    """Tunable knobs for the ContinuityAuditor (33-dimension audit)."""

    # Dimension strictness
    ooc_strictness: float = Field(
        default=0.7,
        ge=0.0,
        le=1.0,
        description="Weight for OOC (character consistency) issues (0=ignore, 1=critical)",
    )
    pacing_weight: float = Field(
        default=0.6,
        ge=0.0,
        le=1.0,
        description="Weight for pacing issues",
    )
    info_boundary_weight: float = Field(
        default=0.7,
        ge=0.0,
        le=1.0,
        description="Weight for information boundary violations",
    )
    power_scaling_weight: float = Field(
        default=0.6,
        ge=0.0,
        le=1.0,
        description="Weight for power-scaling (战力崩坏) issues",
    )

    # Lexical fatigue
    fatigue_scan_depth: Literal["surface", "medium", "deep"] = Field(
        default="medium",
        description="How deeply to scan for lexical fatigue patterns",
    )

    # Audit pass threshold
    critical_threshold: int = Field(
        default=0,
        ge=0,
        le=5,
        description="Max allowed critical-severity issues before FAIL",
    )
    warning_threshold: int = Field(
        default=5,
        ge=0,
        le=20,
        description="Max allowed warning-severity issues before FAIL",
    )


# ---------------------------------------------------------------------------
# Settler (Reflector) knobs
# ---------------------------------------------------------------------------


class SettlerParams(BaseModel):
    """Tunable knobs for the Settler/Reflector agent."""

    settler_temperature: float = Field(
        default=0.2,
        ge=0.1,
        le=0.5,
        description="LLM temperature for Settler phase",
    )
    over_extract_bias: float = Field(
        default=0.7,
        ge=0.0,
        le=1.0,
        description="Bias toward over-extraction (1.0 = extract everything, 0.0 = only certain facts)",
    )
    enforce_ledger_verification: bool = Field(
        default=True,
        description="Whether to enforce numerical ledger verification (期初+增量=期末)",
    )


# ---------------------------------------------------------------------------
# Combined parameter set
# ---------------------------------------------------------------------------


class AllParams(BaseModel):
    """All tunable parameters across all agents."""

    writer: WriterParams = Field(default_factory=WriterParams)
    continuity: ContinuityParams = Field(default_factory=ContinuityParams)
    settler: SettlerParams = Field(default_factory=SettlerParams)


# ---------------------------------------------------------------------------
# Parameter bounds for GEPA
# ---------------------------------------------------------------------------

PARAM_BOUNDS: dict[str, tuple[float, float]] = {
    # Writer
    "writer_temperature_creative": (0.5, 0.9),
    "writer_temperature_settlement": (0.1, 0.4),
    "max_transition_markers_per_3k": (0.0, 5.0),
    "max_hedge_words_per_chapter": (0.0, 10.0),
    "paragraph_uniformity_cv_threshold": (0.05, 0.35),
    "length_soft_tolerance_pct": (0.05, 0.25),
    "length_hard_tolerance_pct": (0.10, 0.40),
    "max_consecutive_dialogue_paragraphs": (2.0, 8.0),
    # Pacing (new)
    "scene_beat_density": (2.0, 8.0),
    # Continuity
    "ooc_strictness": (0.0, 1.0),
    "pacing_weight": (0.0, 1.0),
    "info_boundary_weight": (0.0, 1.0),
    "power_scaling_weight": (0.0, 1.0),
    "critical_threshold": (0.0, 5.0),
    "warning_threshold": (0.0, 20.0),
    # Settler
    "settler_temperature": (0.1, 0.5),
    "over_extract_bias": (0.0, 1.0),
}
