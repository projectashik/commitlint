# Ashik Commitlint Practice

Use this skill to craft commit messages that satisfy the @cbashik/commitlint
rules defined in `index.js`.

## Commit message format

```
<type>[optional scope]: <subject>

[optional body]

[optional footer]
```

The parser expects `type(scope): subject` or `type: subject`.

## Allowed types

- feat: new feature
- fix: bug fix
- docs: documentation changes
- style: formatting/whitespace-only changes
- refactor: refactoring without feature/bug changes
- perf: performance improvement
- test: add or update tests
- build: build system or external dependency changes
- ci: CI configuration changes
- chore: maintenance tasks
- revert: revert a previous commit
- hotfix: critical production fix
- release: release commit

## Rules summary

- Header length: 10-100 characters
- Type: required, lowercase, must be in the allowed list
- Scope: optional, lowercase, max 20 characters
- Subject: required, lowercase, 3-80 characters, no trailing period
- Body: optional, max line length 100, blank line before body (warning)
- Footer: optional, max line length 100, blank line before footer (warning)

## Examples

Valid:

- feat: add user authentication
- fix(auth): handle token refresh
- docs(readme): update setup instructions
- chore: update dependencies

Invalid:

- FEAT: add feature (type must be lowercase)
- feat: Add feature. (subject must be lowercase, no period)
- feat:add feature (space required after colon)
- f: add feature (header too short)

## Help

See the canonical format guidance:
https://github.com/projectashik/commitlint#commit-message-format
