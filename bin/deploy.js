#!/usr/bin/env node

const { deploy, getCurrentBranch, getMainBranch, shouldDeployAsRelease } = require('../lib/index');
const readline = require('readline');

/**
 * Prompt user for confirmation before release deployment
 * Uses N/y pattern where Enter defaults to 'no'
 */
async function confirmReleaseDeployment(branch) {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        console.log(`\n⚠️  WARNING: You are about to deploy in RELEASE mode`);
        console.log(`   Branch: ${branch}`);
        console.log(`   This will publish to the production library.\n`);

        rl.question('Continue? (N/y): ', (answer) => {
            rl.close();
            const normalized = answer.trim().toLowerCase();
            resolve(normalized === 'yes' || normalized === 'y');
        });
    });
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {};
let releaseFlag = null; // null = autodetect, true = release, false = prerelease

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
    } else if (arg === '--release') {
        releaseFlag = true;
    } else if (arg === '--prerelease') {
        releaseFlag = false;
    } else if (arg === '--no-input') {
        options.noInput = true;
    } else if (arg === '--help' || arg === '-h') {
        console.log(`
sygnal-deploy - Deploy Webflow component libraries

Usage: sygnal-deploy [options]

Options:
  --version-file <path>   Path to version file (default: src/version.ts)
  --api-token <token>     Webflow API token for deployment
  --manifest <path>       Path to webflow.json manifest (default: webflow.json)
  --release               Force release (production) deployment
  --prerelease            Force prerelease (test) deployment
  --no-input              Skip confirmation prompts (for CI/CD)
  --help, -h              Show this help message

Deployment Modes:
  When neither --release nor --prerelease is specified, deployment mode is
  automatically detected based on the current branch:

  Release mode:  main, master, or branches starting with release/
  Prerelease mode: all other branches

Examples:
  sygnal-deploy                    # Auto-detect based on branch
  sygnal-deploy --release          # Force release deployment
  sygnal-deploy --prerelease       # Force prerelease deployment
  sygnal-deploy --no-input         # Skip prompts (for CI/CD)
        `);
        process.exit(0);
    }
}

// Main deployment logic
(async () => {
    try {
        const branch = getCurrentBranch();

        // Determine deployment mode
        let isPrerelease;
        if (releaseFlag === true) {
            isPrerelease = false;
            console.log(`Deployment mode: RELEASE (forced)`);
        } else if (releaseFlag === false) {
            isPrerelease = true;
            console.log(`Deployment mode: PRERELEASE (forced)`);
        } else {
            // Autodetect based on branch
            isPrerelease = !shouldDeployAsRelease(branch);
            console.log(`Deployment mode: ${isPrerelease ? 'PRERELEASE' : 'RELEASE'} (auto-detected)`);
        }

        console.log(`Current branch: ${branch}`);

        // Check for CI environment or --no-input flag
        const skipPrompt = options.noInput || process.env.CI === 'true';

        // Confirm release deployments unless in CI or --no-input specified
        if (!isPrerelease && !skipPrompt) {
            const confirmed = await confirmReleaseDeployment(branch);
            if (!confirmed) {
                console.log('\n✗ Deployment cancelled by user');
                process.exit(0);
            }
        }

        options.isPrerelease = isPrerelease;

        // Run the deployment
        deploy(options);
    } catch (error) {
        console.error('✗ Deployment failed:', error.message);
        process.exit(1);
    }
})();
