# AGENTS

This repository publishes a custom commitlint configuration for cbashik projects.
Keep changes focused on configuration and documentation, and preserve Node.js
compatibility across the CI matrix (Node 16/18/20).

## Where things live

- `index.js`: main commitlint configuration (CommonJS export)
- `README.md`: usage, rules, and examples
- `CHANGELOG.md`: release notes (Keep a Changelog + SemVer)
- `PUBLISH.md`: manual publishing checklist
- `.github/workflows/*.yml`: CI and publish workflows
- `package.json`: scripts, metadata, and files published to npm

## Build, lint, test

There is no build step for this package; it ships raw JavaScript.

Install dependencies:

```bash
npm ci
```

Run tests (currently a no-op script):

```bash
npm test
```

Run the package validation used in CI:

```bash
npm pack --dry-run
```

Convenience script (same as above):

```bash
npm run validate
```

Check/normalize `package.json` formatting (CI runs this, but ignores failures):

```bash
npm pkg fix --dry-run
```

Test local installation (CI does this after packing):

```bash
npm pack
npm install -g ./cbashik-commitlint-*.tgz
```

### Running a single test

There is no test runner or test suite in this repository. The `npm test`
script only prints a message and exits. If you add tests, update `package.json`
so a single-test command is supported and document it here.

## Code style guidelines

### Module system and imports

- Use CommonJS (`module.exports = { ... }`). Do not introduce ESM exports.
- Avoid runtime logic; this package is configuration-only.
- If you must import something, prefer `const x = require("...")` at the top
  of the file and keep dependencies minimal.

### Formatting

- Indentation: 2 spaces (match `index.js`).
- Quotes: double quotes for strings.
- Trailing commas in multi-line arrays/objects.
- Keep sections grouped with short comments (Header rules, Type rules, etc.).
- Keep line lengths reasonable (<= 100 where practical).

### Rule structure

- Commitlint rules are arrays of `[level, "always"|"never", value]`.
- Use numeric levels: 0 = off, 1 = warn, 2 = error.
- Keep the rule list ordered by logical groups (header, type, scope, subject,
  body, footer, custom).
- When adding new commit types, update both `index.js` and `README.md`.

### Naming conventions

- Rule names and commit types are lowercase with hyphens (commitlint standard).
- Scopes are optional, lowercase, max 20 characters.
- File names are lowercase with extensions (e.g., `index.js`).

### Types and typing

- This repo is plain JavaScript (no TypeScript config).
- Avoid introducing type tooling unless there is a clear requirement.
- If adding complex logic, prefer small helper functions and document behavior
  with concise comments or JSDoc.

### Error handling

- Prefer declarative configuration over runtime errors.
- If you must add validation logic, throw explicit `Error` messages that point
  to the misconfiguration.
- Avoid silent failures or swallowing errors.

### Documentation and metadata

- Keep `README.md` in sync with `index.js` rules and examples.
- Update `CHANGELOG.md` for user-facing changes.
- Update `package.json` `files` field if new publishable files are added.
- Keep `helpUrl` in `index.js` pointing to the canonical README section.

## Release and publishing notes

- Release scripts exist in `package.json`: `release:patch`, `release:minor`,
  `release:major` (they run `npm version` and `git push --follow-tags`).
- The publish workflow runs on tags matching `v*` or GitHub releases.
- Publishing requires `NODE_AUTH_TOKEN` in GitHub Actions.

## CI expectations

- CI runs `npm test` and `npm pack --dry-run`.
- CI installs with `npm ci` and checks `package.json` formatting.
- Keep compatibility with Node 16+ (avoid newer-only Node APIs).

## Cursor/Copilot rules

- No `.cursor/rules`, `.cursorrules`, or `.github/copilot-instructions.md`
  files are present in this repository at the time of writing.
- If any are added later, they must be reflected here.
