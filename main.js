// ============================================================
// ALATIKA — main.js (finalna verzija, dvojezična)
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
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>'
};

function icon(name) {
    return ICONS[name] || ICONS.info;
}

// ================= CATEGORIES =================
const CATEGORIES = {
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

// ================= NAVIGACIJA — MODALI =================

let activeCategory = null;
let activeTab = null;

function openCategory(categoryId) {
    const cat = CATEGORIES[categoryId];
    if (!cat) return;
    activeCategory = categoryId;

    const modal = el('category-modal');
    const iconBox = el('category-icon');
    const titleBox = el('category-title');
    const tabBar = el('category-tab-bar');

    if (!modal || !iconBox || !titleBox || !tabBar) return;

    modal.style.setProperty('--qt-accent', cat.accent);
    iconBox.style.setProperty('--qt-accent', cat.accent);
    iconBox.innerHTML = icon(cat.icon);
    titleBox.textContent = t('cat.' + categoryId);

    tabBar.innerHTML = '';
    cat.tabs.forEach(tab => {
        const btn = document.createElement('button');
        btn.className = 'tab-btn';
        btn.style.setProperty('--qt-accent', cat.accent);
        btn.innerHTML = `
            <span class="tab-btn-icon">${icon(tab.icon)}</span>
            <span class="tab-btn-label">${escapeHtml(t('tab.' + categoryId + '.' + tab.id))}</span>
        `;
        btn.onclick = () => openCalc(categoryId, tab.id);
        tabBar.appendChild(btn);
    });

    modal.classList.add('show');
    document.body.classList.add('modal-open');
    vibrate(15);
    playTick(0, 1400, 0.06, 0.02);

    try { history.pushState({ modal: 'category', category: categoryId }, '', ''); } catch (e) {}
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
    titleBox.textContent = t('tab.' + categoryId + '.' + tabId);

    const favKey = `${categoryId}:${tabId}`;
    const favStar = el('calc-fav-star');
    if (favStar) {
        const active = isFavorite(favKey);
        favStar.dataset.favKey = favKey;
        favStar.classList.toggle('active', active);
        favStar.innerHTML = active ? icon('starFill') : icon('star');
        favStar.title = active ? t('fav.remove') : t('fav.add');
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

    try { history.pushState({ modal: 'calc', category: categoryId, tab: tabId }, '', ''); } catch (e) {}

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

const QUICK_TOOLS_KEY = 'cx_quick_tools_v1';
const DEFAULT_QUICK_TOOLS = ['weather', 'money', 'measures', 'shopping'];
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
        btn.innerHTML = `
            <span class="quick-tool-icon">${icon(cat.icon)}</span>
            <span class="quick-tool-label">${escapeHtml(t('cat.' + id))}</span>
        `;
        btn.onclick = () => openCategory(id);
        grid.appendChild(btn);
    });
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
            <div class="editor-item-label">${escapeHtml(t('cat.' + id))}</div>
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
        showToast(t('editor.error.tooMany'), 'warning', 1800);
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
        showToast(t('editor.error.wrongCount'), 'error');
        return;
    }
    saveQuickToolsList(selected);
    renderQuickTools();
    closeModal('editor-modal');
    showToast(t('editor.success'), 'success');
}

// ================= SVI ALATI =================

function renderAllTools() {
    const grid = el('all-tools-grid');
    if (!grid) return;
    grid.innerHTML = '';
    Object.entries(CATEGORIES).forEach(([id, cat]) => {
        const btn = document.createElement('button');
        btn.className = 'all-tool';
        btn.style.setProperty('--qt-accent', cat.accent);
        btn.innerHTML = `
            <span class="all-tool-icon">${icon(cat.icon)}</span>
            <span class="all-tool-label">${escapeHtml(t('cat.' + id))}</span>
        `;
        btn.onclick = () => openCategory(id);
        grid.appendChild(btn);
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
        showToast(t('fav.removed'), 'info', 1400);
        vibrate(10);
    } else {
        list.push(key);
        showToast(t('fav.added'), 'success', 1400);
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
        favStar.title = active ? t('fav.remove') : t('fav.add');
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
            emptyMsg.innerHTML = t('section.favoritesEmpty');
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
            <span class="fav-text">${escapeHtml(t('tab.' + catId + '.' + tabId))}</span>
            <span class="fav-remove" title="${t('fav.remove')}">${icon('x')}</span>
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

// ================= PRETRAGA =================

function normalizeText(str) {
    return str.toLowerCase().replace(/đ/g, 'dj').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
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
        const nameEn = normalizeText(TRANSLATIONS.en['tab.' + tool.catId + '.' + tool.tabId] || '');
        const catSr = normalizeText(tool.category);
        const catEn = normalizeText(TRANSLATIONS.en['cat.' + tool.catId] || '');
        
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
        box.innerHTML = '<div class="qsr-empty"><div class="qsr-empty-title">' + t('search.noResults') + '</div><div class="qsr-empty-sub">' + t('search.tryAgain') + '</div></div>';
        return;
    }
    matches.forEach(tool => {
        const item = document.createElement('div');
        item.className = 'qsr-item';
        item.style.setProperty('--qt-accent', tool.accent);
        item.innerHTML = `
            <div class="qsr-icon">${icon(tool.icon)}</div>
            <div class="qsr-text">
                <div class="qsr-name">${escapeHtml(t('tab.' + tool.catId + '.' + tool.tabId))}</div>
                <div class="qsr-cat">${escapeHtml(t('cat.' + tool.catId))}</div>
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
        btn.innerHTML = icon('check') + ' ' + t('modal.saved');
        showToast(label + ' ' + t('result.saved'), 'success', 2000);
        setTimeout(() => { btn.innerHTML = old; }, 1200);
    } catch (e) {}
}
function deleteHistoryItem(idx) {
    try {
        const list = loadHistory();
        list.splice(idx, 1);
        saveHistoryList(list);
        renderHistory();
        showToast(t('history.deleted'), 'info', 1500);
    } catch (e) {}
}
async function clearHistory() {
    const ok = await showConfirm(t('history.confirm.clear'), t('history.confirm.title'));
    if (!ok) return;
    saveHistoryList([]);
    renderHistory();
    showToast(t('history.cleared'), 'success');
}
async function exportHistory() {
    try {
        const list = loadHistory();
        if (!list.length) { showToast(t('history.export.empty'), 'info'); return; }
        const lines = list.map(item => {
            const d = new Date(item.date);
            const locale = currentLang === 'en' ? 'en-GB' : 'sr-RS';
            const dateStr = d.toLocaleDateString(locale) + ' ' + d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
            return `${item.category} – ${item.label}\n${item.text}\n${dateStr}\n`;
        });
        const fullText = t('history.export.header') + '\n\n' + lines.join('\n');
        if (navigator.share) {
            try { await navigator.share({ text: fullText }); showToast(t('modal.copied'), 'success'); } catch (e) {}
            return;
        }
        const ta = document.createElement('textarea');
        ta.value = fullText; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); showToast(t('modal.copied'), 'success'); }
        catch (e) { showToast(t('result.copyFailed'), 'error'); }
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
            if (query) countEl.textContent = t('history.found') + ': ' + filtered.length + ' / ' + list.length;
            else countEl.textContent = t('history.total') + ': ' + list.length;
        }
        container.innerHTML = '';
        if (!list.length) {
            if (empty) { empty.textContent = t('history.empty'); empty.style.display = 'block'; }
            if (noResults) noResults.style.display = 'none';
            renderUsageStats(); return;
        }
        if (!filtered.length) {
            if (empty) empty.style.display = 'none';
            if (noResults) { noResults.textContent = t('history.noResults'); noResults.style.display = 'block'; }
            renderUsageStats(); return;
        }
        if (empty) empty.style.display = 'none';
        if (noResults) noResults.style.display = 'none';
        const groups = { today: [], yesterday: [], week: [], older: [] };
        filtered.forEach(item => { groups[getDateGroup(item.date).key].push(item); });
        const groupOrder = [
            { key: 'today', title: t('history.today') },
            { key: 'yesterday', title: t('history.yesterday') },
            { key: 'week', title: t('history.week') },
            { key: 'older', title: t('history.older') }
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
            box.innerHTML = '<div class="chart-empty"><span class="chart-empty-icon">📊</span>' + t('history.stats.empty') + '</div>'; return;
        }
        const maxCount = Math.max(...entries.map(e => e.count), 1);
        let html = '<div class="bar-chart-h">';
        entries.forEach((entry, idx) => {
            const width = (entry.count / maxCount * 100);
            html += `<div class="bar-row" style="animation-delay:${idx * 0.05}s;"><div class="bar-row-label">${escapeHtml(t('cat.' + entry.id))}</div><div class="bar-row-track"><div class="bar-row-fill" style="width:${width}%; --bar-color:${entry.cat.accent};"></div></div><div class="bar-row-value">${entry.count}×</div></div>`;
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
        btn.textContent = t('history.stats.show');
    } else {
        panel.style.display = 'block';
        btn.classList.add('open');
        btn.textContent = t('history.stats.hide');
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

function renderHistoryPreview() {
    try {
        const previewBox = el('history-preview');
        const statsBox = el('history-quick-stats');
        if (!previewBox || !statsBox) return;

        const list = loadHistory();
        const favs = loadFavorites();

        previewBox.innerHTML = '';

        if (!list.length) {
            previewBox.innerHTML = `
                <div class="hp-empty">
                    <div class="hp-empty-icon">✨</div>
                    <div>
                        <div style="font-weight:700; color: var(--text-main); margin-bottom:2px;">${t('history.empty')}</div>
                    </div>
                </div>
            `;
            previewBox.onclick = () => openHistoryScreen();
        } else {
            const last = list[0];
            const d = new Date(last.date);
            const now = new Date();
            const diffMin = Math.round((now - d) / 60000);
            let timeStr;
            if (diffMin < 1) timeStr = currentLang === 'en' ? 'just now' : 'upravo sad';
            else if (diffMin < 60) timeStr = (currentLang === 'en' ? 'min ago: ' : 'pre ') + diffMin + (currentLang === 'en' ? '' : ' min');
            else if (diffMin < 1440) timeStr = (currentLang === 'en' ? 'h ago: ' : 'pre ') + Math.round(diffMin / 60) + (currentLang === 'en' ? '' : 'h');
            else timeStr = d.toLocaleDateString(currentLang === 'en' ? 'en-GB' : 'sr-RS');

            const fullText = (last.text || '').replace(/\s+/g, ' ').trim();
            const shortText = fullText.length > 100 ? fullText.slice(0, 100) + '…' : fullText;

            previewBox.innerHTML = `
                <div class="hp-last-label">
                    <span>${currentLang === 'en' ? 'Last calculation' : 'Poslednje računanje'}</span>
                    <span class="hp-last-time">${timeStr}</span>
                </div>
                <div class="hp-last-cat">${last.category} • ${last.label}</div>
                <div class="hp-last-text">${shortText}</div>
            `;
            previewBox.onclick = () => openHistoryScreen();
        }

        const total = list.length;
        const favCount = favs.length;
        const todayCount = list.filter(item => {
            const d = new Date(item.date);
            const today = new Date();
            return d.toDateString() === today.toDateString();
        }).length;

        statsBox.innerHTML = `
            <div class="hqs-item">
                <div class="hqs-value">${total}</div>
                <div class="hqs-label">${t('history.total')}</div>
            </div>
            <div class="hqs-item">
                <div class="hqs-value">${todayCount}</div>
                <div class="hqs-label">${t('history.today')}</div>
            </div>
            <div class="hqs-item">
                <div class="hqs-value">${favCount}</div>
                <div class="hqs-label">${currentLang === 'en' ? 'Favorites' : 'Favorita'}</div>
            </div>
        `;
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
        if (titleEl) titleEl.innerText = title || t('confirm.title');
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
    const selector = '.calc-btn-main, .copy-btn, .back-btn, .swap-btn, .settings-toggle-btn, .confirm-btn, .openings-add-btn, .fx-refresh-btn, .fx-swap-btn, .copy-btn-mini, .lista-clear-btn, .quick-tool, .all-tool, .tab-btn, .section-action-btn, .modal-fav-star, .weather-refresh-btn, .location-gps-btn, .weather-location, .icon-btn-text';
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
            themeBtn.textContent = isLight ? t('settings.theme.light') : t('settings.theme.dark');
        }
        const soundBtn = el('settings-sound-btn');
        if (soundBtn) soundBtn.textContent = settings.sound ? t('settings.sound.on') : t('settings.sound.off');
        const hapticBtn = el('settings-haptic-btn');
        if (hapticBtn) {
            if (!('vibrate' in navigator)) {
                hapticBtn.textContent = t('settings.haptic.unsupported');
                hapticBtn.disabled = true;
                hapticBtn.style.opacity = '0.5';
            } else {
                hapticBtn.textContent = settings.haptic ? t('settings.haptic.on') : t('settings.haptic.off');
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
        if (typeof toggleLanguage === 'function') {
            // Ručno osveži UI
            if (typeof refreshUIText === 'function') refreshUIText();
            if (typeof renderQuickTools === 'function') renderQuickTools();
            if (typeof renderAllTools === 'function') renderAllTools();
            if (typeof renderFavorites === 'function') renderFavorites();
            if (typeof renderHistory === 'function') renderHistory();
            if (typeof updateSettingsUI === 'function') updateSettingsUI();
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
                btn.textContent = t('modal.copied');
                setTimeout(() => { btn.textContent = old; }, 1500);
            }
            showToast(t('result.copied'), 'success', 1800);
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
    catch (e) { showToast(t('result.copyFailed'), 'error'); }
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
            try { await navigator.share({ text: shareText }); showToast(t('modal.copied'), 'success'); } catch (e) {}
            return;
        }
        const ta = document.createElement('textarea');
        ta.value = shareText; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); showToast(t('modal.copied'), 'success'); }
        catch (e) { showToast(t('result.copyFailed'), 'error'); }
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
// KRAJ DELA A — NASTAVLJA SE DELOM B (VREME + RENDER)
// ============================================================// ============================================================
// VREME — LOGIKA
// ============================================================

const WEATHER_LOC_KEY = 'cx_weather_location_v1';
const WEATHER_CACHE_KEY = 'cx_weather_cache_v1';
const WEATHER_CACHE_TTL = 30 * 60 * 1000;
const AQI_CACHE_TTL = 60 * 60 * 1000;

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

// WMO Weather interpretation codes
const WMO_CODES = {
    0: 'clear',
    1: 'mostlyClear',
    2: 'partlyCloudy',
    3: 'cloudy',
    45: 'fog',
    48: 'fogFrost',
    51: 'drizzleLight',
    53: 'drizzle',
    55: 'drizzleHeavy',
    56: 'freezingDrizzleLight',
    57: 'freezingDrizzle',
    61: 'rainLight',
    63: 'rain',
    65: 'rainHeavy',
    66: 'freezingRainLight',
    67: 'freezingRain',
    71: 'snowLight',
    73: 'snow',
    75: 'snowHeavy',
    77: 'snowFlurries',
    80: 'showers',
    81: 'showers',
    82: 'showersHeavy',
    85: 'snowShowers',
    86: 'snowShowers',
    95: 'thunderstorm',
    96: 'thunderstormHail',
    99: 'thunderstormHailHeavy'
};

// Ikone po WMO kodu
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

// Mapa gradova za brzi fallback
const CITY_MAP = {
    'beograd': { name: 'Beograd', admin1: 'Srbija', country: 'Srbija', lat: 44.8176, lon: 20.4633 },
    'novi sad': { name: 'Novi Sad', admin1: 'Vojvodina', country: 'Srbija', lat: 45.2671, lon: 19.8335 },
    'nis': { name: 'Niš', admin1: 'Srbija', country: 'Srbija', lat: 43.3209, lon: 21.8958 },
    'kragujevac': { name: 'Kragujevac', admin1: 'Srbija', country: 'Srbija', lat: 44.0128, lon: 20.9114 },
    'subotica': { name: 'Subotica', admin1: 'Vojvodina', country: 'Srbija', lat: 46.1003, lon: 19.6655 },
    'zrenjanin': { name: 'Zrenjanin', admin1: 'Vojvodina', country: 'Srbija', lat: 45.3786, lon: 20.3909 },
    'pancevo': { name: 'Pančevo', admin1: 'Vojvodina', country: 'Srbija', lat: 44.8708, lon: 20.6403 },
    'cacak': { name: 'Čačak', admin1: 'Srbija', country: 'Srbija', lat: 43.8914, lon: 20.3497 },
    'kraljevo': { name: 'Kraljevo', admin1: 'Srbija', country: 'Srbija', lat: 43.7259, lon: 20.6895 },
    'novi pazar': { name: 'Novi Pazar', admin1: 'Srbija', country: 'Srbija', lat: 43.1367, lon: 20.5122 },
    'leskovac': { name: 'Leskovac', admin1: 'Srbija', country: 'Srbija', lat: 42.9981, lon: 21.9461 },
    'zajecar': { name: 'Zaječar', admin1: 'Srbija', country: 'Srbija', lat: 43.9040, lon: 22.2889 },
    'smederevo': { name: 'Smederevo', admin1: 'Srbija', country: 'Srbija', lat: 44.6628, lon: 20.9303 },
    'valjevo': { name: 'Valjevo', admin1: 'Srbija', country: 'Srbija', lat: 44.2742, lon: 19.8870 },
    'sabac': { name: 'Šabac', admin1: 'Srbija', country: 'Srbija', lat: 44.7481, lon: 19.6961 },
    'uzice': { name: 'Užice', admin1: 'Srbija', country: 'Srbija', lat: 43.8580, lon: 19.8486 },
    'sombor': { name: 'Sombor', admin1: 'Vojvodina', country: 'Srbija', lat: 45.7742, lon: 19.1122 },
    'pozarevac': { name: 'Požarevac', admin1: 'Srbija', country: 'Srbija', lat: 44.6217, lon: 21.1878 },
    'priboj': { name: 'Priboj', admin1: 'Srbija', country: 'Srbija', lat: 43.5814, lon: 19.5258 }
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

// Geocoding
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

// Fetch weather
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

// Fetch AQI
async function fetchAQI(lat, lon) {
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}` +
        `&current=european_aqi,pm2_5,pm10,nitrogen_dioxide,ozone,sulphur_dioxide` +
        `&hourly=alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen` +
        `&timezone=auto&forecast_days=1`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
}

// Inicijalizacija VREME taba
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
    const body = el('calc-body');
    if (!body) return;
    if (tabId === 'prognoza') updateWeatherPrognoza();
    else if (tabId === 'vazduh') updateWeatherVazduh();
    else if (tabId === 'pametni') updateWeatherPametni();
    else if (tabId === 'sunce') updateWeatherSunce();
}

async function refreshWeather() {
    const btn = document.querySelector('.weather-refresh-btn');
    if (btn) btn.classList.add('spinning');
    setTimeout(() => { if (btn) btn.classList.remove('spinning'); }, 700);
    showToast(t('weather.refreshing'), 'info', 1500);
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
    if (results) results.innerHTML = '<div class="location-empty">' + t('weather.location.empty') + '</div>';
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
        results.innerHTML = '<div class="location-empty">' + t('weather.location.minChars') + '</div>';
        return;
    }
    results.innerHTML = '<div class="location-empty">' + t('weather.location.searching') + '</div>';
    const found = await geocodeCity(q);
    if (!found.length) {
        results.innerHTML = '<div class="location-empty">' + t('weather.location.noResults') + ' "' + escapeHtml(q) + '".</div>';
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
    showToast(t('weather.location.selected') + ': ' + loc.name, 'success', 1500);
    vibrate(20);
    playTick(0, 1500, 0.08, 0.03);
    setTimeout(() => {
        const tabId = activeTab || 'prognoza';
        loadWeatherData(tabId);
    }, 200);
}

function useGPSLocation() {
    if (!navigator.geolocation) {
        showToast(t('weather.location.gpsUnsupported'), 'error');
        return;
    }
    showToast(t('weather.location.gpsSearching'), 'info', 2000);
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
        (err) => {
            showToast(t('weather.location.gpsError'), 'error', 2500);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    );
}

// ============ RENDER FUNKCIJE ZA VREME ============

function renderWeatherPrognoza() {
    return `
        <div id="weather-prognoza-content">
            <div class="weather-loading">
                <div class="weather-loading-row"></div>
                <div class="weather-loading-row"></div>
                <div class="weather-loading-row"></div>
            </div>
        </div>
    `;
}

function renderWeatherVazduh() {
    return `
        <div id="weather-vazduh-content">
            <div class="weather-loading">
                <div class="weather-loading-row"></div>
                <div class="weather-loading-row"></div>
            </div>
        </div>
    `;
}

function renderWeatherPametni() {
    return `
        <div id="weather-pametni-content">
            <div class="weather-loading">
                <div class="weather-loading-row"></div>
                <div class="weather-loading-row"></div>
                <div class="weather-loading-row"></div>
            </div>
        </div>
    `;
}

function renderWeatherSunce() {
    return `
        <div id="weather-sunce-content">
            <div class="weather-loading">
                <div class="weather-loading-row"></div>
                <div class="weather-loading-row"></div>
            </div>
        </div>
    `;
}

function weatherLocationHeader() {
    const loc = weatherState.location;
    if (!loc) return '';
    const name = loc.name + (loc.admin1 && loc.admin1 !== loc.name ? ', ' + loc.admin1 : '');
    const staleBadge = weatherState.stale ? '<span class="weather-stale-badge">' + t('weather.stale') + '</span>' : '';
    return `
        <div class="weather-location-row">
            <div class="weather-location" onclick="openLocationModal()" title="${t('weather.location.title')}">
                ${icon('mapPin')}
                <span class="weather-location-name">${escapeHtml(name)}</span>
                ${staleBadge}
            </div>
            <button class="weather-refresh-btn" onclick="refreshWeather()" title="${t('weather.refresh')}">
                ${icon('refresh')}
            </button>
        </div>
    `;
}

function getWeatherInfo(code) {
    const key = WMO_CODES[code];
    if (!key) return { text: t('weather.condition.unknown'), icon: 'cloud' };
    return { text: t('weather.condition.' + key), icon: WMO_ICONS[code] || 'cloud' };
}

function formatHour(isoStr) {
    const d = new Date(isoStr);
    return String(d.getHours()).padStart(2, '0') + ':00';
}

function formatDayName(isoStr, index) {
    if (index === 0) return t('weather.day.today');
    if (index === 1) return t('weather.day.tomorrow');
    const d = new Date(isoStr);
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    return t('weather.day.' + days[d.getDay()]);
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
                <div class="weather-error-title">${t('weather.error.noData')}</div>
                <div class="weather-error-text">${t('weather.error.checkInternet')}</div>
                <button class="weather-error-btn" onclick="refreshWeather()">${t('weather.error.retry')}</button>
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
                <div class="weather-hour-icon" style="color: var(--qt-accent, #38bdf8);">${icon(wInfo.icon)}</div>
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
                <div class="weather-day-icon" style="color: var(--qt-accent, #38bdf8);">${icon(wInfo.icon)}</div>
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
                    <div class="weather-feels">${t('weather.feels')} ${feels}°</div>
                </div>
            </div>
            <div class="weather-meta-row">
                <div class="weather-meta-item">${icon('wind')} ${wind} km/h</div>
                <div class="weather-meta-item">${icon('droplets')} ${humidity}%</div>
                <div class="weather-meta-item">${icon('sun')} UV ${Math.round(current.uv_index || 0)}</div>
            </div>
        </div>
        <div class="weather-section-title">${t('weather.section.hourly')}</div>
        <div class="weather-hourly">${hourlyHtml}</div>
        <div class="weather-section-title">${t('weather.section.daily')}</div>
        <div class="weather-daily-list">${dailyHtml}</div>
    `;
}

function generateDayComment(code, tMax, tMin, rainProb, windMax) {
    const comments = [];
    if (code >= 95) comments.push(t('weather.comment.thunderstorm'));
    else if (code >= 71 && code <= 77) comments.push(t('weather.comment.snow'));
    else if (code >= 61 && code <= 67) comments.push(t('weather.comment.rain'));
    else if (code >= 51 && code <= 57) comments.push(t('weather.comment.drizzle'));
    else if (code === 45 || code === 48) comments.push(t('weather.comment.fog'));
    else if (code === 0 || code === 1) comments.push(t('weather.comment.clear'));
    else comments.push(t('weather.comment.cloudy'));

    if (rainProb > 70 && code < 51) comments.push(t('weather.comment.possibleRain'));
    if (windMax > 40) comments.push(t('weather.comment.windy'));
    if (tMax > 30) comments.push(t('weather.comment.hot'));
    if (tMin < 0) comments.push(t('weather.comment.frost'));
    if (tMax - tMin > 15) comments.push(t('weather.comment.bigTempDiff'));

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
                <div class="weather-error-title">${t('weather.error.noAirQuality')}</div>
                <div class="weather-error-text">${t('weather.error.noAirQualityText')}</div>
                <button class="weather-error-btn" onclick="refreshWeather()">${t('weather.error.retry')}</button>
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
                    <span class="pollen-name">${t('weather.pollen.' + pt.nameKey)}</span>
                    <span class="pollen-value ${levelKey}">${t('weather.pollen.' + levelKey)}</span>
                </div>
            `;
        });
    }

    box.innerHTML = `
        ${weatherLocationHeader()}
        <div class="aqi-card" style="--aqi-color: ${aqiColor};">
            <div class="aqi-value">${Math.round(aqiVal)}</div>
            <div class="aqi-info">
                <div class="aqi-label">${t('weather.aqi.' + aqiKey)}</div>
                <div class="aqi-sub">${t('weather.aqi.subtitle')}</div>
            </div>
        </div>
        <div class="weather-section-title">${t('weather.section.pollutants')}</div>
        ${aqi.pm2_5 !== undefined ? `<div class="aqi-pollutant-row"><span class="aqi-pollutant-name">PM2.5</span><span class="aqi-pollutant-value">${Math.round(aqi.pm2_5)} µg/m³</span></div>` : ''}
        ${aqi.pm10 !== undefined ? `<div class="aqi-pollutant-row"><span class="aqi-pollutant-name">PM10</span><span class="aqi-pollutant-value">${Math.round(aqi.pm10)} µg/m³</span></div>` : ''}
        ${aqi.nitrogen_dioxide !== undefined ? `<div class="aqi-pollutant-row"><span class="aqi-pollutant-name">NO₂</span><span class="aqi-pollutant-value">${Math.round(aqi.nitrogen_dioxide)} µg/m³</span></div>` : ''}
        ${aqi.ozone !== undefined ? `<div class="aqi-pollutant-row"><span class="aqi-pollutant-name">O₃</span><span class="aqi-pollutant-value">${Math.round(aqi.ozone)} µg/m³</span></div>` : ''}
        ${aqi.sulphur_dioxide !== undefined ? `<div class="aqi-pollutant-row"><span class="aqi-pollutant-name">SO₂</span><span class="aqi-pollutant-value">${Math.round(aqi.sulphur_dioxide)} µg/m³</span></div>` : ''}
        ${pollenHtml ? `<div class="weather-section-title">${t('weather.section.pollen')}</div>${pollenHtml}` : ''}
    `;
}

