# 08 — Development Guide

## 8.1 Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18+ |
| npm | 9+ |
| Rust | stable (via rustup) |
| Tauri CLI | v2 (`@tauri-apps/cli`) |

**macOS เพิ่มเติม:** Xcode Command Line Tools

## 8.2 Setup

```bash
git clone <repo>
cd md-editor
npm install
npm run tauri dev
```

Dev server: `http://localhost:1420` (Vite)  
Tauri เปิด window และเชื่อมกับ dev server อัตโนมัติ

## 8.3 npm Scripts

| Script | คำสั่ง | ผลลัพธ์ |
|--------|--------|---------|
| `dev` | `vite` | Frontend only (ไม่มี Tauri shell) |
| `build` | `tsc && vite build` | Production bundle → `dist/` |
| `preview` | `vite preview` | Preview production build |
| `tauri dev` | Tauri + Vite HMR | **แนะนำสำหรับพัฒนา** |
| `tauri build` | Release build | `.app` / `.dmg` / `.msi` / `.deb` |

## 8.4 Release Build Output

```bash
npm run tauri build
```

| Platform | Output path |
|----------|-------------|
| macOS | `src-tauri/target/release/bundle/macos/MD Editor.app` |
| macOS DMG | `src-tauri/target/release/bundle/dmg/` |
| Windows | `src-tauri/target/release/bundle/msi/` |
| Linux | `src-tauri/target/release/bundle/deb/` |

## 8.5 Vite Configuration Notes

**ไฟล์:** `vite.config.ts`

- Port **1420** (strict)
- Watch ignore: `*.md`, `src-tauri/**` — ป้องกัน reload เมื่อ save markdown
- Plugins: React, Tailwind 4

## 8.6 การทดสอบ

### Manual Testing

```bash
npm run tauri dev
# Open Folder → examples/sample-docs
# เปิด markdown-features-test.md
```

Checklist: [docs/TESTING.md](../docs/TESTING.md)

### Build Verification

```bash
npm run build   # ต้อง pass tsc + vite โดยไม่มี error
```

## 8.7 การขยายระบบ

### เพิ่ม marked Extension

1. เพิ่ม tokenizer ใน `lib/markdown/extensions.ts`
2. ถ้า extension ใหม่ทำให้ segmented mode ไม่ปลอดภัย → อัปเดต `isSegmentedPreviewSafe()` ใน `segmented.ts`
3. เพิ่ม CSS ใน `styles/preview.css` ถ้าจำเป็น
4. เพิ่ม test case ใน `examples/sample-docs/`

### เพิ่ม Tauri Command

1. เพิ่ม handler ใน `src-tauri/src/commands/`
2. Register ใน `lib.rs` `invoke_handler`
3. เพิ่ม TS type ใน `types/files.ts`
4. เพิ่ม wrapper ใน `lib/tauri/commands.ts`

### เพิ่ม Keyboard Shortcut

1. เพิ่ม handler ใน `hooks/useKeyboardShortcuts.ts`
2. อัปเดต `06-ui-ux.md` และ README

### เพิ่ม UI Component

- Layout components → `components/layout/`
- ใช้ CSS variables จาก `themes.css` — ไม่ hardcode สี
- State ที่ cross-component → Zustand; local state → component

## 8.8 Known Gaps (Spec vs Implementation)

| Feature | Spec | สถานะ |
|---------|------|--------|
| Sidebar drag-resize | §4.2 | Fixed 240px |
| File watcher | F-05 | Manual refresh only |
| Cmd+B / Cmd+I | §5.8 | ไม่มี |
| Emoji shortcodes | M-17 | ไม่มี |
| Encoding ใน status bar | §4.1 | มีใน `FileContent` แต่ไม่แสดง UI |
| Export HTML + Mermaid/Math | S-04 | Static HTML only |
| Open Folder = Cmd+O | Spec | จริง: Cmd+O = Open File |

## 8.9 Post-MVP Roadmap

จาก [docs/TODO.md](../docs/TODO.md):

- **Settings UI** — [docs/settings-plan.md](../docs/settings-plan.md) (Phase S-1–S-7)
- CI/CD release workflow
- Windows / Linux release builds
- Code-split Mermaid bundle
- สร้างไฟล์ใหม่จาก sidebar
- Git status ใน file tree
- PDF export

## 8.10 Troubleshooting

| ปัญหา | สาเหตุที่เป็นไปได้ | แก้ไข |
|-------|-------------------|-------|
| Preview ไม่อัปเดต | Worker disabled หลัง fail | Reload app |
| Mermaid ไม่แสดง | Theme/DOM timing | ตรวจ console, reload tab |
| Math ไม่ render | MathJax path | ตรวจ `public/mathjax/` |
| Save fail | Permission / path | ตรวจ Rust error message |
| Dev reload บ่อย | Save `.md` นอก ignore | ใช้ `tauri dev` (ignore `.md`) |
| TypeScript error หลังแก้ Rust | Types ไม่ sync | อัปเดต `types/files.ts` |

## 8.11 Code Style Notes

- TypeScript strict mode
- Prefer CSS variables over hardcoded colors
- Surgical changes — ไม่ refactor นอก scope
- Comments เฉพาะ non-obvious logic
- เอกสาร product → `docs/`, เอกสาร technical → `technical-guide/`
