/**
 * Strip LLM thinking/reasoning blocks from text output.
 *
 * Models sometimes emit extended-thinking content as literal XML tags
 * (<think>, <thought>, <thinking>) in the text response instead of using
 * the structured reasoning_content API field. This utility removes them.
 */
export function stripThinkBlocks(text: string): string {
  // Step 1: Strip properly closed blocks
  let cleaned = text.replace(/<think>[\s\S]*?<\/think>/gi, "");
  cleaned = cleaned.replace(/<thought>[\s\S]*?<\/thought>/gi, "");
  cleaned = cleaned.replace(/<thinking>[\s\S]*?<\/thinking>/gi, "");

  // Step 2: Strip orphaned closing tags BEFORE unclosed-block removal.
  // Order matters: `<think>` matches both opening and closing tags. The
  // unclosed-block regex `<think>[\s\S]*$` would consume everything after
  // an orphaned `</think>` (treating it as an opening tag). Stripping
  // orphans first prevents this false match.
  //
  // Uses a replacer to check if `<think>` appears on the same line before
  // the closing tag — if yes, it's a closed pair fragment (keep); if no,
  // it's an orphaned closing tag from provider-level cleanup (remove).
  cleaned = cleaned.replace(/<\/think>/gi, (match, offset) => {
    const lineStart = cleaned.lastIndexOf("\n", offset);
    const preceding = cleaned.slice(lineStart + 1, offset);
    if (/<think/i.test(preceding)) return match;
    return "";
  });
  cleaned = cleaned.replace(/<\/thought>/gi, "");
  cleaned = cleaned.replace(/<\/thinking>/gi, "");

  // Step 3: Strip unclosed opening blocks (model truncated before closing tag).
  // After orphan removal above, any remaining `<think>` is an actual opening tag.
  cleaned = cleaned.replace(/<think>[\s\S]*$/g, "");
  cleaned = cleaned.replace(/<thought>[\s\S]*$/g, "");
  cleaned = cleaned.replace(/<thinking>[\s\S]*$/g, "");
  return cleaned;
}
