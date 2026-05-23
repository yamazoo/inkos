import { BaseAgent } from "./base.js";
import type { RadarSource, PlatformRankings } from "./radar-source.js";
import { FanqieRadarSource } from "./radar-source.js";
import { PackageResultSchema, type PackageResult } from "../models/packaging.js";
import {
  buildPackagerSystemPrompt,
  buildPackagerUserPrompt,
} from "./packager-prompts.js";
import { BUILTIN_PATTERNS } from "./packager-fallback-patterns.js";

export interface PackagerGenerateParams {
  readonly bookTitle: string;
  readonly genre: string;
  readonly currentSynopsis?: string;
  readonly count: number;
}

const DEFAULT_SOURCES: ReadonlyArray<RadarSource> = [new FanqieRadarSource()];

function formatCompetitivePatterns(rankings: ReadonlyArray<PlatformRankings>): string {
  const sections = rankings
    .filter((r) => r.entries.length > 0)
    .map((r) => {
      const lines = r.entries.map(
        (e) =>
          `- 「${e.title}」${e.author ? ` · ${e.author}` : ""}${e.category ? ` [${e.category}]` : ""} ${e.extra}`,
      );
      return `### ${r.platform} 热门标题\n${lines.join("\n")}`;
    });

  return sections.length > 0
    ? sections.join("\n\n")
    : "（未能获取到竞品标题数据，请基于你的网文市场知识分析）";
}

function formatBookDetails(
  titles: ReadonlyArray<string>,
  synopses: ReadonlyArray<string>,
): string {
  const lines = titles.map((title, i) => {
    const synopsis = synopses[i] ?? "";
    return synopsis
      ? `- 「${title}」— ${synopsis}`
      : `- 「${title}」`;
  });
  return `### 番茄小说热门榜（标题+简介）\n${lines.join("\n")}`;
}

function formatBuiltInPatterns(patterns: Record<string, unknown>): string | null {
  const sections: string[] = [];

  const patternGroups = patterns.patterns as Record<string, string[]> | undefined;
  if (patternGroups) {
    for (const [group, templates] of Object.entries(patternGroups)) {
      if (Array.isArray(templates) && templates.length > 0) {
        sections.push(`### ${group}\n${templates.map((t) => `- ${t}`).join("\n")}`);
      }
    }
  }

  const examples = patterns.exampleTitles as string[] | undefined;
  if (examples && examples.length > 0) {
    sections.push(`### 高 CTR 标题案例\n${examples.map((t) => `- ${t}`).join("\n")}`);
  }

  const synopsisPatterns = patterns.synopsisPatterns as string[] | undefined;
  if (synopsisPatterns && synopsisPatterns.length > 0) {
    sections.push(`### 简介结构模板\n${synopsisPatterns.map((t) => `- ${t}`).join("\n")}`);
  }

  return sections.length > 0 ? sections.join("\n\n") : null;
}

export class PackagerAgent extends BaseAgent {
  private readonly sources: ReadonlyArray<RadarSource>;

  constructor(
    ctx: ConstructorParameters<typeof BaseAgent>[0],
    sources?: ReadonlyArray<RadarSource>,
  ) {
    super(ctx);
    this.sources = sources ?? DEFAULT_SOURCES;
  }

  get name(): string {
    return "packager";
  }

  async generate(params: PackagerGenerateParams): Promise<PackageResult> {
    const competitivePatterns = await this.fetchCompetitivePatterns(params.genre);

    const systemPrompt = buildPackagerSystemPrompt();
    const userPrompt = buildPackagerUserPrompt({
      bookTitle: params.bookTitle,
      genre: params.genre,
      currentSynopsis: params.currentSynopsis,
      competitivePatterns,
      count: params.count,
    });

    const response = await this.chat(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      { temperature: 0.7 },
    );

    return this.parseResult(response.content);
  }

  private async fetchCompetitivePatterns(genre: string): Promise<string> {
    // 1. Try fetchBookDetails for rich title+synopsis data
    for (const source of this.sources) {
      if (source instanceof FanqieRadarSource) {
        try {
          const details = await source.fetchBookDetails(genre);
          if (details.titles.length > 0) {
            return formatBookDetails(details.titles, details.synopses);
          }
        } catch {
          // fall through to next strategy
        }
      }
    }

    // 2. Use built-in patterns (imported constant, no filesystem access)
    const formatted = formatBuiltInPatterns(BUILTIN_PATTERNS as unknown as Record<string, unknown>);
    if (formatted) return formatted;

    // 3. Fallback: generic competitive patterns from fetch()
    const results = await Promise.allSettled(this.sources.map((s) => s.fetch()));

    const rankings: PlatformRankings[] = [];
    for (const result of results) {
      if (result.status === "fulfilled") {
        rankings.push(result.value);
      }
    }

    return formatCompetitivePatterns(rankings);
  }

  private parseResult(content: string): PackageResult {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error(
        "PackagerAgent output format error: no JSON found in LLM response",
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return PackageResultSchema.parse(parsed);
  }
}
