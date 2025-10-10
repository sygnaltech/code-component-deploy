const { getCurrentBranch, generateTestConfig, switchConfig } = require('./config');
const { extractVersion, updateLibraryName } = require('./version');
const { shareLibrary } = require('./webflow');
const { prepareDeployDirectory, createDeployConfig, cleanupDeployDirectory } = require('./components');
const fs = require('fs');
const path = require('path');

/**
 * Main deploy function that orchestrates the entire process
 */
function deploy(options = {}) {
    try {
        // Get current branch
        const branch = getCurrentBranch();
        const mainBranch = options.mainBranch || 'main';
        const isNonMain = branch !== mainBranch;

        console.log(`Current branch: ${branch}`);

        // Prepare deploy directory (copy src, optionally add warnings)
        if (isNonMain) {
            prepareDeployDirectory({ addWarnings: true });
        }

        // Switch to appropriate config
        const { targetPath } = switchConfig(branch, options);

        // If non-main branch, update webflow.json to point to deploy directory
        if (isNonMain) {
            const config = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
            const deployConfig = createDeployConfig(null, config);
            fs.writeFileSync(targetPath, JSON.stringify(deployConfig, null, 2));
            console.log('✓ Updated webflow.json to use deploy directory');
        }

        // Extract version from version file
        const versionFile = options.versionFile || 'src/version.ts';
        const version = extractVersion(versionFile);
        console.log(`Found VERSION: ${version}`);

        // Update library name with version
        updateLibraryName(targetPath, version, branch, options);

        // Share to Webflow
        shareLibrary(options);

        // Clean up deploy directory
        if (isNonMain) {
            cleanupDeployDirectory();
        }

        console.log('\n✓ Deployment completed successfully!');
    } catch (error) {
        // Always clean up on error
        try {
            cleanupDeployDirectory();
        } catch (cleanupError) {
            console.warn('Warning: Could not clean up deploy directory');
        }

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
    shareLibrary,
    prepareDeployDirectory,
    createDeployConfig,
    cleanupDeployDirectory
};
