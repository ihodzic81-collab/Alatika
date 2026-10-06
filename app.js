// ============================================================
// ALATIKA 2.0 — app.js
// Deo 1/5: Pomoćne, ICONS, SECTIONS, init, toolbar logika
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
    board: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 3v18"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    building: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>',
    paint: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>',
    tiles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>',
    layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></svg>',
    flask: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6"/><path d="M10 9h4"/><path d="M11 3v6l-5 9a2 2 0 0 0 1.7 3h8.6a2 2 0 0 0 1.7-3l-5-9V3"/></svg>',
    wall: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="18" x="2" y="3" rx="2"/><path d="M2 9h20"/><path d="M2 15h20"/><path d="M8 3v6"/><path d="M16 9v6"/><path d="M8 15v6"/></svg>',
    droplet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>',
    plug: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/></svg>',
    door: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 4h3a2 2 0 0 1 2 2v14"/><path d="M2 20h3"/><path d="M13 20h9"/><path d="M10 12v.01"/><path d="M13 4.562v16.157a1 1 0 0 1-1.242.97L5 20V5.562a2 2 0 0 1 1.515-1.94l4-1A2 2 0 0 1 13 4.562Z"/></svg>',
    plug2: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/></svg>',
    battery: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="10" x="2" y="7" rx="2"/><line x1="22" x2="22" y1="11" y2="13"/></svg>',
    trending: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>',
    cable: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1h-1"/><path d="M3 21v-2a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H6"/><path d="M8 7V3"/><path d="M16 7V3"/><path d="M8 7h8"/><path d="M8 7v5a4 4 0 0 0 8 0V7"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>',
    lightbulb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>',
    thermometer2: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/></svg>',
    flashlight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6c0 2-2 2-2 4v10a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V10c0-2-2-2-2-4V2h12z"/><line x1="6" x2="18" y1="6" y2="6"/><line x1="12" x2="12" y1="12" y2="12"/></svg>',
    timer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/></svg>',
    dollarSign: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    banknote: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>',
    clipboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>',
    gift: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/></svg>',
    spoon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s-2-3-2-8 2-12 2-12 2 7 2 12-2 8-2 8z"/></svg>',
    glassWater: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15.2 22H8.8a2 2 0 0 1-2-1.79l-1.78-14A2 2 0 0 1 7 4h10a2 2 0 0 1 1.98 2.21l-1.79 14A2 2 0 0 1 15.2 22Z"/><path d="M6 10h12"/></svg>',
    utensils: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>',
    coffee: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/><path d="M6 2v2"/></svg>',
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
    piano: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M6 5v14"/><path d="M10 5v14"/><path d="M14 5v14"/><path d="M18 5v14"/></svg>',
    sliders: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="4" y1="21" y2="14"/><line x1="4" x2="4" y1="10" y2="3"/><line x1="12" x2="12" y1="21" y2="12"/><line x1="12" x2="12" y1="8" y2="3"/><line x1="20" x2="20" y1="21" y2="16"/><line x1="20" x2="20" y1="12" y2="3"/><line x1="2" x2="6" y1="14" y2="14"/><line x1="10" x2="14" y1="8" y2="8"/><line x1="18" x2="22" y1="16" y2="16"/></svg>',
    drum: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="8" rx="10" ry="3"/><path d="M2 8v8c0 1.66 4.48 3 10 3s10-1.34 10-3V8"/><path d="M6 11.5v3"/><path d="M10 12v3"/><path d="M14 12v3"/><path d="M18 11.5v3"/></svg>',
    waves: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>',
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
    bellRing: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/><path d="M4 2C2.8 3.7 2 5.7 2 8"/><path d="M22 8c0-2.3-.8-4.3-2-6"/></svg>',
    satellite: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m13.5 6.5 4 4"/><path d="m16 3.5 4.5 4.5"/><path d="M9.5 10.5 13 14"/><path d="M6.5 13.5 3 17l4 4 3.5-3.5"/><path d="M13.5 6.5 17 3l4 4-3.5 3.5"/><path d="m9.5 10.5-3.5 3.5"/><path d="M17.5 17.5 21 14l-4-4"/><path d="m13 11 4 4"/></svg>',
    compass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>',
    stopwatch: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M9 2h6"/><path d="M12 2v3"/><path d="m19 5-1.5 1.5"/><path d="m5 5 1.5 1.5"/></svg>',
    mountain: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>',
    flag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>',
    rotateCcw: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',
    volume2: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>',
    // NOVI (Alatika 2.0)
    save: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>',
    save2: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/></svg>',
    graduation: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>',
    bookOpen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
    clipboardCheck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>',
    footPrints: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z"/><path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z"/><path d="M16 17h4"/><path d="M4 13h4"/></svg>',
    smartwatch: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="5" y="5" rx="2"/><path d="M12 9v3l1 1"/><path d="M16 5V3a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v2"/><path d="M8 19v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2"/></svg>',
    water: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>',
    bed: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>',
    recipe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>',
    piggyBank: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2h0V5z"/><path d="M2 9v1c0 1.1.9 2 2 2h1"/><path d="M16 11h.01"/></svg>',
    qrCode: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg>',
    pencil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>',
    sunDim: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 4h.01"/><path d="M20 12h.01"/><path d="M12 20h.01"/><path d="M4 12h.01"/><path d="M17.657 6.343h.01"/><path d="M17.657 17.657h.01"/><path d="M6.343 17.657h.01"/><path d="M6.343 6.343h.01"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    foot: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z"/><path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z"/></svg>',
    shirt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>',
    binary: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="14" y="14" width="4" height="6" rx="2"/><rect x="6" y="4" width="4" height="6" rx="2"/><path d="M6 20h4"/><path d="M14 10h4"/><path d="M6 14h2v6"/><path d="M14 4h2v6"/></svg>',
    calendarClock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M12 14v4"/><path d="M14 15l-2 1"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
    sparkles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>',
    leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>',
    sunrise2: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v6"/><path d="m4.22 10.22 1.42 1.42"/><path d="M1 18h2"/><path d="M21 18h2"/><path d="m18.36 11.64 1.42-1.42"/><path d="M23 22H1"/><path d="m8 6 4-4 4 4"/><path d="M16 18a4 4 0 0 0-8 0"/></svg>',
    ruler2: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.3 8.7 15.3 2.7a1 1 0 0 0-1.4 0L2.7 13.9a1 1 0 0 0 0 1.4l6 6a1 1 0 0 0 1.4 0L21.3 10a1 1 0 0 0 0-1.4Z"/><path d="m7.5 10.5 2 2"/><path d="m10.5 7.5 2 2"/><path d="m13.5 4.5 2 2"/><path d="m4.5 13.5 2 2"/></svg>',
    hash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>'
};

function icon(name) {
    return ICONS[name] || ICONS.info;
}

// ================= SECTIONS (10 sekcija) =================
const SECTIONS = {
    konverzije: {
        name: 'Konverzije',
        icon: 'exchange',
        accent: '#8b5cf6',
        cats: ['measures', 'time']  // existing cats + new konverzije tabs
    },
    novac: {
        name: 'Novac',
        icon: 'wallet',
        accent: '#10b981',
        cats: ['money']
    },
    kupovina: {
        name: 'Kupovina',
        icon: 'cart',
        accent: '#14b8a6',
        cats: ['shopping']
    },
    dom: {
        name: 'Dom',
        icon: 'home',
        accent: '#ea580c',
        cats: ['homecalc']
    },
    vozila: {
        name: 'Vozila',
        icon: 'car',
        accent: '#f43f5e',
        cats: ['auto', 'bike']
    },
    struja: {
        name: 'Struja',
        icon: 'zap',
        accent: '#eab308',
        cats: ['power']
    },
    vreme: {
        name: 'Vreme i datumi',
        icon: 'clock',
        accent: '#f59e0b',
        cats: ['weather']
    },
    podsetnici: {
        name: 'Podsetnici',
        icon: 'bell',
        accent: '#f59e0b',
        cats: ['podsetnici']
    },
    zdravlje: {
        name: 'Zdravlje',
        icon: 'heartPulse',
        accent: '#ec4899',
        cats: ['health']
    },
    hobi: {
        name: 'Hobi',
        icon: 'music',
        accent: '#a855f7',
        cats: ['music', 'kitchen', 'work', 'gps']
    }
};

// ================= CATEGORIES =================
// (Postojeće kategorije zadržane + nove dodate)
const CATEGORIES = {
    podsetnici: {
        name: 'Podsetnici',
        icon: 'bell',
        accent: '#f59e0b',
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
            { id: 'vazduh', name: 'Vazduh', icon: 'wind', render: renderWeatherVazduh },
            { id: 'pametni', name: 'Pametni dan', icon: 'sunrise', render: renderWeatherPametni },
            { id: 'sunce', name: 'Sunce i mesec', icon: 'moon', render: renderWeatherSunce }
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
            { id: 'valuta', name: 'Kursna lista', icon: 'exchange', render: renderMoneyValuta }
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
            { id: 'planer', name: 'Planer puta', icon: 'route', render: renderAutoPlaner },
            { id: 'trosakputa', name: 'Trošak puta', icon: 'coins', render: renderAutoTrosakPuta },
            { id: 'servis', name: 'Servis', icon: 'wrench', render: renderAutoServis },
            { id: 'istorijatocenja', name: 'Istorija točenja', icon: 'trending', render: renderFuelHistory },
            { id: 'profil', name: 'Profil vozila', icon: 'car', render: renderVehicleProfile },
            { id: 'godisnji', name: 'Godišnji trošak', icon: 'calendar', render: renderAutoGodisnji },
            { id: 'pokm', name: 'Po kilometru', icon: 'calculator', render: renderAutoPoKm }
        ]
    },
    bike: {
        name: 'Bicikl', icon: 'bike', accent: '#06b6d4',
        tabs: [
            { id: 'brzina', name: 'Brzina', icon: 'gauge', render: renderBikeBrzina },
            { id: 'pritisak', name: 'Pritisak guma', icon: 'wind', render: renderBikePritisak },
            { id: 'rama', name: 'Veličina rama', icon: 'ruler', render: renderBikeRama },
            { id: 'kalorije', name: 'Kalorije', icon: 'flame', render: renderBikeKalorije },
            { id: 'tabela', name: 'Tabela prenosa', icon: 'settings', render: renderBikeTabela }
        ]
    },
    health: {
        name: 'Zdravlje', icon: 'heartPulse', accent: '#ec4899',
        tabs: [
            { id: 'bmi', name: 'Telesne mere (BMI)', icon: 'scale', render: renderHealthBMI },
            { id: 'kalorije', name: 'Kalorije (BMR)', icon: 'flame', render: renderHealthBMR },
            { id: 'puls', name: 'Puls', icon: 'heartPulse', render: renderHealthPuls },
            { id: 'kardio', name: 'Kardio', icon: 'run', render: renderHealthTrcanje },
            { id: 'snaga', name: 'Snaga', icon: 'dumbbell', render: renderHealth1RM },
            { id: 'dnevnikTreninga', name: 'Dnevnik treninga', icon: 'clipboard', render: renderWorkoutJournal },
            { id: 'koraci', name: 'Koraci', icon: 'footPrints', render: renderPedometer },
            { id: 'vodaSan', name: 'Voda i san', icon: 'droplet', render: renderWaterSleep }
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
            { id: 'skica', name: 'Skica prostorije', icon: 'pencil', render: renderSketch },
            { id: 'blokovi', name: 'Zidanje (blokovi + malter)', icon: 'bricks', render: renderHomeBlokovi },
            { id: 'crep', name: 'Krov (crep + izolacija)', icon: 'home', render: renderHomeCrep },
            { id: 'beton', name: 'Beton i temelj', icon: 'building', render: renderHomeBeton },
            { id: 'farbanje', name: 'Farbanje', icon: 'paint', render: renderHomeFarbanje },
            { id: 'plocice', name: 'Podovi (pločice + laminat)', icon: 'tiles', render: renderHomePlocice },
            { id: 'gips', name: 'Plafon (gips + table)', icon: 'wall', render: renderHomeGips },
            { id: 'troskovnik', name: 'Troškovnik', icon: 'receipt', render: renderCostEstimate }
        ]
    },
    kitchen: {
        name: 'Kuhinja', icon: 'chef', accent: '#84cc16',
        tabs: [
            { id: 'kasike', name: 'Kašike', icon: 'spoon', render: renderKitchenKasike },
            { id: 'case', name: 'Čaše', icon: 'glassWater', render: renderKitchenCase },
            { id: 'pecenje', name: 'Pečenje', icon: 'oven', render: renderKitchenPecenje },
            { id: 'porcije', name: 'Porcije', icon: 'utensils', render: renderKitchenPorcije },
            { id: 'recepti', name: 'Recepti', icon: 'recipe', render: renderRecipes }
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
            { id: 'prekovremeno', name: 'Prekovremeno', icon: 'activity', render: renderWorkPrekovremeno },
            { id: 'putni', name: 'Putni troškovi', icon: 'car', render: renderWorkPutni },
            { id: 'bonusi', name: 'Bonusi', icon: 'gift', render: renderWorkBonusi }
        ]
    },
    music: {
        name: 'Muzika', icon: 'music', accent: '#a855f7',
        tabs: [
            { id: 'stimer', name: 'Štimer', icon: 'guitar', render: renderMusicStimer },
            { id: 'teorija', name: 'Teorija muzike', icon: 'piano', render: renderMusicLestvice },
            { id: 'transponovanje', name: 'Transponovanje', icon: 'musicNote', render: renderMusicTranspozicija },
            { id: 'ritam', name: 'Ritam', icon: 'drum', render: renderMusicMetronom }
        ]
    },
    // NOVE kategorije za nove alate
    navike: {
        name: 'Navike',
        icon: 'sparkles',
        accent: '#10b981',
        tabs: [
            { id: 'habits', name: 'Habit tracker', icon: 'check', render: renderHabitTracker },
            { id: 'dnevnik', name: 'Dnevnik', icon: 'book', render: renderJournal }
        ]
    }
};

// Globalna lista svih kategorija koje se prikazuju na home (preko SECTIONS.cats)
const ALL_CATEGORY_IDS = Object.keys(CATEGORIES);// ============================================================
// ALATIKA 2.0 — app.js
// Deo 2/5: Toolbar, Bottom nav, Danas, Profil, Pretraga, Lanci
// ============================================================

// ================= LAMPA (TORCH) =================
const TORCH_AUTO_OFF_KEY = 'cx_torch_auto_off_v1';
const TORCH_AUTO_OFF_MS = 5 * 60 * 1000;

const torchState = {
    stream: null,
    track: null,
    active: false,
    sosActive: false,
    sosIntervalId: null,
    autoOffTimerId: null,
    supported: null
};

async function torchIsSupported() {
    if (torchState.supported !== null) return torchState.supported;
    try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            torchState.supported = false;
            return false;
        }
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        const track = stream.getVideoTracks()[0];
        const caps = track.getCapabilities ? track.getCapabilities() : {};
        const hasTorch = !!(caps && caps.torch);
        track.stop();
        stream.getTracks().forEach(t => t.stop());
        torchState.supported = hasTorch;
        return hasTorch;
    } catch (e) {
        torchState.supported = false;
        return false;
    }
}

async function torchOn() {
    if (torchState.active) return true;
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        const track = stream.getVideoTracks()[0];
        const caps = track.getCapabilities ? track.getCapabilities() : {};
        if (!caps || !caps.torch) {
            track.stop();
            stream.getTracks().forEach(t => t.stop());
            showToast(safeT('toolbar.torch.unsupported'), 'error', 2500);
            return false;
        }
        await track.applyConstraints({ advanced: [{ torch: true }] });
        torchState.stream = stream;
        torchState.track = track;
        torchState.active = true;
        updateTorchButtonUI();
        vibrate(30);
        playTick(0, 1800, 0.10, 0.04);
        if (isTorchAutoOffEnabled()) {
            clearTimeout(torchState.autoOffTimerId);
            torchState.autoOffTimerId = setTimeout(() => {
                if (torchState.active && !torchState.sosActive) {
                    torchOff();
                    showToast(safeT('toolbar.torch.autoOff'), 'info', 2000);
                }
            }, TORCH_AUTO_OFF_MS);
        }
        return true;
    } catch (e) {
        console.warn('Torch ON error:', e);
        showToast(safeT('toolbar.torch.error'), 'error', 2500);
        return false;
    }
}

function torchOff() {
    try {
        if (torchState.track) {
            try { torchState.track.applyConstraints({ advanced: [{ torch: false }] }); } catch (e) {}
            torchState.track.stop();
        }
        if (torchState.stream) torchState.stream.getTracks().forEach(t => t.stop());
    } catch (e) {}
    torchState.stream = null;
    torchState.track = null;
    torchState.active = false;
    clearTimeout(torchState.autoOffTimerId);
    torchState.autoOffTimerId = null;
    updateTorchButtonUI();
    vibrate(15);
    playTick(0, 1400, 0.06, 0.02);
}

async function toggleTorch() {
    if (torchState.sosActive) { torchStopSOS(); return; }
    if (torchState.active) torchOff();
    else await torchOn();
}

function torchStartSOS() {
    if (!torchState.active) {
        showToast(safeT('toolbar.torch.sosNeedOn'), 'warning', 2000);
        return;
    }
    torchState.sosActive = true;
    const pattern = [200,200,200,200,200,200, 600,200,600,200,600,200, 200,200,200,200,200,200, 1500];
    let idx = 0;
    let isOn = false;
    const tick = () => {
        if (!torchState.sosActive) return;
        const duration = pattern[idx];
        isOn = !isOn;
        if (torchState.track) {
            try { torchState.track.applyConstraints({ advanced: [{ torch: isOn }] }); } catch (e) {}
        }
        idx++;
        if (idx >= pattern.length) idx = 0;
        torchState.sosIntervalId = setTimeout(tick, duration);
    };
    torchState.sosIntervalId = setTimeout(tick, 100);
    updateTorchButtonUI();
    showToast(safeT('toolbar.torch.sosOn'), 'warning', 2000);
    vibrate([100, 50, 100, 50, 100]);
}

function torchStopSOS() {
    if (!torchState.sosActive) return;
    torchState.sosActive = false;
    clearTimeout(torchState.sosIntervalId);
    torchState.sosIntervalId = null;
    if (torchState.track) {
        try { torchState.track.applyConstraints({ advanced: [{ torch: true }] }); } catch (e) {}
    }
    updateTorchButtonUI();
    vibrate(20);
    showToast(safeT('toolbar.torch.sosOff'), 'info', 1500);
}

function isTorchAutoOffEnabled() {
    try {
        const v = localStorage.getItem(TORCH_AUTO_OFF_KEY);
        if (v === null) return true;
        return v === '1';
    } catch (e) { return true; }
}

function setTorchAutoOff(enabled) {
    try { localStorage.setItem(TORCH_AUTO_OFF_KEY, enabled ? '1' : '0'); } catch (e) {}
    const btn = el('torch-autooff-btn');
    if (btn) btn.textContent = enabled ? safeT('toolbar.torch.autoOff.on') : safeT('toolbar.torch.autoOff.off');
}

function updateTorchButtonUI() {
    const btn = el('toolbar-torch-btn');
    if (!btn) return;
    btn.classList.toggle('active', torchState.active);
    btn.classList.toggle('sos', torchState.sosActive);
}

function openTorchOptions() {
    const modal = el('torch-modal');
    if (!modal) return;
    const title = el('torch-modal-title');
    if (title) title.textContent = safeT('toolbar.torch.title');
    const sosBtn = el('torch-sos-btn');
    if (sosBtn) {
        sosBtn.textContent = torchState.sosActive ? safeT('toolbar.torch.sos.stop') : safeT('toolbar.torch.sos.start');
        sosBtn.classList.toggle('active', torchState.sosActive);
    }
    const autoOffBtn = el('torch-autooff-btn');
    if (autoOffBtn) {
        autoOffBtn.textContent = isTorchAutoOffEnabled() ? safeT('toolbar.torch.autoOff.on') : safeT('toolbar.torch.autoOff.off');
    }
    modal.classList.add('show');
    document.body.classList.add('modal-open');
    vibrate(15);
    playTick(0, 1400, 0.06, 0.02);
}

// ================= NIVO (LIBELA) =================
const levelState = {
    listening: false,
    beta: 0,
    gamma: 0,
    offsetBeta: 0,
    offsetGamma: 0,
    lastVibrate: 0,
    supported: null
};

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
            vibrate(20);
        }
    }
}

function levelUpdateDisplay() {
    const betaEl = el('level-beta-val');
    const gammaEl = el('level-gamma-val');
    const bubbleEl = el('level-bubble');
    const statusEl = el('level-status');
    if (!betaEl || !gammaEl) return;
    betaEl.textContent = levelState.beta.toFixed(1) + '°';
    gammaEl.textContent = levelState.gamma.toFixed(1) + '°';
    const isLevel = Math.abs(levelState.beta) < 1.5 && Math.abs(levelState.gamma) < 1.5;
    if (bubbleEl) {
        const maxOffset = 40;
        const x = Math.max(-maxOffset, Math.min(maxOffset, -levelState.gamma * 2));
        const y = Math.max(-maxOffset, Math.min(maxOffset, levelState.beta * 2));
        bubbleEl.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
        bubbleEl.classList.toggle('level-ok', isLevel);
    }
    if (statusEl) {
        statusEl.textContent = isLevel ? safeT('toolbar.level.isLevel') : safeT('toolbar.level.notLevel');
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
    modal.classList.add('show');
    document.body.classList.add('modal-open');
    vibrate(15);
    playTick(0, 1400, 0.06, 0.02);
    if (!levelState.listening) levelStart();
}

function toggleLevel() {
    if (levelState.listening) levelStop();
    else levelStart();
    const toggleBtn = el('level-toggle-btn');
    if (toggleBtn) toggleBtn.textContent = levelState.listening ? safeT('toolbar.level.stop') : safeT('toolbar.level.start');
}

// ================= ŠTOPERICA (TOOLBAR) =================
const toolbarStopwatchState = {
    running: false,
    startTime: 0,
    elapsedMs: 0,
    rafId: null
};

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
        toolbarTick();
        vibrate(20);
        playTick(0, 1500, 0.08, 0.03);
    }
    const btn = el('toolbar-stopwatch-btn');
    if (btn) btn.classList.toggle('active', toolbarStopwatchState.running);
}

function toolbarTick() {
    if (!toolbarStopwatchState.running) return;
    const now = performance.now() - toolbarStopwatchState.startTime;
    const timeEl = el('toolbar-stopwatch-time');
    if (timeEl) timeEl.textContent = formatStopwatchTime(now);
    toolbarStopwatchState.rafId = requestAnimationFrame(toolbarTick);
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

function toolbarStopwatchReset() {
    if (toolbarStopwatchState.running) return;
    toolbarStopwatchState.elapsedMs = 0;
    const timeEl = el('toolbar-stopwatch-time');
    if (timeEl) timeEl.textContent = formatStopwatchTime(0);
    vibrate(15);
    playTick(0, 1400, 0.06, 0.02);
}

function openToolbarStopwatch() {
    const modal = el('toolbar-stopwatch-modal');
    if (!modal) return;
    modal.classList.add('show');
    document.body.classList.add('modal-open');
    const timeEl = el('toolbar-stopwatch-time');
    if (timeEl) timeEl.textContent = formatStopwatchTime(toolbarStopwatchState.elapsedMs);
    const btn = el('toolbar-stopwatch-btn');
    if (btn) btn.classList.toggle('active', toolbarStopwatchState.running);
    vibrate(15);
}

// ================= TAJMER (TOOLBAR) =================
const toolbarTimerState = {
    running: false,
    paused: false,
    totalMs: 0,
    remainingMs: 0,
    endTime: 0,
    intervalId: null,
    alarming: false,
    alarmIntervalId: null
};

function toolbarTimerPreset(seconds) {
    if (toolbarTimerState.running) {
        showToast(safeT('toolbar.timer.stopFirst'), 'warning', 1500);
        return;
    }
    toolbarTimerState.totalMs = seconds * 1000;
    toolbarTimerState.remainingMs = seconds * 1000;
    toolbarTimerUpdateDisplay();
    toolbarTimerUpdateUI();
    vibrate(10);
    playTick(0, 1300, 0.05, 0.015);
}

function toolbarTimerStart() {
    if (toolbarTimerState.running && !toolbarTimerState.paused) return;
    const ms = toolbarTimerState.remainingMs || toolbarTimerState.totalMs;
    if (ms <= 0) {
        showToast(safeT('toolbar.timer.enterTime'), 'warning');
        return;
    }
    toolbarTimerState.running = true;
    toolbarTimerState.paused = false;
    toolbarTimerState.endTime = performance.now() + ms;
    toolbarTimerUpdateUI();
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
    toolbarTimerUpdateUI();
    vibrate(15);
}

function toolbarTimerResume() {
    if (!toolbarTimerState.running || !toolbarTimerState.paused) return;
    toolbarTimerState.paused = false;
    toolbarTimerState.endTime = performance.now() + toolbarTimerState.remainingMs;
    toolbarTimerUpdateUI();
    toolbarTimerTick();
    toolbarTimerState.intervalId = setInterval(toolbarTimerTick, 200);
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
    toolbarTimerState.remainingMs = 0;
    toolbarTimerUpdateDisplay();
    toolbarTimerUpdateUI();
    toolbarTimerStartAlarm();
}

function toolbarTimerStartAlarm() {
    toolbarTimerState.alarming = true;
    showToast(safeT('toolbar.timer.timeUp'), 'success', 4000);
    let count = 0;
    const beep = () => {
        if (!toolbarTimerState.alarming) return;
        if (count >= 10) { toolbarTimerStopAlarm(); return; }
        count++;
        playAlarmBeep();
        vibrate([300, 100, 300, 100, 300]);
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
    toolbarTimerUpdateUI();
    vibrate(20);
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
    toolbarTimerUpdateDisplay();
    toolbarTimerUpdateUI();
    vibrate(15);
    playTick(0, 1400, 0.06, 0.02);
}

function toolbarTimerUpdateDisplay() {
    const timeEl = el('toolbar-timer-time');
    const progressEl = el('toolbar-timer-progress');
    if (!timeEl) return;
    const ms = toolbarTimerState.remainingMs || toolbarTimerState.totalMs;
    const sec = Math.ceil(ms / 1000);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    timeEl.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    if (progressEl) {
        const total = toolbarTimerState.totalMs || 1;
        const pct = Math.max(0, Math.min(100, (ms / total) * 100));
        progressEl.style.width = pct + '%';
    }
}

function toolbarTimerUpdateUI() {
    const btn = el('toolbar-timer-btn');
    if (btn) btn.classList.toggle('active', toolbarTimerState.running && !toolbarTimerState.paused);
    const labelEl = el('toolbar-timer-status');
    if (labelEl) {
        if (toolbarTimerState.alarming) labelEl.textContent = safeT('toolbar.timer.alarming');
        else if (toolbarTimerState.running && toolbarTimerState.paused) labelEl.textContent = safeT('toolbar.timer.paused');
        else if (toolbarTimerState.running) labelEl.textContent = safeT('toolbar.timer.running');
        else labelEl.textContent = safeT('toolbar.timer.ready');
    }
}

function openToolbarTimer() {
    const modal = el('toolbar-timer-modal');
    if (!modal) return;
    modal.classList.add('show');
    document.body.classList.add('modal-open');
    toolbarTimerUpdateDisplay();
    toolbarTimerUpdateUI();
    vibrate(15);
}

// ================= BOTTOM NAVIGATION =================
let currentScreenId = 'home-screen';

function switchBottomNav(screenId) {
    if (currentScreenId === screenId) return;
    // Update active state na dugmadima
    document.querySelectorAll('.bottom-nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.screen === screenId);
    });
    // Otvori ekran
    openScreen(screenId);
    vibrate(10);
    playTick(0, 1300, 0.05, 0.015);
}

function updateBottomNavUI() {
    document.querySelectorAll('.bottom-nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.screen === currentScreenId);
    });
}

// ================= NAVIGACIJA — EKRANI =================
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
            try { renderAllTools(); } catch (e) {}
            try { renderSections(); } catch (e) {}
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

// ================= DANAS DASHBOARD =================
function renderTodayDashboard() {
    const content = el('today-content');
    const greeting = el('today-greeting');
    if (!content) return;

    // Greeting po dobu dana
    const hour = new Date().getHours();
    let greetKey = 'today.greeting.morning';
    if (hour >= 12 && hour < 18) greetKey = 'today.greeting.afternoon';
    else if (hour >= 18 && hour < 23) greetKey = 'today.greeting.evening';
    else if (hour >= 23 || hour < 5) greetKey = 'today.greeting.night';

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

    // 1. Hitni podsetnici
    html += renderTodayUrgent();

    // 2. Vreme
    html += renderTodayWeather();

    // 3. UV indeks
    html += renderTodayUV();

    // 4. Savet dana
    html += renderTodayTip();

    content.innerHTML = html;
}

function refreshTodayDashboard() {
    renderTodayDashboard();
    vibrate(15);
    playTick(0, 1400, 0.06, 0.02);
}

function renderTodayUrgent() {
    try {
        if (typeof getAllReminderItems !== 'function') return '';
        const allItems = getAllReminderItems();
        const now = new Date(); now.setHours(0, 0, 0, 0);
        const nowMs = now.getTime();
        const dayMs = 86400000;

        const urgent = [];
        allItems.forEach(item => {
            if (item.isDone || !item.dueDate) return;
            const target = new Date(item.dueDate);
            target.setHours(0, 0, 0, 0);
            const days = Math.round((target.getTime() - nowMs) / dayMs);
            if (days <= 7) {
                urgent.push({ ...item, days });
            }
        });
        urgent.sort((a, b) => a.days - b.days);

        if (urgent.length === 0) {
            return `
                <div class="today-card today-info">
                    <div class="today-card-head">
                        <div class="today-card-icon" style="--today-accent: #10b981;">${icon('check')}</div>
                        <div class="today-card-title">${safeT('today.urgent')}</div>
                    </div>
                    <div class="today-empty">${safeT('today.noItems')}</div>
                </div>
            `;
        }

        let itemsHtml = '';
        urgent.slice(0, 5).forEach(item => {
            const daysTxt = item.days < 0 ? `${Math.abs(item.days)} ${safeT('rem.dashboard.daysLeft')}` : 
                            (item.days === 0 ? safeT('rem.dashboard.today') :
                            (item.days === 1 ? safeT('rem.dashboard.tomorrow') : `${item.days} ${safeT('rem.dashboard.daysLeft')}`));
            const color = item.days < 0 ? '#f43f5e' : (item.days <= 3 ? '#f43f5e' : '#f59e0b');
            itemsHtml += `
                <div class="today-item" style="--today-item-color: ${color};">
                    <div class="today-item-icon">${icon(item.icon || 'bell')}</div>
                    <div class="today-item-body">
                        <div class="today-item-title">${escapeHtml(item.title || '')}</div>
                        ${item.subtitle ? `<div class="today-item-sub">${escapeHtml(item.subtitle)}</div>` : ''}
                    </div>
                    <div class="today-item-days">${daysTxt}</div>
                </div>
            `;
        });

        return `
            <div class="today-card today-urgent">
                <div class="today-card-head">
                    <div class="today-card-icon" style="--today-accent: #f43f5e;">${icon('bell')}</div>
                    <div class="today-card-title">${safeT('today.urgent')}</div>
                    <div class="today-card-count">${urgent.length}</div>
                </div>
                ${itemsHtml}
            </div>
        `;
    } catch (e) {
        console.warn('renderTodayUrgent error:', e);
        return '';
    }
}

function renderTodayWeather() {
    try {
        if (typeof weatherState === 'undefined') return '';
        const loc = weatherState.location;
        const current = weatherState.current;
        if (!loc) {
            return `
                <div class="today-card today-weather">
                    <div class="today-card-head">
                        <div class="today-card-icon" style="--today-accent: #38bdf8;">${icon('cloudSun')}</div>
                        <div class="today-card-title">${safeT('today.weather')}</div>
                    </div>
                    <div class="today-empty">${safeT('today.weather.noLocation')}</div>
                </div>
            `;
        }
        if (!current) {
            return `
                <div class="today-card today-weather">
                    <div class="today-card-head">
                        <div class="today-card-icon" style="--today-accent: #38bdf8;">${icon('cloudSun')}</div>
                        <div class="today-card-title">${safeT('today.weather')}</div>
                    </div>
                    <div class="today-empty">${safeT('today.weather.loading')}</div>
                </div>
            `;
        }
        const temp = Math.round(current.temperature_2m);
        const feels = Math.round(current.apparent_temperature);
        const info = (typeof getWeatherInfo === 'function') ? getWeatherInfo(current.weather_code) : { text: '—', icon: 'cloud' };
        const locName = loc.name || '';

        return `
            <div class="today-card today-weather">
                <div class="today-card-head">
                    <div class="today-card-icon" style="--today-accent: #38bdf8;">${icon('cloudSun')}</div>
                    <div class="today-card-title">${safeT('today.weather')}</div>
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

function renderTodayUV() {
    try {
        if (typeof weatherState === 'undefined' || !weatherState.current) return '';
        const uv = Math.round(weatherState.current.uv_index || 0);
        let uvKey = 'today.uv.low';
        let uvColor = '#10b981';
        if (uv >= 6) { uvKey = 'today.uv.high'; uvColor = '#f43f5e'; }
        else if (uv >= 3) { uvKey = 'today.uv.moderate'; uvColor = '#f59e0b'; }
        return `
            <div class="today-card today-info" style="border-left-color: ${uvColor};">
                <div class="today-card-head">
                    <div class="today-card-icon" style="--today-accent: ${uvColor};">${icon('sun')}</div>
                    <div class="today-card-title">UV — ${uv}</div>
                </div>
                <div class="today-tip-text">${safeT(uvKey)}</div>
            </div>
        `;
    } catch (e) { return ''; }
}

function renderTodayTip() {
    const tips = ['today.tip.1', 'today.tip.2', 'today.tip.3', 'today.tip.4', 'today.tip.5', 'today.tip.6'];
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const tipKey = tips[dayOfYear % tips.length];
    return `
        <div class="today-card today-tip">
            <div class="today-card-head">
                <div class="today-card-icon" style="--today-accent: #facc15;">${icon('sparkles')}</div>
                <div class="today-card-title">${safeT('today.tip')}</div>
            </div>
            <div class="today-tip-text">${safeT(tipKey)}</div>
        </div>
    `;
}

// ================= MOJI ALATI SCREEN =================
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

// ================= PROFIL KORISNIKA =================
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
function getUserProfile() {
    return loadUserProfile();
}
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

// ================= PAMETNA PRETRAGA =================
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

// Numerički predlozi (npr. "175" → BMI za 175cm)
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

    // Ako je prazno i ima numeričke predloge
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

    // Numerički hint
    const num = parseFloat(query);
    if (!isNaN(num) && numericSuggestions.length > 0) {
        box.innerHTML += `<div class="qsr-smart-hint">💡 ${safeT('smartSearch.numberHint')}</div>`;
    }

    // Numerički predlozi
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

    // Rezultati pretrage
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

// ================= LANCI ALATA =================
function renderToolChains(containerId, chains) {
    const container = el(containerId);
    if (!container) return;
    if (!chains || !chains.length) { container.innerHTML = ''; return; }
    let html = `<div class="chain-box"><div class="chain-title">🔗 ${safeT('chain.title')}</div>`;
    chains.forEach(chain => {
        html += `<button class="chain-btn" onclick="${chain.action}">
            <span class="chain-btn-icon">${icon(chain.icon || 'arrowRight')}</span>
            <span>${escapeHtml(safeT(chain.labelKey))}</span>
        </button>`;
    });
    html += `</div>`;
    container.innerHTML = html;
}

// ================= TOAST =================
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

// ================= CONFIRM =================
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

// ================= ZVUK I VIBRACIJA =================
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

// ================= RIPPLE =================
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
    target.style.overflow = 'hidden';
    target.appendChild(ripple);
    setTimeout(() => { if (ripple.parentNode) ripple.remove(); }, 600);
}
function setupRipple() {
    const selector = '.calc-btn-main, .copy-btn, .back-btn, .swap-btn, .settings-toggle-btn, .confirm-btn, .openings-add-btn, .fx-refresh-btn, .fx-swap-btn, .copy-btn-mini, .lista-clear-btn, .quick-tool, .all-tool, .tab-btn, .section-action-btn, .modal-fav-star, .modal-settings-btn, .weather-refresh-btn, .location-gps-btn, .weather-location, .icon-btn-text, .about-row, .all-tools-save-btn, .all-tools-reset-btn, .tabs-settings-reset-btn, .tabs-settings-save-btn, .gps-btn-main, .gps-btn-secondary, .gps-chip, .gps-color-swatch, .tabs-settings-color-reset, .toolbar-btn, .bottom-nav-btn, .mytool-item, .habit-day-btn, .today-item, .journal-card, .recipe-card, .water-glass, .holiday-card, .chain-btn';
    document.addEventListener('pointerdown', (e) => {
        const t = e.target.closest(selector);
        if (t) createRipple({ currentTarget: t, clientX: e.clientX, clientY: e.clientY });
    }, { passive: true });
}

// ================= PODEŠAVANJA =================
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
        if (typeof renderAllTools === 'function') renderAllTools();
        if (typeof renderFavorites === 'function') renderFavorites();
        if (typeof renderHistory === 'function') renderHistory();
        if (typeof updateSettingsUI === 'function') updateSettingsUI();
        if (typeof renderSections === 'function') renderSections();
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

// ================= COPY / SHARE =================
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

// ================= ISTORIJA =================
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

// ================= NAVIGACIJA — MODALI =================
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

    // Specifične inicijalizacije po tabu
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
    if (tabId === 'habits') setTimeout(() => { if (typeof renderHabitsList === 'function') renderHabitsList(); }, 50);
    if (tabId === 'dnevnik') setTimeout(() => { if (typeof renderJournalList === 'function') renderJournalList(); }, 50);
    if (tabId === 'dnevnikTreninga') setTimeout(() => { if (typeof renderWorkoutList === 'function') renderWorkoutList(); }, 50);
    if (tabId === 'vodaSan') setTimeout(() => { if (typeof renderWaterSleepTab === 'function') renderWaterSleepTab(); }, 50);
    if (tabId === 'recepti') setTimeout(() => { if (typeof renderRecipesList === 'function') renderRecipesList(); }, 50);
    if (tabId === 'pracenje') setTimeout(() => { if (typeof renderPriceTrackingList === 'function') renderPriceTrackingList(); }, 50);
    if (tabId === 'troskovnik') setTimeout(() => { if (typeof renderCostEstimateList === 'function') renderCostEstimateList(); }, 50);
    if (tabId === 'praznici') setTimeout(() => { if (typeof renderHolidaysList === 'function') renderHolidaysList(); }, 50);
    if (tabId === 'skica') setTimeout(() => { if (typeof drawSketch === 'function') drawSketch(); }, 50);
    if (tabId === 'barkod') setTimeout(() => { if (typeof initBarcodeScanner === 'function') initBarcodeScanner(); }, 50);
    if (tabId === 'koraci') setTimeout(() => { if (typeof initPedometer === 'function') initPedometer(); }, 50);

    try { history.pushState({ modal: 'calc', category: categoryId, tab: tabId }, '', ''); } catch (e) {}
    try { maybeShowFavHint(); } catch (e) {}
}

function closeModal(modalId) {
    const modal = el(modalId);
    if (!modal) return;

    if (modalId === 'calc-modal' && activeCategory) {
        // Zaustavi sve aktivne GPS/tuner stvari
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
    if (typeof gpsCleanupAll === 'function') { try { gpsCleanupAll(); } catch (e) {} }
    if (typeof stopTunerTone === 'function') { try { stopTunerTone(); } catch (e) {} }
    if (typeof stopTunerMic === 'function') { try { stopTunerMic(); } catch (e) {} }
    if (typeof stopMetronome === 'function') { try { stopMetronome(); } catch (e) {} }
    if (typeof stopBarcodeScanner === 'function') { try { stopBarcodeScanner(); } catch (e) {} }
    if (typeof stopPedometer === 'function') { try { stopPedometer(); } catch (e) {} }
}

// ================= BRZI ALATI =================
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

// ================= SVI ALATI =================
const HIDDEN_CATS_KEY = 'cx_hidden_cats';
const CATEGORY_ORDER_KEY = 'cx_category_order';
const TOOLS_HINT_KEY = 'cx_hint_dismissed_tools';

let allToolsEditMode = false;
let dragSrcId = null;

function getHiddenCategories() {
    try {
        const raw = JSON.parse(localStorage.getItem(HIDDEN_CATS_KEY));
        if (Array.isArray(raw)) return raw;
    } catch (e) {}
    return [];
}
function saveHiddenCategories(list) {
    try { localStorage.setItem(HIDDEN_CATS_KEY, JSON.stringify(list)); } catch (e) {}
}
function getCategoryOrder() {
    try {
        const raw = JSON.parse(localStorage.getItem(CATEGORY_ORDER_KEY));
        if (Array.isArray(raw) && raw.length) {
            const valid = raw.filter(id => CATEGORIES[id]);
            Object.keys(CATEGORIES).forEach(id => {
                if (!valid.includes(id)) valid.push(id);
            });
            return valid;
        }
    } catch (e) {}
    return Object.keys(CATEGORIES);
}
function saveCategoryOrder(list) {
    try { localStorage.setItem(CATEGORY_ORDER_KEY, JSON.stringify(list)); } catch (e) {}
}

function renderAllTools() {
    const grid = el('all-tools-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const hidden = getHiddenCategories();
    const order = getCategoryOrder();
    order.forEach(id => {
        const cat = CATEGORIES[id];
        if (!cat) return;
        const isHidden = hidden.includes(id);
        if (!allToolsEditMode && isHidden) return;
        const accent = getCategoryAccent(id);
        const wrap = document.createElement('div');
        wrap.className = 'all-tool-wrap';
        wrap.dataset.catId = id;
        if (isHidden) wrap.classList.add('hidden-cat');
        if (allToolsEditMode) {
            wrap.draggable = true;
            wrap.classList.add('draggable');
            wrap.addEventListener('dragstart', handleDragStart);
            wrap.addEventListener('dragover', handleDragOver);
            wrap.addEventListener('drop', handleDrop);
            wrap.addEventListener('dragend', handleDragEnd);
        }
        const btn = document.createElement('button');
        btn.className = 'all-tool';
        btn.style.setProperty('--qt-accent', accent);
        btn.dataset.catId = id;
        btn.innerHTML = `
            <span class="all-tool-icon">${icon(cat.icon)}</span>
            <span class="all-tool-label">${escapeHtml(safeT('cat.' + id))}</span>
        `;
        if (!allToolsEditMode) btn.onclick = () => openCategory(id);
        wrap.appendChild(btn);
        if (allToolsEditMode) {
            const handle = document.createElement('span');
            handle.className = 'all-tool-handle';
            handle.textContent = '⋮⋮';
            wrap.appendChild(handle);
            const closeBtn = document.createElement('button');
            closeBtn.className = 'all-tool-close';
            closeBtn.type = 'button';
            closeBtn.textContent = isHidden ? '↺' : '✕';
            closeBtn.onclick = (e) => { e.stopPropagation(); toggleCategoryHidden(id); };
            wrap.appendChild(closeBtn);
        }
        grid.appendChild(wrap);
    });
    if (allToolsEditMode) {
        const bar = document.createElement('div');
        bar.className = 'all-tools-edit-bar';
        bar.innerHTML = `
            <div class="all-tools-edit-hint">${safeT('section.allTools.dragHint')}</div>
            <button type="button" class="all-tools-reset-btn" onclick="resetAllToolsLayout()">${safeT('section.allTools.reset')}</button>
            <button type="button" class="all-tools-save-btn" onclick="saveAllToolsLayout()">${safeT('section.allTools.save')}</button>
        `;
        grid.appendChild(bar);
    }
    updateVisualBadge(getUrgentRemindersCount());
}
function toggleCategoryHidden(id) {
    const hidden = getHiddenCategories();
    const idx = hidden.indexOf(id);
    if (idx === -1) hidden.push(id);
    else hidden.splice(idx, 1);
    saveHiddenCategories(hidden);
    renderAllTools();
    vibrate(10);
    playTick(0, 1300, 0.05, 0.015);
}
function toggleAllToolsEditMode() {
    allToolsEditMode = !allToolsEditMode;
    const btn = el('btn-edit-all-tools');
    if (btn) btn.textContent = allToolsEditMode ? safeT('section.allTools.save') : safeT('section.allTools.edit');
    const hint = el('all-tools-edit-hint');
    if (hint) hint.style.display = allToolsEditMode ? 'block' : 'none';
    renderAllTools();
    vibrate(15);
}
function saveAllToolsLayout() {
    allToolsEditMode = false;
    const btn = el('btn-edit-all-tools');
    if (btn) btn.textContent = safeT('section.allTools.edit');
    const hint = el('all-tools-edit-hint');
    if (hint) hint.style.display = 'none';
    renderAllTools();
    showToast(safeT('section.allTools.saved'), 'success');
    vibrate(20);
}
function resetAllToolsLayout() {
    try {
        localStorage.removeItem(HIDDEN_CATS_KEY);
        localStorage.removeItem(CATEGORY_ORDER_KEY);
    } catch (e) {}
    renderAllTools();
    showToast(safeT('section.allTools.reset.done'), 'info');
    vibrate(15);
}
function handleDragStart(e) {
    dragSrcId = this.dataset.catId;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', dragSrcId); } catch (err) {}
}
function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const target = e.currentTarget;
    if (!target || target.dataset.catId === dragSrcId) return;
    target.classList.add('drag-over');
}
function handleDrop(e) {
    e.preventDefault();
    const target = e.currentTarget;
    target.classList.remove('drag-over');
    const targetId = target.dataset.catId;
    if (!dragSrcId || targetId === dragSrcId) return;
    const order = getCategoryOrder();
    const srcIdx = order.indexOf(dragSrcId);
    const tgtIdx = order.indexOf(targetId);
    if (srcIdx === -1 || tgtIdx === -1) return;
    order.splice(srcIdx, 1);
    order.splice(tgtIdx, 0, dragSrcId);
    saveCategoryOrder(order);
    renderAllTools();
    vibrate(10);
}
function handleDragEnd() {
    this.classList.remove('dragging');
    document.querySelectorAll('.all-tool-wrap.drag-over').forEach(el => el.classList.remove('drag-over'));
    dragSrcId = null;
}
function maybeShowToolsHint() {
    try {
        if (localStorage.getItem(TOOLS_HINT_KEY) === '1') return;
        const hint = el('tools-hint');
        if (!hint) return;
        hint.style.display = 'flex';
        hint.classList.remove('hide');
    } catch (e) {}
}
function dismissToolsHint() {
    try { localStorage.setItem(TOOLS_HINT_KEY, '1'); } catch (e) {}
    const hint = el('tools-hint');
    if (!hint) return;
    hint.classList.add('hide');
    setTimeout(() => { hint.style.display = 'none'; }, 400);
    vibrate(10);
}

// ================= SEKCIJE (10 sekcija) =================
function renderSections() {
    const container = el('sections-container');
    if (!container) return;
    container.innerHTML = '';
    Object.entries(SECTIONS).forEach(([secId, section]) => {
        const sectionEl = document.createElement('section');
        sectionEl.className = 'section-block';
        sectionEl.style.setProperty('--section-accent', section.accent);
        let gridHtml = '';
        section.cats.forEach(catId => {
            const cat = CATEGORIES[catId];
            if (!cat) return;
            const accent = getCategoryAccent(catId);
            gridHtml += `
                <button class="all-tool" style="--qt-accent: ${accent};" onclick="openCategory('${catId}')">
                    <span class="all-tool-icon">${icon(cat.icon)}</span>
                    <span class="all-tool-label">${escapeHtml(safeT('cat.' + catId))}</span>
                </button>
            `;
        });
        sectionEl.innerHTML = `
            <div class="section-block-title">
                <span class="section-block-icon">${icon(section.icon)}</span>
                <span>${escapeHtml(safeT('section.' + secId))}</span>
            </div>
            <div class="section-block-grid">${gridHtml}</div>
        `;
        container.appendChild(sectionEl);
    });
}

// ================= FAVORITI =================
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

// Fav hint
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

// ================= BADGE =================
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
    const allTool = document.querySelector('.all-tool[data-cat-id="podsetnici"]');
    if (allTool) allTool.setAttribute('data-activity-dot', '1');
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

// ================= ARHIVA =================
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
function archiveItem(item) {
    const archive = loadArchive();
    if (item.originalId) {
        const exists = archive.find(a => a.originalId === item.originalId && a.originalType === item.originalType);
        if (exists) return exists;
    }
    const newItem = {
        id: 'arch_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
        originalType: item.originalType || 'unknown',
        originalId: item.originalId || '',
        category: item.category || 'Ostalo',
        title: item.title || 'Stavka',
        subtitle: item.subtitle || '',
        amount: item.amount || 0,
        currency: item.currency || 'RSD',
        icon: item.icon || 'check',
        color: item.color || '#10b981',
        completedAt: Date.now(),
        completedDate: new Date().toISOString().slice(0, 10)
    };
    archive.unshift(newItem);
    saveArchive(archive.slice(0, 500));
    return newItem;
}
function removeFromArchive(id) {
    let archive = loadArchive();
    archive = archive.filter(a => a.id !== id);
    saveArchive(archive);
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

// ================= DATE TRIPLE =================
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

// ================= INPUT PERSISTENCE =================
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

// ================= TAB LAYOUT =================
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

// ================= ACCENT COLORS =================
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
    try { renderAllTools(); } catch (e) {}
    try { renderSections(); } catch (e) {}
}
function resetCategoryAccent(categoryId) {
    const all = loadAccentColors();
    delete all[categoryId];
    saveAccentColors(all);
    try { renderQuickTools(); } catch (e) {}
    try { renderAllTools(); } catch (e) {}
    try { renderSections(); } catch (e) {}
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

// ================= O APLIKACIJI =================
const APP_VERSION = '2.0';
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

// ================= BACK BUTTON / HISTORY =================
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
        const torchModal = el('torch-modal');
        const levelModal = el('level-modal');
        const stopwatchModal = el('toolbar-stopwatch-modal');
        const timerModal = el('toolbar-timer-modal');

        // Zatvori nove modale po prioritetu
        const noviModali = ['fuel-history-modal','habit-modal','journal-modal','workout-modal','water-sleep-modal','recipes-modal','savings-modal','barcode-modal','price-tracking-modal','cost-estimate-modal','solar-modal','holidays-modal','timezone-modal','shoe-modal','clothing-modal','numbers-modal'];
        for (const id of noviModali) {
            const m = el(id);
            if (m && m.classList.contains('show')) { m.classList.remove('show'); return; }
        }

        if (profileModal && profileModal.classList.contains('show')) { profileModal.classList.remove('show'); return; }
        if (torchModal && torchModal.classList.contains('show')) { torchModal.classList.remove('show'); return; }
        if (levelModal && levelModal.classList.contains('show')) {
            try { levelStop(); } catch (err) {}
            levelModal.classList.remove('show');
            return;
        }
        if (stopwatchModal && stopwatchModal.classList.contains('show')) { stopwatchModal.classList.remove('show'); return; }
        if (timerModal && timerModal.classList.contains('show')) { timerModal.classList.remove('show'); return; }
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

        // Screen back
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
}// ============================================================
// ALATIKA 2.0 — app.js
// Deo 3/5: Svi NOVI alati
// ============================================================

// ============================================================
// NOVI ALATI — KONVERZIJE: OBUĆA, ODEĆA, BROJEVI
// ============================================================

// ---------- OBUVANJE ----------
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
        <p class="section-desc" style="text-align: center; font-size: 0.72rem;">Konverzija je približna. Proizvođači mogu imati različite veličine.</p>
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

    // Nađi najbliži indeks u "from" sistemu
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

// ---------- ODEĆA ----------
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
        <p class="section-desc" style="text-align: center; font-size: 0.72rem;">Konverzija je približna. Proizvođači mogu imati različite veličine.</p>
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

    // Nađi red u tabeli
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

// ---------- BROJEVI ----------
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
// NOVI ALATI — NOVAC: ŠTEDNJA, POREĐENJE, BUDŽET
// ============================================================

// ---------- ŠTEDNJA ----------
function renderMoneyStednja() {
    return `
        <div class="converter-box">
            <p class="section-desc">Izračunaj koliko meseci treba da uštediš za cilj.</p>
            ${inputField('label.money.amount', 'savings-target', 'RSD', 'placeholder="1000000"')}
            ${inputField('label.money.amount', 'savings-current', 'RSD', 'placeholder="0"')}
            ${inputField('label.money.amount', 'savings-monthly', 'RSD', 'placeholder="20000"')}
            ${inputField('label.money.annualRate', 'savings-interest', '%', 'value="0" step="0.1"')}
            ${calcButton('btn.calculate', 'calculateSavings()')}
        </div>
        ${resultCard('savings-result-box', 'piggyBank', 'label.rate.totalPayment', 'res-savings-months', 'meseci', 'NOVAC', 'label.money.amount')}
        ${statsRow('savings-stats-row', [
            ['label.money.totalRepayment', 'stat-savings-total', '0 RSD'],
            ['label.money.totalInterest', 'stat-savings-interest', '0 RSD']
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
    if (annualRate <= 0) {
        months = Math.ceil(remaining / monthly);
    } else {
        const monthlyRate = annualRate / 100 / 12;
        // Formula za broj meseci uz mesečnu kamatu
        months = Math.ceil(Math.log(1 + (remaining * monthlyRate) / monthly) / Math.log(1 + monthlyRate));
    }
    const totalSaved = monthly * months;
    const interest = Math.max(0, totalSaved - remaining);

    const rm = el('res-savings-months');
    if (rm) rm.innerText = months;
    const st = el('stat-savings-total');
    if (st) st.innerText = money(totalSaved) + ' RSD';
    const si = el('stat-savings-interest');
    if (si) si.innerText = money(interest) + ' RSD';

    show('savings-result-box'); show('savings-stats-row');

    // Progress
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

// ---------- POREĐENJE CENA (dva proizvoda) ----------
function renderMoneyPoredjenje() {
    return `
        <div class="converter-box">
            <p class="section-desc">Uporedi cenu dva proizvoda po jedinici mere.</p>
            <div class="compare-group">
                <div class="compare-title">Proizvod A</div>
                ${inputField('label.shop.price', 'price-a', 'RSD', 'placeholder="200"')}
                ${inputField('label.shop.quantity', 'qty-a', '', 'placeholder="1"')}
                ${selectField('label.shop.unit', 'unit-a', [
                    { value: 'kg', text: 'kg' },
                    { value: 'g', text: 'g' },
                    { value: 'L', text: 'L' },
                    { value: 'ml', text: 'ml' },
                    { value: 'kom', text: 'kom' }
                ])}
            </div>
            <div class="compare-group">
                <div class="compare-title">Proizvod B</div>
                ${inputField('label.shop.price', 'price-b', 'RSD', 'placeholder="180"')}
                ${inputField('label.shop.quantity', 'qty-b', '', 'placeholder="0.9"')}
                ${selectField('label.shop.unit', 'unit-b', [
                    { value: 'kg', text: 'kg' },
                    { value: 'g', text: 'g' },
                    { value: 'L', text: 'L' },
                    { value: 'ml', text: 'ml' },
                    { value: 'kom', text: 'kom' }
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

// ---------- BUDŽET ----------
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

// ============================================================
// NOVI ALATI — KUPOVINA: BARKOD, PRAĆENJE CENA
// ============================================================

// ---------- BARKOD ----------
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
        <p class="section-desc" style="text-align: center; font-size: 0.72rem;">Skeniranje koristi kameru. Ako nije podržano, unesi barkod ručno.</p>
    `;
}

async function startBarcodeScanner() {
    const wrap = el('barcode-camera-wrap');
    const startBtn = el('barcode-start-btn');
    const stopBtn = el('barcode-stop-btn');
    const video = el('barcode-video');
    if (!wrap || !video) return;
    try {
        barcodeStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
        });
        video.srcObject = barcodeStream;
        wrap.style.display = 'block';
        if (startBtn) startBtn.style.display = 'none';
        if (stopBtn) stopBtn.style.display = 'block';

        // Pokušaj BarcodeDetector API
        if ('BarcodeDetector' in window) {
            try {
                barcodeDetector = new BarcodeDetector({
                    formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code']
                });
                barcodeIntervalId = setInterval(async () => {
                    if (!barcodeDetector || !video) return;
                    try {
                        const barcodes = await barcodeDetector.detect(video);
                        if (barcodes && barcodes.length > 0) {
                            onBarcodeDetected(barcodes[0].rawValue);
                        }
                    } catch (e) {}
                }, 500);
            } catch (e) { console.warn('BarcodeDetector error:', e); }
        } else {
            showToast('Automatsko skeniranje nije podržano — unesi barkod ručno.', 'info', 3000);
        }
    } catch (e) {
        console.warn('Camera error:', e);
        showToast('Greška pri pristupu kameri. Dozvoli pristup u podešavanjima.', 'error', 3000);
    }
}

function stopBarcodeScanner() {
    const wrap = el('barcode-camera-wrap');
    const startBtn = el('barcode-start-btn');
    const stopBtn = el('barcode-stop-btn');
    if (barcodeStream) {
        barcodeStream.getTracks().forEach(t => t.stop());
        barcodeStream = null;
    }
    if (barcodeIntervalId) {
        clearInterval(barcodeIntervalId);
        barcodeIntervalId = null;
    }
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
    playTick(0, 1800, 0.08, 0.04);
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
    // Dodaj kao stavku u listu za kupovinu sa barkodom kao nazivom
    const list = loadShoppingList();
    list.push({
        id: Date.now() + Math.random(),
        name: 'Barkod: ' + code,
        qty: '',
        price: 0,
        bought: false,
        date: Date.now(),
        barcode: code
    });
    saveShoppingList(list);
    showToast('Dodato u listu za kupovinu.', 'success', 2000);
    vibrate(20);
    closeModal('barcode-modal');
}

// ---------- PRAĆENJE CENA ----------
const PRICE_TRACKING_KEY = 'cx_price_tracking_v1';

function loadPriceTracking() {
    try {
        const raw = JSON.parse(localStorage.getItem(PRICE_TRACKING_KEY));
        if (Array.isArray(raw)) return raw;
    } catch (e) {}
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
        list.innerHTML = `
            <div class="price-track-empty">
                <div class="price-track-empty-icon">📊</div>
                <div>Nema proizvoda. Dodaj prvi!</div>
            </div>
        `;
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
                    <div class="price-track-stat">
                        <div class="price-track-stat-label">Najniža</div>
                        <div class="price-track-stat-value low">${money(lowest)}</div>
                    </div>
                    <div class="price-track-stat">
                        <div class="price-track-stat-label">Prosečna</div>
                        <div class="price-track-stat-value">${money(avg)}</div>
                    </div>
                    <div class="price-track-stat">
                        <div class="price-track-stat-label">Najviša</div>
                        <div class="price-track-stat-value high">${money(highest)}</div>
                    </div>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:0.75rem;color:var(--text-secondary);font-weight:700;">Poslednja: ${money(last)} RSD</span>
                    ${changeText !== '—' ? `<span class="price-track-change ${changeClass}">${changeText}</span>` : ''}
                </div>
                <div class="price-track-history">
                    ${prices.slice(-5).reverse().map(p => `
                        <div class="price-track-history-row">
                            <span class="price-track-history-date">${escapeHtml(p.date)}${p.store ? ' • ' + escapeHtml(p.store) : ''}</span>
                            <span class="price-track-history-price">${money(p.price)} RSD</span>
                        </div>
                    `).join('')}
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
    vibrate(15);
}

function savePriceTrackingProduct() {
    const name = el('pt-name') ? el('pt-name').value.trim() : '';
    const store = el('pt-store') ? el('pt-store').value.trim() : '';
    if (!name) { showToast('Unesi naziv proizvoda.', 'error'); return; }
    const list = loadPriceTracking();
    list.push({
        id: 'pt_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
        name, store,
        prices: [],
        createdAt: Date.now()
    });
    savePriceTracking(list);
    closeModal('price-tracking-modal');
    renderPriceTrackingList();
    showToast('Proizvod dodat.', 'success', 1500);
    vibrate(20);
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
    item.prices.push({
        price: priceNum,
        store: store,
        date: new Date().toISOString().slice(0, 10)
    });
    savePriceTracking(list);
    renderPriceTrackingList();
    showToast('Cena dodata.', 'success', 1500);
    vibrate(20);
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
// NOVI ALATI — DOM: SKICA, TROŠKOVNIK
// ============================================================

// ---------- SKICA ----------
function renderSketch() {
    return `
        <div class="converter-box">
            <p class="section-desc">Nacrtaj skicu prostorije na osnovu dimenzija.</p>
            ${inputField('label.home.length', 'sketch-length', 'm', 'placeholder="5" oninput="drawSketch()"')}
            ${inputField('label.home.width', 'sketch-width', 'm', 'placeholder="3" oninput="drawSketch()"')}
        </div>
        <div class="sketch-wrap">
            <svg id="sketch-svg" class="sketch-svg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet">
                <rect x="50" y="50" width="300" height="200" fill="none" stroke="var(--border-strong)" stroke-width="2" stroke-dasharray="6,4"/>
                <text x="200" y="150" text-anchor="middle" fill="var(--text-tertiary)" font-size="14" font-weight="600">Unesi dimenzije</text>
            </svg>
        </div>
        ${statsRow('sketch-stats-row', [
            ['label.home.area', 'stat-sketch-area', '0 m²'],
            ['label.home.totalArea', 'stat-sketch-perimeter', '0 m']
        ])}
        <p class="section-desc" style="text-align: center; font-size: 0.72rem;">Skica je samo vizualni prikaz prostorije. Za precizne mere koristi Površinu.</p>
    `;
}

function drawSketch() {
    const svg = el('sketch-svg');
    if (!svg) return;
    const l = num('sketch-length');
    const w = num('sketch-width');
    if (!l || !w) {
        svg.innerHTML = `
            <rect x="50" y="50" width="300" height="200" fill="none" stroke="var(--border-strong)" stroke-width="2" stroke-dasharray="6,4"/>
            <text x="200" y="150" text-anchor="middle" fill="var(--text-tertiary)" font-size="14" font-weight="600">Unesi dimenzije</text>
        `;
        return;
    }
    const aspect = l / w;
    let rw, rh;
    const maxW = 300, maxH = 200;
    if (aspect >= maxW / maxH) { rw = maxW; rh = maxW / aspect; }
    else { rh = maxH; rw = maxH * aspect; }
    const x = (400 - rw) / 2, y = (300 - rh) / 2;

    svg.innerHTML = `
        <defs>
            <pattern id="hatch" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="8" stroke="var(--accent-primary)" stroke-width="1" opacity="0.15"/>
            </pattern>
        </defs>
        <rect x="${x}" y="${y}" width="${rw}" height="${rh}" fill="url(#hatch)" stroke="var(--accent-primary)" stroke-width="3" rx="4"/>
        <text x="${x + rw / 2}" y="${y - 12}" text-anchor="middle" fill="var(--text-main)" font-size="13" font-weight="800">${l} m</text>
        <text x="${x - 12}" y="${y + rh / 2}" text-anchor="middle" fill="var(--text-main)" font-size="13" font-weight="800" transform="rotate(-90 ${x - 12} ${y + rh / 2})">${w} m</text>
        <text x="${x + rw / 2}" y="${y + rh / 2 + 6}" text-anchor="middle" fill="var(--accent-primary)" font-size="18" font-weight="900">${(l * w).toFixed(2)} m²</text>
    `;

    const sa = el('stat-sketch-area'); if (sa) sa.innerText = (l * w).toFixed(2) + ' m²';
    const sp = el('stat-sketch-perimeter'); if (sp) sp.innerText = (2 * (l + w)).toFixed(2) + ' m';
    const row = el('sketch-stats-row'); if (row) row.style.display = 'flex';
}

// ---------- TROŠKOVNIK ----------
const COST_ESTIMATE_KEY = 'cx_cost_estimate_v1';

function loadCostEstimate() {
    try {
        const raw = JSON.parse(localStorage.getItem(COST_ESTIMATE_KEY));
        if (Array.isArray(raw)) return raw;
    } catch (e) {}
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
            <div class="cost-estimate-head">
                <div>Naziv</div><div>Kol.</div><div>Jed.</div><div>Cena</div><div></div>
            </div>
            ${rowsHtml}
        </div>
        <div class="cost-estimate-grand-total">
            <span class="label">UKUPNO</span>
            <span class="value">${money(grand)} RSD</span>
        </div>
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
    vibrate(15);
}

function saveCostEstimateItem() {
    const name = el('ce-name') ? el('ce-name').value.trim() : '';
    const qty = num('ce-qty') || 0;
    const unit = el('ce-unit') ? el('ce-unit').value.trim() : '';
    const unitPrice = num('ce-price') || 0;
    if (!name) { showToast('Unesi naziv stavke.', 'error'); return; }
    const list = loadCostEstimate();
    list.push({
        id: 'ce_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
        name, qty, unit, unitPrice,
        createdAt: Date.now()
    });
    saveCostEstimate(list);
    closeModal('cost-estimate-modal');
    renderCostEstimateList();
    showToast('Stavka dodata.', 'success', 1500);
    vibrate(20);
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
    if (navigator.share) {
        navigator.share({ text }).catch(() => {});
    } else {
        fallbackCopy(text, () => showToast('Kopirano.', 'success', 1500));
    }
}

// ============================================================
// NOVI ALATI — VOZILA: ISTORIJA TOČENJA, PROFIL VOZILA
// ============================================================

// ---------- ISTORIJA TOČENJA ----------
const FUEL_HISTORY_KEY = 'cx_fuel_history_v1';

function loadFuelHistory() {
    try {
        const raw = JSON.parse(localStorage.getItem(FUEL_HISTORY_KEY));
        if (Array.isArray(raw)) return raw;
    } catch (e) {}
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
    // Sortiraj po km
    const sorted = [...items].sort((a, b) => (a.km || 0) - (b.km || 0));
    let totalLiters = 0, totalCost = 0, totalKm = 0;
    let consumptionSum = 0, consumptionCount = 0;
    for (let i = 1; i < sorted.length; i++) {
        const kmDiff = sorted[i].km - sorted[i - 1].km;
        if (kmDiff > 0) {
            const cons = (sorted[i].liters / kmDiff) * 100;
            consumptionSum += cons;
            consumptionCount++;
        }
    }
    sorted.forEach(i => {
        totalLiters += i.liters || 0;
        totalCost += (i.liters || 0) * (i.price || 0);
    });
    if (sorted.length >= 2) totalKm = sorted[sorted.length - 1].km - sorted[0].km;
    const avgCons = consumptionCount > 0 ? consumptionSum / consumptionCount : 0;
    const costPerKm = totalKm > 0 ? totalCost / totalKm : 0;

    let rows = sorted.slice().reverse().map(item => `
        <div class="price-track-card">
            <div class="price-track-head">
                <div class="price-track-name">${escapeHtml(item.date)} • ${item.km} km</div>
                <div class="price-track-store">${item.liters} L</div>
            </div>
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
                <div class="rate-info-row">
                    <span class="rate-info-label">Prosečna potrošnja</span>
                    <span class="rate-info-value accent">${fmt(avgCons, 2)} L/100km</span>
                </div>
                <div class="rate-info-row">
                    <span class="rate-info-label">Ukupno litara</span>
                    <span class="rate-info-value">${fmt(totalLiters, 1)} L</span>
                </div>
                <div class="rate-info-row">
                    <span class="rate-info-label">Ukupni trošak</span>
                    <span class="rate-info-value">${money(totalCost)} RSD</span>
                </div>
                <div class="rate-info-row">
                    <span class="rate-info-label">Pređeno</span>
                    <span class="rate-info-value">${totalKm} km</span>
                </div>
                <div class="rate-info-row">
                    <span class="rate-info-label">Cena po km</span>
                    <span class="rate-info-value">${money(costPerKm)} RSD</span>
                </div>
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
            <div class="input-field">
                <label>Datum</label>
                <input type="date" id="fh-date" class="custom-input" value="${new Date().toISOString().slice(0, 10)}">
            </div>
            ${inputField('label.auto.currentKm', 'fh-km', 'km', 'placeholder="150000"')}
            ${inputField('label.auto.fuel', 'fh-liters', 'L', 'step="0.1" placeholder="45"')}
            ${inputField('label.auto.price', 'fh-price', 'RSD/L', 'step="0.1" placeholder="180"')}
            ${calcButton('btn.save', 'saveFuelEntry()')}
        </div>
    `;
    modal.classList.add('show');
    document.body.classList.add('modal-open');
    vibrate(15);
}

function saveFuelEntry() {
    const date = el('fh-date') ? el('fh-date').value : '';
    const km = num('fh-km');
    const liters = num('fh-liters');
    const price = num('fh-price');
    if (!date || km === null || !liters || !price) { showToast('Popuni sva polja.', 'error'); return; }
    const list = loadFuelHistory();
    list.push({
        id: 'fh_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
        date, km, liters, price,
        createdAt: Date.now()
    });
    saveFuelHistory(list);
    closeModal('fuel-history-modal');
    renderFuelHistoryList();
    showToast('Točenje sačuvano.', 'success', 1500);
    vibrate(20);
    playTick(0, 1500, 0.08, 0.03);
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

// ---------- PROFIL VOZILA ----------
const VEHICLE_PROFILE_KEY = 'cx_vehicle_profile_v1';

function loadVehicleProfile() {
    try {
        const raw = JSON.parse(localStorage.getItem(VEHICLE_PROFILE_KEY));
        if (raw && typeof raw === 'object') return raw;
    } catch (e) {}
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
        model: v('vp-model'),
        plate: v('vp-plate'),
        year: v('vp-year'),
        fuelType: v('vp-fuel-type') || 'petrol',
        tankCapacity: v('vp-tank'),
        avgConsumption: v('vp-consumption'),
        regDate: getTripleDate('vp-reg-date'),
        techDate: getTripleDate('vp-tech-date'),
        insuranceDate: getTripleDate('vp-ins-date')
    };
    saveVehicleProfileStore(profile);
    showToast('Profil vozila sačuvan.', 'success', 1800);
    vibrate(20);
    playTick(0, 1500, 0.08, 0.03);
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
// NOVI ALATI — STRUJA: SOLARNI PANELI
// ============================================================
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
        <p class="section-desc" style="text-align: center; font-size: 0.72rem;">Proračun je približan. Stvarna proizvodnja zavisi od lokacije, vremena i drugih faktora.</p>
    `;
}

function calculateSolar() {
    const consumption = num('solar-consumption');
    const sunHours = num('solar-hours') || 4;
    const panelWatt = num('solar-panel') || 400;
    const efficiency = (num('solar-efficiency') || 80) / 100;
    if (!consumption || consumption <= 0) { showToast('Unesi dnevnu potrošnju.', 'error'); return; }
    const effectivePanelWatt = panelWatt * efficiency;
    const dailyProductionPerPanel = (effectivePanelWatt * sunHours) / 1000; // kWh
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
// NOVI ALATI — VREME: PRAZNICI, VREMENSKE ZONE
// ============================================================

// ---------- PRAZNICI ----------
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
    // Fiksni praznici + pravoslavni Uskrs (računa se po julijanskom kalendaru)
    const list = SR_HOLIDAYS_FIXED.map(h => ({
        date: new Date(year, h.m - 1, h.d),
        name: h.name,
        type: h.type
    }));
    // Pravoslavni Uskrs (algoritam)
    try {
        const a = year % 4, b = year % 7, c = year % 19;
        const d = (19 * c + 15) % 30;
        const e = (2 * a + 4 * b - d + 34) % 7;
        const month = Math.floor((d + e + 114) / 31);
        const day = ((d + e + 114) % 31) + 1;
        // Julian -> Gregorian offset (13 dana za 1900-2099)
        const easterDate = new Date(year, month - 1, day);
        easterDate.setDate(easterDate.getDate() + 13);
        list.push({ date: easterDate, name: 'Vaskrs', type: 'religious' });
        const easterMonday = new Date(easterDate);
        easterMonday.setDate(easterMonday.getDate() + 1);
        list.push({ date: easterMonday, name: 'Vaskrsni ponedeljak', type: 'religious' });
        const goodFriday = new Date(easterDate);
        goodFriday.setDate(goodFriday.getDate() - 2);
        list.push({ date: goodFriday, name: 'Veliki petak', type: 'religious' });
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
        <p class="section-desc" style="text-align: center; font-size: 0.72rem;">Praznici su za Srbiju. Verski praznici zavise od vere.</p>
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
        const isToday = days === 0;
        const isTomorrow = days === 1;
        const isPast = days < 0;
        const cls = isToday ? 'today' : (isTomorrow ? 'tomorrow' : (isPast ? 'past' : ''));
        const dayName = hDate.getDate();
        const monthName = hDate.toLocaleDateString('sr-RS', { month: 'short' }).replace('.', '');
        const daysText = isToday ? 'DANAS' : (isTomorrow ? 'SUTRA' : (isPast ? `pre ${Math.abs(days)} d.` : `${days} d.`));
        html += `
            <div class="holiday-card ${cls}">
                <div class="holiday-date-box">
                    <div class="holiday-day">${dayName}</div>
                    <div class="holiday-month">${monthName}</div>
                </div>
                <div class="holiday-info">
                    <div class="holiday-name">${escapeHtml(h.name)}</div>
                    <div class="holiday-type">${h.type === 'religious' ? 'Verski' : 'Državni'}</div>
                </div>
                <div class="holiday-days-until">${daysText}</div>
            </div>
        `;
    });
    list.innerHTML = html;
}

// ---------- VREMENSKE ZONE ----------
const TIMEZONES = [
    { id: 'UTC-12', offset: -12, label: 'UTC-12:00' },
    { id: 'UTC-11', offset: -11, label: 'UTC-11:00' },
    { id: 'UTC-10', offset: -10, label: 'UTC-10:00 (Havaji)' },
    { id: 'UTC-9', offset: -9, label: 'UTC-09:00 (Aljaska)' },
    { id: 'UTC-8', offset: -8, label: 'UTC-08:00 (LA)' },
    { id: 'UTC-7', offset: -7, label: 'UTC-07:00 (Denver)' },
    { id: 'UTC-6', offset: -6, label: 'UTC-06:00 (Čikago)' },
    { id: 'UTC-5', offset: -5, label: 'UTC-05:00 (Njujork)' },
    { id: 'UTC-4', offset: -4, label: 'UTC-04:00 (Karakaš)' },
    { id: 'UTC-3', offset: -3, label: 'UTC-03:00 (Brazil)' },
    { id: 'UTC-2', offset: -2, label: 'UTC-02:00' },
    { id: 'UTC-1', offset: -1, label: 'UTC-01:00 (Azori)' },
    { id: 'UTC+0', offset: 0, label: 'UTC±00:00 (London)' },
    { id: 'UTC+1', offset: 1, label: 'UTC+01:00 (Beograd, Berlin)' },
    { id: 'UTC+2', offset: 2, label: 'UTC+02:00 (Atina, Kairo)' },
    { id: 'UTC+3', offset: 3, label: 'UTC+03:00 (Moskva)' },
    { id: 'UTC+4', offset: 4, label: 'UTC+04:00 (Dubai)' },
    { id: 'UTC+5', offset: 5, label: 'UTC+05:00 (Karachi)' },
    { id: 'UTC+6', offset: 6, label: 'UTC+06:00 (Daka)' },
    { id: 'UTC+7', offset: 7, label: 'UTC+07:00 (Bangkok)' },
    { id: 'UTC+8', offset: 8, label: 'UTC+08:00 (Peking, Singapur)' },
    { id: 'UTC+9', offset: 9, label: 'UTC+09:00 (Tokio)' },
    { id: 'UTC+10', offset: 10, label: 'UTC+10:00 (Sidnej)' },
    { id: 'UTC+11', offset: 11, label: 'UTC+11:00' },
    { id: 'UTC+12', offset: 12, label: 'UTC+12:00 (Okland)' }
];

function renderTimeZone() {
    const now = new Date();
    const tzOptions = TIMEZONES.map(tz => `<option value="${tz.id}"${tz.offset === 1 ? ' selected' : ''}>${escapeHtml(tz.label)}</option>`).join('');
    return `
        <div class="converter-box">
            <p class="section-desc">Konvertuj vreme između vremenskih zona.</p>
            <div class="timezone-grid">
                <div class="timezone-field">
                    <label>Iz zone</label>
                    <select id="tz-from" class="custom-input" onchange="calculateTimeZone()">${tzOptions}</select>
                </div>
                <div class="timezone-field">
                    <label>U zonu</label>
                    <select id="tz-to" class="custom-input" onchange="calculateTimeZone()">${tzOptions.replace('value="UTC+1"', 'value="UTC+8"').replace('selected', '')}</select>
                </div>
            </div>
            <div class="timezone-grid">
                <div class="timezone-field">
                    <label>Vreme</label>
                    <input type="time" id="tz-time" class="custom-input" value="${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}" oninput="calculateTimeZone()">
                </div>
                <div class="timezone-field">
                    <label>Datum</label>
                    <input type="date" id="tz-date" class="custom-input" value="${now.toISOString().slice(0, 10)}" oninput="calculateTimeZone()">
                </div>
            </div>
            ${calcButton('btn.calculate', 'calculateTimeZone()')}
        </div>
        <div class="timezone-result-card" id="tz-result-box" style="display: none;">
            <div class="timezone-result-label">Rezultat</div>
            <div class="timezone-result-time" id="tz-result-time">--:--</div>
            <div class="timezone-result-date" id="tz-result-date">—</div>
            <div class="timezone-diff" id="tz-result-diff">Razlika: 0 sati</div>
        </div>
        <p class="section-desc" style="text-align: center; font-size: 0.72rem;">Proračun ne uključuje letnje/zimsko računanje vremena.</p>
    `;
}

function calculateTimeZone() {
    const fromEl = el('tz-from');
    const toEl = el('tz-to');
    const timeEl = el('tz-time');
    const dateEl = el('tz-date');
    if (!fromEl || !toEl || !timeEl || !dateEl) return;
    const fromTz = TIMEZONES.find(tz => tz.id === fromEl.value);
    const toTz = TIMEZONES.find(tz => tz.id === toEl.value);
    if (!fromTz || !toTz) return;
    const [h, m] = timeEl.value.split(':').map(Number);
    const [yy, mm, dd] = dateEl.value.split('-').map(Number);
    if (isNaN(h) || isNaN(yy)) return;
    // Kreiramo UTC vreme: lokalno vreme - offset iz zone
    const utcDate = new Date(Date.UTC(yy, mm - 1, dd, h, m));
    utcDate.setUTCMinutes(utcDate.getUTCMinutes() - fromTz.offset * 60);
    // Konvertujemo u ciljnu zonu
    const targetDate = new Date(utcDate.getTime() + toTz.offset * 60 * 60000);
    const resultH = String(targetDate.getUTCHours()).padStart(2, '0');
    const resultM = String(targetDate.getUTCMinutes()).padStart(2, '0');
    const resultD = targetDate.getUTCDate();
    const resultMo = targetDate.getUTCMonth() + 1;
    const resultY = targetDate.getUTCFullYear();
    const diffHours = toTz.offset - fromTz.offset;

    const rt = el('tz-result-time'); if (rt) rt.innerText = `${resultH}:${resultM}`;
    const rd = el('tz-result-date'); if (rd) rd.innerText = `${resultD}.${resultM}.${resultY}.`;
    const rdiff = el('tz-result-diff');
    if (rdiff) rdiff.innerText = `Razlika: ${diffHours >= 0 ? '+' : ''}${diffHours} sati`;
    show('tz-result-box');
}

// ============================================================
// NOVI ALATI — ZDRAVLJE: WORKOUT JOURNAL, PEDOMETAR, VODA/SAN
// ============================================================

// ---------- WORKOUT JOURNAL ----------
const WORKOUT_KEY = 'cx_workouts_v1';
const WORKOUT_TYPES = {
    strength: { label: 'Snaga', icon: 'dumbbell', color: '#ec4899' },
    cardio: { label: 'Kardio', icon: 'run', color: '#f43f5e' },
    flexibility: { label: 'Istezanje', icon: 'activity', color: '#10b981' },
    sport: { label: 'Sport', icon: 'target', color: '#f59e0b' },
    other: { label: 'Drugo', icon: 'star', color: '#6366f1' }
};

function loadWorkouts() {
    try {
        const raw = JSON.parse(localStorage.getItem(WORKOUT_KEY));
        if (Array.isArray(raw)) return raw;
    } catch (e) {}
    return [];
}
function saveWorkouts(list) {
    try { localStorage.setItem(WORKOUT_KEY, JSON.stringify(list)); } catch (e) {}
}

function renderWorkoutJournal() {
    return `
        <div class="converter-box">
            <div class="lista-head">
                <div class="section-desc" style="margin:0;">Beleži svoje treninge i prati napredak.</div>
                <button class="section-action-btn" onclick="openWorkoutModal()">+ Dodaj</button>
            </div>
            <div id="workout-list" class="workout-list"></div>
        </div>
    `;
}

function renderWorkoutList() {
    const list = el('workout-list');
    if (!list) return;
    const items = loadWorkouts().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    if (!items.length) {
        list.innerHTML = `<div class="workout-empty"><div class="workout-empty-icon">💪</div><div>Nema treninga. Dodaj prvi!</div></div>`;
        return;
    }
    let html = '';
    items.forEach(w => {
        const type = WORKOUT_TYPES[w.type] || WORKOUT_TYPES.other;
        html += `
            <div class="workout-card" style="--workout-color: ${type.color};">
                <div class="workout-head">
                    <span class="workout-type-badge">${escapeHtml(type.label)}</span>
                    <span class="workout-date">${escapeHtml(w.date)}</span>
                    ${w.duration ? `<span class="workout-duration">${w.duration} min</span>` : ''}
                </div>
                <div class="workout-exercises">
                    ${(w.exercises || []).map(ex => `
                        <div class="workout-exercise-row">
                            <span class="workout-exercise-name">${escapeHtml(ex.name)}</span>
                            <span class="workout-exercise-detail">${ex.sets || 0}×${ex.reps || 0}</span>
                            <span class="workout-exercise-detail">${ex.weight || 0} kg</span>
                        </div>
                    `).join('')}
                </div>
                <button class="section-action-btn" style="width:100%;margin-top:10px;color:#f43f5e;border-color:rgba(244,63,94,0.4);" onclick="deleteWorkout('${w.id}')">Obriši</button>
            </div>
        `;
    });
    list.innerHTML = html;
}

let workoutDraftExercises = [];

function openWorkoutModal() {
    const modal = el('workout-modal');
    const body = el('workout-modal-body');
    if (!modal || !body) return;
    workoutDraftExercises = [];
    body.innerHTML = `
        <div class="converter-box">
            <div class="input-field">
                <label>Datum</label>
                <input type="date" id="wo-date" class="custom-input" value="${new Date().toISOString().slice(0, 10)}">
            </div>
            <div class="input-field">
                <label>Tip treninga</label>
                <select id="wo-type" class="custom-input">
                    ${Object.entries(WORKOUT_TYPES).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('')}
                </select>
            </div>
            ${inputField('label.health.timeMin', 'wo-duration', 'min', 'placeholder="60"')}
            <div class="section-desc">Vežbe:</div>
            <div id="wo-exercises-list"></div>
            <button class="workout-add-exercise-btn" onclick="addWorkoutExercise()">+ Dodaj vežbu</button>
            ${inputFieldText('label.work.travelShort', 'wo-notes', '')}
            ${calcButton('btn.save', 'saveWorkout()')}
        </div>
    `;
    renderWorkoutExercisesDraft();
    modal.classList.add('show');
    document.body.classList.add('modal-open');
    vibrate(15);
}

function addWorkoutExercise() {
    workoutDraftExercises.push({ name: '', sets: 3, reps: 10, weight: 0 });
    renderWorkoutExercisesDraft();
    vibrate(10);
}

function renderWorkoutExercisesDraft() {
    const list = el('wo-exercises-list');
    if (!list) return;
    list.innerHTML = '';
    workoutDraftExercises.forEach((ex, idx) => {
        const row = document.createElement('div');
        row.className = 'workout-exercise-row';
        row.style.gridTemplateColumns = '1fr 60px 60px 70px 32px';
        row.innerHTML = `
            <input type="text" placeholder="Naziv" value="${escapeHtml(ex.name)}" data-idx="${idx}" data-f="name" class="custom-input" style="font-size:0.8rem;padding:6px;background:var(--card-bg);border-radius:6px;border:1px solid var(--border-strong);">
            <input type="number" placeholder="Serije" value="${ex.sets}" data-idx="${idx}" data-f="sets" class="custom-input" style="font-size:0.8rem;padding:6px;background:var(--card-bg);border-radius:6px;border:1px solid var(--border-strong);">
            <input type="number" placeholder="Pon." value="${ex.reps}" data-idx="${idx}" data-f="reps" class="custom-input" style="font-size:0.8rem;padding:6px;background:var(--card-bg);border-radius:6px;border:1px solid var(--border-strong);">
            <input type="number" placeholder="kg" value="${ex.weight}" data-idx="${idx}" data-f="weight" class="custom-input" style="font-size:0.8rem;padding:6px;background:var(--card-bg);border-radius:6px;border:1px solid var(--border-strong);">
            <button class="cost-estimate-remove" onclick="removeWorkoutExercise(${idx})">✕</button>
        `;
        list.appendChild(row);
    });
    list.querySelectorAll('input').forEach(inp => {
        inp.addEventListener('input', e => {
            const idx = parseInt(e.target.dataset.idx);
            const field = e.target.dataset.f;
            if (workoutDraftExercises[idx]) {
                if (field === 'name') workoutDraftExercises[idx][field] = e.target.value;
                else workoutDraftExercises[idx][field] = parseNum(e.target.value) || 0;
            }
        });
    });
}

function removeWorkoutExercise(idx) {
    workoutDraftExercises.splice(idx, 1);
    renderWorkoutExercisesDraft();
}

function saveWorkout() {
    const date = el('wo-date') ? el('wo-date').value : '';
    const type = el('wo-type') ? el('wo-type').value : 'other';
    const duration = num('wo-duration') || 0;
    const notes = el('wo-notes') ? el('wo-notes').value.trim() : '';
    if (!date) { showToast('Unesi datum.', 'error'); return; }
    const list = loadWorkouts();
    list.push({
        id: 'wo_' + Date.now(),
        date, type, duration, notes,
        exercises: [...workoutDraftExercises],
        createdAt: Date.now()
    });
    saveWorkouts(list);
    closeModal('workout-modal');
    renderWorkoutList();
    showToast('Trening sačuvan.', 'success', 1500);
    vibrate(20);
}

function deleteWorkout(id) {
    showConfirm('Obrisati ovaj trening?').then(ok => {
        if (!ok) return;
        let list = loadWorkouts();
        list = list.filter(w => w.id !== id);
        saveWorkouts(list);
        renderWorkoutList();
        showToast('Trening obrisan.', 'info', 1500);
    });
}

// ---------- PEDOMETAR ----------
const PEDOMETER_KEY = 'cx_pedometer_v1';
const PEDOMETER_GOAL_KEY = 'cx_pedometer_goal';
let pedometerState = {
    steps: 0,
    goal: 10000,
    active: false,
    lastAccel: 0,
    lastStepTime: 0,
    listener: null
};

function loadPedometerData() {
    try {
        const raw = JSON.parse(localStorage.getItem(PEDOMETER_KEY));
        if (raw && raw.date === new Date().toISOString().slice(0, 10)) {
            pedometerState.steps = raw.steps || 0;
        } else {
            pedometerState.steps = 0;
        }
    } catch (e) { pedometerState.steps = 0; }
    try {
        const g = parseInt(localStorage.getItem(PEDOMETER_GOAL_KEY));
        if (g > 0) pedometerState.goal = g;
    } catch (e) {}
}

function savePedometerData() {
    try {
        localStorage.setItem(PEDOMETER_KEY, JSON.stringify({
            date: new Date().toISOString().slice(0, 10),
            steps: pedometerState.steps
        }));
    } catch (e) {}
}

function renderPedometer() {
    loadPedometerData();
    const pct = Math.min(100, (pedometerState.steps / pedometerState.goal) * 100);
    return `
        <div class="pedometer-wrap">
            <div class="pedometer-circle" style="--progress: ${pct};">
                <div class="pedometer-inner">
                    <div class="pedometer-steps" id="pedometer-steps">${pedometerState.steps}</div>
                    <div class="pedometer-goal-label">od ${pedometerState.goal}</div>
                    <div class="pedometer-progress-pct" id="pedometer-pct">${fmt(pct, 0)}%</div>
                </div>
            </div>
            <div class="pedometer-stats">
                <div class="pedometer-stat">
                    <div class="pedometer-stat-value" id="pedometer-distance">${fmt(pedometerState.steps * 0.00075, 2)}</div>
                    <div class="pedometer-stat-label">km</div>
                </div>
                <div class="pedometer-stat">
                    <div class="pedometer-stat-value" id="pedometer-calories">${fmt(pedometerState.steps * 0.04, 0)}</div>
                    <div class="pedometer-stat-label">kcal</div>
                </div>
            </div>
            <div class="input-field" style="width:100%;max-width:400px;">
                <label>Dnevni cilj</label>
                <div class="input-wrapper">
                    <input type="number" id="pedometer-goal-input" class="custom-input" value="${pedometerState.goal}" step="500">
                </div>
            </div>
            <div style="display:flex;gap:8px;width:100%;max-width:400px;">
                <button class="gps-btn-main" onclick="startPedometer()" style="flex:1;">▶ Pokreni</button>
                <button class="gps-btn-secondary" onclick="resetPedometer()">Resetuj</button>
            </div>
            <p class="section-desc" style="text-align:center;font-size:0.72rem;">Praćenje koraka koristi senzor telefona (ako je podržan). Rezultati mogu odstupati.</p>
        </div>
    `;
}

function initPedometer() {
    loadPedometerData();
}

function startPedometer() {
    if (pedometerState.active) {
        stopPedometer();
        return;
    }
    if (!window.DeviceMotionEvent) {
        showToast(safeT('pedometer.unsupported'), 'error', 2500);
        return;
    }
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (isIOS && typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission().then(result => {
            if (result === 'granted') actuallyStartPedometer();
            else showToast(safeT('pedometer.permission'), 'error', 2500);
        }).catch(() => showToast(safeT('pedometer.permission'), 'error', 2500));
        return;
    }
    actuallyStartPedometer();
}

function actuallyStartPedometer() {
    pedometerState.active = true;
    pedometerState.listener = (e) => {
        const acc = e.accelerationIncludingGravity;
        if (!acc) return;
        const magnitude = Math.sqrt((acc.x || 0) ** 2 + (acc.y || 0) ** 2 + (acc.z || 0) ** 2);
        const now = Date.now();
        // Detekcija koraka: threshold + min interval između koraka
        if (magnitude > 12 && now - pedometerState.lastStepTime > 250) {
            pedometerState.steps++;
            pedometerState.lastStepTime = now;
            updatePedometerDisplay();
            if (pedometerState.steps % 10 === 0) savePedometerData();
        }
    };
    window.addEventListener('devicemotion', pedometerState.listener);
    vibrate(20);
    showToast('Pedometar pokrenut.', 'success', 1500);
}

function stopPedometer() {
    if (pedometerState.listener) {
        window.removeEventListener('devicemotion', pedometerState.listener);
        pedometerState.listener = null;
    }
    pedometerState.active = false;
    savePedometerData();
    vibrate(15);
}

function updatePedometerDisplay() {
    const stepsEl = el('pedometer-steps');
    const pctEl = el('pedometer-pct');
    const distEl = el('pedometer-distance');
    const calEl = el('pedometer-calories');
    const circle = document.querySelector('.pedometer-circle');
    if (stepsEl) stepsEl.textContent = pedometerState.steps;
    const pct = Math.min(100, (pedometerState.steps / pedometerState.goal) * 100);
    if (pctEl) pctEl.textContent = fmt(pct, 0) + '%';
    if (distEl) distEl.textContent = fmt(pedometerState.steps * 0.00075, 2);
    if (calEl) calEl.textContent = fmt(pedometerState.steps * 0.04, 0);
    if (circle) circle.style.setProperty('--progress', pct);
}

function resetPedometer() {
    showConfirm(safeT('pedometer.resetConfirm')).then(ok => {
        if (!ok) return;
        pedometerState.steps = 0;
        savePedometerData();
        updatePedometerDisplay();
        showToast('Resetovano.', 'info', 1200);
    });
}

// ---------- VODA I SAN ----------
const WATER_KEY = 'cx_water_v1';
const SLEEP_KEY = 'cx_sleep_v1';
const WATER_GOAL_KEY = 'cx_water_goal';
let waterState = { amount: 0, goal: 2000, date: '' };

function loadWaterData() {
    try {
        const raw = JSON.parse(localStorage.getItem(WATER_KEY));
        const today = new Date().toISOString().slice(0, 10);
        if (raw && raw.date === today) {
            waterState.amount = raw.amount || 0;
            waterState.date = today;
        } else {
            waterState.amount = 0;
            waterState.date = today;
        }
    } catch (e) { waterState.amount = 0; }
    try {
        const g = parseInt(localStorage.getItem(WATER_GOAL_KEY));
        if (g > 0) waterState.goal = g;
    } catch (e) {}
}
function saveWaterData() {
    try {
        localStorage.setItem(WATER_KEY, JSON.stringify({
            date: waterState.date,
            amount: waterState.amount
        }));
    } catch (e) {}
}

function loadSleepHistory() {
    try {
        const raw = JSON.parse(localStorage.getItem(SLEEP_KEY));
        if (Array.isArray(raw)) return raw;
    } catch (e) {}
    return [];
}
function saveSleepHistory(list) {
    try { localStorage.setItem(SLEEP_KEY, JSON.stringify(list.slice(0, 60))); } catch (e) {}
}

function renderWaterSleep() {
    loadWaterData();
    const glasses = Math.floor(waterState.amount / 250);
    const totalGlasses = Math.ceil(waterState.goal / 250);
    let glassesHtml = '';
    for (let i = 0; i < totalGlasses; i++) {
        glassesHtml += `<button class="water-glass ${i < glasses ? 'filled' : ''}" onclick="toggleWaterGlass(${i})"></button>`;
    }
    const pct = Math.min(100, (waterState.amount / waterState.goal) * 100);
    return `
        <div class="water-sleep-wrap">
            <div class="water-section">
                <div class="water-section-title">${icon('droplet')} Voda — danas</div>
                <div class="water-progress-text">
                    <span class="current" id="water-amount">${waterState.amount}</span> / ${waterState.goal} ml
                </div>
                <div class="water-glasses" id="water-glasses">${glassesHtml}</div>
                <div class="water-actions">
                    <button class="water-add-btn" onclick="addWater(250)">+ Čaša (250ml)</button>
                    <button class="water-add-btn secondary" onclick="resetWater()">Resetuj</button>
                </div>
                <div style="margin-top:8px;">
                    <label style="font-size:0.72rem;color:var(--text-secondary);font-weight:700;">Dnevni cilj (ml)</label>
                    <input type="number" id="water-goal-input" class="custom-input" value="${waterState.goal}" step="100" onchange="setWaterGoal()" style="background:var(--input-bg);border:1px solid var(--border-strong);border-radius:10px;padding:10px;width:100%;margin-top:4px;color:var(--text-main);font-weight:700;">
                </div>
            </div>
            <div class="sleep-section">
                <div class="sleep-section-title">${icon('moon')} San</div>
                ${renderSleepForm()}
                <div id="sleep-history-box">${renderSleepHistoryHtml()}</div>
            </div>
        </div>
    `;
}

function toggleWaterGlass(idx) {
    const glasses = Math.floor(waterState.amount / 250);
    if (idx < glasses) {
        waterState.amount = idx * 250;
    } else {
        waterState.amount = (idx + 1) * 250;
    }
    saveWaterData();
    renderWaterSleepTab();
    vibrate(10);
}

function addWater(ml) {
    waterState.amount += ml;
    saveWaterData();
    renderWaterSleepTab();
    vibrate(15);
    playTick(0, 1400, 0.06, 0.02);
}

function resetWater() {
    showConfirm('Resetovati današnji unos vode?').then(ok => {
        if (!ok) return;
        waterState.amount = 0;
        saveWaterData();
        renderWaterSleepTab();
    });
}

function setWaterGoal() {
    const inp = el('water-goal-input');
    if (!inp) return;
    const v = parseInt(inp.value);
    if (v > 0) {
        waterState.goal = v;
        try { localStorage.setItem(WATER_GOAL_KEY, String(v)); } catch (e) {}
        renderWaterSleepTab();
    }
}

function renderWaterSleepTab() {
    // Re-render samo u aktivnom tabu
    const catModal = document.querySelector('#calc-modal.show');
    if (!catModal) return;
    const container = document.querySelector('.water-sleep-wrap');
    if (!container) return;
    const body = el('calc-body');
    if (body && activeTab === 'vodaSan') {
        body.innerHTML = renderWaterSleep();
    }
}

function renderSleepForm() {
    const now = new Date();
    const lastNight = loadSleepHistory()[0];
    return `
        <div class="sleep-times">
            <div class="sleep-time-field">
                <label>Vreme spavanja</label>
                <input type="time" id="sleep-bedtime" value="${lastNight ? lastNight.bedtime : '23:00'}">
            </div>
            <div class="sleep-time-field">
                <label>Vreme buđenja</label>
                <input type="time" id="sleep-waketime" value="${lastNight ? lastNight.waketime : '07:00'}">
            </div>
        </div>
        <div class="sleep-duration" id="sleep-duration-display">—</div>
        <div class="sleep-quality-row" id="sleep-quality-row">
            ${['bad', 'ok', 'good', 'great'].map(q => `<button class="sleep-quality-btn" data-q="${q}" onclick="selectSleepQuality('${q}')">${q === 'bad' ? '😴' : q === 'ok' ? '😐' : q === 'good' ? '🙂' : '😊'}<br>${q === 'bad' ? 'Loše' : q === 'ok' ? 'Onako' : q === 'good' ? 'Dobro' : 'Odlično'}</button>`).join('')}
        </div>
        <button class="sleep-save-btn" onclick="saveSleepEntry()">Sačuvaj san</button>
    `;
}

let selectedSleepQuality = 'good';

function selectSleepQuality(q) {
    selectedSleepQuality = q;
    document.querySelectorAll('.sleep-quality-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.q === q);
    });
    vibrate(10);
}

function updateSleepDurationDisplay() {
    const bedEl = el('sleep-bedtime');
    const wakeEl = el('sleep-waketime');
    const disp = el('sleep-duration-display');
    if (!bedEl || !wakeEl || !disp) return;
    const [bh, bm] = bedEl.value.split(':').map(Number);
    const [wh, wm] = wakeEl.value.split(':').map(Number);
    let bedMin = bh * 60 + bm;
    let wakeMin = wh * 60 + wm;
    if (wakeMin <= bedMin) wakeMin += 24 * 60;
    const diff = wakeMin - bedMin;
    const h = Math.floor(diff / 60), m = diff % 60;
    disp.textContent = `${h}h ${m}min`;
}

function saveSleepEntry() {
    const bedEl = el('sleep-bedtime');
    const wakeEl = el('sleep-waketime');
    if (!bedEl || !wakeEl) return;
    const [bh, bm] = bedEl.value.split(':').map(Number);
    const [wh, wm] = wakeEl.value.split(':').map(Number);
    let bedMin = bh * 60 + bm;
    let wakeMin = wh * 60 + wm;
    if (wakeMin <= bedMin) wakeMin += 24 * 60;
    const duration = wakeMin - bedMin;
    const list = loadSleepHistory();
    list.unshift({
        date: new Date().toISOString().slice(0, 10),
        bedtime: bedEl.value,
        waketime: wakeEl.value,
        duration,
        quality: selectedSleepQuality
    });
    saveSleepHistory(list);
    renderWaterSleepTab();
    showToast('San sačuvan.', 'success', 1500);
    vibrate(20);
}

function renderSleepHistoryHtml() {
    const list = loadSleepHistory();
    if (!list.length) return '';
    const avg = list.slice(0, 7).reduce((s, e) => s + (e.duration || 0), 0) / Math.min(list.length, 7);
    const avgH = Math.floor(avg / 60);
    const avgM = Math.round(avg % 60);
    return `
        <div class="rate-info-card" style="margin-top:12px;">
            <div class="rate-info-row">
                <span class="rate-info-label">Prosečno (7 dana)</span>
                <span class="rate-info-value accent">${avgH}h ${avgM}min</span>
            </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;margin-top:10px;">
            ${list.slice(0, 7).map(e => {
                const h = Math.floor(e.duration / 60);
                const m = e.duration % 60;
                return `<div class="price-track-history-row"><span class="price-track-history-date">${e.date}</span><span class="price-track-history-price">${h}h ${m}min</span></div>`;
            }).join('')}
        </div>
    `;
}

// ============================================================
// NOVI ALATI — KUHINJA: RECEPTI
// ============================================================
const RECIPES_KEY = 'cx_recipes_v1';

function loadRecipes() {
    try {
        const raw = JSON.parse(localStorage.getItem(RECIPES_KEY));
        if (Array.isArray(raw)) return raw;
    } catch (e) {}
    return [];
}
function saveRecipes(list) {
    try { localStorage.setItem(RECIPES_KEY, JSON.stringify(list)); } catch (e) {}
}

function renderRecipes() {
    return `
        <div class="converter-box">
            <div class="lista-head">
                <div class="section-desc" style="margin:0;">Sačuvaj recepte i prilagodi porcije.</div>
                <button class="section-action-btn" onclick="openRecipeModal()">+ Dodaj</button>
            </div>
            <div id="recipe-list" class="recipe-list"></div>
        </div>
    `;
}

function renderRecipesList() {
    const list = el('recipe-list');
    if (!list) return;
    const items = loadRecipes();
    if (!items.length) {
        list.innerHTML = `<div class="recipe-empty"><div class="recipe-empty-icon">🍳</div><div>Nema recepata. Dodaj prvi!</div></div>`;
        return;
    }
    let html = '';
    items.forEach(r => {
        html += `
            <div class="recipe-card" onclick="openRecipeView('${r.id}')">
                <div class="recipe-head">
                    <span class="recipe-emoji">🍽️</span>
                    <span class="recipe-title">${escapeHtml(r.name)}</span>
                </div>
                <div class="recipe-meta-row">
                    <span class="recipe-meta-item">${icon('users')} ${r.servings || 1} porcija</span>
                    ${r.prepTime ? `<span class="recipe-meta-item">${icon('clock')} ${r.prepTime} min</span>` : ''}
                </div>
                ${(r.ingredients || []).length ? `<div class="recipe-ingredients-preview">${r.ingredients.slice(0, 3).map(i => escapeHtml(i.name)).join(', ')}${r.ingredients.length > 3 ? ', ...' : ''}</div>` : ''}
            </div>
        `;
    });
    list.innerHTML = html;
}

let recipeDraftIngredients = [];
let recipeEditId = null;

function openRecipeModal(editId = null) {
    const modal = el('recipes-modal');
    const body = el('recipes-modal-body');
    if (!modal || !body) return;
    recipeEditId = editId;
    let r = { name: '', description: '', servings: 1, prepTime: 0, ingredients: [], steps: '' };
    if (editId) {
        const found = loadRecipes().find(x => x.id === editId);
        if (found) r = found;
    }
    recipeDraftIngredients = (r.ingredients || []).map(i => ({ ...i }));
    body.innerHTML = `
        <div class="converter-box">
            ${inputFieldText('label.shop.itemName', 'recipe-name', 'npr. Palačinke')}
            ${inputFieldText('label.notes', 'recipe-description', '')}
            ${inputField('label.kitchen.originalPortions', 'recipe-servings', '', `value="${r.servings || 1}"`)}
            ${inputField('label.health.timeMin', 'recipe-prep', 'min', `value="${r.prepTime || ''}"`)}
            <div class="section-desc">Sastojci:</div>
            <div id="recipe-ingredients-list"></div>
            <button class="workout-add-exercise-btn" onclick="addRecipeIngredient()">+ Dodaj sastojak</button>
            <div class="input-field">
                <label>Priprema</label>
                <textarea id="recipe-steps" class="custom-input rem-textarea" rows="4" placeholder="Koraci pripreme...">${escapeHtml(r.steps || '')}</textarea>
            </div>
            ${calcButton('btn.save', 'saveRecipe()')}
        </div>
    `;
    renderRecipeIngredientsDraft();
    modal.classList.add('show');
    document.body.classList.add('modal-open');
    vibrate(15);
}

function addRecipeIngredient() {
    recipeDraftIngredients.push({ name: '', amount: '' });
    renderRecipeIngredientsDraft();
    vibrate(10);
}

function renderRecipeIngredientsDraft() {
    const list = el('recipe-ingredients-list');
    if (!list) return;
    list.innerHTML = '';
    recipeDraftIngredients.forEach((ing, idx) => {
        const row = document.createElement('div');
        row.className = 'recipe-ingredient-row';
        row.style.gridTemplateColumns = '1fr 100px 32px';
        row.innerHTML = `
            <input type="text" placeholder="Sastojak" value="${escapeHtml(ing.name)}" data-idx="${idx}" data-f="name" class="custom-input" style="font-size:0.8rem;padding:6px;background:var(--card-bg);border-radius:6px;border:1px solid var(--border-strong);">
            <input type="text" placeholder="Količina" value="${escapeHtml(ing.amount)}" data-idx="${idx}" data-f="amount" class="custom-input" style="font-size:0.8rem;padding:6px;background:var(--card-bg);border-radius:6px;border:1px solid var(--border-strong);">
            <button class="cost-estimate-remove" onclick="removeRecipeIngredient(${idx})">✕</button>
        `;
        list.appendChild(row);
    });
    list.querySelectorAll('input').forEach(inp => {
        inp.addEventListener('input', e => {
            const idx = parseInt(e.target.dataset.idx);
            const field = e.target.dataset.f;
            if (recipeDraftIngredients[idx]) recipeDraftIngredients[idx][field] = e.target.value;
        });
    });
}

function removeRecipeIngredient(idx) {
    recipeDraftIngredients.splice(idx, 1);
    renderRecipeIngredientsDraft();
}

function saveRecipe() {
    const name = el('recipe-name') ? el('recipe-name').value.trim() : '';
    if (!name) { showToast('Unesi naziv recepta.', 'error'); return; }
    const r = {
        id: recipeEditId || ('rc_' + Date.now()),
        name,
        description: el('recipe-description') ? el('recipe-description').value.trim() : '',
        servings: num('recipe-servings') || 1,
        prepTime: num('recipe-prep') || 0,
        ingredients: [...recipeDraftIngredients].filter(i => i.name),
        steps: el('recipe-steps') ? el('recipe-steps').value.trim() : '',
        createdAt: Date.now()
    };
    const list = loadRecipes();
    if (recipeEditId) {
        const idx = list.findIndex(x => x.id === recipeEditId);
        if (idx !== -1) list[idx] = r;
    } else {
        list.push(r);
    }
    saveRecipes(list);
    recipeEditId = null;
    closeModal('recipes-modal');
    renderRecipesList();
    showToast('Recept sačuvan.', 'success', 1500);
    vibrate(20);
}

function openRecipeView(id) {
    const r = loadRecipes().find(x => x.id === id);
    if (!r) return;
    const modal = el('recipes-modal');
    const body = el('recipes-modal-body');
    const titleEl = el('recipes-modal-title');
    if (!modal || !body) return;
    if (titleEl) titleEl.textContent = r.name;
    const scaleOptions = [1, 2, 3, 4, 6, 8];
    body.innerHTML = `
        <div class="converter-box">
            <div class="section-desc">${escapeHtml(r.description || '')}</div>
            <div class="recipe-meta-row">
                <span class="recipe-meta-item">${icon('users')} ${r.servings} porcija</span>
                ${r.prepTime ? `<span class="recipe-meta-item">${icon('clock')} ${r.prepTime} min</span>` : ''}
            </div>
        </div>
        <div class="converter-box">
            <div class="recipe-scale-inputs">
                <label>Prilagodi za:</label>
                <input type="number" id="recipe-scale-to" class="custom-input" value="${r.servings}" min="1">
                <span style="color:var(--text-secondary);font-weight:700;">porcija</span>
            </div>
            <div id="recipe-scaled-list" style="margin-top:12px;"></div>
        </div>
        ${r.steps ? `<div class="converter-box"><div class="section-desc" style="white-space:pre-wrap;line-height:1.6;">${escapeHtml(r.steps)}</div></div>` : ''}
        <div style="display:flex;gap:8px;">
            <button class="section-action-btn" style="flex:1;" onclick="closeModal('recipes-modal');openRecipeModal('${r.id}');">Izmeni</button>
            <button class="section-action-btn" style="flex:1;color:#f43f5e;border-color:rgba(244,63,94,0.4);" onclick="deleteRecipe('${r.id}')">Obriši</button>
        </div>
    `;
    renderScaledIngredients(r);
    const scaleInput = el('recipe-scale-to');
    if (scaleInput) {
        scaleInput.addEventListener('input', () => renderScaledIngredients(r));
    }
    modal.classList.add('show');
    document.body.classList.add('modal-open');
    vibrate(15);
}

function renderScaledIngredients(r) {
    const list = el('recipe-scaled-list');
    if (!list) return;
    const target = num('recipe-scale-to') || r.servings;
    const factor = target / r.servings;
    list.innerHTML = (r.ingredients || []).map(i => {
        let scaled = i.amount;
        // Pokušaj parsiranja količine
        const match = String(i.amount).match(/^([\d.,]+)\s*(.*)$/);
        if (match) {
            const n = parseNum(match[1]);
            const unit = match[2] || '';
            if (n !== null) scaled = fmt(n * factor, 2) + ' ' + unit;
        }
        return `
            <div class="recipe-ingredient-row">
                <span class="recipe-ingredient-name">${escapeHtml(i.name)}</span>
                <span class="recipe-scaled-amount">${escapeHtml(String(scaled))}</span>
            </div>
        `;
    }).join('');
}

function deleteRecipe(id) {
    showConfirm('Obrisati ovaj recept?').then(ok => {
        if (!ok) return;
        let list = loadRecipes();
        list = list.filter(x => x.id !== id);
        saveRecipes(list);
        closeModal('recipes-modal');
        renderRecipesList();
        showToast('Recept obrisan.', 'info', 1500);
    });
}

// ============================================================
// NOVI ALATI — NAVIKE: HABIT TRACKER, DNEVNIK
// ============================================================

// ---------- HABIT TRACKER ----------
const HABITS_KEY = 'cx_habits_v1';

function loadHabits() {
    try {
        const raw = JSON.parse(localStorage.getItem(HABITS_KEY));
        if (Array.isArray(raw)) return raw;
    } catch (e) {}
    return [];
}
function saveHabits(list) {
    try { localStorage.setItem(HABITS_KEY, JSON.stringify(list)); } catch (e) {}
}

function renderHabitTracker() {
    return `
        <div class="converter-box">
            <div class="lista-head">
                <div class="section-desc" style="margin:0;">Prati svoje navike i nizove.</div>
                <button class="section-action-btn" onclick="openHabitModal()">+ Dodaj</button>
            </div>
            <div id="habit-list" class="habit-list"></div>
        </div>
    `;
}

function renderHabitsList() {
    const list = el('habit-list');
    if (!list) return;
    const habits = loadHabits();
    if (!habits.length) {
        list.innerHTML = `<div class="habit-empty"><div class="habit-empty-icon">✅</div><div>Nema navika. Dodaj prvu!</div></div>`;
        return;
    }
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const dayNames = ['Ned', 'Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub'];
    let html = '';
    habits.forEach(h => {
        const history = h.history || {};
        // Zadnjih 7 dana
        let weekHtml = '';
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            const done = history[key] === true;
            const isToday = i === 0;
            weekHtml += `<button class="habit-day-btn ${done ? 'done' : ''} ${isToday ? 'today' : ''}" onclick="toggleHabitDay('${h.id}', '${key}')">
                <span class="habit-day-label">${dayNames[d.getDay()]}</span>
                <span class="habit-day-num">${d.getDate()}</span>
                ${done ? '<span class="habit-day-check">✓</span>' : ''}
            </button>`;
        }
        // Izračunaj streak
        let streak = 0;
        let checkDate = new Date(today);
        while (true) {
            const key = checkDate.toISOString().slice(0, 10);
            if (history[key]) { streak++; checkDate.setDate(checkDate.getDate() - 1); }
            else break;
        }
        // Best streak (pojednostavljeno)
        const keys = Object.keys(history).filter(k => history[k]).sort();
        let bestStreak = 0, curStreak = 0, prevDate = null;
        keys.forEach(k => {
            const d = new Date(k);
            if (prevDate && Math.round((d - prevDate) / 86400000) === 1) curStreak++;
            else curStreak = 1;
            if (curStreak > bestStreak) bestStreak = curStreak;
            prevDate = d;
        });
        html += `
            <div class="habit-card" style="--habit-color: ${h.color || '#10b981'};">
                <div class="habit-head">
                    <div class="habit-icon">${icon(h.icon || 'check')}</div>
                    <div class="habit-info">
                        <div class="habit-name">${escapeHtml(h.name)}</div>
                        <div class="habit-meta">Najbolji niz: ${bestStreak} d.</div>
                    </div>
                    ${streak > 0 ? `<span class="habit-streak-badge">🔥 ${streak}</span>` : ''}
                </div>
                <div class="habit-week-grid">${weekHtml}</div>
                <div class="habit-actions">
                    <button class="habit-action-btn" onclick="openHabitModal('${h.id}')">Izmeni</button>
                    <button class="habit-action-btn danger" onclick="deleteHabit('${h.id}')">Obriši</button>
                </div>
            </div>
        `;
    });
    list.innerHTML = html;
}

function toggleHabitDay(habitId, dateKey) {
    const habits = loadHabits();
    const h = habits.find(x => x.id === habitId);
    if (!h) return;
    h.history = h.history || {};
    h.history[dateKey] = !h.history[dateKey];
    saveHabits(habits);
    renderHabitsList();
    vibrate(15);
    playTick(0, 1500, 0.06, 0.02);
}

let habitEditId = null;
function openHabitModal(editId = null) {
    const modal = el('habit-modal');
    const body = el('habit-modal-body');
    if (!modal || !body) return;
    habitEditId = editId;
    let h = { name: '', icon: 'check', color: '#10b981' };
    if (editId) {
        const found = loadHabits().find(x => x.id === editId);
        if (found) h = found;
    }
    const iconOptions = ['check', 'run', 'dumbbell', 'book', 'droplet', 'heart', 'sun', 'moon', 'leaf', 'sparkles'];
    const colorOptions = ['#10b981', '#f43f5e', '#f59e0b', '#06b6d4', '#6366f1', '#a855f7', '#ec4899', '#84cc16'];
    body.innerHTML = `
        <div class="converter-box">
            ${inputFieldText('label.shop.itemName', 'habit-name', 'npr. Trčanje')}
            <div class="input-field">
                <label>Ikonica</label>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    ${iconOptions.map(ic => `<button class="gps-color-swatch" style="--swatch-color: var(--card-active);color:var(--text-main);border:2px solid ${h.icon === ic ? 'var(--accent-primary)' : 'var(--border-strong)'};" onclick="selectHabitIcon('${ic}')">${icon(ic)}</button>`).join('')}
                </div>
            </div>
            <div class="input-field">
                <label>Boja</label>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    ${colorOptions.map(c => `<button class="gps-color-swatch" style="--swatch-color: ${c};" onclick="selectHabitColor('${c}')">${h.color === c ? '✓' : ''}</button>`).join('')}
                </div>
            </div>
            ${calcButton('btn.save', 'saveHabit()')}
        </div>
    `;
    modal.classList.add('show');
    document.body.classList.add('modal-open');
    vibrate(15);
}

let habitDraftIcon = 'check';
let habitDraftColor = '#10b981';
function selectHabitIcon(ic) { habitDraftIcon = ic; if (el('habit-name')) saveHabitDraft(); }
function selectHabitColor(c) { habitDraftColor = c; }
function saveHabitDraft() {}

function saveHabit() {
    const name = el('habit-name') ? el('habit-name').value.trim() : '';
    if (!name) { showToast('Unesi naziv navike.', 'error'); return; }
    const list = loadHabits();
    if (habitEditId) {
        const h = list.find(x => x.id === habitEditId);
        if (h) { h.name = name; h.icon = habitDraftIcon; h.color = habitDraftColor; }
    } else {
        list.push({
            id: 'hb_' + Date.now(),
            name,
            icon: habitDraftIcon,
            color: habitDraftColor,
            history: {},
            createdAt: Date.now()
        });
    }
    saveHabits(list);
    habitEditId = null;
    closeModal('habit-modal');
    renderHabitsList();
    showToast('Navika sačuvana.', 'success', 1500);
    vibrate(20);
}

function deleteHabit(id) {
    showConfirm('Obrisati ovu naviku i sve podatke?').then(ok => {
        if (!ok) return;
        let list = loadHabits();
        list = list.filter(h => h.id !== id);
        saveHabits(list);
        renderHabitsList();
        showToast('Navika obrisana.', 'info', 1500);
    });
}

// ---------- DNEVNIK ----------
const JOURNAL_KEY = 'cx_journal_v1';
const MOODS = {
    great: '😄',
    good: '🙂',
    ok: '😐',
    bad: '😔',
    terrible: '😢'
};

function loadJournal() {
    try {
        const raw = JSON.parse(localStorage.getItem(JOURNAL_KEY));
        if (Array.isArray(raw)) return raw;
    } catch (e) {}
    return [];
}
function saveJournal(list) {
    try { localStorage.setItem(JOURNAL_KEY, JSON.stringify(list)); } catch (e) {}
}

function renderJournal() {
    return `
        <div class="converter-box">
            <div class="lista-head">
                <div class="section-desc" style="margin:0;">Zapiši svoje misli i osećanja.</div>
                <button class="section-action-btn" onclick="openJournalModal()">+ Nova beleška</button>
            </div>
            <div id="journal-list" class="journal-list"></div>
        </div>
    `;
}

function renderJournalList() {
    const list = el('journal-list');
    if (!list) return;
    const items = loadJournal().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    if (!items.length) {
        list.innerHTML = `<div class="journal-empty"><div class="journal-empty-icon">📔</div><div>Nema beleški. Napiši prvu!</div></div>`;
        return;
    }
    let html = '';
    items.forEach(j => {
        html += `
            <div class="journal-card" onclick="openJournalModal('${j.id}')">
                <div class="journal-head">
                    <span class="journal-mood">${MOODS[j.mood] || '📝'}</span>
                    <div class="journal-head-text">
                        <div class="journal-title">${escapeHtml(j.title)}</div>
                        <div class="journal-date">${new Date(j.createdAt).toLocaleDateString('sr-RS')}</div>
                    </div>
                </div>
                ${j.text ? `<div class="journal-text">${escapeHtml(j.text)}</div>` : ''}
                ${(j.tags || []).length ? `<div class="journal-tags">${j.tags.map(t => `<span class="journal-tag">#${escapeHtml(t)}</span>`).join('')}</div>` : ''}
            </div>
        `;
    });
    list.innerHTML = html;
}

let journalEditId = null;
let selectedJournalMood = 'good';

function openJournalModal(editId = null) {
    const modal = el('journal-modal');
    const body = el('journal-modal-body');
    const titleEl = el('journal-modal-title');
    if (!modal || !body) return;
    journalEditId = editId;
    let j = { title: '', text: '', mood: 'good', tags: [] };
    if (editId) {
        const found = loadJournal().find(x => x.id === editId);
        if (found) j = found;
        if (titleEl) titleEl.textContent = 'Izmeni belešku';
    } else {
        if (titleEl) titleEl.textContent = 'Nova beleška';
    }
    selectedJournalMood = j.mood || 'good';
    body.innerHTML = `
        <div class="converter-box">
            ${inputFieldText('label.shop.itemName', 'journal-title', 'Naslov beleške')}
            <div class="input-field">
                <label>Raspoloženje</label>
                <div class="journal-mood-picker" id="journal-mood-picker">
                    ${Object.entries(MOODS).map(([k, emoji]) => `<button class="journal-mood-option ${selectedJournalMood === k ? 'selected' : ''}" data-mood="${k}" onclick="selectJournalMood('${k}')">${emoji}</button>`).join('')}
                </div>
            </div>
            <div class="input-field">
                <label>Tekst</label>
                <textarea id="journal-text" class="custom-input rem-textarea" rows="6" placeholder="Napiši šta ti je na umu...">${escapeHtml(j.text || '')}</textarea>
            </div>
            ${inputFieldText('label.time.date', 'journal-tags', 'npr. posao, porodica')}
            ${calcButton('btn.save', 'saveJournal()')}
            ${editId ? `<button class="rem-delete-btn" onclick="deleteJournalEntry('${editId}')">Obriši</button>` : ''}
        </div>
    `;
    const tagsInput = el('journal-tags');
    if (tagsInput && (j.tags || []).length) tagsInput.value = j.tags.join(', ');
    modal.classList.add('show');
    document.body.classList.add('modal-open');
    vibrate(15);
}

function selectJournalMood(mood) {
    selectedJournalMood = mood;
    document.querySelectorAll('.journal-mood-option').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.mood === mood);
    });
    vibrate(10);
}

function saveJournal() {
    const title = el('journal-title') ? el('journal-title').value.trim() : '';
    if (!title) { showToast('Unesi naslov.', 'error'); return; }
    const text = el('journal-text') ? el('journal-text').value.trim() : '';
    const tagsRaw = el('journal-tags') ? el('journal-tags').value.trim() : '';
    const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];
    const list = loadJournal();
    if (journalEditId) {
        const idx = list.findIndex(x => x.id === journalEditId);
        if (idx !== -1) { list[idx] = { ...list[idx], title, text, mood: selectedJournalMood, tags }; }
    } else {
        list.unshift({
            id: 'jn_' + Date.now(),
            title, text, mood: selectedJournalMood, tags,
            createdAt: Date.now()
        });
    }
    saveJournal(list);
    journalEditId = null;
    closeModal('journal-modal');
    renderJournalList();
    showToast('Beleška sačuvana.', 'success', 1500);
    vibrate(20);
}

function deleteJournalEntry(id) {
    showConfirm('Obrisati ovu belešku?').then(ok => {
        if (!ok) return;
        let list = loadJournal();
        list = list.filter(x => x.id !== id);
        saveJournal(list);
        closeModal('journal-modal');
        renderJournalList();
        showToast('Beleška obrisana.', 'info', 1500);
    });
}

// ============================================================
// KRAJ DELA 3 — Novi alati
// ============================================================// ============================================================
// ALATIKA 2.0 — app.js
// Deo 4/5: Sve postojeće kalkulacije (mere, novac, kupovina, auto,
// bicikl, zdravlje, vreme, građevina, kuhinja, struja, posao, muzika)
// ============================================================

// ================= RENDER POMOĆNE =================
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
// MERE
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
function renderMeasuresProcenat() { return renderMoneyPopust(); }

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
// NOVAC
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
function renderMoneyProcenat() {
    return `
        <div class="converter-box">
            <label class="pct-label">${safeT('pct.label1')}</label>
            <div class="pct-row">
                <input type="number" id="np-base" class="custom-input pct-input" placeholder="${safeT('pct.price')}" inputmode="decimal">
                <select id="np-op" class="custom-input pct-select">
                    <option value="add">+ %</option><option value="sub">− %</option>
                </select>
                <input type="number" id="np-val" class="custom-input pct-input" placeholder="%" inputmode="decimal">
            </div>
            ${calcButton('btn.calculate', 'calculateMoneyPercent1()')}
        </div>
        <div id="np1-result-box" class="result-card-green" style="display: none;">
            <div class="res-left"><div class="pump-icon">${icon('percent')}</div><div><div class="res-label">${safeT('result.label')}</div><h2><span id="res-np1-val">0</span> <small id="res-np1-unit">RSD</small></h2></div></div>
            <div class="res-actions">
                <button class="copy-btn" onclick="copyResult('res-np1-val', 'res-np1-unit', event)">${safeT('result.copy')}</button>
                <button class="copy-btn" data-category="NOVAC" data-label="Procenat" onclick="saveHistory(this)">${safeT('result.save')}</button>
                <button class="copy-btn" data-category="NOVAC" data-label="Procenat" onclick="shareResult(this)">${safeT('result.share')}</button>
            </div>
            <div class="pct-formula" id="np1-formula"></div>
        </div>
    `;
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
                <button class="copy-btn" style="margin-top:10px; width:100%;" onclick="toggleAmortPreview()" id="amort-toggle-btn">${safeT('btn.show12months')}</button>
            </div>
        </div>
    `;
}
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
                <div class="rate-info-row">
                    <span class="rate-info-label">${safeT('label.rate.perInstallment')}</span>
                    <span class="rate-info-value accent" id="res-rate-per">0 RSD</span>
                </div>
                <div class="rate-info-row">
                    <span class="rate-info-label">${safeT('label.rate.totalPayment')}</span>
                    <span class="rate-info-value" id="res-rate-total">0 RSD</span>
                </div>
                <div class="rate-info-row">
                    <span class="rate-info-label">${safeT('label.rate.totalInterest')}</span>
                    <span class="rate-info-value" id="res-rate-interest">0 RSD</span>
                </div>
            </div>
            <div class="rate-actions">
                <button class="rate-action-btn rate-action-primary" onclick="saveInstallmentsAsReminders()">
                    💾 ${safeT('label.rate.saveReminders')}
                </button>
            </div>
            <div class="rate-table-wrap" style="margin-top: 14px;">
                <div id="rate-table-body"></div>
            </div>
        </div>
    `;
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

function calculateMoney() {
    const price = num('money-price'), discount = num('money-discount');
    if (!price || discount === null || discount < 0 || discount > 100) { showToast(safeT('toast.error.enterPriceDiscount'), 'error'); return; }
    const saved = price * (discount / 100);
    const mf = el('res-money-final'); if (mf) mf.innerText = money(price - saved);
    const ms = el('stat-money-saved'); if (ms) ms.innerText = money(saved) + ' RSD';
    show('money-result-box'); show('money-stats-row');
}
function calculatePDV() {
    const amount = num('pdv-amount');
    let rate = num('pdv-rate');
    const type = el('pdv-type') ? el('pdv-type').value : 'add';
    if (!amount) { showToast(safeT('toast.error.enterAmount'), 'error'); return; }
    if (rate === null) rate = 20;
    let base, tax, total;
    if (type === 'add') { base = amount; tax = base * (rate / 100); total = base + tax; }
    else { total = amount; base = total / (1 + rate / 100); tax = total - base; }
    const pt = el('res-pdv-total'); if (pt) pt.innerText = money(total);
    const pb = el('stat-pdv-base'); if (pb) pb.innerText = money(base) + ' RSD';
    const px = el('stat-pdv-tax'); if (px) px.innerText = money(tax) + ' RSD';
    show('pdv-result-box'); show('pdv-stats-row');
}
function percentAddSub(base, pct, op) {
    if (base === null || pct === null) return null;
    const factor = op === 'add' ? 1 + pct / 100 : 1 - pct / 100;
    const result = base * factor;
    const sign = op === 'add' ? '+' : '−';
    return { result, formula: `${fmt(base)} ${sign} ${fmt(pct)}% = ${fmt(base)} × ${fmt(factor, 4)} = ${fmt(result)}` };
}
function setFormula(id, text) {
    const e = el(id);
    if (!e) return;
    if (text) { e.textContent = text; e.classList.add('show'); }
    else { e.textContent = ''; e.classList.remove('show'); }
}
function calculateMoneyPercent1() {
    const base = num('np-base'), pct = num('np-val');
    const op = el('np-op') ? el('np-op').value : 'add';
    if (base === null || pct === null) { showToast(safeT('toast.error.enterPricePercent'), 'error'); return; }
    const res = percentAddSub(base, pct, op);
    if (!res) return;
    const rv = el('res-np1-val'); if (rv) rv.innerText = money(res.result);
    const ru = el('res-np1-unit'); if (ru) ru.innerText = 'RSD';
    setFormula('np1-formula', res.formula + ' RSD');
    show('np1-result-box');
}
let currentAmortData = null;
let amortShowAll = false;
function calculateLoan() {
    const currency = el('credit-currency') ? el('credit-currency').value : 'RSD';
    const amount = num('loan-amount'), rateYear = num('loan-rate') || 0, months = num('loan-months');
    if (!amount || !months) { showToast(safeT('toast.error.enterAmountMonths'), 'error'); return; }
    const rateMonth = (rateYear / 100) / 12;
    let monthly;
    if (rateMonth === 0) monthly = amount / months;
    else monthly = (amount * rateMonth * Math.pow(1 + rateMonth, months)) / (Math.pow(1 + rateMonth, months) - 1);
    const totalReturn = monthly * months;
    const totalInterest = totalReturn - amount;
    const lm = el('res-loan-monthly'); if (lm) lm.innerText = money(monthly);
    const lmu = el('res-loan-monthly-unit'); if (lmu) lmu.innerText = currency + '/' + safeT('unit.month');
    const li = el('stat-loan-interest'); if (li) li.innerText = money(totalInterest) + ' ' + currency;
    const lt = el('stat-loan-total'); if (lt) lt.innerText = money(totalReturn) + ' ' + currency;
    show('loan-result-box'); show('loan-stats-row');
    currentAmortData = buildAmortPlan(amount, rateMonth, monthly, months);
    amortShowAll = false;
    renderAmortPlan();
    const w = el('loan-amort-wrap'); if (w) w.style.display = 'block';
}
function buildAmortPlan(principal, rateMonth, monthly, months) {
    const plan = [];
    let remaining = principal;
    for (let m = 1; m <= months; m++) {
        const interest = remaining * rateMonth;
        const principalPart = monthly - interest;
        remaining -= principalPart;
        if (remaining < 0) remaining = 0;
        plan.push({ month: m, payment: monthly, interest, principal: principalPart, balance: remaining });
    }
    return plan;
}
function renderAmortPlan() {
    if (!currentAmortData) return;
    const body = el('amort-body');
    if (body) {
        body.innerHTML = '';
        const rows = amortShowAll ? currentAmortData : currentAmortData.slice(0, 12);
        rows.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${row.month}</td><td>${fmt(row.payment, 0)}</td><td style="color:#f43f5e;">${fmt(row.interest, 0)}</td><td style="color:#10b981;">${fmt(row.principal, 0)}</td><td>${fmt(row.balance, 0)}</td>`;
            body.appendChild(tr);
        });
    }
    const btn = el('amort-toggle-btn');
    if (btn) {
        if (currentAmortData.length <= 12) btn.style.display = 'none';
        else {
            btn.style.display = 'block';
            btn.textContent = amortShowAll ? safeT('btn.showOnly12') : safeT('btn.showAll') + ' (' + currentAmortData.length + ') ' + safeT('unit.monthsShort');
        }
    }
}
function toggleAmortPreview() { amortShowAll = !amortShowAll; renderAmortPlan(); }
function calculateSplit() {
    const total = num('split-total'), people = num('split-people'), tip = num('split-tip') || 0;
    if (!total || !people || people < 1) { showToast(safeT('toast.error.enterAmountPeople'), 'error'); return; }
    const totalWithTip = total * (1 + tip / 100);
    const sv = el('res-split-val'); if (sv) sv.innerText = money(totalWithTip / people);
    const st = el('stat-split-total'); if (st) st.innerText = money(totalWithTip) + ' RSD';
    show('split-result-box'); show('split-stats-row');
}
function calculateTip() {
    const bill = num('tip-bill'), percent = num('tip-percent'), people = num('tip-people') || 1;
    if (!bill || percent === null) { showToast(safeT('toast.error.enterAmountPercent'), 'error'); return; }
    const tipAmount = bill * (percent / 100);
    const total = bill + tipAmount;
    const tv = el('res-tip-val'); if (tv) tv.innerText = money(tipAmount);
    const tt = el('stat-tip-total'); if (tt) tt.innerText = money(total) + ' RSD';
    const tp = el('stat-tip-per-person'); if (tp) tp.innerText = money(total / people) + ' RSD';
    show('tip-result-box'); show('tip-stats-row');
}

// ---------- RATE (INSTALLMENTS) ----------
let currentInstallmentData = null;

function calculateInstallments() {
    const startAmount = num('rate-start');
    const count = parseInt(num('rate-count')) || 0;
    const firstDate = getTripleDate('rate-first-date');
    const period = el('rate-period') ? el('rate-period').value : 'monthly';
    const interestRate = num('rate-interest') || 0;
    const description = el('rate-description') ? el('rate-description').value.trim() : '';
    if (!startAmount || startAmount <= 0) { showToast(safeT('toast.error.enterAmount'), 'error'); return; }
    if (!count || count < 1 || count > 120) { showToast(safeT('toast.error.enterValue'), 'error'); return; }
    if (!firstDate) { showToast(safeT('toast.error.enterDate'), 'error'); return; }
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
        installments.push({
            number: i + 1,
            date: date.toISOString().slice(0, 10),
            amount: perInstallment,
            paid: false
        });
    }
    currentInstallmentData = {
        startAmount, count, period, interestRate,
        description: description || safeT('label.rate.installment'),
        installments, totalPayment, totalInterest,
        createdAt: Date.now()
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
    if (!currentInstallmentData) { showToast('Prvo izračunaj rate', 'error'); return; }
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
}

// ============================================================
// KUPOVINA
// ============================================================
function renderShopUnit() {
    return `<div class="converter-box">${sectionDescKey('desc.shop.unitPrice')}${inputField('label.shop.totalPrice', 'unit-price', 'RSD', 'placeholder="250"')}${inputField('label.shop.quantity', 'unit-qty', '', 'placeholder="1"')}${selectField('label.shop.unit', 'unit-type', [{ value: 'kg', text: 'kg' }, { value: 'g100', text: '100g' }, { value: 'L', text: 'L' }, { value: 'ml100', text: '100ml' }, { value: 'kom', text: 'kom' }, { value: 'm', text: 'm' }])}${calcButton('btn.calculate', 'calculateUnitPrice()')}</div><div id="unit-result-box" class="result-card-green" style="display: none;"><div class="res-left"><div class="pump-icon">${icon('barcode')}</div><div><div class="res-label">${safeT('label.shop.pricePerUnit')}</div><h2><span id="res-unit-price">0</span> <small id="res-unit-label">RSD/kg</small></h2></div></div><div class="res-actions"><button class="copy-btn" onclick="copyResult('res-unit-price', 'res-unit-label', event)">${safeT('result.copy')}</button><button class="copy-btn" data-category="KUPOVINA" data-label="Cena po jedinici" onclick="saveHistory(this)">${safeT('result.save')}</button><button class="copy-btn" data-category="KUPOVINA" data-label="Cena po jedinici" onclick="shareResult(this)">${safeT('result.share')}</button></div></div>`;
}
function renderShopCompare() {
    return `<div class="converter-box">${sectionDescKey('desc.shop.compare')}<div class="compare-group"><div class="compare-title">${safeT('label.shop.productA')}</div>${inputField('label.shop.price', 'cmp-a-price', 'RSD', 'placeholder="200"')}${inputField('label.shop.quantity', 'cmp-a-qty', '', 'placeholder="1"')}${selectField('label.shop.unit', 'cmp-a-unit', [{ value: 'kg', text: 'kg' }, { value: 'g', text: 'g' }, { value: 'L', text: 'L' }, { value: 'ml', text: 'ml' }, { value: 'kom', text: 'kom' }])}</div><div class="compare-group"><div class="compare-title">${safeT('label.shop.productB')}</div>${inputField('label.shop.price', 'cmp-b-price', 'RSD', 'placeholder="180"')}${inputField('label.shop.quantity', 'cmp-b-qty', '', 'placeholder="0.9"')}${selectField('label.shop.unit', 'cmp-b-unit', [{ value: 'kg', text: 'kg' }, { value: 'g', text: 'g' }, { value: 'L', text: 'L' }, { value: 'ml', text: 'ml' }, { value: 'kom', text: 'kom' }])}</div>${calcButton('btn.calculate', 'calculateCompare()')}</div><div id="compare-result-box" class="result-card-green" style="display: none;"><div class="res-left"><div class="pump-icon">${icon('scale')}</div><div><div class="res-label">${safeT('label.shop.compareResult')}</div><h3 id="res-cmp-winner" class="res-text">—</h3></div></div><div class="res-actions"><button class="copy-btn" onclick="copyResult('res-cmp-winner', '', event)">${safeT('result.copy')}</button><button class="copy-btn" data-category="KUPOVINA" data-label="Poređenje" onclick="saveHistory(this)">${safeT('result.save')}</button><button class="copy-btn" data-category="KUPOVINA" data-label="Poređenje" onclick="shareResult(this)">${safeT('result.share')}</button></div></div>${statsRow('compare-stats-row', [['label.shop.productA', 'stat-cmp-a', '0'], ['label.shop.productB', 'stat-cmp-b', '0'], ['label.shop.difference', 'stat-cmp-diff', '0%']])}`;
}
function renderShopPromo() {
    return `<div class="converter-box">${sectionDescKey('desc.shop.promo')}${selectField('label.shop.promoType', 'promo-type', [{ value: '2plus1', text: safeT('option.shop.promo2plus1') }, { value: '3plus1', text: safeT('option.shop.promo3plus1') }, { value: 'second', text: safeT('option.shop.promoSecond') }])}${inputField('label.shop.pricePerPiece', 'promo-price', 'RSD', 'placeholder="200"')}${inputField('label.shop.secondDiscount', 'promo-second-pct', '%', 'placeholder="50"')}${calcButton('btn.calculate', 'calculatePromo()')}</div>${resultCard('promo-result-box', 'gift', 'label.shop.effectiveUnitPrice', 'res-promo-unit', 'RSD', 'KUPOVINA', 'label.shop.promoShort')}${statsRow('promo-stats-row', [['label.shop.youPay', 'stat-promo-total', '0 RSD'], ['label.shop.youGet', 'stat-promo-qty', '0'], ['label.shop.savings', 'stat-promo-save', '0 RSD']])}`;
}
function renderShopLista() {
    return `<div class="converter-box"><div class="lista-head"><div class="section-desc" style="margin:0;">${safeT('desc.shop.list')}</div><button class="lista-clear-btn" onclick="clearShoppingList()">${safeT('btn.clearWholeList')}</button></div>${inputFieldText('label.shop.itemName', 'lista-name', 'npr. Mleko')}${inputFieldText('label.shop.qtyOptional', 'lista-qty', 'npr. 2L')}${inputField('label.shop.estimatedPrice', 'lista-price', 'RSD', 'placeholder="120"')}${calcButton('btn.shop.addItem', 'addShoppingItem()')}</div><div id="lista-box" class="converter-box" style="display:none;"><div class="lista-head"><div class="lista-progress" id="lista-progress">0 / 0</div><button class="lista-clear-btn" onclick="clearBoughtItems()">${safeT('btn.clearBought')}</button></div><div id="lista-items"></div><div class="lista-total"><div class="lista-total-left"><div class="lista-total-label">${safeT('label.shop.total')}</div><div class="lista-total-value" id="lista-total">0 RSD</div></div><div class="lista-total-right"><div class="lista-total-label">${safeT('label.shop.remaining')}</div><div class="lista-total-value" id="lista-remaining">0 RSD</div></div></div></div>`;
}
function renderShopBudzet() {
    return `<div class="converter-box">${sectionDescKey('desc.shop.budget')}${inputField('label.shop.totalBudget', 'budzet-total', 'RSD', 'placeholder="30000"')}${selectField('label.shop.period', 'budzet-period', [{ value: '7', text: safeT('option.shop.week') }, { value: '14', text: safeT('option.shop.twoWeeks') }, { value: '30', text: safeT('option.shop.month') }])}${inputField('label.shop.alreadySpent', 'budzet-spent', 'RSD', 'placeholder="0"')}${calcButton('btn.calculate', 'calculateBudget()')}</div>${resultCard('budzet-result-box', 'calendarSm', 'label.shop.dailyLimit', 'res-budzet-daily', 'RSD', 'KUPOVINA', 'label.shop.budgetShort')}${statsRow('budzet-stats-row', [['label.shop.untilEndOfPeriod', 'stat-budzet-left', '0 RSD'], ['label.shop.daysCount', 'stat-budzet-days', '0'], ['label.shop.dailyUntilEnd', 'stat-budzet-recalc', '0 RSD']])}`;
}
function renderShopRate() {
    return `<div class="converter-box">${sectionDescKey('desc.shop.rate')}${inputField('label.shop.regularPrice', 'rate-cena', 'RSD', 'placeholder="120000"')}${inputField('label.shop.installmentsCount', 'rate-br', '', 'placeholder="24"')}${inputField('label.shop.cashPrice', 'rate-kes', 'RSD', 'placeholder="110000"')}${inputField('label.shop.annualInflation', 'rate-infl', '%', 'placeholder="5"')}${calcButton('btn.calculate', 'calculateRates()')}</div><div id="rate-result-box" class="result-card-green" style="display: none;"><div class="res-left"><div class="pump-icon">${icon('creditCard')}</div><div><div class="res-label">${safeT('label.shop.moreCostEffective')}</div><h3 id="res-rate-winner" class="res-text">—</h3></div></div><div class="res-actions"><button class="copy-btn" onclick="copyResult('res-rate-winner', '', event)">${safeT('result.copy')}</button><button class="copy-btn" data-category="KUPOVINA" data-label="Rate" onclick="saveHistory(this)">${safeT('result.save')}</button><button class="copy-btn" data-category="KUPOVINA" data-label="Rate" onclick="shareResult(this)">${safeT('result.share')}</button></div></div>${statsRow('rate-stats-row', [['label.shop.monthlyPayment', 'stat-rate-monthly', '0 RSD'], ['label.shop.totalOnInstallments', 'stat-rate-total', '0 RSD'], ['label.shop.cashSavings', 'stat-rate-saving', '0 RSD']])}`;
}
function renderShopKartice() {
    return `<div class="converter-box">${sectionDescKey('desc.shop.card')}${inputField('label.shop.price', 'kart-cena', 'RSD', 'placeholder="10000"')}${inputField('label.shop.cashDiscount', 'kart-popust', '%', 'placeholder="5"')}${inputField('label.shop.deferredFee', 'kart-naknada', '%', 'placeholder="0"')}${calcButton('btn.calculate', 'calculateCardVsCash()')}</div><div id="kart-result-box" class="result-card-green" style="display: none;"><div class="res-left"><div class="pump-icon">${icon('banknote')}</div><div><div class="res-label">${safeT('label.shop.moreCostEffective')}</div><h3 id="res-kart-winner" class="res-text">—</h3></div></div><div class="res-actions"><button class="copy-btn" onclick="copyResult('res-kart-winner', '', event)">${safeT('result.copy')}</button><button class="copy-btn" data-category="KUPOVINA" data-label="Kartica" onclick="saveHistory(this)">${safeT('result.save')}</button><button class="copy-btn" data-category="KUPOVINA" data-label="Kartica" onclick="shareResult(this)">${safeT('result.share')}</button></div></div>${statsRow('kart-stats-row', [['label.shop.cash', 'stat-kart-kes', '0 RSD'], ['label.shop.card', 'stat-kart-kart', '0 RSD'], ['label.shop.difference', 'stat-kart-diff', '0 RSD']])}`;
}
function renderShopLitar() {
    return `<div class="converter-box">${sectionDescKey('desc.shop.perLiter')}${inputField('label.shop.packagePrice', 'litar-cena', 'RSD', 'placeholder="180"')}${inputField('label.shop.packageVolume', 'litar-qty', '', 'placeholder="1"')}${selectField('label.shop.unit', 'litar-unit', [{ value: 'L', text: 'L' }, { value: 'ml', text: 'ml' }, { value: 'dl', text: 'dL' }])}${calcButton('btn.calculate', 'calculatePerLiter()')}</div>${resultCard('litar-result-box', 'droplets', 'label.shop.pricePerLiter', 'res-litar-val', 'RSD', 'KUPOVINA', 'label.shop.perLiterShort')}${statsRow('litar-stats-row', [['label.shop.pricePerDl', 'stat-litar-dl', '0 RSD'], ['label.shop.pricePer100ml', 'stat-litar-ml100', '0 RSD']])}`;
}
function renderShopOsoba() {
    return `<div class="converter-box">${sectionDescKey('desc.shop.perPerson')}${inputField('label.shop.totalCost', 'osoba-total', 'RSD', 'placeholder="6000"')}${inputField('label.money.peopleCount', 'osoba-br', '', 'value="4"')}${inputField('label.shop.daysCount', 'osoba-dana', '', 'value="1"')}${calcButton('btn.calculate', 'calculatePerPerson()')}</div>${resultCard('osoba-result-box', 'users', 'label.shop.costPerPerson', 'res-osoba-val', 'RSD', 'KUPOVINA', 'label.shop.perPersonShort')}${statsRow('osoba-stats-row', [['label.shop.perPersonDaily', 'stat-osoba-dan', '0 RSD'], ['label.shop.totalDaily', 'stat-osoba-ukupno', '0 RSD']])}`;
}
function renderShopIsplati() {
    return `<div class="converter-box">${sectionDescKey('desc.shop.worthTrip')}${inputField('label.shop.savingsPerItem', 'isplati-usteda', 'RSD', 'placeholder="200"')}${inputField('label.shop.itemsCount', 'isplati-br', '', 'value="5"')}${inputField('label.shop.oneWayDistance', 'isplati-dist', 'km', 'placeholder="20"')}${inputField('label.shop.carConsumption', 'isplati-potrosnja', 'L/100km', 'value="7"')}${inputField('label.shop.fuelPrice', 'isplati-gorivo', 'RSD', 'value="180"')}${calcButton('btn.calculate', 'calculateWorthTrip()')}</div><div id="isplati-result-box" class="result-card-green" style="display: none;"><div class="res-left"><div class="pump-icon">${icon('target')}</div><div><div class="res-label">${safeT('label.shop.worthIt')}</div><h3 id="res-isplati-verdict" class="res-text">—</h3></div></div><div class="res-actions"><button class="copy-btn" onclick="copyResult('res-isplati-verdict', '', event)">${safeT('result.copy')}</button><button class="copy-btn" data-category="KUPOVINA" data-label="Isplati" onclick="saveHistory(this)">${safeT('result.save')}</button><button class="copy-btn" data-category="KUPOVINA" data-label="Isplati" onclick="shareResult(this)">${safeT('result.share')}</button></div></div>${statsRow('isplati-stats-row', [['label.shop.savings', 'stat-isplati-usteda', '0 RSD'], ['label.shop.tripCost', 'stat-isplati-trosak', '0 RSD'], ['label.shop.net', 'stat-isplati-neto', '0 RSD']])}`;
}
function renderShopRacuni() {
    return `<div class="converter-box">${sectionDescKey('desc.shop.receipts')}<div class="compare-group"><div class="compare-title">${safeT('label.shop.receiptA')}</div>${inputField('label.shop.totalPrice', 'rac-a-total', 'RSD', 'placeholder="5000"')}${inputField('label.shop.itemsCount', 'rac-a-items', '', 'placeholder="20"')}</div><div class="compare-group"><div class="compare-title">${safeT('label.shop.receiptB')}</div>${inputField('label.shop.totalPrice', 'rac-b-total', 'RSD', 'placeholder="4500"')}${inputField('label.shop.itemsCount', 'rac-b-items', '', 'placeholder="18"')}</div>${calcButton('btn.calculate', 'calculateReceipts()')}</div><div id="racuni-result-box" class="result-card-green" style="display: none;"><div class="res-left"><div class="pump-icon">${icon('receipt')}</div><div><div class="res-label">${safeT('label.shop.receiptCompare')}</div><h3 id="res-rac-winner" class="res-text">—</h3></div></div><div class="res-actions"><button class="copy-btn" onclick="copyResult('res-rac-winner', '', event)">${safeT('result.copy')}</button><button class="copy-btn" data-category="KUPOVINA" data-label="Računi" onclick="saveHistory(this)">${safeT('result.save')}</button><button class="copy-btn" data-category="KUPOVINA" data-label="Računi" onclick="shareResult(this)">${safeT('result.share')}</button></div></div>${statsRow('racuni-stats-row', [['label.shop.averageA', 'stat-rac-a', '0 RSD'], ['label.shop.averageB', 'stat-rac-b', '0 RSD'], ['label.shop.difference', 'stat-rac-diff', '0%']])}`;
}
function renderShopRasipanje() {
    return `<div class="converter-box">${sectionDescKey('desc.shop.mealCost')}${inputField('label.shop.groceryPrice', 'rasip-cena', 'RSD', 'placeholder="500"')}${inputField('label.shop.mealsCount', 'rasip-porcija', '', 'placeholder="4"')}${inputField('label.shop.wastePercent', 'rasip-bacanje', '%', 'placeholder="0"')}${calcButton('btn.calculate', 'calculateMealCost()')}</div>${resultCard('rasip-result-box', 'packageSm', 'label.shop.costPerMeal', 'res-rasip-val', 'RSD', 'KUPOVINA', 'label.shop.perMealShort')}${statsRow('rasip-stats-row', [['label.shop.withoutWaste', 'stat-rasip-base', '0 RSD'], ['label.shop.wasteCost', 'stat-rasip-waste', '0 RSD']])}`;
}

function calculateUnitPrice() {
    const price = num('unit-price'), qty = num('unit-qty');
    const type = el('unit-type') ? el('unit-type').value : 'kg';
    if (!price || !qty) { showToast(safeT('toast.error.enterPriceQty'), 'error'); return; }
    let result, label;
    if (type === 'kg') { result = price / qty; label = 'RSD/kg'; }
    else if (type === 'g100') { result = (price / qty) * 100; label = 'RSD/100g'; }
    else if (type === 'L') { result = price / qty; label = 'RSD/L'; }
    else if (type === 'ml100') { result = (price / qty) * 100; label = 'RSD/100ml'; }
    else if (type === 'kom') { result = price / qty; label = 'RSD/' + safeT('unit.pcsShort'); }
    else { result = price / qty; label = 'RSD/m'; }
    const up = el('res-unit-price'); if (up) up.innerText = money(result);
    const ul = el('res-unit-label'); if (ul) ul.innerText = label;
    show('unit-result-box');
}
function calculateCompare() {
    const aPrice = num('cmp-a-price'), aQty = num('cmp-a-qty');
    const aUnit = el('cmp-a-unit') ? el('cmp-a-unit').value : 'kg';
    const bPrice = num('cmp-b-price'), bQty = num('cmp-b-qty');
    const bUnit = el('cmp-b-unit') ? el('cmp-b-unit').value : 'kg';
    if (!aPrice || !aQty || !bPrice || !bQty) { showToast(safeT('toast.error.enterAll'), 'error'); return; }
    function toBase(price, qty, unit) {
        if (unit === 'kg' || unit === 'L' || unit === 'kom') return price / qty;
        if (unit === 'g' || unit === 'ml') return price / (qty / 1000);
        return price / qty;
    }
    const aBase = toBase(aPrice, aQty, aUnit), bBase = toBase(bPrice, bQty, bUnit);
    const winner = aBase < bBase ? safeT('label.shop.productACheaper') : (bBase < aBase ? safeT('label.shop.productBCheaper') : safeT('label.shop.samePrice'));
    const cw = el('res-cmp-winner'); if (cw) cw.innerText = winner;
    const ca = el('stat-cmp-a'); if (ca) ca.innerText = money(aBase);
    const cb = el('stat-cmp-b'); if (cb) cb.innerText = money(bBase);
    const cd = el('stat-cmp-diff'); if (cd) cd.innerText = fmt(Math.abs(aBase - bBase) / Math.max(aBase, bBase) * 100, 1) + '%';
    show('compare-result-box'); show('compare-stats-row');
}
function calculatePromo() {
    const type = el('promo-type') ? el('promo-type').value : '2plus1';
    const price = num('promo-price');
    if (!price) { showToast(safeT('toast.error.enterPricePerPiece'), 'error'); return; }
    let totalPaid, totalQty, saved;
    if (type === '2plus1') { totalPaid = price * 2; totalQty = 3; saved = price * 3 - totalPaid; }
    else if (type === '3plus1') { totalPaid = price * 3; totalQty = 4; saved = price * 4 - totalPaid; }
    else { const secondPct = num('promo-second-pct') || 50; totalPaid = price + price * (1 - secondPct / 100); totalQty = 2; saved = price * 2 - totalPaid; }
    const pu = el('res-promo-unit'); if (pu) pu.innerText = money(totalPaid / totalQty);
    const pt = el('stat-promo-total'); if (pt) pt.innerText = money(totalPaid) + ' RSD';
    const pq = el('stat-promo-qty'); if (pq) pq.innerText = totalQty;
    const ps = el('stat-promo-save'); if (ps) ps.innerText = money(saved) + ' RSD';
    show('promo-result-box'); show('promo-stats-row');
}
function loadShoppingList() {
    try { const raw = JSON.parse(localStorage.getItem('cx_shopping_list_v1')); if (Array.isArray(raw)) return raw; } catch (e) {}
    return [];
}
function saveShoppingList(list) {
    try { localStorage.setItem('cx_shopping_list_v1', JSON.stringify(list)); } catch (e) {}
}
function addShoppingItem() {
    const nameEl = el('lista-name'), qtyEl = el('lista-qty'), priceEl = el('lista-price');
    if (!nameEl) return;
    const name = nameEl.value.trim();
    if (!name) { showToast(safeT('toast.error.enterItemName'), 'error'); return; }
    const list = loadShoppingList();
    list.push({ id: Date.now() + Math.random(), name, qty: qtyEl ? qtyEl.value.trim() : '', price: priceEl ? (parseNum(priceEl.value) || 0) : 0, bought: false, date: Date.now() });
    saveShoppingList(list);
    renderShoppingList();
    nameEl.value = '';
    if (qtyEl) qtyEl.value = '';
    if (priceEl) priceEl.value = '';
    showToast(safeT('toast.itemAdded'), 'success', 1400);
    vibrate(15);
    nameEl.focus();
}
function toggleShoppingItem(id) {
    const list = loadShoppingList();
    const item = list.find(i => i.id === id);
    if (!item) return;
    item.bought = !item.bought;
    saveShoppingList(list); renderShoppingList(); vibrate(10);
}
function removeShoppingItem(id) {
    let list = loadShoppingList();
    list = list.filter(i => i.id !== id);
    saveShoppingList(list); renderShoppingList(); vibrate(15);
}
async function clearBoughtItems() {
    const list = loadShoppingList();
    const boughtCount = list.filter(i => i.bought).length;
    if (!boughtCount) { showToast(safeT('toast.noBoughtItems'), 'info', 1500); return; }
    const ok = await showConfirm(safeT('confirm.clearBought').replace('{0}', boughtCount));
    if (!ok) return;
    saveShoppingList(list.filter(i => !i.bought)); renderShoppingList();
    showToast(safeT('toast.boughtCleared'), 'success', 1500);
}
async function clearShoppingList() {
    const list = loadShoppingList();
    if (!list.length) { showToast(safeT('toast.listEmpty'), 'info', 1500); return; }
    const ok = await showConfirm(safeT('confirm.clearList'));
    if (!ok) return;
    saveShoppingList([]); renderShoppingList();
    showToast(safeT('toast.listCleared'), 'success', 1500);
}
function renderShoppingList() {
    const list = loadShoppingList();
    const box = el('lista-box'), itemsWrap = el('lista-items');
    const progress = el('lista-progress'), totalEl = el('lista-total'), remainEl = el('lista-remaining');
    if (!box || !itemsWrap) return;
    if (!list.length) { box.style.display = 'none'; return; }
    box.style.display = 'flex';
    itemsWrap.innerHTML = '';
    const boughtCount = list.filter(i => i.bought).length;
    if (progress) progress.textContent = `${boughtCount} / ${list.length} ${safeT('label.shop.bought')}`;
    let total = 0, remaining = 0;
    list.forEach(item => {
        total += item.price || 0;
        if (!item.bought) remaining += item.price || 0;
        const row = document.createElement('div');
        row.className = 'lista-item' + (item.bought ? ' bought' : '');
        const check = document.createElement('button');
        check.className = 'lista-check';
        check.textContent = item.bought ? '✓' : '';
        check.addEventListener('click', () => toggleShoppingItem(item.id));
        const info = document.createElement('div');
        info.className = 'lista-item-info';
        const nameEl = document.createElement('div');
        nameEl.className = 'lista-item-name';
        nameEl.textContent = item.name;
        info.appendChild(nameEl);
        if (item.qty) { const q = document.createElement('div'); q.className = 'lista-item-qty'; q.textContent = item.qty; info.appendChild(q); }
        const priceEl = document.createElement('div');
        priceEl.className = 'lista-item-price';
        priceEl.textContent = item.price > 0 ? money(item.price) + ' RSD' : '—';
        const removeBtn = document.createElement('button');
        removeBtn.className = 'lista-item-remove';
        removeBtn.textContent = '✕';
        removeBtn.addEventListener('click', () => removeShoppingItem(item.id));
        row.appendChild(check); row.appendChild(info); row.appendChild(priceEl); row.appendChild(removeBtn);
        itemsWrap.appendChild(row);
    });
    if (totalEl) totalEl.textContent = money(total) + ' RSD';
    if (remainEl) remainEl.textContent = money(remaining) + ' RSD';
}
function calculateBudget() {
    const total = num('budzet-total');
    const period = el('budzet-period') ? parseInt(el('budzet-period').value) : 30;
    const spent = num('budzet-spent') || 0;
    if (!total || total <= 0) { showToast(safeT('toast.error.enterBudget'), 'error'); return; }
    const daily = total / period, left = Math.max(0, total - spent);
    const rd = el('res-budzet-daily'); if (rd) rd.innerText = money(daily);
    const sl = el('stat-budzet-left'); if (sl) sl.innerText = money(left) + ' RSD';
    const sd = el('stat-budzet-days'); if (sd) sd.innerText = period + ' ' + safeT('unit.daysShort');
    const sr = el('stat-budzet-recalc'); if (sr) sr.innerText = money(left / period) + ' RSD';
    show('budzet-result-box'); show('budzet-stats-row');
}
function calculateRates() {
    const cena = num('rate-cena'), br = num('rate-br'), kes = num('rate-kes'), infl = num('rate-infl') || 0;
    if (!cena || !br || !kes) { showToast(safeT('toast.error.enterAll'), 'error'); return; }
    const kesSaInfl = kes * Math.pow(1 + infl / 100, br / 12);
    const saving = cena - kesSaInfl;
    const winner = kesSaInfl < cena ? safeT('label.shop.cashBetter') : (kesSaInfl > cena ? safeT('label.shop.ratesBetter') : safeT('label.shop.same'));
    const rw = el('res-rate-winner'); if (rw) rw.innerText = winner;
    const sm = el('stat-rate-monthly'); if (sm) sm.innerText = money(cena / br) + ' RSD';
    const st = el('stat-rate-total'); if (st) st.innerText = money(cena) + ' RSD';
    const sv = el('stat-rate-saving'); if (sv) sv.innerText = money(saving) + ' RSD';
    show('rate-result-box'); show('rate-stats-row');
}
function calculateCardVsCash() {
    const cena = num('kart-cena'), popust = num('kart-popust') || 0, naknada = num('kart-naknada') || 0;
    if (!cena) { showToast(safeT('toast.error.enterPrice'), 'error'); return; }
    const kes = cena * (1 - popust / 100), kartica = cena * (1 + naknada / 100);
    const winner = kes < kartica ? safeT('label.shop.cashBetter') : (kartica < kes ? safeT('label.shop.cardBetter') : safeT('label.shop.same'));
    const rw = el('res-kart-winner'); if (rw) rw.innerText = winner;
    const sk = el('stat-kart-kes'); if (sk) sk.innerText = money(kes) + ' RSD';
    const ska = el('stat-kart-kart'); if (ska) ska.innerText = money(kartica) + ' RSD';
    const sd = el('stat-kart-diff'); if (sd) sd.innerText = money(Math.abs(kartica - kes)) + ' RSD';
    show('kart-result-box'); show('kart-stats-row');
}
function calculatePerLiter() {
    const cena = num('litar-cena'), qty = num('litar-qty');
    const unit = el('litar-unit') ? el('litar-unit').value : 'L';
    if (!cena || !qty) { showToast(safeT('toast.error.enterPriceVolume'), 'error'); return; }
    let liters = qty;
    if (unit === 'ml') liters = qty / 1000;
    else if (unit === 'dl') liters = qty / 10;
    const perL = cena / liters;
    const rv = el('res-litar-val'); if (rv) rv.innerText = money(perL);
    const sd = el('stat-litar-dl'); if (sd) sd.innerText = money(perL / 10) + ' RSD';
    const sm = el('stat-litar-ml100'); if (sm) sm.innerText = money(perL / 10) + ' RSD';
    show('litar-result-box'); show('litar-stats-row');
}
function calculatePerPerson() {
    const total = num('osoba-total'), br = num('osoba-br') || 1, dana = num('osoba-dana') || 1;
    if (!total) { showToast(safeT('toast.error.enterTotalCost'), 'error'); return; }
    if (br < 1 || dana < 1) { showToast(safeT('toast.error.minOne'), 'error'); return; }
    const rv = el('res-osoba-val'); if (rv) rv.innerText = money(total / br);
    const sd = el('stat-osoba-dan'); if (sd) sd.innerText = money(total / br / dana) + ' RSD';
    const su = el('stat-osoba-ukupno'); if (su) su.innerText = money(total / dana) + ' RSD';
    show('osoba-result-box'); show('osoba-stats-row');
}
function calculateWorthTrip() {
    const usteda = num('isplati-usteda'), br = num('isplati-br') || 1, dist = num('isplati-dist');
    const potrosnja = num('isplati-potrosnja') || 7, gorivo = num('isplati-gorivo') || 180;
    if (!usteda || !dist) { showToast(safeT('toast.error.enterSavingsDistance'), 'error'); return; }
    const ukupnaUsteda = usteda * br;
    const trosakPuta = ((dist * 2 / 100) * potrosnja) * gorivo;
    const neto = ukupnaUsteda - trosakPuta;
    let verdict;
    if (neto > 0) verdict = safeT('label.shop.worthItYes').replace('{0}', money(neto));
    else if (neto < 0) verdict = safeT('label.shop.worthItNo').replace('{0}', money(-neto));
    else verdict = safeT('label.shop.worthItSame');
    const rv = el('res-isplati-verdict'); if (rv) rv.innerText = verdict;
    const su = el('stat-isplati-usteda'); if (su) su.innerText = money(ukupnaUsteda) + ' RSD';
    const st = el('stat-isplati-trosak'); if (st) st.innerText = money(trosakPuta) + ' RSD';
    const sn = el('stat-isplati-neto'); if (sn) sn.innerText = money(neto) + ' RSD';
    show('isplati-result-box'); show('isplati-stats-row');
}
function calculateReceipts() {
    const aTotal = num('rac-a-total'), aItems = num('rac-a-items'), bTotal = num('rac-b-total'), bItems = num('rac-b-items');
    if (!aTotal || !aItems || !bTotal || !bItems) { showToast(safeT('toast.error.enterAll'), 'error'); return; }
    const aAvg = aTotal / aItems, bAvg = bTotal / bItems;
    const winner = aAvg < bAvg ? safeT('label.shop.receiptABetter') : (bAvg < aAvg ? safeT('label.shop.receiptBBetter') : safeT('label.shop.same'));
    const rw = el('res-rac-winner'); if (rw) rw.innerText = winner;
    const sa = el('stat-rac-a'); if (sa) sa.innerText = money(aAvg) + ' RSD';
    const sb = el('stat-rac-b'); if (sb) sb.innerText = money(bAvg) + ' RSD';
    const sd = el('stat-rac-diff'); if (sd) sd.innerText = fmt(Math.abs(aAvg - bAvg) / Math.max(aAvg, bAvg) * 100, 1) + ' %';
    show('racuni-result-box'); show('racuni-stats-row');
}
function calculateMealCost() {
    const cena = num('rasip-cena'), porcija = num('rasip-porcija'), bacanje = num('rasip-bacanje') || 0;
    if (!cena || !porcija) { showToast(safeT('toast.error.enterPriceMeals'), 'error'); return; }
    if (porcija < 1) { showToast(safeT('toast.error.minOneMeal'), 'error'); return; }
    const base = cena / porcija, waste = cena * (bacanje / 100);
    const rv = el('res-rasip-val'); if (rv) rv.innerText = money((cena + waste) / porcija);
    const sb = el('stat-rasip-base'); if (sb) sb.innerText = money(base) + ' RSD';
    const sw = el('stat-rasip-waste'); if (sw) sw.innerText = money(waste) + ' RSD';
    show('rasip-result-box'); show('rasip-stats-row');
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
function renderAutoPlaner() {
    return `
        <div class="converter-box">
            ${sectionDescKey('desc.auto.tripPlanner')}
            ${inputField('label.auto.distance', 'trip-distance', 'km', 'placeholder="300"')}
            ${inputField('label.auto.avgSpeed', 'trip-speed', 'km/h', 'placeholder="80"')}
            <div class="input-field"><label>${safeT('label.auto.departTime')}</label><div class="input-wrapper"><input type="time" id="trip-depart" class="custom-input"></div></div>
            ${inputField('label.auto.breakDuration', 'trip-breaks', 'min', 'placeholder="30"')}
            ${calcButton('btn.calculate', 'calculateTripPlanner()')}
        </div>
        ${resultCard('trip-result-box', 'route', 'label.auto.tripTime', 'res-trip-time', '', 'PUTOVANJE', 'label.auto.tripPlanner')}
        ${statsRow('trip-stats-row', [['label.auto.eta', 'stat-trip-eta', '—'], ['label.auto.totalWithBreaks', 'stat-trip-total', '0']])}
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
function renderAutoPoKm() {
    return `
        <div class="converter-box">
            ${sectionDescKey('desc.auto.costPerKm')}
            ${inputField('label.auto.distancePeriod', 'pokm-dist', 'km', 'placeholder="15000"')}
            ${inputField('label.auto.fuel', 'pokm-fuel-cost', 'RSD', 'placeholder="0"')}
            ${inputField('label.auto.serviceAndMaintenance', 'pokm-service-cost', 'RSD', 'placeholder="0"')}
            ${inputField('label.auto.registrationAndInsurance', 'pokm-reg-cost', 'RSD', 'placeholder="0"')}
            ${calcButton('btn.calculate', 'calculateCostPerKm()')}
        </div>
        ${resultCard('pokm-result-box', 'calculator', 'label.auto.costPerKmFull', 'res-pokm-val', 'RSD/km', 'AUTO', 'label.auto.costPerKm')}
        ${statsRow('pokm-stats-row', [['label.auto.totalCost', 'stat-pokm-total', '0 RSD']])}
    `;
}
function renderAutoMojAuto() {
    return `
        <div class="converter-box">
            ${sectionDescKey('desc.auto.myCar')}
            ${inputFieldText('label.auto.model', 'auto-profile-model', 'npr. VW Golf 7')}
            ${inputFieldText('label.auto.plate', 'auto-profile-plate', 'npr. NP123-AB')}
            ${dateTripleField('label.auto.registrationExpires', 'auto-profile-reg-date')}
            ${dateTripleField('label.auto.technicalExpires', 'auto-profile-teh-date')}
            ${calcButton('btn.saveCarProfile', 'saveAutoProfile()')}
        </div>
        <div id="auto-profile-result-box" class="result-card-green" style="display: none;">
            <div class="res-left"><div class="pump-icon">${icon('car')}</div><div><div class="res-label">${safeT('label.auto.saved')}</div><h3 id="res-auto-profile-val" class="res-text">—</h3></div></div>
        </div>
        ${statsRow('auto-profile-status-row', [['label.auto.registration', 'stat-reg-days', '—'], ['label.auto.technical', 'stat-teh-days', '—']])}
    `;
}

function calculateAuto() {
    const dist = num('distance'), fuel = num('fuel');
    const price = num('price') || 0;
    const currency = el('auto-currency') ? el('auto-currency').value : 'RSD';
    if (!dist || !fuel) { showToast(safeT('toast.error.enterDistanceFuel'), 'error'); return; }
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
    if (currentKm === null || lastService === null || !interval) { showToast(safeT('toast.error.enterAll'), 'error'); return; }
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
    if (total === 0) { showToast(safeT('toast.error.enterAtLeastOne'), 'error'); return; }
    const at = el('res-annual-total'); if (at) at.innerText = money(total);
    const am = el('stat-annual-month'); if (am) am.innerText = money(total / 12) + ' RSD';
    show('annual-result-box'); show('annual-stats-row');
}
function calculateCostPerKm() {
    const dist = num('pokm-dist');
    const fuelCost = num('pokm-fuel-cost') || 0, serviceCost = num('pokm-service-cost') || 0, regCost = num('pokm-reg-cost') || 0;
    if (!dist) { showToast(safeT('toast.error.enterDistance'), 'error'); return; }
    const total = fuelCost + serviceCost + regCost;
    const perKm = total / dist;
    const pv = el('res-pokm-val'); if (pv) pv.innerText = fmt(perKm, 2);
    const pt = el('stat-pokm-total'); if (pt) pt.innerText = money(total) + ' RSD';
    show('pokm-result-box'); show('pokm-stats-row');
}
function calculateTripPlanner() {
    const distance = num('trip-distance'), speed = num('trip-speed');
    const departVal = el('trip-depart') ? el('trip-depart').value : '';
    const breaks = num('trip-breaks') || 0;
    if (!distance || !speed) { showToast(safeT('toast.error.enterDistanceSpeed'), 'error'); return; }
    const driveHours = distance / speed;
    const totalMinutes = driveHours * 60 + breaks;
    const dh = Math.floor(driveHours), dm = Math.round((driveHours - dh) * 60);
    const rt = el('res-trip-time'); if (rt) rt.innerText = dh > 0 ? `${dh}h ${dm}min` : `${dm}min`;
    const th = Math.floor(totalMinutes / 60), tm = Math.round(totalMinutes % 60);
    const st = el('stat-trip-total'); if (st) st.innerText = th > 0 ? `${th}h ${tm}min` : `${tm}min`;
    const e = el('stat-trip-eta');
    if (departVal && e) {
        const [h, m] = departVal.split(':').map(Number);
        const departDate = new Date(); departDate.setHours(h, m, 0, 0);
        const etaDate = new Date(departDate.getTime() + totalMinutes * 60000);
        e.innerText = String(etaDate.getHours()).padStart(2, '0') + ':' + String(etaDate.getMinutes()).padStart(2, '0');
    } else if (e) e.innerText = '—';
    show('trip-result-box'); show('trip-stats-row');
}
function calculateRoadTrip() {
    const distance = num('road-distance'), consumption = num('road-consumption'), price = num('road-price');
    const toll = num('road-toll') || 0, parking = num('road-parking') || 0, other = num('road-other') || 0;
    const people = num('road-people') || 1;
    if (!distance || !consumption || !price) { showToast(safeT('toast.error.enterAll'), 'error'); return; }
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
function loadAutoProfile() {
    try { return JSON.parse(localStorage.getItem('cx_auto_profile')) || {}; } catch (e) { return {}; }
}
function saveAutoProfileData(p) {
    try { localStorage.setItem('cx_auto_profile', JSON.stringify(p)); } catch (e) {}
}
function daysUntil(dateStr) {
    if (!dateStr) return null;
    const target = parseDate(dateStr);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return Math.round((target - today) / 86400000);
}
function formatDaysLeft(days) {
    if (days === null) return '—';
    if (days < 0) return safeT('label.auto.expiredAgo') + ' ' + Math.abs(days) + ' ' + safeT('unit.daysShort');
    if (days === 0) return safeT('label.auto.expiresToday');
    return safeT('label.auto.daysLeft') + ' ' + days + ' ' + safeT('unit.daysShort');
}
function colorForDays(days) {
    if (days === null) return '';
    if (days < 0) return '#f43f5e';
    if (days <= 30) return '#f59e0b';
    return '#10b981';
}
function updateAutoStatus() {
    try {
        const p = loadAutoProfile();
        if (!p.regDate && !p.tehDate) { hide('auto-profile-status-row'); return; }
        const regDays = daysUntil(p.regDate), tehDays = daysUntil(p.tehDate);
        const regEl = el('stat-reg-days'), tehEl = el('stat-teh-days');
        if (regEl) { regEl.innerText = formatDaysLeft(regDays); regEl.style.color = colorForDays(regDays); }
        if (tehEl) { tehEl.innerText = formatDaysLeft(tehDays); tehEl.style.color = colorForDays(tehDays); }
        const row = el('auto-profile-status-row'); if (row) row.style.display = 'flex';
    } catch (e) {}
}
function saveAutoProfile() {
    try {
        const profile = {
            model: el('auto-profile-model') ? el('auto-profile-model').value.trim() : '',
            plate: el('auto-profile-plate') ? el('auto-profile-plate').value.trim() : '',
            regDate: getTripleDate('auto-profile-reg-date'),
            tehDate: getTripleDate('auto-profile-teh-date')
        };
        saveAutoProfileData(profile);
        const rv = el('res-auto-profile-val');
        if (rv) rv.innerText = profile.model ? `${profile.model}${profile.plate ? ' (' + profile.plate + ')' : ''}` : safeT('label.auto.dataSaved');
        show('auto-profile-result-box');
        showToast(safeT('toast.carSaved'), 'success');
        updateAutoStatus();
    } catch (e) {}
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
function renderBikeTabela() {
    return `
        <div class="converter-box">
            ${sectionDescKey('desc.bike.gearTable')}
            ${inputFieldText('label.bike.frontChainrings', 'gear-fronts', '34,50')}
            ${inputFieldText('label.bike.rearChainrings', 'gear-rears', '11,13,15,17,19,21,23,25,28,32')}
            ${inputField('label.bike.wheelSize', 'gear-wheel', 'inča', 'placeholder="29"')}
            ${inputField('label.bike.cadence', 'gear-cadence', 'rpm', 'placeholder="90"')}
            ${calcButton('btn.calculate', 'calculateGearTable()')}
        </div>
        <div id="gear-table-wrap" style="display:none;">
            <div id="gear-table-real" class="converter-box gear-table-box">
                <div id="gear-table-scroll"><table id="gear-table" class="gear-table"></table></div>
            </div>
        </div>
    `;
}

function calculateBike() {
    const front = num('bike-front'), rear = num('bike-rear'), cadence = num('bike-cadence'), wheelInch = num('bike-wheel-inch');
    if (!front || !rear || !cadence || !wheelInch) { showToast(safeT('toast.error.enterFour'), 'error'); return; }
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
    if (!weight || !width) { showToast(safeT('toast.error.enterWeightWidth'), 'error'); return; }
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
    if (!height) { showToast(safeT('toast.error.enterHeight'), 'error'); return; }
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
    if (!weight || !timeMinutes || !speed) { showToast(safeT('toast.error.enterAll'), 'error'); return; }
    let met = 8.0;
    if (speed < 15) met = 6.0; else if (speed < 20) met = 8.0; else if (speed < 25) met = 10.0; else met = 12.0;
    const bc = el('res-bike-calories'); if (bc) bc.innerText = fmt(met * weight * (timeMinutes / 60), 0);
    show('bike-cal-result-box');
}
function calculateGearTable() {
    const frontsRaw = el('gear-fronts') ? el('gear-fronts').value : '';
    const rearsRaw = el('gear-rears') ? el('gear-rears').value : '';
    const wheelInch = num('gear-wheel') || 29, cadence = num('gear-cadence') || 90;
    const fronts = frontsRaw.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n) && n > 0);
    const rears = rearsRaw.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n) && n > 0);
    if (!fronts.length || !rears.length) { showToast(safeT('toast.error.enterChainrings'), 'error'); return; }
    const wheelCircumference = wheelInch * 0.0254 * Math.PI;
    const table = el('gear-table'); if (!table) return;
    table.innerHTML = '';
    const headRow = document.createElement('tr');
    headRow.innerHTML = '<th>' + safeT('table.rearFront') + '</th>' + fronts.map(f => `<th>${f}</th>`).join('');
    table.appendChild(headRow);
    rears.forEach(r => {
        const row = document.createElement('tr');
        let cells = `<td class="gear-row-label">${r}</td>`;
        fronts.forEach(f => { cells += `<td>${fmt((cadence * (f / r) * wheelCircumference * 60) / 1000, 1)}</td>`; });
        row.innerHTML = cells;
        table.appendChild(row);
    });
    const wrap = el('gear-table-wrap'); if (wrap) wrap.style.display = 'block';
    vibrate(15);
}

// ============================================================
// ZDRAVLJE
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
function renderHealthBikeFit() {
    return `<div class="converter-box">${sectionDescKey('desc.health.bikeFit')}${inputField('label.health.distance', 'fitbike-distance', 'km', 'placeholder="20"')}${inputField('label.health.timeMin', 'fitbike-min', 'min', 'placeholder="60"')}${inputField('label.health.riderWeight', 'fitbike-weight', 'kg', 'placeholder="75"')}${calcButton('btn.calculate', 'calculateBikeFitness()')}</div>${resultCard('fitbike-result-box', 'bike', 'label.health.avgSpeed', 'res-fitbike-speed', 'km/h', 'ZDRAVLJE', 'label.health.bikeFitFull')}${statsRow('fitbike-stats-row', [['label.health.caloriesEstimated', 'stat-fitbike-cal', '0 kcal']])}`;
}
function renderHealth1RM() {
    return `<div class="converter-box">${sectionDescKey('desc.health.rm1')}${inputField('label.health.weight', 'rm1-weight', 'kg', 'placeholder="80"')}${inputField('label.health.reps', 'rm1-reps', '', 'placeholder="5"')}${calcButton('btn.calculate', 'calculate1RM()')}</div>${resultCard('rm1-result-box', 'dumbbell', 'label.health.rm1Estimate', 'res-rm1-val', 'kg', 'ZDRAVLJE', 'label.health.rm1')}${statsRow('rm1-stats-row', [['label.health.rm1_90', 'stat-rm1-90', '—'], ['label.health.rm1_80', 'stat-rm1-80', '—']])}`;
}
function renderHealthVolume() {
    return `<div class="converter-box">${sectionDescKey('desc.health.volume')}${inputField('label.health.weight', 'vol-weight', 'kg', 'placeholder="60"')}${inputField('label.health.reps', 'vol-reps', '', 'placeholder="10"')}${inputField('label.health.sets', 'vol-sets', '', 'placeholder="3"')}${calcButton('btn.calculate', 'calculateWorkoutVolume()')}</div>${resultCard('vol-result-box', 'activity', 'label.health.totalVolume', 'res-vol-val', 'kg', 'ZDRAVLJE', 'label.health.volumeShort')}`;
}

function calculateBMI() {
    const weight = num('health-weight'), heightCm = num('health-height'), age = num('health-bmi-age');
    if (!weight || !heightCm) { showToast(safeT('toast.error.enterWeightHeight'), 'error'); return; }
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
    if (!height) { showToast(safeT('toast.error.enterHeight'), 'error'); return; }
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
    if (!weight || !height || !age) { showToast(safeT('toast.error.enterAll'), 'error'); return; }
    let bmr = (10 * weight) + (6.25 * height) - (5 * age) + (gender === 'male' ? 5 : -161);
    const bv = el('res-bmr-val'); if (bv) bv.innerText = fmt(bmr * activity, 0);
    const bb = el('stat-bmr-base'); if (bb) bb.innerText = fmt(bmr, 0) + ' kcal';
    show('bmr-result-box'); show('bmr-stats-row');
}
function calculateHeartRate() {
    const age = num('hr-age');
    if (!age) { showToast(safeT('toast.error.enterAge'), 'error'); return; }
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
    if (!distance) { showToast(safeT('toast.error.enterDistance'), 'error'); return; }
    const totalMinutes = min + (sec / 60);
    if (totalMinutes === 0) { showToast(safeT('toast.error.enterTime'), 'error'); return; }
    const paceMin = totalMinutes / distance;
    const paceMinWhole = Math.floor(paceMin), paceSec = Math.round((paceMin - paceMinWhole) * 60);
    const rp = el('res-run-pace'); if (rp) rp.innerText = `${paceMinWhole}:${String(paceSec).padStart(2, '0')}`;
    const rs = el('stat-run-speed'); if (rs) rs.innerText = fmt(distance / (totalMinutes / 60), 2) + ' km/h';
    const rt = el('stat-run-total'); if (rt) rt.innerText = `${min}min ${sec}s`;
    show('run-result-box'); show('run-stats-row');
}
function calculateBikeFitness() {
    const distance = num('fitbike-distance'), minutes = num('fitbike-min'), weight = num('fitbike-weight');
    if (!distance || !minutes || !weight) { showToast(safeT('toast.error.enterAll'), 'error'); return; }
    const hours = minutes / 60, speed = distance / hours;
    let met = 8.0;
    if (speed < 15) met = 6.0; else if (speed < 20) met = 8.0; else if (speed < 25) met = 10.0; else met = 12.0;
    const fs = el('res-fitbike-speed'); if (fs) fs.innerText = fmt(speed, 2);
    const fc = el('stat-fitbike-cal'); if (fc) fc.innerText = fmt(met * weight * hours, 0) + ' kcal';
    show('fitbike-result-box'); show('fitbike-stats-row');
}
function calculate1RM() {
    const weight = num('rm1-weight'), reps = num('rm1-reps');
    if (!weight || !reps || reps < 1 || reps > 15) { showToast(safeT('toast.error.enterWeightReps'), 'error'); return; }
    const rm = weight * (1 + reps / 30);
    const rv = el('res-rm1-val'); if (rv) rv.innerText = fmt(rm, 1);
    const r90 = el('stat-rm1-90'); if (r90) r90.innerText = fmt(rm * 0.9, 1) + ' kg';
    const r80 = el('stat-rm1-80'); if (r80) r80.innerText = fmt(rm * 0.8, 1) + ' kg';
    show('rm1-result-box'); show('rm1-stats-row');
}
function calculateWorkoutVolume() {
    const weight = num('vol-weight'), reps = num('vol-reps'), sets = num('vol-sets');
    if (!weight || !reps || !sets) { showToast(safeT('toast.error.enterAll'), 'error'); return; }
    const vv = el('res-vol-val'); if (vv) vv.innerText = money(weight * reps * sets);
    show('vol-result-box');
}

// ============================================================
// VREME I DATUMI
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
function renderTimeDan() {
    return `
        <div class="converter-box">
            ${dateTripleField('label.time.date', 'dayofweek-date')}
            ${calcButton('btn.calculate', 'calculateDayOfWeek()')}
        </div>
        <div id="dayofweek-result-box" class="result-card-green" style="display: none;">
            <div class="res-left"><div class="pump-icon">${icon('calendar')}</div><div><div class="res-label">${safeT('label.time.dayOfWeek')}</div><h3 id="res-day-name" class="res-text">—</h3></div></div>
            <div class="res-actions">
                <button class="copy-btn" onclick="copyResult('res-day-name', '', event)">${safeT('result.copy')}</button>
                <button class="copy-btn" data-category="VREME" data-label="Dan" onclick="saveHistory(this)">${safeT('result.save')}</button>
                <button class="copy-btn" data-category="VREME" data-label="Dan" onclick="shareResult(this)">${safeT('result.share')}</button>
            </div>
        </div>
        ${statsRow('dayofweek-stats-row', [['label.time.date', 'stat-day-date', '—']])}
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
    if (!startVal || !endVal) { showToast(safeT('toast.error.enterBothDates'), 'error'); return; }
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
    if (!startVal || days === null) { showToast(safeT('toast.error.enterDateDays'), 'error'); return; }
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
    if (!birthVal) { showToast(safeT('toast.error.enterBirthDate'), 'error'); return; }
    const birth = parseDate(birthVal);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (birth > today) { showToast(safeT('toast.error.futureDate'), 'error'); return; }
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
function calculateDayOfWeek() {
    const val = getTripleDate('dayofweek-date');
    if (!val) { showToast(safeT('toast.error.enterDate'), 'error'); return; }
    const date = parseDate(val);
    const daysArr = getDaysArr();
    const monthsArr = getMonthsArr();
    const dn = el('res-day-name');
    if (dn) dn.innerText = daysArr[date.getDay()].charAt(0).toUpperCase() + daysArr[date.getDay()].slice(1);
    const dd = el('stat-day-date');
    if (dd) dd.innerText = `${date.getDate()}. ${monthsArr[date.getMonth()]} ${date.getFullYear()}.`;
    show('dayofweek-result-box'); show('dayofweek-stats-row');
}
function calculateWorkdays() {
    const startVal = getTripleDate('workdays-start'), endVal = getTripleDate('workdays-end');
    if (!startVal || !endVal) { showToast(safeT('toast.error.enterBothDates'), 'error'); return; }
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
    if (val === null) { showToast(safeT('toast.error.enterValue'), 'error'); return; }
    const result = val * TIME_SECONDS[from] / TIME_SECONDS[to];
    const tv = el('res-time-conv-val');
    if (tv) tv.innerText = `${fmt(result)} ${safeT(TIME_LABELS_KEY[to])}`;
    show('result-time-conv-box');
}

// ============================================================
// GRAĐEVINA
// ============================================================
let openingsData = { paint: [], tile: [], block: [], board: [] };

function renderHomePovrsina() {
    return `<div class="converter-box">${sectionDescKey('desc.home.area')}${selectField('label.home.shape', 'shape-type', [{ value: 'rect', text: safeT('option.home.rectangle') }, { value: 'square', text: safeT('option.home.square') }, { value: 'circle', text: safeT('option.home.circle') }, { value: 'triangle', text: safeT('option.home.triangle') }], 'rect')}<div id="shape-rect-inputs">${inputField('label.home.length', 'shape-a', 'm', 'placeholder="5"')}${inputField('label.home.width', 'shape-b', 'm', 'placeholder="3"')}</div><div id="shape-square-inputs" style="display:none;">${inputField('label.home.side', 'shape-side', 'm', 'placeholder="4"')}</div><div id="shape-circle-inputs" style="display:none;">${inputField('label.home.diameter', 'shape-diameter', 'm', 'placeholder="4"')}</div><div id="shape-triangle-inputs" style="display:none;">${inputField('label.home.length', 'shape-base', 'm', 'placeholder="6"')}${inputField('label.home.height', 'shape-height', 'm', 'placeholder="4"')}</div>${calcButton('btn.calculate', 'calculateShapeArea()')}</div>${resultCard('shape-result-box', 'square', 'label.home.area', 'res-shape-area', 'm²', 'GRAĐEVINA', 'label.home.area')}`;
}
function renderHomeBlokovi() {
    return `<div class="converter-box">${sectionDescKey('desc.home.blocks')}${inputField('label.home.wallLength', 'block-wall-l', 'm', 'placeholder="10"')}${inputField('label.home.wallHeight', 'block-wall-h', 'm', 'placeholder="2.8"')}${inputField('label.home.blockDimensions', 'block-l', 'cm', 'placeholder="25"')}${inputField('label.home.blockDimensions', 'block-h', 'cm', 'placeholder="19"')}${inputField('label.home.pricePerPiece', 'block-price', '€', 'placeholder="0"')}${calcButton('btn.calculate', 'calculateBlocks()')}</div>${resultCard('blocks-result-box', 'bricks', 'label.home.blocksNeeded', 'res-blocks-count', '', 'GRAĐEVINA', 'Blokovi')}${statsRow('blocks-stats-row', [['label.home.netArea', 'stat-blocks-area', '0 m²'], ['label.home.totalPrice', 'stat-blocks-price', '—']])}`;
}
function renderHomeTable() {
    return `<div class="converter-box">${sectionDescKey('desc.home.boards')}${inputField('label.home.surfaceLength', 'board-wall-l', 'm', 'placeholder="10"')}${inputField('label.home.surfaceHeight', 'board-wall-h', 'm', 'placeholder="2.8"')}${inputField('label.home.boardDimensions', 'board-l', 'cm', 'placeholder="125"')}${inputField('label.home.boardDimensions', 'board-w', 'cm', 'placeholder="250"')}${inputField('label.home.reserve', 'board-reserve', '%', 'placeholder="10"')}${calcButton('btn.calculate', 'calculateBoards()')}</div>${resultCard('boards-result-box', 'board', 'label.home.boardsNeeded', 'res-boards-count', '', 'GRAĐEVINA', 'Table')}${statsRow('boards-stats-row', [['label.home.netArea', 'stat-boards-area', '0 m²'], ['label.home.boardArea', 'stat-boards-single', '0 m²']])}`;
}
function renderHomeCrep() {
    return `<div class="converter-box">${sectionDescKey('desc.home.roofTiles')}${inputField('label.home.roofArea', 'crep-area', 'm²', 'placeholder="100"')}${inputField('label.home.tilesPerM2', 'crep-per-m2', '', 'placeholder="15.5"')}${inputField('label.home.reserve', 'crep-reserve', '%', 'placeholder="5"')}${calcButton('btn.calculate', 'calculateCrep()')}</div>${resultCard('crep-result-box', 'home', 'label.home.tilesNeeded', 'res-crep-count', '', 'GRAĐEVINA', 'Crep')}${statsRow('crep-stats-row', [['label.home.withoutReserve', 'stat-crep-base', '0']])}`;
}
function renderHomeBeton() {
    return `<div class="converter-box">${sectionDescKey('desc.home.concrete')}${inputField('label.home.length', 'beton-l', 'm', 'placeholder="5"')}${inputField('label.home.width', 'beton-w', 'm', 'placeholder="3"')}${inputField('label.home.thickness', 'beton-h', 'm', 'placeholder="0.2"')}${calcButton('btn.calculate', 'calculateConcrete()')}</div>${resultCard('beton-result-box', 'building', 'label.home.concreteNeeded', 'res-beton-m3', 'm³', 'GRAĐEVINA', 'Beton')}`;
}
function renderHomeTemelj() {
    return `<div class="converter-box">${sectionDescKey('desc.home.foundation')}${inputField('label.home.length', 'temelj-l', 'm', 'placeholder="10"')}${inputField('label.home.width', 'temelj-w', 'm', 'placeholder="0.6"')}${inputField('label.home.depthHeight', 'temelj-h', 'm', 'placeholder="0.8"')}${calcButton('btn.calculate', 'calculateFoundation()')}</div>${resultCard('temelj-result-box', 'layers', 'label.home.concreteNeeded', 'res-temelj-m3', 'm³', 'GRAĐEVINA', 'Temelj')}${statsRow('temelj-stats-row', [['label.home.rebar12mm', 'stat-temelj-arma', '0 kg'], ['label.home.cement25kg', 'stat-temelj-cement', '0']])}`;
}
function renderHomeFarbanje() {
    return `<div class="converter-box">${sectionDescKey('desc.home.painting')}${inputField('label.home.wallLength', 'paint-width', 'm', 'placeholder="10"')}${inputField('label.home.wallHeight', 'paint-height', 'm', 'placeholder="2.8"')}${inputField('label.home.wallCount', 'paint-walls', '', 'placeholder="4"')}${inputField('label.home.paintCoverage', 'paint-coverage', 'm²/L', 'placeholder="10"')}${calcButton('btn.calculate', 'calculatePaint()')}</div>${resultCard('paint-result-box', 'paint', 'label.home.paintNeeded', 'res-paint-liters', 'L', 'GRAĐEVINA', 'Farbanje')}${statsRow('paint-stats-row', [['label.home.totalArea', 'stat-paint-area', '0 m²'], ['label.home.openingsDeducted', 'stat-paint-openings', '0 m²']])}`;
}
function renderHomePlocice() {
    return `
        <div class="converter-box">
            ${sectionDescKey('desc.home.tiles')}
            <div class="tiles-section">
                <div class="tiles-section-title">${safeT('tiles.floorSection')}</div>
                ${inputField('label.home.roomLength', 'tile-room-l', 'm', 'placeholder="4"')}
                ${inputField('label.home.roomWidth', 'tile-room-w', 'm', 'placeholder="3"')}
            </div>
            <div class="tiles-section">
                <div class="tiles-section-title">
                    <span>${safeT('tiles.wallsSection')}</span>
                    <label class="tiles-toggle">
                        <input type="checkbox" id="tile-walls-enable" onchange="toggleTilesWalls()">
                        <span>${safeT('tiles.enableWalls')}</span>
                    </label>
                </div>
                <div id="tile-walls-fields" class="tiles-walls-fields" style="display:none;">
                    ${inputField('tiles.wallLength', 'tile-wall-l', 'm', 'placeholder="4"')}
                    ${inputField('tiles.wallHeight', 'tile-wall-h', 'm', 'placeholder="2.5"')}
                    ${inputField('tiles.wallCount', 'tile-wall-n', '', 'value="1" min="1"')}
                </div>
            </div>
            ${inputField('label.home.tileLength', 'tile-l', 'cm', 'placeholder="30"')}
            ${inputField('label.home.tileWidth', 'tile-w', 'cm', 'placeholder="30"')}
            ${inputField('label.home.reserve', 'tile-reserve', '%', 'placeholder="10"')}
            ${calcButton('btn.calculate', 'calculateTiles()')}
        </div>
        <div id="tiles-result-box" class="result-card-green" style="display: none;">
            <div class="res-left">
                <div class="pump-icon">${icon('tiles')}</div>
                <div>
                    <div class="res-label">${safeT('tiles.totalTiles')}</div>
                    <h2><span id="res-tiles-total">0</span> <small>${safeT('unit.pcsShort')}</small></h2>
                </div>
            </div>
            <div class="tiles-breakdown">
                <div class="tiles-breakdown-item">
                    <div class="tiles-breakdown-label">${safeT('tiles.floorTiles')}</div>
                    <div class="tiles-breakdown-value" id="res-tiles-floor">0</div>
                    <div class="tiles-breakdown-unit">${safeT('unit.pcsShort')}</div>
                </div>
                <div class="tiles-breakdown-item">
                    <div class="tiles-breakdown-label">${safeT('tiles.wallTiles')}</div>
                    <div class="tiles-breakdown-value accent" id="res-tiles-wall">0</div>
                    <div class="tiles-breakdown-unit">${safeT('unit.pcsShort')}</div>
                </div>
            </div>
            <div class="res-actions">
                <button class="copy-btn" onclick="copyResult('res-tiles-total', '${safeT('unit.pcsShort')}', event)">${safeT('result.copy')}</button>
                <button class="copy-btn" data-category="GRAĐEVINA" data-label="Pločice" onclick="saveHistory(this)">${safeT('result.save')}</button>
                <button class="copy-btn" data-category="GRAĐEVINA" data-label="Pločice" onclick="shareResult(this)">${safeT('result.share')}</button>
            </div>
        </div>
        ${statsRow('tiles-stats-row', [['tiles.floorArea', 'stat-tiles-floor-area', '0 m²'], ['tiles.wallsArea', 'stat-tiles-wall-area', '0 m²'], ['tiles.totalArea', 'stat-tiles-total-area', '0 m²']])}
    `;
}
function renderHomeLaminat() {
    return `<div class="converter-box">${sectionDescKey('desc.home.laminate')}${inputField('label.home.roomLength', 'lam-room-l', 'm', 'placeholder="5"')}${inputField('label.home.roomWidth', 'lam-room-w', 'm', 'placeholder="4"')}${inputField('label.home.packageArea', 'lam-pack', 'm²', 'placeholder="2.5"')}${inputField('label.home.reserve', 'lam-reserve', '%', 'placeholder="10"')}${calcButton('btn.calculate', 'calculateLaminate()')}</div>${resultCard('laminate-result-box', 'layers', 'label.home.packagesNeeded', 'res-lam-packs', '', 'GRAĐEVINA', 'Laminat')}${statsRow('laminate-stats-row', [['label.home.totalArea', 'stat-lam-area', '0 m²']])}`;
}
function renderHomeMalter() {
    return `<div class="converter-box">${sectionDescKey('desc.home.mortar')}${inputField('label.home.plasterArea', 'malter-area', 'm²', 'placeholder="50"')}${inputField('label.home.mortarThickness', 'malter-thickness', 'cm', 'placeholder="2"')}${selectField('label.home.ratio', 'malter-ratio', [{ value: '1:3', text: '1:3' }, { value: '1:4', text: '1:4' }, { value: '1:5', text: '1:5' }], '1:4')}${calcButton('btn.calculate', 'calculateMortar()')}</div><div id="malter-result-box" class="result-card-green" style="display: none;"><div class="res-left"><div class="pump-icon">${icon('flask')}</div><div><div class="res-label">${safeT('label.home.materialsNeeded')}</div><h3 id="res-malter-text" class="res-text">—</h3></div></div><div class="res-actions"><button class="copy-btn" onclick="copyResult('res-malter-text', '', event)">${safeT('result.copy')}</button><button class="copy-btn" data-category="GRAĐEVINA" data-label="Malter" onclick="saveHistory(this)">${safeT('result.save')}</button><button class="copy-btn" data-category="GRAĐEVINA" data-label="Malter" onclick="shareResult(this)">${safeT('result.share')}</button></div></div>${statsRow('malter-stats-row', [['label.home.cement', 'stat-malter-cement', '0 kg'], ['label.home.sand', 'stat-malter-sand', '0 kg'], ['label.home.water', 'stat-malter-water', '0 L']])}`;
}
function renderHomeGips() {
    return `<div class="converter-box">${sectionDescKey('desc.home.gypsum')}${inputField('label.home.surfaceArea', 'gips-area', 'm²', 'placeholder="30"')}${selectField('label.home.layers', 'gips-layers', [{ value: '1', text: '1' }, { value: '2', text: '2' }], '1')}${calcButton('btn.calculate', 'calculateGypsum()')}</div><div id="gips-result-box" class="result-card-green" style="display: none;"><div class="res-left"><div class="pump-icon">${icon('wall')}</div><div><div class="res-label">${safeT('label.home.materialsNeeded')}</div><h3 id="res-gips-text" class="res-text">—</h3></div></div><div class="res-actions"><button class="copy-btn" onclick="copyResult('res-gips-text', '', event)">${safeT('result.copy')}</button><button class="copy-btn" data-category="GRAĐEVINA" data-label="Gips" onclick="saveHistory(this)">${safeT('result.save')}</button><button class="copy-btn" data-category="GRAĐEVINA" data-label="Gips" onclick="shareResult(this)">${safeT('result.share')}</button></div></div>${statsRow('gips-stats-row', [['label.home.sheets', 'stat-gips-sheets', '0'], ['label.home.profiles', 'stat-gips-profiles', '0'], ['label.home.screws', 'stat-gips-screws', '0']])}`;
}
function renderHomeHidro() {
    return `<div class="converter-box">${sectionDescKey('desc.home.waterproofing')}${inputField('label.home.surfaceArea', 'hidro-area', 'm²', 'placeholder="30"')}${selectField('label.home.waterproofingType', 'hidro-type', [{ value: 'folija', text: safeT('option.home.pvcFoil') }, { value: 'premaz', text: safeT('option.home.coating') }, { value: 'traka', text: safeT('option.home.tape') }])}${inputField('label.home.reserve', 'hidro-reserve', '%', 'placeholder="10"')}${calcButton('btn.calculate', 'calculateHydro()')}</div><div id="hidro-result-box" class="result-card-green" style="display: none;"><div class="res-left"><div class="pump-icon">${icon('droplet')}</div><div><div class="res-label">${safeT('label.home.materialsNeeded')}</div><h3 id="res-hidro-text" class="res-text">—</h3></div></div><div class="res-actions"><button class="copy-btn" onclick="copyResult('res-hidro-text', '', event)">${safeT('result.copy')}</button><button class="copy-btn" data-category="GRAĐEVINA" data-label="Hidro" onclick="saveHistory(this)">${safeT('result.save')}</button><button class="copy-btn" data-category="GRAĐEVINA" data-label="Hidro" onclick="shareResult(this)">${safeT('result.share')}</button></div></div>`;
}
function renderHomeElektro() {
    return `<div class="converter-box">${sectionDescKey('desc.home.electrical')}${inputField('label.home.outlets', 'elektro-outlets', '', 'placeholder="10"')}${inputField('label.home.switches', 'elektro-switches', '', 'placeholder="5"')}${inputField('label.home.cableLength', 'elektro-cable', 'm', 'placeholder="100"')}${calcButton('btn.calculate', 'calculateElectro()')}</div><div id="elektro-result-box" class="result-card-green" style="display: none;"><div class="res-left"><div class="pump-icon">${icon('plug')}</div><div><div class="res-label">${safeT('label.home.totalMaterials')}</div><h3 id="res-elektro-text" class="res-text">—</h3></div></div><div class="res-actions"><button class="copy-btn" onclick="copyResult('res-elektro-text', '', event)">${safeT('result.copy')}</button><button class="copy-btn" data-category="GRAĐEVINA" data-label="Elektro" onclick="saveHistory(this)">${safeT('result.save')}</button><button class="copy-btn" data-category="GRAĐEVINA" data-label="Elektro" onclick="shareResult(this)">${safeT('result.share')}</button></div></div>${statsRow('elektro-stats-row', [['label.home.outlets', 'stat-elektro-out', '0'], ['label.home.switches', 'stat-elektro-sw', '0'], ['label.home.cables', 'stat-elektro-cab', '0 m']])}`;
}
function renderHomeStolarija() {
    return `<div class="converter-box">${sectionDescKey('desc.home.joinery')}${inputField('label.home.pieces', 'stolarija-qty', '', 'placeholder="5"')}${inputField('label.home.avgWidth', 'stolarija-w', 'm', 'placeholder="1.2"')}${inputField('label.home.avgHeight', 'stolarija-h', 'm', 'placeholder="1.5"')}${calcButton('btn.calculate', 'calculateJoinery()')}</div>${resultCard('stolarija-result-box', 'door', 'label.home.totalJoineryArea', 'res-stolarija-m2', 'm²', 'GRAĐEVINA', 'Stolarija')}`;
}
function renderHomeUniverzalno() {
    return `<div class="converter-box">${sectionDescKey('desc.home.universal')}${inputFieldText('label.home.materialName', 'univ-name', safeT('placeholder.material'))}${inputField('label.quantity', 'univ-qty', '', 'placeholder="10"')}${inputField('label.price', 'univ-price', 'RSD', 'placeholder="500"')}${calcButton('btn.calculate', 'calculateUniversal()')}</div>${resultCard('univ-result-box', 'calculator', 'label.total', 'res-univ-total', 'RSD', 'GRAĐEVINA', 'Univerzalno')}`;
}

function addOpening(type) { openingsData[type].push({ name: '', w: 0, h: 0 }); renderOpenings(type); vibrate(15); }
function removeOpening(type, idx) { openingsData[type].splice(idx, 1); renderOpenings(type); vibrate(10); }
function updateOpening(type, idx, field, value) {
    if (!openingsData[type][idx]) return;
    if (field === 'name') openingsData[type][idx].name = value;
    else if (field === 'w') openingsData[type][idx].w = parseNum(value) || 0;
    else if (field === 'h') openingsData[type][idx].h = parseNum(value) || 0;
}
function renderOpenings(type) {
    const list = el(`${type}-openings-list`);
    if (!list) return;
    list.innerHTML = '';
    if (!openingsData[type].length) {
        const empty = document.createElement('div');
        empty.className = 'opening-empty';
        empty.textContent = safeT('label.home.noOpenings');
        list.appendChild(empty); return;
    }
    openingsData[type].forEach((op, idx) => {
        const item = document.createElement('div');
        item.className = 'opening-item';
        const n = document.createElement('input'); n.type = 'text'; n.placeholder = safeT('placeholder.name'); n.value = op.name || ''; n.oninput = e => updateOpening(type, idx, 'name', e.target.value);
        const w = document.createElement('input'); w.type = 'text'; w.inputMode = 'decimal'; w.placeholder = safeT('placeholder.widthShort'); w.value = op.w || ''; w.oninput = e => updateOpening(type, idx, 'w', e.target.value);
        const h = document.createElement('input'); h.type = 'text'; h.inputMode = 'decimal'; h.placeholder = safeT('placeholder.heightShort'); h.value = op.h || ''; h.oninput = e => updateOpening(type, idx, 'h', e.target.value);
        const r = document.createElement('button'); r.className = 'opening-remove'; r.textContent = '✕'; r.onclick = () => removeOpening(type, idx);
        item.appendChild(n); item.appendChild(w); item.appendChild(h); item.appendChild(r);
        list.appendChild(item);
    });
}
function getOpeningsArea(type) {
    return openingsData[type].reduce((sum, op) => sum + ((op.w || 0) * (op.h || 0)), 0);
}
function toggleShapeInputs() {
    const type = el('shape-type') ? el('shape-type').value : 'rect';
    ['rect', 'square', 'circle', 'triangle'].forEach(t => {
        const e = el(`shape-${t}-inputs`);
        if (e) e.style.display = t === type ? 'block' : 'none';
    });
}
function toggleTilesWalls() {
    const enable = el('tile-walls-enable');
    const fields = el('tile-walls-fields');
    if (!enable || !fields) return;
    fields.style.display = enable.checked ? 'flex' : 'none';
    vibrate(10);
}
function calculateShapeArea() {
    const type = el('shape-type') ? el('shape-type').value : 'rect';
    let area = 0;
    if (type === 'rect') {
        const a = num('shape-a'), b = num('shape-b');
        if (!a || !b) { showToast(safeT('toast.error.enterLengthWidth'), 'error'); return; }
        area = a * b;
    } else if (type === 'square') {
        const s = num('shape-side');
        if (!s) { showToast(safeT('toast.error.enterSide'), 'error'); return; }
        area = s * s;
    } else if (type === 'circle') {
        const d = num('shape-diameter');
        if (!d) { showToast(safeT('toast.error.enterDiameter'), 'error'); return; }
        area = Math.PI * Math.pow(d / 2, 2);
    } else if (type === 'triangle') {
        const b = num('shape-base'), h = num('shape-height');
        if (!b || !h) { showToast(safeT('toast.error.enterBaseHeight'), 'error'); return; }
        area = (b * h) / 2;
    }
    const sa = el('res-shape-area'); if (sa) sa.innerText = fmt(area, 2);
    show('shape-result-box');
}
function calculatePaint() {
    const width = num('paint-width'), height = num('paint-height'), walls = num('paint-walls') || 0, coverage = num('paint-coverage') || 10;
    if (!width || !height || !walls) { showToast(safeT('toast.error.enterWallDims'), 'error'); return; }
    const netArea = Math.max(0, width * height * walls - getOpeningsArea('paint'));
    const pl = el('res-paint-liters'); if (pl) pl.innerText = fmt(netArea / coverage, 2);
    const pa = el('stat-paint-area'); if (pa) pa.innerText = fmt(netArea, 2) + ' m²';
    const po = el('stat-paint-openings'); if (po) po.innerText = fmt(getOpeningsArea('paint'), 2) + ' m²';
    show('paint-result-box'); show('paint-stats-row');
}
function calculateTiles() {
    const roomL = num('tile-room-l'), roomW = num('tile-room-w'), tileL = num('tile-l'), tileW = num('tile-w');
    const reserve = num('tile-reserve') || 0;
    const wallsEnabled = el('tile-walls-enable') && el('tile-walls-enable').checked;
    if (!roomL || !roomW || !tileL || !tileW) { showToast(safeT('toast.error.enterAllDimensions'), 'error'); return; }
    const floorArea = Math.max(0, roomL * roomW - getOpeningsArea('tile'));
    let wallArea = 0;
    if (wallsEnabled) {
        const wL = num('tile-wall-l'), wH = num('tile-wall-h'), wN = num('tile-wall-n') || 1;
        if (wL && wH) wallArea = wL * wH * wN;
    }
    const totalArea = floorArea + wallArea;
    const tileArea = (tileL / 100) * (tileW / 100);
    const factor = 1 + reserve / 100;
    const floorTiles = Math.ceil((floorArea / tileArea) * factor);
    const wallTiles = Math.ceil((wallArea / tileArea) * factor);
    const totalTiles = floorTiles + wallTiles;
    const tt = el('res-tiles-total'); if (tt) tt.innerText = totalTiles;
    const tf = el('res-tiles-floor'); if (tf) tf.innerText = floorTiles;
    const tw = el('res-tiles-wall'); if (tw) tw.innerText = wallTiles;
    const sa = el('stat-tiles-floor-area'); if (sa) sa.innerText = fmt(floorArea, 2) + ' m²';
    const sw = el('stat-tiles-wall-area'); if (sw) sw.innerText = fmt(wallArea, 2) + ' m²';
    const st = el('stat-tiles-total-area'); if (st) st.innerText = fmt(totalArea, 2) + ' m²';
    show('tiles-result-box'); show('tiles-stats-row');
}
function calculateLaminate() {
    const roomL = num('lam-room-l'), roomW = num('lam-room-w'), packArea = num('lam-pack'), reserve = num('lam-reserve') || 0;
    if (!roomL || !roomW || !packArea) { showToast(safeT('toast.error.enterAll'), 'error'); return; }
    const area = roomL * roomW;
    const lp = el('res-lam-packs'); if (lp) lp.innerText = Math.ceil((area * (1 + reserve / 100)) / packArea);
    const la = el('stat-lam-area'); if (la) la.innerText = fmt(area, 2) + ' m²';
    show('laminate-result-box'); show('laminate-stats-row');
}
function calculateConcrete() {
    const l = num('beton-l'), w = num('beton-w'), h = num('beton-h');
    if (!l || !w || !h) { showToast(safeT('toast.error.enterAllDimensions'), 'error'); return; }
    const bm = el('res-beton-m3'); if (bm) bm.innerText = fmt(l * w * h, 3);
    show('beton-result-box');
}
function calculateBlocks() {
    const wallL = num('block-wall-l'), wallH = num('block-wall-h'), blockL = num('block-l'), blockH = num('block-h');
    if (!wallL || !wallH || !blockL || !blockH) { showToast(safeT('toast.error.enterBlockWallDims'), 'error'); return; }
    const netArea = Math.max(0, wallL * wallH - getOpeningsArea('block'));
    const blocks = Math.ceil(netArea / ((blockL / 100) * (blockH / 100)));
    const bc = el('res-blocks-count'); if (bc) bc.innerText = blocks;
    const ba = el('stat-blocks-area'); if (ba) ba.innerText = fmt(netArea, 2) + ' m²';
    const price = num('block-price');
    const bp = el('stat-blocks-price'); if (bp) bp.innerText = price ? money(blocks * price) + ' €' : '—';
    show('blocks-result-box'); show('blocks-stats-row');
}
function calculateBoards() {
    const wallL = num('board-wall-l'), wallH = num('board-wall-h'), boardL = num('board-l'), boardW = num('board-w');
    const reserve = num('board-reserve') || 0;
    if (!wallL || !wallH || !boardL || !boardW) { showToast(safeT('toast.error.enterDimensions'), 'error'); return; }
    const netArea = Math.max(0, wallL * wallH - getOpeningsArea('board'));
    const singleArea = (boardL / 100) * (boardW / 100);
    const bc = el('res-boards-count'); if (bc) bc.innerText = Math.ceil((netArea / singleArea) * (1 + reserve / 100));
    const ba = el('stat-boards-area'); if (ba) ba.innerText = fmt(netArea, 2) + ' m²';
    const bs = el('stat-boards-single'); if (bs) bs.innerText = fmt(singleArea, 3) + ' m²';
    show('boards-result-box'); show('boards-stats-row');
}
function calculateCrep() {
    const area = num('crep-area'), perM2 = num('crep-per-m2'), reserve = num('crep-reserve') || 0;
    if (!area || !perM2) { showToast(safeT('toast.error.enterAreaAndPer'), 'error'); return; }
    const baseCount = area * perM2;
    const cc = el('res-crep-count'); if (cc) cc.innerText = Math.ceil(baseCount * (1 + reserve / 100));
    const cb = el('stat-crep-base'); if (cb) cb.innerText = Math.ceil(baseCount) + ' ' + safeT('unit.pcsShort');
    show('crep-result-box'); show('crep-stats-row');
}
function calculateMortar() {
    const area = num('malter-area'), thickness = num('malter-thickness');
    const ratioStr = el('malter-ratio') ? el('malter-ratio').value : '1:4';
    if (!area || !thickness) { showToast(safeT('toast.error.enterAreaThickness'), 'error'); return; }
    const [cementPart, sandPart] = ratioStr.split(':').map(Number);
    const volume = area * (thickness / 100);
    const dryVolume = volume * 1.3;
    const totalParts = cementPart + sandPart;
    const cementKg = dryVolume * (cementPart / totalParts) * 1400;
    const sandKg = dryVolume * (sandPart / totalParts) * 1600;
    const mt = el('res-malter-text');
    if (mt) mt.innerHTML = `<strong>${fmt(volume, 3)} m³</strong> ${safeT('label.home.mortarWord')}`;
    const mc = el('stat-malter-cement'); if (mc) mc.innerText = fmt(cementKg, 0) + ' kg';
    const ms = el('stat-malter-sand'); if (ms) ms.innerText = fmt(sandKg, 0) + ' kg';
    const mw = el('stat-malter-water'); if (mw) mw.innerText = fmt(cementKg * 0.5, 0) + ' L';
    show('malter-result-box'); show('malter-stats-row');
}
function calculateGypsum() {
    const area = num('gips-area');
    const layers = el('gips-layers') ? parseInt(el('gips-layers').value) : 1;
    if (!area) { showToast(safeT('toast.error.enterArea'), 'error'); return; }
    const sheetArea = 1.2 * 2.0;
    const gt = el('res-gips-text');
    if (gt) gt.innerHTML = `<strong>${fmt(area, 2)} m²</strong> × ${layers} ${safeT('label.home.layerWord')}`;
    const gs = el('stat-gips-sheets'); if (gs) gs.innerText = Math.ceil((area * layers) / sheetArea * 1.1) + ' ' + safeT('unit.pcsShort');
    const gp = el('stat-gips-profiles'); if (gp) gp.innerText = Math.ceil(area * 2.5 / 3) + ' ' + safeT('unit.pcsShort');
    const gsc = el('stat-gips-screws'); if (gsc) gsc.innerText = Math.ceil(area * 30 * layers) + ' ' + safeT('unit.pcsShort');
    show('gips-result-box'); show('gips-stats-row');
}
function calculateFoundation() {
    const l = num('temelj-l'), w = num('temelj-w'), h = num('temelj-h');
    if (!l || !w || !h) { showToast(safeT('toast.error.enterAllDimensions'), 'error'); return; }
    const volume = l * w * h;
    const tm = el('res-temelj-m3'); if (tm) tm.innerText = fmt(volume, 3);
    const ta = el('stat-temelj-arma'); if (ta) ta.innerText = fmt(volume * 80, 0) + ' kg';
    const tc = el('stat-temelj-cement'); if (tc) tc.innerText = Math.ceil(volume * 350 / 25);
    show('temelj-result-box'); show('temelj-stats-row');
}
function calculateHydro() {
    const area = num('hidro-area');
    const type = el('hidro-type') ? el('hidro-type').value : 'folija';
    const reserve = num('hidro-reserve') || 0;
    if (!area) { showToast(safeT('toast.error.enterArea'), 'error'); return; }
    const areaWithReserve = area * (1 + reserve / 100);
    let text = '';
    if (type === 'folija') text = `<strong>${Math.ceil(areaWithReserve / (1.5 * 20))}</strong> ${safeT('label.home.rollsFoil')}`;
    else if (type === 'premaz') text = `<strong>${Math.ceil(areaWithReserve * 1.5)} kg</strong> ${safeT('label.home.coatingWord')}`;
    else text = `<strong>${Math.ceil(areaWithReserve * 2.5)} m</strong> ${safeT('label.home.tapeWord')}`;
    const ht = el('res-hidro-text'); if (ht) ht.innerHTML = text;
    show('hidro-result-box');
}
function calculateElectro() {
    const outlets = num('elektro-outlets') || 0, switches = num('elektro-switches') || 0, cable = num('elektro-cable') || 0;
    if (!outlets && !switches && !cable) { showToast(safeT('toast.error.enterAtLeastOne'), 'error'); return; }
    const et = el('res-elektro-text');
    if (et) et.innerHTML = `<strong>${outlets + switches}</strong> ${safeT('label.home.boxesWord')} • ${fmt(cable, 0)}m ${safeT('label.home.cableWord')}`;
    const eo = el('stat-elektro-out'); if (eo) eo.innerText = outlets;
    const es = el('stat-elektro-sw'); if (es) es.innerText = switches;
    const ec = el('stat-elektro-cab'); if (ec) ec.innerText = cable + ' m';
    show('elektro-result-box'); show('elektro-stats-row');
}
function calculateJoinery() {
    const qty = num('stolarija-qty'), w = num('stolarija-w'), h = num('stolarija-h');
    if (!qty || !w || !h) { showToast(safeT('toast.error.enterAll'), 'error'); return; }
    const sm = el('res-stolarija-m2'); if (sm) sm.innerText = fmt(qty * w * h, 2);
    show('stolarija-result-box');
}
function calculateUniversal() {
    const qty = num('univ-qty'), price = num('univ-price');
    if (!qty || !price) { showToast(safeT('toast.error.enterQtyPrice'), 'error'); return; }
    const ut = el('res-univ-total'); if (ut) ut.innerText = money(qty * price);
    show('univ-result-box');
}

// ============================================================
// KUHINJA
// ============================================================
function renderKitchenKasike() {
    return `<div class="converter-box">${sectionDescKey('desc.kitchen.spoons')}${inputField('label.kitchen.value', 'spoon-val', '', 'placeholder="1"')}${selectField('label.kitchen.ingredient', 'spoon-ingredient', [{ value: 'secer', text: safeT('option.kitchen.sugar') }, { value: 'brasno', text: safeT('option.kitchen.flour') }, { value: 'so', text: safeT('option.kitchen.salt') }])}${calcButton('btn.calculate', 'calculateSpoon()')}</div><div id="spoon-result-box" class="result-card-green" style="display: none;"><div class="res-left"><div class="pump-icon">${icon('spoon')}</div><div><div class="res-label">${safeT('label.kitchen.approxWeight')}</div><h2><span id="res-spoon-val">0</span> <small id="res-spoon-unit">g</small></h2></div></div></div>`;
}
function renderKitchenCase() {
    return `<div class="converter-box">${sectionDescKey('desc.kitchen.cups')}${inputField('label.kitchen.value', 'cup-val', '', 'placeholder="1"')}${selectField('label.kitchen.cupType', 'cup-type', [{ value: 'standard', text: '200ml' }, { value: 'velika', text: '250ml' }, { value: 'mala', text: '150ml' }])}${calcButton('btn.calculate', 'calculateCupConversion()')}</div><div id="cup-result-box" class="result-card-green" style="display: none;"><div class="res-left"><div class="pump-icon">${icon('glassWater')}</div><div><div class="res-label">${safeT('label.kitchen.value')}</div><h2><span id="res-cup-val">0</span> <small id="res-cup-unit">ml</small></h2></div></div></div>`;
}
function renderKitchenOstalo() {
    return `<div class="converter-box">${sectionDescKey('desc.kitchen.other')}${inputField('label.kitchen.measureCount', 'other-qty', '', 'placeholder="1"')}${selectField('label.kitchen.measure', 'other-type', [{ value: 'prstohvat', text: safeT('option.kitchen.pinch') }, { value: 'prst', text: safeT('option.kitchen.finger') }, { value: 'saka', text: safeT('option.kitchen.handful') }])}${calcButton('btn.calculate', 'calculateOtherMeasure()')}</div><div id="other-result-box" class="result-card-green" style="display: none;"><div class="res-left"><div class="pump-icon">${icon('utensils')}</div><div><div class="res-label">${safeT('label.kitchen.approxWeight')}</div><h2><span id="res-other-g">0</span> <small>g</small></h2></div></div></div>`;
}
function renderKitchenPecenje() {
    return `<div class="converter-box">${sectionDescKey('desc.kitchen.baking')}${inputField('label.kitchen.value', 'oven-val', '', 'placeholder="180"')}${selectField('label.kitchen.fromUnit', 'oven-from', [{ value: 'c', text: '°C' }, { value: 'f', text: '°F' }, { value: 'gas', text: 'Gas' }])}${selectField('label.kitchen.toUnit', 'oven-to', [{ value: 'f', text: '°F' }, { value: 'c', text: '°C' }, { value: 'gas', text: 'Gas' }])}${calcButton('btn.calculate', 'calculateOven()')}</div><div id="oven-result-box" class="result-card-green" style="display: none;"><div class="res-left"><div class="pump-icon">${icon('oven')}</div><div><div class="res-label">${safeT('result.label')}</div><h2><span id="res-oven-val">0</span> <small id="res-oven-unit">°F</small></h2></div></div></div>`;
}
function renderKitchenPorcije() {
    return `<div class="converter-box">${sectionDescKey('desc.kitchen.portions')}${inputField('label.kitchen.originalPortions', 'portion-orig', '', 'placeholder="4"')}${inputField('label.kitchen.desiredPortions', 'portion-want', '', 'placeholder="6"')}${inputField('label.kitchen.ingredientQty', 'portion-qty', '', 'placeholder="200"')}${calcButton('btn.calculate', 'calculatePortion()')}</div><div id="portion-result-box" class="result-card-green" style="display: none;"><div class="res-left"><div class="pump-icon">${icon('utensils')}</div><div><div class="res-label">${safeT('label.kitchen.qtyNeeded')}</div><h2><span id="res-portion-val">0</span> <small id="res-portion-unit">g</small></h2></div></div></div>`;
}
function renderKitchenKafa() {
    return `<div class="converter-box">${sectionDescKey('desc.kitchen.coffee')}${inputField('label.kitchen.cupsCount', 'drink-cups', '', 'placeholder="2"')}${selectField('label.kitchen.drinkType', 'drink-type', [{ value: 'kafa_turska', text: safeT('option.kitchen.turkishCoffee') }, { value: 'kafa_espreso', text: safeT('option.kitchen.espresso') }, { value: 'caj_kesica', text: safeT('option.kitchen.teaBag') }])}${calcButton('btn.calculate', 'calculateDrink()')}</div><div id="drink-result-box" class="result-card-green" style="display: none;"><div class="res-left"><div class="pump-icon">${icon('coffee')}</div><div><div class="res-label">${safeT('label.kitchen.coffeeNeeded')}</div><h2><span id="res-drink-val">0</span> <small id="res-drink-unit">g</small></h2></div></div></div>`;
}

const SPOON_GRAMS = { secer: 20, brasno: 10, so: 25, kakao: 8, med: 25, ulje: 15, mleko: 15, pirinac: 20, ovsene: 8, griz: 15 };
function calculateSpoon() {
    const ing = el('spoon-ingredient') ? el('spoon-ingredient').value : 'secer';
    const val = num('spoon-val');
    if (val === null) { showToast(safeT('toast.error.enterValue'), 'error'); return; }
    const gPerSpoon = SPOON_GRAMS[ing] || 20;
    const sv = el('res-spoon-val'); if (sv) sv.innerText = fmt(val * gPerSpoon, 2);
    const su = el('res-spoon-unit'); if (su) su.innerText = 'g';
    show('spoon-result-box');
}
const CUP_ML = { standard: 200, velika: 250, mala: 150 };
function calculateCupConversion() {
    const type = el('cup-type') ? el('cup-type').value : 'standard';
    const val = num('cup-val');
    if (val === null) { showToast(safeT('toast.error.enterValue'), 'error'); return; }
    const mlPerCup = CUP_ML[type] || 200;
    const cv = el('res-cup-val'); if (cv) cv.innerText = fmt(val * mlPerCup, 0);
    const cu = el('res-cup-unit'); if (cu) cu.innerText = 'ml';
    show('cup-result-box');
}
function calculateOtherMeasure() {
    const type = el('other-type') ? el('other-type').value : 'prstohvat';
    const qty = num('other-qty');
    if (!qty) { showToast(safeT('toast.error.enterCount'), 'error'); return; }
    const gramsPer = { prstohvat: 0.5, prst: 2, saka: 50 };
    const og = el('res-other-g'); if (og) og.innerText = fmt(qty * (gramsPer[type] || 1), 1);
    show('other-result-box');
}
function calculateOven() {
    const from = el('oven-from') ? el('oven-from').value : 'c';
    const val = num('oven-val');
    const to = el('oven-to') ? el('oven-to').value : 'f';
    if (val === null) { showToast(safeT('toast.error.enterValue'), 'error'); return; }
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
    if (!orig || !want || !qty) { showToast(safeT('toast.error.enterAll'), 'error'); return; }
    const factor = want / orig;
    const pv = el('res-portion-val'); if (pv) pv.innerText = fmt(qty * factor, 2);
    show('portion-result-box');
}
const DRINK_DEFAULTS = { kafa_turska: { val: 1, unitKey: 'unit.teaspoon' }, kafa_espreso: { val: 7, unitKey: 'unit.g' }, caj_kesica: { val: 1, unitKey: 'unit.teabag' } };
function calculateDrink() {
    const type = el('drink-type') ? el('drink-type').value : 'kafa_turska';
    const cups = num('drink-cups');
    if (!cups) { showToast(safeT('toast.error.enterCups'), 'error'); return; }
    const def = DRINK_DEFAULTS[type] || DRINK_DEFAULTS.kafa_turska;
    const dv = el('res-drink-val'); if (dv) dv.innerText = fmt(cups * def.val, 1);
    const du = el('res-drink-unit'); if (du) du.innerText = safeT(def.unitKey);
    show('drink-result-box');
}

// ============================================================
// STRUJA
// ============================================================
function renderPowerUredjaj() {
    return `<div class="converter-box">${sectionDescKey('desc.power.device')}${inputField('label.power.powerWatts', 'power-watts', 'W', 'placeholder="1000"')}${inputField('label.power.hoursPerDay', 'power-hours', 'h', 'placeholder="2"')}${inputField('label.power.electricityPrice', 'power-price', 'RSD/kWh', 'value="12"')}${calcButton('btn.calculate', 'calculatePower()')}</div>${resultCard('power-result-box', 'zap', 'label.power.monthlyCost', 'res-power-month', 'RSD', 'STRUJA', 'label.power.deviceUsage')}${statsRow('power-stats-row', [['label.power.daily', 'stat-power-day', '0 RSD'], ['label.power.yearly', 'stat-power-year', '0 RSD'], ['label.power.kwhPerMonth', 'stat-power-kwh', '0']])}`;
}
function renderPowerVise() {
    return `<div class="converter-box">${sectionDescKey('desc.power.multipleDevices')}${inputFieldText('label.power.deviceName', 'dev-name', 'npr. Bojler')}${inputField('label.power.powerWatts', 'dev-watts', 'W', 'placeholder="2000"')}${inputField('label.power.hoursPerDay', 'dev-hours', 'h', 'placeholder="2"')}${calcButton('btn.power.addDevice', 'addPowerDevice()')}</div><div class="converter-box"><div class="section-desc">${safeT('label.power.device')}:</div><div id="power-devices-list"></div></div>${resultCard('power-multi-result-box', 'plug2', 'label.power.totalMonthly', 'res-power-total', 'RSD', 'STRUJA', 'label.power.multipleDevicesShort')}${statsRow('power-multi-stats-row', [['label.power.devicesCount', 'stat-power-count', '0'], ['label.power.totalKwhMonth', 'stat-power-total-kwh', '0']])}`;
}
function renderPowerWatt() {
    return `<div class="converter-box">${sectionDescKey('desc.power.wattAmps')}${selectField('label.power.phaseType', 'watt-phase', [{ value: '1', text: safeT('option.power.singlePhase') }, { value: '3', text: safeT('option.power.threePhase') }])}${selectField('label.power.conversionDirection', 'watt-dir', [{ value: 'w-to-a', text: safeT('option.power.powerToCurrent') }, { value: 'a-to-w', text: safeT('option.power.currentToPower') }])}${inputField('label.power.value', 'watt-val', '', 'placeholder="2000"')}${inputField('label.power.voltage', 'watt-volt', 'V', 'value="230"')}${inputField('label.power.powerFactor', 'watt-cosfi', '', 'value="0.95"')}${calcButton('btn.calculate', 'calculateWattAmps()')}</div><div id="watt-result-box" class="result-card-green" style="display: none;"><div class="res-left"><div class="pump-icon">${icon('battery')}</div><div><div class="res-label">${safeT('result.label')}</div><h2><span id="res-watt-val">0</span> <small id="res-watt-unit">A</small></h2></div></div><div class="res-actions"><button class="copy-btn" onclick="copyResult('res-watt-val', 'res-watt-unit', event)">${safeT('result.copy')}</button><button class="copy-btn" data-category="STRUJA" data-label="W-A" onclick="saveHistory(this)">${safeT('result.save')}</button><button class="copy-btn" data-category="STRUJA" data-label="W-A" onclick="shareResult(this)">${safeT('result.share')}</button></div></div>${statsRow('watt-stats-row', [['label.power.power', 'stat-watt-w', '0 W'], ['label.power.current', 'stat-watt-a', '0 A'], ['label.power.recommendedFuse', 'stat-watt-osig', '0 A']])}`;
}
function renderPowerFaktura() {
    return `<div class="converter-box">${sectionDescKey('desc.power.bill')}${inputField('label.power.highTariffUsage', 'fakt-visa', 'kWh', 'placeholder="200"')}${inputField('label.power.lowTariffUsage', 'fakt-niza', 'kWh', 'placeholder="100"')}${inputField('label.power.highTariffPrice', 'fakt-cena-visa', 'RSD', 'value="12"')}${inputField('label.power.lowTariffPrice', 'fakt-cena-niza', 'RSD', 'value="6"')}${inputField('label.power.fixedPart', 'fakt-fiksni', 'RSD', 'value="0"')}${calcButton('btn.calculate', 'calculateBill()')}</div>${resultCard('fakt-result-box', 'trending', 'label.power.totalToPay', 'res-fakt-total', 'RSD', 'STRUJA', 'label.power.bill')}${statsRow('fakt-stats-row', [['label.power.highTariff', 'stat-fakt-visa', '0 RSD'], ['label.power.lowTariff', 'stat-fakt-niza', '0 RSD'], ['label.power.totalKwh', 'stat-fakt-kwh', '0']])}`;
}
function renderPowerKabl() {
    return `<div class="converter-box">${sectionDescKey('desc.power.cable')}${inputField('label.power.loadCurrent', 'kabl-amps', 'A', 'placeholder="16"')}${inputField('label.power.cableLength', 'kabl-len', 'm', 'placeholder="20"')}${inputField('label.power.voltage', 'kabl-volt', 'V', 'value="230"')}${selectField('label.power.cableType', 'kabl-type', [{ value: 'bakr', text: safeT('option.power.copper') }, { value: 'alu', text: safeT('option.power.aluminum') }])}${calcButton('btn.calculate', 'calculateCable()')}</div><div id="kabl-result-box" class="result-card-green" style="display: none;"><div class="res-left"><div class="pump-icon">${icon('cable')}</div><div><div class="res-label">${safeT('label.power.recommendedSection')}</div><h2><span id="res-kabl-mm2">0</span> <small>mm²</small></h2></div></div><div class="res-actions"><button class="copy-btn" onclick="copyResult('res-kabl-mm2', 'mm²', event)">${safeT('result.copy')}</button><button class="copy-btn" data-category="STRUJA" data-label="Kabl" onclick="saveHistory(this)">${safeT('result.save')}</button><button class="copy-btn" data-category="STRUJA" data-label="Kabl" onclick="shareResult(this)">${safeT('result.share')}</button></div></div>${statsRow('kabl-stats-row', [['label.power.fuse', 'stat-kabl-osig', '0 A'], ['label.power.dropPercent', 'stat-kabl-pad', '0 %'], ['label.power.material', 'stat-kabl-mat', '—']])}`;
}
function renderPowerPadNapona() {
    return `<div class="converter-box">${sectionDescKey('desc.power.voltageDrop')}${inputField('label.power.loadCurrent', 'pad-amps', 'A', 'placeholder="16"')}${inputField('label.power.cableLengthOneWay', 'pad-len', 'm', 'placeholder="20"')}${inputField('label.power.cableSection', 'pad-mm2', 'mm²', 'placeholder="2.5"')}${inputField('label.power.voltage', 'pad-volt', 'V', 'value="230"')}${selectField('label.power.material', 'pad-mat', [{ value: '0.0178', text: safeT('option.power.copperRho') }, { value: '0.0282', text: safeT('option.power.aluminumRho') }])}${calcButton('btn.calculate', 'calculateVoltageDrop()')}</div><div id="pad-result-box" class="result-card-green" style="display: none;"><div class="res-left"><div class="pump-icon">${icon('zap')}</div><div><div class="res-label">${safeT('label.power.voltageDrop')}</div><h2><span id="res-pad-volt">0</span> <small>V</small></h2></div></div><div class="res-actions"><button class="copy-btn" onclick="copyResult('res-pad-volt', 'V', event)">${safeT('result.copy')}</button><button class="copy-btn" data-category="STRUJA" data-label="Pad napona" onclick="saveHistory(this)">${safeT('result.save')}</button><button class="copy-btn" data-category="STRUJA" data-label="Pad napona" onclick="shareResult(this)">${safeT('result.share')}</button></div></div>${statsRow('pad-stats-row', [['label.power.dropPercent', 'stat-pad-pct', '0 %'], ['label.power.voltageAtEnd', 'stat-pad-end', '0 V'], ['label.power.rating', 'stat-pad-ok', '—']])}`;
}
function renderPowerOsigurac() {
    return `<div class="converter-box">${sectionDescKey('desc.power.fuse')}${inputField('label.power.devicePower', 'osig-watt', 'W', 'placeholder="2000"')}${inputField('label.power.voltage', 'osig-volt', 'V', 'value="230"')}${selectField('label.power.consumerType', 'osig-tip', [{ value: '1', text: safeT('option.power.ohmic') }, { value: '3', text: safeT('option.power.inductive') }, { value: '5', text: safeT('option.power.largeMotor') }])}${selectField('label.power.characteristic', 'osig-char', [{ value: 'B', text: safeT('option.power.charB') }, { value: 'C', text: safeT('option.power.charC') }, { value: 'D', text: safeT('option.power.charD') }])}${calcButton('btn.calculate', 'calculateFuse()')}</div><div id="osig-result-box" class="result-card-green" style="display: none;"><div class="res-left"><div class="pump-icon">${icon('shield')}</div><div><div class="res-label">${safeT('label.power.recommendedFuse')}</div><h2><span id="res-osig-val">0</span> <small>A</small> <span id="res-osig-char" style="font-size:0.9rem; color: #34d399;">C</span></h2></div></div><div class="res-actions"><button class="copy-btn" onclick="copyResult('res-osig-val', 'A', event)">${safeT('result.copy')}</button><button class="copy-btn" data-category="STRUJA" data-label="Osigurač" onclick="saveHistory(this)">${safeT('result.save')}</button><button class="copy-btn" data-category="STRUJA" data-label="Osigurač" onclick="shareResult(this)">${safeT('result.share')}</button></div></div>${statsRow('osig-stats-row', [['label.power.workingCurrent', 'stat-osig-radna', '0 A'], ['label.power.startingCurrent', 'stat-osig-start', '0 A'], ['label.power.minCableSection', 'stat-osig-kabl', '0 mm²']])}`;
}
function renderPowerTrofazna() {
    return `<div class="converter-box">${sectionDescKey('desc.power.threePhase')}${selectField('label.power.known', 'trofaz-poz', [{ value: 'snaga', text: safeT('label.power.power') + ' (kW)' }, { value: 'struja', text: safeT('label.power.current') + ' (A)' }])}${inputField('label.power.value', 'trofaz-val', '', 'placeholder="10"')}${inputField('label.power.lineVoltage', 'trofaz-volt', 'V', 'value="400"')}${inputField('label.power.powerFactor', 'trofaz-cosfi', '', 'value="0.9"')}${calcButton('btn.calculate', 'calculateThreePhase()')}</div><div id="trofaz-result-box" class="result-card-green" style="display: none;"><div class="res-left"><div class="pump-icon">${icon('chart')}</div><div><div class="res-label">${safeT('result.label')}</div><h2><span id="res-trofaz-val">0</span> <small id="res-trofaz-unit">A</small></h2></div></div><div class="res-actions"><button class="copy-btn" onclick="copyResult('res-trofaz-val', 'res-trofaz-unit', event)">${safeT('result.copy')}</button><button class="copy-btn" data-category="STRUJA" data-label="Trofazna" onclick="saveHistory(this)">${safeT('result.save')}</button><button class="copy-btn" data-category="STRUJA" data-label="Trofazna" onclick="shareResult(this)">${safeT('result.share')}</button></div></div>${statsRow('trofaz-stats-row', [['label.power.power', 'stat-trofaz-kw', '0 kW'], ['label.power.currentPerPhase', 'stat-trofaz-a', '0 A'], ['label.power.totalCurrent', 'stat-trofaz-tot', '0 A']])}`;
}
function renderPowerOsvetljenje() {
    return `<div class="converter-box">${sectionDescKey('desc.power.lighting')}${inputField('label.power.roomLength', 'osv-l', 'm', 'placeholder="5"')}${inputField('label.power.roomWidth', 'osv-w', 'm', 'placeholder="4"')}${inputField('label.power.ceilingHeight', 'osv-h', 'm', 'value="2.6"')}${selectField('label.power.roomType', 'osv-tip', [{ value: '50', text: safeT('option.power.bathroom') }, { value: '100', text: safeT('option.power.bedroom') }, { value: '150', text: safeT('option.power.livingRoom') }, { value: '300', text: safeT('option.power.kitchen') }, { value: '500', text: safeT('option.power.office') }])}${inputField('label.power.bulbPower', 'osv-watt', 'W', 'value="10"')}${calcButton('btn.calculate', 'calculateLighting()')}</div>${resultCard('osv-result-box', 'lightbulb', 'label.power.lumensNeeded', 'res-osv-lumen', 'lm', 'STRUJA', 'label.power.lightingShort')}${statsRow('osv-stats-row', [['label.home.totalArea', 'stat-osv-pov', '0 m²'], ['label.power.bulbsCount', 'stat-osv-br', '0'], ['label.power.totalPower', 'stat-osv-w', '0 W']])}`;
}
function renderPowerGrejac() {
    return `<div class="converter-box">${sectionDescKey('desc.power.heater')}${inputField('label.power.heaterPower', 'grej-watt', 'W', 'placeholder="2000"')}${inputField('label.power.waterAmount', 'grej-litar', 'L', 'placeholder="80"')}${inputField('label.power.startTemp', 'grej-t1', '°C', 'value="15"')}${inputField('label.power.desiredTemp', 'grej-t2', '°C', 'value="60"')}${inputField('label.power.price', 'grej-cena', 'RSD/kWh', 'value="12"')}${calcButton('btn.calculate', 'calculateHeater()')}</div>${resultCard('grej-result-box', 'thermometer2', 'label.power.heatingTime', 'res-grej-vreme', 'min', 'STRUJA', 'label.power.heaterShort')}${statsRow('grej-stats-row', [['label.power.energy', 'stat-grej-kwh', '0 kWh'], ['label.power.price', 'stat-grej-cena', '0 RSD'], ['label.power.energyKj', 'stat-grej-kj', '0 kJ']])}`;
}
function renderPowerBaterije() {
    return `<div class="converter-box">${sectionDescKey('desc.power.battery')}${inputField('label.power.batteryVoltage', 'bat-volt', 'V', 'value="12"')}${inputField('label.power.capacity', 'bat-ah', 'Ah', 'placeholder="100"')}${inputField('label.power.load', 'bat-watt', 'W', 'placeholder="50"')}${inputField('label.power.depthOfDischarge', 'bat-dod', '%', 'value="80"')}${calcButton('btn.calculate', 'calculateBattery()')}</div>${resultCard('bat-result-box', 'battery', 'label.power.batteryLife', 'res-bat-time', 'h', 'STRUJA', 'label.power.batteryShort')}${statsRow('bat-stats-row', [['label.power.capacity', 'stat-bat-wh', '0 Wh'], ['label.power.usefulEnergy', 'stat-bat-wh-use', '0 Wh'], ['label.power.current', 'stat-bat-amp', '0 A']])}`;
}
function renderPowerKelvin() {
    return `<div class="converter-box">${sectionDescKey('desc.power.kelvin')}${selectField('label.power.recommendedLightTemp', 'kel-tip', [{ value: '2700', text: safeT('option.power.kelvin2700') }, { value: '3000', text: safeT('option.power.kelvin3000') }, { value: '4000', text: safeT('option.power.kelvin4000') }, { value: '5000', text: safeT('option.power.kelvin5000') }, { value: '6500', text: safeT('option.power.kelvin6500') }], '4000')}${inputField('label.power.bulbPower', 'kel-watt', 'W', 'value="10"')}${calcButton('btn.calculate', 'calculateKelvin()')}</div><div id="kel-result-box" class="result-card-green" style="display: none;"><div class="res-left"><div class="pump-icon">${icon('flashlight')}</div><div><div class="res-label">${safeT('label.power.kelvinShort')}</div><h2><span id="res-kel-val">0</span> <small>K</small></h2></div></div><div class="res-actions"><button class="copy-btn" onclick="copyResult('res-kel-val', 'K', event)">${safeT('result.copy')}</button><button class="copy-btn" data-category="STRUJA" data-label="Kelvin" onclick="saveHistory(this)">${safeT('result.save')}</button><button class="copy-btn" data-category="STRUJA" data-label="Kelvin" onclick="shareResult(this)">${safeT('result.share')}</button></div></div>${statsRow('kel-stats-row', [['label.power.description', 'stat-kel-desc', '—'], ['label.power.approxLumens', 'stat-kel-lum', '0 lm']])}`;
}

function calculatePower() {
    const watts = num('power-watts'), hours = num('power-hours'), price = num('power-price') || 12;
    if (!watts || !hours) { showToast(safeT('toast.error.enterPowerHours'), 'error'); return; }
    const kwhDay = (watts * hours) / 1000;
    const kwhMonth = kwhDay * 30;
    const pm = el('res-power-month'); if (pm) pm.innerText = money(kwhMonth * price);
    const pd = el('stat-power-day'); if (pd) pd.innerText = money(kwhDay * price) + ' RSD';
    const py = el('stat-power-year'); if (py) py.innerText = money(kwhDay * 365 * price) + ' RSD';
    const pk = el('stat-power-kwh'); if (pk) pk.innerText = fmt(kwhMonth, 1);
    show('power-result-box'); show('power-stats-row');
}
let powerDevices = [];
try { const saved = JSON.parse(localStorage.getItem('cx_power_devices')); if (Array.isArray(saved)) powerDevices = saved; } catch (e) {}
function savePowerDevices() { try { localStorage.setItem('cx_power_devices', JSON.stringify(powerDevices)); } catch (e) {} }
function renderPowerDevices() {
    const list = el('power-devices-list');
    if (!list) return;
    list.innerHTML = '';
    if (!powerDevices.length) { list.innerHTML = '<p class="section-desc" style="text-align:center; padding:10px;">' + safeT('label.power.noDevices') + '</p>'; return; }
    powerDevices.forEach((dev, idx) => {
        const row = document.createElement('div');
        row.className = 'power-device-item';
        row.innerHTML = `<div class="power-device-info"><div class="power-device-name">${escapeHtml(dev.name || safeT('label.power.device') + ' ' + (idx + 1))}</div><div class="power-device-detail">${dev.watts}W × ${dev.hours}h/${safeT('unit.day')}</div></div><button class="power-device-remove">✕</button>`;
        row.querySelector('.power-device-remove').addEventListener('click', () => { powerDevices.splice(idx, 1); savePowerDevices(); renderPowerDevices(); updatePowerTotal(); });
        list.appendChild(row);
    });
}
function updatePowerTotal() {
    if (!powerDevices.length) { hide('power-multi-result-box'); hide('power-multi-stats-row'); return; }
    let totalMonth = 0, totalKwh = 0;
    powerDevices.forEach(dev => { const kwhMonth = ((dev.watts * dev.hours) / 1000) * 30; totalKwh += kwhMonth; totalMonth += kwhMonth * (dev.price || 12); });
    const pt = el('res-power-total'); if (pt) pt.innerText = money(totalMonth);
    const pc = el('stat-power-count'); if (pc) pc.innerText = powerDevices.length;
    const pk = el('stat-power-total-kwh'); if (pk) pk.innerText = fmt(totalKwh, 1);
    show('power-multi-result-box'); show('power-multi-stats-row');
}
function addPowerDevice() {
    const nameEl = el('dev-name');
    const name = nameEl ? (nameEl.value.trim() || safeT('label.power.device')) : safeT('label.power.device');
    const watts = num('dev-watts'), hours = num('dev-hours'), price = num('dev-price') || 12;
    if (!watts || !hours) { showToast(safeT('toast.error.enterPowerHours'), 'error'); return; }
    powerDevices.push({ name, watts, hours, price });
    savePowerDevices(); renderPowerDevices(); updatePowerTotal();
    if (nameEl) nameEl.value = '';
    if (el('dev-watts')) el('dev-watts').value = '';
    if (el('dev-hours')) el('dev-hours').value = '';
    showToast(safeT('toast.deviceAdded'), 'success', 1500);
}
function calculateWattAmps() {
    const phases = el('watt-phase') && el('watt-phase').value === '3' ? 3 : 1;
    const dir = el('watt-dir') ? el('watt-dir').value : 'w-to-a';
    const volts = num('watt-volt') || 230;
    const cosfi = el('watt-cosfi') ? (parseNum(el('watt-cosfi').value) || 0.95) : 0.95;
    const val = num('watt-val');
    if (val === null) { hide('watt-result-box'); hide('watt-stats-row'); return; }
    const sqrt3 = Math.sqrt(3);
    let result, unit, powerW, amps;
    if (dir === 'w-to-a') { powerW = val; amps = phases === 3 ? powerW / (sqrt3 * volts * cosfi) : powerW / (volts * cosfi); result = amps; unit = 'A'; }
    else { amps = val; powerW = phases === 3 ? sqrt3 * volts * amps * cosfi : volts * amps * cosfi; result = powerW; unit = 'W'; }
    const fuses = [6, 10, 13, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125];
    const recommendedFuse = fuses.find(f => f >= amps * 1.1) || 125;
    const rv = el('res-watt-val'); if (rv) rv.innerText = fmt(result, 2);
    const ru = el('res-watt-unit'); if (ru) ru.innerText = unit;
    const sw = el('stat-watt-w'); if (sw) sw.innerText = fmt(powerW, 0) + ' W';
    const sa = el('stat-watt-a'); if (sa) sa.innerText = fmt(amps, 2) + ' A';
    const so = el('stat-watt-osig'); if (so) so.innerText = recommendedFuse + ' A';
    show('watt-result-box'); show('watt-stats-row');
}
function calculateBill() {
    const visaKwh = num('fakt-visa') || 0, nizaKwh = num('fakt-niza') || 0;
    const visaCena = num('fakt-cena-visa') || 12, nizaCena = num('fakt-cena-niza') || 6, fiksni = num('fakt-fiksni') || 0;
    if (!visaKwh && !nizaKwh) { showToast(safeT('toast.error.enterUsage'), 'error'); return; }
    const visaTotal = visaKwh * visaCena, nizaTotal = nizaKwh * nizaCena;
    const rt = el('res-fakt-total'); if (rt) rt.innerText = money(visaTotal + nizaTotal + fiksni);
    const sv = el('stat-fakt-visa'); if (sv) sv.innerText = money(visaTotal) + ' RSD';
    const sn = el('stat-fakt-niza'); if (sn) sn.innerText = money(nizaTotal) + ' RSD';
    const sk = el('stat-fakt-kwh'); if (sk) sk.innerText = fmt(visaKwh + nizaKwh, 1);
    show('fakt-result-box'); show('fakt-stats-row');
}
function calculateCable() {
    const amps = num('kabl-amps'), len = num('kabl-len'), volts = num('kabl-volt') || 230;
    const isCopper = !el('kabl-type') || el('kabl-type').value === 'bakr';
    if (!amps || !len) { showToast(safeT('toast.error.enterCurrentLength'), 'error'); return; }
    const ampacity = isCopper ? { 1.5: 14, 2.5: 20, 4: 26, 6: 34, 10: 46, 16: 62, 25: 80, 35: 100, 50: 125 } : { 2.5: 15, 4: 20, 6: 26, 10: 36, 16: 48, 25: 62, 35: 78, 50: 96 };
    const rho = isCopper ? 0.0178 : 0.0282;
    const sections = Object.keys(ampacity).map(Number).sort((a, b) => a - b);
    let chosen = null;
    for (const s of sections) { if (ampacity[s] >= amps * 1.15) { chosen = s; break; } }
    if (!chosen) chosen = sections[sections.length - 1];
    const minSectionForDrop = (2 * rho * len * amps) / (volts * 0.05);
    if (minSectionForDrop > chosen) { for (const s of sections) { if (s >= minSectionForDrop) { chosen = s; break; } } }
    const dropPct = ((2 * rho * len * amps) / chosen / volts) * 100;
    const fuses = [6, 10, 13, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125];
    const rv = el('res-kabl-mm2'); if (rv) rv.innerText = fmt(chosen, 1);
    const so = el('stat-kabl-osig'); if (so) so.innerText = (fuses.find(f => f >= amps * 1.15) || 125) + ' A';
    const sp = el('stat-kabl-pad'); if (sp) sp.innerText = fmt(dropPct, 2) + ' %';
    const sm = el('stat-kabl-mat'); if (sm) sm.innerText = isCopper ? safeT('option.power.copper') : safeT('option.power.aluminum');
    show('kabl-result-box'); show('kabl-stats-row');
}
function calculateVoltageDrop() {
    const amps = num('pad-amps'), len = num('pad-len'), mm2 = num('pad-mm2'), volts = num('pad-volt') || 230;
    const rho = el('pad-mat') ? parseFloat(el('pad-mat').value) : 0.0178;
    if (!amps || !len || !mm2) { showToast(safeT('toast.error.enterAll'), 'error'); return; }
    const dropV = (2 * rho * len * amps) / mm2, dropPct = (dropV / volts) * 100;
    let ocena, boja;
    if (dropPct > 5) { ocena = safeT('label.power.ratingBad'); boja = '#f43f5e'; }
    else if (dropPct > 3) { ocena = safeT('label.power.ratingBorderline'); boja = '#f59e0b'; }
    else { ocena = safeT('label.power.ratingGood'); boja = '#10b981'; }
    const rv = el('res-pad-volt'); if (rv) rv.innerText = fmt(dropV, 2);
    const sp = el('stat-pad-pct'); if (sp) sp.innerText = fmt(dropPct, 2) + ' %';
    const se = el('stat-pad-end'); if (se) se.innerText = fmt(volts - dropV, 1) + ' V';
    const so = el('stat-pad-ok'); if (so) { so.innerText = ocena; so.style.color = boja; }
    show('pad-result-box'); show('pad-stats-row');
}
function calculateFuse() {
    const watt = num('osig-watt'), volts = num('osig-volt') || 230;
    const tip = el('osig-tip') ? parseFloat(el('osig-tip').value) : 1;
    const char = el('osig-char') ? el('osig-char').value : 'C';
    if (!watt) { showToast(safeT('toast.error.enterPower'), 'error'); return; }
    const radna = watt / volts, startna = radna * tip;
    const fuses = [6, 10, 13, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125];
    const recommended = fuses.find(f => f >= startna * 1.1) || 125;
    const cableByFuse = { 6: 1.5, 10: 1.5, 13: 1.5, 16: 2.5, 20: 2.5, 25: 4, 32: 6, 40: 6, 50: 10, 63: 16, 80: 25, 100: 35, 125: 50 };
    const rv = el('res-osig-val'); if (rv) rv.innerText = recommended;
    const rc = el('res-osig-char'); if (rc) rc.innerText = char;
    const sr = el('stat-osig-radna'); if (sr) sr.innerText = fmt(radna, 2) + ' A';
    const ss = el('stat-osig-start'); if (ss) ss.innerText = fmt(startna, 2) + ' A';
    const sk = el('stat-osig-kabl'); if (sk) sk.innerText = fmt(cableByFuse[recommended] || 2.5, 1) + ' mm²';
    show('osig-result-box'); show('osig-stats-row');
}
function calculateThreePhase() {
    const poz = el('trofaz-poz') ? el('trofaz-poz').value : 'snaga';
    const val = num('trofaz-val'), volts = num('trofaz-volt') || 400;
    const cosfi = el('trofaz-cosfi') ? (parseNum(el('trofaz-cosfi').value) || 0.9) : 0.9;
    if (val === null) { showToast(safeT('toast.error.enterValue'), 'error'); return; }
    const sqrt3 = Math.sqrt(3);
    let result, unit, powerKw, amps;
    if (poz === 'snaga') { powerKw = val; amps = (powerKw * 1000) / (sqrt3 * volts * cosfi); result = amps; unit = 'A'; }
    else { amps = val; powerKw = (sqrt3 * volts * amps * cosfi) / 1000; result = powerKw; unit = 'kW'; }
    const rv = el('res-trofaz-val'); if (rv) rv.innerText = fmt(result, 2);
    const ru = el('res-trofaz-unit'); if (ru) ru.innerText = unit;
    const sk = el('stat-trofaz-kw'); if (sk) sk.innerText = fmt(powerKw, 2) + ' kW';
    const sa = el('stat-trofaz-a'); if (sa) sa.innerText = fmt(amps, 2) + ' A';
    const st = el('stat-trofaz-tot'); if (st) st.innerText = fmt(amps * 3, 2) + ' A';
    show('trofaz-result-box'); show('trofaz-stats-row');
}
function calculateLighting() {
    const l = num('osv-l'), w = num('osv-w'), h = num('osv-h') || 2.6;
    const lux = el('osv-tip') ? parseFloat(el('osv-tip').value) : 150;
    const wattEl = num('osv-watt') || 10;
    if (!l || !w) { showToast(safeT('toast.error.enterRoomDims'), 'error'); return; }
    const area = l * w;
    let heightFactor = 1;
    if (h > 3) heightFactor = 1 + (h - 3) * 0.15;
    else if (h > 2.7) heightFactor = 1.05;
    const lumens = area * lux * heightFactor;
    const brojSijalica = Math.max(1, Math.ceil((lumens / 100) / wattEl));
    const rv = el('res-osv-lumen'); if (rv) rv.innerText = fmt(lumens, 0);
    const sp = el('stat-osv-pov'); if (sp) sp.innerText = fmt(area, 2) + ' m²';
    const sb = el('stat-osv-br'); if (sb) sb.innerText = brojSijalica;
    const sw = el('stat-osv-w'); if (sw) sw.innerText = fmt(brojSijalica * wattEl, 0) + ' W';
    show('osv-result-box'); show('osv-stats-row');
}
function calculateHeater() {
    const watt = num('grej-watt'), litra = num('grej-litar'), t1 = num('grej-t1') || 15, t2 = num('grej-t2') || 60, cena = num('grej-cena') || 12;
    if (!watt || !litra) { showToast(safeT('toast.error.enterPowerWater'), 'error'); return; }
    if (t2 <= t1) { showToast(safeT('toast.error.endTempHigher'), 'error'); return; }
    const energyJ = litra * 4186 * (t2 - t1), energyKwh = energyJ / 3600000;
    const timeMin = (energyKwh / (watt / 1000)) * 60;
    const rv = el('res-grej-vreme'); if (rv) rv.innerText = fmt(timeMin, 1);
    const sk = el('stat-grej-kwh'); if (sk) sk.innerText = fmt(energyKwh, 2) + ' kWh';
    const sc = el('stat-grej-cena'); if (sc) sc.innerText = money(energyKwh * cena) + ' RSD';
    const sj = el('stat-grej-kj'); if (sj) sj.innerText = fmt(energyJ / 1000, 0) + ' kJ';
    show('grej-result-box'); show('grej-stats-row');
}
function calculateBattery() {
    const volt = num('bat-volt') || 12, ah = num('bat-ah'), watt = num('bat-watt'), dod = num('bat-dod') || 80;
    if (!ah || !watt) { showToast(safeT('toast.error.enterCapacityLoad'), 'error'); return; }
    const wh = volt * ah, usefulWh = wh * (dod / 100);
    const rv = el('res-bat-time'); if (rv) rv.innerText = fmt(usefulWh / watt, 2);
    const sw = el('stat-bat-wh'); if (sw) sw.innerText = fmt(wh, 1) + ' Wh';
    const su = el('stat-bat-wh-use'); if (su) su.innerText = fmt(usefulWh, 1) + ' Wh';
    const sa = el('stat-bat-amp'); if (sa) sa.innerText = fmt(watt / volt, 2) + ' A';
    show('bat-result-box'); show('bat-stats-row');
}
function calculateKelvin() {
    const kel = el('kel-tip') ? parseInt(el('kel-tip').value) : 4000;
    const watt = num('kel-watt') || 10;
    let desc;
    if (kel <= 2700) desc = safeT('label.power.kelvinDesc2700');
    else if (kel <= 3000) desc = safeT('label.power.kelvinDesc3000');
    else if (kel <= 4000) desc = safeT('label.power.kelvinDesc4000');
    else if (kel <= 5000) desc = safeT('label.power.kelvinDesc5000');
    else desc = safeT('label.power.kelvinDesc6500');
    const rv = el('res-kel-val'); if (rv) rv.innerText = kel;
    const sd = el('stat-kel-desc'); if (sd) sd.innerText = desc;
    const sl = el('stat-kel-lum'); if (sl) sl.innerText = fmt(watt * 100, 0) + ' lm';
    show('kel-result-box'); show('kel-stats-row');
}

// ============================================================
// POSAO
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
function renderWorkPutni() {
    return `<div class="converter-box">${sectionDescKey('desc.work.travel')}${inputField('label.work.tripDays', 'putni-days', '', 'value="3"')}${inputField('label.work.dailyAllowance', 'putni-daily', 'RSD', 'placeholder="2000"')}${inputField('label.work.fuelCost', 'putni-fuel', 'RSD', 'placeholder="0"')}${inputField('label.work.accommodationCost', 'putni-hotel', 'RSD', 'placeholder="0"')}${calcButton('btn.calculate', 'calculateTravelExpenses()')}</div>${resultCard('putni-result-box', 'car', 'label.work.totalTravelCosts', 'res-putni-total', 'RSD', 'POSAO', 'label.work.travelShort')}${statsRow('putni-stats-row', [['label.work.allowances', 'stat-putni-daily-total', '0 RSD'], ['label.work.fuelCost', 'stat-putni-fuel-total', '0 RSD'], ['label.work.accommodation', 'stat-putni-hotel-total', '0 RSD']])}`;
}
function renderWorkBonusi() {
    return `<div class="converter-box">${sectionDescKey('desc.work.bonuses')}${inputField('label.work.monthsForBonus', 'bonus-months', '', 'value="12"')}${inputField('label.work.avgMonthlySalary', 'bonus-salary', 'RSD', 'placeholder="80000"')}${inputField('label.work.thirteenthSalary', 'bonus-13th', 'RSD', 'placeholder="0"')}${inputField('label.work.vacationAllowance', 'bonus-regres', 'RSD', 'placeholder="0"')}${inputField('label.work.mealAllowance', 'bonus-meal', 'RSD', 'placeholder="0"')}${calcButton('btn.calculate', 'calculateBonuses()')}</div>${resultCard('bonus-result-box', 'gift', 'label.work.totalBonuses', 'res-bonus-total', 'RSD', 'POSAO', 'label.work.bonusesShort')}${statsRow('bonus-stats-row', [['label.work.bonusesByMonths', 'stat-bonus-months-total', '0 RSD'], ['label.work.annualTotal', 'stat-bonus-yearly', '0 RSD']])}`;
}

function calculateWorkTime() {
    const start = el('work-start') ? el('work-start').value : '';
    const end = el('work-end') ? el('work-end').value : '';
    const breakMin = num('work-break') || 0;
    const dayType = el('work-day-type') ? el('work-day-type').value : 'workday';
    if (!start || !end) { showToast(safeT('toast.error.enterStartEnd'), 'error'); return; }
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
    if (!salary || !hours) { showToast(safeT('toast.error.enterSalaryHours'), 'error'); return; }
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
    if (!amount) { showToast(safeT('toast.error.enterAmount'), 'error'); return; }
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
    if (!hours || !rate) { showToast(safeT('toast.error.enterHoursRate'), 'error'); return; }
    const base = hours * rate, total = base * mult;
    const nt = el('res-nocni-total'); if (nt) nt.innerText = money(total);
    const nb = el('stat-nocni-base'); if (nb) nb.innerText = money(base) + ' RSD';
    const nbo = el('stat-nocni-bonus'); if (nbo) nbo.innerText = money(total - base) + ' RSD';
    show('nocni-result-box'); show('nocni-stats-row');
}
function calculateOvertime() {
    const hours = num('prek-hours'), rate = num('prek-rate');
    if (!hours || !rate) { showToast(safeT('toast.error.enterHoursRate'), 'error'); return; }
    const first2 = Math.min(hours, 2), rest = Math.max(0, hours - 2);
    const pt = el('res-prek-total'); if (pt) pt.innerText = money(first2 * rate * 1.26 + rest * rate * 1.5);
    const pf = el('stat-prek-first'); if (pf) pf.innerText = money(first2 * rate * 1.26) + ' RSD';
    const pr = el('stat-prek-rest'); if (pr) pr.innerText = money(rest * rate * 1.5) + ' RSD';
    show('prek-result-box'); show('prek-stats-row');
}
function calculateTravelExpenses() {
    const days = num('putni-days') || 0, daily = num('putni-daily') || 0, fuel = num('putni-fuel') || 0, hotel = num('putni-hotel') || 0;
    const dailyTotal = days * daily;
    const pt = el('res-putni-total'); if (pt) pt.innerText = money(dailyTotal + fuel + hotel);
    const pd = el('stat-putni-daily-total'); if (pd) pd.innerText = money(dailyTotal) + ' RSD';
    const pf = el('stat-putni-fuel-total'); if (pf) pf.innerText = money(fuel) + ' RSD';
    const ph = el('stat-putni-hotel-total'); if (ph) ph.innerText = money(hotel) + ' RSD';
    show('putni-result-box'); show('putni-stats-row');
}
function calculateBonuses() {
    const months = num('bonus-months') || 0, salary = num('bonus-salary') || 0;
    const bonus13 = num('bonus-13th') || 0, regres = num('bonus-regres') || 0, meal = num('bonus-meal') || 0;
    const monthsTotal = months * salary, mealTotal = meal * 12;
    const total = monthsTotal + bonus13 + regres + mealTotal;
    const bt = el('res-bonus-total'); if (bt) bt.innerText = money(total);
    const bm = el('stat-bonus-months-total'); if (bm) bm.innerText = money(monthsTotal) + ' RSD';
    const by = el('stat-bonus-yearly'); if (by) by.innerText = money(total) + ' RSD';
    show('bonus-result-box'); show('bonus-stats-row');
}

// ============================================================
// MUZIKA
// ============================================================
const NOTES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const SCALE_INTERVALS = {
    major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10], harmonic_minor: [0, 2, 3, 5, 7, 8, 11],
    melodic_minor: [0, 2, 3, 5, 7, 9, 11], pentatonic_major: [0, 2, 4, 7, 9], pentatonic_minor: [0, 3, 5, 7, 10],
    blues: [0, 3, 5, 6, 7, 10], dorian: [0, 2, 3, 5, 7, 9, 10], phrygian: [0, 1, 3, 5, 7, 8, 10],
    lydian: [0, 2, 4, 6, 7, 9, 11], mixolydian: [0, 2, 4, 5, 7, 9, 10], locrian: [0, 1, 3, 5, 6, 8, 10]
};
const CHORD_INTERVALS = {
    major: [0, 4, 7], minor: [0, 3, 7], dim: [0, 3, 6], aug: [0, 4, 8], sus2: [0, 2, 7], sus4: [0, 5, 7],
    '7': [0, 4, 7, 10], maj7: [0, 4, 7, 11], min7: [0, 3, 7, 10], dim7: [0, 3, 6, 9], m7b5: [0, 3, 6, 10],
    '6': [0, 4, 7, 9], m6: [0, 3, 7, 9], '9': [0, 4, 7, 10, 14], add9: [0, 4, 7, 14]
};
const INTERVAL_NAMES = ['Unison', 'Minor 2nd', 'Major 2nd', 'Minor 3rd', 'Major 3rd', 'Perfect 4th', 'Tritone', 'Perfect 5th', 'Minor 6th', 'Major 6th', 'Minor 7th', 'Major 7th', 'Octave'];
function noteToSemitone(note) {
    const flats = { 'Db': 1, 'Eb': 3, 'Gb': 6, 'Ab': 8, 'Bb': 10 };
    if (flats[note] !== undefined) return flats[note];
    const idx = NOTES_SHARP.indexOf(note);
    return idx >= 0 ? idx : 0;
}
function semitoneToNote(semi) { semi = ((semi % 12) + 12) % 12; return NOTES_SHARP[semi]; }
function transposeChord(chord, steps) {
    const match = chord.match(/^([A-G][#b]?)(.*)$/);
    if (!match) return chord;
    const newSemi = ((noteToSemitone(match[1]) + steps) % 12 + 12) % 12;
    return semitoneToNote(newSemi) + match[2];
}
function populateNoteSelects() {
    const selects = ['trans-orig', 'trans-new', 'scale-root', 'chord-root', 'kapo-orig', 'int-note1', 'int-note2', 'freq-note'];
    selects.forEach(id => {
        const sel = el(id);
        if (!sel) return;
        sel.innerHTML = '';
        NOTES_SHARP.forEach(n => {
            const opt = document.createElement('option');
            opt.value = n;
            opt.textContent = n;
            sel.appendChild(opt);
        });
    });
    if (el('trans-orig')) el('trans-orig').value = 'C';
    if (el('trans-new')) el('trans-new').value = 'D';
    if (el('scale-root')) el('scale-root').value = 'C';
    if (el('chord-root')) el('chord-root').value = 'C';
    if (el('kapo-orig')) el('kapo-orig').value = 'C';
    if (el('int-note1')) el('int-note1').value = 'C';
    if (el('int-note2')) el('int-note2').value = 'G';
    if (el('freq-note')) el('freq-note').value = 'A';
}

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
                    <div class="tuner-gauge-labels">
                        <span class="tuner-gauge-label">−50</span>
                        <span class="tuner-gauge-label tuner-gauge-label-center">0</span>
                        <span class="tuner-gauge-label">+50</span>
                    </div>
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
function renderMusicTranspozicija() {
    return `<div class="converter-box">${sectionDescKey('desc.music.transpose')}<div class="input-field"><label>${safeT('label.music.originalKey')}</label><select id="trans-orig" class="custom-input"></select></div><div class="input-field"><label>${safeT('label.music.newKey')}</label><select id="trans-new" class="custom-input"></select></div>${inputFieldText('label.music.enterChords', 'trans-chords', 'npr. C G Am F')}${calcButton('btn.calculate', 'calculateTranspose()')}</div><div id="trans-result-box" class="result-card-green" style="display: none;"><div class="res-left"><div class="pump-icon">${icon('musicNote')}</div><div><div class="res-label">${safeT('label.music.transposedChords')}</div><h3 id="res-trans-chords" class="res-text">—</h3></div></div><div class="res-actions"><button class="copy-btn" onclick="copyResult('res-trans-chords', '', event)">${safeT('result.copy')}</button><button class="copy-btn" data-category="MUZIKA" data-label="Transpozicija" onclick="saveHistory(this)">${safeT('result.save')}</button><button class="copy-btn" data-category="MUZIKA" data-label="Transpozicija" onclick="shareResult(this)">${safeT('result.share')}</button></div></div>${statsRow('trans-stats-row', [['label.music.shift', 'stat-trans-steps', '0']])}`;
}
function renderMusicLestvice() {
    return `<div class="converter-box">${sectionDescKey('desc.music.scales')}<div class="input-field"><label>${safeT('label.music.rootNote')}</label><select id="scale-root" class="custom-input"></select></div><div class="input-field"><label>${safeT('label.music.scaleType')}</label><select id="scale-type" class="custom-input"><option value="major">${safeT('option.music.major')}</option><option value="minor">${safeT('option.music.naturalMinor')}</option><option value="harmonic_minor">${safeT('option.music.harmonicMinor')}</option><option value="pentatonic_major">${safeT('option.music.pentatonicMajor')}</option><option value="pentatonic_minor">${safeT('option.music.pentatonicMinor')}</option><option value="blues">${safeT('option.music.blues')}</option></select></div>${calcButton('btn.calculate', 'calculateScale()')}</div><div id="scale-result-box" class="result-card-green" style="display: none;"><div class="res-left"><div class="pump-icon">${icon('piano')}</div><div><div class="res-label">${safeT('label.music.notesInScale')}</div><h3 id="res-scale-notes" class="res-text">—</h3></div></div><div class="res-actions"><button class="copy-btn" onclick="copyResult('res-scale-notes', '', event)">${safeT('result.copy')}</button><button class="copy-btn" data-category="MUZIKA" data-label="Lestvica" onclick="saveHistory(this)">${safeT('result.save')}</button><button class="copy-btn" data-category="MUZIKA" data-label="Lestvica" onclick="shareResult(this)">${safeT('result.share')}</button></div></div>${statsRow('scale-stats-row', [['label.music.notesCount', 'stat-scale-count', '0'], ['label.music.intervals', 'stat-scale-intervals', '—']])}`;
}
function renderMusicAkordi() {
    return `<div class="converter-box">${sectionDescKey('desc.music.chords')}<div class="input-field"><label>${safeT('label.music.rootNote')}</label><select id="chord-root" class="custom-input"></select></div><div class="input-field"><label>${safeT('label.music.chordType')}</label><select id="chord-type" class="custom-input"><option value="major">${safeT('option.music.majorChord')}</option><option value="minor">${safeT('option.music.minorChord')}</option><option value="7">${safeT('option.music.dominant7')}</option><option value="maj7">${safeT('option.music.major7')}</option><option value="min7">${safeT('option.music.minor7')}</option><option value="dim">${safeT('option.music.dim')}</option><option value="aug">${safeT('option.music.aug')}</option></select></div>${calcButton('btn.calculate', 'calculateChord()')}</div><div id="chord-result-box" class="result-card-green" style="display: none;"><div class="res-left"><div class="pump-icon">${icon('guitar')}</div><div><div class="res-label">${safeT('label.music.chordNotes')}</div><h3 id="res-chord-notes" class="res-text">—</h3></div></div><div class="res-actions"><button class="copy-btn" onclick="copyResult('res-chord-notes', '', event)">${safeT('result.copy')}</button><button class="copy-btn" data-category="MUZIKA" data-label="Akord" onclick="saveHistory(this)">${safeT('result.save')}</button><button class="copy-btn" data-category="MUZIKA" data-label="Akord" onclick="shareResult(this)">${safeT('result.share')}</button></div></div>${statsRow('chord-stats-row', [['label.music.formula', 'stat-chord-formula', '—']])}`;
}
function renderMusicKapo() {
    return `<div class="converter-box">${sectionDescKey('desc.music.capo')}<div class="input-field"><label>${safeT('label.music.originalSongKey')}</label><select id="kapo-orig" class="custom-input"></select></div>${inputField('label.music.capoFret', 'kapo-fret', '', 'placeholder="0"')}${calcButton('btn.calculate', 'calculateKapo()')}</div><div id="kapo-result-box" class="result-card-green" style="display: none;"><div class="res-left"><div class="pump-icon">${icon('mic')}</div><div><div class="res-label">${safeT('label.music.playChordsIn')}</div><h2><span id="res-kapo-key">C</span></h2></div></div><div class="res-actions"><button class="copy-btn" onclick="copyResult('res-kapo-key', '', event)">${safeT('result.copy')}</button><button class="copy-btn" data-category="MUZIKA" data-label="Kapo" onclick="saveHistory(this)">${safeT('result.save')}</button><button class="copy-btn" data-category="MUZIKA" data-label="Kapo" onclick="shareResult(this)">${safeT('result.share')}</button></div></div>${statsRow('kapo-stats-row', [['label.music.soundsInKey', 'stat-kapo-sound', 'C']])}`;
}
function renderMusicTempo() {
    return `<div class="converter-box">${sectionDescKey('desc.music.tempo')}<div class="input-field"><label>${safeT('label.music.fromUnit')}</label><select id="tempo-from" class="custom-input"><option value="bpm">BPM</option><option value="ms">ms</option></select></div>${inputField('label.music.value', 'tempo-val', '', 'placeholder="120"')}<div class="input-field"><label>${safeT('label.music.noteForDelay')}</label><select id="tempo-note" class="custom-input"><option value="1">1/1</option><option value="2">1/2</option><option value="4">1/4</option><option value="8" selected>1/8</option><option value="16">1/16</option></select></div>${calcButton('btn.calculate', 'calculateTempo()')}</div><div id="tempo-result-box" class="result-card-green" style="display: none;"><div class="res-left"><div class="pump-icon">${icon('timer')}</div><div><div class="res-label">${safeT('result.label')}</div><h2><span id="res-tempo-val">0</span> <small id="res-tempo-unit">ms</small></h2></div></div><div class="res-actions"><button class="copy-btn" onclick="copyResult('res-tempo-val', 'res-tempo-unit', event)">${safeT('result.copy')}</button><button class="copy-btn" data-category="MUZIKA" data-label="Tempo" onclick="saveHistory(this)">${safeT('result.save')}</button><button class="copy-btn" data-category="MUZIKA" data-label="Tempo" onclick="shareResult(this)">${safeT('result.share')}</button></div></div>`;
}
function renderMusicIntervali() {
    return `<div class="converter-box">${sectionDescKey('desc.music.intervals')}<div class="input-field"><label>${safeT('label.music.firstNote')}</label><select id="int-note1" class="custom-input"></select></div><div class="input-field"><label>${safeT('label.music.secondNote')}</label><select id="int-note2" class="custom-input"></select></div>${calcButton('btn.calculate', 'calculateInterval()')}</div><div id="int-result-box" class="result-card-green" style="display: none;"><div class="res-left"><div class="pump-icon">${icon('sliders')}</div><div><div class="res-label">${safeT('label.music.interval')}</div><h3 id="res-int-name" class="res-text">—</h3></div></div><div class="res-actions"><button class="copy-btn" onclick="copyResult('res-int-name', '', event)">${safeT('result.copy')}</button><button class="copy-btn" data-category="MUZIKA" data-label="Interval" onclick="saveHistory(this)">${safeT('result.save')}</button><button class="copy-btn" data-category="MUZIKA" data-label="Interval" onclick="shareResult(this)">${safeT('result.share')}</button></div></div>${statsRow('int-stats-row', [['label.music.semitonesCount', 'stat-int-semitones', '0'], ['label.music.type', 'stat-int-type', '—']])}`;
}
function renderMusicMetronom() {
    return `<div class="converter-box">${sectionDescKey('desc.music.metronome')}${inputField('label.music.bpm', 'metro-bpm', 'BPM', 'value="120"')}<div class="input-field"><label>${safeT('label.music.beatUnit')}</label><select id="metro-beat" class="custom-input"><option value="2">2/4</option><option value="3">3/4</option><option value="4" selected>4/4</option><option value="6">6/8</option></select></div><button class="calc-btn-main" id="metro-btn" onclick="toggleMetronome()">${safeT('btn.startMetronome')}</button></div>${resultCard('metro-result-box', 'drum', 'label.music.tempo', 'res-metro-val', 'BPM', 'MUZIKA', 'label.music.metronomeShort')}${statsRow('metro-stats-row', [['label.music.totalBeats', 'stat-metro-count', '0'], ['label.music.beat', 'stat-metro-takt', '1 / 4']])}`;
}
function renderMusicFrekvencije() {
    return `<div class="converter-box">${sectionDescKey('desc.music.frequencies')}<div class="input-field"><label>${safeT('label.music.note')}</label><select id="freq-note" class="custom-input"></select></div>${inputField('label.music.octave', 'freq-octave', '', 'value="4"')}${calcButton('btn.calculate', 'calculateFrequency()')}</div>${resultCard('freq-result-box', 'waves', 'label.music.frequencyHz', 'res-freq-val', 'Hz', 'MUZIKA', 'label.music.frequencyShort')}${statsRow('freq-stats-row', [['label.music.note', 'stat-freq-note', '—']])}`;
}
function renderMusicDetektor() {
    return `<div class="converter-box">${sectionDescKey('desc.music.detector')}${inputField('label.music.frequencyHz', 'detect-freq', 'Hz', 'placeholder="440"')}${calcButton('btn.calculate', 'calculateDetectNote()')}</div><div id="detect-result-box" class="result-card-green" style="display: none;"><div class="res-left"><div class="pump-icon">${icon('musicNote')}</div><div><div class="res-label">${safeT('label.music.nearestNote')}</div><h2><span id="res-detect-note">—</span></h2></div></div><div class="res-actions"><button class="copy-btn" onclick="copyResult('res-detect-note', '', event)">${safeT('result.copy')}</button><button class="copy-btn" data-category="MUZIKA" data-label="Detektor" onclick="saveHistory(this)">${safeT('result.save')}</button><button class="copy-btn" data-category="MUZIKA" data-label="Detektor" onclick="shareResult(this)">${safeT('result.share')}</button></div></div>${statsRow('detect-stats-row', [['label.music.deviation', 'stat-detect-offset', '0 Hz'], ['label.music.octave', 'stat-detect-octave', '0']])}`;
}

function calculateTranspose() {
    const orig = el('trans-orig') ? el('trans-orig').value : 'C';
    const newKey = el('trans-new') ? el('trans-new').value : 'D';
    const chordsRaw = el('trans-chords') ? el('trans-chords').value.trim() : '';
    if (!chordsRaw) { showToast(safeT('toast.error.enterChords'), 'error'); return; }
    const steps = ((noteToSemitone(newKey) - noteToSemitone(orig)) % 12 + 12) % 12;
    const stepsSigned = steps > 6 ? steps - 12 : steps;
    const transposed = chordsRaw.split(/[,\s]+/).filter(c => c).map(c => transposeChord(c, stepsSigned));
    const resultEl = el('res-trans-chords'); if (resultEl) resultEl.innerText = transposed.join('  ');
    const statEl = el('stat-trans-steps'); if (statEl) statEl.innerText = (stepsSigned >= 0 ? '+' : '') + stepsSigned + ' ' + safeT('label.music.semitones');
    show('trans-result-box'); show('trans-stats-row');
}
function calculateScale() {
    const root = el('scale-root') ? el('scale-root').value : 'C';
    const type = el('scale-type') ? el('scale-type').value : 'major';
    const intervals = SCALE_INTERVALS[type] || SCALE_INTERVALS.major;
    const rootSemi = noteToSemitone(root);
    const notes = intervals.map(i => semitoneToNote(rootSemi + i));
    const resultEl = el('res-scale-notes'); if (resultEl) resultEl.innerText = notes.join('  →  ');
    const countEl = el('stat-scale-count'); if (countEl) countEl.innerText = notes.length;
    const intEl = el('stat-scale-intervals'); if (intEl) intEl.innerText = intervals.join(', ');
    show('scale-result-box'); show('scale-stats-row');
}
function calculateChord() {
    const root = el('chord-root') ? el('chord-root').value : 'C';
    const type = el('chord-type') ? el('chord-type').value : 'major';
    const intervals = CHORD_INTERVALS[type] || CHORD_INTERVALS.major;
    const rootSemi = noteToSemitone(root);
    const notes = intervals.map(i => semitoneToNote(rootSemi + i));
    const resultEl = el('res-chord-notes'); if (resultEl) resultEl.innerText = notes.join('  -  ');
    const formulaEl = el('stat-chord-formula'); if (formulaEl) formulaEl.innerText = intervals.join(' - ') + ' (' + safeT('label.music.semitonesFromRoot') + ')';
    show('chord-result-box'); show('chord-stats-row');
}
function calculateKapo() {
    const orig = el('kapo-orig') ? el('kapo-orig').value : 'C';
    const fret = el('kapo-fret') ? parseInt(el('kapo-fret').value) : 0;
    const playKey = semitoneToNote(((noteToSemitone(orig) - fret) % 12 + 12) % 12);
    const keyEl = el('res-kapo-key'); if (keyEl) keyEl.innerText = playKey;
    const soundEl = el('stat-kapo-sound'); if (soundEl) soundEl.innerText = orig;
    show('kapo-result-box'); show('kapo-stats-row');
}
function calculateTempo() {
    const from = el('tempo-from') ? el('tempo-from').value : 'bpm';
    const val = el('tempo-val') ? parseNum(el('tempo-val').value) : null;
    const noteType = el('tempo-note') ? el('tempo-note').value : '8';
    if (!val || val <= 0) { showToast(safeT('toast.error.enterValue'), 'error'); return; }
    const noteFactors = { '1': 4, '2': 2, '4': 1, '8': 0.5, '8d': 0.75, '16': 0.25, '16d': 0.375 };
    const factor = noteFactors[noteType] || 1;
    let result, unit;
    if (from === 'bpm') { result = (60000 / val) * factor; unit = 'ms'; }
    else { result = (60000 / val) / factor; unit = 'BPM'; }
    const rv = el('res-tempo-val'); if (rv) rv.innerText = fmt(result, 2);
    const ru = el('res-tempo-unit'); if (ru) ru.innerText = unit;
    show('tempo-result-box');
}
function calculateInterval() {
    const n1 = el('int-note1') ? el('int-note1').value : 'C';
    const n2 = el('int-note2') ? el('int-note2').value : 'G';
    const diff = ((noteToSemitone(n2) - noteToSemitone(n1)) % 12 + 12) % 12;
    const nameEl = el('res-int-name'); if (nameEl) nameEl.innerText = INTERVAL_NAMES[diff] || '—';
    const semisEl = el('stat-int-semitones'); if (semisEl) semisEl.innerText = diff;
    const typeEl = el('stat-int-type');
    if (typeEl) {
        let tip;
        if (diff === 0) tip = safeT('label.music.perfectConsonance');
        else if ([3, 4, 8, 9].includes(diff)) tip = safeT('label.music.consonance');
        else if ([1, 2, 5, 10, 11].includes(diff)) tip = safeT('label.music.dissonance');
        else tip = safeT('label.music.tritone');
        typeEl.innerText = tip;
    }
    show('int-result-box'); show('int-stats-row');
}
let metronomeState = { running: false, intervalId: null, beat: 0, totalBeats: 0 };
function toggleMetronome() {
    const btn = el('metro-btn');
    if (!metronomeState.running) {
        const bpm = parseInt(el('metro-bpm').value) || 120;
        const beatUnit = el('metro-beat') ? parseInt(el('metro-beat').value) : 4;
        if (bpm < 30 || bpm > 300) { showToast(safeT('toast.error.bpmRange'), 'error'); return; }
        metronomeState.running = true;
        metronomeState.beat = 0;
        metronomeState.totalBeats = 0;
        if (btn) { btn.textContent = safeT('btn.stopMetronome'); btn.classList.add('active'); }
        tickMetronome(beatUnit);
        metronomeState.intervalId = setInterval(() => tickMetronome(beatUnit), 60000 / bpm);
        show('metro-result-box'); show('metro-stats-row');
        const mv = el('res-metro-val'); if (mv) mv.innerText = bpm;
    } else {
        metronomeState.running = false;
        if (metronomeState.intervalId) { clearInterval(metronomeState.intervalId); metronomeState.intervalId = null; }
        if (btn) { btn.textContent = safeT('btn.startMetronome'); btn.classList.remove('active'); }
    }
}
function stopMetronome() {
    if (metronomeState.running) toggleMetronome();
}
function tickMetronome(beatUnit) {
    metronomeState.beat = (metronomeState.beat % beatUnit) + 1;
    metronomeState.totalBeats++;
    const isFirst = metronomeState.beat === 1;
    if (settings.sound) {
        const ctx = getAudio();
        if (ctx) {
            try {
                const t2 = ctx.currentTime;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(isFirst ? 1500 : 900, t2);
                gain.gain.setValueAtTime(isFirst ? 0.15 : 0.08, t2);
                gain.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.05);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(t2);
                osc.stop(t2 + 0.06);
            } catch (e) {}
        }
    }
    if (isFirst) vibrate(20);
    const cntEl = el('stat-metro-count'); if (cntEl) cntEl.innerText = metronomeState.totalBeats;
    const taktEl = el('stat-metro-takt'); if (taktEl) taktEl.innerText = metronomeState.beat + ' / ' + beatUnit;
}
function calculateFrequency() {
    const note = el('freq-note') ? el('freq-note').value : 'A';
    const octave = el('freq-octave') ? parseInt(el('freq-octave').value) : 4;
    const midiNote = (octave + 1) * 12 + noteToSemitone(note);
    const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
    const fv = el('res-freq-val'); if (fv) fv.innerText = fmt(freq, 2);
    const fn = el('stat-freq-note'); if (fn) fn.innerText = note + octave + ' (' + fmt(freq, 2) + ' Hz)';
    show('freq-result-box'); show('freq-stats-row');
}
function calculateDetectNote() {
    const freq = num('detect-freq');
    if (!freq || freq <= 0) { showToast(safeT('toast.error.enterFrequency'), 'error'); return; }
    const midiNote = Math.round(69 + 12 * Math.log2(freq / 440));
    const octave = Math.floor(midiNote / 12) - 1;
    const noteName = NOTES_SHARP[((midiNote % 12) + 12) % 12];
    const exactFreq = 440 * Math.pow(2, (midiNote - 69) / 12);
    const offset = freq - exactFreq;
    const dn = el('res-detect-note'); if (dn) dn.innerText = noteName + octave;
    const doEl = el('stat-detect-offset');
    if (doEl) { doEl.innerText = (offset >= 0 ? '+' : '') + fmt(offset, 2) + ' Hz'; if (Math.abs(offset) < 1) doEl.style.color = '#10b981'; else if (Math.abs(offset) < 5) doEl.style.color = '#f59e0b'; else doEl.style.color = '#f43f5e'; }
    const do2 = el('stat-detect-octave'); if (do2) do2.innerText = octave;
    show('detect-result-box'); show('detect-stats-row');
}

// ============================================================
// ŠTIMER — Instrumenti (postojeći)
// ============================================================
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

// ============================================================
// KRAJ DELA 4
// ============================================================// ============================================================
// ALATIKA 2.0 — app.js
// Deo 5/5: Podsetnici, Rate, GPS, Weather, FX, Init
// ============================================================

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

// ================= Date helperi =================
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
    if (cls === 'overdue') return '#f43f5e';
    if (cls === 'urgent') return '#f43f5e';
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

// ================= Render funkcije =================
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
    if (!startAmount || startAmount <= 0) { showToast(safeT('toast.error.enterAmount'), 'error'); return; }
    if (!count || count < 1 || count > 120) { showToast(safeT('toast.error.enterValue'), 'error'); return; }
    if (!firstDate) { showToast(safeT('toast.error.enterDate'), 'error'); return; }
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

// ================= Reminders History =================
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
        if (statusFilter === 'active' && item.isDone) return false;
        if (statusFilter === 'done' && !item.isDone) return false;
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
    return items;
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
                ${item.type !== 'installment' ? `<button class="rem-action-btn rem-action-edit" onclick="editReminderFromHistory('${item.type}', '${item.category}', '${item.id}')" title="${safeT('rem.history.edit')}">${icon('edit')}</button>` : ''}
                <button class="rem-action-btn rem-action-toggle ${item.isDone ? 'is-done' : ''}" onclick="toggleDoneFromHistory('${item.type}', '${item.category}', '${item.id}')" title="${item.isDone ? safeT('rem.history.markActive') : safeT('rem.history.markDone')}">${item.isDone ? icon('refresh') : icon('check')}</button>
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
async function shareReminderFromHistory(type, category, id) {
    const key = getReminderStorageKey(type);
    if (!key) {
        if (type === 'installment') {
            const parts = id.split('|');
            const groupId = parts[0];
            const idx = parseInt(parts[1]);
            const groups = loadInstallmentGroups();
            const group = groups.find(g => g.id === groupId);
            if (!group || !group.installments[idx]) return;
            const inst = group.installments[idx];
            const text = `💳 ${group.description || 'Rata'}\n${safeT('label.rate.rate')} ${inst.number}/${group.installments.length}\n📅 ${inst.date}\n💰 ${(inst.amount || 0).toLocaleString('sr-RS')} RSD\n\n— Poslato iz Alatika aplikacije`;
            if (navigator.share) { try { await navigator.share({ text }); vibrate(20); } catch (e) {} }
            else fallbackCopy(text, () => showToast('Kopirano u clipboard', 'success', 2000));
        }
        return;
    }
    let realId = id;
    if (type === 'vehicle-reg' || type === 'vehicle-tech') realId = id.replace('-reg', '').replace('-tech', '');
    const item = loadReminders(key).find(x => String(x.id) === String(realId));
    if (!item) return;
    let title = item.name || item.title || 'Podsetnik';
    let lines = ['📌 ' + title];
    if (item.date) lines.push('📅 Datum: ' + item.date);
    if (item.dueDate) lines.push('📅 Rok: ' + item.dueDate);
    if (item.amount) lines.push('💰 Iznos: ' + item.amount + ' ' + (item.currency || 'RSD'));
    if (item.dose) lines.push('💊 Doza: ' + item.dose);
    if (item.note) lines.push('📝 Napomena: ' + item.note);
    if (item.description) lines.push('📝 Opis: ' + item.description);
    if (item.plate) lines.push('🚗 Tablice: ' + item.plate);
    lines.push('');
    lines.push('— Poslato iz Alatika aplikacije');
    const text = lines.join('\n');
    if (navigator.share) { try { await navigator.share({ title, text }); vibrate(20); } catch (e) {} }
    else fallbackCopy(text, () => showToast('Kopirano u clipboard', 'success', 2000));
}
function toggleDoneFromHistory(type, category, id) {
    if (type === 'installment') {
        const parts = id.split('|');
        toggleInstallmentPaidFromReminders(parts[0], parseInt(parts[1]));
        setTimeout(() => renderRemindersHistoryList(), 100);
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

// ================= Reminder Modal Forma =================
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
            if (!name) { showToast(safeT('toast.rem.error.name'), 'error'); return; }
            if (!date) { showToast(safeT('toast.rem.error.date'), 'error'); return; }
            data = { name, date, remindBefore: n('rem-bd-remind') || 3, favorite: c('rem-bd-fav'), note: v('rem-bd-note') }; break;
        }
        case 'bill': {
            const name = v('rem-bill-name'); const amount = n('rem-bill-amount');
            if (!name) { showToast(safeT('toast.rem.error.name'), 'error'); return; }
            data = { name, amount: amount || 0, period: v('rem-bill-period') || 'monthly', dayOfMonth: n('rem-bill-day') || 1, remindBefore: n('rem-bill-remind') || 3, paid: c('rem-bill-paid') }; break;
        }
        case 'vehicle': {
            const name = v('rem-veh-name');
            if (!name) { showToast(safeT('toast.rem.error.name'), 'error'); return; }
            data = { name, plate: v('rem-veh-plate'), regDate: getTripleDate('rem-veh-reg'), techDate: getTripleDate('rem-veh-tech'), insuranceDate: getTripleDate('rem-veh-ins'), note: v('rem-veh-note') }; break;
        }
        case 'document': {
            const docType = v('rem-doc-type') || 'lk';
            data = { type: docType, name: v('rem-doc-name') || safeT('rem.doc.type.' + docType), expires: getTripleDate('rem-doc-exp'), note: v('rem-doc-note') };
            if (!data.expires) { showToast(safeT('toast.rem.error.date'), 'error'); return; }
            break;
        }
        case 'subscription': {
            const name = v('rem-sub-name');
            if (!name) { showToast(safeT('toast.rem.error.name'), 'error'); return; }
            data = { name, amount: n('rem-sub-amount') || 0, dayOfMonth: n('rem-sub-day') || 1, period: v('rem-sub-period') || 'monthly', active: c('rem-sub-active') }; break;
        }
        case 'medication': {
            const name = v('rem-med-name');
            if (!name) { showToast(safeT('toast.rem.error.name'), 'error'); return; }
            data = { name, dose: v('rem-med-dose'), time: v('rem-med-time') || 'morning', frequency: v('rem-med-freq') || 'daily', startDate: getTripleDate('rem-med-start'), endDate: getTripleDate('rem-med-end'), remaining: n('rem-med-remaining') || 0, note: v('rem-med-note') }; break;
        }
        case 'anniversary': {
            const name = v('rem-ann-name'); const date = getTripleDate('rem-ann-date');
            if (!name) { showToast(safeT('toast.rem.error.name'), 'error'); return; }
            if (!date) { showToast(safeT('toast.rem.error.date'), 'error'); return; }
            data = { name, annType: v('rem-ann-type') || 'wedding', date, remindBefore: n('rem-ann-remind') || 3, favorite: c('rem-ann-fav'), note: v('rem-ann-note') }; break;
        }
        case 'note': {
            const title = v('rem-note-title');
            if (!title) { showToast(safeT('toast.rem.error.name'), 'error'); return; }
            data = { title, description: v('rem-note-desc'), dueDate: getTripleDate('rem-note-due'), priority: v('rem-note-priority') || 'medium', done: c('rem-note-done') }; break;
        }
    }
    if (currentReminderEditId) updateReminder(key, currentReminderEditId, data);
    else addReminder(key, data);
    showToast(safeT('toast.rem.saved'), 'success');
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
        showToast(safeT('toast.rem.deleted'), 'info');
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
        showToast(safeT('toast.rem.deleted'), 'info');
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

// ================= RATE Storage =================
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

// ================= hasActiveRemindersWithRemind =================
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
// YIN PITCH DETECTION
// ============================================================
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
// GPS — STORAGE I BRZINA/VISINA/KOMPAS/STOPERICA/TAJMER
// ============================================================
const GPS_SPEED_UNIT_KEY = 'cx_gps_speed_unit';
const GPS_ALT_UNIT_KEY = 'cx_gps_alt_unit';
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

let gpsAltState = { watchId: null, running: false, currentAltM: 0, minAltM: Infinity, maxAltM: -Infinity, totalAlt: 0, samples: 0, avgAltM: 0, accuracy: null, startAltM: null, ascentM: 0, descentM: 0, lastAlt: null };
function renderGpsVisina() {
    return `
        <div class="converter-box gps-box">
            <div class="gps-status-row">
                <div class="gps-status-indicator" id="gps-alt-indicator"><span class="gps-status-dot"></span><span class="gps-status-text" id="gps-alt-status">${safeT('gps.status.off')}</span></div>
                <select id="gps-alt-unit-select" class="gps-unit-select" onchange="gpsChangeAltUnit()">
                    <option value="m">m</option><option value="ft">ft</option><option value="km">km</option>
                </select>
            </div>
            <div class="gps-big-display"><div class="gps-big-number" id="gps-alt-value">0</div><div class="gps-big-unit" id="gps-alt-unit-label">m</div></div>
            <div class="gps-stats-mini">
                <div class="gps-stat-mini"><div class="gps-stat-mini-label">${safeT('gps.alt.min')}</div><div class="gps-stat-mini-value" id="gps-alt-min">—</div></div>
                <div class="gps-stat-mini"><div class="gps-stat-mini-label">${safeT('gps.alt.max')}</div><div class="gps-stat-mini-value" id="gps-alt-max">—</div></div>
                <div class="gps-stat-mini"><div class="gps-stat-mini-label">${safeT('gps.alt.avg')}</div><div class="gps-stat-mini-value" id="gps-alt-avg">—</div></div>
            </div>
            <div class="gps-stats-mini" style="margin-top: 10px;">
                <div class="gps-stat-mini"><div class="gps-stat-mini-label">${safeT('gps.alt.ascent')}</div><div class="gps-stat-mini-value" id="gps-alt-ascent" style="color:#10b981;">+0</div></div>
                <div class="gps-stat-mini"><div class="gps-stat-mini-label">${safeT('gps.alt.descent')}</div><div class="gps-stat-mini-value" id="gps-alt-descent" style="color:#f43f5e;">-0</div></div>
                <div class="gps-stat-mini"><div class="gps-stat-mini-label">${safeT('gps.speed.accuracy')}</div><div class="gps-stat-mini-value" id="gps-alt-accuracy">—</div></div>
            </div>
        </div>
        <div class="gps-actions">
            <button class="gps-btn-main" id="gps-alt-btn-start" onclick="gpsToggleAlt()">${icon('play')} <span id="gps-alt-btn-label">${safeT('gps.start')}</span></button>
            <button class="gps-btn-secondary" onclick="gpsResetAlt()">${icon('rotateCcw')} ${safeT('gps.reset')}</button>
        </div>
        <div class="gps-info-note">${icon('info')} ${safeT('gps.alt.note')}</div>
    `;
}
function gpsInitVisina() {
    const unit = loadGpsUnit(GPS_ALT_UNIT_KEY, 'm');
    const sel = el('gps-alt-unit-select'); if (sel) sel.value = unit;
    gpsUpdateAltUnitLabels(); gpsUpdateAltDisplay();
}
function gpsChangeAltUnit() { const sel = el('gps-alt-unit-select'); if (!sel) return; saveGpsUnit(GPS_ALT_UNIT_KEY, sel.value); gpsUpdateAltUnitLabels(); gpsUpdateAltDisplay(); vibrate(10); }
function gpsUpdateAltUnitLabels() { const unit = loadGpsUnit(GPS_ALT_UNIT_KEY, 'm'); const labels = { m: 'm', ft: 'ft', km: 'km' }; const labelEl = el('gps-alt-unit-label'); if (labelEl) labelEl.textContent = labels[unit] || 'm'; }
function gpsConvertAlt(meters) {
    const unit = loadGpsUnit(GPS_ALT_UNIT_KEY, 'm');
    switch (unit) { case 'ft': return meters * 3.28084; case 'km': return meters / 1000; default: return meters; }
}
function gpsUpdateAltDisplay() {
    const unit = loadGpsUnit(GPS_ALT_UNIT_KEY, 'm'); const decimals = unit === 'km' ? 3 : 1;
    const valEl = el('gps-alt-value'), minEl = el('gps-alt-min'), maxEl = el('gps-alt-max'), avgEl = el('gps-alt-avg');
    const ascEl = el('gps-alt-ascent'), descEl = el('gps-alt-descent'), accEl = el('gps-alt-accuracy');
    if (valEl) valEl.textContent = fmt(gpsConvertAlt(gpsAltState.currentAltM), decimals);
    if (minEl) minEl.textContent = gpsAltState.minAltM === Infinity ? '—' : fmt(gpsConvertAlt(gpsAltState.minAltM), decimals);
    if (maxEl) maxEl.textContent = gpsAltState.maxAltM === -Infinity ? '—' : fmt(gpsConvertAlt(gpsAltState.maxAltM), decimals);
    if (avgEl) avgEl.textContent = gpsAltState.samples > 0 ? fmt(gpsConvertAlt(gpsAltState.avgAltM), decimals) : '—';
    if (ascEl) ascEl.textContent = '+' + fmt(gpsConvertAlt(gpsAltState.ascentM), decimals);
    if (descEl) descEl.textContent = '-' + fmt(gpsConvertAlt(gpsAltState.descentM), decimals);
    if (accEl) accEl.textContent = gpsAltState.accuracy != null ? `${Math.round(gpsAltState.accuracy)} m` : '—';
}
function gpsToggleAlt() { if (gpsAltState.running) gpsStopAlt(); else gpsStartAlt(); }
function gpsStartAlt() {
    if (!navigator.geolocation) { showToast(safeT('gps.error.noGeolocation'), 'error'); return; }
    const indicator = el('gps-alt-indicator'); if (indicator) indicator.classList.add('active');
    gpsSetAltStatus(safeT('gps.status.searching'));
    const btnLabel = el('gps-alt-btn-label'); if (btnLabel) btnLabel.textContent = safeT('gps.stop');
    const btn = el('gps-alt-btn-start'); if (btn) btn.classList.add('active');
    gpsAltState.running = true;
    try { gpsAltState.watchId = navigator.geolocation.watchPosition(gpsOnAltPosition, gpsOnAltError, { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 }); }
    catch (e) { showToast(safeT('gps.error.generic'), 'error'); gpsStopAlt(); }
    vibrate(20); playTick(0, 1500, 0.08, 0.03);
}
function gpsStopAlt() {
    if (gpsAltState.watchId != null && navigator.geolocation) navigator.geolocation.clearWatch(gpsAltState.watchId);
    gpsAltState.watchId = null; gpsAltState.running = false;
    const indicator = el('gps-alt-indicator'); if (indicator) indicator.classList.remove('active');
    gpsSetAltStatus(safeT('gps.status.off'));
    const btnLabel = el('gps-alt-btn-label'); if (btnLabel) btnLabel.textContent = safeT('gps.start');
    const btn = el('gps-alt-btn-start'); if (btn) btn.classList.remove('active');
    vibrate(15);
}
function gpsOnAltPosition(pos) {
    const alt = pos.coords.altitude;
    const acc = pos.coords.altitudeAccuracy || pos.coords.accuracy;
    gpsAltState.accuracy = acc;
    if (alt == null || isNaN(alt)) return;
    if (gpsAltState.startAltM == null) { gpsAltState.startAltM = alt; gpsAltState.lastAlt = alt; }
    if (gpsAltState.lastAlt != null) {
        const diff = alt - gpsAltState.lastAlt;
        if (diff > 0.5) gpsAltState.ascentM += diff;
        else if (diff < -0.5) gpsAltState.descentM += Math.abs(diff);
    }
    gpsAltState.lastAlt = alt; gpsAltState.currentAltM = alt;
    gpsAltState.minAltM = Math.min(gpsAltState.minAltM, alt);
    gpsAltState.maxAltM = Math.max(gpsAltState.maxAltM, alt);
    gpsAltState.totalAlt += alt; gpsAltState.samples++;
    gpsAltState.avgAltM = gpsAltState.totalAlt / gpsAltState.samples;
    gpsSetAltStatus(safeT('gps.status.receiving'));
    gpsUpdateAltDisplay();
}
function gpsOnAltError(err) {
    let msg = safeT('gps.error.generic');
    if (err.code === 1) msg = safeT('gps.error.permission');
    else if (err.code === 2) msg = safeT('gps.error.unavailable');
    else if (err.code === 3) msg = safeT('gps.error.timeout');
    showToast(msg, 'error'); gpsSetAltStatus(safeT('gps.status.error'));
}
function gpsSetAltStatus(text) { const s = el('gps-alt-status'); if (s) s.textContent = text; }
function gpsResetAlt() {
    gpsAltState.currentAltM = 0; gpsAltState.minAltM = Infinity; gpsAltState.maxAltM = -Infinity;
    gpsAltState.totalAlt = 0; gpsAltState.samples = 0; gpsAltState.avgAltM = 0; gpsAltState.accuracy = null;
    gpsAltState.startAltM = null; gpsAltState.ascentM = 0; gpsAltState.descentM = 0; gpsAltState.lastAlt = null;
    gpsUpdateAltDisplay(); vibrate(15); playTick(0, 1400, 0.06, 0.02);
    showToast(safeT('gps.resetDone'), 'info', 1400);
}

// Kompas (pojednostavljeno — bez UI duplog)
let gpsCompassState = { listening: false, heading: 0, pitch: 0, roll: 0, absolute: false, permissionGranted: false, usingGpsFallback: false, gpsWatchId: null, sensorDataReceived: false, fallbackTimerId: null };
function renderGpsKompas() {
    return `
        <div class="converter-box gps-box gps-compass-box">
            <div class="gps-status-row"><div class="gps-status-indicator" id="gps-compass-indicator"><span class="gps-status-dot"></span><span class="gps-status-text" id="gps-compass-status">${safeT('gps.compass.status.off')}</span></div></div>
            <div class="gps-compass-visual">
                <svg viewBox="0 0 200 200" class="gps-compass-svg" id="gps-compass-svg">
                    <defs>
                        <linearGradient id="compassN" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f43f5e"/><stop offset="100%" stop-color="#be123c"/></linearGradient>
                        <linearGradient id="compassS" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#64748b"/><stop offset="100%" stop-color="#334155"/></linearGradient>
                    </defs>
                    <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="2"/>
                    <g id="gps-compass-rose" transform="rotate(0 100 100)">
                        <text x="100" y="26" text-anchor="middle" fill="#f43f5e" font-size="16" font-weight="900">N</text>
                        <text x="100" y="184" text-anchor="middle" fill="#94a3b8" font-size="14" font-weight="800">S</text>
                        <text x="26" y="105" text-anchor="middle" fill="#94a3b8" font-size="14" font-weight="800">W</text>
                        <text x="174" y="105" text-anchor="middle" fill="#94a3b8" font-size="14" font-weight="800">E</text>
                        <polygon points="100,40 94,100 100,90 106,100" fill="url(#compassN)"/>
                        <polygon points="100,160 94,100 100,110 106,100" fill="url(#compassS)"/>
                        <circle cx="100" cy="100" r="6" fill="#1a1a23" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
                        <circle cx="100" cy="100" r="2" fill="#0ea5e9"/>
                    </g>
                </svg>
            </div>
            <div class="gps-compass-info"><div class="gps-compass-degrees" id="gps-compass-deg">0°</div><div class="gps-compass-direction" id="gps-compass-dir">${safeT('gps.compass.dir.n')}</div></div>
            <div class="gps-stats-mini">
                <div class="gps-stat-mini"><div class="gps-stat-mini-label">${safeT('gps.compass.pitch')}</div><div class="gps-stat-mini-value" id="gps-compass-pitch">0°</div></div>
                <div class="gps-stat-mini"><div class="gps-stat-mini-label">${safeT('gps.compass.roll')}</div><div class="gps-stat-mini-value" id="gps-compass-roll">0°</div></div>
                <div class="gps-stat-mini"><div class="gps-stat-mini-label">${safeT('gps.compass.source')}</div><div class="gps-stat-mini-value" id="gps-compass-source">—</div></div>
            </div>
        </div>
        <div class="gps-actions"><button class="gps-btn-main" id="gps-compass-btn" onclick="gpsToggleCompass()">${icon('compass')} <span id="gps-compass-btn-label">${safeT('gps.compass.enable')}</span></button></div>
        <div class="gps-info-note">${icon('info')} ${safeT('gps.compass.note')}</div>
    `;
}
function gpsInitKompas() { gpsUpdateCompassDisplay(); }
function gpsToggleCompass() { if (gpsCompassState.listening) gpsStopCompass(); else gpsStartCompass(); }
function gpsStartCompass() {
    gpsCompassState.permissionGranted = false; gpsCompassState.sensorDataReceived = false;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (isIOS && typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission().then(result => {
            if (result === 'granted') { gpsCompassState.permissionGranted = true; gpsActuallyStartCompass(); }
            else { showToast(safeT('gps.compass.denied'), 'warning'); gpsSetCompassStatus(safeT('gps.compass.status.denied')); }
        }).catch(() => { showToast(safeT('gps.compass.denied'), 'warning'); gpsSetCompassStatus(safeT('gps.compass.status.denied')); });
        return;
    }
    gpsCompassState.permissionGranted = true;
    gpsActuallyStartCompass();
}
function gpsActuallyStartCompass() {
    if ('ondeviceorientationabsolute' in window) { window.addEventListener('deviceorientationabsolute', gpsOnDeviceOrientation, true); gpsCompassState.absolute = true; }
    window.addEventListener('deviceorientation', gpsOnDeviceOrientation, true);
    gpsCompassState.listening = true;
    const indicator = el('gps-compass-indicator'); if (indicator) indicator.classList.add('active');
    const btnLabel = el('gps-compass-btn-label'); if (btnLabel) btnLabel.textContent = safeT('gps.compass.disable');
    const btn = el('gps-compass-btn'); if (btn) btn.classList.add('active');
    gpsSetCompassStatus(safeT('gps.compass.status.waiting'));
    vibrate(20); playTick(0, 1500, 0.08, 0.03);
    gpsCompassState.fallbackTimerId = setTimeout(() => {
        if (gpsCompassState.listening && !gpsCompassState.sensorDataReceived && !gpsCompassState.gpsWatchId) gpsStartCompassGpsFallback();
    }, 2500);
}
function gpsStartCompassGpsFallback() {
    if (!navigator.geolocation) return;
    gpsCompassState.usingGpsFallback = true;
    gpsCompassState.gpsWatchId = navigator.geolocation.watchPosition((pos) => {
        if (gpsCompassState.usingGpsFallback && pos.coords.heading != null && !isNaN(pos.coords.heading)) {
            gpsUpdateCompassHeading(pos.coords.heading, false);
            gpsSetCompassStatus(safeT('gps.compass.status.gps'));
            const srcEl = el('gps-compass-source'); if (srcEl) srcEl.textContent = 'GPS';
        }
    }, () => {}, { enableHighAccuracy: true, maximumAge: 1000 });
}
gpsCompassState.smoothedHeading = null;
gpsCompassState.lastRawHeading = null;
function gpsOnDeviceOrientation(e) {
    if (!gpsCompassState.listening) return;
    let rawHeading = null;
    if (e.webkitCompassHeading != null && !isNaN(e.webkitCompassHeading)) rawHeading = e.webkitCompassHeading;
    else if (e.alpha != null && !isNaN(e.alpha)) {
        const absolute = e.absolute === true || gpsCompassState.absolute;
        rawHeading = absolute ? (360 - e.alpha) % 360 : e.alpha;
    }
    if (rawHeading != null) {
        if (!gpsCompassState.sensorDataReceived) {
            gpsCompassState.sensorDataReceived = true;
            if (gpsCompassState.fallbackTimerId) { clearTimeout(gpsCompassState.fallbackTimerId); gpsCompassState.fallbackTimerId = null; }
            if (gpsCompassState.gpsWatchId && navigator.geolocation) { navigator.geolocation.clearWatch(gpsCompassState.gpsWatchId); gpsCompassState.gpsWatchId = null; gpsCompassState.usingGpsFallback = false; }
            gpsCompassState.smoothedHeading = null; gpsCompassState.lastRawHeading = null;
        }
        gpsUpdateCompassHeading(rawHeading, true);
        gpsSetCompassStatus(safeT('gps.compass.status.active'));
    }
    if (e.beta != null && !isNaN(e.beta)) { gpsCompassState.pitch = e.beta; const pEl = el('gps-compass-pitch'); if (pEl) pEl.textContent = Math.round(e.beta) + '°'; }
    if (e.gamma != null && !isNaN(e.gamma)) { gpsCompassState.roll = e.gamma; const rEl = el('gps-compass-roll'); if (rEl) rEl.textContent = Math.round(e.gamma) + '°'; }
}
function gpsUpdateCompassHeading(heading, isSensor) {
    if (heading == null || isNaN(heading)) return;
    gpsCompassState.heading = heading;
    gpsUpdateCompassDisplay();
    const srcEl = el('gps-compass-source'); if (srcEl) srcEl.textContent = isSensor ? (gpsCompassState.absolute ? 'Sensor ✓' : 'Sensor') : 'GPS';
}
function gpsUpdateCompassDisplay() {
    const h = gpsCompassState.heading;
    const degEl = el('gps-compass-deg'), dirEl = el('gps-compass-dir'), rose = el('gps-compass-rose');
    if (degEl) degEl.textContent = Math.round(h) + '°';
    if (dirEl) dirEl.textContent = gpsGetCompassDirection(h);
    if (rose) rose.setAttribute('transform', `rotate(${-h} 100 100)`);
}
function gpsGetCompassDirection(deg) {
    const dirs = [
        { key: 'n', min: 337.5, max: 360 }, { key: 'n', min: 0, max: 22.5 }, { key: 'ne', min: 22.5, max: 67.5 },
        { key: 'e', min: 67.5, max: 112.5 }, { key: 'se', min: 112.5, max: 157.5 }, { key: 's', min: 157.5, max: 202.5 },
        { key: 'sw', min: 202.5, max: 247.5 }, { key: 'w', min: 247.5, max: 292.5 }, { key: 'nw', min: 292.5, max: 337.5 }
    ];
    for (const d of dirs) { if (deg >= d.min && deg < d.max) return safeT('gps.compass.dir.' + d.key); }
    return safeT('gps.compass.dir.n');
}
function gpsSetCompassStatus(text) { const s = el('gps-compass-status'); if (s) s.textContent = text; }
function gpsStopCompass() {
    window.removeEventListener('deviceorientationabsolute', gpsOnDeviceOrientation, true);
    window.removeEventListener('deviceorientation', gpsOnDeviceOrientation, true);
    if (gpsCompassState.gpsWatchId && navigator.geolocation) { navigator.geolocation.clearWatch(gpsCompassState.gpsWatchId); gpsCompassState.gpsWatchId = null; }
    if (gpsCompassState.fallbackTimerId) { clearTimeout(gpsCompassState.fallbackTimerId); gpsCompassState.fallbackTimerId = null; }
    gpsCompassState.listening = false; gpsCompassState.usingGpsFallback = false; gpsCompassState.sensorDataReceived = false;
    gpsCompassState.smoothedHeading = null; gpsCompassState.lastRawHeading = null;
    const indicator = el('gps-compass-indicator'); if (indicator) indicator.classList.remove('active');
    const btnLabel = el('gps-compass-btn-label'); if (btnLabel) btnLabel.textContent = safeT('gps.compass.enable');
    const btn = el('gps-compass-btn'); if (btn) btn.classList.remove('active');
    gpsSetCompassStatus(safeT('gps.compass.status.off'));
    vibrate(15);
}

// GPS — Štoperica i Tajmer (postojeći)
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
            <div class="gps-lap-header"><span>${safeT('gps.sw.lapHeader.number')}</span><span>${safeT('gps.sw.lapHeader.lap')}</span><span>${safeT('gps.sw.lapHeader.total')}</span></div>
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
    try { gpsStopAlt(); } catch (e) {}
    try { gpsStopCompass(); } catch (e) {}
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
    else if (tabId === 'pametni') updateWeatherPametni();
    else if (tabId === 'sunce') updateWeatherSunce();
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
function renderWeatherPametni() { return `<div id="weather-pametni-content"><div class="weather-loading"><div class="weather-loading-row"></div><div class="weather-loading-row"></div><div class="weather-loading-row"></div></div></div>`; }
function renderWeatherSunce() { return `<div id="weather-sunce-content"><div class="weather-loading"><div class="weather-loading-row"></div><div class="weather-loading-row"></div></div></div>`; }
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
function updateWeatherPametni() {
    const box = el('weather-pametni-content');
    if (!box) return;
    const { current, hourly, loading } = weatherState;
    if (loading && !current) { box.innerHTML = `<div class="weather-loading"><div class="weather-loading-row"></div><div class="weather-loading-row"></div></div>`; return; }
    if (!current) { box.innerHTML = `<div class="weather-error"><div class="weather-error-icon">🤔</div><div class="weather-error-title">${safeT('weather.error.noData')}</div><button class="weather-error-btn" onclick="refreshWeather()">${safeT('weather.error.retry')}</button></div>`; return; }
    const temp = Math.round(current.temperature_2m);
    const feels = Math.round(current.apparent_temperature);
    const wind = Math.round(current.wind_speed_10m);
    const uv = Math.round(current.uv_index || 0);
    let clothesKey;
    if (feels < 0) clothesKey = 'freezing';
    else if (feels < 10) clothesKey = 'cold';
    else if (feels < 16) clothesKey = 'cool';
    else if (feels < 22) clothesKey = 'mild';
    else if (feels < 28) clothesKey = 'warm';
    else clothesKey = 'hot';
    let bestHour = null;
    if (hourly && hourly.time) {
        const now = new Date();
        let bestScore = Infinity;
        for (let i = 0; i < hourly.time.length; i++) {
            const t2 = new Date(hourly.time[i]);
            if (t2 < now || t2 > new Date(now.getTime() + 12 * 3600000)) continue;
            const tempAt = hourly.temperature_2m[i], rainAt = hourly.precipitation_probability[i], windAt = hourly.wind_speed_10m[i];
            const score = Math.abs(tempAt - 22) + rainAt * 0.5 + windAt * 0.3;
            if (score < bestScore) { bestScore = score; bestHour = t2; }
        }
    }
    const bestHourText = bestHour ? `${String(bestHour.getHours()).padStart(2, '0')}:00 — ${String((bestHour.getHours() + 2) % 24).padStart(2, '0')}:00` : safeT('weather.smart.morningEvening');
    const toBring = [];
    if (hourly && hourly.precipitation_probability) {
        const maxRain = Math.max(...hourly.precipitation_probability.slice(0, 12));
        if (maxRain > 40) toBring.push({ yes: true, text: safeT('weather.smart.umbrellaRain', maxRain) });
        else toBring.push({ yes: false, text: safeT('weather.smart.noUmbrella') });
    }
    if (uv >= 5) toBring.push({ yes: true, text: safeT('weather.smart.sunglasses', uv) });
    if (wind > 30) toBring.push({ yes: true, text: safeT('weather.smart.windJacket', wind) });
    if (feels < 5) toBring.push({ yes: true, text: safeT('weather.smart.hatGloves') });
    const activities = [];
    const rainNext6 = hourly && hourly.precipitation_probability ? Math.max(...hourly.precipitation_probability.slice(0, 6)) : 0;
    if (rainNext6 < 30 && temp > 5 && temp < 28) activities.push({ yes: true, text: safeT('weather.smart.running.ideal') });
    else if (rainNext6 > 60) activities.push({ yes: false, text: safeT('weather.smart.running.rain') });
    else activities.push({ warn: true, text: safeT('weather.smart.running.check') });
    if (wind < 25 && rainNext6 < 40) activities.push({ yes: true, text: safeT('weather.smart.bike.good') });
    else activities.push({ warn: true, text: safeT('weather.smart.bike.bad') });
    box.innerHTML = `${weatherLocationHeader()}<div class="smart-card" style="--smart-accent: #ec4899;"><div class="smart-head"><div class="smart-icon">${icon('users')}</div><div class="smart-title">${safeT('weather.smart.clothes')}</div></div><div class="smart-text">${escapeHtml(safeT('weather.smart.clothes.' + clothesKey))}</div></div><div class="smart-card" style="--smart-accent: #f59e0b;"><div class="smart-head"><div class="smart-icon">${icon('clock')}</div><div class="smart-title">${safeT('weather.smart.whenToGoOut')}</div></div><div class="smart-text">${safeT('weather.smart.bestTime')} <strong>${bestHourText}</strong></div></div><div class="smart-card" style="--smart-accent: #06b6d4;"><div class="smart-head"><div class="smart-icon">${icon('target')}</div><div class="smart-title">${safeT('weather.smart.whatToBring')}</div></div><ul class="smart-list">${toBring.map(item => `<li class="${item.yes ? 'yes' : 'no'}"><span class="check-icon">${icon(item.yes ? 'check' : 'x')}</span><span>${escapeHtml(item.text)}</span></li>`).join('')}</ul></div><div class="smart-card" style="--smart-accent: #10b981;"><div class="smart-head"><div class="smart-icon">${icon('activity')}</div><div class="smart-title">${safeT('weather.smart.activities')}</div></div><ul class="smart-list">${activities.map(item => `<li class="${item.yes ? 'yes' : (item.no ? 'no' : 'warn')}"><span class="check-icon">${icon(item.yes ? 'check' : (item.no ? 'x' : 'alert'))}</span><span>${escapeHtml(item.text)}</span></li>`).join('')}</ul></div>`;
}
function updateWeatherSunce() {
    const box = el('weather-sunce-content');
    if (!box) return;
    const { daily, loading } = weatherState;
    if (loading && !daily) { box.innerHTML = `<div class="weather-loading"><div class="weather-loading-row"></div><div class="weather-loading-row"></div></div>`; return; }
    if (!daily) { box.innerHTML = `<div class="weather-error"><div class="weather-error-icon">🌙</div><div class="weather-error-title">${safeT('weather.error.noData')}</div><button class="weather-error-btn" onclick="refreshWeather()">${safeT('weather.error.retry')}</button></div>`; return; }
    const today = { sunrise: daily.sunrise[0], sunset: daily.sunset[0] };
    const locale = currentLang === 'en' ? 'en-GB' : 'sr-RS';
    const sunriseStr = today.sunrise ? new Date(today.sunrise).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }) : '—';
    const sunsetStr = today.sunset ? new Date(today.sunset).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }) : '—';
    let dayLength = '—';
    if (today.sunrise && today.sunset) {
        const sr = new Date(today.sunrise), ss = new Date(today.sunset);
        const diffMin = Math.round((ss - sr) / 60000);
        dayLength = `${Math.floor(diffMin / 60)}h ${diffMin % 60}min`;
    }
    const moonPhase = calculateMoonPhase(new Date());
    box.innerHTML = `${weatherLocationHeader()}<div class="celestial-card"><div class="celestial-title">${icon('sunrise')} ${safeT('weather.celestial.sun')}</div><div class="celestial-row"><span class="celestial-label">${safeT('weather.celestial.sunrise')}</span><span class="celestial-value">${sunriseStr}</span></div><div class="celestial-row"><span class="celestial-label">${safeT('weather.celestial.sunset')}</span><span class="celestial-value">${sunsetStr}</span></div><div class="celestial-row"><span class="celestial-label">${safeT('weather.celestial.dayLength')}</span><span class="celestial-value">${dayLength}</span></div></div><div class="celestial-card"><div class="celestial-title">${icon('moon')} ${safeT('weather.celestial.moon')}</div><div class="celestial-row"><span class="celestial-label">${safeT('weather.celestial.moonPhase')}</span><span class="celestial-value">${safeT('moon.' + moonPhase.key)} (${moonPhase.illumination}%)</span></div></div>`;
}
function calculateMoonPhase(date) {
    const knownNewMoon = new Date('2000-01-06T18:14:00Z');
    const synodicMonth = 29.530588853;
    const daysSince = (date - knownNewMoon) / 86400000;
    const phase = ((daysSince % synodicMonth) + synodicMonth) % synodicMonth;
    const illumination = Math.round((1 - Math.cos(2 * Math.PI * phase / synodicMonth)) / 2 * 100);
    let key;
    if (phase < 1.85) key = 'new';
    else if (phase < 5.53) key = 'waxingCrescent';
    else if (phase < 9.22) key = 'firstQuarter';
    else if (phase < 12.91) key = 'waxingGibbous';
    else if (phase < 16.61) key = 'full';
    else if (phase < 20.30) key = 'waningGibbous';
    else if (phase < 23.99) key = 'lastQuarter';
    else if (phase < 27.68) key = 'waningCrescent';
    else key = 'new';
    return { key, illumination };
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
    { code: 'ALL', name: 'Albanski lek', flag: '🇦🇱', rate: 1.14 },
    { code: 'BGN', name: 'Bugarski lev', flag: '🇧🇬', rate: 59.95 },
    { code: 'RON', name: 'Rumunski lej', flag: '🇷🇴', rate: 23.55 },
    { code: 'HUF', name: 'Mađarska forinta', flag: '🇭🇺', rate: 0.30 },
    { code: 'PLN', name: 'Poljski zlot', flag: '🇵🇱', rate: 26.85 },
    { code: 'CZK', name: 'Češka kruna', flag: '🇨🇿', rate: 4.68 },
    { code: 'SEK', name: 'Švedska kruna', flag: '🇸🇪', rate: 10.35 },
    { code: 'NOK', name: 'Norveška kruna', flag: '🇳🇴', rate: 9.90 },
    { code: 'DKK', name: 'Danska kruna', flag: '🇩🇰', rate: 15.70 },
    { code: 'CAD', name: 'Kanadski dolar', flag: '🇨🇦', rate: 78.60 },
    { code: 'AUD', name: 'Australijski dolar', flag: '🇦🇺', rate: 71.40 },
    { code: 'NZD', name: 'Novozelandski dolar', flag: '🇳🇿', rate: 65.20 },
    { code: 'KRW', name: 'Južnokorejski von', flag: '🇰🇷', rate: 0.079 },
    { code: 'INR', name: 'Indijska rupija', flag: '🇮🇳', rate: 1.29 },
    { code: 'BRL', name: 'Brazilski real', flag: '🇧🇷', rate: 19.10 },
    { code: 'MXN', name: 'Meksički pezos', flag: '🇲🇽', rate: 5.60 },
    { code: 'ZAR', name: 'Južnoafrički rand', flag: '🇿🇦', rate: 5.95 },
    { code: 'AED', name: 'Dirham UAE', flag: '🇦🇪', rate: 29.55 }
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

// ============================================================
// SHOW / rollElement (animacija rezultata)
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
// OSVEŽAVANJE STATIČNIH TEKSTOVA
// ============================================================
function refreshUIText() {
    try {
        const subtitle = el('app-subtitle'); if (subtitle) subtitle.textContent = safeT('app.subtitle');
        const searchInput = el('home-search'); if (searchInput) searchInput.placeholder = safeT('app.search.placeholder');
        const secQuick = el('sec-title-quick'); if (secQuick) secQuick.textContent = safeT('section.quickTools');
        const secMy = el('sec-title-my'); if (secMy) secMy.textContent = safeT('section.myTools');
        const secAll = el('sec-title-all'); if (secAll) secAll.textContent = safeT('section.allTools');
        const btnEditQuick = el('btn-edit-quick'); if (btnEditQuick) btnEditQuick.textContent = safeT('section.edit');
        const btnEditAll = el('btn-edit-all-tools'); if (btnEditAll) btnEditAll.textContent = allToolsEditMode ? safeT('section.allTools.cancel') : safeT('section.allTools.edit');
        const toolsHintTitle = el('tools-hint-title'); if (toolsHintTitle) toolsHintTitle.textContent = safeT('section.allTools.hint.title');
        const toolsHintText = el('tools-hint-text'); if (toolsHintText) toolsHintText.textContent = safeT('section.allTools.hint.text');
        const toolsHintBtn = el('tools-hint-btn'); if (toolsHintBtn) toolsHintBtn.textContent = safeT('section.allTools.hint.btn');
        const badgeHintTitle = el('badge-hint-title'); if (badgeHintTitle) badgeHintTitle.textContent = safeT('rem.badge.hint.title');
        const badgeHintText = el('badge-hint-text'); if (badgeHintText) badgeHintText.textContent = safeT('rem.badge.hint.text');
        const badgeHintBtn = el('badge-hint-btn'); if (badgeHintBtn) badgeHintBtn.textContent = safeT('rem.badge.hint.btn');
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

        // Bottom nav labels
        const navHome = el('nav-label-home'); if (navHome) navHome.textContent = safeT('nav.home');
        const navMy = el('nav-label-my'); if (navMy) navMy.textContent = safeT('nav.myTools');
        const navToday = el('nav-label-today'); if (navToday) navToday.textContent = safeT('nav.today');
        const navHistory = el('nav-label-history'); if (navHistory) navHistory.textContent = safeT('nav.history');
        const navSettings = el('nav-label-settings'); if (navSettings) navSettings.textContent = safeT('nav.settings');

        // Today screen
        const todayTitle = el('today-title'); if (todayTitle) todayTitle.textContent = safeT('today.title');
        const todaySubtitle = el('today-subtitle'); if (todaySubtitle) todaySubtitle.textContent = safeT('today.subtitle');

        // My tools
        const mytoolsTitle = el('mytools-title'); if (mytoolsTitle) mytoolsTitle.textContent = safeT('nav.myTools');
        const mytoolsSubtitle = el('mytools-subtitle'); if (mytoolsSubtitle) mytoolsSubtitle.textContent = 'Tvoji omiljeni alati';

        // Profile
        const settingsProfileLabel = el('settings-profile-label'); if (settingsProfileLabel) settingsProfileLabel.textContent = safeT('settings.profile');
        const settingsProfileSub = el('settings-profile-sub'); if (settingsProfileSub) settingsProfileSub.textContent = safeT('settings.profile.desc');
    } catch (e) { console.warn('refreshUIText greška:', e); }
}

// ============================================================
// INIT
// ============================================================
function initApp() {
    try { settings.archiveAutoCleanup = getArchiveAutoCleanupSetting(); } catch (e) {}

    // Theme
    try {
        const savedTheme = localStorage.getItem('cx_theme');
        if (savedTheme === 'light' || (!savedTheme && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches)) {
            document.documentElement.setAttribute('data-theme', 'light');
            const tt = el('theme-toggle');
            if (tt) tt.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>';
        }
    } catch (e) {}

    // Input cache
    try { loadInputCache(); setupInputPersistence(); } catch (e) {}

    // Currency
    try {
        const savedCurrency = localStorage.getItem('cx_default_currency');
        const ac = el('auto-currency');
        if (savedCurrency && ac) ac.value = savedCurrency;
    } catch (e) {}

    // Render svega
    try { refreshUIText(); } catch (e) { console.error('refreshUIText:', e); }
    try { renderQuickTools(); } catch (e) { console.error('renderQuickTools:', e); }
    try { renderAllTools(); } catch (e) { console.error('renderAllTools:', e); }
    try { renderSections(); } catch (e) { console.error('renderSections:', e); }
    try { renderFavorites(); } catch (e) { console.error('renderFavorites:', e); }
    try { populateNoteSelects(); } catch (e) {}
    try { updateSettingsUI(); } catch (e) {}
    try { updateProfileStatusLabel(); } catch (e) {}
    try { setupRipple(); } catch (e) {}
    try { setupBackButton(); } catch (e) {}
    try { loadFxRates(); } catch (e) {}
    try { restoreInputsFor(document); } catch (e) {}
    try { runArchiveAutoCleanup(); } catch (e) {}
    try { initToolbarIcons(); } catch (e) {}

    // Service worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js').then(reg => console.log('SW registered', reg.scope)).catch(err => console.warn('SW registration failed', err));
        });
    }

    // Badge
    setTimeout(() => { updateAppBadge(); }, 500);
    setTimeout(() => { maybeShowBadgeHint(); }, 1200);
    setInterval(updateAppBadge, 60 * 60 * 1000);

    // Splash
    setTimeout(() => {
        const splash = el('splash-screen');
        if (splash) { splash.classList.add('hide'); setTimeout(() => { if (splash.parentNode) splash.remove(); }, 400); }
    }, 500);

    if (typeof t === 'function') document.title = t('app.title');
}

function initToolbarIcons() {
    const torchBtnIcon = document.querySelector('#toolbar-torch-btn .toolbar-icon');
    if (torchBtnIcon) torchBtnIcon.innerHTML = icon('flashlight');
    const stopwatchIcon = document.querySelector('#toolbar-stopwatch-btn .toolbar-icon');
    if (stopwatchIcon) stopwatchIcon.innerHTML = icon('stopwatch');
    const timerIcon = document.querySelector('#toolbar-timer-btn .toolbar-icon');
    if (timerIcon) timerIcon.innerHTML = icon('timer');
    const levelBtnIcon = document.querySelector('#toolbar-level-btn .toolbar-icon');
    if (levelBtnIcon) levelBtnIcon.innerHTML = icon('gauge');

    // Cleanup kad se app zatvori (lampa, nivo)
    window.addEventListener('pagehide', () => {
        try { torchOff(); } catch (e) {}
        try { levelStop(); } catch (e) {}
    });
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            try { if (torchState.active && !torchState.sosActive) torchOff(); } catch (e) {}
        }
    });
}

// ============================================================
// POKRETANJE
// ============================================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// ============================================================
// KRAJ app.js
// ============================================================
