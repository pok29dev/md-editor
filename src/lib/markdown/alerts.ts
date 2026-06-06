const GITHUB_ALERT_MARKER_REGEX =
  /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](?:(?:\s|&nbsp;|<br\s*\/?>)+|$)/i;

const GITHUB_ALERT_META: Record<
  string,
  { label: string; viewBox: string; path: string }
> = {
  note: {
    label: "Note",
    viewBox: "0 0 512 512",
    path: "M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336l24 0 0-64-24 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l48 0c13.3 0 24 10.7 24 24l0 88 8 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-80 0c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z",
  },
  tip: {
    label: "Tip",
    viewBox: "0 0 384 512",
    path: "M297.2 248.9C311.6 228.3 320 203.2 320 176c0-70.7-57.3-128-128-128S64 105.3 64 176c0 27.2 8.4 52.3 22.8 72.9c3.7 5.3 8.1 11.3 12.8 17.7c0 0 0 0 0 0c12.9 17.7 28.3 38.9 39.8 59.8c10.4 19 15.7 38.8 18.3 57.5L109 384c-2.2-12-5.9-23.7-11.8-34.5c-9.9-18-22.2-34.9-34.5-51.8c0 0 0 0 0 0s0 0 0 0c-5.2-7.1-10.4-14.2-15.4-21.4C27.6 247.9 16 213.3 16 176C16 78.8 94.8 0 192 0s176 78.8 176 176c0 37.3-11.6 71.9-31.4 100.3c-5 7.2-10.2 14.3-15.4 21.4c0 0 0 0 0 0s0 0 0 0c-12.3 16.8-24.6 33.7-34.5 51.8c-5.9 10.8-9.6 22.5-11.8 34.5l-48.6 0c2.6-18.7 7.9-38.6 18.3-57.5c11.5-20.9 26.9-42.1 39.8-59.8c0 0 0 0 0 0s0 0 0 0s0 0 0 0c4.7-6.4 9-12.4 12.7-17.7zM192 128c-26.5 0-48 21.5-48 48c0 8.8-7.2 16-16 16s-16-7.2-16-16c0-44.2 35.8-80 80-80c8.8 0 16 7.2 16 16s-7.2 16-16 16zm0 384c-44.2 0-80-35.8-80-80l0-16 160 0 0 16c0 44.2-35.8 80-80 80z",
  },
  important: {
    label: "Important",
    viewBox: "0 0 512 512",
    path: "M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-384c13.3 0 24 10.7 24 24l0 112c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-112c0-13.3 10.7-24 24-24zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z",
  },
  warning: {
    label: "Warning",
    viewBox: "0 0 512 512",
    path: "M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480L40 480c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24l0 112c0 13.3 10.7 24 24 24s24-10.7 24-24l0-112c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z",
  },
  caution: {
    label: "Caution",
    viewBox: "0 0 512 512",
    path: "M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z",
  },
};

export function enhanceGitHubAlerts(container: HTMLElement): void {
  container.querySelectorAll("blockquote").forEach((blockquote) => {
    let firstParagraph: Element | null = null;
    for (const child of blockquote.children) {
      if (child.tagName === "P") {
        firstParagraph = child;
        break;
      }
    }
    if (!firstParagraph) return;

    const firstParagraphHtml = firstParagraph.innerHTML.trim();
    const markerMatch = firstParagraphHtml.match(GITHUB_ALERT_MARKER_REGEX);
    if (!markerMatch) return;

    const alertType = markerMatch[1].toLowerCase();
    blockquote.classList.add("markdown-alert", `markdown-alert-${alertType}`);

    const title = document.createElement("p");
    title.className = "markdown-alert-title";
    const alertMeta = GITHUB_ALERT_META[alertType] ?? {
      label: markerMatch[1],
      viewBox: "",
      path: "",
    };

    const icon = document.createElement("span");
    icon.className = "markdown-alert-icon";
    icon.setAttribute("aria-hidden", "true");

    if (alertMeta.path) {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", alertMeta.viewBox || "0 0 512 512");
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", alertMeta.path);
      svg.appendChild(path);
      icon.appendChild(svg);
    }

    const label = document.createElement("span");
    label.textContent = alertMeta.label;
    title.appendChild(icon);
    title.appendChild(label);
    blockquote.insertBefore(title, blockquote.firstChild);

    const remainingHtml = firstParagraphHtml
      .replace(GITHUB_ALERT_MARKER_REGEX, "")
      .trim();
    if (remainingHtml) {
      firstParagraph.innerHTML = remainingHtml;
    } else {
      firstParagraph.remove();
    }
  });
}