function updateWeatherPametni() {
    const box = el('weather-pametni-content');
    if (!box) return;
    const { current, hourly, daily, loading } = weatherState;
    if (loading && !current) {
        box.innerHTML = `<div class="weather-loading"><div class="weather-loading-row"></div><div class="weather-loading-row"></div><div class="weather-loading-row"></div></div>`;
        return;
    }
    if (!current) {
        box.innerHTML = `
            <div class="weather-error">
                <div class="weather-error-icon">🤔</div>
                <div class="weather-error-title">${t('weather.error.noData')}</div>
                <div class="weather-error-text">${t('weather.error.retry')}.</div>
                <button class="weather-error-btn" onclick="refreshWeather()">${t('weather.error.retry')}</button>
            </div>
        `;
        return;
    }

    const temp = Math.round(current.temperature_2m);
    const feels = Math.round(current.apparent_temperature);
    const wind = Math.round(current.wind_speed_10m);
    const uv = Math.round(current.uv_index || 0);
    const code = current.weather_code;

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
            if (score < bestScore) {
                bestScore = score;
                bestHour = t2;
            }
        }
    }
    const bestHourText = bestHour
        ? `${String(bestHour.getHours()).padStart(2, '0')}:00 — ${String((bestHour.getHours() + 2) % 24).padStart(2, '0')}:00`
        : t('weather.smart.morningEvening');

    const toBring = [];
    if (hourly && hourly.precipitation_probability) {
        const maxRain = Math.max(...hourly.precipitation_probability.slice(0, 12));
        if (maxRain > 40) toBring.push({ yes: true, text: t('weather.smart.umbrellaRain', maxRain) });
        else toBring.push({ yes: false, text: t('weather.smart.noUmbrella') });
    }
    if (uv >= 5) toBring.push({ yes: true, text: t('weather.smart.sunglasses', uv) });
    if (wind > 30) toBring.push({ yes: true, text: t('weather.smart.windJacket', wind) });
    if (feels < 5) toBring.push({ yes: true, text: t('weather.smart.hatGloves') });

    const activities = [];
    const rainNext6 = hourly && hourly.precipitation_probability
        ? Math.max(...hourly.precipitation_probability.slice(0, 6)) : 0;
    if (rainNext6 < 30 && temp > 5 && temp < 28) {
        activities.push({ yes: true, text: t('weather.smart.running.ideal') });
    } else if (rainNext6 > 60) {
        activities.push({ yes: false, text: t('weather.smart.running.rain') });
    } else {
        activities.push({ warn: true, text: t('weather.smart.running.check') });
    }
    if (wind < 25 && rainNext6 < 40) {
        activities.push({ yes: true, text: t('weather.smart.bike.good') });
    } else {
        activities.push({ warn: true, text: t('weather.smart.bike.bad') });
    }
    if (uv >= 7) {
        activities.push({ warn: true, text: t('weather.smart.walk.avoidNoon') });
    } else {
        activities.push({ yes: true, text: t('weather.smart.walk.pleasant') });
    }

    box.innerHTML = `
        ${weatherLocationHeader()}
        <div class="smart-card" style="--smart-accent: #ec4899;">
            <div class="smart-head">
                <div class="smart-icon">${icon('users')}</div>
                <div class="smart-title">${t('weather.smart.clothes')}</div>
            </div>
            <div class="smart-text">${escapeHtml(t('weather.smart.clothes.' + clothesKey))}</div>
        </div>
        <div class="smart-card" style="--smart-accent: #f59e0b;">
            <div class="smart-head">
                <div class="smart-icon">${icon('clock')}</div>
                <div class="smart-title">${t('weather.smart.whenToGoOut')}</div>
            </div>
            <div class="smart-text">${t('weather.smart.bestTime')} <strong>${bestHourText}</strong></div>
        </div>
        <div class="smart-card" style="--smart-accent: #06b6d4;">
            <div class="smart-head">
                <div class="smart-icon">${icon('target')}</div>
                <div class="smart-title">${t('weather.smart.whatToBring')}</div>
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
                <div class="smart-title">${t('weather.smart.activities')}</div>
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
                <div class="weather-error-title">${t('weather.error.noData')}</div>
                <div class="weather-error-text">${t('weather.error.retry')}.</div>
                <button class="weather-error-btn" onclick="refreshWeather()">${t('weather.error.retry')}</button>
            </div>
        `;
        return;
    }

    const today = {
        sunrise: daily.sunrise[0],
        sunset: daily.sunset[0]
    };

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

    let goldenMorning = '—', goldenEvening = '—';
    let blueMorning = '—', blueEvening = '—';
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

    const cloudCoverAvg = daily.weather_code ? daily.weather_code[0] : 0;
    let visibilityKey = 'visibilityExcellent';
    if (cloudCoverAvg >= 3) visibilityKey = 'visibilityPoor';
    else if (cloudCoverAvg >= 2) visibilityKey = 'visibilityGood';

    box.innerHTML = `
        ${weatherLocationHeader()}
        <div class="celestial-card">
            <div class="celestial-title">${icon('sunrise')} ${t('weather.celestial.sun')}</div>
            <div class="celestial-row">
                <span class="celestial-label">${t('weather.celestial.sunrise')}</span>
                <span class="celestial-value">${sunriseStr}</span>
            </div>
            <div class="celestial-row">
                <span class="celestial-label">${t('weather.celestial.sunset')}</span>
                <span class="celestial-value">${sunsetStr}</span>
            </div>
            <div class="celestial-row">
                <span class="celestial-label">${t('weather.celestial.dayLength')}</span>
                <span class="celestial-value">${dayLength}</span>
            </div>
        </div>
        <div class="celestial-card">
            <div class="celestial-title">${icon('eye')} ${t('weather.celestial.photographers')}</div>
            <div class="celestial-row">
                <span class="celestial-label">${t('weather.celestial.goldenMorning')}</span>
                <span class="celestial-value">${goldenMorning}</span>
            </div>
            <div class="celestial-row">
                <span class="celestial-label">${t('weather.celestial.goldenEvening')}</span>
                <span class="celestial-value">${goldenEvening}</span>
            </div>
            <div class="celestial-row">
                <span class="celestial-label">${t('weather.celestial.blueMorning')}</span>
                <span class="celestial-value">${blueMorning}</span>
            </div>
            <div class="celestial-row">
                <span class="celestial-label">${t('weather.celestial.blueEvening')}</span>
                <span class="celestial-value">${blueEvening}</span>
            </div>
        </div>
        <div class="celestial-card">
            <div class="celestial-title">${icon('moon')} ${t('weather.celestial.moon')}</div>
            <div class="celestial-row">
                <span class="celestial-label">${t('weather.celestial.moonPhase')}</span>
                <span class="celestial-value">${t('moon.' + moonPhase.key)} (${moonPhase.illumination}%)</span>
            </div>
        </div>
        <div class="celestial-card">
            <div class="celestial-title">${icon('star')} ${t('weather.celestial.starrySky')}</div>
            <div class="celestial-row">
                <span class="celestial-label">${t('weather.celestial.visibility')}</span>
                <span class="celestial-value">${t('weather.celestial.' + visibilityKey)}</span>
            </div>
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
// RENDER POMOĆNE FUNKCIJE
// ============================================================

function inputField(labelKey, id, unit = '', extra = '') {
    const unitHtml = unit ? `<span class="unit">${escapeHtml(unit)}</span>` : '';
    return `
        <div class="input-field">
            <label>${t(labelKey)}</label>
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
            <label>${t(labelKey)}</label>
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
            <label>${t(labelKey)}</label>
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
            <label>${t(labelKey)}</label>
            <select id="${id}" class="custom-input">${opts}</select>
        </div>
    `;
}
function dateTripleField(labelKey, dateId) {
    return `
        <div class="input-field">
            <label>${t(labelKey)}</label>
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
    return `<button class="calc-btn-main" onclick="${onclick}">${t(textKey)}</button>`;
}
function resultCard(boxId, iconName, labelKey, valueId, unit, category, historyLabel) {
    return `
        <div id="${boxId}" class="result-card-green" style="display: none;">
            <div class="res-left">
                <div class="pump-icon">${icon(iconName)}</div>
                <div>
                    <div class="res-label">${t(labelKey)}</div>
                    <h2><span id="${valueId}">0</span> <small>${escapeHtml(unit)}</small></h2>
                </div>
            </div>
            <div class="res-actions">
                <button class="copy-btn" onclick="copyResult('${valueId}', '${unit}', event)">${t('result.copy')}</button>
                <button class="copy-btn" data-category="${escapeHtml(category)}" data-label="${escapeHtml(historyLabel)}" onclick="saveHistory(this)">${t('result.save')}</button>
                <button class="copy-btn" data-category="${escapeHtml(category)}" data-label="${escapeHtml(historyLabel)}" onclick="shareResult(this)">${t('result.share')}</button>
            </div>
        </div>
    `;
}
function resultCardText(boxId, iconName, labelKey, valueId, category, historyLabel) {
    return `
        <div id="${boxId}" class="result-card-green" style="display: none;">
            <div class="res-left">
                <div class="pump-icon">${icon(iconName)}</div>
                <div>
                    <div class="res-label">${t(labelKey)}</div>
                    <h3 id="${valueId}" class="res-text">—</h3>
                </div>
            </div>
            <div class="res-actions">
                <button class="copy-btn" onclick="copyResult('${valueId}', '', event)">${t('result.copy')}</button>
                <button class="copy-btn" data-category="${escapeHtml(category)}" data-label="${escapeHtml(historyLabel)}" onclick="saveHistory(this)">${t('result.save')}</button>
                <button class="copy-btn" data-category="${escapeHtml(category)}" data-label="${escapeHtml(historyLabel)}" onclick="shareResult(this)">${t('result.share')}</button>
            </div>
        </div>
    `;
}
function statsRow(boxId, items) {
    const html = items.map(it => `<div class="stat-item"><span class="stat-label">${t(it[0])}</span><strong id="${it[1]}">${escapeHtml(it[2] || '—')}</strong></div>`).join('');
    return `<div id="${boxId}" class="stats-row" style="display: none; margin-top: 12px;">${html}</div>`;
}
function sectionDesc(text) { return `<p class="section-desc">${text}</p>`; }
function sectionDescKey(key) { return `<p class="section-desc">${t(key)}</p>`; }

// ====================== AUTO ======================

