const fs = require('fs');
const path = require('path');

if (!process.env.VERCEL) {
    require('dotenv').config({ path: '.env.local' });
}

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables.');
    process.exit(1);
}

const output = `window.__APP_CONFIG__ = {
    SUPABASE_URL: '${url}',
    SUPABASE_ANON_KEY: '${key}',
};
`;

fs.writeFileSync(path.join(__dirname, 'config.js'), output);
console.log('✓ config.js generated');