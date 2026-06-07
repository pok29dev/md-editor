import { useAppStore } from "../../stores/appStore";
import { COLOR_SCHEME_ORDER } from "../../lib/theme/types";
import { getColorSchemeIcons } from "../../lib/theme/icons";

const COLOR_SCHEME_TITLES = {
  system: "Color scheme: System",
  light: "Color scheme: Light",
  dark: "Color scheme: Dark",
} as const;

interface ColorSchemeToggleProps {
  variant?: "window" | "tab";
}

export function ColorSchemeToggle({ variant = "tab" }: ColorSchemeToggleProps) {
  const colorScheme = useAppStore((s) => s.colorScheme);
  const appTheme = useAppStore((s) => s.theme);
  const setColorScheme = useAppStore((s) => s.setColorScheme);

  const icons = getColorSchemeIcons(appTheme);

  const cycleColorScheme = () => {
    const idx = COLOR_SCHEME_ORDER.indexOf(colorScheme);
    setColorScheme(COLOR_SCHEME_ORDER[(idx + 1) % COLOR_SCHEME_ORDER.length]);
  };

  const Icon =
    colorScheme === "system"
      ? icons.AutoColorSchemeIcon
      : colorScheme === "dark"
        ? icons.MoonIcon
        : icons.SunIcon;

  const className =
    variant === "window"
      ? "window-titlebar-color-scheme-toggle"
      : "titlebar-color-scheme-toggle";

  return (
    <button
      type="button"
      className={className}
      title={COLOR_SCHEME_TITLES[colorScheme]}
      aria-label={COLOR_SCHEME_TITLES[colorScheme]}
      onClick={cycleColorScheme}
    >
      <Icon />

      {variant === "tab" && (
        <style>{`
          .titlebar-color-scheme-toggle {
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
          .titlebar-color-scheme-toggle:hover {
            background: var(--bg-hover);
            color: var(--text-primary);
          }
        `}</style>
      )}
    </button>
  );
}
