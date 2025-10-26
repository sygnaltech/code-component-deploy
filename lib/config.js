
/* SPDX-License-Identifier: GPL-3.0-only
 * Copyright (C) 2025 Sygnal Technology Group
 */

const fs = require('fs');
const path = require('path');

/**
 * Get the current git branch
 */
function getCurrentBranch() {
    const { execSync } = require('child_process');
    return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
}

/**
 * Determine if a branch should deploy as a release (production) or prerelease
 * Release branches: main, master, or branches starting with release/
 * All other branches are considered prerelease
 */
function shouldDeployAsRelease(branchName) {
    return branchName === 'main' ||
           branchName === 'master' ||
           branchName.startsWith('release/');
}

/**
 * Generate test config from main config
 * Appends "Test" to name and "-test" to ID
 */
function generateTestConfig(mainConfig) {
    const testConfig = JSON.parse(JSON.stringify(mainConfig)); // Deep clone

    // Append "Test" to library name
    testConfig.library.name = `${mainConfig.library.name} Test`;

    // Append "-test" to library ID
    testConfig.library.id = `${mainConfig.library.id}-test`;

    return testConfig;
}

/**
 * Switch to appropriate config based on branch
 * For main branch: uses webflow.main.json
 * For other branches: auto-generates test config from webflow.main.json
 */
function switchConfig(branch, options = {}) {
    const mainBranch = options.mainBranch || 'main';
    const mainConfigPath = path.join(process.cwd(), 'webflow.main.json');
    const targetPath = path.join(process.cwd(), 'webflow.json');

    // Check if main config exists
    if (!fs.existsSync(mainConfigPath)) {
        throw new Error('webflow.main.json not found');
    }

    // Read main config
    const mainConfig = JSON.parse(fs.readFileSync(mainConfigPath, 'utf8'));

    // Determine which config to use
    let config;
    let configSource;

    if (branch === mainBranch) {
        config = mainConfig;
        configSource = 'webflow.main.json';
    } else {
        config = generateTestConfig(mainConfig);
        configSource = 'webflow.main.json (auto-generated test config)';
    }

    // Write to webflow.json
    fs.writeFileSync(targetPath, JSON.stringify(config, null, 2));
    console.log(`✓ Using ${configSource}`);

    return { configSource, targetPath };
}

module.exports = {
    getCurrentBranch,
    shouldDeployAsRelease,
    generateTestConfig,
    switchConfig
};
