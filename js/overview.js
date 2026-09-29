/* ============================================================
   Constants & state
   ============================================================ */
const STORAGE_KEY = 'names';

const FIELD_IDS = [
    'd-name', 'd-ipa', 'd-gender', 'd-language', 'd-variants',
    'd-meaning', 'd-origin', 'd-era', 'd-background', 'd-history',
    'd-tags', 'd-popularity', 'd-numerology', 'd-notes', 'd-sources'
];

// DOM refs — populated by cacheDomRefs()
let sidebar, toggleBtn;
let searchInput, searchClear, listSection, actionButtons;
let detailOverlay, detailForm, detailTitle, detailClose, detailCancel;
let tagInput, tagPreview;
let srStatus;

/* ============================================================
   Storage
   ============================================================ */
function getStoredNames() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
        return [];
    }
}

function saveNames(names) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(names));
}

function findByName(name) {
    return getStoredNames().find(
        (n) => n.name.toLowerCase() === name.trim().toLowerCase()
    );
}

/* ============================================================
   Helpers
   ============================================================ */
function escapeHtml(str = '') {
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
}

function parseTags(str) {
    return String(str || '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
}

function announce(message) {
    if (!srStatus) return;
    srStatus.textContent = '';
    requestAnimationFrame(() => {
        srStatus.textContent = message;
    });
}

/* ============================================================
   DOM cache
   ============================================================ */
function cacheDomRefs() {
    sidebar       = document.querySelector('.sidebar');
    toggleBtn     = document.querySelector('.sidebar-close');
    searchInput   = document.getElementById('search-input');
    searchClear   = document.getElementById('search-clear');
    listSection   = document.getElementById('list-section');
    actionButtons = document.querySelectorAll('.action-list button');

    detailOverlay = document.getElementById('detail-overlay');
    detailForm    = document.getElementById('detail-form');
    detailTitle   = document.getElementById('detail-title');
    detailClose   = document.getElementById('detail-close');
    detailCancel  = document.getElementById('detail-cancel');

    tagInput      = document.getElementById('d-tags');
    tagPreview    = document.getElementById('d-tag-preview');
    srStatus      = document.getElementById('sr-status');
}

/* ============================================================
   Sidebar
   ============================================================ */
function initSidebar() {
    if (sidebar && toggleBtn) {
        const CLOSE_ICON = `
            <svg xmlns="http://www.w3.org/2000/svg" class="bi bi-x" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
            </svg>`;
        const OPEN_ICON = `
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-list" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/>
            </svg>`;

        toggleBtn.addEventListener('click', () => {
            const isClosed = sidebar.classList.toggle('closed');
            toggleBtn.innerHTML = isClosed ? OPEN_ICON : CLOSE_ICON;
        });
    }

    document.querySelectorAll('.sidebar-body a').forEach((link) => {
        link.addEventListener('click', () => {
            document.querySelectorAll('.sidebar-body a').forEach((l) => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

/* ============================================================
   Logout
   ============================================================ */
function initLogout() {
    const btn = document.getElementById('logout-btn');
    if (!btn) return;

    const handleLogout = async () => {
        if (!confirm('Log out of your account?')) return;

        try {
            await fetch('/api/logout', { method: 'POST' });
        } catch {
        }

        window.location.href = 'login-page.html';
    };

    btn.addEventListener('click', handleLogout);
    btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleLogout();
        }
    });
}

/* ============================================================
   Rendering
   ============================================================ */
function renderList(names, { title, empty } = {}) {
    if (!listSection) return;

    if (!names.length) {
        listSection.innerHTML = `
            <div class="list-empty">
                <p>${escapeHtml(empty || 'No names found.')}</p>
            </div>`;
        return;
    }

    const header = title ? `<h3 class="list-title">${escapeHtml(title)}</h3>` : '';
    const items = names.map((entry) => `
        <div class="name-card" data-name="${escapeHtml(entry.name)}">
            <div class="name-card-main">
                <div class="name-card-name">
                    ${escapeHtml(entry.name)}
                    ${entry.ipa ? `<span class="name-card-ipa">${escapeHtml(entry.ipa)}</span>` : ''}
                </div>
                <div class="name-card-meta">
                    ${entry.origin ? `<span class="tag">${escapeHtml(entry.origin)}</span>` : ''}
                    ${entry.language ? `<span class="tag">${escapeHtml(entry.language)}</span>` : ''}
                    ${entry.gender ? `<span class="tag">${escapeHtml(entry.gender)}</span>` : ''}
                    ${entry.popularity ? `<span class="tag">${escapeHtml(entry.popularity)}</span>` : ''}
                    ${(entry.tags || []).map((t) => `<span class="tag tag-meaning">${escapeHtml(t)}</span>`).join('')}
                </div>
                ${entry.meaning ? `<p class="name-card-notes"><strong>Meaning:</strong> ${escapeHtml(entry.meaning)}</p>` : ''}
                ${entry.notes ? `<p class="name-card-notes">${escapeHtml(entry.notes)}</p>` : ''}
            </div>
            <div class="name-card-actions">
                <button class="name-card-edit" data-name="${escapeHtml(entry.name)}" aria-label="Edit ${escapeHtml(entry.name)}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                        <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"/>
                    </svg>
                </button>
                <button class="name-card-delete" data-name="${escapeHtml(entry.name)}" aria-label="Delete ${escapeHtml(entry.name)}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                        <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');

    listSection.innerHTML = header + items;

    listSection.querySelectorAll('.name-card-edit').forEach((btn) => {
        btn.addEventListener('click', () => openDetail(btn.dataset.name));
    });

    listSection.querySelectorAll('.name-card-delete').forEach((btn) => {
        btn.addEventListener('click', () => {
            const name = btn.dataset.name;
            if (confirm(`Delete "${name}" from your archive?`)) {
                saveNames(getStoredNames().filter((n) => n.name !== name));
                runSearch(searchInput.value);
                announce(`Deleted "${name}"`);
            }
        });
    });
}

/* ============================================================
   Detail modal
   ============================================================ */
function clearDetailForm() {
    FIELD_IDS.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    renderTagPreview();
}

function fillDetailForm(entry) {
    const set = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val ?? '';
    };
    set('d-name', entry.name);
    set('d-ipa', entry.ipa);
    set('d-gender', entry.gender);
    set('d-language', entry.language);
    set('d-variants', (entry.variants || []).join(', '));
    set('d-meaning', entry.meaning);
    set('d-origin', entry.origin);
    set('d-era', entry.era);
    set('d-background', entry.background);
    set('d-history', entry.history);
    set('d-tags', (entry.tags || []).join(', '));
    set('d-popularity', entry.popularity);
    set('d-numerology', entry.numerology);
    set('d-notes', entry.notes);
    set('d-sources', (entry.sources || []).join('\n'));
    renderTagPreview();
}

function openDetail(prefillName = '') {
    if (!detailOverlay) return;

    clearDetailForm();

    const clean = (prefillName || '').trim();
    if (clean) {
        const existing = findByName(clean);
        if (existing) {
            fillDetailForm(existing);
            detailTitle.textContent = `Edit: ${existing.name}`;
        } else {
            document.getElementById('d-name').value = clean;
            detailTitle.textContent = 'New Name';
        }
    } else {
        detailTitle.textContent = 'New Name';
    }

    detailOverlay.hidden = false;
    requestAnimationFrame(() => detailOverlay.classList.add('open'));
    document.getElementById('d-name')?.focus();
}

function closeDetail() {
    if (!detailOverlay) return;
    detailOverlay.classList.remove('open');
    setTimeout(() => {
        detailOverlay.hidden = true;
        clearDetailForm();
    }, 200);
}

/* ============================================================
   Tag preview
   ============================================================ */
function renderTagPreview() {
    if (!tagPreview) return;
    const tags = parseTags(tagInput?.value);
    tagPreview.innerHTML = tags.length
        ? tags.map((t) => `<span class="tag tag-meaning">${escapeHtml(t)}</span>`).join('')
        : '<span class="tag-preview-empty">Tags will appear here</span>';
}

/* ============================================================
   Save
   ============================================================ */
function handleSave(e) {
    e.preventDefault();

    const name = document.getElementById('d-name').value.trim();
    if (!name) {
        alert('Name is required.');
        return;
    }

    const entry = {
        name,
        ipa: document.getElementById('d-ipa').value.trim(),
        gender: document.getElementById('d-gender').value,
        language: document.getElementById('d-language').value.trim(),
        variants: parseTags(document.getElementById('d-variants').value),
        meaning: document.getElementById('d-meaning').value.trim(),
        origin: document.getElementById('d-origin').value.trim(),
        era: document.getElementById('d-era').value.trim(),
        background: document.getElementById('d-background').value.trim(),
        history: document.getElementById('d-history').value.trim(),
        tags: parseTags(document.getElementById('d-tags').value),
        popularity: document.getElementById('d-popularity').value,
        numerology: document.getElementById('d-numerology').value.trim(),
        notes: document.getElementById('d-notes').value.trim(),
        sources: document.getElementById('d-sources').value
            .split('\n').map((s) => s.trim()).filter(Boolean),
        updatedAt: new Date().toISOString()
    };

    const names = getStoredNames();
    const existingIdx = names.findIndex(
        (n) => n.name.toLowerCase() === name.toLowerCase()
    );

    if (existingIdx >= 0) {
        entry.createdAt = names[existingIdx].createdAt || entry.updatedAt;
        names[existingIdx] = entry;
    } else {
        entry.createdAt = entry.updatedAt;
        names.push(entry);
    }

    saveNames(names);
    closeDetail();

    searchInput.value = name;
    if (searchClear) searchClear.hidden = false;
    runSearch(name);
    announce(`Saved "${name}"`);
}

/* ============================================================
   Search
   ============================================================ */
function runSearch(query) {
    const q = query.trim().toLowerCase();
    if (!q) {
        renderList(getStoredNames(), {
            title: 'Your Archive',
            empty: 'Your archive is empty. Type a name and press Enter to get started!'
        });
        return;
    }

    const results = getStoredNames().filter((n) =>
        n.name.toLowerCase().includes(q) ||
        (n.meaning || '').toLowerCase().includes(q) ||
        (n.origin || '').toLowerCase().includes(q) ||
        (n.language || '').toLowerCase().includes(q) ||
        (n.notes || '').toLowerCase().includes(q) ||
        (n.tags || []).some((t) => t.toLowerCase().includes(q))
    );

    renderList(results, {
        title: `Results for "${query.trim()}"`,
        empty: `No names match "${query.trim()}". Press Enter to add it.`
    });
}

function initSearch() {
    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
        const hasText = searchInput.value.length > 0;
        if (searchClear) searchClear.hidden = !hasText;
        runSearch(searchInput.value);
    });

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const q = searchInput.value.trim();
            if (q) openDetail(q);
        }
        if (e.key === 'Escape') {
            searchInput.value = '';
            if (searchClear) searchClear.hidden = true;
            runSearch('');
        }
    });

    if (searchClear) {
        searchClear.addEventListener('click', () => {
            searchInput.value = '';
            searchClear.hidden = true;
            searchInput.focus();
            runSearch('');
        });
    }
}

/* ============================================================
   Quick Actions
   ============================================================ */
function handleQuickAction(e) {
    const action = e.currentTarget.dataset.action;

    switch (action) {
        case 'quick-add':
            openDetail('');
            break;
        case 'random': {
            const names = getStoredNames();
            if (!names.length) {
                renderList([], { title: 'Randomize', empty: 'Your archive is empty.' });
                return;
            }
            const pick = names[Math.floor(Math.random() * names.length)];
            renderList([pick], { title: '🎲 Random Pick' });
            break;
        }
    }
}

function initQuickActions() {
    actionButtons.forEach((btn) => {
        btn.addEventListener('click', handleQuickAction);
    });
}

/* ============================================================
   Modal wiring
   ============================================================ */
function initDetailModal() {
    detailClose?.addEventListener('click', closeDetail);
    detailCancel?.addEventListener('click', closeDetail);
    detailForm?.addEventListener('submit', handleSave);
    tagInput?.addEventListener('input', renderTagPreview);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && detailOverlay && !detailOverlay.hidden) {
            closeDetail();
        }
    });
}

/* ============================================================
   Flip clock
   ============================================================ */
function initFlipClock() {
    const ANIMATION_MS = 900;
    const pad2 = (n) => String(n).padStart(2, '0');

    let paused = false;

    document.addEventListener('a11y:pause-clock', (e) => {
        paused = e.detail;
    });

    function flip(digitEl, newValue) {
        const current = digitEl.dataset.value;
        if (current === newValue) return;

        const card = digitEl.querySelector('.flip-card');
        const top = digitEl.querySelector('.flip-top span');
        const bottom = digitEl.querySelector('.flip-bottom span');

        const leafTop = Object.assign(document.createElement('div'), {
            className: 'flip-leaf flip-leaf-top',
            innerHTML: `<span>${current}</span>`
        });
        const leafBottom = Object.assign(document.createElement('div'), {
            className: 'flip-leaf flip-leaf-bottom',
            innerHTML: `<span>${newValue}</span>`
        });

        card.append(leafTop, leafBottom);

        top.textContent = newValue;
        bottom.textContent = current;

        requestAnimationFrame(() => card.classList.add('flipping'));

        setTimeout(() => {
            card.classList.remove('flipping');
            leafTop.remove();
            leafBottom.remove();
            bottom.textContent = newValue;
            digitEl.dataset.value = newValue;
        }, ANIMATION_MS);
    }

    function setUnit(unit, value) {
        const el = document.querySelector(`.flip-digit[data-unit="${unit}"]`);
        if (!el) return;
        flip(el, pad2(value));
    }

    function tick() {
        const now = new Date();
        setUnit('hours', now.getHours());
        setUnit('minutes', now.getMinutes());
    }

    const now = new Date();
    for (const el of document.querySelectorAll('.flip-digit')) {
        const v = pad2(el.dataset.unit === 'hours' ? now.getHours() : now.getMinutes());
        el.dataset.value = v;
        el.querySelector('.flip-top span').textContent = v;
        el.querySelector('.flip-bottom span').textContent = v;
    }

    setTimeout(() => {
        tick();
        setInterval(() => {
            if (!paused) tick();
        }, 1000);
    }, 1000 - (Date.now() % 1000));
}

/* ============================================================
   Clock messages
   ============================================================ */
function initClockMessages() {
    const message = document.querySelector('.time-messages');
    if (!message) return;

    function update() {
        const now = new Date();
        const hour = now.getHours();
        const min = now.getMinutes();

        const hourStr = String(hour).padStart(2, '0');
        const minStr = String(min).padStart(2, '0');
        const reversedMinStr = minStr.split('').reverse().join('');

        if (hour === min) {
            message.textContent = 'Double Double!';
        } else if (hourStr === reversedMinStr) {
            message.textContent = 'Mirror!';
        } else if ((hour === 12 || hour === 24) && min === 34) {
            message.textContent = '5, 6, 7, 8...';
        } else if ((hour === 11 && min === 11) || (hour === 23 && min === 23)) {
            message.textContent = 'Make a wish!';
        } else if (hour < 12) {
            message.textContent = 'Good Morning!';
        } else if (hour === 12) {
            message.textContent = 'Noon';
        } else if (hour < 18) {
            message.textContent = 'Good Afternoon!';
        } else {
            message.textContent = 'Good Evening!';
        }
    }

    update();
    setInterval(update, 1000);
}

/* ============================================================
   Accessibility panel
   ============================================================ */
function initAccessibilityPanel() {
    const openBtn        = document.getElementById('a11y-open');
    const backBtn        = document.getElementById('a11y-back');
    const archiveView    = document.getElementById('view-archive');
    const a11yView       = document.getElementById('view-a11y');
    const resetBtn       = document.getElementById('a11y-reset');
    const readingGuideEl = document.getElementById('a11y-reading-guide');

    if (!openBtn || !archiveView || !a11yView) return;

    const html = document.documentElement;

    const els = {
        fontSize:           document.getElementById('a11y-font-size'),
        lineHeight:         document.getElementById('a11y-line-height'),
        letterSpacing:      document.getElementById('a11y-letter-spacing'),
        fontFamily:         document.getElementById('a11y-font-family'),
        boldText:           document.getElementById('a11y-bold-text'),
        underlineLinks:     document.getElementById('a11y-underline-links'),
        contrast:           document.getElementById('a11y-contrast'),
        reduceTransparency: document.getElementById('a11y-reduce-transparency'),
        reduceMotion:       document.getElementById('a11y-reduce-motion'),
        pauseClock:         document.getElementById('a11y-pause-clock'),
        bigFocus:           document.getElementById('a11y-big-focus'),
        highlightHeadings:  document.getElementById('a11y-highlight-headings'),
        bigCursor:          document.getElementById('a11y-big-cursor'),
        readingGuide:       document.getElementById('a11y-reading-guide')
    };

    function setFontSize(pct) {
        html.style.fontSize = pct === 100 ? '' : `${pct}%`;
    }
    function setLineHeight(pct) {
        document.body.style.lineHeight = pct === 100 ? '' : String(pct / 100);
    }
    function setLetterSpacing(px) {
        document.body.style.letterSpacing = px === 0 ? '' : `${px}px`;
    }
    function setFontFamily(value) {
        const fonts = {
            default: '',
            sans: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
            serif: 'Georgia, "Times New Roman", serif',
            mono: '"SF Mono", Consolas, "Liberation Mono", monospace',
            dyslexic: '"OpenDyslexic", "Comic Sans MS", sans-serif',
            comic: '"Comic Sans MS", "Comic Sans", cursive',
            atkinson: '"Atkinson Hyperlegible", system-ui, sans-serif'
        };
        document.body.style.fontFamily = fonts[value] || '';
    }
    function setBold(on) {
        document.body.style.fontWeight = on ? '700' : '';
    }
    function setUnderlineLinks(on) {
        document.querySelectorAll('a').forEach((a) => {
            a.style.textDecoration = on ? 'underline' : '';
        });
    }
    function setContrast(value) {
        if (value === 'default') {
            html.style.filter = '';
            html.style.background = '';
            html.style.color = '';
        } else if (value === 'high') {
            html.style.filter = 'contrast(1.4)';
            html.style.background = '#000';
            html.style.color = '#fff';
        } else if (value === 'invert') {
            html.style.filter = 'invert(1) hue-rotate(180deg)';
        }
    }
    function setReduceTransparency() {}
    function setReduceMotion(on) {
        html.classList.toggle('a11y-reduce-motion-live', on);
    }
    function setPauseClock(on) {
        document.dispatchEvent(new CustomEvent('a11y:pause-clock', { detail: on }));
    }
    function setBigFocus(on) {
        html.classList.toggle('a11y-big-focus-live', on);
    }
    function setHighlightHeadings(on) {
        document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
            h.style.background = on ? 'rgba(255, 220, 100, 0.35)' : '';
            h.style.padding = on ? '2px 6px' : '';
            h.style.borderRadius = on ? '4px' : '';
        });
    }
    function setBigCursor(on) {
        if (on) {
            html.style.cursor =
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 24 24'><path fill='white' stroke='black' stroke-width='1.4' d='M5 3l14 9-6 1 4 8-3 1-4-8-5 5z'/></svg>\") 3 2, auto";
        } else {
            html.style.cursor = '';
        }
    }
    function setReadingGuide(on) {
        if (!readingGuideEl) return;
        readingGuideEl.style.display = on ? 'block' : 'none';
    }

    let lastFocused = null;

    function showA11y() {
        lastFocused = document.activeElement;
        archiveView.hidden = true;
        a11yView.hidden = false;
        document.querySelector('.a11y-panel h1')?.focus?.();
    }
    function showArchive() {
        a11yView.hidden = true;
        archiveView.hidden = false;
        lastFocused?.focus();
    }

    openBtn.addEventListener('click', showA11y);
    backBtn?.addEventListener('click', showArchive);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !a11yView.hidden) showArchive();
    });

    els.fontSize.addEventListener('input', () => {
        const v = Number(els.fontSize.value);
        document.getElementById('a11y-font-size-val').textContent = `${v}%`;
        setFontSize(v);
    });
    els.lineHeight.addEventListener('input', () => {
        const v = Number(els.lineHeight.value);
        document.getElementById('a11y-line-height-val').textContent = `${v}%`;
        setLineHeight(v);
    });
    els.letterSpacing.addEventListener('input', () => {
        const v = Number(els.letterSpacing.value);
        document.getElementById('a11y-letter-spacing-val').textContent = `${v}px`;
        setLetterSpacing(v);
    });
    els.fontFamily.addEventListener('change', () => setFontFamily(els.fontFamily.value));
    els.boldText.addEventListener('change', () => setBold(els.boldText.checked));
    els.underlineLinks.addEventListener('change', () => setUnderlineLinks(els.underlineLinks.checked));
    els.contrast.addEventListener('change', () => setContrast(els.contrast.value));
    els.reduceTransparency.addEventListener('change', () => setReduceTransparency());
    els.reduceMotion.addEventListener('change', () => setReduceMotion(els.reduceMotion.checked));
    els.pauseClock.addEventListener('change', () => setPauseClock(els.pauseClock.checked));
    els.bigFocus.addEventListener('change', () => setBigFocus(els.bigFocus.checked));
    els.highlightHeadings.addEventListener('change', () => setHighlightHeadings(els.highlightHeadings.checked));
    els.bigCursor.addEventListener('change', () => setBigCursor(els.bigCursor.checked));
    els.readingGuide.addEventListener('change', () => setReadingGuide(els.readingGuide.checked));

    document.addEventListener('pointermove', (e) => {
        if (!readingGuideEl || readingGuideEl.style.display === 'none') return;
        readingGuideEl.style.top = `${e.clientY - 20}px`;
    });

    resetBtn?.addEventListener('click', () => {
        els.fontSize.value = 100;
        els.lineHeight.value = 100;
        els.letterSpacing.value = 0;
        els.fontFamily.value = 'default';
        els.boldText.checked = false;
        els.underlineLinks.checked = false;
        els.contrast.value = 'default';
        els.reduceTransparency.checked = false;
        els.reduceMotion.checked = false;
        els.pauseClock.checked = false;
        els.bigFocus.checked = false;
        els.highlightHeadings.checked = false;
        els.bigCursor.checked = false;
        els.readingGuide.checked = false;

        document.getElementById('a11y-font-size-val').textContent = '100%';
        document.getElementById('a11y-line-height-val').textContent = '100%';
        document.getElementById('a11y-letter-spacing-val').textContent = '0px';

        setFontSize(100);
        setLineHeight(100);
        setLetterSpacing(0);
        setFontFamily('default');
        setBold(false);
        setUnderlineLinks(false);
        setContrast('default');
        setReduceTransparency(false);
        setReduceMotion(false);
        setPauseClock(false);
        setBigFocus(false);
        setHighlightHeadings(false);
        setBigCursor(false);
        setReadingGuide(false);
    });
}

/* ============================================================
   Boot — auth guard, then initialize everything
   ============================================================ */
document.addEventListener('DOMContentLoaded', async () => {
    let user;
    try {
        const res = await fetch('/api/me');
        if (!res.ok) {
            window.location.href = 'login-page.html';
            return;
        }
        user = await res.json();
    } catch {
        window.location.href = 'login-page.html';
        return;
    }

    const usernameEl = document.querySelector('.sidebar-pfp-info > div:first-child');
    if (usernameEl) {
        usernameEl.textContent = `@${user.username}`;
    }

    cacheDomRefs();
    initSidebar();
    initSearch();
    initQuickActions();
    initDetailModal();
    initFlipClock();
    initClockMessages();
    initAccessibilityPanel();
    initLogout();

    renderList(getStoredNames(), {
        title: 'Your Archive',
        empty: 'Your archive is empty. Type a name and press Enter to get started!'
    });
});