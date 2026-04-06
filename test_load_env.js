const loadEnv = require('./scripts/load-env.js');

// Mock hexo object
const mockHexo = {
    config: {
        theme: {}
    }
};

// Test 1: parseEnvContent function (if exposed)
const fs = require('fs');
const path = require('path');

// Read the script file to extract parseEnvContent (hack)
const scriptContent = fs.readFileSync(path.join(__dirname, 'scripts/load-env.js'), 'utf8');
// Since parseEnvContent is not exported, we can't test directly.
// Instead we test the whole module.

console.log('Testing load-env.js with mock hexo...');
// Call the exported function
loadEnv(mockHexo);
console.log('After loadEnv, config:', JSON.stringify(mockHexo.config, null, 2));

// Test with GITALK_CLIENT_SECRET set
process.env.GITALK_CLIENT_SECRET = 'test_secret_123';
const mockHexo2 = { config: { theme: {} } };
loadEnv(mockHexo2);
console.log('With env set, config:', JSON.stringify(mockHexo2.config, null, 2));
console.log('theme.gitalk:', mockHexo2.config.theme.gitalk);
console.log('top-level gitalk:', mockHexo2.config.gitalk);

// Test with this binding
const mockHexo3 = { config: { theme: {} } };
loadEnv.call(mockHexo3, null);
console.log('With this binding, config:', JSON.stringify(mockHexo3.config, null, 2));