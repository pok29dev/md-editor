import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDownAZ,
  ArrowUpAZ,
  Bold,
  Bookmark,
  CaseSensitive,
  Clock,
  Code,
  Copyright,
  Eraser,
  Highlighter,
  Image,
  Info,
  Italic,
  Languages,
  Link,
  List,
  ListOrdered,
  ListTodo,
  Maximize2,
  Megaphone,
  Minus,
  Quote,
  Redo2,
  Search,
  Sigma,
  Smile,
  SquareCode,
  Strikethrough,
  Superscript,
  Table,
  Terminal,
  Undo2,
  CircleHelp,
  type LucideIcon,
} from "lucide-react";

interface IconProps {
  className?: string;
}

function lucideIcon(Icon: LucideIcon) {
  return function LucideFormatIcon({ className }: IconProps) {
    return (
      <Icon
        className={className}
        size={16}
        strokeWidth={1.75}
        aria-hidden
      />
    );
  };
}

export const UndoIcon = lucideIcon(Undo2);
export const RedoIcon = lucideIcon(Redo2);
export const ClearIcon = lucideIcon(Eraser);
export const BoldIcon = lucideIcon(Bold);
export const ItalicIcon = lucideIcon(Italic);
export const CodeIcon = lucideIcon(Code);
export const HighlightIcon = lucideIcon(Highlighter);
export const StrikethroughIcon = lucideIcon(Strikethrough);
export const QuoteIcon = lucideIcon(Quote);
export const TitleCaseIcon = lucideIcon(CaseSensitive);
export const UppercaseIcon = lucideIcon(ArrowUpAZ);
export const LowercaseIcon = lucideIcon(ArrowDownAZ);
export const AlignLeftIcon = lucideIcon(AlignLeft);
export const AlignCenterIcon = lucideIcon(AlignCenter);
export const AlignRightIcon = lucideIcon(AlignRight);
export const DirectionIcon = lucideIcon(Languages);
export const BulletListIcon = lucideIcon(List);
export const NumberedListIcon = lucideIcon(ListOrdered);
export const TaskListIcon = lucideIcon(ListTodo);
export const HorizontalRuleIcon = lucideIcon(Minus);
export const LinkIcon = lucideIcon(Link);
export const ReferenceIcon = lucideIcon(Bookmark);
export const ImageIcon = lucideIcon(Image);
export const CodeBlockIcon = lucideIcon(SquareCode);
export const TerminalIcon = lucideIcon(Terminal);
export const MathBlockIcon = lucideIcon(Sigma);
export const TableIcon = lucideIcon(Table);
export const DateTimeIcon = lucideIcon(Clock);
export const EmojiIcon = lucideIcon(Smile);
export const SymbolsIcon = lucideIcon(Copyright);
export const AlertIcon = lucideIcon(Megaphone);
export const FootnoteIcon = lucideIcon(Superscript);
export const FullscreenIcon = lucideIcon(Maximize2);
export const FindIcon = lucideIcon(Search);
export const HelpIcon = lucideIcon(CircleHelp);
export const AboutIcon = lucideIcon(Info);
