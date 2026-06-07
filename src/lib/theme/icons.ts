import type { AppTheme } from "./types";
import * as appleTree from "../../components/icons/themes/apple/tree";
import * as ibmTree from "../../components/icons/themes/ibm/tree";
import * as warmTree from "../../components/icons/themes/warm/tree";
import * as lucideToolbar from "../../components/icons/lucide/toolbar";
import * as lucideFormat from "../../components/icons/lucide/format";
import * as lucideColorScheme from "../../components/icons/lucide/colorScheme";

const TREE_ICONS = {
  apple: appleTree,
  ibm: ibmTree,
  warm: warmTree,
} as const;

export function getColorSchemeIcons(_theme: AppTheme) {
  return lucideColorScheme;
}

export function getToolbarIcons(_theme: AppTheme) {
  return lucideToolbar;
}

export function getTreeIcons(theme: AppTheme) {
  return TREE_ICONS[theme];
}

export function getFormatIcons(_theme: AppTheme) {
  return lucideFormat;
}
