# Development Guide

## Testing Locally in a Project

To test this package locally in another project without publishing to npm, use npm link:

### 1. Link the package globally

In this repository (code-component-deploy):

```bash
npm link
```

This creates a global symlink to this package.

### 2. Link in your test project

Navigate to the project where you want to test the deployment tool:

```bash
cd /path/to/your/test-project
npm link @sygnal/code-component
```

This creates a symlink from your project's `node_modules/@sygnal/code-component` to the global symlink.

### 3. Use the commands

You can now run the deployment commands in your test project:

```bash
npx sygnal-deploy
# or
npx sygnal-github-deploy
```

Any changes you make to the code-component-deploy source will immediately be reflected in your test project.

### 4. Unlinking when done

When you're finished testing:

In your test project:
```bash
npm unlink @sygnal/code-component
```

In this repository (optional):
```bash
npm unlink
```

## Testing the Version Fallback

The version resolution follows this priority:

1. **VERSION constant** in `src/version.ts` (if file exists and constant is valid)
2. **version field** in project's `package.json` (fallback)
3. **Date-based version** (YYYY-MM-DD format, final fallback)

To test the package.json fallback, create a test project without a `src/version.ts` file and run the deploy command.
