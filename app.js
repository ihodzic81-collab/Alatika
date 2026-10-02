// ============================================================
// ALATIKA — app.js (v4) — DEO 1/4
// Pomoćne, ICONS, CATEGORIES, navigacija, alati, favoriti,
// pretraga, istorija, toast, confirm, podešavanja
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
    // NOVO — Podsetnici
    bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>',
    bellRing: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/><path d="M4 2C2.8 3.7 2 5.7 2 8"/><path d="M22 8c0-2.3-.8-4.3-2-6"/></svg>'
};

function icon(name) {
    return ICONS[name] || ICONS.info;
}

// ================= CATEGORIES =================
const CATEGORIES = {
    podsetnici: {
        name: 'Podsetnici',
        icon: 'bell',
        accent: '#f59e0b',
        tabs: [
            { id: 'danas', name: 'Istorija', icon: 'clipboard', render: renderRemindersHistory },
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
            { id: 'popust', name: 'Popust', icon: 'tag', render: renderMoneyPopust },
            { id: 'pdv', name: 'PDV', icon: 'percent', render: renderMoneyPDV },
            { id: 'procenat', name: 'Procenat', icon: 'percent', render: renderMoneyProcenat },
            { id: 'kredit', name: 'Kredit', icon: 'creditCard', render: renderMoneyKredit },
            { id: 'valuta', name: 'Kursna lista', icon: 'exchange', render: renderMoneyValuta },
            { id: 'podela', name: 'Podela računa', icon: 'receipt', render: renderMoneyPodela },
            { id: 'napojnica', name: 'Napojnica', icon: 'handshake', render: renderMoneyNapojnica }
        ]
    },
    measures: {
        name: 'Mere', icon: 'ruler', accent: '#8b5cf6',
        tabs: [
            { id: 'duzina', name: 'Dužina', icon: 'ruler', render: renderMeasuresDuzina },
            { id: 'tezina', name: 'Težina', icon: 'scale', render: renderMeasuresTezina },
            { id: 'povrsina', name: 'Površina', icon: 'square', render: renderMeasuresPovrsina },
            { id: 'zapremina', name: 'Zapremina', icon: 'droplets', render: renderMeasuresZapremina },
            { id: 'temp', name: 'Temperatura', icon: 'thermometer', render: renderMeasuresTemp },
            { id: 'brzina', name: 'Brzina', icon: 'speedometer', render: renderMeasuresBrzina },
            { id: 'pritisak', name: 'Pritisak', icon: 'wind', render: renderMeasuresPritisak },
            { id: 'podaci', name: 'Podaci', icon: 'database', render: renderMeasuresPodaci },
            { id: 'procenat', name: 'Procenat', icon: 'percent', render: renderMeasuresProcenat }
        ]
    },
    shopping: {
        name: 'Kupovina', icon: 'cart', accent: '#14b8a6',
        tabs: [
            { id: 'unit', name: 'Cena po jedinici', icon: 'barcode', render: renderShopUnit },
            { id: 'compare', name: 'Poređenje', icon: 'scale', render: renderShopCompare },
            { id: 'promo', name: 'Akcije 2+1', icon: 'gift', render: renderShopPromo },
            { id: 'lista', name: 'Lista za kupovinu', icon: 'list', render: renderShopLista },
            { id: 'budzet', name: 'Dnevni budžet', icon: 'calendarSm', render: renderShopBudzet },
            { id: 'rate', name: 'Rate vs. keš', icon: 'creditCard', render: renderShopRate },
            { id: 'kartice', name: 'Kartica vs. keš', icon: 'banknote', render: renderShopKartice },
            { id: 'litar', name: 'Cena po litru', icon: 'droplets', render: renderShopLitar },
            { id: 'osoba', name: 'Po osobi', icon: 'users', render: renderShopOsoba },
            { id: 'isplati', name: 'Isplati li se', icon: 'target', render: renderShopIsplati },
            { id: 'racuni', name: 'Poređenje računa', icon: 'receipt', render: renderShopRacuni },
            { id: 'rasipanje', name: 'Cena po obroku', icon: 'packageSm', render: renderShopRasipanje }
        ]
    },
    auto: {
        name: 'Auto', icon: 'car', accent: '#f43f5e',
        tabs: [
            { id: 'potrosnja', name: 'Potrošnja', icon: 'fuel', render: renderAutoPotrosnja },
            { id: 'planer', name: 'Planer puta', icon: 'route', render: renderAutoPlaner },
            { id: 'trosakputa', name: 'Trošak puta', icon: 'coins', render: renderAutoTrosakPuta },
            { id: 'servis', name: 'Servis', icon: 'wrench', render: renderAutoServis },
            { id: 'godisnji', name: 'Godišnji trošak', icon: 'calendar', render: renderAutoGodisnji },
            { id: 'pokm', name: 'Po kilometru', icon: 'calculator', render: renderAutoPoKm },
            { id: 'mojauto', name: 'Moj auto', icon: 'car', render: renderAutoMojAuto }
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
            { id: 'bmi', name: 'BMI', icon: 'scale', render: renderHealthBMI },
            { id: 'tezina', name: 'Idealna težina', icon: 'target', render: renderHealthIdealna },
            { id: 'kalorije', name: 'Kalorije (BMR)', icon: 'flame', render: renderHealthBMR },
            { id: 'puls', name: 'Puls i zone', icon: 'heartPulse', render: renderHealthPuls },
            { id: 'trcanje', name: 'Trčanje', icon: 'run', render: renderHealthTrcanje },
            { id: 'bikefit', name: 'Biciklizam', icon: 'bike', render: renderHealthBikeFit },
            { id: 'rm1', name: '1RM', icon: 'dumbbell', render: renderHealth1RM },
            { id: 'volume', name: 'Volumen', icon: 'activity', render: renderHealthVolume }
        ]
    },
    time: {
        name: 'Vreme i datumi', icon: 'clock', accent: '#f59e0b',
        tabs: [
            { id: 'konverter', name: 'Konverter vremena', icon: 'hourglass', render: renderTimeKonverter },
            { id: 'razlika', name: 'Razlika datuma', icon: 'calendarDays', render: renderTimeRazlika },
            { id: 'pomeraj', name: 'Dodaj/Oduzmi dane', icon: 'calendarPlus', render: renderTimePomeraj },
            { id: 'godine', name: 'Godine osobe', icon: 'cake', render: renderTimeGodine },
            { id: 'dan', name: 'Dan u nedelji', icon: 'calendar', render: renderTimeDan },
            { id: 'radni', name: 'Radni dani', icon: 'briefcaseSm', render: renderTimeRadni }
        ]
    },
    homecalc: {
        name: 'Građevina', icon: 'hammer', accent: '#ea580c',
        tabs: [
            { id: 'povrsina', name: 'Površina', icon: 'square', render: renderHomePovrsina },
            { id: 'blokovi', name: 'Blokovi', icon: 'bricks', render: renderHomeBlokovi },
            { id: 'table', name: 'Table', icon: 'board', render: renderHomeTable },
            { id: 'crep', name: 'Crep', icon: 'home', render: renderHomeCrep },
            { id: 'beton', name: 'Beton', icon: 'building', render: renderHomeBeton },
            { id: 'temelj', name: 'Temelj', icon: 'layers', render: renderHomeTemelj },
            { id: 'farbanje', name: 'Farbanje', icon: 'paint', render: renderHomeFarbanje },
            { id: 'plocice', name: 'Pločice', icon: 'tiles', render: renderHomePlocice },
            { id: 'laminat', name: 'Laminat', icon: 'layers', render: renderHomeLaminat },
            { id: 'malter', name: 'Malter', icon: 'flask', render: renderHomeMalter },
            { id: 'gips', name: 'Gips', icon: 'wall', render: renderHomeGips },
            { id: 'hidro', name: 'Hidroizolacija', icon: 'droplet', render: renderHomeHidro },
            { id: 'elektro', name: 'Elektro', icon: 'plug', render: renderHomeElektro },
            { id: 'stolarija', name: 'Stolarija', icon: 'door', render: renderHomeStolarija },
            { id: 'univerzalno', name: 'Univerzalno', icon: 'calculator', render: renderHomeUniverzalno }
        ]
    },
    kitchen: {
        name: 'Kuhinja', icon: 'chef', accent: '#84cc16',
        tabs: [
            { id: 'kasike', name: 'Kašike', icon: 'spoon', render: renderKitchenKasike },
            { id: 'case', name: 'Čaše', icon: 'glassWater', render: renderKitchenCase },
            { id: 'ostalo', name: 'Ostalo', icon: 'utensils', render: renderKitchenOstalo },
            { id: 'pecenje', name: 'Pečenje', icon: 'oven', render: renderKitchenPecenje },
            { id: 'porcije', name: 'Porcije', icon: 'utensils', render: renderKitchenPorcije },
            { id: 'kafa', name: 'Kafa/Čaj', icon: 'coffee', render: renderKitchenKafa }
        ]
    },
    power: {
        name: 'Struja', icon: 'zap', accent: '#eab308',
        tabs: [
            { id: 'uredjaj', name: 'Uređaj', icon: 'zap', render: renderPowerUredjaj },
            { id: 'vise', name: 'Više uređaja', icon: 'plug2', render: renderPowerVise },
            { id: 'watt', name: 'W ↔ A', icon: 'battery', render: renderPowerWatt },
            { id: 'faktura', name: 'Faktura', icon: 'trending', render: renderPowerFaktura },
            { id: 'kabl', name: 'Kabl', icon: 'cable', render: renderPowerKabl },
            { id: 'padnapona', name: 'Pad napona', icon: 'zap', render: renderPowerPadNapona },
            { id: 'osigurac', name: 'Osigurač', icon: 'shield', render: renderPowerOsigurac },
            { id: 'trofazna', name: 'Trofazna', icon: 'chart', render: renderPowerTrofazna },
            { id: 'osvetljenje', name: 'Osvetljenje', icon: 'lightbulb', render: renderPowerOsvetljenje },
            { id: 'grejac', name: 'Grejač vode', icon: 'thermometer2', render: renderPowerGrejac },
            { id: 'baterije', name: 'Baterije', icon: 'battery', render: renderPowerBaterije },
            { id: 'kelvin', name: 'Kelvin', icon: 'flashlight', render: renderPowerKelvin }
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
            { id: 'transpozicija', name: 'Transpozicija', icon: 'musicNote', render: renderMusicTranspozicija },
            { id: 'lestvice', name: 'Lestvice', icon: 'piano', render: renderMusicLestvice },
            { id: 'akordi', name: 'Akordi', icon: 'guitar', render: renderMusicAkordi },
            { id: 'kapo', name: 'Kapo', icon: 'mic', render: renderMusicKapo },
            { id: 'tempo', name: 'Tempo/Delay', icon: 'timer', render: renderMusicTempo },
            { id: 'intervali', name: 'Intervali', icon: 'sliders', render: renderMusicIntervali },
            { id: 'metronom', name: 'Metronom', icon: 'drum', render: renderMusicMetronom },
            { id: 'frekvencije', name: 'Frekvencije', icon: 'waves', render: renderMusicFrekvencije },
            { id: 'detektor', name: 'Detektor tona', icon: 'musicNote', render: renderMusicDetektor }
        ]
    }
};

// Broj podsetnika u svakom tabu (za badge na tabovima)
function getTabCount(categoryId, tabId) {
    if (categoryId !== 'podsetnici') return 0;
    
    const counts = {
        danas: 0,
        rodjendani: loadReminders('cx_birthdays').length,
        racuni: loadReminders('cx_bills').length,
        vozila: loadReminders('cx_vehicles').length + loadReminders('cx_documents').length,
        pretplate: loadReminders('cx_subscriptions').length,
        lekivi: loadReminders('cx_medications').length,
        godisnjice: loadReminders('cx_anniversaries').length,
        napomene: loadReminders('cx_notes').length
    };
    
    if (tabId === 'danas') {
        return counts.rodjendani + counts.racuni + counts.vozila + 
               counts.pretplate + counts.lekivi + counts.godisnjice + counts.napomene;
    }
    
    return counts[tabId] || 0;
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

    if (!modal || !iconBox || !titleBox || !tabBar) return;

    modal.style.setProperty('--qt-accent', cat.accent);
    iconBox.style.setProperty('--qt-accent', cat.accent);
    iconBox.innerHTML = icon(cat.icon);
    titleBox.textContent = safeT('cat.' + categoryId);

    tabBar.innerHTML = '';
    cat.tabs.forEach(tab => {
        const btn = document.createElement('button');
        btn.className = 'tab-btn';
        btn.style.setProperty('--qt-accent', cat.accent);
        btn.innerHTML = `
            <span class="tab-btn-icon">${icon(tab.icon)}</span>
            <span class="tab-btn-label">${escapeHtml(safeT('tab.' + categoryId + '.' + tab.id))}</span>
        `;
        btn.onclick = () => openCalc(categoryId, tab.id);
                
        // Dodaj badge ako ima podsetnika u tabu
        const count = getTabCount(categoryId, tab.id);
        if (count > 0) {
            const badge = document.createElement('span');
            badge.className = 'tab-badge';
            badge.textContent = count > 99 ? '99+' : String(count);
            btn.appendChild(badge);
        }
        tabBar.appendChild(btn);
    });

    modal.classList.add('show');
    document.body.classList.add('modal-open');
    vibrate(15);
    playTick(0, 1400, 0.06, 0.02);

    try { history.pushState({ modal: 'category', category: categoryId }, '', ''); } catch (e) {}
        // Sakrij tools hint kada se otvori modal
    const toolsHint = el('tools-hint');
    if (toolsHint) toolsHint.style.display = 'none';
}

function openCategoryBack(categoryId) {
    openCategory(categoryId);
}

function openCalc(categoryId, tabId) {
    const cat = CATEGORIES[categoryId];
    if (!cat) return;
    const tab = cat.tabs.find(t => t.id === tabId);
    if (!tab) return;
    activeTab = tabId;

    const modal = el('calc-modal');
    const iconBox = el('calc-icon');
    const titleBox = el('calc-title');
    const body = el('calc-body');

    if (!modal || !iconBox || !titleBox || !body) return;

    modal.style.setProperty('--qt-accent', cat.accent);
    iconBox.style.setProperty('--qt-accent', cat.accent);
    iconBox.innerHTML = icon(tab.icon);
    titleBox.textContent = safeT('tab.' + categoryId + '.' + tabId);

    const favKey = `${categoryId}:${tabId}`;
    const favStar = el('calc-fav-star');
    if (favStar) {
        const active = isFavorite(favKey);
        favStar.dataset.favKey = favKey;
        favStar.classList.toggle('active', active);
        favStar.innerHTML = active ? icon('starFill') : icon('star');
        favStar.title = active ? safeT('fav.remove') : safeT('fav.add');
    }

    body.innerHTML = tab.render();

    const catModal = el('category-modal');
    if (catModal) catModal.classList.remove('show');

    modal.classList.add('show');
    document.body.classList.add('modal-open');

    try { restoreInputsFor(body); } catch (e) {}
    try { setupDateTriplesIn(body); } catch (e) {}

    vibrate(20);
    playTick(0, 1500, 0.08, 0.03);

    if (tabId === 'valuta') {
        setTimeout(() => {
            loadFxRates();
            populateCurrencySelects();
            renderFxList();
            updateFxUpdatedLabel();
            calculateCurrency();
        }, 50);
    }
    if (tabId === 'lista') setTimeout(() => { renderShoppingList(); }, 50);
    if (tabId === 'stimer') setTimeout(() => { renderTunerStrings(); }, 50);
    if (tabId === 'vise') setTimeout(() => { renderPowerDevices(); updatePowerTotal(); }, 50);
    if (tabId === 'mojauto') setTimeout(() => { updateAutoStatus(); }, 50);

    if (categoryId === 'weather') {
        setTimeout(() => { initWeatherTab(tabId); }, 80);
    }

    // Podsetnici
    if (categoryId === 'podsetnici') {
        setTimeout(() => {
            if (tabId === 'danas') {
                renderRemindersHistoryList();
            }
            if (tabId === 'rodjendani') renderReminderList('birthday');
            if (tabId === 'racuni') renderReminderList('bill');
            if (tabId === 'vozila') { renderReminderList('vehicle'); renderReminderList('document'); }
            if (tabId === 'pretplate') renderReminderList('subscription');
            if (tabId === 'lekivi') renderReminderList('medication');
            if (tabId === 'godisnjice') renderReminderList('anniversary');
            if (tabId === 'napomene') renderReminderList('note');
        }, 50);
    }

        if (categoryId === 'music') {
        setTimeout(() => {
            try { populateNoteSelects(); } catch (e) { console.warn('populateNoteSelects:', e); }
        }, 50);
    }
    try { history.pushState({ modal: 'calc', category: categoryId, tab: tabId }, '', ''); } catch (e) {}
        // Sakrij tools hint kada se otvori modal
    const toolsHintCalc = el('tools-hint');
    if (toolsHintCalc) toolsHintCalc.style.display = 'none';

    try { maybeShowFavHint(); } catch (e) {}
}

function closeModal(modalId) {
    const modal = el(modalId);
    if (!modal) return;

    if (modalId === 'calc-modal' && activeCategory) {
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
}

// ================= BRZI ALATI =================
const QUICK_TOOLS_KEY = 'cx_quick_tools_v2';
const DEFAULT_QUICK_TOOLS = ['podsetnici', 'money', 'weather', 'measures'];
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
        const btn = document.createElement('button');
        btn.className = 'quick-tool';
        btn.style.setProperty('--qt-accent', cat.accent);
        btn.dataset.catId = id;
        btn.innerHTML = `
            <span class="quick-tool-icon">${icon(cat.icon)}</span>
            <span class="quick-tool-label">${escapeHtml(safeT('cat.' + id))}</span>
        `;
        btn.onclick = () => openCategory(id);
        grid.appendChild(btn);
    });
    // Badge za podsetnike
    updateVisualBadge(getUrgentRemindersCount());
}

