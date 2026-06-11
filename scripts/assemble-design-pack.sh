#!/usr/bin/env bash
# Assemble design-pack/ for AI UI redesign tools (Open Design, v0, etc.)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PACK="$ROOT/design-pack"
SRC="$ROOT/src"

rm -rf "$PACK/docs" "$PACK/styles" "$PACK/components" "$PACK/hooks" "$PACK/lib"
mkdir -p "$PACK/docs" "$PACK/styles/themes"
mkdir -p "$PACK/components/layout" "$PACK/components/editor" "$PACK/components/settings"
mkdir -p "$PACK/components/icons/lucide" "$PACK/components/icons/themes/default"
mkdir -p "$PACK/components/icons/themes/blue" "$PACK/components/icons/themes/warm"
mkdir -p "$PACK/hooks" "$PACK/lib/theme" "$PACK/screenshots"

# Docs
cp "$ROOT/technical-guide/06-ui-ux.md" "$PACK/docs/"
cp "$ROOT/technical-guide/03-frontend.md" "$PACK/docs/"
cp "$ROOT/docs/specification.md" "$PACK/docs/"
cp "$ROOT/README.md" "$PACK/docs/"

# Styles
cp "$SRC/styles/themes.css" "$PACK/styles/"
cp "$SRC/styles/globals.css" "$PACK/styles/"
cp "$SRC/styles/layout.css" "$PACK/styles/"
cp "$SRC/styles/titlebar.css" "$PACK/styles/"
cp "$SRC/styles/editor-toolbar.css" "$PACK/styles/"
cp "$SRC/styles/editor.css" "$PACK/styles/"
cp "$SRC/styles/preview.css" "$PACK/styles/"
cp "$SRC/styles/dialogs.css" "$PACK/styles/"
cp "$SRC/styles/empty-states.css" "$PACK/styles/"
cp "$SRC/styles/themes/"*.css "$PACK/styles/themes/"

# Layout components
for f in AppShell WindowTitleBar SidebarTitleBar Sidebar FileTree TabBar \
         EditorPane PreviewPane StatusBar ColorSchemeToggle; do
  cp "$SRC/components/layout/${f}.tsx" "$PACK/components/layout/"
done

# Editor + settings
cp "$SRC/components/editor/EditorToolbar.tsx" "$PACK/components/editor/"
cp "$SRC/components/editor/FindReplace.tsx" "$PACK/components/editor/"
cp "$SRC/components/editor/LinkDialog.tsx" "$PACK/components/editor/"
cp "$SRC/components/settings/"*.tsx "$PACK/components/settings/"

# Icons — Lucide toolbar/format/colorScheme + theme tree + panel
cp "$SRC/components/icons/"*.tsx "$PACK/components/icons/" 2>/dev/null || true
cp "$SRC/components/icons/lucide/"*.tsx "$PACK/components/icons/lucide/"
cp "$SRC/components/icons/themes/default/"*.tsx "$PACK/components/icons/themes/default/"
cp "$SRC/components/icons/themes/blue/"*.tsx "$PACK/components/icons/themes/blue/"
cp "$SRC/components/icons/themes/warm/"*.tsx "$PACK/components/icons/themes/warm/"

# Hooks + theme router (reference for menu/toolbar wiring)
cp "$SRC/hooks/useAppMenu.ts" "$PACK/hooks/"
cp "$SRC/version.ts" "$PACK/version.ts"
cp "$SRC/hooks/useFormatMenuActions.ts" "$PACK/hooks/"
cp "$SRC/lib/theme/icons.ts" "$PACK/lib/theme/"
cp "$SRC/lib/theme/types.ts" "$PACK/lib/theme/"

# Remove stale files from older packs
rm -f "$PACK/components/layout/ThemeToggle.tsx"
rm -f "$PACK/components/icons/ThemeIcons.tsx"

# Brief stays in place (updated manually / via git)
if [[ ! -f "$PACK/DESIGN-BRIEF.md" ]]; then
  echo "Warning: DESIGN-BRIEF.md missing — create it manually."
fi

# Preserve screenshots (do not delete user captures)
if [[ ! -f "$PACK/screenshots/README.txt" ]]; then
  cat > "$PACK/screenshots/README.txt" <<'EOF'
Add screenshots from `npm run tauri dev`:

- split-light.png, split-dark.png
- settings-general.png
- editor-toolbar.png (full toolbar scroll)
- sidebar-tree.png (expanded tree with guides)
EOF
fi

echo "Design pack assembled at: $PACK"
echo "Screenshots: $PACK/screenshots/"
echo "Files: $(find "$PACK" -type f | wc -l | tr -d ' ')"
