# @cbashik/commitlint

Custom commitlint configuration for cbashik projects following conventional commits with additional rules and types.

## Installation

```bash
npm install --save-dev @cbashik/commitlint @commitlint/cli
# or
yarn add --dev @cbashik/commitlint @commitlint/cli
# or
pnpm add -D @cbashik/commitlint @commitlint/cli
# or
bun add -d @cbashik/commitlint @commitlint/cli
```

## Quick setup (init command)

```bash
npx @cbashik/commitlint --init
# or (interactive prompts)
npx @cbashik/commitlint --init --ask
# or
pnpm dlx @cbashik/commitlint --init
# or
yarn dlx @cbashik/commitlint --init
# or
bunx @cbashik/commitlint --init
```

The init command detects your package manager from lockfiles (bun, pnpm, yarn,
npm), installs `@cbashik/commitlint` and `@commitlint/cli` (and Husky if needed),
adds commitlint config to your `package.json` when missing, initializes Husky,
and writes a `commit-msg` hook using the matching executor. Add `--ask` to be
prompted for each option with the detected/default choice preselected.
When run inside a Turborepo workspace, init installs and sets up Husky at the
workspace root (pnpm uses `-w`).

## Usage

Extend it in your `package.json`:

```json
{
  "commitlint": {
    "extends": ["@cbashik/commitlint"]
  }
}
```

Or create a `commitlint.config.js` file in your project root:

```javascript
module.exports = {
  extends: ['@cbashik/commitlint']
};
```

## Commit Message Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Rules

- **Header length**: 10-100 characters
- **Subject length**: 3-80 characters
- **Body line length**: Max 100 characters
- **Type**: Required, lowercase
- **Scope**: Optional, lowercase, max 20 characters
- **Subject**: Required, lowercase, no period at end

### Supported Types

- `feat` - A new feature
- `fix` - A bug fix
- `docs` - Documentation only changes
- `style` - Code style changes (formatting, missing semi-colons, etc)
- `refactor` - Code refactoring without feature changes or bug fixes
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `build` - Build system or external dependency changes
- `ci` - CI configuration changes
- `chore` - Other changes that don't modify src or test files
- `revert` - Reverts a previous commit
- `hotfix` - Critical fixes for immediate deployment
- `release` - Release commits

### Examples

✅ **Valid commits:**
```
feat: add user authentication
fix(auth): resolve token expiration issue
docs: update API documentation
chore: update dependencies
feat(api): implement OAuth2 integration
hotfix: fix critical security vulnerability
```

❌ **Invalid commits:**
```
Update stuff                    # Missing type
FEAT: add feature              # Wrong case
feat: Add new feature.         # Subject starts with capital and ends with period
feat:add feature               # Missing space after colon
f: add feature                 # Subject too short
feat: this is a very long commit message that exceeds the maximum allowed length for the header  # Header too long
```

## Integration with Husky

Add to your `package.json`:

```json
{
  "husky": {
    "hooks": {
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  }
}
```

Or with Husky v6+, create `.husky/commit-msg`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx --no -- commitlint --edit $1
```

## License

MIT
