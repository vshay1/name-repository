const fs = require('fs');
const path = require('path');

if (!process.env.VERCEL) {
    try { require('dotenv').config({ path: '.env' }); } catch {}
}

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY.');
    process.exit(1);
}

fs.writeFileSync(
    path.join(__dirname, 'config.js'),
    `window.__APP_CONFIG__ = {
    SUPABASE_URL: '${url}',
    SUPABASE_ANON_KEY: '${key}',
};
`
);
console.log('✓ config.js generated');