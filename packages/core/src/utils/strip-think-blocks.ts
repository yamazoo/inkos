/**
 * Strip LLM thinking/reasoning blocks from text output.
 *
 * Models sometimes emit extended-thinking content as literal XML tags
 * (<think>, <thought>, <thinking>) in the text response instead of using
 * the structured reasoning_content API field. This utility removes them.
 */
export function stripThinkBlocks(text: string): string {
  // Handle unclosed <think> ... </think> (with closing tag)
  let cleaned = text.replace(/<think>[\s\S]*?<\/think>/gi, "");
  // Handle unclosed <think> blocks (model truncated before closing tag)
  cleaned = cleaned.replace(/<think>[\s\S]*$/g, "");
  // Handle <thought>...</thought> blocks
  cleaned = cleaned.replace(/<thought>[\s\S]*?<\/thought>/gi, "");
  cleaned = cleaned.replace(/<thought>[\s\S]*$/g, "");
  // Handle <thinking>...</thinking> blocks
  cleaned = cleaned.replace(/<thinking>[\s\S]*?<\/thinking>/gi, "");
  cleaned = cleaned.replace(/<thinking>[\s\S]*$/g, "");
  return cleaned;
}
