import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import {
  ArcTrackerSchema,
  FactionLedgerSchema,
  MoodArcSchema,
  type ArcTracker,
  type FactionLedger,
  type MoodArc,
} from "../models/runtime-state.js";

const STATE_DIR = "state" as const;

/** Load a tracker JSON, return null if missing. */
export async function loadTracker<T>(
  bookDir: string,
  name: "arc-tracker" | "faction-ledger" | "mood-arc",
  schema: import("zod").ZodType<T>,
): Promise<T | null> {
  const path = join(bookDir, "story", STATE_DIR, `${name}.json`);
  try {
    const raw = await readFile(path, "utf-8");
    return schema.parse(JSON.parse(raw)) as T;
  } catch (err: unknown) {
    // ENOENT = file does not exist yet, return null (first-time bootstrap)
    if (err instanceof Error && "code" in err && (err as { code: string }).code === "ENOENT") {
      return null;
    }
    // For any other error (corruption, permission, etc.), surface it so caller can decide
    throw err;
  }
}

/** Save a tracker JSON. */
export async function saveTracker<T>(
  bookDir: string,
  name: "arc-tracker" | "faction-ledger" | "mood-arc",
  data: T,
): Promise<void> {
  const dir = join(bookDir, "story", STATE_DIR);
  await mkdir(dir, { recursive: true });
  const path = join(dir, `${name}.json`);
  try {
    await writeFile(path, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    throw new Error(`Failed to write tracker ${name} to ${path}`, { cause: err });
  }
}

/** Create an initial ArcTracker from volume outline. */
export function bootstrapArcTracker(
  volumeOutlineContent: string,
  volumeTitle: string,
  chapterRange: [number, number],
  mainSuspenseHookId: string,
  mainSuspenseDescription: string,
): ArcTracker {
  const nodeMatches = [...volumeOutlineContent.matchAll(/#{1,2}\s+[节点转折点篇章节][：:]\s*(.+)/g)]
    .map((m, i) => ({
      nodeId: `node-${i + 1}`,
      title: m[1].trim(),
      status: i === 0 ? ("active" as const) : ("pending" as const),
      startChapter: chapterRange[0] + i,
      completedChapter: null,
      completionNote: undefined,
      progress: 0,
    }));

  return ArcTrackerSchema.parse({
    schemaVersion: 1,
    volumeId: "vol-1",
    volumeTitle,
    chapterRange,
    currentChapter: chapterRange[0] - 1,
    outlineNodes: nodeMatches,
    mainSuspense: {
      hookId: mainSuspenseHookId,
      description: mainSuspenseDescription,
      plantedAt: chapterRange[0],
      currentProgress: 0,
      expectedPayoff: null,
    },
    nextChapterDirection: {
      targetNodeId: nodeMatches[0]?.nodeId ?? null,
      targetProgress: 30,
      tone: "intensify",
    },
  });
}

/** Create an initial FactionLedger for a protagonist. */
export function bootstrapFactionLedger(protagonistName: string): FactionLedger {
  return FactionLedgerSchema.parse({
    schemaVersion: 1,
    factions: {},
    protagonist: {
      name: protagonistName,
      powerLevel: { power: 30, resources: 20, influence: 10, morale: 50 },
      exposureRisk: 0,
      socialCapital: 10,
      recentDeltas: [],
    },
    relationships: [],
  });
}

/** Create an initial MoodArc for a volume. */
export function bootstrapMoodArc(volumeId: string): MoodArc {
  return MoodArcSchema.parse({
    schemaVersion: 1,
    volumeId,
    entries: [],
    arcShape: "alternating",
    arcDescription: "",
    nextChapterMoodTarget: { tension: "up", excitement: "same", warmth: "same", reason: "init" },
  });
}
