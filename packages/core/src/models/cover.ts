import { z } from "zod";

/** Cover prompt constraints for Doubao web UI (600x800px) */
export const COVER_TITLE_MIN = 5;
export const COVER_TITLE_MAX = 30;
export const COVER_PROMPT_MIN = 100;
export const COVER_PROMPT_MAX = 600;
export const COVER_SYNOPSIS_MIN = 30;
export const COVER_SYNOPSIS_MAX = 200;
export const COVER_CANDIDATE_COUNT = 6;

/** A single cover candidate (title variant + Doubao prompt + hook synopsis) */
export const CoverCandidateSchema = z.object({
  index: z.number().int().min(1).max(COVER_CANDIDATE_COUNT),
  title: z.string().min(COVER_TITLE_MIN).max(COVER_TITLE_MAX),
  coverPrompt: z.string().min(COVER_PROMPT_MIN).max(COVER_PROMPT_MAX),
  synopsis: z.string().min(COVER_SYNOPSIS_MIN).max(COVER_SYNOPSIS_MAX),
  styleTag: z.string().min(1),
});
export type CoverCandidate = z.infer<typeof CoverCandidateSchema>;

/** Structured output from CoverAgent */
export const CoverOutputSchema = z.object({
  bookId: z.string().min(1),
  generatedAt: z.string().datetime(),
  candidates: z.array(CoverCandidateSchema).length(COVER_CANDIDATE_COUNT),
});
export type CoverOutput = z.infer<typeof CoverOutputSchema>;