function openQuickToolsEditor() {
    const modal = el('editor-modal');
    const grid = el('editor-grid');
    if (!modal || !grid) return;
    const current = getQuickTools();
    grid.innerHTML = '';
    Object.entries(CATEGORIES).forEach(([id, cat]) => {
        const item = document.createElement('div');
        item.className = 'editor-item' + (current.includes(id) ? ' selected' : '');
        item.dataset.catId = id;
        item.style.setProperty('--qt-accent', cat.accent);
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
    try { history.pushState({ modal: 'editor' }, '', ''); } catch (e) {}
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

// ================= SVI ALATI (sa edit mode + drag&drop) =================
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
        btn.style.setProperty('--qt-accent', cat.accent);
        btn.dataset.catId = id;
        btn.innerHTML = `
            <span class="all-tool-icon">${icon(cat.icon)}</span>
            <span class="all-tool-label">${escapeHtml(safeT('cat.' + id))}</span>
        `;
        if (!allToolsEditMode) {
            btn.onclick = () => openCategory(id);
        }
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
            closeBtn.title = isHidden ? safeT('section.allTools.reset') : safeT('section.allTools.hidden');
            closeBtn.onclick = (e) => {
                e.stopPropagation();
                toggleCategoryHidden(id);
            };
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
    try { maybeShowToolsHint(); } catch (e) {}
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
    if (hint) {
        if (allToolsEditMode) {
            hint.style.display = 'block';
        } else {
            hint.style.display = 'none';
        }
    }
    
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
    playTick(0, 1500, 0.08, 0.03);
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
    playTick(0, 1300, 0.05, 0.015);
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
        favStar.title = active ? safeT('fav.remove') : safeT('fav.add');
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
        const chip = document.createElement('button');
        chip.className = 'favorite-chip';
        chip.type = 'button';
        chip.style.setProperty('--qt-accent', cat.accent);
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
        const daysSince = (Date.now() - lastShown) / 86400000;
        return daysSince >= FAV_HINT_INTERVAL_DAYS;
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
    playTick(0, 1400, 0.07, 0.02);
}

// ================= BADGE za podsetnike =================
const BADGE_HINT_KEY = 'cx_hint_dismissed_badge';

function getUrgentRemindersCount() {
    try {
        const items = getAllReminderItems();
        // Broji samo aktivne (ne završene)
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
    document.querySelectorAll('.category-badge').forEach(el => el.remove());
    if (count <= 0) return;

    const quickTool = document.querySelector('.quick-tool[data-cat-id="podsetnici"]');
    if (quickTool) {
        const badge = document.createElement('span');
        badge.className = 'category-badge category-badge-green';
        badge.textContent = count > 99 ? '99+' : String(count);
        quickTool.appendChild(badge);
    }

    const allTool = document.querySelector('.all-tool[data-cat-id="podsetnici"]');
    if (allTool) {
        const badge = document.createElement('span');
        badge.className = 'category-badge category-badge-green';
        badge.textContent = count > 99 ? '99+' : String(count);
        const wrap = allTool.closest('.all-tool-wrap') || allTool;
        wrap.appendChild(badge);
    }
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
    playTick(0, 1400, 0.07, 0.02);
}

// ================= PRETRAGA =================
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

function renderQuickResults(matches) {
    const box = el('quick-search-results');
    if (!box) return;
    box.innerHTML = '';
    if (!matches.length) {
        box.innerHTML = '<div class="qsr-empty"><div class="qsr-empty-title">' + safeT('search.noResults') + '</div><div class="qsr-empty-sub">' + safeT('search.tryAgain') + '</div></div>';
        return;
    }
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
    if (!resultsBox || !normal) return;
    if (!q) {
        resultsBox.style.display = 'none';
        resultsBox.innerHTML = '';
        normal.style.display = 'block';
        return;
    }
    normal.style.display = 'none';
    const matches = searchTools(q);
    renderQuickResults(matches);
    resultsBox.style.display = 'flex';
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
        try { counts = JSON.parse(localStorage.getItem('cx_category_clicks')) || {}; } catch (e) {}
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
function openHistoryScreen() {
    renderHistory();
    openScreen('history-screen');
}
function trackCategoryUse(categoryId) {
    if (!CATEGORIES[categoryId]) return;
    try {
        let counts = {};
        try { counts = JSON.parse(localStorage.getItem('cx_category_clicks')) || {}; } catch (e) {}
        counts[categoryId] = (counts[categoryId] || 0) + 1;
        localStorage.setItem('cx_category_clicks', JSON.stringify(counts));
    } catch (e) {}
}

// ================= NAVIGACIJA — EKRANI =================
let currentScreenId = 'home-screen';

function openScreen(screenId, direction = 'right') {
    try {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active', 'enter-right', 'enter-left');
        });
        const target = el(screenId);
        if (!target) return;
        target.classList.add('active');
        if (!reduceMotion) target.classList.add(direction === 'left' ? 'enter-left' : 'enter-right');
        window.scrollTo(0, 0);
        currentScreenId = screenId;
        try { restoreInputsFor(target); } catch (e) {}
        if (screenId === 'home-screen') {
            try { renderFavorites(); } catch (e) {}
            try { renderQuickTools(); } catch (e) {}
            try { renderAllTools(); } catch (e) {}
            try { updateAppBadge(); } catch (e) {}
        }
                    // Ponovo prikaži tools hint kada se vrati na home (ako nije dismissed)
        if (screenId === 'home-screen') {
            try {
                if (localStorage.getItem('cx_hint_dismissed_tools') !== '1') {
                    const hint = el('tools-hint');
                    if (hint) hint.style.display = 'flex';
                }
            } catch (e) {}
        }
        
        if (screenId === 'history-screen') { renderHistory(); renderUsageStats(); }
        if (direction !== 'left' && screenId !== 'home-screen') {
            try { history.pushState({ screen: screenId }, '', ''); } catch (e) {}
        }
    } catch (e) {}
}

function goHome() {
    const searchInput = el('home-search');
    if (searchInput) { searchInput.value = ''; handleQuickSearch(); }
    closeAllModals();
    if (currentScreenId === 'home-screen') return;
    if (history.state && history.state.screen && history.state.screen !== 'home-screen') {
        history.back();
    } else {
        openScreen('home-screen', 'left');
    }
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

        if (reminderModal && reminderModal.classList.contains('show')) {
            reminderModal.classList.remove('show');
            document.body.classList.remove('modal-open');
            return;
        }
        if (aboutModal && aboutModal.classList.contains('show')) {
            aboutModal.classList.remove('show');
            setTimeout(() => {
                const anyOpen = document.querySelector('.modal.show');
                if (!anyOpen) document.body.classList.remove('modal-open');
            }, 220);
            return;
        }
        if (calcModal && calcModal.classList.contains('show')) {
            calcModal.classList.remove('show');
            if (activeCategory) {
                setTimeout(() => openCategoryBack(activeCategory), 100);
            } else {
                activeTab = null;
                setTimeout(() => {
                    const anyOpen = document.querySelector('.modal.show');
                    if (!anyOpen) document.body.classList.remove('modal-open');
                }, 220);
            }
            return;
        }
        if (catModal && catModal.classList.contains('show')) {
            catModal.classList.remove('show');
            activeCategory = null;
            setTimeout(() => {
                const anyOpen = document.querySelector('.modal.show');
                if (!anyOpen) document.body.classList.remove('modal-open');
            }, 220);
            return;
        }
        if (editorModal && editorModal.classList.contains('show')) {
            editorModal.classList.remove('show');
            setTimeout(() => {
                const anyOpen = document.querySelector('.modal.show');
                if (!anyOpen) document.body.classList.remove('modal-open');
            }, 220);
            return;
        }
        if (locationModal && locationModal.classList.contains('show')) {
            locationModal.classList.remove('show');
            return;
        }
        const state = e.state;
        if (state && state.home) {
            if (currentScreenId !== 'home-screen') {
                openScreen('home-screen', 'left');
                try { history.pushState({ screen: 'home-screen', home: true }, '', ''); } catch (err) {}
            }
            return;
        }
        if (state && state.screen) {
            const target = el(state.screen);
            if (target) { openScreen(state.screen, 'left'); return; }
        }
        if (currentScreenId !== 'home-screen') {
            openScreen('home-screen', 'left');
            try { history.pushState({ screen: 'home-screen', home: true }, '', ''); } catch (err) {}
        }
    });
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
    const selector = '.calc-btn-main, .copy-btn, .back-btn, .swap-btn, .settings-toggle-btn, .confirm-btn, .openings-add-btn, .fx-refresh-btn, .fx-swap-btn, .copy-btn-mini, .lista-clear-btn, .quick-tool, .all-tool, .tab-btn, .section-action-btn, .modal-fav-star, .weather-refresh-btn, .location-gps-btn, .weather-location, .icon-btn-text, .about-row, .all-tools-save-btn, .all-tools-reset-btn';
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

// ================= DATUM (trojni unos) =================
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

// ============================================================
// KRAJ DELA 1/4
// ============================================================// ============================================================
// ALATIKA — app.js (v4) — DEO 2/4
// VREME + YIN TUNER + RENDER POMOĆNE
// ============================================================

// ================= VREME — KONSTANTE =================
const WEATHER_LOC_KEY = 'cx_weather_location_v1';
const WEATHER_CACHE_KEY = 'cx_weather_cache_v1';
const WEATHER_CACHE_TTL = 30 * 60 * 1000;

let weatherState = {
    location: null,
    current: null,
    hourly: null,
    daily: null,
    aqi: null,
    pollen: null,
    loading: false,
    lastFetch: 0,
    stale: false
};

const WMO_CODES = {
    0: 'clear', 1: 'mostlyClear', 2: 'partlyCloudy', 3: 'cloudy',
    45: 'fog', 48: 'fogFrost',
    51: 'drizzleLight', 53: 'drizzle', 55: 'drizzleHeavy',
    56: 'freezingDrizzleLight', 57: 'freezingDrizzle',
    61: 'rainLight', 63: 'rain', 65: 'rainHeavy',
    66: 'freezingRainLight', 67: 'freezingRain',
    71: 'snowLight', 73: 'snow', 75: 'snowHeavy', 77: 'snowFlurries',
    80: 'showers', 81: 'showers', 82: 'showersHeavy',
    85: 'snowShowers', 86: 'snowShowers',
    95: 'thunderstorm', 96: 'thunderstormHail', 99: 'thunderstormHailHeavy'
};

const WMO_ICONS = {
    0: 'sun', 1: 'sun', 2: 'cloudSun', 3: 'cloud',
    45: 'cloud', 48: 'cloud',
    51: 'cloudRain', 53: 'cloudRain', 55: 'cloudRain',
    56: 'cloudSnow', 57: 'cloudSnow',
    61: 'cloudRain', 63: 'cloudRain', 65: 'cloudRain',
    66: 'cloudSnow', 67: 'cloudSnow',
    71: 'cloudSnow', 73: 'cloudSnow', 75: 'cloudSnow', 77: 'cloudSnow',
    80: 'cloudRain', 81: 'cloudRain', 82: 'cloudRain',
    85: 'cloudSnow', 86: 'cloudSnow',
    95: 'cloudLightning', 96: 'cloudLightning', 99: 'cloudLightning'
};

const WMO_ICON_COLORS = {
    sun: '#fbbf24',
    cloudSun: '#fbbf24',
    cloud: '#94a3b8',
    cloudRain: '#60a5fa',
    cloudSnow: '#e0e7ff',
    cloudLightning: '#facc15'
};

const CITY_MAP = {
    'beograd': { name: 'Beograd', admin1: 'Srbija', country: 'Srbija', lat: 44.8176, lon: 20.4633 },
    'novi sad': { name: 'Novi Sad', admin1: 'Vojvodina', country: 'Srbija', lat: 45.2671, lon: 19.8335 },
    'nis': { name: 'Niš', admin1: 'Srbija', country: 'Srbija', lat: 43.3209, lon: 21.8958 }
};

function loadWeatherLocation() {
    try {
        const raw = JSON.parse(localStorage.getItem(WEATHER_LOC_KEY));
        if (raw && raw.lat && raw.lon) return raw;
    } catch (e) {}
    return null;
}
function saveWeatherLocation(loc) {
    try { localStorage.setItem(WEATHER_LOC_KEY, JSON.stringify(loc)); } catch (e) {}
}
function loadWeatherCache() {
    try {
        const raw = JSON.parse(localStorage.getItem(WEATHER_CACHE_KEY));
        if (raw && raw.data) return raw;
    } catch (e) {}
    return null;
}
function saveWeatherCache(data) {
    try { localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({ data, ts: Date.now() })); } catch (e) {}
}

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
            return data.results.map(r => ({
                name: r.name,
                admin1: r.admin1 || '',
                country: r.country || '',
                lat: r.latitude,
                lon: r.longitude
            }));
        }
    } catch (e) { console.warn('Geocoding greška:', e.message); }
    return [];
}

async function fetchWeather(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,uv_index` +
        `&hourly=temperature_2m,precipitation_probability,weather_code,wind_speed_10m,uv_index` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,wind_speed_10m_max,uv_index_max` +
        `&timezone=auto&forecast_days=7`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
}

