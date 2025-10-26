# @sygnal/code-component

This package enhances Webflow's CLI library deployment with clear versioning and pre-release support in your libraries. 

## Versioning 

All library names are adjusted to include the current version number, e.g. `My Library` becomes `My Library v1.1.2`.

This makes it possible to easily identify which version is installed in a workspace, and which version each site has installed. 

## Pre-Release Support 

Integration testing code component libraries means you need to deploy them into Webflow- however this is problematic for production workspaces, since it can conflict with versions you already rely on. 

These deployment scripts ensure that your pre-release testing is visible and isolated from your production libraries. 

- The internal name of your pre-release libraries is adjusted so that e.g. `my-library` becomes `my-library-test`.  This ensures that Webflow sees this as a completely distinct library, and will not replace installed components from your production library. 

For visibility; 

- Pre-release libraries have ⚠️ affixed, e.g. `My Library v.1.1.3 ⚠️` 
- All components names within the library also have ⚠️ affixed 

Usage notes; 

Release v. pre-release deployment is git branch-aware. 

- Currently, the `main` branch is considered the production branch.  Any deployments from the `main` branch are considered standard production deployments. 
- Deployments from any other branch, e.g. `feature/new-component` are considered pre-release deployments, and will deploy the library in pre-release mode. 

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

## Development Workflow 

Pre-release phase;

- `git checkout -b new-feature` to create pre-release branch 
- Perform your development work 
- Do linting locally, and local component testing where possible 

Integration testing phase; 

- From your pre-release branch, e.g. `new-feature` 
- Deploy to Webflow as a pre-release library using `npm run deploy` 
- Test your library fully in Webflow.  
  - It can be safely deployed and tested alongside production versions
  - The library and your components are tagged  with ⚠️ for visibility in the designer nav, canvas, component panel, and quick find. 

Production release;

- When ready to deploy, switch to your `main` production branch 
- Merge in your feature-branch changes `npm merge feature/new-feature` 
- Update the version number in `src/version.ts`, if needed  
- Deploy to Webflow as a production library using `npm run deploy` 

## Best Practices

- Use `main`, not `master` as your main production branch. 
- We prefer the `feature/*` branch naming convention for our component development.  It keeps each component separate and individually testable.  However this naming convention is arbitrary. 
- If you have complex CMS binding for your components, you can either;
  - Add both the release & pre-release libraries to your project and test the components side-by-side with the same CMS bindings for easy comparison
  - Or, clone your Webflow project and use the clone for your pre-release component testing. 

> Currently code components can be installed on any project that is on a paid site plan, or within a paid workspace.  So ensure at least one of those are true to support your testing strategy. 

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
