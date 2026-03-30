# NPM Publishing Guide for DX-Ray

## Overview

DX-Ray consists of two npm packages:

1. **dxray-core** — Core analysis engine library
2. **dx-ray** — CLI tool (depends on dxray-core)

Both packages are configured and ready to publish to npmjs.com.

---

## Prerequisites

1. **npm Account** — Create one at <https://www.npmjs.com/signup>
2. **npm CLI** — Already installed with Node.js
3. **Git commits** — All changes committed and pushed ✅

## Step-by-Step Publishing Guide

### Step 1: Authenticate with npm

```bash
npm login
```

Enter when prompted:

- **Username** — Your npm username
- **Password** — Your npm password
- **Email** — Your email address registered with npm

Verify authentication:

```bash
npm whoami
```

### Step 2: Verify Package Readiness

```bash
cd /f/dx-ray
npm run build
```

Both packages should build successfully.

---

## Publishing Order

**Important**: Publish `dxray-core` first since `dx-ray` depends on it.

### Publish Core Library

```bash
cd packages/core

# Verify package contents
npm pack

# Publish to npm
npm publish

# Verify publication
npm view dxray-core
```

**Expected output:**

```
npm notice 📦 dxray-core@1.0.0
npm notice === Tarball Contents ===
npm notice 123B   package.json
npm notice 456B   README.md
npm notice 789B   src/index.js
npm notice === Tarball Details ===
npm notice name:          dxray-core
npm notice version:       1.0.0
npm notice publishConfig: {"access":"public"}
```

### Publish CLI Package

Wait 1-2 minutes for npm registry to sync, then:

```bash
cd ../cli

# Verify package contents
npm pack

# Publish to npm
npm publish

# Verify publication
npm view dx-ray
```

---

## Verification

### Check Published Packages

1. **Core Library**

   ```bash
   npm view dxray-core
   npm info dxray-core
   ```

2. **CLI Tool**

   ```bash
   npm view dx-ray
   npm info dx-ray
   ```

3. **On npmjs.com**
   - Visit <https://www.npmjs.com/package/dxray-core>e>
   - Visit <https://www.npmjs.com/package/dx-ray>

### Test Installation

```bash
# Test global CLI installation
npm install -g dx-ray

# Test it works
dx-ray --version
dx-ray scan

# Test library installation
npm install dxray-core
```

---

## Manual Publishing Command (Alternative)

If you prefer to do everything from root:

```bash
cd /f/dx-ray

# Publish core first
npm publish --workspace=packages/core

# Wait 1-2 minutes for sync

# Publish CLI
npm publish --workspace=packages/cli
```

---

## Troubleshooting

### Issue: "You must be logged in to publish"

**Solution:**

```bash
npm login
npm whoami  # Verify you're logged in
```

### Issue: "Package name already exists"

**Solution:**

- Package name is taken on npm
- Choose different name and update package.json
- Or contact original author

### Issue: "Invalid package name"

**Solution:**

- Ensure name matches npm naming rules:
  - Lowercase letters only
  - Hyphens allowed (not underscores)
  - No special characters except @ for scope
  - 214 characters max

### Issue: "Scope @dx-ray not accessible"

**Solution:**

- Scoped packages require org setup
- Free alternative: Publish as `dxray-core` (no scope)
- Or create org at <https://www.npmjs.com/org/create>

---

## After Publishing

### Update Version for Next Release

After publishing 1.0.0:

```bash
# Update both packages to 1.0.1
npm version patch --workspace=packages/core
npm version patch --workspace=packages/cli

# Then publish again
npm publish --workspace=packages/core
npm publish --workspace=packages/cli
```

### Supported Version Commands

```bash
npm version major   # 1.0.0 → 2.0.0
npm version minor   # 1.0.0 → 1.1.0
npm version patch   # 1.0.0 → 1.0.1
```

---

## Distribution Channels

Once published, users can install via:

```bash
# Global CLI
npm install -g dx-ray
npx dx-ray scan

# Library
npm install dxray-core
```

---

## npm Package Pages

After publishing:

- **dxray-core** → <https://www.npmjs.com/package/dxray-core>e>
- **dx-ray** → <https://www.npmjs.com/package/dx-ray>

Share these links in:

- GitHub README
- Team documentation
- Release announcements

---

## CI/CD Integration

For automated publishing on release:

```yaml
# .github/workflows/publish.yml
name: Publish to npm

on:
  push:
    tags:
      - "v*"

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
          registry-url: "https://registry.npmjs.org"

      - run: npm ci
      - run: npm publish --workspace=packages/core
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

      - run: npm publish --workspace=packages/cli
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

To set this up:

1. Generate NPM token at <https://www.npmjs.com/settings/~/tokens>
2. Add to GitHub secrets as `NPM_TOKEN`
3. Push tags to trigger: `git tag v1.0.0 && git push --tags`

---

## Community Links

After publishing, share:

```markdown
## Installation

### As a global tool

\`\`\`bash
npm install -g dx-ray
dx-ray scan
\`\`\`

### As a library

\`\`\`bash
npm install dxray-core
\`\`\`

### Or use without installing

\`\`\`bash
npx dx-ray scan
\`\`\`

## Links

- [dx-ray on npm](https://www.npmjs.com/package/dx-ray)
- [dxray-core on npm](https://www.npmjs.com/package/dxray-core)
- [GitHub Repository](https://github.com/yourusername/dx-ray)
```

---

## Support & Maintenance

After publishing:

- Monitor npm package stats
- Respond to issues
- Plan updates
- Consider major features for v2.0
- Collect community feedback

---

**Ready to publish?** Start with Step 1: npm login
