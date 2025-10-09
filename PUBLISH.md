# Publishing @cbashik/commitlint to NPM

## Prerequisites

1. **NPM Account**: Make sure you have an NPM account
2. **NPM Login**: Login to NPM in your terminal
3. **Package Name**: Ensure `@cbashik/commitlint` is available on NPM

## Steps to Publish

### 1. Login to NPM
```bash
npm login
```

### 2. Verify Package Configuration
```bash
npm run test  # Run any tests
npm pack --dry-run  # Preview what will be published
```

### 3. Publish the Package
```bash
# For first time publishing
npm publish

# For subsequent versions, update version first
npm version patch  # or minor, major
npm publish
```

### 4. Verify Publication
```bash
npm view @cbashik/commitlint
```

## Version Management

- **Patch** (1.0.0 → 1.0.1): Bug fixes
- **Minor** (1.0.0 → 1.1.0): New features, backward compatible
- **Major** (1.0.0 → 2.0.0): Breaking changes

```bash
npm version patch   # 1.0.0 → 1.0.1
npm version minor   # 1.0.0 → 1.1.0
npm version major   # 1.0.0 → 2.0.0
```

## Automated Publishing (Optional)

You can set up GitHub Actions for automated publishing:

1. Add NPM token to GitHub Secrets
2. Create `.github/workflows/publish.yml`
3. Publish on tag creation

## Testing Before Publishing

Test the package locally:

```bash
# In the package directory
npm pack

# In another project
npm install /path/to/@cbashik/commitlint-1.0.0.tgz
```

## Troubleshooting

- **403 Forbidden**: Check if you're logged in and have permissions
- **Package exists**: The package name might be taken
- **Validation errors**: Check package.json format
- **Scoped packages**: Ensure `publishConfig.access` is set to "public"
