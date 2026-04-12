"""InkOS subprocess runner for GEPA evaluation.

Spawns the InkOS TypeScript CLI to:
1. Run pipeline on a book with candidate parameters
2. Extract evaluation scores from the output
"""

from __future__ import annotations

import json
import subprocess
import tempfile
import os
import shutil
from pathlib import Path
from typing import Any

# ---------------------------------------------------------------------------
# Config file format (written by TypeScript, read by Python)
# ---------------------------------------------------------------------------


def write_config(config_path: str | Path, config: dict[str, Any]) -> None:
    """Write evaluation config as JSON for Python to consume."""
    with open(config_path, "w", encoding="utf-8") as f:
        json.dump(config, f, ensure_ascii=False, indent=2)


def read_config(config_path: str | Path) -> dict[str, Any]:
    """Read evaluation config written by TypeScript."""
    with open(config_path, encoding="utf-8") as f:
        return json.load(f)


# ---------------------------------------------------------------------------
# InkOS runner
# ---------------------------------------------------------------------------


class InkOSRunner:
    """Spawn InkOS CLI as a subprocess for evaluation.

    Usage:
        runner = InkOSRunner(
            inkos_executable="npx",
            project_root=Path("E:/workspace/inkos"),
            book_id="my-book",
        )
        result = runner.run_pipeline(chapter=5, params=writer_params)
    """

    def __init__(
        self,
        inkos_executable: str = "npx",
        project_root: str | Path | None = None,
        book_id: str | None = None,
        inkos_args: list[str] | None = None,
    ):
        self.inkos_executable = inkos_executable
        self.project_root = Path(project_root) if project_root else Path.cwd()
        self.book_id = book_id
        self.inkos_args = inkos_args or []

    def run_pipeline(
        self,
        chapter: int | None = None,
        params: dict[str, Any] | None = None,
        timeout: int = 600,
    ) -> dict[str, Any]:
        """Run inkos write/revise on a chapter with given params.

        Writes params to a temp JSON, then calls:
            node packages/cli/dist/index.js revise <book-id> <chapter> \
                --config <tmp.json> --writer-params <json> --gepa-eval

        Returns parsed output dict with scores extracted from <!-- GEPA_SCORES --> markers.
        """
        with tempfile.NamedTemporaryFile(
            mode="w", suffix=".json", prefix="inkos-eval-", delete=False
        ) as tmp:
            tmp_config = Path(tmp.name)

        try:
            # Write candidate params to temp file
            eval_config = {
                "candidate_id": params.get("candidate_id", "unknown") if params else "default",
                "params": params or {},
                "chapter": chapter,
            }
            write_config(tmp_config, eval_config)

            # Build command with GEPA eval flags
            cmd = self._build_command(chapter, tmp_config, params)

            result = subprocess.run(
                cmd,
                cwd=str(self.project_root),
                capture_output=True,
                text=True,
                timeout=timeout,
                encoding="utf-8",
            )

            return self._parse_output(result, params)

        finally:
            if tmp_config.exists():
                tmp_config.unlink()

    def _build_command(
        self,
        chapter: int | None,
        tmp_config: Path,
        params: dict[str, Any] | None = None,
    ) -> list[str]:
        """Build the inkos CLI command with GEPA evaluation flags."""
        cmd = [self.inkos_executable]

        # Look for inkos binary in project
        inkos_bin = self.project_root / "packages" / "cli" / "dist" / "index.js"
        if inkos_bin.exists():
            cmd = ["node", str(inkos_bin)]

        cmd.extend(["revise", self.book_id or ""])
        if chapter is not None:
            cmd.append(str(chapter))
        cmd.extend(["--config", str(tmp_config)])

        # Pass writer param overrides as JSON.
        # Keys arrive as "writer__<key>" (GEPA double-underscore convention) or
        # "writer_<key>" (already normalised).  Strip the GEPA "writer__" prefix
        # then add the TypeScript "writer_" prefix — but only if the key does not
        # already start with "writer_", so we never produce "writer_writer_<key>".
        numeric_params = params.get("params", {}) if params else {}
        if numeric_params:
            writer_override = {}
            for k, v in numeric_params.items():
                if k == "_candidate_id":
                    continue
                # Strip GEPA double-underscore namespace prefix if present
                key = k[10:] if k.startswith("writer__") else k
                # Add TypeScript single-underscore prefix only when absent
                if not key.startswith("writer_"):
                    key = f"writer_{key}"
                writer_override[key] = v
            if writer_override:
                cmd.extend(["--writer-params", json.dumps(writer_override)])

        # Always emit GEPA score markers when called from GEPA runner
        cmd.append("--gepa-eval")

        cmd.extend(self.inkos_args)
        return cmd

    def _parse_output(
        self,
        result: subprocess.CompletedProcess,
        params: dict[str, Any] | None,
    ) -> dict[str, Any]:
        """Parse inkos CLI output into structured scores."""
        stdout = result.stdout or ""
        stderr = result.stderr or ""

        import logging
        _logger = logging.getLogger("gepa_wrapper.inkos_runner")

        # Try to extract JSON from stdout
        scores = {
            "exit_code": result.returncode,
            "stdout_tail": stdout[-2000:],  # last 2000 chars
            "stderr_tail": stderr[-1000:],
            "candidate_id": params.get("candidate_id", "unknown") if params else "default",
        }

        # Parse JSON score block if present
        # Expected format: <!-- GEPA_SCORES {"audit_pass":1,"aigc_resistance":0.8,...} GEPA_SCORES -->
        import re

        match = re.search(
            r"<!-- GEPA_SCORES (.+?) GEPA_SCORES -->",
            stdout,
            re.DOTALL,
        )
        if match:
            try:
                parsed = json.loads(match.group(1))
                scores.update(parsed)
                _logger.debug(
                    f"  [inkos_runner] Found GEPA_SCORES markers: "
                    f"audit_pass={parsed.get('audit_pass')}, "
                    f"aigc={parsed.get('aigc_resistance')}, "
                    f"wc_dev={parsed.get('wordcount_deviation_pct')}, "
                    f"ai_tell={parsed.get('ai_tell_density')}"
                )
            except json.JSONDecodeError as e:
                _logger.warning(f"  [inkos_runner] GEPA_SCORES JSON parse error: {e}")
        else:
            # No markers found — log last 500 chars of stdout for debugging
            _logger.warning(
                f"  [inkos_runner] NO GEPA_SCORES markers found in ink output "
                f"(exit={result.returncode}). stdout tail: {stdout[-500]!r}"
            )

        return scores

    def evaluate_chapters(
        self,
        chapters: list[int],
        params: dict[str, Any],
        timeout: int = 600,
    ) -> list[dict[str, Any]]:
        """Run evaluation across multiple chapters sequentially."""
        results = []
        for ch in chapters:
            r = self.run_pipeline(chapter=ch, params=params, timeout=timeout)
            r["chapter"] = ch
            results.append(r)
        return results


def load_config_from_file(config_path: str | Path) -> dict[str, Any]:
    """Load GEPA evaluation config written by TypeScript orchestrator."""
    return read_config(config_path)
