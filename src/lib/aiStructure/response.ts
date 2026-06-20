function isThclawsNoiseLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  return (
    trimmed.startsWith("[mcp]") ||
    trimmed.includes(" tool(s)") ||
    trimmed.startsWith("[retry ") ||
    (trimmed.startsWith("The user ") && trimmed.includes("want")) ||
    trimmed.startsWith("Let me ") ||
    trimmed.startsWith("I'll ") ||
    trimmed.startsWith("I will ") ||
    trimmed.startsWith("I need to ")
  );
}

function isMarkdownContentLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  return (
    trimmed.startsWith("#") ||
    trimmed.startsWith(">") ||
    trimmed.startsWith("- ") ||
    trimmed.startsWith("* ") ||
    trimmed.startsWith("+ ") ||
    trimmed.startsWith("```") ||
    trimmed.startsWith("|") ||
    trimmed.startsWith("---") ||
    /^\d+[.)]\s/.test(trimmed)
  );
}

function stripLeadingNoise(text: string): string {
  const lines = text.split("\n");
  const start = lines.findIndex((line) => isMarkdownContentLine(line));
  if (start >= 0) {
    return lines.slice(start).join("\n").trim();
  }

  const kept: string[] = [];
  let skipping = true;
  for (const line of lines) {
    if (skipping) {
      if (isThclawsNoiseLine(line) || !line.trim()) continue;
      skipping = false;
    }
    kept.push(line);
  }
  return kept.join("\n").trim();
}

export function extractMarkdownResponse(text: string): string {
  const cleaned = text.trim();
  const fencedMarkdown = cleaned.match(/^```(?:markdown|md)\n([\s\S]*?)\n```$/);
  if (fencedMarkdown) {
    return stripLeadingNoise(fencedMarkdown[1]);
  }
  if (cleaned.startsWith("```") && cleaned.endsWith("```")) {
    const inner = cleaned.slice(3, -3);
    const firstNewline = inner.indexOf("\n");
    if (firstNewline >= 0) {
      return stripLeadingNoise(inner.slice(firstNewline + 1));
    }
  }
  return stripLeadingNoise(cleaned);
}
