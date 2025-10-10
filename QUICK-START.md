# Quick Start: New Project Setup

Setting up a new Webflow component project with `@sygnal/code-component`.

## For Brand New Projects

### 1. Install

```bash
npm install --save-dev @sygnal/code-component @webflow/webflow-cli
```

### 2. Create Required Files

**Create `webflow.main.json`:**
```json
{
  "library": {
    "name": "My Component Library",
    "components": ["./src/**/*.webflow.@(js|jsx|mjs|ts|tsx)"],
    "description": "My Component Library",
    "id": "my-library-id"
  }
}
```

**Create `src/version.ts`:**
```typescript
export const VERSION = "0.1.0";
```

### 3. Add Script to package.json

```json
{
  "scripts": {
    "deploy": "sygnal-deploy"
  }
}
```

### 4. Deploy!

```bash
npm run deploy
```

---

## For Existing Projects (Migration)

See [MIGRATION-GUIDE.md](./MIGRATION-GUIDE.md) or [MIGRATION-CHECKLIST.txt](./MIGRATION-CHECKLIST.txt) for step-by-step instructions.

**TL;DR:**
```bash
# Install package
npm install --save-dev @sygnal/code-component

# Update package.json "deploy" script to "sygnal-deploy"

# Delete old files
rm scripts/deploy.js webflow.test.json

# Test
npm run deploy
```

---

## File Structure

### Minimum Required Files
```
your-project/
├── src/
│   └── version.ts              # export const VERSION = "x.x.x"
├── webflow.main.json           # Your library config
└── package.json                # With "deploy": "sygnal-deploy"
```

### That's it!

No `webflow.test.json` needed - it's auto-generated!

---

## How It Works

```
On main branch:
  webflow.main.json → webflow.json
  Library: "My Library v1.0.0"
  ID: "my-library-id"

On other branches (feature/test/dev):
  webflow.main.json → Auto-generate test config → webflow.json
  Library: "My Library Test v1.0.0 ⚠️"
  ID: "my-library-id-test"
```

---

## Commands

### Deploy
```bash
npm run deploy
```

### Deploy with options
```bash
npm run deploy -- --version-file src/constants/version.ts
npm run deploy -- --main-branch master
```

### Help
```bash
npm run deploy -- --help
```

---

## Options

| Option | Default | Description |
|--------|---------|-------------|
| `--version-file` | `src/version.ts` | Path to version file |
| `--main-branch` | `main` | Name of production branch |
| `--help` | - | Show help message |

---

## Example Projects

See the complete example at: `d:\Projects\sygnal-forms\`

Key files:
- [package.json](d:\Projects\sygnal-forms\package.json)
- [webflow.main.json](d:\Projects\sygnal-forms\webflow.main.json)
- [src/version.ts](d:\Projects\sygnal-forms\src\version.ts)

---

## Troubleshooting

**"sygnal-deploy: command not found"**
- Run: `npm install --save-dev @sygnal/code-component`

**"webflow.main.json not found"**
- Create the file or use `--config` option (future feature)

**"Could not extract VERSION"**
- Ensure `src/version.ts` has: `export const VERSION = "x.x.x";`

---

## Need Help?

- Full migration guide: [MIGRATION-GUIDE.md](./MIGRATION-GUIDE.md)
- Checklist format: [MIGRATION-CHECKLIST.txt](./MIGRATION-CHECKLIST.txt)
- npm link workflow: [NPM-LINK-WORKFLOW.md](./NPM-LINK-WORKFLOW.md)
- Full README: [README.md](./README.md)
