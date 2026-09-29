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
    if (!/^[a-z0-9_]{3,20}$/.test(clean)) {
        return res.status(400).json({
            error: 'Username must be 3–20 characters, letters/numbers/underscores only.'
        });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('username', clean)
        .maybeSingle();

    if (existing) {
        return res.status(409).json({ error: 'That username is taken.' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const { data: user, error } = await supabase
        .from('users')
        .insert({ username: clean, password_hash })
        .select('id, username')
        .single();

    if (error) {
        return res.status(500).json({ error: error.message });
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