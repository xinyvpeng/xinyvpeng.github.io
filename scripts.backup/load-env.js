const fs = require('fs');
const path = require('path');

/**
 * Hexo plugin to load environment variables from .env file
 * Supports .env file parsing with comments and values containing '='
 * Sets Gitalk client secret from GITALK_CLIENT_SECRET environment variable
 */

/**
 * Parse .env file content into key-value pairs
 * Supports:
 * - Comments (lines starting with #)
 * - Empty lines
 * - Values containing = (splits on first =)
 * - Trims whitespace
 * - Strips surrounding single or double quotes from values
 */
function parseEnvContent(content) {
  const result = {};
  const lines = content.split('\n');
  
  for (const line of lines) {
    // Trim and skip empty lines
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    
    // Split on first '='
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) {
      // No '=' found, skip or treat as empty value?
      continue;
    }
    
    const key = trimmed.substring(0, eqIndex).trim();
    let value = trimmed.substring(eqIndex + 1).trim();
    
    // Strip surrounding quotes (both single and double)
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.substring(1, value.length - 1);
    }
    
    if (key) {
      result[key] = value;
    }
  }
  
  return result;
}

/**
 * Load .env file and set environment variables
 */
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    return;
  }
  
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = parseEnvContent(envContent);
    
    // Set environment variables
    for (const [key, value] of Object.entries(envVars)) {
      process.env[key] = value;
    }
    
    return envVars;
  } catch (error) {
    console.error(`Error loading .env file (${envPath}): ${error.message}`);
  }
}

// Load environment variables when script is loaded (by Hexo)
loadEnvFile();

// Debug: log that script is loaded
console.log('load-env: Script loaded successfully, GITALK_CLIENT_ID:', process.env.GITALK_CLIENT_ID ? 'set' : 'not set');
console.log('load-env: this context:', typeof this);
console.log('load-env: global.hexo:', typeof global !== 'undefined' && global.hexo ? 'exists' : 'does not exist');
console.log('load-env: module.parent:', module.parent);

// Hexo plugin - register filter if hexo instance is available
if (typeof this !== 'undefined' && this.extend && this.extend.filter) {
  const ctx = this;
  console.log('load-env: Hexo instance found, registering filter');
  
  // Debug logging
  if (process.env.DEBUG_ENV_LOADER) {
    console.log('load-env: plugin executed');
    console.log('load-env: ctx keys:', Object.keys(ctx));
    console.log('load-env: ctx.theme?', !!ctx.theme);
    console.log('load-env: ctx.theme.config?', ctx.theme && ctx.theme.config);
  }
  
  // Register filter to set Gitalk configuration after config is loaded
  ctx.extend.filter.register('after_init', function() {
    console.log('load-env: before_generate filter executing');
    
    // Set client ID
    const clientId = process.env.GITALK_CLIENT_ID;
    if (clientId && clientId.trim()) {
      const trimmedClientId = clientId.trim();
      if (ctx.theme && ctx.theme.config) {
        ctx.theme.config.gitalk = ctx.theme.config.gitalk || {};
        ctx.theme.config.gitalk.client_id = trimmedClientId;
        if (process.env.DEBUG_ENV_LOADER) {
          console.log('load-env: Set gitalk client ID in ctx.theme.config.gitalk');
        }
      } else {
        ctx.config.gitalk = ctx.config.gitalk || {};
        ctx.config.gitalk.client_id = trimmedClientId;
        console.warn('load-env: ctx.theme.config not available, using top-level config.gitalk for client_id');
      }
    } else if (clientId !== undefined) {
      console.warn('load-env: GITALK_CLIENT_ID is empty or whitespace-only, skipping');
    }
    
    // Set client secret
    const secret = process.env.GITALK_CLIENT_SECRET;
    if (secret && secret.trim()) {
      const trimmedSecret = secret.trim();
      if (ctx.theme && ctx.theme.config) {
        ctx.theme.config.gitalk = ctx.theme.config.gitalk || {};
        ctx.theme.config.gitalk.client_secret = trimmedSecret;
        if (process.env.DEBUG_ENV_LOADER) {
          console.log('load-env: Set gitalk client secret in ctx.theme.config.gitalk');
        }
      } else {
        ctx.config.gitalk = ctx.config.gitalk || {};
        ctx.config.gitalk.client_secret = trimmedSecret;
        console.warn('load-env: ctx.theme.config not available, using top-level config.gitalk for client_secret');
      }
    } else if (secret !== undefined) {
      console.warn('load-env: GITALK_CLIENT_SECRET is empty or whitespace-only, skipping');
    }
  });
  
  if (process.env.NODE_ENV !== 'production') {
    console.warn('load-env: filter registered');
  }
} else {
  // Fallback for when script is loaded but not by Hexo (e.g., testing)
  console.log('load-env: Hexo instance not found, skipping filter registration');
}

// Also allow direct execution (for testing)
if (require.main === module) {
  console.log('Environment variables loaded:', Object.keys(process.env).filter(k => k.startsWith('GITALK')));
}