/**
 * Computes the next semantic version from conventional commits since the last git tag,
 * writes release notes to release-notes.md, and sets GITHUB_OUTPUT variables.
 *
 * Bump rules (highest wins):
 *   major — BREAKING CHANGE anywhere in commit body/footer, or "type!:" subject
 *   minor — commit starts with "feat:"
 *   patch — everything else (default)
 */

import { execSync } from 'child_process';
import { appendFileSync, readFileSync, writeFileSync } from 'fs';

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

// ── 2. Collect commits since that tag ────────────────────────────────────────

const range = latestTag ? `${latestTag}..HEAD` : 'HEAD';

// Subject lines for the changelog and conventional-commit type detection.
let subjects = [];
try {
  const raw = execSync(`git log ${range} --pretty=format:"%s"`, {
    stdio: ['pipe', 'pipe', 'pipe'],
  })
    .toString()
    .trim();
  subjects = raw ? raw.split('\n').filter(Boolean) : [];
} catch {
  // Empty repo / no commits in range.
}

// Full commit bodies (subject + body + trailers) for BREAKING CHANGE detection.
let fullBodies = '';
try {
  fullBodies = execSync(`git log ${range} --pretty=format:"%B"`, {
    stdio: ['pipe', 'pipe', 'pipe'],
  }).toString();
} catch {
  // No commits.
}

// ── 3. Determine bump type ────────────────────────────────────────────────────

let bump = 'patch';

if (/BREAKING.CHANGE/.test(fullBodies) || subjects.some((s) => /^[a-z]+(\(.+\))?!:/.test(s))) {
  bump = 'major';
} else if (subjects.some((s) => /^feat(\(.+\))?:/.test(s))) {
  bump = 'minor';
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
  subjects.length > 0 ? subjects.map((m) => `- ${m}`).join('\n') : '- No changes recorded';

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

console.warn(`Version: ${baseVersion} → ${newVersion} (${bump} bump)`);
console.warn(`Commits since ${latestTag ?? 'beginning'}: ${subjects.length}`);
