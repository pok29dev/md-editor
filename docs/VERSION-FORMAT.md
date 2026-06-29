# Version format — `yy.m.ddbb`

มาตรฐานเวอร์ชันสำหรับ MD Editor และโปรเจกตใหม่ที่ใช้ repo นี้เป็นแม่แบบ

## รูปแบบ

**`yy.m.ddbb`** — semver 3 ส่วน (ใช้กับ Cargo, Tauri, npm, Windows MSI ได้ตรงๆ)

| ส่วน | ความหมาย | ช่วง |
|------|----------|------|
| `yy` | ปี 2 หลัก | 0–99 |
| `m` | เดือน | 1–12 |
| `ddbb` | patch = วัน × 100 + build | วัน 1–31, build 1–99 |

### ตัวอย่าง

| วันที่ | build | เวอร์ชัน | tag |
|--------|-------|----------|-----|
| 2026-06-11 | 1 | `26.6.1101` | `v.26.6.1101` |
| 2026-06-16 | 1 | `26.6.1601` | `v.26.6.1601` |
| 2026-06-17 | 1 | `26.6.1701` | `v.26.6.1701` |
| 2026-06-19 | 1 | `26.6.1901` | `v.26.6.1901` |
| 2026-06-20 | 1 | `26.6.2001` | `v.26.6.2001` |
| 2026-06-29 | 1 | `26.6.2901` | `v.26.6.2901` |

### ถอดรหัส patch

```
day   = floor(patch / 100)
build = patch % 100
```

ตัวอย่าง: `1101` → วันที่ 11, build 1

## ทำไมใช้รูปแบบนี้

- **Tauri/Cargo** ต้องการ semver 3 ส่วน
- **Windows MSI/WiX** จำกัด major/minor ≤ 255 — รูปแบบ `yy.mdd.build` (minor = 611) จึง build ไม่ผ่าน
- **ไม่ต้อง** sync config แยกหรือ `assetNamePattern` สำหรับชื่อไฟล์

## ไฟล์ที่ต้องตรงกัน

```
VERSION
package.json
src/version.ts          → APP_VERSION
src-tauri/Cargo.toml
src-tauri/tauri.conf.json
src-tauri/tauri.windows.conf.json   (ถ้ามี)
design-pack/version.ts  (ถ้าใช้ design-pack)
```

## การ bump

1. **วันเดิม ปล่อย build ใหม่** — เพิ่ม build: `26.6.1101` → `26.6.1102`
2. **วันใหม่** — รีเซ็ต build เป็น 1: `26.6.1201` (12 มิ.ย.)

## ตรวจสอบ

```bash
npm run validate:version
```

## โปรเจกตใหม่

1. คัดลอก `scripts/lib/version-format.mjs` และ `scripts/validate-version.mjs`
2. เพิ่ม `"validate:version"` ใน `package.json`
3. คัดลอก `.cursor/rules/version-format.mdc`
4. ตั้ง `VERSION` ตามวันที่ปล่อยครั้งแรก

Cursor rule: `.cursor/rules/version-format.mdc`
