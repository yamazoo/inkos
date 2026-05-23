import { z } from "zod";

/** Tomato platform character limits (verify against current Tomato UI) */
export const TOMATO_TITLE_MAX = 30;
export const TOMATO_SYNOPSIS_MAX = 200;

/** LLM-as-judge scoring dimensions for title/synopsis quality */
export const PackageScoreSchema = z.object({
  suspense: z.number().min(0).max(10),
  genreClarity: z.number().min(0).max(10),
  contentAlignment: z.number().min(0).max(10),
});
export type PackageScore = z.infer<typeof PackageScoreSchema>;

/** A single packaging candidate (title + synopsis + score) */
export const PackageCandidateSchema = z.object({
  title: z.string().min(1).max(TOMATO_TITLE_MAX),
  synopsis: z.string().min(1).max(TOMATO_SYNOPSIS_MAX),
  score: PackageScoreSchema,
});
export type PackageCandidate = z.infer<typeof PackageCandidateSchema>;

/** Structured output from PackagerAgent */
export const PackageResultSchema = z.object({
  candidates: z.array(PackageCandidateSchema).min(1),
  genre: z.string().min(1),
  sourcePatternSummary: z.string(),
});
export type PackageResult = z.infer<typeof PackageResultSchema>;

/** Persisted packaging candidates for a book */
export const PackageCandidatesStateSchema = z.object({
  bookId: z.string().min(1),
  generatedAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  candidates: z.array(PackageCandidateSchema),
  genre: z.string().min(1),
  sourcePatternSummary: z.string(),
});
export type PackageCandidatesState = z.infer<typeof PackageCandidatesStateSchema>;
