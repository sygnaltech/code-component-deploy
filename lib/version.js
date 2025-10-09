const fs = require('fs');
const path = require('path');

/**
 * Extract version from a TypeScript version file
 * Looks for: export const VERSION = "x.x.x"
 */
function extractVersion(versionFilePath = 'src/version.ts') {
    const fullPath = path.join(process.cwd(), versionFilePath);

    if (!fs.existsSync(fullPath)) {
        throw new Error(`Version file not found: ${versionFilePath}`);
    }

    const content = fs.readFileSync(fullPath, 'utf8');
    const match = content.match(/export const VERSION = ['"]([^'"]+)['"]/);

    if (!match) {
        throw new Error(`Could not extract VERSION from ${versionFilePath}`);
    }

    return match[1];
}

/**
 * Update the webflow.json library name with version suffix
 */
function updateLibraryName(webflowJsonPath, version, branch, options = {}) {
    const mainBranch = options.mainBranch || 'main';
    const config = JSON.parse(fs.readFileSync(webflowJsonPath, 'utf8'));

    const originalName = config.library.name;
    const versionSuffix = branch === mainBranch ? version : `${version} ⚠️`;
    config.library.name = `${originalName} v${versionSuffix}`;

    fs.writeFileSync(webflowJsonPath, JSON.stringify(config, null, 2));
    console.log(`✓ Updated library name: "${originalName}" → "${config.library.name}"`);

    return config.library.name;
}

module.exports = {
    extractVersion,
    updateLibraryName
};
