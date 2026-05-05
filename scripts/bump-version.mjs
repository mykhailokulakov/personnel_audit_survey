/**
 * Computes the next semantic version from conventional commits since the last git tag,
 * writes release notes to release-notes.md, and sets GITHUB_OUTPUT variables.
 *
 * Bump rules (highest wins):
 *   major — commit message matches /BREAKING.CHANGE/ or /^type(!):/ pattern
 *   minor — commit starts with "feat:"
 *   patch — everything else (default)
 */

import { execSync } from 'child_process';
import { readFileSync, appendFileSync, writeFileSync } from 'fs';

// ── 1. Find the latest git tag ────────────────────────────────────────────────

let latestTag = null;
try {
  latestTag = execSync('git describe --tags --abbrev=0', {
    stdio: ['pipe', 'pipe', 'pipe'],
  })
    .toString()
    .trim();
} catch {
  // No tags exist yet — this will be the first release.
}

// ── 2. Collect commit messages since that tag ─────────────────────────────────

const range = latestTag ? `${latestTag}..HEAD` : 'HEAD';
let commitMessages = [];
try {
  const raw = execSync(`git log ${range} --pretty=format:"%s"`, {
    stdio: ['pipe', 'pipe', 'pipe'],
  })
    .toString()
    .trim();
  commitMessages = raw ? raw.split('\n').filter(Boolean) : [];
} catch {
  // Empty repo / no commits in range.
}

// ── 3. Determine bump type ────────────────────────────────────────────────────

let bump = 'patch';
for (const msg of commitMessages) {
  if (/BREAKING.CHANGE/.test(msg) || /^[a-z]+(\(.+\))?!:/.test(msg)) {
    bump = 'major';
    break;
  }
  if (/^feat(\(.+\))?:/.test(msg) && bump !== 'major') {
    bump = 'minor';
  }
}

// ── 4. Compute new version ────────────────────────────────────────────────────

const baseVersion = latestTag
  ? latestTag.replace(/^v/, '')
  : JSON.parse(readFileSync('package.json', 'utf8')).version;

const [maj, min, pat] = baseVersion.split('.').map(Number);
const newVersion =
  bump === 'major'
    ? `${maj + 1}.0.0`
    : bump === 'minor'
      ? `${maj}.${min + 1}.0`
      : `${maj}.${min}.${pat + 1}`;

// ── 5. Build changelog section ────────────────────────────────────────────────

const changelogEntries =
  commitMessages.length > 0
    ? commitMessages.map((m) => `- ${m}`).join('\n')
    : '- No changes recorded';

const compareUrl = latestTag
  ? `https://github.com/mykhailokulakov/generic_llm_experiments/compare/${latestTag}...v${newVersion}`
  : null;

const changelogSection = [
  `## What's Changed`,
  '',
  changelogEntries,
  '',
  compareUrl ? `**Full Changelog**: ${compareUrl}` : '**Full Changelog**: Initial release',
].join('\n');

// ── 6. Build "How to run" section ─────────────────────────────────────────────

const runSection = [
  '## How to run',
  '',
  `1. Download \`diagnostic-survey-v${newVersion}.tar.gz\` from the assets below`,
  `2. Extract: \`tar xzf diagnostic-survey-v${newVersion}.tar.gz\``,
  `3. Enter the directory: \`cd diagnostic-survey-v${newVersion}\``,
  '4. Ensure **Node.js 20+** is installed (`node --version`)',
  '5. Start the server:',
  '   ```bash',
  '   PORT=3000 node server.js',
  '   ```',
  '6. Open <http://localhost:3000> in your browser',
  '',
  '> **Note**: The app runs entirely in-memory — no database or external services required.',
  '> Results exist only for the current browser session.',
  '> Download your JSON export before closing the tab.',
].join('\n');

// ── 7. Write release-notes.md ─────────────────────────────────────────────────

writeFileSync('release-notes.md', `${changelogSection}\n\n${runSection}\n`);

// ── 8. Set GitHub Actions outputs ─────────────────────────────────────────────

const outputFile = process.env.GITHUB_OUTPUT;
if (outputFile) {
  appendFileSync(outputFile, `new_version=${newVersion}\n`);
  appendFileSync(outputFile, `bump_type=${bump}\n`);
}

console.log(`Version: ${baseVersion} → ${newVersion} (${bump} bump)`);
console.log(
  `Commits since ${latestTag ?? 'beginning'}: ${commitMessages.length}`,
);
