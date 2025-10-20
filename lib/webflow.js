const { execSync } = require('child_process');

/**
 * Run the Webflow library share command
 */
function shareLibrary(options = {}) {
    const noInput = options.noInput !== false; // default to true
    const manifest = options.manifest || 'webflow.json';
    const apiToken = options.apiToken;

    let command = `npx webflow library share --no-input --manifest "${manifest}"`;

    if (apiToken) {
        command += ` --api-token "${apiToken}"`;
    }

    console.log('Running webflow library share...');
    execSync(command, { stdio: 'inherit' });
    console.log('✓ Successfully shared library to Webflow');
}

module.exports = {
    shareLibrary
};
