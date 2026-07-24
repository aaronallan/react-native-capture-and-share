#!/usr/bin/env node
// Guards against ever accidentally publishing example/, tests, or native project
// folders - runs `npm pack --dry-run --json` and asserts the file list only contains
// what's meant to ship. Uses the real npm pack, not a reimplementation, so it stays
// accurate to whatever "files" and .npmignore actually resolve to.
const { execFileSync } = require('node:child_process');

const FORBIDDEN_PATTERNS = [
  { label: 'example/ app', pattern: /^example\// },
  { label: 'test file', pattern: /\.test\.tsx?$/ },
  { label: '__mocks__ directory', pattern: /(^|\/)__mocks__\// },
  { label: 'native ios project', pattern: /(^|\/)ios\// },
  { label: 'native android project', pattern: /(^|\/)android\// },
];

// --ignore-scripts: this only checks the file list from whatever's already built in lib/ -
// it doesn't rebuild. Run `npm run build` first if you want to verify a fresh build's
// contents. Without this flag, `prepare`'s bob build output mixes into the same stdout
// stream as npm's --json output and breaks the JSON parse below.
const output = execFileSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], {
  encoding: 'utf8',
});
const [{ files }] = JSON.parse(output);
const paths = files.map((file) => file.path);

const violations = paths.flatMap((path) =>
  FORBIDDEN_PATTERNS.filter(({ pattern }) => pattern.test(path)).map(
    ({ label }) => `  ${path} (matched: ${label})`
  )
);

if (violations.length > 0) {
  console.error('npm pack would publish files it should not:\n' + violations.join('\n'));
  process.exit(1);
}

console.log(`OK: ${paths.length} files would be published, none of them example/, tests, mocks, or native project folders.`);
