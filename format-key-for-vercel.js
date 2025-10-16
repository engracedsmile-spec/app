#!/usr/bin/env node
// Script to properly format Firebase private key for Vercel
// Run: node format-key-for-vercel.js

const fs = require('fs');
const path = require('path');

try {
  // Read the .env.production file
  const envPath = path.join(__dirname, '.env.production');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Extract the FIREBASE_PRIVATE_KEY
  const match = envContent.match(/FIREBASE_PRIVATE_KEY="(.+?)"/s);
  
  if (!match) {
    console.error('❌ Could not find FIREBASE_PRIVATE_KEY in .env.production');
    process.exit(1);
  }
  
  const privateKey = match[1];
  
  // Format for Vercel: Keep \n as literal \n (not actual newlines)
  const formattedKey = `"${privateKey}"`;
  
  console.log('✅ Formatted FIREBASE_PRIVATE_KEY for Vercel:');
  console.log('='.repeat(80));
  console.log(formattedKey);
  console.log('='.repeat(80));
  console.log('\n📋 Instructions:');
  console.log('1. Copy the text above (including the quotes)');
  console.log('2. Go to Vercel Dashboard → Settings → Environment Variables');
  console.log('3. Add/Update FIREBASE_PRIVATE_KEY with the copied value');
  console.log('4. Select "All Environments"');
  console.log('5. Save and redeploy');
  console.log('\n⚠️  IMPORTANT: The \\n should remain as backslash-n, NOT actual line breaks!');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