function renderAutoPotrosnja() {
    return `
        <div class="converter-box">
            ${inputField('label.auto.distance', 'distance', 'km', 'placeholder="500"')}
            ${inputField('label.auto.fuel', 'fuel', 'L', 'step="0.1" placeholder="35"')}
            ${inputFieldWithSelect('label.auto.price', 'price', 'auto-currency', ['RSD', 'EUR'], '180')}
            ${calcButton('btn.calculate.consumption', 'calculateAuto()')}
        </div>
        ${resultCard('result-box', 'fuel', 'label.auto.avgConsumption', 'res-consumption', 'L/100km', 'AUTO', 'label.auto.fuelConsumption')}
        ${statsRow('stats-row', [
            ['label.auto.distance', 'stat-dist', '0 km'],
            ['label.auto.fuel', 'stat-fuel', '0 L'],
            ['label.auto.total', 'stat-cost', '—']
        ])}
        <div id="fuel-history-wrap" style="display:none; margin-top: 16px;">
            <div class="converter-box fuel-history-box">
                <div class="section-desc" style="margin-bottom:10px;">${t('label.auto.fuelChart')}</div>
                <div id="fuel-history-chart-real"></div>
                <div id="fuel-history-summary" class="fuel-history-summary"></div>
                <button class="copy-btn history-danger-btn" style="margin-top:10px; width:100%;" onclick="clearFuelHistory()">${t('btn.clearFuelHistory')}</button>
            </div>
        </div>
    `;
}

function renderAutoPlaner() {
    return `
        <div class="converter-box">
            ${sectionDescKey('desc.auto.tripPlanner')}
            ${inputField('label.auto.distance', 'trip-distance', 'km', 'placeholder="300"')}
            ${inputField('label.auto.avgSpeed', 'trip-speed', 'km/h', 'placeholder="80"')}
            <div class="input-field">
                <label>${t('label.auto.departTime')}</label>
                <div class="input-wrapper"><input type="time" id="trip-depart" class="custom-input"></div>
            </div>
            ${inputField('label.auto.breakDuration', 'trip-breaks', 'min', 'placeholder="30"')}
            ${calcButton('btn.calculate.trip', 'calculateTripPlanner()')}
        </div>
        ${resultCard('trip-result-box', 'route', 'label.auto.tripTime', 'res-trip-time', '', 'PUTOVANJE', 'label.auto.tripPlanner')}
        ${statsRow('trip-stats-row', [
            ['label.auto.eta', 'stat-trip-eta', '—'],
            ['label.auto.totalWithBreaks', 'stat-trip-total', '0']
        ])}
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
            ${calcButton('btn.calculate.tripCost', 'calculateRoadTrip()')}
        </div>
        ${resultCard('road-result-box', 'coins', 'label.auto.totalTripCost', 'res-road-total', 'RSD', 'PUTOVANJE', 'label.auto.tripCost')}
        ${statsRow('road-stats-row', [
            ['label.auto.fuel', 'stat-road-fuel', '0 RSD'],
            ['label.auto.perPerson', 'stat-road-person', '0 RSD'],
            ['label.auto.litersNeeded', 'stat-road-liters', '0 L']
        ])}
    `;
}

function renderAutoServis() {
    return `
        <div class="converter-box">
            ${sectionDescKey('desc.auto.service')}
            ${inputField('label.auto.currentKm', 'current-km', 'km', 'placeholder="150000"')}
            ${inputField('label.auto.lastServiceKm', 'last-service-km', 'km', 'placeholder="140000"')}
            ${inputField('label.auto.serviceInterval', 'service-interval', 'km', 'value="10000"')}
            ${calcButton('btn.calculate.service', 'calculateService()')}
        </div>
        <div id="service-result-box" class="result-card-green" style="display: none;">
            <div class="res-left">
                <div class="pump-icon">${icon('wrench')}</div>
                <div>
                    <div class="res-label" id="res-service-label">${t('label.auto.nextService')}</div>
                    <h2><span id="res-service-km">0</span> <small>km</small></h2>
                </div>
            </div>
            <div class="res-actions">
                <button class="copy-btn" onclick="copyResult('res-service-km', 'km', event)">${t('result.copy')}</button>
                <button class="copy-btn" data-category="AUTO" data-label="Servis" onclick="saveHistory(this)">${t('result.save')}</button>
                <button class="copy-btn" data-category="AUTO" data-label="Servis" onclick="shareResult(this)">${t('result.share')}</button>
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
            ${calcButton('btn.calculate.annual', 'calculateAnnualCost()')}
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
            ${calcButton('btn.calculate.costPerKm', 'calculateCostPerKm()')}
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
            <div class="res-left">
                <div class="pump-icon">${icon('car')}</div>
                <div>
                    <div class="res-label">${t('label.auto.saved')}</div>
                    <h3 id="res-auto-profile-val" class="res-text">—</h3>
                </div>
            </div>
        </div>
        ${statsRow('auto-profile-status-row', [
            ['label.auto.registration', 'stat-reg-days', '—'],
            ['label.auto.technical', 'stat-teh-days', '—']
        ])}
    `;
}

// ====================== BICIKL ======================

function renderBikeBrzina() {
    return `
        <div class="converter-box">
            ${sectionDescKey('desc.bike.speed')}
            ${inputField('label.bike.frontChainring', 'bike-front', '', 'placeholder="32"')}
            ${inputField('label.bike.rearChainring', 'bike-rear', '', 'placeholder="18"')}
            ${inputField('label.bike.cadence', 'bike-cadence', 'rpm', 'placeholder="90"')}
            ${inputField('label.bike.wheelSize', 'bike-wheel-inch', 'inča', 'placeholder="29"')}
            ${calcButton('btn.calculate.speed', 'calculateBike()')}
        </div>
        ${resultCard('bike-result-box', 'bike', 'label.bike.calcSpeed', 'res-bike-speed', 'km/h', 'BICIKL', 'label.bike.speed')}
        ${statsRow('bike-stats-row', [
            ['label.bike.gearRatio', 'stat-gear-ratio', '0'],
            ['label.bike.wheelDevelopment', 'stat-development', '0 m']
        ])}
    `;
}

function renderBikePritisak() {
    return `
        <div class="converter-box">
            ${sectionDescKey('desc.bike.pressure')}
            ${inputField('label.bike.totalWeight', 'bike-rider-weight', 'kg', 'placeholder="80"')}
            ${inputField('label.bike.tireWidth', 'bike-tire-width', 'mm', 'placeholder="28"')}
            ${selectField('label.bike.tireType', 'bike-tire-type', [
                { value: 'tube', text: t('option.bike.tube') },
                { value: 'tubeless', text: t('option.bike.tubeless') }
            ])}
            ${calcButton('btn.calculate.pressure', 'calculateBikePressure()')}
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
                { value: 'mtb', text: t('option.bike.mtb') },
                { value: 'road', text: t('option.bike.road') },
                { value: 'trekking', text: t('option.bike.trekking') }
            ])}
            ${calcButton('btn.calculate.frame', 'calculateBikeFrame()')}
        </div>
        <div id="bike-frame-result-box" class="result-card-green" style="display: none;">
            <div class="res-left">
                <div class="pump-icon">${icon('ruler')}</div>
                <div>
                    <div class="res-label">${t('label.bike.recommendedFrame')}</div>
                    <h2><span id="res-bike-frame-size">0</span> <small id="res-bike-frame-unit">${t('unit.inch')}</small></h2>
                </div>
            </div>
            <div class="res-actions">
                <button class="copy-btn" onclick="copyResult('res-bike-frame-size', 'res-bike-frame-unit', event)">${t('result.copy')}</button>
                <button class="copy-btn" data-category="BICIKL" data-label="Frame size" onclick="saveHistory(this)">${t('result.save')}</button>
                <button class="copy-btn" data-category="BICIKL" data-label="Frame size" onclick="shareResult(this)">${t('result.share')}</button>
            </div>
        </div>
        ${statsRow('bike-frame-stats-row', [
            ['label.bike.sizeLabel', 'stat-frame-label', 'M'],
            ['label.bike.inOtherUnits', 'stat-frame-alt', '0']
        ])}
    `;
}

function renderBikeKalorije() {
    return `
        <div class="converter-box">
            ${sectionDescKey('desc.bike.calories')}
            ${inputField('label.bike.riderWeight', 'bike-cal-weight', 'kg', 'placeholder="75"')}
            ${inputField('label.bike.rideDuration', 'bike-cal-time', 'min', 'placeholder="60"')}
            ${inputField('label.bike.avgSpeed', 'bike-cal-speed', 'km/h', 'placeholder="20"')}
            ${calcButton('btn.calculate.calories', 'calculateBikeCalories()')}
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
            ${calcButton('btn.calculate.gearTable', 'calculateGearTable()')}
        </div>
        <div id="gear-table-wrap" style="display:none;">
            <div id="gear-skeleton-box" class="converter-box gear-table-box" style="display:none;">
                <div class="gear-skeleton">
                    <div class="gear-skeleton-row"></div>
                    <div class="gear-skeleton-row"></div>
                    <div class="gear-skeleton-row"></div>
                    <div class="gear-skeleton-row"></div>
                    <div class="gear-skeleton-row"></div>
                </div>
            </div>
            <div id="gear-table-real" class="converter-box gear-table-box">
                <div id="gear-table-scroll">
                    <table id="gear-table" class="gear-table"></table>
                </div>
            </div>
        </div>
    `;
}

// ====================== NOVAC ======================

function renderMoneyPopust() {
    return `
        <div class="converter-box">
            ${inputField('label.money.originalPrice', 'money-price', 'RSD', 'placeholder="2500"')}
            ${inputField('label.money.discountPercent', 'money-discount', '%', 'placeholder="20"')}
            ${calcButton('btn.calculate.discount', 'calculateMoney()')}
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
                { value: 'add', text: t('option.money.addVat') },
                { value: 'extract', text: t('option.money.extractVat') }
            ])}
            ${calcButton('btn.calculate.vat', 'calculatePDV()')}
        </div>
        ${resultCard('pdv-result-box', 'percent', 'label.money.totalAmount', 'res-pdv-total', 'RSD', 'NOVAC', 'label.money.vat')}
        ${statsRow('pdv-stats-row', [
            ['label.money.base', 'stat-pdv-base', '0 RSD'],
            ['label.money.vatAmount', 'stat-pdv-tax', '0 RSD']
        ])}
    `;
}

function renderMoneyProcenat() {
    return `
        <div class="converter-box">
            <label class="pct-label">${t('pct.label1')}</label>
            <div class="pct-row">
                <input type="number" id="np-base" class="custom-input pct-input" placeholder="${t('pct.price')}" inputmode="decimal">
                <select id="np-op" class="custom-input pct-select">
                    <option value="add">+ %</option>
                    <option value="sub">− %</option>
                </select>
                <input type="number" id="np-val" class="custom-input pct-input" placeholder="%" inputmode="decimal">
            </div>
            ${calcButton('btn.calculate', 'calculateMoneyPercent1()')}
        </div>
        <div id="np1-result-box" class="result-card-green" style="display: none;">
            <div class="res-left">
                <div class="pump-icon">${icon('percent')}</div>
                <div>
                    <div class="res-label">${t('result.label')}</div>
                    <h2><span id="res-np1-val">0</span> <small id="res-np1-unit">RSD</small></h2>
                </div>
            </div>
            <div class="res-actions">
                <button class="copy-btn" onclick="copyResult('res-np1-val', 'res-np1-unit', event)">${t('result.copy')}</button>
                <button class="copy-btn" data-category="NOVAC" data-label="Procenat" onclick="saveHistory(this)">${t('result.save')}</button>
                <button class="copy-btn" data-category="NOVAC" data-label="Procenat" onclick="shareResult(this)">${t('result.share')}</button>
            </div>
            <div class="pct-formula" id="np1-formula"></div>
        </div>
        <div class="converter-box" style="margin-top: 16px;">
            <label class="pct-label">${t('pct.label2')}</label>
            <div class="pct-row">
                <input type="number" id="np-x" class="custom-input pct-input" placeholder="${t('pct.part')}" inputmode="decimal">
                <input type="number" id="np-y" class="custom-input pct-input" placeholder="${t('pct.total')}" inputmode="decimal">
            </div>
            ${calcButton('btn.calculate', 'calculateMoneyPercent2()')}
        </div>
        <div id="np2-result-box" class="result-card-green" style="display: none;">
            <div class="res-left">
                <div class="pump-icon">${icon('percent')}</div>
                <div>
                    <div class="res-label">${t('result.label')}</div>
                    <h2><span id="res-np2-val">0</span> <small>%</small></h2>
                </div>
            </div>
            <div class="res-actions">
                <button class="copy-btn" onclick="copyResult('res-np2-val', '%', event)">${t('result.copy')}</button>
                <button class="copy-btn" data-category="NOVAC" data-label="Procenat" onclick="saveHistory(this)">${t('result.save')}</button>
                <button class="copy-btn" data-category="NOVAC" data-label="Procenat" onclick="shareResult(this)">${t('result.share')}</button>
            </div>
            <div class="pct-formula" id="np2-formula"></div>
        </div>
    `;
}

function renderMoneyKredit() {
    return `
        <div class="converter-box">
            ${selectField('label.money.loanCurrency', 'credit-currency', [
                { value: 'RSD', text: 'RSD — ' + t('currency.rsd') },
                { value: 'EUR', text: 'EUR — ' + t('currency.eur') },
                { value: 'CHF', text: 'CHF — ' + t('currency.chf') },
                { value: 'USD', text: 'USD — ' + t('currency.usd') }
            ], 'RSD')}
            <div class="input-field">
                <label>${t('label.money.loanAmount')}</label>
                <div class="input-wrapper">
                    <input type="number" id="loan-amount" class="custom-input" placeholder="1000000" inputmode="decimal">
                    <span class="unit" id="loan-amount-unit">RSD</span>
                </div>
            </div>
            ${inputField('label.money.annualRate', 'loan-rate', '%', 'value="6.5" step="0.1"')}
            ${inputField('label.money.loanPeriod', 'loan-months', t('unit.monthsShort'), 'value="60"')}
            ${calcButton('btn.calculate.loan', 'calculateLoan()')}
        </div>
        ${resultCard('loan-result-box', 'creditCard', 'label.money.monthlyPayment', 'res-loan-monthly', 'RSD/mes', 'NOVAC', 'label.money.loan')}
        ${statsRow('loan-stats-row', [
            ['label.money.totalInterest', 'stat-loan-interest', '0 RSD'],
            ['label.money.totalRepayment', 'stat-loan-total', '0 RSD']
        ])}
        <div id="loan-amort-wrap" style="display:none; margin-top: 16px;">
            <div class="converter-box">
                <div class="section-desc" style="margin-bottom: 10px;">${t('label.money.amortPlan')}</div>
                <div class="amort-scroll" style="margin-top: 12px;">
                    <table id="amort-table" class="amort-table">
                        <thead><tr>
                            <th>${t('table.month')}</th>
                            <th>${t('table.payment')}</th>
                            <th>${t('table.interest')}</th>
                            <th>${t('table.principal')}</th>
                            <th>${t('table.balance')}</th>
                        </tr></thead>
                        <tbody id="amort-body"></tbody>
                    </table>
                </div>
                <button class="copy-btn" style="margin-top:10px; width:100%;" onclick="toggleAmortPreview()" id="amort-toggle-btn">${t('btn.show12months')}</button>
            </div>
        </div>
    `;
}

function renderMoneyValuta() {
    return `
        <div class="converter-box">
            <div class="fx-head">
                <div class="section-desc" style="margin-bottom: 0;">${t('label.money.exchangeList')} — <span id="fx-updated-label">${t('label.money.manualEntry')}</span></div>
                <button class="fx-refresh-btn" onclick="refreshExchangeRates()" title="${t('weather.refresh')}">${icon('refresh')}</button>
            </div>
            <div class="input-field">
                <label>${t('label.money.amount')}</label>
                <div class="input-wrapper">
                    <input type="number" id="fx-amount" class="custom-input" placeholder="1000" inputmode="decimal" oninput="calculateCurrency()">
                </div>
            </div>
            <div class="fx-row">
                <div class="input-field fx-col">
                    <label>${t('label.money.fromCurrency')}</label>
                    <select id="fx-from" class="custom-input" onchange="calculateCurrency()"></select>
                </div>
                <button class="fx-swap-btn" onclick="swapCurrencies()" title="${t('label.money.swap')}">${icon('swap')}</button>
                <div class="input-field fx-col">
                    <label>${t('label.money.toCurrency')}</label>
                    <select id="fx-to" class="custom-input" onchange="calculateCurrency()"></select>
                </div>
            </div>
            ${calcButton('btn.calculate', 'calculateCurrency()')}
        </div>
        <div id="fx-result-box" class="result-card-green" style="display: none;">
            <div class="res-left">
                <div class="pump-icon">${icon('exchange')}</div>
                <div>
                    <div class="res-label">${t('result.label')}</div>
                    <h2><span id="res-fx-val">0</span> <small id="res-fx-unit">EUR</small></h2>
                </div>
            </div>
            <div class="res-actions">
                <button class="copy-btn" onclick="copyResult('res-fx-val', 'res-fx-unit', event)">${t('result.copy')}</button>
                <button class="copy-btn" data-category="NOVAC" data-label="Kursna lista" onclick="saveHistory(this)">${t('result.save')}</button>
                <button class="copy-btn" data-category="NOVAC" data-label="Kursna lista" onclick="shareResult(this)">${t('result.share')}</button>
            </div>
        </div>
        <div class="fx-rate-info" id="fx-rate-info"></div>
        <div class="converter-box fx-list-box">
            <div class="section-desc" style="margin-bottom: 10px;">${t('label.money.ratesList')}</div>
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
            ${calcButton('btn.calculate.split', 'calculateSplit()')}
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
            ${calcButton('btn.calculate.tip', 'calculateTip()')}
        </div>
        ${resultCard('tip-result-box', 'handshake', 'label.money.tipAmount', 'res-tip-val', 'RSD', 'NOVAC', 'label.money.tip')}
        ${statsRow('tip-stats-row', [
            ['label.money.totalToPay', 'stat-tip-total', '0 RSD'],
            ['label.money.perPerson', 'stat-tip-per-person', '0 RSD']
        ])}
    `;
}

// ====================== MERE ======================

