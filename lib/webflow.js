const { execSync } = require('child_process');

/**
 * Run the Webflow library share command
 */
function shareLibrary(options = {}) {
    const noInput = options.noInput !== false; // default to true
    const command = `npx webflow library share${noInput ? ' --no-input' : ''}`;

    console.log('Running webflow library share...');
    execSync(command, { stdio: 'inherit' });
    console.log('✓ Successfully shared library to Webflow');
}

module.exports = {
    shareLibrary
};
