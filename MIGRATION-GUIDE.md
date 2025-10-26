# Migration Guide: Moving to @sygnal/code-component

This guide shows how to migrate an existing Webflow component project to use `@sygnal/code-component`.

## Prerequisites

- Your project is a git repository
- Your default branch is named `main` or `master` 
- Your Webflow code component project is setup as per the docs 

## Migration Checklist

### Step 1: Install the Package

```bash
npm install --save-dev @sygnal/code-component
```


### Step 2: Update package.json

**Find this:**
```json
{
  "scripts": {
    "deploy": "node scripts/deploy.js"
  }
}
```

**Replace with:**
```json
{
  "scripts": {
    "deploy": "sygnal-deploy",
    "deploy-prod": "sygnal-deploy --release",
    "deploy-test": "sygnal-deploy --prerelease"
  }
}
```

### Step 3: Prepare and verify webflow.main.json

**Rename `webflow.json` to `webflow.main.json`.**  

Ensure your `webflow.main.json` has the correct structure:

```json
{
  "library": {
    "name": "Your Library Name",
    "components": ["./src/**/*.webflow.@(js|jsx|mjs|ts|tsx)"],
    "description": "Your Library Description",
    "id": "your-library-id"
  }
}
```

### Step 4: Verify src/version.ts

Ensure your version file exists and uses standard semver format:

```typescript
export const VERSION = "1.2.3";
```

> Do not prefix your version with `v`, this will be done automatically. 

### Step 5: Update .gitignore (Optional)

Add `webflow.json` to `.gitignore` since it's auto-generated:

```gitignore
# Webflow
webflow.json
```

### Step 6: Test the Migration

Run a dry-run test to verify everything works:

```bash
# Test that the command is available
npm run deploy -- --help

# This should show:
# sygnal-deploy - Deploy Webflow component libraries
# Usage: sygnal-deploy [options]
# ...
```

### Step 7: Deploy!

```bash
# Auto-detect based on branch
npm run deploy

# Or force specific mode
npm run deploy-prod    # Force release (with confirmation)
npm run deploy-test    # Force prerelease
```

**Expected output (on feature branch):**
```
Deployment mode: PRERELEASE (auto-detected)
Current branch: feature/your-branch
✓ Using webflow.main.json (auto-generated test config)
Found VERSION: x.x.x
✓ Updated library name: "Your Library Test" → "Your Library Test vx.x.x ⚠️"
Running webflow library share...
✓ Successfully shared library to Webflow

✓ Deployment completed successfully!
```

**Expected output (on main branch):**
```
Deployment mode: RELEASE (auto-detected)
Current branch: main

⚠️  WARNING: You are about to deploy in RELEASE mode
   Branch: main
   This will publish to the production library.

Continue? (N/y): y
✓ Using webflow.main.json
Found VERSION: x.x.x
✓ Updated library name: "Your Library" → "Your Library vx.x.x"
Running webflow library share...
✓ Successfully shared library to Webflow

✓ Deployment completed successfully!
```

## Complete File Checklist

### ✅ Files to Keep/Create

- ✅ `package.json` (updated scripts)
- ✅ `webflow.main.json` (your main config)
- ✅ `src/version.ts` (version constant)
- ✅ `.gitignore` (add webflow.json)

### ❌ Files to Delete

- ❌ `scripts/deploy.js`
- ❌ `webflow.test.json`
- ❌ `webflow.json` (if committed - will be auto-generated)

### 📦 NPM Changes

**Add to devDependencies:**
```json
{
  "devDependencies": {
    "@sygnal/code-component": "^0.2.0"
  }
}
```

**Already have these (no changes needed):**
- `@webflow/webflow-cli` (peer dependency, should already exist)

## Before and After Comparison

### Before (Old Setup)

**File Structure:**
```
project/
├── scripts/
│   └── deploy.js              ❌ Delete this
├── src/
│   └── version.ts             ✅ Keep
├── webflow.main.json          ✅ Keep
├── webflow.test.json          ❌ Delete this
├── webflow.json               ❌ Delete (auto-generated)
└── package.json               ✅ Update
```

**package.json:**
```json
{
  "scripts": {
    "deploy": "node scripts/deploy.js"
  }
}
```

### After (New Setup)

**File Structure:**
```
project/
├── src/
│   └── version.ts             ✅ Required
├── webflow.main.json          ✅ Required (only config file needed!)
└── package.json               ✅ Updated
```

**package.json:**
```json
{
  "scripts": {
    "deploy": "sygnal-deploy",
    "deploy-prod": "sygnal-deploy --release",
    "deploy-test": "sygnal-deploy --prerelease"
  },
  "devDependencies": {
    "@sygnal/code-component": "^0.2.0"
  }
}
```

## Troubleshooting

### Issue: "webflow.main.json not found"

**Solution:** Rename your main config file to `webflow.main.json`, or use:
```bash
sygnal-deploy --help  # See custom options
```

### Issue: "Could not extract VERSION from src/version.ts"

**Solution:** Ensure your version.ts has this exact format:
```typescript
export const VERSION = "1.2.3";  // or '1.2.3'
```

### Issue: "Command 'sygnal-deploy' not found"

**Solution:** The package isn't installed. Run:
```bash
npm install --save-dev @sygnal/code-component
```

### Issue: Old deploy script is still running

**Solution:**
1. Check `package.json` scripts section is updated to `"deploy": "sygnal-deploy"`
2. Delete the old `scripts/deploy.js` file
3. Run `npm run deploy` again

## Advanced: Custom Configuration

If your project doesn't follow the standard structure, you can use options:

```bash
# Custom version file location
sygnal-deploy --version-file src/constants/version.ts

# Force specific deployment mode
sygnal-deploy --release           # Force release (with confirmation)
sygnal-deploy --prerelease        # Force prerelease

# Skip confirmation prompts (for CI/CD)
sygnal-deploy --no-input
sygnal-deploy --release --no-input
```

Or in package.json:
```json
{
  "scripts": {
    "deploy": "sygnal-deploy --version-file src/constants/version.ts",
    "deploy-prod": "sygnal-deploy --release",
    "deploy-test": "sygnal-deploy --prerelease"
  }
}
```

### Deployment Mode Logic

When neither `--release` nor `--prerelease` is specified, the mode is auto-detected:
- **Release mode**: `main`, `master`, or branches starting with `release/`
- **Prerelease mode**: all other branches

Release deployments require confirmation unless `--no-input` is specified or `CI=true` environment variable is set.

## Summary

**3 Simple Steps:**
1. ✅ `npm install --save-dev @sygnal/code-component`
2. ✅ Update package.json: `"deploy": "sygnal-deploy"`
3. ✅ Delete: `scripts/deploy.js` and `webflow.test.json`

That's it! You're ready to deploy. 🚀
