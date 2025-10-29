#!/usr/bin/env node

/**
 * Script to quickly set the API URL for different environments
 * Usage: node scripts/set-api-url.js <url>
 * Example: node scripts/set-api-url.js https://api.myapp.com
 */

import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

const args = process.argv.slice(2);
const newApiUrl = args[0];

if (!newApiUrl) {
  console.error('❌ Please provide an API URL');
  console.log('Usage: node scripts/set-api-url.js <url>');
  console.log('Example: node scripts/set-api-url.js https://api.myapp.com');
  process.exit(1);
}

// Validate URL format
try {
  new URL(newApiUrl);
} catch (error) {
  console.error('❌ Invalid URL format:', newApiUrl);
  process.exit(1);
}

const envFiles = ['.env', '.env.production'];

envFiles.forEach(envFile => {
  const envPath = join(process.cwd(), envFile);
  
  try {
    let content = readFileSync(envPath, 'utf8');
    
    // Replace the VITE_API_URL line
    content = content.replace(
      /^VITE_API_URL=.*$/m,
      `VITE_API_URL=${newApiUrl}`
    );
    
    writeFileSync(envPath, content);
    console.log(`✅ Updated ${envFile} with API URL: ${newApiUrl}`);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // Create the file if it doesn't exist
      const newContent = `# API Configuration
VITE_API_URL=${newApiUrl}

# App Configuration
VITE_APP_NAME=Event Networking
VITE_APP_VERSION=1.0.0

# Environment
VITE_ENVIRONMENT=${envFile === '.env.production' ? 'production' : 'development'}
`;
      writeFileSync(envPath, newContent);
      console.log(`✅ Created ${envFile} with API URL: ${newApiUrl}`);
    } else {
      console.error(`❌ Error updating ${envFile}:`, error.message);
    }
  }
});

console.log('\n🚀 API URL updated successfully!');
console.log('💡 Run "npm run dev" to start development with the new URL');
console.log('💡 Run "npm run build" to build for production with the new URL');