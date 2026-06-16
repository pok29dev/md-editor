/**
 * App version format: yy.m.ddbb (semver 3-part, Windows MSI safe)
 *
 * - yy:   2-digit year (e.g. 26)
 * - m:    month 1–12 (minor; always <= 255 for WiX/MSI)
 * - ddbb: patch = day * 100 + build (day 1–31, build 1–99)
 *
 * Example: 26.6.1101 = 2026-06-11, build 1
 * Release tag: v.{version} (e.g. v.26.6.1101)
 */

const VERSION_RE = /^(\d{1,2})\.(\d{1,2})\.(\d+)$/;

const MAX_MSI_MAJOR = 255;
const MAX_MSI_MINOR = 255;

export function encodeDdbb(day, build) {
  if (day < 1 || day > 31) {
    throw new Error(`Day out of range: ${day} (expected 1–31)`);
  }
  if (build < 1 || build > 99) {
    throw new Error(`Build out of range: ${build} (expected 1–99)`);
  }
  return day * 100 + build;
}

export function decodeDdbb(patch) {
  const day = Math.floor(patch / 100);
  const build = patch % 100;
  if (day < 1 || day > 31 || build < 1) {
    throw new Error(
      `Invalid ddbb patch ${patch} (expected day*100+build, e.g. 1101)`,
    );
  }
  if (patch !== encodeDdbb(day, build)) {
    throw new Error(`Invalid ddbb patch ${patch}`);
  }
  return { day, build };
}

export function parseAppVersion(version) {
  const match = version.trim().match(VERSION_RE);
  if (!match) {
    throw new Error(
      `Invalid version "${version}" (expected yy.m.ddbb, e.g. 26.6.1101)`,
    );
  }

  const yy = Number(match[1]);
  const month = Number(match[2]);
  const patch = Number(match[3]);
  const { day, build } = decodeDdbb(patch);

  if (yy > 99) {
    throw new Error(`Year segment out of range: ${yy}`);
  }
  if (month < 1 || month > 12) {
    throw new Error(`Month out of range: ${month}`);
  }

  assertWindowsSemverSafe(yy, month, patch);

  return { yy, month, day, build, patch };
}

export function assertWindowsSemverSafe(major, minor, patch) {
  if (major > MAX_MSI_MAJOR || minor > MAX_MSI_MINOR) {
    throw new Error(
      `Version major/minor exceed Windows MSI limit (255): ${major}.${minor}.${patch}`,
    );
  }
}

export function formatAppVersion({ yy, month, day, build }) {
  const patch = encodeDdbb(day, build);
  const version = `${yy}.${month}.${patch}`;
  parseAppVersion(version);
  return version;
}

export function formatReleaseTag(version) {
  parseAppVersion(version);
  return `v.${version}`;
}

export function isValidAppVersion(version) {
  try {
    parseAppVersion(version);
    return true;
  } catch {
    return false;
  }
}
