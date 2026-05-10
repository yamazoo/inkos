/**
 * chapter-outline-store.ts
 *
 * Per-volume chapter outline storage. Each volume's chapters are stored as an
 * independent JSON file at `story/outline/vol-{N}-chapters.json` to avoid
 * loading the entire outline when only one volume is needed.
 */

import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
import { ChapterNodeSchema, type ChapterNode } from "../models/volume-outline.js";

// ---------------------------------------------------------------------------
// Semantic validation
// ---------------------------------------------------------------------------

const PLACEHOLDER_PATTERNS = [
  /^待定$/,
  /^TODO$/i,
  /^TBD$/i,
  /^无$/,
  /^暂无$/,
  /^N\/A$/i,
  /^\.{2,}$/,        // "..."
  /^—{2,}$/,         // "——"
  /^\?{2,}$/,        // "???"
  /^待补充$/,
  /^略$/,
];

export interface SemanticWarning {
  chapter: number;
  field: "event" | "beat";
  issue: "placeholder" | "too-short" | "duplicate-event";
  detail: string;
}

/**
 * Semantic checks on LLM-generated chapter outlines before persistence.
 * Returns warnings only — callers decide whether to reject or persist.
 */
export function validateChapterOutlineSemantics(
  chapters: ChapterNode[],
  existingChapters?: ChapterNode[],
): SemanticWarning[] {
  const warnings: SemanticWarning[] = [];
  const allChapters = [...(existingChapters ?? []), ...chapters];

  for (const ch of chapters) {
    // Check for placeholder event
    if (PLACEHOLDER_PATTERNS.some((p) => p.test(ch.event.trim()))) {
      warnings.push({
        chapter: ch.chapter,
        field: "event",
        issue: "placeholder",
        detail: `Chapter ${ch.chapter} event is a placeholder: "${ch.event}"`,
      });
    }

    // Check for placeholder beat
    if (PLACEHOLDER_PATTERNS.some((p) => p.test(ch.beat.trim()))) {
      warnings.push({
        chapter: ch.chapter,
        field: "beat",
        issue: "placeholder",
        detail: `Chapter ${ch.chapter} beat is a placeholder: "${ch.beat}"`,
      });
    }

    // Check for excessively short content (< 3 meaningful characters)
    if (
      !PLACEHOLDER_PATTERNS.some((p) => p.test(ch.event.trim())) &&
      ch.event.trim().length < 3
    ) {
      warnings.push({
        chapter: ch.chapter,
        field: "event",
        issue: "too-short",
        detail: `Chapter ${ch.chapter} event is suspiciously short (${ch.event.trim().length} chars): "${ch.event}"`,
      });
    }

    if (
      !PLACEHOLDER_PATTERNS.some((p) => p.test(ch.beat.trim())) &&
      ch.beat.trim().length < 3
    ) {
      warnings.push({
        chapter: ch.chapter,
        field: "beat",
        issue: "too-short",
        detail: `Chapter ${ch.chapter} beat is suspiciously short (${ch.beat.trim().length} chars): "${ch.beat}"`,
      });
    }

    // Check for duplicate events within the same volume
    const duplicate = allChapters.find(
      (other) =>
        other.chapter !== ch.chapter &&
        other.event.trim() === ch.event.trim() &&
        ch.event.trim().length > 0,
    );
    if (duplicate) {
      warnings.push({
        chapter: ch.chapter,
        field: "event",
        issue: "duplicate-event",
        detail: `Chapter ${ch.chapter} event is identical to chapter ${duplicate.chapter}: "${ch.event}"`,
      });
    }
  }

  return warnings;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export const VolumeChapterFileSchema = z.object({
  schemaVersion: z.literal(1),
  volumeId: z.number().int().min(1),
  volumeTitle: z.string().min(1),
  chapterRange: z.tuple([z.number().int().min(1), z.number().int().min(1)]),
  chapters: z.array(ChapterNodeSchema),
});

export type VolumeChapterFile = z.infer<typeof VolumeChapterFileSchema>;

// ---------------------------------------------------------------------------
// Path helper
// ---------------------------------------------------------------------------

function volChaptersPath(bookDir: string, volumeId: number): string {
  return join(bookDir, "story", "outline", `vol-${volumeId}-chapters.json`);
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export async function readVolumeChapters(
  bookDir: string,
  volumeId: number,
): Promise<VolumeChapterFile | null> {
  try {
    const raw = await readFile(volChaptersPath(bookDir, volumeId), "utf-8");
    return VolumeChapterFileSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

export async function writeVolumeChapters(
  bookDir: string,
  data: VolumeChapterFile,
): Promise<void> {
  const validated = VolumeChapterFileSchema.parse(data);
  const dir = join(bookDir, "story", "outline");
  await mkdir(dir, { recursive: true });
  const filePath = volChaptersPath(bookDir, validated.volumeId);
  await writeFile(filePath, JSON.stringify(validated, null, 2), "utf-8");
}

// ---------------------------------------------------------------------------
// Find single chapter across all volumes
// ---------------------------------------------------------------------------

export async function findChapterOutline(
  bookDir: string,
  chapterNumber: number,
): Promise<ChapterNode | null> {
  const dir = join(bookDir, "story", "outline");
  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch {
    return null;
  }

  const volFiles = entries
    .filter((e) => /^vol-\d+-chapters\.json$/.test(e))
    .sort();

  for (const file of volFiles) {
    try {
      const raw = await readFile(join(dir, file), "utf-8");
      const vol = VolumeChapterFileSchema.parse(JSON.parse(raw));
      const found = vol.chapters.find((ch) => ch.chapter === chapterNumber);
      if (found) return found;
    } catch {
      // Skip corrupted files
      continue;
    }
  }

  return null;
}
