import { useAppStore } from "../../stores/appStore";
import { AutoThemeIcon, MoonIcon, SunIcon } from "../icons/ThemeIcons";

const THEME_ORDER = ["system", "light", "dark"] as const;

const THEME_TITLES: Record<(typeof THEME_ORDER)[number], string> = {
  system: "Theme: Auto (follow system)",
  light: "Theme: Light",
  dark: "Theme: Dark",
};

interface ThemeToggleProps {
  variant?: "window" | "tab";
}

export function ThemeToggle({ variant = "tab" }: ThemeToggleProps) {
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);

  const cycleTheme = () => {
    const idx = THEME_ORDER.indexOf(theme);
    setTheme(THEME_ORDER[(idx + 1) % THEME_ORDER.length]);
  };

  const Icon =
    theme === "system" ? AutoThemeIcon : theme === "dark" ? MoonIcon : SunIcon;

  const className =
    variant === "window"
      ? "window-titlebar-theme-toggle"
      : "titlebar-theme-toggle";

  return (
    <button
      type="button"
      className={className}
      title={THEME_TITLES[theme]}
      aria-label={THEME_TITLES[theme]}
      onClick={cycleTheme}
    >
      <Icon />

      {variant === "tab" && (
        <style>{`
          .titlebar-theme-toggle {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 100%;
            flex-shrink: 0;
            padding: 0;
            border: none;
            border-left: 1px solid var(--border);
            background: var(--bg-secondary);
            color: var(--text-secondary);
          }
          .titlebar-theme-toggle:hover {
            background: var(--bg-hover);
            color: var(--text-primary);
          }
        `}</style>
      )}
    </button>
  );
}
