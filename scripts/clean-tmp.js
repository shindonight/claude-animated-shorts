#!/usr/bin/env node
/**
 * Clean Remotion temporary files to free up disk space.
 * Run before each render: `npm run clean:tmp`
 */

import { rmSync, existsSync, readdirSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

const TEMP_DIRS = [
  // Remotion webpack bundles
  { pattern: /^remotion-webpack-bundle-/, maxAgeDays: 1 },
  // Puppeteer Chrome profiles
  { pattern: /^puppeteer_dev_chrome_profile-/, maxAgeDays: 1 },
  // Any other remotion temp folders
  { pattern: /^remotion-/, maxAgeDays: 1 },
];

function cleanTemp() {
  const tempRoot = process.env.REMOTION_TMP || process.env.TMP || process.env.TEMP || tmpdir();
  console.log(`🧹 Cleaning temp directory: ${tempRoot}`);

  let totalFreed = 0;
  let cleanedCount = 0;

  try {
    const entries = readdirSync(tempRoot, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      for (const { pattern, maxAgeDays } of TEMP_DIRS) {
        if (pattern.test(entry.name)) {
          const fullPath = join(tempRoot, entry.name);
          try {
            const stats = rmSync(fullPath, { recursive: true, force: true });
            console.log(`  ✓ Removed: ${entry.name}`);
            cleanedCount++;
          } catch (e) {
            console.log(`  ⚠ Failed to remove ${entry.name}: ${e.message}`);
          }
          break;
        }
      }
    }

    // Also clean any remotion temp folders in the project's out/ directory
    const projectOut = join(process.cwd(), "out");
    if (existsSync(projectOut)) {
      const outEntries = readdirSync(projectOut, { withFileTypes: true });
      for (const entry of outEntries) {
        if (entry.isDirectory() && /^remotion-/.test(entry.name)) {
          const fullPath = join(projectOut, entry.name);
          try {
            rmSync(fullPath, { recursive: true, force: true });
            console.log(`  ✓ Removed from out/: ${entry.name}`);
            cleanedCount++;
          } catch (e) {
            console.log(`  ⚠ Failed to remove from out/: ${e.message}`);
          }
        }
      }
    }

    console.log(`\n✅ Cleaned ${cleanedCount} temp folders`);
    console.log(`💡 Set REMOTION_TMP to a larger drive: export REMOTION_TMP=/path/to/big/drive/remotion-tmp`);
  } catch (e) {
    console.error(`❌ Error cleaning temp: ${e.message}`);
    process.exit(1);
  }
}

cleanTemp();