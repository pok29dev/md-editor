const LONE_DOT_LINE = /^\.\s*$/;
const MARKDOWN_HEADING = /^#{1,6}\s/;
const HORIZONTAL_RULE = /^-{3,}\s*$/;
const MARKDOWN_LIST = /^(\*|-|\+|\d+\.)\s/;
const MARKDOWN_BLOCKQUOTE = /^>\s/;
const FENCE_LINE = /^(`{3,}|~{3,})/;
const OWN_LINE_CODE = /^`([^`]+)`\s*$/;
const ENV_LINE = /^[A-Z][A-Z0-9_]*=.*$/;
const BLOCKQUOTE_EQUALS =
  /^(`[^`]+`|[\w.`-]+)\s*=\s*.+/;
const EMOJI_LEADING =
  /^((?:[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]|[\uD800-\uDBFF][\uDC00-\uDFFF])+)\s*(.+)$/u;
const SPARKLE_LINE = /^✨\s*(.+)$/;
const TIPS_HEADER = /^ทริค.*:$/;
const BENEFITS_HEADER = /^ข้อดีของ/;
const QUESTION_LINE = /^.+\?\s*$/;
const NEGATIVE_SECTION = /(?:แทนที่จะเขียน|\(อันตราย)/;
const POSITIVE_SECTION = /^เราเขียนแค่/;

function isStructuredLine(line: string): boolean {
  const trimmed = line.trim();
  return (
    MARKDOWN_HEADING.test(trimmed) ||
    HORIZONTAL_RULE.test(trimmed) ||
    MARKDOWN_LIST.test(trimmed) ||
    MARKDOWN_BLOCKQUOTE.test(trimmed) ||
    FENCE_LINE.test(trimmed)
  );
}

function detectCodeLanguage(code: string): string {
  const trimmed = code.trim();
  if (/^(const|let|var|function|import|export|class)\b/.test(trimmed)) {
    return "javascript";
  }
  if (/^[A-Z][A-Z0-9_]*=/.test(trimmed)) {
    return "env";
  }
  return "";
}

function formatEmojiListItem(emoji: string, text: string): string {
  const label = text.trim();
  if (
    label.length <= 32 &&
    !/[.!?;:]$/.test(label) &&
    !label.includes("http")
  ) {
    return `* ${emoji} **${label}**`;
  }
  return `* ${emoji} ${label}`;
}

function formatSectionHeading(prefix: string, line: string): string {
  const trimmed = line.trim();
  if (trimmed.startsWith("###")) {
    return trimmed;
  }
  if (trimmed.startsWith(prefix)) {
    return `### ${trimmed}`;
  }
  return `### ${prefix} ${trimmed}`;
}

function collectEnvBlock(lines: string[], start: number): { block: string; next: number } {
  const envLines: string[] = [];
  let index = start;

  while (index < lines.length) {
    const trimmed = lines[index].trim();
    if (!trimmed) {
      if (envLines.length > 0) break;
      index += 1;
      continue;
    }
    if (!ENV_LINE.test(trimmed)) break;
    envLines.push(trimmed);
    index += 1;
  }

  return {
    block: ["```env", ...envLines, "```"].join("\n"),
    next: index,
  };
}

function formatOwnLineCode(code: string): string {
  const language = detectCodeLanguage(code);
  if (language) {
    return ["```" + language, code.trim(), "```"].join("\n");
  }
  return ["```", code.trim(), "```"].join("\n");
}

function shouldMergeParagraph(current: string, next: string): boolean {
  const currentTrim = current.trim();
  const nextTrim = next.trim();
  if (!currentTrim || !nextTrim) return false;
  if (isStructuredLine(currentTrim) || isStructuredLine(nextTrim)) return false;
  if (LONE_DOT_LINE.test(nextTrim)) return false;
  if (OWN_LINE_CODE.test(nextTrim)) return false;
  if (BLOCKQUOTE_EQUALS.test(nextTrim)) return false;
  if (EMOJI_LEADING.test(nextTrim) || SPARKLE_LINE.test(nextTrim)) return false;
  if (/[:?]$/.test(currentTrim)) return false;
  if (/^(ที่|แล้ว|และ|ซึ่ง|โดย|เช่น)\s/.test(nextTrim)) return true;
  return false;
}

function copyFenceBlock(lines: string[], start: number): { block: string; next: number } {
  const fenceMatch = lines[start].trim().match(FENCE_LINE);
  const fence = fenceMatch![1];
  const blockLines = [lines[start]];
  let index = start + 1;

  while (index < lines.length) {
    blockLines.push(lines[index]);
    if (new RegExp(`^${fence}\\s*$`).test(lines[index].trim())) {
      index += 1;
      break;
    }
    index += 1;
  }

  return { block: blockLines.join("\n"), next: index };
}

export function structureSocialPost(text: string): string {
  if (!text.trim()) return text;

  const lines = text.split("\n");
  const output: string[] = [];
  let index = 0;
  let titleApplied = false;
  let inTipsSection = false;
  let tipItemCount = 0;

  while (index < lines.length) {
    const rawLine = lines[index];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      output.push("");
      index += 1;
      continue;
    }

    if (FENCE_LINE.test(trimmed)) {
      inTipsSection = false;
      const { block, next } = copyFenceBlock(lines, index);
      output.push(block);
      index = next;
      continue;
    }

    if (isStructuredLine(trimmed)) {
      if (MARKDOWN_HEADING.test(trimmed)) {
        titleApplied = true;
      }
      inTipsSection = false;
      output.push(trimmed);
      index += 1;
      continue;
    }

    if (LONE_DOT_LINE.test(trimmed)) {
      inTipsSection = false;
      tipItemCount = 0;
      output.push("---");
      index += 1;
      continue;
    }

    if (ENV_LINE.test(trimmed)) {
      inTipsSection = false;
      const { block, next } = collectEnvBlock(lines, index);
      output.push(block);
      index = next;
      continue;
    }

    if (OWN_LINE_CODE.test(trimmed)) {
      inTipsSection = false;
      output.push(formatOwnLineCode(trimmed.match(OWN_LINE_CODE)![1]));
      index += 1;
      continue;
    }

    if (!titleApplied) {
      titleApplied = true;
      output.push(`## ${trimmed}`);
      index += 1;
      continue;
    }

    if (BLOCKQUOTE_EQUALS.test(trimmed)) {
      inTipsSection = false;
      output.push(`> **${trimmed}**`);
      index += 1;
      continue;
    }

    if (TIPS_HEADER.test(trimmed)) {
      inTipsSection = true;
      tipItemCount = 0;
      output.push(formatSectionHeading("💡", trimmed));
      index += 1;
      continue;
    }

    if (inTipsSection) {
      if (/^พูดง่าย/.test(trimmed) || /^เช่น$/.test(trimmed)) {
        inTipsSection = false;
      } else {
        tipItemCount += 1;
        const item = trimmed.startsWith("อย่า") ? `**${trimmed}**` : trimmed;
        output.push(`${tipItemCount}. ${item}`);
        index += 1;
        continue;
      }
    }

    if (BENEFITS_HEADER.test(trimmed)) {
      inTipsSection = false;
      output.push(formatSectionHeading("✨", trimmed));
      index += 1;
      continue;
    }

    if (NEGATIVE_SECTION.test(trimmed)) {
      inTipsSection = false;
      output.push(formatSectionHeading("❌", trimmed));
      index += 1;
      continue;
    }

    if (POSITIVE_SECTION.test(trimmed)) {
      inTipsSection = false;
      output.push(formatSectionHeading("✅", trimmed));
      index += 1;
      continue;
    }

    if (QUESTION_LINE.test(trimmed) && trimmed.length <= 80) {
      inTipsSection = false;
      output.push(formatSectionHeading("🤔", trimmed));
      index += 1;
      continue;
    }

    const sparkleMatch = trimmed.match(SPARKLE_LINE);
    if (sparkleMatch) {
      output.push(`* ${sparkleMatch[1].trim()}`);
      index += 1;
      continue;
    }

    const emojiMatch = trimmed.match(EMOJI_LEADING);
    if (emojiMatch && emojiMatch[1] !== "✨") {
      output.push(formatEmojiListItem(emojiMatch[1], emojiMatch[2]));
      index += 1;
      continue;
    }

    if (
      index + 1 < lines.length &&
      shouldMergeParagraph(trimmed, lines[index + 1].trim())
    ) {
      let merged = trimmed;
      let nextIndex = index + 1;
      while (
        nextIndex < lines.length &&
        shouldMergeParagraph(merged, lines[nextIndex].trim())
      ) {
        merged = `${merged} ${lines[nextIndex].trim()}`;
        nextIndex += 1;
      }
      output.push(merged);
      index = nextIndex;
      continue;
    }

    output.push(trimmed);
    index += 1;
  }

  return output.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd();
}
