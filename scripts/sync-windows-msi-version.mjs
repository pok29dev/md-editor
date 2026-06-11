#!/usr/bin/env node
/**
 * Map VERSION (yy.m.d.build) to Windows MSI version (yy.m.d.build).
 * WiX/MSI limits: major/minor <= 255, patch/build <= 65535.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const version = fs.readFileSync(path.join(root, "VERSION"), "utf8").trim();
const match = version.match(/^(\d{1,2})\.(\d{1,2})\.(\d{1,2})\.(\d+)$/);

if (!match) {
  console.error(`::error::Invalid VERSION format "${version}" (expected yy.m.d.build)`);
  process.exit(1);
}

const [, yy, month, day, build] = match;
const y = Number(yy);
const m = Number(month);
const d = Number(day);
const b = Number(build);

if (y > 255 || m > 255 || d > 65535 || b > 65535) {
  console.error(`::error::Windows MSI version out of range for VERSION ${version}`);
  process.exit(1);
}

const msiVersion = `${y}.${m}.${d}.${b}`;
const config = {
  bundle: {
    windows: {
      wix: {
        version: msiVersion,
      },
    },
  },
};

const outPath = path.join(root, "src-tauri", "tauri.windows.conf.json");
fs.writeFileSync(outPath, `${JSON.stringify(config, null, 2)}\n`);
console.log(`Windows MSI version: ${msiVersion} (from VERSION ${version})`);
