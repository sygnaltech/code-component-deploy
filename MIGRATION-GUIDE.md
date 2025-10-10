# Migration Guide: Moving to @sygnal/code-component

This guide shows how to migrate an existing Webflow component project to use `@sygnal/code-component`.

## Prerequisites

- Your project is a git repository
- You have `src/version.ts` with `export const VERSION = "x.x.x"`
- You have `webflow.main.json` (or similar main config)

## Migration Checklist

### Step 1: Install the Package

```bash
npm install --save-dev @sygnal/code-component
```

Or for local development with npm link:
```bash
npm link @sygnal/code-component
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
    "deploy": "sygnal-deploy"
  }
}
```

### Step 3: Delete Old Files

Delete these files if they exist:

- ❌ `scripts/deploy.js` (replaced by the package)
- ❌ `webflow.test.json` (auto-generated now)
- ❌ `webflow.json` (will be auto-generated on deploy)

**Commands:**
```bash
rm scripts/deploy.js
rm webflow.test.json
# Optional: rm -rf scripts  # if deploy.js was the only file
```

### Step 4: Verify webflow.main.json

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

**Important:**
- The `name` should NOT include "Test" or version numbers
- The `id` should be your production library ID (no `-test` suffix)

### Step 5: Verify src/version.ts

Ensure your version file exists and has the correct format:

```typescript
export const VERSION = "1.2.3";
```

The package will extract the version using this regex:
```regex
/export const VERSION = ['"]([^'"]+)['"]/
```

### Step 6: Update .gitignore (Optional)

Add `webflow.json` to `.gitignore` since it's auto-generated:

```gitignore
# Webflow
webflow.json
```

### Step 7: Test the Migration

Run a dry-run test to verify everything works:

```bash
# Test that the command is available
npm run deploy -- --help

# This should show:
# sygnal-deploy - Deploy Webflow component libraries
# Usage: sygnal-deploy [options]
# ...
```

### Step 8: Deploy!

```bash
npm run deploy
```

**Expected output:**
```
Current branch: feature/your-branch
✓ Using webflow.main.json (auto-generated test config)
Found VERSION: x.x.x
✓ Updated library name: "Your Library Test" → "Your Library Test vx.x.x ⚠️"
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
    "deploy": "sygnal-deploy"
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

# Custom main branch name
sygnal-deploy --main-branch master
```

Or in package.json:
```json
{
  "scripts": {
    "deploy": "sygnal-deploy --version-file src/constants/version.ts"
  }
}
```

## Summary

**3 Simple Steps:**
1. ✅ `npm install --save-dev @sygnal/code-component`
2. ✅ Update package.json: `"deploy": "sygnal-deploy"`
3. ✅ Delete: `scripts/deploy.js` and `webflow.test.json`

That's it! You're ready to deploy. 🚀
