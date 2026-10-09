// ============================================================
// ALATIKA 3.0 — app.js
// Verzija: v17 (ispravljena)
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
// CATEGORIES — v17
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
            { id: 'popust', name: 'Popust i procenat', icon: 'tag', render: renderMoneyPopust },
            { id: 'pdv', name: 'PDV', icon: 'percent', render: renderMoneyPDV },
            { id: 'kredit', name: 'Kredit', icon: 'creditCard', render: renderMoneyKredit },
            { id: 'rate', name: 'Rate', icon: 'creditCard', render: renderMoneyRate },
            { id: 'podela', name: 'Podela računa i napojnica', icon: 'receipt', render: renderMoneyPodela },
            { id: 'poredjenje', name: 'Poređenje cena', icon: 'scale', render: renderMoneyPoredjenje },
            { id: 'budzet', name: 'Budžet', icon: 'calendarSm', render: renderMoneyBudzet },
            { id: 'stednja', name: 'Štednja', icon: 'piggyBank', render: renderMoneyStednja },
            { id: 'valuta', name: 'Kursna lista', icon: 'exchange', render: renderMoneyValuta },
            { id: 'racuni', name: 'Računi', icon: 'receipt', render: renderRacuni }
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

const MAIN_CATEGORIES = [
    { id: 'vozila', name: 'Vozila', icon: 'car', accent: '#f43f5e', subcats: ['auto', 'bike'] },
    { id: 'novac_posao', name: 'Novac i posao', icon: 'wallet', accent: '#10b981', subcats: ['money', 'work', 'shopping'] },
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
// ZADATAK 1: BRZI PREGLED
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
        else if (item.type === 'receipt') clickTarget = `openCalc('money', 'racuni')`;
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
// SVI ALATI MODAL
// ============================================================
const allToolsViewState = {
    view: 'main',
    activeMainCat: null,
    openSubcats: {}
};

function openAllToolsModal() {
    const modal = el('all-tools-modal');
    if (!modal) return;

    allToolsViewState.view = 'main';
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
    renderAllToolsMainCats();

    modal.classList.add('show');
    document.body.classList.add('modal-open');
    vibrate(15);
    playTick(0, 1400, 0.06, 0.02);

    try { history.pushState({ modal: 'all-tools' }, '', ''); } catch (e) {}
}

function allToolsGoBack() {
    if (allToolsViewState.view === 'main') {
        closeModal('all-tools-modal');
        return;
    }
    allToolsViewState.view = 'main';
    allToolsViewState.activeMainCat = null;
    allToolsViewState.openSubcats = {};

    const backBtn = el('all-tools-back-btn');
    if (backBtn) backBtn.style.display = 'none';
    const title = el('all-tools-modal-title');
    if (title) title.textContent = safeT('allTools.title');

    const searchInput = el('all-tools-search');
    if (searchInput) searchInput.value = '';
    const clearBtn = el('all-tools-search-clear');
    if (clearBtn) clearBtn.style.display = 'none';

    const favWrap = el('all-tools-favorites-wrap');
    if (favWrap) favWrap.style.display = '';
    renderAllToolsFavorites();
    renderAllToolsMainCats();

    vibrate(10);
    playTick(0, 1200, 0.04, 0.012);
}

function renderAllToolsFavorites() {
    const wrap = el('all-tools-favorites-wrap');
    const chips = el('all-tools-favorites-chips');
    if (!wrap || !chips) return;

    const favs = loadFavorites().slice(0, 4);
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

function renderAllToolsMainCats() {
    const container = el('all-tools-sections');
    if (!container) return;

    let html = '<div class="all-tools-main-cats-grid">';
    MAIN_CATEGORIES.forEach(mainCat => {
        let toolsCount = 0;
        mainCat.subcats.forEach(subId => {
            const cat = CATEGORIES[subId];
            if (cat) toolsCount += cat.tabs.length;
        });

        html += `
            <button type="button" class="all-tools-main-cat"
                    style="--cat-accent: ${mainCat.accent};"
                    onclick="openAllToolsMainCat('${mainCat.id}')">
                <span class="all-tools-main-cat-icon">${icon(mainCat.icon)}</span>
                <span class="all-tools-main-cat-name">${escapeHtml(mainCat.name)}</span>
                <span class="all-tools-main-cat-count">${toolsCount} ${toolsCount === 1 ? 'alat' : 'alata'}</span>
            </button>
        `;
    });
    html += '</div>';

    container.innerHTML = html;
}

function openAllToolsMainCat(mainCatId) {
    const mainCat = getMainCategoryById(mainCatId);
    if (!mainCat) return;

    allToolsViewState.view = 'sub';
    allToolsViewState.activeMainCat = mainCatId;
    allToolsViewState.openSubcats = {};

    const favWrap = el('all-tools-favorites-wrap');
    if (favWrap) favWrap.style.display = 'none';

    const backBtn = el('all-tools-back-btn');
    if (backBtn) backBtn.style.display = 'flex';
    const title = el('all-tools-modal-title');
    if (title) title.textContent = mainCat.name;

    const searchInput = el('all-tools-search');
    if (searchInput) searchInput.value = '';
    const clearBtn = el('all-tools-search-clear');
    if (clearBtn) clearBtn.style.display = 'none';

    renderAllToolsSubCats(mainCat);

    vibrate(12);
    playTick(0, 1300, 0.05, 0.015);
}

function renderAllToolsSubCats(mainCat) {
    const container = el('all-tools-sections');
    if (!container) return;

    let html = '<div class="all-tools-subcats-grid">';

    mainCat.subcats.forEach(subId => {
        const cat = CATEGORIES[subId];
        if (!cat) return;
        const accent = getCategoryAccent(subId);
        const totalTools = cat.tabs.length;
        const isOpen = allToolsViewState.openSubcats[subId] === true;
        const openClass = isOpen ? ' open' : '';
        const ariaExpanded = isOpen ? 'true' : 'false';

        const chipHtml = `<div class="all-tools-subcat-chip" style="--cat-accent: ${accent};">${icon(cat.icon)} ${escapeHtml(safeT('cat.' + subId))}</div>`;

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

        html += `
            <div class="all-tools-subcat${openClass}"
                 data-subcat-id="${subId}"
                 style="--cat-accent: ${accent};">
                ${chipHtml}
                <button type="button" class="all-tools-subcat-head"
                        onclick="toggleAllToolsSubcat('${subId}')"
                        aria-expanded="${ariaExpanded}">
                    <span class="all-tools-subcat-icon">${icon(cat.icon)}</span>
                    <span class="all-tools-subcat-info">
                        <span class="all-tools-subcat-name">${escapeHtml(safeT('cat.' + subId))}</span>
                        <span class="all-tools-subcat-count">${totalTools} ${totalTools === 1 ? 'alat' : 'alata'}</span>
                    </span>
                    <span class="all-tools-subcat-arrow">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </span>
                </button>
                <div class="all-tools-subcat-body">
                    <div class="all-tools-subcat-body-inner">
                        <div class="all-tools-tabs-grid">${tabsHtml}</div>
                    </div>
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

function toggleAllToolsSubcat(subcatId) {
    const el2 = document.querySelector(`.all-tools-subcat[data-subcat-id="${subcatId}"]`);
    if (!el2) return;
    const isOpen = el2.classList.contains('open');
    el2.classList.toggle('open', !isOpen);
    allToolsViewState.openSubcats[subcatId] = !isOpen;
    const head = el2.querySelector('.all-tools-subcat-head');
    if (head) head.setAttribute('aria-expanded', (!isOpen).toString());
    vibrate(8);
    playTick(0, 1200, 0.04, 0.012);
}

function closeAnyOpenAllToolsCat() {
    if (allToolsViewState.view !== 'sub') return false;
    const openCats = document.querySelectorAll('.all-tools-subcat.open');
    if (openCats.length === 0) return false;
    openCats.forEach(cat => {
        cat.classList.remove('open');
        const subId = cat.dataset.subcatId;
        if (subId) allToolsViewState.openSubcats[subId] = false;
    });
    vibrate(8);
    return true;
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
        if (allToolsViewState.view === 'main') {
            renderAllToolsMainCats();
        } else {
            const mainCat = getMainCategoryById(allToolsViewState.activeMainCat);
            if (mainCat) renderAllToolsSubCats(mainCat);
        }
        if (favWrap) favWrap.style.display = allToolsViewState.view === 'main' ? '' : 'none';
        if (allToolsViewState.view === 'main') renderAllToolsFavorites();
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

    if (allToolsViewState.view === 'main') {
        if (favWrap) favWrap.style.display = '';
        renderAllToolsFavorites();
        renderAllToolsMainCats();
    } else {
        const mainCat = getMainCategoryById(allToolsViewState.activeMainCat);
        if (mainCat) renderAllToolsSubCats(mainCat);
    }
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
    const selector = '.calc-btn-main, .copy-btn, .back-btn, .swap-btn, .settings-toggle-btn, .confirm-btn, .openings-add-btn, .fx-refresh-btn, .fx-swap-btn, .copy-btn-mini, .lista-clear-btn, .quick-tool, .all-tool, .tab-btn, .section-action-btn, .modal-fav-star, .modal-settings-btn, .weather-refresh-btn, .location-gps-btn, .weather-location, .icon-btn-text, .about-row, .tabs-settings-reset-btn, .tabs-settings-save-btn, .gps-btn-main, .gps-btn-secondary, .gps-chip, .gps-color-swatch, .tabs-settings-color-reset, .toolbar-btn, .bottom-nav-btn, .mytool-item, .today-item, .holiday-card, .all-tools-main-btn, .all-tools-main-cat, .all-tools-subcat-head, .all-tools-tab, .all-tools-search-item, .all-tools-fav-chip, .all-tools-back-btn, .stopwatch-btn, .timer-btn, .timer-preset-btn, .timer-option-btn, .speedometer-actions .gps-btn-main, .speedometer-actions .gps-btn-secondary, .receipt-card, .receipt-chip, .receipt-card-action, .receipt-details-action, .receipt-status-btn, .receipt-add-btn';
    document.addEventListener('pointerdown', (e) => {
        const t = e.target.closest(selector);
        if (t) createRipple({ currentTarget: t, clientX: e.clientX, clientY: e.clientY });
    }, { passive: true });
}

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
        if (typeof renderAllToolsMainCats === 'function') {
            const allToolsModal = el('all-tools-modal');
            if (allToolsModal && allToolsModal.classList.contains('show')) {
                if (allToolsViewState.view === 'main') {
                    renderAllToolsFavorites();
                    renderAllToolsMainCats();
                } else {
                    const mainCat = getMainCategoryById(allToolsViewState.activeMainCat);
                    if (mainCat) renderAllToolsSubCats(mainCat);
                }
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
    if (tabId === 'racuni' && categoryId === 'money') {
        setTimeout(() => {
            if (typeof renderRacuni === 'function') {
                if (typeof loadReceiptThumbnails === 'function') loadReceiptThumbnails();
            }
        }, 100);
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
        allToolsViewState.view = 'main';
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
    allToolsViewState.view = 'main';
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
const DEFAULT_QUICK_TOOLS = ['podsetnici', 'money', 'weather', 'health'];
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
        if (allToolsViewState.view === 'main') {
            renderAllToolsFavorites();
            renderAllToolsMainCats();
        } else {
            const mainCat = getMainCategoryById(allToolsViewState.activeMainCat);
            if (mainCat) {
                renderAllToolsFavorites();
                renderAllToolsSubCats(mainCat);
            }
        }
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
            if (allToolsViewState.view === 'sub') {
                allToolsGoBack();
                return;
            }
            const closed = closeAnyOpenAllToolsCat();
            if (closed) return;
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
// SHOPPING — Cena po jedinici  ⭐ NOVO
// ============================================================
function renderShopUnit() {
    return `
        <div class="converter-box">
            <p class="section-desc">Izračunaj cenu po jedinici mere (kg, L, kom) da uporediš proizvode.</p>
            ${inputField('label.shop.totalPrice', 'shop-unit-price', 'RSD', 'placeholder="250"')}
            ${inputField('label.shop.quantity', 'shop-unit-qty', '', 'placeholder="1"')}
            ${selectField('label.shop.unit', 'shop-unit-type', [
                { value: 'kg', text: 'kg' },
                { value: 'g', text: 'g' },
                { value: 'L', text: 'L' },
                { value: 'ml', text: 'ml' },
                { value: 'kom', text: 'kom' }
            ], 'kg')}
            ${calcButton('btn.calculate', 'calculateShopUnit()')}
        </div>
        <div id="shop-unit-result-box" class="result-card-green" style="display: none;">
            <div class="res-left">
                <div class="pump-icon">${icon('barcode')}</div>
                <div>
                    <div class="res-label">${safeT('label.shop.pricePerUnit')}</div>
                    <h2><span id="res-shop-unit-val">0</span> <small id="res-shop-unit-label">RSD/kg</small></h2>
                </div>
            </div>
            <div class="res-actions">
                <button class="copy-btn" onclick="copyResult('res-shop-unit-val', 'res-shop-unit-label', event)">${safeT('result.copy')}</button>
                <button class="copy-btn" data-category="KUPOVINA" data-label="Cena po jedinici" onclick="saveHistory(this)">${safeT('result.save')}</button>
                <button class="copy-btn" data-category="KUPOVINA" data-label="Cena po jedinici" onclick="shareResult(this)">${safeT('result.share')}</button>
            </div>
        </div>
    `;
}

function calculateShopUnit() {
    const price = num('shop-unit-price');
    const qty = num('shop-unit-qty');
    const unit = el('shop-unit-type') ? el('shop-unit-type').value : 'kg';
    if (!price || !qty) { showToast('Unesi cenu i količinu.', 'error'); return; }
    let basePrice, label;
    if (unit === 'g' || unit === 'ml') {
        basePrice = price / (qty / 1000);
        label = 'RSD/' + (unit === 'g' ? 'kg' : 'L');
    } else {
        basePrice = price / qty;
        label = 'RSD/' + unit;
    }
    const rv = el('res-shop-unit-val');
    const rl = el('res-shop-unit-label');
    if (rv) rv.innerText = money(basePrice);
    if (rl) rl.innerText = label;
    show('shop-unit-result-box');
}

// ============================================================
// SHOPPING — Poređenje  ⭐ NOVO
// ============================================================
function renderShopCompare() {
    return `
        <div class="converter-box">
            <p class="section-desc">Uporedi dva proizvoda po ceni za istu jedinicu mere.</p>
            <div class="compare-group">
                <div class="compare-title">${safeT('label.shop.productA')}</div>
                ${inputField('label.shop.price', 'shop-cmp-price-a', 'RSD', 'placeholder="200"')}
                ${inputField('label.shop.quantity', 'shop-cmp-qty-a', '', 'placeholder="1"')}
                ${selectField('label.shop.unit', 'shop-cmp-unit-a', [
                    { value: 'kg', text: 'kg' }, { value: 'g', text: 'g' },
                    { value: 'L', text: 'L' }, { value: 'ml', text: 'ml' }, { value: 'kom', text: 'kom' }
                ])}
            </div>
            <div class="compare-group">
                <div class="compare-title">${safeT('label.shop.productB')}</div>
                ${inputField('label.shop.price', 'shop-cmp-price-b', 'RSD', 'placeholder="180"')}
                ${inputField('label.shop.quantity', 'shop-cmp-qty-b', '', 'placeholder="0.9"')}
                ${selectField('label.shop.unit', 'shop-cmp-unit-b', [
                    { value: 'kg', text: 'kg' }, { value: 'g', text: 'g' },
                    { value: 'L', text: 'L' }, { value: 'ml', text: 'ml' }, { value: 'kom', text: 'kom' }
                ])}
            </div>
            ${calcButton('btn.calculate', 'calculateShopCompare()')}
        </div>
        <div id="shop-cmp-result-box" class="result-card-green" style="display: none;">
            <div class="res-left">
                <div class="pump-icon">${icon('scale')}</div>
                <div>
                    <div class="res-label">${safeT('label.shop.compareResult')}</div>
                    <h3 id="res-shop-cmp-winner" class="res-text">—</h3>
                </div>
            </div>
            <div class="res-actions">
                <button class="copy-btn" onclick="copyResult('res-shop-cmp-winner', '', event)">${safeT('result.copy')}</button>
                <button class="copy-btn" data-category="KUPOVINA" data-label="Poređenje" onclick="saveHistory(this)">${safeT('result.save')}</button>
                <button class="copy-btn" data-category="KUPOVINA" data-label="Poređenje" onclick="shareResult(this)">${safeT('result.share')}</button>
            </div>
        </div>
        ${statsRow('shop-cmp-stats-row', [
            ['label.shop.priceA', 'stat-shop-cmp-a', '0'],
            ['label.shop.priceB', 'stat-shop-cmp-b', '0'],
            ['label.shop.difference', 'stat-shop-cmp-diff', '0%']
        ])}
    `;
}

function calculateShopCompare() {
    const priceA = num('shop-cmp-price-a'), qtyA = num('shop-cmp-qty-a');
    const unitA = el('shop-cmp-unit-a') ? el('shop-cmp-unit-a').value : 'kg';
    const priceB = num('shop-cmp-price-b'), qtyB = num('shop-cmp-qty-b');
    const unitB = el('shop-cmp-unit-b') ? el('shop-cmp-unit-b').value : 'kg';
    if (!priceA || !qtyA || !priceB || !qtyB) { showToast('Unesi sve vrednosti.', 'error'); return; }
    function toBase(price, qty, unit) {
        if (unit === 'g' || unit === 'ml') return price / (qty / 1000);
        return price / qty;
    }
    const aBase = toBase(priceA, qtyA, unitA);
    const bBase = toBase(priceB, qtyB, unitB);
    const winner = aBase < bBase ? safeT('label.shop.productACheaper')
        : (bBase < aBase ? safeT('label.shop.productBCheaper') : safeT('label.shop.samePrice'));
    const rw = el('res-shop-cmp-winner'); if (rw) rw.innerText = winner;
    const sa = el('stat-shop-cmp-a'); if (sa) sa.innerText = money(aBase);
    const sb = el('stat-shop-cmp-b'); if (sb) sb.innerText = money(bBase);
    const sd = el('stat-shop-cmp-diff'); if (sd) sd.innerText = fmt(Math.abs(aBase - bBase) / Math.max(aBase, bBase) * 100, 1) + '%';
    show('shop-cmp-result-box');
    show('shop-cmp-stats-row');
}

// ============================================================
// SHOPPING — Lista za kupovinu  ⭐ NOVO
// ============================================================
const SHOPPING_LIST_KEY = 'cx_shopping_list';
function loadShoppingList() {
    try {
        const raw = JSON.parse(localStorage.getItem(SHOPPING_LIST_KEY));
        if (Array.isArray(raw)) return raw;
    } catch (e) {}
    return [];
}
function saveShoppingList(list) {
    try { localStorage.setItem(SHOPPING_LIST_KEY, JSON.stringify(list)); } catch (e) {}
}

function renderShopLista() {
    return `
        <div class="converter-box">
            <div class="lista-head">
                <div class="section-desc" style="margin:0;">${safeT('tab.shopping.lista')}</div>
                <button class="lista-clear-btn" onclick="clearShoppingList()">${safeT('btn.clearWholeList')}</button>
            </div>
            <div id="lista-items"></div>
            <div class="input-field">
                <label>${safeT('label.shop.itemName')}</label>
                <div class="input-wrapper">
                    <input type="text" id="lista-name" class="custom-input" placeholder="${safeT('placeholder.itemName')}">
                </div>
            </div>
            <div class="input-field">
                <label>${safeT('label.shop.qtyOptional')}</label>
                <div class="input-wrapper">
                    <input type="text" id="lista-qty" class="custom-input" placeholder="${safeT('placeholder.qty')}">
                </div>
            </div>
            <div class="input-field">
                <label>${safeT('label.shop.estimatedPrice')}</label>
                <div class="input-wrapper">
                    <input type="number" id="lista-price" class="custom-input" placeholder="0" inputmode="decimal">
                    <span class="unit">RSD</span>
                </div>
            </div>
            <button class="calc-btn-main" onclick="addShoppingItem()">${safeT('btn.shop.addItem')}</button>
        </div>
    `;
}

function renderShoppingList() {
    const box = el('lista-items');
    if (!box) return;
    const list = loadShoppingList();
    if (!list.length) {
        box.innerHTML = `<div class="chart-empty"><span class="chart-empty-icon">🛒</span>${safeT('toast.listEmpty')}</div>`;
        return;
    }
    let html = '';
    let total = 0, boughtTotal = 0, boughtCount = 0;
    list.forEach(item => {
        const price = (item.price || 0);
        if (item.bought) { boughtTotal += price; boughtCount++; }
        else total += price;
        html += `
            <div class="lista-item${item.bought ? ' bought' : ''}">
                <button class="lista-check" onclick="toggleShoppingItem('${item.id}')">${item.bought ? '✓' : ''}</button>
                <div class="lista-item-info">
                    <div class="lista-item-name">${escapeHtml(item.name)}</div>
                    ${item.qty ? `<div class="lista-item-qty">${escapeHtml(item.qty)}</div>` : ''}
                </div>
                <div class="lista-item-price">${item.price ? money(item.price) : '—'}</div>
                <button class="lista-item-remove" onclick="removeShoppingItem('${item.id}')">✕</button>
            </div>
        `;
    });
    box.innerHTML = html;
    const wrap = box.parentElement;
    if (wrap) {
        const old = wrap.querySelector('.lista-total');
        if (old) old.remove();
        const totalEl = document.createElement('div');
        totalEl.className = 'lista-total';
        totalEl.innerHTML = `
            <div class="lista-total-left">
                <div class="lista-total-label">${safeT('label.shop.remaining')}</div>
                <div class="lista-total-value">${money(total)} RSD</div>
            </div>
            <div class="lista-total-right">
                <div class="lista-total-label">${safeT('label.shop.bought')} (${boughtCount})</div>
                <div class="lista-total-value">${money(boughtTotal)} RSD</div>
            </div>
        `;
        wrap.appendChild(totalEl);
    }
}

function addShoppingItem() {
    const nameEl = el('lista-name');
    const qtyEl = el('lista-qty');
    const priceEl = el('lista-price');
    if (!nameEl) return;
    const name = nameEl.value.trim();
    if (!name) { showToast(safeT('toast.error.enterItemName'), 'error'); return; }
    const list = loadShoppingList();
    list.push({
        id: 'li_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
        name,
        qty: qtyEl ? qtyEl.value.trim() : '',
        price: priceEl ? (parseNum(priceEl.value) || 0) : 0,
        bought: false,
        date: Date.now()
    });
    saveShoppingList(list);
    if (nameEl) nameEl.value = '';
    if (qtyEl) qtyEl.value = '';
    if (priceEl) priceEl.value = '';
    renderShoppingList();
    showToast(safeT('toast.itemAdded'), 'success', 1500);
}

function toggleShoppingItem(id) {
    const list = loadShoppingList();
    const idx = list.findIndex(i => String(i.id) === String(id));
    if (idx === -1) return;
    list[idx].bought = !list[idx].bought;
    saveShoppingList(list);
    renderShoppingList();
    vibrate(10);
}

function removeShoppingItem(id) {
    let list = loadShoppingList();
    list = list.filter(i => String(i.id) !== String(id));
    saveShoppingList(list);
    renderShoppingList();
}

async function clearShoppingList() {
    const ok = await showConfirm(safeT('confirm.clearList'));
    if (!ok) return;
    saveShoppingList([]);
    renderShoppingList();
    showToast(safeT('toast.listCleared'), 'info', 1500);
}

// ============================================================
// SHOPPING — Isplati se  ⭐ NOVO
// ============================================================
function renderShopIsplati() {
    return `
        <div class="converter-box">
            <p class="section-desc">Da li se isplati ići u daleku prodavnicu zbog niže cene?</p>
            ${inputField('label.shop.savingsPerItem', 'isplati-savings', 'RSD', 'placeholder="50"')}
            ${inputField('label.shop.itemsCount', 'isplati-count', '', 'placeholder="10"')}
            ${inputField('label.shop.oneWayDistance', 'isplati-distance', 'km', 'step="0.1" placeholder="5"')}
            ${inputField('label.shop.carConsumption', 'isplati-consumption', 'L/100km', 'step="0.1" value="7"')}
            ${inputField('label.shop.fuelPrice', 'isplati-fuel-price', 'RSD', 'step="0.1" value="180"')}
            ${calcButton('btn.calculate', 'calculateShopIsplati()')}
        </div>
        <div id="isplati-result-box" class="result-card-green" style="display: none;">
            <div class="res-left">
                <div class="pump-icon">${icon('target')}</div>
                <div>
                    <div class="res-label">${safeT('label.shop.worthIt')}</div>
                    <h3 id="res-isplati-text" class="res-text">—</h3>
                </div>
            </div>
            <div class="res-actions">
                <button class="copy-btn" onclick="copyResult('res-isplati-text', '', event)">${safeT('result.copy')}</button>
                <button class="copy-btn" data-category="KUPOVINA" data-label="Isplati se" onclick="saveHistory(this)">${safeT('result.save')}</button>
                <button class="copy-btn" data-category="KUPOVINA" data-label="Isplati se" onclick="shareResult(this)">${safeT('result.share')}</button>
            </div>
        </div>
        ${statsRow('isplati-stats-row', [
            ['label.shop.savings', 'stat-isplati-savings', '0 RSD'],
            ['label.shop.tripCost', 'stat-isplati-trip', '0 RSD'],
            ['label.shop.net', 'stat-isplati-net', '0 RSD']
        ])}
    `;
}

function calculateShopIsplati() {
    const savings = num('isplati-savings');
    const count = num('isplati-count') || 1;
    const distance = num('isplati-distance');
    const consumption = num('isplati-consumption') || 7;
    const fuelPrice = num('isplati-fuel-price') || 180;
    if (!savings || !distance) { showToast('Unesi uštedu i distancu.', 'error'); return; }
    const totalSavings = savings * count;
    const liters = (distance * 2 / 100) * consumption;
    const tripCost = liters * fuelPrice;
    const net = totalSavings - tripCost;
    const rt = el('res-isplati-text');
    if (net > 0) {
        if (rt) rt.innerText = safeT('label.shop.worthItYes', fmt(net, 0));
    } else if (net < 0) {
        if (rt) rt.innerText = safeT('label.shop.worthItNo', fmt(-net, 0));
    } else {
        if (rt) rt.innerText = safeT('label.shop.worthItSame');
    }
    const ss = el('stat-isplati-savings'); if (ss) ss.innerText = money(totalSavings) + ' RSD';
    const st = el('stat-isplati-trip'); if (st) st.innerText = money(tripCost) + ' RSD';
    const sn = el('stat-isplati-net'); if (sn) sn.innerText = money(net) + ' RSD';
    show('isplati-result-box');
    show('isplati-stats-row');
}

// ============================================================
// SHOPPING — Cena po obroku  ⭐ NOVO
// ============================================================
function renderShopRasipanje() {
    return `
        <div class="converter-box">
            <p class="section-desc">${safeT('label.shop.costPerMeal')}.</p>
            ${inputField('label.shop.groceryPrice', 'rasipanje-price', 'RSD', 'placeholder="2000"')}
            ${inputField('label.shop.mealsCount', 'rasipanje-meals', '', 'placeholder="6"')}
            ${inputField('label.shop.wastePercent', 'rasipanje-waste', '%', 'placeholder="10"')}
            ${calcButton('btn.calculate', 'calculateShopRasipanje()')}
        </div>
        <div id="rasipanje-result-box" class="result-card-green" style="display: none;">
            <div class="res-left">
                <div class="pump-icon">${icon('packageSm')}</div>
                <div>
                    <div class="res-label">${safeT('label.shop.costPerMeal')}</div>
                    <h2><span id="res-rasipanje-val">0</span> <small>RSD</small></h2>
                </div>
            </div>
            <div class="res-actions">
                <button class="copy-btn" onclick="copyResult('res-rasipanje-val', 'RSD', event)">${safeT('result.copy')}</button>
                <button class="copy-btn" data-category="KUPOVINA" data-label="Cena po obroku" onclick="saveHistory(this)">${safeT('result.save')}</button>
                <button class="copy-btn" data-category="KUPOVINA" data-label="Cena po obroku" onclick="shareResult(this)">${safeT('result.share')}</button>
            </div>
        </div>
        ${statsRow('rasipanje-stats-row', [
            ['label.shop.withoutWaste', 'stat-rasipanje-without', '0 RSD'],
            ['label.shop.wasteCost', 'stat-rasipanje-waste', '0 RSD']
        ])}
    `;
}

function calculateShopRasipanje() {
    const price = num('rasipanje-price');
    const meals = num('rasipanje-meals');
    const waste = num('rasipanje-waste') || 0;
    if (!price || !meals) { showToast('Unesi cenu i broj obroka.', 'error'); return; }
    const perMeal = price / meals;
    const perMealWithWaste = price / (meals * (1 - waste / 100));
    const wasteCost = (perMealWithWaste - perMeal) * meals;
    const rv = el('res-rasipanje-val'); if (rv) rv.innerText = money(perMealWithWaste);
    const sw = el('stat-rasipanje-without'); if (sw) sw.innerText = money(perMeal) + ' RSD';
    const sww = el('stat-rasipanje-waste'); if (sww) sww.innerText = money(wasteCost) + ' RSD';
    show('rasipanje-result-box');
    show('rasipanje-stats-row');
}

// ============================================================
// SHOPPING — Dnevni budžet  ⭐ NOVO
// ============================================================
function renderShopBudzet() {
    return `
        <div class="converter-box">
            <p class="section-desc">${safeT('label.shop.dailyLimit')}</p>
            ${inputField('label.shop.totalBudget', 'budzet-total', 'RSD', 'placeholder="30000"')}
            ${selectField('label.shop.period', 'budzet-period', [
                { value: '7', text: safeT('option.shop.week') },
                { value: '14', text: safeT('option.shop.twoWeeks') },
                { value: '30', text: safeT('option.shop.month') }
            ])}
            ${inputField('label.shop.alreadySpent', 'budzet-spent', 'RSD', 'placeholder="0"')}
            ${calcButton('btn.calculate', 'calculateShopBudzet()')}
        </div>
        ${resultCard('budzet-result-box', 'calendarSm', 'label.shop.dailyLimit', 'res-budzet-daily', 'RSD', 'KUPOVINA', 'label.shop.budgetShort')}
        ${statsRow('budzet-stats-row', [
            ['label.shop.untilEndOfPeriod', 'stat-budzet-left', '0 RSD'],
            ['label.shop.daysCount', 'stat-budzet-days', '0'],
            ['label.shop.dailyUntilEnd', 'stat-budzet-recalc', '0 RSD']
        ])}
    `;
}

function calculateShopBudzet() {
    const total = num('budzet-total');
    const period = el('budzet-period') ? parseInt(el('budzet-period').value) : 30;
    const spent = num('budzet-spent') || 0;
    if (!total || total <= 0) { showToast('Unesi budžet.', 'error'); return; }
    const daily = total / period;
    const left = Math.max(0, total - spent);
    const daysLeft = Math.max(1, period - Math.floor(spent / daily));
    const rd = el('res-budzet-daily'); if (rd) rd.innerText = money(daily);
    const sl = el('stat-budzet-left'); if (sl) sl.innerText = money(left) + ' RSD';
    const sd = el('stat-budzet-days'); if (sd) sd.innerText = period;
    const sr = el('stat-budzet-recalc'); if (sr) sr.innerText = money(left / daysLeft) + ' RSD';
    show('budzet-result-box');
    show('budzet-stats-row');
}
// ============================================================
// PODSETNICI — Storage helperi
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
// PARSE DATE — kratka verzija (ako već nije definisana)
// ============================================================
if (typeof window.parseDate !== 'function') {
    window.parseDate = function(value) {
        if (!value) return null;
        const parts = value.split('-').map(Number);
        if (parts.length !== 3) return null;
        return new Date(parts[0], parts[1] - 1, parts[2]);
    };
}
