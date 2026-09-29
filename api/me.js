import jwt from 'jsonwebtoken';

export default function handler(req, res) {
    const cookies = parseCookies(req.headers.cookie || '');
    const token = cookies.auth;

    if (!token) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        return res.status(200).json({ id: payload.sub, username: payload.username });
    } catch {
        return res.status(401).json({ error: 'Invalid session' });
    }
}

function parseCookies(str) {
    return Object.fromEntries(
        str.split(';').filter(Boolean).map((c) => {
            const [k, ...v] = c.trim().split('=');
            return [k, v.join('=')];
        })
    );
}