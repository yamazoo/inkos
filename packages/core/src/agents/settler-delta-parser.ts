import {
  RuntimeStateDeltaSchema,
  type RuntimeStateDelta,
} from "../models/runtime-state.js";
import {
  TimelineDeltaSchema,
  type TimelineDelta,
} from "../models/timeline.js";

export interface SettlerDeltaOutput {
  readonly postSettlement: string;
  readonly runtimeStateDelta: RuntimeStateDelta;
  readonly timelineDelta?: TimelineDelta;
}

function sanitizeJSON(str: string): string {
  return str
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .replace(/,\s*([}\]])/g, "$1");
}

export function parseSettlerDeltaOutput(content: string): SettlerDeltaOutput {
  const extract = (tag: string): string => {
    const regex = new RegExp(
      `=== ${tag} ===\\s*([\\s\\S]*?)(?==== [A-Z_]+ ===|$)`,
    );
    const match = content.match(regex);
    return match?.[1]?.trim() ?? "";
  };

  const rawDelta = extract("RUNTIME_STATE_DELTA");
  if (!rawDelta) {
    throw new Error("runtime state delta block is missing");
  }

  const jsonPayload = stripCodeFence(rawDelta);
  let parsed: unknown;
  try {
    parsed = JSON.parse(sanitizeJSON(jsonPayload));
  } catch (error) {
    throw new Error(`runtime state delta is not valid JSON: ${String(error)}`);
  }

  let runtimeStateDelta: RuntimeStateDelta;
  try {
    runtimeStateDelta = RuntimeStateDeltaSchema.parse(parsed);
  } catch (error) {
    throw new Error(`runtime state delta failed schema validation: ${String(error)}`);
  }

  let timelineDelta: TimelineDelta | undefined;
  const rawTimeline = extract("TIMELINE");
  if (rawTimeline) {
    try {
      const timelinePayload = stripCodeFence(rawTimeline);
      timelineDelta = TimelineDeltaSchema.parse(
        JSON.parse(sanitizeJSON(timelinePayload)),
      );
    } catch (err) {
      // TIMELINE block is optional — log but don't fail the entire parse
      // eslint-disable-next-line no-console
      console.warn(
        `[settler-delta-parser] TIMELINE block parse failed, ignoring: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  return {
    postSettlement: extract("POST_SETTLEMENT"),
    runtimeStateDelta,
    timelineDelta,
  };
}

function stripCodeFence(value: string): string {
  const trimmed = value.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced?.[1]?.trim() ?? trimmed;
}
