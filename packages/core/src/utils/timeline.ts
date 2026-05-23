import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import {
  TimelineStateSchema,
  type TimelineState,
  type TimelineDelta,
  type EventAnchor,
  type TimelineConflict,
} from "../models/timeline.js";
import type { AuditIssue } from "../agents/continuity.js";

const DAY_GAP_WARNING_THRESHOLD = 10;

const EMPTY_TIMELINE: TimelineState = {
  storyDays: [],
  eventAnchors: [],
  conflicts: [],
  lastUpdatedChapter: 0,
};

export async function loadTimeline(bookDir: string): Promise<TimelineState> {
  const path = join(bookDir, "story", "state", "timeline.json");
  try {
    const raw = await readFile(path, "utf-8");
    return TimelineStateSchema.parse(JSON.parse(raw));
  } catch {
    return { ...EMPTY_TIMELINE };
  }
}

export async function saveTimeline(bookDir: string, state: TimelineState): Promise<void> {
  const stateDir = join(bookDir, "story", "state");
  await mkdir(stateDir, { recursive: true });
  await writeFile(join(stateDir, "timeline.json"), JSON.stringify(state, null, 2), "utf-8");
}

export function applyTimelineDelta(
  existing: TimelineState,
  delta: TimelineDelta,
  chapter: number,
): { readonly updated: TimelineState; readonly conflicts: ReadonlyArray<TimelineConflict> } {
  const newConflicts: TimelineConflict[] = [];

  // 1. Update storyDays: replace same-chapter entry or append, sort by chapter
  const filteredDays = existing.storyDays.filter((d) => d.chapter !== chapter);
  const nextStoryDaysRaw = [
    ...filteredDays,
    { chapter, storyDay: delta.storyDay, label: delta.dayLabel },
  ].sort((a, b) => a.chapter - b.chapter);

  // 1b. Backfill gaps: when chapters are missing between entries, fill them
  //     with the previous entry's storyDay (conservative "same day" assumption)
  const nextStoryDays: typeof nextStoryDaysRaw = [];
  for (let i = 0; i < nextStoryDaysRaw.length; i++) {
    const entry = nextStoryDaysRaw[i]!;
    if (i > 0) {
      const prev = nextStoryDays[nextStoryDays.length - 1]!;
      for (let ch = prev.chapter + 1; ch < entry.chapter; ch++) {
        nextStoryDays.push({ chapter: ch, storyDay: prev.storyDay, label: "" });
      }
    }
    nextStoryDays.push(entry);
  }

  // 2. Process events - deep copy anchors to avoid mutation.
  //    When a chapter is rewritten, strip stale cross-refs and countdowns
  //    from that chapter so the new delta replaces them cleanly.
  const anchorsById = new Map<string, EventAnchor>(
    existing.eventAnchors.map((a) => [
      a.eventId,
      {
        ...a,
        crossReferences: a.crossReferences.filter((r) => r.chapter !== chapter),
        countdowns: a.countdowns.filter((c) => c.chapter !== chapter),
      },
    ]),
  );

  for (const evt of delta.events) {
    const existingAnchor = anchorsById.get(evt.id);

    if (!existingAnchor) {
      // New anchor: first mention. For countdown events, anchor to the
      // implied target day (current + countdown) rather than the current
      // day, so subsequent references don't generate false conflicts.
      const anchorStoryDay = evt.countdown !== undefined
        ? delta.storyDay + evt.countdown
        : delta.storyDay;
      const anchor: EventAnchor = {
        eventId: evt.id,
        label: evt.id,
        storyDay: anchorStoryDay,
        firstMentioned: { chapter, raw: evt.reference },
        crossReferences: [],
        countdowns: evt.countdown !== undefined
          ? [{ chapter, raw: evt.reference, daysLeft: evt.countdown }]
          : [],
        ...(evt.recurring ? { recurring: true } : {}),
      };
      anchorsById.set(evt.id, anchor);
    } else {
      if (evt.countdown !== undefined) {
        existingAnchor.countdowns.push({
          chapter,
          raw: evt.reference,
          daysLeft: evt.countdown,
        });
        const impliedDay = delta.storyDay + evt.countdown;
        if (impliedDay !== existingAnchor.storyDay && !existingAnchor.recurring) {
          newConflicts.push({
            conflictId: `cd-${evt.id}-ch${chapter}`,
            severity: "critical",
            type: "countdown-mismatch",
            description: `${evt.id} countdown "${evt.reference}" at ch${chapter}(storyDay=${delta.storyDay}) implies event at day ${impliedDay}, but anchor is day ${existingAnchor.storyDay}`,
            chapters: [existingAnchor.firstMentioned.chapter, chapter],
            detectedAtChapter: chapter,
          });
        }
      } else {
        const impliedDay =
          evt.impliedOffset !== undefined ? delta.storyDay + evt.impliedOffset : delta.storyDay;
        existingAnchor.crossReferences.push({
          chapter,
          raw: evt.reference,
          impliedDay,
        });
        if (impliedDay !== existingAnchor.storyDay && !existingAnchor.recurring) {
          newConflicts.push({
            conflictId: `xr-${evt.id}-ch${chapter}`,
            severity: "critical",
            type: "anchor-mismatch",
            description: `${evt.id} reference "${evt.reference}" at ch${chapter}(storyDay=${delta.storyDay}) implies event at day ${impliedDay}, but anchor is day ${existingAnchor.storyDay}`,
            chapters: [existingAnchor.firstMentioned.chapter, chapter],
            detectedAtChapter: chapter,
          });
        }
      }
    }
  }

  // 3. Deduplicate conflicts: strip old conflicts from this chapter,
  //    then append new ones. Prevents accumulation on re-revision.
  const retainedConflicts = existing.conflicts.filter(
    (c) => c.detectedAtChapter !== chapter,
  );
  const seenIds = new Set(retainedConflicts.map((c) => c.conflictId));
  const dedupedNew = newConflicts.filter((c) => {
    if (seenIds.has(c.conflictId)) return false;
    seenIds.add(c.conflictId);
    return true;
  });

  const updated: TimelineState = {
    storyDays: nextStoryDays,
    eventAnchors: [...anchorsById.values()].sort(
      (a, b) => a.storyDay - b.storyDay || a.eventId.localeCompare(b.eventId),
    ),
    conflicts: [...retainedConflicts, ...dedupedNew],
    lastUpdatedChapter: chapter,
  };

  return { updated, conflicts: newConflicts };
}

