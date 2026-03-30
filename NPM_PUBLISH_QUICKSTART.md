# 🚀 DX-Ray NPM Publishing - Quick Start

## ✅ Pre-Publishing Checklist

All items completed:

- ✅ Code committed and pushed to GitHub
- ✅ Both packages configured with proper metadata
- ✅ README.md files created for both packages
- ✅ .npmignore files configured to exclude dev files
- ✅ Package names finalized:
  - `@dx-ray/core` (scoped library)
  - `dx-ray` (CLI tool)
- ✅ bin/dx-ray.js has proper shebang
- ✅ npm pack verification passed
- ✅ Dependencies versions locked
- ✅ publishConfig set to public access

## 🎯 Publishing in 3 Steps

### Step 1: Login to npm (One-time setup)

```bash
npm login
# Enter your npm credentials when prompted
```

Verify:

```bash
npm whoami
```

### Step 2: Publish Core Library

```bash
cd packages/core
npm publish
```

Wait 1-2 minutes for npm registry to sync.

### Step 3: Publish CLI

```bash
cd ../cli
npm publish
```

## ✨ Verify Publication

Visit these URLs to confirm:

- <https://www.npmjs.com/package/@dx-ray/core>
- <https://www.npmjs.com/package/dx-ray>

Or check via CLI:

```bash
npm view @dx-ray/core
npm view dx-ray
```

## 🐛 Troubleshooting

**Not logged in?**

```bash
npm login
```

**Scope issues?**

- For `@dx-ray/` scope: npm org setup required
- Alternative: Publish as `dxray-core` (no scope)

**Package name taken?**

- Choose unique name
- Contact original author if it's yours

**Need help?**
See `NPM_PUBLISHING_GUIDE.md` for detailed instructions.

---

## 📦 After Publishing

Users can install:

```bash
# Global CLI
npm install -g dx-ray
dx-ray scan

# Without installing
npx dx-ray scan

# As library
npm install @dx-ray/core
```

---

## 🔄 Version Updates

To publish v1.0.1:

```bash
# Update versions
npm version patch --workspace=packages/core
npm version patch --workspace=packages/cli

# Publish
npm publish --workspace=packages/core
npm publish --workspace=packages/cli
```

---

**You're all set! 🎉 Ready to publish to npm whenever you are.**
