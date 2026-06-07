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
      viewBox="0 0 16 16"
      aria-hidden
      style={{ transform: expanded ? "rotate(90deg)" : undefined, transition: "transform 0.15s ease" }}
    >
      <path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function FolderIcon({ className }: IconProps) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 32 32" aria-hidden>
      <path
        d="M12 10h8l2 2h6v14H4V10h8z"
        fill="currentColor"
      />
    </svg>
  );
}

export function FileIcon({ className }: IconProps) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 32 32" aria-hidden>
      <path
        d="M10 4h10l6 6v18H10V4z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="miter"
      />
      <path d="M20 4v6h6" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
