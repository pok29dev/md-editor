interface IconProps {
  className?: string;
}

export function SunIcon({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" aria-hidden>
      <circle cx="8" cy="8" r="3" fill="currentColor" />
      <path
        d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MoonIcon({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" aria-hidden>
      <path
        d="M11.2 2.4a5.6 5.6 0 1 0 2.4 9.6A4.8 4.8 0 1 1 11.2 2.4z"
        fill="currentColor"
      />
    </svg>
  );
}

/** System / auto theme — half sun, half moon. */
export function AutoThemeIcon({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" aria-hidden>
      <circle cx="5.5" cy="8" r="2.2" fill="currentColor" />
      <path
        d="M5.5 3.5v1M5.5 11.5v1M2.5 8h1M8.5 8h1"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <path
        d="M11.5 3.8a4 4 0 1 0 1.8 6.8A3.4 3.4 0 1 1 11.5 3.8z"
        fill="currentColor"
      />
    </svg>
  );
}
