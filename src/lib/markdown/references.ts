export interface ReferenceDefinition {
  url: string;
  title: string;
}

export interface ReferenceData {
  definitions: Map<number, ReferenceDefinition>;
  cleanedMarkdown: string;
}

const DEFINITION_RE =
  /^\[(\d+)\]:\s*(?:<([^>\s]+)>|(\S+))(?:\s+(?:"([^"]*)"|'([^']*)'|\(([^)]+)\)))?\s*$/gm;

export function extractReferenceDefinitions(markdown: string): ReferenceData {
  const definitions = new Map<number, ReferenceDefinition>();

  const cleanedMarkdown = markdown.replace(
    DEFINITION_RE,
    (match, numberText, angleUrl, plainUrl, titleDouble, titleSingle, titleParen) => {
      const number = parseInt(numberText, 10);
      if (Number.isNaN(number)) return match;
      const url = (angleUrl || plainUrl || "").trim();
      if (!url) return match;
      const title = titleDouble || titleSingle || titleParen || "";
      definitions.set(number, { url, title });
      return "";
    },
  );

  return { definitions, cleanedMarkdown };
}

function isSafeReferenceUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url, window.location.href);
    return ["http:", "https:", "mailto:", "tel:", "blob:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function applyReferencePreviewLinks(
  container: HTMLElement,
  referenceDefinitions: Map<number, ReferenceDefinition>,
): void {
  if (!container || referenceDefinitions.size === 0) return;

  function applyReferenceStyle(link: HTMLAnchorElement, number: number): void {
    const definition = referenceDefinitions.get(number);
    if (definition?.url && isSafeReferenceUrl(definition.url)) {
      link.setAttribute("href", definition.url);
      if (definition.title) {
        link.setAttribute("title", definition.title);
      } else {
        link.removeAttribute("title");
      }
    } else {
      link.removeAttribute("href");
    }
    link.textContent = `[${number}]`;
    link.classList.add("reference-link");
  }

  container.querySelectorAll("a").forEach((link) => {
    const text = link.textContent?.trim() ?? "";
    let number: number | null = null;

    if (/^\d+$/.test(text)) {
      number = parseInt(text, 10);
    } else {
      const bracketMatch = /^\[(\d+)\]$/.exec(text);
      if (bracketMatch) number = parseInt(bracketMatch[1], 10);
    }

    if (number !== null && referenceDefinitions.has(number)) {
      applyReferenceStyle(link as HTMLAnchorElement, number);
    }
  });
}
