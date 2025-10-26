#!/usr/bin/env node

/* SPDX-License-Identifier: GPL-3.0-only
 * Copyright (C) 2025 Sygnal Technology Group
 */

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
    } else if (arg === '--api-token' && args[i + 1]) {
        options.apiToken = args[i + 1];
        i++;
    } else if (arg === '--manifest' && args[i + 1]) {
        options.manifest = args[i + 1];
        i++;
    } else if (arg === '--is-prerelease') {
        options.isPrerelease = true;
    } else if (arg === '--help' || arg === '-h') {
        console.log(`
sygnal-github-deploy - Deploy Webflow component libraries from GitHub Actions

Usage: sygnal-github-deploy [options]

Options:
  --version-file <path>   Path to version file (default: src/version.ts)
  --api-token <token>     Webflow API token for deployment
  --manifest <path>       Path to webflow.json manifest (default: webflow.json)
  --is-prerelease         Mark this as a prerelease deployment (adds warnings)
  --help, -h              Show this help message

Examples:
  sygnal-github-deploy --api-token abc123 --manifest webflow.json
  sygnal-github-deploy --api-token abc123 --is-prerelease
        `);
        process.exit(0);
    }
}

// Run the deployment
deploy(options);
