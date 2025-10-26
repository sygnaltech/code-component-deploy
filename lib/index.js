const { getCurrentBranch, getMainBranch, shouldDeployAsRelease, generateTestConfig, switchConfig } = require('./config');
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
        // isPrerelease is set by the calling script (bin/deploy.js or bin/github-deploy.js)
        const isPrerelease = !!options.isPrerelease;

        // Prepare deploy directory (copy src, optionally add warnings)
        if (isPrerelease) {
            prepareDeployDirectory({ addWarnings: true });
        }

        // Switch to appropriate config
        const { targetPath } = switchConfig(isPrerelease ? 'prerelease' : 'main', options);

        // If prerelease, update webflow.json to point to deploy directory
        if (isPrerelease) {
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
        updateLibraryName(targetPath, version, isPrerelease ? 'prerelease' : 'main', options);

        // Inject telemetry config to suppress prompt
        const config = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
        config.telemetry = {
            global: {
                allowTelemetry: true,
                lastPrompted: Date.now(),
                version: '1.8.40'
            }
        };
        fs.writeFileSync(targetPath, JSON.stringify(config, null, 2));
        console.log('✓ Added telemetry config to webflow.json');

        // Share to Webflow
        shareLibrary(options);

        // Clean up deploy directory
        if (isPrerelease) {
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
    getMainBranch,
    shouldDeployAsRelease,
    generateTestConfig,
    switchConfig,
    extractVersion,
    updateLibraryName,
    shareLibrary,
    prepareDeployDirectory,
    createDeployConfig,
    cleanupDeployDirectory
};
