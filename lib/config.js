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
 * Automatically detect the main branch of the repository
 * Returns the default branch name (e.g., 'main', 'master', 'develop')
 */
function getMainBranch() {
    const { execSync } = require('child_process');
    try {
        // First try: Get the default branch from remote HEAD
        const remoteBranch = execSync('git rev-parse --abbrev-ref origin/HEAD', { encoding: 'utf8' }).trim();
        // Returns "origin/main" or "origin/master", so extract the branch name
        return remoteBranch.replace('origin/', '');
    } catch (error) {
        // Fallback 1: Try to get it from symbolic-ref
        try {
            const symbolicRef = execSync('git symbolic-ref refs/remotes/origin/HEAD', { encoding: 'utf8' }).trim();
            // Returns "refs/remotes/origin/main", extract the branch name
            return symbolicRef.replace('refs/remotes/origin/', '');
        } catch (error2) {
            // Fallback 2: Default to 'main' if detection fails
            console.warn('Could not detect main branch automatically, defaulting to "main"');
            return 'main';
        }
    }
}

/**
 * Determine if a branch should deploy as a release (production) or prerelease
 * Release branches: main, master, or branches starting with release/
 * All other branches are considered prerelease
 */
function shouldDeployAsRelease(branchName) {
    const mainBranch = getMainBranch();

    return branchName === mainBranch ||
           branchName === 'main' ||
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
    getMainBranch,
    shouldDeployAsRelease,
    generateTestConfig,
    switchConfig
};
