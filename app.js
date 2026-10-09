// ============================================================
// ALATIKA 3.0 — app.js
// Verzija: v19 (ETA 1)
// ============================================================

// ================= POMOĆNE =================
function el(id) { return document.getElementById(id); }

function parseNum(val) {
    if (val === null || val === undefined) return null;
    const s = String(val).trim().replace(/\s/g, '');
    if (s === '') return null;
    if (s.includes('.') && s.includes(',')) {
        const lastDot = s.lastIndexOf('.');
        const lastComma = s.lastIndexOf(',');
        let normalized;
        if (lastComma > lastDot) normalized = s.replace(/\./g, '').replace(',', '.');
        else normalized = s.replace(/,/g, '');
        const n = parseFloat(normalized);
        return isNaN(n) ? null : n;
    }
    if (s.includes(',')) {
        const n = parseFloat(s.replace(',', '.'));
        return isNaN(n) ? null : n;
    }
    const n = parseFloat(s);
    return isNaN(n) ? null : n;
}

function num(id) { const elem = el(id); if (!elem) return null; return parseNum(elem.value); }
function hide(id) { const elem = el(id); if (elem) elem.style.display = 'none'; }
function show(id, live = false) {
    const box = el(id);
    if (!box) return;
    box.style.display = 'flex';
    if (!live && !reduceMotion) {
        box.classList.remove('flash');
        void box.offsetWidth;
        box.classList.add('flash');
    }
    const nodes = box.querySelectorAll('span[id^="res-"], strong[id^="stat-"], h3[id^="res-"]');
    if (reduceMotion) {
        if (!live && id.indexOf('result') !== -1) vibrate(15);
        return;
    }
    nodes.forEach(node => {
        node.style.fontVariantNumeric = 'tabular-nums';
        rollElement(node, live);
    });
    if (!live && id.indexOf('result') !== -1) rollFeedback(850);
}

function fmt(n, maxDecimals = 6) {
    if (typeof n !== 'number' || isNaN(n)) return '0';
    const rounded = Number(n.toPrecision(10));
    const locale = (typeof currentLang !== 'undefined' && currentLang === 'en') ? 'en-US' : 'sr-RS';
    return rounded.toLocaleString(locale, { maximumFractionDigits: maxDecimals });
}
function money(n) {
    if (typeof n !== 'number' || isNaN(n)) return '0.00';
    const locale = (typeof currentLang !== 'undefined' && currentLang === 'en') ? 'en-US' : 'sr-RS';
    return n.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function cardText(card) {
    const clone = card.cloneNode(true);
    clone.querySelectorAll('button').forEach(b => b.remove());
    return clone.innerText.replace(/\n\s*\n/g, '\n').trim();
}
function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function safeT(key, ...args) {
    if (typeof t === 'function') return t(key, ...args);
    return key;
}

// ================= ICONS =================
const ICONS = {
    car: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>',
    bike: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6h4"/><path d="M5.5 17.5 10 8h4l4.5 9.5"/></svg>',
    wallet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>',
    ruler: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.3 8.7 15.3 2.7a1 1 0 0 0-1.4 0L2.7 13.9a1 1 0 0 0 0 1.4l6 6a1 1 0 0 0 1.4 0L21.3 10a1 1 0 0 0 0-1.4Z"/><path d="m7.5 10.5 2 2"/><path d="m10.5 7.5 2 2"/><path d="m13.5 4.5 2 2"/><path d="m4.5 13.5 2 2"/></svg>',
    heartPulse: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    hammer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 12-8.5 8.5a2.12 2.12 0 1 1-3-3L12 9"/><path d="M17.64 15 22 10.64"/><path d="m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16.01 4.6a5.56 5.56 0 0 0-3.94-1.64H9l.92.82A6.18 6.18 0 0 1 12 8.4v1.56l2 2h2.47l2.26 1.91"/></svg>',
    cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>',
    chef: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z"/><path d="M6 17h12"/></svg>',
    zap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>',
    briefcase: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg>',
    music: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
    fuel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" x2="15" y1="22" y2="22"/><line x1="4" x2="14" y1="9" y2="9"/><path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"/><path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2 2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5"/></svg>',
    route: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/></svg>',
    coins: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/></svg>',
    wrench: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>',
    calculator: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>',
    gauge: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>',
    level: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="9" width="20" height="6" rx="3"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><line x1="12" y1="9.5" x2="12" y2="11"/><line x1="9.5" y1="12" x2="11" y2="12"/><line x1="13" y1="12" x2="14.5" y2="12"/><line x1="12" y1="13" x2="12" y2="14.5"/></svg>',
    wind: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>',
    flame: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
    settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>',
    tag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></svg>',
    percent: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" x2="5" y1="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>',
    creditCard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>',
    exchange: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/></svg>',
    receipt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/></svg>',
    handshake: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h8"/></svg>',
    scale: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>',
    box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>',
    droplets: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/></svg>',
    thermometer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/></svg>',
    speedometer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>',
    database: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>',
    activity: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
    target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
    run: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
    dumbbell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>',
    cake: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/><path d="M2 21h20"/><path d="M7 8v3"/><path d="M12 8v3"/><path d="M17 8v3"/><path d="M7 4h.01"/><path d="M12 4h.01"/><path d="M17 4h.01"/></svg>',
    hourglass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>',
    calendarDays: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>',
    calendarPlus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M12 14v4"/><path d="M10 16h4"/></svg>',
    briefcaseSm: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg>',
    square: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>',
    bricks: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="1"/><path d="M12 6v12"/><path d="M2 12h20"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    building: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>',
    paint: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>',
    tiles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>',
    layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></svg>',
    droplet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>',
    plug: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/></svg>',
    battery: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="10" x="2" y="7" rx="2"/><line x1="22" x2="22" y1="11" y2="13"/></svg>',
    trending: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>',
    cable: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1h-1"/><path d="M3 21v-2a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H6"/><path d="M8 7V3"/><path d="M16 7V3"/><path d="M8 7h8"/><path d="M8 7v5a4 4 0 0 0 8 0V7"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>',
    lightbulb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>',
    timer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/></svg>',
    dollarSign: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    banknote: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>',
    clipboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>',
    gift: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/></svg>',
    spoon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s-2-3-2-8 2-12 2-12 2 7 2 12-2 8-2 8z"/></svg>',
    glassWater: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15.2 22H8.8a2 2 0 0 1-2-1.79l-1.78-14A2 2 0 0 1 7 4h10a2 2 0 0 1 1.98 2.21l-1.79 14A2 2 0 0 1 15.2 22Z"/><path d="M6 10h12"/></svg>',
    utensils: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>',
    oven: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="18" x="2" y="3" rx="2"/><path d="M2 11h20"/><path d="M8 11v.01"/><path d="M16 11v.01"/><path d="M6 7h2"/><path d="M12 7h2"/><path d="M18 7h2"/></svg>',
    barcode: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5v14"/><path d="M8 5v14"/><path d="M12 5v14"/><path d="M17 5v14"/><path d="M21 5v14"/></svg>',
    split: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M21 3 13 11"/><path d="M3 3 11 11"/><path d="M21 21 13 13"/><path d="M3 21 11 13"/></svg>',
    plusCircle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>',
    list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>',
    calendarSm: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    packageSm: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>',
    guitar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m11.9 12.1 4.514-4.514"/><path d="M20.1 2.3a1 1 0 0 0-1.4 0l-1.114 1.114A2 2 0 0 0 17 4.828v1.344a2 2 0 0 1-.586 1.414A2 2 0 0 1 17.828 7h1.344a2 2 0 0 0 1.414-.586L21.7 5.3a1 1 0 0 0 0-1.4z"/><path d="m6 16 2 2"/><path d="M8.23 9.85A3 3 0 0 1 11 8a5 5 0 0 1 5 5 3 3 0 0 1-1.85 2.77l-.92.38A2 2 0 0 0 12 18a4 4 0 0 1-4 4 6 6 0 0 1-6-6 4 4 0 0 1 4-4 2 2 0 0 0 1.85-1.23z"/></svg>',
    musicNote: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="18" r="4"/><path d="M12 18V2l7 4"/></svg>',
    mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19v3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><rect x="9" y="2" width="6" height="13" rx="3"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    starFill: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>',
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
    arrowRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>',
    arrowLeft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
    refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>',
    swap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
    alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
    cloud: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>',
    cloudSun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"/><path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z"/></svg>',
    cloudRain: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></svg>',
    cloudSnow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M8 15h.01"/><path d="M8 19h.01"/><path d="M12 17h.01"/><path d="M12 21h.01"/><path d="M16 15h.01"/><path d="M16 19h.01"/></svg>',
    cloudLightning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973"/><path d="m13 12-3 5h4l-3 5"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>',
    sunrise: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v8"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m8 6 4-4 4 4"/><path d="M16 18a4 4 0 0 0-8 0"/></svg>',
    sunset: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 10V2"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m16 6-4 4-4-4"/><path d="M16 18a4 4 0 0 0-8 0"/></svg>',
    mapPin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
    navigation: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
    bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>',
    stopwatch: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M9 2h6"/><path d="M12 2v3"/><path d="m19 5-1.5 1.5"/><path d="m5 5 1.5 1.5"/></svg>',
    mountain: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>',
    flag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>',
    rotateCcw: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',
    volume2: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>',
    save: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>',
    qrCode: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg>',
    pencil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    foot: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z"/><path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z"/></svg>',
    shirt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>',
    binary: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="14" y="14" width="4" height="6" rx="2"/><rect x="6" y="4" width="4" height="6" rx="2"/><path d="M6 20h4"/><path d="M14 10h4"/><path d="M6 14h2v6"/><path d="M14 4h2v6"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
    sparkles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>',
    leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>',
    camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>',
    image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',
    fileText: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>',
    piggyBank: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 17h3v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3a3.16 3.16 0 0 0 2-2h1a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-1a5 5 0 0 0-2-4V3a4 4 0 0 0-3.2 1.6l-.3.4H11a6 6 0 0 0-6 6v1a5 5 0 0 0 2 4v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2Z"/><path d="M16 10h.01"/></svg>'
};

function icon(name) {
    return ICONS[name] || ICONS.info;
}
// ============================================================
// CATEGORIES — v19 (ETA 1)
// Izmene:
//   - nova kategorija racuni (3 taba)
//   - money.tabs: racuni uklonjen, valuta prvi
// ============================================================
const CATEGORIES = {
    podsetnici: {
        name: 'Podsetnici', icon: 'bell', accent: '#f59e0b',
        tabs: [
            { id: 'arhiva', name: 'Arhiva', icon: 'clipboard', render: renderRemindersHistory },
            { id: 'rate', name: 'Rate', icon: 'creditCard', render: renderRemindersRate },
            { id: 'rodjendani', name: 'Rođendani', icon: 'cake', render: renderRemindersBirthdays },
            { id: 'racuni', name: 'Računi', icon: 'receipt', render: renderRemindersBills },
            { id: 'vozila', name: 'Vozila i dokumenti', icon: 'car', render: renderRemindersVehicles },
            { id: 'pretplate', name: 'Pretplate', icon: 'creditCard', render: renderRemindersSubscriptions },
            { id: 'lekivi', name: 'Lekovi', icon: 'heartPulse', render: renderRemindersMedications },
            { id: 'godisnjice', name: 'Godišnjice', icon: 'gift', render: renderRemindersAnniversaries },
            { id: 'napomene', name: 'Napomene', icon: 'clipboard', render: renderRemindersNotes }
        ]
    },
    racuni: {
        name: 'Računi', icon: 'receipt', accent: '#0ea5e9',
        tabs: [
            { id: 'moji', name: 'Moji računi', icon: 'receipt', render: renderRacuni },
            { id: 'pregled', name: 'Pregled', icon: 'chart', render: renderRacuniPregled },
            { id: 'analiza', name: 'Analiza', icon: 'trending', render: renderRacuniAnaliza }
        ]
    },
    weather: {
        name: 'Vreme', icon: 'cloudSun', accent: '#38bdf8',
        tabs: [
            { id: 'prognoza', name: 'Prognoza', icon: 'cloudSun', render: renderWeatherPrognoza },
            { id: 'vazduh', name: 'Vazduh', icon: 'wind', render: renderWeatherVazduh }
        ]
    },
    money: {
        name: 'Novac', icon: 'wallet', accent: '#10b981',
        tabs: [
            { id: 'valuta', name: 'Kursna lista', icon: 'exchange', render: renderMoneyValuta },
            { id: 'popust', name: 'Popust i procenat', icon: 'tag', render: renderMoneyPopust },
            { id: 'pdv', name: 'PDV', icon: 'percent', render: renderMoneyPDV },
            { id: 'kredit', name: 'Kredit', icon: 'creditCard', render: renderMoneyKredit },
            { id: 'rate', name: 'Rate', icon: 'creditCard', render: renderMoneyRate },
            { id: 'podela', name: 'Podela računa i napojnica', icon: 'receipt', render: renderMoneyPodela },
            { id: 'poredjenje', name: 'Poređenje cena', icon: 'scale', render: renderMoneyPoredjenje },
            { id: 'budzet', name: 'Budžet', icon: 'calendarSm', render: renderMoneyBudzet },
            { id: 'stednja', name: 'Štednja', icon: 'piggyBank', render: renderMoneyStednja }
        ]
    },
    measures: {
        name: 'Mere', icon: 'ruler', accent: '#8b5cf6',
        tabs: [
            { id: 'duzina', name: 'Dužina i brzina', icon: 'ruler', render: renderMeasuresDuzina },
            { id: 'tezina', name: 'Težina', icon: 'scale', render: renderMeasuresTezina },
            { id: 'povrsina', name: 'Površina i zapremina', icon: 'square', render: renderMeasuresPovrsina },
            { id: 'temp', name: 'Temperatura i pritisak', icon: 'thermometer', render: renderMeasuresTemp },
            { id: 'podaci', name: 'Podaci', icon: 'database', render: renderMeasuresPodaci },
            { id: 'vreme', name: 'Vreme (jedinice)', icon: 'clock', render: renderTimeKonverter },
            { id: 'valuta', name: 'Valuta', icon: 'exchange', render: renderMoneyValuta },
            { id: 'kuhinjske', name: 'Kuhinjske mere', icon: 'spoon', render: renderKitchenKasike },
            { id: 'pecenje', name: 'Pećnica', icon: 'oven', render: renderKitchenPecenje },
            { id: 'obuca', name: 'Obuvanje', icon: 'foot', render: renderConversionObuca },
            { id: 'odeca', name: 'Veličina odeće', icon: 'shirt', render: renderConversionOdeca },
            { id: 'brojevi', name: 'Brojevi', icon: 'binary', render: renderConversionBrojevi }
        ]
    },
    shopping: {
        name: 'Kupovina', icon: 'cart', accent: '#14b8a6',
        tabs: [
            { id: 'unit', name: 'Cena po jedinici', icon: 'barcode', render: renderShopUnit },
            { id: 'compare', name: 'Poređenje', icon: 'scale', render: renderShopCompare },
            { id: 'lista', name: 'Lista za kupovinu', icon: 'list', render: renderShopLista },
            { id: 'barkod', name: 'Skeniranje barkoda', icon: 'qrCode', render: renderBarcodeScanner },
            { id: 'pracenje', name: 'Praćenje cena', icon: 'trending', render: renderPriceTracking },
            { id: 'isplati', name: 'Isplati se', icon: 'target', render: renderShopIsplati },
            { id: 'racuni', name: 'Cena po obroku', icon: 'packageSm', render: renderShopRasipanje },
            { id: 'budzet', name: 'Dnevni budžet', icon: 'calendarSm', render: renderShopBudzet }
        ]
    },
    auto: {
        name: 'Auto', icon: 'car', accent: '#f43f5e',
        tabs: [
            { id: 'potrosnja', name: 'Potrošnja', icon: 'fuel', render: renderAutoPotrosnja },
            { id: 'trosakputa', name: 'Trošak puta', icon: 'coins', render: renderAutoTrosakPuta },
            { id: 'servis', name: 'Servis', icon: 'wrench', render: renderAutoServis },
            { id: 'istorijatocenja', name: 'Istorija točenja', icon: 'trending', render: renderFuelHistory },
            { id: 'profil', name: 'Profil vozila', icon: 'car', render: renderVehicleProfile },
            { id: 'godisnji', name: 'Godišnji trošak', icon: 'calendar', render: renderAutoGodisnji }
        ]
    },
    bike: {
        name: 'Bicikl', icon: 'bike', accent: '#06b6d4',
        tabs: [
            { id: 'brzina', name: 'Brzina', icon: 'gauge', render: renderBikeBrzina },
            { id: 'pritisak', name: 'Pritisak guma', icon: 'wind', render: renderBikePritisak },
            { id: 'rama', name: 'Veličina rama', icon: 'ruler', render: renderBikeRama },
            { id: 'kalorije', name: 'Kalorije', icon: 'flame', render: renderBikeKalorije }
        ]
    },
    health: {
        name: 'Zdravlje', icon: 'heartPulse', accent: '#ec4899',
        tabs: [
            { id: 'bmi', name: 'Telesne mere (BMI)', icon: 'scale', render: renderHealthBMI },
            { id: 'kalorije', name: 'Kalorije (BMR)', icon: 'flame', render: renderHealthBMR },
            { id: 'puls', name: 'Puls', icon: 'heartPulse', render: renderHealthPuls },
            { id: 'kardio', name: 'Kardio', icon: 'run', render: renderHealthTrcanje },
            { id: 'snaga', name: 'Snaga', icon: 'dumbbell', render: renderHealth1RM }
        ]
    },
    time: {
        name: 'Vreme i datumi', icon: 'clock', accent: '#f59e0b',
        tabs: [
            { id: 'razlika', name: 'Razlika datuma', icon: 'calendarDays', render: renderTimeRazlika },
            { id: 'pomeraj', name: 'Dodaj/Oduzmi dane', icon: 'calendarPlus', render: renderTimePomeraj },
            { id: 'godine', name: 'Godine osobe', icon: 'cake', render: renderTimeGodine },
            { id: 'radni', name: 'Radni dani', icon: 'briefcaseSm', render: renderTimeRadni },
            { id: 'praznici', name: 'Praznici', icon: 'calendar', render: renderHolidays },
            { id: 'zone', name: 'Vremenske zone', icon: 'globe', render: renderTimeZone },
            { id: 'konverter', name: 'Konverter vremena', icon: 'hourglass', render: renderTimeKonverter }
        ]
    },
    homecalc: {
        name: 'Građevina', icon: 'hammer', accent: '#ea580c',
        tabs: [
            { id: 'povrsina', name: 'Površina', icon: 'square', render: renderHomePovrsina },
            { id: 'blokovi', name: 'Zidanje (blokovi + malter)', icon: 'bricks', render: renderHomeBlokovi },
            { id: 'beton', name: 'Beton i temelj', icon: 'building', render: renderHomeBeton },
            { id: 'farbanje', name: 'Farbanje', icon: 'paint', render: renderHomeFarbanje },
            { id: 'troskovnik', name: 'Troškovnik', icon: 'receipt', render: renderCostEstimate }
        ]
    },
    kitchen: {
        name: 'Kuhinja', icon: 'chef', accent: '#84cc16',
        tabs: [
            { id: 'kasike', name: 'Kašike', icon: 'spoon', render: renderKitchenKasike },
            { id: 'pecenje', name: 'Pečenje', icon: 'oven', render: renderKitchenPecenje },
            { id: 'porcije', name: 'Porcije', icon: 'utensils', render: renderKitchenPorcije }
        ]
    },
    power: {
        name: 'Struja', icon: 'zap', accent: '#eab308',
        tabs: [
            { id: 'uredjaj', name: 'Trošak struje', icon: 'zap', render: renderPowerUredjaj },
            { id: 'kabl', name: 'Kabl i osigurač', icon: 'cable', render: renderPowerKabl },
            { id: 'solarni', name: 'Solarni paneli', icon: 'sun', render: renderSolarPanels },
            { id: 'baterije', name: 'Baterije', icon: 'battery', render: renderPowerBaterije }
        ]
    },
    work: {
        name: 'Posao', icon: 'briefcase', accent: '#3b82f6',
        tabs: [
            { id: 'vreme', name: 'Radno vreme', icon: 'timer', render: renderWorkVreme },
            { id: 'satnica', name: 'Satnica', icon: 'dollarSign', render: renderWorkSatnica },
            { id: 'plata', name: 'Plata', icon: 'banknote', render: renderWorkPlata },
            { id: 'odmor', name: 'Godišnji odmor', icon: 'calendar', render: renderWorkOdmor },
            { id: 'nocni', name: 'Noćni rad', icon: 'moon', render: renderWorkNocni },
            { id: 'prekovremeno', name: 'Prekovremeno', icon: 'activity', render: renderWorkPrekovremeno }
        ]
    },
    music: {
        name: 'Muzika', icon: 'music', accent: '#a855f7',
        tabs: [
            { id: 'stimer', name: 'Štimer', icon: 'guitar', render: renderMusicStimer }
        ]
    },
    gps: {
        name: 'GPS', icon: 'navigation', accent: '#0ea5e9',
        tabs: [
            { id: 'brzina', name: 'Brzina', icon: 'gauge', render: renderGpsBrzina },
            { id: 'stoperica', name: 'Štoperica', icon: 'stopwatch', render: renderGpsStoperica },
            { id: 'tajmer', name: 'Tajmer', icon: 'timer', render: renderGpsTajmer }
        ]
    }
};

// ============================================================
// MAIN_CATEGORIES — v19 (7 glavnih, dodato racuni kao 3.)
// ============================================================
const MAIN_CATEGORIES = [
    { id: 'vozila', name: 'Vozila', icon: 'car', accent: '#f43f5e', subcats: ['auto', 'bike'] },
    { id: 'novac_posao', name: 'Novac i posao', icon: 'wallet', accent: '#10b981', subcats: ['money', 'work', 'shopping'] },
    { id: 'racuni', name: 'Računi', icon: 'receipt', accent: '#0ea5e9', subcats: ['racuni'] },
    { id: 'mere_vreme', name: 'Mere i vreme', icon: 'ruler', accent: '#8b5cf6', subcats: ['measures', 'time', 'weather'] },
    { id: 'kuca_dom', name: 'Kuća i domaćinstvo', icon: 'home', accent: '#ea580c', subcats: ['homecalc', 'kitchen'] },
    { id: 'zdravlje_telo', name: 'Zdravlje i telo', icon: 'heartPulse', accent: '#ec4899', subcats: ['health'] },
    { id: 'tehnika_hobi', name: 'Tehnika i hobi', icon: 'zap', accent: '#eab308', subcats: ['power', 'music', 'gps'] }
];

function getMainCategoryById(id) {
    return MAIN_CATEGORIES.find(c => c.id === id) || null;
}

function getTabCount(categoryId, tabId) {
    try {
        if (categoryId === 'racuni') {
            if (tabId === 'moji') {
                try {
                    const list = loadReceipts();
                    return list.filter(r => !r.paid).length;
                } catch (e) { return 0; }
            }
            return 0;
        }
        if (categoryId !== 'podsetnici') return 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayMs = today.getTime();
        const dayMs = 86400000;

        if (tabId === 'rodjendani') {
            return loadReminders('cx_birthdays').filter(b => {
                if (b.done) return false;
                const d = daysToBirthday(b.date);
                return d !== null && d <= 7;
            }).length;
        }
        if (tabId === 'racuni') {
            return loadReminders('cx_bills').filter(b => !b.paid).length;
        }
        if (tabId === 'vozila') {
            const vehicles = loadReminders('cx_vehicles');
            const docs = loadReminders('cx_documents');
            let count = 0;
            vehicles.forEach(v => {
                if (v.done) return;
                [v.regDate, v.techDate, v.insuranceDate].forEach(dStr => {
                    if (!dStr) return;
                    const days = daysUntilDate(dStr);
                    if (days !== null && days >= 0 && days <= 30) count++;
                });
            });
            docs.forEach(d => {
                if (d.done) return;
                const days = daysUntilDate(d.expires);
                if (days !== null && days >= 0 && days <= 30) count++;
            });
            return count;
        }
        if (tabId === 'pretplate') {
            return loadReminders('cx_subscriptions').filter(s => s.active).length;
        }
        if (tabId === 'lekivi') {
            return loadReminders('cx_medications').filter(m => {
                if (m.done) return false;
                if (m.endDate) {
                    const days = daysUntilDate(m.endDate);
                    return days !== null && days >= 0 && days <= 7;
                }
                return true;
            }).length;
        }
        if (tabId === 'godisnjice') {
            return loadReminders('cx_anniversaries').filter(a => {
                if (a.done) return false;
                const d = daysToAnniversary(a.date);
                return d !== null && d <= 7;
            }).length;
        }
        if (tabId === 'napomene') {
            return loadReminders('cx_notes').filter(n => {
                if (n.done) return false;
                if (!n.dueDate) return false;
                const days = daysUntilDate(n.dueDate);
                return days !== null && days >= 0 && days <= 7;
            }).length;
        }
        if (tabId === 'rate') {
            try {
                const groups = loadInstallmentGroups();
                let count = 0;
                groups.forEach(g => {
                    (g.installments || []).forEach(inst => {
                        if (inst.paid) return;
                        const days = daysUntilDate(inst.date);
                        if (days !== null && days >= 0 && days <= 7) count++;
                    });
                });
                return count;
            } catch (e) { return 0; }
        }
        if (tabId === 'arhiva') {
            try {
                return getAllReminderItems().filter(i => i.isDone).length;
            } catch (e) { return 0; }
        }
        return 0;
    } catch (e) {
        return 0;
    }
}

const ALL_CATEGORY_IDS = Object.keys(CATEGORIES);

// ============================================================
// NIVO (LIBELA)
// ============================================================
const levelState = {
    listening: false,
    beta: 0,
    gamma: 0,
    offsetBeta: 0,
    offsetGamma: 0,
    lastVibrate: 0,
    supported: null
};

levelState.soundEnabled = true;
levelState.vibrateEnabled = true;

function levelIsSupported() {
    if (levelState.supported !== null) return levelState.supported;
    levelState.supported = ('DeviceOrientationEvent' in window);
    return levelState.supported;
}

function levelStart() {
    if (levelState.listening) return;
    if (!levelIsSupported()) {
        showToast(safeT('toolbar.level.unsupported'), 'error', 2500);
        return;
    }
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (isIOS && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
            .then(result => {
                if (result === 'granted') levelActuallyStart();
                else showToast(safeT('toolbar.level.denied'), 'warning', 2500);
            })
            .catch(() => showToast(safeT('toolbar.level.denied'), 'warning', 2500));
        return;
    }
    levelActuallyStart();
}

function levelActuallyStart() {
    window.addEventListener('deviceorientation', levelOnOrientation, true);
    levelState.listening = true;
    vibrate(20);
    playTick(0, 1500, 0.08, 0.03);
    levelUpdateDisplay();
}

function levelStop() {
    window.removeEventListener('deviceorientation', levelOnOrientation, true);
    levelState.listening = false;
    vibrate(15);
    levelUpdateDisplay();
}

function levelOnOrientation(e) {
    if (!levelState.listening) return;
    const beta = e.beta;
    const gamma = e.gamma;
    if (beta == null || gamma == null) return;
    levelState.beta = beta - levelState.offsetBeta;
    levelState.gamma = gamma - levelState.offsetGamma;
    levelUpdateDisplay();
    const isLevel = Math.abs(levelState.beta) < 1.5 && Math.abs(levelState.gamma) < 1.5;
    if (isLevel) {
        const now = Date.now();
        if (now - levelState.lastVibrate > 800) {
            levelState.lastVibrate = now;
            if (levelState.vibrateEnabled) vibrate(20);
            if (levelState.soundEnabled) playTick(0, 1800, 0.08, 0.03);
        }
    }
}

function levelUpdateDisplay() {
    const betaEl = el('level-beta-val');
    const gammaEl = el('level-gamma-val');
    const totalEl = el('level-total-val');
    const bubbleEl = el('level-bubble');
    const statusEl = el('level-status');
    if (!betaEl || !gammaEl) return;

    betaEl.textContent = levelState.beta.toFixed(1) + '°';
    gammaEl.textContent = levelState.gamma.toFixed(1) + '°';

    const total = Math.sqrt(levelState.beta ** 2 + levelState.gamma ** 2);
    if (totalEl) totalEl.textContent = total.toFixed(1) + '°';

    const isLevel = Math.abs(levelState.beta) < 1.5 && Math.abs(levelState.gamma) < 1.5;

    if (bubbleEl) {
        const maxOffset = 55;
        const x = Math.max(-maxOffset, Math.min(maxOffset, -levelState.gamma * 2.5));
        const y = Math.max(-maxOffset, Math.min(maxOffset, levelState.beta * 2.5));
        bubbleEl.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
        bubbleEl.classList.toggle('level-ok', isLevel);
    }
    if (statusEl) {
        statusEl.textContent = isLevel ? '✓ RAVNO JE' : 'Nagnuto';
        statusEl.classList.toggle('ok', isLevel);
    }
}

function levelCalibrate() {
    if (!levelState.listening) return;
    levelState.offsetBeta = levelState.beta + levelState.offsetBeta;
    levelState.offsetGamma = levelState.gamma + levelState.offsetGamma;
    levelState.beta = 0;
    levelState.gamma = 0;
    levelUpdateDisplay();
    vibrate([20, 50, 20]);
    playTick(0, 1600, 0.08, 0.03);
    showToast(safeT('toolbar.level.calibrated'), 'success', 1500);
}

function openLevelOptions() {
    const modal = el('level-modal');
    if (!modal) return;
    const title = el('level-modal-title');
    if (title) title.textContent = safeT('toolbar.level.title');
    const toggleBtn = el('level-toggle-btn');
    if (toggleBtn) toggleBtn.textContent = levelState.listening ? safeT('toolbar.level.stop') : safeT('toolbar.level.start');

    try {
        const s = localStorage.getItem('cx_level_sound');
        if (s !== null) levelState.soundEnabled = s === '1';
        const v = localStorage.getItem('cx_level_vibrate');
        if (v !== null) levelState.vibrateEnabled = v === '1';
    } catch(e) {}

    const soundBtn = el('level-sound-toggle');
    if (soundBtn) soundBtn.classList.toggle('active', levelState.soundEnabled);
    const vibBtn = el('level-vibrate-toggle');
    if (vibBtn) vibBtn.classList.toggle('active', levelState.vibrateEnabled);

    modal.classList.add('show');
    document.body.classList.add('modal-open');
    vibrate(15);
    playTick(0, 1400, 0.06, 0.02);
    if (!levelState.listening) levelStart();
}

function toggleLevelSound() {
    levelState.soundEnabled = !levelState.soundEnabled;
    const btn = el('level-sound-toggle');
    if (btn) btn.classList.toggle('active', levelState.soundEnabled);
    try { localStorage.setItem('cx_level_sound', levelState.soundEnabled ? '1' : '0'); } catch(e) {}
    vibrate(10);
}

function toggleLevelVibrate() {
    levelState.vibrateEnabled = !levelState.vibrateEnabled;
    const btn = el('level-vibrate-toggle');
    if (btn) btn.classList.toggle('active', levelState.vibrateEnabled);
    try { localStorage.setItem('cx_level_vibrate', levelState.vibrateEnabled ? '1' : '0'); } catch(e) {}
    vibrate(10);
}

function levelResetOffset() {
    levelState.offsetBeta = 0;
    levelState.offsetGamma = 0;
    levelState.beta = 0;
    levelState.gamma = 0;
    levelUpdateDisplay();
    vibrate(15);
    showToast('Nivo resetovan', 'info', 1500);
}

// ============================================================
// ŠTOPERICA (TOOLBAR)
// ============================================================
const toolbarStopwatchState = {
    running: false,
    startTime: 0,
    elapsedMs: 0,
    rafId: null,
    laps: [],
    lastLapTime: 0,
    lapsOpen: false
};

const STOPWATCH_CIRCUMFERENCE = 615.75;
const STOPWATCH_RING_PERIOD_MS = 60000;

function toolbarStopwatchToggle() {
    if (toolbarStopwatchState.running) {
        toolbarStopwatchState.running = false;
        toolbarStopwatchState.elapsedMs = performance.now() - toolbarStopwatchState.startTime;
        if (toolbarStopwatchState.rafId) {
            cancelAnimationFrame(toolbarStopwatchState.rafId);
            toolbarStopwatchState.rafId = null;
        }
        vibrate(15);
    } else {
        toolbarStopwatchState.running = true;
        toolbarStopwatchState.startTime = performance.now() - toolbarStopwatchState.elapsedMs;
        toolbarStopwatchTick();
        vibrate(20);
        playTick(0, 1500, 0.08, 0.03);
    }
    toolbarStopwatchUpdateBtn();
}

function toolbarStopwatchTick() {
    if (!toolbarStopwatchState.running) return;
    const now = performance.now() - toolbarStopwatchState.startTime;
    toolbarStopwatchState.elapsedMs = now;
    toolbarStopwatchUpdateDisplay(now);
    toolbarStopwatchState.rafId = requestAnimationFrame(toolbarStopwatchTick);
}

function toolbarStopwatchUpdateDisplay(ms) {
    const timeEl = el('toolbar-stopwatch-time');
    if (timeEl) timeEl.textContent = formatStopwatchTime(ms);

    const ring = el('stopwatch-ring-progress');
    if (ring) {
        const pct = (ms % STOPWATCH_RING_PERIOD_MS) / STOPWATCH_RING_PERIOD_MS;
        const offset = STOPWATCH_CIRCUMFERENCE * (1 - pct);
        ring.style.strokeDashoffset = offset.toFixed(2);
    }
}

function formatStopwatchTime(ms) {
    const total = Math.max(0, ms);
    const totalSec = total / 1000;
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec - h * 3600) / 60);
    const s = Math.floor(totalSec - h * 3600 - m * 60);
    const cs = Math.floor((totalSec - Math.floor(totalSec)) * 100);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}

function toolbarStopwatchLap() {
    if (!toolbarStopwatchState.running && toolbarStopwatchState.elapsedMs === 0) {
        showToast(safeT('gps.sw.noLap') || 'Prvo pokreni štopericu.', 'info', 1500);
        return;
    }
    const currentTotal = toolbarStopwatchState.running
        ? performance.now() - toolbarStopwatchState.startTime
        : toolbarStopwatchState.elapsedMs;
    const prevTotal = toolbarStopwatchState.laps.length
        ? toolbarStopwatchState.laps[toolbarStopwatchState.laps.length - 1].total
        : 0;
    const lapTime = currentTotal - prevTotal;
    toolbarStopwatchState.laps.push({ lap: lapTime, total: currentTotal });
    toolbarStopwatchRenderLaps();
    toolbarStopwatchUpdateStats();
    vibrate(10);
    playTick(0, 1400, 0.06, 0.02);
}

function toolbarStopwatchUpdateStats() {
    const countEl = el('stopwatch-lap-count');
    const bestEl = el('stopwatch-best-lap');
    const worstEl = el('stopwatch-worst-lap');
    const laps = toolbarStopwatchState.laps;
    if (countEl) countEl.textContent = laps.length;

    if (laps.length === 0) {
        if (bestEl) bestEl.textContent = '—';
        if (worstEl) worstEl.textContent = '—';
        return;
    }
    const lapTimes = laps.map(l => l.lap);
    const best = Math.min(...lapTimes);
    const worst = Math.max(...lapTimes);
    if (bestEl) bestEl.textContent = formatShortLap(best);
    if (worstEl) worstEl.textContent = formatShortLap(worst);
}

function formatShortLap(ms) {
    const total = Math.max(0, ms);
    const totalSec = total / 1000;
    const m = Math.floor(totalSec / 60);
    const s = Math.floor(totalSec - m * 60);
    const cs = Math.floor((totalSec - Math.floor(totalSec)) * 100);
    if (m > 0) {
        return `${m}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
    }
    return `${s}.${String(cs).padStart(2, '0')}`;
}

function toolbarStopwatchRenderLaps() {
    const wrap = el('stopwatch-laps-wrap');
    const list = el('stopwatch-laps-list');
    const title = el('stopwatch-laps-title');
    if (!wrap || !list) return;
    const laps = toolbarStopwatchState.laps;
    if (laps.length === 0) {
        wrap.style.display = 'none';
        return;
    }
    wrap.style.display = 'block';
    if (title) title.textContent = `Krugovi (${laps.length})`;

    const lapTimes = laps.map(l => l.lap);
    const best = Math.min(...lapTimes);
    const worst = Math.max(...lapTimes);
    const showColors = laps.length > 1;

    list.innerHTML = laps.map((l, i) => {
        const num = i + 1;
        let cls = '';
        if (showColors) {
            if (l.lap === best) cls = 'best';
            else if (l.lap === worst) cls = 'worst';
        }
        return `<div class="stopwatch-lap-row ${cls}">
            <span class="stopwatch-lap-num">#${num}</span>
            <span class="stopwatch-lap-time">${formatStopwatchTime(l.lap)}</span>
            <span class="stopwatch-lap-total">${formatStopwatchTime(l.total)}</span>
        </div>`;
    }).join('');
}

function toolbarStopwatchUpdateBtn() {
    const btn = el('toolbar-stopwatch-btn');
    const label = el('stopwatch-btn-label');
    const lapBtn = el('toolbar-stopwatch-lap-btn');
    if (toolbarStopwatchState.running) {
        if (btn) btn.classList.add('running');
        if (label) label.textContent = '⏸ PAUZA';
        if (lapBtn) lapBtn.disabled = false;
    } else {
        if (btn) btn.classList.remove('running');
        if (label) label.textContent = '▶ START';
        if (lapBtn) lapBtn.disabled = false;
    }
}

function toolbarStopwatchReset() {
    if (toolbarStopwatchState.running) {
        showToast(safeT('gps.sw.stopFirst') || 'Prvo zaustavi štopericu.', 'warning', 1500);
        return;
    }
    toolbarStopwatchState.elapsedMs = 0;
    toolbarStopwatchState.laps = [];
    toolbarStopwatchUpdateDisplay(0);
    toolbarStopwatchRenderLaps();
    toolbarStopwatchUpdateStats();
    vibrate(15);
    playTick(0, 1400, 0.06, 0.02);
}

function toggleStopwatchLaps() {
    const wrap = el('stopwatch-laps-wrap');
    if (!wrap) return;
    toolbarStopwatchState.lapsOpen = !toolbarStopwatchState.lapsOpen;
    wrap.classList.toggle('open', toolbarStopwatchState.lapsOpen);
    vibrate(8);
}

function openToolbarStopwatch() {
    const modal = el('toolbar-stopwatch-modal');
    if (!modal) return;
    modal.classList.add('show');
    document.body.classList.add('modal-open');
    toolbarStopwatchUpdateDisplay(toolbarStopwatchState.elapsedMs);
    toolbarStopwatchUpdateBtn();
    toolbarStopwatchRenderLaps();
    toolbarStopwatchUpdateStats();
    vibrate(15);
}

// ============================================================
// TAJMER (TOOLBAR)
// ============================================================
const TIMER_CIRCUMFERENCE = 615.75;

const toolbarTimerState = {
    running: false,
    paused: false,
    totalMs: 0,
    remainingMs: 0,
    endTime: 0,
    intervalId: null,
    rafId: null,
    alarming: false,
    alarmIntervalId: null,
    repeat: false,
    vibrateEnabled: true,
    soundEnabled: true
};

function toolbarTimerToggleRepeat() {
    toolbarTimerState.repeat = !toolbarTimerState.repeat;
    const btn = el('timer-option-repeat');
    if (btn) btn.classList.toggle('active', toolbarTimerState.repeat);
    vibrate(10);
}

function toolbarTimerToggleVibrate() {
    toolbarTimerState.vibrateEnabled = !toolbarTimerState.vibrateEnabled;
    const btn = el('timer-option-vibrate');
    if (btn) btn.classList.toggle('active', toolbarTimerState.vibrateEnabled);
    vibrate(10);
}

function toolbarTimerToggleSound() {
    toolbarTimerState.soundEnabled = !toolbarTimerState.soundEnabled;
    const btn = el('timer-option-sound');
    if (btn) btn.classList.toggle('active', toolbarTimerState.soundEnabled);
    if (toolbarTimerState.soundEnabled) playTick(0, 1500, 0.08, 0.03);
    vibrate(10);
}

function toolbarTimerPreset(seconds) {
    if (toolbarTimerState.running) {
        showToast(safeT('toolbar.timer.stopFirst'), 'warning', 1500);
        return;
    }
    toolbarTimerState.totalMs = seconds * 1000;
    toolbarTimerState.remainingMs = seconds * 1000;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const hEl = el('toolbar-timer-h'); if (hEl) hEl.value = h || '';
    const mEl = el('toolbar-timer-m'); if (mEl) mEl.value = m || '';
    const sEl = el('toolbar-timer-s'); if (sEl) sEl.value = s || '';
    toolbarTimerUpdateDisplay();
    toolbarTimerUpdateBtn();
    vibrate(10);
    playTick(0, 1300, 0.05, 0.015);
}

function toolbarTimerGetInputMs() {
    const h = parseInt(el('toolbar-timer-h')?.value) || 0;
    const m = parseInt(el('toolbar-timer-m')?.value) || 0;
    const s = parseInt(el('toolbar-timer-s')?.value) || 0;
    return (h * 3600 + m * 60 + s) * 1000;
}

function toolbarTimerToggle() {
    if (toolbarTimerState.alarming) {
        toolbarTimerStopAlarm();
        return;
    }
    if (toolbarTimerState.running) {
        if (toolbarTimerState.paused) toolbarTimerResume();
        else toolbarTimerPause();
    } else {
        toolbarTimerStart();
    }
}

function toolbarTimerStart() {
    const ms = toolbarTimerState.remainingMs || toolbarTimerGetInputMs();
    if (ms <= 0) {
        showToast(safeT('toolbar.timer.enterTime'), 'warning');
        return;
    }
    toolbarTimerState.totalMs = ms;
    toolbarTimerState.remainingMs = ms;
    toolbarTimerState.running = true;
    toolbarTimerState.paused = false;
    toolbarTimerState.endTime = performance.now() + ms;
    toolbarTimerUpdateBtn();
    toolbarTimerTick();
    toolbarTimerState.intervalId = setInterval(toolbarTimerTick, 200);
    vibrate(20);
    playTick(0, 1500, 0.08, 0.03);
}

function toolbarTimerPause() {
    if (!toolbarTimerState.running || toolbarTimerState.paused) return;
    toolbarTimerState.paused = true;
    toolbarTimerState.remainingMs = Math.max(0, toolbarTimerState.endTime - performance.now());
    if (toolbarTimerState.intervalId) {
        clearInterval(toolbarTimerState.intervalId);
        toolbarTimerState.intervalId = null;
    }
    if (toolbarTimerState.rafId) {
        cancelAnimationFrame(toolbarTimerState.rafId);
        toolbarTimerState.rafId = null;
    }
    toolbarTimerUpdateBtn();
    vibrate(15);
}

function toolbarTimerResume() {
    if (!toolbarTimerState.running || !toolbarTimerState.paused) return;
    toolbarTimerState.paused = false;
    toolbarTimerState.endTime = performance.now() + toolbarTimerState.remainingMs;
    toolbarTimerTick();
    toolbarTimerState.intervalId = setInterval(toolbarTimerTick, 200);
    toolbarTimerUpdateBtn();
    vibrate(15);
}

function toolbarTimerTick() {
    if (!toolbarTimerState.running || toolbarTimerState.paused) return;
    const remaining = Math.max(0, toolbarTimerState.endTime - performance.now());
    toolbarTimerState.remainingMs = remaining;
    toolbarTimerUpdateDisplay();
    if (remaining <= 0) toolbarTimerComplete();
}

function toolbarTimerComplete() {
    toolbarTimerState.running = false;
    toolbarTimerState.paused = false;
    if (toolbarTimerState.intervalId) {
        clearInterval(toolbarTimerState.intervalId);
        toolbarTimerState.intervalId = null;
    }
    if (toolbarTimerState.rafId) {
        cancelAnimationFrame(toolbarTimerState.rafId);
        toolbarTimerState.rafId = null;
    }
    toolbarTimerState.remainingMs = 0;
    toolbarTimerUpdateDisplay();
    toolbarTimerUpdateBtn();
    toolbarTimerStartAlarm();
}

function toolbarTimerStartAlarm() {
    toolbarTimerState.alarming = true;
    toolbarTimerUpdateBtn();
    showToast(safeT('toolbar.timer.timeUp'), 'success', 4000);
    let count = 0;
    const beep = () => {
        if (!toolbarTimerState.alarming) return;
        if (count >= 10) { toolbarTimerStopAlarm(); return; }
        count++;
        if (toolbarTimerState.soundEnabled) playAlarmBeep();
        if (toolbarTimerState.vibrateEnabled) vibrate([300, 100, 300, 100, 300]);
    };
    beep();
    toolbarTimerState.alarmIntervalId = setInterval(beep, 3000);
}

function toolbarTimerStopAlarm() {
    toolbarTimerState.alarming = false;
    if (toolbarTimerState.alarmIntervalId) {
        clearInterval(toolbarTimerState.alarmIntervalId);
        toolbarTimerState.alarmIntervalId = null;
    }
    toolbarTimerUpdateBtn();
    vibrate(20);

    if (toolbarTimerState.repeat) {
        setTimeout(() => {
            toolbarTimerState.running = false;
            toolbarTimerState.paused = false;
            toolbarTimerState.endTime = performance.now() + toolbarTimerState.totalMs;
            toolbarTimerState.remainingMs = toolbarTimerState.totalMs;
            toolbarTimerState.running = true;
            toolbarTimerTick();
            toolbarTimerState.intervalId = setInterval(toolbarTimerTick, 200);
            toolbarTimerUpdateBtn();
        }, 800);
    }
}

function toolbarTimerReset() {
    if (toolbarTimerState.running && !toolbarTimerState.paused) {
        showToast(safeT('toolbar.timer.stopFirst'), 'warning', 1500);
        return;
    }
    toolbarTimerStopAlarm();
    toolbarTimerState.running = false;
    toolbarTimerState.paused = false;
    toolbarTimerState.totalMs = 0;
    toolbarTimerState.remainingMs = 0;
    if (toolbarTimerState.intervalId) {
        clearInterval(toolbarTimerState.intervalId);
        toolbarTimerState.intervalId = null;
    }
    if (toolbarTimerState.rafId) {
        cancelAnimationFrame(toolbarTimerState.rafId);
        toolbarTimerState.rafId = null;
    }
    const hEl = el('toolbar-timer-h'); if (hEl) hEl.value = '';
    const mEl = el('toolbar-timer-m'); if (mEl) mEl.value = '';
    const sEl = el('toolbar-timer-s'); if (sEl) sEl.value = '';
    toolbarTimerUpdateDisplay();
    toolbarTimerUpdateBtn();
    vibrate(15);
    playTick(0, 1400, 0.06, 0.02);
}

function toolbarTimerUpdateDisplay() {
    const timeEl = el('toolbar-timer-time');
    const ring = el('timer-ring-progress');
    if (!timeEl) return;
    const ms = toolbarTimerState.remainingMs || toolbarTimerState.totalMs || toolbarTimerGetInputMs();
    const sec = Math.ceil(ms / 1000);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    timeEl.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

    if (ring) {
        const total = toolbarTimerState.totalMs || 1;
        const pct = Math.max(0, Math.min(1, ms / total));
        const offset = TIMER_CIRCUMFERENCE * (1 - pct);
        ring.style.strokeDashoffset = offset.toFixed(2);
    }
}

function toolbarTimerUpdateBtn() {
    const btn = el('toolbar-timer-btn');
    const label = el('toolbar-timer-btn-label');
    const status = el('toolbar-timer-status');
    if (!label) return;
    if (toolbarTimerState.alarming) {
        label.textContent = '⏹ ZAUSTAVI ALARM';
        if (btn) btn.classList.add('alarming', 'running');
        if (status) status.textContent = '⏰ VREME JE ISTEKLO!';
    } else if (!toolbarTimerState.running) {
        label.textContent = '▶ START';
        if (btn) btn.classList.remove('running', 'alarming');
        if (status) status.textContent = safeT('toolbar.timer.ready');
    } else if (toolbarTimerState.paused) {
        label.textContent = '▶ NASTAVI';
        if (btn) btn.classList.remove('running');
        if (status) status.textContent = safeT('toolbar.timer.paused');
    } else {
        label.textContent = '⏸ PAUZA';
        if (btn) btn.classList.add('running');
        if (status) status.textContent = safeT('toolbar.timer.running');
    }
}

function openToolbarTimer() {
    const modal = el('toolbar-timer-modal');
    if (!modal) return;
    modal.classList.add('show');
    document.body.classList.add('modal-open');
    toolbarTimerUpdateDisplay();
    toolbarTimerUpdateBtn();
    vibrate(15);
}

// ============================================================
// BRZINOMER (TOOLBAR)
// ============================================================
const SPEEDOMETER_UNIT_KEY = 'cx_speedometer_unit_v3';
const SPEEDOMETER_MAX_KEY = 'cx_speedometer_max_v3';
const SPEEDOMETER_LIMIT_KEY = 'cx_speedometer_limit_v3';
const SPEEDOMETER_DEFAULT_LIMIT = 130;

const speedometerState = {
    watchId: null,
    running: false,
    currentKmh: 0,
    maxKmh: 0,
    avgKmh: 0,
    totalKmh: 0,
    samples: 0,
    accuracy: null,
    wakeLock: null,
    unit: 'kmh',
    limitKmh: SPEEDOMETER_DEFAULT_LIMIT,
    lastPosition: null,
    totalDistanceKm: 0,
    sparkData: [],
    sparkIntervalId: null
};

function loadSpeedometerUnit() {
    try {
        const saved = localStorage.getItem(SPEEDOMETER_UNIT_KEY);
        if (['kmh', 'mph', 'ms', 'kn', 'fts'].includes(saved)) {
            speedometerState.unit = saved;
        }
    } catch (e) {}
    try {
        const mx = parseFloat(localStorage.getItem(SPEEDOMETER_MAX_KEY));
        if (!isNaN(mx) && mx > 0) speedometerState.maxKmh = mx;
    } catch (e) {}
    try {
        const lim = parseFloat(localStorage.getItem(SPEEDOMETER_LIMIT_KEY));
        if (!isNaN(lim) && lim > 0) speedometerState.limitKmh = lim;
    } catch (e) {}
}

function saveSpeedometerUnit() {
    try { localStorage.setItem(SPEEDOMETER_UNIT_KEY, speedometerState.unit); } catch (e) {}
}

function saveSpeedometerMax() {
    try { localStorage.setItem(SPEEDOMETER_MAX_KEY, String(speedometerState.maxKmh)); } catch (e) {}
}

function saveSpeedometerLimit() {
    try { localStorage.setItem(SPEEDOMETER_LIMIT_KEY, String(speedometerState.limitKmh)); } catch (e) {}
}

function speedometerConvert(kmh) {
    switch (speedometerState.unit) {
        case 'mph': return kmh * 0.621371;
        case 'ms': return kmh / 3.6;
        case 'kn': return kmh * 0.539957;
        case 'fts': return kmh * 0.911344;
        default: return kmh;
    }
}

function speedometerUnitLabel() {
    const labels = { kmh: 'km/h', mph: 'mph', ms: 'm/s', kn: 'kn', fts: 'ft/s' };
    return labels[speedometerState.unit] || 'km/h';
}

function speedometerChangeUnit() {
    const sel = el('speedometer-unit-select');
    if (!sel) return;
    speedometerState.unit = sel.value;
    saveSpeedometerUnit();
    speedometerUpdateDisplay();
    speedometerUpdateAnalog();
    vibrate(10);
}

function speedometerUpdateDisplay() {
    const decimals = (speedometerState.unit === 'ms' || speedometerState.unit === 'fts') ? 2 : 1;
    const valEl = el('speedometer-value');
    const maxEl = el('speedometer-max');
    const avgEl = el('speedometer-avg');
    const accEl = el('speedometer-accuracy');
    const unitEl = el('speedometer-unit-label');
    const distEl = el('speedometer-distance');
    if (valEl) valEl.textContent = fmt(speedometerConvert(speedometerState.currentKmh), decimals);
    if (maxEl) maxEl.textContent = fmt(speedometerConvert(speedometerState.maxKmh), decimals);
    if (avgEl) avgEl.textContent = fmt(speedometerConvert(speedometerState.avgKmh), decimals);
    if (accEl) accEl.textContent = speedometerState.accuracy != null ? `${Math.round(speedometerState.accuracy)} m` : '—';
    if (unitEl) unitEl.textContent = speedometerUnitLabel().toUpperCase();
    if (distEl) distEl.innerHTML = `${speedometerState.totalDistanceKm.toFixed(2)} <small>km</small>`;
}

const SPEEDOMETER_SCALE_MAX_KMH = 240;

function speedometerUpdateAnalog() {
    const needleGroup = el('speed-needle-group');
    if (!needleGroup) return;
    const kmh = Math.min(speedometerState.currentKmh, SPEEDOMETER_SCALE_MAX_KMH);
    const ratio = kmh / SPEEDOMETER_SCALE_MAX_KMH;
    const startAngle = -120;
    const endAngle = 120;
    const angle = startAngle + (endAngle - startAngle) * ratio;
    needleGroup.style.transform = `rotate(${angle}deg)`;

    const wrap = el('speedometer-analog-wrap');
    const valEl = el('speedometer-value');
    const over = speedometerState.currentKmh > speedometerState.limitKmh;
    if (wrap) wrap.classList.toggle('over-limit', over);
    if (valEl) valEl.classList.toggle('over-limit', over);
}

function speedometerDrawScale() {
    const ticks = el('speed-ticks');
    const numbers = el('speed-numbers');
    if (!ticks || !numbers) return;

    const cx = 140, cy = 140;
    const rOuter = 118, rInnerMajor = 105, rInnerMinor = 112;
    const startAngle = -120, endAngle = 120;
    const totalSteps = 24;
    const majorEvery = 2;
    let ticksHtml = '';
    let numbersHtml = '';

    for (let i = 0; i <= totalSteps; i++) {
        const value = (SPEEDOMETER_SCALE_MAX_KMH / totalSteps) * i;
        const angle = startAngle + (endAngle - startAngle) * (i / totalSteps);
        const rad = (angle - 90) * Math.PI / 180;
        const isMajor = (i % majorEvery === 0);
        const rIn = isMajor ? rInnerMajor : rInnerMinor;
        const x1 = cx + rIn * Math.cos(rad);
        const y1 = cy + rIn * Math.sin(rad);
        const x2 = cx + rOuter * Math.cos(rad);
        const y2 = cy + rOuter * Math.sin(rad);
        const isRedZone = value > speedometerState.limitKmh;
        ticksHtml += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${isRedZone ? '#f43f5e' : 'var(--text-tertiary)'}" stroke-width="${isMajor ? 2.5 : 1.2}" stroke-linecap="round"/>`;

        if (isMajor && value > 0) {
            const rLabel = rInnerMajor - 16;
            const lx = cx + rLabel * Math.cos(rad);
            const ly = cy + rLabel * Math.sin(rad);
            numbersHtml += `<text x="${lx.toFixed(1)}" y="${(ly + 4).toFixed(1)}" text-anchor="middle" fill="${isRedZone ? '#f43f5e' : 'var(--text-secondary)'}">${value}</text>`;
        }
    }
    ticks.innerHTML = ticksHtml;
    numbers.innerHTML = numbersHtml;
}

function speedometerUpdateSparkline() {
    const line = el('spark-line');
    const fill = el('spark-fill');
    if (!line || !fill) return;

    const data = speedometerState.sparkData;
    if (data.length < 2) {
        line.setAttribute('d', '');
        fill.setAttribute('d', '');
        return;
    }

    const w = 300, h = 60;
    const maxKmh = Math.max(60, ...data.map(d => d.kmh));
    const stepX = w / Math.max(1, data.length - 1);

    let pathD = '';
    let fillD = `M 0 ${h} `;
    data.forEach((d, i) => {
        const x = i * stepX;
        const y = h - (d.kmh / maxKmh) * h;
        if (i === 0) {
            pathD += `M ${x.toFixed(1)} ${y.toFixed(1)} `;
            fillD += `L ${x.toFixed(1)} ${y.toFixed(1)} `;
        } else {
            pathD += `L ${x.toFixed(1)} ${y.toFixed(1)} `;
            fillD += `L ${x.toFixed(1)} ${y.toFixed(1)} `;
        }
    });
    fillD += `L ${w} ${h} Z`;
    line.setAttribute('d', pathD);
    fill.setAttribute('d', fillD);
}

function speedometerPushSparkSample() {
    if (!speedometerState.running) return;
    const now = performance.now();
    speedometerState.sparkData.push({ t: now, kmh: speedometerState.currentKmh });
    const cutoff = now - 30000;
    speedometerState.sparkData = speedometerState.sparkData.filter(d => d.t >= cutoff);
    speedometerUpdateSparkline();
}

function speedometerSetStatus(textKey) {
    const s = el('speedometer-status');
    if (s) s.textContent = safeT(textKey);
}

function speedometerUpdateBtnLabel() {
    const label = el('speedometer-btn-label');
    const btn = el('speedometer-btn-start');
    if (speedometerState.running) {
        if (label) label.textContent = '⏹ ' + safeT('toolbar.speedometer.stop');
        if (btn) btn.classList.add('active');
    } else {
        if (label) label.textContent = '▶ ' + safeT('toolbar.speedometer.start');
        if (btn) btn.classList.remove('active');
    }
}

function openSpeedometerModal() {
    const modal = el('speedometer-modal');
    if (!modal) return;
    loadSpeedometerUnit();
    const sel = el('speedometer-unit-select');
    if (sel) sel.value = speedometerState.unit;
    speedometerDrawScale();
    speedometerUpdateDisplay();
    speedometerUpdateAnalog();
    speedometerUpdateSparkline();
    speedometerUpdateBtnLabel();

    const indicator = el('speedometer-indicator');
    if (indicator) indicator.classList.toggle('active', speedometerState.running);
    if (speedometerState.running) speedometerSetStatus('toolbar.speedometer.status.receiving');
    else speedometerSetStatus('toolbar.speedometer.status.off');
    modal.classList.add('show');
    document.body.classList.add('modal-open');
    vibrate(15);
    playTick(0, 1400, 0.06, 0.02);
}

function speedometerToggle() {
    if (speedometerState.running) speedometerStop();
    else speedometerStart();
}

function speedometerStart() {
    if (!navigator.geolocation) {
        showToast(safeT('gps.error.noGeolocation'), 'error', 2500);
        return;
    }
    speedometerState.running = true;
    speedometerSetStatus('toolbar.speedometer.status.searching');
    speedometerUpdateBtnLabel();
    const indicator = el('speedometer-indicator');
    if (indicator) indicator.classList.add('active');
    try {
        speedometerState.watchId = navigator.geolocation.watchPosition(
            speedometerOnPosition,
            speedometerOnError,
            { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 }
        );
    } catch (e) {
        showToast(safeT('gps.error.generic'), 'error');
        speedometerStop();
        return;
    }
    speedometerRequestWakeLock();
    if (speedometerState.sparkIntervalId) clearInterval(speedometerState.sparkIntervalId);
    speedometerState.sparkIntervalId = setInterval(speedometerPushSparkSample, 500);
    vibrate(20);
    playTick(0, 1500, 0.08, 0.03);
}

function speedometerStop() {
    if (speedometerState.watchId != null && navigator.geolocation) {
        navigator.geolocation.clearWatch(speedometerState.watchId);
    }
    speedometerState.watchId = null;
    speedometerState.running = false;
    if (speedometerState.sparkIntervalId) {
        clearInterval(speedometerState.sparkIntervalId);
        speedometerState.sparkIntervalId = null;
    }
    speedometerSetStatus('toolbar.speedometer.status.off');
    speedometerUpdateBtnLabel();
    const indicator = el('speedometer-indicator');
    if (indicator) indicator.classList.remove('active');
    speedometerReleaseWakeLock();
    vibrate(15);
}

function speedometerOnPosition(pos) {
    const speed = pos.coords.speed;
    const accuracy = pos.coords.accuracy;
    const speedKmh = (speed != null && !isNaN(speed) && speed >= 0) ? speed * 3.6 : 0;
    const filteredKmh = speedKmh < 3 ? 0 : speedKmh;
    speedometerState.currentKmh = filteredKmh;
    speedometerState.accuracy = accuracy;

    if (speedometerState.lastPosition) {
        const d = haversineKm(
            speedometerState.lastPosition.lat,
            speedometerState.lastPosition.lon,
            pos.coords.latitude,
            pos.coords.longitude
        );
        if (d > 0.001 && d < 1) {
            speedometerState.totalDistanceKm += d;
        }
    }
    speedometerState.lastPosition = {
        lat: pos.coords.latitude,
        lon: pos.coords.longitude
    };

    if (filteredKmh > 0) {
        speedometerState.totalKmh += filteredKmh;
        speedometerState.samples++;
        speedometerState.avgKmh = speedometerState.totalKmh / speedometerState.samples;
        if (filteredKmh > speedometerState.maxKmh) {
            speedometerState.maxKmh = filteredKmh;
            saveSpeedometerMax();
        }
        speedometerSetStatus('toolbar.speedometer.status.receiving');
    }
    speedometerUpdateDisplay();
    speedometerUpdateAnalog();
}

function haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function speedometerOnError(err) {
    let msg = safeT('gps.error.generic');
    if (err.code === 1) msg = safeT('gps.error.permission');
    else if (err.code === 2) msg = safeT('gps.error.unavailable');
    else if (err.code === 3) msg = safeT('gps.error.timeout');
    showToast(msg, 'error');
    speedometerSetStatus('toolbar.speedometer.status.error');
}

function speedometerReset() {
    speedometerState.currentKmh = 0;
    speedometerState.maxKmh = 0;
    speedometerState.avgKmh = 0;
    speedometerState.totalKmh = 0;
    speedometerState.samples = 0;
    speedometerState.accuracy = null;
    speedometerState.totalDistanceKm = 0;
    speedometerState.lastPosition = null;
    speedometerState.sparkData = [];
    try { localStorage.removeItem(SPEEDOMETER_MAX_KEY); } catch (e) {}
    speedometerUpdateDisplay();
    speedometerUpdateAnalog();
    speedometerUpdateSparkline();
    vibrate(15);
    playTick(0, 1400, 0.06, 0.02);
    showToast(safeT('gps.resetDone'), 'info', 1400);
}

async function speedometerRequestWakeLock() {
    if (!('wakeLock' in navigator)) return;
    try { speedometerState.wakeLock = await navigator.wakeLock.request('screen'); } catch (e) {}
}

function speedometerReleaseWakeLock() {
    if (speedometerState.wakeLock) {
        try { speedometerState.wakeLock.release(); } catch (e) {}
        speedometerState.wakeLock = null;
    }
}
// ============================================================
// BOTTOM NAVIGATION
// ============================================================
let currentScreenId = 'home-screen';

function switchBottomNav(screenId) {
    if (currentScreenId === screenId) return;
    document.querySelectorAll('.bottom-nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.screen === screenId);
    });
    openScreen(screenId);
    vibrate(10);
    playTick(0, 1300, 0.05, 0.015);
}

function updateBottomNavUI() {
    document.querySelectorAll('.bottom-nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.screen === currentScreenId);
    });
}

function openScreen(screenId, direction = 'right') {
    try {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active', 'enter-right', 'enter-left');
        });
        const target = el(screenId);
        if (!target) return;
        target.classList.add('active');
        if (typeof reduceMotion !== 'undefined' && !reduceMotion) {
            target.classList.add(direction === 'left' ? 'enter-left' : 'enter-right');
        }
        window.scrollTo(0, 0);
        currentScreenId = screenId;
        updateBottomNavUI();
        try { restoreInputsFor(target); } catch (e) {}

        if (screenId === 'home-screen') {
            try { renderFavorites(); } catch (e) {}
            try { renderQuickTools(); } catch (e) {}
            try { updateAppBadge(); } catch (e) {}
        }
        if (screenId === 'today-screen') {
            try { renderTodayDashboard(); } catch (e) { console.warn('Today render error:', e); }
        }
        if (screenId === 'mytools-screen') {
            try { renderMyToolsScreen(); } catch (e) { console.warn('My tools error:', e); }
        }
        if (screenId === 'history-screen') {
            try { renderHistory(); renderUsageStats(); } catch (e) {}
        }
        if (screenId === 'settings-screen') {
            try { updateSettingsUI(); updateProfileStatusLabel(); } catch (e) {}
        }
    } catch (e) { console.warn('openScreen error:', e); }
}

function goHome() {
    const searchInput = el('home-search');
    if (searchInput) { searchInput.value = ''; handleQuickSearch(); }
    closeAllModals();
    switchBottomNav('home-screen');
}

// ============================================================
// BRZI PREGLED
// ============================================================
function renderTodayDashboard() {
    const content = el('today-content');
    const greeting = el('today-greeting');
    if (!content) return;

    const hour = new Date().getHours();
    let greetKey = 'brziPregled.greeting.morning';
    if (hour >= 12 && hour < 18) greetKey = 'brziPregled.greeting.afternoon';
    else if (hour >= 18 && hour < 23) greetKey = 'brziPregled.greeting.evening';
    else if (hour >= 23 || hour < 5) greetKey = 'brziPregled.greeting.night';

    if (greeting) {
        const textEl = greeting.querySelector('.today-greeting-text');
        if (textEl) textEl.textContent = safeT(greetKey) + '!';
        const dateEl = el('today-date');
        if (dateEl) {
            const locale = currentLang === 'en' ? 'en-GB' : 'sr-RS';
            dateEl.textContent = new Date().toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        }
    }

    let html = '';
    html += renderBrziPregledCategories();
    html += renderBrziPregledSummary();
    html += renderBrziPregledWeather();
    html += renderBrziPregledTip();
    content.innerHTML = html;

    content.querySelectorAll('[data-chain]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const cat = btn.dataset.chain;
            if (cat) openCalc(cat.split(':')[0], cat.split(':')[1]);
        });
    });
}

function refreshTodayDashboard() {
    renderTodayDashboard();
    vibrate(15);
    playTick(0, 1400, 0.06, 0.02);
}

function renderBrziPregledCategories() {
    try {
        if (typeof getAllReminderItems !== 'function') return '';
        const allItems = getAllReminderItems();
        const now = new Date(); now.setHours(0, 0, 0, 0);
        const nowMs = now.getTime();
        const dayMs = 86400000;

        const groups = { urgent: [], week: [], month: [], later: [] };

        allItems.forEach(item => {
            if (item.isDone) return;
            let days = null;
            let targetDate = null;

            if (item.type === 'birthday' && item.raw && item.raw.date) {
                days = daysToBirthday(item.raw.date);
                targetDate = computeNextBirthdayDate(item.raw.date);
            } else if (item.type === 'anniversary' && item.raw && item.raw.date) {
                days = daysToAnniversary(item.raw.date);
                targetDate = computeNextAnniversaryDate(item.raw.date);
            } else if (item.dueDate) {
                days = daysUntilDate(item.dueDate);
                targetDate = item.dueDate;
            } else if (item.type === 'bill' && item.raw && item.raw.dayOfMonth) {
                days = daysToBillDay(item.raw.dayOfMonth);
                targetDate = computeNextBillDate(item.raw.dayOfMonth);
            } else if (item.type === 'subscription' && item.raw && item.raw.dayOfMonth) {
                days = daysToBillDay(item.raw.dayOfMonth);
                targetDate = computeNextBillDate(item.raw.dayOfMonth);
            } else if (item.type === 'medication' && item.raw && item.raw.endDate) {
                days = daysUntilDate(item.raw.endDate);
                targetDate = item.raw.endDate;
            } else if (item.type === 'receipt' && item.raw && item.raw.dueDate) {
                days = daysUntilDate(item.raw.dueDate);
                targetDate = item.raw.dueDate;
            } else {
                groups.later.push({ ...item, days: null, targetDate: null });
                return;
            }

            if (days === null) {
                groups.later.push({ ...item, days: null, targetDate: null });
                return;
            }

            const enriched = { ...item, days, targetDate };
            if (days <= 3) groups.urgent.push(enriched);
            else if (days <= 7) groups.week.push(enriched);
            else if (days <= 30) groups.month.push(enriched);
            else groups.later.push(enriched);
        });

        groups.urgent.sort((a, b) => (a.days ?? 999) - (b.days ?? 999));
        groups.week.sort((a, b) => (a.days ?? 999) - (b.days ?? 999));
        groups.month.sort((a, b) => (a.days ?? 999) - (b.days ?? 999));
        groups.later.sort((a, b) => (a.days ?? 9999) - (b.days ?? 9999));

        let html = '';

        if (groups.urgent.length) {
            html += renderBrziPregledGroup('urgent', safeT('brziPregled.urgent'), '#f43f5e', groups.urgent);
        }
        if (groups.week.length) {
            html += renderBrziPregledGroup('week', safeT('brziPregled.thisWeek'), '#f59e0b', groups.week);
        }
        if (groups.month.length) {
            html += renderBrziPregledGroup('month', safeT('brziPregled.thisMonth'), '#10b981', groups.month);
        }
        if (groups.later.length) {
            html += renderBrziPregledGroup('later', safeT('brziPregled.later'), '#64748b', groups.later);
        }

        if (!html) {
            html = `
                <div class="today-card today-info">
                    <div class="today-card-head">
                        <div class="today-card-icon" style="--today-accent: #10b981;">${icon('check')}</div>
                        <div class="today-card-title">${safeT('brziPregled.title')}</div>
                    </div>
                    <div class="today-empty">${safeT('brziPregled.noItems')}</div>
                </div>
            `;
        }

        return html;
    } catch (e) {
        console.warn('renderBrziPregledCategories error:', e);
        return '';
    }
}

function renderBrziPregledGroup(groupKey, title, color, items) {
    const itemsHtml = items.slice(0, 8).map(item => {
        const daysTxt = formatBrziPregledDays(item.days);
        const itemColor = item.days !== null && item.days < 0 ? '#dc2626' : color;

        let itemIcon = 'bell';
        if (item.type === 'birthday') itemIcon = 'cake';
        else if (item.type === 'anniversary') itemIcon = 'gift';
        else if (item.type === 'bill') itemIcon = 'receipt';
        else if (item.type === 'subscription') itemIcon = 'creditCard';
        else if (item.type === 'medication') itemIcon = 'heartPulse';
        else if (item.type === 'vehicle-reg') itemIcon = 'car';
        else if (item.type === 'vehicle-tech') itemIcon = 'wrench';
        else if (item.type === 'document') itemIcon = 'clipboard';
        else if (item.type === 'note') itemIcon = 'clipboard';
        else if (item.type === 'receipt') itemIcon = 'receipt';
        else if (item.type === 'installment') itemIcon = 'creditCard';

        let clickTarget = '';
        if (item.type === 'birthday') clickTarget = `openCalc('podsetnici', 'rodjendani')`;
        else if (item.type === 'anniversary') clickTarget = `openCalc('podsetnici', 'godisnjice')`;
        else if (item.type === 'bill') clickTarget = `openCalc('podsetnici', 'racuni')`;
        else if (item.type === 'subscription') clickTarget = `openCalc('podsetnici', 'pretplate')`;
        else if (item.type === 'medication') clickTarget = `openCalc('podsetnici', 'lekivi')`;
        else if (item.type === 'vehicle-reg' || item.type === 'vehicle-tech') clickTarget = `openCalc('podsetnici', 'vozila')`;
        else if (item.type === 'document') clickTarget = `openCalc('podsetnici', 'vozila')`;
        else if (item.type === 'note') clickTarget = `openCalc('podsetnici', 'napomene')`;
        else if (item.type === 'receipt') clickTarget = `openCalc('racuni', 'moji')`;
        else if (item.type === 'installment') clickTarget = `openCalc('podsetnici', 'rate')`;

        return `
            <div class="today-item" style="--today-item-color: ${itemColor};" onclick="${clickTarget}">
                <div class="today-item-icon">${icon(itemIcon)}</div>
                <div class="today-item-body">
                    <div class="today-item-title">${escapeHtml(item.title || '')}</div>
                    ${item.subtitle ? `<div class="today-item-sub">${escapeHtml(item.subtitle)}</div>` : ''}
                </div>
                <div class="today-item-days">${daysTxt}</div>
            </div>
        `;
    }).join('');

    const moreCount = items.length - 8;
    const moreHtml = moreCount > 0
        ? `<div class="today-empty" style="padding: 8px 0 0;">+ još ${moreCount} ${moreCount === 1 ? 'stavka' : 'stavki'}</div>`
        : '';

    return `
        <div class="today-card" style="border-left: 4px solid ${color};">
            <div class="today-card-head">
                <div class="today-card-icon" style="--today-accent: ${color};">${icon('bell')}</div>
                <div class="today-card-title">${title}</div>
                <div class="today-card-count">${items.length}</div>
            </div>
            ${itemsHtml}
            ${moreHtml}
        </div>
    `;
}

function formatBrziPregledDays(days) {
    if (days === null || days === undefined) return '';
    if (days < 0) return `${Math.abs(days)} ${safeT('brziPregled.days')} ${safeT('brziPregled.overdue')}`;
    if (days === 0) return safeT('brziPregled.today');
    if (days === 1) return safeT('brziPregled.tomorrow');
    return `${safeT('brziPregled.daysTo')} ${days} ${safeT('brziPregled.days')}`;
}

function computeNextBirthdayDate(isoDate) {
    if (!isoDate) return null;
    const parts = isoDate.split('-').map(Number);
    if (parts.length < 3) return null;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    let next = new Date(today.getFullYear(), parts[1] - 1, parts[2]);
    next.setHours(0, 0, 0, 0);
    if (next < today) next.setFullYear(today.getFullYear() + 1);
    return next.toISOString().slice(0, 10);
}

function computeNextAnniversaryDate(isoDate) {
    return computeNextBirthdayDate(isoDate);
}

function computeNextBillDate(dayOfMonth) {
    if (!dayOfMonth) return null;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const d = Math.max(1, Math.min(31, parseInt(dayOfMonth)));
    let next = new Date(today.getFullYear(), today.getMonth(), d);
    next.setHours(0, 0, 0, 0);
    if (next < today) {
        let nm = today.getMonth() + 1;
        let ny = today.getFullYear();
        if (nm > 11) { nm = 0; ny++; }
        next = new Date(ny, nm, d);
    }
    return next.toISOString().slice(0, 10);
}

function renderBrziPregledSummary() {
    try {
        if (typeof getAllReminderItems !== 'function') return '';
        const allItems = getAllReminderItems().filter(i => !i.isDone);

        let totalCount = allItems.length;
        let urgentCount = 0;
        let weekCount = 0;
        let monthCount = 0;

        allItems.forEach(item => {
            let days = null;
            if (item.type === 'birthday' && item.raw && item.raw.date) days = daysToBirthday(item.raw.date);
            else if (item.type === 'anniversary' && item.raw && item.raw.date) days = daysToAnniversary(item.raw.date);
            else if (item.dueDate) days = daysUntilDate(item.dueDate);
            else if ((item.type === 'bill' || item.type === 'subscription') && item.raw && item.raw.dayOfMonth) days = daysToBillDay(item.raw.dayOfMonth);
            else if (item.type === 'medication' && item.raw && item.raw.endDate) days = daysUntilDate(item.raw.endDate);

            if (days === null) return;
            if (days <= 3) urgentCount++;
            else if (days <= 7) weekCount++;
            else if (days <= 30) monthCount++;
        });

        return `
            <div class="today-card today-summary">
                <div class="today-card-head">
                    <div class="today-card-icon" style="--today-accent: var(--accent-primary);">${icon('chart')}</div>
                    <div class="today-card-title">${safeT('brziPregled.summary')}</div>
                </div>
                <div class="today-summary-grid">
                    <div class="today-summary-item">
                        <div class="today-summary-value">${totalCount}</div>
                        <div class="today-summary-label">${safeT('brziPregled.summary.total')}</div>
                    </div>
                    <div class="today-summary-item">
                        <div class="today-summary-value urgent">${urgentCount}</div>
                        <div class="today-summary-label">${safeT('brziPregled.summary.urgent')}</div>
                    </div>
                    <div class="today-summary-item">
                        <div class="today-summary-value week">${weekCount}</div>
                        <div class="today-summary-label">${safeT('brziPregled.summary.thisWeek')}</div>
                    </div>
                    <div class="today-summary-item">
                        <div class="today-summary-value month">${monthCount}</div>
                        <div class="today-summary-label">${safeT('brziPregled.summary.thisMonth')}</div>
                    </div>
                </div>
            </div>
        `;
    } catch (e) {
        console.warn('renderBrziPregledSummary error:', e);
        return '';
    }
}

function renderBrziPregledWeather() {
    try {
        if (typeof weatherState === 'undefined') return '';
        const loc = weatherState.location;
        const current = weatherState.current;
        if (!loc) {
            return `
                <div class="today-card today-weather" onclick="openLocationModal()" style="cursor:pointer;">
                    <div class="today-card-head">
                        <div class="today-card-icon" style="--today-accent: #38bdf8;">${icon('cloudSun')}</div>
                        <div class="today-card-title">${safeT('brziPregled.weather')}</div>
                    </div>
                    <div class="today-empty">${safeT('brziPregled.weather.noLocation')}</div>
                </div>
            `;
        }
        if (!current) {
            return `
                <div class="today-card today-weather">
                    <div class="today-card-head">
                        <div class="today-card-icon" style="--today-accent: #38bdf8;">${icon('cloudSun')}</div>
                        <div class="today-card-title">${safeT('brziPregled.weather')}</div>
                    </div>
                    <div class="today-empty">${safeT('brziPregled.weather.loading')}</div>
                </div>
            `;
        }
        const temp = Math.round(current.temperature_2m);
        const feels = Math.round(current.apparent_temperature);
        const info = (typeof getWeatherInfo === 'function') ? getWeatherInfo(current.weather_code) : { text: '—', icon: 'cloud' };
        const locName = loc.name || '';

        return `
            <div class="today-card today-weather" onclick="openCalc('weather', 'prognoza')" style="cursor:pointer;">
                <div class="today-card-head">
                    <div class="today-card-icon" style="--today-accent: #38bdf8;">${icon('cloudSun')}</div>
                    <div class="today-card-title">${safeT('brziPregled.weather')}</div>
                </div>
                <div class="today-weather-main">
                    <div class="today-weather-temp">${temp}°</div>
                    <div class="today-weather-info">
                        <div class="today-weather-cond">${escapeHtml(info.text)}</div>
                        <div class="today-weather-detail">${escapeHtml(locName)} • ${safeT('weather.feels')} ${feels}°</div>
                    </div>
                </div>
            </div>
        `;
    } catch (e) { return ''; }
}

function renderBrziPregledTip() {
    try {
        const allItems = (typeof getAllReminderItems === 'function') ? getAllReminderItems().filter(i => !i.isDone) : [];
        const now = new Date(); now.setHours(0, 0, 0, 0);

        const upcoming = [];
        allItems.forEach(item => {
            let days = null;
            let name = item.title || '';
            if (item.type === 'birthday' && item.raw && item.raw.date) {
                days = daysToBirthday(item.raw.date);
                name = item.raw.name || item.title;
            } else if (item.type === 'anniversary' && item.raw && item.raw.date) {
                days = daysToAnniversary(item.raw.date);
                name = item.raw.name || item.title;
            } else if (item.dueDate) {
                days = daysUntilDate(item.dueDate);
            } else if ((item.type === 'bill' || item.type === 'subscription') && item.raw && item.raw.dayOfMonth) {
                days = daysToBillDay(item.raw.dayOfMonth);
            } else if (item.type === 'medication' && item.raw && item.raw.endDate) {
                days = daysUntilDate(item.raw.endDate);
            }

            if (days !== null && days >= 0 && days <= 3) {
                upcoming.push({ name, days, amount: item.raw && item.raw.amount });
            }
        });

        if (upcoming.length > 0) {
            const itemsText = upcoming.slice(0, 5).map(u => {
                const dayTxt = u.days === 0 ? safeT('brziPregled.today') : `${u.days} ${safeT('brziPregled.days')}`;
                const amountTxt = u.amount ? ` (${fmt(u.amount, 0)} RSD)` : '';
                return `${escapeHtml(u.name)} — ${dayTxt}${amountTxt}`;
            }).join('<br>');

            return `
                <div class="today-card today-tip">
                    <div class="today-card-head">
                        <div class="today-card-icon" style="--today-accent: #facc15;">${icon('sparkles')}</div>
                        <div class="today-card-title">${safeT('brziPregled.tip')}</div>
                    </div>
                    <div class="today-tip-text">
                        <strong>${safeT('brziPregled.tip.prioritet')}</strong><br>
                        ${itemsText}
                    </div>
                </div>
            `;
        }

        const tips = ['brziPregled.tip.1', 'brziPregled.tip.2', 'brziPregled.tip.3', 'brziPregled.tip.4', 'brziPregled.tip.5', 'brziPregled.tip.6'];
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
        const tipKey = tips[dayOfYear % tips.length];
        return `
            <div class="today-card today-tip">
                <div class="today-card-head">
                    <div class="today-card-icon" style="--today-accent: #facc15;">${icon('sparkles')}</div>
                    <div class="today-card-title">${safeT('brziPregled.tip')}</div>
                </div>
                <div class="today-tip-text">${safeT(tipKey)}</div>
            </div>
        `;
    } catch (e) { return ''; }
}

function renderMyToolsScreen() {
    const content = el('mytools-content');
    if (!content) return;
    const favs = loadFavorites();
    if (!favs.length) {
        content.innerHTML = `
            <div class="mytools-empty">
                <div class="mytools-empty-icon">⭐</div>
                <div class="mytools-empty-text">${safeT('section.favoritesEmpty')}</div>
                <div class="mytools-empty-hint">${safeT('fav.hint.text')}</div>
            </div>
        `;
        return;
    }
    let html = '';
    favs.forEach(key => {
        const parts = key.split(':');
        if (parts.length !== 2) return;
        const catId = parts[0], tabId = parts[1];
        const cat = CATEGORIES[catId];
        if (!cat) return;
        const tab = cat.tabs.find(t => t.id === tabId);
        if (!tab) return;
        const accent = getCategoryAccent(catId);
        html += `
            <div class="mytool-item" style="--qt-accent: ${accent};" onclick="openCalc('${catId}', '${tabId}')">
                <div class="mytool-icon">${icon(tab.icon)}</div>
                <div class="mytool-body">
                    <div class="mytool-name">${escapeHtml(safeT('tab.' + catId + '.' + tabId))}</div>
                    <div class="mytool-cat">${escapeHtml(safeT('cat.' + catId))}</div>
                </div>
                <span style="color: var(--text-tertiary); font-size: 1.2rem;">›</span>
            </div>
        `;
    });
    content.innerHTML = html;
}

const USER_PROFILE_KEY = 'cx_user_profile';

function loadUserProfile() {
    try {
        const raw = JSON.parse(localStorage.getItem(USER_PROFILE_KEY));
        if (raw && typeof raw === 'object') return raw;
    } catch (e) {}
    return {};
}
function saveUserProfileStore(profile) {
    try { localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile)); } catch (e) {}
}
function getUserProfile() { return loadUserProfile(); }
function hasUserProfile() {
    const p = loadUserProfile();
    return !!(p.name || p.age || p.height || p.weight);
}
function openProfileModal() {
    const modal = el('profile-modal');
    if (!modal) return;
    const p = loadUserProfile();
    const setV = (id, v) => { const e = el(id); if (e) e.value = v == null ? '' : v; };
    setV('profile-name', p.name);
    setV('profile-age', p.age);
    setV('profile-gender', p.gender || 'male');
    setV('profile-height', p.height);
    setV('profile-weight', p.weight);
    setV('profile-activity', p.activity || '1.375');
    modal.classList.add('show');
    document.body.classList.add('modal-open');
    vibrate(15);
    playTick(0, 1400, 0.06, 0.02);
}
function saveUserProfile() {
    const v = id => { const e = el(id); return e ? e.value.trim() : ''; };
    const profile = {
        name: v('profile-name'),
        age: v('profile-age'),
        gender: v('profile-gender') || 'male',
        height: v('profile-height'),
        weight: v('profile-weight'),
        activity: v('profile-activity') || '1.375'
    };
    saveUserProfileStore(profile);
    showToast(safeT('profile.saved'), 'success', 1800);
    vibrate(20);
    playTick(0, 1500, 0.08, 0.03);
    closeModal('profile-modal');
    updateProfileStatusLabel();
}
function clearUserProfile() {
    showConfirm(safeT('profile.clearConfirm')).then(ok => {
        if (!ok) return;
        try { localStorage.removeItem(USER_PROFILE_KEY); } catch (e) {}
        showToast(safeT('profile.cleared'), 'info', 1500);
        vibrate(15);
        closeModal('profile-modal');
        updateProfileStatusLabel();
    });
}
function updateProfileStatusLabel() {
    const status = el('settings-profile-status');
    if (!status) return;
    if (hasUserProfile()) {
        const p = loadUserProfile();
        const parts = [];
        if (p.name) parts.push(p.name);
        if (p.age) parts.push(p.age);
        if (p.height) parts.push(p.height + ' cm');
        if (p.weight) parts.push(p.weight + ' kg');
        status.textContent = parts.join(' • ') || safeT('profile.subtitle');
        status.style.color = '#10b981';
    } else {
        status.textContent = 'Nije popunjeno';
        status.style.color = '';
    }
}

// ============================================================
// PAMETNA PRETRAGA
// ============================================================
const RECENT_SEARCH_KEY = 'cx_recent_searches';
const CATEGORY_CLICKS_KEY = 'cx_category_clicks';

function loadRecentSearches() {
    try {
        const raw = JSON.parse(localStorage.getItem(RECENT_SEARCH_KEY));
        if (Array.isArray(raw)) return raw;
    } catch (e) {}
    return [];
}
function saveRecentSearches(list) {
    try { localStorage.setItem(RECENT_SEARCH_KEY, JSON.stringify(list.slice(0, 5))); } catch (e) {}
}
function trackSearch(query) {
    if (!query || query.length < 2) return;
    const list = loadRecentSearches();
    const filtered = list.filter(s => s !== query);
    filtered.unshift(query);
    saveRecentSearches(filtered);
}
function clearRecentSearches() {
    try { localStorage.removeItem(RECENT_SEARCH_KEY); } catch (e) {}
    handleQuickSearch();
    showToast(safeT('smartSearch.clearRecent'), 'info', 1200);
}

function normalizeText(str) {
    return String(str).toLowerCase().replace(/đ/g, 'dj').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

const FLAT_TOOLS = [];
Object.entries(CATEGORIES).forEach(([catId, cat]) => {
    cat.tabs.forEach(tab => {
        FLAT_TOOLS.push({
            catId, tabId: tab.id,
            name: tab.name, icon: tab.icon,
            accent: cat.accent, category: cat.name,
            keywords: [tab.name, cat.name].map(normalizeText)
        });
    });
});

function searchTools(query) {
    const q = normalizeText(query.trim());
    if (!q) return [];
    const scored = FLAT_TOOLS.map(tool => {
        let score = 0;
        const nameSr = normalizeText(tool.name);
        const nameEn = (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS.en)
            ? normalizeText(TRANSLATIONS.en['tab.' + tool.catId + '.' + tool.tabId] || '')
            : '';
        const catSr = normalizeText(tool.category);
        const catEn = (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS.en)
            ? normalizeText(TRANSLATIONS.en['cat.' + tool.catId] || '')
            : '';
        if (nameSr === q || nameEn === q) score += 100;
        else if (nameSr.startsWith(q) || nameEn.startsWith(q)) score += 60;
        else if (nameSr.includes(q) || nameEn.includes(q)) score += 40;
        if (catSr === q || catEn === q) score += 50;
        else if (catSr.startsWith(q) || catEn.startsWith(q)) score += 30;
        else if (catSr.includes(q) || catEn.includes(q)) score += 15;
        tool.keywords.forEach(k => {
            if (k === q) score += 40;
            else if (k.startsWith(q)) score += 20;
            else if (k.includes(q)) score += 10;
        });
        return { tool, score };
    });
    return scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score).slice(0, 8).map(s => s.tool);
}

function getNumericSuggestions(query) {
    const n = parseFloat(query);
    if (isNaN(n)) return [];
    const suggestions = [];
    if (n >= 100 && n <= 250) {
        suggestions.push({
            catId: 'health', tabId: 'bmi',
            name: safeT('smartSearch.suggestions.bmi', n),
            icon: 'scale', accent: '#ec4899'
        });
        suggestions.push({
            catId: 'health', tabId: 'kalorije',
            name: safeT('smartSearch.suggestions.idealWeight', n),
            icon: 'target', accent: '#ec4899'
        });
        suggestions.push({
            catId: 'bike', tabId: 'rama',
            name: 'Veličina rama za ' + n + ' cm',
            icon: 'ruler', accent: '#06b6d4'
        });
    }
    if (n >= 1000 && n <= 100000000) {
        suggestions.push({
            catId: 'money', tabId: 'kredit',
            name: safeT('smartSearch.suggestions.kredit', fmt(n, 0)),
            icon: 'creditCard', accent: '#10b981'
        });
        suggestions.push({
            catId: 'money', tabId: 'rate',
            name: safeT('smartSearch.suggestions.rate', fmt(n, 0)),
            icon: 'creditCard', accent: '#10b981'
        });
    }
    return suggestions;
}

function renderQuickResults(matches, numericSuggestions, query) {
    const box = el('quick-search-results');
    if (!box) return;
    box.innerHTML = '';

    if (matches.length === 0 && numericSuggestions.length === 0) {
        const recent = loadRecentSearches();
        let recentHtml = '';
        if (recent.length) {
            recentHtml = `
                <div class="qsr-recent-title">
                    <span>${safeT('smartSearch.recent')}</span>
                    <button class="qsr-recent-clear" onclick="clearRecentSearches()">${safeT('smartSearch.clearRecent')}</button>
                </div>
            `;
            recent.forEach(r => {
                recentHtml += `<div class="qsr-item" onclick="document.getElementById('home-search').value='${escapeHtml(r)}';handleQuickSearch();">
                    <div class="qsr-icon">${icon('clock')}</div>
                    <div class="qsr-text"><div class="qsr-name">${escapeHtml(r)}</div></div>
                </div>`;
            });
        }
        box.innerHTML = '<div class="qsr-empty"><div class="qsr-empty-title">' + safeT('search.noResults') + '</div><div class="qsr-empty-sub">' + safeT('search.tryAgain') + '</div></div>' + recentHtml;
        return;
    }

    const numVal = parseFloat(query);
    if (!isNaN(numVal) && numericSuggestions.length > 0) {
        box.innerHTML += `<div class="qsr-smart-hint">💡 ${safeT('smartSearch.numberHint')}</div>`;
    }

    numericSuggestions.forEach(sug => {
        const item = document.createElement('div');
        item.className = 'qsr-item';
        item.style.setProperty('--qt-accent', sug.accent);
        item.innerHTML = `
            <div class="qsr-icon">${icon(sug.icon)}</div>
            <div class="qsr-text">
                <div class="qsr-name">${escapeHtml(sug.name)}</div>
                <div class="qsr-cat">${escapeHtml(safeT('cat.' + sug.catId))}</div>
            </div>
        `;
        item.onclick = function () {
            const input = el('home-search');
            if (input) input.value = '';
            handleQuickSearch();
            openCalc(sug.catId, sug.tabId);
        };
        box.appendChild(item);
    });

    matches.forEach(tool => {
        const item = document.createElement('div');
        item.className = 'qsr-item';
        item.style.setProperty('--qt-accent', tool.accent);
        item.innerHTML = `
            <div class="qsr-icon">${icon(tool.icon)}</div>
            <div class="qsr-text">
                <div class="qsr-name">${escapeHtml(safeT('tab.' + tool.catId + '.' + tool.tabId))}</div>
                <div class="qsr-cat">${escapeHtml(safeT('cat.' + tool.catId))}</div>
            </div>
        `;
        item.onclick = function () {
            const input = el('home-search');
            if (input) input.value = '';
            handleQuickSearch();
            openCalc(tool.catId, tool.tabId);
        };
        box.appendChild(item);
    });
}

function handleQuickSearch() {
    const input = el('home-search');
    if (!input) return;
    const q = input.value.trim();
    const resultsBox = el('quick-search-results');
    const normal = el('home-normal-content');
    const clearBtn = el('search-clear-btn');
    if (!resultsBox || !normal) return;
    if (clearBtn) clearBtn.style.display = q ? 'flex' : 'none';

    if (!q) {
        resultsBox.style.display = 'none';
        resultsBox.innerHTML = '';
        normal.style.display = 'block';
        return;
    }
    normal.style.display = 'none';
    const matches = searchTools(q);
    const numericSuggestions = getNumericSuggestions(q);
    renderQuickResults(matches, numericSuggestions, q);
    resultsBox.style.display = 'flex';
    trackSearch(q);
}

function clearSearch() {
    const input = el('home-search');
    if (input) input.value = '';
    handleQuickSearch();
}

// ============================================================
// SVI ALATI MODAL — NOVA ARHITEKTURA (OPCIJA A)
// ============================================================
const allToolsViewState = {
    activeMainCat: null,
    openSubcats: {}
};

function openAllToolsModal() {
    const modal = el('all-tools-modal');
    if (!modal) return;

    allToolsViewState.activeMainCat = null;
    allToolsViewState.openSubcats = {};

    const searchInput = el('all-tools-search');
    if (searchInput) searchInput.value = '';
    const clearBtn = el('all-tools-search-clear');
    if (clearBtn) clearBtn.style.display = 'none';

    const backBtn = el('all-tools-back-btn');
    if (backBtn) backBtn.style.display = 'none';

    const title = el('all-tools-modal-title');
    if (title) title.textContent = safeT('allTools.title');

    renderAllToolsFavorites();
    renderAllToolsSections();

    modal.classList.add('show');
    document.body.classList.add('modal-open');
    vibrate(15);
    playTick(0, 1400, 0.06, 0.02);

    try { history.pushState({ modal: 'all-tools' }, '', ''); } catch (e) {}
}

function allToolsGoBack() {
    closeModal('all-tools-modal');
}

function renderAllToolsFavorites() {
    const wrap = el('all-tools-favorites-wrap');
    const chips = el('all-tools-favorites-chips');
    if (!wrap || !chips) return;

    const favs = loadFavorites().slice(0, 6);
    if (favs.length === 0) {
        wrap.style.display = 'none';
        chips.innerHTML = '';
        return;
    }
    wrap.style.display = '';

    chips.innerHTML = '';
    favs.forEach(key => {
        const parts = key.split(':');
        if (parts.length !== 2) return;
        const catId = parts[0], tabId = parts[1];
        const cat = CATEGORIES[catId];
        if (!cat) return;
        const tab = cat.tabs.find(t => t.id === tabId);
        if (!tab) return;
        const accent = getCategoryAccent(catId);

        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'all-tools-fav-chip';
        chip.style.setProperty('--qt-accent', accent);
        chip.innerHTML = `
            <span class="fav-chip-icon">${icon(tab.icon)}</span>
            <span>${escapeHtml(safeT('tab.' + catId + '.' + tabId))}</span>
        `;
        chip.onclick = (e) => {
            e.stopPropagation();
            openCalcFromAllTools(catId, tabId);
        };
        chips.appendChild(chip);
    });
}

function renderAllToolsSections() {
    const container = el('all-tools-sections');
    if (!container) return;

    let html = '';

    MAIN_CATEGORIES.forEach(mainCat => {
        html += `<div class="all-tools-section" style="--section-accent: ${mainCat.accent};">
            <div class="all-tools-section-header">
                <span class="all-tools-section-icon">${icon(mainCat.icon)}</span>
                <span class="all-tools-section-name">${escapeHtml(mainCat.name)}</span>
            </div>
            <div class="all-tools-section-chips">
        `;

        mainCat.subcats.forEach(subId => {
            const cat = CATEGORIES[subId];
            if (!cat) return;
            const accent = getCategoryAccent(subId);
            const totalTools = cat.tabs.length;
            const isActive = allToolsViewState.activeMainCat === mainCat.id && allToolsViewState.openSubcats[subId] === true;

            html += `<button type="button" class="all-tools-subcat-chip-btn${isActive ? ' active' : ''}"
                    style="--qt-accent: ${accent};"
                    onclick="event.stopPropagation(); toggleAllToolsSubcat('${mainCat.id}', '${subId}')">
                <span class="all-tools-subcat-chip-icon">${icon(cat.icon)}</span>
                <span class="all-tools-subcat-chip-name">${escapeHtml(safeT('cat.' + subId))}</span>
                <span class="all-tools-subcat-chip-count">${totalTools}</span>
            </button>`;
        });

        html += `</div>`;

        if (allToolsViewState.activeMainCat === mainCat.id && Object.keys(allToolsViewState.openSubcats).some(k => allToolsViewState.openSubcats[k])) {
            mainCat.subcats.forEach(subId => {
                if (!allToolsViewState.openSubcats[subId]) return;
                const cat = CATEGORIES[subId];
                if (!cat) return;
                const accent = getCategoryAccent(subId);

                let tabsHtml = '';
                cat.tabs.forEach(tab => {
                    const favKey = `${subId}:${tab.id}`;
                    const isFav = isFavorite(favKey);
                    const badgeCount = getTabCount(subId, tab.id);
                    const badgeHtml = badgeCount > 0
                        ? `<span class="all-tools-tab-badge">${badgeCount > 99 ? '99+' : badgeCount}</span>`
                        : '';
                    const favHtml = isFav
                        ? `<span class="all-tools-tab-fav">${icon('starFill')}</span>`
                        : '';

                    tabsHtml += `
                        <button type="button" class="all-tools-tab"
                                style="--tab-accent: ${accent};"
                                onclick="event.stopPropagation(); openCalcFromAllTools('${subId}', '${tab.id}')"
                                title="${escapeHtml(safeT('tab.' + subId + '.' + tab.id))}">
                            ${badgeHtml}
                            ${favHtml}
                            <span class="all-tools-tab-icon">${icon(tab.icon)}</span>
                            <span class="all-tools-tab-label">${escapeHtml(safeT('tab.' + subId + '.' + tab.id))}</span>
                        </button>
                    `;
                });

                html += `<div class="all-tools-subcat-panel" style="--cat-accent: ${accent};">
                    <div class="all-tools-subcat-panel-header">
                        <span class="all-tools-subcat-panel-icon">${icon(cat.icon)}</span>
                        <span class="all-tools-subcat-panel-name">${escapeHtml(safeT('cat.' + subId))}</span>
                        <button type="button" class="all-tools-subcat-panel-close" onclick="event.stopPropagation(); toggleAllToolsSubcat('${mainCat.id}', '${subId}')">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                        </button>
                    </div>
                    <div class="all-tools-tabs-grid">${tabsHtml}</div>
                </div>`;
            });
        }

        html += `</div>`;
    });

    container.innerHTML = html;
}
function toggleAllToolsSubcat(mainCatId, subcatId) {
    if (allToolsViewState.activeMainCat !== mainCatId) {
        allToolsViewState.activeMainCat = mainCatId;
        allToolsViewState.openSubcats = {};
    }
    const wasOpen = allToolsViewState.openSubcats[subcatId] === true;
    allToolsViewState.openSubcats[subcatId] = !wasOpen;
    renderAllToolsSections();
    vibrate(8);
    playTick(0, 1200, 0.04, 0.012);
}

function openCalcFromAllTools(catId, tabId) {
    closeModal('all-tools-modal');
    setTimeout(() => {
        openCalc(catId, tabId);
    }, 200);
}

function handleAllToolsSearch() {
    const input = el('all-tools-search');
    if (!input) return;
    const q = input.value.trim();
    const clearBtn = el('all-tools-search-clear');
    if (clearBtn) clearBtn.style.display = q ? 'flex' : 'none';

    const favWrap = el('all-tools-favorites-wrap');
    if (favWrap) favWrap.style.display = q ? 'none' : '';

    if (!q) {
        renderAllToolsSections();
        if (favWrap) favWrap.style.display = '';
        return;
    }

    const container = el('all-tools-sections');
    if (!container) return;

    const matches = searchTools(q);
    if (matches.length === 0) {
        container.innerHTML = `
            <div class="all-tools-search-empty">
                <div class="all-tools-search-empty-title">${safeT('allTools.noResults')}</div>
                <div>${safeT('allTools.tryAgain')}</div>
            </div>
        `;
        return;
    }

    let html = '<div class="all-tools-search-results">';
    matches.forEach(tool => {
        const accent = getCategoryAccent(tool.catId);
        html += `
            <button type="button" class="all-tools-search-item"
                    style="--qt-accent: ${accent};"
                    onclick="openCalcFromAllTools('${tool.catId}', '${tool.tabId}')">
                <span class="all-tools-search-item-icon">${icon(tool.icon)}</span>
                <span class="all-tools-search-item-text">
                    <span class="all-tools-search-item-name">${escapeHtml(safeT('tab.' + tool.catId + '.' + tool.tabId))}</span>
                    <span class="all-tools-search-item-cat">${escapeHtml(safeT('cat.' + tool.catId))}</span>
                </span>
            </button>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

function clearAllToolsSearch() {
    const input = el('all-tools-search');
    if (input) input.value = '';
    const clearBtn = el('all-tools-search-clear');
    if (clearBtn) clearBtn.style.display = 'none';
    const favWrap = el('all-tools-favorites-wrap');
    if (favWrap) favWrap.style.display = '';
    renderAllToolsFavorites();
    renderAllToolsSections();
}
// ============================================================
// TOAST
// ============================================================
function showToast(message, type = 'info', duration = 3000) {
    const container = el('toast-container');
    if (!container) return;
    const icons = { success: icon('check'), error: icon('x'), info: icon('info'), warning: icon('alert') };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-icon">${icons[type] || icons.info}</div>
        <div class="toast-msg">${escapeHtml(message)}</div>
        <button class="toast-close" aria-label="Zatvori">✕</button>
        <div class="toast-progress" style="animation-duration: ${duration}ms;"></div>
    `;
    container.appendChild(toast);
    requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));
    let dismissed = false;
    const dismiss = () => {
        if (dismissed) return;
        dismissed = true;
        toast.classList.remove('show');
        toast.classList.add('hide');
        setTimeout(() => { if (toast.parentNode) toast.remove(); }, 400);
    };
    toast.querySelector('.toast-close').addEventListener('click', () => { clearTimeout(timer); dismiss(); });
    const timer = setTimeout(dismiss, duration);
    if (type === 'error') vibrate(30);
    else if (type === 'success') vibrate(15);
}

// ============================================================
// CONFIRM
// ============================================================
let confirmResolver = null;
function showConfirm(message, title = null) {
    return new Promise((resolve) => {
        confirmResolver = resolve;
        const titleEl = el('confirm-title');
        const msgEl = el('confirm-message');
        const modalEl = el('confirm-modal');
        if (titleEl) titleEl.innerText = title || safeT('confirm.title');
        if (msgEl) msgEl.innerText = message;
        if (modalEl) modalEl.classList.add('show');
        vibrate(15);
    });
}
function closeConfirm(result) {
    const modalEl = el('confirm-modal');
    if (modalEl) modalEl.classList.remove('show');
    if (confirmResolver) { confirmResolver(result); confirmResolver = null; }
    vibrate(10);
}

// ============================================================
// ZVUK I VIBRACIJA
// ============================================================
let settings = { sound: true, haptic: true };
try {
    const saved = JSON.parse(localStorage.getItem('cx_fx'));
    if (saved) settings = Object.assign(settings, saved);
} catch (e) {}
function saveSettings() { try { localStorage.setItem('cx_fx', JSON.stringify(settings)); } catch (e) {} }

const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let audioCtx = null;
let audioUnlocked = false;
function getAudio() {
    if (!audioCtx) {
        try {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return null;
            audioCtx = new AC();
        } catch (e) { return null; }
    }
    return audioCtx;
}
function unlockAudio() {
    if (audioUnlocked) return;
    const ctx = getAudio();
    if (!ctx) return;
    try {
        if (ctx.state === 'suspended') ctx.resume();
        const buffer = ctx.createBuffer(1, 1, 22050);
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        src.connect(ctx.destination);
        src.start(0);
    } catch (e) {}
    audioUnlocked = true;
}
document.addEventListener('pointerdown', unlockAudio, { once: true, passive: true });
document.addEventListener('touchstart', unlockAudio, { once: true, passive: true });
document.addEventListener('keydown', unlockAudio, { once: true });

function playTick(delaySec = 0, freq = 1500, vol = 0.07, dur = 0.02) {
    if (!settings.sound) return;
    const ctx = getAudio();
    if (!ctx) return;
    try {
        if (ctx.state === 'suspended') return;
        const t = ctx.currentTime + delaySec;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.5, t + dur);
        gain.gain.setValueAtTime(vol, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + dur + 0.01);
    } catch (e) {}
}
function vibrate(pattern) {
    if (!settings.haptic) return;
    if (navigator.vibrate) { try { navigator.vibrate(pattern); } catch (e) {} }
}
function playAlarmBeep() {
    if (!settings.sound) return;
    const ctx = getAudio();
    if (!ctx) return;
    try {
        if (ctx.state === 'suspended') ctx.resume();
        const now = ctx.currentTime;
        for (let i = 0; i < 3; i++) {
            const t = now + i * 0.2;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, t);
            gain.gain.setValueAtTime(0.0001, t);
            gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t);
            osc.stop(t + 0.16);
        }
    } catch (e) {}
}

// ============================================================
// RIPPLE
// ============================================================
function createRipple(e) {
    const target = e.currentTarget;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = (e.clientX || (rect.left + rect.width / 2)) - rect.left - size / 2;
    const y = (e.clientY || (rect.top + rect.height / 2)) - rect.top - size / 2;
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    if (getComputedStyle(target).position === 'static') target.style.position = 'relative';
    target.appendChild(ripple);
    setTimeout(() => { if (ripple.parentNode) ripple.remove(); }, 600);
}
function setupRipple() {
    const selector = '.calc-btn-main, .copy-btn, .back-btn, .swap-btn, .settings-toggle-btn, .confirm-btn, .openings-add-btn, .fx-refresh-btn, .fx-swap-btn, .copy-btn-mini, .lista-clear-btn, .quick-tool, .all-tool, .tab-btn, .section-action-btn, .modal-fav-star, .modal-settings-btn, .weather-refresh-btn, .location-gps-btn, .weather-location, .icon-btn-text, .about-row, .tabs-settings-reset-btn, .tabs-settings-save-btn, .gps-btn-main, .gps-btn-secondary, .gps-chip, .gps-color-swatch, .tabs-settings-color-reset, .toolbar-btn, .bottom-nav-btn, .mytool-item, .today-item, .holiday-card, .all-tools-main-btn, .all-tools-main-cat, .all-tools-subcat-head, .all-tools-tab, .all-tools-search-item, .all-tools-fav-chip, .all-tools-back-btn, .all-tools-subcat-chip-btn, .all-tools-subcat-panel-close, .stopwatch-btn, .timer-btn, .timer-preset-btn, .timer-option-btn, .speedometer-actions .gps-btn-main, .speedometer-actions .gps-btn-secondary, .receipt-card, .receipt-chip, .receipt-card-action, .receipt-details-action, .receipt-status-btn, .receipt-add-btn';
    document.addEventListener('pointerdown', (e) => {
        const t = e.target.closest(selector);
        if (t) createRipple({ currentTarget: t, clientX: e.clientX, clientY: e.clientY });
    }, { passive: true });
}

// ============================================================
// PODEŠAVANJA
// ============================================================
function updateSettingsUI() {
    try {
        const themeBtn = el('settings-theme-btn');
        if (themeBtn) {
            const isLight = document.documentElement.getAttribute('data-theme') === 'light';
            themeBtn.textContent = isLight ? safeT('settings.theme.light') : safeT('settings.theme.dark');
        }
        const soundBtn = el('settings-sound-btn');
        if (soundBtn) soundBtn.textContent = settings.sound ? safeT('settings.sound.on') : safeT('settings.sound.off');
        const hapticBtn = el('settings-haptic-btn');
        if (hapticBtn) {
            if (!('vibrate' in navigator)) {
                hapticBtn.textContent = safeT('settings.haptic.unsupported');
                hapticBtn.disabled = true;
                hapticBtn.style.opacity = '0.5';
            } else {
                hapticBtn.textContent = settings.haptic ? safeT('settings.haptic.on') : safeT('settings.haptic.off');
                hapticBtn.disabled = false;
                hapticBtn.style.opacity = '1';
            }
        }
        const curSel = el('settings-currency');
        if (curSel) { try { curSel.value = localStorage.getItem('cx_default_currency') || 'RSD'; } catch (e) {} }
        const langSel = el('settings-language');
        if (langSel) langSel.value = currentLang;
        const archiveBtn = el('settings-archive-btn');
        if (archiveBtn) {
            const enabled = getArchiveAutoCleanupSetting();
            archiveBtn.textContent = enabled ? safeT('settings.archive.autoCleanup.on') : safeT('settings.archive.autoCleanup.off');
        }
    } catch (e) {}
}
function toggleSetting(key) {
    settings[key] = !settings[key];
    saveSettings();
    updateSettingsUI();
    if (settings[key]) {
        if (key === 'sound') playTick(0, 1500, 0.08, 0.03);
        else vibrate(30);
    }
}
function setDefaultCurrency() {
    const curSel = el('settings-currency');
    if (!curSel) return;
    try { localStorage.setItem('cx_default_currency', curSel.value); } catch (e) {}
}
function setLanguageFromSettings(lang) {
    if (typeof setLanguage === 'function') {
        setLanguage(lang);
        if (typeof refreshUIText === 'function') refreshUIText();
        if (typeof renderQuickTools === 'function') renderQuickTools();
        if (typeof renderFavorites === 'function') renderFavorites();
        if (typeof renderHistory === 'function') renderHistory();
        if (typeof updateSettingsUI === 'function') updateSettingsUI();
        if (typeof renderAllToolsSections === 'function') {
            const allToolsModal = el('all-tools-modal');
            if (allToolsModal && allToolsModal.classList.contains('show')) {
                renderAllToolsFavorites();
                renderAllToolsSections();
            }
        }
    }
}
function toggleTheme() {
    try {
        const root = document.documentElement;
        const isLight = root.getAttribute('data-theme') === 'light';
        const themeBtn = el('theme-toggle');
        const svgMoon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
        const svgSun = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>';
        if (isLight) { root.removeAttribute('data-theme'); if (themeBtn) themeBtn.innerHTML = svgMoon; }
        else { root.setAttribute('data-theme', 'light'); if (themeBtn) themeBtn.innerHTML = svgSun; }
        try { localStorage.setItem('cx_theme', isLight ? 'dark' : 'light'); } catch (e) {}
        updateSettingsUI();
    } catch (e) {}
}

// ============================================================
// COPY / SHARE
// ============================================================
function swapInputs(fromId, toId) {
    const fromSelect = el(fromId), toSelect = el(toId);
    if (!fromSelect || !toSelect) return;
    const temp = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = temp;
}
function copyResult(elementId, unit = '', evt = null) {
    try {
        const elem = el(elementId);
        if (!elem) return;
        const unitEl = unit ? el(unit) : null;
        const unitText = unitEl ? unitEl.innerText : unit;
        const text = `${elem.innerText} ${unitText}`.trim();
        const btn = evt && evt.target ? evt.target : (window.event && window.event.target);
        const done = () => {
            if (btn) {
                const old = btn.textContent;
                btn.textContent = safeT('modal.copied');
                setTimeout(() => { btn.textContent = old; }, 1500);
            }
            showToast(safeT('result.copied'), 'success', 1800);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
        } else fallbackCopy(text, done);
    } catch (e) {}
}
function fallbackCopy(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); }
    catch (e) { showToast(safeT('result.copyFailed'), 'error'); }
    document.body.removeChild(ta);
}
async function shareResult(btn) {
    try {
        const category = btn.dataset.category;
        const label = btn.dataset.label;
        const card = btn.closest('.result-card-green');
        const text = card ? cardText(card) : '';
        const shareText = `${category} – ${label}\n${text}\n\n(${currentLang === 'en' ? 'Calculated in Alatika' : 'Izračunato u Alatika'})`;
        if (navigator.share) {
            try { await navigator.share({ text: shareText }); showToast(safeT('modal.copied'), 'success'); } catch (e) {}
            return;
        }
        const ta = document.createElement('textarea');
        ta.value = shareText; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); showToast(safeT('modal.copied'), 'success'); }
        catch (e) { showToast(safeT('result.copyFailed'), 'error'); }
        document.body.removeChild(ta);
    } catch (e) {}
}

// ============================================================
// ISTORIJA
// ============================================================
function loadHistory() {
    try { return JSON.parse(localStorage.getItem('cx_history')) || []; } catch (e) { return []; }
}
function saveHistoryList(list) {
    try { localStorage.setItem('cx_history', JSON.stringify(list)); } catch (e) {}
}
function saveHistory(btn) {
    try {
        const category = btn.dataset.category;
        const label = btn.dataset.label;
        const card = btn.closest('.result-card-green');
        const text = card ? cardText(card) : '';
        const list = loadHistory();
        list.unshift({ category, label, text, date: Date.now() });
        saveHistoryList(list.slice(0, 100));
        const old = btn.innerHTML;
        btn.innerHTML = icon('check') + ' ' + safeT('modal.saved');
        showToast(label + ' ' + safeT('result.saved'), 'success', 2000);
        setTimeout(() => { btn.innerHTML = old; }, 1200);
    } catch (e) {}
}
function deleteHistoryItem(idx) {
    try {
        const list = loadHistory();
        list.splice(idx, 1);
        saveHistoryList(list);
        renderHistory();
        showToast(safeT('history.deleted'), 'info', 1500);
    } catch (e) {}
}
async function clearHistory() {
    const ok = await showConfirm(safeT('history.confirm.clear'), safeT('history.confirm.title'));
    if (!ok) return;
    saveHistoryList([]);
    renderHistory();
    showToast(safeT('history.cleared'), 'success');
}
async function exportHistory() {
    try {
        const list = loadHistory();
        if (!list.length) { showToast(safeT('history.export.empty'), 'info'); return; }
        const lines = list.map(item => {
            const d = new Date(item.date);
            const locale = currentLang === 'en' ? 'en-GB' : 'sr-RS';
            const dateStr = d.toLocaleDateString(locale) + ' ' + d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
            return `${item.category} – ${item.label}\n${item.text}\n${dateStr}\n`;
        });
        const fullText = safeT('history.export.header') + '\n\n' + lines.join('\n');
        if (navigator.share) {
            try { await navigator.share({ text: fullText }); showToast(safeT('modal.copied'), 'success'); } catch (e) {}
            return;
        }
        const ta = document.createElement('textarea');
        ta.value = fullText; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); showToast(safeT('modal.copied'), 'success'); }
        catch (e) { showToast(safeT('result.copyFailed'), 'error'); }
        document.body.removeChild(ta);
    } catch (e) {}
}
function getDateGroup(timestamp) {
    const now = new Date(); now.setHours(0, 0, 0, 0);
    const todayMs = now.getTime(), dayMs = 86400000;
    const t = new Date(timestamp); t.setHours(0, 0, 0, 0);
    const diffDays = Math.round((todayMs - t.getTime()) / dayMs);
    if (diffDays === 0) return { key: 'today', title: 'history.today' };
    if (diffDays === 1) return { key: 'yesterday', title: 'history.yesterday' };
    if (diffDays < 7) return { key: 'week', title: 'history.week' };
    return { key: 'older', title: 'history.older' };
}
function renderHistory() {
    try {
        const list = loadHistory();
        const container = el('history-list');
        const empty = el('history-empty');
        const noResults = el('history-no-results');
        const countEl = el('history-count');
        const searchInput = el('history-search');
        if (!container) return;
        const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        let filtered = list;
        if (query) {
            filtered = list.filter(item => {
                const cat = (item.category || '').toLowerCase();
                const lbl = (item.label || '').toLowerCase();
                const txt = (item.text || '').toLowerCase();
                return cat.includes(query) || lbl.includes(query) || txt.includes(query);
            });
        }
        if (countEl) {
            if (query) countEl.textContent = safeT('history.found') + ': ' + filtered.length + ' / ' + list.length;
            else countEl.textContent = safeT('history.total') + ': ' + list.length;
        }
        container.innerHTML = '';
        if (!list.length) {
            if (empty) { empty.textContent = safeT('history.empty'); empty.style.display = 'block'; }
            if (noResults) noResults.style.display = 'none';
            renderUsageStats(); return;
        }
        if (!filtered.length) {
            if (empty) empty.style.display = 'none';
            if (noResults) { noResults.textContent = safeT('history.noResults'); noResults.style.display = 'block'; }
            renderUsageStats(); return;
        }
        if (empty) empty.style.display = 'none';
        if (noResults) noResults.style.display = 'none';
        const groups = { today: [], yesterday: [], week: [], older: [] };
        filtered.forEach(item => { groups[getDateGroup(item.date).key].push(item); });
        const groupOrder = [
            { key: 'today', title: safeT('history.today') },
            { key: 'yesterday', title: safeT('history.yesterday') },
            { key: 'week', title: safeT('history.week') },
            { key: 'older', title: safeT('history.older') }
        ];
        const originalIndexMap = new Map();
        list.forEach((item, idx) => originalIndexMap.set(item, idx));
        groupOrder.forEach(group => {
            const items = groups[group.key];
            if (!items.length) return;
            const groupDiv = document.createElement('div');
            groupDiv.className = 'history-group';
            const title = document.createElement('div');
            title.className = 'history-group-title';
            title.textContent = group.title;
            groupDiv.appendChild(title);
            items.forEach(item => {
                const realIdx = originalIndexMap.get(item);
                const row = document.createElement('div');
                row.className = 'history-item';
                const left = document.createElement('div');
                const cat = document.createElement('div');
                cat.className = 'history-category';
                cat.textContent = item.category + ' • ' + item.label;
                const res = document.createElement('div');
                res.className = 'history-result';
                res.textContent = item.text;
                const d = new Date(item.date);
                const locale = currentLang === 'en' ? 'en-GB' : 'sr-RS';
                const dateEl = document.createElement('div');
                dateEl.className = 'history-date';
                dateEl.textContent = d.toLocaleDateString(locale) + ' ' + d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
                left.appendChild(cat); left.appendChild(res); left.appendChild(dateEl);
                const del = document.createElement('button');
                del.className = 'delete-item-btn';
                del.innerHTML = icon('trash');
                del.onclick = () => deleteHistoryItem(realIdx);
                row.appendChild(left); row.appendChild(del);
                groupDiv.appendChild(row);
            });
            container.appendChild(groupDiv);
        });
        renderUsageStats();
    } catch (e) {}
}
function renderUsageStats() {
    try {
        const box = el('usage-stats-box');
        if (!box) return;
        let counts = {};
        try { counts = JSON.parse(localStorage.getItem(CATEGORY_CLICKS_KEY)) || {}; } catch (e) {}
        const entries = Object.keys(counts)
            .filter(id => CATEGORIES[id] && counts[id] > 0)
            .map(id => ({ id, count: counts[id], cat: CATEGORIES[id] }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        if (!entries.length) {
            box.innerHTML = '<div class="chart-empty"><span class="chart-empty-icon">📊</span>' + safeT('history.stats.empty') + '</div>'; return;
        }
        const maxCount = Math.max(...entries.map(e => e.count), 1);
        let html = '<div class="bar-chart-h">';
        entries.forEach((entry, idx) => {
            const width = (entry.count / maxCount * 100);
            html += `<div class="bar-row" style="animation-delay:${idx * 0.05}s;"><div class="bar-row-label">${escapeHtml(safeT('cat.' + entry.id))}</div><div class="bar-row-track"><div class="bar-row-fill" style="width:${width}%; --bar-color:${entry.cat.accent};"></div></div><div class="bar-row-value">${entry.count}×</div></div>`;
        });
        html += '</div>';
        box.innerHTML = html;
    } catch (e) {}
}
function toggleStatsPanel() {
    const panel = el('stats-panel');
    const btn = el('stats-toggle-btn');
    if (!panel || !btn) return;
    const isOpen = panel.style.display !== 'none';
    if (isOpen) {
        panel.style.display = 'none';
        btn.classList.remove('open');
        btn.textContent = safeT('history.stats.show');
    } else {
        panel.style.display = 'block';
        btn.classList.add('open');
        btn.textContent = safeT('history.stats.hide');
        renderUsageStats();
    }
}
function trackCategoryUse(categoryId) {
    if (!CATEGORIES[categoryId]) return;
    try {
        let counts = {};
        try { counts = JSON.parse(localStorage.getItem(CATEGORY_CLICKS_KEY)) || {}; } catch (e) {}
        counts[categoryId] = (counts[categoryId] || 0) + 1;
        localStorage.setItem(CATEGORY_CLICKS_KEY, JSON.stringify(counts));
    } catch (e) {}
}
// ============================================================
// NAVIGACIJA — MODALI
// ============================================================
let activeCategory = null;
let activeTab = null;

function openCategory(categoryId) {
    const cat = CATEGORIES[categoryId];
    if (!cat) return;
    activeCategory = categoryId;
    trackCategoryUse(categoryId);

    const modal = el('category-modal');
    const iconBox = el('category-icon');
    const titleBox = el('category-title');
    const tabBar = el('category-tab-bar');
    const accent = getCategoryAccent(categoryId);

    if (!modal || !iconBox || !titleBox || !tabBar) return;

    modal.style.setProperty('--qt-accent', accent);
    iconBox.style.setProperty('--qt-accent', accent);
    iconBox.innerHTML = icon(cat.icon);
    titleBox.textContent = safeT('cat.' + categoryId);

    renderCategoryTabs(categoryId, tabBar, cat);

    modal.classList.add('show');
    document.body.classList.add('modal-open');
    vibrate(15);
    playTick(0, 1400, 0.06, 0.02);
    try { history.pushState({ modal: 'category', category: categoryId }, '', ''); } catch (e) {}
}

function openCategoryBack(categoryId) {
    const cat = CATEGORIES[categoryId];
    if (!cat) return;
    activeCategory = categoryId;
    const modal = el('category-modal');
    const iconBox = el('category-icon');
    const titleBox = el('category-title');
    const tabBar = el('category-tab-bar');
    const accent = getCategoryAccent(categoryId);
    if (!modal || !iconBox || !titleBox || !tabBar) return;
    modal.style.setProperty('--qt-accent', accent);
    iconBox.style.setProperty('--qt-accent', accent);
    iconBox.innerHTML = icon(cat.icon);
    titleBox.textContent = safeT('cat.' + categoryId);
    renderCategoryTabs(categoryId, tabBar, cat);
    modal.classList.add('show');
    document.body.classList.add('modal-open');
    vibrate(15);
    playTick(0, 1400, 0.06, 0.02);
}

function renderCategoryTabs(categoryId, tabBar, cat) {
    if (!tabBar || !cat) return;
    const layout = getCategoryTabsLayout(categoryId);
    const hidden = layout.hidden || [];
    const order = layout.order && layout.order.length
        ? layout.order.filter(id => cat.tabs.some(t => t.id === id))
        : cat.tabs.map(t => t.id);
    cat.tabs.forEach(t => { if (!order.includes(t.id)) order.push(t.id); });

    const accent = getCategoryAccent(categoryId);
    tabBar.innerHTML = '';
    order.forEach(tabId => {
        if (hidden.includes(tabId)) return;
        const tab = cat.tabs.find(t => t.id === tabId);
        if (!tab) return;
        const btn = document.createElement('button');
        btn.className = 'tab-btn';
        btn.style.setProperty('--qt-accent', accent);
        btn.innerHTML = `
            <span class="tab-btn-icon">${icon(tab.icon)}</span>
            <span class="tab-btn-label">${escapeHtml(safeT('tab.' + categoryId + '.' + tab.id))}</span>
        `;
        btn.onclick = () => openCalc(categoryId, tab.id);

        const count = getTabCount(categoryId, tab.id);
        if (count > 0) {
            const badge = document.createElement('span');
            badge.className = 'tab-badge';
            badge.textContent = count > 99 ? '99+' : String(count);
            btn.appendChild(badge);
        }
        tabBar.appendChild(btn);
    });
}

function openCalc(categoryId, tabId) {
    const cat = CATEGORIES[categoryId];
    if (!cat) return;
    const tab = cat.tabs.find(t => t.id === tabId);
    if (!tab) return;
    activeTab = tabId;
    activeCategory = categoryId;

    const modal = el('calc-modal');
    const iconBox = el('calc-icon');
    const titleBox = el('calc-title');
    const body = el('calc-body');
    const accent = getCategoryAccent(categoryId);

    if (!modal || !iconBox || !titleBox || !body) return;

    modal.style.setProperty('--qt-accent', accent);
    iconBox.style.setProperty('--qt-accent', accent);
    iconBox.innerHTML = icon(tab.icon);
    titleBox.textContent = safeT('tab.' + categoryId + '.' + tabId);

    const favKey = `${categoryId}:${tabId}`;
    const favStar = el('calc-fav-star');
    if (favStar) {
        const active = isFavorite(favKey);
        favStar.dataset.favKey = favKey;
        favStar.classList.toggle('active', active);
        favStar.innerHTML = active ? icon('starFill') : icon('star');
    }

    body.innerHTML = tab.render();

    const catModal = el('category-modal');
    if (catModal) catModal.classList.remove('show');

    modal.classList.add('show');
    document.body.classList.add('modal-open');

    try { restoreInputsFor(body); } catch (e) {}
    try { setupDateTriplesIn(body); } catch (e) {}
    try { setupShapeTypeListener(body); } catch (e) {}

    vibrate(20);
    playTick(0, 1500, 0.08, 0.03);

    if (tabId === 'valuta') {
        setTimeout(() => {
            if (typeof loadFxRates === 'function') loadFxRates();
            if (typeof populateCurrencySelects === 'function') populateCurrencySelects();
            if (typeof renderFxList === 'function') renderFxList();
            if (typeof updateFxUpdatedLabel === 'function') updateFxUpdatedLabel();
            if (typeof calculateCurrency === 'function') calculateCurrency();
        }, 50);
    }
    if (tabId === 'lista') setTimeout(() => { if (typeof renderShoppingList === 'function') renderShoppingList(); }, 50);
    if (tabId === 'stimer') setTimeout(() => { if (typeof renderTunerStrings === 'function') renderTunerStrings(); }, 50);
    if (tabId === 'istorijatocenja') setTimeout(() => { if (typeof renderFuelHistoryList === 'function') renderFuelHistoryList(); }, 50);
    if (tabId === 'profil') setTimeout(() => { if (typeof loadVehicleProfileIntoForm === 'function') loadVehicleProfileIntoForm(); }, 50);
    if (tabId === 'pracenje') setTimeout(() => { if (typeof renderPriceTrackingList === 'function') renderPriceTrackingList(); }, 50);
    if (tabId === 'troskovnik') setTimeout(() => { if (typeof renderCostEstimateList === 'function') renderCostEstimateList(); }, 50);
    if (tabId === 'praznici') setTimeout(() => { if (typeof renderHolidaysList === 'function') renderHolidaysList(); }, 50);
    if (tabId === 'barkod') setTimeout(() => { if (typeof initBarcodeScanner === 'function') initBarcodeScanner(); }, 50);

    if (categoryId === 'racuni') {
        setTimeout(() => {
            if (tabId === 'moji') {
                if (typeof renderRacuniList === 'function') renderRacuniList();
                if (typeof loadReceiptThumbnails === 'function') loadReceiptThumbnails();
            } else if (tabId === 'pregled') {
                if (typeof renderRacuniPregledList === 'function') renderRacuniPregledList();
            } else if (tabId === 'analiza') {
                if (typeof renderRacuniAnalizaAll === 'function') renderRacuniAnalizaAll();
            }
        }, 80);
    }

    if (categoryId === 'podsetnici') {
        setTimeout(() => {
            try {
                switch (tabId) {
                    case 'rodjendani':   renderReminderList('birthday'); break;
                    case 'racuni':       renderReminderList('bill'); break;
                    case 'vozila':       renderReminderList('vehicle'); renderReminderList('document'); break;
                    case 'pretplate':    renderReminderList('subscription'); break;
                    case 'lekivi':       renderReminderList('medication'); break;
                    case 'godisnjice':   renderReminderList('anniversary'); break;
                    case 'napomene':     renderReminderList('note'); break;
                    case 'arhiva':       if (typeof renderRemindersHistoryList === 'function') renderRemindersHistoryList(); break;
                }
            } catch (e) { console.warn('Reminder list error:', e); }
        }, 80);
    }

    if (categoryId === 'weather') {
        setTimeout(() => {
            if (typeof initWeatherTab === 'function') initWeatherTab(tabId);
        }, 100);
    }

    try { history.pushState({ modal: 'calc', category: categoryId, tab: tabId }, '', ''); } catch (e) {}
    try { maybeShowFavHint(); } catch (e) {}
}

function closeModal(modalId) {
    const modal = el(modalId);
    if (!modal) return;

    if (modalId === 'calc-modal' && activeCategory) {
        if (typeof gpsCleanupAll === 'function') { try { gpsCleanupAll(); } catch (e) {} }
        if (typeof stopTunerTone === 'function') { try { stopTunerTone(); } catch (e) {} }
        if (typeof stopTunerMic === 'function') { try { stopTunerMic(); } catch (e) {} }
        if (typeof stopMetronome === 'function') { try { stopMetronome(); } catch (e) {} }

        const catId = activeCategory;
        modal.classList.remove('show');
        activeTab = null;
        setTimeout(() => {
            const catModal = el('category-modal');
            if (catModal && !catModal.classList.contains('show')) {
                openCategoryBack(catId);
            }
        }, 180);
        vibrate(10);
        return;
    }

    modal.classList.remove('show');
    if (modalId === 'category-modal') activeCategory = null;
    if (modalId === 'tabs-settings-modal') { tabsSettingsCategory = null; tabsSettingsDraft = null; }
    if (modalId === 'all-tools-modal') {
        document.body.classList.remove('modal-open');
        allToolsViewState.activeMainCat = null;
        allToolsViewState.openSubcats = {};
    }
    if (modalId === 'receipt-modal' || modalId === 'receipt-details-modal') {
        if (receiptState && receiptState.currentObjectUrl) {
            try { URL.revokeObjectURL(receiptState.currentObjectUrl); } catch (e) {}
            receiptState.currentObjectUrl = null;
        }
    }

    setTimeout(() => {
        const anyOpen = document.querySelector('.modal.show');
        if (!anyOpen) document.body.classList.remove('modal-open');
    }, 220);
    vibrate(10);
}

function closeModalOnBackdrop(e, modalId) {
    if (e.target.id === modalId) closeModal(modalId);
}

function closeAllModals() {
    document.querySelectorAll('.modal.show').forEach(m => m.classList.remove('show'));
    document.body.classList.remove('modal-open');
    activeCategory = null;
    activeTab = null;
    tabsSettingsCategory = null;
    tabsSettingsDraft = null;
    allToolsViewState.activeMainCat = null;
    allToolsViewState.openSubcats = {};
    if (typeof gpsCleanupAll === 'function') { try { gpsCleanupAll(); } catch (e) {} }
    if (typeof stopTunerTone === 'function') { try { stopTunerTone(); } catch (e) {} }
    if (typeof stopTunerMic === 'function') { try { stopTunerMic(); } catch (e) {} }
    if (typeof stopMetronome === 'function') { try { stopMetronome(); } catch (e) {} }
    if (typeof stopBarcodeScanner === 'function') { try { stopBarcodeScanner(); } catch (e) {} }
    if (receiptState && receiptState.currentObjectUrl) {
        try { URL.revokeObjectURL(receiptState.currentObjectUrl); } catch (e) {}
        receiptState.currentObjectUrl = null;
    }
}

// ============================================================
// BRZI ALATI
// ============================================================
const QUICK_TOOLS_KEY = 'cx_quick_tools_v2';
const DEFAULT_QUICK_TOOLS = ['podsetnici', 'money', 'weather', 'racuni'];
const MAX_QUICK_TOOLS = 4;

function getQuickTools() {
    try {
        const raw = JSON.parse(localStorage.getItem(QUICK_TOOLS_KEY));
        if (Array.isArray(raw) && raw.length === MAX_QUICK_TOOLS) {
            const valid = raw.filter(id => CATEGORIES[id]);
            if (valid.length === MAX_QUICK_TOOLS) return valid;
        }
    } catch (e) {}
    return [...DEFAULT_QUICK_TOOLS];
}
function saveQuickToolsList(list) {
    try { localStorage.setItem(QUICK_TOOLS_KEY, JSON.stringify(list)); } catch (e) {}
}

function renderQuickTools() {
    const grid = el('quick-tools-grid');
    if (!grid) return;
    const tools = getQuickTools();
    grid.innerHTML = '';
    tools.forEach(id => {
        const cat = CATEGORIES[id];
        if (!cat) return;
        const accent = getCategoryAccent(id);
        const btn = document.createElement('button');
        btn.className = 'quick-tool';
        btn.style.setProperty('--qt-accent', accent);
        btn.dataset.catId = id;
        btn.innerHTML = `
            <span class="quick-tool-icon">${icon(cat.icon)}</span>
            <span class="quick-tool-label">${escapeHtml(safeT('cat.' + id))}</span>
        `;
        btn.onclick = () => openCategory(id);
        grid.appendChild(btn);
    });
    updateVisualBadge(getUrgentRemindersCount());
}

function openQuickToolsEditor() {
    const modal = el('editor-modal');
    const grid = el('editor-grid');
    if (!modal || !grid) return;
    const current = getQuickTools();
    grid.innerHTML = '';
    Object.entries(CATEGORIES).forEach(([id, cat]) => {
        const accent = getCategoryAccent(id);
        const item = document.createElement('div');
        item.className = 'editor-item' + (current.includes(id) ? ' selected' : '');
        item.dataset.catId = id;
        item.style.setProperty('--qt-accent', accent);
        item.innerHTML = `
            <div class="editor-item-icon">${icon(cat.icon)}</div>
            <div class="editor-item-label">${escapeHtml(safeT('cat.' + id))}</div>
        `;
        item.onclick = () => toggleEditorSelection(item);
        grid.appendChild(item);
    });
    modal.classList.add('show');
    document.body.classList.add('modal-open');
    vibrate(15);
    playTick(0, 1400, 0.06, 0.02);
}
function toggleEditorSelection(item) {
    const selected = document.querySelectorAll('.editor-item.selected');
    const isSelected = item.classList.contains('selected');
    if (!isSelected && selected.length >= MAX_QUICK_TOOLS) {
        showToast(safeT('editor.error.tooMany'), 'warning', 1800);
        vibrate(30);
        return;
    }
    item.classList.toggle('selected');
    vibrate(10);
    playTick(0, 1300, 0.05, 0.015);
}
function saveQuickTools() {
    const selected = Array.from(document.querySelectorAll('.editor-item.selected'))
        .map(item => item.dataset.catId);
    if (selected.length !== MAX_QUICK_TOOLS) {
        showToast(safeT('editor.error.wrongCount'), 'error');
        return;
    }
    saveQuickToolsList(selected);
    renderQuickTools();
    closeModal('editor-modal');
    showToast(safeT('editor.success'), 'success');
}

// ============================================================
// FAVORITI
// ============================================================
const FAV_KEY = 'cx_favorites_v4';

function loadFavorites() {
    try {
        const raw = JSON.parse(localStorage.getItem(FAV_KEY));
        if (Array.isArray(raw)) return raw;
    } catch (e) {}
    return [];
}
function saveFavorites(list) {
    try { localStorage.setItem(FAV_KEY, JSON.stringify(list)); } catch (e) {}
}
function isFavorite(key) { return loadFavorites().indexOf(key) !== -1; }
function toggleFavorite(event, key) {
    if (event) { event.preventDefault(); event.stopPropagation(); }
    const list = loadFavorites();
    const idx = list.indexOf(key);
    const wasFav = idx !== -1;
    if (wasFav) {
        list.splice(idx, 1);
        showToast(safeT('fav.removed'), 'info', 1400);
        vibrate(10);
    } else {
        list.push(key);
        showToast(safeT('fav.added'), 'success', 1400);
        vibrate(20);
        playTick(0, 1400, 0.07, 0.025);
    }
    saveFavorites(list);
    renderFavorites();
    const favStar = el('calc-fav-star');
    if (favStar && favStar.dataset.favKey === key) {
        const active = isFavorite(key);
        favStar.classList.toggle('active', active);
        favStar.innerHTML = active ? icon('starFill') : icon('star');
    }
    if (currentScreenId === 'mytools-screen') renderMyToolsScreen();
    const allToolsModal = el('all-tools-modal');
    if (allToolsModal && allToolsModal.classList.contains('show')) {
        renderAllToolsFavorites();
        renderAllToolsSections();
    }
}
function renderFavorites() {
    const row = el('favorites-row');
    const emptyMsg = el('favorites-empty');
    if (!row) return;
    const list = loadFavorites();
    if (!list.length) {
        row.innerHTML = '';
        row.style.display = 'block';
        if (emptyMsg) {
            emptyMsg.innerHTML = safeT('section.favoritesEmpty');
            emptyMsg.style.display = 'block';
        }
        return;
    }
    if (emptyMsg) emptyMsg.style.display = 'none';
    const wrap = document.createElement('div');
    wrap.className = 'favorites-chips';
    list.forEach(key => {
        const parts = key.split(':');
        if (parts.length !== 2) return;
        const catId = parts[0], tabId = parts[1];
        const cat = CATEGORIES[catId];
        if (!cat) return;
        const tab = cat.tabs.find(t => t.id === tabId);
        if (!tab) return;
        const accent = getCategoryAccent(catId);
        const chip = document.createElement('button');
        chip.className = 'favorite-chip';
        chip.type = 'button';
        chip.style.setProperty('--qt-accent', accent);
        chip.innerHTML = `
            <span class="fav-icon">${icon(tab.icon)}</span>
            <span class="fav-text">${escapeHtml(safeT('tab.' + catId + '.' + tabId))}</span>
            <span class="fav-remove" title="${safeT('fav.remove')}">${icon('x')}</span>
        `;
        chip.querySelector('.fav-remove').addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(e, key);
        });
        chip.addEventListener('click', () => openCalc(catId, tabId));
        wrap.appendChild(chip);
    });
    row.innerHTML = '';
    row.appendChild(wrap);
    row.style.display = 'block';
}
function toggleCalcFavStar() {
    const star = el('calc-fav-star');
    if (!star) return;
    const key = star.dataset.favKey;
    if (!key) return;
    toggleFavorite(null, key);
}

const FAV_HINT_KEY = 'cx_fav_hint_v1';
const FAV_HINT_INTERVAL_DAYS = 30;
function shouldShowFavHint() {
    try {
        const raw = localStorage.getItem(FAV_HINT_KEY);
        if (!raw) return true;
        const lastShown = parseInt(raw, 10);
        if (isNaN(lastShown)) return true;
        return ((Date.now() - lastShown) / 86400000) >= FAV_HINT_INTERVAL_DAYS;
    } catch (e) { return true; }
}
function maybeShowFavHint() {
    if (!shouldShowFavHint()) return;
    const hint = el('fav-hint');
    if (!hint) return;
    hint.style.display = 'flex';
    hint.classList.remove('hide');
    vibrate(15);
}
function dismissFavHint() {
    try { localStorage.setItem(FAV_HINT_KEY, String(Date.now())); } catch (e) {}
    const hint = el('fav-hint');
    if (!hint) return;
    hint.classList.add('hide');
    setTimeout(() => { hint.style.display = 'none'; }, 400);
    vibrate(10);
}

// ============================================================
// BADGE
// ============================================================
const BADGE_HINT_KEY = 'cx_hint_dismissed_badge';

function getUrgentRemindersCount() {
    try {
        if (typeof getAllReminderItems !== 'function') return 0;
        const items = getAllReminderItems();
        return items.filter(i => !i.isDone).length;
    } catch (e) { return 0; }
}
function updateAppBadge() {
    const count = getUrgentRemindersCount();
    if ('setAppBadge' in navigator) {
        try {
            if (count > 0) navigator.setAppBadge(count);
            else navigator.clearAppBadge();
        } catch (e) {}
    }
    updateVisualBadge(count);
}
function updateVisualBadge(count) {
    document.querySelectorAll('.quick-tool[data-badge]').forEach(el => el.removeAttribute('data-badge'));
    document.querySelectorAll('.all-tool[data-badge]').forEach(el => el.removeAttribute('data-badge'));
    document.querySelectorAll('.quick-tool[data-activity-dot]').forEach(el => el.removeAttribute('data-activity-dot'));
    document.querySelectorAll('.all-tool[data-activity-dot]').forEach(el => el.removeAttribute('data-activity-dot'));
    if (typeof hasActiveRemindersWithRemind === 'function' && !hasActiveRemindersWithRemind()) return;
    const quickTool = document.querySelector('.quick-tool[data-cat-id="podsetnici"]');
    if (quickTool) quickTool.setAttribute('data-activity-dot', '1');
}
function maybeShowBadgeHint() {
    try {
        if (localStorage.getItem(BADGE_HINT_KEY) === '1') return;
        const count = getUrgentRemindersCount();
        if (count <= 0) return;
        const hint = el('badge-hint');
        if (!hint) return;
        hint.style.display = 'flex';
        hint.classList.remove('hide');
        vibrate(15);
    } catch (e) {}
}
function dismissBadgeHint() {
    try { localStorage.setItem(BADGE_HINT_KEY, '1'); } catch (e) {}
    const hint = el('badge-hint');
    if (!hint) return;
    hint.classList.add('hide');
    setTimeout(() => { hint.style.display = 'none'; }, 400);
    vibrate(10);
}

// ============================================================
// ARHIVA
// ============================================================
const ARCHIVE_KEY = 'cx_archive';
const ARCHIVE_AUTO_CLEANUP_KEY = 'cx_archive_auto_cleanup';
const ARCHIVE_MAX_AGE_DAYS = 730;

function loadArchive() {
    try {
        const raw = JSON.parse(localStorage.getItem(ARCHIVE_KEY));
        if (Array.isArray(raw)) return raw;
    } catch (e) {}
    return [];
}
function saveArchive(list) {
    try { localStorage.setItem(ARCHIVE_KEY, JSON.stringify(list)); } catch (e) {}
}
function getArchiveAutoCleanupSetting() {
    try {
        const v = localStorage.getItem(ARCHIVE_AUTO_CLEANUP_KEY);
        if (v === null) return true;
        return v === '1';
    } catch (e) { return true; }
}
function setArchiveAutoCleanupSetting(enabled) {
    try { localStorage.setItem(ARCHIVE_AUTO_CLEANUP_KEY, enabled ? '1' : '0'); } catch (e) {}
}
function toggleArchiveAutoCleanup() {
    const current = getArchiveAutoCleanupSetting();
    setArchiveAutoCleanupSetting(!current);
    updateSettingsUI();
    showToast(safeT('settings.archive.autoCleanup.' + (!current ? 'on' : 'off')), 'info', 1500);
    vibrate(10);
    playTick(0, 1400, 0.06, 0.02);
}
function runArchiveAutoCleanup() {
    if (!getArchiveAutoCleanupSetting()) return;
    try {
        const archive = loadArchive();
        const cutoff = Date.now() - (ARCHIVE_MAX_AGE_DAYS * 86400000);
        const cleaned = archive.filter(item => (item.completedAt || 0) >= cutoff);
        if (cleaned.length !== archive.length) saveArchive(cleaned);
    } catch (e) {}
}

// ============================================================
// DATE TRIPLE
// ============================================================
function isoToParts(iso) {
    if (!iso || typeof iso !== 'string') return null;
    const parts = iso.split('-').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return null;
    return { y: parts[0], m: parts[1], d: parts[2] };
}
function partsToIso(d, m, y) {
    if (!d || !m || !y) return '';
    if (y < 1900 || y > 2100) return '';
    if (m < 1 || m > 12) return '';
    if (d < 1 || d > 31) return '';
    const test = new Date(y, m - 1, d);
    if (test.getFullYear() !== y || test.getMonth() !== m - 1 || test.getDate() !== d) return '';
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
function setTripleDate(dateId, iso) {
    const wrap = document.querySelector(`.date-triple[data-date-id="${dateId}"]`);
    if (!wrap) return;
    const parts = isoToParts(iso);
    const dayIn = wrap.querySelector('.date-day');
    const monthIn = wrap.querySelector('.date-month');
    const yearIn = wrap.querySelector('.date-year');
    const hidden = wrap.querySelector('input[type="hidden"]');
    if (!parts) {
        if (dayIn) dayIn.value = '';
        if (monthIn) monthIn.value = '';
        if (yearIn) yearIn.value = '';
        if (hidden) hidden.value = '';
        return;
    }
    if (dayIn) dayIn.value = parts.d;
    if (monthIn) monthIn.value = parts.m;
    if (yearIn) yearIn.value = parts.y;
    if (hidden) hidden.value = iso;
}
function getTripleDate(dateId) {
    const wrap = document.querySelector(`.date-triple[data-date-id="${dateId}"]`);
    if (!wrap) return '';
    const dayIn = wrap.querySelector('.date-day');
    const monthIn = wrap.querySelector('.date-month');
    const yearIn = wrap.querySelector('.date-year');
    const hidden = wrap.querySelector('input[type="hidden"]');
    const d = dayIn ? parseInt(dayIn.value) : NaN;
    const m = monthIn ? parseInt(monthIn.value) : NaN;
    let y = yearIn ? parseInt(yearIn.value) : NaN;
    if (!isNaN(y) && y >= 0 && y < 100) { y = (y > 50 ? 1900 : 2000) + y; if (yearIn) yearIn.value = y; }
    const iso = partsToIso(d, m, y);
    if (hidden) hidden.value = iso;
    return iso;
}
function setupDateTriplesIn(root) {
    root.querySelectorAll('.date-triple').forEach(wrap => {
        if (wrap.dataset.setup === '1') return;
        wrap.dataset.setup = '1';
        const dayIn = wrap.querySelector('.date-day');
        const monthIn = wrap.querySelector('.date-month');
        const yearIn = wrap.querySelector('.date-year');
        const hidden = wrap.querySelector('input[type="hidden"]');
        function updateHidden() {
            if (!hidden) return;
            const d = parseInt(dayIn ? dayIn.value : '');
            const m = parseInt(monthIn ? monthIn.value : '');
            let y = parseInt(yearIn ? yearIn.value : '');
            if (!isNaN(y) && y >= 0 && y < 100) y = (y > 50 ? 1900 : 2000) + y;
            hidden.value = partsToIso(d, m, y);
        }
        if (dayIn) dayIn.addEventListener('input', () => {
            let v = dayIn.value.replace(/\D/g, '');
            if (v.length > 2) v = v.slice(0, 2);
            if (v !== dayIn.value) dayIn.value = v;
            if (v.length === 2 || parseInt(v) > 3) { if (monthIn) monthIn.focus(); }
            updateHidden();
        });
        if (monthIn) monthIn.addEventListener('input', () => {
            let v = monthIn.value.replace(/\D/g, '');
            if (v.length > 2) v = v.slice(0, 2);
            if (v !== monthIn.value) monthIn.value = v;
            if (v.length === 2 || parseInt(v) > 1) { if (yearIn) yearIn.focus(); }
            updateHidden();
        });
        if (yearIn) yearIn.addEventListener('input', () => {
            let v = yearIn.value.replace(/\D/g, '');
            if (v.length > 4) v = v.slice(0, 4);
            if (v !== yearIn.value) yearIn.value = v;
            updateHidden();
        });
        [monthIn, yearIn].forEach((inp, idx) => {
            if (!inp) return;
            inp.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !inp.value) {
                    if (idx === 0 && dayIn) dayIn.focus();
                    if (idx === 1 && monthIn) monthIn.focus();
                }
            });
        });
    });
}
function setupShapeTypeListener(root) {
    const sel = root.querySelector('#shape-type');
    if (!sel || sel.dataset.shapeListener === '1') return;
    sel.dataset.shapeListener = '1';
    sel.addEventListener('change', () => {
        toggleShapeInputs();
        const box = root.querySelector('#shape-result-box');
        if (box) box.style.display = 'none';
        vibrate(10);
        playTick(0, 1300, 0.05, 0.015);
    });
}

// ============================================================
// INPUT PERSISTENCE
// ============================================================
const INPUT_STORAGE_KEY = 'cx_inputs_v1';
let inputCache = {};
function loadInputCache() {
    try {
        const raw = localStorage.getItem(INPUT_STORAGE_KEY);
        inputCache = raw ? JSON.parse(raw) : {};
    } catch (e) { inputCache = {}; }
}
function saveInputCache() {
    try { localStorage.setItem(INPUT_STORAGE_KEY, JSON.stringify(inputCache)); } catch (e) {}
}
function persistInput(elInput) {
    if (!elInput || !elInput.id) return;
    if (elInput.type === 'file' || elInput.type === 'password') return;
    let val = (elInput.type === 'checkbox' || elInput.type === 'radio') ? elInput.checked : elInput.value;
    inputCache[elInput.id] = val;
    saveInputCache();
}
function restoreInputsFor(root = document) {
    const inputs = root.querySelectorAll('input, select, textarea');
    inputs.forEach(elInput => {
        if (!elInput.id) return;
        if (elInput.type === 'hidden') return;
        if (inputCache[elInput.id] === undefined) return;
        const val = inputCache[elInput.id];
        if (elInput.type === 'checkbox' || elInput.type === 'radio') elInput.checked = !!val;
        else elInput.value = val;
    });
    root.querySelectorAll('.date-triple').forEach(wrap => {
        const hidden = wrap.querySelector('input[type="hidden"]');
        if (hidden && hidden.id && inputCache[hidden.id]) setTripleDate(hidden.id, inputCache[hidden.id]);
    });
}
function setupInputPersistence() {
    document.addEventListener('input', e => {
        const target = e.target;
        if (!target || !target.id) return;
        if (target.closest('.date-triple')) return;
        persistInput(target);
    }, true);
    document.addEventListener('change', e => {
        const target = e.target;
        if (!target || !target.id) return;
        if (target.closest('.date-triple')) return;
        persistInput(target);
    }, true);
}

// ============================================================
// TAB LAYOUT
// ============================================================
const TABS_LAYOUT_KEY = 'cx_tabs_layout';
function loadTabsLayout() {
    try {
        const raw = JSON.parse(localStorage.getItem(TABS_LAYOUT_KEY));
        if (raw && typeof raw === 'object') return raw;
    } catch (e) {}
    return {};
}
function saveTabsLayoutStore(obj) {
    try { localStorage.setItem(TABS_LAYOUT_KEY, JSON.stringify(obj)); } catch (e) {}
}
function getCategoryTabsLayout(categoryId) {
    const all = loadTabsLayout();
    return all[categoryId] || { order: [], hidden: [] };
}

let tabsSettingsCategory = null;
let tabsSettingsDraft = null;
let tabsDragSrcId = null;

function openTabsSettings() {
    if (!activeCategory) return;
    const cat = CATEGORIES[activeCategory];
    if (!cat) return;
    tabsSettingsCategory = activeCategory;
    const saved = getCategoryTabsLayout(activeCategory);
    const order = (saved.order && saved.order.length)
        ? saved.order.filter(id => cat.tabs.some(t => t.id === id))
        : cat.tabs.map(t => t.id);
    cat.tabs.forEach(t => { if (!order.includes(t.id)) order.push(t.id); });
    tabsSettingsDraft = {
        order: order,
        hidden: Array.isArray(saved.hidden) ? [...saved.hidden] : []
    };
    const modal = el('tabs-settings-modal');
    const title = el('tabs-settings-title');
    const desc = el('tabs-settings-desc');
    const resetBtn = el('tabs-settings-reset-btn');
    const saveBtn = el('tabs-settings-save-btn');
    const iconBox = el('tabs-settings-icon');
    if (title) title.textContent = safeT('tabs.settings.title');
    if (desc) desc.textContent = safeT('tabs.settings.desc');
    if (resetBtn) resetBtn.textContent = safeT('tabs.settings.reset');
    if (saveBtn) saveBtn.textContent = safeT('tabs.settings.save');
    if (iconBox) {
        iconBox.style.setProperty('--qt-accent', cat.accent);
        iconBox.innerHTML = icon('settings');
    }
    renderTabsSettingsList();
    renderAccentPalette();
    if (modal) modal.classList.add('show');
    document.body.classList.add('modal-open');
    vibrate(15);
    playTick(0, 1400, 0.06, 0.02);
}
function renderTabsSettingsList() {
    const list = el('tabs-settings-list');
    if (!list || !tabsSettingsCategory || !tabsSettingsDraft) return;
    const cat = CATEGORIES[tabsSettingsCategory];
    if (!cat) return;
    list.innerHTML = '';
    tabsSettingsDraft.order.forEach(tabId => {
        const tab = cat.tabs.find(t => t.id === tabId);
        if (!tab) return;
        const isHidden = tabsSettingsDraft.hidden.includes(tabId);
        const item = document.createElement('div');
        item.className = 'tabs-settings-item' + (isHidden ? ' hidden-tab' : '');
        item.dataset.tabId = tabId;
        item.draggable = true;
        item.style.setProperty('--qt-accent', cat.accent);
        item.addEventListener('dragstart', handleTabDragStart);
        item.addEventListener('dragover', handleTabDragOver);
        item.addEventListener('drop', handleTabDrop);
        item.addEventListener('dragend', handleTabDragEnd);
        item.innerHTML = `
            <span class="tabs-settings-handle">⋮⋮</span>
            <span class="tabs-settings-icon">${icon(tab.icon)}</span>
            <span class="tabs-settings-name">${escapeHtml(safeT('tab.' + tabsSettingsCategory + '.' + tab.id))}</span>
            <label class="tabs-settings-check" onclick="event.stopPropagation()">
                <input type="checkbox" ${isHidden ? '' : 'checked'} data-tab-id="${tabId}">
                <span class="toggle-slider"></span>
            </label>
        `;
        const checkbox = item.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', () => {
            const idx = tabsSettingsDraft.hidden.indexOf(tabId);
            if (checkbox.checked) {
                if (idx !== -1) tabsSettingsDraft.hidden.splice(idx, 1);
            } else {
                const visibleCount = tabsSettingsDraft.order.filter(id => !tabsSettingsDraft.hidden.includes(id)).length;
                if (visibleCount <= 1) {
                    checkbox.checked = true;
                    showToast(safeT('tabs.settings.error.minOne'), 'warning', 2000);
                    vibrate(30);
                    return;
                }
                if (idx === -1) tabsSettingsDraft.hidden.push(tabId);
            }
            item.classList.toggle('hidden-tab', !checkbox.checked);
            vibrate(10);
        });
        list.appendChild(item);
    });
}
function handleTabDragStart(e) {
    tabsDragSrcId = this.dataset.tabId;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', tabsDragSrcId); } catch (err) {}
}
function handleTabDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const target = e.currentTarget;
    if (!target || target.dataset.tabId === tabsDragSrcId) return;
    target.classList.add('drag-over');
}
function handleTabDrop(e) {
    e.preventDefault();
    const target = e.currentTarget;
    target.classList.remove('drag-over');
    const targetId = target.dataset.tabId;
    if (!tabsDragSrcId || targetId === tabsDragSrcId) return;
    const order = tabsSettingsDraft.order;
    const srcIdx = order.indexOf(tabsDragSrcId);
    const tgtIdx = order.indexOf(targetId);
    if (srcIdx === -1 || tgtIdx === -1) return;
    order.splice(srcIdx, 1);
    order.splice(tgtIdx, 0, tabsDragSrcId);
    renderTabsSettingsList();
    vibrate(10);
}
function handleTabDragEnd() {
    this.classList.remove('dragging');
    document.querySelectorAll('.tabs-settings-item.drag-over').forEach(el => el.classList.remove('drag-over'));
    tabsDragSrcId = null;
}
function saveTabsLayout() {
    if (!tabsSettingsCategory || !tabsSettingsDraft) return;
    const all = loadTabsLayout();
    all[tabsSettingsCategory] = {
        order: [...tabsSettingsDraft.order],
        hidden: [...tabsSettingsDraft.hidden]
    };
    saveTabsLayoutStore(all);
    closeModal('tabs-settings-modal');
    showToast(safeT('tabs.settings.saved'), 'success', 1800);
    vibrate(20);
    const catId = tabsSettingsCategory;
    tabsSettingsCategory = null;
    tabsSettingsDraft = null;
    if (activeCategory === catId) openCategoryBack(catId);
}
function resetTabsLayout() {
    if (!tabsSettingsCategory) return;
    const cat = CATEGORIES[tabsSettingsCategory];
    if (!cat) return;
    tabsSettingsDraft = {
        order: cat.tabs.map(t => t.id),
        hidden: []
    };
    renderTabsSettingsList();
    showToast(safeT('tabs.settings.reset.done'), 'info', 1800);
    vibrate(15);
}

// ============================================================
// ACCENT COLORS
// ============================================================
const ACCENT_COLORS_KEY = 'cx_accent_colors';
const ACCENT_PALETTE = [
    { id: 'crvena', color: '#f43f5e', nameSr: 'Crvena', nameEn: 'Red' },
    { id: 'narandzasta', color: '#f97316', nameSr: 'Narandžasta', nameEn: 'Orange' },
    { id: 'zuta', color: '#eab308', nameSr: 'Žuta', nameEn: 'Yellow' },
    { id: 'zelena', color: '#10b981', nameSr: 'Zelena', nameEn: 'Green' },
    { id: 'teal', color: '#14b8a6', nameSr: 'Teal', nameEn: 'Teal' },
    { id: 'plava', color: '#3b82f6', nameSr: 'Plava', nameEn: 'Blue' },
    { id: 'svetloplava', color: '#0ea5e9', nameSr: 'Svetlo plava', nameEn: 'Light blue' },
    { id: 'ljubicasta', color: '#a855f7', nameSr: 'Ljubičasta', nameEn: 'Purple' },
    { id: 'ruzicasta', color: '#ec4899', nameSr: 'Ružičasta', nameEn: 'Pink' },
    { id: 'siva', color: '#6b7280', nameSr: 'Siva', nameEn: 'Gray' },
    { id: 'tamnocrvena', color: '#dc2626', nameSr: 'Tamno crvena', nameEn: 'Dark red' },
    { id: 'tamnozelena', color: '#059669', nameSr: 'Tamno zelena', nameEn: 'Dark green' }
];
function loadAccentColors() {
    try {
        const raw = JSON.parse(localStorage.getItem(ACCENT_COLORS_KEY));
        if (raw && typeof raw === 'object') return raw;
    } catch (e) {}
    return {};
}
function saveAccentColors(obj) {
    try { localStorage.setItem(ACCENT_COLORS_KEY, JSON.stringify(obj)); } catch (e) {}
}
function getCategoryAccent(categoryId) {
    const custom = loadAccentColors();
    if (custom[categoryId]) return custom[categoryId];
    const cat = CATEGORIES[categoryId];
    return cat ? cat.accent : '#6366f1';
}
function setCategoryAccent(categoryId, color) {
    const all = loadAccentColors();
    all[categoryId] = color;
    saveAccentColors(all);
    try { renderQuickTools(); } catch (e) {}
}
function resetCategoryAccent(categoryId) {
    const all = loadAccentColors();
    delete all[categoryId];
    saveAccentColors(all);
    try { renderQuickTools(); } catch (e) {}
}
function renderAccentPalette() {
    const paletteBox = el('tabs-settings-palette');
    if (!paletteBox || !tabsSettingsCategory) return;
    const currentColor = getCategoryAccent(tabsSettingsCategory);
    const defaultColor = CATEGORIES[tabsSettingsCategory] ? CATEGORIES[tabsSettingsCategory].accent : '#6366f1';
    let html = '';
    ACCENT_PALETTE.forEach(p => {
        const isSelected = (p.color.toLowerCase() === currentColor.toLowerCase());
        const colorName = (currentLang === 'en') ? p.nameEn : p.nameSr;
        html += `
            <button type="button"
                    class="gps-color-swatch${isSelected ? ' selected' : ''}"
                    style="--swatch-color: ${p.color};"
                    title="${escapeHtml(colorName)}"
                    aria-label="${escapeHtml(colorName)}"
                    onclick="selectAccentColor('${p.color}')">
                ${isSelected ? '✓' : ''}
            </button>
        `;
    });
    paletteBox.innerHTML = html;
    const isCustom = (currentColor.toLowerCase() !== defaultColor.toLowerCase());
    const resetBtn = el('tabs-settings-color-reset');
    if (resetBtn) {
        resetBtn.style.display = isCustom ? 'inline-flex' : 'none';
        resetBtn.textContent = safeT('tabs.settings.color.reset');
    }
    const colorTitle = el('tabs-settings-color-title');
    if (colorTitle) colorTitle.textContent = safeT('tabs.settings.color.title');
}
function selectAccentColor(color) {
    if (!tabsSettingsCategory) return;
    setCategoryAccent(tabsSettingsCategory, color);
    renderAccentPalette();
    const modal = el('tabs-settings-modal');
    if (modal) modal.style.setProperty('--qt-accent', color);
    const iconBox = el('tabs-settings-icon');
    if (iconBox) iconBox.style.setProperty('--qt-accent', color);
    vibrate(10);
    playTick(0, 1400, 0.06, 0.02);
}
function resetAccentColor() {
    if (!tabsSettingsCategory) return;
    resetCategoryAccent(tabsSettingsCategory);
    renderAccentPalette();
    const cat = CATEGORIES[tabsSettingsCategory];
    if (cat) {
        const modal = el('tabs-settings-modal');
        if (modal) modal.style.setProperty('--qt-accent', cat.accent);
        const iconBox = el('tabs-settings-icon');
        if (iconBox) iconBox.style.setProperty('--qt-accent', cat.accent);
    }
    vibrate(15);
    showToast(safeT('tabs.settings.color.resetDone'), 'info', 1600);
}

// ============================================================
// O APLIKACIJI
// ============================================================
const APP_VERSION = '3.0';
const APP_DATE_SR = 'Oktobar 2026';
const APP_DATE_EN = 'October 2026';

function openAboutModal() {
    const modal = el('about-modal');
    if (!modal) return;
    const setText = (id, key) => { const e = el(id); if (e) e.textContent = safeT(key); };
    setText('about-modal-title', 'about.title');
    setText('about-what-title', 'about.whatTitle');
    setText('about-what-text', 'about.whatText');
    setText('about-thanks-title', 'about.thanksTitle');
    setText('about-thanks-text', 'about.thanksText');
    setText('about-author-title', 'about.authorTitle');
    setText('about-author-text', 'about.author');
    setText('about-github-text', 'about.github');
    setText('about-footer-text', 'about.footer');
    const desc = el('about-description'); if (desc) desc.textContent = safeT('about.description');
    const ver = el('about-version'); if (ver) ver.textContent = `v${APP_VERSION} • ${currentLang === 'en' ? APP_DATE_EN : APP_DATE_SR}`;
    modal.classList.add('show');
    document.body.classList.add('modal-open');
    vibrate(15);
    playTick(0, 1400, 0.06, 0.02);
}

// ============================================================
// BACK BUTTON / HISTORY
// ============================================================
function setupBackButton() {
    try { history.replaceState({ screen: 'home-screen', home: true }, '', ''); } catch (e) {}
    window.addEventListener('popstate', (e) => {
        const calcModal = el('calc-modal');
        const catModal = el('category-modal');
        const editorModal = el('editor-modal');
        const locationModal = el('location-modal');
        const aboutModal = el('about-modal');
        const reminderModal = el('reminder-modal');
        const tabsSettingsModal = el('tabs-settings-modal');
        const profileModal = el('profile-modal');
        const levelModal = el('level-modal');
        const stopwatchModal = el('toolbar-stopwatch-modal');
        const timerModal = el('toolbar-timer-modal');
        const speedometerModal = el('speedometer-modal');
        const allToolsModal = el('all-tools-modal');
        const receiptModal = el('receipt-modal');
        const receiptDetailsModal = el('receipt-details-modal');
        const imageViewerModal = el('image-viewer-modal');

        if (imageViewerModal && imageViewerModal.classList.contains('show')) {
            closeImageViewer(e);
            return;
        }
        if (receiptDetailsModal && receiptDetailsModal.classList.contains('show')) {
            receiptDetailsModal.classList.remove('show');
            document.body.classList.remove('modal-open');
            return;
        }
        if (receiptModal && receiptModal.classList.contains('show')) {
            receiptModal.classList.remove('show');
            document.body.classList.remove('modal-open');
            return;
        }

        const noviModali = ['fuel-history-modal','price-tracking-modal','cost-estimate-modal'];
        for (const id of noviModali) {
            const m = el(id);
            if (m && m.classList.contains('show')) { m.classList.remove('show'); return; }
        }

        if (allToolsModal && allToolsModal.classList.contains('show')) {
            if (allToolsViewState.openSubcats && Object.keys(allToolsViewState.openSubcats).some(k => allToolsViewState.openSubcats[k])) {
                allToolsViewState.activeMainCat = null;
                allToolsViewState.openSubcats = {};
                renderAllToolsSections();
                return;
            }
            allToolsModal.classList.remove('show');
            document.body.classList.remove('modal-open');
            vibrate(10);
            return;
        }

        if (profileModal && profileModal.classList.contains('show')) { profileModal.classList.remove('show'); return; }
        if (levelModal && levelModal.classList.contains('show')) {
            try { levelStop(); } catch (err) {}
            levelModal.classList.remove('show');
            return;
        }
        if (stopwatchModal && stopwatchModal.classList.contains('show')) { stopwatchModal.classList.remove('show'); return; }
        if (timerModal && timerModal.classList.contains('show')) { timerModal.classList.remove('show'); return; }
        if (speedometerModal && speedometerModal.classList.contains('show')) { speedometerModal.classList.remove('show'); return; }
        if (tabsSettingsModal && tabsSettingsModal.classList.contains('show')) {
            tabsSettingsModal.classList.remove('show');
            tabsSettingsCategory = null;
            tabsSettingsDraft = null;
            return;
        }
        if (reminderModal && reminderModal.classList.contains('show')) {
            reminderModal.classList.remove('show');
            document.body.classList.remove('modal-open');
            return;
        }
        if (aboutModal && aboutModal.classList.contains('show')) {
            aboutModal.classList.remove('show');
            return;
        }
        if (calcModal && calcModal.classList.contains('show')) {
            if (activeCategory) {
                setTimeout(() => openCategoryBack(activeCategory), 100);
                calcModal.classList.remove('show');
            }
            return;
        }
        if (catModal && catModal.classList.contains('show')) {
            catModal.classList.remove('show');
            activeCategory = null;
            activeTab = null;
            return;
        }
        if (editorModal && editorModal.classList.contains('show')) { editorModal.classList.remove('show'); return; }
        if (locationModal && locationModal.classList.contains('show')) { locationModal.classList.remove('show'); return; }

        const state = e.state;
        if (state && state.home) {
            if (currentScreenId !== 'home-screen') switchBottomNav('home-screen');
            try { history.pushState({ screen: 'home-screen', home: true }, '', ''); } catch (err) {}
            return;
        }
        if (currentScreenId !== 'home-screen') {
            switchBottomNav('home-screen');
            try { history.pushState({ screen: 'home-screen', home: true }, '', ''); } catch (err) {}
        }
    });
}

// ============================================================
// OSVEŽAVANJE STATIČNIH TEKSTOVA
// ============================================================
function refreshUIText() {
    try {
        const subtitle = el('app-subtitle'); if (subtitle) subtitle.textContent = safeT('app.subtitle');
        const searchInput = el('home-search'); if (searchInput) searchInput.placeholder = safeT('app.search.placeholder');
        const secQuick = el('sec-title-quick'); if (secQuick) secQuick.textContent = safeT('section.quickTools');
        const secMy = el('sec-title-my'); if (secMy) secMy.textContent = safeT('section.myTools');
        const btnEditQuick = el('btn-edit-quick'); if (btnEditQuick) btnEditQuick.textContent = safeT('section.edit');
        const favEmpty = el('favorites-empty'); if (favEmpty) favEmpty.innerHTML = safeT('section.favoritesEmpty');
        const footerTag = el('footer-tag'); if (footerTag) footerTag.textContent = safeT('app.footer');
        const settingsTitle = el('settings-title'); if (settingsTitle) settingsTitle.textContent = safeT('settings.title');
        const settingsThemeLabel = el('settings-theme-label'); if (settingsThemeLabel) settingsThemeLabel.textContent = safeT('settings.theme');
        const settingsThemeSub = el('settings-theme-sub'); if (settingsThemeSub) settingsThemeSub.textContent = safeT('settings.theme.desc');
        const settingsSoundLabel = el('settings-sound-label'); if (settingsSoundLabel) settingsSoundLabel.textContent = safeT('settings.sound');
        const settingsSoundSub = el('settings-sound-sub'); if (settingsSoundSub) settingsSoundSub.textContent = safeT('settings.sound.desc');
        const settingsHapticLabel = el('settings-haptic-label'); if (settingsHapticLabel) settingsHapticLabel.textContent = safeT('settings.haptic');
        const settingsHapticSub = el('settings-haptic-sub'); if (settingsHapticSub) settingsHapticSub.textContent = safeT('settings.haptic.desc');
        const settingsCurrencyLabel = el('settings-currency-label'); if (settingsCurrencyLabel) settingsCurrencyLabel.textContent = safeT('settings.currency');
        const settingsCurrencySub = el('settings-currency-sub'); if (settingsCurrencySub) settingsCurrencySub.textContent = safeT('settings.currency.desc');
        const settingsLanguageLabel = el('settings-language-label'); if (settingsLanguageLabel) settingsLanguageLabel.textContent = safeT('settings.language');
        const settingsLanguageSub = el('settings-language-sub'); if (settingsLanguageSub) settingsLanguageSub.textContent = safeT('settings.language.desc');
        const settingsOffline = el('settings-offline-text'); if (settingsOffline) settingsOffline.textContent = safeT('settings.offline');
        const aboutTitle = el('about-title'); if (aboutTitle) aboutTitle.textContent = safeT('about.title');
        const aboutSub = el('about-sub'); if (aboutSub) aboutSub.textContent = safeT('about.subtitle');
        const historyTitle = el('history-title'); if (historyTitle) historyTitle.textContent = safeT('history.title');
        const historySearch = el('history-search'); if (historySearch) historySearch.placeholder = safeT('history.search');
        const btnHistoryExport = el('btn-history-export'); if (btnHistoryExport) btnHistoryExport.textContent = safeT('history.export');
        const btnHistoryClear = el('btn-history-clear'); if (btnHistoryClear) btnHistoryClear.textContent = safeT('history.clear');
        const historyEmpty = el('history-empty'); if (historyEmpty) historyEmpty.textContent = safeT('history.empty');
        const historyNoResults = el('history-no-results'); if (historyNoResults) historyNoResults.textContent = safeT('history.noResults');
        const statsToggleBtn = el('stats-toggle-btn'); if (statsToggleBtn) { const panel = el('stats-panel'); const isOpen = panel && panel.style.display !== 'none'; statsToggleBtn.textContent = isOpen ? safeT('history.stats.hide') : safeT('history.stats.show'); }
        const langBtn = el('lang-toggle'); if (langBtn) langBtn.textContent = (typeof currentLang !== 'undefined' ? currentLang : 'sr').toUpperCase();
        const editorTitle = el('editor-title'); if (editorTitle) editorTitle.textContent = safeT('editor.title');
        const editorDesc = el('editor-desc'); if (editorDesc) editorDesc.textContent = safeT('editor.desc');
        const editorSaveBtn = el('editor-save-btn'); if (editorSaveBtn) editorSaveBtn.textContent = safeT('editor.save');
        const locationTitle = el('location-title'); if (locationTitle) locationTitle.textContent = safeT('weather.location.title');
        const locationSearchInput = el('location-search-input'); if (locationSearchInput) locationSearchInput.placeholder = safeT('weather.location.search');
        const locationGpsText = el('location-gps-text'); if (locationGpsText) locationGpsText.textContent = safeT('weather.location.gps');
        const favHintTitle = el('fav-hint-title'); if (favHintTitle) favHintTitle.textContent = safeT('fav.hint.title');
        const favHintText = el('fav-hint-text'); if (favHintText) favHintText.textContent = safeT('fav.hint.text');
        const favHintBtn = el('fav-hint-btn'); if (favHintBtn) favHintBtn.textContent = safeT('fav.hint.btn');
        const confirmTitle = el('confirm-title'); if (confirmTitle) confirmTitle.textContent = safeT('confirm.title');
        const confirmMsg = el('confirm-message'); if (confirmMsg) confirmMsg.textContent = safeT('confirm.title');
        const confirmCancelBtn = el('confirm-cancel-btn'); if (confirmCancelBtn) confirmCancelBtn.textContent = safeT('confirm.cancel');
        const confirmOkBtn = el('confirm-ok-btn'); if (confirmOkBtn) confirmOkBtn.textContent = safeT('confirm.ok');
        const settingsArchiveLabel = el('settings-archive-label'); if (settingsArchiveLabel) settingsArchiveLabel.textContent = safeT('settings.archive');
        const settingsArchiveSub = el('settings-archive-sub'); if (settingsArchiveSub) settingsArchiveSub.textContent = safeT('settings.archive.autoCleanup');
        const settingsArchiveBtn = el('settings-archive-btn'); if (settingsArchiveBtn) settingsArchiveBtn.textContent = getArchiveAutoCleanupSetting() ? safeT('settings.archive.autoCleanup.on') : safeT('settings.archive.autoCleanup.off');
        const colorTitle = el('tabs-settings-color-title'); if (colorTitle) colorTitle.textContent = safeT('tabs.settings.color.title');
        const colorReset = el('tabs-settings-color-reset'); if (colorReset) colorReset.textContent = safeT('tabs.settings.color.reset');

        const navHome = el('nav-label-home'); if (navHome) navHome.textContent = safeT('nav.home');
        const navMy = el('nav-label-my'); if (navMy) navMy.textContent = safeT('nav.myTools');
        const navToday = el('nav-label-today'); if (navToday) navToday.textContent = safeT('nav.today');
        const navHistory = el('nav-label-history'); if (navHistory) navHistory.textContent = safeT('nav.history');
        const navSettings = el('nav-label-settings'); if (navSettings) navSettings.textContent = safeT('nav.settings');

        const toolbarLevel = el('toolbar-level-label'); if (toolbarLevel) toolbarLevel.textContent = safeT('toolbar.level.title');
        const toolbarStopwatch = el('toolbar-stopwatch-label'); if (toolbarStopwatch) toolbarStopwatch.textContent = safeT('toolbar.stopwatch.title');
        const toolbarTimer = el('toolbar-timer-label'); if (toolbarTimer) toolbarTimer.textContent = safeT('toolbar.timer.title');
        const toolbarSpeedometer = el('toolbar-speedometer-label'); if (toolbarSpeedometer) toolbarSpeedometer.textContent = safeT('toolbar.speedometer.label');

        const todayTitle = el('today-title'); if (todayTitle) todayTitle.textContent = safeT('brziPregled.title');
        const todaySubtitle = el('today-subtitle'); if (todaySubtitle) todaySubtitle.textContent = safeT('brziPregled.subtitle');

        const mytoolsTitle = el('mytools-title'); if (mytoolsTitle) mytoolsTitle.textContent = safeT('nav.myTools');
        const mytoolsSubtitle = el('mytools-subtitle'); if (mytoolsSubtitle) mytoolsSubtitle.textContent = 'Tvoji omiljeni alati';

        const settingsProfileLabel = el('settings-profile-label'); if (settingsProfileLabel) settingsProfileLabel.textContent = safeT('settings.profile');
        const settingsProfileSub = el('settings-profile-sub'); if (settingsProfileSub) settingsProfileSub.textContent = safeT('settings.profile.desc');

        const allToolsBtnTitle = el('all-tools-btn-title'); if (allToolsBtnTitle) allToolsBtnTitle.textContent = safeT('allTools.button');
        const allToolsBtnSub = el('all-tools-btn-sub'); if (allToolsBtnSub) allToolsBtnSub.textContent = safeT('allTools.subtitle');
        const allToolsSearch = el('all-tools-search'); if (allToolsSearch) allToolsSearch.placeholder = safeT('allTools.search.placeholder');
        const allToolsTitle = el('all-tools-modal-title'); if (allToolsTitle) allToolsTitle.textContent = safeT('allTools.title');

        const speedometerTitle = el('speedometer-modal-title'); if (speedometerTitle) speedometerTitle.textContent = safeT('toolbar.speedometer.title');

        const splashTagline = el('splash-tagline'); if (splashTagline) splashTagline.textContent = safeT('app.subtitle');

        const receiptModalTitle = el('receipt-modal-title');
        if (receiptModalTitle && receiptState && receiptState.editingId) {
            receiptModalTitle.textContent = safeT('receipt.edit');
        } else if (receiptModalTitle) {
            receiptModalTitle.textContent = safeT('receipt.new');
        }
        const receiptDetailsTitle = el('receipt-details-title');
        if (receiptDetailsTitle) receiptDetailsTitle.textContent = safeT('receipt.details');
    } catch (e) { console.warn('refreshUIText greška:', e); }
}

// ============================================================
// INIT
// ============================================================
function initApp() {
    try { settings.archiveAutoCleanup = getArchiveAutoCleanupSetting(); } catch (e) {}

    try {
        const savedTheme = localStorage.getItem('cx_theme');
        if (savedTheme === 'light' || (!savedTheme && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches)) {
            document.documentElement.setAttribute('data-theme', 'light');
            const tt = el('theme-toggle');
            if (tt) tt.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>';
        }
    } catch (e) {}

    try { loadInputCache(); setupInputPersistence(); } catch (e) {}

    try {
        const savedCurrency = localStorage.getItem('cx_default_currency');
        const ac = el('auto-currency');
        if (savedCurrency && ac) ac.value = savedCurrency;
    } catch (e) {}

    try { refreshUIText(); } catch (e) { console.error('refreshUIText:', e); }
    try { renderQuickTools(); } catch (e) { console.error('renderQuickTools:', e); }
    try { renderFavorites(); } catch (e) { console.error('renderFavorites:', e); }
    try { updateSettingsUI(); } catch (e) {}
    try { updateProfileStatusLabel(); } catch (e) {}
    try { setupRipple(); } catch (e) {}
    try { setupBackButton(); } catch (e) {}
    try { if (typeof loadFxRates === 'function') loadFxRates(); } catch (e) {}
    try { restoreInputsFor(document); } catch (e) {}
    try { runArchiveAutoCleanup(); } catch (e) {}
    try { initToolbarIcons(); } catch (e) {}

    try {
        if (typeof initReceiptsDB === 'function') {
            initReceiptsDB().catch(err => console.warn('IndexedDB init failed:', err));
        }
    } catch (e) { console.warn('IndexedDB init error:', e); }

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js').then(reg => console.log('SW registered', reg.scope)).catch(err => console.warn('SW registration failed', err));
        });
    }

    setTimeout(() => { updateAppBadge(); }, 500);
    setTimeout(() => { maybeShowBadgeHint(); }, 1200);
    setInterval(updateAppBadge, 60 * 60 * 1000);

    setTimeout(() => {
        const splash = el('splash-screen');
        if (splash) { splash.classList.add('hide'); setTimeout(() => { if (splash.parentNode) splash.remove(); }, 400); }
    }, 500);

    if (typeof t === 'function') document.title = t('app.title');

    setTimeout(() => {
        document.querySelectorAll('.modal').forEach(m => {
            m.classList.remove('show');
        });
        document.body.classList.remove('modal-open');
    }, 100);
}

function initToolbarIcons() {
    const stopwatchIcon = document.querySelector('#toolbar-stopwatch-btn .toolbar-icon');
    if (stopwatchIcon) stopwatchIcon.innerHTML = icon('stopwatch');
    const timerIcon = document.querySelector('#toolbar-timer-btn .toolbar-icon');
    if (timerIcon) timerIcon.innerHTML = icon('timer');
    const levelBtnIcon = document.querySelector('#toolbar-level-btn .toolbar-icon');
    if (levelBtnIcon) levelBtnIcon.innerHTML = icon('level');
    const speedometerBtnIcon = document.querySelector('#toolbar-speedometer-btn .toolbar-icon');
    if (speedometerBtnIcon) speedometerBtnIcon.innerHTML = icon('speedometer');

    window.addEventListener('pagehide', () => {
        try { levelStop(); } catch (e) {}
        try { speedometerStop(); } catch (e) {}
    });
}

// ============================================================
// HASH ROUTING (za PWA shortcuts)
// ============================================================
function handleInitialHash() {
    const hash = (window.location.hash || '').replace('#', '').trim();
    if (!hash) return;
    setTimeout(() => {
        try { history.replaceState(null, '', window.location.pathname); } catch (e) {}
    }, 100);

    if (hash === 'today') {
        setTimeout(() => switchBottomNav('today-screen'), 300);
    } else if (hash === 'history') {
        setTimeout(() => switchBottomNav('history-screen'), 300);
    } else if (hash === 'settings') {
        setTimeout(() => switchBottomNav('settings-screen'), 300);
    } else if (hash === 'podsetnici') {
        setTimeout(() => openCategory('podsetnici'), 300);
    } else if (hash === 'money') {
        setTimeout(() => openCategory('money'), 300);
    } else if (hash === 'weather') {
        setTimeout(() => openCategory('weather'), 300);
    } else if (hash === 'health') {
        setTimeout(() => openCategory('health'), 300);
    } else if (hash === 'racuni') {
        setTimeout(() => openCategory('racuni'), 300);
    }
}

window.addEventListener('hashchange', handleInitialHash);
setTimeout(handleInitialHash, 500);

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
// ============================================================
// RENDER POMOĆNE
// ============================================================
function inputField(labelKey, id, unit = '', extra = '') {
    const unitHtml = unit ? `<span class="unit">${escapeHtml(unit)}</span>` : '';
    return `
        <div class="input-field">
            <label>${safeT(labelKey)}</label>
            <div class="input-wrapper">
                <input type="number" id="${id}" class="custom-input" placeholder="0" inputmode="decimal" ${extra}>
                ${unitHtml}
            </div>
        </div>
    `;
}
function inputFieldText(labelKey, id, placeholder = '') {
    return `
        <div class="input-field">
            <label>${safeT(labelKey)}</label>
            <div class="input-wrapper">
                <input type="text" id="${id}" class="custom-input" placeholder="${escapeHtml(placeholder)}">
            </div>
        </div>
    `;
}
function inputFieldWithSelect(labelKey, id, selectId, options, placeholder = '0') {
    const opts = options.map(o => `<option value="${o}">${o}</option>`).join('');
    return `
        <div class="input-field">
            <label>${safeT(labelKey)}</label>
            <div class="input-wrapper">
                <input type="number" id="${id}" class="custom-input" placeholder="${placeholder}" inputmode="decimal">
                <select id="${selectId}" class="custom-select-unit">${opts}</select>
            </div>
        </div>
    `;
}
function selectField(labelKey, id, options, selected = '') {
    const opts = options.map(o => {
        const val = typeof o === 'string' ? o : o.value;
        const text = typeof o === 'string' ? o : o.text;
        const sel = (val === selected) ? ' selected' : '';
        return `<option value="${val}"${sel}>${escapeHtml(text)}</option>`;
    }).join('');
    return `
        <div class="input-field">
            <label>${safeT(labelKey)}</label>
            <select id="${id}" class="custom-input">${opts}</select>
        </div>
    `;
}
function dateTripleField(labelKey, dateId) {
    return `
        <div class="input-field">
            <label>${safeT(labelKey)}</label>
            <div class="date-triple" data-date-id="${dateId}">
                <input type="number" class="date-part date-day" placeholder="DD" min="1" max="31" inputmode="numeric">
                <span class="date-sep">/</span>
                <input type="number" class="date-part date-month" placeholder="MM" min="1" max="12" inputmode="numeric">
                <span class="date-sep">/</span>
                <input type="number" class="date-part date-year" placeholder="GGGG" min="1900" max="2100" inputmode="numeric">
                <input type="hidden" id="${dateId}">
            </div>
        </div>
    `;
}
function calcButton(textKey, onclick) {
    return `<button class="calc-btn-main" onclick="${onclick}">${safeT(textKey)}</button>`;
}
function resultCard(boxId, iconName, labelKey, valueId, unit, category, historyLabel) {
    return `
        <div id="${boxId}" class="result-card-green" style="display: none;">
            <div class="res-left">
                <div class="pump-icon">${icon(iconName)}</div>
                <div>
                    <div class="res-label">${safeT(labelKey)}</div>
                    <h2><span id="${valueId}">0</span> <small>${escapeHtml(unit)}</small></h2>
                </div>
            </div>
            <div class="res-actions">
                <button class="copy-btn" onclick="copyResult('${valueId}', '${unit}', event)">${safeT('result.copy')}</button>
                <button class="copy-btn" data-category="${escapeHtml(category)}" data-label="${escapeHtml(historyLabel)}" onclick="saveHistory(this)">${safeT('result.save')}</button>
                <button class="copy-btn" data-category="${escapeHtml(category)}" data-label="${escapeHtml(historyLabel)}" onclick="shareResult(this)">${safeT('result.share')}</button>
            </div>
        </div>
    `;
}
function statsRow(boxId, items) {
    const html = items.map(it => `<div class="stat-item"><span class="stat-label">${safeT(it[0])}</span><strong id="${it[1]}">${escapeHtml(it[2] || '—')}</strong></div>`).join('');
    return `<div id="${boxId}" class="stats-row" style="display: none; margin-top: 12px;">${html}</div>`;
}
function sectionDescKey(key) { return `<p class="section-desc">${safeT(key)}</p>`; }

// ============================================================
// RACUNI — Postojeći tab "Moji računi" + NOVI Pregled + NOVI Analiza
// ============================================================
const RECEIPTS_DB_NAME = 'alatika_db';
const RECEIPTS_DB_VERSION = 1;
const RECEIPTS_STORE_NAME = 'receipt_images';
const RECEIPTS_STORAGE_KEY = 'cx_receipts';
let receiptsDBPromise = null;

function initReceiptsDB() {
    if (receiptsDBPromise) return receiptsDBPromise;
    if (!('indexedDB' in window)) {
        console.warn('IndexedDB nije podržan');
        return Promise.reject(new Error('IndexedDB not supported'));
    }
    receiptsDBPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open(RECEIPTS_DB_NAME, RECEIPTS_DB_VERSION);
        req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(RECEIPTS_STORE_NAME)) {
                db.createObjectStore(RECEIPTS_STORE_NAME, { keyPath: 'receiptId' });
            }
        };
        req.onsuccess = (e) => resolve(e.target.result);
        req.onerror = (e) => { console.warn('IndexedDB open error:', e.target.error); reject(e.target.error); };
    });
    return receiptsDBPromise;
}

async function saveReceiptImage(receiptId, file) {
    try {
        const db = await initReceiptsDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(RECEIPTS_STORE_NAME, 'readwrite');
            const store = tx.objectStore(RECEIPTS_STORE_NAME);
            const record = {
                receiptId: String(receiptId),
                blob: file,
                mimeType: file.type || 'image/jpeg',
                uploadedAt: Date.now()
            };
            const req = store.put(record);
            req.onsuccess = () => resolve(record);
            req.onerror = (e) => reject(e.target.error);
        });
    } catch (e) {
        console.warn('saveReceiptImage error:', e);
        throw e;
    }
}

async function loadReceiptImage(receiptId) {
    try {
        const db = await initReceiptsDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(RECEIPTS_STORE_NAME, 'readonly');
            const store = tx.objectStore(RECEIPTS_STORE_NAME);
            const req = store.get(String(receiptId));
            req.onsuccess = () => resolve(req.result || null);
            req.onerror = (e) => reject(e.target.error);
        });
    } catch (e) {
        console.warn('loadReceiptImage error:', e);
        return null;
    }
}

async function deleteReceiptImage(receiptId) {
    try {
        const db = await initReceiptsDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(RECEIPTS_STORE_NAME, 'readwrite');
            const store = tx.objectStore(RECEIPTS_STORE_NAME);
            const req = store.delete(String(receiptId));
            req.onsuccess = () => resolve();
            req.onerror = (e) => reject(e.target.error);
        });
    } catch (e) {
        console.warn('deleteReceiptImage error:', e);
    }
}

async function compressImage(file, maxWidth = 1600, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    let w = img.width, h = img.height;
                    if (w > maxWidth) { h = Math.round((maxWidth / w) * h); w = maxWidth; }
                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, w, h);
                    canvas.toBlob((blob) => {
                        if (!blob) { reject(new Error('Canvas toBlob failed')); return; }
                        resolve(blob);
                    }, 'image/jpeg', quality);
                } catch (err) { reject(err); }
            };
            img.onerror = () => reject(new Error('Image load failed'));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error('FileReader failed'));
        reader.readAsDataURL(file);
    });
}

function loadReceipts() {
    try {
        const raw = JSON.parse(localStorage.getItem(RECEIPTS_STORAGE_KEY));
        if (Array.isArray(raw)) return raw;
    } catch (e) {}
    return [];
}
function saveReceiptsList(list) {
    try { localStorage.setItem(RECEIPTS_STORAGE_KEY, JSON.stringify(list)); } catch (e) {}
}
function getReceiptById(id) {
    return loadReceipts().find(r => String(r.id) === String(id)) || null;
}
function calculateReceiptStats() {
    const list = loadReceipts();
    const total = list.length;
    const unpaid = list.filter(r => !r.paid).length;
    const thisMonth = new Date().toISOString().slice(0, 7);
    const thisMonthTotal = list
        .filter(r => r.period === thisMonth)
        .reduce((sum, r) => sum + (r.amount || 0), 0);
    return { total, unpaid, thisMonthTotal };
}
function formatPeriodMonth(periodIso) {
    if (!periodIso) return '';
    const parts = periodIso.split('-');
    if (parts.length !== 2) return periodIso;
    const months = ['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'];
    const monthIdx = parseInt(parts[1]) - 1;
    if (isNaN(monthIdx) || monthIdx < 0 || monthIdx > 11) return periodIso;
    return months[monthIdx] + ' ' + parts[0];
}
function daysBetweenToday(isoDate) {
    if (!isoDate) return null;
    const parts = isoDate.split('-').map(Number);
    if (parts.length !== 3) return null;
    const target = new Date(parts[0], parts[1] - 1, parts[2]);
    target.setHours(0, 0, 0, 0);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return Math.round((target - today) / 86400000);
}

// ---------- Sync: receipt ↔ cx_bills ----------
function syncReceiptToBill(receipt) {
    if (!receipt) return;
    let bills = loadReminders('cx_bills');
    const existingIdx = bills.findIndex(b => String(b.receiptId) === String(receipt.id));
    if (receipt.paid) {
        if (existingIdx !== -1) {
            bills.splice(existingIdx, 1);
            saveReminders('cx_bills', bills);
        }
        return;
    }
    const catLabel = safeT('receipt.category.' + (receipt.category || 'ostalo'));
    const periodLabel = formatPeriodMonth(receipt.period);
    const billName = catLabel + (periodLabel ? ' — ' + periodLabel : '');
    const dueParts = receipt.dueDate ? receipt.dueDate.split('-').map(Number) : null;
    const dayOfMonth = dueParts ? dueParts[2] : 1;
    const billData = {
        id: 'receipt_bill_' + receipt.id,
        receiptId: receipt.id,
        source: 'receipt',
        name: billName,
        amount: receipt.amount || 0,
        currency: receipt.currency || 'RSD',
        period: 'monthly',
        dayOfMonth,
        remindBefore: receipt.remindBefore || 3,
        paid: false
    };
    if (existingIdx !== -1) bills[existingIdx] = Object.assign({}, bills[existingIdx], billData);
    else bills.push(billData);
    saveReminders('cx_bills', bills);
}
function removeBillByReceiptId(receiptId) {
    let bills = loadReminders('cx_bills');
    const before = bills.length;
    bills = bills.filter(b => String(b.receiptId) !== String(receiptId));
    if (bills.length !== before) saveReminders('cx_bills', bills);
}

// ---------- STATE ----------
let receiptState = {
    editingId: null,
    draftImageBlob: null,
    draftCategory: 'struja',
    draftPaid: false,
    removeImage: false,
    currentObjectUrl: null
};
let receiptDetailsObjectUrl = null;

// ============================================================
// TAB 1: MOJI RACUNI (postojeći)
// ============================================================
function renderRacuni() {
    const list = loadReceipts();
    const stats = calculateReceiptStats();

    let html = '';

    html += `<div class="receipt-screen-header">
        <div>
            <div style="font-size:1.05rem;font-weight:900;color:var(--text-main);">${safeT('receipt.title')}</div>
            <div style="font-size:0.72rem;color:var(--text-secondary);font-weight:600;margin-top:2px;">${safeT('tab.racuni.moji')}</div>
        </div>
        <button class="receipt-add-btn" onclick="openReceiptModal()">
            📸 ${safeT('receipt.add')}
        </button>
    </div>`;

    html += `<div class="receipt-search-wrap">
        <input type="text" id="receipt-search" class="receipt-search" placeholder="${safeT('receipt.search')}" oninput="renderRacuniList()">
    </div>`;

    html += `<div class="receipt-stats">
        <div class="receipt-stat">
            <div class="receipt-stat-value">${stats.total}</div>
            <div class="receipt-stat-label">${safeT('receipt.stats.total')}</div>
        </div>
        <div class="receipt-stat">
            <div class="receipt-stat-value unpaid">${stats.unpaid}</div>
            <div class="receipt-stat-label">${safeT('receipt.stats.unpaid')}</div>
        </div>
        <div class="receipt-stat">
            <div class="receipt-stat-value month">${fmt(stats.thisMonthTotal, 0)}</div>
            <div class="receipt-stat-label">${safeT('receipt.stats.thisMonth')}</div>
        </div>
    </div>`;

    html += `<div id="receipt-list-container"></div>`;

    if (list.length > 0) html += renderReceiptTrend(list);

    setTimeout(() => { renderRacuniList(); }, 0);

    return html;
}

function renderRacuniList() {
    const container = el('receipt-list-container');
    if (!container) return;
    const list = loadReceipts();
    const query = (el('receipt-search') ? el('receipt-search').value : '').trim().toLowerCase();

    let filtered = list;
    if (query) {
        filtered = list.filter(r => {
            const catLabel = safeT('receipt.category.' + (r.category || 'ostalo')).toLowerCase();
            const note = (r.note || '').toLowerCase();
            const period = (r.period || '').toLowerCase();
            const amountStr = String(r.amount || '');
            return catLabel.includes(query) || note.includes(query) || period.includes(query) || amountStr.includes(query);
        });
    }

    const unpaid = filtered.filter(r => !r.paid).sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return b.createdAt - a.createdAt;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
    });
    const paid = filtered.filter(r => r.paid).sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt));

    let html = '';

    if (unpaid.length > 0) {
        html += `<div class="receipt-section-title" style="color:#f43f5e;">🔴 ${safeT('receipt.unpaid')}</div>`;
        html += `<div class="receipt-list">`;
        unpaid.forEach(r => { html += renderReceiptCard(r); });
        html += `</div>`;
    }

    if (paid.length > 0) {
        html += `<div class="receipt-section-title" style="color:#10b981;">✅ ${safeT('receipt.paid')}</div>`;
        html += `<div class="receipt-list">`;
        paid.forEach(r => { html += renderReceiptCard(r); });
        html += `</div>`;
    }

    if (filtered.length === 0) {
        html = `<div class="receipt-empty">
            <div class="receipt-empty-icon">📄</div>
            <div>${list.length === 0 ? safeT('receipt.noReceipts') : safeT('receipt.noReceiptsYet')}</div>
        </div>`;
    }

    container.innerHTML = html;

    setTimeout(() => loadReceiptThumbnails(), 50);
}

function renderReceiptCard(r) {
    const catLabel = safeT('receipt.category.' + (r.category || 'ostalo'));
    const periodLabel = formatPeriodMonth(r.period);
    const days = !r.paid && r.dueDate ? daysBetweenToday(r.dueDate) : null;

    let dueText = '';
    let dueClass = '';
    if (!r.paid && days !== null) {
        if (days < 0) { dueText = `${safeT('receipt.overdueBy')} ${Math.abs(days)} ${safeT('receipt.daysLeft')}`; dueClass = 'overdue'; }
        else if (days === 0) { dueText = safeT('brziPregled.today'); dueClass = 'soon'; }
        else if (days <= 3) { dueText = `${safeT('receipt.dueIn')} ${days} ${safeT('receipt.daysLeft')}`; dueClass = 'soon'; }
        else { dueText = `${safeT('receipt.dueIn')} ${days} ${safeT('receipt.daysLeft')}`; dueClass = 'ok'; }
    }

    const statusClass = r.paid ? 'paid' : (days !== null && days < 0 ? 'overdue' : 'unpaid');

    return `
        <div class="receipt-card ${statusClass}" data-receipt-id="${escapeHtml(r.id)}">
            <div class="receipt-thumb" data-thumb-id="${escapeHtml(r.id)}">
                <div class="receipt-thumb-empty">📄</div>
            </div>
            <div class="receipt-card-body">
                <div class="receipt-card-title">${escapeHtml(catLabel)}${periodLabel ? ' — ' + escapeHtml(periodLabel) : ''}</div>
                <div class="receipt-card-amount">${fmt(r.amount, 0)} ${r.currency || 'RSD'}</div>
                <div class="receipt-card-meta">
                    ${r.dueDate ? `<span>📅 ${escapeHtml(r.dueDate)}</span>` : ''}
                    ${r.paid && r.paidDate ? `<span>✅ ${escapeHtml(r.paidDate)}</span>` : ''}
                </div>
                ${dueText ? `<div class="receipt-card-due ${dueClass}">⚠ ${escapeHtml(dueText)}</div>` : ''}
            </div>
            <div class="receipt-card-actions" onclick="event.stopPropagation();">
                <button class="receipt-card-action primary" onclick="openReceiptDetails('${escapeHtml(r.id)}')">
                    ${safeT('receipt.details')}
                </button>
                ${!r.paid
                    ? `<button class="receipt-card-action" onclick="markReceiptPaid('${escapeHtml(r.id)}')">✅ ${safeT('receipt.markPaid')}</button>`
                    : `<button class="receipt-card-action" onclick="markReceiptUnpaid('${escapeHtml(r.id)}')">↩ ${safeT('receipt.markUnpaid')}</button>`}
                <button class="receipt-card-action danger" onclick="deleteReceipt('${escapeHtml(r.id)}')">🗑</button>
            </div>
        </div>
    `;
}

async function loadReceiptThumbnails() {
    const list = loadReceipts();
    for (const r of list) {
        if (!r.hasImage) continue;
        const thumb = document.querySelector(`[data-thumb-id="${r.id}"]`);
        if (!thumb || thumb.dataset.loaded === '1') continue;
        try {
            const rec = await loadReceiptImage(r.id);
            if (!rec || !rec.blob) continue;
            const url = URL.createObjectURL(rec.blob);
            thumb.innerHTML = `<img src="${url}" alt="" loading="lazy">`;
            thumb.dataset.loaded = '1';
        } catch (e) {}
    }
}

function renderReceiptTrend(list) {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
        months.push({ key, label: d.toLocaleDateString('sr-RS', { month: 'short' }), total: 0 });
    }
    list.forEach(r => {
        const m = months.find(x => x.key === r.period);
        if (m) m.total += r.amount || 0;
    });
    const maxTotal = Math.max(...months.map(m => m.total), 1);
    const avg = months.reduce((s, m) => s + m.total, 0) / months.length;
    const thisMonth = months[months.length - 1].total;
    const diffPct = avg > 0 ? ((thisMonth - avg) / avg) * 100 : 0;

    let barsHtml = '';
    months.forEach((m, i) => {
        const h = Math.max(4, (m.total / maxTotal) * 60);
        const isCurrent = i === months.length - 1;
        barsHtml += `<div class="receipt-trend-bar${isCurrent ? ' current' : ''}" style="height: ${h}px;" title="${m.label}: ${fmt(m.total, 0)} RSD"></div>`;
    });

    return `
        <div class="receipt-trend-card">
            <div class="receipt-trend-title">📈 ${safeT('receipt.trend')}</div>
            <div class="receipt-trend-chart">${barsHtml}</div>
            <div class="receipt-trend-labels">
                ${months.map(m => `<span>${m.label}</span>`).join('')}
            </div>
            <div class="receipt-trend-stats">
                <span>${safeT('receipt.average')}: <strong>${fmt(avg, 0)} RSD</strong></span>
                <span>${safeT('receipt.thisMonthTotal')}: <strong>${fmt(thisMonth, 0)} RSD</strong> ${diffPct !== 0 ? `<span style="color:${diffPct > 0 ? '#f43f5e' : '#10b981'};">${diffPct > 0 ? '+' : ''}${fmt(diffPct, 1)}%</span>` : ''}</span>
            </div>
        </div>
    `;
}

// ============================================================
// TAB 2: PREGLED PO KATEGORIJAMA (NOVO)
// ============================================================
let racuniPregledFilter = {
    category: 'all',
    status: 'all',
    period: 'all'
};

function renderRacuniPregled() {
    const list = loadReceipts();

    let html = '';

    // Smart summary panel
    html += renderRacuniPregledSummary(list);

    // Filter bar
    html += renderRacuniPregledFilters(list);

    // Category cards
    html += `<div id="racuni-pregled-categories"></div>`;

    // Upcoming reminders
    html += renderRacuniPregledUpcoming(list);

    setTimeout(() => { renderRacuniPregledList(); }, 0);

    return html;
}

function renderRacuniPregledSummary(list) {
    const now = new Date();
    const thisMonth = now.toISOString().slice(0, 7);
    const thisMonthList = list.filter(r => r.period === thisMonth);
    const totalMonth = thisMonthList.reduce((s, r) => s + (r.amount || 0), 0);
    const paidMonth = thisMonthList.filter(r => r.paid).reduce((s, r) => s + (r.amount || 0), 0);
    const unpaidMonth = thisMonthList.filter(r => !r.paid).reduce((s, r) => s + (r.amount || 0), 0);
    const unpaidCount = thisMonthList.filter(r => !r.paid).length;

    // Smart insight
    let insight = '';
    if (unpaidCount > 0) {
        insight = `Imaš ${unpaidCount} ${unpaidCount === 1 ? 'neplaćen' : 'neplaćenih'} ${unpaidCount === 1 ? 'račun' : 'računa'} za ${formatPeriodMonth(thisMonth)} — ukupno ${fmt(unpaidMonth, 0)} RSD.`;
    } else if (thisMonthList.length > 0) {
        insight = `Svi računi za ${formatPeriodMonth(thisMonth)} su plaćeni. Bravo! 🎉`;
    } else {
        insight = `Još nema računa za ${formatPeriodMonth(thisMonth)}.`;
    }

    return `
        <div class="racuni-pregled-summary">
            <div class="racuni-pregled-summary-title">📊 ${formatPeriodMonth(thisMonth)}</div>
            <div class="racuni-pregled-summary-grid">
                <div class="racuni-pregled-summary-item">
                    <div class="racuni-pregled-summary-value">${fmt(totalMonth, 0)}</div>
                    <div class="racuni-pregled-summary-label">Ukupno</div>
                </div>
                <div class="racuni-pregled-summary-item">
                    <div class="racuni-pregled-summary-value paid">${fmt(paidMonth, 0)}</div>
                    <div class="racuni-pregled-summary-label">Plaćeno</div>
                </div>
                <div class="racuni-pregled-summary-item">
                    <div class="racuni-pregled-summary-value unpaid">${fmt(unpaidMonth, 0)}</div>
                    <div class="racuni-pregled-summary-label">Neplaćeno</div>
                </div>
            </div>
            <div class="racuni-pregled-insight">💡 ${insight}</div>
        </div>
    `;
}

function renderRacuniPregledFilters(list) {
    const categories = ['all', 'struja', 'voda', 'komunalije', 'grejanje', 'porez', 'internet', 'telefon', 'info', 'kirija', 'ostalo'];
    const periods = ['all'];
    const seenPeriods = new Set();
    list.forEach(r => { if (r.period) seenPeriods.add(r.period); });
    const sortedPeriods = Array.from(seenPeriods).sort().reverse();
    periods.push(...sortedPeriods);

    let catOptions = `<option value="all">Sve kategorije</option>`;
    categories.slice(1).forEach(c => {
        const sel = racuniPregledFilter.category === c ? ' selected' : '';
        catOptions += `<option value="${c}"${sel}>${safeT('receipt.category.' + c)}</option>`;
    });

    let periodOptions = `<option value="all">Svi meseci</option>`;
    sortedPeriods.forEach(p => {
        const sel = racuniPregledFilter.period === p ? ' selected' : '';
        periodOptions += `<option value="${p}"${sel}>${formatPeriodMonth(p)}</option>`;
    });

    return `
        <div class="racuni-pregled-filters">
            <select id="rp-filter-category" class="racuni-pregled-filter" onchange="onRacuniPregledFilterChange()">${catOptions}</select>
            <select id="rp-filter-period" class="racuni-pregled-filter" onchange="onRacuniPregledFilterChange()">${periodOptions}</select>
            <select id="rp-filter-status" class="racuni-pregled-filter" onchange="onRacuniPregledFilterChange()">
                <option value="all"${racuniPregledFilter.status === 'all' ? ' selected' : ''}>Svi statusi</option>
                <option value="unpaid"${racuniPregledFilter.status === 'unpaid' ? ' selected' : ''}>Neplaćeno</option>
                <option value="paid"${racuniPregledFilter.status === 'paid' ? ' selected' : ''}>Plaćeno</option>
            </select>
        </div>
    `;
}

function onRacuniPregledFilterChange() {
    racuniPregledFilter.category = el('rp-filter-category') ? el('rp-filter-category').value : 'all';
    racuniPregledFilter.period = el('rp-filter-period') ? el('rp-filter-period').value : 'all';
    racuniPregledFilter.status = el('rp-filter-status') ? el('rp-filter-status').value : 'all';
    renderRacuniPregledList();
    vibrate(8);
}

function renderRacuniPregledList() {
    const container = el('racuni-pregled-categories');
    if (!container) return;
    const list = loadReceipts();

    let filtered = list;
    if (racuniPregledFilter.category !== 'all') filtered = filtered.filter(r => r.category === racuniPregledFilter.category);
    if (racuniPregledFilter.period !== 'all') filtered = filtered.filter(r => r.period === racuniPregledFilter.period);
    if (racuniPregledFilter.status === 'unpaid') filtered = filtered.filter(r => !r.paid);
    if (racuniPregledFilter.status === 'paid') filtered = filtered.filter(r => r.paid);

    if (filtered.length === 0) {
        container.innerHTML = `<div class="receipt-empty" style="margin-top: 16px;"><div class="receipt-empty-icon">🔍</div><div>Nema računa za izabrane filtere.</div></div>`;
        return;
    }

    // Group by category
    const byCat = {};
    filtered.forEach(r => {
        const cat = r.category || 'ostalo';
        if (!byCat[cat]) byCat[cat] = { total: 0, count: 0, unpaid: 0, paid: 0 };
        byCat[cat].total += r.amount || 0;
        byCat[cat].count++;
        if (r.paid) byCat[cat].paid += r.amount || 0;
        else byCat[cat].unpaid += r.amount || 0;
    });

    const sortedCats = Object.keys(byCat).sort((a, b) => byCat[b].total - byCat[a].total);
    const maxTotal = Math.max(...sortedCats.map(c => byCat[c].total), 1);

    let html = `<div class="racuni-pregled-cats-list">`;
    sortedCats.forEach(cat => {
        const data = byCat[cat];
        const catLabel = safeT('receipt.category.' + cat);
        const progress = data.total > 0 ? (data.paid / data.total) * 100 : 0;
        const barWidth = (data.total / maxTotal) * 100;
        const color = getReceiptCategoryColor(cat);

        html += `
            <div class="racuni-pregled-cat-card" style="--cat-color: ${color};">
                <div class="racuni-pregled-cat-header">
                    <div class="racuni-pregled-cat-icon">${icon(getReceiptCategoryIcon(cat))}</div>
                    <div class="racuni-pregled-cat-name">${escapeHtml(catLabel)}</div>
                    <div class="racuni-pregled-cat-count">${data.count}×</div>
                </div>
                <div class="racuni-pregled-cat-amount">${fmt(data.total, 0)} RSD</div>
                <div class="racuni-pregled-cat-bar-wrap">
                    <div class="racuni-pregled-cat-bar" style="width: ${barWidth}%;"></div>
                </div>
                <div class="racuni-pregled-cat-status">
                    <span style="color: #10b981;">✅ ${fmt(data.paid, 0)}</span>
                    ${data.unpaid > 0 ? `<span style="color: #f43f5e;">⚠ ${fmt(data.unpaid, 0)}</span>` : ''}
                </div>
                ${data.total > 0 ? `<div class="racuni-pregled-cat-progress"><div class="racuni-pregled-cat-progress-fill" style="width: ${progress}%;"></div></div>` : ''}
            </div>
        `;
    });
    html += `</div>`;

    container.innerHTML = html;
}

function renderRacuniPregledUpcoming(list) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const upcoming = list.filter(r => !r.paid && r.dueDate).map(r => {
        const days = daysBetweenToday(r.dueDate);
        return { ...r, days };
    }).filter(r => r.days !== null && r.days >= 0 && r.days <= 7).sort((a, b) => a.days - b.days);

    if (upcoming.length === 0) return '';

    let html = `
        <div class="racuni-pregled-upcoming">
            <div class="racuni-pregled-upcoming-title">⏰ Dospeva u narednih 7 dana</div>
            <div class="racuni-pregled-upcoming-list">
    `;
    upcoming.forEach(r => {
        const catLabel = safeT('receipt.category.' + (r.category || 'ostalo'));
        const dayText = r.days === 0 ? 'Danas' : r.days === 1 ? 'Sutra' : `${r.days} d.`;
        const dayClass = r.days === 0 ? 'today' : r.days <= 2 ? 'soon' : 'ok';
        html += `
            <div class="racuni-pregled-upcoming-item">
                <div class="racuni-pregled-upcoming-info">
                    <div class="racuni-pregled-upcoming-name">${escapeHtml(catLabel)}</div>
                    <div class="racuni-pregled-upcoming-meta">${escapeHtml(r.dueDate)} • ${fmt(r.amount, 0)} RSD</div>
                </div>
                <div class="racuni-pregled-upcoming-days ${dayClass}">${dayText}</div>
                <button class="racuni-pregled-upcoming-btn" onclick="markReceiptPaid('${escapeHtml(r.id)}'); renderRacuniPregledRefresh();">✅</button>
            </div>
        `;
    });
    html += `</div></div>`;
    return html;
}

function renderRacuniPregledRefresh() {
    const body = el('calc-body');
    if (body && activeTab === 'pregled' && activeCategory === 'racuni') {
        body.innerHTML = renderRacuniPregled();
    }
}

function getReceiptCategoryColor(cat) {
    const colors = {
        struja: '#eab308',
        voda: '#0ea5e9',
        komunalije: '#8b5cf6',
        grejanje: '#f97316',
        porez: '#dc2626',
        internet: '#06b6d4',
        telefon: '#14b8a6',
        info: '#6366f1',
        kirija: '#ec4899',
        ostalo: '#6b7280'
    };
    return colors[cat] || '#6b7280';
}

function getReceiptCategoryIcon(cat) {
    const icons = {
        struja: 'zap',
        voda: 'droplet',
        komunalije: 'building',
        grejanje: 'flame',
        porez: 'receipt',
        internet: 'globe',
        telefon: 'bell',
        info: 'info',
        kirija: 'home',
        ostalo: 'fileText'
    };
    return icons[cat] || 'fileText';
}

// ============================================================
// TAB 3: ANALIZA (NOVO)
// ============================================================
function renderRacuniAnaliza() {
    const list = loadReceipts();

    let html = '';

    // Top summary
    html += renderRacuniAnalizaTopSummary(list);

    // Bar chart — last 6 months
    html += renderRacuniAnalizaMonthlyChart(list);

    // Comparison with previous month
    html += renderRacuniAnalizaComparison(list);

    // Top spenders
    html += renderRacuniAnalizaTopSpenders(list);

    // Prediction
    html += renderRacuniAnalizaPrediction(list);

    // Smart advice
    html += renderRacuniAnalizaAdvice(list);

    setTimeout(() => { renderRacuniAnalizaAll(); }, 0);

    return html;
}

function renderRacuniAnalizaAll() {
    // Helper koji poziva refresh svih dinamičkih delova
    const list = loadReceipts();
    const monthlyEl = el('racuni-analiza-monthly-chart');
    if (monthlyEl) {
        const now = new Date();
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
            months.push({ key, label: d.toLocaleDateString('sr-RS', { month: 'short' }), total: 0 });
        }
        list.forEach(r => {
            const m = months.find(x => x.key === r.period);
            if (m) m.total += r.amount || 0;
        });
        const maxTotal = Math.max(...months.map(m => m.total), 1);
        let barsHtml = '';
        months.forEach((m, i) => {
            const h = Math.max(8, (m.total / maxTotal) * 100);
            const isCurrent = i === months.length - 1;
            barsHtml += `<div class="racuni-analiza-bar-wrap"><div class="racuni-analiza-bar${isCurrent ? ' current' : ''}" style="height: ${h}%;" title="${m.label}: ${fmt(m.total, 0)} RSD"></div></div>`;
        });
        monthlyEl.innerHTML = barsHtml;
    }
}

function renderRacuniAnalizaTopSummary(list) {
    const allTime = list.reduce((s, r) => s + (r.amount || 0), 0);
    const paid = list.filter(r => r.paid).reduce((s, r) => s + (r.amount || 0), 0);
    const unpaid = list.filter(r => !r.paid).reduce((s, r) => s + (r.amount || 0), 0);

    const periodSet = new Set(list.map(r => r.period).filter(Boolean));
    const months = periodSet.size || 1;
    const avgMonth = allTime / months;

    return `
        <div class="racuni-analiza-summary">
            <div class="racuni-analiza-summary-item">
                <div class="racuni-analiza-summary-value">${fmt(allTime, 0)}</div>
                <div class="racuni-analiza-summary-label">Ukupno (sve vreme)</div>
            </div>
            <div class="racuni-analiza-summary-item">
                <div class="racuni-analiza-summary-value paid">${fmt(paid, 0)}</div>
                <div class="racuni-analiza-summary-label">Plaćeno</div>
            </div>
            <div class="racuni-analiza-summary-item">
                <div class="racuni-analiza-summary-value unpaid">${fmt(unpaid, 0)}</div>
                <div class="racuni-analiza-summary-label">Neplaćeno</div>
            </div>
            <div class="racuni-analiza-summary-item">
                <div class="racuni-analiza-summary-value">${fmt(avgMonth, 0)}</div>
                <div class="racuni-analiza-summary-label">Prosečno/mesec</div>
            </div>
        </div>
    `;
}

function renderRacuniAnalizaMonthlyChart(list) {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
        months.push({ key, label: d.toLocaleDateString('sr-RS', { month: 'short' }), total: 0 });
    }
    list.forEach(r => {
        const m = months.find(x => x.key === r.period);
        if (m) m.total += r.amount || 0;
    });
    const maxTotal = Math.max(...months.map(m => m.total), 1);

    let barsHtml = '';
    months.forEach((m, i) => {
        const h = Math.max(8, (m.total / maxTotal) * 100);
        const isCurrent = i === months.length - 1;
        barsHtml += `<div class="racuni-analiza-bar-wrap"><div class="racuni-analiza-bar${isCurrent ? ' current' : ''}" style="height: ${h}%;" title="${m.label}: ${fmt(m.total, 0)} RSD"></div></div>`;
    });

    return `
        <div class="racuni-analiza-chart-card">
            <div class="racuni-analiza-chart-title">📈 Troškovi po mesecima</div>
            <div class="racuni-analiza-chart" id="racuni-analiza-monthly-chart">${barsHtml}</div>
            <div class="racuni-analiza-chart-labels">
                ${months.map(m => `<span>${m.label}</span>`).join('')}
            </div>
        </div>
    `;
}

function renderRacuniAnalizaComparison(list) {
    const now = new Date();
    const thisMonth = now.toISOString().slice(0, 7);
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = lastMonthDate.toISOString().slice(0, 7);

    const thisTotal = list.filter(r => r.period === thisMonth).reduce((s, r) => s + (r.amount || 0), 0);
    const lastTotal = list.filter(r => r.period === lastMonth).reduce((s, r) => s + (r.amount || 0), 0);

    if (lastTotal === 0 && thisTotal === 0) return '';

    const diff = thisTotal - lastTotal;
    const diffPct = lastTotal > 0 ? (diff / lastTotal) * 100 : 0;
    const color = diff > 0 ? '#f43f5e' : diff < 0 ? '#10b981' : '#6b7280';
    const arrow = diff > 0 ? '↑' : diff < 0 ? '↓' : '→';

    return `
        <div class="racuni-analiza-comparison-card" style="--diff-color: ${color};">
            <div class="racuni-analiza-comparison-title">📊 Poređenje sa prošlim mesecom</div>
            <div class="racuni-analiza-comparison-grid">
                <div class="racuni-analiza-comparison-item">
                    <div class="racuni-analiza-comparison-label">${formatPeriodMonth(lastMonth)}</div>
                    <div class="racuni-analiza-comparison-value">${fmt(lastTotal, 0)} RSD</div>
                </div>
                <div class="racuni-analiza-comparison-arrow" style="color: ${color};">${arrow}</div>
                <div class="racuni-analiza-comparison-item">
                    <div class="racuni-analiza-comparison-label">${formatPeriodMonth(thisMonth)}</div>
                    <div class="racuni-analiza-comparison-value">${fmt(thisTotal, 0)} RSD</div>
                </div>
            </div>
            <div class="racuni-analiza-comparison-diff" style="color: ${color};">
                ${diff > 0 ? '+' : ''}${fmt(diff, 0)} RSD (${diff > 0 ? '+' : ''}${fmt(diffPct, 1)}%)
            </div>
        </div>
    `;
}

function renderRacuniAnalizaTopSpenders(list) {
    if (list.length === 0) return '';
    const byCat = {};
    list.forEach(r => {
        const cat = r.category || 'ostalo';
        if (!byCat[cat]) byCat[cat] = 0;
        byCat[cat] += r.amount || 0;
    });
    const sorted = Object.keys(byCat).sort((a, b) => byCat[b] - byCat[a]).slice(0, 3);
    if (sorted.length === 0) return '';

    let html = `
        <div class="racuni-analiza-topspenders">
            <div class="racuni-analiza-topspenders-title">🏆 Top 3 kategorije (sve vreme)</div>
            <div class="racuni-analiza-topspenders-list">
    `;
    sorted.forEach((cat, idx) => {
        const catLabel = safeT('receipt.category.' + cat);
        const color = getReceiptCategoryColor(cat);
        const medal = ['🥇', '🥈', '🥉'][idx];
        html += `
            <div class="racuni-analiza-topspenders-item" style="--cat-color: ${color};">
                <div class="racuni-analiza-topspenders-medal">${medal}</div>
                <div class="racuni-analiza-topspenders-name">${escapeHtml(catLabel)}</div>
                <div class="racuni-analiza-topspenders-value">${fmt(byCat[cat], 0)} RSD</div>
            </div>
        `;
    });
    html += `</div></div>`;
    return html;
}

function renderRacuniAnalizaPrediction(list) {
    const now = new Date();
    const last3 = [];
    for (let i = 1; i <= 3; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        last3.push(d.toISOString().slice(0, 7));
    }
    const totals = last3.map(p => list.filter(r => r.period === p).reduce((s, r) => s + (r.amount || 0), 0));
    const validTotals = totals.filter(t => t > 0);
    if (validTotals.length === 0) return '';
    const avg = validTotals.reduce((s, t) => s + t, 0) / validTotals.length;
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().slice(0, 7);

    return `
        <div class="racuni-analiza-prediction">
            <div class="racuni-analiza-prediction-title">🔮 Predikcija za ${formatPeriodMonth(nextMonth)}</div>
            <div class="racuni-analiza-prediction-value">${fmt(avg, 0)} RSD</div>
            <div class="racuni-analiza-prediction-sub">Na osnovu proseka poslednjih ${validTotals.length} ${validTotals.length === 1 ? 'meseca' : 'meseci'}</div>
        </div>
    `;
}

function renderRacuniAnalizaAdvice(list) {
    const now = new Date();
    const thisMonth = now.toISOString().slice(0, 7);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 7);

    const byCatThis = {};
    const byCatLast = {};
    list.forEach(r => {
        if (r.period === thisMonth) byCatThis[r.category] = (byCatThis[r.category] || 0) + (r.amount || 0);
        if (r.period === lastMonth) byCatLast[r.category] = (byCatLast[r.category] || 0) + (r.amount || 0);
    });

    const warnings = [];
    Object.keys(byCatThis).forEach(cat => {
        const cur = byCatThis[cat];
        const prev = byCatLast[cat] || 0;
        if (prev > 0) {
            const pct = ((cur - prev) / prev) * 100;
            if (pct > 20) warnings.push({ cat, pct });
        }
    });

    if (warnings.length === 0) {
        return `
            <div class="racuni-analiza-advice racuni-analiza-advice-ok">
                <div class="racuni-analiza-advice-icon">✅</div>
                <div class="racuni-analiza-advice-text">Sve je pod kontrolom — nema značajnih porasta troškova.</div>
            </div>
        `;
    }

    warnings.sort((a, b) => b.pct - a.pct);
    const top = warnings[0];
    const catLabel = safeT('receipt.category.' + top.cat);

    return `
        <div class="racuni-analiza-advice racuni-analiza-advice-warning">
            <div class="racuni-analiza-advice-icon">⚠️</div>
            <div class="racuni-analiza-advice-text">
                <strong>${escapeHtml(catLabel)}</strong> ti je porasla <strong>+${fmt(top.pct, 0)}%</strong> u odnosu na prošli mesec. Proveri potrošnju.
            </div>
        </div>
    `;
}

// ============================================================
// FORMA — MODAL
// ============================================================
function openReceiptModal(receiptId = null) {
    const modal = el('receipt-modal');
    const body = el('receipt-modal-body');
    const titleEl = el('receipt-modal-title');
    if (!modal || !body) return;

    const isEdit = !!receiptId;
    const r = isEdit ? getReceiptById(receiptId) : null;

    receiptState.editingId = isEdit ? receiptId : null;
    receiptState.draftImageBlob = null;
    receiptState.draftCategory = r ? r.category : 'struja';
    receiptState.draftPaid = r ? !!r.paid : false;
    receiptState.removeImage = false;
    receiptState.currentObjectUrl = null;

    if (titleEl) titleEl.textContent = isEdit ? safeT('receipt.edit') : safeT('receipt.new');

    body.innerHTML = buildReceiptForm(r);
    modal.classList.add('show');
    document.body.classList.add('modal-open');
    vibrate(15);
    playTick(0, 1400, 0.06, 0.02);

    if (isEdit && r && r.hasImage) {
        (async () => {
            try {
                const rec = await loadReceiptImage(receiptId);
                if (rec && rec.blob) {
                    const url = URL.createObjectURL(rec.blob);
                    receiptState.currentObjectUrl = url;
                    const prev = el('receipt-preview-wrap');
                    const empty = el('receipt-upload-area');
                    if (prev) {
                        prev.style.display = 'block';
                        const img = el('receipt-preview-img');
                        if (img) img.src = url;
                        if (empty) empty.style.display = 'none';
                    }
                }
            } catch (e) {}
        })();
    }
}

function buildReceiptForm(r) {
    const isEdit = !!r;
    const now = new Date();
    const defaultPeriod = r ? r.period : now.toISOString().slice(0, 7);
    const defaultDueDate = r && r.dueDate ? r.dueDate : '';

    const categories = ['struja','voda','komunalije','grejanje','porez','internet','telefon','info','kirija','ostalo'];
    let chipsHtml = '';
    categories.forEach(cat => {
        const sel = (receiptState.draftCategory === cat) ? ' selected' : '';
        chipsHtml += `<button type="button" class="receipt-chip${sel}" data-cat="${cat}" onclick="selectReceiptCategory('${cat}', this)">${safeT('receipt.category.' + cat)}</button>`;
    });

    const paidSel = receiptState.draftPaid ? ' selected' : '';
    const unpaidSel = receiptState.draftPaid ? '' : ' selected';

    const months = ['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'];
    const periodParts = (defaultPeriod || '').split('-');
    const curMonth = periodParts[1] ? parseInt(periodParts[1]) : (now.getMonth() + 1);
    const curYear = periodParts[0] ? parseInt(periodParts[0]) : now.getFullYear();
    let monthOptions = '';
    months.forEach((m, i) => {
        const v = i + 1;
        const sel = (v === curMonth) ? ' selected' : '';
        monthOptions += `<option value="${v}"${sel}>${m}</option>`;
    });
    let yearOptions = '';
    for (let y = now.getFullYear() - 2; y <= now.getFullYear() + 1; y++) {
        const sel = (y === curYear) ? ' selected' : '';
        yearOptions += `<option value="${y}"${sel}>${y}</option>`;
    }

    return `
        <div class="receipt-form-step">
            <div class="receipt-step-title">${safeT('receipt.uploadStep')}</div>
            <div id="receipt-upload-area" class="receipt-upload-area" onclick="document.getElementById('receipt-file-input').click()">
                <div class="receipt-upload-icon">📷</div>
                <div class="receipt-upload-text">${safeT('receipt.uploadPhoto')} / ${safeT('receipt.uploadGallery')}</div>
                <div class="receipt-upload-hint">${safeT('receipt.uploadHint')}</div>
                <input type="file" id="receipt-file-input" accept="image/*" capture="environment" style="display:none;" onchange="handleReceiptImageUpload(event)">
            </div>
            <div id="receipt-preview-wrap" class="receipt-preview-wrap" style="display:none;">
                <img id="receipt-preview-img" class="receipt-preview-img" alt="">
                <button type="button" class="receipt-preview-remove" onclick="removeReceiptImagePreview()">✕</button>
            </div>
        </div>

        <div class="receipt-form-step">
            <div class="receipt-step-title">${safeT('receipt.dataStep')}</div>
            <div class="input-field">
                <label>${safeT('receipt.category')}</label>
                <div class="receipt-category-chips" id="receipt-category-chips">${chipsHtml}</div>
            </div>
            <div class="input-field">
                <label>${safeT('receipt.amount')}</label>
                <div class="input-wrapper">
                    <input type="number" id="receipt-amount" class="custom-input" placeholder="3500" inputmode="decimal" value="${r ? r.amount : ''}">
                    <span class="unit">RSD</span>
                </div>
            </div>
            <div class="input-field">
                <label>${safeT('receipt.period')}</label>
                <div class="receipt-period-selects">
                    <select id="receipt-period-month">${monthOptions}</select>
                    <select id="receipt-period-year">${yearOptions}</select>
                </div>
            </div>
            <div class="input-field">
                <label>${safeT('receipt.status')}</label>
                <div class="receipt-status-row">
                    <button type="button" class="receipt-status-btn paid${paidSel}" data-paid="1" onclick="selectReceiptStatus(true)">✅ ${safeT('receipt.paid')}</button>
                    <button type="button" class="receipt-status-btn unpaid${unpaidSel}" data-paid="0" onclick="selectReceiptStatus(false)">⚠ ${safeT('receipt.unpaid')}</button>
                </div>
            </div>
            <div class="input-field" id="receipt-due-field" style="${receiptState.draftPaid ? 'display:none;' : ''}">
                <label>${safeT('receipt.dueDate')}</label>
                <div class="input-wrapper">
                    <input type="date" id="receipt-due-date" class="custom-input" value="${defaultDueDate}">
                </div>
            </div>
        </div>

        <div class="receipt-form-step" id="receipt-reminder-step" style="${receiptState.draftPaid ? 'display:none;' : ''}">
            <div class="receipt-step-title">${safeT('receipt.reminderStep')}</div>
            <div class="receipt-reminder-row">
                <input type="checkbox" id="receipt-remind-check" ${(!r || (r.remindBefore > 0)) ? 'checked' : ''}>
                <label for="receipt-remind-check">${safeT('receipt.remindBefore')}</label>
                <input type="number" id="receipt-remind-days" class="receipt-reminder-days" value="${r && r.remindBefore ? r.remindBefore : 3}" min="1" max="30">
                <span style="font-size:0.75rem;color:var(--text-secondary);font-weight:700;">${safeT('receipt.daysBefore')}</span>
            </div>
        </div>

        <div class="input-field">
            <label>${safeT('receipt.note')}</label>
            <div class="input-wrapper">
                <input type="text" id="receipt-note" class="custom-input" placeholder="" value="${r && r.note ? escapeHtml(r.note) : ''}">
            </div>
        </div>

        <button class="calc-btn-main" onclick="saveReceipt()" style="margin-top:12px;">
            ${safeT('receipt.save')}
        </button>
    `;
}

function selectReceiptCategory(cat, btn) {
    receiptState.draftCategory = cat;
    document.querySelectorAll('#receipt-category-chips .receipt-chip').forEach(b => b.classList.remove('selected'));
    if (btn) btn.classList.add('selected');
    vibrate(8);
}

function selectReceiptStatus(paid) {
    receiptState.draftPaid = !!paid;
    document.querySelectorAll('.receipt-status-btn').forEach(b => b.classList.remove('selected'));
    const target = paid ? '.receipt-status-btn.paid' : '.receipt-status-btn.unpaid';
    const t = document.querySelector(target);
    if (t) t.classList.add('selected');
    const dueField = el('receipt-due-field');
    const reminderStep = el('receipt-reminder-step');
    if (dueField) dueField.style.display = paid ? 'none' : 'block';
    if (reminderStep) reminderStep.style.display = paid ? 'none' : 'block';
    vibrate(8);
}

async function handleReceiptImageUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { showToast('Izaberi sliku.', 'warning'); return; }
    try {
        const compressed = await compressImage(file, 1600, 0.8);
        receiptState.draftImageBlob = compressed;
        receiptState.removeImage = false;
        if (receiptState.currentObjectUrl) {
            try { URL.revokeObjectURL(receiptState.currentObjectUrl); } catch (err) {}
        }
        const url = URL.createObjectURL(compressed);
        receiptState.currentObjectUrl = url;
        const prev = el('receipt-preview-wrap');
        const empty = el('receipt-upload-area');
        const img = el('receipt-preview-img');
        if (img) img.src = url;
        if (prev) prev.style.display = 'block';
        if (empty) empty.style.display = 'none';
        vibrate(15);
        playTick(0, 1400, 0.06, 0.02);
    } catch (err) {
        console.warn('Compress error:', err);
        showToast('Greška pri obradi slike.', 'error', 2500);
    }
}

function removeReceiptImagePreview() {
    receiptState.draftImageBlob = null;
    receiptState.removeImage = true;
    if (receiptState.currentObjectUrl) {
        try { URL.revokeObjectURL(receiptState.currentObjectUrl); } catch (e) {}
        receiptState.currentObjectUrl = null;
    }
    const prev = el('receipt-preview-wrap');
    const empty = el('receipt-upload-area');
    if (prev) prev.style.display = 'none';
    if (empty) empty.style.display = 'flex';
    const fileInput = el('receipt-file-input');
    if (fileInput) fileInput.value = '';
    showToast(safeT('receipt.imageRemoved'), 'info', 1200);
}

function saveReceipt() {
    const v = id => { const e = el(id); return e ? e.value.trim() : ''; };
    const n = id => { const e = el(id); return e ? parseNum(e.value) : null; };
    const c = id => { const e = el(id); return e ? e.checked : false; };
    const category = receiptState.draftCategory || 'struja';
    const amount = n('receipt-amount');
    const periodMonth = el('receipt-period-month') ? parseInt(el('receipt-period-month').value) : (new Date().getMonth() + 1);
    const periodYear = el('receipt-period-year') ? parseInt(el('receipt-period-year').value) : new Date().getFullYear();
    const period = periodYear + '-' + String(periodMonth).padStart(2, '0');
    const paid = receiptState.draftPaid;
    const dueDate = v('receipt-due-date');
    const remindBefore = n('receipt-remind-days') || 3;
    const useReminder = c('receipt-remind-check');
    const note = v('receipt-note');

    if (!amount || amount <= 0) { showToast('Unesi iznos računa.', 'error'); return; }
    if (!paid && !dueDate) { showToast('Unesi rok plaćanja.', 'error'); return; }

    const now = Date.now();
    const receiptId = receiptState.editingId || ('rc_' + now + '_' + Math.random().toString(36).slice(2, 7));
    const isNew = !receiptState.editingId;

    const receiptData = {
        id: receiptId,
        category,
        amount,
        currency: 'RSD',
        period,
        paid: !!paid,
        paidDate: paid ? new Date().toISOString().slice(0, 10) : null,
        dueDate: paid ? null : dueDate,
        remindBefore: useReminder ? remindBefore : 0,
        hasImage: !!receiptState.draftImageBlob,
        note,
        createdAt: isNew ? now : (getReceiptById(receiptId)?.createdAt || now),
        updatedAt: now
    };

    const list = loadReceipts();
    if (isNew) list.push(receiptData);
    else {
        const idx = list.findIndex(r => String(r.id) === String(receiptId));
        if (idx !== -1) list[idx] = Object.assign({}, list[idx], receiptData);
        else list.push(receiptData);
    }
    saveReceiptsList(list);

    if (receiptState.draftImageBlob) {
        saveReceiptImage(receiptId, receiptState.draftImageBlob).catch(err => {
            console.warn('Greška pri čuvanju slike:', err);
            showToast('Slika nije sačuvana', 'warning', 2500);
        });
    } else if (receiptState.removeImage && receiptState.editingId) {
        deleteReceiptImage(receiptId).catch(() => {});
    }

    syncReceiptToBill(receiptData);

    showToast(isNew ? 'Račun sačuvan.' : 'Račun izmenjen.', 'success', 1800);
    vibrate(20);
    playTick(0, 1500, 0.08, 0.03);

    closeModal('receipt-modal');
    receiptState = { editingId: null, draftImageBlob: null, draftCategory: 'struja', draftPaid: false, removeImage: false, currentObjectUrl: null };

    if (activeCategory === 'racuni') {
        const body = el('calc-body');
        if (body) {
            if (activeTab === 'moji') body.innerHTML = renderRacuni();
            else if (activeTab === 'pregled') body.innerHTML = renderRacuniPregled();
            else if (activeTab === 'analiza') body.innerHTML = renderRacuniAnaliza();
        }
        setTimeout(() => {
            if (activeTab === 'moji') loadReceiptThumbnails();
        }, 100);
    }
    updateAppBadge();
}

function updateReceipt(id, changes) {
    const list = loadReceipts();
    const idx = list.findIndex(r => String(r.id) === String(id));
    if (idx === -1) return;
    list[idx] = Object.assign({}, list[idx], changes, { updatedAt: Date.now() });
    saveReceiptsList(list);
    syncReceiptToBill(list[idx]);
    updateAppBadge();
}

async function deleteReceipt(id) {
    const ok = await showConfirm(safeT('receipt.deleteConfirm'));
    if (!ok) return;
    let list = loadReceipts();
    list = list.filter(r => String(r.id) !== String(id));
    saveReceiptsList(list);
    removeBillByReceiptId(id);
    try { await deleteReceiptImage(id); } catch (e) {}
    showToast('Račun obrisan.', 'info', 1600);
    vibrate(15);
    if (activeCategory === 'racuni') {
        const body = el('calc-body');
        if (body) {
            if (activeTab === 'moji') body.innerHTML = renderRacuni();
            else if (activeTab === 'pregled') body.innerHTML = renderRacuniPregled();
            else if (activeTab === 'analiza') body.innerHTML = renderRacuniAnaliza();
        }
        setTimeout(() => {
            if (activeTab === 'moji') loadReceiptThumbnails();
        }, 100);
    }
    updateAppBadge();
}

function markReceiptPaid(id) {
    const list = loadReceipts();
    const idx = list.findIndex(r => String(r.id) === String(id));
    if (idx === -1) return;
    list[idx].paid = true;
    list[idx].paidDate = new Date().toISOString().slice(0, 10);
    list[idx].updatedAt = Date.now();
    saveReceiptsList(list);
    removeBillByReceiptId(id);
    showToast('Račun plaćen.', 'success', 1500);
    vibrate(20);
    playTick(0, 1500, 0.08, 0.03);
    if (activeCategory === 'racuni') {
        const body = el('calc-body');
        if (body) {
            if (activeTab === 'moji') body.innerHTML = renderRacuni();
            else if (activeTab === 'pregled') body.innerHTML = renderRacuniPregled();
            else if (activeTab === 'analiza') body.innerHTML = renderRacuniAnaliza();
        }
        setTimeout(() => {
            if (activeTab === 'moji') loadReceiptThumbnails();
        }, 100);
    }
    updateAppBadge();
}

function markReceiptUnpaid(id) {
    const list = loadReceipts();
    const idx = list.findIndex(r => String(r.id) === String(id));
    if (idx === -1) return;
    list[idx].paid = false;
    list[idx].paidDate = null;
    list[idx].updatedAt = Date.now();
    saveReceiptsList(list);
    syncReceiptToBill(list[idx]);
    showToast('Račun vraćen u neplaćeno.', 'info', 1600);
    vibrate(15);
    if (activeCategory === 'racuni') {
        const body = el('calc-body');
        if (body) {
            if (activeTab === 'moji') body.innerHTML = renderRacuni();
            else if (activeTab === 'pregled') body.innerHTML = renderRacuniPregled();
            else if (activeTab === 'analiza') body.innerHTML = renderRacuniAnaliza();
        }
        setTimeout(() => {
            if (activeTab === 'moji') loadReceiptThumbnails();
        }, 100);
    }
    updateAppBadge();
}

function openReceiptDetails(id) {
    const r = getReceiptById(id);
    if (!r) { showToast('Račun nije pronađen', 'error'); return; }

    const modal = el('receipt-details-modal');
    const body = el('receipt-details-body');
    if (!modal || !body) return;

    const catLabel = safeT('receipt.category.' + (r.category || 'ostalo'));
    const periodLabel = formatPeriodMonth(r.period);
    const days = !r.paid && r.dueDate ? daysBetweenToday(r.dueDate) : null;

    let dueText = '';
    if (!r.paid && days !== null) {
        if (days < 0) dueText = `${safeT('receipt.overdueBy')} ${Math.abs(days)} ${safeT('receipt.daysLeft')}`;
        else if (days === 0) dueText = safeT('brziPregled.today');
        else dueText = `${safeT('receipt.dueIn')} ${days} ${safeT('receipt.daysLeft')}`;
    }

    body.innerHTML = `
        <div class="receipt-details-image" id="receipt-details-image" onclick="openImageViewer('${escapeHtml(r.id)}')">
            <div class="receipt-details-image-empty">${r.hasImage ? '📷' : safeT('receipt.noImage')}</div>
        </div>
        <div class="receipt-details-title">
            ${escapeHtml(catLabel)}${periodLabel ? ' — ' + escapeHtml(periodLabel) : ''}
            <span class="receipt-details-status ${r.paid ? 'paid' : 'unpaid'}">${r.paid ? safeT('receipt.paid') : safeT('receipt.unpaid')}</span>
        </div>
        <div class="receipt-details-rows">
            <div class="receipt-details-row">
                <span class="receipt-details-row-label">${safeT('receipt.amount')}</span>
                <span class="receipt-details-row-value">${fmt(r.amount, 0)} ${r.currency || 'RSD'}</span>
            </div>
            ${r.dueDate ? `<div class="receipt-details-row">
                <span class="receipt-details-row-label">${safeT('receipt.dueDate')}</span>
                <span class="receipt-details-row-value">${escapeHtml(r.dueDate)}${dueText ? ' (' + escapeHtml(dueText) + ')' : ''}</span>
            </div>` : ''}
            ${r.paidDate ? `<div class="receipt-details-row">
                <span class="receipt-details-row-label">${safeT('receipt.paidOn')}</span>
                <span class="receipt-details-row-value">${escapeHtml(r.paidDate)}</span>
            </div>` : ''}
            ${r.note ? `<div class="receipt-details-row">
                <span class="receipt-details-row-label">${safeT('receipt.note')}</span>
                <span class="receipt-details-row-value">${escapeHtml(r.note)}</span>
            </div>` : ''}
        </div>
        <div class="receipt-details-actions">
            ${!r.paid
                ? `<button class="receipt-details-action primary" onclick="markReceiptPaid('${escapeHtml(r.id)}'); closeModal('receipt-details-modal');">✅ ${safeT('receipt.markPaid')}</button>`
                : `<button class="receipt-details-action secondary" onclick="markReceiptUnpaid('${escapeHtml(r.id)}'); closeModal('receipt-details-modal');">↩ ${safeT('receipt.markUnpaid')}</button>`}
            <button class="receipt-details-action secondary" onclick="closeModal('receipt-details-modal'); openReceiptModal('${escapeHtml(r.id)}');">✏️ ${safeT('receipt.edit')}</button>
            <button class="receipt-details-action danger" onclick="closeModal('receipt-details-modal'); deleteReceipt('${escapeHtml(r.id)}');">🗑 ${safeT('receipt.delete')}</button>
        </div>
    `;

    modal.classList.add('show');
    document.body.classList.add('modal-open');
    vibrate(15);
    playTick(0, 1400, 0.06, 0.02);

    if (r.hasImage) {
        (async () => {
            try {
                const rec = await loadReceiptImage(r.id);
                if (rec && rec.blob) {
                    if (receiptDetailsObjectUrl) {
                        try { URL.revokeObjectURL(receiptDetailsObjectUrl); } catch (e) {}
                    }
                    receiptDetailsObjectUrl = URL.createObjectURL(rec.blob);
                    const img = el('receipt-details-image');
                    if (img) img.innerHTML = `<img src="${receiptDetailsObjectUrl}" alt="">`;
                }
            } catch (e) {}
        })();
    }
}

async function openImageViewer(receiptId) {
    const r = getReceiptById(receiptId);
    if (!r || !r.hasImage) return;
    const modal = el('image-viewer-modal');
    const img = el('image-viewer-img');
    if (!modal || !img) return;
    try {
        const rec = await loadReceiptImage(receiptId);
        if (!rec || !rec.blob) return;
        const url = URL.createObjectURL(rec.blob);
        img.src = url;
        img.dataset.objectUrl = url;
        modal.classList.add('show');
        document.body.classList.add('modal-open');
        vibrate(15);
    } catch (e) {}
}

function closeImageViewer(e) {
    if (e) e.stopPropagation();
    const modal = el('image-viewer-modal');
    const img = el('image-viewer-img');
    if (img && img.dataset.objectUrl) {
        try { URL.revokeObjectURL(img.dataset.objectUrl); } catch (err) {}
        img.dataset.objectUrl = '';
        img.src = '';
    }
    if (modal) modal.classList.remove('show');
    vibrate(10);
}
// ============================================================
// MONEY — SVI KALKULATORI
// ============================================================
function renderMoneyPopust() {
    return `
        <div class="converter-box">
            ${inputField('label.money.originalPrice', 'money-price', 'RSD', 'placeholder="2500"')}
            ${inputField('label.money.discountPercent', 'money-discount', '%', 'placeholder="20"')}
            ${calcButton('btn.calculate', 'calculateMoney()')}
        </div>
        ${resultCard('money-result-box', 'tag', 'label.money.newPrice', 'res-money-final', 'RSD', 'NOVAC', 'label.money.discount')}
        ${statsRow('money-stats-row', [['label.money.saved', 'stat-money-saved', '0 RSD']])}
    `;
}
function calculateMoney() {
    const price = num('money-price');
    const discount = num('money-discount');
    if (!price || discount === null) { showToast('Unesi cenu i popust.', 'error'); return; }
    const saved = price * (discount / 100);
    const final = price - saved;
    const rf = el('res-money-final'); if (rf) rf.innerText = money(final);
    const ss = el('stat-money-saved'); if (ss) ss.innerText = money(saved) + ' RSD';
    show('money-result-box');
    show('money-stats-row');
}

function renderMoneyPDV() {
    return `
        <div class="converter-box">
            ${inputField('label.money.amount', 'pdv-amount', 'RSD', 'placeholder="1000"')}
            ${inputField('label.money.vatRate', 'pdv-rate', '%', 'value="20"')}
            ${selectField('label.money.calcType', 'pdv-type', [
                { value: 'add', text: safeT('option.money.addVat') },
                { value: 'extract', text: safeT('option.money.extractVat') }
            ])}
            ${calcButton('btn.calculate', 'calculatePDV()')}
        </div>
        ${resultCard('pdv-result-box', 'percent', 'label.money.totalAmount', 'res-pdv-total', 'RSD', 'NOVAC', 'label.money.vat')}
        ${statsRow('pdv-stats-row', [['label.money.base', 'stat-pdv-base', '0 RSD'], ['label.money.vatAmount', 'stat-pdv-tax', '0 RSD']])}
    `;
}
function calculatePDV() {
    const amount = num('pdv-amount');
    const rate = num('pdv-rate') || 20;
    const type = el('pdv-type') ? el('pdv-type').value : 'add';
    if (!amount) { showToast('Unesi iznos.', 'error'); return; }
    let base, vat, total;
    if (type === 'add') {
        base = amount;
        vat = amount * (rate / 100);
        total = amount + vat;
    } else {
        total = amount;
        base = amount / (1 + rate / 100);
        vat = total - base;
    }
    const rt = el('res-pdv-total'); if (rt) rt.innerText = money(total);
    const sb = el('stat-pdv-base'); if (sb) sb.innerText = money(base) + ' RSD';
    const st = el('stat-pdv-tax'); if (st) st.innerText = money(vat) + ' RSD';
    show('pdv-result-box');
    show('pdv-stats-row');
}

function renderMoneyKredit() {
    return `
        <div class="converter-box">
            ${selectField('label.money.loanCurrency', 'credit-currency', [
                { value: 'RSD', text: 'RSD' }, { value: 'EUR', text: 'EUR' },
                { value: 'CHF', text: 'CHF' }, { value: 'USD', text: 'USD' }
            ], 'RSD')}
            <div class="input-field">
                <label>${safeT('label.money.loanAmount')}</label>
                <div class="input-wrapper"><input type="number" id="loan-amount" class="custom-input" placeholder="1000000" inputmode="decimal"><span class="unit" id="loan-amount-unit">RSD</span></div>
            </div>
            ${inputField('label.money.annualRate', 'loan-rate', '%', 'value="6.5" step="0.1"')}
            ${inputField('label.money.loanPeriod', 'loan-months', safeT('unit.monthsShort'), 'value="60"')}
            ${calcButton('btn.calculate', 'calculateLoan()')}
        </div>
        ${resultCard('loan-result-box', 'creditCard', 'label.money.monthlyPayment', 'res-loan-monthly', 'RSD/mes', 'NOVAC', 'label.money.loan')}
        ${statsRow('loan-stats-row', [['label.money.totalInterest', 'stat-loan-interest', '0 RSD'], ['label.money.totalRepayment', 'stat-loan-total', '0 RSD']])}
        <div id="loan-amort-wrap" style="display:none; margin-top: 16px;">
            <div class="converter-box">
                <div class="section-desc" style="margin-bottom: 10px;">${safeT('label.money.amortPlan')}</div>
                <div class="amort-scroll"><table id="amort-table" class="amort-table"><thead><tr><th>${safeT('table.month')}</th><th>${safeT('table.payment')}</th><th>${safeT('table.interest')}</th><th>${safeT('table.principal')}</th><th>${safeT('table.balance')}</th></tr></thead><tbody id="amort-body"></tbody></table></div>
            </div>
        </div>
    `;
}
function calculateLoan() {
    const amount = num('loan-amount');
    const rate = num('loan-rate') || 0;
    const months = num('loan-months') || 0;
    const currency = el('credit-currency') ? el('credit-currency').value : 'RSD';
    const unitEl = el('loan-amount-unit'); if (unitEl) unitEl.innerText = currency;
    if (!amount || !months) { showToast('Unesi iznos i period.', 'error'); return; }
    const monthlyRate = rate / 100 / 12;
    let monthly;
    if (monthlyRate === 0) monthly = amount / months;
    else {
        const factor = Math.pow(1 + monthlyRate, months);
        monthly = amount * monthlyRate * factor / (factor - 1);
    }
    const total = monthly * months;
    const interest = total - amount;
    const rm = el('res-loan-monthly'); if (rm) rm.innerText = money(monthly) + '/' + currency;
    const si = el('stat-loan-interest'); if (si) si.innerText = money(interest) + ' ' + currency;
    const st = el('stat-loan-total'); if (st) st.innerText = money(total) + ' ' + currency;
    const body = el('amort-body');
    if (body) {
        let balance = amount;
        let rows = '';
        for (let i = 1; i <= Math.min(months, 12); i++) {
            const interestPart = balance * monthlyRate;
            const principalPart = monthly - interestPart;
            balance -= principalPart;
            rows += `<tr><td>${i}</td><td>${money(monthly)}</td><td>${money(interestPart)}</td><td>${money(principalPart)}</td><td>${money(Math.max(0, balance))}</td></tr>`;
        }
        body.innerHTML = rows;
    }
    const wrap = el('loan-amort-wrap'); if (wrap) wrap.style.display = 'block';
    show('loan-result-box');
    show('loan-stats-row');
}
function toggleAmortPreview() { /* opciono */ }

function renderMoneyRate() {
    return `
        <div class="converter-box">
            ${sectionDescKey('desc.money.rate')}
            ${inputField('label.rate.startAmount', 'rate-start', 'RSD', 'placeholder="120000"')}
            ${inputField('label.rate.count', 'rate-count', '', 'value="12" min="1" max="120"')}
            ${dateTripleField('label.rate.firstDate', 'rate-first-date')}
            ${selectField('label.rate.period', 'rate-period', [
                { value: 'monthly', text: safeT('label.rate.period.monthly') },
                { value: 'biweekly', text: safeT('label.rate.period.biweekly') },
                { value: 'weekly', text: safeT('label.rate.period.weekly') }
            ], 'monthly')}
            ${inputField('label.rate.interest', 'rate-interest', '%', 'value="0" step="0.1"')}
            ${inputFieldText('label.rate.description', 'rate-description', safeT('label.rate.descriptionPlaceholder'))}
            ${calcButton('btn.calculate', 'calculateInstallments()')}
        </div>
        <div id="rate-calc-result-box" style="display: none;">
            <div class="rate-info-card">
                <div class="rate-info-row"><span class="rate-info-label">${safeT('label.rate.perInstallment')}</span><span class="rate-info-value accent" id="res-rate-per">0 RSD</span></div>
                <div class="rate-info-row"><span class="rate-info-label">${safeT('label.rate.totalPayment')}</span><span class="rate-info-value" id="res-rate-total">0 RSD</span></div>
                <div class="rate-info-row"><span class="rate-info-label">${safeT('label.rate.totalInterest')}</span><span class="rate-info-value" id="res-rate-interest">0 RSD</span></div>
            </div>
            <div class="rate-actions">
                <button class="rate-action-btn rate-action-primary" onclick="saveInstallmentsAsReminders()">💾 ${safeT('label.rate.saveReminders')}</button>
            </div>
            <div class="rate-table-wrap" style="margin-top: 14px;"><div id="rate-table-body"></div></div>
        </div>
    `;
}
let currentInstallmentData = null;
function calculateInstallments() {
    const startAmount = num('rate-start');
    const count = parseInt(num('rate-count')) || 0;
    const firstDate = getTripleDate('rate-first-date');
    const period = el('rate-period') ? el('rate-period').value : 'monthly';
    const interestRate = num('rate-interest') || 0;
    const description = el('rate-description') ? el('rate-description').value.trim() : '';
    if (!startAmount || startAmount <= 0) { showToast('Unesi iznos.', 'error'); return; }
    if (!count || count < 1 || count > 120) { showToast('Unesi broj rata (1-120).', 'error'); return; }
    if (!firstDate) { showToast('Unesi datum prve rate.', 'error'); return; }
    let monthlyRate = 0;
    if (interestRate > 0) {
        const periodsPerYear = period === 'monthly' ? 12 : (period === 'biweekly' ? 26 : 52);
        monthlyRate = (interestRate / 100) / periodsPerYear;
    }
    let perInstallment;
    if (monthlyRate === 0) perInstallment = startAmount / count;
    else {
        const factor = Math.pow(1 + monthlyRate, count);
        perInstallment = (startAmount * monthlyRate * factor) / (factor - 1);
    }
    const totalPayment = perInstallment * count;
    const totalInterest = totalPayment - startAmount;
    const installments = [];
    const firstDateObj = parseDate(firstDate);
    for (let i = 0; i < count; i++) {
        const date = new Date(firstDateObj);
        if (period === 'monthly') date.setMonth(date.getMonth() + i);
        else if (period === 'biweekly') date.setDate(date.getDate() + i * 14);
        else date.setDate(date.getDate() + i * 7);
        installments.push({ number: i + 1, date: date.toISOString().slice(0, 10), amount: perInstallment, paid: false });
    }
    currentInstallmentData = {
        startAmount, count, period, interestRate,
        description: description || safeT('label.rate.installment'),
        installments, totalPayment, totalInterest, createdAt: Date.now()
    };
    const rp = el('res-rate-per'); if (rp) rp.innerText = money(perInstallment) + ' RSD';
    const rt = el('res-rate-total'); if (rt) rt.innerText = money(totalPayment) + ' RSD';
    const ri = el('res-rate-interest'); if (ri) ri.innerText = money(totalInterest) + ' RSD';
    const tableBody = el('rate-table-body');
    if (tableBody) {
        tableBody.innerHTML = installments.map(inst => `
            <div class="rate-item">
                <div class="rate-item-check" style="cursor: default;"></div>
                <div class="rate-item-number">${safeT('label.rate.rate')} ${inst.number}/${count}</div>
                <div class="rate-item-date">${inst.date}</div>
                <div class="rate-item-amount">${money(inst.amount)} RSD</div>
            </div>
        `).join('');
    }
    const box = el('rate-calc-result-box'); if (box) box.style.display = 'block';
    vibrate(20);
    playTick(0, 1500, 0.08, 0.03);
}
function saveInstallmentsAsReminders() {
    if (!currentInstallmentData) { showToast('Prvo izračunaj rate.', 'error'); return; }
    const groups = loadInstallmentGroups();
    const newGroup = {
        id: 'inst_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
        description: currentInstallmentData.description,
        startAmount: currentInstallmentData.startAmount,
        count: currentInstallmentData.count,
        period: currentInstallmentData.period,
        interestRate: currentInstallmentData.interestRate,
        installments: currentInstallmentData.installments.map(i => ({ ...i })),
        createdAt: Date.now()
    };
    groups.push(newGroup);
    saveInstallmentGroups(groups);
    showToast(safeT('label.rate.savedAsReminders'), 'success', 2500);
    vibrate(20);
    playTick(0, 1500, 0.08, 0.03);
    updateAppBadge();
    const box = el('rate-calc-result-box'); if (box) box.style.display = 'none';
}

function renderMoneyPodela() {
    return `
        <div class="converter-box">
            ${inputField('label.money.totalBill', 'split-total', 'RSD', 'placeholder="4500"')}
            ${inputField('label.money.peopleCount', 'split-people', '', 'value="2" min="1"')}
            ${inputField('label.money.tipOptional', 'split-tip', '%', 'placeholder="10"')}
            ${calcButton('btn.calculate', 'calculateSplit()')}
        </div>
        ${resultCard('split-result-box', 'receipt', 'label.money.perPerson', 'res-split-val', 'RSD', 'NOVAC', 'label.money.split')}
        ${statsRow('split-stats-row', [['label.money.withTip', 'stat-split-total', '0 RSD']])}
    `;
}
function calculateSplit() {
    const total = num('split-total');
    const people = num('split-people') || 1;
    const tip = num('split-tip') || 0;
    if (!total) { showToast('Unesi iznos računa.', 'error'); return; }
    const totalWithTip = total * (1 + tip / 100);
    const perPerson = totalWithTip / people;
    const rv = el('res-split-val'); if (rv) rv.innerText = money(perPerson);
    const st = el('stat-split-total'); if (st) st.innerText = money(totalWithTip) + ' RSD';
    show('split-result-box');
    show('split-stats-row');
}

function renderMoneyPoredjenje() {
    return `
        <div class="converter-box">
            <p class="section-desc">Uporedi cenu dva proizvoda po jedinici mere.</p>
            <div class="compare-group">
                <div class="compare-title">Proizvod A</div>
                ${inputField('label.shop.price', 'price-a', 'RSD', 'placeholder="200"')}
                ${inputField('label.shop.quantity', 'qty-a', '', 'placeholder="1"')}
                ${selectField('label.shop.unit', 'unit-a', [
                    { value: 'kg', text: 'kg' }, { value: 'g', text: 'g' },
                    { value: 'L', text: 'L' }, { value: 'ml', text: 'ml' }, { value: 'kom', text: 'kom' }
                ])}
            </div>
            <div class="compare-group">
                <div class="compare-title">Proizvod B</div>
                ${inputField('label.shop.price', 'price-b', 'RSD', 'placeholder="180"')}
                ${inputField('label.shop.quantity', 'qty-b', '', 'placeholder="0.9"')}
                ${selectField('label.shop.unit', 'unit-b', [
                    { value: 'kg', text: 'kg' }, { value: 'g', text: 'g' },
                    { value: 'L', text: 'L' }, { value: 'ml', text: 'ml' }, { value: 'kom', text: 'kom' }
                ])}
            </div>
            ${calcButton('btn.calculate', 'calculateMoneyPoredjenje()')}
        </div>
        ${resultCard('poredjenje-result-box', 'scale', 'label.shop.compareResult', 'res-poredjenje-winner', '', 'NOVAC', 'label.shop.compareShort')}
        ${statsRow('poredjenje-stats-row', [
            ['label.shop.productA', 'stat-poredjenje-a', '0'],
            ['label.shop.productB', 'stat-poredjenje-b', '0'],
            ['label.shop.difference', 'stat-poredjenje-diff', '0%']
        ])}
    `;
}
function calculateMoneyPoredjenje() {
    const aP = num('price-a'), aQ = num('qty-a');
    const aU = el('unit-a') ? el('unit-a').value : 'kg';
    const bP = num('price-b'), bQ = num('qty-b');
    const bU = el('unit-b') ? el('unit-b').value : 'kg';
    if (!aP || !aQ || !bP || !bQ) { showToast('Unesi sve vrednosti.', 'error'); return; }
    function toBase(price, qty, unit) {
        if (unit === 'g' || unit === 'ml') return price / (qty / 1000);
        return price / qty;
    }
    const aBase = toBase(aP, aQ, aU);
    const bBase = toBase(bP, bQ, bU);
    const winner = aBase < bBase ? safeT('label.shop.productACheaper') : (bBase < aBase ? safeT('label.shop.productBCheaper') : safeT('label.shop.samePrice'));
    const rw = el('res-poredjenje-winner'); if (rw) rw.innerText = winner;
    const sa = el('stat-poredjenje-a'); if (sa) sa.innerText = money(aBase);
    const sb = el('stat-poredjenje-b'); if (sb) sb.innerText = money(bBase);
    const sd = el('stat-poredjenje-diff'); if (sd) sd.innerText = fmt(Math.abs(aBase - bBase) / Math.max(aBase, bBase) * 100, 1) + '%';
    show('poredjenje-result-box'); show('poredjenje-stats-row');
}

function renderMoneyStednja() {
    return `
        <div class="converter-box">
            <p class="section-desc">Izračunaj koliko meseci treba da uštediš za cilj.</p>
            ${inputField('label.money.stednja.target', 'savings-target', 'RSD', 'placeholder="1000000"')}
            ${inputField('label.money.stednja.current', 'savings-current', 'RSD', 'placeholder="0"')}
            ${inputField('label.money.stednja.monthly', 'savings-monthly', 'RSD', 'placeholder="20000"')}
            ${inputField('label.money.stednja.interest', 'savings-interest', '%', 'value="0" step="0.1"')}
            ${calcButton('btn.calculate', 'calculateSavings()')}
        </div>
        ${resultCard('savings-result-box', 'piggyBank', 'label.money.stednja.months', 'res-savings-months', 'meseci', 'NOVAC', 'label.money.stednja.progress')}
        ${statsRow('savings-stats-row', [
            ['label.money.stednja.total', 'stat-savings-total', '0 RSD'],
            ['label.money.stednja.interestEarned', 'stat-savings-interest', '0 RSD']
        ])}
        <div class="savings-progress" id="savings-progress-box" style="display: none;">
            <div class="savings-amounts">
                <span class="current" id="savings-current-label">0 RSD</span>
                <span class="target" id="savings-target-label">0 RSD</span>
            </div>
            <div class="savings-progress-bar-wrap">
                <div class="savings-progress-fill" id="savings-progress-fill" style="width: 0%;"></div>
            </div>
            <div class="savings-pct" id="savings-pct">0%</div>
        </div>
    `;
}
function calculateSavings() {
    const target = num('savings-target');
    const current = num('savings-current') || 0;
    const monthly = num('savings-monthly');
    const annualRate = num('savings-interest') || 0;
    if (!target || target <= 0 || !monthly || monthly <= 0) {
        showToast('Unesi cilj i mesečni iznos.', 'error');
        return;
    }
    const remaining = Math.max(0, target - current);
    if (remaining === 0) {
        const rm = el('res-savings-months');
        if (rm) rm.innerText = '0';
        showToast('Cilj je već dostignut!', 'success', 2500);
        show('savings-result-box');
        return;
    }
    let months;
    if (annualRate <= 0) months = Math.ceil(remaining / monthly);
    else {
        const monthlyRate = annualRate / 100 / 12;
        months = Math.ceil(Math.log(1 + (remaining * monthlyRate) / monthly) / Math.log(1 + monthlyRate));
    }
    const totalSaved = monthly * months;
    const interest = Math.max(0, totalSaved - remaining);
    const rm = el('res-savings-months'); if (rm) rm.innerText = months;
    const st = el('stat-savings-total'); if (st) st.innerText = money(totalSaved) + ' RSD';
    const si = el('stat-savings-interest'); if (si) si.innerText = money(interest) + ' RSD';
    show('savings-result-box'); show('savings-stats-row');
    const pct = Math.min(100, (current / target) * 100);
    const progressBox = el('savings-progress-box');
    if (progressBox) progressBox.style.display = 'flex';
    const fill = el('savings-progress-fill');
    if (fill) fill.style.width = pct + '%';
    const pctEl = el('savings-pct');
    if (pctEl) pctEl.textContent = fmt(pct, 1) + '%';
    const currLabel = el('savings-current-label');
    if (currLabel) currLabel.textContent = money(current) + ' RSD';
    const tgtLabel = el('savings-target-label');
    if (tgtLabel) tgtLabel.textContent = money(target) + ' RSD';
}

function renderMoneyBudzet() {
    return `
        <div class="converter-box">
            <p class="section-desc">Izračunaj dnevni limit potrošnje na osnovu budžeta.</p>
            ${inputField('label.shop.totalBudget', 'budzet-total-m', 'RSD', 'placeholder="30000"')}
            ${selectField('label.shop.period', 'budzet-period-m', [
                { value: '7', text: 'Nedelja (7 dana)' },
                { value: '14', text: 'Dve nedelje (14 dana)' },
                { value: '30', text: 'Mesec (30 dana)' }
            ])}
            ${inputField('label.shop.alreadySpent', 'budzet-spent-m', 'RSD', 'placeholder="0"')}
            ${calcButton('btn.calculate', 'calculateMoneyBudzet()')}
        </div>
        ${resultCard('budzet-result-box-m', 'calendarSm', 'label.shop.dailyLimit', 'res-budzet-daily-m', 'RSD', 'NOVAC', 'label.shop.budgetShort')}
        ${statsRow('budzet-stats-row-m', [
            ['label.shop.untilEndOfPeriod', 'stat-budzet-left-m', '0 RSD'],
            ['label.shop.daysCount', 'stat-budzet-days-m', '0'],
            ['label.shop.dailyUntilEnd', 'stat-budzet-recalc-m', '0 RSD']
        ])}
    `;
}
function calculateMoneyBudzet() {
    const total = num('budzet-total-m');
    const period = el('budzet-period-m') ? parseInt(el('budzet-period-m').value) : 30;
    const spent = num('budzet-spent-m') || 0;
    if (!total || total <= 0) { showToast('Unesi budžet.', 'error'); return; }
    const daily = total / period, left = Math.max(0, total - spent);
    const rd = el('res-budzet-daily-m'); if (rd) rd.innerText = money(daily);
    const sl = el('stat-budzet-left-m'); if (sl) sl.innerText = money(left) + ' RSD';
    const sd = el('stat-budzet-days-m'); if (sd) sd.innerText = period;
    const sr = el('stat-budzet-recalc-m'); if (sr) sr.innerText = money(left / period) + ' RSD';
    show('budzet-result-box-m'); show('budzet-stats-row-m');
}

function renderMoneyNapojnica() {
    return `
        <div class="converter-box">
            ${inputField('label.money.billAmount', 'tip-bill', 'RSD', 'placeholder="2500"')}
            ${inputField('label.money.tipPercent', 'tip-percent', '%', 'placeholder="10"')}
            ${inputField('label.money.peopleCount', 'tip-people', '', 'value="1" min="1"')}
            ${calcButton('btn.calculate', 'calculateTip()')}
        </div>
        ${resultCard('tip-result-box', 'handshake', 'label.money.tipAmount', 'res-tip-val', 'RSD', 'NOVAC', 'label.money.tip')}
        ${statsRow('tip-stats-row', [['label.money.totalToPay', 'stat-tip-total', '0 RSD'], ['label.money.perPerson', 'stat-tip-per-person', '0 RSD']])}
    `;
}
function calculateTip() {
    const bill = num('tip-bill');
    const pct = num('tip-percent') || 0;
    const people = num('tip-people') || 1;
    if (!bill) { showToast('Unesi iznos računa.', 'error'); return; }
    const tip = bill * (pct / 100);
    const total = bill + tip;
    const perPerson = total / people;
    const rv = el('res-tip-val'); if (rv) rv.innerText = money(tip);
    const st = el('stat-tip-total'); if (st) st.innerText = money(total) + ' RSD';
    const sp = el('stat-tip-per-person'); if (sp) sp.innerText = money(perPerson) + ' RSD';
    show('tip-result-box');
    show('tip-stats-row');
}

// ============================================================
// FX — KURSNE LISTE
// ============================================================
const CURRENCIES = [
    { code: 'RSD', name: 'Srpski dinar', flag: '🇷🇸', rate: 1 },
    { code: 'EUR', name: 'Evro', flag: '🇪🇺', rate: 117.20 },
    { code: 'USD', name: 'Američki dolar', flag: '🇺🇸', rate: 108.50 },
    { code: 'GBP', name: 'Britanska funta', flag: '🇬🇧', rate: 137.80 },
    { code: 'CHF', name: 'Švajcarski franak', flag: '🇨🇭', rate: 122.40 },
    { code: 'JPY', name: 'Japanski jen', flag: '🇯🇵', rate: 0.72 },
    { code: 'CNY', name: 'Kineski juan', flag: '🇨🇳', rate: 14.95 },
    { code: 'RUB', name: 'Ruska rublja', flag: '🇷🇺', rate: 1.18 },
    { code: 'TRY', name: 'Turska lira', flag: '🇹🇷', rate: 3.15 },
    { code: 'BAM', name: 'Konvertibilna marka', flag: '🇧🇦', rate: 59.90 },
    { code: 'HRK', name: 'Hrvatska kuna', flag: '🇭🇷', rate: 15.55 },
    { code: 'MKD', name: 'Makedonski denar', flag: '🇲🇰', rate: 1.90 },
    { code: 'BGN', name: 'Bugarski lev', flag: '🇧🇬', rate: 59.95 },
    { code: 'RON', name: 'Rumunski lej', flag: '🇷🇴', rate: 23.55 },
    { code: 'HUF', name: 'Mađarska forinta', flag: '🇭🇺', rate: 0.30 },
    { code: 'PLN', name: 'Poljski zlot', flag: '🇵🇱', rate: 26.85 },
    { code: 'CZK', name: 'Češka kruna', flag: '🇨🇿', rate: 4.68 },
    { code: 'CAD', name: 'Kanadski dolar', flag: '🇨🇦', rate: 78.60 },
    { code: 'AUD', name: 'Australijski dolar', flag: '🇦🇺', rate: 71.40 }
];
const FX_STORAGE_KEY = 'cx_fx_rates_v3';
function getFxLastUpdate() { try { const raw = JSON.parse(localStorage.getItem(FX_STORAGE_KEY)); if (raw && raw.updated) return raw.updated; } catch (e) {} return null; }
function loadFxRates() {
    try { const raw = JSON.parse(localStorage.getItem(FX_STORAGE_KEY)); if (raw && raw.rates && typeof raw.rates === 'object') { CURRENCIES.forEach(c => { if (typeof raw.rates[c.code] === 'number' && raw.rates[c.code] > 0) c.rate = raw.rates[c.code]; }); } } catch (e) {}
}
function saveFxRates() { try { const rates = {}; CURRENCIES.forEach(c => { rates[c.code] = c.rate; }); localStorage.setItem(FX_STORAGE_KEY, JSON.stringify({ rates, updated: Date.now() })); } catch (e) {} }
function formatFxUpdated(ts) {
    if (!ts) return currentLang === 'en' ? 'not refreshed' : 'nije osveženo';
    const diffMin = Math.round((new Date() - new Date(ts)) / 60000);
    if (diffMin < 1) return currentLang === 'en' ? 'just now' : 'upravo sad';
    if (diffMin < 60) return (currentLang === 'en' ? '' : 'pre ') + diffMin + (currentLang === 'en' ? ' min ago' : ' min');
    const diffH = Math.round(diffMin / 60);
    if (diffH < 24) return (currentLang === 'en' ? '' : 'pre ') + diffH + (currentLang === 'en' ? 'h ago' : 'h');
    return (currentLang === 'en' ? '' : 'pre ') + Math.floor(diffH / 24) + (currentLang === 'en' ? 'd ago' : ' d.');
}
async function refreshExchangeRates(silent = false) {
    const btn = document.querySelector('.fx-refresh-btn');
    if (btn) btn.classList.add('spinning');
    setTimeout(() => { if (btn) btn.classList.remove('spinning'); }, 700);
    if (!silent) showToast(currentLang === 'en' ? 'Refreshing rates...' : 'Osvežavam kurseve...', 'info', 1500);
    try {
        const res = await fetch('https://open.er-api.com/v6/latest/RSD', { cache: 'no-store' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        if (!data || data.result !== 'success' || !data.rates) throw new Error('Neispravan');
        CURRENCIES.forEach(c => {
            if (c.code === 'RSD') { c.rate = 1; return; }
            const rate = data.rates[c.code];
            if (typeof rate === 'number' && rate > 0) c.rate = Number((1 / rate).toFixed(4));
        });
        saveFxRates();
        populateCurrencySelects();
        renderFxList();
        updateFxUpdatedLabel();
        calculateCurrency();
        if (!silent) { showToast(currentLang === 'en' ? 'Rates refreshed' : 'Kursevi osveženi', 'success', 2000); vibrate(20); }
    } catch (e) { if (!silent) showToast(currentLang === 'en' ? 'Error refreshing rates' : 'Greška pri osvežavanju', 'error', 2500); }
}
function populateCurrencySelects() {
    const fromSel = el('fx-from'), toSel = el('fx-to');
    if (!fromSel || !toSel) return;
    const prevFrom = fromSel.value || 'RSD', prevTo = toSel.value || 'EUR';
    fromSel.innerHTML = ''; toSel.innerHTML = '';
    CURRENCIES.forEach(c => {
        const o1 = document.createElement('option'); o1.value = c.code; o1.textContent = `${c.flag} ${c.code} — ${c.name}`; fromSel.appendChild(o1);
        const o2 = document.createElement('option'); o2.value = c.code; o2.textContent = `${c.flag} ${c.code} — ${c.name}`; toSel.appendChild(o2);
    });
    fromSel.value = prevFrom || 'RSD';
    toSel.value = prevTo || 'EUR';
}
function renderFxList() {
    const list = el('fx-list');
    if (!list) return;
    list.innerHTML = '';
    CURRENCIES.forEach(c => {
        const item = document.createElement('div');
        item.className = 'fx-list-item';
        item.dataset.code = c.code;
        item.innerHTML = `<div class="fx-flag">${c.flag}</div><div class="fx-list-info"><div class="fx-code">${c.code}</div><div class="fx-name">${c.name}</div></div><div class="fx-value">${fmt(c.rate, 4)}<small>RSD</small></div>`;
        item.addEventListener('click', () => { const toSel = el('fx-to'); if (toSel) { toSel.value = c.code; calculateCurrency(); } });
        list.appendChild(item);
    });
}
function updateFxUpdatedLabel() {
    const label = el('fx-updated-label');
    if (!label) return;
    const ts = getFxLastUpdate();
    label.textContent = ts ? ((currentLang === 'en' ? 'updated ' : 'osveženo ') + formatFxUpdated(ts)) : safeT('label.money.manualEntry');
}
function swapCurrencies() {
    const fromSel = el('fx-from'), toSel = el('fx-to');
    if (!fromSel || !toSel) return;
    const tmp = fromSel.value;
    fromSel.value = toSel.value;
    toSel.value = tmp;
    calculateCurrency();
    vibrate(10);
}
function getCurrencyByCode(code) { return CURRENCIES.find(c => c.code === code); }
function calculateCurrency() {
    const amount = num('fx-amount');
    const fromSel = el('fx-from'), toSel = el('fx-to');
    if (!fromSel || !toSel) return;
    const fromCur = getCurrencyByCode(fromSel.value), toCur = getCurrencyByCode(toSel.value);
    const info = el('fx-rate-info');
    if (info && fromCur && toCur) info.innerHTML = `1 ${fromCur.code} = <strong>${fmt(fromCur.rate / toCur.rate, 4)}</strong> ${toCur.code}`;
    if (!amount) { hide('fx-result-box'); return; }
    if (!fromCur || !toCur) return;
    const result = (amount * fromCur.rate) / toCur.rate;
    const fv = el('res-fx-val'), fu = el('res-fx-unit');
    if (fv) fv.innerText = toCur.rate >= 50 ? money(result) : fmt(result, 2);
    if (fu) fu.innerText = toCur.code;
    show('fx-result-box');
}

function renderMoneyValuta() {
    return `
        <div class="converter-box">
            <div class="fx-head">
                <div class="section-desc" style="margin-bottom: 0;">${safeT('label.money.exchangeList')} — <span id="fx-updated-label">${safeT('label.money.manualEntry')}</span></div>
                <button class="fx-refresh-btn" onclick="refreshExchangeRates()" type="button">${icon('refresh')}</button>
            </div>
            <div class="input-field"><label>${safeT('label.money.amount')}</label><div class="input-wrapper"><input type="number" id="fx-amount" class="custom-input" placeholder="1000" inputmode="decimal" oninput="calculateCurrency()"></div></div>
            <div class="fx-row">
                <div class="input-field fx-col"><label>${safeT('label.money.fromCurrency')}</label><select id="fx-from" class="custom-input" onchange="calculateCurrency()"></select></div>
                <button class="fx-swap-btn" onclick="swapCurrencies()" type="button">${icon('swap')}</button>
                <div class="input-field fx-col"><label>${safeT('label.money.toCurrency')}</label><select id="fx-to" class="custom-input" onchange="calculateCurrency()"></select></div>
            </div>
            ${calcButton('btn.calculate', 'calculateCurrency()')}
        </div>
        <div id="fx-result-box" class="result-card-green" style="display: none;">
            <div class="res-left"><div class="pump-icon">${icon('exchange')}</div><div><div class="res-label">${safeT('result.label')}</div><h2><span id="res-fx-val">0</span> <small id="res-fx-unit">EUR</small></h2></div></div>
            <div class="res-actions">
                <button class="copy-btn" onclick="copyResult('res-fx-val', 'res-fx-unit', event)">${safeT('result.copy')}</button>
                <button class="copy-btn" data-category="NOVAC" data-label="Valuta" onclick="saveHistory(this)">${safeT('result.save')}</button>
                <button class="copy-btn" data-category="NOVAC" data-label="Valuta" onclick="shareResult(this)">${safeT('result.share')}</button>
            </div>
        </div>
        <div class="fx-rate-info" id="fx-rate-info"></div>
        <div class="converter-box fx-list-box">
            <div class="section-desc" style="margin-bottom: 10px;">${safeT('label.money.ratesList')}</div>
            <div class="fx-list" id="fx-list"></div>
        </div>
    `;
}
// ============================================================
// PODSETNICI — Storage helperi + rendering
// ============================================================
const REMINDER_KEYS = {
    birthdays: 'cx_birthdays',
    bills: 'cx_bills',
    vehicles: 'cx_vehicles',
    documents: 'cx_documents',
    subscriptions: 'cx_subscriptions',
    medications: 'cx_medications',
    anniversaries: 'cx_anniversaries',
    notes: 'cx_notes'
};

function loadReminders(key) {
    try {
        const raw = JSON.parse(localStorage.getItem(key));
        if (Array.isArray(raw)) return raw;
    } catch (e) {}
    return [];
}
function saveReminders(key, list) {
    try { localStorage.setItem(key, JSON.stringify(list)); } catch (e) {}
}
function addReminder(key, item) {
    const list = loadReminders(key);
    item.id = item.id || (Date.now() + Math.random());
    item.createdAt = item.createdAt || Date.now();
    list.push(item);
    saveReminders(key, list);
    return item;
}
function updateReminder(key, id, changes) {
    const list = loadReminders(key);
    const idx = list.findIndex(x => x.id === id);
    if (idx === -1) return;
    list[idx] = Object.assign({}, list[idx], changes);
    saveReminders(key, list);
}
function deleteReminder(key, id) {
    let list = loadReminders(key);
    list = list.filter(x => x.id !== id);
    saveReminders(key, list);
}

function daysUntilDate(isoOrDate) {
    if (!isoOrDate) return null;
    const target = parseDate(isoOrDate);
    if (!target || isNaN(target)) return null;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    return Math.round((target - today) / 86400000);
}
function daysToBirthday(isoDate) {
    if (!isoDate) return null;
    const parts = isoDate.split('-').map(Number);
    if (parts.length < 3) return null;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    let next = new Date(today.getFullYear(), parts[1] - 1, parts[2]);
    next.setHours(0, 0, 0, 0);
    if (next < today) next.setFullYear(today.getFullYear() + 1);
    return Math.round((next - today) / 86400000);
}
function daysToAnniversary(isoDate) { return daysToBirthday(isoDate); }
function daysToBillDay(dayOfMonth) {
    if (!dayOfMonth) return null;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const d = Math.max(1, Math.min(31, parseInt(dayOfMonth)));
    let next = new Date(today.getFullYear(), today.getMonth(), d);
    next.setHours(0, 0, 0, 0);
    if (next < today) {
        let nm = today.getMonth() + 1;
        let ny = today.getFullYear();
        if (nm > 11) { nm = 0; ny++; }
        next = new Date(ny, nm, d);
    }
    return Math.round((next - today) / 86400000);
}
function formatDaysToHuman(days) {
    if (days === null || days === undefined) return '—';
    if (days === 0) return safeT('rem.dashboard.today');
    if (days === 1) return safeT('rem.dashboard.tomorrow');
    if (days === -1) return safeT('rem.dashboard.yesterday');
    if (days < 0) return Math.abs(days) + ' ' + safeT('rem.days');
    return days + ' ' + safeT('rem.days');
}
function urgencyClass(days) {
    if (days === null || days === undefined) return 'later';
    if (days < 0) return 'overdue';
    if (days <= 7) return 'urgent';
    if (days <= 30) return 'soon';
    return 'later';
}
function urgencyColor(days) {
    const cls = urgencyClass(days);
    if (cls === 'overdue' || cls === 'urgent') return '#f43f5e';
    if (cls === 'soon') return '#f59e0b';
    return '#10b981';
}
function yearsSinceDate(isoDate) {
    if (!isoDate) return null;
    const parts = isoDate.split('-').map(Number);
    if (parts.length < 3) return null;
    const start = new Date(parts[0], parts[1] - 1, parts[2]);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    if (start > today) return null;
    let years = today.getFullYear() - start.getFullYear();
    let months = today.getMonth() - start.getMonth();
    let days = today.getDate() - start.getDate();
    if (days < 0) { months--; days += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
    if (months < 0) { years--; months += 12; }
    return { years, months, days };
}
function nextJubileeYears(isoDate) {
    if (!isoDate) return null;
    const parts = isoDate.split('-').map(Number);
    if (parts.length < 3) return null;
    const start = new Date(parts[0], parts[1] - 1, parts[2]);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    if (start > today) return null;
    const jubilees = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 100];
    const currentYears = today.getFullYear() - start.getFullYear();
    let nextJub = jubilees.find(j => j > currentYears);
    if (!nextJub) nextJub = Math.ceil((currentYears + 1) / 10) * 10;
    const nextDate = new Date(start.getFullYear() + nextJub, start.getMonth(), start.getDate());
    const daysUntil = Math.round((nextDate - today) / 86400000);
    return { years: nextJub, daysUntil };
}

// ============================================================
// PODSETNICI — RENDER
// ============================================================
function renderRemindersHistory() {
    return `
        <div class="rem-history">
            <div class="rem-history-controls">
                <div class="rem-search-box">
                    <span class="rem-search-icon">🔍</span>
                    <input type="text" id="rem-history-search" class="rem-search-input" placeholder="${safeT('rem.history.search')}" oninput="renderRemindersHistoryList()">
                </div>
                <div class="rem-filter-row">
                    <select id="rem-history-filter" class="rem-filter-select" onchange="renderRemindersHistoryList()">
                        <option value="all">${safeT('rem.history.filter.all')}</option>
                        <option value="done" selected>${safeT('rem.history.filter.done')}</option>
                    </select>
                    <select id="rem-history-month" class="rem-filter-select" onchange="renderRemindersHistoryList()">
                        <option value="all">${safeT('rem.history.allMonths')}</option>
                        ${['Januar','Februar','Mart','April','Maj','Jun','Jul','Avgust','Septembar','Oktobar','Novembar','Decembar'].map((m,i) => `<option value="${i+1}">${m}</option>`).join('')}
                    </select>
                    <select id="rem-history-year" class="rem-filter-select" onchange="renderRemindersHistoryList()">
                        <option value="all">${safeT('rem.history.allYears')}</option>
                    </select>
                </div>
                <div class="rem-history-actions-row">
                    <button class="rem-action-mini" onclick="exportRemindersHistory()">📥 ${safeT('rem.history.export')}</button>
                    <button class="rem-action-mini" onclick="shareRemindersHistory()">📤 Podeli</button>
                </div>
            </div>
            <div id="rem-history-stats" class="rem-history-stats"></div>
            <div id="rem-history-list" class="rem-history-list"></div>
        </div>
    `;
}
function renderRemindersBirthdays() {
    return `<div class="converter-box"><div class="section-desc">${safeT('tab.podsetnici.rodjendani')}</div><div id="rem-bd-list" class="rem-list"></div><button class="calc-btn-main" onclick="openReminderForm('birthday')">${safeT('rem.add')}</button></div>`;
}
function renderRemindersBills() {
    return `<div class="converter-box"><div class="section-desc">${safeT('tab.podsetnici.racuni')}</div><div id="rem-bills-summary" class="rem-summary"></div><div id="rem-bills-list" class="rem-list"></div><button class="calc-btn-main" onclick="openReminderForm('bill')">${safeT('rem.add')}</button></div>`;
}
function renderRemindersVehicles() {
    return `<div class="converter-box"><div class="section-desc">${safeT('rem.veh.name')}</div><div id="rem-veh-list" class="rem-list"></div><button class="calc-btn-main" onclick="openReminderForm('vehicle')">${safeT('rem.add')} — ${safeT('rem.veh.name')}</button></div><div class="converter-box"><div class="section-desc">${safeT('rem.doc.type')}</div><div id="rem-doc-list" class="rem-list"></div><button class="calc-btn-main" onclick="openReminderForm('document')">${safeT('rem.add')} — ${safeT('rem.doc.type')}</button></div>`;
}
function renderRemindersSubscriptions() {
    return `<div class="converter-box"><div class="section-desc">${safeT('tab.podsetnici.pretplate')}</div><div id="rem-subs-summary" class="rem-summary"></div><div id="rem-subs-list" class="rem-list"></div><button class="calc-btn-main" onclick="openReminderForm('subscription')">${safeT('rem.add')}</button></div>`;
}
function renderRemindersMedications() {
    return `<div class="converter-box"><div class="section-desc">${safeT('tab.podsetnici.lekivi')}</div><div id="rem-meds-list" class="rem-list"></div><button class="calc-btn-main" onclick="openReminderForm('medication')">${safeT('rem.add')}</button></div>`;
}
function renderRemindersAnniversaries() {
    return `<div class="converter-box"><div class="section-desc">${safeT('tab.podsetnici.godisnjice')}</div><div id="rem-ann-list" class="rem-list"></div><button class="calc-btn-main" onclick="openReminderForm('anniversary')">${safeT('rem.add')}</button></div>`;
}
function renderRemindersNotes() {
    return `<div class="converter-box"><div class="section-desc">${safeT('tab.podsetnici.napomene')}</div><div id="rem-notes-list" class="rem-list"></div><button class="calc-btn-main" onclick="openReminderForm('note')">${safeT('rem.add')}</button></div>`;
}

function renderRemindersRate() {
    const html = `
        <div class="converter-box">
            <div class="section-desc">Kalkulator rata</div>
            ${inputField('label.rate.startAmount', 'rem-rate-start', 'RSD', 'placeholder="120000"')}
            ${inputField('label.rate.count', 'rem-rate-count', '', 'value="12" min="1" max="120"')}
            ${dateTripleField('label.rate.firstDate', 'rem-rate-first-date')}
            ${selectField('label.rate.period', 'rem-rate-period', [
                { value: 'monthly', text: safeT('label.rate.period.monthly') },
                { value: 'biweekly', text: safeT('label.rate.period.biweekly') },
                { value: 'weekly', text: safeT('label.rate.period.weekly') }
            ], 'monthly')}
            ${inputField('label.rate.interest', 'rem-rate-interest', '%', 'value="0" step="0.1"')}
            ${inputFieldText('label.rate.description', 'rem-rate-description', safeT('label.rate.descriptionPlaceholder'))}
            ${calcButton('btn.calculate', 'calculateRemindersInstallments()')}
        </div>
        <div id="rem-rate-calc-result-box" style="display: none;">
            <div class="rate-info-card">
                <div class="rate-info-row"><span class="rate-info-label">${safeT('label.rate.perInstallment')}</span><span class="rate-info-value accent" id="rem-res-rate-per">0 RSD</span></div>
                <div class="rate-info-row"><span class="rate-info-label">${safeT('label.rate.totalPayment')}</span><span class="rate-info-value" id="rem-res-rate-total">0 RSD</span></div>
                <div class="rate-info-row"><span class="rate-info-label">${safeT('label.rate.totalInterest')}</span><span class="rate-info-value" id="rem-res-rate-interest">0 RSD</span></div>
            </div>
            <div class="rate-actions">
                <button class="rate-action-btn rate-action-primary" onclick="saveRemindersInstallments()">💾 ${safeT('label.rate.saveReminders')}</button>
            </div>
            <div class="rate-table-wrap" style="margin-top: 14px;"><div id="rem-rate-table-body"></div></div>
        </div>
        <div class="converter-box">
            <div class="section-desc">Sačuvane rate</div>
            <div id="rem-rate-list" class="rem-rate-list"></div>
        </div>
    `;
    setTimeout(() => {
        const box = el('rem-rate-list');
        if (!box) return;
        const groups = loadInstallmentGroups();
        if (!groups.length) {
            box.innerHTML = `<div class="rate-empty"><div class="rate-empty-icon">💳</div><div>${safeT('label.rate.noInstallments')}</div></div>`;
            return;
        }
        const sortedGroups = [...groups].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        let innerHtml = '';
        sortedGroups.forEach(group => {
            const paidCount = (group.installments || []).filter(i => i.paid).length;
            const totalCount = (group.installments || []).length;
            const totalAmount = (group.installments || []).reduce((sum, i) => sum + (i.amount || 0), 0);
            const isDone = paidCount >= totalCount;
            const progress = totalCount > 0 ? (paidCount / totalCount) * 100 : 0;
            innerHtml += `
                <div class="rate-group" data-group-id="${escapeHtml(group.id)}">
                    <div class="rate-group-head">
                        <div>
                            <div class="rate-group-title">${escapeHtml(group.description || safeT('label.rate.installment'))}</div>
                            <div class="rate-group-sub">${totalCount} ${safeT('unit.monthsShort')} • ${totalAmount.toLocaleString('sr-RS')} RSD</div>
                        </div>
                        <div class="rate-group-badge ${isDone ? 'done' : ''}">${isDone ? '✓ ' + safeT('label.rate.paid') : paidCount + ' / ' + totalCount}</div>
                    </div>
                    <div class="rate-progress-wrap" style="margin: 0 0 10px 0; padding: 10px 12px;">
                        <div class="rate-progress-head" style="margin-bottom: 6px; font-size: 0.72rem;">
                            <span class="rate-progress-label">${safeT('label.rate.progress')}</span>
                            <span class="rate-progress-count">${paidCount} / ${totalCount}</span>
                        </div>
                        <div class="rate-progress-bar"><div class="rate-progress-fill" style="width: ${progress}%;"></div></div>
                    </div>
                    <div class="rate-table-wrap" style="max-height: 250px;">
                        ${(group.installments || []).map((inst, idx) => `
                            <div class="rate-item ${inst.paid ? 'rate-item-paid' : ''}">
                                <button class="rate-item-check" onclick="toggleInstallmentPaidFromReminders('${escapeHtml(group.id)}', ${idx})">${inst.paid ? '✓' : ''}</button>
                                <div class="rate-item-number">${safeT('label.rate.rate')} ${inst.number}/${totalCount}</div>
                                <div class="rate-item-date">${escapeHtml(inst.date || '—')}</div>
                                <div class="rate-item-amount">${(inst.amount || 0).toLocaleString('sr-RS')} RSD</div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="rate-actions" style="margin-top: 10px; flex-direction: row;">
                        <button class="rate-action-btn rate-action-danger" style="flex: 1;" onclick="deleteInstallmentGroup('${escapeHtml(group.id)}')">${safeT('label.rate.deleteAll')}</button>
                    </div>
                </div>
            `;
        });
        box.innerHTML = innerHtml;
    }, 0);
    return html;
}

let remCurrentInstallmentData = null;
function calculateRemindersInstallments() {
    const startAmount = num('rem-rate-start');
    const count = parseInt(num('rem-rate-count')) || 0;
    const firstDate = getTripleDate('rem-rate-first-date');
    const period = el('rem-rate-period') ? el('rem-rate-period').value : 'monthly';
    const interestRate = num('rem-rate-interest') || 0;
    const description = el('rem-rate-description') ? el('rem-rate-description').value.trim() : '';
    if (!startAmount || startAmount <= 0) { showToast(safeT('toast.error.enterAmount') || 'Unesi iznos.', 'error'); return; }
    if (!count || count < 1 || count > 120) { showToast(safeT('toast.error.enterValue') || 'Unesi vrednost.', 'error'); return; }
    if (!firstDate) { showToast(safeT('toast.error.enterDate') || 'Unesi datum.', 'error'); return; }
    let monthlyRate = 0;
    if (interestRate > 0) {
        const periodsPerYear = period === 'monthly' ? 12 : (period === 'biweekly' ? 26 : 52);
        monthlyRate = (interestRate / 100) / periodsPerYear;
    }
    let perInstallment;
    if (monthlyRate === 0) perInstallment = startAmount / count;
    else {
        const factor = Math.pow(1 + monthlyRate, count);
        perInstallment = (startAmount * monthlyRate * factor) / (factor - 1);
    }
    const totalPayment = perInstallment * count;
    const totalInterest = totalPayment - startAmount;
    const installments = [];
    const firstDateObj = parseDate(firstDate);
    for (let i = 0; i < count; i++) {
        const date = new Date(firstDateObj);
        if (period === 'monthly') date.setMonth(date.getMonth() + i);
        else if (period === 'biweekly') date.setDate(date.getDate() + i * 14);
        else date.setDate(date.getDate() + i * 7);
        installments.push({ number: i + 1, date: date.toISOString().slice(0, 10), amount: perInstallment, paid: false });
    }
    remCurrentInstallmentData = {
        startAmount, count, period, interestRate,
        description: description || safeT('label.rate.installment'),
        installments, totalPayment, totalInterest, createdAt: Date.now()
    };
    const rp = el('rem-res-rate-per'); if (rp) rp.innerText = money(perInstallment) + ' RSD';
    const rt = el('rem-res-rate-total'); if (rt) rt.innerText = money(totalPayment) + ' RSD';
    const ri = el('rem-res-rate-interest'); if (ri) ri.innerText = money(totalInterest) + ' RSD';
    const tableBody = el('rem-rate-table-body');
    if (tableBody) {
        tableBody.innerHTML = installments.map(inst => `
            <div class="rate-item">
                <div class="rate-item-check" style="cursor: default;"></div>
                <div class="rate-item-number">${safeT('label.rate.rate')} ${inst.number}/${count}</div>
                <div class="rate-item-date">${inst.date}</div>
                <div class="rate-item-amount">${money(inst.amount)} RSD</div>
            </div>
        `).join('');
    }
    const box = el('rem-rate-calc-result-box'); if (box) box.style.display = 'block';
    vibrate(20);
    playTick(0, 1500, 0.08, 0.03);
}
function saveRemindersInstallments() {
    if (!remCurrentInstallmentData) { showToast('Prvo izračunaj rate', 'error'); return; }
    const groups = loadInstallmentGroups();
    const newGroup = {
        id: 'inst_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
        description: remCurrentInstallmentData.description,
        startAmount: remCurrentInstallmentData.startAmount,
        count: remCurrentInstallmentData.count,
        period: remCurrentInstallmentData.period,
        interestRate: remCurrentInstallmentData.interestRate,
        installments: remCurrentInstallmentData.installments.map(i => ({ ...i })),
        createdAt: Date.now()
    };
    groups.push(newGroup);
    saveInstallmentGroups(groups);
    showToast(safeT('label.rate.savedAsReminders'), 'success', 2500);
    vibrate(20);
    playTick(0, 1500, 0.08, 0.03);
    updateAppBadge();
    const box = el('rem-rate-calc-result-box'); if (box) box.style.display = 'none';
    renderRemindersRate();
}
function toggleInstallmentPaidFromReminders(groupId, installmentIdx) {
    const groups = loadInstallmentGroups();
    const group = groups.find(g => g.id === groupId);
    if (!group) return;
    if (!group.installments || !group.installments[installmentIdx]) return;
    group.installments[installmentIdx].paid = !group.installments[installmentIdx].paid;
    group.updatedAt = Date.now();
    saveInstallmentGroups(groups);
    vibrate(20);
    playTick(0, 1500, 0.08, 0.03);
    if (el('rem-history-list')) renderRemindersHistoryList();
    if (el('rem-rate-list')) renderRemindersRate();
    updateAppBadge();
}
async function deleteInstallmentGroup(groupId) {
    const ok = await showConfirm(safeT('label.rate.deleteConfirm'));
    if (!ok) return;
    let groups = loadInstallmentGroups();
    groups = groups.filter(g => g.id !== groupId);
    saveInstallmentGroups(groups);
    try {
        let bills = loadReminders('cx_bills');
        bills = bills.filter(b => b.installmentGroupId !== groupId);
        saveReminders('cx_bills', bills);
    } catch (e) {}
    showToast(safeT('label.rate.deleted'), 'info', 1500);
    vibrate(15);
    renderRemindersRate();
    updateAppBadge();
}

const INSTALLMENT_GROUPS_KEY = 'cx_installment_groups';
function loadInstallmentGroups() {
    try {
        const raw = JSON.parse(localStorage.getItem(INSTALLMENT_GROUPS_KEY));
        if (Array.isArray(raw)) return raw;
    } catch (e) {}
    return [];
}
function saveInstallmentGroups(groups) {
    try { localStorage.setItem(INSTALLMENT_GROUPS_KEY, JSON.stringify(groups)); } catch (e) {}
}

function getAllReminderItems() {
    const items = [];
    loadReminders('cx_birthdays').forEach(b => {
        items.push({ id: b.id, type: 'birthday', category: 'birthdays', title: b.name || 'Rođendan', subtitle: b.note || '', dueDate: b.date, isDone: !!b.done, icon: 'cake', color: '#ec4899', raw: b });
    });
    loadReminders('cx_bills').forEach(b => {
        items.push({ id: b.id, type: 'bill', category: 'bills', title: b.name || 'Račun', subtitle: (b.amount ? b.amount + ' ' + (b.currency || 'RSD') : ''), dueDate: null, isDone: !!b.paid, icon: 'receipt', color: '#10b981', raw: b });
    });
    loadReminders('cx_vehicles').forEach(v => {
        if (v.regDate) items.push({ id: v.id + '-reg', type: 'vehicle-reg', category: 'vehicles', title: (v.name || 'Vozilo') + ' — Registracija', subtitle: v.plate || '', dueDate: v.regDate, isDone: !!v.done, icon: 'car', color: '#f43f5e', raw: v });
        if (v.techDate) items.push({ id: v.id + '-tech', type: 'vehicle-tech', category: 'vehicles', title: (v.name || 'Vozilo') + ' — Tehnički', subtitle: v.plate || '', dueDate: v.techDate, isDone: !!v.done, icon: 'wrench', color: '#f43f5e', raw: v });
    });
    loadReminders('cx_documents').forEach(d => {
        items.push({ id: d.id, type: 'document', category: 'documents', title: d.name || 'Dokument', subtitle: '', dueDate: d.expires, isDone: !!d.done, icon: 'clipboard', color: '#8b5cf6', raw: d });
    });
    loadReminders('cx_subscriptions').forEach(s => {
        items.push({ id: s.id, type: 'subscription', category: 'subscriptions', title: s.name || 'Pretplata', subtitle: (s.amount ? s.amount + ' ' + (s.currency || 'RSD') : ''), dueDate: null, isDone: !s.active, icon: 'creditCard', color: '#14b8a6', raw: s });
    });
    loadReminders('cx_medications').forEach(m => {
        items.push({ id: m.id, type: 'medication', category: 'medications', title: m.name || 'Lek', subtitle: m.dose || '', dueDate: m.endDate, isDone: !!m.done, icon: 'heartPulse', color: '#ec4899', raw: m });
    });
    loadReminders('cx_anniversaries').forEach(a => {
        items.push({ id: a.id, type: 'anniversary', category: 'anniversaries', title: a.name || 'Godišnjica', subtitle: a.note || '', dueDate: a.date, isDone: !!a.done, icon: 'gift', color: '#a855f7', raw: a });
    });
    loadReminders('cx_notes').forEach(n => {
        items.push({ id: n.id, type: 'note', category: 'notes', title: n.title || 'Napomena', subtitle: n.description || '', dueDate: n.dueDate, isDone: !!n.done, icon: 'clipboard', color: '#f59e0b', raw: n });
    });
    try {
        const groups = loadInstallmentGroups();
        groups.forEach(group => {
            (group.installments || []).forEach((inst, idx) => {
                if (!inst.paid) return;
                items.push({
                    id: `${group.id}|${idx}`, type: 'installment', category: 'installments',
                    title: `${group.description || safeT('label.rate.installment')} — ${safeT('label.rate.rate')} ${inst.number}/${group.installments.length}`,
                    subtitle: `${(inst.amount || 0).toLocaleString('sr-RS')} RSD`,
                    dueDate: inst.date, isDone: true, icon: 'creditCard', color: '#6b7280',
                    raw: { groupId: group.id, idx }
                });
            });
        });
    } catch (e) {}
    try {
        const receipts = loadReceipts();
        receipts.forEach(r => {
            const amount = r.amount || 0;
            const currency = r.currency || 'RSD';
            const catLabel = safeT('receipt.category.' + (r.category || 'ostalo'));
            items.push({
                id: 'receipt_' + r.id,
                type: 'receipt',
                category: 'receipts',
                title: catLabel + (r.period ? ' — ' + formatPeriodMonth(r.period) : ''),
                subtitle: fmt(amount, 0) + ' ' + currency,
                dueDate: r.dueDate,
                isDone: !!r.paid,
                icon: 'receipt',
                color: r.paid ? '#10b981' : '#f43f5e',
                raw: r
            });
        });
    } catch (e) {}
    return items;
}

function renderRemindersHistoryList() {
    const listBox = el('rem-history-list');
    const statsBox = el('rem-history-stats');
    if (!listBox) return;
    const allItems = getAllReminderItems();
    populateYearDropdown(allItems);
    const searchQuery = (el('rem-history-search') ? el('rem-history-search').value : '').toLowerCase().trim();
    const statusFilter = el('rem-history-filter') ? el('rem-history-filter').value : 'done';
    const monthFilter = el('rem-history-month') ? el('rem-history-month').value : 'all';
    const yearFilter = el('rem-history-year') ? el('rem-history-year').value : 'all';
    let filtered = allItems.filter(item => {
        if (!item.isDone) return false;
        if (monthFilter !== 'all') {
            const itemMonth = item.dueDate ? new Date(item.dueDate).getMonth() + 1 : null;
            if (itemMonth !== parseInt(monthFilter)) return false;
        }
        if (yearFilter !== 'all') {
            const itemYear = item.dueDate ? new Date(item.dueDate).getFullYear() : null;
            if (itemYear !== parseInt(yearFilter)) return false;
        }
        if (searchQuery) {
            const name = (item.title || '').toLowerCase();
            const desc = (item.subtitle || '').toLowerCase();
            if (!name.includes(searchQuery) && !desc.includes(searchQuery)) return false;
        }
        return true;
    });
    filtered.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(b.dueDate) - new Date(a.dueDate);
    });
    if (statsBox) {
        const totalDone = allItems.filter(i => i.isDone).length;
        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();
        const doneThisMonth = allItems.filter(i => {
            if (!i.isDone || !i.dueDate) return false;
            const d = new Date(i.dueDate);
            return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        }).length;
        statsBox.innerHTML = `
            <div class="rem-stat-item"><div class="rem-stat-value">${totalDone}</div><div class="rem-stat-label">${safeT('rem.history.stats.done')}</div></div>
            <div class="rem-stat-item"><div class="rem-stat-value">${doneThisMonth}</div><div class="rem-stat-label">${safeT('rem.history.stats.thisMonth')}</div></div>
            <div class="rem-stat-item"><div class="rem-stat-value">${filtered.length}</div><div class="rem-stat-label">${safeT('rem.history.stats.total')}</div></div>
        `;
    }
    if (filtered.length === 0) {
        listBox.innerHTML = `<div class="rem-history-empty">${searchQuery || statusFilter !== 'all' || monthFilter !== 'all' || yearFilter !== 'all' ? safeT('rem.history.empty.filter') : safeT('rem.history.empty')}</div>`;
        return;
    }
    listBox.innerHTML = filtered.map(item => renderHistoryItem(item)).join('');
}

function populateYearDropdown(items) {
    const yearSelect = el('rem-history-year');
    if (!yearSelect) return;
    const currentValue = yearSelect.value;
    const years = new Set();
    const currentYear = new Date().getFullYear();
    for (let i = -5; i <= 5; i++) years.add(currentYear + i);
    items.forEach(item => {
        if (item.dueDate) {
            const year = new Date(item.dueDate).getFullYear();
            if (!isNaN(year) && year >= 2020) years.add(year);
        }
    });
    const sortedYears = Array.from(years).sort((a, b) => b - a);
    yearSelect.innerHTML = `<option value="all">${safeT('rem.history.allYears')}</option>` + sortedYears.map(y => `<option value="${y}">${y}</option>`).join('');
    if (currentValue && yearSelect.querySelector(`option[value="${currentValue}"]`)) yearSelect.value = currentValue;
}

function renderHistoryItem(item) {
    const days = item.dueDate ? daysUntilDate(item.dueDate) : null;
    const daysTxt = days !== null ? formatDaysToHuman(days) : '';
    const color = days !== null ? urgencyColor(days) : item.color;
    const doneClass = item.isDone ? ' rem-item-done' : '';
    let yearsBadge = '';
    if (item.type === 'anniversary' && item.dueDate) {
        const ys = yearsSinceDate(item.dueDate);
        if (ys) {
            let yearsText = `${ys.years} ${safeT('rem.ann.yearsPassed')}`;
            if (ys.months > 0 || ys.days > 0) {
                yearsText += `, ${ys.months} ${safeT('rem.ann.monthsShort')}`;
                if (ys.days > 0) yearsText += `, ${ys.days} ${safeT('rem.ann.daysShort')}`;
            }
            yearsBadge += `<div class="rem-years-badge"><span class="years-icon">💍</span>${escapeHtml(safeT('rem.ann.yearsTogether'))}: ${escapeHtml(yearsText)}</div>`;
        }
        const jub = nextJubileeYears(item.dueDate);
        if (jub) yearsBadge += `<div class="rem-jubilee-badge"><span class="years-icon">🎉</span>${safeT('rem.ann.nextJubilee')}: ${jub.years} ${safeT('rem.ann.years')} — ${safeT('rem.ann.jubileeIn')} ${jub.daysUntil} ${safeT('rem.days')}</div>`;
    }
    return `
        <div class="rem-history-item${doneClass}" style="--rem-color: ${color};">
            <div class="rem-history-icon">${icon(item.icon)}</div>
            <div class="rem-history-body">
                <div class="rem-history-title">${escapeHtml(item.title)}</div>
                ${item.subtitle ? `<div class="rem-history-sub">${escapeHtml(item.subtitle)}</div>` : ''}
                ${item.dueDate ? `<div class="rem-history-date">📅 ${escapeHtml(item.dueDate)}${daysTxt ? ' • ' + escapeHtml(daysTxt) : ''}</div>` : ''}
                ${yearsBadge}
            </div>
            <div class="rem-history-actions">
                ${item.type !== 'installment' && item.type !== 'receipt' ? `<button class="rem-action-btn rem-action-edit" onclick="editReminderFromHistory('${item.type}', '${item.category}', '${item.id}')" title="${safeT('rem.history.edit')}">${icon('edit')}</button>` : ''}
                ${item.type !== 'receipt' ? `<button class="rem-action-btn rem-action-toggle ${item.isDone ? 'is-done' : ''}" onclick="toggleDoneFromHistory('${item.type}', '${item.category}', '${item.id}')" title="${item.isDone ? safeT('rem.history.markActive') : safeT('rem.history.markDone')}">${item.isDone ? icon('refresh') : icon('check')}</button>` : ''}
                <button class="rem-action-btn rem-action-delete" onclick="deleteFromHistory('${item.type}', '${item.category}', '${item.id}')" title="${safeT('rem.history.delete')}">${icon('trash')}</button>
            </div>
        </div>
    `;
}

function getReminderStorageKey(type) {
    const map = {
        'birthday': 'cx_birthdays', 'bill': 'cx_bills', 'vehicle-reg': 'cx_vehicles', 'vehicle-tech': 'cx_vehicles',
        'document': 'cx_documents', 'subscription': 'cx_subscriptions', 'medication': 'cx_medications',
        'anniversary': 'cx_anniversaries', 'note': 'cx_notes'
    };
    return map[type] || null;
}

function editReminderFromHistory(type, category, id) {
    const key = getReminderStorageKey(type);
    if (!key) { showToast('Nepoznat tip', 'error'); return; }
    let realId = id;
    if (type === 'vehicle-reg' || type === 'vehicle-tech') realId = id.replace('-reg', '').replace('-tech', '');
    const item = loadReminders(key).find(x => String(x.id) === String(realId));
    if (!item) { showToast('Podsetnik nije pronađen', 'error'); return; }
    const typeMap = {
        'birthday': 'birthday', 'bill': 'bill', 'vehicle-reg': 'vehicle', 'vehicle-tech': 'vehicle',
        'document': 'document', 'subscription': 'subscription', 'medication': 'medication',
        'anniversary': 'anniversary', 'note': 'note'
    };
    const formType = typeMap[type];
    if (formType && typeof openReminderForm === 'function') openReminderForm(formType, item);
}

function toggleDoneFromHistory(type, category, id) {
    if (type === 'installment') {
        const parts = id.split('|');
        toggleInstallmentPaidFromReminders(parts[0], parseInt(parts[1]));
        setTimeout(() => renderRemindersHistoryList(), 100);
        return;
    }
    if (type === 'receipt') {
        const receiptId = id.replace('receipt_', '');
        const r = getReceiptById(receiptId);
        if (!r) return;
        if (r.paid) markReceiptUnpaid(receiptId);
        else markReceiptPaid(receiptId);
        setTimeout(() => renderRemindersHistoryList(), 150);
        return;
    }
    const key = getReminderStorageKey(type);
    if (!key) { showToast('Nepoznat tip', 'error'); return; }
    let realId = id;
    if (type === 'vehicle-reg' || type === 'vehicle-tech') realId = id.replace('-reg', '').replace('-tech', '');
    const list = loadReminders(key);
    const idx = list.findIndex(x => String(x.id) === String(realId));
    if (idx === -1) { showToast('Podsetnik nije pronađen', 'error'); return; }
    const item = list[idx];
    let wasDone;
    if (type === 'bill') { wasDone = !!item.paid; item.paid = !item.paid; }
    else if (type === 'subscription') { wasDone = !item.active; item.active = !item.active; }
    else { wasDone = !!item.done; item.done = !item.done; }
    saveReminders(key, list);
    if (wasDone) showToast('Vraćeno u aktivne podsetnike', 'success', 1800);
    else showToast('Označeno kao završeno', 'success', 1800);
    vibrate(20);
    playTick(0, 1500, 0.08, 0.03);
    setTimeout(() => { renderRemindersHistoryList(); updateAppBadge(); }, 100);
}

async function deleteFromHistory(type, category, id) {
    if (type === 'installment') {
        const parts = id.split('|');
        const groupId = parts[0];
        const idx = parseInt(parts[1]);
        const ok = await showConfirm(safeT('confirm.rate.delete'));
        if (!ok) return;
        const groups = loadInstallmentGroups();
        const group = groups.find(g => g.id === groupId);
        if (!group) { showToast('Rata nije pronađena', 'error'); return; }
        if (!group.installments || !group.installments[idx]) { showToast('Rata nije pronađena', 'error'); return; }
        group.installments.splice(idx, 1);
        group.updatedAt = Date.now();
        if (group.installments.length === 0) {
            const idxG = groups.findIndex(g => g.id === groupId);
            if (idxG !== -1) groups.splice(idxG, 1);
        } else group.installments.forEach((inst, i) => { inst.number = i + 1; });
        saveInstallmentGroups(groups);
        showToast('Rata obrisana', 'info', 1500);
        vibrate(15);
        renderRemindersHistoryList();
        updateAppBadge();
        return;
    }
    if (type === 'receipt') {
        const receiptId = id.replace('receipt_', '');
        deleteReceipt(receiptId);
        setTimeout(() => renderRemindersHistoryList(), 200);
        return;
    }
    const key = getReminderStorageKey(type);
    if (!key) return;
    const ok = await showConfirm(safeT('confirm.rem.delete'));
    if (!ok) return;
    let realId = id;
    if (type === 'vehicle-reg' || type === 'vehicle-tech') realId = id.replace('-reg', '').replace('-tech', '');
    let list = loadReminders(key);
    list = list.filter(x => String(x.id) !== String(realId));
    saveReminders(key, list);
    showToast(safeT('toast.rem.deleted'), 'info', 1500);
    vibrate(15);
    renderRemindersHistoryList();
    updateAppBadge();
}

function exportRemindersHistory() {
    const allItems = getAllReminderItems();
    if (!allItems.length) { showToast(safeT('rem.history.empty'), 'info'); return; }
    const lines = ['=== ARHIVA PODSETNIKA ===', 'Datum izvoza: ' + new Date().toLocaleString('sr-RS'), ''];
    const done = allItems.filter(i => i.isDone);
    if (done.length) {
        lines.push('--- ZAVRŠENI (' + done.length + ') ---');
        done.forEach(item => {
            lines.push('• ' + (item.title || ''));
            if (item.subtitle) lines.push('  ' + item.subtitle);
            if (item.dueDate) lines.push('  Rok: ' + item.dueDate);
            lines.push('');
        });
    }
    const text = lines.join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'alatika-arhiva-' + new Date().toISOString().slice(0, 10) + '.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Fajl preuzet', 'success', 2000);
    vibrate(20);
}

async function shareRemindersHistory() {
    const allItems = getAllReminderItems();
    const doneItems = allItems.filter(i => i.isDone);
    if (!doneItems.length) { showToast(safeT('rem.history.empty'), 'info'); return; }
    const lines = ['📦 ARHIVA PODSETNIKA — Alatika', ''];
    lines.push('Ukupno završenih: ' + doneItems.length);
    lines.push('');
    doneItems.slice(0, 30).forEach(item => {
        lines.push('• ' + (item.title || ''));
        if (item.subtitle) lines.push('  ' + item.subtitle);
        if (item.dueDate) lines.push('  Rok: ' + item.dueDate);
    });
    if (doneItems.length > 30) { lines.push(''); lines.push('... i još ' + (doneItems.length - 30) + ' stavki'); }
    const text = lines.join('\n');
    if (navigator.share) { try { await navigator.share({ title: 'Arhiva podsetnika — Alatika', text }); vibrate(20); } catch (e) {} }
    else fallbackCopy(text, () => showToast('Kopirano u clipboard', 'success', 2000));
}

// ============================================================
// REMINDER MODAL FORMA
// ============================================================
let currentReminderType = null;
let currentReminderEditId = null;

function openReminderForm(type, editItem = null) {
    currentReminderType = type;
    currentReminderEditId = editItem ? editItem.id : null;
    const modal = el('reminder-modal');
    const title = el('reminder-modal-title');
    const body = el('reminder-modal-body');
    if (!modal || !body) return;
    const tkey = editItem ? 'rem.edit.title' : 'rem.add.title';
    if (title) title.textContent = safeT(tkey);
    body.innerHTML = buildReminderForm(type, editItem);
    modal.classList.add('show');
    document.body.classList.add('modal-open');
    vibrate(15);
    playTick(0, 1400, 0.06, 0.02);
    try { restoreInputsFor(body); } catch (e) {}
    try { setupDateTriplesIn(body); } catch (e) {}
    if (editItem) fillReminderForm(type, editItem);
}

function buildReminderForm(type, item) {
    const forms = {
        birthday: () => `${inputFieldText('rem.bd.name', 'rem-bd-name', safeT('placeholder.name'))}${dateTripleField('rem.bd.date', 'rem-bd-date')}${inputField('rem.bd.remindBefore', 'rem-bd-remind', safeT('rem.days'), 'value="3"')}<div class="input-field"><label>${safeT('rem.bd.favorite')}</label><label class="rem-check"><input type="checkbox" id="rem-bd-fav"><span></span></label></div>${inputFieldText('rem.bd.note', 'rem-bd-note', '')}`,
        bill: () => `${inputFieldText('rem.bill.name', 'rem-bill-name', 'npr. Struja')}${inputField('rem.bill.amount', 'rem-bill-amount', 'RSD', 'placeholder="3000"')}${selectField('rem.bill.period', 'rem-bill-period', [{ value: 'monthly', text: safeT('rem.bill.period.monthly') }, { value: 'quarterly', text: safeT('rem.bill.period.quarterly') }, { value: 'yearly', text: safeT('rem.bill.period.yearly') }, { value: 'onetime', text: safeT('rem.bill.period.onetime') }], 'monthly')}${inputField('rem.bill.dayOfMonth', 'rem-bill-day', '', 'value="1" min="1" max="31"')}${inputField('rem.bill.reminder', 'rem-bill-remind', safeT('rem.days'), 'value="3"')}<div class="input-field"><label>${safeT('rem.bill.paid')}</label><label class="rem-check"><input type="checkbox" id="rem-bill-paid"><span></span></label></div>`,
        vehicle: () => `${inputFieldText('rem.veh.name', 'rem-veh-name', 'npr. Golf 7')}${inputFieldText('rem.veh.plate', 'rem-veh-plate', 'npr. NP123-AB')}${dateTripleField('rem.veh.regDate', 'rem-veh-reg')}${dateTripleField('rem.veh.techDate', 'rem-veh-tech')}${dateTripleField('rem.veh.insuranceDate', 'rem-veh-ins')}${inputFieldText('rem.veh.note', 'rem-veh-note', '')}`,
        document: () => `${selectField('rem.doc.type', 'rem-doc-type', [{ value: 'lk', text: safeT('rem.doc.type.lk') }, { value: 'passport', text: safeT('rem.doc.type.passport') }, { value: 'drivers', text: safeT('rem.doc.type.drivers') }, { value: 'health', text: safeT('rem.doc.type.health') }, { value: 'custom', text: safeT('rem.doc.type.custom') }])}${inputFieldText('rem.doc.name', 'rem-doc-name', '')}${dateTripleField('rem.doc.expires', 'rem-doc-exp')}${inputFieldText('rem.doc.note', 'rem-doc-note', '')}`,
        subscription: () => `${inputFieldText('rem.sub.name', 'rem-sub-name', 'npr. Netflix')}${inputField('rem.sub.amount', 'rem-sub-amount', 'RSD', 'placeholder="999"')}${inputField('rem.sub.dayOfMonth', 'rem-sub-day', '', 'value="1" min="1" max="31"')}${selectField('rem.sub.period', 'rem-sub-period', [{ value: 'monthly', text: safeT('rem.bill.period.monthly') }, { value: 'yearly', text: safeT('rem.bill.period.yearly') }], 'monthly')}<div class="input-field"><label>${safeT('rem.sub.active')}</label><label class="rem-check"><input type="checkbox" id="rem-sub-active" checked><span></span></label></div>`,
        medication: () => `${inputFieldText('rem.med.name', 'rem-med-name', 'npr. Aspirin')}${inputFieldText('rem.med.dose', 'rem-med-dose', 'npr. 100mg')}${selectField('rem.med.time', 'rem-med-time', [{ value: 'morning', text: safeT('rem.med.time.morning') }, { value: 'noon', text: safeT('rem.med.time.noon') }, { value: 'evening', text: safeT('rem.med.time.evening') }], 'morning')}${selectField('rem.med.frequency', 'rem-med-freq', [{ value: 'daily', text: safeT('rem.med.freq.daily') }, { value: 'everyOther', text: safeT('rem.med.freq.everyOther') }, { value: 'weekly', text: safeT('rem.med.freq.weekly') }], 'daily')}${dateTripleField('rem.med.startDate', 'rem-med-start')}${dateTripleField('rem.med.endDate', 'rem-med-end')}${inputField('rem.med.remaining', 'rem-med-remaining', '', 'placeholder="30"')}${inputFieldText('rem.med.note', 'rem-med-note', '')}`,
        anniversary: () => `${inputFieldText('rem.ann.name', 'rem-ann-name', '')}${selectField('rem.ann.type', 'rem-ann-type', [{ value: 'wedding', text: safeT('rem.ann.type.wedding') }, { value: 'engagement', text: safeT('rem.ann.type.engagement') }, { value: 'firstDate', text: safeT('rem.ann.type.firstDate') }, { value: 'firstKiss', text: safeT('rem.ann.type.firstKiss') }, { value: 'meeting', text: safeT('rem.ann.type.meeting') }, { value: 'custom', text: safeT('rem.ann.type.custom') }], 'wedding')}${dateTripleField('rem.ann.date', 'rem-ann-date')}${inputField('rem.ann.remindBefore', 'rem-ann-remind', safeT('rem.days'), 'value="3"')}<div class="input-field"><label>${safeT('rem.ann.favorite')}</label><label class="rem-check"><input type="checkbox" id="rem-ann-fav"><span></span></label></div>${inputFieldText('rem.ann.note', 'rem-ann-note', '')}`,
        note: () => `${inputFieldText('rem.note.title', 'rem-note-title', '')}<div class="input-field"><label>${safeT('rem.note.description')}</label><textarea id="rem-note-desc" class="custom-input rem-textarea" rows="4"></textarea></div>${dateTripleField('rem.note.dueDate', 'rem-note-due')}${selectField('rem.note.priority', 'rem-note-priority', [{ value: 'high', text: safeT('rem.priority.high') }, { value: 'medium', text: safeT('rem.priority.medium') }, { value: 'low', text: safeT('rem.priority.low') }], 'medium')}<div class="input-field"><label>${safeT('rem.note.done')}</label><label class="rem-check"><input type="checkbox" id="rem-note-done"><span></span></label></div>`
    };
    const fn = forms[type];
    const html = fn ? fn() : '<p>Nepoznat tip</p>';
    return `<div class="reminder-form-inner">${html}<div class="rem-form-actions"><button class="calc-btn-main" onclick="saveReminderForm()">${safeT('rem.save')}</button>${item ? `<button class="rem-delete-btn" onclick="confirmDeleteReminder()">${safeT('rem.delete')}</button>` : ''}</div></div>`;
}

function fillReminderForm(type, item) {
    setTimeout(() => {
        const setV = (id, v) => { const e = el(id); if (e) e.value = v == null ? '' : v; };
        const setC = (id, v) => { const e = el(id); if (e) e.checked = !!v; };
        const setD = (id, v) => { if (v) setTripleDate(id, v); };
        switch (type) {
            case 'birthday': setV('rem-bd-name', item.name); setD('rem-bd-date', item.date); setV('rem-bd-remind', item.remindBefore || 3); setC('rem-bd-fav', item.favorite); setV('rem-bd-note', item.note); break;
            case 'bill': setV('rem-bill-name', item.name); setV('rem-bill-amount', item.amount); setV('rem-bill-period', item.period || 'monthly'); setV('rem-bill-day', item.dayOfMonth || 1); setV('rem-bill-remind', item.remindBefore || 3); setC('rem-bill-paid', item.paid); break;
            case 'vehicle': setV('rem-veh-name', item.name); setV('rem-veh-plate', item.plate); setD('rem-veh-reg', item.regDate); setD('rem-veh-tech', item.techDate); setD('rem-veh-ins', item.insuranceDate); setV('rem-veh-note', item.note); break;
            case 'document': setV('rem-doc-type', item.type || 'lk'); setV('rem-doc-name', item.name); setD('rem-doc-exp', item.expires); setV('rem-doc-note', item.note); break;
            case 'subscription': setV('rem-sub-name', item.name); setV('rem-sub-amount', item.amount); setV('rem-sub-day', item.dayOfMonth || 1); setV('rem-sub-period', item.period || 'monthly'); setC('rem-sub-active', item.active); break;
            case 'medication': setV('rem-med-name', item.name); setV('rem-med-dose', item.dose); setV('rem-med-time', item.time || 'morning'); setV('rem-med-freq', item.frequency || 'daily'); setD('rem-med-start', item.startDate); setD('rem-med-end', item.endDate); setV('rem-med-remaining', item.remaining); setV('rem-med-note', item.note); break;
            case 'anniversary': setV('rem-ann-name', item.name); setV('rem-ann-type', item.annType || 'wedding'); setD('rem-ann-date', item.date); setV('rem-ann-remind', item.remindBefore || 3); setC('rem-ann-fav', item.favorite); setV('rem-ann-note', item.note); break;
            case 'note': setV('rem-note-title', item.title); setV('rem-note-desc', item.description); setD('rem-note-due', item.dueDate); setV('rem-note-priority', item.priority || 'medium'); setC('rem-note-done', item.done); break;
        }
    }, 100);
}

function saveReminderForm() {
    const type = currentReminderType;
    if (!type) return;
    const typeToKey = {
        birthday: REMINDER_KEYS.birthdays, bill: REMINDER_KEYS.bills, vehicle: REMINDER_KEYS.vehicles,
        document: REMINDER_KEYS.documents, subscription: REMINDER_KEYS.subscriptions, medication: REMINDER_KEYS.medications,
        anniversary: REMINDER_KEYS.anniversaries, note: REMINDER_KEYS.notes
    };
    const key = typeToKey[type];
    if (!key) return;
    const v = id => { const e = el(id); return e ? e.value.trim() : ''; };
    const n = id => { const e = el(id); return e ? parseNum(e.value) : null; };
    const c = id => { const e = el(id); return e ? e.checked : false; };
    let data = {};
    switch (type) {
        case 'birthday': {
            const name = v('rem-bd-name'); const date = getTripleDate('rem-bd-date');
            if (!name) { showToast(safeT('toast.rem.error.name') || 'Unesi ime.', 'error'); return; }
            if (!date) { showToast(safeT('toast.rem.error.date') || 'Unesi datum.', 'error'); return; }
            data = { name, date, remindBefore: n('rem-bd-remind') || 3, favorite: c('rem-bd-fav'), note: v('rem-bd-note') }; break;
        }
        case 'bill': {
            const name = v('rem-bill-name'); const amount = n('rem-bill-amount');
            if (!name) { showToast(safeT('toast.rem.error.name') || 'Unesi naziv.', 'error'); return; }
            data = { name, amount: amount || 0, period: v('rem-bill-period') || 'monthly', dayOfMonth: n('rem-bill-day') || 1, remindBefore: n('rem-bill-remind') || 3, paid: c('rem-bill-paid') }; break;
        }
        case 'vehicle': {
            const name = v('rem-veh-name');
            if (!name) { showToast(safeT('toast.rem.error.name') || 'Unesi naziv.', 'error'); return; }
            data = { name, plate: v('rem-veh-plate'), regDate: getTripleDate('rem-veh-reg'), techDate: getTripleDate('rem-veh-tech'), insuranceDate: getTripleDate('rem-veh-ins'), note: v('rem-veh-note') }; break;
        }
        case 'document': {
            const docType = v('rem-doc-type') || 'lk';
            data = { type: docType, name: v('rem-doc-name') || safeT('rem.doc.type.' + docType), expires: getTripleDate('rem-doc-exp'), note: v('rem-doc-note') };
            if (!data.expires) { showToast(safeT('toast.rem.error.date') || 'Unesi datum.', 'error'); return; }
            break;
        }
        case 'subscription': {
            const name = v('rem-sub-name');
            if (!name) { showToast(safeT('toast.rem.error.name') || 'Unesi naziv.', 'error'); return; }
            data = { name, amount: n('rem-sub-amount') || 0, dayOfMonth: n('rem-sub-day') || 1, period: v('rem-sub-period') || 'monthly', active: c('rem-sub-active') }; break;
        }
        case 'medication': {
            const name = v('rem-med-name');
            if (!name) { showToast(safeT('toast.rem.error.name') || 'Unesi naziv.', 'error'); return; }
            data = { name, dose: v('rem-med-dose'), time: v('rem-med-time') || 'morning', frequency: v('rem-med-freq') || 'daily', startDate: getTripleDate('rem-med-start'), endDate: getTripleDate('rem-med-end'), remaining: n('rem-med-remaining') || 0, note: v('rem-med-note') }; break;
        }
        case 'anniversary': {
            const name = v('rem-ann-name'); const date = getTripleDate('rem-ann-date');
            if (!name) { showToast(safeT('toast.rem.error.name') || 'Unesi naziv.', 'error'); return; }
            if (!date) { showToast(safeT('toast.rem.error.date') || 'Unesi datum.', 'error'); return; }
            data = { name, annType: v('rem-ann-type') || 'wedding', date, remindBefore: n('rem-ann-remind') || 3, favorite: c('rem-ann-fav'), note: v('rem-ann-note') }; break;
        }
        case 'note': {
            const title = v('rem-note-title');
            if (!title) { showToast(safeT('toast.rem.error.name') || 'Unesi naslov.', 'error'); return; }
            data = { title, description: v('rem-note-desc'), dueDate: getTripleDate('rem-note-due'), priority: v('rem-note-priority') || 'medium', done: c('rem-note-done') }; break;
        }
    }
    if (currentReminderEditId) updateReminder(key, currentReminderEditId, data);
    else addReminder(key, data);
    showToast(safeT('toast.rem.saved') || 'Sačuvano.', 'success');
    vibrate(20);
    playTick(0, 1500, 0.08, 0.03);
    closeReminderModal();
    renderReminderList(type);
    updateAppBadge();
}

function closeReminderModal() {
    const modal = el('reminder-modal');
    if (modal) modal.classList.remove('show');
    document.body.classList.remove('modal-open');
    currentReminderType = null;
    currentReminderEditId = null;
}

function confirmDeleteReminder() {
    if (!currentReminderEditId || !currentReminderType) return;
    const type = currentReminderType;
    const id = currentReminderEditId;
    const typeToKey = {
        birthday: REMINDER_KEYS.birthdays, bill: REMINDER_KEYS.bills, vehicle: REMINDER_KEYS.vehicles,
        document: REMINDER_KEYS.documents, subscription: REMINDER_KEYS.subscriptions, medication: REMINDER_KEYS.medications,
        anniversary: REMINDER_KEYS.anniversaries, note: REMINDER_KEYS.notes
    };
    const key = typeToKey[type];
    if (!key) return;
    showConfirm(safeT('confirm.rem.delete')).then(ok => {
        if (!ok) return;
        deleteReminder(key, id);
        showToast(safeT('toast.rem.deleted') || 'Obrisano.', 'info');
        closeReminderModal();
        renderReminderList(type);
        updateAppBadge();
    });
}

function renderReminderList(type) {
    const typeToKey = {
        birthday: REMINDER_KEYS.birthdays, bill: REMINDER_KEYS.bills, vehicle: REMINDER_KEYS.vehicles,
        document: REMINDER_KEYS.documents, subscription: REMINDER_KEYS.subscriptions, medication: REMINDER_KEYS.medications,
        anniversary: REMINDER_KEYS.anniversaries, note: REMINDER_KEYS.notes
    };
    const key = typeToKey[type];
    if (!key) return;
    const listId = {
        birthday: 'rem-bd-list', bill: 'rem-bills-list', vehicle: 'rem-veh-list', document: 'rem-doc-list',
        subscription: 'rem-subs-list', medication: 'rem-meds-list', anniversary: 'rem-ann-list', note: 'rem-notes-list'
    }[type];
    const list = el(listId);
    if (!list) return;
    const items = loadReminders(key);
    if (items.length === 0) list.innerHTML = `<div class="rem-empty-small">${safeT('rem.empty')}</div>`;
    else list.innerHTML = items.map(item => renderReminderItem(type, item)).join('');
    if (type === 'bill') renderBillsSummary();
    if (type === 'subscription') renderSubsSummary();
}

function renderReminderItem(type, item) {
    let title = '', subtitle = '', days = null, accent = '#f59e0b';
    switch (type) {
        case 'birthday': title = item.name; days = daysToBirthday(item.date); subtitle = formatDaysToHuman(days); accent = urgencyColor(days); break;
        case 'bill': { title = item.name; days = item.paid ? null : daysToBillDay(item.dayOfMonth); subtitle = `${item.amount || 0} ${item.currency || 'RSD'} • ${item.paid ? safeT('rem.paid') : formatDaysToHuman(days)}`; accent = item.paid ? '#10b981' : urgencyColor(days); break; }
        case 'vehicle': {
            title = item.name + (item.plate ? ' (' + item.plate + ')' : '');
            const dates = [{ d: item.regDate, l: safeT('rem.veh.regDate') }, { d: item.techDate, l: safeT('rem.veh.techDate') }, { d: item.insuranceDate, l: safeT('rem.veh.insuranceDate') }].filter(x => x.d);
            if (dates.length) {
                const min = dates.reduce((a, b) => { const da = daysUntilDate(a.d); const db = daysUntilDate(b.d); return (db !== null && (da === null || db < da)) ? b : a; });
                days = daysUntilDate(min.d); subtitle = min.l + ' • ' + formatDaysToHuman(days); accent = urgencyColor(days);
            } break;
        }
        case 'document': title = item.name || item.type; days = daysUntilDate(item.expires); subtitle = safeT('rem.doc.expires') + ' • ' + formatDaysToHuman(days); accent = urgencyColor(days); break;
        case 'subscription': title = item.name; days = item.active ? daysToBillDay(item.dayOfMonth) : null; subtitle = `${item.amount || 0} ${item.currency || 'RSD'} • ${item.active ? safeT('rem.active') : safeT('rem.inactive')}`; accent = item.active ? urgencyColor(days) : '#6b7280'; break;
        case 'medication': title = item.name + (item.dose ? ' — ' + item.dose : ''); days = daysUntilDate(item.endDate); subtitle = `${safeT('rem.med.time.' + (item.time || 'morning'))} • ${safeT('rem.med.freq.' + (item.frequency || 'daily'))}${item.remaining ? ' • ' + item.remaining + ' tbl' : ''}`; accent = urgencyColor(days); break;
        case 'anniversary': title = item.name; days = daysToAnniversary(item.date); subtitle = formatDaysToHuman(days); accent = urgencyColor(days); break;
        case 'note': title = item.title; days = item.dueDate ? daysUntilDate(item.dueDate) : null; subtitle = item.description ? item.description.slice(0, 60) : ''; accent = item.priority === 'high' ? '#f43f5e' : item.priority === 'medium' ? '#f59e0b' : '#10b981'; break;
    }
    const daysTxt = days !== null ? formatDaysToHuman(days) : '';
    const daysCol = days !== null ? urgencyColor(days) : '';
    let yearsBadge = '';
    if (type === 'anniversary' && item.date) {
        const ys = yearsSinceDate(item.date);
        if (ys) {
            let yearsText = `${ys.years} ${safeT('rem.ann.yearsPassed')}`;
            if (ys.months > 0 || ys.days > 0) yearsText += `, ${ys.months} ${safeT('rem.ann.monthsShort')}`;
            yearsBadge = `<div class="rem-years-badge" style="font-size:0.68rem; padding: 3px 8px;"><span class="years-icon">💍</span>${escapeHtml(yearsText)}</div>`;
        }
    }
    return `
        <div class="rem-item" onclick="editReminder('${type}', ${item.id})">
            <div class="rem-item-left">
                <div class="rem-item-title">${escapeHtml(title)}</div>
                ${subtitle ? `<div class="rem-item-sub">${escapeHtml(subtitle)}</div>` : ''}
                ${yearsBadge}
            </div>
            ${days !== null ? `<div class="rem-item-days" style="color:${daysCol};">${escapeHtml(daysTxt)}</div>` : ''}
            <button class="rem-item-delete" onclick="event.stopPropagation();deleteReminderById('${type}', ${item.id})">✕</button>
        </div>
    `;
}

function editReminder(type, id) {
    const typeToKey = {
        birthday: REMINDER_KEYS.birthdays, bill: REMINDER_KEYS.bills, vehicle: REMINDER_KEYS.vehicles,
        document: REMINDER_KEYS.documents, subscription: REMINDER_KEYS.subscriptions, medication: REMINDER_KEYS.medications,
        anniversary: REMINDER_KEYS.anniversaries, note: REMINDER_KEYS.notes
    };
    const key = typeToKey[type];
    const item = loadReminders(key).find(x => x.id === id);
    if (!item) return;
    openReminderForm(type, item);
}

function deleteReminderById(type, id) {
    const typeToKey = {
        birthday: REMINDER_KEYS.birthdays, bill: REMINDER_KEYS.bills, vehicle: REMINDER_KEYS.vehicles,
        document: REMINDER_KEYS.documents, subscription: REMINDER_KEYS.subscriptions, medication: REMINDER_KEYS.medications,
        anniversary: REMINDER_KEYS.anniversaries, note: REMINDER_KEYS.notes
    };
    const key = typeToKey[type];
    if (!key) return;
    showConfirm(safeT('confirm.rem.delete')).then(ok => {
        if (!ok) return;
        deleteReminder(key, id);
        showToast(safeT('toast.rem.deleted') || 'Obrisano.', 'info');
        renderReminderList(type);
        updateAppBadge();
    });
}

function renderBillsSummary() {
    const box = el('rem-bills-summary');
    if (!box) return;
    const bills = loadReminders('cx_bills');
    let monthly = 0, yearly = 0;
    bills.forEach(b => {
        if (b.paid) return;
        const amount = b.amount || 0;
        let m = 0;
        if (b.period === 'monthly') m = amount;
        else if (b.period === 'quarterly') m = amount / 3;
        else if (b.period === 'yearly') m = amount / 12;
        monthly += m; yearly += m * 12;
    });
    if (bills.length === 0) { box.innerHTML = ''; return; }
    box.innerHTML = `<div class="rem-summary-row"><span>${safeT('rem.total.monthly')}</span><strong>${money(monthly)} RSD</strong></div><div class="rem-summary-row"><span>${safeT('rem.total.yearly')}</span><strong>${money(yearly)} RSD</strong></div>`;
}

function renderSubsSummary() {
    const box = el('rem-subs-summary');
    if (!box) return;
    const subs = loadReminders('cx_subscriptions');
    let monthly = 0;
    subs.forEach(s => {
        if (!s.active) return;
        const amount = s.amount || 0;
        if (s.period === 'yearly') monthly += amount / 12;
        else monthly += amount;
    });
    if (subs.length === 0) { box.innerHTML = ''; return; }
    box.innerHTML = `<div class="rem-summary-row"><span>${safeT('rem.total.monthly')}</span><strong>${money(monthly)} RSD</strong></div><div class="rem-summary-row"><span>${safeT('rem.total.yearly')}</span><strong>${money(monthly * 12)} RSD</strong></div>`;
}

function hasActiveRemindersWithRemind() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMs = today.getTime();
    const dayMs = 86400000;
    const isInReminderWindow = (targetIso, remindBeforeDays) => {
        if (!targetIso) return false;
        const parts = targetIso.split('-').map(Number);
        if (parts.length !== 3) return false;
        const target = new Date(parts[0], parts[1] - 1, parts[2]);
        target.setHours(0, 0, 0, 0);
        const targetMs = target.getTime();
        const remindDays = parseInt(remindBeforeDays) || 0;
        if (remindDays <= 0) return false;
        const startMs = targetMs - (remindDays * dayMs);
        return todayMs >= startMs && todayMs <= targetMs;
    };
    try {
        if (loadReminders('cx_birthdays').some(b => !b.done && isInReminderWindow(b.date, b.remindBefore))) return true;
        if (loadReminders('cx_anniversaries').some(a => !a.done && isInReminderWindow(a.date, a.remindBefore))) return true;
        const bills = loadReminders('cx_bills');
        for (const b of bills) {
            if (b.paid) continue;
            const day = parseInt(b.dayOfMonth) || 1;
            const remind = parseInt(b.remindBefore) || 0;
            if (remind <= 0) continue;
            let next = new Date(today.getFullYear(), today.getMonth(), day);
            next.setHours(0, 0, 0, 0);
            if (next.getTime() < todayMs) {
                let nm = today.getMonth() + 1;
                let ny = today.getFullYear();
                if (nm > 11) { nm = 0; ny++; }
                next = new Date(ny, nm, day);
                next.setHours(0, 0, 0, 0);
            }
            const startMs = next.getTime() - (remind * dayMs);
            if (todayMs >= startMs && todayMs <= next.getTime()) return true;
        }
        const meds = loadReminders('cx_medications');
        for (const m of meds) {
            if (m.done) continue;
            if (m.endDate) {
                const parts = m.endDate.split('-').map(Number);
                if (parts.length === 3) {
                    const end = new Date(parts[0], parts[1] - 1, parts[2]);
                    end.setHours(0, 0, 0, 0);
                    if (todayMs <= end.getTime()) return true;
                }
            } else return true;
        }
        const notes = loadReminders('cx_notes');
        for (const n of notes) {
            if (n.done) continue;
            if (n.dueDate && isInReminderWindow(n.dueDate, 7)) return true;
        }
        const vehicles = loadReminders('cx_vehicles');
        for (const v of vehicles) {
            if (v.done) continue;
            if (isInReminderWindow(v.regDate, 30)) return true;
            if (isInReminderWindow(v.techDate, 30)) return true;
            if (isInReminderWindow(v.insuranceDate, 30)) return true;
        }
        const docs = loadReminders('cx_documents');
        for (const d of docs) {
            if (d.done) continue;
            if (isInReminderWindow(d.expires, 30)) return true;
        }
        const subs = loadReminders('cx_subscriptions');
        for (const s of subs) {
            if (!s.active) continue;
            const day = parseInt(s.dayOfMonth) || 1;
            let next = new Date(today.getFullYear(), today.getMonth(), day);
            next.setHours(0, 0, 0, 0);
            if (next.getTime() < todayMs) {
                let nm = today.getMonth() + 1;
                let ny = today.getFullYear();
                if (nm > 11) { nm = 0; ny++; }
                next = new Date(ny, nm, day);
                next.setHours(0, 0, 0, 0);
            }
            const startMs = next.getTime() - (3 * dayMs);
            if (todayMs >= startMs && todayMs <= next.getTime()) return true;
        }
        const groups = loadInstallmentGroups();
        for (const g of groups) {
            for (const inst of (g.installments || [])) {
                if (inst.paid) continue;
                if (isInReminderWindow(inst.date, 3)) return true;
            }
        }
    } catch (e) { return false; }
    return false;
}

// ============================================================
// PARSE DATE
// ============================================================
if (typeof window.parseDate !== 'function') {
    window.parseDate = function(value) {
        if (!value) return null;
        const parts = value.split('-').map(Number);
        if (parts.length !== 3) return null;
        return new Date(parts[0], parts[1] - 1, parts[2]);
    };
}

// ============================================================
// WEATHER
// ============================================================
const WEATHER_LOC_KEY = 'cx_weather_location_v1';
const WEATHER_CACHE_KEY = 'cx_weather_cache_v1';
const WEATHER_CACHE_TTL = 30 * 60 * 1000;

let weatherState = { location: null, current: null, hourly: null, daily: null, aqi: null, pollen: null, loading: false, lastFetch: 0, stale: false };

const WMO_CODES = {
    0: 'clear', 1: 'mostlyClear', 2: 'partlyCloudy', 3: 'cloudy', 45: 'fog', 48: 'fogFrost',
    51: 'drizzleLight', 53: 'drizzle', 55: 'drizzleHeavy', 56: 'freezingDrizzleLight', 57: 'freezingDrizzle',
    61: 'rainLight', 63: 'rain', 65: 'rainHeavy', 66: 'freezingRainLight', 67: 'freezingRain',
    71: 'snowLight', 73: 'snow', 75: 'snowHeavy', 77: 'snowFlurries', 80: 'showers', 81: 'showers', 82: 'showersHeavy',
    85: 'snowShowers', 86: 'snowShowers', 95: 'thunderstorm', 96: 'thunderstormHail', 99: 'thunderstormHailHeavy'
};
const WMO_ICONS = { 0: 'sun', 1: 'sun', 2: 'cloudSun', 3: 'cloud', 45: 'cloud', 48: 'cloud', 51: 'cloudRain', 53: 'cloudRain', 55: 'cloudRain', 56: 'cloudSnow', 57: 'cloudSnow', 61: 'cloudRain', 63: 'cloudRain', 65: 'cloudRain', 66: 'cloudSnow', 67: 'cloudSnow', 71: 'cloudSnow', 73: 'cloudSnow', 75: 'cloudSnow', 77: 'cloudSnow', 80: 'cloudRain', 81: 'cloudRain', 82: 'cloudRain', 85: 'cloudSnow', 86: 'cloudSnow', 95: 'cloudLightning', 96: 'cloudLightning', 99: 'cloudLightning' };
const WMO_ICON_COLORS = { sun: '#fbbf24', cloudSun: '#fbbf24', cloud: '#94a3b8', cloudRain: '#60a5fa', cloudSnow: '#e0e7ff', cloudLightning: '#facc15' };

const CITY_MAP = {
    'beograd': { name: 'Beograd', admin1: 'Srbija', country: 'Srbija', lat: 44.8176, lon: 20.4633 },
    'novi sad': { name: 'Novi Sad', admin1: 'Vojvodina', country: 'Srbija', lat: 45.2671, lon: 19.8335 },
    'nis': { name: 'Niš', admin1: 'Srbija', country: 'Srbija', lat: 43.3209, lon: 21.8958 }
};

function loadWeatherLocation() { try { const raw = JSON.parse(localStorage.getItem(WEATHER_LOC_KEY)); if (raw && raw.lat && raw.lon) return raw; } catch (e) {} return null; }
function saveWeatherLocation(loc) { try { localStorage.setItem(WEATHER_LOC_KEY, JSON.stringify(loc)); } catch (e) {} }
function loadWeatherCache() { try { const raw = JSON.parse(localStorage.getItem(WEATHER_CACHE_KEY)); if (raw && raw.data) return raw; } catch (e) {} return null; }
function saveWeatherCache(data) { try { localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({ data, ts: Date.now() })); } catch (e) {} }

async function geocodeCity(query) {
    const normalized = normalizeText(query);
    const cityKey = Object.keys(CITY_MAP).find(k => normalized.includes(k) || k.includes(normalized));
    if (cityKey) return [CITY_MAP[cityKey]];
    try {
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=${currentLang}&format=json`;
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        if (data.results && data.results.length) {
            return data.results.map(r => ({ name: r.name, admin1: r.admin1 || '', country: r.country || '', lat: r.latitude, lon: r.longitude }));
        }
    } catch (e) { console.warn('Geocoding greška:', e.message); }
    return [];
}
async function fetchWeather(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,uv_index&hourly=temperature_2m,precipitation_probability,weather_code,wind_speed_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,wind_speed_10m_max,uv_index_max&timezone=auto&forecast_days=7`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
}
async function fetchAQI(lat, lon) {
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi,pm2_5,pm10,nitrogen_dioxide,ozone,sulphur_dioxide&hourly=alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen&timezone=auto&forecast_days=1`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
}
async function initWeatherTab(tabId) {
    if (!weatherState.location) {
        const saved = loadWeatherLocation();
        if (saved) weatherState.location = saved;
        else { weatherState.location = CITY_MAP['beograd']; saveWeatherLocation(weatherState.location); }
    }
    const cache = loadWeatherCache();
    if (cache && (Date.now() - cache.ts) < WEATHER_CACHE_TTL) {
        weatherState.current = cache.data.current;
        weatherState.hourly = cache.data.hourly;
        weatherState.daily = cache.data.daily;
        weatherState.aqi = cache.data.aqi;
        weatherState.pollen = cache.data.pollen;
        weatherState.lastFetch = cache.ts; weatherState.stale = false;
        renderWeatherTabContent(tabId);
        return;
    }
    await loadWeatherData(tabId);
}
async function loadWeatherData(tabId) {
    const loc = weatherState.location;
    if (!loc) return;
    weatherState.loading = true;
    renderWeatherTabContent(tabId);
    try {
        const [weather, aqi] = await Promise.all([fetchWeather(loc.lat, loc.lon), fetchAQI(loc.lat, loc.lon).catch(() => null)]);
        weatherState.current = weather.current;
        weatherState.hourly = weather.hourly;
        weatherState.daily = weather.daily;
        weatherState.aqi = aqi ? aqi.current : null;
        weatherState.pollen = aqi ? aqi.hourly : null;
        weatherState.lastFetch = Date.now(); weatherState.stale = false; weatherState.loading = false;
        saveWeatherCache({ current: weatherState.current, hourly: weatherState.hourly, daily: weatherState.daily, aqi: weatherState.aqi, pollen: weatherState.pollen });
        renderWeatherTabContent(tabId);
    } catch (e) {
        console.warn('Weather fetch error:', e.message);
        weatherState.loading = false; weatherState.stale = true;
        const cache = loadWeatherCache();
        if (cache) {
            weatherState.current = cache.data.current; weatherState.hourly = cache.data.hourly;
            weatherState.daily = cache.data.daily; weatherState.aqi = cache.data.aqi; weatherState.pollen = cache.data.pollen;
        }
        renderWeatherTabContent(tabId);
    }
}
function renderWeatherTabContent(tabId) {
    if (tabId === 'prognoza') updateWeatherPrognoza();
    else if (tabId === 'vazduh') updateWeatherVazduh();
}
async function refreshWeather() {
    const btn = document.querySelector('.weather-refresh-btn');
    if (btn) btn.classList.add('spinning');
    setTimeout(() => { if (btn) btn.classList.remove('spinning'); }, 700);
    showToast(safeT('weather.refreshing'), 'info', 1500);
    try { localStorage.removeItem(WEATHER_CACHE_KEY); } catch (e) {}
    const tabId = activeTab || 'prognoza';
    await loadWeatherData(tabId);
    vibrate(20); playTick(0, 1400, 0.08, 0.03);
}
function openLocationModal() {
    const modal = el('location-modal');
    if (!modal) return;
    const input = el('location-search-input'); if (input) input.value = '';
    const results = el('location-results'); if (results) results.innerHTML = '<div class="location-empty">' + safeT('weather.location.empty') + '</div>';
    modal.classList.add('show'); document.body.classList.add('modal-open');
    vibrate(15); playTick(0, 1400, 0.06, 0.02);
    setTimeout(() => { if (input) input.focus(); }, 200);
}
async function searchLocation() {
    const input = el('location-search-input');
    const results = el('location-results');
    if (!input || !results) return;
    const q = input.value.trim();
    if (!q || q.length < 2) { results.innerHTML = '<div class="location-empty">' + safeT('weather.location.minChars') + '</div>'; return; }
    results.innerHTML = '<div class="location-empty">' + safeT('weather.location.searching') + '</div>';
    const found = await geocodeCity(q);
    if (!found.length) { results.innerHTML = '<div class="location-empty">' + safeT('weather.location.noResults') + ' "' + escapeHtml(q) + '".</div>'; return; }
    results.innerHTML = '';
    found.forEach(loc => {
        const item = document.createElement('div');
        item.className = 'location-result-item';
        item.innerHTML = `<div class="location-result-name">${escapeHtml(loc.name)}</div><div class="location-result-region">${escapeHtml(loc.admin1 ? loc.admin1 + ', ' : '')}${escapeHtml(loc.country)}</div>`;
        item.onclick = () => selectLocation(loc);
        results.appendChild(item);
    });
}
function selectLocation(loc) {
    weatherState.location = loc;
    saveWeatherLocation(loc);
    try { localStorage.removeItem(WEATHER_CACHE_KEY); } catch (e) {}
    closeModal('location-modal');
    showToast(safeT('weather.location.selected') + ': ' + loc.name, 'success', 1500);
    vibrate(20); playTick(0, 1500, 0.08, 0.03);
    setTimeout(() => { const tabId = activeTab || 'prognoza'; loadWeatherData(tabId); }, 200);
}
function useGPSLocation() {
    if (!navigator.geolocation) { showToast(safeT('weather.location.gpsUnsupported'), 'error'); return; }
    showToast(safeT('weather.location.gpsSearching'), 'info', 2000);
    navigator.geolocation.getCurrentPosition(
        async (pos) => {
            const lat = pos.coords.latitude, lon = pos.coords.longitude;
            let name = currentLang === 'en' ? 'My location' : 'Moja lokacija';
            let admin1 = '', country = '';
            try {
                const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=${currentLang}`;
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    const addr = data.address || {};
                    name = addr.city || addr.town || addr.village || addr.municipality || name;
                    admin1 = addr.state || addr.region || '';
                    country = addr.country || '';
                }
            } catch (e) {}
            selectLocation({ name, admin1, country, lat, lon });
        },
        () => { showToast(safeT('weather.location.gpsError'), 'error', 2500); },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    );
}
function renderWeatherPrognoza() { return `<div id="weather-prognoza-content"><div class="weather-loading"><div class="weather-loading-row"></div><div class="weather-loading-row"></div><div class="weather-loading-row"></div></div></div>`; }
function renderWeatherVazduh() { return `<div id="weather-vazduh-content"><div class="weather-loading"><div class="weather-loading-row"></div><div class="weather-loading-row"></div></div></div>`; }
function weatherLocationHeader() {
    const loc = weatherState.location;
    if (!loc) return '';
    const name = loc.name + (loc.admin1 && loc.admin1 !== loc.name ? ', ' + loc.admin1 : '');
    const staleBadge = weatherState.stale ? '<span class="weather-stale-badge">' + safeT('weather.stale') + '</span>' : '';
    return `<div class="weather-location-row"><div class="weather-location" onclick="openLocationModal()" title="${safeT('weather.location.title')}">${icon('mapPin')}<span class="weather-location-name">${escapeHtml(name)}</span>${staleBadge}</div><button class="weather-refresh-btn" onclick="refreshWeather()" title="${safeT('weather.refresh')}">${icon('refresh')}</button></div>`;
}
function getWeatherInfo(code) {
    const key = WMO_CODES[code];
    if (!key) return { text: safeT('weather.condition.unknown'), icon: 'cloud' };
    return { text: safeT('weather.condition.' + key), icon: WMO_ICONS[code] || 'cloud' };
}
function formatHour(isoStr) { const d = new Date(isoStr); return String(d.getHours()).padStart(2, '0') + ':00'; }
function formatDayName(isoStr, index) {
    if (index === 0) return safeT('weather.day.today');
    if (index === 1) return safeT('weather.day.tomorrow');
    const d = new Date(isoStr);
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    return safeT('weather.day.' + days[d.getDay()]);
}
function updateWeatherPrognoza() {
    const box = el('weather-prognoza-content');
    if (!box) return;
    const { current, hourly, daily, loading } = weatherState;
    if (loading && !current) { box.innerHTML = `<div class="weather-loading"><div class="weather-loading-row"></div><div class="weather-loading-row"></div><div class="weather-loading-row"></div></div>`; return; }
    if (!current) {
        box.innerHTML = `<div class="weather-error"><div class="weather-error-icon">📡</div><div class="weather-error-title">${safeT('weather.error.noData')}</div><div class="weather-error-text">${safeT('weather.error.checkInternet')}</div><button class="weather-error-btn" onclick="refreshWeather()">${safeT('weather.error.retry')}</button></div>`;
        return;
    }
    const info = getWeatherInfo(current.weather_code);
    const temp = Math.round(current.temperature_2m);
    const feels = Math.round(current.apparent_temperature);
    const wind = Math.round(current.wind_speed_10m);
    const humidity = current.relative_humidity_2m;
    const now = new Date();
    const startIdx = hourly.time.findIndex(t => new Date(t) >= now);
    const hourlySlice = startIdx >= 0 ? hourly.time.slice(startIdx, startIdx + 24) : hourly.time.slice(0, 24);
    let hourlyHtml = '';
    hourlySlice.forEach((timeStr, i) => {
        const idx = startIdx + i;
        const t2 = Math.round(hourly.temperature_2m[idx]);
        const code = hourly.weather_code[idx];
        const rain = hourly.precipitation_probability[idx];
        const wInfo = getWeatherInfo(code);
        hourlyHtml += `<div class="weather-hour-card"><div class="weather-hour-time">${formatHour(timeStr)}</div><div class="weather-hour-icon" style="color: ${WMO_ICON_COLORS[wInfo.icon] || '#38bdf8'};">${icon(wInfo.icon)}</div><div class="weather-hour-temp">${t2}°</div>${rain > 20 ? `<div class="weather-hour-rain">${rain}%</div>` : ''}</div>`;
    });
    let dailyHtml = '';
    daily.time.forEach((timeStr, i) => {
        if (i > 6) return;
        const code = daily.weather_code[i];
        const tMax = Math.round(daily.temperature_2m_max[i]);
        const tMin = Math.round(daily.temperature_2m_min[i]);
        const rain = daily.precipitation_probability_max[i];
        const windMax = Math.round(daily.wind_speed_10m_max[i]);
        const wInfo = getWeatherInfo(code);
        const comment = generateDayComment(code, tMax, tMin, rain, windMax);
        dailyHtml += `<div class="weather-day-item"><div class="weather-day-name">${formatDayName(timeStr, i)}</div><div class="weather-day-icon" style="color: ${WMO_ICON_COLORS[wInfo.icon] || '#38bdf8'};">${icon(wInfo.icon)}</div><div class="weather-day-comment">${escapeHtml(comment)}</div><div class="weather-day-temps">${tMax}°<small> / ${tMin}°</small></div></div>`;
    });
    box.innerHTML = `${weatherLocationHeader()}<div class="weather-current"><div class="weather-temp-row"><div class="weather-temp-big">${temp}°</div><div class="weather-temp-info"><div class="weather-condition">${escapeHtml(info.text)}</div><div class="weather-feels">${safeT('weather.feels')} ${feels}°</div></div></div><div class="weather-meta-row"><div class="weather-meta-item">${icon('wind')} ${wind} km/h</div><div class="weather-meta-item">${icon('droplets')} ${humidity}%</div><div class="weather-meta-item">${icon('sun')} UV ${Math.round(current.uv_index || 0)}</div></div></div><div class="weather-section-title">${safeT('weather.section.hourly')}</div><div class="weather-hourly">${hourlyHtml}</div><div class="weather-section-title">${safeT('weather.section.daily')}</div><div class="weather-daily-list">${dailyHtml}</div>`;
}
function generateDayComment(code, tMax, tMin, rainProb, windMax) {
    const comments = [];
    if (code >= 95) comments.push(safeT('weather.comment.thunderstorm'));
    else if (code >= 71 && code <= 77) comments.push(safeT('weather.comment.snow'));
    else if (code >= 61 && code <= 67) comments.push(safeT('weather.comment.rain'));
    else if (code >= 51 && code <= 57) comments.push(safeT('weather.comment.drizzle'));
    else if (code === 45 || code === 48) comments.push(safeT('weather.comment.fog'));
    else if (code === 0 || code === 1) comments.push(safeT('weather.comment.clear'));
    else comments.push(safeT('weather.comment.cloudy'));
    if (rainProb > 70 && code < 51) comments.push(safeT('weather.comment.possibleRain'));
    if (windMax > 40) comments.push(safeT('weather.comment.windy'));
    if (tMax > 30) comments.push(safeT('weather.comment.hot'));
    if (tMin < 0) comments.push(safeT('weather.comment.frost'));
    if (tMax - tMin > 15) comments.push(safeT('weather.comment.bigTempDiff'));
    return comments.join(' • ');
}
function updateWeatherVazduh() {
    const box = el('weather-vazduh-content');
    if (!box) return;
    const { aqi, pollen, loading } = weatherState;
    if (loading && !aqi) { box.innerHTML = `<div class="weather-loading"><div class="weather-loading-row"></div><div class="weather-loading-row"></div></div>`; return; }
    if (!aqi) {
        box.innerHTML = `<div class="weather-error"><div class="weather-error-icon">🌫️</div><div class="weather-error-title">${safeT('weather.error.noAirQuality')}</div><div class="weather-error-text">${safeT('weather.error.noAirQualityText')}</div><button class="weather-error-btn" onclick="refreshWeather()">${safeT('weather.error.retry')}</button></div>`;
        return;
    }
    const aqiVal = aqi.european_aqi || 0;
    let aqiKey, aqiColor;
    if (aqiVal <= 20) { aqiKey = 'excellent'; aqiColor = '#10b981'; }
    else if (aqiVal <= 40) { aqiKey = 'good'; aqiColor = '#84cc16'; }
    else if (aqiVal <= 60) { aqiKey = 'moderate'; aqiColor = '#f59e0b'; }
    else if (aqiVal <= 80) { aqiKey = 'bad'; aqiColor = '#f97316'; }
    else if (aqiVal <= 100) { aqiKey = 'veryBad'; aqiColor = '#f43f5e'; }
    else { aqiKey = 'dangerous'; aqiColor = '#a855f7'; }
    let pollenHtml = '';
    if (pollen && pollen.time) {
        const now = new Date();
        const idx = pollen.time.findIndex(t => new Date(t) >= now);
        const realIdx = idx >= 0 ? idx : 0;
        const pollenTypes = [
            { key: 'grass_pollen', nameKey: 'grass' }, { key: 'birch_pollen', nameKey: 'birch' },
            { key: 'alder_pollen', nameKey: 'alder' }, { key: 'mugwort_pollen', nameKey: 'mugwort' },
            { key: 'olive_pollen', nameKey: 'olive' }, { key: 'ragweed_pollen', nameKey: 'ragweed' }
        ];
        pollenTypes.forEach(pt => {
            const val = pollen[pt.key] ? pollen[pt.key][realIdx] : null;
            if (val === null || val === undefined) return;
            let levelKey;
            if (val < 10) levelKey = 'low'; else if (val < 50) levelKey = 'medium'; else levelKey = 'high';
            pollenHtml += `<div class="pollen-row"><span class="pollen-name">${safeT('weather.pollen.' + pt.nameKey)}</span><span class="pollen-value ${levelKey}">${safeT('weather.pollen.' + levelKey)}</span></div>`;
        });
    }
    box.innerHTML = `${weatherLocationHeader()}<div class="aqi-card" style="--aqi-color: ${aqiColor};"><div class="aqi-value">${Math.round(aqiVal)}</div><div class="aqi-info"><div class="aqi-label">${safeT('weather.aqi.' + aqiKey)}</div><div class="aqi-sub">${safeT('weather.aqi.subtitle')}</div></div></div><div class="weather-section-title">${safeT('weather.section.pollutants')}</div>${aqi.pm2_5 !== undefined ? `<div class="aqi-pollutant-row"><span class="aqi-pollutant-name">PM2.5</span><span class="aqi-pollutant-value">${Math.round(aqi.pm2_5)} µg/m³</span></div>` : ''}${aqi.pm10 !== undefined ? `<div class="aqi-pollutant-row"><span class="aqi-pollutant-name">PM10</span><span class="aqi-pollutant-value">${Math.round(aqi.pm10)} µg/m³</span></div>` : ''}${aqi.nitrogen_dioxide !== undefined ? `<div class="aqi-pollutant-row"><span class="aqi-pollutant-name">NO₂</span><span class="aqi-pollutant-value">${Math.round(aqi.nitrogen_dioxide)} µg/m³</span></div>` : ''}${aqi.ozone !== undefined ? `<div class="aqi-pollutant-row"><span class="aqi-pollutant-name">O₃</span><span class="aqi-pollutant-value">${Math.round(aqi.ozone)} µg/m³</span></div>` : ''}${pollenHtml ? `<div class="weather-section-title">${safeT('weather.section.pollen')}</div>${pollenHtml}` : ''}`;
}

// ============================================================
// MERE (MEASURES)
// ============================================================
function measureTab(prefix, labelKey, units, fromDefault = '', toDefault = '') {
    const fromOpts = units.map(u => ({ value: u.v, text: safeT(u.tKey), sel: u.v === fromDefault }));
    const toOpts = units.map(u => ({ value: u.v, text: safeT(u.tKey), sel: u.v === toDefault }));
    const fnName = 'calculate' + prefix.charAt(0).toUpperCase() + prefix.slice(1);
    return `
        <div class="converter-box">
            <div class="input-field"><label>${safeT('label.measures.value')}</label><div class="input-wrapper"><input type="number" id="${prefix}-val" class="custom-input" placeholder="0" inputmode="decimal" oninput="${fnName}()"></div></div>
            <div class="input-field"><label>${safeT('label.measures.from')}</label><select id="${prefix}-from" class="custom-input" onchange="${fnName}()">${fromOpts.map(o => `<option value="${o.value}"${o.sel ? ' selected' : ''}>${escapeHtml(o.text)}</option>`).join('')}</select></div>
            <div class="swap-icon-container"><button class="swap-btn" onclick="swapInputs('${prefix}-from', '${prefix}-to'); ${fnName}();">${safeT('btn.swap')}</button></div>
            <div class="input-field"><label>${safeT('label.measures.to')}</label><select id="${prefix}-to" class="custom-input" onchange="${fnName}()">${toOpts.map(o => `<option value="${o.value}"${o.sel ? ' selected' : ''}>${escapeHtml(o.text)}</option>`).join('')}</select></div>
            ${calcButton('btn.calculate', `${fnName}()`)}
        </div>
        <div id="${prefix}-result-box" class="result-card-green" style="display: none;">
            <div class="res-left"><div class="pump-icon">${icon('ruler')}</div><div><div class="res-label">${safeT('result.label')}</div><h2><span id="res-${prefix}-val">0</span> <small id="res-${prefix}-unit"></small></h2></div></div>
            <div class="res-actions">
                <button class="copy-btn" onclick="copyResult('res-${prefix}-val', 'res-${prefix}-unit', event)">${safeT('result.copy')}</button>
                <button class="copy-btn" data-category="MERE" data-label="${escapeHtml(safeT(labelKey))}" onclick="saveHistory(this)">${safeT('result.save')}</button>
                <button class="copy-btn" data-category="MERE" data-label="${escapeHtml(safeT(labelKey))}" onclick="shareResult(this)">${safeT('result.share')}</button>
            </div>
        </div>
    `;
}

function renderMeasuresDuzina() {
    return measureTab('length', 'label.measures.length', [
        { v: 'm', tKey: 'option.measures.m' }, { v: 'km', tKey: 'option.measures.km' },
        { v: 'cm', tKey: 'option.measures.cm' }, { v: 'mm', tKey: 'option.measures.mm' },
        { v: 'ft', tKey: 'option.measures.ft' }, { v: 'in', tKey: 'option.measures.inch' }
    ], 'm', 'cm');
}
function renderMeasuresTezina() {
    return measureTab('weight', 'label.measures.weight', [
        { v: 'kg', tKey: 'option.measures.kg' }, { v: 'g', tKey: 'option.measures.g' },
        { v: 't', tKey: 'option.measures.t' }, { v: 'lbs', tKey: 'option.measures.lbs' },
        { v: 'oz', tKey: 'option.measures.oz' }
    ], 'kg', 'g');
}
function renderMeasuresPovrsina() {
    return measureTab('area', 'label.measures.area', [
        { v: 'm2', tKey: 'option.measures.m2' }, { v: 'ar', tKey: 'option.measures.ar' },
        { v: 'ha', tKey: 'option.measures.ha' }, { v: 'km2', tKey: 'option.measures.km2' }
    ], 'm2', 'ar');
}
function renderMeasuresZapremina() {
    return measureTab('volume', 'label.measures.volume', [
        { v: 'L', tKey: 'option.measures.L' }, { v: 'ml', tKey: 'option.measures.ml' },
        { v: 'm3', tKey: 'option.measures.m3' }, { v: 'galus', tKey: 'option.measures.galus' },
        { v: 'galuk', tKey: 'option.measures.galuk' }
    ], 'L', 'ml');
}
function renderMeasuresBrzina() {
    return measureTab('speed', 'label.measures.speed', [
        { v: 'kmh', tKey: 'option.measures.kmh' }, { v: 'ms', tKey: 'option.measures.ms' },
        { v: 'mph', tKey: 'option.measures.mph' }, { v: 'knot', tKey: 'option.measures.knot' }
    ], 'kmh', 'ms');
}
function renderMeasuresPritisak() {
    return measureTab('pres', 'label.measures.pressure', [
        { v: 'bar', tKey: 'option.measures.bar' }, { v: 'psi', tKey: 'option.measures.psi' },
        { v: 'kpa', tKey: 'option.measures.kpa' }, { v: 'atm', tKey: 'option.measures.atm' },
        { v: 'mmhg', tKey: 'option.measures.mmhg' }
    ], 'bar', 'psi');
}
function renderMeasuresPodaci() {
    return measureTab('data', 'label.measures.data', [
        { v: 'B', tKey: 'option.measures.B' }, { v: 'KB', tKey: 'option.measures.KB' },
        { v: 'MB', tKey: 'option.measures.MB' }, { v: 'GB', tKey: 'option.measures.GB' },
        { v: 'TB', tKey: 'option.measures.TB' }
    ], 'GB', 'MB');
}
function renderMeasuresTemp() {
    return `
        <div class="converter-box">
            <div class="input-field"><label>${safeT('label.measures.value')}</label><div class="input-wrapper"><input type="number" id="temp-val" class="custom-input" placeholder="25" inputmode="decimal" oninput="calculateTemp()"></div></div>
            <div class="input-field"><label>${safeT('label.measures.from')}</label><select id="temp-from" class="custom-input" onchange="calculateTemp()"><option value="c">${safeT('option.measures.celsius')}</option><option value="f">${safeT('option.measures.fahrenheit')}</option><option value="k">${safeT('option.measures.kelvin')}</option></select></div>
            <div class="swap-icon-container"><button class="swap-btn" onclick="swapInputs('temp-from', 'temp-to'); calculateTemp();">${safeT('btn.swap')}</button></div>
            <div class="input-field"><label>${safeT('label.measures.to')}</label><select id="temp-to" class="custom-input" onchange="calculateTemp()"><option value="f">${safeT('option.measures.fahrenheit')}</option><option value="c">${safeT('option.measures.celsius')}</option><option value="k">${safeT('option.measures.kelvin')}</option></select></div>
            ${calcButton('btn.calculate', 'calculateTemp()')}
        </div>
        <div id="temp-result-box" class="result-card-green" style="display: none;">
            <div class="res-left"><div class="pump-icon">${icon('thermometer')}</div><div><div class="res-label">${safeT('result.label')}</div><h2><span id="res-temp-val">0</span> <small id="res-temp-unit">°F</small></h2></div></div>
            <div class="res-actions">
                <button class="copy-btn" onclick="copyResult('res-temp-val', 'res-temp-unit', event)">${safeT('result.copy')}</button>
                <button class="copy-btn" data-category="MERE" data-label="Temp" onclick="saveHistory(this)">${safeT('result.save')}</button>
                <button class="copy-btn" data-category="MERE" data-label="Temp" onclick="shareResult(this)">${safeT('result.share')}</button>
            </div>
        </div>
    `;
}

const LENGTH_FACTORS = { m: 1, km: 1000, cm: 0.01, mm: 0.001, ft: 0.3048, in: 0.0254 };
const LENGTH_LABELS = { m: 'm', km: 'km', cm: 'cm', mm: 'mm', ft: 'ft', in: 'in' };
const WEIGHT_FACTORS = { g: 1, kg: 1000, t: 1000000, lbs: 453.592, oz: 28.3495 };
const WEIGHT_LABELS = { g: 'g', kg: 'kg', t: 't', lbs: 'lbs', oz: 'oz' };
const AREA_FACTORS = { m2: 1, ar: 100, ha: 10000, km2: 1000000 };
const AREA_LABELS = { m2: 'm²', ar: 'ar', ha: 'ha', km2: 'km²' };
const VOLUME_FACTORS = { L: 1, ml: 0.001, m3: 1000, galus: 3.785411784, galuk: 4.54609 };
const VOLUME_LABELS = { L: 'L', ml: 'ml', m3: 'm³', galus: 'gal (US)', galuk: 'gal (UK)' };
const PRES_FACTORS = { bar: 1, psi: 0.0689476, kpa: 0.01, atm: 1.01325, mmhg: 0.00133322 };
const PRES_LABELS = { bar: 'bar', psi: 'psi', kpa: 'kPa', atm: 'atm', mmhg: 'mmHg' };
const SPEED_FACTORS = { kmh: 0.277778, ms: 1, mph: 0.44704, knot: 0.514444 };
const SPEED_LABELS = { kmh: 'km/h', ms: 'm/s', mph: 'mph', knot: 'kn' };
const DATA_FACTORS = { B: 1, KB: 1024, MB: 1048576, GB: 1073741824, TB: 1099511627776 };
const DATA_LABELS = { B: 'B', KB: 'KB', MB: 'MB', GB: 'GB', TB: 'TB' };

function convertMeasure(prefix, factors, labels) {
    const val = num(`${prefix}-val`);
    if (val === null) { hide(`${prefix}-result-box`); return; }
    const from = el(`${prefix}-from`) ? el(`${prefix}-from`).value : '';
    const to = el(`${prefix}-to`) ? el(`${prefix}-to`).value : '';
    const result = val * factors[from] / factors[to];
    const rv = el(`res-${prefix}-val`); if (rv) rv.innerText = fmt(result);
    const ru = el(`res-${prefix}-unit`); if (ru) ru.innerText = labels[to];
    show(`${prefix}-result-box`, true);
}
function calculateLength() { convertMeasure('length', LENGTH_FACTORS, LENGTH_LABELS); }
function calculateWeight() { convertMeasure('weight', WEIGHT_FACTORS, WEIGHT_LABELS); }
function calculateArea() { convertMeasure('area', AREA_FACTORS, AREA_LABELS); }
function calculatePres() { convertMeasure('pres', PRES_FACTORS, PRES_LABELS); }
function calculateSpeed() { convertMeasure('speed', SPEED_FACTORS, SPEED_LABELS); }
function calculateData() { convertMeasure('data', DATA_FACTORS, DATA_LABELS); }
function calculateVolume() { convertMeasure('volume', VOLUME_FACTORS, VOLUME_LABELS); }

function calculateTemp() {
    const val = num('temp-val');
    if (val === null) { hide('temp-result-box'); return; }
    const from = el('temp-from') ? el('temp-from').value : 'c';
    const to = el('temp-to') ? el('temp-to').value : 'f';
    let celsius = val;
    if (from === 'f') celsius = (val - 32) * 5 / 9;
    else if (from === 'k') celsius = val - 273.15;
    let result = celsius;
    if (to === 'f') result = (celsius * 9 / 5) + 32;
    else if (to === 'k') result = celsius + 273.15;
    const labels = { c: '°C', f: '°F', k: 'K' };
    const rv = el('res-temp-val'); if (rv) rv.innerText = fmt(result, 2);
    const ru = el('res-temp-unit'); if (ru) ru.innerText = labels[to];
    show('temp-result-box', true);
}

// ============================================================
// ZDRAVLJE (HEALTH)
// ============================================================
function renderHealthBMI() {
    return `<div class="converter-box">${sectionDescKey('desc.health.bmi')}${inputField('label.health.weight', 'health-weight', 'kg', 'placeholder="70"')}${inputField('label.health.height', 'health-height', 'cm', 'placeholder="175"')}${inputField('label.health.ageOptional', 'health-bmi-age', '', 'placeholder="30"')}${calcButton('btn.calculate', 'calculateBMI()')}</div>${resultCard('health-bmi-result-box', 'scale', 'label.health.yourBmi', 'res-bmi-val', '', 'ZDRAVLJE', 'label.health.bmi')}${statsRow('health-bmi-stats-row', [['label.health.category', 'stat-bmi-category', '—']])}`;
}
function renderHealthIdealna() {
    return `<div class="converter-box">${sectionDescKey('desc.health.idealWeight')}${selectField('label.health.gender', 'health-gender', [{ value: 'male', text: safeT('option.health.male') }, { value: 'female', text: safeT('option.health.female') }])}${inputField('label.health.height', 'health-ideal-height', 'cm', 'placeholder="175"')}${calcButton('btn.calculate', 'calculateIdealWeight()')}</div>${resultCard('health-ideal-result-box', 'target', 'label.health.idealWeight', 'res-ideal-weight', 'kg', 'ZDRAVLJE', 'label.health.idealWeight')}${statsRow('health-ideal-stats-row', [['label.health.healthyRange', 'stat-ideal-range', '—']])}`;
}
function renderHealthBMR() {
    return `<div class="converter-box">${sectionDescKey('desc.health.bmr')}${selectField('label.health.gender', 'bmr-gender', [{ value: 'male', text: safeT('option.health.male') }, { value: 'female', text: safeT('option.health.female') }])}${inputField('label.health.weight', 'bmr-weight', 'kg', 'placeholder="70"')}${inputField('label.health.height', 'bmr-height', 'cm', 'placeholder="175"')}${inputField('label.health.age', 'bmr-age', '', 'placeholder="30"')}${selectField('label.health.activityLevel', 'bmr-activity', [{ value: '1.2', text: safeT('option.health.sedentary') }, { value: '1.375', text: safeT('option.health.lightActivity') }, { value: '1.55', text: safeT('option.health.moderateActivity') }, { value: '1.725', text: safeT('option.health.highActivity') }])}${calcButton('btn.calculate', 'calculateBMR()')}</div>${resultCard('bmr-result-box', 'flame', 'label.health.dailyNeeds', 'res-bmr-val', 'kcal', 'ZDRAVLJE', 'label.health.bmrFull')}${statsRow('bmr-stats-row', [['label.health.basalMetabolism', 'stat-bmr-base', '0 kcal']])}`;
}
function renderHealthPuls() {
    return `<div class="converter-box">${sectionDescKey('desc.health.pulse')}${inputField('label.health.age', 'hr-age', '', 'placeholder="30"')}${calcButton('btn.calculate', 'calculateHeartRate()')}</div>${resultCard('hr-result-box', 'heartPulse', 'label.health.maxPulse', 'res-hr-max', 'BPM', 'ZDRAVLJE', 'label.health.pulseFull')}<div id="hr-zones-wrap" class="hr-zones" style="display:none;"><div class="hr-zone-item"><span class="hr-zone-name">${safeT('zone.easy')}</span><strong id="hr-zone-1">—</strong></div><div class="hr-zone-item"><span class="hr-zone-name">${safeT('zone.fatBurn')}</span><strong id="hr-zone-2">—</strong></div><div class="hr-zone-item"><span class="hr-zone-name">${safeT('zone.cardio')}</span><strong id="hr-zone-3">—</strong></div><div class="hr-zone-item"><span class="hr-zone-name">${safeT('zone.intense')}</span><strong id="hr-zone-4">—</strong></div><div class="hr-zone-item"><span class="hr-zone-name">${safeT('zone.maximum')}</span><strong id="hr-zone-5">—</strong></div></div>`;
}
function renderHealthTrcanje() {
    return `<div class="converter-box">${sectionDescKey('desc.health.running')}${inputField('label.health.distance', 'run-distance', 'km', 'placeholder="5"')}${inputField('label.health.timeMin', 'run-min', 'min', 'placeholder="25"')}${inputField('label.health.timeSec', 'run-sec', 'sec', 'placeholder="0"')}${calcButton('btn.calculate', 'calculateRunning()')}</div>${resultCard('run-result-box', 'run', 'label.health.pace', 'res-run-pace', '/km', 'ZDRAVLJE', 'label.health.running')}${statsRow('run-stats-row', [['label.health.avgSpeed', 'stat-run-speed', '0 km/h'], ['label.health.totalTime', 'stat-run-total', '0']])}`;
}
function renderHealth1RM() {
    return `<div class="converter-box">${sectionDescKey('desc.health.rm1')}${inputField('label.health.weight', 'rm1-weight', 'kg', 'placeholder="80"')}${inputField('label.health.reps', 'rm1-reps', '', 'placeholder="5"')}${calcButton('btn.calculate', 'calculate1RM()')}</div>${resultCard('rm1-result-box', 'dumbbell', 'label.health.rm1Estimate', 'res-rm1-val', 'kg', 'ZDRAVLJE', 'label.health.rm1')}${statsRow('rm1-stats-row', [['label.health.rm1_90', 'stat-rm1-90', '—'], ['label.health.rm1_80', 'stat-rm1-80', '—']])}`;
}

function calculateBMI() {
    const weight = num('health-weight'), heightCm = num('health-height'), age = num('health-bmi-age');
    if (!weight || !heightCm) { showToast(safeT('toast.error.enterWeightHeight') || 'Unesi težinu i visinu.', 'error'); return; }
    const bmi = weight / Math.pow(heightCm / 100, 2);
    let categoryKey;
    if (age !== null && age < 18) categoryKey = 'label.health.underageBmi';
    else if (bmi < 18.5) categoryKey = 'label.health.underweight';
    else if (bmi < 25) categoryKey = 'label.health.normalWeight';
    else if (bmi < 30) categoryKey = 'label.health.overweight';
    else categoryKey = 'label.health.obese';
    const bv = el('res-bmi-val'); if (bv) bv.innerText = fmt(bmi, 1);
    const bc = el('stat-bmi-category'); if (bc) bc.innerText = safeT(categoryKey);
    show('health-bmi-result-box'); show('health-bmi-stats-row');
}
function calculateIdealWeight() {
    const height = num('health-ideal-height');
    const gender = el('health-gender') ? el('health-gender').value : 'male';
    if (!height) { showToast(safeT('toast.error.enterHeight') || 'Unesi visinu.', 'error'); return; }
    const inchesOver = Math.max(0, (height - 152.4) / 2.54);
    const ideal = (gender === 'male' ? 50 : 45.5) + (2.3 * inchesOver);
    const heightM = height / 100;
    const iw = el('res-ideal-weight'); if (iw) iw.innerText = fmt(ideal, 1);
    const ir = el('stat-ideal-range'); if (ir) ir.innerText = fmt(18.5 * heightM * heightM, 1) + ' – ' + fmt(24.9 * heightM * heightM, 1) + ' kg';
    show('health-ideal-result-box'); show('health-ideal-stats-row');
}
function calculateBMR() {
    const weight = num('bmr-weight'), height = num('bmr-height'), age = num('bmr-age');
    const gender = el('bmr-gender') ? el('bmr-gender').value : 'male';
    const activity = el('bmr-activity') ? parseFloat(el('bmr-activity').value) : 1.375;
    if (!weight || !height || !age) { showToast(safeT('toast.error.enterAll') || 'Unesi sve vrednosti.', 'error'); return; }
    let bmr = (10 * weight) + (6.25 * height) - (5 * age) + (gender === 'male' ? 5 : -161);
    const bv = el('res-bmr-val'); if (bv) bv.innerText = fmt(bmr * activity, 0);
    const bb = el('stat-bmr-base'); if (bb) bb.innerText = fmt(bmr, 0) + ' kcal';
    show('bmr-result-box'); show('bmr-stats-row');
}
function calculateHeartRate() {
    const age = num('hr-age');
    if (!age) { showToast(safeT('toast.error.enterAge') || 'Unesi godine.', 'error'); return; }
    const max = 220 - age;
    const zones = [[0.5, 0.6], [0.6, 0.7], [0.7, 0.8], [0.8, 0.9], [0.9, 1.0]];
    const hm = el('res-hr-max'); if (hm) hm.innerText = fmt(max, 0);
    show('hr-result-box');
    zones.forEach((z, i) => {
        const ze = el(`hr-zone-${i + 1}`);
        if (ze) ze.innerText = `${Math.round(max * z[0])}–${Math.round(max * z[1])}`;
    });
    const zw = el('hr-zones-wrap'); if (zw) zw.style.display = 'flex';
}
function calculateRunning() {
    const distance = num('run-distance'), min = num('run-min') || 0, sec = num('run-sec') || 0;
    if (!distance) { showToast(safeT('toast.error.enterDistance') || 'Unesi distancu.', 'error'); return; }
    const totalMinutes = min + (sec / 60);
    if (totalMinutes === 0) { showToast(safeT('toast.error.enterTime') || 'Unesi vreme.', 'error'); return; }
    const paceMin = totalMinutes / distance;
    const paceMinWhole = Math.floor(paceMin), paceSec = Math.round((paceMin - paceMinWhole) * 60);
    const rp = el('res-run-pace'); if (rp) rp.innerText = `${paceMinWhole}:${String(paceSec).padStart(2, '0')}`;
    const rs = el('stat-run-speed'); if (rs) rs.innerText = fmt(distance / (totalMinutes / 60), 2) + ' km/h';
    const rt = el('stat-run-total'); if (rt) rt.innerText = `${min}min ${sec}s`;
    show('run-result-box'); show('run-stats-row');
}
function calculate1RM() {
    const weight = num('rm1-weight'), reps = num('rm1-reps');
    if (!weight || !reps || reps < 1 || reps > 15) { showToast(safeT('toast.error.enterWeightReps') || 'Unesi težinu i ponavljanja (1-15).', 'error'); return; }
    const rm = weight * (1 + reps / 30);
    const rv = el('res-rm1-val'); if (rv) rv.innerText = fmt(rm, 1);
    const r90 = el('stat-rm1-90'); if (r90) r90.innerText = fmt(rm * 0.9, 1) + ' kg';
    const r80 = el('stat-rm1-80'); if (r80) r80.innerText = fmt(rm * 0.8, 1) + ' kg';
    show('rm1-result-box'); show('rm1-stats-row');
}

// ============================================================
// VREME I DATUMI (TIME)
// ============================================================
const SR_DAYS = ['nedelja', 'ponedeljak', 'utorak', 'sreda', 'četvrtak', 'petak', 'subota'];
const SR_MONTHS = ['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'];
const EN_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const EN_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function getDaysArr() { return currentLang === 'en' ? EN_DAYS : SR_DAYS; }
function getMonthsArr() { return currentLang === 'en' ? EN_MONTHS : SR_MONTHS; }

function parseDate(value) {
    if (!value) return null;
    const parts = value.split('-').map(Number);
    if (parts.length !== 3) return null;
    return new Date(parts[0], parts[1] - 1, parts[2]);
}

function renderTimeKonverter() {
    const units = [
        { v: 'seconds', k: 'option.time.seconds' }, { v: 'minutes', k: 'option.time.minutes' },
        { v: 'hours', k: 'option.time.hours' }, { v: 'days', k: 'option.time.days' },
        { v: 'weeks', k: 'option.time.weeks' }, { v: 'months', k: 'option.time.months' },
        { v: 'years', k: 'option.time.years' }
    ];
    return `
        <div class="converter-box">
            ${inputField('label.time.value', 'time-value', '', 'placeholder="0"')}
            <div class="input-field"><label>${safeT('label.time.fromUnit')}</label><select id="time-from" class="custom-input">${units.map(u => `<option value="${u.v}">${safeT(u.k)}</option>`).join('')}</select></div>
            <div class="swap-icon-container"><button class="swap-btn" onclick="swapInputs('time-from', 'time-to'); convertTimeUnits();">${safeT('btn.swap')}</button></div>
            <div class="input-field"><label>${safeT('label.time.toUnit')}</label><select id="time-to" class="custom-input">${units.map((u, i) => `<option value="${u.v}"${i === 1 ? ' selected' : ''}>${safeT(u.k)}</option>`).join('')}</select></div>
            ${calcButton('btn.calculate', 'convertTimeUnits()')}
        </div>
        <div id="result-time-conv-box" class="result-card-green" style="display: none;">
            <div class="res-left"><div class="pump-icon">${icon('hourglass')}</div><div><div class="res-label">${safeT('label.time.conversionResult')}</div><h3 id="res-time-conv-val" class="res-text">—</h3></div></div>
            <div class="res-actions">
                <button class="copy-btn" onclick="copyResult('res-time-conv-val', '', event)">${safeT('result.copy')}</button>
                <button class="copy-btn" data-category="VREME" data-label="Konverzija" onclick="saveHistory(this)">${safeT('result.save')}</button>
                <button class="copy-btn" data-category="VREME" data-label="Konverzija" onclick="shareResult(this)">${safeT('result.share')}</button>
            </div>
        </div>
    `;
}
function renderTimeRazlika() {
    return `
        <div class="converter-box">
            ${dateTripleField('label.time.startDate', 'start-date')}
            ${dateTripleField('label.time.endDate', 'end-date')}
            ${calcButton('btn.calculate', 'calculateDateDifference()')}
        </div>
        <div id="result-date-box" class="result-card-green" style="display: none;">
            <div class="res-left"><div class="pump-icon">${icon('calendarDays')}</div><div><div class="res-label">${safeT('label.time.difference')}</div><h3 id="res-date-val" class="res-text">—</h3></div></div>
            <div class="res-actions">
                <button class="copy-btn" onclick="copyResult('res-date-val', '', event)">${safeT('result.copy')}</button>
                <button class="copy-btn" data-category="VREME" data-label="Razlika datuma" onclick="saveHistory(this)">${safeT('result.save')}</button>
                <button class="copy-btn" data-category="VREME" data-label="Razlika datuma" onclick="shareResult(this)">${safeT('result.share')}</button>
            </div>
        </div>
    `;
}
function renderTimePomeraj() {
    return `
        <div class="converter-box">
            ${dateTripleField('label.time.startDate', 'shift-date')}
            ${inputField('label.time.daysCount', 'shift-days', '', 'placeholder="30"')}
            <div class="input-field"><label>${safeT('label.time.operation')}</label><select id="shift-op" class="custom-input"><option value="add">${safeT('option.time.addDays')}</option><option value="sub">${safeT('option.time.subtractDays')}</option></select></div>
            ${calcButton('btn.calculate', 'calculateDateShift()')}
        </div>
        <div id="shift-result-box" class="result-card-green" style="display: none;">
            <div class="res-left"><div class="pump-icon">${icon('calendarPlus')}</div><div><div class="res-label">${safeT('label.time.newDate')}</div><h3 id="res-shift-val" class="res-text">—</h3></div></div>
            <div class="res-actions">
                <button class="copy-btn" onclick="copyResult('res-shift-val', '', event)">${safeT('result.copy')}</button>
                <button class="copy-btn" data-category="VREME" data-label="Pomeraj" onclick="saveHistory(this)">${safeT('result.save')}</button>
                <button class="copy-btn" data-category="VREME" data-label="Pomeraj" onclick="shareResult(this)">${safeT('result.share')}</button>
            </div>
        </div>
    `;
}
function renderTimeGodine() {
    return `
        <div class="converter-box">
            ${dateTripleField('label.time.birthDate', 'birth-date')}
            ${calcButton('btn.calculate', 'calculateAge()')}
        </div>
        <div id="age-result-box" class="result-card-green" style="display: none;">
            <div class="res-left"><div class="pump-icon">${icon('cake')}</div><div><div class="res-label">${safeT('label.time.years')}</div><h2><span id="res-age-years">0</span> <small>${safeT('label.time.years')}</small></h2></div></div>
            <div class="res-actions">
                <button class="copy-btn" onclick="copyResult('res-age-years', '', event)">${safeT('result.copy')}</button>
                <button class="copy-btn" data-category="VREME" data-label="Godine" onclick="saveHistory(this)">${safeT('result.save')}</button>
                <button class="copy-btn" data-category="VREME" data-label="Godine" onclick="shareResult(this)">${safeT('result.share')}</button>
            </div>
        </div>
        ${statsRow('age-stats-row', [['label.time.detailed', 'stat-age-detail', '—'], ['label.time.nextBirthday', 'stat-age-next', '—']])}
    `;
}
function renderTimeRadni() {
    return `
        <div class="converter-box">
            ${dateTripleField('label.time.startDate', 'workdays-start')}
            ${dateTripleField('label.time.endDate', 'workdays-end')}
            ${calcButton('btn.calculate', 'calculateWorkdays()')}
        </div>
        <div id="workdays-result-box" class="result-card-green" style="display: none;">
            <div class="res-left"><div class="pump-icon">${icon('briefcaseSm')}</div><div><div class="res-label">${safeT('label.time.workdays')}</div><h2><span id="res-workdays-val">0</span></h2></div></div>
            <div class="res-actions">
                <button class="copy-btn" onclick="copyResult('res-workdays-val', '', event)">${safeT('result.copy')}</button>
                <button class="copy-btn" data-category="VREME" data-label="Radni dani" onclick="saveHistory(this)">${safeT('result.save')}</button>
                <button class="copy-btn" data-category="VREME" data-label="Radni dani" onclick="shareResult(this)">${safeT('result.share')}</button>
            </div>
        </div>
        ${statsRow('workdays-stats-row', [['label.time.totalDays', 'stat-workdays-total', '0'], ['label.time.weekendDays', 'stat-workdays-weekend', '0']])}
    `;
}

function calculateDateDifference() {
    const startVal = getTripleDate('start-date'), endVal = getTripleDate('end-date');
    if (!startVal || !endVal) { showToast(safeT('toast.error.enterBothDates') || 'Unesi oba datuma.', 'error'); return; }
    let startDate = parseDate(startVal), endDate = parseDate(endVal);
    if (startDate > endDate) { const t = startDate; startDate = endDate; endDate = t; }
    let years = endDate.getFullYear() - startDate.getFullYear();
    let months = endDate.getMonth() - startDate.getMonth();
    let days = endDate.getDate() - startDate.getDate();
    if (days < 0) { months--; days += new Date(endDate.getFullYear(), endDate.getMonth(), 0).getDate(); }
    if (months < 0) { years--; months += 12; }
    const totalDays = Math.round((endDate - startDate) / 86400000);
    const dv = el('res-date-val');
    if (dv) {
        if (currentLang === 'en') dv.innerHTML = `${years} yr, ${months} mo, ${days} d<br>(${safeT('label.time.total')} ${fmt(totalDays, 0)} d)`;
        else dv.innerHTML = `${years} god, ${months} mes, ${days} dana<br>(ukupno ${fmt(totalDays, 0)} dana)`;
    }
    show('result-date-box');
}
function calculateDateShift() {
    const startVal = getTripleDate('shift-date'), days = num('shift-days');
    const op = el('shift-op') ? el('shift-op').value : 'add';
    if (!startVal || days === null) { showToast(safeT('toast.error.enterDateDays') || 'Unesi datum i dane.', 'error'); return; }
    const date = parseDate(startVal);
    date.setDate(date.getDate() + (op === 'sub' ? -Math.abs(days) : Math.abs(days)));
    const sv = el('res-shift-val');
    const daysArr = getDaysArr();
    const monthsArr = getMonthsArr();
    if (sv) sv.innerText = `${date.getDate()}. ${monthsArr[date.getMonth()]} ${date.getFullYear()}. (${daysArr[date.getDay()]})`;
    show('shift-result-box');
}
function calculateAge() {
    const birthVal = getTripleDate('birth-date');
    if (!birthVal) { showToast(safeT('toast.error.enterBirthDate') || 'Unesi datum rođenja.', 'error'); return; }
    const birth = parseDate(birthVal);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (birth > today) { showToast(safeT('toast.error.futureDate') || 'Datum u budućnosti.', 'error'); return; }
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();
    if (days < 0) { months--; days += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
    if (months < 0) { years--; months += 12; }
    const ay = el('res-age-years'); if (ay) ay.innerText = years;
    const ad = el('stat-age-detail');
    if (ad) ad.innerText = currentLang === 'en' ? `${months} mo, ${days} d` : `${months} mes, ${days} d.`;
    const nextBday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBday < today) nextBday.setFullYear(today.getFullYear() + 1);
    const daysToBday = Math.round((nextBday - today) / 86400000);
    const an = el('stat-age-next');
    if (an) an.innerText = daysToBday === 0 ? safeT('label.time.todayBirthday') : safeT('label.time.in') + ' ' + daysToBday + ' ' + safeT('unit.daysShort');
    show('age-result-box'); show('age-stats-row');
}
function calculateWorkdays() {
    const startVal = getTripleDate('workdays-start'), endVal = getTripleDate('workdays-end');
    if (!startVal || !endVal) { showToast(safeT('toast.error.enterBothDates') || 'Unesi oba datuma.', 'error'); return; }
    let start = parseDate(startVal), end = parseDate(endVal);
    if (start > end) { const tmp = start; start = end; end = tmp; }
    let workdays = 0, weekend = 0, total = 0;
    const cur = new Date(start);
    while (cur <= end) {
        const day = cur.getDay();
        if (day === 0 || day === 6) weekend++; else workdays++;
        total++; cur.setDate(cur.getDate() + 1);
    }
    const wv = el('res-workdays-val'); if (wv) wv.innerText = fmt(workdays, 0);
    const wt = el('stat-workdays-total'); if (wt) wt.innerText = fmt(total, 0);
    const ww = el('stat-workdays-weekend'); if (ww) ww.innerText = fmt(weekend, 0);
    show('workdays-result-box'); show('workdays-stats-row');
}

const TIME_SECONDS = { seconds: 1, minutes: 60, hours: 3600, days: 86400, weeks: 604800, months: 2592000, years: 31536000 };
const TIME_LABELS_KEY = { seconds: 'unit.secShort', minutes: 'unit.minShort', hours: 'unit.h', days: 'unit.daysShort', weeks: 'unit.weeksShort', months: 'unit.monthsShort', years: 'unit.yearsShort' };
function convertTimeUnits() {
    const val = num('time-value');
    const from = el('time-from') ? el('time-from').value : 'hours';
    const to = el('time-to') ? el('time-to').value : 'minutes';
    if (val === null) { showToast(safeT('toast.error.enterValue') || 'Unesi vrednost.', 'error'); return; }
    const result = val * TIME_SECONDS[from] / TIME_SECONDS[to];
    const tv = el('res-time-conv-val');
    if (tv) tv.innerText = `${fmt(result)} ${safeT(TIME_LABELS_KEY[to])}`;
    show('result-time-conv-box');
}

// ============================================================
// PRAZNICI
// ============================================================
const SR_HOLIDAYS_FIXED = [
    { d: 1, m: 1, name: 'Nova godina', type: 'national' },
    { d: 2, m: 1, name: 'Nova godina (drugi dan)', type: 'national' },
    { d: 7, m: 1, name: 'Božić (pravoslavni)', type: 'religious' },
    { d: 14, m: 1, name: 'Pravoslavna Nova godina', type: 'religious' },
    { d: 15, m: 2, name: 'Dan državnosti Srbije', type: 'national' },
    { d: 16, m: 2, name: 'Dan državnosti Srbije (drugi dan)', type: 'national' },
    { d: 1, m: 5, name: 'Praznik rada', type: 'national' },
    { d: 2, m: 5, name: 'Praznik rada (drugi dan)', type: 'national' },
    { d: 11, m: 11, name: 'Dan primirja u Prvom svetskom ratu', type: 'national' }
];
function getHolidaysForYear(year) {
    const list = SR_HOLIDAYS_FIXED.map(h => ({ date: new Date(year, h.m - 1, h.d), name: h.name, type: h.type }));
    try {
        const a = year % 4, b = year % 7, c = year % 19;
        const d = (19 * c + 15) % 30;
        const e = (2 * a + 4 * b - d + 34) % 7;
        const month = Math.floor((d + e + 114) / 31);
        const day = ((d + e + 114) % 31) + 1;
        const easterDate = new Date(year, month - 1, day);
        easterDate.setDate(easterDate.getDate() + 13);
        list.push({ date: easterDate, name: 'Vaskrs', type: 'religious' });
        const easterMonday = new Date(easterDate); easterMonday.setDate(easterMonday.getDate() + 1);
        list.push({ date: easterMonday, name: 'Vaskrsni ponedeljak', type: 'religious' });
    } catch (e) {}
    return list.sort((a, b) => a.date - b.date);
}
function renderHolidays() {
    const currentYear = new Date().getFullYear();
    return `
        <div class="converter-box">
            <p class="section-desc">Prikaz državnih i verskih praznika za Srbiju.</p>
            ${inputField('label.time.years', 'holidays-year', '', `value="${currentYear}" oninput="renderHolidaysList()"`)}
        </div>
        <div id="holidays-list" class="holiday-list"></div>
    `;
}
function renderHolidaysList() {
    const list = el('holidays-list');
    if (!list) return;
    const yearEl = el('holidays-year');
    const year = yearEl ? parseInt(yearEl.value) : new Date().getFullYear();
    if (!year || year < 1900 || year > 2100) { list.innerHTML = ''; return; }
    const holidays = getHolidaysForYear(year);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const nowMs = today.getTime();
    let html = '';
    holidays.forEach(h => {
        const hDate = new Date(h.date); hDate.setHours(0, 0, 0, 0);
        const days = Math.round((hDate - nowMs) / 86400000);
        const isToday = days === 0, isTomorrow = days === 1, isPast = days < 0;
        const cls = isToday ? 'today' : (isTomorrow ? 'tomorrow' : (isPast ? 'past' : ''));
        const dayName = hDate.getDate();
        const monthName = hDate.toLocaleDateString('sr-RS', { month: 'short' }).replace('.', '');
        const daysText = isToday ? 'DANAS' : (isTomorrow ? 'SUTRA' : (isPast ? `pre ${Math.abs(days)} d.` : `${days} d.`));
        html += `
            <div class="holiday-card ${cls}">
                <div class="holiday-date-box"><div class="holiday-day">${dayName}</div><div class="holiday-month">${monthName}</div></div>
                <div class="holiday-info"><div class="holiday-name">${escapeHtml(h.name)}</div><div class="holiday-type">${h.type === 'religious' ? 'Verski' : 'Državni'}</div></div>
                <div class="holiday-days-until">${daysText}</div>
            </div>
        `;
    });
    list.innerHTML = html;
}

// ============================================================
// VREMENSKE ZONE
// ============================================================
const TIMEZONES = [
    { id: 'UTC-12', offset: -12, label: 'UTC-12:00' }, { id: 'UTC-11', offset: -11, label: 'UTC-11:00' },
    { id: 'UTC-10', offset: -10, label: 'UTC-10:00 (Havaji)' }, { id: 'UTC-9', offset: -9, label: 'UTC-09:00 (Aljaska)' },
    { id: 'UTC-8', offset: -8, label: 'UTC-08:00 (LA)' }, { id: 'UTC-7', offset: -7, label: 'UTC-07:00 (Denver)' },
    { id: 'UTC-6', offset: -6, label: 'UTC-06:00 (Čikago)' }, { id: 'UTC-5', offset: -5, label: 'UTC-05:00 (Njujork)' },
    { id: 'UTC-4', offset: -4, label: 'UTC-04:00 (Karakaš)' }, { id: 'UTC-3', offset: -3, label: 'UTC-03:00 (Brazil)' },
    { id: 'UTC-2', offset: -2, label: 'UTC-02:00' }, { id: 'UTC-1', offset: -1, label: 'UTC-01:00 (Azori)' },
    { id: 'UTC+0', offset: 0, label: 'UTC±00:00 (London)' }, { id: 'UTC+1', offset: 1, label: 'UTC+01:00 (Beograd, Berlin)' },
    { id: 'UTC+2', offset: 2, label: 'UTC+02:00 (Atina, Kairo)' }, { id: 'UTC+3', offset: 3, label: 'UTC+03:00 (Moskva)' },
    { id: 'UTC+4', offset: 4, label: 'UTC+04:00 (Dubai)' }, { id: 'UTC+5', offset: 5, label: 'UTC+05:00 (Karachi)' },
    { id: 'UTC+6', offset: 6, label: 'UTC+06:00 (Daka)' }, { id: 'UTC+7', offset: 7, label: 'UTC+07:00 (Bangkok)' },
    { id: 'UTC+8', offset: 8, label: 'UTC+08:00 (Peking, Singapur)' }, { id: 'UTC+9', offset: 9, label: 'UTC+09:00 (Tokio)' },
    { id: 'UTC+10', offset: 10, label: 'UTC+10:00 (Sidnej)' }, { id: 'UTC+11', offset: 11, label: 'UTC+11:00' },
    { id: 'UTC+12', offset: 12, label: 'UTC+12:00 (Okland)' }
];
function renderTimeZone() {
    const now = new Date();
    const tzOptions = TIMEZONES.map(tz => `<option value="${tz.id}"${tz.offset === 1 ? ' selected' : ''}>${escapeHtml(tz.label)}</option>`).join('');
    const tzOptionsTo = TIMEZONES.map(tz => `<option value="${tz.id}"${tz.offset === 8 ? ' selected' : ''}>${escapeHtml(tz.label)}</option>`).join('');
    return `
        <div class="converter-box">
            <p class="section-desc">Konvertuj vreme između vremenskih zona.</p>
            <div class="timezone-grid">
                <div class="timezone-field"><label>Iz zone</label><select id="tz-from" class="custom-input" onchange="calculateTimeZone()">${tzOptions}</select></div>
                <div class="timezone-field"><label>U zonu</label><select id="tz-to" class="custom-input" onchange="calculateTimeZone()">${tzOptionsTo}</select></div>
            </div>
            <div class="timezone-grid">
                <div class="timezone-field"><label>Vreme</label><input type="time" id="tz-time" class="custom-input" value="${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}" oninput="calculateTimeZone()"></div>
                <div class="timezone-field"><label>Datum</label><input type="date" id="tz-date" class="custom-input" value="${now.toISOString().slice(0, 10)}" oninput="calculateTimeZone()"></div>
            </div>
            ${calcButton('btn.calculate', 'calculateTimeZone()')}
        </div>
        <div class="timezone-result-card" id="tz-result-box" style="display: none;">
            <div class="timezone-result-label">Rezultat</div>
            <div class="timezone-result-time" id="tz-result-time">--:--</div>
            <div class="timezone-result-date" id="tz-result-date">—</div>
            <div class="timezone-diff" id="tz-result-diff">Razlika: 0 sati</div>
        </div>
    `;
}
function calculateTimeZone() {
    const fromEl = el('tz-from'), toEl = el('tz-to'), timeEl = el('tz-time'), dateEl = el('tz-date');
    if (!fromEl || !toEl || !timeEl || !dateEl) return;
    const fromTz = TIMEZONES.find(tz => tz.id === fromEl.value);
    const toTz = TIMEZONES.find(tz => tz.id === toEl.value);
    if (!fromTz || !toTz) return;
    const [h, m] = timeEl.value.split(':').map(Number);
    const [yy, mm, dd] = dateEl.value.split('-').map(Number);
    if (isNaN(h) || isNaN(yy)) return;
    const utcDate = new Date(Date.UTC(yy, mm - 1, dd, h, m));
    utcDate.setUTCMinutes(utcDate.getUTCMinutes() - fromTz.offset * 60);
    const targetDate = new Date(utcDate.getTime() + toTz.offset * 60 * 60000);
    const resultH = String(targetDate.getUTCHours()).padStart(2, '0');
    const resultM = String(targetDate.getUTCMinutes()).padStart(2, '0');
    const resultD = targetDate.getUTCDate();
    const resultMo = targetDate.getUTCMonth() + 1;
    const resultY = targetDate.getUTCFullYear();
    const diffHours = toTz.offset - fromTz.offset;
    const rt = el('tz-result-time'); if (rt) rt.innerText = `${resultH}:${resultM}`;
    const rd = el('tz-result-date'); if (rd) rd.innerText = `${resultD}.${resultMo}.${resultY}.`;
    const rdiff = el('tz-result-diff');
    if (rdiff) rdiff.innerText = `Razlika: ${diffHours >= 0 ? '+' : ''}${diffHours} sati`;
    show('tz-result-box');
}

// ============================================================
// AUTO
// ============================================================
function renderAutoPotrosnja() {
    return `
        <div class="converter-box">
            ${inputField('label.auto.distance', 'distance', 'km', 'placeholder="500"')}
            ${inputField('label.auto.fuel', 'fuel', 'L', 'step="0.1" placeholder="35"')}
            ${inputFieldWithSelect('label.auto.price', 'price', 'auto-currency', ['RSD', 'EUR'], '180')}
            ${calcButton('btn.calculate', 'calculateAuto()')}
        </div>
        ${resultCard('result-box', 'fuel', 'label.auto.avgConsumption', 'res-consumption', 'L/100km', 'AUTO', 'label.auto.fuelConsumption')}
        ${statsRow('stats-row', [['label.auto.distance', 'stat-dist', '0 km'], ['label.auto.fuel', 'stat-fuel', '0 L'], ['label.auto.total', 'stat-cost', '—']])}
    `;
}
function renderAutoTrosakPuta() {
    return `
        <div class="converter-box">
            ${sectionDescKey('desc.auto.tripCost')}
            ${inputField('label.auto.distance', 'road-distance', 'km', 'placeholder="500"')}
            ${inputField('label.auto.avgConsumption', 'road-consumption', 'L/100km', 'step="0.1" placeholder="7"')}
            ${inputField('label.auto.fuelPrice', 'road-price', 'RSD', 'step="0.1" placeholder="180"')}
            ${inputField('label.auto.toll', 'road-toll', 'RSD', 'placeholder="3000"')}
            ${inputField('label.auto.parking', 'road-parking', 'RSD', 'placeholder="0"')}
            ${inputField('label.auto.otherCosts', 'road-other', 'RSD', 'placeholder="0"')}
            ${inputField('label.auto.people', 'road-people', '', 'value="1" min="1"')}
            ${calcButton('btn.calculate', 'calculateRoadTrip()')}
        </div>
        ${resultCard('road-result-box', 'coins', 'label.auto.totalTripCost', 'res-road-total', 'RSD', 'PUTOVANJE', 'label.auto.tripCost')}
        ${statsRow('road-stats-row', [['label.auto.fuel', 'stat-road-fuel', '0 RSD'], ['label.auto.perPerson', 'stat-road-person', '0 RSD'], ['label.auto.litersNeeded', 'stat-road-liters', '0 L']])}
    `;
}
function renderAutoServis() {
    return `
        <div class="converter-box">
            ${sectionDescKey('desc.auto.service')}
            ${inputField('label.auto.currentKm', 'current-km', 'km', 'placeholder="150000"')}
            ${inputField('label.auto.lastServiceKm', 'last-service-km', 'km', 'placeholder="140000"')}
            ${inputField('label.auto.serviceInterval', 'service-interval', 'km', 'value="10000"')}
            ${calcButton('btn.calculate', 'calculateService()')}
        </div>
        <div id="service-result-box" class="result-card-green" style="display: none;">
            <div class="res-left"><div class="pump-icon">${icon('wrench')}</div><div><div class="res-label" id="res-service-label">${safeT('label.auto.nextService')}</div><h2><span id="res-service-km">0</span> <small>km</small></h2></div></div>
            <div class="res-actions">
                <button class="copy-btn" onclick="copyResult('res-service-km', 'km', event)">${safeT('result.copy')}</button>
                <button class="copy-btn" data-category="AUTO" data-label="Servis" onclick="saveHistory(this)">${safeT('result.save')}</button>
                <button class="copy-btn" data-category="AUTO" data-label="Servis" onclick="shareResult(this)">${safeT('result.share')}</button>
            </div>
        </div>
        ${statsRow('service-stats-row', [['label.auto.nextServiceAt', 'stat-service-next', '0 km']])}
    `;
}
function renderAutoGodisnji() {
    return `
        <div class="converter-box">
            ${sectionDescKey('desc.auto.annualCost')}
            ${inputField('label.auto.registration', 'cost-reg', 'RSD', 'placeholder="30000"')}
            ${inputField('label.auto.fuelAndService', 'cost-fuel-year', 'RSD', 'placeholder="120000"')}
            ${calcButton('btn.calculate', 'calculateAnnualCost()')}
        </div>
        ${resultCard('annual-result-box', 'calendar', 'label.auto.totalAnnual', 'res-annual-total', 'RSD', 'AUTO', 'label.auto.annualCost')}
        ${statsRow('annual-stats-row', [['label.auto.avgMonthly', 'stat-annual-month', '0 RSD']])}
    `;
}
function calculateAuto() {
    const dist = num('distance'), fuel = num('fuel');
    const price = num('price') || 0;
    const currency = el('auto-currency') ? el('auto-currency').value : 'RSD';
    if (!dist || !fuel) { showToast(safeT('toast.error.enterDistanceFuel') || 'Unesi distancu i gorivo.', 'error'); return; }
    const consumption = (fuel * 100) / dist;
    const totalCost = fuel * price;
    const rc = el('res-consumption'); if (rc) rc.innerText = fmt(consumption, 2);
    const sd = el('stat-dist'); if (sd) sd.innerText = fmt(dist) + ' km';
    const sf = el('stat-fuel'); if (sf) sf.innerText = fmt(fuel) + ' L';
    const sc = el('stat-cost'); if (sc) sc.innerText = price > 0 ? fmt(totalCost, 0) + ' ' + currency : '—';
    show('result-box'); show('stats-row');
}
function calculateService() {
    const currentKm = num('current-km'), lastService = num('last-service-km'), interval = num('service-interval');
    if (currentKm === null || lastService === null || !interval) { showToast(safeT('toast.error.enterAll') || 'Unesi sve vrednosti.', 'error'); return; }
    const nextServiceKm = lastService + interval;
    const remainingKm = nextServiceKm - currentKm;
    const lbl = el('res-service-label'), km = el('res-service-km');
    if (remainingKm >= 0) { if (lbl) lbl.innerText = safeT('label.auto.nextService'); if (km) km.innerText = fmt(remainingKm, 0); }
    else { if (lbl) lbl.innerText = safeT('label.auto.serviceOverdue'); if (km) km.innerText = fmt(-remainingKm, 0); }
    const sn = el('stat-service-next'); if (sn) sn.innerText = fmt(nextServiceKm, 0) + ' km';
    show('service-result-box'); show('service-stats-row');
}
function calculateAnnualCost() {
    const reg = num('cost-reg') || 0, fuelYear = num('cost-fuel-year') || 0;
    const total = reg + fuelYear;
    if (total === 0) { showToast(safeT('toast.error.enterAtLeastOne') || 'Unesi barem jednu vrednost.', 'error'); return; }
    const at = el('res-annual-total'); if (at) at.innerText = money(total);
    const am = el('stat-annual-month'); if (am) am.innerText = money(total / 12) + ' RSD';
    show('annual-result-box'); show('annual-stats-row');
}
function calculateRoadTrip() {
    const distance = num('road-distance'), consumption = num('road-consumption'), price = num('road-price');
    const toll = num('road-toll') || 0, parking = num('road-parking') || 0, other = num('road-other') || 0;
    const people = num('road-people') || 1;
    if (!distance || !consumption || !price) { showToast(safeT('toast.error.enterAll') || 'Unesi sve vrednosti.', 'error'); return; }
    const liters = (distance / 100) * consumption;
    const fuelCost = liters * price;
    const totalCost = fuelCost + toll + parking + other;
    const perPerson = totalCost / people;
    const rt = el('res-road-total'); if (rt) rt.innerText = money(totalCost);
    const rf = el('stat-road-fuel'); if (rf) rf.innerText = money(fuelCost) + ' RSD';
    const rp = el('stat-road-person'); if (rp) rp.innerText = money(perPerson) + ' RSD';
    const rl = el('stat-road-liters'); if (rl) rl.innerText = fmt(liters, 1) + ' L';
    show('road-result-box'); show('road-stats-row');
}

// ============================================================
// BICIKL
// ============================================================
function renderBikeBrzina() {
    return `
        <div class="converter-box">
            ${sectionDescKey('desc.bike.speed')}
            ${inputField('label.bike.frontChainring', 'bike-front', '', 'placeholder="32"')}
            ${inputField('label.bike.rearChainring', 'bike-rear', '', 'placeholder="18"')}
            ${inputField('label.bike.cadence', 'bike-cadence', 'rpm', 'placeholder="90"')}
            ${inputField('label.bike.wheelSize', 'bike-wheel-inch', 'inča', 'placeholder="29"')}
            ${calcButton('btn.calculate', 'calculateBike()')}
        </div>
        ${resultCard('bike-result-box', 'bike', 'label.bike.calcSpeed', 'res-bike-speed', 'km/h', 'BICIKL', 'label.bike.speed')}
        ${statsRow('bike-stats-row', [['label.bike.gearRatio', 'stat-gear-ratio', '0'], ['label.bike.wheelDevelopment', 'stat-development', '0 m']])}
    `;
}
function renderBikePritisak() {
    return `
        <div class="converter-box">
            ${sectionDescKey('desc.bike.pressure')}
            ${inputField('label.bike.totalWeight', 'bike-rider-weight', 'kg', 'placeholder="80"')}
            ${inputField('label.bike.tireWidth', 'bike-tire-width', 'mm', 'placeholder="28"')}
            ${selectField('label.bike.tireType', 'bike-tire-type', [
                { value: 'tube', text: safeT('option.bike.tube') },
                { value: 'tubeless', text: safeT('option.bike.tubeless') }
            ])}
            ${calcButton('btn.calculate', 'calculateBikePressure()')}
        </div>
        ${resultCard('bike-pressure-result-box', 'wind', 'label.bike.recommendedPressure', 'res-bike-pressure-bar', 'Bar', 'BICIKL', 'label.bike.pressure')}
        ${statsRow('bike-pressure-stats-row', [['label.bike.pressurePSI', 'stat-pressure-psi', '0 PSI']])}
    `;
}
function renderBikeRama() {
    return `
        <div class="converter-box">
            ${sectionDescKey('desc.bike.frame')}
            ${inputField('label.bike.height', 'bike-user-height', 'cm', 'placeholder="175"')}
            ${selectField('label.bike.bikeType', 'bike-frame-type', [
                { value: 'mtb', text: safeT('option.bike.mtb') },
                { value: 'road', text: safeT('option.bike.road') },
                { value: 'trekking', text: safeT('option.bike.trekking') }
            ])}
            ${calcButton('btn.calculate', 'calculateBikeFrame()')}
        </div>
        <div id="bike-frame-result-box" class="result-card-green" style="display: none;">
            <div class="res-left"><div class="pump-icon">${icon('ruler')}</div><div><div class="res-label">${safeT('label.bike.recommendedFrame')}</div><h2><span id="res-bike-frame-size">0</span> <small id="res-bike-frame-unit">${safeT('unit.inch')}</small></h2></div></div>
            <div class="res-actions">
                <button class="copy-btn" onclick="copyResult('res-bike-frame-size', 'res-bike-frame-unit', event)">${safeT('result.copy')}</button>
                <button class="copy-btn" data-category="BICIKL" data-label="Frame" onclick="saveHistory(this)">${safeT('result.save')}</button>
                <button class="copy-btn" data-category="BICIKL" data-label="Frame" onclick="shareResult(this)">${safeT('result.share')}</button>
            </div>
        </div>
        ${statsRow('bike-frame-stats-row', [['label.bike.sizeLabel', 'stat-frame-label', 'M'], ['label.bike.inOtherUnits', 'stat-frame-alt', '0']])}
    `;
}
function renderBikeKalorije() {
    return `
        <div class="converter-box">
            ${sectionDescKey('desc.bike.calories')}
            ${inputField('label.bike.riderWeight', 'bike-cal-weight', 'kg', 'placeholder="75"')}
            ${inputField('label.bike.rideDuration', 'bike-cal-time', 'min', 'placeholder="60"')}
            ${inputField('label.bike.avgSpeed', 'bike-cal-speed', 'km/h', 'placeholder="20"')}
            ${calcButton('btn.calculate', 'calculateBikeCalories()')}
        </div>
        ${resultCard('bike-cal-result-box', 'flame', 'label.bike.caloriesBurned', 'res-bike-calories', 'kcal', 'BICIKL', 'label.bike.calories')}
    `;
}
function calculateBike() {
    const front = num('bike-front'), rear = num('bike-rear'), cadence = num('bike-cadence'), wheelInch = num('bike-wheel-inch');
    if (!front || !rear || !cadence || !wheelInch) { showToast(safeT('toast.error.enterFour') || 'Unesi sve 4 vrednosti.', 'error'); return; }
    const gearRatio = front / rear;
    const wheelCircumference = wheelInch * 0.0254 * Math.PI;
    const development = gearRatio * wheelCircumference;
    const speed = (cadence * development * 60) / 1000;
    const bs = el('res-bike-speed'); if (bs) bs.innerText = fmt(speed, 1);
    const gr = el('stat-gear-ratio'); if (gr) gr.innerText = fmt(gearRatio, 2);
    const dv = el('stat-development'); if (dv) dv.innerText = fmt(development, 2) + ' m';
    show('bike-result-box'); show('bike-stats-row');
}
function calculateBikePressure() {
    const weight = num('bike-rider-weight'), width = num('bike-tire-width');
    const type = el('bike-tire-type') ? el('bike-tire-type').value : 'tube';
    if (!weight || !width) { showToast(safeT('toast.error.enterWeightWidth') || 'Unesi težinu i širinu gume.', 'error'); return; }
    let bar = (weight / 10) / (width / 20);
    if (type === 'tubeless') bar -= 0.5;
    bar = Math.max(1.5, Math.min(8.5, bar));
    const psi = bar * 14.5038;
    const pb = el('res-bike-pressure-bar'); if (pb) pb.innerText = fmt(bar, 1);
    const pp = el('stat-pressure-psi'); if (pp) pp.innerText = Math.round(psi) + ' PSI';
    show('bike-pressure-result-box'); show('bike-pressure-stats-row');
}
function calculateBikeFrame() {
    const height = num('bike-user-height');
    const type = el('bike-frame-type') ? el('bike-frame-type').value : 'mtb';
    if (!height) { showToast(safeT('toast.error.enterHeight') || 'Unesi visinu.', 'error'); return; }
    let main, unit, alt;
    if (type === 'mtb') { const inch = height * 0.1; main = inch; unit = safeT('unit.inch'); alt = fmt(inch * 2.54, 0) + ' cm'; }
    else { const cm = height * 0.31; main = cm; unit = 'cm'; alt = fmt(cm / 2.54, 1) + ' ' + safeT('unit.inch'); }
    let sizeLabel;
    if (height < 165) sizeLabel = 'S';
    else if (height < 178) sizeLabel = 'M';
    else if (height < 188) sizeLabel = 'L';
    else sizeLabel = 'XL';
    const fs = el('res-bike-frame-size'); if (fs) fs.innerText = fmt(main, 1);
    const fu = el('res-bike-frame-unit'); if (fu) fu.innerText = unit;
    const fl = el('stat-frame-label'); if (fl) fl.innerText = sizeLabel;
    const fa = el('stat-frame-alt'); if (fa) fa.innerText = alt;
    show('bike-frame-result-box'); show('bike-frame-stats-row');
}
function calculateBikeCalories() {
    const weight = num('bike-cal-weight'), timeMinutes = num('bike-cal-time'), speed = num('bike-cal-speed');
    if (!weight || !timeMinutes || !speed) { showToast(safeT('toast.error.enterAll') || 'Unesi sve vrednosti.', 'error'); return; }
    let met = 8.0;
    if (speed < 15) met = 6.0; else if (speed < 20) met = 8.0; else if (speed < 25) met = 10.0; else met = 12.0;
    const bc = el('res-bike-calories'); if (bc) bc.innerText = fmt(met * weight * (timeMinutes / 60), 0);
    show('bike-cal-result-box');
}

// ============================================================
// POSAO (WORK)
// ============================================================
function renderWorkVreme() {
    return `<div class="converter-box">${sectionDescKey('desc.work.time')}<div class="input-field"><label>${safeT('label.work.startTime')}</label><div class="input-wrapper"><input type="time" id="work-start" class="custom-input"></div></div><div class="input-field"><label>${safeT('label.work.endTime')}</label><div class="input-wrapper"><input type="time" id="work-end" class="custom-input"></div></div>${inputField('label.work.breakDuration', 'work-break', 'min', 'value="30"')}${selectField('label.work.dayType', 'work-day-type', [{ value: 'workday', text: safeT('option.work.workday') }, { value: 'weekend', text: safeT('option.work.weekend') }, { value: 'holiday', text: safeT('option.work.holiday') }])}${calcButton('btn.calculate', 'calculateWorkTime()')}</div><div id="worktime-result-box" class="result-card-green" style="display: none;"><div class="res-left"><div class="pump-icon">${icon('timer')}</div><div><div class="res-label">${safeT('label.work.totalWorkTime')}</div><h2><span id="res-worktime">0</span></h2></div></div><div class="res-actions"><button class="copy-btn" onclick="copyResult('res-worktime', '', event)">${safeT('result.copy')}</button><button class="copy-btn" data-category="POSAO" data-label="Radno vreme" onclick="saveHistory(this)">${safeT('result.save')}</button><button class="copy-btn" data-category="POSAO" data-label="Radno vreme" onclick="shareResult(this)">${safeT('result.share')}</button></div></div>${statsRow('worktime-stats-row', [['label.work.withoutBreak', 'stat-worktime-raw', '0'], ['label.work.decimal', 'stat-worktime-dec', '0 h'], ['label.work.multiplier', 'stat-worktime-mult', '100%']])}`;
}
function renderWorkSatnica() {
    return `<div class="converter-box">${sectionDescKey('desc.work.hourly')}${inputField('label.work.netSalary', 'work-salary', 'RSD', 'placeholder="80000"')}${inputField('label.work.monthlyHours', 'work-hours', '', 'value="176"')}${selectField('label.work.calcType', 'work-rate-type', [{ value: 'monthly', text: safeT('option.work.monthly') }, { value: 'yearly', text: safeT('option.work.yearly') }])}${calcButton('btn.calculate', 'calculateHourlyRate()')}</div>${resultCard('hourly-result-box', 'dollarSign', 'label.work.hourlyRate', 'res-hourly-rate', 'RSD', 'POSAO', 'label.work.hourly')}${statsRow('hourly-stats-row', [['label.work.daily8h', 'stat-hourly-day', '0 RSD'], ['label.work.weekly40h', 'stat-hourly-week', '0 RSD'], ['label.work.perMinute', 'stat-hourly-min', '0 RSD']])}`;
}
function renderWorkPlata() {
    return `<div class="converter-box">${sectionDescKey('desc.work.salary')}${selectField('label.work.calcType', 'plata-type', [{ value: 'neto-to-bruto', text: safeT('option.work.netToGross') }, { value: 'bruto-to-neto', text: safeT('option.work.grossToNet') }])}${inputField('label.work.amount', 'plata-amount', 'RSD', 'placeholder="80000"')}${calcButton('btn.calculate', 'calculateSalary()')}</div><div id="plata-result-box" class="result-card-green" style="display: none;"><div class="res-left"><div class="pump-icon">${icon('banknote')}</div><div><div class="res-label" id="plata-result-label">${safeT('label.work.netSalaryLabel')}</div><h2><span id="res-plata-val">0</span> <small>RSD</small></h2></div></div><div class="res-actions"><button class="copy-btn" onclick="copyResult('res-plata-val', 'RSD', event)">${safeT('result.copy')}</button><button class="copy-btn" data-category="POSAO" data-label="Plata" onclick="saveHistory(this)">${safeT('result.save')}</button><button class="copy-btn" data-category="POSAO" data-label="Plata" onclick="shareResult(this)">${safeT('result.share')}</button></div></div>${statsRow('plata-stats-row', [['label.work.pensionContribution', 'stat-plata-pio', '0 RSD'], ['label.work.healthContribution', 'stat-plata-zdr', '0 RSD'], ['label.work.tax', 'stat-plata-porez', '0 RSD']])}`;
}
function renderWorkOdmor() {
    return `<div class="converter-box">${sectionDescKey('desc.work.vacation')}${inputField('label.work.totalVacationDays', 'odmor-total', '', 'value="20"')}${inputField('label.work.usedDays', 'odmor-used', '', 'value="5"')}${inputField('label.work.avgDailyEarning', 'odmor-daily', 'RSD', 'placeholder="3000"')}${calcButton('btn.calculate', 'calculateVacation()')}</div>${resultCard('odmor-result-box', 'calendar', 'label.work.remainingDays', 'res-odmor-left', '', 'POSAO', 'label.work.vacationShort')}${statsRow('odmor-stats-row', [['label.work.used', 'stat-odmor-used', '0'], ['label.work.vacationPay', 'stat-odmor-pay', '0 RSD']])}`;
}
function renderWorkNocni() {
    return `<div class="converter-box">${sectionDescKey('desc.work.night')}${inputField('label.work.nightHours', 'nocni-hours', 'h', 'placeholder="8"')}${inputField('label.work.hourlyRate', 'nocni-rate', 'RSD', 'placeholder="500"')}${selectField('label.work.increase', 'nocni-mult', [{ value: '1.26', text: '26%' }, { value: '1.35', text: '35%' }, { value: '1.5', text: '50%' }])}${calcButton('btn.calculate', 'calculateNightWork()')}</div>${resultCard('nocni-result-box', 'moon', 'label.work.nightEarning', 'res-nocni-total', 'RSD', 'POSAO', 'label.work.nightShort')}${statsRow('nocni-stats-row', [['label.work.baseEarning', 'stat-nocni-base', '0 RSD'], ['label.work.increase', 'stat-nocni-bonus', '0 RSD']])}`;
}
function renderWorkPrekovremeno() {
    return `<div class="converter-box">${sectionDescKey('desc.work.overtime')}${inputField('label.work.overtimeHours', 'prek-hours', 'h', 'placeholder="4"')}${inputField('label.work.hourlyRate', 'prek-rate', 'RSD', 'placeholder="500"')}${calcButton('btn.calculate', 'calculateOvertime()')}</div>${resultCard('prek-result-box', 'activity', 'label.work.totalEarning', 'res-prek-total', 'RSD', 'POSAO', 'label.work.overtimeShort')}${statsRow('prek-stats-row', [['label.work.first2h', 'stat-prek-first', '0 RSD'], ['label.work.rest50', 'stat-prek-rest', '0 RSD']])}`;
}
function calculateWorkTime() {
    const start = el('work-start') ? el('work-start').value : '';
    const end = el('work-end') ? el('work-end').value : '';
    const breakMin = num('work-break') || 0;
    const dayType = el('work-day-type') ? el('work-day-type').value : 'workday';
    if (!start || !end) { showToast(safeT('toast.error.enterStartEnd') || 'Unesi početak i kraj.', 'error'); return; }
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    let startMin = sh * 60 + sm, endMin = eh * 60 + em;
    if (endMin <= startMin) endMin += 24 * 60;
    const rawMinutes = endMin - startMin;
    const totalMinutes = Math.max(0, rawMinutes - breakMin);
    const hours = Math.floor(totalMinutes / 60), minutes = totalMinutes % 60;
    let multLabel = '100%';
    if (dayType === 'weekend') multLabel = '110%';
    else if (dayType === 'holiday') multLabel = '150%';
    const rw = el('res-worktime'); if (rw) rw.innerText = `${hours}h ${minutes}min`;
    const wr = el('stat-worktime-raw'); if (wr) wr.innerText = `${Math.floor(rawMinutes / 60)}h ${rawMinutes % 60}min`;
    const wd = el('stat-worktime-dec'); if (wd) wd.innerText = fmt(totalMinutes / 60, 2) + ' h';
    const wm = el('stat-worktime-mult'); if (wm) wm.innerText = multLabel;
    show('worktime-result-box'); show('worktime-stats-row');
}
function calculateHourlyRate() {
    const salary = num('work-salary'), hours = num('work-hours');
    const type = el('work-rate-type') ? el('work-rate-type').value : 'monthly';
    if (!salary || !hours) { showToast(safeT('toast.error.enterSalaryHours') || 'Unesi platu i sate.', 'error'); return; }
    const monthlySalary = type === 'yearly' ? salary / 12 : salary;
    const hourly = monthlySalary / hours;
    const hr = el('res-hourly-rate'); if (hr) hr.innerText = money(hourly);
    const hd = el('stat-hourly-day'); if (hd) hd.innerText = money(hourly * 8) + ' RSD';
    const hw = el('stat-hourly-week'); if (hw) hw.innerText = money(hourly * 40) + ' RSD';
    const hm = el('stat-hourly-min'); if (hm) hm.innerText = money(hourly / 60) + ' RSD';
    show('hourly-result-box'); show('hourly-stats-row');
}
function calculateSalary() {
    const type = el('plata-type') ? el('plata-type').value : 'neto-to-bruto';
    const amount = num('plata-amount');
    if (!amount) { showToast(safeT('toast.error.enterAmount') || 'Unesi iznos.', 'error'); return; }
    const PIO = 0.14, ZDR = 0.0515, NEZ = 0.0075, POREZ = 0.10, NEOPOREZIVO = 25000;
    let neto, bruto, pio, zdr, nez, porez;
    if (type === 'bruto-to-neto') {
        bruto = amount;
        pio = bruto * PIO; zdr = bruto * ZDR; nez = bruto * NEZ;
        porez = Math.max(0, bruto - pio - zdr - nez - NEOPOREZIVO) * POREZ;
        neto = bruto - pio - zdr - nez - porez;
    } else {
        neto = amount;
        bruto = neto / 0.65;
        for (let i = 0; i < 10; i++) {
            pio = bruto * PIO; zdr = bruto * ZDR; nez = bruto * NEZ;
            porez = Math.max(0, bruto - pio - zdr - nez - NEOPOREZIVO) * POREZ;
            const diff = neto - (bruto - pio - zdr - nez - porez);
            if (Math.abs(diff) < 1) break;
            bruto += diff / 0.65;
        }
        pio = bruto * PIO; zdr = bruto * ZDR; nez = bruto * NEZ;
        porez = Math.max(0, bruto - pio - zdr - nez - NEOPOREZIVO) * POREZ;
    }
    const label = el('plata-result-label'), val = el('res-plata-val');
    if (type === 'bruto-to-neto') { if (label) label.innerText = safeT('label.work.netSalaryLabel'); if (val) val.innerText = money(neto); }
    else { if (label) label.innerText = safeT('label.work.grossSalaryLabel'); if (val) val.innerText = money(bruto); }
    const sp = el('stat-plata-pio'); if (sp) sp.innerText = money(pio) + ' RSD';
    const sz = el('stat-plata-zdr'); if (sz) sz.innerText = money(zdr) + ' RSD';
    const spo = el('stat-plata-porez'); if (spo) spo.innerText = money(porez) + ' RSD';
    show('plata-result-box'); show('plata-stats-row');
}
function calculateVacation() {
    const total = num('odmor-total') || 0, used = num('odmor-used') || 0, daily = num('odmor-daily') || 0;
    const left = Math.max(0, total - used);
    const rl = el('res-odmor-left'); if (rl) rl.innerText = left;
    const su = el('stat-odmor-used'); if (su) su.innerText = used + ' ' + safeT('unit.daysShort');
    const sp = el('stat-odmor-pay'); if (sp) sp.innerText = money(left * daily) + ' RSD';
    show('odmor-result-box'); show('odmor-stats-row');
}
function calculateNightWork() {
    const hours = num('nocni-hours'), rate = num('nocni-rate');
    const mult = el('nocni-mult') ? parseFloat(el('nocni-mult').value) : 1.26;
    if (!hours || !rate) { showToast(safeT('toast.error.enterHoursRate') || 'Unesi sate i satnicu.', 'error'); return; }
    const base = hours * rate, total = base * mult;
    const nt = el('res-nocni-total'); if (nt) nt.innerText = money(total);
    const nb = el('stat-nocni-base'); if (nb) nb.innerText = money(base) + ' RSD';
    const nbo = el('stat-nocni-bonus'); if (nbo) nbo.innerText = money(total - base) + ' RSD';
    show('nocni-result-box'); show('nocni-stats-row');
}
function calculateOvertime() {
    const hours = num('prek-hours'), rate = num('prek-rate');
    if (!hours || !rate) { showToast(safeT('toast.error.enterHoursRate') || 'Unesi sate i satnicu.', 'error'); return; }
    const first2 = Math.min(hours, 2), rest = Math.max(0, hours - 2);
    const pt = el('res-prek-total'); if (pt) pt.innerText = money(first2 * rate * 1.26 + rest * rate * 1.5);
    const pf = el('stat-prek-first'); if (pf) pf.innerText = money(first2 * rate * 1.26) + ' RSD';
    const pr = el('stat-prek-rest'); if (pr) pr.innerText = money(rest * rate * 1.5) + ' RSD';
    show('prek-result-box'); show('prek-stats-row');
}
// ============================================================
// GRAĐEVINA (HOMECALC)
// ============================================================
let openingsData = { paint: [], tile: [], block: [], board: [] };

function renderHomePovrsina() {
    return `<div class="converter-box">${sectionDescKey('desc.home.area')}${selectField('label.home.shape', 'shape-type', [{ value: 'rect', text: safeT('option.home.rectangle') }, { value: 'square', text: safeT('option.home.square') }, { value: 'circle', text: safeT('option.home.circle') }, { value: 'triangle', text: safeT('option.home.triangle') }], 'rect')}<div id="shape-rect-inputs">${inputField('label.home.length', 'shape-a', 'm', 'placeholder="5"')}${inputField('label.home.width', 'shape-b', 'm', 'placeholder="3"')}</div><div id="shape-square-inputs" style="display:none;">${inputField('label.home.side', 'shape-side', 'm', 'placeholder="4"')}</div><div id="shape-circle-inputs" style="display:none;">${inputField('label.home.diameter', 'shape-diameter', 'm', 'placeholder="4"')}</div><div id="shape-triangle-inputs" style="display:none;">${inputField('label.home.length', 'shape-base', 'm', 'placeholder="6"')}${inputField('label.home.height', 'shape-height', 'm', 'placeholder="4"')}</div>${calcButton('btn.calculate', 'calculateShapeArea()')}</div>${resultCard('shape-result-box', 'square', 'label.home.area', 'res-shape-area', 'm²', 'GRAĐEVINA', 'label.home.area')}`;
}
function renderHomeBlokovi() {
    return `<div class="converter-box">${sectionDescKey('desc.home.blocks')}${inputField('label.home.wallLength', 'block-wall-l', 'm', 'placeholder="10"')}${inputField('label.home.wallHeight', 'block-wall-h', 'm', 'placeholder="2.8"')}${inputField('label.home.blockDimensions', 'block-l', 'cm', 'placeholder="25"')}${inputField('label.home.blockDimensions', 'block-h', 'cm', 'placeholder="19"')}${inputField('label.home.pricePerPiece', 'block-price', '€', 'placeholder="0"')}${calcButton('btn.calculate', 'calculateBlocks()')}</div>${resultCard('blocks-result-box', 'bricks', 'label.home.blocksNeeded', 'res-blocks-count', '', 'GRAĐEVINA', 'Blokovi')}${statsRow('blocks-stats-row', [['label.home.netArea', 'stat-blocks-area', '0 m²'], ['label.home.totalPrice', 'stat-blocks-price', '—']])}`;
}
function renderHomeBeton() {
    return `<div class="converter-box">${sectionDescKey('desc.home.concrete')}${inputField('label.home.length', 'beton-l', 'm', 'placeholder="5"')}${inputField('label.home.width', 'beton-w', 'm', 'placeholder="3"')}${inputField('label.home.thickness', 'beton-h', 'm', 'placeholder="0.2"')}${calcButton('btn.calculate', 'calculateConcrete()')}</div>${resultCard('beton-result-box', 'building', 'label.home.concreteNeeded', 'res-beton-m3', 'm³', 'GRAĐEVINA', 'Beton')}`;
}
function renderHomeFarbanje() {
    return `<div class="converter-box">${sectionDescKey('desc.home.painting')}${inputField('label.home.wallLength', 'paint-width', 'm', 'placeholder="10"')}${inputField('label.home.wallHeight', 'paint-height', 'm', 'placeholder="2.8"')}${inputField('label.home.wallCount', 'paint-walls', '', 'placeholder="4"')}${inputField('label.home.paintCoverage', 'paint-coverage', 'm²/L', 'placeholder="10"')}${calcButton('btn.calculate', 'calculatePaint()')}</div>${resultCard('paint-result-box', 'paint', 'label.home.paintNeeded', 'res-paint-liters', 'L', 'GRAĐEVINA', 'Farbanje')}${statsRow('paint-stats-row', [['label.home.totalArea', 'stat-paint-area', '0 m²'], ['label.home.openingsDeducted', 'stat-paint-openings', '0 m²']])}`;
}
function calculateShapeArea() {
    const type = el('shape-type') ? el('shape-type').value : 'rect';
    let area = 0;
    if (type === 'rect') {
        const a = num('shape-a'), b = num('shape-b');
        if (!a || !b) { showToast(safeT('toast.error.enterLengthWidth') || 'Unesi dužinu i širinu.', 'error'); return; }
        area = a * b;
    } else if (type === 'square') {
        const s = num('shape-side');
        if (!s) { showToast(safeT('toast.error.enterSide') || 'Unesi stranu.', 'error'); return; }
        area = s * s;
    } else if (type === 'circle') {
        const d = num('shape-diameter');
        if (!d) { showToast(safeT('toast.error.enterDiameter') || 'Unesi prečnik.', 'error'); return; }
        area = Math.PI * Math.pow(d / 2, 2);
    } else if (type === 'triangle') {
        const b = num('shape-base'), h = num('shape-height');
        if (!b || !h) { showToast(safeT('toast.error.enterBaseHeight') || 'Unesi osnovu i visinu.', 'error'); return; }
        area = (b * h) / 2;
    }
    const sa = el('res-shape-area'); if (sa) sa.innerText = fmt(area, 2);
    show('shape-result-box');
}
function calculatePaint() {
    const width = num('paint-width'), height = num('paint-height'), walls = num('paint-walls') || 0, coverage = num('paint-coverage') || 10;
    if (!width || !height || !walls) { showToast(safeT('toast.error.enterWallDims') || 'Unesi dimenzije zida.', 'error'); return; }
    const netArea = Math.max(0, width * height * walls - getOpeningsArea('paint'));
    const pl = el('res-paint-liters'); if (pl) pl.innerText = fmt(netArea / coverage, 2);
    const pa = el('stat-paint-area'); if (pa) pa.innerText = fmt(netArea, 2) + ' m²';
    const po = el('stat-paint-openings'); if (po) po.innerText = fmt(getOpeningsArea('paint'), 2) + ' m²';
    show('paint-result-box'); show('paint-stats-row');
}
function getOpeningsArea(type) {
    return openingsData[type].reduce((sum, op) => sum + ((op.w || 0) * (op.h || 0)), 0);
}
function calculateConcrete() {
    const l = num('beton-l'), w = num('beton-w'), h = num('beton-h');
    if (!l || !w || !h) { showToast(safeT('toast.error.enterAllDimensions') || 'Unesi sve dimenzije.', 'error'); return; }
    const bm = el('res-beton-m3'); if (bm) bm.innerText = fmt(l * w * h, 3);
    show('beton-result-box');
}
function calculateBlocks() {
    const wallL = num('block-wall-l'), wallH = num('block-wall-h'), blockL = num('block-l'), blockH = num('block-h');
    if (!wallL || !wallH || !blockL || !blockH) { showToast(safeT('toast.error.enterBlockWallDims') || 'Unesi dimenzije zida i bloka.', 'error'); return; }
    const netArea = Math.max(0, wallL * wallH - getOpeningsArea('block'));
    const blocks = Math.ceil(netArea / ((blockL / 100) * (blockH / 100)));
    const bc = el('res-blocks-count'); if (bc) bc.innerText = blocks;
    const ba = el('stat-blocks-area'); if (ba) ba.innerText = fmt(netArea, 2) + ' m²';
    const price = num('block-price');
    const bp = el('stat-blocks-price'); if (bp) bp.innerText = price ? money(blocks * price) + ' €' : '—';
    show('blocks-result-box'); show('blocks-stats-row');
}
function toggleShapeInputs() {
    const type = el('shape-type') ? el('shape-type').value : 'rect';
    const rect = el('shape-rect-inputs');
    const square = el('shape-square-inputs');
    const circle = el('shape-circle-inputs');
    const triangle = el('shape-triangle-inputs');
    if (rect) rect.style.display = type === 'rect' ? 'flex' : 'none';
    if (square) square.style.display = type === 'square' ? 'flex' : 'none';
    if (circle) circle.style.display = type === 'circle' ? 'flex' : 'none';
    if (triangle) triangle.style.display = type === 'triangle' ? 'flex' : 'none';
}

// TROŠKOVNIK
const COST_ESTIMATE_KEY = 'cx_cost_estimate_v1';
function loadCostEstimate() {
    try { const raw = JSON.parse(localStorage.getItem(COST_ESTIMATE_KEY)); if (Array.isArray(raw)) return raw; } catch (e) {}
    return [];
}
function saveCostEstimate(list) {
    try { localStorage.setItem(COST_ESTIMATE_KEY, JSON.stringify(list)); } catch (e) {}
}
function renderCostEstimate() {
    return `
        <div class="converter-box">
            <div class="lista-head">
                <div class="section-desc" style="margin:0;">Vodi troškovnik materijala i radova.</div>
                <button class="section-action-btn" onclick="openCostEstimateModal()">+ Dodaj</button>
            </div>
            <div id="cost-estimate-list"></div>
        </div>
    `;
}
function renderCostEstimateList() {
    const wrap = el('cost-estimate-list');
    if (!wrap) return;
    const items = loadCostEstimate();
    if (!items.length) {
        wrap.innerHTML = `<div class="price-track-empty"><div class="price-track-empty-icon">📋</div><div>Nema stavki. Dodaj prvu!</div></div>`;
        return;
    }
    let rowsHtml = '';
    let grand = 0;
    items.forEach(item => {
        const total = (item.qty || 0) * (item.unitPrice || 0);
        grand += total;
        rowsHtml += `
            <div class="cost-estimate-row">
                <div class="cost-estimate-name">${escapeHtml(item.name)}</div>
                <div class="cost-estimate-qty">${item.qty}</div>
                <div class="cost-estimate-unit">${escapeHtml(item.unit || '')}</div>
                <div class="cost-estimate-total">${money(total)}</div>
                <button class="cost-estimate-remove" onclick="deleteCostEstimateItem('${item.id}')">✕</button>
            </div>
        `;
    });
    wrap.innerHTML = `
        <div class="cost-estimate-table">
            <div class="cost-estimate-head"><div>Naziv</div><div>Kol.</div><div>Jed.</div><div>Cena</div><div></div></div>
            ${rowsHtml}
        </div>
        <div class="cost-estimate-grand-total"><span class="label">UKUPNO</span><span class="value">${money(grand)} RSD</span></div>
        <div style="display:flex;gap:8px;">
            <button class="section-action-btn" style="flex:1;" onclick="shareCostEstimate()">📤 Podeli</button>
            <button class="section-action-btn" style="flex:1;color:#f43f5e;border-color:rgba(244,63,94,0.4);" onclick="clearCostEstimate()">Obriši sve</button>
        </div>
    `;
}
function openCostEstimateModal() {
    const modal = el('cost-estimate-modal');
    const body = el('cost-estimate-modal-body');
    if (!modal || !body) return;
    body.innerHTML = `
        <div class="converter-box">
            ${inputFieldText('label.shop.itemName', 'ce-name', 'npr. Blokovi')}
            ${inputField('label.quantity', 'ce-qty', '', 'placeholder="100"')}
            ${inputFieldText('label.shop.unit', 'ce-unit', 'kom / m² / kg')}
            ${inputField('label.shop.price', 'ce-price', 'RSD', 'placeholder="80"')}
            ${calcButton('btn.save', 'saveCostEstimateItem()')}
        </div>
    `;
    modal.classList.add('show');
    document.body.classList.add('modal-open');
}
function saveCostEstimateItem() {
    const name = el('ce-name') ? el('ce-name').value.trim() : '';
    const qty = num('ce-qty') || 0;
    const unit = el('ce-unit') ? el('ce-unit').value.trim() : '';
    const unitPrice = num('ce-price') || 0;
    if (!name) { showToast('Unesi naziv stavke.', 'error'); return; }
    const list = loadCostEstimate();
    list.push({ id: 'ce_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7), name, qty, unit, unitPrice, createdAt: Date.now() });
    saveCostEstimate(list);
    closeModal('cost-estimate-modal');
    renderCostEstimateList();
    showToast('Stavka dodata.', 'success', 1500);
}
function deleteCostEstimateItem(id) {
    let list = loadCostEstimate();
    list = list.filter(i => i.id !== id);
    saveCostEstimate(list);
    renderCostEstimateList();
    showToast('Stavka obrisana.', 'info', 1200);
}
function clearCostEstimate() {
    showConfirm('Obrisati ceo troškovnik?').then(ok => {
        if (!ok) return;
        saveCostEstimate([]);
        renderCostEstimateList();
        showToast('Troškovnik obrisan.', 'info', 1500);
    });
}
function shareCostEstimate() {
    const items = loadCostEstimate();
    if (!items.length) { showToast('Nema stavki.', 'info'); return; }
    let text = 'TROŠKOVNIK — Alatika\n\n';
    let grand = 0;
    items.forEach(item => {
        const total = (item.qty || 0) * (item.unitPrice || 0);
        grand += total;
        text += `${item.name}: ${item.qty} ${item.unit || ''} × ${money(item.unitPrice)} = ${money(total)} RSD\n`;
    });
    text += `\nUKUPNO: ${money(grand)} RSD`;
    if (navigator.share) { navigator.share({ text }).catch(() => {}); }
    else fallbackCopy(text, () => showToast('Kopirano.', 'success', 1500));
}

// ============================================================
// KUHINJA
// ============================================================
function renderKitchenKasike() {
    return `<div class="converter-box">${sectionDescKey('desc.kitchen.spoons')}${inputField('label.kitchen.value', 'spoon-val', '', 'placeholder="1"')}${selectField('label.kitchen.ingredient', 'spoon-ingredient', [{ value: 'secer', text: safeT('option.kitchen.sugar') }, { value: 'brasno', text: safeT('option.kitchen.flour') }, { value: 'so', text: safeT('option.kitchen.salt') }])}${calcButton('btn.calculate', 'calculateSpoon()')}</div><div id="spoon-result-box" class="result-card-green" style="display: none;"><div class="res-left"><div class="pump-icon">${icon('spoon')}</div><div><div class="res-label">${safeT('label.kitchen.approxWeight')}</div><h2><span id="res-spoon-val">0</span> <small id="res-spoon-unit">g</small></h2></div></div></div>`;
}
function renderKitchenPecenje() {
    return `<div class="converter-box">${sectionDescKey('desc.kitchen.baking')}${inputField('label.kitchen.value', 'oven-val', '', 'placeholder="180"')}${selectField('label.kitchen.fromUnit', 'oven-from', [{ value: 'c', text: '°C' }, { value: 'f', text: '°F' }, { value: 'gas', text: 'Gas' }])}${selectField('label.kitchen.toUnit', 'oven-to', [{ value: 'f', text: '°F' }, { value: 'c', text: '°C' }, { value: 'gas', text: 'Gas' }])}${calcButton('btn.calculate', 'calculateOven()')}</div><div id="oven-result-box" class="result-card-green" style="display: none;"><div class="res-left"><div class="pump-icon">${icon('oven')}</div><div><div class="res-label">${safeT('result.label')}</div><h2><span id="res-oven-val">0</span> <small id="res-oven-unit">°F</small></h2></div></div></div>`;
}
function renderKitchenPorcije() {
    return `<div class="converter-box">${sectionDescKey('desc.kitchen.portions')}${inputField('label.kitchen.originalPortions', 'portion-orig', '', 'placeholder="4"')}${inputField('label.kitchen.desiredPortions', 'portion-want', '', 'placeholder="6"')}${inputField('label.kitchen.ingredientQty', 'portion-qty', '', 'placeholder="200"')}${calcButton('btn.calculate', 'calculatePortion()')}</div><div id="portion-result-box" class="result-card-green" style="display: none;"><div class="res-left"><div class="pump-icon">${icon('utensils')}</div><div><div class="res-label">${safeT('label.kitchen.qtyNeeded')}</div><h2><span id="res-portion-val">0</span> <small id="res-portion-unit">g</small></h2></div></div></div>`;
}
const SPOON_GRAMS = { secer: 20, brasno: 10, so: 25, kakao: 8, med: 25, ulje: 15, mleko: 15, pirinac: 20, ovsene: 8, griz: 15 };
function calculateSpoon() {
    const ing = el('spoon-ingredient') ? el('spoon-ingredient').value : 'secer';
    const val = num('spoon-val');
    if (val === null) { showToast(safeT('toast.error.enterValue') || 'Unesi vrednost.', 'error'); return; }
    const gPerSpoon = SPOON_GRAMS[ing] || 20;
    const sv = el('res-spoon-val'); if (sv) sv.innerText = fmt(val * gPerSpoon, 2);
    const su = el('res-spoon-unit'); if (su) su.innerText = 'g';
    show('spoon-result-box');
}
function calculateOven() {
    const from = el('oven-from') ? el('oven-from').value : 'c';
    const val = num('oven-val');
    const to = el('oven-to') ? el('oven-to').value : 'f';
    if (val === null) { showToast(safeT('toast.error.enterValue') || 'Unesi vrednost.', 'error'); return; }
    let celsius;
    if (from === 'f') celsius = (val - 32) * 5 / 9;
    else if (from === 'gas') { const gasToC = { 1: 140, 2: 150, 3: 170, 4: 180, 5: 190, 6: 200, 7: 220, 8: 230, 9: 240 }; celsius = gasToC[Math.round(val)] || 180; }
    else celsius = val;
    let result, unit;
    if (to === 'c') { result = celsius; unit = '°C'; }
    else if (to === 'f') { result = (celsius * 9 / 5) + 32; unit = '°F'; }
    else { const cToGas = [[135, 1], [145, 1.5], [155, 2], [165, 2.5], [175, 3], [185, 4], [195, 5], [205, 6], [215, 6.5], [225, 7], [235, 8], [245, 9]]; let closest = 4; for (const [c, g] of cToGas) { if (celsius <= c) { closest = g; break; } } result = closest; unit = 'Gas'; }
    const ov = el('res-oven-val'); if (ov) ov.innerText = fmt(result, 0);
    const ou = el('res-oven-unit'); if (ou) ou.innerText = unit;
    show('oven-result-box');
}
function calculatePortion() {
    const orig = num('portion-orig'), want = num('portion-want'), qty = num('portion-qty');
    if (!orig || !want || !qty) { showToast(safeT('toast.error.enterAll') || 'Unesi sve vrednosti.', 'error'); return; }
    const factor = want / orig;
    const pv = el('res-portion-val'); if (pv) pv.innerText = fmt(qty * factor, 2);
    show('portion-result-box');
}

// ============================================================
// STRUJA (POWER)
// ============================================================
function renderPowerUredjaj() {
    return `<div class="converter-box">${sectionDescKey('desc.power.device')}${inputField('label.power.powerWatts', 'power-watts', 'W', 'placeholder="1000"')}${inputField('label.power.hoursPerDay', 'power-hours', 'h', 'placeholder="2"')}${inputField('label.power.electricityPrice', 'power-price', 'RSD/kWh', 'value="12"')}${calcButton('btn.calculate', 'calculatePower()')}</div>${resultCard('power-result-box', 'zap', 'label.power.monthlyCost', 'res-power-month', 'RSD', 'STRUJA', 'label.power.deviceUsage')}${statsRow('power-stats-row', [['label.power.daily', 'stat-power-day', '0 RSD'], ['label.power.yearly', 'stat-power-year', '0 RSD'], ['label.power.kwhPerMonth', 'stat-power-kwh', '0']])}`;
}
function renderPowerBaterije() {
    return `<div class="converter-box">${sectionDescKey('desc.power.battery')}${inputField('label.power.batteryVoltage', 'bat-volt', 'V', 'value="12"')}${inputField('label.power.capacity', 'bat-ah', 'Ah', 'placeholder="100"')}${inputField('label.power.load', 'bat-watt', 'W', 'placeholder="50"')}${inputField('label.power.depthOfDischarge', 'bat-dod', '%', 'value="80"')}${calcButton('btn.calculate', 'calculateBattery()')}</div>${resultCard('bat-result-box', 'battery', 'label.power.batteryLife', 'res-bat-time', 'h', 'STRUJA', 'label.power.batteryShort')}${statsRow('bat-stats-row', [['label.power.capacity', 'stat-bat-wh', '0 Wh'], ['label.power.usefulEnergy', 'stat-bat-wh-use', '0 Wh'], ['label.power.current', 'stat-bat-amp', '0 A']])}`;
}
function renderPowerKabl() {
    return `
        <div class="converter-box">
            <p class="section-desc">Preporučeni presek kabla i osigurač na osnovu struje i dužine.</p>
            ${inputField('label.power.loadCurrent', 'kabl-amps', 'A', 'placeholder="16"')}
            ${inputField('label.power.cableLength', 'kabl-len', 'm', 'placeholder="20"')}
            ${inputField('label.power.voltage', 'kabl-volt', 'V', 'value="230"')}
            ${selectField('label.power.cableType', 'kabl-type', [
                { value: 'bakr', text: 'Bakar' },
                { value: 'alu', text: 'Aluminijum' }
            ], 'bakr')}
            ${calcButton('btn.calculate', 'calculateCable()')}
        </div>
        <div id="kabl-result-box" class="result-card-green" style="display: none;">
            <div class="res-left">
                <div class="pump-icon">${icon('cable')}</div>
                <div>
                    <div class="res-label">Preporučeni presek</div>
                    <h2><span id="res-kabl-mm2">0</span> <small>mm²</small></h2>
                </div>
            </div>
            <div class="res-actions">
                <button class="copy-btn" onclick="copyResult('res-kabl-mm2', 'mm²', event)">${safeT('result.copy')}</button>
                <button class="copy-btn" data-category="STRUJA" data-label="Kabl" onclick="saveHistory(this)">${safeT('result.save')}</button>
                <button class="copy-btn" data-category="STRUJA" data-label="Kabl" onclick="shareResult(this)">${safeT('result.share')}</button>
            </div>
        </div>
        ${statsRow('kabl-stats-row', [
            ['Osigurač', 'stat-kabl-osig', '0 A'],
            ['Pad napona', 'stat-kabl-pad', '0 %'],
            ['Materijal', 'stat-kabl-mat', '—']
        ])}
    `;
}
function calculatePower() {
    const watts = num('power-watts'), hours = num('power-hours'), price = num('power-price') || 12;
    if (!watts || !hours) { showToast(safeT('toast.error.enterPowerHours') || 'Unesi snagu i sate.', 'error'); return; }
    const kwhDay = (watts * hours) / 1000;
    const kwhMonth = kwhDay * 30;
    const pm = el('res-power-month'); if (pm) pm.innerText = money(kwhMonth * price);
    const pd = el('stat-power-day'); if (pd) pd.innerText = money(kwhDay * price) + ' RSD';
    const py = el('stat-power-year'); if (py) py.innerText = money(kwhDay * 365 * price) + ' RSD';
    const pk = el('stat-power-kwh'); if (pk) pk.innerText = fmt(kwhMonth, 1);
    show('power-result-box'); show('power-stats-row');
}
function calculateBattery() {
    const volt = num('bat-volt') || 12, ah = num('bat-ah'), watt = num('bat-watt'), dod = num('bat-dod') || 80;
    if (!ah || !watt) { showToast(safeT('toast.error.enterCapacityLoad') || 'Unesi kapacitet i opterećenje.', 'error'); return; }
    const wh = volt * ah, usefulWh = wh * (dod / 100);
    const rv = el('res-bat-time'); if (rv) rv.innerText = fmt(usefulWh / watt, 2);
    const sw = el('stat-bat-wh'); if (sw) sw.innerText = fmt(wh, 1) + ' Wh';
    const su = el('stat-bat-wh-use'); if (su) su.innerText = fmt(usefulWh, 1) + ' Wh';
    const sa = el('stat-bat-amp'); if (sa) sa.innerText = fmt(watt / volt, 2) + ' A';
    show('bat-result-box'); show('bat-stats-row');
}
function calculateCable() {
    const amps = num('kabl-amps');
    const len = num('kabl-len');
    const volts = num('kabl-volt') || 230;
    const isCopper = !el('kabl-type') || el('kabl-type').value === 'bakr';
    if (!amps || !len) { showToast('Unesi struju i dužinu kabla.', 'error'); return; }
    const ampacity = isCopper
        ? { 1.5: 14, 2.5: 20, 4: 26, 6: 34, 10: 46, 16: 62, 25: 80, 35: 100, 50: 125 }
        : { 2.5: 15, 4: 20, 6: 26, 10: 36, 16: 48, 25: 62, 35: 78, 50: 96 };
    const rho = isCopper ? 0.0178 : 0.0282;
    const sections = Object.keys(ampacity).map(Number).sort((a, b) => a - b);
    let chosen = null;
    for (const s of sections) {
        if (ampacity[s] >= amps * 1.15) { chosen = s; break; }
    }
    if (!chosen) chosen = sections[sections.length - 1];
    const minSectionForDrop = (2 * rho * len * amps) / (volts * 0.05);
    if (minSectionForDrop > chosen) {
        for (const s of sections) {
            if (s >= minSectionForDrop) { chosen = s; break; }
        }
    }
    const dropPct = ((2 * rho * len * amps) / chosen / volts) * 100;
    const fuses = [6, 10, 13, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125];
    const recommendedFuse = fuses.find(f => f >= amps * 1.15) || 125;
    const rv = el('res-kabl-mm2');
    if (rv) rv.innerText = fmt(chosen, 1);
    const so = el('stat-kabl-osig');
    if (so) so.innerText = recommendedFuse + ' A';
    const sp = el('stat-kabl-pad');
    if (sp) sp.innerText = fmt(dropPct, 2) + ' %';
    const sm = el('stat-kabl-mat');
    if (sm) sm.innerText = isCopper ? 'Bakar' : 'Aluminijum';
    show('kabl-result-box');
    show('kabl-stats-row');
}
function renderSolarPanels() {
    return `
        <div class="converter-box">
            <p class="section-desc">Izračunaj koliko solarnih panela ti treba za dnevnu potrošnju.</p>
            ${inputField('label.power.daily', 'solar-consumption', 'kWh', 'step="0.1" placeholder="15"')}
            ${inputField('label.power.hoursPerDay', 'solar-hours', 'h', 'value="4" step="0.1"')}
            ${inputField('label.power.powerWatts', 'solar-panel', 'W', 'value="400"')}
            ${inputField('label.money.calcType', 'solar-efficiency', '%', 'value="80"')}
            ${calcButton('btn.calculate', 'calculateSolar()')}
        </div>
        <div class="solar-result-card" id="solar-result-box" style="display: none;">
            <div class="solar-result-value" id="res-solar-count">0</div>
            <div class="solar-result-label">panela</div>
            <div class="solar-result-sub" id="res-solar-total-power">Ukupno: 0 W</div>
        </div>
        ${statsRow('solar-stats-row', [
            ['label.power.energy', 'stat-solar-prod', '0 kWh'],
            ['label.power.power', 'stat-solar-system', '0 kW']
        ])}
    `;
}
function calculateSolar() {
    const consumption = num('solar-consumption');
    const sunHours = num('solar-hours') || 4;
    const panelWatt = num('solar-panel') || 400;
    const efficiency = (num('solar-efficiency') || 80) / 100;
    if (!consumption || consumption <= 0) { showToast('Unesi dnevnu potrošnju.', 'error'); return; }
    const effectivePanelWatt = panelWatt * efficiency;
    const dailyProductionPerPanel = (effectivePanelWatt * sunHours) / 1000;
    const panelsNeeded = Math.ceil(consumption / dailyProductionPerPanel);
    const totalPower = panelsNeeded * panelWatt;
    const totalProduction = panelsNeeded * dailyProductionPerPanel;
    const rc = el('res-solar-count'); if (rc) rc.innerText = panelsNeeded;
    const rtp = el('res-solar-total-power'); if (rtp) rtp.innerText = `Ukupno: ${totalPower} W`;
    const sp = el('stat-solar-prod'); if (sp) sp.innerText = fmt(totalProduction, 2) + ' kWh';
    const ss = el('stat-solar-system'); if (ss) ss.innerText = fmt(totalPower / 1000, 2) + ' kW';
    show('solar-result-box'); show('solar-stats-row');
}

// ============================================================
// MUZIKA — ŠTIMER
// ============================================================
function renderMusicStimer() {
    return `
        <div class="converter-box">
            <div class="section-desc" style="margin-bottom: 12px;">${safeT('desc.music.tuner')}</div>
            ${inputField('label.music.referenceFreq', 'tuner-a4', 'Hz', 'value="440"')}
            <div class="input-field">
                <label>${safeT('label.music.instrument')}</label>
                <select id="tuner-instrument" class="custom-input" onchange="renderTunerStrings()">
                    <option value="guitar-standard">${safeT('option.music.guitarStandard')}</option>
                    <option value="guitar-dropd">${safeT('option.music.guitarDropD')}</option>
                    <option value="guitar-halfdown">${safeT('option.music.guitarHalfDown')}</option>
                    <option value="bass-4">${safeT('option.music.bass4')}</option>
                    <option value="bass-5">${safeT('option.music.bass5')}</option>
                    <option value="ukulele-soprano">${safeT('option.music.ukuleleSoprano')}</option>
                    <option value="ukulele-baritone">${safeT('option.music.ukuleleBaritone')}</option>
                    <option value="violin">${safeT('option.music.violin')}</option>
                    <option value="cello">${safeT('option.music.cello')}</option>
                    <option value="mandolin">${safeT('option.music.mandolin')}</option>
                    <option value="banjo">${safeT('option.music.banjo')}</option>
                    <option value="kontrabas">${safeT('option.music.doubleBass')}</option>
                </select>
            </div>
        </div>
        <div class="converter-box mic-tuner-box">
            <div class="mic-tuner-header">
                <div class="section-desc" style="margin: 0;">${safeT('label.music.micTunerDesc')}</div>
            </div>
            <button class="calc-btn-main mic-tuner-btn" id="tuner-mic-btn" onclick="toggleTunerMic()">
                🎤 ${safeT('btn.enableMic')}
            </button>
            <div id="tuner-mic-result" class="tuner-mic-result" style="display: none;">
                <div class="tuner-big-note" id="tuner-detected-note">—</div>
                <div class="tuner-target-info" id="tuner-target-info"></div>
                <div class="tuner-detected-freq" id="tuner-detected-freq">— Hz</div>
                <div class="tuner-gauge-wrap">
                    <div class="tuner-cents-bar">
                        <div class="tuner-cents-zone flat"><span>♭</span></div>
                        <div class="tuner-cents-zone center"><span>✓</span></div>
                        <div class="tuner-cents-zone sharp"><span>♯</span></div>
                        <div class="tuner-cents-center"></div>
                        <div class="tuner-cents-marker" id="tuner-cents-marker" style="left: 50%;"></div>
                    </div>
                    <div class="tuner-cents-label" id="tuner-cents-label">0 cents</div>
                </div>
            </div>
        </div>
        <div class="tuner-strings-head">
            <div class="section-desc" style="margin: 0;">${safeT('label.music.stringsReference')}</div>
        </div>
        <div id="tuner-strings" class="tuner-strings"></div>
        <div id="tuner-status" class="tuner-status" style="display: none;">
            <div class="tuner-note" id="tuner-note-display">—</div>
            <div class="tuner-freq" id="tuner-freq-display">— Hz</div>
        </div>
        <button class="copy-btn" id="tuner-stop-btn" style="display: none; width: 100%; margin-top: 8px;" onclick="stopTunerTone()">
            ${safeT('btn.stopTone')}
        </button>
    `;
}
const TUNER_INSTRUMENTS = {
    'guitar-standard': { strings: [{ note: 'E', octave: 2, freq: 82.41 }, { note: 'A', octave: 2, freq: 110.00 }, { note: 'D', octave: 3, freq: 146.83 }, { note: 'G', octave: 3, freq: 196.00 }, { note: 'B', octave: 3, freq: 246.94 }, { note: 'E', octave: 4, freq: 329.63 }] },
    'guitar-dropd': { strings: [{ note: 'D', octave: 2, freq: 73.42 }, { note: 'A', octave: 2, freq: 110.00 }, { note: 'D', octave: 3, freq: 146.83 }, { note: 'G', octave: 3, freq: 196.00 }, { note: 'B', octave: 3, freq: 246.94 }, { note: 'E', octave: 4, freq: 329.63 }] },
    'guitar-halfdown': { strings: [{ note: 'D#', octave: 2, freq: 77.78 }, { note: 'G#', octave: 2, freq: 103.83 }, { note: 'C#', octave: 3, freq: 138.59 }, { note: 'F#', octave: 3, freq: 185.00 }, { note: 'A#', octave: 3, freq: 233.08 }, { note: 'D#', octave: 4, freq: 311.13 }] },
    'bass-4': { strings: [{ note: 'E', octave: 1, freq: 41.20 }, { note: 'A', octave: 1, freq: 55.00 }, { note: 'D', octave: 2, freq: 73.42 }, { note: 'G', octave: 2, freq: 98.00 }] },
    'bass-5': { strings: [{ note: 'B', octave: 0, freq: 30.87 }, { note: 'E', octave: 1, freq: 41.20 }, { note: 'A', octave: 1, freq: 55.00 }, { note: 'D', octave: 2, freq: 73.42 }, { note: 'G', octave: 2, freq: 98.00 }] },
    'ukulele-soprano': { strings: [{ note: 'G', octave: 4, freq: 392.00 }, { note: 'C', octave: 4, freq: 261.63 }, { note: 'E', octave: 4, freq: 329.63 }, { note: 'A', octave: 4, freq: 440.00 }] },
    'ukulele-baritone': { strings: [{ note: 'D', octave: 3, freq: 146.83 }, { note: 'G', octave: 3, freq: 196.00 }, { note: 'B', octave: 3, freq: 246.94 }, { note: 'E', octave: 4, freq: 329.63 }] },
    'violin': { strings: [{ note: 'G', octave: 3, freq: 196.00 }, { note: 'D', octave: 4, freq: 293.66 }, { note: 'A', octave: 4, freq: 440.00 }, { note: 'E', octave: 5, freq: 659.25 }] },
    'cello': { strings: [{ note: 'C', octave: 2, freq: 65.41 }, { note: 'G', octave: 2, freq: 98.00 }, { note: 'D', octave: 3, freq: 146.83 }, { note: 'A', octave: 3, freq: 220.00 }] },
    'mandolin': { strings: [{ note: 'G', octave: 3, freq: 196.00 }, { note: 'D', octave: 4, freq: 293.66 }, { note: 'A', octave: 4, freq: 440.00 }, { note: 'E', octave: 5, freq: 659.25 }] },
    'banjo': { strings: [{ note: 'G', octave: 4, freq: 392.00 }, { note: 'D', octave: 3, freq: 146.83 }, { note: 'G', octave: 3, freq: 196.00 }, { note: 'B', octave: 3, freq: 246.94 }, { note: 'D', octave: 4, freq: 293.66 }] },
    'kontrabas': { strings: [{ note: 'E', octave: 1, freq: 41.20 }, { note: 'A', octave: 1, freq: 55.00 }, { note: 'D', octave: 2, freq: 73.42 }, { note: 'G', octave: 2, freq: 98.00 }] }
};
let tunerOscillator = null, tunerGain = null;
let micStream = null, micAnalyser = null, micSource = null, micRunning = false, micRafId = null;

function getA4() { const v = el('tuner-a4') ? parseNum(el('tuner-a4').value) : 440; return (v && v > 0) ? v : 440; }
function renderTunerStrings() {
    const sel = el('tuner-instrument');
    if (!sel) return;
    const inst = TUNER_INSTRUMENTS[sel.value];
    const wrap = el('tuner-strings');
    if (!wrap || !inst) return;
    const ratio = getA4() / 440;
    wrap.innerHTML = '';
    inst.strings.forEach((s, i) => {
        const freq = s.freq * ratio;
        const btn = document.createElement('button');
        btn.className = 'tuner-string-btn';
        btn.type = 'button';
        btn.dataset.index = i;
        btn.innerHTML = `<span class="ts-num">${i + 1}.</span><span class="ts-note">${s.note}${s.octave}</span><span class="ts-freq">${freq.toFixed(2)} Hz</span>`;
        btn.addEventListener('click', () => playTunerTone(freq, btn));
        wrap.appendChild(btn);
    });
}
function playTunerTone(freq, btn) {
    try {
        const isActive = btn && btn.classList.contains('active');
        if (isActive) { stopTunerTone(); const s = el('tuner-status'); if (s) s.style.display = 'none'; return; }
        if (!audioCtx) audioCtx = getAudio();
        if (!audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        stopTunerTone();
        tunerOscillator = audioCtx.createOscillator();
        tunerGain = audioCtx.createGain();
        tunerOscillator.type = 'sine';
        tunerOscillator.frequency.value = freq;
        tunerGain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
        tunerGain.gain.exponentialRampToValueAtTime(0.25, audioCtx.currentTime + 0.05);
        tunerOscillator.connect(tunerGain);
        tunerGain.connect(audioCtx.destination);
        tunerOscillator.start();
        const status = el('tuner-status');
        if (status) { status.style.display = 'block'; const nd = el('tuner-note-display'); if (nd) nd.textContent = btn.querySelector('.ts-note').textContent; const fd = el('tuner-freq-display'); if (fd) fd.textContent = freq.toFixed(2) + ' Hz'; }
        const sb = el('tuner-stop-btn'); if (sb) sb.style.display = 'block';
        document.querySelectorAll('.tuner-string-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        vibrate(10);
    } catch (e) {}
}
function stopTunerTone() {
    if (tunerOscillator) { try { tunerGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.05); tunerOscillator.stop(audioCtx.currentTime + 0.1); } catch (e) {} tunerOscillator = null; tunerGain = null; }
    const sb = el('tuner-stop-btn'); if (sb) sb.style.display = 'none';
    document.querySelectorAll('.tuner-string-btn').forEach(b => b.classList.remove('active'));
}
async function toggleTunerMic() {
    const btn = el('tuner-mic-btn');
    if (micRunning) { stopTunerMic(); if (btn) { btn.textContent = '🎤 ' + safeT('btn.enableMic'); btn.classList.remove('active'); } return; }
    try {
        if (!audioCtx) audioCtx = getAudio();
        if (!audioCtx) throw new Error('AudioContext not available');
        if (audioCtx.state === 'suspended') await audioCtx.resume();
        micStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false, channelCount: 1 } });
        micSource = audioCtx.createMediaStreamSource(micStream);
        micAnalyser = audioCtx.createAnalyser();
        micAnalyser.fftSize = 8192;
        micAnalyser.smoothingTimeConstant = 0.5;
        micSource.connect(micAnalyser);
        micRunning = true;
        resetPitchSmoothing();
        if (btn) { btn.textContent = '⏹ ' + safeT('btn.stopMic'); btn.classList.add('active'); }
        const r = el('tuner-mic-result'); if (r) r.style.display = 'block';
        micLoop();
        vibrate(20);
        playTick(0, 1400, 0.08, 0.03);
    } catch (e) { console.warn('Mic error:', e); showToast(safeT('toast.micError') || 'Greška pri pristupu mikrofonu', 'error', 2500); }
}
function stopTunerMic() {
    micRunning = false;
    if (micRafId) { cancelAnimationFrame(micRafId); micRafId = null; }
    if (micStream) { micStream.getTracks().forEach(track => track.stop()); micStream = null; }
    micSource = null; micAnalyser = null;
    resetPitchSmoothing();
    const r = el('tuner-mic-result'); if (r) r.style.display = 'none';
}
function micLoop() {
    if (!micRunning || !micAnalyser) return;
    const buffer = new Float32Array(micAnalyser.fftSize);
    micAnalyser.getFloatTimeDomainData(buffer);
    let freq = yinPitchDetect(buffer, audioCtx.sampleRate, { threshold: 0.12, minFreq: 60, maxFreq: 1500 });
    if (freq <= 0 && typeof autoCorrelate === 'function') freq = autoCorrelate(buffer, audioCtx.sampleRate);
    if (freq > 0) { const smoothed = smoothPitch(freq); if (smoothed > 0) updateTunerDisplay(smoothed); else showTunerNoSignal(); }
    else showTunerNoSignal();
    micRafId = requestAnimationFrame(micLoop);
}
function showTunerNoSignal() {
    const dn = el('tuner-detected-note'); if (dn) dn.textContent = '—';
    const df = el('tuner-detected-freq'); if (df) df.textContent = '— Hz';
    const marker = el('tuner-cents-marker'); if (marker) marker.style.left = '50%';
    const cl = el('tuner-cents-label'); if (cl) { cl.textContent = '0 cents'; cl.classList.remove('ok', 'close', 'far'); }
}
function autoCorrelate(buffer, sampleRate) {
    const SIZE = buffer.length;
    let rms = 0;
    for (let i = 0; i < SIZE; i++) rms += buffer[i] * buffer[i];
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.01) return -1;
    let r1 = 0, r2 = SIZE - 1;
    const thres = 0.2;
    for (let i = 0; i < SIZE / 2; i++) { if (Math.abs(buffer[i]) < thres) { r1 = i; break; } }
    for (let i = 1; i < SIZE / 2; i++) { if (Math.abs(buffer[SIZE - i]) < thres) { r2 = SIZE - i; break; } }
    const buf = buffer.slice(r1, r2);
    const newSize = buf.length;
    const c = new Array(newSize).fill(0);
    for (let i = 0; i < newSize; i++) { for (let j = 0; j < newSize - i; j++) { c[i] += buf[j] * buf[j + i]; } }
    let d = 0;
    while (c[d] > c[d + 1]) d++;
    let maxval = -1, maxpos = -1;
    for (let i = d; i < newSize; i++) { if (c[i] > maxval) { maxval = c[i]; maxpos = i; } }
    let T0 = maxpos;
    const x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
    const a = (x1 + x3 - 2 * x2) / 2, b = (x3 - x1) / 2;
    if (a) T0 = T0 - b / (2 * a);
    return sampleRate / T0;
}
function updateTunerDisplay(freq) {
    const nearest = findNearestString(freq);
    if (!nearest) return;
    const { string, cents, index, targetFreq } = nearest;
    const dn = el('tuner-detected-note'); if (dn) dn.textContent = `${string.note}${string.octave}`;
    const ti = el('tuner-target-info');
    if (ti) {
        const statusText = Math.abs(cents) < 3 ? safeT('label.music.tunerInTune') : (Math.abs(cents) < 15 ? safeT('label.music.tunerClose') : safeT('label.music.tunerOut'));
        ti.textContent = `${safeT('label.music.string')} ${index + 1} • ${statusText}`;
        ti.classList.remove('ok', 'close', 'far');
        if (Math.abs(cents) < 3) ti.classList.add('ok');
        else if (Math.abs(cents) < 15) ti.classList.add('close');
        else ti.classList.add('far');
    }
    const df = el('tuner-detected-freq'); if (df) df.textContent = freq.toFixed(2) + ' Hz → ' + targetFreq.toFixed(2) + ' Hz';
    const marker = el('tuner-cents-marker');
    if (marker) {
        const clamped = Math.max(-50, Math.min(50, cents));
        marker.style.left = (50 + (clamped / 50) * 45) + '%';
        if (Math.abs(cents) < 3) marker.style.background = '#10b981';
        else if (Math.abs(cents) < 15) marker.style.background = '#f59e0b';
        else marker.style.background = '#f43f5e';
    }
    const cl = el('tuner-cents-label');
    if (cl) {
        const sign = cents > 0 ? '+' : '';
        cl.textContent = `${sign}${Math.round(cents)} cents`;
        cl.classList.remove('ok', 'close', 'far');
        if (Math.abs(cents) < 3) cl.classList.add('ok');
        else if (Math.abs(cents) < 15) cl.classList.add('close');
        else cl.classList.add('far');
    }
    document.querySelectorAll('.tuner-string-btn').forEach(b => b.classList.remove('active'));
    const activeBtn = document.querySelector(`.tuner-string-btn[data-index="${index}"]`);
    if (activeBtn && Math.abs(cents) < 50) activeBtn.classList.add('active');
}
function findNearestString(freq) {
    const sel = el('tuner-instrument');
    if (!sel) return null;
    const inst = TUNER_INSTRUMENTS[sel.value];
    if (!inst) return null;
    const ratio = getA4() / 440;
    let nearest = null;
    let minDiff = Infinity;
    inst.strings.forEach((s, i) => {
        const targetFreq = s.freq * ratio;
        const cents = 1200 * Math.log2(freq / targetFreq);
        if (Math.abs(cents) < Math.abs(minDiff)) { minDiff = cents; nearest = { index: i, string: s, cents, targetFreq }; }
    });
    return nearest;
}

// YIN PITCH DETECTION
function yinPitchDetect(buffer, sampleRate, options = {}) {
    const threshold = options.threshold || 0.12;
    const minFreq = options.minFreq || 60;
    const maxFreq = options.maxFreq || 1500;
    const bufferSize = buffer.length;
    const yinBufferSize = Math.floor(bufferSize / 2);
    const yinBuffer = new Float32Array(yinBufferSize);
    for (let tau = 0; tau < yinBufferSize; tau++) {
        let sum = 0;
        for (let i = 0; i < yinBufferSize; i++) {
            const delta = buffer[i] - buffer[i + tau];
            sum += delta * delta;
        }
        yinBuffer[tau] = sum;
    }
    yinBuffer[0] = 1;
    let runningSum = 0;
    for (let tau = 1; tau < yinBufferSize; tau++) {
        runningSum += yinBuffer[tau];
        yinBuffer[tau] *= tau / runningSum;
    }
    const minTau = Math.max(2, Math.floor(sampleRate / maxFreq));
    const maxTau = Math.min(yinBufferSize - 1, Math.floor(sampleRate / minFreq));
    let tauEstimate = -1;
    for (let tau = minTau; tau < maxTau; tau++) {
        if (yinBuffer[tau] < threshold) {
            while (tau + 1 < maxTau && yinBuffer[tau + 1] < yinBuffer[tau]) tau++;
            tauEstimate = tau;
            break;
        }
    }
    if (tauEstimate === -1) {
        let minVal = Infinity;
        for (let tau = minTau; tau < maxTau; tau++) {
            if (yinBuffer[tau] < minVal) { minVal = yinBuffer[tau]; tauEstimate = tau; }
        }
        if (minVal > 0.5) return -1;
    }
    const betterTau = parabolicInterpolation(yinBuffer, tauEstimate);
    const confidence = 1 - yinBuffer[tauEstimate];
    if (confidence < 0.5) return -1;
    return sampleRate / betterTau;
}
function parabolicInterpolation(yinBuffer, tau) {
    if (tau < 1 || tau >= yinBuffer.length - 1) return tau;
    const x0 = yinBuffer[tau - 1];
    const x2 = yinBuffer[tau + 1];
    if (x0 + x2 === 2 * yinBuffer[tau]) return tau;
    const a = (x0 + x2 - 2 * yinBuffer[tau]) / 2;
    const b = (x2 - x0) / 2;
    if (a === 0) return tau;
    return tau - b / (2 * a);
}
const pitchHistory = [];
const PITCH_HISTORY_SIZE = 5;
let consecutiveOutliers = 0;
function smoothPitch(newFreq) {
    if (newFreq <= 0) return -1;
    pitchHistory.push(newFreq);
    if (pitchHistory.length > PITCH_HISTORY_SIZE) pitchHistory.shift();
    if (pitchHistory.length < 3) return newFreq;
    const sorted = [...pitchHistory].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const deviation = Math.abs(newFreq - median) / median;
    if (deviation > 0.20) {
        consecutiveOutliers++;
        if (consecutiveOutliers < 3) return median;
        consecutiveOutliers = 0;
        pitchHistory.length = 0;
        pitchHistory.push(newFreq);
        return newFreq;
    }
    consecutiveOutliers = 0;
    return median;
}
function resetPitchSmoothing() {
    pitchHistory.length = 0;
    consecutiveOutliers = 0;
}

// ============================================================
// GPS — BRZINA
// ============================================================
const GPS_SPEED_UNIT_KEY = 'cx_gps_speed_unit';
const GPS_SPEED_MAX_KEY = 'cx_gps_speed_max';

function loadGpsUnit(key, defaultUnit) { try { return localStorage.getItem(key) || defaultUnit; } catch (e) { return defaultUnit; } }
function saveGpsUnit(key, val) { try { localStorage.setItem(key, val); } catch (e) {} }

let gpsSpeedState = { watchId: null, running: false, currentSpeedKmh: 0, maxSpeedKmh: 0, avgSpeedKmh: 0, totalSpeed: 0, samples: 0, accuracy: null, lastPos: null };

function renderGpsBrzina() {
    return `
        <div class="converter-box gps-box">
            <div class="gps-status-row">
                <div class="gps-status-indicator" id="gps-speed-indicator"><span class="gps-status-dot"></span><span class="gps-status-text" id="gps-speed-status">${safeT('gps.status.off')}</span></div>
                <select id="gps-speed-unit-select" class="gps-unit-select" onchange="gpsChangeSpeedUnit()">
                    <option value="kmh">km/h</option><option value="mph">mph</option><option value="ms">m/s</option><option value="kn">kn</option><option value="fts">ft/s</option>
                </select>
            </div>
            <div class="gps-big-display"><div class="gps-big-number" id="gps-speed-value">0.0</div><div class="gps-big-unit" id="gps-speed-unit-label">km/h</div></div>
            <div class="gps-stats-mini">
                <div class="gps-stat-mini"><div class="gps-stat-mini-label">${safeT('gps.speed.max')}</div><div class="gps-stat-mini-value" id="gps-speed-max">0.0</div></div>
                <div class="gps-stat-mini"><div class="gps-stat-mini-label">${safeT('gps.speed.avg')}</div><div class="gps-stat-mini-value" id="gps-speed-avg">0.0</div></div>
                <div class="gps-stat-mini"><div class="gps-stat-mini-label">${safeT('gps.speed.accuracy')}</div><div class="gps-stat-mini-value" id="gps-speed-accuracy">—</div></div>
            </div>
        </div>
        <div class="gps-actions">
            <button class="gps-btn-main" id="gps-speed-btn-start" onclick="gpsToggleSpeed()">${icon('play')} <span id="gps-speed-btn-label">${safeT('gps.start')}</span></button>
            <button class="gps-btn-secondary" onclick="gpsResetSpeed()">${icon('rotateCcw')} ${safeT('gps.reset')}</button>
        </div>
        <div class="gps-info-note">${icon('info')} ${safeT('gps.speed.note')}</div>
    `;
}
function gpsInitBrzina() {
    const unit = loadGpsUnit(GPS_SPEED_UNIT_KEY, 'kmh');
    const sel = el('gps-speed-unit-select'); if (sel) sel.value = unit;
    gpsUpdateSpeedUnitLabels();
    gpsSpeedState.maxSpeedKmh = parseFloat(localStorage.getItem(GPS_SPEED_MAX_KEY)) || 0;
    gpsUpdateSpeedDisplay();
}
function gpsChangeSpeedUnit() { const sel = el('gps-speed-unit-select'); if (!sel) return; saveGpsUnit(GPS_SPEED_UNIT_KEY, sel.value); gpsUpdateSpeedUnitLabels(); gpsUpdateSpeedDisplay(); vibrate(10); }
function gpsUpdateSpeedUnitLabels() { const unit = loadGpsUnit(GPS_SPEED_UNIT_KEY, 'kmh'); const labels = { kmh: 'km/h', mph: 'mph', ms: 'm/s', kn: 'kn', fts: 'ft/s' }; const labelEl = el('gps-speed-unit-label'); if (labelEl) labelEl.textContent = labels[unit] || 'km/h'; }
function gpsConvertSpeed(kmh) {
    const unit = loadGpsUnit(GPS_SPEED_UNIT_KEY, 'kmh');
    switch (unit) {
        case 'mph': return kmh * 0.621371; case 'ms': return kmh / 3.6;
        case 'kn': return kmh * 0.539957; case 'fts': return kmh * 0.911344;
        default: return kmh;
    }
}
function gpsUpdateSpeedDisplay() {
    const unit = loadGpsUnit(GPS_SPEED_UNIT_KEY, 'kmh');
    const valEl = el('gps-speed-value'), maxEl = el('gps-speed-max'), avgEl = el('gps-speed-avg'), accEl = el('gps-speed-accuracy');
    const decimals = (unit === 'ms' || unit === 'fts') ? 2 : 1;
    if (valEl) valEl.textContent = fmt(gpsConvertSpeed(gpsSpeedState.currentSpeedKmh), decimals);
    if (maxEl) maxEl.textContent = fmt(gpsConvertSpeed(gpsSpeedState.maxSpeedKmh), decimals);
    if (avgEl) avgEl.textContent = fmt(gpsConvertSpeed(gpsSpeedState.avgSpeedKmh), decimals);
    if (accEl) accEl.textContent = gpsSpeedState.accuracy != null ? `${Math.round(gpsSpeedState.accuracy)} m` : '—';
}
function gpsToggleSpeed() { if (gpsSpeedState.running) gpsStopSpeed(); else gpsStartSpeed(); }
function gpsStartSpeed() {
    if (!navigator.geolocation) { showToast(safeT('gps.error.noGeolocation'), 'error'); return; }
    const indicator = el('gps-speed-indicator'); if (indicator) indicator.classList.add('active');
    gpsSetSpeedStatus(safeT('gps.status.searching'));
    const btnLabel = el('gps-speed-btn-label'); if (btnLabel) btnLabel.textContent = safeT('gps.stop');
    const btn = el('gps-speed-btn-start'); if (btn) btn.classList.add('active');
    gpsSpeedState.running = true;
    try {
        gpsSpeedState.watchId = navigator.geolocation.watchPosition(gpsOnSpeedPosition, gpsOnSpeedError, { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 });
    } catch (e) { showToast(safeT('gps.error.generic'), 'error'); gpsStopSpeed(); }
    vibrate(20); playTick(0, 1500, 0.08, 0.03);
}
function gpsStopSpeed() {
    if (gpsSpeedState.watchId != null && navigator.geolocation) navigator.geolocation.clearWatch(gpsSpeedState.watchId);
    gpsSpeedState.watchId = null; gpsSpeedState.running = false;
    const indicator = el('gps-speed-indicator'); if (indicator) indicator.classList.remove('active');
    gpsSetSpeedStatus(safeT('gps.status.off'));
    const btnLabel = el('gps-speed-btn-label'); if (btnLabel) btnLabel.textContent = safeT('gps.start');
    const btn = el('gps-speed-btn-start'); if (btn) btn.classList.remove('active');
    vibrate(15);
}
function gpsOnSpeedPosition(pos) {
    const speed = pos.coords.speed, accuracy = pos.coords.accuracy;
    const speedKmh = (speed != null && !isNaN(speed) && speed >= 0) ? speed * 3.6 : 0;
    const filteredKmh = speedKmh < 3 ? 0 : speedKmh;
    gpsSpeedState.currentSpeedKmh = filteredKmh;
    gpsSpeedState.accuracy = accuracy;
    if (filteredKmh > 0) {
        gpsSpeedState.totalSpeed += filteredKmh; gpsSpeedState.samples++;
        gpsSpeedState.avgSpeedKmh = gpsSpeedState.totalSpeed / gpsSpeedState.samples;
        if (filteredKmh > gpsSpeedState.maxSpeedKmh) { gpsSpeedState.maxSpeedKmh = filteredKmh; try { localStorage.setItem(GPS_SPEED_MAX_KEY, String(filteredKmh)); } catch (e) {} }
        gpsSetSpeedStatus(safeT('gps.status.receiving'));
    }
    gpsUpdateSpeedDisplay();
}
function gpsOnSpeedError(err) {
    let msg = safeT('gps.error.generic');
    if (err.code === 1) msg = safeT('gps.error.permission');
    else if (err.code === 2) msg = safeT('gps.error.unavailable');
    else if (err.code === 3) msg = safeT('gps.error.timeout');
    showToast(msg, 'error'); gpsSetSpeedStatus(safeT('gps.status.error'));
}
function gpsSetSpeedStatus(text) { const s = el('gps-speed-status'); if (s) s.textContent = text; }
function gpsResetSpeed() {
    gpsSpeedState.currentSpeedKmh = 0; gpsSpeedState.maxSpeedKmh = 0; gpsSpeedState.avgSpeedKmh = 0;
    gpsSpeedState.totalSpeed = 0; gpsSpeedState.samples = 0; gpsSpeedState.accuracy = null;
    try { localStorage.removeItem(GPS_SPEED_MAX_KEY); } catch (e) {}
    gpsUpdateSpeedDisplay(); vibrate(15); playTick(0, 1400, 0.06, 0.02);
    showToast(safeT('gps.resetDone'), 'info', 1400);
}

// ============================================================
// GPS — ŠTOPERICA
// ============================================================
let gpsStopwatchState = { running: false, startTime: 0, elapsedMs: 0, rafId: null, laps: [], wakeLock: null };
function renderGpsStoperica() {
    return `
        <div class="converter-box gps-box"><div class="gps-stopwatch-display"><div class="gps-stopwatch-time" id="gps-sw-time">00:00:00.00</div></div></div>
        <div class="gps-actions">
            <button class="gps-btn-main" id="gps-sw-btn-start" onclick="gpsToggleStopwatch()">${icon('play')} <span id="gps-sw-btn-label">${safeT('gps.start')}</span></button>
            <button class="gps-btn-secondary" onclick="gpsLapStopwatch()" id="gps-sw-btn-lap">${icon('flag')} ${safeT('gps.sw.lap')}</button>
            <button class="gps-btn-secondary" onclick="gpsResetStopwatch()" id="gps-sw-btn-reset">${icon('rotateCcw')} ${safeT('gps.reset')}</button>
        </div>
        <div class="converter-box gps-lap-box" id="gps-sw-laps-box" style="display:none;">
            <div class="gps-lap-header"><span>#</span><span>${safeT('gps.sw.lapHeader.lap')}</span><span>${safeT('gps.sw.lapHeader.total')}</span></div>
            <div id="gps-sw-laps-list" class="gps-lap-list"></div>
        </div>
    `;
}
function gpsInitStoperica() { gpsUpdateStopwatchDisplay(0); }
function gpsToggleStopwatch() { if (gpsStopwatchState.running) gpsStopStopwatch(); else gpsStartStopwatch(); }
async function gpsStartStopwatch() {
    gpsStopwatchState.running = true; gpsStopwatchState.startTime = performance.now() - gpsStopwatchState.elapsedMs;
    const btnLabel = el('gps-sw-btn-label'); if (btnLabel) btnLabel.textContent = safeT('gps.stop');
    const btn = el('gps-sw-btn-start'); if (btn) btn.classList.add('active');
    gpsRequestWakeLock(); gpsTickStopwatch();
    vibrate(20); playTick(0, 1500, 0.08, 0.03);
}
function gpsStopStopwatch() {
    gpsStopwatchState.running = false; gpsStopwatchState.elapsedMs = performance.now() - gpsStopwatchState.startTime;
    if (gpsStopwatchState.rafId) { cancelAnimationFrame(gpsStopwatchState.rafId); gpsStopwatchState.rafId = null; }
    const btnLabel = el('gps-sw-btn-label'); if (btnLabel) btnLabel.textContent = safeT('gps.start');
    const btn = el('gps-sw-btn-start'); if (btn) btn.classList.remove('active');
    gpsReleaseWakeLock(); vibrate(15);
}
function gpsTickStopwatch() {
    if (!gpsStopwatchState.running) return;
    const now = performance.now() - gpsStopwatchState.startTime;
    gpsUpdateStopwatchDisplay(now);
    gpsStopwatchState.rafId = requestAnimationFrame(gpsTickStopwatch);
}
function gpsUpdateStopwatchDisplay(ms) { const el1 = el('gps-sw-time'); if (!el1) return; el1.textContent = gpsFormatStopwatch(ms); }
function gpsFormatStopwatch(ms) {
    const total = Math.max(0, ms);
    const totalSec = total / 1000;
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec - h * 3600) / 60);
    const s = Math.floor(totalSec - h * 3600 - m * 60);
    const cs = Math.floor((totalSec - Math.floor(totalSec)) * 100);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}
function gpsLapStopwatch() {
    if (!gpsStopwatchState.running && gpsStopwatchState.elapsedMs === 0) { showToast(safeT('gps.sw.noLap'), 'info', 1400); return; }
    const currentTotal = gpsStopwatchState.running ? performance.now() - gpsStopwatchState.startTime : gpsStopwatchState.elapsedMs;
    const prevTotal = gpsStopwatchState.laps.length ? gpsStopwatchState.laps[gpsStopwatchState.laps.length - 1].total : 0;
    const lapTime = currentTotal - prevTotal;
    gpsStopwatchState.laps.push({ lap: lapTime, total: currentTotal });
    gpsRenderLaps(); vibrate(10); playTick(0, 1400, 0.06, 0.02);
}
function gpsRenderLaps() {
    const box = el('gps-sw-laps-box'), list = el('gps-sw-laps-list');
    if (!box || !list) return;
    if (!gpsStopwatchState.laps.length) { box.style.display = 'none'; return; }
    box.style.display = 'block';
    let minLap = Infinity, maxLap = -Infinity;
    gpsStopwatchState.laps.forEach((l, i) => {
        if (i === 0 && gpsStopwatchState.laps.length === 1) return;
        if (l.lap < minLap) minLap = l.lap;
        if (l.lap > maxLap) maxLap = l.lap;
    });
    const showColors = gpsStopwatchState.laps.length > 1;
    list.innerHTML = gpsStopwatchState.laps.map((l, i) => {
        const num = i + 1;
        let cls = '';
        if (showColors) { if (l.lap === minLap) cls = 'best'; else if (l.lap === maxLap) cls = 'worst'; }
        return `<div class="gps-lap-row ${cls}"><span class="gps-lap-num">#${num}</span><span class="gps-lap-time">${gpsFormatStopwatch(l.lap)}</span><span class="gps-lap-total">${gpsFormatStopwatch(l.total)}</span></div>`;
    }).join('');
}
function gpsResetStopwatch() {
    if (gpsStopwatchState.running) { showToast(safeT('gps.sw.stopFirst'), 'warning', 1500); return; }
    gpsStopwatchState.elapsedMs = 0; gpsStopwatchState.laps = [];
    gpsUpdateStopwatchDisplay(0); gpsRenderLaps();
    vibrate(15); playTick(0, 1400, 0.06, 0.02);
}
async function gpsRequestWakeLock() { if (!('wakeLock' in navigator)) return; try { gpsStopwatchState.wakeLock = await navigator.wakeLock.request('screen'); } catch (e) {} }
function gpsReleaseWakeLock() { if (gpsStopwatchState.wakeLock) { try { gpsStopwatchState.wakeLock.release(); } catch (e) {} gpsStopwatchState.wakeLock = null; } }

// ============================================================
// GPS — TAJMER
// ============================================================
let gpsTimerState = { running: false, paused: false, totalMs: 0, remainingMs: 0, endTime: 0, rafId: null, intervalId: null, alarmIntervalId: null, wakeLock: null, alarming: false };
function renderGpsTajmer() {
    return `
        <div class="converter-box gps-box">
            <div class="gps-timer-input-row" id="gps-timer-input-row">
                <div class="gps-timer-input-group"><label>HH</label><input type="number" id="gps-timer-h" class="gps-timer-input" min="0" max="23" placeholder="0" inputmode="numeric"></div>
                <div class="gps-timer-sep">:</div>
                <div class="gps-timer-input-group"><label>MM</label><input type="number" id="gps-timer-m" class="gps-timer-input" min="0" max="59" placeholder="0" inputmode="numeric"></div>
                <div class="gps-timer-sep">:</div>
                <div class="gps-timer-input-group"><label>SS</label><input type="number" id="gps-timer-s" class="gps-timer-input" min="0" max="59" placeholder="0" inputmode="numeric"></div>
            </div>
            <div class="gps-timer-presets">
                <button class="gps-chip" onclick="gpsTimerPreset(60)">1 min</button>
                <button class="gps-chip" onclick="gpsTimerPreset(300)">5 min</button>
                <button class="gps-chip" onclick="gpsTimerPreset(600)">10 min</button>
                <button class="gps-chip" onclick="gpsTimerPreset(900)">15 min</button>
                <button class="gps-chip" onclick="gpsTimerPreset(1800)">30 min</button>
                <button class="gps-chip" onclick="gpsTimerPreset(3600)">1 h</button>
            </div>
            <div class="gps-timer-display">
                <div class="gps-timer-time" id="gps-timer-time">00:00:00</div>
                <div class="gps-timer-progress-bar"><div class="gps-timer-progress-fill" id="gps-timer-progress"></div></div>
            </div>
        </div>
        <div class="gps-actions">
            <button class="gps-btn-main" id="gps-timer-btn-start" onclick="gpsToggleTimer()">${icon('play')} <span id="gps-timer-btn-label">${safeT('gps.start')}</span></button>
            <button class="gps-btn-secondary" onclick="gpsResetTimer()">${icon('rotateCcw')} ${safeT('gps.reset')}</button>
        </div>
        <div class="gps-info-note">${icon('info')} ${safeT('gps.timer.note')}</div>
    `;
}
function gpsInitTajmer() { gpsUpdateTimerDisplay(); }
function gpsTimerPreset(seconds) {
    if (gpsTimerState.running) { showToast(safeT('gps.timer.stopFirst'), 'warning', 1500); return; }
    const h = Math.floor(seconds / 3600), m = Math.floor((seconds % 3600) / 60), s = seconds % 60;
    const hEl = el('gps-timer-h'); if (hEl) hEl.value = h || '';
    const mEl = el('gps-timer-m'); if (mEl) mEl.value = m || '';
    const sEl = el('gps-timer-s'); if (sEl) sEl.value = s || '';
    gpsTimerState.totalMs = seconds * 1000; gpsTimerState.remainingMs = seconds * 1000;
    gpsUpdateTimerDisplay(); vibrate(10);
}
function gpsGetTimerInputMs() {
    const h = parseInt(el('gps-timer-h')?.value) || 0;
    const m = parseInt(el('gps-timer-m')?.value) || 0;
    const s = parseInt(el('gps-timer-s')?.value) || 0;
    return (h * 3600 + m * 60 + s) * 1000;
}
function gpsToggleTimer() {
    if (gpsTimerState.alarming) { gpsStopAlarm(); return; }
    if (gpsTimerState.running) { if (gpsTimerState.paused) gpsResumeTimer(); else gpsPauseTimer(); }
    else gpsStartTimer();
}
function gpsStartTimer() {
    const ms = gpsGetTimerInputMs();
    if (ms <= 0) { showToast(safeT('gps.timer.enterTime'), 'warning'); return; }
    gpsTimerState.totalMs = ms; gpsTimerState.remainingMs = ms;
    gpsTimerState.running = true; gpsTimerState.paused = false;
    gpsTimerState.endTime = performance.now() + ms; gpsTimerState.alarming = false;
    gpsUpdateTimerButton(); gpsRequestTimerWakeLock(); gpsTickTimer();
    gpsTimerState.intervalId = setInterval(gpsTickTimer, 200);
    vibrate(20); playTick(0, 1500, 0.08, 0.03);
}
function gpsPauseTimer() {
    if (!gpsTimerState.running || gpsTimerState.paused) return;
    gpsTimerState.paused = true;
    gpsTimerState.remainingMs = Math.max(0, gpsTimerState.endTime - performance.now());
    if (gpsTimerState.rafId) { cancelAnimationFrame(gpsTimerState.rafId); gpsTimerState.rafId = null; }
    if (gpsTimerState.intervalId) { clearInterval(gpsTimerState.intervalId); gpsTimerState.intervalId = null; }
    gpsUpdateTimerButton(); vibrate(15);
}
function gpsResumeTimer() {
    if (!gpsTimerState.running || !gpsTimerState.paused) return;
    gpsTimerState.paused = false;
    gpsTimerState.endTime = performance.now() + gpsTimerState.remainingMs;
    gpsTickTimer(); gpsTimerState.intervalId = setInterval(gpsTickTimer, 200);
    gpsUpdateTimerButton(); vibrate(15);
}
function gpsTickTimer() {
    if (!gpsTimerState.running || gpsTimerState.paused) return;
    const remaining = Math.max(0, gpsTimerState.endTime - performance.now());
    gpsTimerState.remainingMs = remaining;
    gpsUpdateTimerDisplay();
    if (remaining <= 0) { gpsTimerComplete(); return; }
    gpsTimerState.rafId = requestAnimationFrame(gpsTickTimer);
}
function gpsUpdateTimerDisplay() {
    const timeEl = el('gps-timer-time'), progressEl = el('gps-timer-progress');
    if (!timeEl) return;
    const ms = gpsTimerState.remainingMs || gpsTimerState.totalMs || gpsGetTimerInputMs();
    const sec = Math.ceil(ms / 1000);
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    timeEl.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    if (progressEl) { const total = gpsTimerState.totalMs || 1; const pct = Math.max(0, Math.min(100, (ms / total) * 100)); progressEl.style.width = pct + '%'; }
}
function gpsUpdateTimerButton() {
    const label = el('gps-timer-btn-label'), btn = el('gps-timer-btn-start');
    if (!label) return;
    if (gpsTimerState.alarming) { label.textContent = safeT('gps.timer.stopAlarm'); if (btn) btn.classList.add('active'); }
    else if (!gpsTimerState.running) { label.textContent = safeT('gps.start'); if (btn) btn.classList.remove('active'); }
    else if (gpsTimerState.paused) { label.textContent = safeT('gps.timer.resume'); if (btn) btn.classList.remove('active'); }
    else { label.textContent = safeT('gps.timer.pause'); if (btn) btn.classList.add('active'); }
}
function gpsTimerComplete() {
    gpsTimerState.running = false; gpsTimerState.paused = false;
    if (gpsTimerState.rafId) { cancelAnimationFrame(gpsTimerState.rafId); gpsTimerState.rafId = null; }
    if (gpsTimerState.intervalId) { clearInterval(gpsTimerState.intervalId); gpsTimerState.intervalId = null; }
    gpsTimerState.remainingMs = 0;
    gpsUpdateTimerDisplay(); gpsStartAlarm();
}
function gpsStartAlarm() {
    gpsTimerState.alarming = true; gpsUpdateTimerButton();
    showToast(safeT('gps.timer.timeUp'), 'success', 4000);
    let count = 0;
    const beepOnce = () => {
        if (!gpsTimerState.alarming) return;
        if (count >= 10) { gpsStopAlarm(); return; }
        count++; playAlarmBeep(); vibrate([300, 100, 300, 100, 300]);
    };
    beepOnce();
    gpsTimerState.alarmIntervalId = setInterval(beepOnce, 3000);
}
function gpsStopAlarm() {
    gpsTimerState.alarming = false;
    if (gpsTimerState.alarmIntervalId) { clearInterval(gpsTimerState.alarmIntervalId); gpsTimerState.alarmIntervalId = null; }
    gpsUpdateTimerButton(); vibrate(20);
}
function gpsResetTimer() {
    if (gpsTimerState.running && !gpsTimerState.paused) { showToast(safeT('gps.timer.stopFirst'), 'warning', 1500); return; }
    gpsStopAlarm();
    gpsTimerState.running = false; gpsTimerState.paused = false;
    gpsTimerState.totalMs = 0; gpsTimerState.remainingMs = 0;
    if (gpsTimerState.rafId) { cancelAnimationFrame(gpsTimerState.rafId); gpsTimerState.rafId = null; }
    if (gpsTimerState.intervalId) { clearInterval(gpsTimerState.intervalId); gpsTimerState.intervalId = null; }
    gpsReleaseTimerWakeLock();
    const hEl = el('gps-timer-h'); if (hEl) hEl.value = '';
    const mEl = el('gps-timer-m'); if (mEl) mEl.value = '';
    const sEl = el('gps-timer-s'); if (sEl) sEl.value = '';
    gpsUpdateTimerDisplay(); gpsUpdateTimerButton();
    vibrate(15); playTick(0, 1400, 0.06, 0.02);
}
async function gpsRequestTimerWakeLock() { if (!('wakeLock' in navigator)) return; try { gpsTimerState.wakeLock = await navigator.wakeLock.request('screen'); } catch (e) {} }
function gpsReleaseTimerWakeLock() { if (gpsTimerState.wakeLock) { try { gpsTimerState.wakeLock.release(); } catch (e) {} gpsTimerState.wakeLock = null; } }
function gpsCleanupAll() {
    try { gpsStopSpeed(); } catch (e) {}
    try { gpsStopStopwatch(); } catch (e) {}
    try { gpsStopAlarm(); } catch (e) {}
    try {
        gpsTimerState.running = false;
        if (gpsTimerState.rafId) { cancelAnimationFrame(gpsTimerState.rafId); gpsTimerState.rafId = null; }
        if (gpsTimerState.intervalId) { clearInterval(gpsTimerState.intervalId); gpsTimerState.intervalId = null; }
        gpsReleaseTimerWakeLock();
    } catch (e) {}
}

// ============================================================
// KONVERZIJE — OBUĆA, ODEĆA, BROJEVI
// ============================================================
const SHOE_SIZES = {
    male: {
        eu: [39, 40, 41, 42, 43, 44, 45, 46, 47, 48],
        us: [6.5, 7, 8, 8.5, 9.5, 10, 11, 12, 12.5, 13.5],
        uk: [6, 6.5, 7.5, 8, 9, 9.5, 10.5, 11.5, 12, 13],
        cm: [24.5, 25, 25.5, 26, 27, 27.5, 28.5, 29.5, 30, 31]
    },
    female: {
        eu: [35, 36, 37, 38, 39, 40, 41, 42, 43],
        us: [5, 5.5, 6.5, 7.5, 8.5, 9, 10, 10.5, 11.5],
        uk: [2.5, 3, 4, 5, 6, 6.5, 7.5, 8, 9],
        cm: [22, 22.5, 23.5, 24, 25, 25.5, 26.5, 27, 28]
    },
    kids: {
        eu: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35],
        us: [4.5, 5.5, 6.5, 7, 8, 8.5, 9.5, 10.5, 11, 12, 12.5, 13, 1, 2, 2.5, 3.5],
        uk: [4, 5, 6, 6.5, 7.5, 8, 9, 10, 10.5, 11.5, 12, 12.5, 13.5, 1, 1.5, 2.5],
        cm: [12, 13, 14, 14.5, 15, 15.5, 16, 17, 17.5, 18, 18.5, 19, 20, 20.5, 21, 22]
    }
};
function renderConversionObuca() {
    return `
        <div class="converter-box">
            <p class="section-desc">Konverzija veličina obuće između EU, US, UK sistema.</p>
            <div class="input-field">
                <label>Pol</label>
                <select id="shoe-gender" class="custom-input" onchange="calculateShoeSize()">
                    <option value="male">Muški</option>
                    <option value="female">Ženski</option>
                    <option value="kids">Deca</option>
                </select>
            </div>
            <div class="conversion-grid">
                <div class="conversion-field">
                    <label>Iz sistema</label>
                    <select id="shoe-from" class="custom-input" onchange="calculateShoeSize()">
                        <option value="eu">EU</option>
                        <option value="us">US</option>
                        <option value="uk">UK</option>
                        <option value="cm">CM (dužina stopala)</option>
                    </select>
                </div>
                <div class="conversion-field">
                    <label>U sistem</label>
                    <select id="shoe-to" class="custom-input" onchange="calculateShoeSize()">
                        <option value="eu">EU</option>
                        <option value="us" selected>US</option>
                        <option value="uk">UK</option>
                        <option value="cm">CM (dužina stopala)</option>
                    </select>
                </div>
            </div>
            <div class="input-field">
                <label>Veličina</label>
                <div class="input-wrapper">
                    <input type="number" id="shoe-val" class="custom-input" placeholder="42" inputmode="decimal" oninput="calculateShoeSize()">
                    <span class="unit" id="shoe-from-unit">EU</span>
                </div>
            </div>
            ${calcButton('btn.calculate', 'calculateShoeSize()')}
        </div>
        <div class="conversion-result" id="shoe-result-box" style="display: none;">
            <div class="conversion-result-label">Veličina</div>
            <div class="conversion-result-value" id="res-shoe-val">0</div>
            <div class="conversion-result-sub" id="res-shoe-system">US</div>
        </div>
    `;
}
function calculateShoeSize() {
    const gender = el('shoe-gender') ? el('shoe-gender').value : 'male';
    const from = el('shoe-from') ? el('shoe-from').value : 'eu';
    const to = el('shoe-to') ? el('shoe-to').value : 'us';
    const val = num('shoe-val');
    const fromUnit = el('shoe-from-unit');
    if (fromUnit) fromUnit.textContent = from.toUpperCase();
    if (val === null) { hide('shoe-result-box'); return; }
    const table = SHOE_SIZES[gender];
    if (!table) return;
    const fromArr = table[from];
    if (!fromArr) return;
    let closestIdx = 0;
    let minDiff = Infinity;
    fromArr.forEach((size, i) => {
        const diff = Math.abs(size - val);
        if (diff < minDiff) { minDiff = diff; closestIdx = i; }
    });
    const result = table[to][closestIdx];
    const resultEl = el('res-shoe-val');
    const systemEl = el('res-shoe-system');
    if (resultEl) resultEl.textContent = result;
    if (systemEl) systemEl.textContent = to.toUpperCase();
    show('shoe-result-box');
}

const CLOTHING_SIZES = {
    male: [
        { intl: 'XS', eu: 44, us: '34', uk: '34' },
        { intl: 'S', eu: 46, us: '36', uk: '36' },
        { intl: 'M', eu: 48, us: '38', uk: '38' },
        { intl: 'L', eu: 50, us: '40', uk: '40' },
        { intl: 'XL', eu: 52, us: '42', uk: '42' },
        { intl: 'XXL', eu: 54, us: '44', uk: '44' },
        { intl: '3XL', eu: 56, us: '46', uk: '46' }
    ],
    female: [
        { intl: 'XS', eu: 34, us: '2', uk: '6' },
        { intl: 'S', eu: 36, us: '4', uk: '8' },
        { intl: 'M', eu: 38, us: '6', uk: '10' },
        { intl: 'L', eu: 40, us: '8', uk: '12' },
        { intl: 'XL', eu: 42, us: '10', uk: '14' },
        { intl: 'XXL', eu: 44, us: '12', uk: '16' },
        { intl: '3XL', eu: 46, us: '14', uk: '18' }
    ]
};
function renderConversionOdeca() {
    return `
        <div class="converter-box">
            <p class="section-desc">Konverzija veličina odeće između internacionalnih (S/M/L), EU, US i UK sistema.</p>
            <div class="input-field">
                <label>Pol</label>
                <select id="clothing-gender" class="custom-input" onchange="calculateClothingSize()">
                    <option value="male">Muški</option>
                    <option value="female">Ženski</option>
                </select>
            </div>
            <div class="conversion-grid">
                <div class="conversion-field">
                    <label>Iz sistema</label>
                    <select id="clothing-from" class="custom-input" onchange="calculateClothingSize()">
                        <option value="intl">Internacionalno (S/M/L)</option>
                        <option value="eu" selected>EU</option>
                        <option value="us">US</option>
                        <option value="uk">UK</option>
                    </select>
                </div>
                <div class="conversion-field">
                    <label>U sistem</label>
                    <select id="clothing-to" class="custom-input" onchange="calculateClothingSize()">
                        <option value="intl">Internacionalno (S/M/L)</option>
                        <option value="eu">EU</option>
                        <option value="us" selected>US</option>
                        <option value="uk">UK</option>
                    </select>
                </div>
            </div>
            <div class="input-field">
                <label>Veličina</label>
                <div class="input-wrapper">
                    <input type="text" id="clothing-val" class="custom-input" placeholder="48 / M" oninput="calculateClothingSize()">
                </div>
            </div>
            ${calcButton('btn.calculate', 'calculateClothingSize()')}
        </div>
        <div class="conversion-result" id="clothing-result-box" style="display: none;">
            <div class="conversion-result-label">Veličina</div>
            <div class="conversion-result-value" id="res-clothing-val">—</div>
            <div class="conversion-result-sub" id="res-clothing-system">US</div>
        </div>
    `;
}
function calculateClothingSize() {
    const gender = el('clothing-gender') ? el('clothing-gender').value : 'male';
    const from = el('clothing-from') ? el('clothing-from').value : 'eu';
    const to = el('clothing-to') ? el('clothing-to').value : 'us';
    const inputEl = el('clothing-val');
    if (!inputEl) return;
    const val = inputEl.value.trim().toUpperCase();
    if (!val) { hide('clothing-result-box'); return; }
    const table = CLOTHING_SIZES[gender];
    if (!table) return;
    let row = null;
    if (from === 'intl') {
        row = table.find(r => r.intl === val);
    } else {
        const numVal = parseFloat(val);
        if (!isNaN(numVal)) {
            row = table.find(r => String(r[from]) === String(numVal));
        }
    }
    if (!row) {
        const resultEl = el('res-clothing-val');
        const systemEl = el('res-clothing-system');
        if (resultEl) resultEl.textContent = '—';
        if (systemEl) systemEl.textContent = 'Nema podudaranja';
        show('clothing-result-box');
        return;
    }
    const result = row[to];
    const resultEl = el('res-clothing-val');
    const systemEl = el('res-clothing-system');
    if (resultEl) resultEl.textContent = result;
    if (systemEl) systemEl.textContent = to === 'intl' ? 'Internacionalno' : to.toUpperCase();
    show('clothing-result-box');
}

function romanFromInt(num) {
    if (num < 1 || num > 3999 || !Number.isInteger(num)) return null;
    const romanMap = [
        [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
        [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
        [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
    ];
    let result = '';
    for (const [value, symbol] of romanMap) {
        while (num >= value) { result += symbol; num -= value; }
    }
    return result;
}
function intFromRoman(roman) {
    const map = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
    let result = 0;
    const upper = roman.toUpperCase();
    for (let i = 0; i < upper.length; i++) {
        const cur = map[upper[i]];
        const next = map[upper[i + 1]];
        if (!cur) return null;
        if (next && cur < next) result -= cur;
        else result += cur;
    }
    return result;
}
function renderConversionBrojevi() {
    return `
        <div class="converter-box">
            <p class="section-desc">Konverzija brojeva između decimalnog, binarnog, oktalnog, heksadecimalnog i rimskog sistema.</p>
            <div class="input-field">
                <label>Unesi broj</label>
                <input type="text" id="num-input" class="custom-input" placeholder="npr. 255 ili MCMXCV" oninput="calculateNumbers()">
            </div>
            <div class="input-field">
                <label>Iz sistema</label>
                <select id="num-from" class="custom-input" onchange="calculateNumbers()">
                    <option value="dec" selected>Decimalni</option>
                    <option value="bin">Binarni</option>
                    <option value="oct">Oktalni</option>
                    <option value="hex">Heksadecimalni</option>
                    <option value="roman">Rimski</option>
                </select>
            </div>
        </div>
        <div class="numbers-grid" id="numbers-result" style="display: none;">
            <div class="number-system-row" data-sys="dec">
                <div class="number-system-label">Decimalni</div>
                <div class="number-system-value" id="res-num-dec">—</div>
            </div>
            <div class="number-system-row" data-sys="bin">
                <div class="number-system-label">Binarni</div>
                <div class="number-system-value" id="res-num-bin">—</div>
            </div>
            <div class="number-system-row" data-sys="oct">
                <div class="number-system-label">Oktalni</div>
                <div class="number-system-value" id="res-num-oct">—</div>
            </div>
            <div class="number-system-row" data-sys="hex">
                <div class="number-system-label">Heksadecimalni</div>
                <div class="number-system-value" id="res-num-hex">—</div>
            </div>
            <div class="number-system-row" data-sys="roman">
                <div class="number-system-label">Rimski</div>
                <div class="number-system-value" id="res-num-roman">—</div>
            </div>
        </div>
        <p class="section-desc" style="text-align: center; font-size: 0.72rem;">Rimski brojevi idu od 1 do 3999.</p>
    `;
}
function calculateNumbers() {
    const inputEl = el('num-input');
    const fromEl = el('num-from');
    if (!inputEl || !fromEl) return;
    const raw = inputEl.value.trim();
    const from = fromEl.value;
    const resultBox = el('numbers-result');
    if (!raw) {
        if (resultBox) resultBox.style.display = 'none';
        return;
    }
    let decimal = null;
    try {
        if (from === 'dec') {
            const n = parseInt(raw, 10);
            if (!isNaN(n)) decimal = n;
        } else if (from === 'bin') {
            if (/^[01]+$/.test(raw)) decimal = parseInt(raw, 2);
        } else if (from === 'oct') {
            if (/^[0-7]+$/.test(raw)) decimal = parseInt(raw, 8);
        } else if (from === 'hex') {
            if (/^[0-9A-Fa-f]+$/.test(raw)) decimal = parseInt(raw, 16);
        } else if (from === 'roman') {
            decimal = intFromRoman(raw);
        }
    } catch (e) {}
    if (decimal === null || isNaN(decimal) || decimal < 0) {
        if (resultBox) resultBox.style.display = 'block';
        ['dec','bin','oct','hex','roman'].forEach(s => {
            const el2 = el('res-num-' + s);
            if (el2) el2.textContent = '—';
        });
        return;
    }
    const setV = (id, v) => { const e = el(id); if (e) e.textContent = v; };
    setV('res-num-dec', decimal.toString(10));
    setV('res-num-bin', decimal.toString(2));
    setV('res-num-oct', decimal.toString(8));
    setV('res-num-hex', decimal.toString(16).toUpperCase());
    const roman = romanFromInt(decimal);
    setV('res-num-roman', roman || '—');
    if (resultBox) resultBox.style.display = 'flex';
}

// ============================================================
// BARKOD
// ============================================================
let barcodeStream = null;
let barcodeIntervalId = null;
let barcodeDetector = null;

function renderBarcodeScanner() {
    return `
        <div class="converter-box">
            <p class="section-desc">Skeniraj barkod kamerom telefona ili unesi ručno.</p>
            <div class="barcode-camera-wrap" id="barcode-camera-wrap" style="display: none;">
                <video id="barcode-video" autoplay playsinline muted></video>
                <div class="barcode-overlay">
                    <div class="barcode-frame"></div>
                    <div class="barcode-scan-line"></div>
                </div>
            </div>
            <button class="calc-btn-main" id="barcode-start-btn" onclick="startBarcodeScanner()">▶ Pokreni kameru</button>
            <button class="gps-btn-secondary" id="barcode-stop-btn" style="display: none; width: 100%; margin-top: 8px;" onclick="stopBarcodeScanner()">⏹ Zaustavi kameru</button>
            <div style="margin-top: 14px;">
                <label style="font-size: 0.78rem; color: var(--text-secondary); font-weight: 700;">Ručni unos barkoda</label>
                <div class="input-wrapper" style="margin-top: 6px;">
                    <input type="text" id="barcode-manual" class="custom-input" placeholder="npr. 1234567890123" inputmode="numeric">
                </div>
                <button class="calc-btn-main" style="margin-top: 8px;" onclick="useBarcodeManually()">Pretraži proizvod</button>
            </div>
        </div>
        <div class="barcode-detected" id="barcode-detected" style="display: none;">
            <div class="barcode-detected-label">Detektovan barkod</div>
            <div class="barcode-detected-code" id="barcode-code">—</div>
            <button class="calc-btn-main" style="margin-top: 12px;" onclick="addBarcodeToList()">Dodaj u listu za kupovinu</button>
        </div>
    `;
}
function initBarcodeScanner() { stopBarcodeScanner(); }
async function startBarcodeScanner() {
    const wrap = el('barcode-camera-wrap');
    const startBtn = el('barcode-start-btn');
    const stopBtn = el('barcode-stop-btn');
    const video = el('barcode-video');
    if (!wrap || !video) return;
    try {
        barcodeStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        video.srcObject = barcodeStream;
        wrap.style.display = 'block';
        if (startBtn) startBtn.style.display = 'none';
        if (stopBtn) stopBtn.style.display = 'block';
        if ('BarcodeDetector' in window) {
            try {
                barcodeDetector = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code'] });
                barcodeIntervalId = setInterval(async () => {
                    if (!barcodeDetector || !video) return;
                    try {
                        const barcodes = await barcodeDetector.detect(video);
                        if (barcodes && barcodes.length > 0) onBarcodeDetected(barcodes[0].rawValue);
                    } catch (e) {}
                }, 500);
            } catch (e) {}
        }
    } catch (e) {
        showToast('Greška pri pristupu kameri.', 'error', 3000);
    }
}
function stopBarcodeScanner() {
    const wrap = el('barcode-camera-wrap');
    const startBtn = el('barcode-start-btn');
    const stopBtn = el('barcode-stop-btn');
    if (barcodeStream) { barcodeStream.getTracks().forEach(t => t.stop()); barcodeStream = null; }
    if (barcodeIntervalId) { clearInterval(barcodeIntervalId); barcodeIntervalId = null; }
    barcodeDetector = null;
    if (wrap) wrap.style.display = 'none';
    if (startBtn) startBtn.style.display = 'block';
    if (stopBtn) stopBtn.style.display = 'none';
}
function onBarcodeDetected(code) {
    if (!code) return;
    stopBarcodeScanner();
    const box = el('barcode-detected');
    const codeEl = el('barcode-code');
    if (box) box.style.display = 'block';
    if (codeEl) codeEl.textContent = code;
    vibrate([50, 30, 50]);
}
function useBarcodeManually() {
    const input = el('barcode-manual');
    if (!input) return;
    const code = input.value.trim();
    if (!code) { showToast('Unesi barkod.', 'warning'); return; }
    onBarcodeDetected(code);
}
function addBarcodeToList() {
    const codeEl = el('barcode-code');
    if (!codeEl) return;
    const code = codeEl.textContent;
    if (!code || code === '—') return;
    const list = loadShoppingList();
    list.push({ id: Date.now() + Math.random(), name: 'Barkod: ' + code, qty: '', price: 0, bought: false, date: Date.now(), barcode: code });
    saveShoppingList(list);
    showToast('Dodato u listu za kupovinu.', 'success', 2000);
}

// ============================================================
// PRICE TRACKING
// ============================================================
const PRICE_TRACKING_KEY = 'cx_price_tracking_v1';
function loadPriceTracking() {
    try { const raw = JSON.parse(localStorage.getItem(PRICE_TRACKING_KEY)); if (Array.isArray(raw)) return raw; } catch (e) {}
    return [];
}
function savePriceTracking(list) {
    try { localStorage.setItem(PRICE_TRACKING_KEY, JSON.stringify(list)); } catch (e) {}
}
function renderPriceTracking() {
    return `
        <div class="converter-box">
            <div class="lista-head">
                <div class="section-desc" style="margin:0;">Prati cene proizvoda kroz vreme.</div>
                <button class="section-action-btn" onclick="openPriceTrackingModal()">+ Dodaj</button>
            </div>
            <div id="price-tracking-list" class="price-track-list"></div>
        </div>
    `;
}
function renderPriceTrackingList() {
    const list = el('price-tracking-list');
    if (!list) return;
    const items = loadPriceTracking();
    if (!items.length) {
        list.innerHTML = `<div class="price-track-empty"><div class="price-track-empty-icon">📊</div><div>Nema proizvoda. Dodaj prvi!</div></div>`;
        return;
    }
    let html = '';
    items.forEach(item => {
        const prices = item.prices || [];
        const lowest = prices.length ? Math.min(...prices.map(p => p.price)) : 0;
        const highest = prices.length ? Math.max(...prices.map(p => p.price)) : 0;
        const avg = prices.length ? prices.reduce((s, p) => s + p.price, 0) / prices.length : 0;
        const last = prices.length ? prices[prices.length - 1].price : 0;
        const change = prices.length >= 2 ? last - prices[prices.length - 2].price : 0;
        const changeClass = change > 0 ? 'up' : (change < 0 ? 'down' : '');
        const changeText = change === 0 ? '—' : (change > 0 ? '+' : '') + money(change) + ' RSD';
        html += `
            <div class="price-track-card">
                <div class="price-track-head">
                    <div class="price-track-name">${escapeHtml(item.name)}</div>
                    ${item.store ? `<div class="price-track-store">${escapeHtml(item.store)}</div>` : ''}
                </div>
                <div class="price-track-stats">
                    <div class="price-track-stat"><div class="price-track-stat-label">Najniža</div><div class="price-track-stat-value low">${money(lowest)}</div></div>
                    <div class="price-track-stat"><div class="price-track-stat-label">Prosečna</div><div class="price-track-stat-value">${money(avg)}</div></div>
                    <div class="price-track-stat"><div class="price-track-stat-label">Najviša</div><div class="price-track-stat-value high">${money(highest)}</div></div>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:0.75rem;color:var(--text-secondary);font-weight:700;">Poslednja: ${money(last)} RSD</span>
                    ${changeText !== '—' ? `<span class="price-track-change ${changeClass}">${changeText}</span>` : ''}
                </div>
                <div style="display:flex;gap:6px;margin-top:10px;">
                    <button class="section-action-btn" style="flex:1;" onclick="openAddPriceModal('${item.id}')">+ Dodaj cenu</button>
                    <button class="section-action-btn" style="flex:1;color:#f43f5e;border-color:rgba(244,63,94,0.4);" onclick="deletePriceTracking('${item.id}')">Obriši</button>
                </div>
            </div>
        `;
    });
    list.innerHTML = html;
}
function openPriceTrackingModal() {
    const modal = el('price-tracking-modal');
    const body = el('price-tracking-modal-body');
    if (!modal || !body) return;
    body.innerHTML = `
        <div class="converter-box">
            ${inputFieldText('label.shop.itemName', 'pt-name', 'npr. Mleko 1L')}
            ${inputFieldText('label.shop.price', 'pt-store', 'npr. Maxi')}
            ${calcButton('btn.save', 'savePriceTrackingProduct()')}
        </div>
    `;
    modal.classList.add('show');
    document.body.classList.add('modal-open');
}
function savePriceTrackingProduct() {
    const name = el('pt-name') ? el('pt-name').value.trim() : '';
    const store = el('pt-store') ? el('pt-store').value.trim() : '';
    if (!name) { showToast('Unesi naziv proizvoda.', 'error'); return; }
    const list = loadPriceTracking();
    list.push({ id: 'pt_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7), name, store, prices: [], createdAt: Date.now() });
    savePriceTracking(list);
    closeModal('price-tracking-modal');
    renderPriceTrackingList();
    showToast('Proizvod dodat.', 'success', 1500);
}
function openAddPriceModal(productId) {
    const list = loadPriceTracking();
    const item = list.find(p => p.id === productId);
    if (!item) return;
    const price = prompt('Unesi cenu (RSD):');
    if (!price) return;
    const priceNum = parseNum(price);
    if (!priceNum || priceNum <= 0) { showToast('Neispravna cena.', 'error'); return; }
    const store = prompt('Prodavnica (opciono):') || item.store || '';
    item.prices = item.prices || [];
    item.prices.push({ price: priceNum, store: store, date: new Date().toISOString().slice(0, 10) });
    savePriceTracking(list);
    renderPriceTrackingList();
    showToast('Cena dodata.', 'success', 1500);
}
function deletePriceTracking(productId) {
    showConfirm('Obrisati ovaj proizvod i sve cene?').then(ok => {
        if (!ok) return;
        let list = loadPriceTracking();
        list = list.filter(p => p.id !== productId);
        savePriceTracking(list);
        renderPriceTrackingList();
        showToast('Proizvod obrisan.', 'info', 1500);
    });
}

// ============================================================
// ISTORIJA TOČENJA
// ============================================================
const FUEL_HISTORY_KEY = 'cx_fuel_history_v1';
function loadFuelHistory() {
    try { const raw = JSON.parse(localStorage.getItem(FUEL_HISTORY_KEY)); if (Array.isArray(raw)) return raw; } catch (e) {}
    return [];
}
function saveFuelHistory(list) {
    try { localStorage.setItem(FUEL_HISTORY_KEY, JSON.stringify(list)); } catch (e) {}
}
function renderFuelHistory() {
    return `
        <div class="converter-box">
            <div class="lista-head">
                <div class="section-desc" style="margin:0;">Prati točenja, potrošnju i troškove goriva.</div>
                <button class="section-action-btn" onclick="openFuelHistoryModal()">+ Dodaj</button>
            </div>
            <div id="fuel-history-list" class="price-track-list"></div>
        </div>
    `;
}
function renderFuelHistoryList() {
    const list = el('fuel-history-list');
    if (!list) return;
    const items = loadFuelHistory();
    if (!items.length) {
        list.innerHTML = `<div class="price-track-empty"><div class="price-track-empty-icon">⛽</div><div>Nema unosa. Dodaj prvo točenje!</div></div>`;
        return;
    }
    const sorted = [...items].sort((a, b) => (a.km || 0) - (b.km || 0));
    let totalLiters = 0, totalCost = 0, totalKm = 0, consumptionSum = 0, consumptionCount = 0;
    for (let i = 1; i < sorted.length; i++) {
        const kmDiff = sorted[i].km - sorted[i - 1].km;
        if (kmDiff > 0) { consumptionSum += (sorted[i].liters / kmDiff) * 100; consumptionCount++; }
    }
    sorted.forEach(i => { totalLiters += i.liters || 0; totalCost += (i.liters || 0) * (i.price || 0); });
    if (sorted.length >= 2) totalKm = sorted[sorted.length - 1].km - sorted[0].km;
    const avgCons = consumptionCount > 0 ? consumptionSum / consumptionCount : 0;
    const costPerKm = totalKm > 0 ? totalCost / totalKm : 0;
    let rows = sorted.slice().reverse().map(item => `
        <div class="price-track-card">
            <div class="price-track-head"><div class="price-track-name">${escapeHtml(item.date)} • ${item.km} km</div><div class="price-track-store">${item.liters} L</div></div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                <div style="font-size:0.78rem;color:var(--text-secondary);">Cena/L: <strong style="color:var(--text-main);">${money(item.price)}</strong></div>
                <div style="font-size:0.78rem;color:var(--text-secondary);text-align:right;">Ukupno: <strong style="color:#10b981;">${money(item.liters * item.price)}</strong></div>
            </div>
            <button class="section-action-btn" style="width:100%;margin-top:8px;color:#f43f5e;border-color:rgba(244,63,94,0.4);" onclick="deleteFuelEntry('${item.id}')">Obriši unos</button>
        </div>
    `).join('');
    list.innerHTML = `
        <div class="converter-box" style="margin-bottom:12px;">
            <div class="rate-info-card" style="margin:0;">
                <div class="rate-info-row"><span class="rate-info-label">Prosečna potrošnja</span><span class="rate-info-value accent">${fmt(avgCons, 2)} L/100km</span></div>
                <div class="rate-info-row"><span class="rate-info-label">Ukupno litara</span><span class="rate-info-value">${fmt(totalLiters, 1)} L</span></div>
                <div class="rate-info-row"><span class="rate-info-label">Ukupni trošak</span><span class="rate-info-value">${money(totalCost)} RSD</span></div>
                <div class="rate-info-row"><span class="rate-info-label">Pređeno</span><span class="rate-info-value">${totalKm} km</span></div>
                <div class="rate-info-row"><span class="rate-info-label">Cena po km</span><span class="rate-info-value">${money(costPerKm)} RSD</span></div>
            </div>
        </div>
        ${rows}
        <button class="section-action-btn" style="width:100%;color:#f43f5e;border-color:rgba(244,63,94,0.4);margin-top:12px;" onclick="clearFuelHistory()">Obriši sve</button>
    `;
}
function openFuelHistoryModal() {
    const modal = el('fuel-history-modal');
    const body = el('fuel-history-modal-body');
    if (!modal || !body) return;
    body.innerHTML = `
        <div class="converter-box">
            <div class="input-field"><label>Datum</label><input type="date" id="fh-date" class="custom-input" value="${new Date().toISOString().slice(0, 10)}"></div>
            ${inputField('label.auto.currentKm', 'fh-km', 'km', 'placeholder="150000"')}
            ${inputField('label.auto.fuel', 'fh-liters', 'L', 'step="0.1" placeholder="45"')}
            ${inputField('label.auto.price', 'fh-price', 'RSD/L', 'step="0.1" placeholder="180"')}
            ${calcButton('btn.save', 'saveFuelEntry()')}
        </div>
    `;
    modal.classList.add('show');
    document.body.classList.add('modal-open');
}
function saveFuelEntry() {
    const date = el('fh-date') ? el('fh-date').value : '';
    const km = num('fh-km');
    const liters = num('fh-liters');
    const price = num('fh-price');
    if (!date || km === null || !liters || !price) { showToast('Popuni sva polja.', 'error'); return; }
    const list = loadFuelHistory();
    list.push({ id: 'fh_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7), date, km, liters, price, createdAt: Date.now() });
    saveFuelHistory(list);
    closeModal('fuel-history-modal');
    renderFuelHistoryList();
    showToast('Točenje sačuvano.', 'success', 1500);
}
function deleteFuelEntry(id) {
    let list = loadFuelHistory();
    list = list.filter(i => i.id !== id);
    saveFuelHistory(list);
    renderFuelHistoryList();
    showToast('Unos obrisan.', 'info', 1200);
}
function clearFuelHistory() {
    showConfirm('Obrisati celu istoriju točenja?').then(ok => {
        if (!ok) return;
        saveFuelHistory([]);
        renderFuelHistoryList();
        showToast('Istorija obrisana.', 'info', 1500);
    });
}

// ============================================================
// PROFIL VOZILA
// ============================================================
const VEHICLE_PROFILE_KEY = 'cx_vehicle_profile_v1';
function loadVehicleProfile() {
    try { const raw = JSON.parse(localStorage.getItem(VEHICLE_PROFILE_KEY)); if (raw && typeof raw === 'object') return raw; } catch (e) {}
    return {};
}
function saveVehicleProfileStore(p) {
    try { localStorage.setItem(VEHICLE_PROFILE_KEY, JSON.stringify(p)); } catch (e) {}
}
function renderVehicleProfile() {
    return `
        <div class="converter-box">
            <p class="section-desc">Popuni podatke o vozilu — koristi se u kalkulacijama.</p>
            ${inputFieldText('label.auto.model', 'vp-model', 'npr. VW Golf 7')}
            ${inputFieldText('label.auto.plate', 'vp-plate', 'npr. NP123-AB')}
            ${inputField('label.auto.technical', 'vp-year', '', 'placeholder="2018"')}
            <div class="input-field">
                <label>Tip goriva</label>
                <select id="vp-fuel-type" class="custom-input">
                    <option value="petrol">Benzin</option>
                    <option value="diesel">Dizel</option>
                    <option value="lpg">TNG</option>
                    <option value="electric">Električni</option>
                    <option value="hybrid">Hibrid</option>
                </select>
            </div>
            ${inputField('label.auto.fuel', 'vp-tank', 'L', 'placeholder="55"')}
            ${inputField('label.auto.avgConsumption', 'vp-consumption', 'L/100km', 'step="0.1" placeholder="7"')}
            ${dateTripleField('label.auto.registrationExpires', 'vp-reg-date')}
            ${dateTripleField('label.auto.technicalExpires', 'vp-tech-date')}
            ${dateTripleField('label.auto.registrationAndInsurance', 'vp-ins-date')}
            ${calcButton('btn.saveCarProfile', 'saveVehicleProfileData()')}
            <button class="rem-delete-btn" onclick="clearVehicleProfile()">Obriši profil</button>
        </div>
        ${statsRow('vp-status-row', [
            ['label.auto.registration', 'vp-stat-reg', '—'],
            ['label.auto.technical', 'vp-stat-tech', '—'],
            ['label.auto.registrationAndInsurance', 'vp-stat-ins', '—']
        ])}
    `;
}
function loadVehicleProfileIntoForm() {
    const p = loadVehicleProfile();
    const setV = (id, v) => { const e = el(id); if (e) e.value = v == null ? '' : v; };
    setV('vp-model', p.model);
    setV('vp-plate', p.plate);
    setV('vp-year', p.year);
    setV('vp-fuel-type', p.fuelType || 'petrol');
    setV('vp-tank', p.tankCapacity);
    setV('vp-consumption', p.avgConsumption);
    if (p.regDate) setTripleDate('vp-reg-date', p.regDate);
    if (p.techDate) setTripleDate('vp-tech-date', p.techDate);
    if (p.insuranceDate) setTripleDate('vp-ins-date', p.insuranceDate);
    updateVehicleProfileStatus();
}
function saveVehicleProfileData() {
    const v = id => { const e = el(id); return e ? e.value.trim() : ''; };
    const profile = {
        model: v('vp-model'), plate: v('vp-plate'), year: v('vp-year'),
        fuelType: v('vp-fuel-type') || 'petrol', tankCapacity: v('vp-tank'), avgConsumption: v('vp-consumption'),
        regDate: getTripleDate('vp-reg-date'), techDate: getTripleDate('vp-tech-date'), insuranceDate: getTripleDate('vp-ins-date')
    };
    saveVehicleProfileStore(profile);
    showToast('Profil vozila sačuvan.', 'success', 1800);
    updateVehicleProfileStatus();
}
function clearVehicleProfile() {
    showConfirm('Obrisati profil vozila?').then(ok => {
        if (!ok) return;
        try { localStorage.removeItem(VEHICLE_PROFILE_KEY); } catch (e) {}
        showToast('Profil obrisan.', 'info', 1500);
        loadVehicleProfileIntoForm();
    });
}
function updateVehicleProfileStatus() {
    const p = loadVehicleProfile();
    const setV = (id, v) => { const e = el(id); if (e) e.innerText = v; };
    const daysLeft = (iso) => {
        if (!iso) return null;
        const parts = iso.split('-').map(Number);
        if (parts.length !== 3) return null;
        const target = new Date(parts[0], parts[1] - 1, parts[2]);
        const today = new Date(); today.setHours(0, 0, 0, 0);
        return Math.round((target - today) / 86400000);
    };
    const fmtDays = (d) => {
        if (d === null) return '—';
        if (d < 0) return `Isteklo pre ${Math.abs(d)} d.`;
        if (d === 0) return 'Danas';
        return `${d} d.`;
    };
    setV('vp-stat-reg', fmtDays(daysLeft(p.regDate)));
    setV('vp-stat-tech', fmtDays(daysLeft(p.techDate)));
    setV('vp-stat-ins', fmtDays(daysLeft(p.insuranceDate)));
    const row = el('vp-status-row');
    if (row) row.style.display = 'flex';
}

// ============================================================
// ROLL ELEMENT — animacija brojeva
// ============================================================
const ROLL_RE = /[-−]?\d[\d.]*(?:,\d+)?/g;
function parseSr(token) { return parseFloat(token.replace('−', '-').replace(/\./g, '').replace(',', '.')); }
function decimalsOf(token) { const i = token.indexOf(','); return i < 0 ? 0 : token.length - i - 1; }
function fmtSr(value, decimals) {
    const locale = currentLang === 'en' ? 'en-US' : 'sr-RS';
    return value.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
function rollElement(node, live) {
    const finalHTML = node.innerHTML;
    const tokens = finalHTML.match(ROLL_RE);
    if (!tokens) return;
    cancelAnimationFrame(node._raf);
    const targets = tokens.map(parseSr);
    const decs = tokens.map(decimalsOf);
    let starts = targets.map(() => 0);
    if (live && node._cur && node._cur.length === targets.length) starts = node._cur.slice();
    if (starts.every((s, i) => s === targets[i])) { node._cur = targets; return; }
    const duration = live ? 250 : (node.tagName === 'STRONG' ? 700 : 850);
    const t0 = performance.now();
    function frame(now) {
        const p = Math.min(1, (now - t0) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        const cur = targets.map((t, i) => starts[i] + (t - starts[i]) * eased);
        node._cur = cur;
        if (p < 1) {
            let k = 0;
            node.innerHTML = finalHTML.replace(ROLL_RE, () => { const text = fmtSr(cur[k], decs[k]); k++; return text; });
            node._raf = requestAnimationFrame(frame);
        } else {
            node.innerHTML = finalHTML;
            node._cur = targets;
        }
    }
    node._raf = requestAnimationFrame(frame);
}
const PULSE_MS = 25;
const TICK_COUNT = 12;
function rollFeedback(duration) {
    const times = [0];
    let last = 0;
    for (let k = 1; k <= TICK_COUNT; k++) {
        let t = duration * (1 - Math.pow(1 - k / TICK_COUNT, 1 / 3));
        if (t - last < 38) t = last + 38;
        times.push(t); last = t;
    }
    const pattern = [PULSE_MS];
    for (let i = 1; i < times.length; i++) {
        const gap = times[i] - times[i - 1];
        const isLast = (i === times.length - 1);
        pattern.push(Math.max(gap - PULSE_MS, 10), isLast ? PULSE_MS + 10 : PULSE_MS);
    }
    vibrate(pattern);
    times.forEach((t, i) => {
        const isLast = (i === times.length - 1);
        const freq = 1700 - (i / times.length) * 600;
        playTick(t / 1000, isLast ? 900 : freq, isLast ? 0.09 : 0.05, isLast ? 0.04 : 0.015);
    });
}

// ============================================================
// POPULATE NOTE SELECTS — placeholder
// ============================================================
function populateNoteSelects() {
    try {
        // Placeholder za kompatibilnost
    } catch (e) {}
}
// ============================================================
// SHOPPING — funkcije koje su nedostajale
// ============================================================

function renderShopUnit() {
    return `
        <div class="converter-box">
            <p class="section-desc">Izračunaj cenu po jedinici mere (kg, L, kom).</p>
            ${inputField('label.shop.price', 'shop-unit-price', 'RSD', 'placeholder="250"')}
            ${inputField('label.shop.quantity', 'shop-unit-qty', '', 'placeholder="1"')}
            ${selectField('label.shop.unit', 'shop-unit-unit', [
                { value: 'kg', text: 'kg' },
                { value: 'g', text: 'g' },
                { value: 'L', text: 'L' },
                { value: 'ml', text: 'ml' },
                { value: 'kom', text: 'kom' },
                { value: 'm', text: 'm' }
            ], 'kg')}
            ${calcButton('btn.calculate', 'calculateShopUnit()')}
        </div>
        ${resultCard('shop-unit-result-box', 'barcode', 'label.shop.pricePerUnit', 'res-shop-unit', 'RSD', 'KUPOVINA', 'label.shop.pricePerUnit')}
    `;
}

function calculateShopUnit() {
    const price = num('shop-unit-price');
    const qty = num('shop-unit-qty');
    const unit = el('shop-unit-unit') ? el('shop-unit-unit').value : 'kg';
    if (!price || !qty || qty <= 0) { showToast('Unesi cenu i količinu.', 'error'); return; }
    let baseQty = qty;
    if (unit === 'g' || unit === 'ml') baseQty = qty / 1000;
    const perUnit = price / baseQty;
    const rv = el('res-shop-unit');
    if (rv) rv.innerText = money(perUnit);
    show('shop-unit-result-box');
}

function renderShopCompare() {
    return `
        <div class="converter-box">
            <p class="section-desc">Uporedi dva proizvoda po ceni za istu količinu.</p>
            ${inputField('label.shop.priceA', 'cmp-price-a', 'RSD', 'placeholder="200"')}
            ${inputField('label.shop.quantity', 'cmp-qty-a', '', 'placeholder="1"')}
            ${inputField('label.shop.priceB', 'cmp-price-b', 'RSD', 'placeholder="250"')}
            ${inputField('label.shop.quantity', 'cmp-qty-b', '', 'placeholder="1.5"')}
            ${calcButton('btn.calculate', 'calculateShopCompare()')}
        </div>
        ${resultCard('shop-compare-result-box', 'scale', 'label.shop.compareResult', 'res-shop-compare', '', 'KUPOVINA', 'label.shop.compareShort')}
    `;
}

function calculateShopCompare() {
    const pa = num('cmp-price-a'), qa = num('cmp-qty-a');
    const pb = num('cmp-price-b'), qb = num('cmp-qty-b');
    if (!pa || !qa || !pb || !qb) { showToast('Unesi sve vrednosti.', 'error'); return; }
    const ua = pa / qa;
    const ub = pb / qb;
    const result = ua < ub ? safeT('label.shop.productACheaper') :
                   (ub < ua ? safeT('label.shop.productBCheaper') : safeT('label.shop.samePrice'));
    const rv = el('res-shop-compare');
    if (rv) rv.innerText = result + ' (' + money(Math.abs(ua - ub)) + ' RSD/kom)';
    show('shop-compare-result-box');
}

function renderShopLista() {
    return `
        <div class="converter-box">
            <div class="lista-head">
                <div class="section-desc" style="margin:0;">Lista za kupovinu</div>
                <button class="section-action-btn" onclick="openShoppingListModal()">+ Dodaj</button>
            </div>
            <div id="shopping-list-container"></div>
        </div>
    `;
}

function openShoppingListModal() {
    const name = prompt('Naziv stavke:');
    if (!name) return;
    const qty = prompt('Količina (opciono):') || '';
    const list = loadShoppingList();
    list.push({ id: Date.now() + Math.random(), name: name, qty: qty, price: 0, bought: false, date: Date.now() });
    saveShoppingList(list);
    renderShoppingList();
    showToast('Stavka dodata.', 'success', 1500);
}

function renderShoppingList() {
    const box = el('shopping-list-container');
    if (!box) return;
    const list = loadShoppingList();
    if (!list.length) {
        box.innerHTML = '<div class="receipt-empty"><div class="receipt-empty-icon">🛒</div><div>Lista je prazna. Dodaj prvu stavku!</div></div>';
        return;
    }
    let html = '';
    list.forEach(item => {
        html += `
            <div class="receipt-card" style="margin-bottom:8px;">
                <div class="receipt-card-body">
                    <div class="receipt-card-title">${escapeHtml(item.name)}</div>
                    ${item.qty ? `<div class="receipt-card-meta"><span>${escapeHtml(item.qty)}</span></div>` : ''}
                </div>
                <div class="receipt-card-actions">
                    <button class="receipt-card-action" onclick="toggleShoppingItemBought('${item.id}')">${item.bought ? '↩' : '✅'}</button>
                    <button class="receipt-card-action danger" onclick="deleteShoppingItem('${item.id}')">🗑</button>
                </div>
            </div>
        `;
    });
    box.innerHTML = html;
}

function loadShoppingList() {
    try { const raw = JSON.parse(localStorage.getItem('cx_shopping_list')); if (Array.isArray(raw)) return raw; } catch (e) {}
    return [];
}

function saveShoppingList(list) {
    try { localStorage.setItem('cx_shopping_list', JSON.stringify(list)); } catch (e) {}
}

function toggleShoppingItemBought(id) {
    const list = loadShoppingList();
    const item = list.find(x => String(x.id) === String(id));
    if (!item) return;
    item.bought = !item.bought;
    saveShoppingList(list);
    renderShoppingList();
}

function deleteShoppingItem(id) {
    let list = loadShoppingList();
    list = list.filter(x => String(x.id) !== String(id));
    saveShoppingList(list);
    renderShoppingList();
}

function renderShopIsplati() {
    return `
        <div class="converter-box">
            <p class="section-desc">Da li se isplati kupiti veće pakovanje?</p>
            ${inputField('label.shop.priceA', 'isplati-price-a', 'RSD', 'placeholder="200"')}
            ${inputField('label.shop.quantity', 'isplati-qty-a', '', 'placeholder="1"')}
            ${inputField('label.shop.priceB', 'isplati-price-b', 'RSD', 'placeholder="350"')}
            ${inputField('label.shop.quantity', 'isplati-qty-b', '', 'placeholder="2"')}
            ${calcButton('btn.calculate', 'calculateShopIsplati()')}
        </div>
        ${resultCard('shop-isplati-result-box', 'target', 'label.shop.worthIt', 'res-shop-isplati', '', 'KUPOVINA', 'label.shop.worthIt')}
    `;
}

function calculateShopIsplati() {
    const pa = num('isplati-price-a'), qa = num('isplati-qty-a');
    const pb = num('isplati-price-b'), qb = num('isplati-qty-b');
    if (!pa || !qa || !pb || !qb) { showToast('Unesi sve vrednosti.', 'error'); return; }
    const ua = pa / qa;
    const ub = pb / qb;
    const diff = Math.abs(ua - ub) * Math.max(qa, qb);
    let result;
    if (Math.abs(ua - ub) < 0.01) result = safeT('label.shop.worthItSame');
    else if (ub < ua) result = safeT('label.shop.worthItYes', money(diff));
    else result = safeT('label.shop.worthItNo', money(diff));
    const rv = el('res-shop-isplati');
    if (rv) rv.innerText = result;
    show('shop-isplati-result-box');
}

function renderShopRasipanje() {
    return `
        <div class="converter-box">
            <p class="section-desc">Izračunaj cenu po obroku i trošak bacanja.</p>
            ${inputField('label.shop.groceryPrice', 'rasipanje-price', 'RSD', 'placeholder="2000"')}
            ${inputField('label.shop.mealsCount', 'rasipanje-meals', '', 'placeholder="4"')}
            ${inputField('label.shop.wastePercent', 'rasipanje-waste', '%', 'placeholder="10"')}
            ${calcButton('btn.calculate', 'calculateShopRasipanje()')}
        </div>
        ${resultCard('shop-rasipanje-result-box', 'packageSm', 'label.shop.costPerMeal', 'res-shop-rasipanje', 'RSD', 'KUPOVINA', 'label.shop.perMealShort')}
        ${statsRow('shop-rasipanje-stats', [
            ['label.shop.withoutWaste', 'stat-rasipanje-base', '0 RSD'],
            ['label.shop.wasteCost', 'stat-rasipanje-waste', '0 RSD']
        ])}
    `;
}

function calculateShopRasipanje() {
    const price = num('rasipanje-price');
    const meals = num('rasipanje-meals') || 1;
    const waste = num('rasipanje-waste') || 0;
    if (!price || !meals) { showToast('Unesi cenu i broj obroka.', 'error'); return; }
    const baseCost = price / meals;
    const wasteCost = price * (waste / 100);
    const perMeal = (price + wasteCost) / meals;
    const rv = el('res-shop-rasipanje');
    if (rv) rv.innerText = money(perMeal);
    const sb = el('stat-rasipanje-base'); if (sb) sb.innerText = money(baseCost) + ' RSD';
    const sw = el('stat-rasipanje-waste'); if (sw) sw.innerText = money(wasteCost) + ' RSD';
    show('shop-rasipanje-result-box');
    show('shop-rasipanje-stats');
}

function renderShopBudzet() {
    return `
        <div class="converter-box">
            <p class="section-desc">Izračunaj dnevni limit potrošnje za kupovinu.</p>
            ${inputField('label.shop.totalBudget', 'shop-budzet-total', 'RSD', 'placeholder="30000"')}
            ${selectField('label.shop.period', 'shop-budzet-period', [
                { value: '7', text: 'Nedelja (7 dana)' },
                { value: '14', text: 'Dve nedelje (14 dana)' },
                { value: '30', text: 'Mesec (30 dana)' }
            ])}
            ${calcButton('btn.calculate', 'calculateShopBudzet()')}
        </div>
        ${resultCard('shop-budzet-result-box', 'calendarSm', 'label.shop.dailyLimit', 'res-shop-budzet', 'RSD', 'KUPOVINA', 'label.shop.budgetShort')}
    `;
}

function calculateShopBudzet() {
    const total = num('shop-budzet-total');
    const period = el('shop-budzet-period') ? parseInt(el('shop-budzet-period').value) : 30;
    if (!total || total <= 0) { showToast('Unesi budžet.', 'error'); return; }
    const daily = total / period;
    const rv = el('res-shop-budzet');
    if (rv) rv.innerText = money(daily);
    show('shop-budzet-result-box');
}
// ============================================================
// KRAJ app.js — Alatika 3.0 (v19 ETA 1)
// ============================================================
// NAPOMENA: Order of file defines dependencies. Some functions were
// defined after usage (hoisting covers function declarations).
// Categories now include: podsetnici, racuni (NEW), weather, money,
// measures, shopping, auto, bike, health, time, homecalc, kitchen,
// power, work, music, gps.
// Money category tabs: valuta first, racuni moved to new category.
// Quick tools: podsetnici, money, weather, racuni.
// All tools modal: Opcija A (sections + chips + inline panels).
// ============================================================
