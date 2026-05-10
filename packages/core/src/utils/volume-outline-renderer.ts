/**
 * volume-outline-renderer.ts
 *
 * Renders VolumeOutlineSchema JSON back to a Markdown string so that
 * downstream consumers (PlannerAgent.findOutlineNode, WriterAgent.buildUserPrompt,
 * ComposerAgent.collectSelectedContext, etc.) continue to work without changes.
 *
 * The rendered markdown uses the same table format and heading structure
 * that the markdown parsers in planner.ts and writer.ts expect.
 */

import type {
  ChapterNode,
  VolumeOutlineSchema,
  VolumePhase,
  VolumeNode,
} from "../models/volume-outline.js";

// ---------------------------------------------------------------------------
// Row renderers
// ---------------------------------------------------------------------------

function renderChapterRow(ch: ChapterNode): string {
  if (ch.description) {
    return `| ${ch.chapter} | ${ch.event}（${ch.beat}）${ch.description} |`;
  }
  return `| ${ch.chapter} | ${ch.event} | ${ch.beat} |`;
}

// ---------------------------------------------------------------------------
// Overview table
// ---------------------------------------------------------------------------

function renderOverviewTable(volumes: VolumeNode[]): string {
  const lines: string[] = [
    "| 卷名 | 章节 | 核心冲突 | 关键转折 | 收益目标 |",
    "|------|------|----------|----------|----------|",
  ];

  for (const vol of volumes) {
    const volTitle = vol.volumeTitle;
    const [start, end] = vol.chapterRange;
    const range = `${start}-${end}`;
    const conflict = vol.coreConflict;

    // Primary key turn — prefer keyTurnChapters[0] if available
    const ktChapter = vol.keyTurnChapters?.[0] ?? vol.keyTurnChapter;
    const ktEvent = vol.keyTurnEvents?.[0] ?? vol.keyTurnEvent;
    const keyTurn = `${ktChapter}章：${ktEvent}`;

    const goals = vol.harvestGoals.join("、");

    lines.push(
      `| ${volTitle} | ${range} | ${conflict} | ${keyTurn} | ${goals} |`,
    );
  }

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Per-volume section
// ---------------------------------------------------------------------------

function renderVolumeSection(vol: VolumeNode): string {
  const [start, end] = vol.chapterRange;

  const lines: string[] = [
    `### ${vol.volumeTitle}`,
    "",
    `**章节范围**：第${start}-${end}章`,
    "",
    `**核心冲突**：${vol.coreConflict}`,
    "",
    "**卷纲细纲**：",
    "",
  ];

  if (vol.phases && vol.phases.length > 0) {
    // Multi-phase volume (e.g. Volume 3)
    lines.push("（每10章一个威胁升级）：\n");
    for (const phase of vol.phases) {
      lines.push(`**${phase.label}**`);
      lines.push("");
      lines.push("| 章节 | 事件 | 节奏点 |");
      lines.push("|------|------|--------|");
      for (const ch of phase.chapters) {
        lines.push(renderChapterRow(ch));
      }
      lines.push("");
    }
  } else {
    // Single-phase volume
    lines.push("| 章节 | 事件 | 节奏点 |");
    lines.push("|------|------|--------|");
    for (const ch of vol.chapters) {
      lines.push(renderChapterRow(ch));
    }
    lines.push("");
  }

  // Key turn summary
  if (vol.keyTurnChapters && vol.keyTurnChapters.length > 1) {
    const turns = vol.keyTurnChapters
      .map((ch, i) => {
        const event = vol.keyTurnEvents?.[i] ?? "";
        return `第${ch}章${event ? "：" + event : ""}`;
      })
      .join("、");
    lines.push(`**关键转折**：${turns}`);
  } else {
    lines.push(
      `**关键转折**：第${vol.keyTurnChapter}章${vol.keyTurnEvent ? "：" + vol.keyTurnEvent : ""}`,
    );
  }

  lines.push("");
  lines.push("**收益目标**：");
  for (const goal of vol.harvestGoals) {
    lines.push(`- ${goal}`);
  }

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Main renderer
// ---------------------------------------------------------------------------

/**
 * Render a VolumeOutlineSchema JSON object back to a Markdown string
 * compatible with downstream consumers.
 *
 * The output uses:
 * - Overview table at the top
 * - Per-volume sections with chapter tables
 * - Bold phase headers for multi-phase volumes
 */
export function renderVolumeOutlineToMarkdown(
  outline: VolumeOutlineSchema,
): string {
  const sections: string[] = [
    "## 卷纲总览",
    "",
    renderOverviewTable(outline.volumes),
    "",
    "---",
    "",
  ];

  for (const vol of outline.volumes) {
    sections.push(renderVolumeSection(vol));
    sections.push("");
    sections.push("---");
    sections.push("");
  }

  return sections.join("\n").replace(/\n{3,}/g, "\n\n");
}

/**
 * Convenience: parse a JSON string and render it to markdown.
 * Returns null if the input is not valid JSON matching our schema.
 */
export function renderVolumeOutlineJsonToMarkdown(
  jsonString: string,
): string | null {
  try {
    const data = JSON.parse(jsonString) as VolumeOutlineSchema;
    if (
      typeof data !== "object" ||
      data === null ||
      data.schemaVersion !== 1 ||
      !Array.isArray(data.volumes)
    ) {
      return null;
    }
    return renderVolumeOutlineToMarkdown(data);
  } catch {
    return null;
  }
}
