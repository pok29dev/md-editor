export interface EmojiPreset {
  shortcode: string;
  label: string;
}

export interface SymbolPreset {
  symbol: string;
  entity: string;
  name: string;
}

export const EMOJI_PRESETS: EmojiPreset[] = [
  { shortcode: "smile", label: "😄" },
  { shortcode: "grinning", label: "😀" },
  { shortcode: "joy", label: "😂" },
  { shortcode: "wink", label: "😉" },
  { shortcode: "heart", label: "❤️" },
  { shortcode: "thumbsup", label: "👍" },
  { shortcode: "thumbsdown", label: "👎" },
  { shortcode: "fire", label: "🔥" },
  { shortcode: "star", label: "⭐" },
  { shortcode: "rocket", label: "🚀" },
  { shortcode: "tada", label: "🎉" },
  { shortcode: "eyes", label: "👀" },
  { shortcode: "thinking", label: "🤔" },
  { shortcode: "clap", label: "👏" },
  { shortcode: "ok_hand", label: "👌" },
  { shortcode: "wave", label: "👋" },
  { shortcode: "check", label: "✅" },
  { shortcode: "x", label: "❌" },
  { shortcode: "warning", label: "⚠️" },
  { shortcode: "bulb", label: "💡" },
  { shortcode: "memo", label: "📝" },
  { shortcode: "book", label: "📖" },
  { shortcode: "link", label: "🔗" },
  { shortcode: "computer", label: "💻" },
];

export const SYMBOL_PRESETS: SymbolPreset[] = [
  { symbol: "©", entity: "&copy;", name: "copyright" },
  { symbol: "®", entity: "&reg;", name: "registered" },
  { symbol: "™", entity: "&trade;", name: "trademark" },
  { symbol: "✓", entity: "&check;", name: "check" },
  { symbol: "★", entity: "★", name: "star" },
  { symbol: "•", entity: "•", name: "bullet" },
  { symbol: "…", entity: "&hellip;", name: "ellipsis" },
  { symbol: "—", entity: "&mdash;", name: "em dash" },
  { symbol: "–", entity: "&ndash;", name: "en dash" },
  { symbol: "→", entity: "&rarr;", name: "right arrow" },
  { symbol: "←", entity: "&larr;", name: "left arrow" },
  { symbol: "↑", entity: "&uarr;", name: "up arrow" },
  { symbol: "↓", entity: "&darr;", name: "down arrow" },
  { symbol: "€", entity: "&euro;", name: "euro" },
  { symbol: "£", entity: "&pound;", name: "pound" },
  { symbol: "¥", entity: "&yen;", name: "yen" },
  { symbol: "§", entity: "&sect;", name: "section" },
  { symbol: "°", entity: "&deg;", name: "degree" },
  { symbol: "±", entity: "&plusmn;", name: "plus minus" },
  { symbol: "×", entity: "&times;", name: "times" },
  { symbol: "÷", entity: "&divide;", name: "divide" },
  { symbol: "≠", entity: "&ne;", name: "not equal" },
  { symbol: "≤", entity: "&le;", name: "less equal" },
  { symbol: "≥", entity: "&ge;", name: "greater equal" },
  { symbol: "∞", entity: "&infin;", name: "infinity" },
  { symbol: "&", entity: "&amp;", name: "ampersand" },
  { symbol: "<", entity: "&lt;", name: "less than" },
  { symbol: ">", entity: "&gt;", name: "greater than" },
  { symbol: '"', entity: "&quot;", name: "double quote" },
  { symbol: "|", entity: "&#124;", name: "pipe" },
];
