# @sygnal/code-component

Shared tooling for deploying Sygnal Webflow component libraries with branch-based configuration and automatic versioning.

## Features

- 🔀 **Branch-based config switching** - Automatically uses different Webflow configs for `main` vs other branches
- 🏷️ **Automatic versioning** - Extracts version from your source and appends it to library name
- ⚠️ **Test branch indicators** - Adds warning emoji to library name AND component names on non-main branches
- 🚀 **One-command deploy** - Handles config switching, versioning, and Webflow upload
- 🛡️ **Safe deployments** - Uses temporary `/deploy` directory, original source files never modified
- 🧹 **Auto-cleanup** - Temporary files cleaned up automatically (even on errors)

## Installation

```bash
npm install --save-dev @sygnal/code-component
```

## Quick Start

### 1. Setup your project structure

Your project needs only **2 files**:

```
your-project/
├── src/
│   └── version.ts              # Export VERSION constant
├── webflow.main.json           # Production config (ONLY file needed!)
└── package.json
```

**Example `src/version.ts`:**
```typescript
export const VERSION = "1.2.3";
```

**Example `webflow.main.json`:**
```json
{
  "library": {
    "name": "My Component Library",
    "components": ["./src/**/*.webflow.@(js|jsx|mjs|ts|tsx)"],
    "description": "My Component Library",
    "id": "my-library"
  }
}
```

**That's it!** The script automatically generates test config from `webflow.main.json`:
- Appends "Test" to the library name
- Appends "-test" to the library ID

### 2. Add deploy script to package.json

```json
{
  "scripts": {
    "deploy": "sygnal-deploy"
  }
}
```

### 3. Add to .gitignore

```gitignore
# Webflow deployment
webflow.json
/deploy
```

### 4. Deploy!

```bash
npm run deploy
```

## How it works

### On `main` branch:

1. **Detects git branch** → `main`
2. **Uses** `webflow.main.json` directly
3. **Reads version** from `src/version.ts`
4. **Updates library name** with version
5. **Deploys** directly from `src/` files
6. **Result:**
   - Library name: "My Component Library v1.2.3"
   - Library ID: "my-library"
   - Component names: "Toggle", "Form Upload", etc. (clean names)

### On any other branch (feature/test/dev):

1. **Detects git branch** → `feature/test`
2. **Copies** `src/` → `/deploy/src/` with component names modified (adds ⚠️)
3. **Auto-generates** test config from `webflow.main.json`
4. **Updates** `webflow.json` to point to `/deploy/src/**/*.webflow.*`
5. **Reads version** from `src/version.ts`
6. **Updates library name** with version + warning
7. **Deploys** from `/deploy` directory
8. **Cleans up** `/deploy` directory (even on error)
9. **Result:**
   - Library name: "My Component Library Test v1.2.3 ⚠️"
   - Library ID: "my-library-test"
   - Component names: "Toggle ⚠️", "Form Upload ⚠️", etc. (with warnings!)

### Why the `/deploy` directory?

- ✅ **Your source files are never touched** - 100% safe
- ✅ **Crash-safe** - Original files untouched even if script fails
- ✅ **Debuggable** - Can inspect `/deploy` if something goes wrong
- ✅ **No git conflicts** - `/deploy` is gitignored

## Advanced Usage

### Custom version file location

```bash
sygnal-deploy --version-file src/constants/version.ts
```

### Custom main branch name

```bash
sygnal-deploy --main-branch master
```

### Programmatic API

You can also use the library programmatically:

```javascript
const { deploy } = require('@sygnal/code-component');

deploy({
  versionFile: 'src/version.ts',
  mainBranch: 'main',
  noInput: true
});
```

### Individual functions

```javascript
const {
  getCurrentBranch,
  switchConfig,
  extractVersion,
  updateLibraryName,
  shareLibrary
} = require('@sygnal/code-component');

const branch = getCurrentBranch();
const version = extractVersion('src/version.ts');
// ... use functions individually
```

## Requirements

- Node.js >= 14
- Git repository
- `@webflow/webflow-cli` installed (peer dependency)

## License

MIT
