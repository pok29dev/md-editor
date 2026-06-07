# MD Editor

Desktop Markdown editor — **Tauri v2** + **React** + **CodeMirror 6**

**Version:** `2026.06.07-1` · **MVP Complete** (Settings + Formatting + UI Redesign)

## Features

### Files & workspace

- File tree sidebar with **Open folder** button, refresh, keyboard navigation
- Open Folder / Open File, recent folders
- Multi-tab editing with dirty indicator and unsaved-change prompts
- Save, Save As, Export HTML, Export PDF

### Editor & preview

- CodeMirror 6 — line numbers, find/replace, undo/redo, sync scroll, RTL toggle
- Live GFM preview — highlight.js, Mermaid, MathJax (offline), GitHub alerts
- View mode per tab: Split / Editor / Preview

### Formatting

- **Editor toolbar** — 7 groups with **Lucide icons**: history, heading, inline, align, lists, insert, utilities
- **Native menus** — File, Edit, Insert, Format, Window, Help (sync กับ toolbar)
- **Keyboard shortcuts** — `Cmd+B/I/K/L//`, `` Cmd+` ``, headings via `Cmd+Option+1…6`
- **Dialogs** — Link, Reference, Emoji, Symbols, Clear document, Help, About Markdown
- Toolbar buttons highlight when the cursor is inside matching Markdown syntax

### Settings & themes

- Modal with General, Editor, Files, Export tabs (`Cmd+,`)
- **Color scheme** — System / Light / Dark (`ColorSchemeToggle`)
- **App theme** — Apple / IBM / Warm (tokens + file tree icons)
- Sync scroll, sidebar width/collapse, font size, line wrap, PDF export options
- Preferences persisted to `{app_config_dir}/preferences.json`

### UI

- Modern chrome — icon title bar, overflow export menu, polished tabs/status bar
- Shared dialog styles, empty states, focus rings, `prefers-reduced-motion`
- Design pack for AI tools: `npm run design-pack` → `design-pack/`

## Quick Start

```bash
npm install
npm run tauri dev
```

## Release Build (macOS)

```bash
npm run tauri build
```

Output:

- `src-tauri/target/release/bundle/macos/MD Editor.app`
- `src-tauri/target/release/bundle/dmg/MD Editor_*.dmg`

## Test Sample Docs

```bash
npm run tauri dev
# Sidebar → Open folder → examples/sample-docs
# Open markdown-features-test.md for full feature regression
```

Manual checklist: [docs/TESTING.md](./docs/TESTING.md) (AC-1–AC-8)

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + O` | Open File |
| `Cmd/Ctrl + Shift + O` | Open Folder |
| `Cmd/Ctrl + S` | Save |
| `Cmd/Ctrl + Shift + S` | Save As |
| `Cmd/Ctrl + F` | Find & Replace |
| `Cmd/Ctrl + W` | Close tab |
| `Cmd/Ctrl + ,` | Settings |
| `Cmd/Ctrl + 1/2/3` | Split / Editor / Preview |
| `Cmd/Ctrl + \` | Toggle sidebar |
| `Cmd/Ctrl + B` | Bold |
| `Cmd/Ctrl + I` | Italic |
| `Cmd/Ctrl + K` | Insert link (dialog) |
| `` Cmd/Ctrl + ` `` | Inline code |
| `Cmd/Ctrl + L` | Task list |
| `Cmd/Ctrl + /` | HTML comment |
| `Cmd/Ctrl + Shift + K` | Code block |
| `Cmd/Ctrl + Option + 1…6` | Heading 1–6 |

Format shortcuts apply when the editor is focused and no modal is open.

## Documentation

| Doc | Description |
|-----|-------------|
| [docs/specification.md](./docs/specification.md) | Product spec |
| [docs/TESTING.md](./docs/TESTING.md) | Acceptance criteria (manual QA) |
| [docs/editor-toolbar-lucide.md](./docs/editor-toolbar-lucide.md) | Lucide icon mapping สำหรับ toolbar |
| [docs/formatting-tools-plan.md](./docs/formatting-tools-plan.md) | Formatting MVP plan (F-1–F-5) |
| [docs/settings-plan.md](./docs/settings-plan.md) | Settings MVP plan |
| [technical-guide/](./technical-guide/) | Architecture & implementation guides |
| [design-pack/DESIGN-BRIEF.md](./design-pack/DESIGN-BRIEF.md) | UI redesign brief + design pack |
| [CHANGELOG.md](./CHANGELOG.md) | Release history |

## Version Format

`yyyy.mm.dd-build` — UI version in `VERSION` / `src/version.ts`  
Cargo/Tauri semver: `2026.6.7`

## Tech Stack

- Tauri v2, React 19, TypeScript, Vite, Zustand, **lucide-react**
- CodeMirror 6, marked.js, highlight.js, DOMPurify, Mermaid, MathJax
- Rust file I/O backend

## License

Private project — license TBD.
