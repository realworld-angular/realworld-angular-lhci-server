#!/usr/bin/env node
/**
 * Resolves audit URLs and writes .lhci/urls.json for the synchronous lighthouserc.
 * Required because `lhci autorun` reads the config synchronously and cannot use async exports.
 */
const fs = require('node:fs');
const path = require('node:path');

const { buildUrls } = require('./resolve-urls.cjs');

const OUT_PATH = path.join(__dirname, '..', '.lhci', 'urls.json');

async function main() {
  const urls = await buildUrls();
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, `${JSON.stringify(urls, null, 2)}\n`);
  console.log(`Wrote ${urls.length} URLs to ${OUT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
