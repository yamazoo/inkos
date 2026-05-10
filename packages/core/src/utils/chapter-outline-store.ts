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
