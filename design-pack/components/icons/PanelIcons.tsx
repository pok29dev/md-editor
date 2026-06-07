import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

interface IconProps {
  className?: string;
}

export function PanelLeftCloseIcon({ className }: IconProps) {
  return (
    <PanelLeftClose
      className={className}
      size={16}
      strokeWidth={1.75}
      aria-hidden
    />
  );
}

export function PanelLeftOpenIcon({ className }: IconProps) {
  return (
    <PanelLeftOpen
      className={className}
      size={16}
      strokeWidth={1.75}
      aria-hidden
    />
  );
}
