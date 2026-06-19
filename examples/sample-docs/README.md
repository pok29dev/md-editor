# Sample Docs

โฟลเดอร์ตัวอย่างสำหรับทดสอบ MD Editor

## วิธีใช้

1. เปิดแอป → **Open Folder**
2. เลือกโฟลเดอร์ `examples/sample-docs`
3. คลิกไฟล์ใน sidebar เพื่อเปิด

## ไฟล์

| ไฟล์ | คำอธิบาย |
|------|----------|
| `README.md` | ไฟล์นี้ |
| `getting-started.md` | เนื้อหา Markdown เริ่มต้น |
| `guides/basics.md` | ตัวอย่าง nested folder |
| `markdown-features-test.md` | ทดสอบ preview ครบ (tables, Mermaid, math, alerts) |
| `config.json` | ทดสอบ JSON editor — syntax highlight, validate, format (`⌘⇧F`) |
| `config.yaml` | ทดสอบ YAML editor — syntax highlight, validate, format |

## ทดสอบ JSON/YAML

1. เปิด `config.json` หรือ `config.yaml`
2. ตรวจว่าไม่มี Markdown toolbar และ preview เป็น empty state
3. แก้ syntax ให้ผิด → ดู error ใน status bar
4. กด `⌘⇧F` เพื่อ format
5. ลอง Save เมื่อ syntax ยังผิด → ควรถามยืนยัน
