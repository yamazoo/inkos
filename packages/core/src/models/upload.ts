import { z } from "zod";
import { PlatformSchema } from "./book.js";

export const UploadChapterStatusSchema = z.enum([
  "pending",
  "uploading",
  "uploaded",
  "failed",
]);
export type UploadChapterStatus = z.infer<typeof UploadChapterStatusSchema>;

export const UploadChapterResultSchema = z.object({
  number: z.number().int().min(1),
  title: z.string(),
  status: UploadChapterStatusSchema,
  uploadedAt: z.string().datetime().optional(),
  url: z.string().optional(),
  error: z.string().optional(),
  retryCount: z.number().int().min(0).default(0),
});
export type UploadChapterResult = z.infer<typeof UploadChapterResultSchema>;

export const SelectorBundleSchema = z.object({
  chapter_no_selectors: z.string(),
  title_selectors: z.string(),
  content_selectors: z.string(),
  publish_button_selectors: z.string(),
  confirm_button_selectors: z.string(),
  next_step_button_selectors: z.string(),
  risk_confirm_selectors: z.string(),
  publish_setting_confirm_selectors: z.string(),
  ai_no_selectors: z.string(),
  schedule_toggle_selectors: z.string(),
  schedule_date_selectors: z.string(),
  schedule_time_selectors: z.string(),
  create_chapter_selectors: z.string(),
  success_text_keywords: z.string(),
  error_text_keywords: z.string(),
});
export type SelectorBundle = z.infer<typeof SelectorBundleSchema>;

export const UploadStateSchema = z.object({
  platform: PlatformSchema,
  lastUploadAt: z.string().datetime().optional(),
  lastUploadChapter: z.number().int().min(0).optional(),
  maxChaptersPerHour: z.number().int().min(1).default(3),
  chapters: z.record(z.string(), UploadChapterResultSchema),
  dailyRemainingChars: z.record(z.string(), z.number()).optional(),
  dailyScheduleSlots: z.record(z.string(), z.number()).optional(),
  calibratedSelectors: SelectorBundleSchema.optional(),
});
export type UploadState = z.infer<typeof UploadStateSchema>;

export interface ChapterContent {
  readonly number: number;
  readonly title: string;
  readonly content: string;
  readonly wordCount: number;
}

export interface UploadResult {
  readonly success: boolean;
  readonly url?: string;
  readonly error?: string;
}
