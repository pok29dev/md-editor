import {
  Ellipsis,
  FolderOpen,
  RefreshCw,
  Search,
  Settings,
  UnfoldVertical,
  type LucideIcon,
} from "lucide-react";

interface IconProps {
  className?: string;
}

function lucideIcon(Icon: LucideIcon, size = 16) {
  return function LucideToolbarIcon({ className }: IconProps) {
    return (
      <Icon
        className={className}
        size={size}
        strokeWidth={1.75}
        aria-hidden
      />
    );
  };
}

export const FindIcon = lucideIcon(Search);
export const SyncIcon = lucideIcon(UnfoldVertical);
export const MoreIcon = lucideIcon(Ellipsis);
export const SettingsIcon = lucideIcon(Settings);
export const OpenFolderIcon = lucideIcon(FolderOpen, 14);
export const RefreshIcon = lucideIcon(RefreshCw, 14);
