interface IconProps {
  className?: string;
  expanded?: boolean;
}

export function ChevronIcon({ className, expanded }: IconProps) {
  return (
    <svg
      className={className}
      width="10"
      height="10"
      viewBox="0 0 10 10"
      aria-hidden
      style={{ transform: expanded ? "rotate(90deg)" : undefined, transition: "transform 0.15s ease" }}
    >
      <path
        d="M3.5 1.5L7 5L3.5 8.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FolderIcon({ className }: IconProps) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 16 16" aria-hidden>
      <path
        d="M2 4.5A1.5 1.5 0 0 1 3.5 3H6.2L7.5 4.5H12.5A1.5 1.5 0 0 1 14 6V12A1.5 1.5 0 0 1 12.5 13.5H3.5A1.5 1.5 0 0 1 2 12V4.5Z"
        fill="currentColor"
        opacity="0.85"
      />
    </svg>
  );
}

export function FileIcon({ className }: IconProps) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 16 16" aria-hidden>
      <path
        d="M4.5 2H9.3L12.5 5.2V13.5A1 1 0 0 1 11.5 14.5H4.5A1 1 0 0 1 3.5 13.5V3A1 1 0 0 1 4.5 2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M9 2V5.5H12.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}