function measureTab(prefix, labelKey, units, fromDefault = '', toDefault = '') {
    const fromOpts = units.map(u => ({ value: u.v, text: t(u.tKey), sel: u.v === fromDefault }));
    const toOpts = units.map(u => ({ value: u.v, text: t(u.tKey), sel: u.v === toDefault }));
    const fnName = 'calculate' + prefix.charAt(0).toUpperCase() + prefix.slice(1);
    return `
        <div class="converter-box">
            <div class="input-field">
                <label>${t('label.measures.value')}</label>
                <div class="input-wrapper">
                    <input type="number" id="${prefix}-val" class="custom-input" placeholder="0" inputmode="decimal" oninput="${fnName}()">
                </div>
            </div>
            <div class="input-field">
                <label>${t('label.measures.from')}</label>
                <select id="${prefix}-from" class="custom-input" onchange="${fnName}()">
                    ${fromOpts.map(o => `<option value="${o.value}"${o.sel ? ' selected' : ''}>${escapeHtml(o.text)}</option>`).join('')}
                </select>
            </div>
            <div class="swap-icon-container">
                <button class="swap-btn" onclick="swapInputs('${prefix}-from', '${prefix}-to'); ${fnName}();">${t('btn.swap')}</button>
            </div>
            <div class="input-field">
                <label>${t('label.measures.to')}</label>
                <select id="${prefix}-to" class="custom-input" onchange="${fnName}()">
                    ${toOpts.map(o => `<option value="${o.value}"${o.sel ? ' selected' : ''}>${escapeHtml(o.text)}</option>`).join('')}
                </select>
            </div>
            ${calcButton('btn.calculate', `${fnName}()`)}
        </div>
        <div id="${prefix}-result-box" class="result-card-green" style="display: none;">
            <div class="res-left">
                <div class="pump-icon">${icon('ruler')}</div>
                <div>
                    <div class="res-label">${t('result.label')}</div>
                    <h2><span id="res-${prefix}-val">0</span> <small id="res-${prefix}-unit"></small></h2>
                </div>
            </div>
            <div class="res-actions">
                <button class="copy-btn" onclick="copyResult('res-${prefix}-val', 'res-${prefix}-unit', event)">${t('result.copy')}</button>
                <button class="copy-btn" data-category="MERE" data-label="${escapeHtml(t(labelKey))}" onclick="saveHistory(this)">${t('result.save')}</button>
                <button class="copy-btn" data-category="MERE" data-label="${escapeHtml(t(labelKey))}" onclick="shareResult(this)">${t('result.share')}</button>
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
            <div class="input-field">
                <label>${t('label.measures.value')}</label>
                <div class="input-wrapper"><input type="number" id="temp-val" class="custom-input" placeholder="25" inputmode="decimal" oninput="calculateTemp()"></div>
            </div>
            <div class="input-field">
                <label>${t('label.measures.from')}</label>
                <select id="temp-from" class="custom-input" onchange="calculateTemp()">
                    <option value="c">${t('option.measures.celsius')}</option>
                    <option value="f">${t('option.measures.fahrenheit')}</option>
                    <option value="k">${t('option.measures.kelvin')}</option>
                </select>
            </div>
            <div class="swap-icon-container">
                <button class="swap-btn" onclick="swapInputs('temp-from', 'temp-to'); calculateTemp();">${t('btn.swap')}</button>
            </div>
            <div class="input-field">
                <label>${t('label.measures.to')}</label>
                <select id="temp-to" class="custom-input" onchange="calculateTemp()">
                    <option value="f">${t('option.measures.fahrenheit')}</option>
                    <option value="c">${t('option.measures.celsius')}</option>
                    <option value="k">${t('option.measures.kelvin')}</option>
                </select>
            </div>
            ${calcButton('btn.calculate', 'calculateTemp()')}
        </div>
        <div id="temp-result-box" class="result-card-green" style="display: none;">
            <div class="res-left">
                <div class="pump-icon">${icon('thermometer')}</div>
                <div>
                    <div class="res-label">${t('result.label')}</div>
                    <h2><span id="res-temp-val">0</span> <small id="res-temp-unit">°F</small></h2>
                </div>
            </div>
            <div class="res-actions">
                <button class="copy-btn" onclick="copyResult('res-temp-val', 'res-temp-unit', event)">${t('result.copy')}</button>
                <button class="copy-btn" data-category="MERE" data-label="Temperature" onclick="saveHistory(this)">${t('result.save')}</button>
                <button class="copy-btn" data-category="MERE" data-label="Temperature" onclick="shareResult(this)">${t('result.share')}</button>
            </div>
        </div>
    `;
}

function renderMeasuresProcenat() {
    return `
        <div class="converter-box">
            <label class="pct-label">${t('pct.label1')}</label>
            <div class="pct-row">
                <input type="number" id="pct-base" class="custom-input pct-input" placeholder="${t('pct.number')}" inputmode="decimal">
                <select id="pct-op" class="custom-input pct-select">
                    <option value="add">+ %</option>
                    <option value="sub">− %</option>
                </select>
                <input type="number" id="pct-val" class="custom-input pct-input" placeholder="%" inputmode="decimal">
            </div>
            ${calcButton('btn.calculate', 'calculatePercent1()')}
        </div>
        <div id="pct1-result-box" class="result-card-green" style="display: none;">
            <div class="res-left">
                <div class="pump-icon">${icon('percent')}</div>
                <div>
                    <div class="res-label">${t('result.label')}</div>
                    <h2><span id="res-pct1-val">0</span></h2>
                </div>
            </div>
            <div class="res-actions">
                <button class="copy-btn" onclick="copyResult('res-pct1-val', '', event)">${t('result.copy')}</button>
                <button class="copy-btn" data-category="MERE" data-label="Percentage" onclick="saveHistory(this)">${t('result.save')}</button>
                <button class="copy-btn" data-category="MERE" data-label="Percentage" onclick="shareResult(this)">${t('result.share')}</button>
            </div>
            <div class="pct-formula" id="pct1-formula"></div>
        </div>
        <div class="converter-box" style="margin-top: 16px;">
            <label class="pct-label">${t('pct.label2short')}</label>
            <div class="pct-row">
                <input type="number" id="pct-x" class="custom-input pct-input" placeholder="X" inputmode="decimal">
                <input type="number" id="pct-y" class="custom-input pct-input" placeholder="Y" inputmode="decimal">
            </div>
            ${calcButton('btn.calculate', 'calculatePercent2()')}
        </div>
        <div id="pct2-result-box" class="result-card-green" style="display: none;">
            <div class="res-left">
                <div class="pump-icon">${icon('percent')}</div>
                <div>
                    <div class="res-label">${t('result.label')}</div>
                    <h2><span id="res-pct2-val">0</span> <small>%</small></h2>
                </div>
            </div>
            <div class="res-actions">
                <button class="copy-btn" onclick="copyResult('res-pct2-val', '%', event)">${t('result.copy')}</button>
                <button class="copy-btn" data-category="MERE" data-label="Percentage" onclick="saveHistory(this)">${t('result.save')}</button>
                <button class="copy-btn" data-category="MERE" data-label="Percentage" onclick="shareResult(this)">${t('result.share')}</button>
            </div>
            <div class="pct-formula" id="pct2-formula"></div>
        </div>
        <div class="converter-box" style="margin-top: 16px;">
            <label class="pct-label">${t('pct.label3')}</label>
            <div class="pct-row">
                <input type="number" id="pct-from" class="custom-input pct-input" placeholder="${t('pct.from')}" inputmode="decimal">
                <input type="number" id="pct-to" class="custom-input pct-input" placeholder="${t('pct.to')}" inputmode="decimal">
            </div>
            ${calcButton('btn.calculate', 'calculatePercent3()')}
        </div>
        <div id="pct3-result-box" class="result-card-green" style="display: none;">
            <div class="res-left">
                <div class="pump-icon">${icon('percent')}</div>
                <div>
                    <div class="res-label">${t('pct.change')}</div>
                    <h2><span id="res-pct3-val">0</span> <small>%</small></h2>
                </div>
            </div>
            <div class="res-actions">
                <button class="copy-btn" onclick="copyResult('res-pct3-val', '%', event)">${t('result.copy')}</button>
                <button class="copy-btn" data-category="MERE" data-label="Percentage change" onclick="saveHistory(this)">${t('result.save')}</button>
                <button class="copy-btn" data-category="MERE" data-label="Percentage change" onclick="shareResult(this)">${t('result.share')}</button>
            </div>
            <div class="pct-formula" id="pct3-formula"></div>
        </div>
    `;
}

// ============================================================
// KRAJ DELA B — NASTAVLJA SE DELOM C (KALKULACIJE + INIT)
// ============================================================// ============================================================
// PROCENAT — KALKULACIJE
// ============================================================

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
    if (base === null || pct === null) { showToast(t('toast.error.enterNumber'), 'error'); return; }
    const res = percentAddSub(base, pct, op);
    if (!res) return;
    const rv = el('res-pct1-val'); if (rv) rv.innerText = fmt(res.result, 2);
    setFormula('pct1-formula', res.formula);
    show('pct1-result-box');
}
function calculatePercent2() {
    const x = num('pct-x'), y = num('pct-y');
    if (x === null || y === null || y === 0) { showToast(t('toast.error.enterXY'), 'error'); return; }
    const res = percentXofY(x, y);
    if (!res) return;
    const rv = el('res-pct2-val'); if (rv) rv.innerText = fmt(res.result, 2);
    setFormula('pct2-formula', res.formula);
    show('pct2-result-box');
}
function calculatePercent3() {
    const from = num('pct-from'), to = num('pct-to');
    if (from === null || to === null || from === 0) { showToast(t('toast.error.enterStartEnd'), 'error'); return; }
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
    if (base === null || pct === null) { showToast(t('toast.error.enterPricePercent'), 'error'); return; }
    const res = percentAddSub(base, pct, op);
    if (!res) return;
    const rv = el('res-np1-val'); if (rv) rv.innerText = money(res.result);
    const ru = el('res-np1-unit'); if (ru) ru.innerText = 'RSD';
    setFormula('np1-formula', res.formula + ' RSD');
    show('np1-result-box');
}
function calculateMoneyPercent2() {
    const x = num('np-x'), y = num('np-y');
    if (x === null || y === null || y === 0) { showToast(t('toast.error.enterPartTotal'), 'error'); return; }
    const res = percentXofY(x, y);
    if (!res) return;
    const rv = el('res-np2-val'); if (rv) rv.innerText = fmt(res.result, 2);
    setFormula('np2-formula', res.formula);
    show('np2-result-box');
}

// ============================================================
// AUTO — KALKULACIJE
// ============================================================

function calculateAuto() {
    const dist = num('distance'), fuel = num('fuel');
    const price = num('price') || 0;
    const currency = el('auto-currency') ? el('auto-currency').value : 'RSD';
    if (!dist || !fuel) { showToast(t('toast.error.enterDistanceFuel'), 'error'); return; }
    const consumption = (fuel * 100) / dist;
    const totalCost = fuel * price;
    const rc = el('res-consumption'); if (rc) rc.innerText = fmt(consumption, 2);
    const sd = el('stat-dist'); if (sd) sd.innerText = fmt(dist) + ' km';
    const sf = el('stat-fuel'); if (sf) sf.innerText = fmt(fuel) + ' L';
    const sc = el('stat-cost'); if (sc) sc.innerText = price > 0 ? fmt(totalCost, 0) + ' ' + currency : '—';
    if (price > 0) { try { localStorage.setItem('cx_fuel_price', String(price)); } catch (e) {} }
    show('result-box'); show('stats-row');
    logFuelEntry(consumption, dist, fuel);
}
function calculateService() {
    const currentKm = num('current-km'), lastService = num('last-service-km'), interval = num('service-interval');
    if (currentKm === null || lastService === null || !interval) { showToast(t('toast.error.enterAll'), 'error'); return; }
    const nextServiceKm = lastService + interval;
    const remainingKm = nextServiceKm - currentKm;
    const lbl = el('res-service-label'), km = el('res-service-km');
    if (remainingKm >= 0) { if (lbl) lbl.innerText = t('label.auto.nextService'); if (km) km.innerText = fmt(remainingKm, 0); }
    else { if (lbl) lbl.innerText = t('label.auto.serviceOverdue'); if (km) km.innerText = fmt(-remainingKm, 0); }
    const sn = el('stat-service-next'); if (sn) sn.innerText = fmt(nextServiceKm, 0) + ' km';
    show('service-result-box'); show('service-stats-row');
}
function calculateAnnualCost() {
    const reg = num('cost-reg') || 0, fuelYear = num('cost-fuel-year') || 0;
    const total = reg + fuelYear;
    if (total === 0) { showToast(t('toast.error.enterAtLeastOne'), 'error'); return; }
    const at = el('res-annual-total'); if (at) at.innerText = money(total);
    const am = el('stat-annual-month'); if (am) am.innerText = money(total / 12) + ' RSD';
    show('annual-result-box'); show('annual-stats-row');
}
function calculateCostPerKm() {
    const dist = num('pokm-dist');
    const fuelCost = num('pokm-fuel-cost') || 0, serviceCost = num('pokm-service-cost') || 0, regCost = num('pokm-reg-cost') || 0;
    if (!dist) { showToast(t('toast.error.enterDistance'), 'error'); return; }
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
    if (!distance || !speed) { showToast(t('toast.error.enterDistanceSpeed'), 'error'); return; }
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
    if (!distance || !consumption || !price) { showToast(t('toast.error.enterAll'), 'error'); return; }
    const liters = (distance / 100) * consumption;
    const fuelCost = liters * price;
    const totalCost = fuelCost + toll + parking + other;
    const perPerson = totalCost / people;
    const rt = el('res-road-total'); if (rt) rt.innerText = money(totalCost);
    const rf = el('stat-road-fuel'); if (rf) rf.innerText = money(fuelCost) + ' RSD';
    const rp = el('stat-road-person'); if (rp) rp.innerText = money(perPerson) + ' RSD';
    const rl = el('stat-road-liters'); if (rl) rl.innerText = fmt(liters, 1) + ' L';
    show('road-result-box'); show('road-stats-row');
    try { localStorage.setItem('cx_fuel_price', String(price)); } catch (e) {}
}
function loadAutoProfile() { try { return JSON.parse(localStorage.getItem('cx_auto_profile')) || {}; } catch (e) { return {}; } }
function saveAutoProfileData(p) { try { localStorage.setItem('cx_auto_profile', JSON.stringify(p)); } catch (e) {} }
function daysUntil(dateStr) {
    if (!dateStr) return null;
    const target = parseDate(dateStr);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return Math.round((target - today) / 86400000);
}
function formatDaysLeft(days) {
    if (days === null) return '—';
    if (days < 0) return t('label.auto.expiredAgo') + ' ' + Math.abs(days) + ' ' + t('unit.daysShort');
    if (days === 0) return t('label.auto.expiresToday');
    return t('label.auto.daysLeft') + ' ' + days + ' ' + t('unit.daysShort');
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
        if (rv) rv.innerText = profile.model ? `${profile.model}${profile.plate ? ' (' + profile.plate + ')' : ''}` : t('label.auto.dataSaved');
        show('auto-profile-result-box');
        showToast(t('toast.carSaved'), 'success');
        updateAutoStatus();
    } catch (e) {}
}
function loadFuelLog() { try { return JSON.parse(localStorage.getItem('cx_auto_fuel_log')) || []; } catch (e) { return []; } }
function saveFuelLog(log) { try { localStorage.setItem('cx_auto_fuel_log', JSON.stringify(log)); } catch (e) {} }
function logFuelEntry(consumption, dist, fuel) {
    try {
        const log = loadFuelLog();
        log.unshift({ date: Date.now(), consumption, dist, fuel });
        saveFuelLog(log.slice(0, 20));
        renderFuelHistory();
    } catch (e) {}
}
async function clearFuelHistory() {
    const ok = await showConfirm(t('confirm.clearFuelHistory'));
    if (!ok) return;
    saveFuelLog([]);
    renderFuelHistory();
    showToast(t('toast.historyCleared'), 'success');
}
function renderFuelHistory() {
    try {
        const log = loadFuelLog();
        const wrap = el('fuel-history-wrap');
        if (!wrap) return;
        if (!log.length) { wrap.style.display = 'none'; return; }
        wrap.style.display = 'block';
        const container = el('fuel-history-chart-real');
        if (!container) return;
        container.innerHTML = '';
        const entries = log.slice(0, 12).reverse();
        if (entries.length < 2) container.innerHTML = '<div class="chart-empty"><span class="chart-empty-icon">📈</span>' + t('chart.needTwoMeasurements') + '</div>';
        else renderLineChart(container, entries);
        const last5 = log.slice(0, 5);
        const avg5 = last5.reduce((a, e) => a + e.consumption, 0) / last5.length;
        const lastVal = log[0].consumption;
        let trend = '';
        if (log.length > 1) {
            const prevAvg = log.slice(1, 6).reduce((a, e) => a + e.consumption, 0) / Math.max(1, log.slice(1, 6).length);
            if (lastVal > prevAvg + 0.2) trend = ' ↑';
            else if (lastVal < prevAvg - 0.2) trend = ' ↓';
        }
        const sum = el('fuel-history-summary');
        if (sum) sum.innerHTML = `<span>${t('chart.last')}: <strong>${fmt(lastVal, 2)} L/100km${trend}</strong></span><span>${t('chart.avg5')}: <strong>${fmt(avg5, 2)} L/100km</strong></span>`;
    } catch (e) {}
}
function renderLineChart(container, entries) {
    const W = 320, H = 140, PAD = 30;
    const values = entries.map(e => e.consumption);
    const minVal = Math.min(...values) * 0.9, maxVal = Math.max(...values) * 1.1;
    const range = maxVal - minVal || 1;
    const points = entries.map((entry, i) => ({
        x: PAD + (i / (entries.length - 1)) * (W - 2 * PAD),
        y: H - PAD - ((entry.consumption - minVal) / range) * (H - 2 * PAD),
        entry
    }));
    let linePath = '';
    points.forEach((p, i) => { linePath += (i === 0 ? 'M' : 'L') + p.x + ' ' + p.y + ' '; });
    let areaPath = linePath + `L${points[points.length - 1].x} ${H - PAD} L${points[0].x} ${H - PAD} Z`;
    let gridLines = '';
    for (let i = 0; i <= 4; i++) {
        const y = PAD + (i / 4) * (H - 2 * PAD);
        const val = maxVal - (i / 4) * range;
        gridLines += `<line x1="${PAD}" y1="${y}" x2="${W - PAD}" y2="${y}" class="chart-grid-line"/><text x="${PAD - 4}" y="${y + 3}" text-anchor="end" class="chart-label">${val.toFixed(1)}</text>`;
    }
    let dots = '';
    points.forEach(p => { dots += `<circle cx="${p.x}" cy="${p.y}" r="4" class="chart-dot"><title>${fmt(p.entry.consumption, 2)} L/100km</title></circle>`; });
    container.innerHTML = `<svg viewBox="0 0 ${W} ${H}" class="chart-svg" preserveAspectRatio="none"><defs><linearGradient id="fuelGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f43f5e" stop-opacity="0.4"/><stop offset="100%" stop-color="#f43f5e" stop-opacity="0"/></linearGradient></defs>${gridLines}<path d="${areaPath}" fill="url(#fuelGradient)" stroke="none"/><path d="${linePath}" class="chart-line" style="stroke: #f43f5e;"/>${dots}</svg>`;
}

// ============================================================
// BICIKL — KALKULACIJE
// ============================================================

