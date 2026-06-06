interface IconProps {
  className?: string;
}

/** Sidebar open — click to hide (panel with left pane). */
export function PanelLeftCloseIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      aria-hidden
    >
      <rect
        x="1.5"
        y="2.5"
        width="13"
        height="11"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <rect x="2.5" y="3.5" width="3.5" height="9" rx="0.5" fill="currentColor" />
    </svg>
  );
}

/** Sidebar hidden — click to show. */
export function PanelLeftOpenIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      aria-hidden
    >
      <rect
        x="1.5"
        y="2.5"
        width="13"
        height="11"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <rect x="2.5" y="3.5" width="2" height="9" rx="0.5" fill="currentColor" />
    </svg>
  );
}
