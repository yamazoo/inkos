import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { ZodSchema } from "zod";
import type { ArcTracker, FactionLedger, HooksState, MoodArc } from "../models/runtime-state.js";
import {
  ArcTrackerSchema,
  FactionLedgerSchema,
  HooksStateSchema,
  MoodArcSchema,
} from "../models/runtime-state.js";

// ── Paths ────────────────────────────────────────────────────────────────────

function stateDir(bookDir: string): string {
  return join(bookDir, "story", "state");
}

function trackerPath(bookDir: string, name: string): string {
  return join(stateDir(bookDir), `${name}.json`);
}

// ── Load / Save ──────────────────────────────────────────────────────────────

export async function loadTracker<T>(
  bookDir: string,
  name: string,
  schema: ZodSchema<T>,
): Promise<T | null> {
  const path = trackerPath(bookDir, name);
  try {
    const raw = await readFile(path, "utf-8");
    return schema.parse(JSON.parse(raw)) as T;
  } catch {
    return null;
  }
}

export async function saveTracker<T extends object>(
  bookDir: string,
  name: string,
  data: T,
): Promise<void> {
  await mkdir(stateDir(bookDir), { recursive: true });
  await writeFile(trackerPath(bookDir, name), JSON.stringify(data, null, 2), "utf-8");
}

// ── Bootstrappers ────────────────────────────────────────────────────────────

export function bootstrapArcTracker(
  volumeTitle: string,
  volumeId: string,
  chapterRange: [number, number],
  mainSuspenseHookId: string,
  mainSuspenseDescription: string,
): ArcTracker {
  return ArcTrackerSchema.parse({
    schemaVersion: 1,
    volumeId,
    volumeTitle,
    chapterRange,
    currentChapter: chapterRange[0] - 1,
    outlineNodes: [],
    mainSuspense: {
      hookId: mainSuspenseHookId,
      description: mainSuspenseDescription,
      plantedAt: chapterRange[0],
      currentProgress: 0,
      expectedPayoff: null,
    },
    nextChapterDirection: {
      targetNodeId: null,
      targetProgress: 0,
      tone: "intensify",
    },
  });
}

export function bootstrapFactionLedger(protagonistName: string): FactionLedger {
  return FactionLedgerSchema.parse({
    schemaVersion: 1,
    factions: {},
    protagonist: {
      name: protagonistName,
      powerLevel: { power: 50, resources: 50, influence: 50, morale: 50 },
      exposureRisk: 0,
      socialCapital: 50,
      recentDeltas: [],
    },
    relationships: [],
  });
}

export function bootstrapMoodArc(volumeId: string): MoodArc {
  return MoodArcSchema.parse({
    schemaVersion: 1,
    volumeId,
    entries: [],
    arcShape: "escalating",
    arcDescription: "",
    nextChapterMoodTarget: {
      tension: "up",
      excitement: "up",
      warmth: "same",
      reason: "",
    },
  });
}

export function bootstrapHookLedger(): HooksState {
  return HooksStateSchema.parse({ hooks: [] });
}
