let mathJaxLoading: Promise<void> | null = null;

declare global {
  interface Window {
    MathJax?: {
      startup: { promise: Promise<void> };
      typesetPromise: (elements?: HTMLElement[]) => Promise<void>;
    };
  }
}

const MATHJAX_SCRIPT = `${import.meta.env.BASE_URL}mathjax/tex-mml-chtml.js`;

function loadMathJax(): Promise<void> {
  if (window.MathJax?.startup?.promise) {
    return window.MathJax.startup.promise;
  }
  if (mathJaxLoading) return mathJaxLoading;

  mathJaxLoading = new Promise((resolve, reject) => {
    (window as unknown as Record<string, unknown>).MathJax = {
      tex: {
        inlineMath: [
          ["$", "$"],
          ["\\(", "\\)"],
        ],
        displayMath: [
          ["$$", "$$"],
          ["\\[", "\\]"],
        ],
        processEscapes: true,
      },
      options: {
        skipHtmlTags: [
          "script",
          "noscript",
          "style",
          "textarea",
          "pre",
          "code",
        ],
      },
      startup: {
        typeset: false,
      },
    };

    const script = document.createElement("script");
    script.src = MATHJAX_SCRIPT;
    script.async = true;
    script.onload = () => {
      window.MathJax?.startup.promise.then(resolve).catch(reject);
    };
    script.onerror = () => reject(new Error("Failed to load MathJax"));
    document.head.appendChild(script);
  });

  return mathJaxLoading;
}

export function hasMathContent(text: string): boolean {
  return /\$\$[\s\S]+?\$\$|\$[^$\n]+?\$|\\\(|\\\[/.test(text);
}

export async function renderMathJax(container: HTMLElement): Promise<void> {
  const text = container.textContent ?? "";
  if (!hasMathContent(text)) return;

  try {
    await loadMathJax();
    await window.MathJax?.typesetPromise([container]);
  } catch {
    // MathJax unavailable — preview still works without math
  }
}
