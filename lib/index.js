const { getCurrentBranch, generateTestConfig, switchConfig } = require('./config');
const { extractVersion, updateLibraryName } = require('./version');
const { shareLibrary } = require('./webflow');
const path = require('path');

/**
 * Main deploy function that orchestrates the entire process
 */
function deploy(options = {}) {
    try {
        // Get current branch
        const branch = getCurrentBranch();
        console.log(`Current branch: ${branch}`);

        // Switch to appropriate config
        const { targetPath } = switchConfig(branch, options);

        // Extract version from version file
        const versionFile = options.versionFile || 'src/version.ts';
        const version = extractVersion(versionFile);
        console.log(`Found VERSION: ${version}`);

        // Update library name with version
        updateLibraryName(targetPath, version, branch, options);

        // Share to Webflow
        shareLibrary(options);

        console.log('\n✓ Deployment completed successfully!');
    } catch (error) {
        console.error('✗ Deploy failed:', error.message);
        process.exit(1);
    }
}

module.exports = {
    deploy,
    getCurrentBranch,
    generateTestConfig,
    switchConfig,
    extractVersion,
    updateLibraryName,
    shareLibrary
};
