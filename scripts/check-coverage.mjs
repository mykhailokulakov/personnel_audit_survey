import { readFileSync } from 'fs';

const summary = JSON.parse(readFileSync('coverage/coverage-summary.json', 'utf8'));
const total = summary.total;

const thresholds = {
  lines: 80,
  statements: 80,
  functions: 80,
  branches: 75,
};

let failed = false;

for (const [metric, threshold] of Object.entries(thresholds)) {
  const actual = total[metric].pct;
  if (actual < threshold) {
    console.error(`Coverage ${metric}: ${actual}% < ${threshold}% (required)`);
    failed = true;
  } else {
    console.warn(`Coverage ${metric}: ${actual}% >= ${threshold}% ✓`);
  }
}

if (failed) {
  process.exit(1);
}
