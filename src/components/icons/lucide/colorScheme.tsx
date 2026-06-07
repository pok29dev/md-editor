import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";

interface IconProps {
  className?: string;
}

function lucideIcon(Icon: LucideIcon, size = 16) {
  return function LucideColorSchemeIcon({ className }: IconProps) {
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

export const AutoColorSchemeIcon = lucideIcon(Monitor);
export const MoonIcon = lucideIcon(Moon);
export const SunIcon = lucideIcon(Sun);
