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
 * Determine which config file to use based on branch
 */
function getConfigFile(branch, options = {}) {
    const mainBranch = options.mainBranch || 'main';
    return branch === mainBranch ? 'webflow.main.json' : 'webflow.test.json';
}

/**
 * Copy the appropriate config file to webflow.json
 */
function switchConfig(branch, options = {}) {
    const configFile = getConfigFile(branch, options);
    const configPath = path.join(process.cwd(), configFile);
    const targetPath = path.join(process.cwd(), 'webflow.json');

    if (!fs.existsSync(configPath)) {
        throw new Error(`Config file not found: ${configFile}`);
    }

    fs.copyFileSync(configPath, targetPath);
    console.log(`✓ Copied ${configFile} to webflow.json`);

    return { configFile, targetPath };
}

module.exports = {
    getCurrentBranch,
    getConfigFile,
    switchConfig
};
