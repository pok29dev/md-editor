#!/usr/bin/env node
/**
 * Write src-tauri/tauri.release.conf.json for release/CI builds.
 *
 * Cargo.toml stays on 3-part semver; this override sets the 4-part yy.m.d.build
 * from VERSION so Tauri bundle artifact names match package.json / GitHub tags.
 * Also sets Windows WiX version for MSI metadata.
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
  version,
  bundle: {
    windows: {
      wix: {
        version: msiVersion,
      },
    },
  },
};

const outPath = path.join(root, "src-tauri", "tauri.release.conf.json");
fs.writeFileSync(outPath, `${JSON.stringify(config, null, 2)}\n`);
console.log(`Bundle version override: ${version} -> ${outPath}`);
console.log(`Windows MSI version: ${msiVersion}`);
