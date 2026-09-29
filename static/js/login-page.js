import { supabase } from './supabase-client.js';

/* ============================================================
   Icon templates for password toggle
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
   Accessible password toggle
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
   Forgot password
   ============================================================ */
const forgotLink = document.querySelector('.login-buttons a');
if (forgotLink) {
    forgotLink.addEventListener('click', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        if (!email) {
            alert('Please enter your email address first, then click "Forgot password".');
            return;
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/update-password.html`,
        });

        if (error) {
            alert(error.message);
            return;
        }

        alert('Password reset link sent. Check your email.');
    });
}

/* ============================================================
   Login
   ============================================================ */
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        alert(error.message);
        return;
    }

    window.location.href = 'overview.html';
});

/* ============================================================
   If already logged in, skip the login page
   ============================================================ */
(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        window.location.href = 'overview.html';
    }
})();