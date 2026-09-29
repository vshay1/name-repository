/* ============================================================
   Fetch current user
   ============================================================ */
let currentUser = null;

async function loadUser() {
    const res = await fetch('/api/me');
    if (!res.ok) {
        window.location.href = 'login-page.html';
        return;
    }
    currentUser = await res.json();

    document.getElementById('current-username').textContent = currentUser.username;
    document.getElementById('new-username').value = currentUser.username;
}

/* ============================================================
   Change username
   ============================================================ */
document.getElementById('username-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const status = document.getElementById('username-status');
    status.textContent = '';
    status.className = 'form-status';

    const username = document.getElementById('new-username').value.trim();

    const res = await fetch('/api/update-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
    });

    const data = await res.json();

    if (!res.ok) {
        status.textContent = data.error || 'Failed to update username.';
        status.classList.add('error');
        return;
    }

    status.textContent = 'Username updated.';
    status.classList.add('success');
    document.getElementById('current-username').textContent = data.username;
});

/* ============================================================
   Change password
   ============================================================ */
document.getElementById('password-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const status = document.getElementById('password-status');
    status.textContent = '';
    status.className = 'form-status';

    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-new-password').value;

    if (newPassword !== confirmPassword) {
        status.textContent = 'New passwords do not match.';
        status.classList.add('error');
        return;
    }

    const res = await fetch('/api/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await res.json();

    if (!res.ok) {
        status.textContent = data.error || 'Failed to change password.';
        status.classList.add('error');
        return;
    }

    status.textContent = 'Password updated.';
    status.classList.add('success');
    document.getElementById('password-form').reset();
});

/* ============================================================
   Delete account
   ============================================================ */
document.getElementById('delete-btn').addEventListener('click', async () => {
    if (!confirm('Are you absolutely sure? This deletes your account permanently.')) return;
    if (!confirm('This cannot be undone. Really delete your account?')) return;

    const res = await fetch('/api/delete-account', { method: 'POST' });

    if (!res.ok) {
        alert('Failed to delete account.');
        return;
    }

    window.location.href = 'register.html';
});

/* ============================================================
   Logout
   ============================================================ */
document.getElementById('logout-btn').addEventListener('click', async () => {
    if (!confirm('Log out?')) return;
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = 'login-page.html';
});

/* ============================================================
   Boot
   ============================================================ */
loadUser();