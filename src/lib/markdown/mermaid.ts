import mermaid from "mermaid";

let lastTheme: "dark" | "default" | null = null;

export function initMermaid(isDark: boolean): void {
  const theme = isDark ? "dark" : "default";
  if (lastTheme === theme) return;
  lastTheme = theme;

  mermaid.initialize({
    startOnLoad: false,
    theme,
    securityLevel: "strict",
    flowchart: { useMaxWidth: true, htmlLabels: true },
    fontSize: 16,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  });
}

export function hasMermaidBlocks(html: string): boolean {
  return html.includes('class="mermaid"') || html.includes("class='mermaid'");
}

function resetMermaidNode(node: HTMLElement): void {
  const originalCode = node.getAttribute("data-original-code");
  if (originalCode) {
    try {
      node.textContent = decodeURIComponent(originalCode);
    } catch {
      node.textContent = originalCode;
    }
  }
  node.removeAttribute("data-processed");
  node.classList.remove("mermaid-error");
}

export async function renderMermaid(
  container: HTMLElement,
  isDark: boolean,
): Promise<void> {
  const nodes = container.querySelectorAll<HTMLElement>(".mermaid");
  if (nodes.length === 0) return;

  initMermaid(isDark);

  nodes.forEach((node) => {
    resetMermaidNode(node);
    node.closest(".mermaid-container")?.classList.add("is-loading");
  });

  try {
    await mermaid.run({ nodes });
  } catch (err) {
    console.warn("Mermaid rendering failed:", err);
    nodes.forEach((node) => node.classList.add("mermaid-error"));
  } finally {
    container
      .querySelectorAll(".mermaid-container.is-loading")
      .forEach((el) => el.classList.remove("is-loading"));
  }
}

/** Force theme re-init and re-render (e.g. after theme toggle). */
export function forceMermaidTheme(isDark: boolean): void {
  lastTheme = null;
  initMermaid(isDark);
}
