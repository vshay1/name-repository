import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { username, password } = req.body || {};

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required.' });
    }

    const clean = username.trim().toLowerCase();

    const { data: user } = await supabase
        .from('users')
        .select('id, username, password_hash')
        .eq('username', clean)
        .maybeSingle();

    if (!user) {
        return res.status(401).json({ error: 'Incorrect username or password.' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
        return res.status(401).json({ error: 'Incorrect username or password.' });
    }

    const token = jwt.sign(
        { sub: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    res.setHeader(
        'Set-Cookie',
        `auth=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${60 * 60 * 24 * 7}`
    );

    return res.status(200).json({ ok: true, username: user.username });
}