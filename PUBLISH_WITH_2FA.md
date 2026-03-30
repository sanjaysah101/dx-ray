# Publishing with 2FA

Your npm account requires a one-time password (OTP) from your authenticator to publish.

## Steps to Publish:

### 1. Publish dxray-core

```bash
cd packages/core

# Get OTP from your authenticator app
# Then run:
npm publish --otp=<YOUR_6_DIGIT_CODE>

# Example:
npm publish --otp=123456
```

### 2. Wait 1-2 minutes for registry sync

### 3. Publish dx-ray CLI

```bash
cd ../cli

# Get new OTP from your authenticator
npm publish --otp=<YOUR_6_DIGIT_CODE>
```

## Troubleshooting

**OTP timed out?** 
- Get a new code and try again

**Still showing error?**
- Make sure you're logged in: `npm whoami`
- Try: `npm login` again before publishing

## Complete Publishing Command:

```bash
# Core library
npm publish --otp=123456 --workspace=packages/core

# CLI (after 1-2 min)
npm publish --otp=654321 --workspace=packages/cli
```

---

After publishing, verify:
```bash
npm view dxray-core
npm view dx-ray
```

Then test:
```bash
npx dx-ray scan
```

Done! 🎉
