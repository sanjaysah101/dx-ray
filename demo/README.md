# DX-Ray Demo Data

This directory contains anonymized scan results from a real-world codebase for demonstration purposes.

## Before & After

### Before (January 2026)
- **Score: 52/100 (Grade F)**
- 28 findings (6 critical, 14 warnings)
- No TypeScript, no formatting, low test coverage
- Bus factor of 1, 34% late-night commits

### After (March 2026) — After applying DX-Ray suggestions
- **Score: 81/100 (Grade B)** — **+29 point improvement!**
- 9 findings (0 critical, 5 warnings)
- TypeScript migration at 45%, Prettier added
- Test coverage from 34% → 68%
- CI build time reduced by 45%
- Bus factor improved from 1 → 3

## Run the comparison

```bash
node packages/cli/bin/dx-ray.js compare demo/before-scan.json demo/after-scan.json
```

## Key improvements made:
1. ✅ Added TypeScript (45% migrated)
2. ✅ Added Prettier + Husky
3. ✅ Enabled CI caching (45% faster builds)
4. ✅ Added security scanning (Snyk)
5. ✅ Increased test coverage (34% → 68%)
6. ✅ Reduced snapshot tests (63% → 25%)
7. ✅ Updated stale documentation
8. ✅ Removed moment.js, reduced deps from 67 → 45
9. ✅ Distributed code review responsibility
10. ✅ Addressed late-night work patterns
