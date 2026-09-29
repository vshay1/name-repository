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
   Handle the recovery session
   ============================================================ */
const form = document.getElementById('update-password-form');
const hint = document.getElementById('form-hint');
const footerMsg = document.getElementById('footer-message');

let recoveryReady = false;

supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY') {
        recoveryReady = true;
        hint.textContent = 'Choose a new password for your account.';
    }
});

(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        recoveryReady = true;
    } else {
        hint.textContent = 'This link is invalid or has expired. Please request a new one.';
        hint.classList.add('error');
        document.getElementById('update-btn').disabled = true;
        footerMsg.hidden = false;
    }
})();

/* ============================================================
   Submit new password
   ============================================================ */
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!recoveryReady) {
        alert('This password reset link is no longer valid. Please request a new one.');
        return;
    }

    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (newPassword.length < 6) {
        alert('Password must be at least 6 characters.');
        return;
    }

    if (newPassword !== confirmPassword) {
        alert('Passwords do not match.');
        return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
        alert(error.message);
        return;
    }

    await supabase.auth.signOut();

    alert('Password updated successfully. Please log in with your new password.');
    window.location.href = 'login-page.html';
});