function calculateBike() {
    const front = num('bike-front'), rear = num('bike-rear'), cadence = num('bike-cadence'), wheelInch = num('bike-wheel-inch');
    if (!front || !rear || !cadence || !wheelInch) { showToast(t('toast.error.enterFour'), 'error'); return; }
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
    if (!weight || !width) { showToast(t('toast.error.enterWeightWidth'), 'error'); return; }
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
    if (!height) { showToast(t('toast.error.enterHeight'), 'error'); return; }
    let main, unit, alt;
    if (type === 'mtb') { const inch = height * 0.1; main = inch; unit = t('unit.inch'); alt = fmt(inch * 2.54, 0) + ' cm'; }
    else { const cm = height * 0.31; main = cm; unit = 'cm'; alt = fmt(cm / 2.54, 1) + ' ' + t('unit.inch'); }
    let sizeLabel;
    if (height < 165) sizeLabel = 'S'; else if (height < 178) sizeLabel = 'M'; else if (height < 188) sizeLabel = 'L'; else sizeLabel = 'XL';
    const fs = el('res-bike-frame-size'); if (fs) fs.innerText = fmt(main, 1);
    const fu = el('res-bike-frame-unit'); if (fu) fu.innerText = unit;
    const fl = el('stat-frame-label'); if (fl) fl.innerText = sizeLabel;
    const fa = el('stat-frame-alt'); if (fa) fa.innerText = alt;
    show('bike-frame-result-box'); show('bike-frame-stats-row');
}
function calculateBikeCalories() {
    const weight = num('bike-cal-weight'), timeMinutes = num('bike-cal-time'), speed = num('bike-cal-speed');
    if (!weight || !timeMinutes || !speed) { showToast(t('toast.error.enterAll'), 'error'); return; }
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
    if (!fronts.length || !rears.length) { showToast(t('toast.error.enterChainrings'), 'error'); return; }
    const wheelCircumference = wheelInch * 0.0254 * Math.PI;
    const table = el('gear-table'); if (!table) return;
    table.innerHTML = '';
    const headRow = document.createElement('tr');
    headRow.innerHTML = '<th>' + t('table.rearFront') + '</th>' + fronts.map(f => `<th>${f}</th>`).join('');
    table.appendChild(headRow);
    rears.forEach(r => {
        const row = document.createElement('tr');
        let cells = `<td class="gear-row-label">${r}</td>`;
        fronts.forEach(f => { cells += `<td>${fmt((cadence * (f / r) * wheelCircumference * 60) / 1000, 1)}</td>`; });
        row.innerHTML = cells;
        table.appendChild(row);
    });
    const wrap = el('gear-table-wrap'); if (wrap) wrap.style.display = 'block';
    const gs = el('gear-skeleton-box'), gr = el('gear-table-real');
    const combos = fronts.length * rears.length;
    if (combos > 24 && !reduceMotion) {
        if (gr) gr.style.display = 'none'; if (gs) gs.style.display = 'block';
        setTimeout(() => { if (gs) gs.style.display = 'none'; if (gr) gr.style.display = 'block'; vibrate(15); }, 350);
    } else {
        if (gs) gs.style.display = 'none'; if (gr) gr.style.display = 'block'; vibrate(15);
    }
}

// ============================================================
// NOVAC — KALKULACIJE
// ============================================================

function calculateMoney() {
    const price = num('money-price'), discount = num('money-discount');
    if (!price || discount === null || discount < 0 || discount > 100) { showToast(t('toast.error.enterPriceDiscount'), 'error'); return; }
    const saved = price * (discount / 100);
    const mf = el('res-money-final'); if (mf) mf.innerText = money(price - saved);
    const ms = el('stat-money-saved'); if (ms) ms.innerText = money(saved) + ' RSD';
    show('money-result-box'); show('money-stats-row');
}
function calculatePDV() {
    const amount = num('pdv-amount');
    let rate = num('pdv-rate');
    const type = el('pdv-type') ? el('pdv-type').value : 'add';
    if (!amount) { showToast(t('toast.error.enterAmount'), 'error'); return; }
    if (rate === null) rate = 20;
    let base, tax, total;
    if (type === 'add') { base = amount; tax = base * (rate / 100); total = base + tax; }
    else { total = amount; base = total / (1 + rate / 100); tax = total - base; }
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
    if (!amount || !months) { showToast(t('toast.error.enterAmountMonths'), 'error'); return; }
    const rateMonth = (rateYear / 100) / 12;
    let monthly;
    if (rateMonth === 0) monthly = amount / months;
    else monthly = (amount * rateMonth * Math.pow(1 + rateMonth, months)) / (Math.pow(1 + rateMonth, months) - 1);
    const totalReturn = monthly * months;
    const totalInterest = totalReturn - amount;
    const lm = el('res-loan-monthly'); if (lm) lm.innerText = money(monthly);
    const lmu = el('res-loan-monthly-unit'); if (lmu) lmu.innerText = currency + '/' + t('unit.month');
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
            btn.textContent = amortShowAll ? t('btn.showOnly12') : t('btn.showAll') + ' (' + currentAmortData.length + ') ' + t('unit.monthsShort');
        }
    }
}
function toggleAmortPreview() { amortShowAll = !amortShowAll; renderAmortPlan(); }

function calculateSplit() {
    const total = num('split-total'), people = num('split-people'), tip = num('split-tip') || 0;
    if (!total || !people || people < 1) { showToast(t('toast.error.enterAmountPeople'), 'error'); return; }
    const totalWithTip = total * (1 + tip / 100);
    const sv = el('res-split-val'); if (sv) sv.innerText = money(totalWithTip / people);
    const st = el('stat-split-total'); if (st) st.innerText = money(totalWithTip) + ' RSD';
    show('split-result-box'); show('split-stats-row');
}
function calculateTip() {
    const bill = num('tip-bill'), percent = num('tip-percent'), people = num('tip-people') || 1;
    if (!bill || percent === null) { showToast(t('toast.error.enterAmountPercent'), 'error'); return; }
    const tipAmount = bill * (percent / 100);
    const total = bill + tipAmount;
    const tv = el('res-tip-val'); if (tv) tv.innerText = money(tipAmount);
    const tt = el('stat-tip-total'); if (tt) tt.innerText = money(total) + ' RSD';
    const tp = el('stat-tip-per-person'); if (tp) tp.innerText = money(total / people) + ' RSD';
    show('tip-result-box'); show('tip-stats-row');
}

