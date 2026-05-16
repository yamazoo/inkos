/**
 * Sanitize a chapter title for use in filenames.
 * Strips OS-unsafe characters, replaces whitespace with underscores,
 * and truncates to 50 characters.
 */
export function sanitizeFilename(title: string): string {
  return title
    .replace(/[/\\?%*:|"<>=]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 50);
}
