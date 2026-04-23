const fs = require('fs');
const path = require('path');

function parseEnvContent(content) {
  const result = {};
  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.substring(0, eqIndex).trim();
    let value = trimmed.substring(eqIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.substring(1, value.length - 1);
    }
    if (key) result[key] = value;
  }
  return result;
}

const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  try {
    const envVars = parseEnvContent(fs.readFileSync(envPath, 'utf8'));
    for (const [key, value] of Object.entries(envVars)) {
      process.env[key] = value;
    }
  } catch (e) {
    console.error(`load-env: Error loading .env: ${e.message}`);
  }
}

hexo.once('generateBefore', function() {
  const secret = process.env.GITALK_CLIENT_SECRET;
  if (secret && secret.trim()) {
    this.theme.config.gitalk = this.theme.config.gitalk || {};
    this.theme.config.gitalk.client_secret = secret.trim();
  }
});