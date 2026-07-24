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
// contents. npm's own handling of --ignore-scripts for `pack` is version-dependent: some
// versions (e.g. npm 10.x, bundled with Node 22) still run `prepare` and print its output
// to stdout ahead of the JSON, so we can't assume the whole stream is clean JSON - instead
// find the array's own line, since npm always emits it as pretty-printed JSON starting
// with a lone "[" on its own line.
const output = execFileSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], {
  encoding: 'utf8',
});
const jsonStart = output.lastIndexOf('\n[\n');
const json = jsonStart === -1 ? output : output.slice(jsonStart + 1);
const [{ files }] = JSON.parse(json);
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