// ============================================================
// VALUTA — KALKULACIJE
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
    try { const raw = JSON.parse(localStorage.getItem(FX_STORAGE_KEY)); if (raw && raw.updated) return raw.updated; } catch (e) {}
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
async function fetchFromErApi() {
    const res = await fetch('https://open.er-api.com/v6/latest/RSD', { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if (!data || data.result !== 'success' || !data.rates) throw new Error('Neispravan');
    return data.rates;
}
async function fetchFromFrankfurter() {
    const supported = CURRENCIES.map(c => c.code).filter(code => code !== 'RSD');
    const res = await fetch(`https://api.frankfurter.app/latest?from=EUR&to=${supported.join(',')}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if (!data || !data.rates) throw new Error('Neispravan');
    return data.rates;
}
async function refreshExchangeRates(silent = false) {
    const btn = document.querySelector('.fx-refresh-btn');
    if (btn) btn.classList.add('spinning');
    setTimeout(() => { if (btn) btn.classList.remove('spinning'); }, 700);
    if (!silent) showToast(currentLang === 'en' ? 'Refreshing rates...' : 'Osvežavam kurseve...', 'info', 1500);
    let success = false, usedSource = '';
    try {
        const rates = await fetchFromErApi();
        CURRENCIES.forEach(c => {
            if (c.code === 'RSD') { c.rate = 1; return; }
            const rate = rates[c.code];
            if (typeof rate === 'number' && rate > 0) c.rate = Number((1 / rate).toFixed(4));
        });
        success = true; usedSource = 'open.er-api.com';
    } catch (e) { console.warn('er-api greška:', e.message); }
    if (!success) {
        try {
            const rates = await fetchFromFrankfurter();
            const eurToRsd = CURRENCIES.find(c => c.code === 'EUR').rate || 117.20;
            CURRENCIES.forEach(c => {
                if (c.code === 'RSD') { c.rate = 1; return; }
                if (c.code === 'EUR') { c.rate = eurToRsd; return; }
                const eurToCur = rates[c.code];
                if (typeof eurToCur === 'number' && eurToCur > 0) c.rate = Number((eurToRsd / eurToCur).toFixed(4));
            });
            success = true; usedSource = 'frankfurter.app';
        } catch (e) { console.warn('frankfurter greška:', e.message); }
    }
    if (success) {
        saveFxRates(); populateCurrencySelects(); renderFxList(); updateFxUpdatedLabel(); calculateCurrency();
        if (!silent) { showToast((currentLang === 'en' ? 'Rates refreshed (' : 'Kursevi osveženi (') + usedSource + ')', 'success', 2000); vibrate(20); playTick(0, 1400, 0.08, 0.03); }
    } else {
        loadFxRates(); populateCurrencySelects(); renderFxList(); updateFxUpdatedLabel(); calculateCurrency();
        if (!silent) {
            const hasCache = !!getFxLastUpdate();
            showToast(hasCache ? (currentLang === 'en' ? 'Using cached rates' : 'Koristim keširane kurseve') : (currentLang === 'en' ? 'No internet — using defaults' : 'Nema interneta — koristim podrazumevane'), 'warning', 2800);
        }
    }
}
function populateCurrencySelects() {
    const fromSel = el('fx-from'), toSel = el('fx-to');
    if (!fromSel || !toSel) return;
    const prevFrom = fromSel.value || 'RSD', prevTo = toSel.value || 'EUR';
    fromSel.innerHTML = ''; toSel.innerHTML = '';
    CURRENCIES.forEach(c => {
        const o1 = document.createElement('option');
        o1.value = c.code; o1.textContent = `${c.flag} ${c.code} — ${c.name}`; fromSel.appendChild(o1);
        const o2 = document.createElement('option');
        o2.value = c.code; o2.textContent = `${c.flag} ${c.code} — ${c.name}`; toSel.appendChild(o2);
    });
    fromSel.value = prevFrom || 'RSD'; toSel.value = prevTo || 'EUR';
}
function renderFxList() {
    const list = el('fx-list'); if (!list) return;
    list.innerHTML = '';
    CURRENCIES.forEach(c => {
        const item = document.createElement('div');
        item.className = 'fx-list-item'; item.dataset.code = c.code;
        item.innerHTML = `<div class="fx-flag">${c.flag}</div><div class="fx-list-info"><div class="fx-code">${c.code}</div><div class="fx-name">${c.name}</div></div><div class="fx-value">${fmt(c.rate, 4)}<small>RSD</small></div>`;
        item.addEventListener('click', () => {
            const toSel = el('fx-to');
            if (toSel) { toSel.value = c.code; calculateCurrency(); }
        });
        list.appendChild(item);
    });
    highlightFxSelected();
}
function highlightFxSelected() {
    const toSel = el('fx-to'); if (!toSel) return;
    const cur = toSel.value;
    document.querySelectorAll('.fx-list-item').forEach(item => item.classList.toggle('selected', item.dataset.code === cur));
}
function updateFxUpdatedLabel() {
    const label = el('fx-updated-label'); if (!label) return;
    const ts = getFxLastUpdate();
    label.textContent = ts ? ((currentLang === 'en' ? 'updated ' : 'osveženo ') + formatFxUpdated(ts)) : t('label.money.manualEntry');
}
function swapCurrencies() {
    const fromSel = el('fx-from'), toSel = el('fx-to');
    if (!fromSel || !toSel) return;
    const tmp = fromSel.value; fromSel.value = toSel.value; toSel.value = tmp;
    calculateCurrency(); highlightFxSelected(); vibrate(10);
}
function getCurrencyByCode(code) { return CURRENCIES.find(c => c.code === code); }
function calculateCurrency() {
    const amount = num('fx-amount');
    const fromSel = el('fx-from'), toSel = el('fx-to');
    if (!fromSel || !toSel) return;
    const fromCur = getCurrencyByCode(fromSel.value), toCur = getCurrencyByCode(toSel.value);
    const info = el('fx-rate-info');
    if (info && fromCur && toCur) info.innerHTML = `1 ${fromCur.code} = <strong>${fmt(fromCur.rate / toCur.rate, 4)}</strong> ${toCur.code}`;
    if (!amount) { hide('fx-result-box'); highlightFxSelected(); return; }
    if (!fromCur || !toCur) return;
    const result = (amount * fromCur.rate) / toCur.rate;
    const fv = el('res-fx-val'), fu = el('res-fx-unit');
    if (fv) fv.innerText = toCur.rate >= 50 ? money(result) : fmt(result, 2);
    if (fu) fu.innerText = toCur.code;
    show('fx-result-box'); highlightFxSelected();
}

// ============================================================
// ZDRAVLJE — KALKULACIJE
// ============================================================

function calculateBMI() {
    const weight = num('health-weight'), heightCm = num('health-height'), age = num('health-bmi-age');
    if (!weight || !heightCm) { showToast(t('toast.error.enterWeightHeight'), 'error'); return; }
    const bmi = weight / Math.pow(heightCm / 100, 2);
    let categoryKey;
    if (age !== null && age < 18) categoryKey = 'label.health.underageBmi';
    else if (bmi < 18.5) categoryKey = 'label.health.underweight';
    else if (bmi < 25) categoryKey = 'label.health.normalWeight';
    else if (bmi < 30) categoryKey = 'label.health.overweight';
    else categoryKey = 'label.health.obese';
    const bv = el('res-bmi-val'); if (bv) bv.innerText = fmt(bmi, 1);
    const bc = el('stat-bmi-category'); if (bc) bc.innerText = t(categoryKey);
    show('health-bmi-result-box'); show('health-bmi-stats-row');
}
function calculateIdealWeight() {
    const height = num('health-ideal-height');
    const gender = el('health-gender') ? el('health-gender').value : 'male';
    if (!height) { showToast(t('toast.error.enterHeight'), 'error'); return; }
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
    if (!weight || !height || !age) { showToast(t('toast.error.enterAll'), 'error'); return; }
    let bmr = (10 * weight) + (6.25 * height) - (5 * age) + (gender === 'male' ? 5 : -161);
    const bv = el('res-bmr-val'); if (bv) bv.innerText = fmt(bmr * activity, 0);
    const bb = el('stat-bmr-base'); if (bb) bb.innerText = fmt(bmr, 0) + ' kcal';
    show('bmr-result-box'); show('bmr-stats-row');
}
function calculateHeartRate() {
    const age = num('hr-age');
    if (!age) { showToast(t('toast.error.enterAge'), 'error'); return; }
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
    if (!distance) { showToast(t('toast.error.enterDistance'), 'error'); return; }
    const totalMinutes = min + (sec / 60);
    if (totalMinutes === 0) { showToast(t('toast.error.enterTime'), 'error'); return; }
    const paceMin = totalMinutes / distance;
    const paceMinWhole = Math.floor(paceMin), paceSec = Math.round((paceMin - paceMinWhole) * 60);
    const rp = el('res-run-pace'); if (rp) rp.innerText = `${paceMinWhole}:${String(paceSec).padStart(2, '0')}`;
    const rs = el('stat-run-speed'); if (rs) rs.innerText = fmt(distance / (totalMinutes / 60), 2) + ' km/h';
    const rt = el('stat-run-total'); if (rt) rt.innerText = `${min}min ${sec}s`;
    show('run-result-box'); show('run-stats-row');
}
function calculateBikeFitness() {
    const distance = num('fitbike-distance'), minutes = num('fitbike-min'), weight = num('fitbike-weight');
    if (!distance || !minutes || !weight) { showToast(t('toast.error.enterAll'), 'error'); return; }
    const hours = minutes / 60, speed = distance / hours;
    let met = 8.0;
    if (speed < 15) met = 6.0; else if (speed < 20) met = 8.0; else if (speed < 25) met = 10.0; else met = 12.0;
    const fs = el('res-fitbike-speed'); if (fs) fs.innerText = fmt(speed, 2);
    const fc = el('stat-fitbike-cal'); if (fc) fc.innerText = fmt(met * weight * hours, 0) + ' kcal';
    show('fitbike-result-box'); show('fitbike-stats-row');
}
function calculate1RM() {
    const weight = num('rm1-weight'), reps = num('rm1-reps');
    if (!weight || !reps || reps < 1 || reps > 15) { showToast(t('toast.error.enterWeightReps'), 'error'); return; }
    const rm = weight * (1 + reps / 30);
    const rv = el('res-rm1-val'); if (rv) rv.innerText = fmt(rm, 1);
    const r90 = el('stat-rm1-90'); if (r90) r90.innerText = fmt(rm * 0.9, 1) + ' kg';
    const r80 = el('stat-rm1-80'); if (r80) r80.innerText = fmt(rm * 0.8, 1) + ' kg';
    show('rm1-result-box'); show('rm1-stats-row');
}
function calculateWorkoutVolume() {
    const weight = num('vol-weight'), reps = num('vol-reps'), sets = num('vol-sets');
    if (!weight || !reps || !sets) { showToast(t('toast.error.enterAll'), 'error'); return; }
    const vv = el('res-vol-val'); if (vv) vv.innerText = money(weight * reps * sets);
    show('vol-result-box');
}

// ============================================================
// VREME I DATUMI — KALKULACIJE
// ============================================================

function parseDate(value) {
    if (!value) return null;
    const parts = value.split('-').map(Number);
    if (parts.length !== 3) return null;
    return new Date(parts[0], parts[1] - 1, parts[2]);
}
const SR_DAYS = ['nedelja', 'ponedeljak', 'utorak', 'sreda', 'četvrtak', 'petak', 'subota'];
const SR_MONTHS = ['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'];
const EN_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const EN_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function getDaysArr() { return currentLang === 'en' ? EN_DAYS : SR_DAYS; }
function getMonthsArr() { return currentLang === 'en' ? EN_MONTHS : SR_MONTHS; }
function calculateDateDifference() {
    const startVal = getTripleDate('start-date'), endVal = getTripleDate('end-date');
    if (!startVal || !endVal) { showToast(t('toast.error.enterBothDates'), 'error'); return; }
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
        if (currentLang === 'en') {
            dv.innerHTML = `${years} yr, ${months} mo, ${days} d<br>(${t('label.time.total')} ${fmt(totalDays, 0)} d)`;
        } else {
            dv.innerHTML = `${years} god, ${months} mes, ${days} dana<br>(ukupno ${fmt(totalDays, 0)} dana)`;
        }
    }
    show('result-date-box');
}
function calculateDateShift() {
    const startVal = getTripleDate('shift-date'), days = num('shift-days');
    const op = el('shift-op') ? el('shift-op').value : 'add';
    if (!startVal || days === null) { showToast(t('toast.error.enterDateDays'), 'error'); return; }
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
    if (!birthVal) { showToast(t('toast.error.enterBirthDate'), 'error'); return; }
    const birth = parseDate(birthVal);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (birth > today) { showToast(t('toast.error.futureDate'), 'error'); return; }
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
    if (an) an.innerText = daysToBday === 0 ? t('label.time.todayBirthday') : t('label.time.in') + ' ' + daysToBday + ' ' + t('unit.daysShort');
    show('age-result-box'); show('age-stats-row');
}
function calculateDayOfWeek() {
    const val = getTripleDate('dayofweek-date');
    if (!val) { showToast(t('toast.error.enterDate'), 'error'); return; }
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
    if (!startVal || !endVal) { showToast(t('toast.error.enterBothDates'), 'error'); return; }
    let start = parseDate(startVal), end = parseDate(endVal);
    if (start > end) { const t = start; start = end; end = t; }
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
    if (val === null) { showToast(t('toast.error.enterValue'), 'error'); return; }
    const result = val * TIME_SECONDS[from] / TIME_SECONDS[to];
    const tv = el('res-time-conv-val');
    if (tv) tv.innerText = `${fmt(result)} ${t(TIME_LABELS_KEY[to])}`;
    show('result-time-conv-box');
}

// ============================================================
// MERE — KALKULACIJE
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
function calculateVolumeConversion() { convertMeasure('volume', VOLUME_FACTORS, VOLUME_LABELS); }
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
// KUHINJA — KALKULACIJE
// ============================================================

const SPOON_GRAMS = { secer: 20, brasno: 10, so: 25, kakao: 8, med: 25, ulje: 15, mleko: 15, pirinac: 20, ovsene: 8, griz: 15 };
function calculateSpoon() {
    const ing = el('spoon-ingredient') ? el('spoon-ingredient').value : 'secer';
    const val = num('spoon-val');
    const from = el('spoon-from') ? el('spoon-from').value : 'kasika';
    const to = el('spoon-to') ? el('spoon-to').value : 'gram';
    if (val === null) { showToast(t('toast.error.enterValue'), 'error'); return; }
    let gPerSpoon = ing === 'custom' ? (num('spoon-custom-g') || 20) : (SPOON_GRAMS[ing] || 20);
    const smallSpoonG = gPerSpoon / 3;
    let grams;
    if (from === 'kasika') grams = val * gPerSpoon;
    else if (from === 'kasika_mala') grams = val * smallSpoonG;
    else grams = val;
    let result, unit;
    if (to === 'gram') { result = grams; unit = 'g'; }
    else if (to === 'kasika') { result = grams / gPerSpoon; unit = t('option.kitchen.tablespoonShort'); }
    else { result = grams / smallSpoonG; unit = t('option.kitchen.teaspoonShort'); }
    const sv = el('res-spoon-val'); if (sv) sv.innerText = fmt(result, 2);
    const su = el('res-spoon-unit'); if (su) su.innerText = unit;
    show('spoon-result-box');
}
const CUP_ML = { standard: 200, velika: 250, mala: 150, solja: 150, solja_caj: 250 };
function calculateCupConversion() {
    const type = el('cup-type') ? el('cup-type').value : 'standard';
    const val = num('cup-val');
    const from = el('cup-from') ? el('cup-from').value : 'casa';
    const to = el('cup-to') ? el('cup-to').value : 'ml';
    if (val === null) { showToast(t('toast.error.enterValue'), 'error'); return; }
    const mlPerCup = type === 'custom' ? (num('cup-custom-ml') || 200) : (CUP_ML[type] || 200);
    let ml;
    if (from === 'casa') ml = val * mlPerCup;
    else if (from === 'l') ml = val * 1000;
    else if (from === 'dl') ml = val * 100;
    else ml = val;
    let result, unit;
    if (to === 'ml') { result = ml; unit = 'ml'; }
    else if (to === 'l') { result = ml / 1000; unit = 'L'; }
    else if (to === 'dl') { result = ml / 100; unit = 'dL'; }
    else { result = ml / mlPerCup; unit = t('option.kitchen.cupShort'); }
    const cv = el('res-cup-val'); if (cv) cv.innerText = fmt(result, 2);
    const cu = el('res-cup-unit'); if (cu) cu.innerText = unit;
    show('cup-result-box');
}
function calculateOtherMeasure() {
    const type = el('other-type') ? el('other-type').value : 'prstohvat';
    const qty = num('other-qty');
    if (!qty) { showToast(t('toast.error.enterCount'), 'error'); return; }
    const gramsPer = { prstohvat: 0.5, prst: 2, saka: 50, kolut: 10, kocka: 5 };
    const og = el('res-other-g'); if (og) og.innerText = fmt(qty * (gramsPer[type] || 1), 1);
    show('other-result-box');
}
function calculateOven() {
    const from = el('oven-from') ? el('oven-from').value : 'c';
    const val = num('oven-val');
    const to = el('oven-to') ? el('oven-to').value : 'f';
    if (val === null) { showToast(t('toast.error.enterValue'), 'error'); return; }
    let celsius;
    if (from === 'f') celsius = (val - 32) * 5 / 9;
    else if (from === 'gas') {
        const gasToC = { 1: 140, 2: 150, 3: 170, 4: 180, 5: 190, 6: 200, 7: 220, 8: 230, 9: 240 };
        celsius = gasToC[Math.round(val)] || 180;
    } else celsius = val;
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
    const unit = el('portion-unit') ? (el('portion-unit').value.trim() || 'g') : 'g';
    if (!orig || !want || !qty) { showToast(t('toast.error.enterAll'), 'error'); return; }
    const factor = want / orig;
    const pv = el('res-portion-val'); if (pv) pv.innerText = fmt(qty * factor, 2);
    const pu = el('res-portion-unit'); if (pu) pu.innerText = unit;
    const pf = el('stat-portion-factor'); if (pf) pf.innerText = fmt(factor, 2) + '×';
    show('portion-result-box'); show('portion-stats-row');
}
const DRINK_DEFAULTS = {
    kafa_turska: { val: 1, unitKey: 'unit.teaspoon' },
    kafa_espreso: { val: 7, unitKey: 'unit.g' },
    kafa_filter: { val: 10, unitKey: 'unit.g' },
    caj_list: { val: 2, unitKey: 'unit.g' },
    caj_kesica: { val: 1, unitKey: 'unit.teabag' }
};
function calculateDrink() {
    const type = el('drink-type') ? el('drink-type').value : 'kafa_turska';
    const cups = num('drink-cups');
    if (!cups) { showToast(t('toast.error.enterCups'), 'error'); return; }
    const def = DRINK_DEFAULTS[type] || DRINK_DEFAULTS.kafa_turska;
    const dv = el('res-drink-val'); if (dv) dv.innerText = fmt(cups * def.val, 1);
    const du = el('res-drink-unit'); if (du) du.innerText = t(def.unitKey);
    show('drink-result-box');
}

// ============================================================
// GRAĐEVINA — KALKULACIJE
// ============================================================

let openingsData = { paint: [], tile: [], block: [], board: [] };
function addOpening(type) {
    openingsData[type].push({ name: '', w: 0, h: 0 });
    renderOpenings(type); vibrate(15); playTick(0, 1400, 0.06, 0.02);
}
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
        empty.className = 'opening-empty'; empty.textContent = t('label.home.noOpenings'); list.appendChild(empty); return;
    }
    openingsData[type].forEach((op, idx) => {
        const item = document.createElement('div');
        item.className = 'opening-item';
        const n = document.createElement('input');
        n.type = 'text'; n.placeholder = t('placeholder.name'); n.value = op.name || '';
        n.oninput = e => updateOpening(type, idx, 'name', e.target.value);
        const w = document.createElement('input');
        w.type = 'text'; w.inputMode = 'decimal'; w.placeholder = t('placeholder.widthShort'); w.value = op.w || '';
        w.oninput = e => updateOpening(type, idx, 'w', e.target.value);
        const h = document.createElement('input');
        h.type = 'text'; h.inputMode = 'decimal'; h.placeholder = t('placeholder.heightShort'); h.value = op.h || '';
        h.oninput = e => updateOpening(type, idx, 'h', e.target.value);
        const r = document.createElement('button');
        r.className = 'opening-remove'; r.textContent = '✕';
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
        if (!a || !b) { showToast(t('toast.error.enterLengthWidth'), 'error'); return; }
        area = a * b;
    } else if (type === 'square') {
        const s = num('shape-side'); if (!s) { showToast(t('toast.error.enterSide'), 'error'); return; }
        area = s * s;
    } else if (type === 'circle') {
        const d = num('shape-diameter'); if (!d) { showToast(t('toast.error.enterDiameter'), 'error'); return; }
        area = Math.PI * Math.pow(d / 2, 2);
    } else {
        const b = num('shape-base'), h = num('shape-height');
        if (!b || !h) { showToast(t('toast.error.enterBaseHeight'), 'error'); return; }
        area = (b * h) / 2;
    }
    const sa = el('res-shape-area'); if (sa) sa.innerText = fmt(area, 2);
    show('shape-result-box');
}
function calculatePaint() {
    const width = num('paint-width'), height = num('paint-height'), walls = num('paint-walls') || 0, coverage = num('paint-coverage') || 10;
    if (!width || !height || !walls) { showToast(t('toast.error.enterWallDims'), 'error'); return; }
    const netArea = Math.max(0, width * height * walls - getOpeningsArea('paint'));
    const pl = el('res-paint-liters'); if (pl) pl.innerText = fmt(netArea / coverage, 2);
    const pa = el('stat-paint-area'); if (pa) pa.innerText = fmt(netArea, 2) + ' m²';
    const po = el('stat-paint-openings'); if (po) po.innerText = fmt(getOpeningsArea('paint'), 2) + ' m²';
    show('paint-result-box'); show('paint-stats-row');
}
function calculateTiles() {
    const roomL = num('tile-room-l'), roomW = num('tile-room-w'), tileL = num('tile-l'), tileW = num('tile-w');
    const reserve = num('tile-reserve') || 0;
    if (!roomL || !roomW || !tileL || !tileW) { showToast(t('toast.error.enterAllDimensions'), 'error'); return; }
    const netArea = Math.max(0, roomL * roomW - getOpeningsArea('tile'));
    const tileArea = (tileL / 100) * (tileW / 100);
    const tilesBase = netArea / tileArea;
    const tc = el('res-tiles-count'); if (tc) tc.innerText = Math.ceil(tilesBase * (1 + reserve / 100));
    const ta = el('stat-tiles-area'); if (ta) ta.innerText = fmt(netArea, 2) + ' m²';
    const tn = el('stat-tiles-nores'); if (tn) tn.innerText = Math.ceil(tilesBase) + ' ' + t('unit.pcsShort');
    show('tiles-result-box'); show('tiles-stats-row');
}
function calculateLaminate() {
    const roomL = num('lam-room-l'), roomW = num('lam-room-w'), packArea = num('lam-pack'), reserve = num('lam-reserve') || 0;
    if (!roomL || !roomW || !packArea) { showToast(t('toast.error.enterAll'), 'error'); return; }
    const area = roomL * roomW;
    const lp = el('res-lam-packs'); if (lp) lp.innerText = Math.ceil((area * (1 + reserve / 100)) / packArea);
    const la = el('stat-lam-area'); if (la) la.innerText = fmt(area, 2) + ' m²';
    show('laminate-result-box'); show('laminate-stats-row');
}
function calculateConcrete() {
    const l = num('beton-l'), w = num('beton-w'), h = num('beton-h');
    if (!l || !w || !h) { showToast(t('toast.error.enterAllDimensions'), 'error'); return; }
    const bm = el('res-beton-m3'); if (bm) bm.innerText = fmt(l * w * h, 3);
    show('beton-result-box');
}
const BLOCK_DEFAULTS = {
    giter25: { l: 25, h: 19, w: 33 }, giter20: { l: 20, h: 19, w: 33 }, giter15: { l: 15, h: 19, w: 33 },
    siporeks: { l: 25, h: 20, w: 50 }, cigla: { l: 25, h: 12, w: 6.5 }
};
function updateBlockDefaults() {
    const type = el('block-type') ? el('block-type').value : '';
    if (type === 'custom' || !BLOCK_DEFAULTS[type]) return;
    const def = BLOCK_DEFAULTS[type];
    if (el('block-l')) el('block-l').value = def.l;
    if (el('block-h')) el('block-h').value = def.h;
    if (el('block-w')) el('block-w').value = def.w;
}
function calculateBlocks() {
    const wallL = num('block-wall-l'), wallH = num('block-wall-h'), blockL = num('block-l'), blockH = num('block-h');
    if (!wallL || !wallH || !blockL || !blockH) { showToast(t('toast.error.enterBlockWallDims'), 'error'); return; }
    const netArea = Math.max(0, wallL * wallH - getOpeningsArea('block'));
    const blocks = Math.ceil(netArea / ((blockL / 100) * (blockH / 100)));
    const bc = el('res-blocks-count'); if (bc) bc.innerText = blocks;
    const ba = el('stat-blocks-area'); if (ba) ba.innerText = fmt(netArea, 2) + ' m²';
    const price = num('block-price');
    const bp = el('stat-blocks-price'); if (bp) bp.innerText = price ? money(blocks * price) + ' RSD' : '—';
    show('blocks-result-box'); show('blocks-stats-row');
}
const BOARD_DEFAULTS = { osb: { l: 125, w: 250 }, regips: { l: 120, w: 200 }, sper: { l: 125, w: 250 }, iverica: { l: 183, w: 280 } };
function updateBoardDefaults() {
    const type = el('board-type') ? el('board-type').value : '';
    if (type === 'custom' || !BOARD_DEFAULTS[type]) return;
    const def = BOARD_DEFAULTS[type];
    if (el('board-l')) el('board-l').value = def.l;
    if (el('board-w')) el('board-w').value = def.w;
}
function calculateBoards() {
    const wallL = num('board-wall-l'), wallH = num('board-wall-h'), boardL = num('board-l'), boardW = num('board-w');
    const reserve = num('board-reserve') || 0;
    if (!wallL || !wallH || !boardL || !boardW) { showToast(t('toast.error.enterDimensions'), 'error'); return; }
    const netArea = Math.max(0, wallL * wallH - getOpeningsArea('board'));
    const singleArea = (boardL / 100) * (boardW / 100);
    const bc = el('res-boards-count'); if (bc) bc.innerText = Math.ceil((netArea / singleArea) * (1 + reserve / 100));
    const ba = el('stat-boards-area'); if (ba) ba.innerText = fmt(netArea, 2) + ' m²';
    const bs = el('stat-boards-single'); if (bs) bs.innerText = fmt(singleArea, 3) + ' m²';
    show('boards-result-box'); show('boards-stats-row');
}
const CREP_DEFAULTS = { kupa: 15.5, mediteran: 12.5, betonski: 10 };
function updateCrepDefaults() {
    const type = el('crep-type') ? el('crep-type').value : '';
    if (type === 'custom' || !CREP_DEFAULTS[type]) return;
    if (el('crep-per-m2')) el('crep-per-m2').value = CREP_DEFAULTS[type];
}
function calculateCrep() {
    const area = num('crep-area'), perM2 = num('crep-per-m2'), reserve = num('crep-reserve') || 0;
    if (!area || !perM2) { showToast(t('toast.error.enterAreaAndPer'), 'error'); return; }
    const baseCount = area * perM2;
    const cc = el('res-crep-count'); if (cc) cc.innerText = Math.ceil(baseCount * (1 + reserve / 100));
    const cb = el('stat-crep-base'); if (cb) cb.innerText = Math.ceil(baseCount) + ' ' + t('unit.pcsShort');
    show('crep-result-box'); show('crep-stats-row');
}
function calculateMortar() {
    const area = num('malter-area'), thickness = num('malter-thickness');
    const ratioStr = el('malter-ratio') ? el('malter-ratio').value : '1:4';
    if (!area || !thickness) { showToast(t('toast.error.enterAreaThickness'), 'error'); return; }
    const [cementPart, sandPart] = ratioStr.split(':').map(Number);
    const volume = area * (thickness / 100);
    const dryVolume = volume * 1.3;
    const totalParts = cementPart + sandPart;
    const cementKg = dryVolume * (cementPart / totalParts) * 1400;
    const sandKg = dryVolume * (sandPart / totalParts) * 1600;
    const mt = el('res-malter-text');
    if (mt) mt.innerHTML = `<strong>${fmt(volume, 3)} m³</strong> ${t('label.home.mortarWord')}`;
    const mc = el('stat-malter-cement'); if (mc) mc.innerText = fmt(cementKg, 0) + ' kg';
    const ms = el('stat-malter-sand'); if (ms) ms.innerText = fmt(sandKg, 0) + ' kg';
    const mw = el('stat-malter-water'); if (mw) mw.innerText = fmt(cementKg * 0.5, 0) + ' L';
    show('malter-result-box'); show('malter-stats-row');
}
function calculateGypsum() {
    const area = num('gips-area');
    const layers = el('gips-layers') ? parseInt(el('gips-layers').value) : 1;
    if (!area) { showToast(t('toast.error.enterArea'), 'error'); return; }
    const sheetArea = 1.2 * 2.0;
    const gt = el('res-gips-text');
    if (gt) gt.innerHTML = `<strong>${fmt(area, 2)} m²</strong> × ${layers} ${t('label.home.layerWord')}`;
    const gs = el('stat-gips-sheets'); if (gs) gs.innerText = Math.ceil((area * layers) / sheetArea * 1.1) + ' ' + t('unit.pcsShort');
    const gp = el('stat-gips-profiles'); if (gp) gp.innerText = Math.ceil(area * 2.5 / 3) + ' ' + t('unit.pcsShort');
    const gsc = el('stat-gips-screws'); if (gsc) gsc.innerText = Math.ceil(area * 30 * layers) + ' ' + t('unit.pcsShort');
    show('gips-result-box'); show('gips-stats-row');
}
function calculateFoundation() {
    const l = num('temelj-l'), w = num('temelj-w'), h = num('temelj-h');
    if (!l || !w || !h) { showToast(t('toast.error.enterAllDimensions'), 'error'); return; }
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
    if (!area) { showToast(t('toast.error.enterArea'), 'error'); return; }
    const areaWithReserve = area * (1 + reserve / 100);
    let text = '';
    if (type === 'folija') text = `<strong>${Math.ceil(areaWithReserve / (1.5 * 20))}</strong> ${t('label.home.rollsFoil')}`;
    else if (type === 'premaz') text = `<strong>${Math.ceil(areaWithReserve * 1.5)} kg</strong> ${t('label.home.coatingWord')}`;
    else text = `<strong>${Math.ceil(areaWithReserve * 2.5)} m</strong> ${t('label.home.tapeWord')}`;
    const ht = el('res-hidro-text'); if (ht) ht.innerHTML = text;
    show('hidro-result-box');
}
function calculateElectro() {
    const outlets = num('elektro-outlets') || 0, switches = num('elektro-switches') || 0, cable = num('elektro-cable') || 0;
    if (!outlets && !switches && !cable) { showToast(t('toast.error.enterAtLeastOne'), 'error'); return; }
    const et = el('res-elektro-text');
    if (et) et.innerHTML = `<strong>${outlets + switches}</strong> ${t('label.home.boxesWord')} • ${fmt(cable, 0)}m ${t('label.home.cableWord')}`;
    const eo = el('stat-elektro-out'); if (eo) eo.innerText = outlets;
    const es = el('stat-elektro-sw'); if (es) es.innerText = switches;
    const ec = el('stat-elektro-cab'); if (ec) ec.innerText = cable + ' m';
    show('elektro-result-box'); show('elektro-stats-row');
}
function calculateJoinery() {
    const qty = num('stolarija-qty'), w = num('stolarija-w'), h = num('stolarija-h');
    if (!qty || !w || !h) { showToast(t('toast.error.enterAll'), 'error'); return; }
    const sm = el('res-stolarija-m2'); if (sm) sm.innerText = fmt(qty * w * h, 2);
    show('stolarija-result-box');
}
function calculateUniversal() {
    const qty = num('univ-qty'), price = num('univ-price');
    if (!qty || !price) { showToast(t('toast.error.enterQtyPrice'), 'error'); return; }
    const ut = el('res-univ-total'); if (ut) ut.innerText = money(qty * price);
    show('univ-result-box');
}

// ============================================================
// KUPOVINA — KALKULACIJE
// ============================================================

function calculateUnitPrice() {
    const price = num('unit-price'), qty = num('unit-qty');
    const type = el('unit-type') ? el('unit-type').value : 'kg';
    if (!price || !qty) { showToast(t('toast.error.enterPriceQty'), 'error'); return; }
    let result, label;
    if (type === 'kg') { result = price / qty; label = 'RSD/kg'; }
    else if (type === 'g100') { result = (price / qty) * 100; label = 'RSD/100g'; }
    else if (type === 'L') { result = price / qty; label = 'RSD/L'; }
    else if (type === 'ml100') { result = (price / qty) * 100; label = 'RSD/100ml'; }
    else if (type === 'kom') { result = price / qty; label = 'RSD/' + t('unit.pcsShort'); }
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
    if (!aPrice || !aQty || !bPrice || !bQty) { showToast(t('toast.error.enterAll'), 'error'); return; }
    function toBase(price, qty, unit) {
        if (unit === 'kg' || unit === 'L' || unit === 'kom') return price / qty;
        if (unit === 'g' || unit === 'ml') return price / (qty / 1000);
        return price / qty;
    }
    const aBase = toBase(aPrice, aQty, aUnit), bBase = toBase(bPrice, bQty, bUnit);
    const winner = aBase < bBase ? t('label.shop.productACheaper') : (bBase < aBase ? t('label.shop.productBCheaper') : t('label.shop.samePrice'));
    const cw = el('res-cmp-winner'); if (cw) cw.innerText = winner;
    const ca = el('stat-cmp-a'); if (ca) ca.innerText = money(aBase);
    const cb = el('stat-cmp-b'); if (cb) cb.innerText = money(bBase);
    const cd = el('stat-cmp-diff'); if (cd) cd.innerText = fmt(Math.abs(aBase - bBase) / Math.max(aBase, bBase) * 100, 1) + '%';
    show('compare-result-box'); show('compare-stats-row');
}
function calculatePromo() {
    const type = el('promo-type') ? el('promo-type').value : '2plus1';
    const price = num('promo-price');
    if (!price) { showToast(t('toast.error.enterPricePerPiece'), 'error'); return; }
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
function loadShoppingList() { try { const raw = JSON.parse(localStorage.getItem('cx_shopping_list_v1')); if (Array.isArray(raw)) return raw; } catch (e) {} return []; }
function saveShoppingList(list) { try { localStorage.setItem('cx_shopping_list_v1', JSON.stringify(list)); } catch (e) {} }
function addShoppingItem() {
    const nameEl = el('lista-name'), qtyEl = el('lista-qty'), priceEl = el('lista-price');
    if (!nameEl) return;
    const name = nameEl.value.trim();
    if (!name) { showToast(t('toast.error.enterItemName'), 'error'); return; }
    const list = loadShoppingList();
    list.push({ id: Date.now() + Math.random(), name, qty: qtyEl ? qtyEl.value.trim() : '', price: priceEl ? (parseNum(priceEl.value) || 0) : 0, bought: false, date: Date.now() });
    saveShoppingList(list); renderShoppingList();
    nameEl.value = '';
    if (qtyEl) qtyEl.value = '';
    if (priceEl) priceEl.value = '';
    showToast(t('toast.itemAdded'), 'success', 1400); vibrate(15); playTick(0, 1400, 0.07, 0.02); nameEl.focus();
}
function toggleShoppingItem(id) {
    const list = loadShoppingList();
    const item = list.find(i => i.id === id);
    if (!item) return;
    item.bought = !item.bought;
    saveShoppingList(list); renderShoppingList(); vibrate(10); playTick(0, 1300, 0.05, 0.015);
}
function removeShoppingItem(id) {
    let list = loadShoppingList();
    list = list.filter(i => i.id !== id);
    saveShoppingList(list); renderShoppingList(); vibrate(15);
}
async function clearBoughtItems() {
    const list = loadShoppingList();
    const boughtCount = list.filter(i => i.bought).length;
    if (!boughtCount) { showToast(t('toast.noBoughtItems'), 'info', 1500); return; }
    const ok = await showConfirm(t('confirm.clearBought').replace('{0}', boughtCount));
    if (!ok) return;
    saveShoppingList(list.filter(i => !i.bought)); renderShoppingList();
    showToast(t('toast.boughtCleared'), 'success', 1500);
}
async function clearShoppingList() {
    const list = loadShoppingList();
    if (!list.length) { showToast(t('toast.listEmpty'), 'info', 1500); return; }
    const ok = await showConfirm(t('confirm.clearList'));
    if (!ok) return;
    saveShoppingList([]); renderShoppingList();
    showToast(t('toast.listCleared'), 'success', 1500);
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
    if (progress) progress.textContent = `${boughtCount} / ${list.length} ${t('label.shop.bought')}`;
    let total = 0, remaining = 0;
    list.forEach(item => {
        total += item.price || 0;
        if (!item.bought) remaining += item.price || 0;
        const row = document.createElement('div');
        row.className = 'lista-item' + (item.bought ? ' bought' : '');
        const check = document.createElement('button');
        check.className = 'lista-check'; check.textContent = item.bought ? '✓' : '';
        check.addEventListener('click', () => toggleShoppingItem(item.id));
        const info = document.createElement('div'); info.className = 'lista-item-info';
        const nameEl = document.createElement('div'); nameEl.className = 'lista-item-name'; nameEl.textContent = item.name; info.appendChild(nameEl);
        if (item.qty) { const q = document.createElement('div'); q.className = 'lista-item-qty'; q.textContent = item.qty; info.appendChild(q); }
        const priceEl = document.createElement('div');
        priceEl.className = 'lista-item-price';
        priceEl.textContent = item.price > 0 ? money(item.price) + ' RSD' : '—';
        const removeBtn = document.createElement('button');
        removeBtn.className = 'lista-item-remove'; removeBtn.textContent = '✕';
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
    if (!total || total <= 0) { showToast(t('toast.error.enterBudget'), 'error'); return; }
    const daily = total / period, left = Math.max(0, total - spent);
    const rd = el('res-budzet-daily'); if (rd) rd.innerText = money(daily);
    const sl = el('stat-budzet-left'); if (sl) sl.innerText = money(left) + ' RSD';
    const sd = el('stat-budzet-days'); if (sd) sd.innerText = period + ' ' + t('unit.daysShort');
    const sr = el('stat-budzet-recalc'); if (sr) sr.innerText = money(left / period) + ' RSD';
    show('budzet-result-box'); show('budzet-stats-row');
}
function calculateRates() {
    const cena = num('rate-cena'), br = num('rate-br'), kes = num('rate-kes'), infl = num('rate-infl') || 0;
    if (!cena || !br || !kes) { showToast(t('toast.error.enterAll'), 'error'); return; }
    const kesSaInfl = kes * Math.pow(1 + infl / 100, br / 12);
    const saving = cena - kesSaInfl;
    const winner = kesSaInfl < cena ? t('label.shop.cashBetter') : (kesSaInfl > cena ? t('label.shop.ratesBetter') : t('label.shop.same'));
    const rw = el('res-rate-winner'); if (rw) rw.innerText = winner;
    const sm = el('stat-rate-monthly'); if (sm) sm.innerText = money(cena / br) + ' RSD';
    const st = el('stat-rate-total'); if (st) st.innerText = money(cena) + ' RSD';
    const sv = el('stat-rate-saving'); if (sv) sv.innerText = money(saving) + ' RSD';
    show('rate-result-box'); show('rate-stats-row');
}
function calculateCardVsCash() {
    const cena = num('kart-cena'), popust = num('kart-popust') || 0, naknada = num('kart-naknada') || 0;
    if (!cena) { showToast(t('toast.error.enterPrice'), 'error'); return; }
    const kes = cena * (1 - popust / 100), kartica = cena * (1 + naknada / 100);
    const winner = kes < kartica ? t('label.shop.cashBetter') : (kartica < kes ? t('label.shop.cardBetter') : t('label.shop.same'));
    const rw = el('res-kart-winner'); if (rw) rw.innerText = winner;
    const sk = el('stat-kart-kes'); if (sk) sk.innerText = money(kes) + ' RSD';
    const ska = el('stat-kart-kart'); if (ska) ska.innerText = money(kartica) + ' RSD';
    const sd = el('stat-kart-diff'); if (sd) sd.innerText = money(Math.abs(kartica - kes)) + ' RSD';
    show('kart-result-box'); show('kart-stats-row');
}
function calculatePerLiter() {
    const cena = num('litar-cena'), qty = num('litar-qty');
    const unit = el('litar-unit') ? el('litar-unit').value : 'L';
    if (!cena || !qty) { showToast(t('toast.error.enterPriceVolume'), 'error'); return; }
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
    if (!total) { showToast(t('toast.error.enterTotalCost'), 'error'); return; }
    if (br < 1 || dana < 1) { showToast(t('toast.error.minOne'), 'error'); return; }
    const rv = el('res-osoba-val'); if (rv) rv.innerText = money(total / br);
    const sd = el('stat-osoba-dan'); if (sd) sd.innerText = money(total / br / dana) + ' RSD';
    const su = el('stat-osoba-ukupno'); if (su) su.innerText = money(total / dana) + ' RSD';
    show('osoba-result-box'); show('osoba-stats-row');
}
function calculateWorthTrip() {
    const usteda = num('isplati-usteda'), br = num('isplati-br') || 1, dist = num('isplati-dist');
    const potrosnja = num('isplati-potrosnja') || 7, gorivo = num('isplati-gorivo') || 180;
    if (!usteda || !dist) { showToast(t('toast.error.enterSavingsDistance'), 'error'); return; }
    const ukupnaUsteda = usteda * br;
    const trosakPuta = ((dist * 2 / 100) * potrosnja) * gorivo;
    const neto = ukupnaUsteda - trosakPuta;
    let verdict;
    if (neto > 0) verdict = t('label.shop.worthItYes').replace('{0}', money(neto));
    else if (neto < 0) verdict = t('label.shop.worthItNo').replace('{0}', money(-neto));
    else verdict = t('label.shop.worthItSame');
    const rv = el('res-isplati-verdict'); if (rv) rv.innerText = verdict;
    const su = el('stat-isplati-usteda'); if (su) su.innerText = money(ukupnaUsteda) + ' RSD';
    const st = el('stat-isplati-trosak'); if (st) st.innerText = money(trosakPuta) + ' RSD';
    const sn = el('stat-isplati-neto'); if (sn) sn.innerText = money(neto) + ' RSD';
    show('isplati-result-box'); show('isplati-stats-row');
}
function calculateReceipts() {
    const aTotal = num('rac-a-total'), aItems = num('rac-a-items'), bTotal = num('rac-b-total'), bItems = num('rac-b-items');
    if (!aTotal || !aItems || !bTotal || !bItems) { showToast(t('toast.error.enterAll'), 'error'); return; }
    const aAvg = aTotal / aItems, bAvg = bTotal / bItems;
    const winner = aAvg < bAvg ? t('label.shop.receiptABetter') : (bAvg < aAvg ? t('label.shop.receiptBBetter') : t('label.shop.same'));
    const rw = el('res-rac-winner'); if (rw) rw.innerText = winner;
    const sa = el('stat-rac-a'); if (sa) sa.innerText = money(aAvg) + ' RSD';
    const sb = el('stat-rac-b'); if (sb) sb.innerText = money(bAvg) + ' RSD';
    const sd = el('stat-rac-diff'); if (sd) sd.innerText = fmt(Math.abs(aAvg - bAvg) / Math.max(aAvg, bAvg) * 100, 1) + ' %';
    show('racuni-result-box'); show('racuni-stats-row');
}
function calculateMealCost() {
    const cena = num('rasip-cena'), porcija = num('rasip-porcija'), bacanje = num('rasip-bacanje') || 0;
    if (!cena || !porcija) { showToast(t('toast.error.enterPriceMeals'), 'error'); return; }
    if (porcija < 1) { showToast(t('toast.error.minOneMeal'), 'error'); return; }
    const base = cena / porcija, waste = cena * (bacanje / 100);
    const rv = el('res-rasip-val'); if (rv) rv.innerText = money((cena + waste) / porcija);
    const sb = el('stat-rasip-base'); if (sb) sb.innerText = money(base) + ' RSD';
    const sw = el('stat-rasip-waste'); if (sw) sw.innerText = money(waste) + ' RSD';
    show('rasip-result-box'); show('rasip-stats-row');
}

// ============================================================
// STRUJA — KALKULACIJE
// ============================================================

function calculatePower() {
    const watts = num('power-watts'), hours = num('power-hours'), price = num('power-price') || 12;
    if (!watts || !hours) { showToast(t('toast.error.enterPowerHours'), 'error'); return; }
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
    const list = el('power-devices-list'); if (!list) return;
    list.innerHTML = '';
    if (!powerDevices.length) { list.innerHTML = '<p class="section-desc" style="text-align:center; padding:10px;">' + t('label.power.noDevices') + '</p>'; return; }
    powerDevices.forEach((dev, idx) => {
        const row = document.createElement('div');
        row.className = 'power-device-item';
        row.innerHTML = `<div class="power-device-info"><div class="power-device-name">${escapeHtml(dev.name || t('label.power.device') + ' ' + (idx + 1))}</div><div class="power-device-detail">${dev.watts}W × ${dev.hours}h/${t('unit.day')}</div></div><button class="power-device-remove" title="${t('modal.delete')}">✕</button>`;
        row.querySelector('.power-device-remove').addEventListener('click', () => {
            powerDevices.splice(idx, 1); savePowerDevices(); renderPowerDevices(); updatePowerTotal();
        });
        list.appendChild(row);
    });
}
function updatePowerTotal() {
    if (!powerDevices.length) { hide('power-multi-result-box'); hide('power-multi-stats-row'); return; }
    let totalMonth = 0, totalKwh = 0;
    powerDevices.forEach(dev => {
        const kwhMonth = ((dev.watts * dev.hours) / 1000) * 30;
        totalKwh += kwhMonth; totalMonth += kwhMonth * (dev.price || 12);
    });
    const pt = el('res-power-total'); if (pt) pt.innerText = money(totalMonth);
    const pc = el('stat-power-count'); if (pc) pc.innerText = powerDevices.length;
    const pk = el('stat-power-total-kwh'); if (pk) pk.innerText = fmt(totalKwh, 1);
    show('power-multi-result-box'); show('power-multi-stats-row');
}
function addPowerDevice() {
    const nameEl = el('dev-name');
    const name = nameEl ? (nameEl.value.trim() || t('label.power.device')) : t('label.power.device');
    const watts = num('dev-watts'), hours = num('dev-hours'), price = num('dev-price') || 12;
    if (!watts || !hours) { showToast(t('toast.error.enterPowerHours'), 'error'); return; }
    powerDevices.push({ name, watts, hours, price });
    savePowerDevices(); renderPowerDevices(); updatePowerTotal();
    if (nameEl) nameEl.value = '';
    if (el('dev-watts')) el('dev-watts').value = '';
    if (el('dev-hours')) el('dev-hours').value = '';
    showToast(t('toast.deviceAdded'), 'success', 1500);
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
    if (!visaKwh && !nizaKwh) { showToast(t('toast.error.enterUsage'), 'error'); return; }
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
    if (!amps || !len) { showToast(t('toast.error.enterCurrentLength'), 'error'); return; }
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
    const sm = el('stat-kabl-mat'); if (sm) sm.innerText = isCopper ? t('option.power.copper') : t('option.power.aluminum');
    show('kabl-result-box'); show('kabl-stats-row');
}
function calculateVoltageDrop() {
    const amps = num('pad-amps'), len = num('pad-len'), mm2 = num('pad-mm2'), volts = num('pad-volt') || 230;
    const rho = el('pad-mat') ? parseFloat(el('pad-mat').value) : 0.0178;
    if (!amps || !len || !mm2) { showToast(t('toast.error.enterAll'), 'error'); return; }
    const dropV = (2 * rho * len * amps) / mm2, dropPct = (dropV / volts) * 100;
    let ocena, boja;
    if (dropPct > 5) { ocena = t('label.power.ratingBad'); boja = '#f43f5e'; }
    else if (dropPct > 3) { ocena = t('label.power.ratingBorderline'); boja = '#f59e0b'; }
    else { ocena = t('label.power.ratingGood'); boja = '#10b981'; }
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
    if (!watt) { showToast(t('toast.error.enterPower'), 'error'); return; }
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
    if (val === null) { showToast(t('toast.error.enterValue'), 'error'); return; }
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
    if (!l || !w) { showToast(t('toast.error.enterRoomDims'), 'error'); return; }
    const area = l * w;
    let heightFactor = 1;
    if (h > 3) heightFactor = 1 + (h - 3) * 0.15; else if (h > 2.7) heightFactor = 1.05;
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
    if (!watt || !litra) { showToast(t('toast.error.enterPowerWater'), 'error'); return; }
    if (t2 <= t1) { showToast(t('toast.error.endTempHigher'), 'error'); return; }
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
    if (!ah || !watt) { showToast(t('toast.error.enterCapacityLoad'), 'error'); return; }
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
    if (kel <= 2700) desc = t('label.power.kelvinDesc2700');
    else if (kel <= 3000) desc = t('label.power.kelvinDesc3000');
    else if (kel <= 4000) desc = t('label.power.kelvinDesc4000');
    else if (kel <= 5000) desc = t('label.power.kelvinDesc5000');
    else desc = t('label.power.kelvinDesc6500');
    const rv = el('res-kel-val'); if (rv) rv.innerText = kel;
    const sd = el('stat-kel-desc'); if (sd) sd.innerText = desc;
    const sl = el('stat-kel-lum'); if (sl) sl.innerText = fmt(watt * 100, 0) + ' lm';
    show('kel-result-box'); show('kel-stats-row');
}

// ============================================================
// POSAO — KALKULACIJE
// ============================================================

function calculateWorkTime() {
    const start = el('work-start') ? el('work-start').value : '';
    const end = el('work-end') ? el('work-end').value : '';
    const breakMin = num('work-break') || 0;
    const dayType = el('work-day-type') ? el('work-day-type').value : 'workday';
    if (!start || !end) { showToast(t('toast.error.enterStartEnd'), 'error'); return; }
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    let startMin = sh * 60 + sm, endMin = eh * 60 + em;
    if (endMin <= startMin) endMin += 24 * 60;
    const rawMinutes = endMin - startMin;
    const totalMinutes = Math.max(0, rawMinutes - breakMin);
    const hours = Math.floor(totalMinutes / 60), minutes = totalMinutes % 60;
    let multLabel = '100%';
    if (dayType === 'weekend') multLabel = '110%'; else if (dayType === 'holiday') multLabel = '150%';
    const rw = el('res-worktime'); if (rw) rw.innerText = `${hours}h ${minutes}min`;
    const wr = el('stat-worktime-raw'); if (wr) wr.innerText = `${Math.floor(rawMinutes / 60)}h ${rawMinutes % 60}min`;
    const wd = el('stat-worktime-dec'); if (wd) wd.innerText = fmt(totalMinutes / 60, 2) + ' h';
    const wm = el('stat-worktime-mult'); if (wm) wm.innerText = multLabel;
    show('worktime-result-box'); show('worktime-stats-row');
}
function calculateHourlyRate() {
    const salary = num('work-salary'), hours = num('work-hours');
    const type = el('work-rate-type') ? el('work-rate-type').value : 'monthly';
    if (!salary || !hours) { showToast(t('toast.error.enterSalaryHours'), 'error'); return; }
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
    if (!amount) { showToast(t('toast.error.enterAmount'), 'error'); return; }
    const PIO = 0.14, ZDR = 0.0515, NEZ = 0.0075, POREZ = 0.10, NEOPOREZIVO = 25000;
    let neto, bruto, pio, zdr, nez, porez;
    if (type === 'bruto-to-neto') {
        bruto = amount;
        pio = bruto * PIO; zdr = bruto * ZDR; nez = bruto * NEZ;
        porez = Math.max(0, bruto - pio - zdr - nez - NEOPOREZIVO) * POREZ;
        neto = bruto - pio - zdr - nez - porez;
    } else {
        neto = amount; bruto = neto / 0.65;
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
    if (type === 'bruto-to-neto') { if (label) label.innerText = t('label.work.netSalaryLabel'); if (val) val.innerText = money(neto); }
    else { if (label) label.innerText = t('label.work.grossSalaryLabel'); if (val) val.innerText = money(bruto); }
    const sp = el('stat-plata-pio'); if (sp) sp.innerText = money(pio) + ' RSD';
    const sz = el('stat-plata-zdr'); if (sz) sz.innerText = money(zdr) + ' RSD';
    const spo = el('stat-plata-porez'); if (spo) spo.innerText = money(porez) + ' RSD';
    show('plata-result-box'); show('plata-stats-row');
}
function calculateVacation() {
    const total = num('odmor-total') || 0, used = num('odmor-used') || 0, daily = num('odmor-daily') || 0;
    const left = Math.max(0, total - used);
    const rl = el('res-odmor-left'); if (rl) rl.innerText = left;
    const su = el('stat-odmor-used'); if (su) su.innerText = used + ' ' + t('unit.daysShort');
    const sp = el('stat-odmor-pay'); if (sp) sp.innerText = money(left * daily) + ' RSD';
    show('odmor-result-box'); show('odmor-stats-row');
}
function calculateNightWork() {
    const hours = num('nocni-hours'), rate = num('nocni-rate');
    const mult = el('nocni-mult') ? parseFloat(el('nocni-mult').value) : 1.26;
    if (!hours || !rate) { showToast(t('toast.error.enterHoursRate'), 'error'); return; }
    const base = hours * rate, total = base * mult;
    const nt = el('res-nocni-total'); if (nt) nt.innerText = money(total);
    const nb = el('stat-nocni-base'); if (nb) nb.innerText = money(base) + ' RSD';
    const nbo = el('stat-nocni-bonus'); if (nbo) nbo.innerText = money(total - base) + ' RSD';
    show('nocni-result-box'); show('nocni-stats-row');
}
function calculateOvertime() {
    const hours = num('prek-hours'), rate = num('prek-rate');
    if (!hours || !rate) { showToast(t('toast.error.enterHoursRate'), 'error'); return; }
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
// MUZIKA — KALKULACIJE
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
        const sel = el(id); if (!sel) return;
        sel.innerHTML = '';
        NOTES_SHARP.forEach(n => { const opt = document.createElement('option'); opt.value = n; opt.textContent = n; sel.appendChild(opt); });
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
function calculateTranspose() {
    const orig = el('trans-orig') ? el('trans-orig').value : 'C';
    const newKey = el('trans-new') ? el('trans-new').value : 'D';
    const chordsRaw = el('trans-chords') ? el('trans-chords').value.trim() : '';
    if (!chordsRaw) { showToast(t('toast.error.enterChords'), 'error'); return; }
    const steps = ((noteToSemitone(newKey) - noteToSemitone(orig)) % 12 + 12) % 12;
    const stepsSigned = steps > 6 ? steps - 12 : steps;
    const transposed = chordsRaw.split(/[,\s]+/).filter(c => c).map(c => transposeChord(c, steps));
    const resultEl = el('res-trans-chords'); if (resultEl) resultEl.innerText = transposed.join('  ');
    const statEl = el('stat-trans-steps'); if (statEl) statEl.innerText = (stepsSigned >= 0 ? '+' : '') + stepsSigned + ' ' + t('label.music.semitones');
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
    const formulaEl = el('stat-chord-formula'); if (formulaEl) formulaEl.innerText = intervals.join(' - ') + ' (' + t('label.music.semitonesFromRoot') + ')';
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
    if (!val || val <= 0) { showToast(t('toast.error.enterValue'), 'error'); return; }
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
        if (diff === 0) tip = t('label.music.perfectConsonance');
        else if ([3, 4, 8, 9].includes(diff)) tip = t('label.music.consonance');
        else if ([1, 2, 5, 10, 11].includes(diff)) tip = t('label.music.dissonance');
        else tip = t('label.music.tritone');
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
        if (bpm < 30 || bpm > 300) { showToast(t('toast.error.bpmRange'), 'error'); return; }
        metronomeState.running = true; metronomeState.beat = 0; metronomeState.totalBeats = 0;
        if (btn) { btn.textContent = t('btn.stopMetronome'); btn.classList.add('active'); }
        tickMetronome(beatUnit);
        metronomeState.intervalId = setInterval(() => tickMetronome(beatUnit), 60000 / bpm);
        show('metro-result-box'); show('metro-stats-row');
        const mv = el('res-metro-val'); if (mv) mv.innerText = bpm;
    } else {
        metronomeState.running = false;
        if (metronomeState.intervalId) { clearInterval(metronomeState.intervalId); metronomeState.intervalId = null; }
        if (btn) { btn.textContent = t('btn.startMetronome'); btn.classList.remove('active'); }
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
                const osc = ctx.createOscillator(); const gain = ctx.createGain();
                osc.type = 'square'; osc.frequency.setValueAtTime(isFirst ? 1500 : 900, t2);
                gain.gain.setValueAtTime(isFirst ? 0.15 : 0.08, t2);
                gain.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.05);
                osc.connect(gain); gain.connect(ctx.destination);
                osc.start(t2); osc.stop(t2 + 0.06);
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
    if (!freq || freq <= 0) { showToast(t('toast.error.enterFrequency'), 'error'); return; }
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
// ŠTIMER
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
        { note: 'Eb', octave: 2, freq: 77.78 }, { note: 'Ab', octave: 2, freq: 103.83 },
        { note: 'Db', octave: 3, freq: 138.59 }, { note: 'Gb', octave: 3, freq: 185.00 },
        { note: 'Bb', octave: 3, freq: 233.08 }, { note: 'Eb', octave: 4, freq: 311.13 }
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
    'mandolin': { strings: [
        { note: 'G', octave: 3, freq: 196.00 }, { note: 'D', octave: 4, freq: 293.66 },
        { note: 'A', octave: 4, freq: 440.00 }, { note: 'E', octave: 5, freq: 659.25 }
    ]},
    'violin': { strings: [
        { note: 'G', octave: 3, freq: 196.00 }, { note: 'D', octave: 4, freq: 293.66 },
        { note: 'A', octave: 4, freq: 440.00 }, { note: 'E', octave: 5, freq: 659.25 }
    ]},
    'cello': { strings: [
        { note: 'C', octave: 2, freq: 65.41 }, { note: 'G', octave: 2, freq: 98.00 },
        { note: 'D', octave: 3, freq: 146.83 }, { note: 'A', octave: 3, freq: 220.00 }
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
    const sel = el('tuner-instrument'); if (!sel) return;
    const inst = TUNER_INSTRUMENTS[sel.value];
    const wrap = el('tuner-strings'); if (!wrap || !inst) return;
    const ratio = getA4() / 440;
    wrap.innerHTML = '';
    inst.strings.forEach((s, i) => {
        const freq = s.freq * ratio;
        const btn = document.createElement('button');
        btn.className = 'tuner-string-btn'; btn.type = 'button';
        btn.innerHTML = `<span class="ts-num">${i + 1}. ${t('label.music.string')}</span><span class="ts-note">${s.note}${s.octave}</span><span class="ts-freq">${freq.toFixed(2)} Hz</span>`;
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
        tunerOscillator.connect(tunerGain); tunerGain.connect(audioCtx.destination);
        tunerOscillator.start();
        const status = el('tuner-status');
        if (status) {
            status.style.display = 'block';
            const nd = el('tuner-note-display'); if (nd) nd.textContent = btn.querySelector('.ts-note').textContent;
            const fd = el('tuner-freq-display'); if (fd) fd.textContent = freq.toFixed(2) + ' Hz';
        }
        const sb = el('tuner-stop-btn'); if (sb) sb.style.display = 'block';
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
        tunerOscillator = null; tunerGain = null;
    }
    const sb = el('tuner-stop-btn'); if (sb) sb.style.display = 'none';
    document.querySelectorAll('.tuner-string-btn').forEach(b => b.classList.remove('active'));
}
async function toggleTunerMic() {
    const btn = el('tuner-mic-btn');
    if (micRunning) { stopTunerMic(); if (btn) btn.textContent = t('btn.enableMic'); return; }
    try {
        if (!audioCtx) audioCtx = getAudio();
        if (!audioCtx) throw new Error('AudioContext not available');
        if (audioCtx.state === 'suspended') await audioCtx.resume();
        micStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
        micSource = audioCtx.createMediaStreamSource(micStream);
        micAnalyser = audioCtx.createAnalyser();
        micAnalyser.fftSize = 4096; micAnalyser.smoothingTimeConstant = 0.6;
        micSource.connect(micAnalyser);
        micRunning = true;
        if (btn) btn.textContent = t('btn.stopMic');
        const r = el('tuner-mic-result'); if (r) r.style.display = 'block';
        micLoop();
        vibrate(20); playTick(0, 1400, 0.08, 0.03);
    } catch (e) { showToast(t('toast.micError'), 'error', 2500); }
}
function stopTunerMic() {
    micRunning = false;
    if (micRafId) { cancelAnimationFrame(micRafId); micRafId = null; }
    if (micStream) { micStream.getTracks().forEach(t => t.stop()); micStream = null; }
    micSource = null; micAnalyser = null;
    const r = el('tuner-mic-result'); if (r) r.style.display = 'none';
}
function micLoop() {
    if (!micRunning || !micAnalyser) return;
    const buffer = new Float32Array(micAnalyser.fftSize);
    micAnalyser.getFloatTimeDomainData(buffer);
    const freq = autoCorrelate(buffer, audioCtx.sampleRate);
    if (freq > 0) updateTunerDisplay(freq);
    else {
        const dn = el('tuner-detected-note'); if (dn) dn.textContent = '—';
        const df = el('tuner-detected-freq'); if (df) df.textContent = '— Hz';
    }
    micRafId = requestAnimationFrame(micLoop);
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
    for (let i = 0; i < newSize; i++) for (let j = 0; j < newSize - i; j++) c[i] += buf[j] * buf[j + i];
    let d = 0; while (c[d] > c[d + 1]) d++;
    let maxval = -1, maxpos = -1;
    for (let i = d; i < newSize; i++) { if (c[i] > maxval) { maxval = c[i]; maxpos = i; } }
    let T0 = maxpos;
    const x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
    const a = (x1 + x3 - 2 * x2) / 2, b = (x3 - x1) / 2;
    if (a) T0 = T0 - b / (2 * a);
    return sampleRate / T0;
}
function updateTunerDisplay(freq) {
    const midiNote = Math.round(69 + 12 * Math.log2(freq / 440));
    const octave = Math.floor(midiNote / 12) - 1;
    const noteName = NOTES_SHARP[((midiNote % 12) + 12) % 12];
    const exactFreq = 440 * Math.pow(2, (midiNote - 69) / 12);
    const cents = Math.round(1200 * Math.log2(freq / exactFreq));
    const dn = el('tuner-detected-note'); if (dn) dn.textContent = noteName + octave;
    const df = el('tuner-detected-freq'); if (df) df.textContent = freq.toFixed(2) + ' Hz';
    const marker = el('tuner-cents-marker');
    if (marker) {
        const clamped = Math.max(-50, Math.min(50, cents));
        marker.style.left = (50 + (clamped / 50) * 45) + '%';
        marker.style.background = Math.abs(cents) < 5 ? '#10b981' : (Math.abs(cents) < 15 ? '#f59e0b' : '#f43f5e');
    }
    const cl = el('tuner-cents-label');
    if (cl) {
        cl.textContent = (cents > 0 ? '+' : '') + cents + ' ' + t('label.music.cents');
        cl.classList.remove('ok', 'close', 'far');
        if (Math.abs(cents) < 5) cl.classList.add('ok');
        else if (Math.abs(cents) < 15) cl.classList.add('close');
        else cl.classList.add('far');
    }
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

    setTimeout(() => {
        const splash = el('splash-screen');
        if (splash) {
            splash.classList.add('hide');
            setTimeout(() => { if (splash.parentNode) splash.remove(); }, 400);
        }
    }, 500);

    document.title = t('app.title');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
// ============================================================
// OSVEŽAVANJE STATIČNIH TEKSTOVA (refreshUIText)
// ============================================================
function refreshUIText() {
    try {
        const subtitle = el('app-subtitle');
        if (subtitle) subtitle.textContent = t('app.subtitle');

        const searchInput = el('home-search');
        if (searchInput) searchInput.placeholder = t('app.search.placeholder');

        const secQuick = el('sec-title-quick');
        if (secQuick) secQuick.textContent = t('section.quickTools');
        const secMy = el('sec-title-my');
        if (secMy) secMy.textContent = t('section.myTools');
        const secAll = el('sec-title-all');
        if (secAll) secAll.textContent = t('section.allTools');

        const btnEditQuick = el('btn-edit-quick');
        if (btnEditQuick) btnEditQuick.textContent = t('section.edit');

        const favEmpty = el('favorites-empty');
        if (favEmpty) favEmpty.innerHTML = t('section.favoritesEmpty');

        const footerTag = el('footer-tag');
        if (footerTag) footerTag.textContent = t('app.footer');

        // Podešavanja
        const settingsTitle = el('settings-title');
        if (settingsTitle) settingsTitle.textContent = t('settings.title');
        const settingsThemeLabel = el('settings-theme-label');
        if (settingsThemeLabel) settingsThemeLabel.textContent = t('settings.theme');
        const settingsThemeSub = el('settings-theme-sub');
        if (settingsThemeSub) settingsThemeSub.textContent = t('settings.theme.desc');
        const settingsSoundLabel = el('settings-sound-label');
        if (settingsSoundLabel) settingsSoundLabel.textContent = t('settings.sound');
        const settingsSoundSub = el('settings-sound-sub');
        if (settingsSoundSub) settingsSoundSub.textContent = t('settings.sound.desc');
        const settingsHapticLabel = el('settings-haptic-label');
        if (settingsHapticLabel) settingsHapticLabel.textContent = t('settings.haptic');
        const settingsHapticSub = el('settings-haptic-sub');
        if (settingsHapticSub) settingsHapticSub.textContent = t('settings.haptic.desc');
        const settingsCurrencyLabel = el('settings-currency-label');
        if (settingsCurrencyLabel) settingsCurrencyLabel.textContent = t('settings.currency');
        const settingsCurrencySub = el('settings-currency-sub');
        if (settingsCurrencySub) settingsCurrencySub.textContent = t('settings.currency.desc');
        const settingsLanguageLabel = el('settings-language-label');
        if (settingsLanguageLabel) settingsLanguageLabel.textContent = t('settings.language');
        const settingsLanguageSub = el('settings-language-sub');
        if (settingsLanguageSub) settingsLanguageSub.textContent = t('settings.language.desc');
        const settingsOffline = el('settings-offline-text');
        if (settingsOffline) settingsOffline.textContent = t('settings.offline');

        // Istorija
        const historyTitle = el('history-title');
        if (historyTitle) historyTitle.textContent = t('history.title');
        const historySearch = el('history-search');
        if (historySearch) historySearch.placeholder = t('history.search');
        const btnHistoryExport = el('btn-history-export');
        if (btnHistoryExport) btnHistoryExport.textContent = t('history.export');
        const btnHistoryClear = el('btn-history-clear');
        if (btnHistoryClear) btnHistoryClear.textContent = t('history.clear');
        const historyEmpty = el('history-empty');
        if (historyEmpty) historyEmpty.textContent = t('history.empty');
        const historyNoResults = el('history-no-results');
        if (historyNoResults) historyNoResults.textContent = t('history.noResults');
        const statsToggleBtn = el('stats-toggle-btn');
        if (statsToggleBtn) {
            const panel = el('stats-panel');
            const isOpen = panel && panel.style.display !== 'none';
            statsToggleBtn.textContent = isOpen ? t('history.stats.hide') : t('history.stats.show');
        }

        // Lang toggle dugme
        const langBtn = el('lang-toggle');
        if (langBtn) langBtn.textContent = currentLang.toUpperCase();

        // Editor modal
        const editorTitle = el('editor-title');
        if (editorTitle) editorTitle.textContent = t('editor.title');
        const editorDesc = el('editor-desc');
        if (editorDesc) editorDesc.textContent = t('editor.desc');
        const editorSaveBtn = el('editor-save-btn');
        if (editorSaveBtn) editorSaveBtn.textContent = t('editor.save');

        // Location modal
        const locationTitle = el('location-title');
        if (locationTitle) locationTitle.textContent = t('weather.location.title');
        const locationSearchInput = el('location-search-input');
        if (locationSearchInput) locationSearchInput.placeholder = t('weather.location.search');
        const locationGpsText = el('location-gps-text');
        if (locationGpsText) locationGpsText.textContent = t('weather.location.gps');

        // Fav hint
        const favHintTitle = el('fav-hint-title');
        if (favHintTitle) favHintTitle.textContent = t('fav.hint.title');
        const favHintText = el('fav-hint-text');
        if (favHintText) favHintText.textContent = t('fav.hint.text');
        const favHintBtn = el('fav-hint-btn');
        if (favHintBtn) favHintBtn.textContent = t('fav.hint.btn');

        // Confirm modal
        const confirmTitle = el('confirm-title');
        if (confirmTitle) confirmTitle.textContent = t('confirm.title');
        const confirmMsg = el('confirm-message');
        if (confirmMsg) confirmMsg.textContent = t('confirm.title');
        const confirmCancelBtn = el('confirm-cancel-btn');
        if (confirmCancelBtn) confirmCancelBtn.textContent = t('confirm.cancel');
        const confirmOkBtn = el('confirm-ok-btn');
        if (confirmOkBtn) confirmOkBtn.textContent = t('confirm.ok');
    } catch (e) { console.warn('refreshUIText greška:', e); }
}
