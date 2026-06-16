/**
 * App version format: yy.mdd.build (semver 3-part)
 * - yy: year (e.g. 26)
 * - mdd: month + day without separator (Jun 11 → 611, Dec 31 → 1231)
 * - build: release build counter for that calendar day
 *
 * Release tag: v.{version} (e.g. v.26.611.1)
 */

const VERSION_RE = /^(\d{1,2})\.(\d{1,4})\.(\d+)$/;

export function parseMdd(mddRaw) {
  const mdd = String(mddRaw);
  for (let month = 12; month >= 1; month -= 1) {
    const prefix = String(month);
    if (!mdd.startsWith(prefix)) continue;
    const day = Number(mdd.slice(prefix.length));
    if (day >= 1 && day <= 31) {
      return { month, day };
    }
  }
  throw new Error(`Invalid mdd segment "${mdd}"`);
}

export function parseAppVersion(version) {
  const match = version.trim().match(VERSION_RE);
  if (!match) {
    throw new Error(
      `Invalid version "${version}" (expected yy.mdd.build, e.g. 26.611.1)`,
    );
  }

  const yy = Number(match[1]);
  const build = Number(match[3]);
  const { month, day } = parseMdd(match[2]);

  if (yy > 99) {
    throw new Error(`Year segment out of range: ${yy}`);
  }
  if (build < 1) {
    throw new Error(`Build segment must be >= 1: ${build}`);
  }

  return { yy, month, day, build, mdd: match[2] };
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
