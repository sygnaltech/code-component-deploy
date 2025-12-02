
/* SPDX-License-Identifier: GPL-3.0-only
 * Copyright (C) 2025 Sygnal Technology Group
 */

const fs = require('fs');
const path = require('path');

/**
 * Get fallback version from package.json or date
 * First tries to read version from project's package.json
 * Falls back to date-based version if package.json not found or has no version
 */
function getFallbackVersion() {
    // Try to read version from project's package.json
    const packageJsonPath = path.join(process.cwd(), 'package.json');

    if (fs.existsSync(packageJsonPath)) {
        try {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            if (packageJson.version && packageJson.version.trim() !== '') {
                console.log(`Using version from package.json: ${packageJson.version}`);
                return packageJson.version;
            }
        } catch (error) {
            console.log(`Failed to read package.json: ${error.message}`);
        }
    }

    // Final fallback to date-based version
    const dateVersion = new Date().toISOString().split('T')[0];
    console.log(`Using date-based fallback version: ${dateVersion}`);
    return dateVersion;
}

/**
 * Extract version from a TypeScript version file
 * Looks for: export const VERSION = "x.x.x"
 * Supports semver formats: "1", "1.2", "1.2.3", "1.2.3-beta.1"
 * Falls back to package.json version, then date-based version if VERSION is missing, empty, or invalid
 */
function extractVersion(versionFilePath = 'src/version.ts') {
    const fullPath = path.join(process.cwd(), versionFilePath);

    // If file doesn't exist, use fallback
    if (!fs.existsSync(fullPath)) {
        console.log(`Version file not found: ${versionFilePath}`);
        return getFallbackVersion();
    }

    const content = fs.readFileSync(fullPath, 'utf8');
    const match = content.match(/export const VERSION = ['"]([^'"]+)['"]/);

    // If VERSION constant not found or empty, use fallback
    if (!match || !match[1] || match[1].trim() === '') {
        console.log(`VERSION constant not found or empty in ${versionFilePath}`);
        return getFallbackVersion();
    }

    const version = match[1].trim();

    // Validate semver format (supports: 1, 1.2, 1.2.3, 1.2.3-beta.1, etc.)
    const semverPattern = /^\d+(\.\d+)?(\.\d+)?(-[a-zA-Z0-9.-]+)?$/;

    if (!semverPattern.test(version)) {
        console.log(`Invalid semver format "${version}" in ${versionFilePath}`);
        return getFallbackVersion();
    }

    return version;
}

/**
 * Update the webflow.json library name with version suffix
 * Supports semver versions (e.g., "1.2.3") and date-based versions (e.g., "2025-10-29")
 */
function updateLibraryName(webflowJsonPath, version, branch, options = {}) {
    const mainBranch = options.mainBranch || 'main';
    const config = JSON.parse(fs.readFileSync(webflowJsonPath, 'utf8'));

    const originalName = config.library.name;

    // Check if version is date-based (YYYY-MM-DD format)
    const isDateVersion = /^\d{4}-\d{2}-\d{2}$/.test(version);

    if (isDateVersion) {
        // For date-based versions, wrap in parentheses instead of "v" prefix
        const versionSuffix = branch === mainBranch ? `(${version})` : `(${version}) ⚠️`;
        config.library.name = `${originalName} ${versionSuffix}`;
    } else {
        // For semver versions, use "v" prefix as before
        const versionSuffix = branch === mainBranch ? version : `${version} ⚠️`;
        config.library.name = `${originalName} v${versionSuffix}`;
    }

    fs.writeFileSync(webflowJsonPath, JSON.stringify(config, null, 2));
    console.log(`✓ Updated library name: "${originalName}" → "${config.library.name}"`);

    return config.library.name;
}

module.exports = {
    extractVersion,
    updateLibraryName
};
