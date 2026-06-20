const PLACEHOLDER_PREFIX = "\x00MDN_";

export interface ProtectedBlocks {
  text: string;
  blocks: string[];
}

function makePlaceholder(index: number): string {
  return `${PLACEHOLDER_PREFIX}${index}\x00`;
}

function protectFrontmatter(text: string, blocks: string[]): string {
  const match = text.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  if (!match) return text;

  const placeholder = makePlaceholder(blocks.length);
  blocks.push(match[0]);
  return text.slice(0, match.index!) + placeholder + text.slice(match.index! + match[0].length);
}

function protectHtmlComments(text: string, blocks: string[]): string {
  return text.replace(/<!--[\s\S]*?-->/g, (block) => {
    const placeholder = makePlaceholder(blocks.length);
    blocks.push(block);
    return placeholder;
  });
}

function protectMathBlocks(text: string, blocks: string[]): string {
  let result = "";
  let index = 0;

  while (index < text.length) {
    const start = text.indexOf("$$", index);
    if (start === -1) {
      result += text.slice(index);
      break;
    }

    result += text.slice(index, start);
    const end = text.indexOf("$$", start + 2);
    if (end === -1) {
      result += text.slice(start);
      break;
    }

    const block = text.slice(start, end + 2);
    const placeholder = makePlaceholder(blocks.length);
    blocks.push(block);
    result += placeholder;
    index = end + 2;
  }

  return result;
}

function protectFencedCode(text: string, blocks: string[]): string {
  const lines = text.split("\n");
  const out: string[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const fenceMatch = line.match(/^(`{3,}|~{3,})(.*)$/);

    if (!fenceMatch) {
      out.push(line);
      index += 1;
      continue;
    }

    const fence = fenceMatch[1];
    const blockLines = [line];
    index += 1;

    while (index < lines.length) {
      blockLines.push(lines[index]);
      if (new RegExp(`^${fence}\\s*$`).test(lines[index])) {
        index += 1;
        break;
      }
      index += 1;
    }

    const placeholder = makePlaceholder(blocks.length);
    blocks.push(blockLines.join("\n"));
    out.push(placeholder);
  }

  return out.join("\n");
}

export function protectBlocks(text: string): ProtectedBlocks {
  const blocks: string[] = [];
  let working = text;
  working = protectFrontmatter(working, blocks);
  working = protectFencedCode(working, blocks);
  working = protectMathBlocks(working, blocks);
  working = protectHtmlComments(working, blocks);
  return { text: working, blocks };
}

export function restoreBlocks(text: string, blocks: string[]): string {
  let result = text;
  for (let index = 0; index < blocks.length; index += 1) {
    result = result.replace(makePlaceholder(index), () => blocks[index]);
  }
  return result;
}
