
/* SPDX-License-Identifier: GPL-3.0-only
 * Copyright (C) 2025 Sygnal Technology Group
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Copy source files to deploy directory with modified component names
 */
function prepareDeployDirectory(options = {}) {
    const deployDir = path.join(process.cwd(), 'deploy');
    const srcDir = path.join(process.cwd(), 'src');

    // Clean up any existing deploy directory
    if (fs.existsSync(deployDir)) {
        console.log('Cleaning up old deploy directory...');
        fs.rmSync(deployDir, { recursive: true, force: true });
    }

    // Create deploy directory
    fs.mkdirSync(deployDir, { recursive: true });

    // Copy entire src directory
    console.log('Copying source files to deploy directory...');
    copyDirectory(srcDir, path.join(deployDir, 'src'));

    // Modify .webflow files to add warning icons
    const addWarnings = options.addWarnings || false;
    if (addWarnings) {
        modifyWebflowFiles(path.join(deployDir, 'src'));
    }

    console.log(`✓ Deploy directory prepared at: ${deployDir}`);
    return deployDir;
}

/**
 * Recursively copy directory
 */
function copyDirectory(src, dest) {
    // Create destination directory
    fs.mkdirSync(dest, { recursive: true });

    // Read source directory
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDirectory(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

/**
 * Modify all .webflow files to add warning icons to component names
 */
function modifyWebflowFiles(srcDir) {
    const files = findWebflowFiles(srcDir);
    let modifiedCount = 0;

    files.forEach(filePath => {
        const content = fs.readFileSync(filePath, 'utf8');

        // Modify the 'name:' property in declareComponent() to add warning icon
        // Matches: name: 'Component Name', or name: "Component Name",
        const modifiedContent = content.replace(
            /(\bdeclareComponent\([^,]+,\s*\{\s*)name:\s*['"`]([^'"`]+)['"`]/,
            (match, prefix, componentName) => {
                // Don't add if already has warning
                if (componentName.includes('⚠️')) return match;
                return `${prefix}name: '${componentName} ⚠️'`;
            }
        );

        // Only write if content changed
        if (modifiedContent !== content) {
            fs.writeFileSync(filePath, modifiedContent, 'utf8');
            modifiedCount++;
        }
    });

    if (modifiedCount > 0) {
        console.log(`✓ Added warning icons to ${modifiedCount} component${modifiedCount > 1 ? 's' : ''}`);
    }
}

/**
 * Find all .webflow files in a directory
 */
function findWebflowFiles(dir) {
    const webflowFiles = [];

    function traverse(currentDir) {
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);

            if (entry.isDirectory()) {
                traverse(fullPath);
            } else if (entry.name.match(/\.webflow\.(tsx?|jsx?)$/)) {
                webflowFiles.push(fullPath);
            }
        }
    }

    traverse(dir);
    return webflowFiles;
}

/**
 * Create temporary webflow.json pointing to deploy directory
 */
function createDeployConfig(deployDir, config) {
    const deployConfig = JSON.parse(JSON.stringify(config)); // Deep clone

    // Update components path to point to deploy/src
    deployConfig.library.components = deployConfig.library.components.map(pattern => {
        // Replace ./src with ./deploy/src
        return pattern.replace('./src', './deploy/src');
    });

    return deployConfig;
}

/**
 * Clean up deploy directory
 */
function cleanupDeployDirectory() {
    const deployDir = path.join(process.cwd(), 'deploy');

    if (fs.existsSync(deployDir)) {
        fs.rmSync(deployDir, { recursive: true, force: true });
        console.log('✓ Cleaned up deploy directory');
    }
}

module.exports = {
    prepareDeployDirectory,
    createDeployConfig,
    cleanupDeployDirectory
};