async function fetchAQI(lat, lon) {
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}` +
        `&current=european_aqi,pm2_5,pm10,nitrogen_dioxide,ozone,sulphur_dioxide` +
        `&hourly=alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen` +
        `&timezone=auto&forecast_days=1`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
}

async function initWeatherTab(tabId) {
    if (!weatherState.location) {
        const saved = loadWeatherLocation();
        if (saved) weatherState.location = saved;
        else {
            weatherState.location = CITY_MAP['beograd'];
            saveWeatherLocation(weatherState.location);
        }
    }
    const cache = loadWeatherCache();
    if (cache && (Date.now() - cache.ts) < WEATHER_CACHE_TTL) {
        weatherState.current = cache.data.current;
        weatherState.hourly = cache.data.hourly;
        weatherState.daily = cache.data.daily;
        weatherState.aqi = cache.data.aqi;
        weatherState.pollen = cache.data.pollen;
        weatherState.lastFetch = cache.ts;
        weatherState.stale = false;
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
        const [weather, aqi] = await Promise.all([
            fetchWeather(loc.lat, loc.lon),
            fetchAQI(loc.lat, loc.lon).catch(() => null)
        ]);
        weatherState.current = weather.current;
        weatherState.hourly = weather.hourly;
        weatherState.daily = weather.daily;
        weatherState.aqi = aqi ? aqi.current : null;
        weatherState.pollen = aqi ? aqi.hourly : null;
        weatherState.lastFetch = Date.now();
        weatherState.stale = false;
        weatherState.loading = false;
        saveWeatherCache({
            current: weatherState.current,
            hourly: weatherState.hourly,
            daily: weatherState.daily,
            aqi: weatherState.aqi,
            pollen: weatherState.pollen
        });
        renderWeatherTabContent(tabId);
    } catch (e) {
        console.warn('Weather fetch error:', e.message);
        weatherState.loading = false;
        weatherState.stale = true;
        const cache = loadWeatherCache();
        if (cache) {
            weatherState.current = cache.data.current;
            weatherState.hourly = cache.data.hourly;
            weatherState.daily = cache.data.daily;
            weatherState.aqi = cache.data.aqi;
            weatherState.pollen = cache.data.pollen;
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
    vibrate(20);
    playTick(0, 1400, 0.08, 0.03);
}

function openLocationModal() {
    const modal = el('location-modal');
    if (!modal) return;
    const input = el('location-search-input');
    if (input) input.value = '';
    const results = el('location-results');
    if (results) results.innerHTML = '<div class="location-empty">' + safeT('weather.location.empty') + '</div>';
    modal.classList.add('show');
    document.body.classList.add('modal-open');
    vibrate(15);
    playTick(0, 1400, 0.06, 0.02);
    try { history.pushState({ modal: 'location' }, '', ''); } catch (e) {}
    setTimeout(() => { if (input) input.focus(); }, 200);
}

async function searchLocation() {
    const input = el('location-search-input');
    const results = el('location-results');
    if (!input || !results) return;
    const q = input.value.trim();
    if (!q || q.length < 2) {
        results.innerHTML = '<div class="location-empty">' + safeT('weather.location.minChars') + '</div>';
        return;
    }
    results.innerHTML = '<div class="location-empty">' + safeT('weather.location.searching') + '</div>';
    const found = await geocodeCity(q);
    if (!found.length) {
        results.innerHTML = '<div class="location-empty">' + safeT('weather.location.noResults') + ' "' + escapeHtml(q) + '".</div>';
        return;
    }
    results.innerHTML = '';
    found.forEach(loc => {
        const item = document.createElement('div');
        item.className = 'location-result-item';
        item.innerHTML = `
            <div class="location-result-name">${escapeHtml(loc.name)}</div>
            <div class="location-result-region">${escapeHtml(loc.admin1 ? loc.admin1 + ', ' : '')}${escapeHtml(loc.country)}</div>
        `;
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
    vibrate(20);
    playTick(0, 1500, 0.08, 0.03);
    setTimeout(() => {
        const tabId = activeTab || 'prognoza';
        loadWeatherData(tabId);
    }, 200);
}

function useGPSLocation() {
    if (!navigator.geolocation) {
        showToast(safeT('weather.location.gpsUnsupported'), 'error');
        return;
    }
    showToast(safeT('weather.location.gpsSearching'), 'info', 2000);
    navigator.geolocation.getCurrentPosition(
        async (pos) => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            let name = currentLang === 'en' ? 'My location' : 'Moja lokacija';
            let admin1 = '';
            let country = '';
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
            } catch (e) { console.warn('Reverse geocoding greška:', e.message); }
            selectLocation({ name, admin1, country, lat, lon });
        },
        () => { showToast(safeT('weather.location.gpsError'), 'error', 2500); },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    );
}

function renderWeatherPrognoza() {
    return `<div id="weather-prognoza-content"><div class="weather-loading"><div class="weather-loading-row"></div><div class="weather-loading-row"></div><div class="weather-loading-row"></div></div></div>`;
}
function renderWeatherVazduh() {
    return `<div id="weather-vazduh-content"><div class="weather-loading"><div class="weather-loading-row"></div><div class="weather-loading-row"></div></div></div>`;
}
function renderWeatherPametni() {
    return `<div id="weather-pametni-content"><div class="weather-loading"><div class="weather-loading-row"></div><div class="weather-loading-row"></div><div class="weather-loading-row"></div></div></div>`;
}
function renderWeatherSunce() {
    return `<div id="weather-sunce-content"><div class="weather-loading"><div class="weather-loading-row"></div><div class="weather-loading-row"></div></div></div>`;
}

function weatherLocationHeader() {
    const loc = weatherState.location;
    if (!loc) return '';
    const name = loc.name + (loc.admin1 && loc.admin1 !== loc.name ? ', ' + loc.admin1 : '');
    const staleBadge = weatherState.stale ? '<span class="weather-stale-badge">' + safeT('weather.stale') + '</span>' : '';
    return `
        <div class="weather-location-row">
            <div class="weather-location" onclick="openLocationModal()" title="${safeT('weather.location.title')}">
                ${icon('mapPin')}
                <span class="weather-location-name">${escapeHtml(name)}</span>
                ${staleBadge}
            </div>
            <button class="weather-refresh-btn" onclick="refreshWeather()" title="${safeT('weather.refresh')}">
                ${icon('refresh')}
            </button>
        </div>
    `;
}

function getWeatherInfo(code) {
    const key = WMO_CODES[code];
    if (!key) return { text: safeT('weather.condition.unknown'), icon: 'cloud' };
    return { text: safeT('weather.condition.' + key), icon: WMO_ICONS[code] || 'cloud' };
}

function formatHour(isoStr) {
    const d = new Date(isoStr);
    return String(d.getHours()).padStart(2, '0') + ':00';
}

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
    if (loading && !current) {
        box.innerHTML = `<div class="weather-loading"><div class="weather-loading-row"></div><div class="weather-loading-row"></div><div class="weather-loading-row"></div></div>`;
        return;
    }
    if (!current) {
        box.innerHTML = `
            <div class="weather-error">
                <div class="weather-error-icon">📡</div>
                <div class="weather-error-title">${safeT('weather.error.noData')}</div>
                <div class="weather-error-text">${safeT('weather.error.checkInternet')}</div>
                <button class="weather-error-btn" onclick="refreshWeather()">${safeT('weather.error.retry')}</button>
            </div>
        `;
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
        hourlyHtml += `
            <div class="weather-hour-card">
                <div class="weather-hour-time">${formatHour(timeStr)}</div>
                <div class="weather-hour-icon" style="color: ${WMO_ICON_COLORS[wInfo.icon] || '#38bdf8'};">${icon(wInfo.icon)}</div>
                <div class="weather-hour-temp">${t2}°</div>
                ${rain > 20 ? `<div class="weather-hour-rain">${rain}%</div>` : ''}
            </div>
        `;
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
        dailyHtml += `
            <div class="weather-day-item">
                <div class="weather-day-name">${formatDayName(timeStr, i)}</div>
                <div class="weather-day-icon" style="color: ${WMO_ICON_COLORS[wInfo.icon] || '#38bdf8'};">${icon(wInfo.icon)}</div>
                <div class="weather-day-comment">${escapeHtml(comment)}</div>
                <div class="weather-day-temps">${tMax}°<small> / ${tMin}°</small></div>
            </div>
        `;
    });

    box.innerHTML = `
        ${weatherLocationHeader()}
        <div class="weather-current">
            <div class="weather-temp-row">
                <div class="weather-temp-big">${temp}°</div>
                <div class="weather-temp-info">
                    <div class="weather-condition">${escapeHtml(info.text)}</div>
                    <div class="weather-feels">${safeT('weather.feels')} ${feels}°</div>
                </div>
            </div>
            <div class="weather-meta-row">
                <div class="weather-meta-item">${icon('wind')} ${wind} km/h</div>
                <div class="weather-meta-item">${icon('droplets')} ${humidity}%</div>
                <div class="weather-meta-item">${icon('sun')} UV ${Math.round(current.uv_index || 0)}</div>
            </div>
        </div>
        <div class="weather-section-title">${safeT('weather.section.hourly')}</div>
        <div class="weather-hourly">${hourlyHtml}</div>
        <div class="weather-section-title">${safeT('weather.section.daily')}</div>
        <div class="weather-daily-list">${dailyHtml}</div>
    `;
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
    if (loading && !aqi) {
        box.innerHTML = `<div class="weather-loading"><div class="weather-loading-row"></div><div class="weather-loading-row"></div></div>`;
        return;
    }
    if (!aqi) {
        box.innerHTML = `
            <div class="weather-error">
                <div class="weather-error-icon">🌫️</div>
                <div class="weather-error-title">${safeT('weather.error.noAirQuality')}</div>
                <div class="weather-error-text">${safeT('weather.error.noAirQualityText')}</div>
                <button class="weather-error-btn" onclick="refreshWeather()">${safeT('weather.error.retry')}</button>
            </div>
        `;
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
            { key: 'grass_pollen', nameKey: 'grass' },
            { key: 'birch_pollen', nameKey: 'birch' },
            { key: 'alder_pollen', nameKey: 'alder' },
            { key: 'mugwort_pollen', nameKey: 'mugwort' },
            { key: 'olive_pollen', nameKey: 'olive' },
            { key: 'ragweed_pollen', nameKey: 'ragweed' }
        ];
        pollenTypes.forEach(pt => {
            const val = pollen[pt.key] ? pollen[pt.key][realIdx] : null;
            if (val === null || val === undefined) return;
            let levelKey;
            if (val < 10) levelKey = 'low';
            else if (val < 50) levelKey = 'medium';
            else levelKey = 'high';
            pollenHtml += `
                <div class="pollen-row">
                    <span class="pollen-name">${safeT('weather.pollen.' + pt.nameKey)}</span>
                    <span class="pollen-value ${levelKey}">${safeT('weather.pollen.' + levelKey)}</span>
                </div>
            `;
        });
    }
    box.innerHTML = `
        ${weatherLocationHeader()}
        <div class="aqi-card" style="--aqi-color: ${aqiColor};">
            <div class="aqi-value">${Math.round(aqiVal)}</div>
            <div class="aqi-info">
                <div class="aqi-label">${safeT('weather.aqi.' + aqiKey)}</div>
                <div class="aqi-sub">${safeT('weather.aqi.subtitle')}</div>
            </div>
        </div>
        <div class="weather-section-title">${safeT('weather.section.pollutants')}</div>
        ${aqi.pm2_5 !== undefined ? `<div class="aqi-pollutant-row"><span class="aqi-pollutant-name">PM2.5</span><span class="aqi-pollutant-value">${Math.round(aqi.pm2_5)} µg/m³</span></div>` : ''}
        ${aqi.pm10 !== undefined ? `<div class="aqi-pollutant-row"><span class="aqi-pollutant-name">PM10</span><span class="aqi-pollutant-value">${Math.round(aqi.pm10)} µg/m³</span></div>` : ''}
        ${aqi.nitrogen_dioxide !== undefined ? `<div class="aqi-pollutant-row"><span class="aqi-pollutant-name">NO₂</span><span class="aqi-pollutant-value">${Math.round(aqi.nitrogen_dioxide)} µg/m³</span></div>` : ''}
        ${aqi.ozone !== undefined ? `<div class="aqi-pollutant-row"><span class="aqi-pollutant-name">O₃</span><span class="aqi-pollutant-value">${Math.round(aqi.ozone)} µg/m³</span></div>` : ''}
        ${aqi.sulphur_dioxide !== undefined ? `<div class="aqi-pollutant-row"><span class="aqi-pollutant-name">SO₂</span><span class="aqi-pollutant-value">${Math.round(aqi.sulphur_dioxide)} µg/m³</span></div>` : ''}
        ${pollenHtml ? `<div class="weather-section-title">${safeT('weather.section.pollen')}</div>${pollenHtml}` : ''}
    `;
}

function updateWeatherPametni() {
    const box = el('weather-pametni-content');
    if (!box) return;
    const { current, hourly, loading } = weatherState;
    if (loading && !current) {
        box.innerHTML = `<div class="weather-loading"><div class="weather-loading-row"></div><div class="weather-loading-row"></div><div class="weather-loading-row"></div></div>`;
        return;
    }
    if (!current) {
        box.innerHTML = `
            <div class="weather-error">
                <div class="weather-error-icon">🤔</div>
                <div class="weather-error-title">${safeT('weather.error.noData')}</div>
                <div class="weather-error-text">${safeT('weather.error.retry')}.</div>
                <button class="weather-error-btn" onclick="refreshWeather()">${safeT('weather.error.retry')}</button>
            </div>
        `;
        return;
    }
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
            const tempAt = hourly.temperature_2m[i];
            const rainAt = hourly.precipitation_probability[i];
            const windAt = hourly.wind_speed_10m[i];
            const score = Math.abs(tempAt - 22) + rainAt * 0.5 + windAt * 0.3;
            if (score < bestScore) { bestScore = score; bestHour = t2; }
        }
    }
    const bestHourText = bestHour
        ? `${String(bestHour.getHours()).padStart(2, '0')}:00 — ${String((bestHour.getHours() + 2) % 24).padStart(2, '0')}:00`
        : safeT('weather.smart.morningEvening');

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
    const rainNext6 = hourly && hourly.precipitation_probability
        ? Math.max(...hourly.precipitation_probability.slice(0, 6)) : 0;
    if (rainNext6 < 30 && temp > 5 && temp < 28) activities.push({ yes: true, text: safeT('weather.smart.running.ideal') });
    else if (rainNext6 > 60) activities.push({ yes: false, text: safeT('weather.smart.running.rain') });
    else activities.push({ warn: true, text: safeT('weather.smart.running.check') });
    if (wind < 25 && rainNext6 < 40) activities.push({ yes: true, text: safeT('weather.smart.bike.good') });
    else activities.push({ warn: true, text: safeT('weather.smart.bike.bad') });
    if (uv >= 7) activities.push({ warn: true, text: safeT('weather.smart.walk.avoidNoon') });
    else activities.push({ yes: true, text: safeT('weather.smart.walk.pleasant') });

    box.innerHTML = `
        ${weatherLocationHeader()}
        <div class="smart-card" style="--smart-accent: #ec4899;">
            <div class="smart-head">
                <div class="smart-icon">${icon('users')}</div>
                <div class="smart-title">${safeT('weather.smart.clothes')}</div>
            </div>
            <div class="smart-text">${escapeHtml(safeT('weather.smart.clothes.' + clothesKey))}</div>
        </div>
        <div class="smart-card" style="--smart-accent: #f59e0b;">
            <div class="smart-head">
                <div class="smart-icon">${icon('clock')}</div>
                <div class="smart-title">${safeT('weather.smart.whenToGoOut')}</div>
            </div>
            <div class="smart-text">${safeT('weather.smart.bestTime')} <strong>${bestHourText}</strong></div>
        </div>
        <div class="smart-card" style="--smart-accent: #06b6d4;">
            <div class="smart-head">
                <div class="smart-icon">${icon('target')}</div>
                <div class="smart-title">${safeT('weather.smart.whatToBring')}</div>
            </div>
            <ul class="smart-list">
                ${toBring.map(item => `
                    <li class="${item.yes ? 'yes' : 'no'}">
                        <span class="check-icon">${icon(item.yes ? 'check' : 'x')}</span>
                        <span>${escapeHtml(item.text)}</span>
                    </li>
                `).join('')}
            </ul>
        </div>
        <div class="smart-card" style="--smart-accent: #10b981;">
            <div class="smart-head">
                <div class="smart-icon">${icon('activity')}</div>
                <div class="smart-title">${safeT('weather.smart.activities')}</div>
            </div>
            <ul class="smart-list">
                ${activities.map(item => `
                    <li class="${item.yes ? 'yes' : (item.no ? 'no' : 'warn')}">
                        <span class="check-icon">${icon(item.yes ? 'check' : (item.no ? 'x' : 'alert'))}</span>
                        <span>${escapeHtml(item.text)}</span>
                    </li>
                `).join('')}
            </ul>
        </div>
    `;
}

function updateWeatherSunce() {
    const box = el('weather-sunce-content');
    if (!box) return;
    const { daily, loading } = weatherState;
    if (loading && !daily) {
        box.innerHTML = `<div class="weather-loading"><div class="weather-loading-row"></div><div class="weather-loading-row"></div></div>`;
        return;
    }
    if (!daily) {
        box.innerHTML = `
            <div class="weather-error">
                <div class="weather-error-icon">🌙</div>
                <div class="weather-error-title">${safeT('weather.error.noData')}</div>
                <div class="weather-error-text">${safeT('weather.error.retry')}.</div>
                <button class="weather-error-btn" onclick="refreshWeather()">${safeT('weather.error.retry')}</button>
            </div>
        `;
        return;
    }
    const today = { sunrise: daily.sunrise[0], sunset: daily.sunset[0] };
    const locale = currentLang === 'en' ? 'en-GB' : 'sr-RS';
    const sunriseStr = today.sunrise ? new Date(today.sunrise).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }) : '—';
    const sunsetStr = today.sunset ? new Date(today.sunset).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }) : '—';
    let dayLength = '—';
    if (today.sunrise && today.sunset) {
        const sr = new Date(today.sunrise);
        const ss = new Date(today.sunset);
        const diffMin = Math.round((ss - sr) / 60000);
        const h = Math.floor(diffMin / 60);
        const m = diffMin % 60;
        dayLength = `${h}h ${m}min`;
    }
    let goldenMorning = '—', goldenEvening = '—', blueMorning = '—', blueEvening = '—';
    if (today.sunrise) {
        const sr = new Date(today.sunrise);
        const gmStart = new Date(sr.getTime() + 5 * 60000);
        const gmEnd = new Date(sr.getTime() + 45 * 60000);
        goldenMorning = `${gmStart.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })} – ${gmEnd.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}`;
        const bmStart = new Date(sr.getTime() - 30 * 60000);
        blueMorning = `${bmStart.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })} – ${sr.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (today.sunset) {
        const ss = new Date(today.sunset);
        const geStart = new Date(ss.getTime() - 45 * 60000);
        goldenEvening = `${geStart.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })} – ${ss.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}`;
        const beEnd = new Date(ss.getTime() + 30 * 60000);
        blueEvening = `${ss.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })} – ${beEnd.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}`;
    }
    const moonPhase = calculateMoonPhase(new Date());
    let visibilityKey = 'visibilityExcellent';
    if (daily.weather_code[0] >= 3) visibilityKey = 'visibilityPoor';
    else if (daily.weather_code[0] >= 2) visibilityKey = 'visibilityGood';
    box.innerHTML = `
        ${weatherLocationHeader()}
        <div class="celestial-card">
            <div class="celestial-title">${icon('sunrise')} ${safeT('weather.celestial.sun')}</div>
            <div class="celestial-row"><span class="celestial-label">${safeT('weather.celestial.sunrise')}</span><span class="celestial-value">${sunriseStr}</span></div>
            <div class="celestial-row"><span class="celestial-label">${safeT('weather.celestial.sunset')}</span><span class="celestial-value">${sunsetStr}</span></div>
            <div class="celestial-row"><span class="celestial-label">${safeT('weather.celestial.dayLength')}</span><span class="celestial-value">${dayLength}</span></div>
        </div>
        <div class="celestial-card">
            <div class="celestial-title">${icon('eye')} ${safeT('weather.celestial.photographers')}</div>
            <div class="celestial-row"><span class="celestial-label">${safeT('weather.celestial.goldenMorning')}</span><span class="celestial-value">${goldenMorning}</span></div>
            <div class="celestial-row"><span class="celestial-label">${safeT('weather.celestial.goldenEvening')}</span><span class="celestial-value">${goldenEvening}</span></div>
            <div class="celestial-row"><span class="celestial-label">${safeT('weather.celestial.blueMorning')}</span><span class="celestial-value">${blueMorning}</span></div>
            <div class="celestial-row"><span class="celestial-label">${safeT('weather.celestial.blueEvening')}</span><span class="celestial-value">${blueEvening}</span></div>
        </div>
        <div class="celestial-card">
            <div class="celestial-title">${icon('moon')} ${safeT('weather.celestial.moon')}</div>
            <div class="celestial-row"><span class="celestial-label">${safeT('weather.celestial.moonPhase')}</span><span class="celestial-value">${safeT('moon.' + moonPhase.key)} (${moonPhase.illumination}%)</span></div>
        </div>
        <div class="celestial-card">
            <div class="celestial-title">${icon('star')} ${safeT('weather.celestial.starrySky')}</div>
            <div class="celestial-row"><span class="celestial-label">${safeT('weather.celestial.visibility')}</span><span class="celestial-value">${safeT('weather.celestial.' + visibilityKey)}</span></div>
        </div>
    `;
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
// YIN PITCH DETECTION — zamena autoCorrelate
// ============================================================

/**
 * YIN algoritam za detekciju pitch-a. Vraća frekvenciju u Hz ili -1.
 */
function yinPitchDetect(buffer, sampleRate, options = {}) {
    const threshold = options.threshold || 0.12;
    const minFreq = options.minFreq || 60;
    const maxFreq = options.maxFreq || 1500;

    const bufferSize = buffer.length;
    const yinBufferSize = Math.floor(bufferSize / 2);
    const yinBuffer = new Float32Array(yinBufferSize);

    // 1. Difference function
    for (let tau = 0; tau < yinBufferSize; tau++) {
        let sum = 0;
        for (let i = 0; i < yinBufferSize; i++) {
            const delta = buffer[i] - buffer[i + tau];
            sum += delta * delta;
        }
        yinBuffer[tau] = sum;
    }

    // 2. CMNDF
    yinBuffer[0] = 1;
    let runningSum = 0;
    for (let tau = 1; tau < yinBufferSize; tau++) {
        runningSum += yinBuffer[tau];
        yinBuffer[tau] *= tau / runningSum;
    }

    // 3. Apsolutni threshold
    const minTau = Math.max(2, Math.floor(sampleRate / maxFreq));
    const maxTau = Math.min(yinBufferSize - 1, Math.floor(sampleRate / minFreq));

    let tauEstimate = -1;
    for (let tau = minTau; tau < maxTau; tau++) {
        if (yinBuffer[tau] < threshold) {
            while (tau + 1 < maxTau && yinBuffer[tau + 1] < yinBuffer[tau]) {
                tau++;
            }
            tauEstimate = tau;
            break;
        }
    }

    if (tauEstimate === -1) {
        let minVal = Infinity;
        for (let tau = minTau; tau < maxTau; tau++) {
            if (yinBuffer[tau] < minVal) {
                minVal = yinBuffer[tau];
                tauEstimate = tau;
            }
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

// Median smoothing za tuner
const pitchHistory = [];
const PITCH_HISTORY_SIZE = 5;
let consecutiveOutliers = 0;

function smoothPitch(newFreq) {
    if (newFreq <= 0) return -1;

    pitchHistory.push(newFreq);
    if (pitchHistory.length > PITCH_HISTORY_SIZE) {
        pitchHistory.shift();
    }

    if (pitchHistory.length < 3) return newFreq;

    const sorted = [...pitchHistory].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];

    const deviation = Math.abs(newFreq - median) / median;
    if (deviation > 0.20) {
        consecutiveOutliers++;
        if (consecutiveOutliers < 3) {
            return median;
        }
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
// KRAJ DELA 2/4
// ============================================================// ============================================================
// ALATIKA — app.js (v4) — DEO 3/4
// PODSETNICI — kompletan sistem (8 tabova + modal + storage)
// ============================================================

// ================= PODSETNICI — Storage helperi =================
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

// ================= PODSETNICI — Date helperi =================

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

function daysToAnniversary(isoDate) {
    return daysToBirthday(isoDate);
}

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

// ================= PODSETNICI — Render funkcije =================

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
                        <option value="active">${safeT('rem.history.filter.active')}</option>
                        <option value="done">${safeT('rem.history.filter.done')}</option>
                    </select>
                    <select id="rem-history-month" class="rem-filter-select" onchange="renderRemindersHistoryList()">
                        <option value="all">${safeT('rem.history.allMonths')}</option>
                        <option value="1">Januar</option>
                        <option value="2">Februar</option>
                        <option value="3">Mart</option>
                        <option value="4">April</option>
                        <option value="5">Maj</option>
                        <option value="6">Jun</option>
                        <option value="7">Jul</option>
                        <option value="8">Avgust</option>
                        <option value="9">Septembar</option>
                        <option value="10">Oktobar</option>
                        <option value="11">Novembar</option>
                        <option value="12">Decembar</option>
                    </select>
                    <select id="rem-history-year" class="rem-filter-select" onchange="renderRemindersHistoryList()">
                        <option value="all">${safeT('rem.history.allYears')}</option>
                    </select>
                </div>
                <div class="rem-history-actions-row">
                    <button class="rem-action-mini" onclick="exportRemindersHistory()" title="${safeT('rem.history.export')}">📥 ${safeT('rem.history.export')}</button>
                </div>
            </div>
            <div id="rem-history-stats" class="rem-history-stats"></div>
            <div id="rem-history-list" class="rem-history-list"></div>
        </div>
    `;
}

function renderRemindersBirthdays() {
    return `
        <div class="converter-box">
            <div class="section-desc">${safeT('tab.podsetnici.rodjendani')}</div>
            <div id="rem-bd-list" class="rem-list"></div>
            <button class="calc-btn-main" onclick="openReminderForm('birthday')">${safeT('rem.add')}</button>
        </div>
    `;
}

function renderRemindersBills() {
    return `
        <div class="converter-box">
            <div class="section-desc">${safeT('tab.podsetnici.racuni')}</div>
            <div id="rem-bills-summary" class="rem-summary"></div>
            <div id="rem-bills-list" class="rem-list"></div>
            <button class="calc-btn-main" onclick="openReminderForm('bill')">${safeT('rem.add')}</button>
        </div>
    `;
}

function renderRemindersVehicles() {
    return `
        <div class="converter-box">
            <div class="section-desc">${safeT('rem.veh.name')}</div>
            <div id="rem-veh-list" class="rem-list"></div>
            <button class="calc-btn-main" onclick="openReminderForm('vehicle')">${safeT('rem.add')} — ${safeT('rem.veh.name')}</button>
        </div>
        <div class="converter-box">
            <div class="section-desc">${safeT('rem.doc.type')}</div>
            <div id="rem-doc-list" class="rem-list"></div>
            <button class="calc-btn-main" onclick="openReminderForm('document')">${safeT('rem.add')} — ${safeT('rem.doc.type')}</button>
        </div>
    `;
}

function renderRemindersSubscriptions() {
    return `
        <div class="converter-box">
            <div class="section-desc">${safeT('tab.podsetnici.pretplate')}</div>
            <div id="rem-subs-summary" class="rem-summary"></div>
            <div id="rem-subs-list" class="rem-list"></div>
            <button class="calc-btn-main" onclick="openReminderForm('subscription')">${safeT('rem.add')}</button>
        </div>
    `;
}

function renderRemindersMedications() {
    return `
        <div class="converter-box">
            <div class="section-desc">${safeT('tab.podsetnici.lekivi')}</div>
            <div id="rem-meds-list" class="rem-list"></div>
            <button class="calc-btn-main" onclick="openReminderForm('medication')">${safeT('rem.add')}</button>
        </div>
    `;
}

function renderRemindersAnniversaries() {
    return `
        <div class="converter-box">
            <div class="section-desc">${safeT('tab.podsetnici.godisnjice')}</div>
            <div id="rem-ann-list" class="rem-list"></div>
            <button class="calc-btn-main" onclick="openReminderForm('anniversary')">${safeT('rem.add')}</button>
        </div>
    `;
}

function renderRemindersNotes() {
    return `
        <div class="converter-box">
            <div class="section-desc">${safeT('tab.podsetnici.napomene')}</div>
            <div id="rem-notes-list" class="rem-list"></div>
            <button class="calc-btn-main" onclick="openReminderForm('note')">${safeT('rem.add')}</button>
        </div>
    `;
}

// ================= PODSETNICI — Dashboard =================

// Prikaz liste podsetnika u Istoriji (sa filterima)
function renderRemindersHistoryList() {
    const listBox = el('rem-history-list');
    const statsBox = el('rem-history-stats');
    if (!listBox) return;
    
    // Skupi sve podsetnike iz svih kategorija
    const allItems = getAllReminderItems();
    
    // Popuni godine u dropdown-u
    populateYearDropdown(allItems);
    
    // Uzmi filter vrednosti
    const searchQuery = (el('rem-history-search') ? el('rem-history-search').value : '').toLowerCase().trim();
    const statusFilter = el('rem-history-filter') ? el('rem-history-filter').value : 'all';
    const monthFilter = el('rem-history-month') ? el('rem-history-month').value : 'all';
    const yearFilter = el('rem-history-year') ? el('rem-history-year').value : 'all';
    
    // Filtriraj
    let filtered = allItems.filter(item => {
        // Status filter
        if (statusFilter === 'active' && item.isDone) return false;
        if (statusFilter === 'done' && !item.isDone) return false;
        
        // Month filter
        if (monthFilter !== 'all') {
            const itemMonth = item.dueDate ? new Date(item.dueDate).getMonth() + 1 : null;
            if (itemMonth !== parseInt(monthFilter)) return false;
        }
        
        // Year filter
        if (yearFilter !== 'all') {
            const itemYear = item.dueDate ? new Date(item.dueDate).getFullYear() : null;
            if (itemYear !== parseInt(yearFilter)) return false;
        }
        
        // Search filter
        if (searchQuery) {
            const name = (item.title || '').toLowerCase();
            const desc = (item.subtitle || '').toLowerCase();
            if (!name.includes(searchQuery) && !desc.includes(searchQuery)) return false;
        }
        
        return true;
    });
    
    // Sortiraj po datumu (najbliži prvi, završeni na dnu)
    filtered.sort((a, b) => {
        if (a.isDone !== b.isDone) return a.isDone ? 1 : -1;
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
    });
    
    // Statistika
    if (statsBox) {
        const totalActive = allItems.filter(i => !i.isDone).length;
        const totalDone = allItems.filter(i => i.isDone).length;
        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();
        const doneThisMonth = allItems.filter(i => {
            if (!i.isDone || !i.dueDate) return false;
            const d = new Date(i.dueDate);
            return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        }).length;
        
        statsBox.innerHTML = `
            <div class="rem-stat-item">
                <div class="rem-stat-value">${totalActive}</div>
                <div class="rem-stat-label">${safeT('rem.history.stats.active')}</div>
            </div>
            <div class="rem-stat-item">
                <div class="rem-stat-value">${totalDone}</div>
                <div class="rem-stat-label">${safeT('rem.history.stats.done')}</div>
            </div>
            <div class="rem-stat-item">
                <div class="rem-stat-value">${doneThisMonth}</div>
                <div class="rem-stat-label">${safeT('rem.history.stats.thisMonth')}</div>
            </div>
        `;
    }
    
    // Prikaz liste
    if (filtered.length === 0) {
        listBox.innerHTML = `<div class="rem-history-empty">${searchQuery || statusFilter !== 'all' || monthFilter !== 'all' || yearFilter !== 'all' ? safeT('rem.history.empty.filter') : safeT('rem.history.empty')}</div>`;
        return;
    }
    
    listBox.innerHTML = filtered.map(item => renderHistoryItem(item)).join('');
}

// Skupi sve podsetnike iz svih kategorija
function getAllReminderItems() {
    const items = [];
    
    // Rođendani
    loadReminders('cx_birthdays').forEach(b => {
        items.push({
            id: b.id,
            type: 'birthday',
            category: 'birthdays',
            title: b.name || 'Rođendan',
            subtitle: b.note || '',
            dueDate: b.date,
            isDone: !!b.done,
            icon: 'cake',
            color: '#ec4899',
            raw: b
        });
    });
    
    // Računi
    loadReminders('cx_bills').forEach(b => {
        items.push({
            id: b.id,
            type: 'bill',
            category: 'bills',
            title: b.name || 'Račun',
            subtitle: (b.amount ? b.amount + ' ' + (b.currency || 'RSD') : ''),
            dueDate: null,
            isDone: !!b.paid,
            icon: 'receipt',
            color: '#10b981',
            raw: b
        });
    });
    
    // Vozila
    loadReminders('cx_vehicles').forEach(v => {
        if (v.regDate) items.push({
            id: v.id + '-reg',
            type: 'vehicle-reg',
            category: 'vehicles',
            title: (v.name || 'Vozilo') + ' — Registracija',
            subtitle: v.plate || '',
            dueDate: v.regDate,
            isDone: !!v.done,
            icon: 'car',
            color: '#f43f5e',
            raw: v
        });
        if (v.techDate) items.push({
            id: v.id + '-tech',
            type: 'vehicle-tech',
            category: 'vehicles',
            title: (v.name || 'Vozilo') + ' — Tehnički',
            subtitle: v.plate || '',
            dueDate: v.techDate,
            isDone: !!v.done,
            icon: 'wrench',
            color: '#f43f5e',
            raw: v
        });
    });
    
    // Dokumenti
    loadReminders('cx_documents').forEach(d => {
        items.push({
            id: d.id,
            type: 'document',
            category: 'documents',
            title: d.name || 'Dokument',
            subtitle: '',
            dueDate: d.expires,
            isDone: !!d.done,
            icon: 'clipboard',
            color: '#8b5cf6',
            raw: d
        });
    });
    
    // Pretplate
    loadReminders('cx_subscriptions').forEach(s => {
        items.push({
            id: s.id,
            type: 'subscription',
            category: 'subscriptions',
            title: s.name || 'Pretplata',
            subtitle: (s.amount ? s.amount + ' ' + (s.currency || 'RSD') : ''),
            dueDate: null,
            isDone: !s.active,
            icon: 'creditCard',
            color: '#14b8a6',
            raw: s
        });
    });
    
    // Lekovi
    loadReminders('cx_medications').forEach(m => {
        items.push({
            id: m.id,
            type: 'medication',
            category: 'medications',
            title: m.name || 'Lek',
            subtitle: m.dose || '',
            dueDate: m.endDate,
            isDone: !!m.done,
            icon: 'heartPulse',
            color: '#ec4899',
            raw: m
        });
    });
    
    // Godišnjice
    loadReminders('cx_anniversaries').forEach(a => {
        items.push({
            id: a.id,
            type: 'anniversary',
            category: 'anniversaries',
            title: a.name || 'Godišnjica',
            subtitle: a.note || '',
            dueDate: a.date,
            isDone: !!a.done,
            icon: 'gift',
            color: '#a855f7',
            raw: a
        });
    });
    
    // Napomene
    loadReminders('cx_notes').forEach(n => {
        items.push({
            id: n.id,
            type: 'note',
            category: 'notes',
            title: n.title || 'Napomena',
            subtitle: n.description || '',
            dueDate: n.dueDate,
            isDone: !!n.done,
            icon: 'clipboard',
            color: '#f59e0b',
            raw: n
        });
    });
    
    return items;
}
// Popuni dropdown za godine
function populateYearDropdown(items) {
    const yearSelect = el('rem-history-year');
    if (!yearSelect) return;
    const currentValue = yearSelect.value;
    
    const years = new Set();
    const currentYear = new Date().getFullYear();
    
    // Dodaj trenutnu godinu + sledećih 20 godina (2026-2046)
    for (let i = 0; i <= 20; i++) {
        years.add(currentYear + i);
    }
    
    // Dodaj godine iz postojećih podsetnika SAMO ako su >= 2020
    items.forEach(item => {
        if (item.dueDate) {
            const year = new Date(item.dueDate).getFullYear();
            if (!isNaN(year) && year >= 2020) years.add(year);
        }
    });
    
    // Sortiraj RASTUĆE (2026, 2027, 2028...)
    const sortedYears = Array.from(years).sort((a, b) => a - b);
    
    yearSelect.innerHTML = `<option value="all">${safeT('rem.history.allYears')}</option>` +
        sortedYears.map(y => `<option value="${y}">${y}</option>`).join('');
    
    if (currentValue && yearSelect.querySelector(`option[value="${currentValue}"]`)) {
        yearSelect.value = currentValue;
    }
}

// Prikaz jednog podsetnika u istoriji
function renderHistoryItem(item) {
    const days = item.dueDate ? daysUntilDate(item.dueDate) : null;
    const daysTxt = days !== null ? formatDaysToHuman(days) : '';
    const color = days !== null ? urgencyColor(days) : item.color;
    
    const doneClass = item.isDone ? ' rem-item-done' : '';
    
    return `
        <div class="rem-history-item${doneClass}" style="--rem-color: ${color};">
            <div class="rem-history-icon">${icon(item.icon)}</div>
            <div class="rem-history-body">
                <div class="rem-history-title">${escapeHtml(item.title)}</div>
                ${item.subtitle ? `<div class="rem-history-sub">${escapeHtml(item.subtitle)}</div>` : ''}
                ${item.dueDate ? `<div class="rem-history-date">📅 ${escapeHtml(item.dueDate)}${daysTxt ? ' • ' + escapeHtml(daysTxt) : ''}</div>` : ''}
            </div>
                        <div class="rem-history-actions">
                <button class="rem-action-btn rem-action-edit" onclick="editReminderFromHistory('${item.type}', '${item.category}', '${item.id}')" title="${safeT('rem.history.edit')}">${icon('edit')}</button>
                <button class="rem-action-btn rem-action-share" onclick="shareReminderFromHistory('${item.type}', '${item.category}', '${item.id}')" title="${safeT('rem.history.share')}">${icon('share')}</button>
                <button class="rem-action-btn rem-action-toggle ${item.isDone ? 'is-done' : ''}" onclick="toggleDoneFromHistory('${item.type}', '${item.category}', '${item.id}')" title="${item.isDone ? safeT('rem.history.markActive') : safeT('rem.history.markDone')}">${item.isDone ? icon('refresh') : icon('check')}</button>
                <button class="rem-action-btn rem-action-delete" onclick="deleteFromHistory('${item.type}', '${item.category}', '${item.id}')" title="${safeT('rem.history.delete')}">${icon('trash')}</button>
            </div>
        </div>
    `;
}

// Pomoćna funkcija — mapiranje type → storage key
function getReminderStorageKey(type) {
    const map = {
        'birthday': 'cx_birthdays',
        'bill': 'cx_bills',
        'vehicle-reg': 'cx_vehicles',
        'vehicle-tech': 'cx_vehicles',
        'document': 'cx_documents',
        'subscription': 'cx_subscriptions',
        'medication': 'cx_medications',
        'anniversary': 'cx_anniversaries',
        'note': 'cx_notes'
    };
    return map[type] || null;
}

// Uredi podsetnik iz istorije
function editReminderFromHistory(type, category, id) {
    const key = getReminderStorageKey(type);
    if (!key) { showToast('Nepoznat tip', 'error'); return; }
    
    // Za vozila — ID može biti "voziloId-reg" ili "voziloId-tech"
    let realId = id;
    if (type === 'vehicle-reg' || type === 'vehicle-tech') {
        realId = id.replace('-reg', '').replace('-tech', '');
    }
    
    const item = loadReminders(key).find(x => String(x.id) === String(realId));
    if (!item) { showToast('Podsetnik nije pronađen', 'error'); return; }
    
    // Mapiranje type → forma tip
    const typeMap = {
        'birthday': 'birthday',
        'bill': 'bill',
        'vehicle-reg': 'vehicle',
        'vehicle-tech': 'vehicle',
        'document': 'document',
        'subscription': 'subscription',
        'medication': 'medication',
        'anniversary': 'anniversary',
        'note': 'note'
    };
    
    const formType = typeMap[type];
    if (formType && typeof openReminderForm === 'function') {
        openReminderForm(formType, item);
    }
}

// Podeli podsetnik preko Web Share API
async function shareReminderFromHistory(type, category, id) {
    const key = getReminderStorageKey(type);
    if (!key) return;
    
    let realId = id;
    if (type === 'vehicle-reg' || type === 'vehicle-tech') {
        realId = id.replace('-reg', '').replace('-tech', '');
    }
    
    const item = loadReminders(key).find(x => String(x.id) === String(realId));
    if (!item) return;
    
    // Napravi tekst za deljenje
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
    
    // Web Share API
    if (navigator.share) {
        try {
            await navigator.share({
                title: title,
                text: text
            });
            vibrate(20);
        } catch (e) {
            // Korisnik je otkazao share — ne prikazuj grešku
        }
    } else {
        // Fallback — kopiraj u clipboard
        fallbackCopy(text, () => {
            showToast('Kopirano u clipboard', 'success', 2000);
        });
    }
}

// Označi kao završeno / vrati u aktivne
function toggleDoneFromHistory(type, category, id) {
    const key = getReminderStorageKey(type);
    if (!key) { showToast('Nepoznat tip', 'error'); return; }
    
    let realId = id;
    if (type === 'vehicle-reg' || type === 'vehicle-tech') {
        realId = id.replace('-reg', '').replace('-tech', '');
    }
    
    const list = loadReminders(key);
    const idx = list.findIndex(x => String(x.id) === String(realId));
    if (idx === -1) { showToast('Podsetnik nije pronađen', 'error'); return; }
    
    const item = list[idx];
    
    // Toggle završeno — po tipu
    if (type === 'bill') {
        item.paid = !item.paid;
    } else if (type === 'subscription') {
        item.active = !item.active;
    } else if (type === 'note') {
        item.done = !item.done;
    } else {
        // Za sve ostale tipove (birthday, vehicle, document, medication, anniversary)
        item.done = !item.done;
    }
    
    saveReminders(key, list);
    
    // Odredi novi status
    let isNowDone = false;
    if (type === 'bill') isNowDone = item.paid;
    else if (type === 'subscription') isNowDone = !item.active;
    else isNowDone = !!item.done;
    
    showToast(isNowDone ? 'Označeno kao završeno' : 'Vraćeno u aktivne', 'success', 1500);
    vibrate(20);
    playTick(0, 1500, 0.08, 0.03);
    
    // Osveži listu
    renderRemindersHistoryList();
    updateAppBadge();
}

// Obriši podsetnik iz istorije
async function deleteFromHistory(type, category, id) {
    const key = getReminderStorageKey(type);
    if (!key) return;
    
    const ok = await showConfirm(safeT('confirm.rem.delete'));
    if (!ok) return;
    
    let realId = id;
    if (type === 'vehicle-reg' || type === 'vehicle-tech') {
        realId = id.replace('-reg', '').replace('-tech', '');
    }
    
    let list = loadReminders(key);
    list = list.filter(x => String(x.id) !== String(realId));
    saveReminders(key, list);
    
    showToast(safeT('toast.rem.deleted'), 'info', 1500);
    vibrate(15);
    
    // Osveži listu
    renderRemindersHistoryList();
    updateAppBadge();
}

// Export istorije u tekst fajl
function exportRemindersHistory() {
    const allItems = getAllReminderItems();
    if (!allItems.length) {
        showToast(safeT('rem.history.empty'), 'info');
        return;
    }
    
    const lines = ['=== ISTORIJA PODSETNIKA ===', 'Datum izvoza: ' + new Date().toLocaleString('sr-RS'), ''];
    
    // Aktivni
    const active = allItems.filter(i => !i.isDone).sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
    });
    if (active.length) {
        lines.push('--- AKTIVNI (' + active.length + ') ---');
        active.forEach(item => {
            lines.push('• ' + (item.title || ''));
            if (item.subtitle) lines.push('  ' + item.subtitle);
            if (item.dueDate) lines.push('  Rok: ' + item.dueDate);
            lines.push('');
        });
    }
    
    // Završeni
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
    
    // Preuzmi kao fajl
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'alatika-podsetnici-' + new Date().toISOString().slice(0, 10) + '.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Fajl preuzet', 'success', 2000);
    vibrate(20);
}

function renderRemindersDashboard() {
    const box = el('rem-dashboard-content');
    if (!box) return;

    const items = [];

    // Rođendani
    const birthdays = loadReminders('cx_birthdays');
    birthdays.forEach(b => {
        const days = daysToBirthday(b.date);
        if (days !== null) items.push({
            type: 'bd', icon: 'cake', color: '#ec4899',
            title: b.name || safeT('tab.podsetnici.rodjendani'),
            subtitle: safeT('rem.bd.daysTo'),
            days, ref: b
        });
    });

    // Računi (neplaćeni)
    const bills = loadReminders('cx_bills');
    bills.forEach(b => {
        if (b.paid) return;
        const days = daysToBillDay(b.dayOfMonth);
        if (days !== null) items.push({
            type: 'bill', icon: b.icon || 'receipt', color: '#10b981',
            title: b.name || safeT('tab.podsetnici.racuni'),
            subtitle: (b.amount ? b.amount + ' ' + (b.currency || 'RSD') : safeT('rem.bill.daysTo')),
            days, ref: b
        });
    });

    // Vozila
    const vehicles = loadReminders('cx_vehicles');
    vehicles.forEach(v => {
        [
            ['regDate', safeT('rem.veh.regDate')],
            ['techDate', safeT('rem.veh.techDate')],
            ['insuranceDate', safeT('rem.veh.insuranceDate')]
        ].forEach(([field, label]) => {
            if (!v[field]) return;
            const days = daysUntilDate(v[field]);
            if (days !== null) items.push({
                type: 'veh', icon: 'car', color: '#f43f5e',
                title: (v.name || 'Vozilo') + ' — ' + label,
                subtitle: v.plate || '',
                days, ref: v
            });
        });
    });

    // Dokumenti
    const docs = loadReminders('cx_documents');
    docs.forEach(d => {
        const days = daysUntilDate(d.expires);
        if (days !== null) items.push({
            type: 'doc', icon: 'clipboard', color: '#8b5cf6',
            title: d.name || safeT('rem.doc.type'),
            subtitle: safeT('rem.doc.expires'),
            days, ref: d
        });
    });

    // Pretplate
    const subs = loadReminders('cx_subscriptions');
    subs.forEach(s => {
        if (!s.active) return;
        const days = daysToBillDay(s.dayOfMonth);
        if (days !== null) items.push({
            type: 'sub', icon: 'creditCard', color: '#14b8a6',
            title: s.name || safeT('tab.podsetnici.pretplate'),
            subtitle: (s.amount ? s.amount + ' ' + (s.currency || 'RSD') : ''),
            days, ref: s
        });
    });

    // Lekovi
    const meds = loadReminders('cx_medications');
    meds.forEach(m => {
        if (!m.endDate) return;
        const days = daysUntilDate(m.endDate);
        if (days !== null && days >= -1) items.push({
            type: 'med', icon: 'heartPulse', color: '#ec4899',
            title: m.name || safeT('tab.podsetnici.lekivi'),
            subtitle: (m.dose || '') + (m.remaining ? ' • ' + m.remaining + ' ' + safeT('rem.med.remaining') : ''),
            days, ref: m
        });
    });

    // Godišnjice
    const anns = loadReminders('cx_anniversaries');
    anns.forEach(a => {
        const days = daysToAnniversary(a.date);
        if (days !== null) items.push({
            type: 'ann', icon: 'gift', color: '#a855f7',
            title: a.name || safeT('tab.podsetnici.godisnjice'),
            subtitle: safeT('rem.ann.daysTo'),
            days, ref: a
        });
    });

    // Napomene
    const notes = loadReminders('cx_notes');
    notes.forEach(n => {
        if (n.done) return;
        if (!n.dueDate) return;
        const days = daysUntilDate(n.dueDate);
        if (days !== null) items.push({
            type: 'note', icon: 'clipboard', color: '#f59e0b',
            title: n.title || safeT('tab.podsetnici.napomene'),
            subtitle: safeT('rem.note.dueDate'),
            days, ref: n
        });
    });

    // Sortiraj po hitnosti
    items.sort((a, b) => a.days - b.days);

    const urgent = items.filter(i => i.days <= 7);
    const soon = items.filter(i => i.days > 7 && i.days <= 30);
    const later = items.filter(i => i.days > 30);

    let html = '';

    if (items.length === 0) {
        html = `<div class="rem-empty">
            <div class="rem-empty-icon">✓</div>
            <p>${safeT('rem.dashboard.empty')}</p>
        </div>`;
    } else {
        if (urgent.length) {
            html += `<div class="rem-group">
                <div class="rem-group-title rem-urgent">
                    <span class="rem-dot" style="background:#f43f5e;"></span>
                    ${safeT('rem.dashboard.urgent')} <span class="rem-count">${urgent.length}</span>
                </div>
                ${urgent.map(i => renderDashboardItem(i)).join('')}
            </div>`;
        }
        if (soon.length) {
            html += `<div class="rem-group">
                <div class="rem-group-title rem-soon">
                    <span class="rem-dot" style="background:#f59e0b;"></span>
                    ${safeT('rem.dashboard.soon')} <span class="rem-count">${soon.length}</span>
                </div>
                ${soon.map(i => renderDashboardItem(i)).join('')}
            </div>`;
        }
        if (later.length) {
            html += `<div class="rem-group">
                <div class="rem-group-title rem-later">
                    <span class="rem-dot" style="background:#10b981;"></span>
                    ${safeT('rem.dashboard.later')} <span class="rem-count">${later.length}</span>
                </div>
                ${later.map(i => renderDashboardItem(i)).join('')}
            </div>`;
        }
    }

    box.innerHTML = html;
}

function renderDashboardItem(item) {
    const color = urgencyColor(item.days);
    const daysTxt = formatDaysToHuman(item.days);
    const iconSvg = icon(item.icon);
    return `
        <div class="rem-card rem-${urgencyClass(item.days)}" style="--rem-accent: ${color};">
            <div class="rem-card-icon">${iconSvg}</div>
            <div class="rem-card-body">
                <div class="rem-card-title">${escapeHtml(item.title)}</div>
                <div class="rem-card-sub">${escapeHtml(item.subtitle || '')}</div>
            </div>
            <div class="rem-card-days" style="color:${color};">${daysTxt}</div>
        </div>
    `;
}

// ================= PODSETNICI — Modal forma =================

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
    try { history.pushState({ modal: 'reminder' }, '', ''); } catch (e) {}

    if (editItem) {
        fillReminderForm(type, editItem);
    }
}

function buildReminderForm(type, item) {
    const forms = {
        birthday: () => `
            ${inputFieldText('rem.bd.name', 'rem-bd-name', safeT('placeholder.name'))}
            ${dateTripleField('rem.bd.date', 'rem-bd-date')}
            ${inputField('rem.bd.remindBefore', 'rem-bd-remind', safeT('rem.days'), 'value="3"')}
            <div class="input-field">
                <label>${safeT('rem.bd.favorite')}</label>
                <label class="rem-check"><input type="checkbox" id="rem-bd-fav"><span></span></label>
            </div>
            ${inputFieldText('rem.bd.note', 'rem-bd-note', '')}
        `,
        bill: () => `
            ${inputFieldText('rem.bill.name', 'rem-bill-name', 'npr. Struja')}
            ${inputField('rem.bill.amount', 'rem-bill-amount', 'RSD', 'placeholder="3000"')}
            ${selectField('rem.bill.period', 'rem-bill-period', [
                { value: 'monthly', text: safeT('rem.bill.period.monthly') },
                { value: 'quarterly', text: safeT('rem.bill.period.quarterly') },
                { value: 'yearly', text: safeT('rem.bill.period.yearly') },
                { value: 'onetime', text: safeT('rem.bill.period.onetime') }
            ], 'monthly')}
            ${inputField('rem.bill.dayOfMonth', 'rem-bill-day', '', 'value="1" min="1" max="31"')}
            ${inputField('rem.bill.reminder', 'rem-bill-remind', safeT('rem.days'), 'value="3"')}
            <div class="input-field">
                <label>${safeT('rem.bill.paid')}</label>
                <label class="rem-check"><input type="checkbox" id="rem-bill-paid"><span></span></label>
            </div>
        `,
        vehicle: () => `
            ${inputFieldText('rem.veh.name', 'rem-veh-name', 'npr. Golf 7')}
            ${inputFieldText('rem.veh.plate', 'rem-veh-plate', 'npr. NP123-AB')}
            ${dateTripleField('rem.veh.regDate', 'rem-veh-reg')}
            ${dateTripleField('rem.veh.techDate', 'rem-veh-tech')}
            ${dateTripleField('rem.veh.insuranceDate', 'rem-veh-ins')}
            ${inputFieldText('rem.veh.note', 'rem-veh-note', '')}
        `,
        document: () => `
            ${selectField('rem.doc.type', 'rem-doc-type', [
                { value: 'lk', text: safeT('rem.doc.type.lk') },
                { value: 'passport', text: safeT('rem.doc.type.passport') },
                { value: 'drivers', text: safeT('rem.doc.type.drivers') },
                { value: 'health', text: safeT('rem.doc.type.health') },
                { value: 'custom', text: safeT('rem.doc.type.custom') }
            ])}
            ${inputFieldText('rem.doc.name', 'rem-doc-name', '')}
            ${dateTripleField('rem.doc.expires', 'rem-doc-exp')}
            ${inputFieldText('rem.doc.note', 'rem-doc-note', '')}
        `,
        subscription: () => `
            ${inputFieldText('rem.sub.name', 'rem-sub-name', 'npr. Netflix')}
            ${inputField('rem.sub.amount', 'rem-sub-amount', 'RSD', 'placeholder="999"')}
            ${inputField('rem.sub.dayOfMonth', 'rem-sub-day', '', 'value="1" min="1" max="31"')}
            ${selectField('rem.sub.period', 'rem-sub-period', [
                { value: 'monthly', text: safeT('rem.bill.period.monthly') },
                { value: 'yearly', text: safeT('rem.bill.period.yearly') }
            ], 'monthly')}
            <div class="input-field">
                <label>${safeT('rem.sub.active')}</label>
                <label class="rem-check"><input type="checkbox" id="rem-sub-active" checked><span></span></label>
            </div>
        `,
        medication: () => `
            ${inputFieldText('rem.med.name', 'rem-med-name', 'npr. Aspirin')}
            ${inputFieldText('rem.med.dose', 'rem-med-dose', 'npr. 100mg')}
            ${selectField('rem.med.time', 'rem-med-time', [
                { value: 'morning', text: safeT('rem.med.time.morning') },
                { value: 'noon', text: safeT('rem.med.time.noon') },
                { value: 'evening', text: safeT('rem.med.time.evening') }
            ], 'morning')}
            ${selectField('rem.med.frequency', 'rem-med-freq', [
                { value: 'daily', text: safeT('rem.med.freq.daily') },
                { value: 'everyOther', text: safeT('rem.med.freq.everyOther') },
                { value: 'weekly', text: safeT('rem.med.freq.weekly') }
            ], 'daily')}
            ${dateTripleField('rem.med.startDate', 'rem-med-start')}
            ${dateTripleField('rem.med.endDate', 'rem-med-end')}
            ${inputField('rem.med.remaining', 'rem-med-remaining', '', 'placeholder="30"')}
            ${inputFieldText('rem.med.note', 'rem-med-note', '')}
        `,
        anniversary: () => `
            ${inputFieldText('rem.ann.name', 'rem-ann-name', '')}
            ${dateTripleField('rem.ann.date', 'rem-ann-date')}
            ${inputField('rem.ann.remindBefore', 'rem-ann-remind', safeT('rem.days'), 'value="3"')}
            <div class="input-field">
                <label>${safeT('rem.ann.favorite')}</label>
                <label class="rem-check"><input type="checkbox" id="rem-ann-fav"><span></span></label>
            </div>
            ${inputFieldText('rem.ann.note', 'rem-ann-note', '')}
        `,
        note: () => `
            ${inputFieldText('rem.note.title', 'rem-note-title', '')}
            <div class="input-field">
                <label>${safeT('rem.note.description')}</label>
                <textarea id="rem-note-desc" class="custom-input rem-textarea" rows="4"></textarea>
            </div>
            ${dateTripleField('rem.note.dueDate', 'rem-note-due')}
            ${selectField('rem.note.priority', 'rem-note-priority', [
                { value: 'high', text: safeT('rem.priority.high') },
                { value: 'medium', text: safeT('rem.priority.medium') },
                { value: 'low', text: safeT('rem.priority.low') }
            ], 'medium')}
            <div class="input-field">
                <label>${safeT('rem.note.done')}</label>
                <label class="rem-check"><input type="checkbox" id="rem-note-done"><span></span></label>
            </div>
        `
    };

    const fn = forms[type];
    const html = fn ? fn() : '<p>Nepoznat tip</p>';

    return `
        <div class="reminder-form-inner">
            ${html}
            <div class="rem-form-actions">
                <button class="calc-btn-main" onclick="saveReminderForm()">${safeT('rem.save')}</button>
                ${item ? `<button class="rem-delete-btn" onclick="confirmDeleteReminder()">${safeT('rem.delete')}</button>` : ''}
            </div>
        </div>
    `;
}

function fillReminderForm(type, item) {
    setTimeout(() => {
        const setV = (id, v) => { const e = el(id); if (e) e.value = v == null ? '' : v; };
        const setC = (id, v) => { const e = el(id); if (e) e.checked = !!v; };
        const setD = (id, v) => { if (v) setTripleDate(id, v); };

        switch (type) {
            case 'birthday':
                setV('rem-bd-name', item.name);
                setD('rem-bd-date', item.date);
                setV('rem-bd-remind', item.remindBefore || 3);
                setC('rem-bd-fav', item.favorite);
                setV('rem-bd-note', item.note);
                break;
            case 'bill':
                setV('rem-bill-name', item.name);
                setV('rem-bill-amount', item.amount);
                setV('rem-bill-period', item.period || 'monthly');
                setV('rem-bill-day', item.dayOfMonth || 1);
                setV('rem-bill-remind', item.remindBefore || 3);
                setC('rem-bill-paid', item.paid);
                break;
            case 'vehicle':
                setV('rem-veh-name', item.name);
                setV('rem-veh-plate', item.plate);
                setD('rem-veh-reg', item.regDate);
                setD('rem-veh-tech', item.techDate);
                setD('rem-veh-ins', item.insuranceDate);
                setV('rem-veh-note', item.note);
                break;
            case 'document':
                setV('rem-doc-type', item.type || 'lk');
                setV('rem-doc-name', item.name);
                setD('rem-doc-exp', item.expires);
                setV('rem-doc-note', item.note);
                break;
            case 'subscription':
                setV('rem-sub-name', item.name);
                setV('rem-sub-amount', item.amount);
                setV('rem-sub-day', item.dayOfMonth || 1);
                setV('rem-sub-period', item.period || 'monthly');
                setC('rem-sub-active', item.active);
                break;
            case 'medication':
                setV('rem-med-name', item.name);
                setV('rem-med-dose', item.dose);
                setV('rem-med-time', item.time || 'morning');
                setV('rem-med-freq', item.frequency || 'daily');
                setD('rem-med-start', item.startDate);
                setD('rem-med-end', item.endDate);
                setV('rem-med-remaining', item.remaining);
                setV('rem-med-note', item.note);
                break;
            case 'anniversary':
                setV('rem-ann-name', item.name);
                setD('rem-ann-date', item.date);
                setV('rem-ann-remind', item.remindBefore || 3);
                setC('rem-ann-fav', item.favorite);
                setV('rem-ann-note', item.note);
                break;
            case 'note':
                setV('rem-note-title', item.title);
                setV('rem-note-desc', item.description);
                setD('rem-note-due', item.dueDate);
                setV('rem-note-priority', item.priority || 'medium');
                setC('rem-note-done', item.done);
                break;
        }
    }, 100);
}

function saveReminderForm() {
    const type = currentReminderType;
    if (!type) return;

    const typeToKey = {
        birthday: REMINDER_KEYS.birthdays,
        bill: REMINDER_KEYS.bills,
        vehicle: REMINDER_KEYS.vehicles,
        document: REMINDER_KEYS.documents,
        subscription: REMINDER_KEYS.subscriptions,
        medication: REMINDER_KEYS.medications,
        anniversary: REMINDER_KEYS.anniversaries,
        note: REMINDER_KEYS.notes
    };
    const key = typeToKey[type];
    if (!key) return;

    const v = id => { const e = el(id); return e ? e.value.trim() : ''; };
    const n = id => { const e = el(id); return e ? parseNum(e.value) : null; };
    const c = id => { const e = el(id); return e ? e.checked : false; };

    let data = {};

    switch (type) {
        case 'birthday': {
            const name = v('rem-bd-name');
            const date = getTripleDate('rem-bd-date');
            if (!name) { showToast(safeT('toast.rem.error.name'), 'error'); return; }
            if (!date) { showToast(safeT('toast.rem.error.date'), 'error'); return; }
            data = {
                name, date,
                remindBefore: n('rem-bd-remind') || 3,
                favorite: c('rem-bd-fav'),
                note: v('rem-bd-note')
            };
            break;
        }
        case 'bill': {
            const name = v('rem-bill-name');
            const amount = n('rem-bill-amount');
            if (!name) { showToast(safeT('toast.rem.error.name'), 'error'); return; }
            data = {
                name, amount: amount || 0,
                period: v('rem-bill-period') || 'monthly',
                dayOfMonth: n('rem-bill-day') || 1,
                remindBefore: n('rem-bill-remind') || 3,
                paid: c('rem-bill-paid')
            };
            break;
        }
        case 'vehicle': {
            const name = v('rem-veh-name');
            if (!name) { showToast(safeT('toast.rem.error.name'), 'error'); return; }
            data = {
                name, plate: v('rem-veh-plate'),
                regDate: getTripleDate('rem-veh-reg'),
                techDate: getTripleDate('rem-veh-tech'),
                insuranceDate: getTripleDate('rem-veh-ins'),
                note: v('rem-veh-note')
            };
            break;
        }
        case 'document': {
            const docType = v('rem-doc-type') || 'lk';
            data = {
                type: docType,
                name: v('rem-doc-name') || safeT('rem.doc.type.' + docType),
                expires: getTripleDate('rem-doc-exp'),
                note: v('rem-doc-note')
            };
            if (!data.expires) { showToast(safeT('toast.rem.error.date'), 'error'); return; }
            break;
        }
        case 'subscription': {
            const name = v('rem-sub-name');
            if (!name) { showToast(safeT('toast.rem.error.name'), 'error'); return; }
            data = {
                name, amount: n('rem-sub-amount') || 0,
                dayOfMonth: n('rem-sub-day') || 1,
                period: v('rem-sub-period') || 'monthly',
                active: c('rem-sub-active')
            };
            break;
        }
        case 'medication': {
            const name = v('rem-med-name');
            if (!name) { showToast(safeT('toast.rem.error.name'), 'error'); return; }
            data = {
                name, dose: v('rem-med-dose'),
                time: v('rem-med-time') || 'morning',
                frequency: v('rem-med-freq') || 'daily',
                startDate: getTripleDate('rem-med-start'),
                endDate: getTripleDate('rem-med-end'),
                remaining: n('rem-med-remaining') || 0,
                note: v('rem-med-note')
            };
            break;
        }
        case 'anniversary': {
            const name = v('rem-ann-name');
            const date = getTripleDate('rem-ann-date');
            if (!name) { showToast(safeT('toast.rem.error.name'), 'error'); return; }
            if (!date) { showToast(safeT('toast.rem.error.date'), 'error'); return; }
            data = {
                name, date,
                remindBefore: n('rem-ann-remind') || 3,
                favorite: c('rem-ann-fav'),
                note: v('rem-ann-note')
            };
            break;
        }
        case 'note': {
            const title = v('rem-note-title');
            if (!title) { showToast(safeT('toast.rem.error.name'), 'error'); return; }
            data = {
                title, description: v('rem-note-desc'),
                dueDate: getTripleDate('rem-note-due'),
                priority: v('rem-note-priority') || 'medium',
                done: c('rem-note-done')
            };
            break;
        }
    }

    if (currentReminderEditId) {
        updateReminder(key, currentReminderEditId, data);
    } else {
        addReminder(key, data);
    }

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
        birthday: REMINDER_KEYS.birthdays,
        bill: REMINDER_KEYS.bills,
        vehicle: REMINDER_KEYS.vehicles,
        document: REMINDER_KEYS.documents,
        subscription: REMINDER_KEYS.subscriptions,
        medication: REMINDER_KEYS.medications,
        anniversary: REMINDER_KEYS.anniversaries,
        note: REMINDER_KEYS.notes
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

// ================= PODSETNICI — Render liste po tipu =================

function renderReminderList(type) {
    const typeToKey = {
        birthday: REMINDER_KEYS.birthdays,
        bill: REMINDER_KEYS.bills,
        vehicle: REMINDER_KEYS.vehicles,
        document: REMINDER_KEYS.documents,
        subscription: REMINDER_KEYS.subscriptions,
        medication: REMINDER_KEYS.medications,
        anniversary: REMINDER_KEYS.anniversaries,
        note: REMINDER_KEYS.notes
    };
    const key = typeToKey[type];
    if (!key) return;

    const listId = {
        birthday: 'rem-bd-list',
        bill: 'rem-bills-list',
        vehicle: 'rem-veh-list',
        document: 'rem-doc-list',
        subscription: 'rem-subs-list',
        medication: 'rem-meds-list',
        anniversary: 'rem-ann-list',
        note: 'rem-notes-list'
    }[type];

    const list = el(listId);
    if (!list) return;

    const items = loadReminders(key);

    if (items.length === 0) {
        list.innerHTML = `<div class="rem-empty-small">${safeT('rem.empty')}</div>`;
    } else {
        list.innerHTML = items.map(item => renderReminderItem(type, item)).join('');
    }

    if (type === 'bill') renderBillsSummary();
    if (type === 'subscription') renderSubsSummary();
}

function renderReminderItem(type, item) {
    let title = '', subtitle = '', days = null, accent = '#f59e0b';

    switch (type) {
        case 'birthday':
            title = item.name;
            days = daysToBirthday(item.date);
            subtitle = formatDaysToHuman(days);
            accent = urgencyColor(days);
            break;
        case 'bill': {
            title = item.name;
            days = item.paid ? null : daysToBillDay(item.dayOfMonth);
            subtitle = `${item.amount || 0} ${item.currency || 'RSD'} • ${item.paid ? safeT('rem.paid') : formatDaysToHuman(days)}`;
            accent = item.paid ? '#10b981' : urgencyColor(days);
            break;
        }
        case 'vehicle': {
            title = item.name + (item.plate ? ' (' + item.plate + ')' : '');
            const dates = [
                { d: item.regDate, l: safeT('rem.veh.regDate') },
                { d: item.techDate, l: safeT('rem.veh.techDate') },
                { d: item.insuranceDate, l: safeT('rem.veh.insuranceDate') }
            ].filter(x => x.d);
            if (dates.length) {
                const min = dates.reduce((a, b) => {
                    const da = daysUntilDate(a.d);
                    const db = daysUntilDate(b.d);
                    return (db !== null && (da === null || db < da)) ? b : a;
                });
                days = daysUntilDate(min.d);
                subtitle = min.l + ' • ' + formatDaysToHuman(days);
                accent = urgencyColor(days);
            }
            break;
        }
        case 'document':
            title = item.name || item.type;
            days = daysUntilDate(item.expires);
            subtitle = safeT('rem.doc.expires') + ' • ' + formatDaysToHuman(days);
            accent = urgencyColor(days);
            break;
        case 'subscription':
            title = item.name;
            days = item.active ? daysToBillDay(item.dayOfMonth) : null;
            subtitle = `${item.amount || 0} ${item.currency || 'RSD'} • ${item.active ? safeT('rem.active') : safeT('rem.inactive')}`;
            accent = item.active ? urgencyColor(days) : '#6b7280';
            break;
        case 'medication':
            title = item.name + (item.dose ? ' — ' + item.dose : '');
            days = daysUntilDate(item.endDate);
            subtitle = `${safeT('rem.med.time.' + (item.time || 'morning'))} • ${safeT('rem.med.freq.' + (item.frequency || 'daily'))}${item.remaining ? ' • ' + item.remaining + ' tbl' : ''}`;
            accent = urgencyColor(days);
            break;
        case 'anniversary':
            title = item.name;
            days = daysToAnniversary(item.date);
            subtitle = formatDaysToHuman(days);
            accent = urgencyColor(days);
            break;
        case 'note':
            title = item.title;
            days = item.dueDate ? daysUntilDate(item.dueDate) : null;
            subtitle = item.description ? item.description.slice(0, 60) : '';
            accent = item.priority === 'high' ? '#f43f5e' : item.priority === 'medium' ? '#f59e0b' : '#10b981';
            break;
    }

    const daysTxt = days !== null ? formatDaysToHuman(days) : '';
    const daysCol = days !== null ? urgencyColor(days) : '';

    return `
        <div class="rem-item" onclick="editReminder('${type}', ${item.id})">
            <div class="rem-item-left">
                <div class="rem-item-title">${escapeHtml(title)}</div>
                ${subtitle ? `<div class="rem-item-sub">${escapeHtml(subtitle)}</div>` : ''}
            </div>
            ${days !== null ? `<div class="rem-item-days" style="color:${daysCol};">${escapeHtml(daysTxt)}</div>` : ''}
            <button class="rem-item-delete" onclick="event.stopPropagation();deleteReminderById('${type}', ${item.id})">✕</button>
        </div>
    `;
}

function editReminder(type, id) {
    const typeToKey = {
        birthday: REMINDER_KEYS.birthdays,
        bill: REMINDER_KEYS.bills,
        vehicle: REMINDER_KEYS.vehicles,
        document: REMINDER_KEYS.documents,
        subscription: REMINDER_KEYS.subscriptions,
        medication: REMINDER_KEYS.medications,
        anniversary: REMINDER_KEYS.anniversaries,
        note: REMINDER_KEYS.notes
    };
    const key = typeToKey[type];
    const item = loadReminders(key).find(x => x.id === id);
    if (!item) return;
    openReminderForm(type, item);
}

function deleteReminderById(type, id) {
    const typeToKey = {
        birthday: REMINDER_KEYS.birthdays,
        bill: REMINDER_KEYS.bills,
        vehicle: REMINDER_KEYS.vehicles,
        document: REMINDER_KEYS.documents,
        subscription: REMINDER_KEYS.subscriptions,
        medication: REMINDER_KEYS.medications,
        anniversary: REMINDER_KEYS.anniversaries,
        note: REMINDER_KEYS.notes
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
        else m = 0;
        monthly += m;
        yearly += m * 12;
    });
    if (bills.length === 0) { box.innerHTML = ''; return; }
    box.innerHTML = `
        <div class="rem-summary-row">
            <span>${safeT('rem.total.monthly')}</span>
            <strong>${money(monthly)} RSD</strong>
        </div>
        <div class="rem-summary-row">
            <span>${safeT('rem.total.yearly')}</span>
            <strong>${money(yearly)} RSD</strong>
        </div>
    `;
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
    box.innerHTML = `
        <div class="rem-summary-row">
            <span>${safeT('rem.total.monthly')}</span>
            <strong>${money(monthly)} RSD</strong>
        </div>
        <div class="rem-summary-row">
            <span>${safeT('rem.total.yearly')}</span>
            <strong>${money(monthly * 12)} RSD</strong>
        </div>
    `;
}

// ============================================================
// KRAJ DELA 3/4
// ============================================================// ============================================================
// ALATIKA — app.js (v4) — DEO 4/4
// Sve kalkulacije + tuner + valuta + about + init
// ============================================================

// ============================================================
// AUTO — Render funkcije
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

// ============================================================
// BIKE — Render funkcije
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

// ============================================================
// MONEY — Render funkcije
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

// ============================================================
// MEASURES — Render funkcije
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
function renderMeasuresProcenat() { return renderMoneyProcenat(); }

// ============================================================
// HEALTH — Render funkcije
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

// ============================================================
// TIME — Render funkcije
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

// ============================================================
// SHOPPING — Render funkcije
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

// ============================================================
// KALKULACIJE — AUTO
// ============================================================
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
    if (remainingKm >= 0) {
        if (lbl) lbl.innerText = safeT('label.auto.nextService');
        if (km) km.innerText = fmt(remainingKm, 0);
    } else {
        if (lbl) lbl.innerText = safeT('label.auto.serviceOverdue');
        if (km) km.innerText = fmt(-remainingKm, 0);
    }
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
// KALKULACIJE — BICIKL
// ============================================================
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
    if (type === 'mtb') {
        const inch = height * 0.1;
        main = inch;
        unit = safeT('unit.inch');
        alt = fmt(inch * 2.54, 0) + ' cm';
    } else {
        const cm = height * 0.31;
        main = cm;
        unit = 'cm';
        alt = fmt(cm / 2.54, 1) + ' ' + safeT('unit.inch');
    }
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
// KALKULACIJE — MONEY
// ============================================================
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
    if (type === 'add') {
        base = amount; tax = base * (rate / 100); total = base + tax;
    } else {
        total = amount; base = total / (1 + rate / 100); tax = total - base;
    }
    const pt = el('res-pdv-total'); if (pt) pt.innerText = money(total);
    const pb = el('stat-pdv-base'); if (pb) pb.innerText = money(base) + ' RSD';
    const px = el('stat-pdv-tax'); if (px) px.innerText = money(tax) + ' RSD';
    show('pdv-result-box'); show('pdv-stats-row');
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
    const lmu = el('res-loan-monthly-unit');
    if (lmu) lmu.innerText = currency + '/' + safeT('unit.month');
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

// ============================================================
// KALKULACIJE — MERE
// ============================================================
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
function percentAddSub(base, pct, op) {
    if (base === null || pct === null) return null;
    const factor = op === 'add' ? 1 + pct / 100 : 1 - pct / 100;
    const result = base * factor;
    const sign = op === 'add' ? '+' : '−';
    return { result, formula: `${fmt(base)} ${sign} ${fmt(pct)}% = ${fmt(base)} × ${fmt(factor, 4)} = ${fmt(result)}` };
}
function percentXofY(x, y) {
    if (x === null || y === null || y === 0) return null;
    const p = (x / y) * 100;
    return { result: p, formula: `${fmt(x)} ÷ ${fmt(y)} × 100 = ${fmt(p)}%` };
}
function percentChange(from, to) {
    if (from === null || to === null || from === 0) return null;
    const p = ((to - from) / Math.abs(from)) * 100;
    const sign = p >= 0 ? '+' : '';
    return { result: p, formula: `(${fmt(to)} − ${fmt(from)}) ÷ ${fmt(Math.abs(from))} × 100 = ${sign}${fmt(p)}%` };
}
function setFormula(id, text) {
    const e = el(id);
    if (!e) return;
    if (text) { e.textContent = text; e.classList.add('show'); }
    else { e.textContent = ''; e.classList.remove('show'); }
}
function calculatePercent1() {
    const base = num('pct-base'), pct = num('pct-val');
    const op = el('pct-op') ? el('pct-op').value : 'add';
    if (base === null || pct === null) { showToast(safeT('toast.error.enterNumber'), 'error'); return; }
    const res = percentAddSub(base, pct, op);
    if (!res) return;
    const rv = el('res-pct1-val'); if (rv) rv.innerText = fmt(res.result, 2);
    setFormula('pct1-formula', res.formula);
    show('pct1-result-box');
}
function calculatePercent2() {
    const x = num('pct-x'), y = num('pct-y');
    if (x === null || y === null || y === 0) { showToast(safeT('toast.error.enterXY'), 'error'); return; }
    const res = percentXofY(x, y);
    if (!res) return;
    const rv = el('res-pct2-val'); if (rv) rv.innerText = fmt(res.result, 2);
    setFormula('pct2-formula', res.formula);
    show('pct2-result-box');
}
function calculatePercent3() {
    const from = num('pct-from'), to = num('pct-to');
    if (from === null || to === null || from === 0) { showToast(safeT('toast.error.enterStartEnd'), 'error'); return; }
    const res = percentChange(from, to);
    if (!res) return;
    const rv = el('res-pct3-val');
    if (rv) { const sign = res.result >= 0 ? '+' : ''; rv.innerText = sign + fmt(res.result, 2); }
    setFormula('pct3-formula', res.formula);
    show('pct3-result-box');
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
function calculateMoneyPercent2() {
    const x = num('np-x'), y = num('np-y');
    if (x === null || y === null || y === 0) { showToast(safeT('toast.error.enterPartTotal'), 'error'); return; }
    const res = percentXofY(x, y);
    if (!res) return;
    const rv = el('res-np2-val'); if (rv) rv.innerText = fmt(res.result, 2);
    setFormula('np2-formula', res.formula);
    show('np2-result-box');
}

// ============================================================
// KALKULACIJE — ZDRAVLJE
// ============================================================
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
// KALKULACIJE — VREME
// ============================================================
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
// KALKULACIJE — SHOPPING
// ============================================================
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
    else {
        const secondPct = num('promo-second-pct') || 50;
        totalPaid = price + price * (1 - secondPct / 100);
        totalQty = 2; saved = price * 2 - totalPaid;
    }
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
    list.push({
        id: Date.now() + Math.random(), name,
        qty: qtyEl ? qtyEl.value.trim() : '',
        price: priceEl ? (parseNum(priceEl.value) || 0) : 0,
        bought: false, date: Date.now()
    });
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
        if (item.qty) {
            const q = document.createElement('div');
            q.className = 'lista-item-qty';
            q.textContent = item.qty;
            info.appendChild(q);
        }
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
}// ============================================================
// HOMECALC — Render funkcije
// ============================================================
let openingsData = { paint: [], tile: [], block: [], board: [] };

function renderHomePovrsina() {
    return `<div class="converter-box">${sectionDescKey('desc.home.area')}${selectField('label.home.shape', 'shape-type', [{ value: 'rect', text: safeT('option.home.rectangle') }, { value: 'square', text: safeT('option.home.square') }, { value: 'circle', text: safeT('option.home.circle') }, { value: 'triangle', text: safeT('option.home.triangle') }], 'rect')}<div id="shape-rect-inputs">${inputField('label.home.length', 'shape-a', 'm', 'placeholder="5"')}${inputField('label.home.width', 'shape-b', 'm', 'placeholder="3"')}</div><div id="shape-square-inputs" style="display:none;">${inputField('label.home.side', 'shape-side', 'm', 'placeholder="4"')}</div><div id="shape-circle-inputs" style="display:none;">${inputField('label.home.diameter', 'shape-diameter', 'm', 'placeholder="4"')}</div><div id="shape-triangle-inputs" style="display:none;">${inputField('label.home.base', 'shape-base', 'm', 'placeholder="6"')}${inputField('label.home.height', 'shape-height', 'm', 'placeholder="4"')}</div>${calcButton('btn.calculate', 'calculateShapeArea()')}</div>${resultCard('shape-result-box', 'square', 'label.home.area', 'res-shape-area', 'm²', 'GRAĐEVINA', 'label.home.area')}`;
}
function renderHomeBlokovi() {
    return `<div class="converter-box">${sectionDescKey('desc.home.blocks')}${inputField('label.home.wallLength', 'block-wall-l', 'm', 'placeholder="10"')}${inputField('label.home.wallHeight', 'block-wall-h', 'm', 'placeholder="2.8"')}${inputField('label.home.blockDimensions', 'block-l', 'cm', 'placeholder="25"')}${inputField('label.home.blockDimensions', 'block-h', 'cm', 'placeholder="19"')}${inputField('label.home.pricePerPiece', 'block-price', 'RSD', 'placeholder="0"')}${calcButton('btn.calculate', 'calculateBlocks()')}</div>${resultCard('blocks-result-box', 'bricks', 'label.home.blocksNeeded', 'res-blocks-count', '', 'GRAĐEVINA', 'Blokovi')}${statsRow('blocks-stats-row', [['label.home.netArea', 'stat-blocks-area', '0 m²'], ['label.home.totalPrice', 'stat-blocks-price', '—']])}`;
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
    return `<div class="converter-box">${sectionDescKey('desc.home.tiles')}${inputField('label.home.roomLength', 'tile-room-l', 'm', 'placeholder="4"')}${inputField('label.home.roomWidth', 'tile-room-w', 'm', 'placeholder="3"')}${inputField('label.home.tileLength', 'tile-l', 'cm', 'placeholder="30"')}${inputField('label.home.tileWidth', 'tile-w', 'cm', 'placeholder="30"')}${inputField('label.home.reserve', 'tile-reserve', '%', 'placeholder="10"')}${calcButton('btn.calculate', 'calculateTiles()')}</div>${resultCard('tiles-result-box', 'tiles', 'label.home.tiles', 'res-tiles-count', '', 'GRAĐEVINA', 'Pločice')}${statsRow('tiles-stats-row', [['label.home.netArea', 'stat-tiles-area', '0 m²'], ['label.home.withoutReserve', 'stat-tiles-nores', '0']])}`;
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

// ============================================================
// KALKULACIJE — HOMECALC
// ============================================================
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
        const n = document.createElement('input');
        n.type = 'text';
        n.placeholder = safeT('placeholder.name');
        n.value = op.name || '';
        n.oninput = e => updateOpening(type, idx, 'name', e.target.value);
        const w = document.createElement('input');
        w.type = 'text'; w.inputMode = 'decimal';
        w.placeholder = safeT('placeholder.widthShort');
        w.value = op.w || '';
        w.oninput = e => updateOpening(type, idx, 'w', e.target.value);
        const h = document.createElement('input');
        h.type = 'text'; h.inputMode = 'decimal';
        h.placeholder = safeT('placeholder.heightShort');
        h.value = op.h || '';
        h.oninput = e => updateOpening(type, idx, 'h', e.target.value);
        const r = document.createElement('button');
        r.className = 'opening-remove';
        r.textContent = '✕';
        r.onclick = () => removeOpening(type, idx);
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
    } else {
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
    if (!roomL || !roomW || !tileL || !tileW) { showToast(safeT('toast.error.enterAllDimensions'), 'error'); return; }
    const netArea = Math.max(0, roomL * roomW - getOpeningsArea('tile'));
    const tileArea = (tileL / 100) * (tileW / 100);
    const tilesBase = netArea / tileArea;
    const tc = el('res-tiles-count'); if (tc) tc.innerText = Math.ceil(tilesBase * (1 + reserve / 100));
    const ta = el('stat-tiles-area'); if (ta) ta.innerText = fmt(netArea, 2) + ' m²';
    const tn = el('stat-tiles-nores'); if (tn) tn.innerText = Math.ceil(tilesBase) + ' ' + safeT('unit.pcsShort');
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
function updateBlockDefaults() {
    const type = el('block-type') ? el('block-type').value : '';
    const D = { giter25: { l: 25, h: 19 }, giter20: { l: 20, h: 19 }, giter15: { l: 15, h: 19 } };
    if (type === 'custom' || !D[type]) return;
    if (el('block-l')) el('block-l').value = D[type].l;
    if (el('block-h')) el('block-h').value = D[type].h;
}
function calculateBlocks() {
    const wallL = num('block-wall-l'), wallH = num('block-wall-h'), blockL = num('block-l'), blockH = num('block-h');
    if (!wallL || !wallH || !blockL || !blockH) { showToast(safeT('toast.error.enterBlockWallDims'), 'error'); return; }
    const netArea = Math.max(0, wallL * wallH - getOpeningsArea('block'));
    const blocks = Math.ceil(netArea / ((blockL / 100) * (blockH / 100)));
    const bc = el('res-blocks-count'); if (bc) bc.innerText = blocks;
    const ba = el('stat-blocks-area'); if (ba) ba.innerText = fmt(netArea, 2) + ' m²';
    const price = num('block-price');
    const bp = el('stat-blocks-price'); if (bp) bp.innerText = price ? money(blocks * price) + ' RSD' : '—';
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
// KITCHEN — Render funkcije
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

// ============================================================
// KALKULACIJE — KITCHEN
// ============================================================
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
    else if (from === 'gas') {
        const gasToC = { 1: 140, 2: 150, 3: 170, 4: 180, 5: 190, 6: 200, 7: 220, 8: 230, 9: 240 };
        celsius = gasToC[Math.round(val)] || 180;
    }
    else celsius = val;
    let result, unit;
    if (to === 'c') { result = celsius; unit = '°C'; }
    else if (to === 'f') { result = (celsius * 9 / 5) + 32; unit = '°F'; }
    else {
        const cToGas = [[135, 1], [145, 1.5], [155, 2], [165, 2.5], [175, 3], [185, 4], [195, 5], [205, 6], [215, 6.5], [225, 7], [235, 8], [245, 9]];
        let closest = 4;
        for (const [c, g] of cToGas) { if (celsius <= c) { closest = g; break; } }
        result = closest; unit = 'Gas';
    }
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
const DRINK_DEFAULTS = {
    kafa_turska: { val: 1, unitKey: 'unit.teaspoon' },
    kafa_espreso: { val: 7, unitKey: 'unit.g' },
    caj_kesica: { val: 1, unitKey: 'unit.teabag' }
};
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
// POWER — Render funkcije
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

// ============================================================
// KALKULACIJE — POWER
// ============================================================
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
function savePowerDevices() {
    try { localStorage.setItem('cx_power_devices', JSON.stringify(powerDevices)); } catch (e) {}
}
function renderPowerDevices() {
    const list = el('power-devices-list');
    if (!list) return;
    list.innerHTML = '';
    if (!powerDevices.length) {
        list.innerHTML = '<p class="section-desc" style="text-align:center; padding:10px;">' + safeT('label.power.noDevices') + '</p>';
        return;
    }
    powerDevices.forEach((dev, idx) => {
        const row = document.createElement('div');
        row.className = 'power-device-item';
        row.innerHTML = `<div class="power-device-info"><div class="power-device-name">${escapeHtml(dev.name || safeT('label.power.device') + ' ' + (idx + 1))}</div><div class="power-device-detail">${dev.watts}W × ${dev.hours}h/${safeT('unit.day')}</div></div><button class="power-device-remove">✕</button>`;
        row.querySelector('.power-device-remove').addEventListener('click', () => {
            powerDevices.splice(idx, 1);
            savePowerDevices();
            renderPowerDevices();
            updatePowerTotal();
        });
        list.appendChild(row);
    });
}
function updatePowerTotal() {
    if (!powerDevices.length) { hide('power-multi-result-box'); hide('power-multi-stats-row'); return; }
    let totalMonth = 0, totalKwh = 0;
    powerDevices.forEach(dev => {
        const kwhMonth = ((dev.watts * dev.hours) / 1000) * 30;
        totalKwh += kwhMonth;
        totalMonth += kwhMonth * (dev.price || 12);
    });
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
    savePowerDevices();
    renderPowerDevices();
    updatePowerTotal();
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
    if (dir === 'w-to-a') {
        powerW = val;
        amps = phases === 3 ? powerW / (sqrt3 * volts * cosfi) : powerW / (volts * cosfi);
        result = amps; unit = 'A';
    } else {
        amps = val;
        powerW = phases === 3 ? sqrt3 * volts * amps * cosfi : volts * amps * cosfi;
        result = powerW; unit = 'W';
    }
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
    const ampacity = isCopper
        ? { 1.5: 14, 2.5: 20, 4: 26, 6: 34, 10: 46, 16: 62, 25: 80, 35: 100, 50: 125 }
        : { 2.5: 15, 4: 20, 6: 26, 10: 36, 16: 48, 25: 62, 35: 78, 50: 96 };
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
    if (poz === 'snaga') {
        powerKw = val;
        amps = (powerKw * 1000) / (sqrt3 * volts * cosfi);
        result = amps; unit = 'A';
    } else {
        amps = val;
        powerKw = (sqrt3 * volts * amps * cosfi) / 1000;
        result = powerKw; unit = 'kW';
    }
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
// WORK — Render funkcije
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

// ============================================================
// KALKULACIJE — WORK
// ============================================================
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
    if (type === 'bruto-to-neto') {
        if (label) label.innerText = safeT('label.work.netSalaryLabel');
        if (val) val.innerText = money(neto);
    } else {
        if (label) label.innerText = safeT('label.work.grossSalaryLabel');
        if (val) val.innerText = money(bruto);
    }
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
// MUSIC — Render funkcije
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

// ============================================================
// KALKULACIJE — MUSIC
// ============================================================
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
    if (doEl) {
        doEl.innerText = (offset >= 0 ? '+' : '') + fmt(offset, 2) + ' Hz';
        if (Math.abs(offset) < 1) doEl.style.color = '#10b981';
        else if (Math.abs(offset) < 5) doEl.style.color = '#f59e0b';
        else doEl.style.color = '#f43f5e';
    }
    const do2 = el('stat-detect-octave'); if (do2) do2.innerText = octave;
    show('detect-result-box'); show('detect-stats-row');
}

// ============================================================
// ŠTIMER — Instrumenti
// ============================================================
const TUNER_INSTRUMENTS = {
    'guitar-standard': { strings: [
        { note: 'E', octave: 2, freq: 82.41 }, { note: 'A', octave: 2, freq: 110.00 },
        { note: 'D', octave: 3, freq: 146.83 }, { note: 'G', octave: 3, freq: 196.00 },
        { note: 'B', octave: 3, freq: 246.94 }, { note: 'E', octave: 4, freq: 329.63 }
    ]},
    'guitar-dropd': { strings: [
        { note: 'D', octave: 2, freq: 73.42 }, { note: 'A', octave: 2, freq: 110.00 },
        { note: 'D', octave: 3, freq: 146.83 }, { note: 'G', octave: 3, freq: 196.00 },
        { note: 'B', octave: 3, freq: 246.94 }, { note: 'E', octave: 4, freq: 329.63 }
    ]},
    'guitar-halfdown': { strings: [
        { note: 'D#', octave: 2, freq: 77.78 }, { note: 'G#', octave: 2, freq: 103.83 },
        { note: 'C#', octave: 3, freq: 138.59 }, { note: 'F#', octave: 3, freq: 185.00 },
        { note: 'A#', octave: 3, freq: 233.08 }, { note: 'D#', octave: 4, freq: 311.13 }
    ]},
    'bass-4': { strings: [
        { note: 'E', octave: 1, freq: 41.20 }, { note: 'A', octave: 1, freq: 55.00 },
        { note: 'D', octave: 2, freq: 73.42 }, { note: 'G', octave: 2, freq: 98.00 }
    ]},
    'bass-5': { strings: [
        { note: 'B', octave: 0, freq: 30.87 }, { note: 'E', octave: 1, freq: 41.20 },
        { note: 'A', octave: 1, freq: 55.00 }, { note: 'D', octave: 2, freq: 73.42 },
        { note: 'G', octave: 2, freq: 98.00 }
    ]},
    'ukulele-soprano': { strings: [
        { note: 'G', octave: 4, freq: 392.00 }, { note: 'C', octave: 4, freq: 261.63 },
        { note: 'E', octave: 4, freq: 329.63 }, { note: 'A', octave: 4, freq: 440.00 }
    ]},
    'ukulele-baritone': { strings: [
        { note: 'D', octave: 3, freq: 146.83 }, { note: 'G', octave: 3, freq: 196.00 },
        { note: 'B', octave: 3, freq: 246.94 }, { note: 'E', octave: 4, freq: 329.63 }
    ]},
    'violin': { strings: [
        { note: 'G', octave: 3, freq: 196.00 }, { note: 'D', octave: 4, freq: 293.66 },
        { note: 'A', octave: 4, freq: 440.00 }, { note: 'E', octave: 5, freq: 659.25 }
    ]},
    'cello': { strings: [
        { note: 'C', octave: 2, freq: 65.41 }, { note: 'G', octave: 2, freq: 98.00 },
        { note: 'D', octave: 3, freq: 146.83 }, { note: 'A', octave: 3, freq: 220.00 }
    ]},
    'mandolin': { strings: [
        { note: 'G', octave: 3, freq: 196.00 }, { note: 'D', octave: 4, freq: 293.66 },
        { note: 'A', octave: 4, freq: 440.00 }, { note: 'E', octave: 5, freq: 659.25 }
    ]},
    'banjo': { strings: [
        { note: 'G', octave: 4, freq: 392.00 }, { note: 'D', octave: 3, freq: 146.83 },
        { note: 'G', octave: 3, freq: 196.00 }, { note: 'B', octave: 3, freq: 246.94 },
        { note: 'D', octave: 4, freq: 293.66 }
    ]},
    'kontrabas': { strings: [
        { note: 'E', octave: 1, freq: 41.20 }, { note: 'A', octave: 1, freq: 55.00 },
        { note: 'D', octave: 2, freq: 73.42 }, { note: 'G', octave: 2, freq: 98.00 }
    ]}
};

let tunerOscillator = null, tunerGain = null;
let micStream = null, micAnalyser = null, micSource = null, micRunning = false, micRafId = null;

function getA4() {
    const v = el('tuner-a4') ? parseNum(el('tuner-a4').value) : 440;
    return (v && v > 0) ? v : 440;
}
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
        btn.innerHTML = `
            <span class="ts-num">${i + 1}.</span>
            <span class="ts-note">${s.note}${s.octave}</span>
            <span class="ts-freq">${freq.toFixed(2)} Hz</span>
        `;
        btn.addEventListener('click', () => playTunerTone(freq, btn));
        wrap.appendChild(btn);
    });
}
function playTunerTone(freq, btn) {
    try {
        const isActive = btn && btn.classList.contains('active');
        if (isActive) {
            stopTunerTone();
            const s = el('tuner-status');
            if (s) s.style.display = 'none';
            return;
        }
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
        if (status) {
            status.style.display = 'block';
            const nd = el('tuner-note-display');
            if (nd) nd.textContent = btn.querySelector('.ts-note').textContent;
            const fd = el('tuner-freq-display');
            if (fd) fd.textContent = freq.toFixed(2) + ' Hz';
        }
        const sb = el('tuner-stop-btn');
        if (sb) sb.style.display = 'block';
        document.querySelectorAll('.tuner-string-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        vibrate(10);
    } catch (e) {}
}
function stopTunerTone() {
    if (tunerOscillator) {
        try {
            tunerGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.05);
            tunerOscillator.stop(audioCtx.currentTime + 0.1);
        } catch (e) {}
        tunerOscillator = null;
        tunerGain = null;
    }
    const sb = el('tuner-stop-btn');
    if (sb) sb.style.display = 'none';
    document.querySelectorAll('.tuner-string-btn').forEach(b => b.classList.remove('active'));
}

// ============================================================
// MIKROFON — YIN integracija
// ============================================================
async function toggleTunerMic() {
    const btn = el('tuner-mic-btn');
    if (micRunning) {
        stopTunerMic();
        if (btn) {
            btn.textContent = '🎤 ' + safeT('btn.enableMic');
            btn.classList.remove('active');
        }
        return;
    }
    try {
        if (!audioCtx) audioCtx = getAudio();
        if (!audioCtx) throw new Error('AudioContext not available');
        if (audioCtx.state === 'suspended') await audioCtx.resume();

        micStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false,
                channelCount: 1
            }
        });
        micSource = audioCtx.createMediaStreamSource(micStream);
        micAnalyser = audioCtx.createAnalyser();
        micAnalyser.fftSize = 8192;
        micAnalyser.smoothingTimeConstant = 0.5;
        micSource.connect(micAnalyser);
        micRunning = true;

        resetPitchSmoothing();

        if (btn) {
            btn.textContent = '⏹ ' + safeT('btn.stopMic');
            btn.classList.add('active');
        }
        const r = el('tuner-mic-result');
        if (r) r.style.display = 'block';
        micLoop();
        vibrate(20);
        playTick(0, 1400, 0.08, 0.03);
    } catch (e) {
        console.warn('Mic error:', e);
        showToast(safeT('toast.micError') || 'Greška pri pristupu mikrofonu', 'error', 2500);
    }
}

function stopTunerMic() {
    micRunning = false;
    if (micRafId) { cancelAnimationFrame(micRafId); micRafId = null; }
    if (micStream) {
        micStream.getTracks().forEach(track => track.stop());
        micStream = null;
    }
    micSource = null;
    micAnalyser = null;
    resetPitchSmoothing();
    const r = el('tuner-mic-result');
    if (r) r.style.display = 'none';
}

function micLoop() {
    if (!micRunning || !micAnalyser) return;
    const buffer = new Float32Array(micAnalyser.fftSize);
    micAnalyser.getFloatTimeDomainData(buffer);

    // YIN algoritam
    let freq = yinPitchDetect(buffer, audioCtx.sampleRate, {
        threshold: 0.12,
        minFreq: 60,
        maxFreq: 1500
    });

    // Fallback na autoCorrelate
    if (freq <= 0 && typeof autoCorrelate === 'function') {
        freq = autoCorrelate(buffer, audioCtx.sampleRate);
    }

    if (freq > 0) {
        const smoothed = smoothPitch(freq);
        if (smoothed > 0) {
            updateTunerDisplay(smoothed);
        } else {
            showTunerNoSignal();
        }
    } else {
        showTunerNoSignal();
    }

    micRafId = requestAnimationFrame(micLoop);
}

function showTunerNoSignal() {
    const dn = el('tuner-detected-note');
    if (dn) dn.textContent = '—';
    const df = el('tuner-detected-freq');
    if (df) df.textContent = '— Hz';
    const marker = el('tuner-cents-marker');
    if (marker) marker.style.left = '50%';
    const cl = el('tuner-cents-label');
    if (cl) {
        cl.textContent = '0 cents';
        cl.classList.remove('ok', 'close', 'far');
    }
}

// ============================================================
// STARI autoCorrelate — fallback
// ============================================================
function autoCorrelate(buffer, sampleRate) {
    const SIZE = buffer.length;
    let rms = 0;
    for (let i = 0; i < SIZE; i++) rms += buffer[i] * buffer[i];
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.01) return -1;

    let r1 = 0, r2 = SIZE - 1;
    const thres = 0.2;
    for (let i = 0; i < SIZE / 2; i++) {
        if (Math.abs(buffer[i]) < thres) { r1 = i; break; }
    }
    for (let i = 1; i < SIZE / 2; i++) {
        if (Math.abs(buffer[SIZE - i]) < thres) { r2 = SIZE - i; break; }
    }
    const buf = buffer.slice(r1, r2);
    const newSize = buf.length;
    const c = new Array(newSize).fill(0);
    for (let i = 0; i < newSize; i++) {
        for (let j = 0; j < newSize - i; j++) {
            c[i] += buf[j] * buf[j + i];
        }
    }
    let d = 0;
    while (c[d] > c[d + 1]) d++;
    let maxval = -1, maxpos = -1;
    for (let i = d; i < newSize; i++) {
        if (c[i] > maxval) { maxval = c[i]; maxpos = i; }
    }
    let T0 = maxpos;
    const x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
    const a = (x1 + x3 - 2 * x2) / 2, b = (x3 - x1) / 2;
    if (a) T0 = T0 - b / (2 * a);
    return sampleRate / T0;
}

// ============================================================
// TUNER — Detekcija note i prikaz skale
// ============================================================
function updateTunerDisplay(freq) {
    const nearest = findNearestString(freq);
    if (!nearest) return;

    const { string, cents, index, targetFreq } = nearest;

    const dn = el('tuner-detected-note');
    if (dn) dn.textContent = `${string.note}${string.octave}`;

    const ti = el('tuner-target-info');
    if (ti) {
        const statusText = Math.abs(cents) < 3 ? safeT('label.music.tunerInTune') :
                          (Math.abs(cents) < 15 ? safeT('label.music.tunerClose') : safeT('label.music.tunerOut'));
        ti.textContent = `${safeT('label.music.string')} ${index + 1} • ${statusText}`;
        ti.classList.remove('ok', 'close', 'far');
        if (Math.abs(cents) < 3) ti.classList.add('ok');
        else if (Math.abs(cents) < 15) ti.classList.add('close');
        else ti.classList.add('far');
    }

    const df = el('tuner-detected-freq');
    if (df) df.textContent = freq.toFixed(2) + ' Hz → ' + targetFreq.toFixed(2) + ' Hz';

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
        if (Math.abs(cents) < Math.abs(minDiff)) {
            minDiff = cents;
            nearest = { index: i, string: s, cents, targetFreq };
        }
    });
    return nearest;
}

// ============================================================
// VALUTA (FX)
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

function getFxLastUpdate() {
    try {
        const raw = JSON.parse(localStorage.getItem(FX_STORAGE_KEY));
        if (raw && raw.updated) return raw.updated;
    } catch (e) {}
    return null;
}
function loadFxRates() {
    try {
        const raw = JSON.parse(localStorage.getItem(FX_STORAGE_KEY));
        if (raw && raw.rates && typeof raw.rates === 'object') {
            CURRENCIES.forEach(c => {
                if (typeof raw.rates[c.code] === 'number' && raw.rates[c.code] > 0) c.rate = raw.rates[c.code];
            });
        }
    } catch (e) {}
}
function saveFxRates() {
    try {
        const rates = {};
        CURRENCIES.forEach(c => { rates[c.code] = c.rate; });
        localStorage.setItem(FX_STORAGE_KEY, JSON.stringify({ rates, updated: Date.now() }));
    } catch (e) {}
}
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
        if (!silent) {
            showToast(currentLang === 'en' ? 'Rates refreshed' : 'Kursevi osveženi', 'success', 2000);
            vibrate(20);
        }
    } catch (e) {
        if (!silent) showToast(currentLang === 'en' ? 'Error refreshing rates' : 'Greška pri osvežavanju', 'error', 2500);
    }
}
function populateCurrencySelects() {
    const fromSel = el('fx-from'), toSel = el('fx-to');
    if (!fromSel || !toSel) return;
    const prevFrom = fromSel.value || 'RSD', prevTo = toSel.value || 'EUR';
    fromSel.innerHTML = '';
    toSel.innerHTML = '';
    CURRENCIES.forEach(c => {
        const o1 = document.createElement('option');
        o1.value = c.code;
        o1.textContent = `${c.flag} ${c.code} — ${c.name}`;
        fromSel.appendChild(o1);
        const o2 = document.createElement('option');
        o2.value = c.code;
        o2.textContent = `${c.flag} ${c.code} — ${c.name}`;
        toSel.appendChild(o2);
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
        item.addEventListener('click', () => {
            const toSel = el('fx-to');
            if (toSel) { toSel.value = c.code; calculateCurrency(); }
        });
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
// O APLIKACIJI
// ============================================================
const APP_VERSION = '1.0';
const APP_DATE_SR = 'Oktobar 2026';
const APP_DATE_EN = 'October 2026';

function openAboutModal() {
    const modal = el('about-modal');
    if (!modal) return;

    const setText = (id, key) => {
        const e = el(id);
        if (e) e.textContent = safeT(key);
    };
    setText('about-modal-title', 'about.title');
    setText('about-what-title', 'about.whatTitle');
    setText('about-what-text', 'about.whatText');
    setText('about-thanks-title', 'about.thanksTitle');
    setText('about-thanks-text', 'about.thanksText');
    setText('about-author-title', 'about.authorTitle');
    setText('about-author-text', 'about.author');
    setText('about-github-text', 'about.github');
    setText('about-footer-text', 'about.footer');

    const desc = el('about-description');
    if (desc) desc.textContent = safeT('about.description');

    const ver = el('about-version');
    if (ver) ver.textContent = `v${APP_VERSION} • ${currentLang === 'en' ? APP_DATE_EN : APP_DATE_SR}`;

    modal.classList.add('show');
    document.body.classList.add('modal-open');
    vibrate(15);
    playTick(0, 1400, 0.06, 0.02);
    try { history.pushState({ modal: 'about' }, '', ''); } catch (e) {}
}

// ============================================================
// INIT
// ============================================================
function initApp() {
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
    try { renderAllTools(); } catch (e) { console.error('renderAllTools:', e); }
    try { renderFavorites(); } catch (e) { console.error('renderFavorites:', e); }
    try { populateNoteSelects(); } catch (e) {}
    try { updateSettingsUI(); } catch (e) {}
    try { setupRipple(); } catch (e) {}
    try { setupBackButton(); } catch (e) {}
    try { loadFxRates(); } catch (e) {}
    try { restoreInputsFor(document); } catch (e) {}

    // PWA Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(reg => console.log('SW registered', reg.scope))
                .catch(err => console.warn('SW registration failed', err));
        });
    }

    // Inicijalni badge
    setTimeout(() => { updateAppBadge(); }, 500);
    // Badge hint (prvi put)
    setTimeout(() => { maybeShowBadgeHint(); }, 1200);

    // Badge refresh svakih sat vremena
    setInterval(updateAppBadge, 60 * 60 * 1000);

    setTimeout(() => {
        const splash = el('splash-screen');
        if (splash) {
            splash.classList.add('hide');
            setTimeout(() => { if (splash.parentNode) splash.remove(); }, 400);
        }
    }, 500);

    if (typeof t === 'function') {
        document.title = t('app.title');
    }
}

// ============================================================
// OSVEŽAVANJE STATIČNIH TEKSTOVA
// ============================================================
function refreshUIText() {
    try {
        const subtitle = el('app-subtitle');
        if (subtitle) subtitle.textContent = safeT('app.subtitle');

        const searchInput = el('home-search');
        if (searchInput) searchInput.placeholder = safeT('app.search.placeholder');

        const secQuick = el('sec-title-quick');
        if (secQuick) secQuick.textContent = safeT('section.quickTools');
        const secMy = el('sec-title-my');
        if (secMy) secMy.textContent = safeT('section.myTools');
        const secAll = el('sec-title-all');
        if (secAll) secAll.textContent = safeT('section.allTools');

        const btnEditQuick = el('btn-edit-quick');
        if (btnEditQuick) btnEditQuick.textContent = safeT('section.edit');

        // Svi alati — edit dugme
        const btnEditAll = el('btn-edit-all-tools');
        if (btnEditAll) btnEditAll.textContent = allToolsEditMode ? safeT('section.allTools.cancel') : safeT('section.allTools.edit');

        // Tools hint
        const toolsHintTitle = el('tools-hint-title');
        if (toolsHintTitle) toolsHintTitle.textContent = safeT('section.allTools.hint.title');
        const toolsHintText = el('tools-hint-text');
        if (toolsHintText) toolsHintText.textContent = safeT('section.allTools.hint.text');
        const toolsHintBtn = el('tools-hint-btn');
        if (toolsHintBtn) toolsHintBtn.textContent = safeT('section.allTools.hint.btn');

        // Badge hint
        const badgeHintTitle = el('badge-hint-title');
        if (badgeHintTitle) badgeHintTitle.textContent = safeT('rem.badge.hint.title');
        const badgeHintText = el('badge-hint-text');
        if (badgeHintText) badgeHintText.textContent = safeT('rem.badge.hint.text');
        const badgeHintBtn = el('badge-hint-btn');
        if (badgeHintBtn) badgeHintBtn.textContent = safeT('rem.badge.hint.btn');

        const favEmpty = el('favorites-empty');
        if (favEmpty) favEmpty.innerHTML = safeT('section.favoritesEmpty');

        const footerTag = el('footer-tag');
        if (footerTag) footerTag.textContent = safeT('app.footer');

        // Podešavanja
        const settingsTitle = el('settings-title');
        if (settingsTitle) settingsTitle.textContent = safeT('settings.title');
        const settingsThemeLabel = el('settings-theme-label');
        if (settingsThemeLabel) settingsThemeLabel.textContent = safeT('settings.theme');
        const settingsThemeSub = el('settings-theme-sub');
        if (settingsThemeSub) settingsThemeSub.textContent = safeT('settings.theme.desc');
        const settingsSoundLabel = el('settings-sound-label');
        if (settingsSoundLabel) settingsSoundLabel.textContent = safeT('settings.sound');
        const settingsSoundSub = el('settings-sound-sub');
        if (settingsSoundSub) settingsSoundSub.textContent = safeT('settings.sound.desc');
        const settingsHapticLabel = el('settings-haptic-label');
        if (settingsHapticLabel) settingsHapticLabel.textContent = safeT('settings.haptic');
        const settingsHapticSub = el('settings-haptic-sub');
        if (settingsHapticSub) settingsHapticSub.textContent = safeT('settings.haptic.desc');
        const settingsCurrencyLabel = el('settings-currency-label');
        if (settingsCurrencyLabel) settingsCurrencyLabel.textContent = safeT('settings.currency');
        const settingsCurrencySub = el('settings-currency-sub');
        if (settingsCurrencySub) settingsCurrencySub.textContent = safeT('settings.currency.desc');
        const settingsLanguageLabel = el('settings-language-label');
        if (settingsLanguageLabel) settingsLanguageLabel.textContent = safeT('settings.language');
        const settingsLanguageSub = el('settings-language-sub');
        if (settingsLanguageSub) settingsLanguageSub.textContent = safeT('settings.language.desc');
        const settingsOffline = el('settings-offline-text');
        if (settingsOffline) settingsOffline.textContent = safeT('settings.offline');

        // O aplikaciji
        const aboutTitle = el('about-title');
        if (aboutTitle) aboutTitle.textContent = safeT('about.title');
        const aboutSub = el('about-sub');
        if (aboutSub) aboutSub.textContent = safeT('about.subtitle');

        // Istorija
        const historyTitle = el('history-title');
        if (historyTitle) historyTitle.textContent = safeT('history.title');
        const historySearch = el('history-search');
        if (historySearch) historySearch.placeholder = safeT('history.search');
        const btnHistoryExport = el('btn-history-export');
        if (btnHistoryExport) btnHistoryExport.textContent = safeT('history.export');
        const btnHistoryClear = el('btn-history-clear');
        if (btnHistoryClear) btnHistoryClear.textContent = safeT('history.clear');
        const historyEmpty = el('history-empty');
        if (historyEmpty) historyEmpty.textContent = safeT('history.empty');
        const historyNoResults = el('history-no-results');
        if (historyNoResults) historyNoResults.textContent = safeT('history.noResults');
        const statsToggleBtn = el('stats-toggle-btn');
        if (statsToggleBtn) {
            const panel = el('stats-panel');
            const isOpen = panel && panel.style.display !== 'none';
            statsToggleBtn.textContent = isOpen ? safeT('history.stats.hide') : safeT('history.stats.show');
        }

        const langBtn = el('lang-toggle');
        if (langBtn) langBtn.textContent = (typeof currentLang !== 'undefined' ? currentLang : 'sr').toUpperCase();

        const editorTitle = el('editor-title');
        if (editorTitle) editorTitle.textContent = safeT('editor.title');
        const editorDesc = el('editor-desc');
        if (editorDesc) editorDesc.textContent = safeT('editor.desc');
        const editorSaveBtn = el('editor-save-btn');
        if (editorSaveBtn) editorSaveBtn.textContent = safeT('editor.save');

        const locationTitle = el('location-title');
        if (locationTitle) locationTitle.textContent = safeT('weather.location.title');
        const locationSearchInput = el('location-search-input');
        if (locationSearchInput) locationSearchInput.placeholder = safeT('weather.location.search');
        const locationGpsText = el('location-gps-text');
        if (locationGpsText) locationGpsText.textContent = safeT('weather.location.gps');

        const favHintTitle = el('fav-hint-title');
        if (favHintTitle) favHintTitle.textContent = safeT('fav.hint.title');
        const favHintText = el('fav-hint-text');
        if (favHintText) favHintText.textContent = safeT('fav.hint.text');
        const favHintBtn = el('fav-hint-btn');
        if (favHintBtn) favHintBtn.textContent = safeT('fav.hint.btn');

        const confirmTitle = el('confirm-title');
        if (confirmTitle) confirmTitle.textContent = safeT('confirm.title');
        const confirmMsg = el('confirm-message');
        if (confirmMsg) confirmMsg.textContent = safeT('confirm.title');
        const confirmCancelBtn = el('confirm-cancel-btn');
        if (confirmCancelBtn) confirmCancelBtn.textContent = safeT('confirm.cancel');
        const confirmOkBtn = el('confirm-ok-btn');
        if (confirmOkBtn) confirmOkBtn.textContent = safeT('confirm.ok');
    } catch (e) { console.warn('refreshUIText greška:', e); }
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
