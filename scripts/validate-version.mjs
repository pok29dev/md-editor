#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { isValidAppVersion } from "./lib/version-format.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8").trim();
}

function cargoVersion() {
  const text = fs.readFileSync(path.join(root, "src-tauri/Cargo.toml"), "utf8");
  const match = text.match(/^version = "([^"]+)"/m);
  if (!match) throw new Error("Cannot read version from src-tauri/Cargo.toml");
  return match[1];
}

const fileVersion = read("VERSION");
const pkgVersion = JSON.parse(read("package.json")).version;
const tauriVersion = JSON.parse(read("src-tauri/tauri.conf.json")).version;
const cargo = cargoVersion();

for (const value of [fileVersion, pkgVersion, tauriVersion, cargo]) {
  if (!isValidAppVersion(value)) {
    console.error(`::error::Invalid yy.m.ddbb version: "${value}"`);
    process.exit(1);
  }
}

if (fileVersion !== pkgVersion) {
  console.error(
    `::error::VERSION (${fileVersion}) does not match package.json (${pkgVersion})`,
  );
  process.exit(1);
}

if (pkgVersion !== tauriVersion || pkgVersion !== cargo) {
  console.error(
    `::error::Version mismatch: package=${pkgVersion} tauri=${tauriVersion} cargo=${cargo}`,
  );
  process.exit(1);
}

console.log(`Version OK: ${pkgVersion} (yy.m.ddbb)`);
