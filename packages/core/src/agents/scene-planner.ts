import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { BaseAgent } from "./base.js";
import {
  SceneSchema,
  type ScenePlannerInput,
  type ScenePlannerOutput,
  type Scene,
} from "../models/input-governance.js";
import { buildScenePlannerSystemPrompt, buildScenePlannerUserPrompt } from "./scene-planner-prompts.js";

export class ScenePlannerAgent extends BaseAgent {
  get name(): string {
    return "scene-planner";
  }

  async planScenes(input: ScenePlannerInput, runtimeDir: string): Promise<ScenePlannerOutput | null> {
    const lang = input.language ?? "zh";

    const systemPrompt = buildScenePlannerSystemPrompt(lang);
    const userPrompt = buildScenePlannerUserPrompt(input.beatSheet, input.wordCount, lang);

    let response;
    try {
      response = await this.chat([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ], { temperature: 0.3, maxTokens: 4096 });
    } catch (err) {
      this.log?.warn(`[scene-planner] LLM call failed: ${err}`);
      return null;
    }

    // Parse JSON scenes from the response
    let scenes: Scene[] = [];
    const jsonMatch = response.content.match(/```(?:json)?\n?([\s\S]*?)\n?```/)
      ?? response.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1] ?? jsonMatch[0]);
        const arr = Array.isArray(parsed) ? parsed : (parsed.scenes ?? []);
        scenes = arr.map((s: unknown) => SceneSchema.parse(s));
      } catch {
        // fall through — use markdown output
      }
    }

    const scenePlan = response.content;
    const totalScenes = scenes.length;
    const totalTargetWords = scenes.reduce((sum, s) => sum + (s.pacing.wordCountTarget ?? 0), 0);

    // Write to runtime file
    const scenesPath = join(runtimeDir, `chapter-${String(input.chapterNumber).padStart(4, "0")}-scenes.md`);
    await writeFile(scenesPath, scenePlan, "utf-8");

    this.log?.info(`[scene-planner] chapter ${input.chapterNumber}: ${totalScenes} scenes, ~${totalTargetWords} words`);

    return { scenePlan, scenes, totalScenes, totalTargetWords };
  }
}
