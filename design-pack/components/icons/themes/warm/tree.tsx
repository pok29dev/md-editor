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
        d="M3 2.5L6.5 5L3 7.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
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
        d="M2.5 5.5A1.5 1.5 0 0 1 4 4h2.4L7.5 5.5H12a1.5 1.5 0 0 1 1.5 1.5V12A1.5 1.5 0 0 1 12 13.5H4A1.5 1.5 0 0 1 2.5 12V5.5Z"
        fill="currentColor"
        opacity="0.9"
      />
    </svg>
  );
}

export function FileIcon({ className }: IconProps) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 16 16" aria-hidden>
      <path
        d="M4.5 2.5H9l3 3v8.5A1 1 0 0 1 11 15H4.5A1 1 0 0 1 3.5 14V3.5A1 1 0 0 1 4.5 2.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <path d="M9 2.5V5.5H12" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  );
}
