import { supabase } from './supabase-client.js';

const EMAIL_DOMAIN = 'noreply.local';

/* ============================================================
   Icon templates
   ============================================================ */
const EYE_OPEN = `
    <svg aria-hidden="true" focusable="false" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"/>
        <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"/>
    </svg>`;

const EYE_CLOSED = `
    <svg aria-hidden="true" focusable="false" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7 7 0 0 0 2.79-.588M5.21 3.088A7 7 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474z"/>
        <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z"/>
    </svg>`;

/* ============================================================
   Password toggle
   ============================================================ */
document.querySelectorAll('.toggle-password').forEach((btn) => {
    btn.addEventListener('click', () => {
        const input = btn.parentElement.querySelector('input');
        const isPassword = input.type === 'password';

        input.type = isPassword ? 'text' : 'password';
        btn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
        btn.setAttribute('aria-pressed', String(isPassword));
        btn.innerHTML = isPassword ? EYE_OPEN : EYE_CLOSED;
    });
});

/* ============================================================
   Skip register page if already signed in
   ============================================================ */
(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) window.location.href = 'overview.html';
})();

/* ============================================================
   Registration — username + password only
   ============================================================ */
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
        alert('Username must be 3–20 characters, letters/numbers/underscores only.');
        return;
    }

    if (password.length < 6) {
        alert('Password must be at least 6 characters.');
        return;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
    }

    const email = `${username}@${EMAIL_DOMAIN}`;

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { username },
        },
    });

    if (error) {
        if (error.message.toLowerCase().includes('already')) {
            alert('That username is taken. Try another.');
        } else {
            alert(error.message);
        }
        return;
    }

    if (data.session) {
        window.location.href = 'overview.html';
    } else {
        alert(
            'Account created, but email confirmation is enabled in Supabase.\n\n' +
            'Go to Supabase → Authentication → Providers → Email and turn OFF "Confirm email". ' +
            'Then try registering again.'
        );
    }
});