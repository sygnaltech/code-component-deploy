# @sygnal/code-component

Shared tooling for deploying Sygnal Webflow component libraries with branch-based configuration and automatic versioning.

## Features

- 🔀 **Branch-based config switching** - Automatically uses different Webflow configs for `main` vs other branches
- 🏷️ **Automatic versioning** - Extracts version from your source and appends it to library name
- ⚠️ **Test branch indicator** - Adds warning emoji to non-main branch deployments
- 🚀 **One-command deploy** - Handles config switching, versioning, and Webflow upload

## Installation

```bash
npm install --save-dev @sygnal/code-component
```

## Quick Start

### 1. Setup your project structure

Your project needs:

```
your-project/
├── src/
│   └── version.ts              # Export VERSION constant
├── webflow.main.json           # Production config
├── webflow.test.json           # Test/dev config
└── package.json
```

**Example `src/version.ts`:**
```typescript
export const VERSION = "1.2.3";
```

**Example config files:**
```json
// webflow.main.json
{
  "library": {
    "name": "My Component Library",
    "id": "my-library-prod"
  }
}

// webflow.test.json
{
  "library": {
    "name": "My Component Library",
    "id": "my-library-test"
  }
}
```

### 2. Add deploy script to package.json

```json
{
  "scripts": {
    "deploy": "sygnal-deploy"
  }
}
```

### 3. Deploy!

```bash
npm run deploy
```

## How it works

When you run `sygnal-deploy`:

1. **Detects current git branch**
2. **Copies appropriate config** - `webflow.main.json` for `main` branch, `webflow.test.json` otherwise
3. **Reads version** from `src/version.ts`
4. **Updates library name** - Appends version (e.g., "My Library v1.2.3" or "My Library v1.2.3 ⚠️" for non-main)
5. **Runs** `npx webflow library share --no-input`

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
