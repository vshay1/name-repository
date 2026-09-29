const fs = require('fs');
const path = require('path');

if (!process.env.VERCEL) {
    try {
        require('dotenv').config({ path: '.env' });
    } catch {
    }
}

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY.');
    console.error('Locally: add them to .env, or install dotenv with `npm install`.');
    process.exit(1);
}

const OUT_DIR = path.join(__dirname, 'static');
const output = `window.__APP_CONFIG__ = {
    SUPABASE_URL: '${url}',
    SUPABASE_ANON_KEY: '${key}',
};
`;

fs.writeFileSync(path.join(OUT_DIR, 'config.js'), output);
console.log('✓ static/config.js generated');