export function computeDeterministicTimelineIssues(
  timeline: TimelineState,
): ReadonlyArray<AuditIssue> {
  const issues: AuditIssue[] = [];

  // L1 & L2: stored conflicts (critical severity only)
  for (const conflict of timeline.conflicts) {
    if (conflict.severity === "critical") {
      issues.push({
        severity: "critical",
        category:
          conflict.type === "countdown-mismatch"
            ? "Timeline Countdown Conflict"
            : "Timeline Anchor Conflict",
        description: conflict.description,
        suggestion: `修正第${conflict.chapters[1] ?? conflict.chapters[0]}章中对事件的时间引用，使其与 timeline.json 中的锚点一致。`,
      });
    }
  }

  // L3: day gap detection
  const sorted = [...timeline.storyDays].sort((a, b) => a.chapter - b.chapter);
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]!;
    const curr = sorted[i]!;
    const jump = curr.storyDay - prev.storyDay;
    if (jump > DAY_GAP_WARNING_THRESHOLD) {
      issues.push({
        severity: "warning",
        category: "Timeline Day Gap",
        description: `第${prev.chapter}章(storyDay=${prev.storyDay})到第${curr.chapter}章(storyDay=${curr.storyDay})跳过了${jump}天，超过${DAY_GAP_WARNING_THRESHOLD}天阈值。`,
        suggestion: `检查是否需要在中间章节补充时间过渡说明，或确认时间跳跃在故事中合理。`,
      });
    }
  }

  return issues;
}

export function formatTimelineAuditSummary(
  timeline: TimelineState,
  language: "zh" | "en",
): string {
  const isEn = language === "en";

  if (timeline.storyDays.length === 0 && timeline.eventAnchors.length === 0) {
    return isEn ? "## Timeline Status\n(no data yet)" : "## 时间线状态\n（尚无数据）";
  }

  const lines: string[] = [isEn ? "## Timeline Status" : "## 时间线状态"];

  // Story calendar
  if (timeline.storyDays.length > 0) {
    const calLabel = isEn ? "Story Calendar: " : "故事日历：";
    const calParts = timeline.storyDays.map(
      (d) => `ch${d.chapter}=day${d.storyDay}${d.label ? `\"${d.label}\"` : ""}`,
    );
    lines.push(calLabel + calParts.join(", "));
  }

  // Event anchors
  if (timeline.eventAnchors.length > 0) {
    lines.push(isEn ? "Key Event Anchors:" : "关键事件锚点：");

    // Collect eventIds that have conflicts
    const conflictEventIds = new Set<string>();
    for (const c of timeline.conflicts) {
      const match = /^(\S+)/.exec(c.description);
      if (match?.[1]) conflictEventIds.add(match[1]);
    }

    for (const anchor of timeline.eventAnchors) {
      const hasConflict = conflictEventIds.has(anchor.eventId);
      const conflictMark = hasConflict
        ? isEn
          ? " [CONFLICT!]"
          : "[矛盾!]"
        : "";
      lines.push(`- ${anchor.eventId}(day${anchor.storyDay}): ${anchor.label}${conflictMark}`);

      for (const xr of anchor.crossReferences) {
        const xrConflict = xr.impliedDay !== anchor.storyDay;
        lines.push(
          `  ch${xr.chapter} "${xr.raw}"→day${xr.impliedDay}${xrConflict ? (isEn ? " [CONFLICT!]" : "[矛盾!]") : ""}`,
        );
      }
      for (const cd of anchor.countdowns) {
        const chapterDay = timeline.storyDays.find((d) => d.chapter === cd.chapter);
        const impliedDay = chapterDay ? chapterDay.storyDay + cd.daysLeft : cd.daysLeft;
        lines.push(
          `  ch${cd.chapter} countdown "${cd.raw}"→${cd.daysLeft}d left (day${impliedDay})`,
        );
      }
    }
  }

  return lines.join("\n");
}
