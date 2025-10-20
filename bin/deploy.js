#!/usr/bin/env node

const { deploy } = require('../lib/index');

// Parse command line arguments for future extensibility
const args = process.argv.slice(2);
const options = {};

// Simple argument parsing
for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--version-file' && args[i + 1]) {
        options.versionFile = args[i + 1];
        i++;
    } else if (arg === '--main-branch' && args[i + 1]) {
        options.mainBranch = args[i + 1];
        i++;
    } else if (arg === '--api-token' && args[i + 1]) {
        options.apiToken = args[i + 1];
        i++;
    } else if (arg === '--manifest' && args[i + 1]) {
        options.manifest = args[i + 1];
        i++;
    } else if (arg === '--help' || arg === '-h') {
        console.log(`
sygnal-deploy - Deploy Webflow component libraries

Usage: sygnal-deploy [options]

Options:
  --version-file <path>   Path to version file (default: src/version.ts)
  --main-branch <name>    Name of main branch (default: main)
  --api-token <token>     Webflow API token for deployment
  --manifest <path>       Path to webflow.json manifest (default: webflow.json)
  --help, -h              Show this help message

Examples:
  sygnal-deploy
  sygnal-deploy --version-file src/constants/version.ts
  sygnal-deploy --main-branch master
  sygnal-deploy --api-token abc123 --manifest webflow.json
        `);
        process.exit(0);
    }
}

// Run the deployment
deploy(options);
