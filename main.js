// ============================================================
// ALATIKA — main.js (kompletan, jedan fajl)
// ============================================================

// ================= POMOĆNE FUNKCIJE =================

function el(id) {
    return document.getElementById(id);
}

function parseNum(val) {
    if (val === null || val === undefined) return null;
    const s = String(val).trim().replace(/\s/g, '');
    if (s === '') return null;
    if (s.includes('.') && s.includes(',')) {
        const lastDot = s.lastIndexOf('.');
        const lastComma = s.lastIndexOf(',');
        let normalized;
        if (lastComma > lastDot) {
            normalized = s.replace(/\./g, '').replace(',', '.');
        } else {
            normalized = s.replace(/,/g, '');
        }
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

function num(id) {
    const elem = el(id);
    if (!elem) return null;
    return parseNum(elem.value);
}

function hide(id) {
    const elem = el(id);
    if (elem) elem.style.display = 'none';
}

function fmt(n, maxDecimals = 6) {
    if (typeof n !== 'number' || isNaN(n)) return '0';
    const rounded = Number(n.toPrecision(10));
    return rounded.toLocaleString('sr-RS', { maximumFractionDigits: maxDecimals });
}

function money(n) {
    if (typeof n !== 'number' || isNaN(n)) return '0,00';
    return n.toLocaleString('sr-RS', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function cardText(card) {
    const clone = card.cloneNode(true);
    clone.querySelectorAll('button').forEach(b => b.remove());
    return clone.innerText.replace(/\n\s*\n/g, '\n').trim();
}

// ================= TOAST =================

function showToast(message, type = 'info', duration = 3000) {
    const container = el('toast-container');
    if (!container) return;

    const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-icon">${icons[type] || icons.info}</div>
        <div class="toast-msg">${message}</div>
        <button class="toast-close" aria-label="Zatvori">✕</button>
        <div class="toast-progress" style="animation-duration: ${duration}ms;"></div>
    `;
    container.appendChild(toast);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => toast.classList.add('show'));
    });

    let dismissed = false;
    const dismiss = () => {
        if (dismissed) return;
        dismissed = true;
        toast.classList.remove('show');
        toast.classList.add('hide');
        setTimeout(() => { if (toast.parentNode) toast.remove(); }, 400);
    };

    toast.querySelector('.toast-close').addEventListener('click', () => {
        clearTimeout(timer);
        dismiss();
    });

    const timer = setTimeout(dismiss, duration);
    if (type === 'error') vibrate(30);
    else if (type === 'success') vibrate(15);
}

// ================= CONFIRM MODAL =================

let confirmResolver = null;

function showConfirm(message, title = 'Potvrda') {
    return new Promise((resolve) => {
        confirmResolver = resolve;
        const titleEl = el('confirm-title');
        const msgEl = el('confirm-message');
        const modalEl = el('confirm-modal');
        if (titleEl) titleEl.innerText = title;
        if (msgEl) msgEl.innerText = message;
        if (modalEl) modalEl.classList.add('show');
        vibrate(15);
    });
}

function closeConfirm(result) {
    const modalEl = el('confirm-modal');
    if (modalEl) modalEl.classList.remove('show');
    if (confirmResolver) {
        confirmResolver(result);
        confirmResolver = null;
    }
    vibrate(10);
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

    if (getComputedStyle(target).position === 'static') {
        target.style.position = 'relative';
    }
    target.style.overflow = 'hidden';
    target.appendChild(ripple);
    setTimeout(() => { if (ripple.parentNode) ripple.remove(); }, 600);
}

function setupRipple() {
    const selector = '.calc-btn-main, .copy-btn, .back-btn, .swap-btn, .settings-toggle-btn, .favorite-chip, .confirm-btn, .tab, .openings-add-btn, .fx-refresh-btn, .fx-swap-btn, .copy-btn-mini, .lista-clear-btn';
    document.addEventListener('pointerdown', (e) => {
        const t = e.target.closest(selector);
        if (t) createRipple({ currentTarget: t, clientX: e.clientX, clientY: e.clientY });
    }, { passive: true });
}

// ================= REGISTAR ALATA (TOOLS) =================

const TOOLS = [
    { id: 'fuel', name: 'Potrošnja goriva', category: 'Auto', icon: '⛽', description: 'Potrošnja i trošak goriva', screen: 'auto-screen', tab: 'auto-potrosnja-tab', keywords: ['gorivo', 'benzin', 'dizel', 'potrosnja'] },
    { id: 'trip', name: 'Planer puta', category: 'Putovanje', icon: '🧳', description: 'Vreme putovanja i ETA', screen: 'auto-screen', tab: 'auto-planer-tab', keywords: ['put', 'planer', 'vreme', 'eta'] },
    { id: 'roadcost', name: 'Trošak puta', category: 'Putovanje', icon: '💰', description: 'Ukupan trošak putovanja', screen: 'auto-screen', tab: 'auto-trosakputa-tab', keywords: ['trosak', 'putovanje', 'putarina'] },
    { id: 'bike-speed', name: 'Brzina bicikla', category: 'Bicikl', icon: '🚴', description: 'Brzina prema prenosu', screen: 'bike-screen', tab: 'bike-brzina-tab', keywords: ['brzina', 'bicikl'] },
    { id: 'discount', name: 'Popust', category: 'Novac', icon: '🏷️', description: 'Cena nakon popusta', screen: 'money-screen', tab: 'money-popust-tab', keywords: ['popust', 'snizenje'] },
    { id: 'pdv', name: 'PDV', category: 'Novac', icon: '📊', description: 'Dodaj ili izvuci PDV', screen: 'money-screen', tab: 'money-pdv-tab', keywords: ['pdv', 'porez'] },
    { id: 'money-pct', name: 'Procenat (Novac)', category: 'Novac', icon: '%', description: 'Dodaj/oduzmi %, koliko % je deo', screen: 'money-screen', tab: 'money-procenat-tab', keywords: ['procenat', 'posto', 'pdv', 'popust'] },
    { id: 'loan', name: 'Kredit', category: 'Novac', icon: '💳', description: 'Mesečna rata kredita', screen: 'money-screen', tab: 'money-kredit-tab', keywords: ['kredit', 'rata'] },
    { id: 'currency', name: 'Kursna lista', category: 'Novac', icon: '💱', description: 'Kursna lista i konverzija', screen: 'money-screen', tab: 'money-valuta-tab', keywords: ['valuta', 'kurs', 'kursna', 'lista', 'eur', 'usd', 'exchange'] },
    { id: 'bmi', name: 'BMI', category: 'Zdravlje', icon: '⚖️', description: 'Indeks telesne mase', screen: 'health-screen', tab: 'health-bmi-tab', keywords: ['bmi', 'tezina'] },
    { id: 'bmr', name: 'BMR Kalorije', category: 'Zdravlje', icon: '🔥', description: 'Bazalni metabolizam', screen: 'health-screen', tab: 'health-kalorije-tab', keywords: ['bmr', 'kalorije'] },
    { id: 'run', name: 'Trčanje tempo', category: 'Fitness', icon: '🏃', description: 'Tempo i brzina trčanja', screen: 'health-screen', tab: 'health-trcanje-tab', keywords: ['trcanje', 'tempo'] },
    { id: 'rm1', name: '1RM kalkulator', category: 'Fitness', icon: '🏋️', description: 'Procena 1RM', screen: 'health-screen', tab: 'health-rm1-tab', keywords: ['1rm', 'bench', 'squat'] },
    { id: 'volume', name: 'Workout volume', category: 'Fitness', icon: '💪', description: 'Ukupan volumen treninga', screen: 'health-screen', tab: 'health-volume-tab', keywords: ['volumen', 'trening'] },
    { id: 'date-diff', name: 'Razlika datuma', category: 'Datumi', icon: '📅', description: 'Razlika između datuma', screen: 'time-screen', tab: 'time-razlika-tab', keywords: ['razlika', 'datumi'] },
    { id: 'age', name: 'Godine osobe', category: 'Datumi', icon: '🎂', description: 'Starost iz datuma rođenja', screen: 'time-screen', tab: 'time-godine-tab', keywords: ['godine', 'starost'] },
    { id: 'length', name: 'Konverzija dužine', category: 'Mere', icon: '📏', description: 'm, km, cm, ft, in', screen: 'measures-screen', tab: 'measures-duzina-tab', keywords: ['duzina', 'metar'] },
    { id: 'weight-conv', name: 'Konverzija težine', category: 'Mere', icon: '⚖️', description: 'kg, lbs, oz', screen: 'measures-screen', tab: 'measures-tezina-tab', keywords: ['tezina', 'kg'] },
    { id: 'measures-pct', name: 'Procenat (Mere)', category: 'Mere', icon: '%', description: 'Dodaj/oduzmi %, promena', screen: 'measures-screen', tab: 'measures-procenat-tab', keywords: ['procenat', 'posto', 'promena'] },
    { id: 'shape', name: 'Površina', category: 'Građevina', icon: '📐', description: 'Pravougaonik, krug, trougao', screen: 'home-calc-screen', tab: 'homecalc-povrsina-tab', keywords: ['povrsina', 'krug'] },
    { id: 'paint', name: 'Farbanje', category: 'Građevina', icon: '🎨', description: 'Koliko farbe treba', screen: 'home-calc-screen', tab: 'homecalc-farbanje-tab', keywords: ['farba', 'boja', 'zid'] },
    { id: 'tiles', name: 'Pločice', category: 'Građevina', icon: '🧱', description: 'Broj pločica', screen: 'home-calc-screen', tab: 'homecalc-plocice-tab', keywords: ['plocice', 'keramika'] },
    { id: 'laminate', name: 'Laminat', category: 'Građevina', icon: '🪵', description: 'Broj pakovanja', screen: 'home-calc-screen', tab: 'homecalc-laminat-tab', keywords: ['laminat', 'parket'] },
    { id: 'concrete', name: 'Beton', category: 'Građevina', icon: '🏗️', description: 'Kubikaža betona', screen: 'home-calc-screen', tab: 'homecalc-beton-tab', keywords: ['beton', 'kubikaza'] },
    { id: 'blocks', name: 'Blokovi', category: 'Građevina', icon: '🧱', description: 'Broj blokova za zid', screen: 'home-calc-screen', tab: 'homecalc-blokovi-tab', keywords: ['blokovi', 'giter', 'siporeks', 'cigla'] },
    { id: 'boards', name: 'Table', category: 'Građevina', icon: '🪵', description: 'OSB, regips, šper', screen: 'home-calc-screen', tab: 'homecalc-table-tab', keywords: ['table', 'osb', 'regips'] },
    { id: 'crep', name: 'Crep', category: 'Građevina', icon: '🏠', description: 'Broj crepova za krov', screen: 'home-calc-screen', tab: 'homecalc-crep-tab', keywords: ['crep', 'krov'] },
    { id: 'malter', name: 'Malter', category: 'Građevina', icon: '🧪', description: 'Cement, pesak, voda', screen: 'home-calc-screen', tab: 'homecalc-malter-tab', keywords: ['malter', 'cement', 'pesak'] },
    { id: 'gips', name: 'Gips', category: 'Građevina', icon: '🎨', description: 'Gips ploče i profili', screen: 'home-calc-screen', tab: 'homecalc-gips-tab', keywords: ['gips', 'regips', 'profili'] },
    { id: 'temelj', name: 'Temelj', category: 'Građevina', icon: '🏗️', description: 'Beton i armatura', screen: 'home-calc-screen', tab: 'homecalc-temelj-tab', keywords: ['temelj', 'armatura'] },
    { id: 'hidro', name: 'Hidroizolacija', category: 'Građevina', icon: '💧', description: 'Folije i premazi', screen: 'home-calc-screen', tab: 'homecalc-hidro-tab', keywords: ['hidroizolacija', 'folija'] },
    { id: 'elektro', name: 'Elektro', category: 'Građevina', icon: '🔌', description: 'Utičnice, kablovi', screen: 'home-calc-screen', tab: 'homecalc-elektro-tab', keywords: ['elektro', 'uticnice'] },
    { id: 'stolarija', name: 'Stolarija', category: 'Građevina', icon: '🚪', description: 'Vrata i prozori', screen: 'home-calc-screen', tab: 'homecalc-stolarija-tab', keywords: ['stolarija', 'vrata', 'prozori'] },
    { id: 'univerzalno', name: 'Univerzalno', category: 'Građevina', icon: '🎯', description: 'Komada × cena', screen: 'home-calc-screen', tab: 'homecalc-univerzalno-tab', keywords: ['univerzalno', 'komada', 'cena'] },
    { id: 'unit-price', name: 'Cena po jedinici', category: 'Kupovina', icon: '💵', description: 'Cena/kg, /L, /kom', screen: 'shopping-screen', tab: 'shop-unit-tab', keywords: ['cena', 'jedinica', 'kg'] },
    { id: 'compare', name: 'Poređenje proizvoda', category: 'Kupovina', icon: '⚖️', description: 'Koji je jeftiniji', screen: 'shopping-screen', tab: 'shop-compare-tab', keywords: ['poredjenje', 'jeftinije'] },
    { id: 'promo', name: 'Akcije 2+1', category: 'Kupovina', icon: '🎁', description: '2+1 gratis, druga cena', screen: 'shopping-screen', tab: 'shop-promo-tab', keywords: ['akcija', '2+1', 'gratis'] },
    { id: 'shop-lista', name: 'Lista za kupovinu', category: 'Kupovina', icon: '📋', description: 'Lista sa čekiranjem', screen: 'shopping-screen', tab: 'shop-lista-tab', keywords: ['lista', 'kupovina', 'namirnice'] },
    { id: 'shop-budzet', name: 'Dnevni budžet', category: 'Kupovina', icon: '📅', description: 'Koliko dnevno trošiti', screen: 'shopping-screen', tab: 'shop-budzet-tab', keywords: ['budzet', 'dnevni', 'limit'] },
    { id: 'shop-rate', name: 'Rate vs. keš', category: 'Kupovina', icon: '💳', description: 'Šta se više isplati', screen: 'shopping-screen', tab: 'shop-rate-tab', keywords: ['rate', 'kes', 'popust'] },
    { id: 'shop-kartice', name: 'Kartica vs. keš', category: 'Kupovina', icon: '💵', description: 'Stvarna cena kartice', screen: 'shopping-screen', tab: 'shop-kartice-tab', keywords: ['kartica', 'kes', 'odlozeno'] },
    { id: 'shop-litar', name: 'Cena po litru', category: 'Kupovina', icon: '💧', description: 'Za tečnosti', screen: 'shopping-screen', tab: 'shop-litar-tab', keywords: ['litar', 'litra', 'tecno'] },
    { id: 'shop-osoba', name: 'Trošak po osobi', category: 'Kupovina', icon: '👥', description: 'Podeli na članove', screen: 'shopping-screen', tab: 'shop-osoba-tab', keywords: ['osoba', 'clan', 'podela'] },
    { id: 'shop-isplati', name: 'Isplati li se ići', category: 'Kupovina', icon: '🎯', description: 'Trošak goriva do radnje', screen: 'shopping-screen', tab: 'shop-isplati-tab', keywords: ['isplati', 'gorivo', 'radnja'] },
    { id: 'shop-racuni', name: 'Poređenje računa', category: 'Kupovina', icon: '🧾', description: 'Dva računa uporedi', screen: 'shopping-screen', tab: 'shop-racuni-tab', keywords: ['racun', 'poredjenje'] },
    { id: 'shop-rasipanje', name: 'Cena po obroku', category: 'Kupovina', icon: '📦', description: 'Trošak namirnice po obroku', screen: 'shopping-screen', tab: 'shop-rasipanje-tab', keywords: ['obrok', 'porcija', 'namirnica'] },
    { id: 'spoon', name: 'Kašike u grame', category: 'Kuhinja', icon: '🥄', description: 'Konverzija kašika u grame', screen: 'kitchen-screen', tab: 'kitchen-kasike-tab', keywords: ['kasike', 'grami', 'supena'] },
    { id: 'cup', name: 'Čaše u litre', category: 'Kuhinja', icon: '🥛', description: 'Konverzija čaša i litara', screen: 'kitchen-screen', tab: 'kitchen-case-tab', keywords: ['case', 'litre', 'ml'] },
    { id: 'oven', name: 'Temperatura pećnice', category: 'Kuhinja', icon: '🌡️', description: 'C°, F°, Gas mark', screen: 'kitchen-screen', tab: 'kitchen-pecenje-tab', keywords: ['pecenje', 'temperatura', 'pecnica'] },
    { id: 'portion', name: 'Porcije', category: 'Kuhinja', icon: '🍽️', description: 'Preračunaj recept', screen: 'kitchen-screen', tab: 'kitchen-porcije-tab', keywords: ['porcije', 'recept'] },
    { id: 'power', name: 'Potrošnja struje', category: 'Struja', icon: '⚡', description: 'kWh i trošak uređaja', screen: 'power-screen', tab: 'power-uredjaj-tab', keywords: ['struja', 'kwh', 'bojler'] },
    { id: 'power-watt', name: 'W ↔ A konverzija', category: 'Struja', icon: '🔋', description: 'Snaga ↔ struja', screen: 'power-screen', tab: 'power-watt-tab', keywords: ['watt', 'amper', 'snaga', 'struja'] },
    { id: 'power-kabl', name: 'Kabl + osigurač', category: 'Struja', icon: '🔌', description: 'Presek kabla i osigurač', screen: 'power-screen', tab: 'power-kabl-tab', keywords: ['kabl', 'osigurac', 'presek', 'mm2'] },
    { id: 'power-pad', name: 'Pad napona', category: 'Struja', icon: '⚡', description: 'Pad napona na kablu', screen: 'power-screen', tab: 'power-padnapona-tab', keywords: ['pad', 'napon', 'volt'] },
    { id: 'power-osig', name: 'Osigurač', category: 'Struja', icon: '🛡️', description: 'Preporuka osigurača', screen: 'power-screen', tab: 'power-osigurac-tab', keywords: ['osigurac', 'fuse', 'automatski'] },
    { id: 'power-trofazna', name: 'Trofazna struja', category: 'Struja', icon: '📊', description: '3-fazni proračun', screen: 'power-screen', tab: 'power-trofazna-tab', keywords: ['trofazna', '3f', '400v'] },
    { id: 'power-osvetljenje', name: 'Osvetljenje', category: 'Struja', icon: '💡', description: 'Lumeni po prostoriji', screen: 'power-screen', tab: 'power-osvetljenje-tab', keywords: ['osvetljenje', 'lumen', 'lux', 'svetlo'] },
    { id: 'power-grejac', name: 'Grejač vode', category: 'Struja', icon: '🌡️', description: 'Vreme zagrevanja', screen: 'power-screen', tab: 'power-grejac-tab', keywords: ['grejac', 'bojler', 'zagrevanje'] },
    { id: 'power-baterije', name: 'Trajanje baterije', category: 'Struja', icon: '🔋', description: 'Trajanje baterije/UPS', screen: 'power-screen', tab: 'power-baterije-tab', keywords: ['baterija', 'ups', 'ah', 'trajanje'] },
    { id: 'worktime', name: 'Radno vreme', category: 'Posao', icon: '⏰', description: 'Ukupno radno vreme', screen: 'work-screen', tab: 'work-vreme-tab', keywords: ['radno vreme'] },
    { id: 'hourly', name: 'Satnica', category: 'Posao', icon: '💰', description: 'Cena radnog sata', screen: 'work-screen', tab: 'work-satnica-tab', keywords: ['satnica', 'plata'] },
    { id: 'salary', name: 'Plata bruto/neto', category: 'Posao', icon: '💵', description: 'Bruto i neto plata', screen: 'work-screen', tab: 'work-plata-tab', keywords: ['plata', 'bruto', 'neto', 'doprinosi'] },
    { id: 'vacation', name: 'Godišnji odmor', category: 'Posao', icon: '📅', description: 'Dani odmora', screen: 'work-screen', tab: 'work-odmor-tab', keywords: ['odmor', 'godisnji'] },
    { id: 'night', name: 'Noćni rad', category: 'Posao', icon: '🌙', description: 'Uvećanje za noćni rad', screen: 'work-screen', tab: 'work-nocni-tab', keywords: ['nocni', 'noc', 'uvecanje'] },
    { id: 'overtime', name: 'Prekovremeno', category: 'Posao', icon: '📊', description: 'Zarada za prekovremeno', screen: 'work-screen', tab: 'work-prekovremeno-tab', keywords: ['prekovremeno', 'sati'] },
    { id: 'travel-costs', name: 'Putni troškovi', category: 'Posao', icon: '🚗', description: 'Dnevnice, gorivo, smeštaj', screen: 'work-screen', tab: 'work-putni-tab', keywords: ['putni', 'dnevnica', 'smeštaj'] },
    { id: 'bonuses', name: 'Bonusi', category: 'Posao', icon: '🎁', description: '13. plata, regres, topli obrok', screen: 'work-screen', tab: 'work-bonusi-tab', keywords: ['bonus', 'regres', '13 plata'] },
    { id: 'tuner', name: 'Štimer', category: 'Muzika', icon: '🎸', description: 'Štimovanje 12 instrumenata', screen: 'music-screen', tab: 'music-stimer-tab', keywords: ['stimer', 'stimovanje', 'gitara', 'tuner', 'mikrofon'] },
    { id: 'transpose', name: 'Transpozicija akorda', category: 'Muzika', icon: '🎼', description: 'Prebaci akorde u drugi ton', screen: 'music-screen', tab: 'music-transpozicija-tab', keywords: ['transpozicija', 'akordi', 'ton'] },
    { id: 'scale', name: 'Tonske lestvice', category: 'Muzika', icon: '🎹', description: 'Note u lestvici', screen: 'music-screen', tab: 'music-lestvice-tab', keywords: ['lestvica', 'skala', 'dur', 'mol'] },
    { id: 'chord', name: 'Akordi', category: 'Muzika', icon: '🎸', description: 'Tonovi u akordu', screen: 'music-screen', tab: 'music-akordi-tab', keywords: ['akord', 'dur', 'mol', 'septakord'] },
    { id: 'kapo', name: 'Kapo kalkulator', category: 'Muzika', icon: '🎤', description: 'Kapo na pragu', screen: 'music-screen', tab: 'music-kapo-tab', keywords: ['kapo', 'prag', 'gitara'] },
    { id: 'tempo-delay', name: 'Tempo i Delay', category: 'Muzika', icon: '⏱️', description: 'BPM ↔ milisekunde', screen: 'music-screen', tab: 'music-tempo-tab', keywords: ['tempo', 'bpm', 'delay', 'ms'] },
    { id: 'interval', name: 'Intervali', category: 'Muzika', icon: '🎚️', description: 'Rastojanje između tonova', screen: 'music-screen', tab: 'music-intervali-tab', keywords: ['interval', 'terca', 'kvinta'] },
    { id: 'metronome', name: 'Metronom', category: 'Muzika', icon: '🥁', description: 'BPM sa klik zvukom', screen: 'music-screen', tab: 'music-metronom-tab', keywords: ['metronom', 'bpm', 'klik'] },
    { id: 'frequency', name: 'Frekvencije nota', category: 'Muzika', icon: '🎛️', description: 'Frekvencija tonova', screen: 'music-screen', tab: 'music-frekvencije-tab', keywords: ['frekvencija', 'hz', 'stimanje'] },
    { id: 'detect-note', name: 'Detektor tona', category: 'Muzika', icon: '🎵', description: 'Ton iz frekvencije', screen: 'music-screen', tab: 'music-detektor-tab', keywords: ['detektor', 'ton', 'frekvencija'] }
];

function normalizeText(str) {
    return str.toLowerCase().replace(/đ/g, 'dj').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function searchTools(query) {
    const q = normalizeText(query);
    const scored = TOOLS.map(tool => {
        let score = 0;
        const name = normalizeText(tool.name);
        if (name === q) score += 100;
        else if (name.startsWith(q)) score += 60;
        else if (name.includes(q)) score += 40;
        tool.keywords.forEach(k => {
            const kw = normalizeText(k);
            if (kw === q) score += 50;
            else if (kw.startsWith(q)) score += 30;
            else if (kw.includes(q)) score += 15;
        });
        if (normalizeText(tool.category).includes(q)) score += 10;
        return { tool, score };
    });
    return scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score).slice(0, 6).map(s => s.tool);
}

function renderQuickResults(matches) {
    const box = el('quick-search-results');
    if (!box) return;
    box.innerHTML = '';
    if (!matches.length) {
        box.innerHTML = '<div class="qsr-empty"><div class="qsr-empty-title">🔍 Nema pronađenog alata</div><div class="qsr-empty-sub">Probaj sa drugim pojmom.</div></div>';
        return;
    }
    matches.forEach(tool => {
        const item = document.createElement('div');
        item.className = 'qsr-item';
        item.innerHTML = `<div class="qsr-icon">${tool.icon}</div><div class="qsr-text"><div class="qsr-name">${tool.name}</div><div class="qsr-desc">${tool.description}</div><div class="qsr-cat">${tool.category.toUpperCase()}</div></div>`;
        item.onclick = function () {
            const input = el('home-search');
            if (input) input.value = '';
            handleQuickSearch();
            openTool(tool.id);
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

function activateToolTab(tabId) {
    const target = el(tabId);
    if (!target) return;
    const screen = target.closest('.screen');
    if (!screen) return;
    screen.querySelectorAll('.sub-tab-content').forEach(c => c.classList.remove('active'));
    screen.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    target.classList.add('active');
    const parts = tabId.split('-');
    const tabName = parts[1];
    const btn = screen.querySelector(`.tab[onclick*="'${tabName}'"]`);
    if (btn) btn.classList.add('active');
}

function openTool(toolId) {
    const tool = TOOLS.find(t => t.id === toolId);
    if (!tool) return;
    openScreen(tool.screen);
    if (tool.tab) setTimeout(() => activateToolTab(tool.tab), 50);
}

// ================= ZVUK, VIBRACIJA =================

const PULSE_MS = 25;
const TICK_COUNT = 12;

let settings = { sound: true, haptic: true };
try {
    const saved = JSON.parse(localStorage.getItem('cx_fx'));
    if (saved) settings = Object.assign(settings, saved);
} catch (e) {}

function saveSettings() {
    try { localStorage.setItem('cx_fx', JSON.stringify(settings)); } catch (e) {}
}

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
    if (navigator.vibrate) {
        try { navigator.vibrate(pattern); } catch (e) {}
    }
}

function rollFeedback(duration) {
    const times = [0];
    let last = 0;
    for (let k = 1; k <= TICK_COUNT; k++) {
        let t = duration * (1 - Math.pow(1 - k / TICK_COUNT, 1 / 3));
        if (t - last < 38) t = last + 38;
        times.push(t);
        last = t;
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

function parseSr(token) {
    return parseFloat(token.replace('−', '-').replace(/\./g, '').replace(',', '.'));
}

function decimalsOf(token) {
    const i = token.indexOf(',');
    return i < 0 ? 0 : token.length - i - 1;
}

function fmtSr(value, decimals) {
    return value.toLocaleString('sr-RS', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
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
            node.innerHTML = finalHTML.replace(ROLL_RE, () => {
                const text = fmtSr(cur[k], decs[k]);
                k++;
                return text;
            });
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

// ================= TROJNI DATUM =================

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
    if (!wrap) {
        const inp = document.getElementById(dateId);
        if (inp) inp.value = iso || '';
        return;
    }
    const parts = isoToParts(iso);
    const dayIn = wrap.querySelector('.date-day');
    const monthIn = wrap.querySelector('.date-month');
    const yearIn = wrap.querySelector('.date-year');
    const hidden = document.getElementById(dateId);

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
    if (!wrap) {
        const inp = document.getElementById(dateId);
        return inp ? inp.value : '';
    }
    const dayIn = wrap.querySelector('.date-day');
    const monthIn = wrap.querySelector('.date-month');
    const yearIn = wrap.querySelector('.date-year');
    const hidden = document.getElementById(dateId);

    const d = dayIn ? parseInt(dayIn.value) : NaN;
    const m = monthIn ? parseInt(monthIn.value) : NaN;
    let y = yearIn ? parseInt(yearIn.value) : NaN;

    if (!isNaN(y) && y >= 0 && y < 100) {
        y = (y > 50 ? 1900 : 2000) + y;
        if (yearIn) yearIn.value = y;
    }

    const iso = partsToIso(d, m, y);
    if (hidden) hidden.value = iso;
    return iso;
}

function setupDateTriples() {
    document.querySelectorAll('.date-triple').forEach(wrap => {
        const dayIn = wrap.querySelector('.date-day');
        const monthIn = wrap.querySelector('.date-month');
        const yearIn = wrap.querySelector('.date-year');
        const dateId = wrap.dataset.dateId;

        if (dayIn) {
            dayIn.addEventListener('input', () => {
                let v = dayIn.value.replace(/\D/g, '');
                if (v.length > 2) v = v.slice(0, 2);
                if (v !== dayIn.value) dayIn.value = v;
                if (v.length === 2 || parseInt(v) > 3) {
                    if (monthIn) monthIn.focus();
                }
                updateHidden();
            });
        }
        if (monthIn) {
            monthIn.addEventListener('input', () => {
                let v = monthIn.value.replace(/\D/g, '');
                if (v.length > 2) v = v.slice(0, 2);
                if (v !== monthIn.value) monthIn.value = v;
                if (v.length === 2 || parseInt(v) > 1) {
                    if (yearIn) yearIn.focus();
                }
                updateHidden();
            });
        }
        if (yearIn) {
            yearIn.addEventListener('input', () => {
                let v = yearIn.value.replace(/\D/g, '');
                if (v.length > 4) v = v.slice(0, 4);
                if (v !== yearIn.value) yearIn.value = v;
                updateHidden();
            });
        }

        function updateHidden() {
            const hidden = document.getElementById(dateId);
            if (!hidden) return;
            const d = parseInt(dayIn ? dayIn.value : '');
            const m = parseInt(monthIn ? monthIn.value : '');
            let y = parseInt(yearIn ? yearIn.value : '');
            if (!isNaN(y) && y >= 0 && y < 100) y = (y > 50 ? 1900 : 2000) + y;
            hidden.value = partsToIso(d, m, y);
        }

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

// ================= PAMĆENJE UNOSA (AUTO-SAVE) =================

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
    let val;
    if (elInput.type === 'checkbox' || elInput.type === 'radio') {
        val = elInput.checked;
    } else {
        val = elInput.value;
    }
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
        if (elInput.type === 'checkbox' || elInput.type === 'radio') {
            elInput.checked = !!val;
        } else {
            elInput.value = val;
        }
    });

    // Posebno za date-triple hidden input
    root.querySelectorAll('.date-triple').forEach(wrap => {
        const hidden = wrap.querySelector('input[type="hidden"]');
        if (hidden && hidden.id && inputCache[hidden.id]) {
            setTripleDate(hidden.id, inputCache[hidden.id]);
        }
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

// ================= ISTORIJA + STATISTIKE =================

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
        const old = btn.textContent;
        btn.textContent = '✓ Sačuvano';
        showToast(`${label} sačuvano`, 'success', 2000);
        setTimeout(() => { btn.textContent = old; }, 1200);
        try { renderHistoryPreview(); } catch (e) {}
    } catch (e) { console.error('saveHistory error:', e); }
}

function deleteHistoryItem(idx) {
    try {
        const list = loadHistory();
        list.splice(idx, 1);
        saveHistoryList(list);
        renderHistory();
        showToast('Obrisano', 'info', 1500);
        try { renderHistoryPreview(); } catch (e) {}
    } catch (e) { console.error('deleteHistoryItem error:', e); }
}

async function clearHistory() {
    const ok = await showConfirm('Obrisati sva sačuvana računanja?', 'Brisanje istorije');
    if (!ok) return;
    saveHistoryList([]);
    renderHistory();
    showToast('Istorija obrisana', 'success');
    try { renderHistoryPreview(); } catch (e) {}
}

async function exportHistory() {
    try {
        const list = loadHistory();
        if (!list.length) {
            showToast('Nema sačuvanih računanja.', 'info');
            return;
        }
        const lines = list.map(item => {
            const d = new Date(item.date);
            const dateStr = d.toLocaleDateString('sr-RS') + ' ' + d.toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' });
            return `${item.category} – ${item.label}\n${item.text}\n${dateStr}\n`;
        });
        const fullText = 'MOJA RAČUNANJA — Alatika\n\n' + lines.join('\n');

        if (navigator.share) {
            try { await navigator.share({ text: fullText }); showToast('Podeljeno', 'success'); } catch (e) {}
            return;
        }
        const ta = document.createElement('textarea');
        ta.value = fullText;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); showToast('Kopirano', 'success'); }
        catch (e) { showToast('Kopiranje nije uspelo.', 'error'); }
        document.body.removeChild(ta);
    } catch (e) { console.error('exportHistory error:', e); }
}

function getDateGroup(timestamp) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const todayMs = now.getTime();
    const dayMs = 86400000;
    const t = new Date(timestamp);
    t.setHours(0, 0, 0, 0);
    const diffDays = Math.round((todayMs - t.getTime()) / dayMs);

    if (diffDays === 0) return { key: 'today', title: '📅 Danas' };
    if (diffDays === 1) return { key: 'yesterday', title: '📅 Juče' };
    if (diffDays < 7) return { key: 'week', title: '📅 Ove nedelje' };
    return { key: 'older', title: '📅 Starije' };
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
            if (query) {
                countEl.textContent = `Pronađeno: ${filtered.length} / ${list.length}`;
            } else {
                countEl.textContent = `Ukupno: ${list.length}`;
            }
        }

        container.innerHTML = '';

        if (!list.length) {
            if (empty) empty.style.display = 'block';
            if (noResults) noResults.style.display = 'none';
            renderUsageStats();
            return;
        }

        if (!filtered.length) {
            if (empty) empty.style.display = 'none';
            if (noResults) noResults.style.display = 'block';
            renderUsageStats();
            return;
        }

        if (empty) empty.style.display = 'none';
        if (noResults) noResults.style.display = 'none';

        const groups = { today: [], yesterday: [], week: [], older: [] };
        filtered.forEach(item => {
            const g = getDateGroup(item.date);
            groups[g.key].push(item);
        });

        const groupOrder = [
            { key: 'today', title: '📅 Danas' },
            { key: 'yesterday', title: '📅 Juče' },
            { key: 'week', title: '📅 Ove nedelje' },
            { key: 'older', title: '📅 Starije' }
        ];

        const originalIndexMap = new Map();
        list.forEach((item, idx) => {
            originalIndexMap.set(item, idx);
        });

        groupOrder.forEach(group => {
            const items = groups[group.key];
            if (!items.length) return;

            const groupDiv = document.createElement('div');
            groupDiv.className = 'history-group';

            const groupTitle = document.createElement('div');
            groupTitle.className = 'history-group-title';
            groupTitle.textContent = group.title;
            groupDiv.appendChild(groupTitle);

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
                const dateEl = document.createElement('div');
                dateEl.className = 'history-date';
                dateEl.textContent = d.toLocaleDateString('sr-RS') + ' ' + d.toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' });

                left.appendChild(cat);
                left.appendChild(res);
                left.appendChild(dateEl);

                const del = document.createElement('button');
                del.className = 'delete-item-btn';
                del.textContent = '✕';
                del.onclick = function () { deleteHistoryItem(realIdx); };

                row.appendChild(left);
                row.appendChild(del);
                groupDiv.appendChild(row);
            });

            container.appendChild(groupDiv);
        });

        renderUsageStats();
    } catch (e) { console.error('renderHistory error:', e); }
}

function renderUsageStats() {
    try {
        const box = el('usage-stats-box');
        if (!box) return;

        let counts = {};
        try { counts = JSON.parse(localStorage.getItem('cx_card_clicks')) || {}; } catch (e) {}

        const entries = Object.keys(counts)
            .filter(id => CARD_META[id] && counts[id] > 0)
            .map(id => ({ id, count: counts[id], meta: CARD_META[id] }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        if (!entries.length) {
            box.innerHTML = '<div class="chart-empty"><span class="chart-empty-icon">📊</span>Još nema statistika. Otvaraj kartice da bi se pojavile ovde.</div>';
            return;
        }

        const maxCount = Math.max(...entries.map(e => e.count), 1);

        const colors = {
            'auto-screen': '#ef4444',
            'bike-screen': '#3b82f6',
            'money-screen': '#10b981',
            'measures-screen': '#64748b',
            'health-screen': '#ec4899',
            'time-screen': '#8b5cf6',
            'home-calc-screen': '#f97316',
            'shopping-screen': '#06b6d4',
            'kitchen-screen': '#84cc16',
            'power-screen': '#facc15',
            'work-screen': '#6366f1',
            'music-screen': '#a855f7'
        };

        let html = '<div class="bar-chart-h">';
        entries.forEach((entry, idx) => {
            const width = (entry.count / maxCount * 100);
            const color = colors[entry.id] || '#00e676';
            html += `
                <div class="bar-row" style="animation-delay:${idx * 0.05}s;">
                    <div class="bar-row-label">${entry.meta.title}</div>
                    <div class="bar-row-track">
                        <div class="bar-row-fill" style="width:${width}%; --bar-color:${color};"></div>
                    </div>
                    <div class="bar-row-value">${entry.count}×</div>
                </div>
            `;
        });
        html += '</div>';
        box.innerHTML = html;
    } catch (e) { console.error('renderUsageStats error:', e); }
}

function toggleStatsPanel() {
    const panel = el('stats-panel');
    const btn = el('stats-toggle-btn');
    if (!panel || !btn) return;
    const isOpen = panel.style.display !== 'none';
    if (isOpen) {
        panel.style.display = 'none';
        btn.classList.remove('open');
        btn.innerHTML = '📊 Prikaži statistiku korišćenja';
    } else {
        panel.style.display = 'block';
        btn.classList.add('open');
        btn.innerHTML = '📊 Sakrij statistiku korišćenja';
        renderUsageStats();
    }
}

function openHistoryScreen() {
    renderHistory();
    openScreen('history-screen');
}

// ================= PODELI =================

async function shareResult(btn) {
    try {
        const category = btn.dataset.category;
        const label = btn.dataset.label;
        const card = btn.closest('.result-card-green');
        const text = card ? cardText(card) : '';
        const shareText = `${category} – ${label}\n${text}\n\n(Izračunato u Alatika)`;

        if (navigator.share) {
            try { await navigator.share({ text: shareText }); showToast('Podeljeno', 'success'); } catch (e) {}
            return;
        }
        const ta = document.createElement('textarea');
        ta.value = shareText;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); showToast('Kopirano', 'success'); }
        catch (e) { showToast('Kopiranje nije uspelo.', 'error'); }
        document.body.removeChild(ta);
    } catch (e) { console.error('shareResult error:', e); }
}

// ================= FAVORITES =================

const CARD_META = {
    'auto-screen':       { icon: '🚗', title: 'AUTO' },
    'bike-screen':       { icon: '🚲', title: 'BICIKL' },
    'money-screen':      { icon: '💰', title: 'NOVAC' },
    'measures-screen':   { icon: '📏', title: 'MERE' },
    'health-screen':     { icon: '❤️', title: 'ZDRAVLJE' },
    'time-screen':       { icon: '⏰', title: 'VREME' },
    'home-calc-screen':  { icon: '🏗️', title: 'GRAĐEVINA' },
    'shopping-screen':   { icon: '🛒', title: 'KUPOVINA' },
    'kitchen-screen':    { icon: '🍳', title: 'KUHINJA' },
    'power-screen':      { icon: '⚡', title: 'STRUJA' },
    'work-screen':       { icon: '💼', title: 'POSAO' },
    'music-screen':      { icon: '🎵', title: 'MUZIKA' }
};

function loadFavorites() {
    try {
        const raw = JSON.parse(localStorage.getItem('cx_favorites_v3'));
        if (Array.isArray(raw)) return raw;
    } catch (e) {}
    try {
        const old = JSON.parse(localStorage.getItem('cx_card_clicks')) || {};
        const migrated = Object.keys(old)
            .filter(id => CARD_META[id] && old[id] >= 2)
            .sort((a, b) => old[b] - old[a]);
        if (migrated.length) {
            localStorage.setItem('cx_favorites_v3', JSON.stringify(migrated));
            return migrated;
        }
    } catch (e) {}
    return [];
}

function saveFavorites(list) {
    try { localStorage.setItem('cx_favorites_v3', JSON.stringify(list)); } catch (e) {}
}

function isFavorite(key) {
    return loadFavorites().indexOf(key) !== -1;
}

function toggleFavorite(event, key, type) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    const list = loadFavorites();
    const idx = list.indexOf(key);
    const wasFav = idx !== -1;
    if (wasFav) {
        list.splice(idx, 1);
        showToast('Uklonjeno iz Moji alati', 'info', 1400);
        vibrate(10);
    } else {
        list.push(key);
        showToast('Dodato u Moje alate', 'success', 1400);
        vibrate(20);
        playTick(0, 1400, 0.07, 0.025);
    }
    saveFavorites(list);
    updateAllStars();
    renderFavorites();
    try { renderHistoryPreview(); } catch (e) {}
}

function updateAllStars() {
    document.querySelectorAll('.card').forEach(card => {
        const star = card.querySelector('.card-star');
        if (!star) return;
        const screenId = card.dataset.screen;
        if (!screenId) return;
        star.classList.toggle('active', isFavorite(screenId));
    });
    document.querySelectorAll('.tab').forEach(tab => {
        const star = tab.querySelector('.tab-star');
        if (!star) return;
        const key = tab.dataset.favKey;
        if (!key) return;
        star.classList.toggle('active', isFavorite(key));
    });
}

function renderFavorites() {
    try {
        const row = el('favorites-row');
        const emptyMsg = el('favorites-empty');
        if (!row) return;

        const list = loadFavorites();

        if (!list.length) {
            row.innerHTML = '';
            row.style.display = 'block';
            if (emptyMsg) emptyMsg.style.display = 'block';
            return;
        }

        if (emptyMsg) emptyMsg.style.display = 'none';

        const chipsWrap = document.createElement('div');
        chipsWrap.className = 'favorites-chips';

        list.forEach(key => {
            const chip = document.createElement('button');
            chip.className = 'favorite-chip';
            chip.type = 'button';

            if (CARD_META[key]) {
                const meta = CARD_META[key];
                chip.innerHTML = `
                    <span class="fav-icon">${meta.icon}</span>
                    <span class="fav-text">${meta.title}</span>
                    <span class="fav-remove" title="Ukloni">✕</span>
                `;
                chip.querySelector('.fav-remove').addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleFavorite(e, key, 'card');
                });
                chip.addEventListener('click', () => openScreen(key));
            } else {
                const parts = key.split(':');
                const screenId = parts[0] + '-screen';
                const tabName = parts[1];
                const tabId = `${parts[0]}-${tabName}-tab`;
                const tool = TOOLS.find(t => t.tab === tabId);
                const icon = tool ? tool.icon : '⭐';
                const name = tool ? tool.name : (tabName.charAt(0).toUpperCase() + tabName.slice(1));

                chip.classList.add('fav-tab');
                chip.innerHTML = `
                    <span class="fav-icon">${icon}</span>
                    <span class="fav-text">${name}</span>
                    <span class="fav-remove" title="Ukloni">✕</span>
                `;
                chip.querySelector('.fav-remove').addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleFavorite(e, key, 'tab');
                });
                chip.addEventListener('click', () => {
                    openScreen(screenId);
                    setTimeout(() => activateToolTab(tabId), 80);
                });
            }

            chipsWrap.appendChild(chip);
        });

        row.innerHTML = '';
        row.appendChild(chipsWrap);
        row.style.display = 'block';
    } catch (e) { console.error('renderFavorites error:', e); }
}

function trackCardUse(screenId) {
    if (!CARD_META[screenId]) return;
    try {
        let counts = {};
        try { counts = JSON.parse(localStorage.getItem('cx_card_clicks')) || {}; } catch (e) {}
        counts[screenId] = (counts[screenId] || 0) + 1;
        localStorage.setItem('cx_card_clicks', JSON.stringify(counts));
    } catch (e) { console.error('trackCardUse error:', e); }
}

// ================= MOJA RAČUNANJA (preview) =================

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
                        <div style="font-weight:700; color: var(--text-main); margin-bottom:2px;">Još nema računanja</div>
                        <div style="font-size:0.75rem;">Sačuvaj prvo računanje i pojaviće se ovde.</div>
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
            if (diffMin < 1) timeStr = 'upravo sad';
            else if (diffMin < 60) timeStr = `pre ${diffMin} min`;
            else if (diffMin < 1440) timeStr = `pre ${Math.round(diffMin / 60)}h`;
            else timeStr = d.toLocaleDateString('sr-RS');

            const fullText = (last.text || '').replace(/\s+/g, ' ').trim();
            const shortText = fullText.length > 100 ? fullText.slice(0, 100) + '…' : fullText;

            previewBox.innerHTML = `
                <div class="hp-last-label">
                    <span>Poslednje računanje</span>
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
                <div class="hqs-label">Ukupno</div>
            </div>
            <div class="hqs-item">
                <div class="hqs-value">${todayCount}</div>
                <div class="hqs-label">Danas</div>
            </div>
            <div class="hqs-item">
                <div class="hqs-value">${favCount}</div>
                <div class="hqs-label">Favorita</div>
            </div>
        `;
    } catch (e) { console.error('renderHistoryPreview error:', e); }
}// ================= DRAG & DROP — TABOVI =================

let tabDragEl = null;
let tabDragStartX = 0;
let tabDragStartY = 0;
let tabLongPressTimer = null;
let tabDragActive = false;
let tabPlaceholder = null;
let tabParentContainer = null;

function setupTabDrag() {
    document.querySelectorAll('.tabs').forEach(tabsContainer => {
        if (tabsContainer.dataset.tabDragSetup === '1') return;
        tabsContainer.dataset.tabDragSetup = '1';

        tabsContainer.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('pointerdown', onTabPointerDown);
        });
    });
}

function onTabPointerDown(e) {
    const tab = e.currentTarget;
    if (e.target.closest('.tab-star')) return;

    tabDragStartX = e.clientX;
    tabDragStartY = e.clientY;
    clearTimeout(tabLongPressTimer);

    const moveCheck = (ev) => {
        if (Math.abs(ev.clientX - tabDragStartX) > 12 || Math.abs(ev.clientY - tabDragStartY) > 12) {
            clearTimeout(tabLongPressTimer);
            document.removeEventListener('pointermove', moveCheck);
        }
    };
    document.addEventListener('pointermove', moveCheck);

    tabLongPressTimer = setTimeout(() => {
        document.removeEventListener('pointermove', moveCheck);
        startTabDrag(tab, e);
        vibrate([60, 20, 60]);
        playTick(0, 1000, 0.08, 0.04);
    }, 450);

    const clearPress = () => {
        clearTimeout(tabLongPressTimer);
        document.removeEventListener('pointermove', moveCheck);
    };
    tab.addEventListener('pointerup', clearPress, { once: true });
    tab.addEventListener('pointercancel', clearPress, { once: true });
}

function startTabDrag(tab, e) {
    tabDragActive = true;
    tabDragEl = tab;
    tabParentContainer = tab.parentNode;

    const rect = tab.getBoundingClientRect();

    tabPlaceholder = document.createElement('div');
    tabPlaceholder.className = 'tab-drop-placeholder';
    tabPlaceholder.style.width = rect.width + 'px';
    tabPlaceholder.style.height = rect.height + 'px';

    tabParentContainer.insertBefore(tabPlaceholder, tab);

    tab.classList.add('dragging-tab');
    tab.style.position = 'fixed';
    tab.style.left = rect.left + 'px';
    tab.style.top = rect.top + 'px';
    tab.style.width = rect.width + 'px';
    tab.style.height = rect.height + 'px';
    tab.style.zIndex = '9999';
    tab.style.pointerEvents = 'none';

    tabParentContainer.classList.add('dragging-active');

    document.addEventListener('pointermove', onTabDragMove);
    document.addEventListener('pointerup', endTabDrag, { once: true });
    document.addEventListener('pointercancel', endTabDrag, { once: true });
}

function onTabDragMove(e) {
    if (!tabDragActive || !tabDragEl) return;

    const rect = tabDragEl.getBoundingClientRect();
    const offsetX = rect.width / 2;
    const offsetY = rect.height / 2;

    tabDragEl.style.left = (e.clientX - offsetX) + 'px';
    tabDragEl.style.top = (e.clientY - offsetY) + 'px';

    const tabs = Array.from(tabParentContainer.querySelectorAll('.tab:not(.dragging-tab)'));
    let hoverTab = null;

    for (const other of tabs) {
        const r = other.getBoundingClientRect();
        if (e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom) {
            hoverTab = other;
            break;
        }
    }

    if (hoverTab) {
        const r = hoverTab.getBoundingClientRect();
        const midX = r.left + r.width / 2;
        if (e.clientX < midX) {
            tabParentContainer.insertBefore(tabPlaceholder, hoverTab);
        } else {
            tabParentContainer.insertBefore(tabPlaceholder, hoverTab.nextSibling);
        }
    }
}

function endTabDrag() {
    if (!tabDragEl) return;

    document.removeEventListener('pointermove', onTabDragMove);

    if (tabPlaceholder && tabPlaceholder.parentNode) {
        tabPlaceholder.parentNode.insertBefore(tabDragEl, tabPlaceholder);
        tabPlaceholder.remove();
    }
    tabPlaceholder = null;

    tabDragEl.classList.remove('dragging-tab');
    tabDragEl.style.position = '';
    tabDragEl.style.left = '';
    tabDragEl.style.top = '';
    tabDragEl.style.width = '';
    tabDragEl.style.height = '';
    tabDragEl.style.zIndex = '';
    tabDragEl.style.pointerEvents = '';

    if (tabParentContainer) {
        tabParentContainer.classList.remove('dragging-active');
    }

    saveTabOrder();

    tabDragActive = false;
    tabDragEl = null;
    tabParentContainer = null;

    vibrate([80, 30, 80, 30, 80]);
    playTick(0, 600, 0.1, 0.06);
}

function saveTabOrder() {
    const order = {};
    document.querySelectorAll('.screen').forEach(screen => {
        const screenId = screen.id;
        if (!screenId) return;

        screen.querySelectorAll('.tabs').forEach((tabsContainer, groupIdx) => {
            const tabs = Array.from(tabsContainer.querySelectorAll('.tab'));
            const keys = tabs.map(t => t.dataset.favKey || t.textContent.trim());
            order[`${screenId}::${groupIdx}`] = keys;
        });
    });
    try { localStorage.setItem('cx_tab_order_v1', JSON.stringify(order)); } catch (e) {}
}

function applyTabOrder() {
    let order = {};
    try { order = JSON.parse(localStorage.getItem('cx_tab_order_v1')) || {}; } catch (e) {}
    if (!Object.keys(order).length) return;

    document.querySelectorAll('.screen').forEach(screen => {
        const screenId = screen.id;
        if (!screenId) return;

        screen.querySelectorAll('.tabs').forEach((tabsContainer, groupIdx) => {
            const key = `${screenId}::${groupIdx}`;
            const savedOrder = order[key];
            if (!savedOrder || !savedOrder.length) return;

            savedOrder.forEach(tabKey => {
                const tab = Array.from(tabsContainer.querySelectorAll('.tab')).find(t => {
                    const tk = t.dataset.favKey || t.textContent.trim();
                    return tk === tabKey;
                });
                if (tab) tabsContainer.appendChild(tab);
            });
        });
    });
}

// ================= DRAG & DROP — KARTICE =================

let dragCard = null;
let isDragging = false;
let justDragged = false;
let longPressTimer = null;
let dragStartClientX = 0;
let dragStartClientY = 0;
let dragStartLeft = 0;
let dragStartTop = 0;
let dropPlaceholder = null;
let lastHoverGrid = null;

function getAllGrids() {
    return Array.from(document.querySelectorAll('#home-groups .grid-menu'));
}

function onCardPointerDown(e) {
    const card = e.currentTarget;
    if (e.target.closest('.card-star')) return;

    dragStartClientX = e.clientX;
    dragStartClientY = e.clientY;
    clearTimeout(longPressTimer);

    const moveCheck = (ev) => {
        if (Math.abs(ev.clientX - dragStartClientX) > 12 || Math.abs(ev.clientY - dragStartClientY) > 12) {
            clearTimeout(longPressTimer);
            document.removeEventListener('pointermove', moveCheck);
        }
    };
    document.addEventListener('pointermove', moveCheck);

    longPressTimer = setTimeout(() => {
        document.removeEventListener('pointermove', moveCheck);
        startCardDrag(card, e);
        vibrate([60, 20, 60]);
        playTick(0, 1000, 0.08, 0.04);
    }, 450);

    const clearPress = () => {
        clearTimeout(longPressTimer);
        document.removeEventListener('pointermove', moveCheck);
    };
    card.addEventListener('pointerup', clearPress, { once: true });
    card.addEventListener('pointercancel', clearPress, { once: true });
}

function startCardDrag(card, e) {
    isDragging = true;
    dragCard = card;

    const rect = card.getBoundingClientRect();

    dragStartClientX = e.clientX;
    dragStartClientY = e.clientY;
    dragStartLeft = rect.left;
    dragStartTop = rect.top;

    dropPlaceholder = document.createElement('div');
    dropPlaceholder.className = 'drop-placeholder';
    dropPlaceholder.style.height = rect.height + 'px';
    dropPlaceholder.style.width = rect.width + 'px';

    const initialGrid = card.parentNode;
    if (initialGrid && initialGrid.classList.contains('grid-menu')) {
        initialGrid.insertBefore(dropPlaceholder, card);
    }

    card.classList.add('dragging');
    card.style.position = 'fixed';
    card.style.left = rect.left + 'px';
    card.style.top = rect.top + 'px';
    card.style.width = rect.width + 'px';
    card.style.height = rect.height + 'px';
    card.style.margin = '0';

    const homeGroups = el('home-groups');
    if (homeGroups) homeGroups.classList.add('dragging-active');

    document.addEventListener('pointermove', onCardDragMove);
    document.addEventListener('pointerup', endCardDrag, { once: true });
    document.addEventListener('pointercancel', endCardDrag, { once: true });
}

function onCardDragMove(e) {
    if (!isDragging || !dragCard) return;

    const dx = e.clientX - dragStartClientX;
    const dy = e.clientY - dragStartClientY;

    dragCard.style.left = (dragStartLeft + dx) + 'px';
    dragCard.style.top = (dragStartTop + dy) + 'px';

    const pointX = e.clientX;
    const pointY = e.clientY;

    const grids = getAllGrids();
    let hoverGrid = null;

    for (const grid of grids) {
        const gr = grid.getBoundingClientRect();
        if (pointX > gr.left - 10 && pointX < gr.right + 10 &&
            pointY > gr.top - 40 && pointY < gr.bottom + 40) {
            hoverGrid = grid;
            break;
        }
    }

    if (!hoverGrid) {
        let bestDist = Infinity;
        for (const grid of grids) {
            const gr = grid.getBoundingClientRect();
            const cx = Math.max(gr.left, Math.min(pointX, gr.right));
            const cy = Math.max(gr.top, Math.min(pointY, gr.bottom));
            const d = Math.hypot(pointX - cx, pointY - cy);
            if (d < bestDist) {
                bestDist = d;
                hoverGrid = grid;
            }
        }
    }

    if (hoverGrid !== lastHoverGrid) {
        if (lastHoverGrid) lastHoverGrid.classList.remove('drop-hover');
        if (hoverGrid) hoverGrid.classList.add('drop-hover');
        lastHoverGrid = hoverGrid;
        if (hoverGrid) vibrate(8);
    }

    if (hoverGrid && dropPlaceholder) {
        const cards = Array.from(hoverGrid.querySelectorAll('.card:not(.dragging)'));
        let insertBefore = null;

        for (const other of cards) {
            const r = other.getBoundingClientRect();
            if (pointX > r.left && pointX < r.right && pointY > r.top && pointY < r.bottom) {
                const midX = r.left + r.width / 2;
                insertBefore = (pointX < midX) ? other : other.nextSibling;
                break;
            }
        }

        if (insertBefore) {
            hoverGrid.insertBefore(dropPlaceholder, insertBefore);
        } else if (hoverGrid.lastElementChild !== dropPlaceholder) {
            hoverGrid.appendChild(dropPlaceholder);
        }
    }
}

function endCardDrag() {
    if (!dragCard) return;

    document.removeEventListener('pointermove', onCardDragMove);

    if (dropPlaceholder && dropPlaceholder.parentNode) {
        dropPlaceholder.parentNode.insertBefore(dragCard, dropPlaceholder);
        dropPlaceholder.remove();
    }
    dropPlaceholder = null;

    dragCard.classList.remove('dragging');
    dragCard.style.position = '';
    dragCard.style.left = '';
    dragCard.style.top = '';
    dragCard.style.width = '';
    dragCard.style.height = '';
    dragCard.style.margin = '';

    isDragging = false;
    justDragged = true;

    getAllGrids().forEach(g => g.classList.remove('drop-hover'));
    const homeGroups = el('home-groups');
    if (homeGroups) homeGroups.classList.remove('dragging-active');

    lastHoverGrid = null;

    setTimeout(() => { justDragged = false; }, 100);

    vibrate([80, 30, 80, 30, 80]);
    playTick(0, 600, 0.1, 0.06);

    saveCardOrder();
    dragCard = null;
}

function applyCardOrder() {
    let order = {};
    try { order = JSON.parse(localStorage.getItem('cx_card_order_v2')) || {}; } catch (e) {}

    const groups = document.querySelectorAll('#home-groups .group');
    groups.forEach(group => {
        const groupKey = group.dataset.group || 'unknown';
        const grid = group.querySelector('.grid-menu');
        if (!grid) return;

        const savedOrder = order[groupKey];
        if (!savedOrder || !savedOrder.length) return;

        savedOrder.forEach(screenId => {
            const card = grid.querySelector(`.card[data-screen="${screenId}"]`);
            if (card && card.parentNode === grid) grid.appendChild(card);
        });
    });
}

function saveCardOrder() {
    const order = {};
    const groups = document.querySelectorAll('#home-groups .group');
    groups.forEach(group => {
        const groupKey = group.dataset.group || 'unknown';
        const grid = group.querySelector('.grid-menu');
        if (!grid) return;
        order[groupKey] = Array.from(grid.querySelectorAll('.card')).map(c => c.dataset.screen);
    });
    try { localStorage.setItem('cx_card_order_v2', JSON.stringify(order)); } catch (e) {}
}

function setupCardReorder() {
    const homeGroups = el('home-groups');
    if (!homeGroups) return;

    applyCardOrder();

    homeGroups.querySelectorAll('.card').forEach(card => {
        card.addEventListener('pointerdown', onCardPointerDown);
    });

    homeGroups.addEventListener('click', (e) => {
        if (justDragged) {
            e.preventDefault();
            e.stopImmediatePropagation();
        }
    }, true);
}

// ================= HINT O PREVLAČENJU =================

function maybeShowDragTip() {
    try { if (localStorage.getItem('cx_seen_drag_tip')) return; } catch (e) { return; }
    const tip = el('drag-tip');
    if (tip) tip.style.display = 'flex';
}

function dismissDragTip() {
    try { localStorage.setItem('cx_seen_drag_tip', '1'); } catch (e) {}
    const tip = el('drag-tip');
    if (tip) tip.style.display = 'none';
}

function maybeShowDragHint() {
    const hints = document.querySelectorAll('.drag-hint');
    hints.forEach(hint => {
        const hintId = hint.dataset.hintId;
        if (!hintId) return;
        try {
            if (localStorage.getItem('cx_seen_hint_' + hintId)) return;
        } catch (e) { return; }
        hint.style.display = 'flex';
        setTimeout(() => {
            if (hint.style.display !== 'none') {
                hint.style.display = 'none';
                try { localStorage.setItem('cx_seen_hint_' + hintId, '1'); } catch (e) {}
            }
        }, 8000);
    });
}

function dismissDragHint(hintId) {
    try { localStorage.setItem('cx_seen_hint_' + hintId, '1'); } catch (e) {}
    document.querySelectorAll('.drag-hint').forEach(hint => {
        if (hint.dataset.hintId === hintId) hint.style.display = 'none';
    });
}

// ================= NAVIGACIJA + ANDROID BACK (KRITIČNO) =================

let currentScreenId = 'home-screen';
let navDirection = 'right';

function openScreen(screenId, direction = 'right') {
    try {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active', 'enter-right', 'enter-left');
        });
        const target = el(screenId);
        if (!target) {
            console.warn('Screen not found:', screenId);
            return;
        }
        target.classList.add('active');
        if (!reduceMotion) {
            target.classList.add(direction === 'left' ? 'enter-left' : 'enter-right');
        }
        window.scrollTo(0, 0);

        const prevScreenId = currentScreenId;
        currentScreenId = screenId;
        navDirection = direction;

        trackCardUse(screenId);

        // Pamćenje unosa — restore za novi ekran
        try { restoreInputsFor(target); } catch (e) {}

        if (screenId === 'home-screen') {
            try { renderHistoryPreview(); } catch (e) {}
            try { applyTabOrder(); } catch (e) {}
            try { setupTabDrag(); } catch (e) {}
        }

        // Auto akcije po ekranu
        onScreenOpened(screenId);

        // Push state za back dugme — samo kad nije back navigacija
        if (direction !== 'left' && prevScreenId !== screenId) {
            try {
                history.pushState({ screen: screenId }, '', '');
            } catch (e) {}
        }

        try { maybeShowDragHint(); } catch (e) {}
    } catch (e) { console.error('openScreen error:', e); }
}

function onScreenOpened(screenId) {
    // Auto-osvežavanje kursne liste kad uđeš u Novac → Kursna lista
    if (screenId === 'money-screen') {
        const valutaTab = document.querySelector('#money-valuta-tab.active');
        if (valutaTab) {
            // Auto-refresh samo ako je stariji od 6h
            const lastUpdate = getFxLastUpdate();
            const ageH = lastUpdate ? (Date.now() - lastUpdate) / 3600000 : 999;
            if (ageH > 6) {
                refreshExchangeRates().catch(() => {});
            }
        }
        // Restore valuta tab active state
        try {
            const activeTab = document.querySelector('#money-screen .tab.active');
            if (activeTab && activeTab.dataset.favKey === 'money:valuta') {
                const lastUpdate = getFxLastUpdate();
                const ageH = lastUpdate ? (Date.now() - lastUpdate) / 3600000 : 999;
                if (ageH > 6) refreshExchangeRates().catch(() => {});
            }
        } catch (e) {}
    }
    if (screenId === 'history-screen') {
        renderHistory();
        renderUsageStats();
    }
    if (screenId === 'music-screen') {
        try { renderTunerStrings(); } catch (e) {}
    }
}

function goHome() {
    const searchInput = el('home-search');
    if (searchInput) {
        searchInput.value = '';
        handleQuickSearch();
    }
    if (currentScreenId === 'home-screen') return;
    // Idi kroz history da bi back ostao sinhronizovan
    if (history.state && history.state.screen && history.state.screen !== 'home-screen') {
        history.back();
    } else {
        openScreen('home-screen', 'left');
    }
}

function setupBackButton() {
    // Inicijalni state
    try {
        history.replaceState({ screen: 'home-screen', home: true }, '', '');
    } catch (e) {}

    window.addEventListener('popstate', (e) => {
        const state = e.state;

        // Ako je home state
        if (state && state.home) {
            if (currentScreenId !== 'home-screen') {
                openScreen('home-screen', 'left');
                // Re-push home da bi sledeći back ponovo uhvatio
                try { history.pushState({ screen: 'home-screen', home: true }, '', ''); } catch (err) {}
            }
            return;
        }

        // Ako ima screen u state
        if (state && state.screen) {
            const target = el(state.screen);
            if (target) {
                openScreen(state.screen, 'left');
                return;
            }
        }

        // Fallback: home
        if (currentScreenId !== 'home-screen') {
            openScreen('home-screen', 'left');
            try { history.pushState({ screen: 'home-screen', home: true }, '', ''); } catch (err) {}
        }
    });
}

// ================= SUB-TABOVI =================

function switchSubTab(category, tabName, event) {
    try {
        if (event) {
            const star = event.target.closest && event.target.closest('.tab-star');
            if (star) return;
        }

        const screen = event && event.target ? event.target.closest('.screen') : null;
        if (!screen) return;

        screen.querySelectorAll('.sub-tab-content').forEach(c => c.classList.remove('active'));
        screen.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));

        const target = el(`${category}-${tabName}-tab`);
        if (target) {
            target.classList.add('active');
            // Pamćenje — restore unosa u tabu
            try { restoreInputsFor(target); } catch (e) {}
        }

        let btn = event && event.target;
        if (btn && btn.tagName !== 'BUTTON') btn = btn.closest('.tab');
        if (btn) btn.classList.add('active');

        // Specijalne akcije po tabu
        if (category === 'money' && tabName === 'valuta') {
            const lastUpdate = getFxLastUpdate();
            const ageH = lastUpdate ? (Date.now() - lastUpdate) / 3600000 : 999;
            if (ageH > 6) {
                refreshExchangeRates().catch(() => {});
            } else {
                populateCurrencySelects();
                renderFxList();
                updateFxUpdatedLabel();
            }
        }
        if (category === 'music' && tabName === 'stimer') {
            try { renderTunerStrings(); } catch (e) {}
        }
    } catch (e) { console.error('switchSubTab error:', e); }
}

function updateSettingsUI() {
    try {
        const themeBtn = el('settings-theme-btn');
        if (themeBtn) {
            const isLight = document.documentElement.getAttribute('data-theme') === 'light';
            themeBtn.textContent = isLight ? '☀️ Svetla' : '🌙 Tamna';
        }
        const soundBtn = el('settings-sound-btn');
        if (soundBtn) soundBtn.textContent = settings.sound ? '🔊 Uključen' : '🔇 Isključen';
        const hapticBtn = el('settings-haptic-btn');
        if (hapticBtn) hapticBtn.textContent = settings.haptic ? '📳 Uključena' : '📴 Isključena';
        const curSel = el('settings-currency');
        if (curSel) {
            try { curSel.value = localStorage.getItem('cx_default_currency') || 'RSD'; } catch (e) {}
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
    const val = curSel.value;
    try { localStorage.setItem('cx_default_currency', val); } catch (e) {}
    const autoCur = el('auto-currency');
    if (autoCur) autoCur.value = val;
}

function toggleTheme() {
    try {
        const root = document.documentElement;
        const isLight = root.getAttribute('data-theme') === 'light';
        const themeBtn = el('theme-toggle');

        const svgMoon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
        const svgSun = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>';

        if (isLight) {
            root.removeAttribute('data-theme');
            if (themeBtn) themeBtn.innerHTML = svgMoon;
        } else {
            root.setAttribute('data-theme', 'light');
            if (themeBtn) themeBtn.innerHTML = svgSun;
        }
        try { localStorage.setItem('cx_theme', isLight ? 'dark' : 'light'); } catch (e) {}
        updateSettingsUI();
    } catch (e) {}
}

function swapInputs(fromId, toId) {
    const fromSelect = el(fromId);
    const toSelect = el(toId);
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
                btn.textContent = 'Kopirano ✓';
                setTimeout(() => { btn.textContent = old; }, 1500);
            }
            showToast('Kopirano u clipboard', 'success', 1800);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
        } else {
            fallbackCopy(text, done);
        }
    } catch (e) { console.error('copyResult error:', e); }
}

function fallbackCopy(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); }
    catch (e) { showToast('Kopiranje nije uspelo.', 'error'); }
    document.body.removeChild(ta);
}

// ================= PROCENAT — funkcije =================

function percentAddSub(base, pct, op) {
    if (base === null || pct === null) return null;
    const factor = op === 'add' ? 1 + pct / 100 : 1 - pct / 100;
    const result = base * factor;
    const sign = op === 'add' ? '+' : '−';
    return {
        result,
        formula: `${fmt(base)} ${sign} ${fmt(pct)}% = ${fmt(base)} × ${fmt(factor, 4)} = ${fmt(result)}`
    };
}

function percentXofY(x, y) {
    if (x === null || y === null || y === 0) return null;
    const p = (x / y) * 100;
    return {
        result: p,
        formula: `${fmt(x)} ÷ ${fmt(y)} × 100 = ${fmt(p)}%`
    };
}

function percentChange(from, to) {
    if (from === null || to === null || from === 0) return null;
    const p = ((to - from) / Math.abs(from)) * 100;
    const sign = p >= 0 ? '+' : '';
    return {
        result: p,
        formula: `(${fmt(to)} − ${fmt(from)}) ÷ ${fmt(Math.abs(from))} × 100 = ${sign}${fmt(p)}%`
    };
}

function setFormula(id, text) {
    const el2 = el(id);
    if (!el2) return;
    if (text) {
        el2.textContent = text;
        el2.classList.add('show');
    } else {
        el2.textContent = '';
        el2.classList.remove('show');
    }
}

function calculatePercent1() {
    const base = num('pct-base');
    const pct = num('pct-val');
    const opEl = el('pct-op');
    const op = opEl ? opEl.value : 'add';
    if (base === null || pct === null) {
        showToast('Unesite broj i procenat.', 'error');
        return;
    }
    const res = percentAddSub(base, pct, op);
    if (!res) return;
    const rv = el('res-pct1-val');
    if (rv) rv.innerText = fmt(res.result, 2);
    setFormula('pct1-formula', res.formula);
    show('pct1-result-box');
}

function calculatePercent2() {
    const x = num('pct-x');
    const y = num('pct-y');
    if (x === null || y === null || y === 0) {
        showToast('Unesite X i Y (Y ≠ 0).', 'error');
        return;
    }
    const res = percentXofY(x, y);
    if (!res) return;
    const rv = el('res-pct2-val');
    if (rv) rv.innerText = fmt(res.result, 2);
    setFormula('pct2-formula', res.formula);
    show('pct2-result-box');
}

function calculatePercent3() {
    const from = num('pct-from');
    const to = num('pct-to');
    if (from === null || to === null || from === 0) {
        showToast('Unesite početnu i krajnju vrednost (početna ≠ 0).', 'error');
        return;
    }
    const res = percentChange(from, to);
    if (!res) return;
    const rv = el('res-pct3-val');
    if (rv) {
        const sign = res.result >= 0 ? '+' : '';
        rv.innerText = sign + fmt(res.result, 2);
    }
    setFormula('pct3-formula', res.formula);
    show('pct3-result-box');
}

function calculateMoneyPercent1() {
    const base = num('np-base');
    const pct = num('np-val');
    const opEl = el('np-op');
    const op = opEl ? opEl.value : 'add';
    if (base === null || pct === null) {
        showToast('Unesite cenu i procenat.', 'error');
        return;
    }
    const res = percentAddSub(base, pct, op);
    if (!res) return;
    const rv = el('res-np1-val');
    if (rv) rv.innerText = money(res.result);
    const ru = el('res-np1-unit');
    if (ru) ru.innerText = 'RSD';
    setFormula('np1-formula', res.formula + ' RSD');
    show('np1-result-box');
}

function calculateMoneyPercent2() {
    const x = num('np-x');
    const y = num('np-y');
    if (x === null || y === null || y === 0) {
        showToast('Unesite deo i ukupno (ukupno ≠ 0).', 'error');
        return;
    }
    const res = percentXofY(x, y);
    if (!res) return;
    const rv = el('res-np2-val');
    if (rv) rv.innerText = fmt(res.result, 2);
    setFormula('np2-formula', res.formula);
    show('np2-result-box');
}

// ================= AUTO =================

function calculateAuto() {
    const dist = num('distance');
    const fuel = num('fuel');
    const price = num('price') || 0;
    const curEl = el('auto-currency');
    const currency = curEl ? curEl.value : 'RSD';
    if (!dist || !fuel) {
        showToast('Unesite pređeni put i potrošeno gorivo.', 'error');
        return;
    }
    const consumption = (fuel * 100) / dist;
    const totalCost = fuel * price;
    const rc = el('res-consumption');
    if (rc) rc.innerText = fmt(consumption, 2);
    const sd = el('stat-dist'); if (sd) sd.innerText = fmt(dist) + ' km';
    const sf = el('stat-fuel'); if (sf) sf.innerText = fmt(fuel) + ' L';
    const sc = el('stat-cost');
    if (sc) sc.innerText = price > 0 ? fmt(totalCost, 0) + ' ' + currency : '—';
    if (price > 0) { try { localStorage.setItem('cx_fuel_price', String(price)); } catch (e) {} }
    show('result-box');
    show('stats-row');
    logFuelEntry(consumption, dist, fuel);
}

function calculateService() {
    const currentKm = num('current-km');
    const lastService = num('last-service-km');
    const interval = num('service-interval');
    if (currentKm === null || lastService === null || !interval) {
        showToast('Unesite sve podatke.', 'error');
        return;
    }
    const nextServiceKm = lastService + interval;
    const remainingKm = nextServiceKm - currentKm;
    const lbl = el('res-service-label');
    const km = el('res-service-km');
    if (remainingKm >= 0) {
        if (lbl) lbl.innerText = 'Do sledećeg servisa';
        if (km) km.innerText = fmt(remainingKm, 0);
    } else {
        if (lbl) lbl.innerText = 'Servis je probijen za';
        if (km) km.innerText = fmt(-remainingKm, 0);
    }
    const sn = el('stat-service-next');
    if (sn) sn.innerText = fmt(nextServiceKm, 0) + ' km';
    show('service-result-box');
    show('service-stats-row');
}

function calculateAnnualCost() {
    const reg = num('cost-reg') || 0;
    const fuelYear = num('cost-fuel-year') || 0;
    const total = reg + fuelYear;
    if (total === 0) { showToast('Unesite bar jedan iznos.', 'error'); return; }
    const at = el('res-annual-total'); if (at) at.innerText = money(total);
    const am = el('stat-annual-month'); if (am) am.innerText = money(total / 12) + ' RSD';
    show('annual-result-box');
    show('annual-stats-row');
}

function calculateCostPerKm() {
    const dist = num('pokm-dist');
    const fuelCost = num('pokm-fuel-cost') || 0;
    const serviceCost = num('pokm-service-cost') || 0;
    const regCost = num('pokm-reg-cost') || 0;
    if (!dist) { showToast('Unesite pređenu kilometražu.', 'error'); return; }
    const total = fuelCost + serviceCost + regCost;
    const perKm = total / dist;
    const pv = el('res-pokm-val'); if (pv) pv.innerText = fmt(perKm, 2);
    const pt = el('stat-pokm-total'); if (pt) pt.innerText = money(total) + ' RSD';
    show('pokm-result-box');
    show('pokm-stats-row');
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((target - today) / 86400000);
}
function formatDaysLeft(days) {
    if (days === null) return '—';
    if (days < 0) return `Isteklo pre ${Math.abs(days)} d.`;
    if (days === 0) return 'Danas ističe';
    return `Još ${days} d.`;
}
function colorForDays(days) {
    if (days === null) return '';
    if (days < 0) return '#ef4444';
    if (days <= 30) return '#f59e0b';
    return '#34d399';
}
function updateAutoStatus() {
    try {
        const p = loadAutoProfile();
        if (!p.regDate && !p.tehDate) { hide('auto-profile-status-row'); return; }
        const regDays = daysUntil(p.regDate);
        const tehDays = daysUntil(p.tehDate);
        const regEl = el('stat-reg-days');
        const tehEl = el('stat-teh-days');
        if (regEl) {
            regEl.innerText = formatDaysLeft(regDays);
            regEl.style.color = colorForDays(regDays);
        }
        if (tehEl) {
            tehEl.innerText = formatDaysLeft(tehDays);
            tehEl.style.color = colorForDays(tehDays);
        }
        const row = el('auto-profile-status-row');
        if (row) row.style.display = 'flex';
    } catch (e) {}
}
function updateAutoTitle() {
    try {
        const p = loadAutoProfile();
        const titleEl = el('auto-title');
        if (!titleEl) return;
        titleEl.innerText = p.model
            ? `Auto — ${p.model}${p.plate ? ' (' + p.plate + ')' : ''}`
            : 'Auto / Putovanje';
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
        if (rv) rv.innerText = profile.model
            ? `${profile.model}${profile.plate ? ' (' + profile.plate + ')' : ''}`
            : 'Podaci sačuvani';
        show('auto-profile-result-box');
        showToast('Podaci o autu sačuvani', 'success');
        updateAutoStatus();
        updateAutoTitle();
    } catch (e) { console.error('saveAutoProfile error:', e); }
}

function loadFuelLog() {
    try { return JSON.parse(localStorage.getItem('cx_auto_fuel_log')) || []; } catch (e) { return []; }
}
function saveFuelLog(log) {
    try { localStorage.setItem('cx_auto_fuel_log', JSON.stringify(log)); } catch (e) {}
}
function logFuelEntry(consumption, dist, fuel) {
    try {
        const log = loadFuelLog();
        log.unshift({ date: Date.now(), consumption, dist, fuel });
        saveFuelLog(log.slice(0, 20));
        renderFuelHistory();
    } catch (e) {}
}
async function clearFuelHistory() {
    const ok = await showConfirm('Obrisati istoriju potrošnje?', 'Brisanje');
    if (!ok) return;
    saveFuelLog([]);
    renderFuelHistory();
    showToast('Istorija obrisana', 'success');
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
        if (entries.length < 2) {
            container.innerHTML = '<div class="chart-empty"><span class="chart-empty-icon">📈</span>Sačuvaj bar 2 merenja za grafik</div>';
        } else {
            renderLineChart(container, entries);
        }

        const last5 = log.slice(0, 5);
        const avg5 = last5.reduce((a, e) => a + e.consumption, 0) / last5.length;
        const lastVal = log[0].consumption;
        let trend = '';
        if (log.length > 1) {
            const prevSet = log.slice(1, 6);
            const prevAvg = prevSet.reduce((a, e) => a + e.consumption, 0) / Math.max(1, prevSet.length);
            if (lastVal > prevAvg + 0.2) trend = ' ↑';
            else if (lastVal < prevAvg - 0.2) trend = ' ↓';
        }

        const sum = el('fuel-history-summary');
        if (sum) sum.innerHTML =
            `<span>Poslednje: <strong>${fmt(lastVal, 2)} L/100km${trend}</strong></span>` +
            `<span>Prosek (5): <strong>${fmt(avg5, 2)} L/100km</strong></span>`;
    } catch (e) { console.error('renderFuelHistory error:', e); }
}

function renderLineChart(container, entries) {
    const W = 320, H = 140, PAD = 30;
    const values = entries.map(e => e.consumption);
    const minVal = Math.min(...values) * 0.9;
    const maxVal = Math.max(...values) * 1.1;
    const range = maxVal - minVal || 1;

    const points = entries.map((entry, i) => {
        const x = PAD + (i / (entries.length - 1)) * (W - 2 * PAD);
        const y = H - PAD - ((entry.consumption - minVal) / range) * (H - 2 * PAD);
        return { x, y, entry };
    });

    let linePath = '';
    points.forEach((p, i) => { linePath += (i === 0 ? 'M' : 'L') + p.x + ' ' + p.y + ' '; });

    let areaPath = linePath;
    areaPath += `L${points[points.length - 1].x} ${H - PAD} `;
    areaPath += `L${points[0].x} ${H - PAD} Z`;

    let gridLines = '';
    for (let i = 0; i <= 4; i++) {
        const y = PAD + (i / 4) * (H - 2 * PAD);
        const val = maxVal - (i / 4) * range;
        gridLines += `<line x1="${PAD}" y1="${y}" x2="${W - PAD}" y2="${y}" class="chart-grid-line"/>`;
        gridLines += `<text x="${PAD - 4}" y="${y + 3}" text-anchor="end" class="chart-label">${val.toFixed(1)}</text>`;
    }

    let dots = '';
    points.forEach((p, i) => {
        dots += `<circle cx="${p.x}" cy="${p.y}" r="4" class="chart-dot"><title>${fmt(p.entry.consumption, 2)} L/100km</title></circle>`;
        if (i === 0 || i === points.length - 1 || (points.length > 6 && i === Math.floor(points.length / 2))) {
            const d = new Date(p.entry.date);
            const label = String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0');
            dots += `<text x="${p.x}" y="${H - 10}" text-anchor="middle" class="chart-label">${label}</text>`;
        }
    });

    const svg = `
        <svg viewBox="0 0 ${W} ${H}" class="chart-svg" preserveAspectRatio="none">
            <defs>
                <linearGradient id="fuelGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#f87171" stop-opacity="0.4"/>
                    <stop offset="100%" stop-color="#f87171" stop-opacity="0"/>
                </linearGradient>
            </defs>
            ${gridLines}
            <path d="${areaPath}" fill="url(#fuelGradient)" stroke="none"/>
            <path d="${linePath}" class="chart-line" style="stroke: #f87171;"/>
            ${dots}
        </svg>
    `;
    container.innerHTML = svg;
}

function calculateTripPlanner() {
    const distance = num('trip-distance');
    const speed = num('trip-speed');
    const departVal = el('trip-depart') ? el('trip-depart').value : '';
    const breaks = num('trip-breaks') || 0;
    if (!distance || !speed) {
        showToast('Unesite distancu i prosečnu brzinu.', 'error');
        return;
    }
    const driveHours = distance / speed;
    const driveMinutes = driveHours * 60;
    const totalMinutes = driveMinutes + breaks;
    const totalHours = totalMinutes / 60;
    const dh = Math.floor(driveHours);
    const dm = Math.round((driveHours - dh) * 60);
    const driveText = dh > 0 ? `${dh}h ${dm}min` : `${dm}min`;
    const th = Math.floor(totalHours);
    const tm = Math.round((totalHours - th) * 60);
    const totalText = th > 0 ? `${th}h ${tm}min` : `${tm}min`;
    const rt = el('res-trip-time'); if (rt) rt.innerText = driveText;
    const st = el('stat-trip-total'); if (st) st.innerText = totalText;
    if (departVal) {
        const [h, m] = departVal.split(':').map(Number);
        const departDate = new Date();
        departDate.setHours(h, m, 0, 0);
        const etaDate = new Date(departDate.getTime() + totalMinutes * 60000);
        const etaH = String(etaDate.getHours()).padStart(2, '0');
        const etaM = String(etaDate.getMinutes()).padStart(2, '0');
        const e = el('stat-trip-eta'); if (e) e.innerText = `${etaH}:${etaM}`;
    } else {
        const e = el('stat-trip-eta'); if (e) e.innerText = '—';
    }
    show('trip-result-box');
    show('trip-stats-row');
}

function calculateRoadTrip() {
    const distance = num('road-distance');
    const consumption = num('road-consumption');
    const price = num('road-price');
    const toll = num('road-toll') || 0;
    const parking = num('road-parking') || 0;
    const other = num('road-other') || 0;
    const people = num('road-people') || 1;
    if (!distance || !consumption || !price) {
        showToast('Unesite distancu, potrošnju i cenu.', 'error');
        return;
    }
    const liters = (distance / 100) * consumption;
    const fuelCost = liters * price;
    const totalCost = fuelCost + toll + parking + other;
    const perPerson = totalCost / people;
    const rt = el('res-road-total'); if (rt) rt.innerText = money(totalCost);
    const rf = el('stat-road-fuel'); if (rf) rf.innerText = money(fuelCost) + ' RSD';
    const rp = el('stat-road-person'); if (rp) rp.innerText = money(perPerson) + ' RSD';
    const rl = el('stat-road-liters'); if (rl) rl.innerText = fmt(liters, 1) + ' L';
    show('road-result-box');
    show('road-stats-row');
    try { localStorage.setItem('cx_fuel_price', String(price)); } catch (e) {}
}

// ================= BICIKL =================

function calculateBike() {
    const front = num('bike-front');
    const rear = num('bike-rear');
    const cadence = num('bike-cadence');
    const wheelInch = num('bike-wheel-inch');
    if (!front || !rear || !cadence || !wheelInch) {
        showToast('Unesite sva četiri podatka.', 'error');
        return;
    }
    const gearRatio = front / rear;
    const wheelCircumference = wheelInch * 0.0254 * Math.PI;
    const development = gearRatio * wheelCircumference;
    const speed = (cadence * development * 60) / 1000;
    const bs = el('res-bike-speed'); if (bs) bs.innerText = fmt(speed, 1);
    const gr = el('stat-gear-ratio'); if (gr) gr.innerText = fmt(gearRatio, 2);
    const dv = el('stat-development'); if (dv) dv.innerText = fmt(development, 2) + ' m';
    show('bike-result-box');
    show('bike-stats-row');
}

function calculateBikePressure() {
    const weight = num('bike-rider-weight');
    const width = num('bike-tire-width');
    const typeEl = el('bike-tire-type');
    const type = typeEl ? typeEl.value : 'tube';
    if (!weight || !width) { showToast('Unesite težinu i širinu.', 'error'); return; }
    let bar = (weight / 10) / (width / 20);
    if (type === 'tubeless') bar -= 0.5;
    bar = Math.max(1.5, Math.min(8.5, bar));
    const psi = bar * 14.5038;
    const pb = el('res-bike-pressure-bar'); if (pb) pb.innerText = fmt(bar, 1);
    const pp = el('stat-pressure-psi'); if (pp) pp.innerText = Math.round(psi) + ' PSI';
    show('bike-pressure-result-box');
    show('bike-pressure-stats-row');
}

function calculateBikeFrame() {
    const height = num('bike-user-height');
    const typeEl = el('bike-frame-type');
    const type = typeEl ? typeEl.value : 'mtb';
    if (!height) { showToast('Unesite visinu.', 'error'); return; }
    let main, unit, alt;
    if (type === 'mtb') {
        const inch = height * 0.1;
        main = inch; unit = 'inča'; alt = fmt(inch * 2.54, 0) + ' cm';
    } else {
        const cm = height * 0.31;
        main = cm; unit = 'cm'; alt = fmt(cm / 2.54, 1) + ' inča';
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
    show('bike-frame-result-box');
    show('bike-frame-stats-row');
}

function calculateBikeCalories() {
    const weight = num('bike-cal-weight');
    const timeMinutes = num('bike-cal-time');
    const speed = num('bike-cal-speed');
    if (!weight || !timeMinutes || !speed) { showToast('Unesite sve podatke.', 'error'); return; }
    let met = 8.0;
    if (speed < 15) met = 6.0;
    else if (speed < 20) met = 8.0;
    else if (speed < 25) met = 10.0;
    else met = 12.0;
    const totalCalories = met * weight * (timeMinutes / 60);
    const bc = el('res-bike-calories'); if (bc) bc.innerText = fmt(totalCalories, 0);
    show('bike-cal-result-box');
}

function calculateGearTable() {
    const frontsRaw = el('gear-fronts') ? el('gear-fronts').value : '';
    const rearsRaw = el('gear-rears') ? el('gear-rears').value : '';
    const wheelInch = num('gear-wheel') || 29;
    const cadence = num('gear-cadence') || 90;
    const fronts = frontsRaw.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n) && n > 0);
    const rears = rearsRaw.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n) && n > 0);
    if (!fronts.length || !rears.length) { showToast('Unesite lančanike.', 'error'); return; }
    const wheelCircumference = wheelInch * 0.0254 * Math.PI;
    const table = el('gear-table');
    if (!table) return;
    table.innerHTML = '';
    const headRow = document.createElement('tr');
    headRow.innerHTML = '<th>Zadnji \\ Prednji</th>' + fronts.map(f => `<th>${f}</th>`).join('');
    table.appendChild(headRow);
    rears.forEach(r => {
        const row = document.createElement('tr');
        let cells = `<td class="gear-row-label">${r}</td>`;
        fronts.forEach(f => {
            const ratio = f / r;
            const speed = (cadence * ratio * wheelCircumference * 60) / 1000;
            cells += `<td>${fmt(speed, 1)}</td>`;
        });
        row.innerHTML = cells;
        table.appendChild(row);
    });
    const wrap = el('gear-table-wrap');
    if (wrap) wrap.style.display = 'block';
    const combos = fronts.length * rears.length;
    const gs = el('gear-skeleton-box');
    const gr = el('gear-table-real');
    if (combos > 24 && !reduceMotion) {
        if (gr) gr.style.display = 'none';
        if (gs) gs.style.display = 'block';
        setTimeout(() => {
            if (gs) gs.style.display = 'none';
            if (gr) gr.style.display = 'block';
            vibrate(15);
        }, 350);
    } else {
        if (gs) gs.style.display = 'none';
        if (gr) gr.style.display = 'block';
        vibrate(15);
    }
}

// ================= NOVAC =================

function calculateMoney() {
    const price = num('money-price');
    const discount = num('money-discount');
    if (!price || discount === null || discount < 0 || discount > 100) {
        showToast('Unesite cenu i popust (0–100%).', 'error');
        return;
    }
    const saved = price * (discount / 100);
    const finalPrice = price - saved;
    const mf = el('res-money-final'); if (mf) mf.innerText = money(finalPrice);
    const ms = el('stat-money-saved'); if (ms) ms.innerText = money(saved) + ' RSD';
    show('money-result-box');
    show('money-stats-row');
}

function calculatePDV() {
    const amount = num('pdv-amount');
    let rate = num('pdv-rate');
    const typeEl = el('pdv-type');
    const type = typeEl ? typeEl.value : 'add';
    if (!amount) { showToast('Unesite iznos.', 'error'); return; }
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
    show('pdv-result-box');
    show('pdv-stats-row');
}// ================= KREDIT — sa valutom =================

let currentAmortData = null;
let amortShowAll = false;

const LOAN_RATES = {
    RSD: 1,
    EUR: 117.20,
    CHF: 122.40,
    USD: 108.50
};

const CURRENCY_FLAGS = {
    RSD: '🇷🇸',
    EUR: '🇪🇺',
    CHF: '🇨🇭',
    USD: '🇺🇸'
};

function onCreditCurrencyChange() {
    const curEl = el('credit-currency');
    if (!curEl) return;
    const cur = curEl.value;
    const unit = el('loan-amount-unit');
    if (unit) unit.innerText = cur;
    const extraEl = el('credit-extra');
    if (extraEl && extraEl.value === cur) extraEl.value = '';
    const amountEl = el('loan-amount');
    if (amountEl) {
        if (cur === 'RSD') amountEl.placeholder = '1000000';
        else amountEl.placeholder = '10000';
    }
}

function calculateLoan() {
    const curEl = el('credit-currency');
    const currency = curEl ? curEl.value : 'RSD';
    const amount = num('loan-amount');
    const rateYear = num('loan-rate') || 0;
    const months = num('loan-months');
    if (!amount || !months) { showToast('Unesite iznos i mesece.', 'error'); return; }
    const rateMonth = (rateYear / 100) / 12;
    let monthly;
    if (rateMonth === 0) monthly = amount / months;
    else monthly = (amount * rateMonth * Math.pow(1 + rateMonth, months)) / (Math.pow(1 + rateMonth, months) - 1);
    const totalReturn = monthly * months;
    const totalInterest = totalReturn - amount;

    const lm = el('res-loan-monthly'); if (lm) lm.innerText = money(monthly);
    const lmu = el('res-loan-monthly-unit');
    if (lmu) lmu.innerText = currency + '/mes';
    const li = el('stat-loan-interest'); if (li) li.innerText = money(totalInterest) + ' ' + currency;
    const lt = el('stat-loan-total'); if (lt) lt.innerText = money(totalReturn) + ' ' + currency;
    show('loan-result-box');
    show('loan-stats-row');

    currentAmortData = buildAmortPlan(amount, rateMonth, monthly, months);
    amortShowAll = false;
    renderAmortPlan();
    const w = el('loan-amort-wrap');
    if (w) w.style.display = 'block';

    renderLoanConversions(amount, monthly, totalReturn, currency);
}

function renderLoanConversions(amount, monthly, totalReturn, currency) {
    const box = el('loan-conversion-box');
    const list = el('loan-conversion-list');
    if (!box || !list) return;

    const extraEl = el('credit-extra');
    const extraCur = extraEl ? extraEl.value : '';

    const currenciesToShow = new Set();
    currenciesToShow.add(currency);
    if (currency !== 'RSD') currenciesToShow.add('RSD');
    if (extraCur && extraCur !== currency) currenciesToShow.add(extraCur);

    if (currency === 'RSD' && !extraCur) {
        currenciesToShow.add('EUR');
        currenciesToShow.add('CHF');
    }

    const amountInRsd = amount * LOAN_RATES[currency];
    const monthlyInRsd = monthly * LOAN_RATES[currency];
    const totalInRsd = totalReturn * LOAN_RATES[currency];

    list.innerHTML = '';
    currenciesToShow.forEach(cur => {
        if (cur === currency) return;
        const rate = LOAN_RATES[cur];
        if (!rate) return;
        const amt = amountInRsd / rate;
        const mon = monthlyInRsd / rate;
        const tot = totalInRsd / rate;

        const row = document.createElement('div');
        row.className = 'loan-conv-row';
        row.innerHTML = `
            <div class="lc-label">
                <span class="lc-flag">${CURRENCY_FLAGS[cur] || ''}</span>
                <span>${cur} ekvivalent</span>
            </div>
            <div class="lc-value">
                ${fmt(amt, cur === 'RSD' ? 0 : 2)} ${cur}
            </div>
        `;
        row.title = `Rata: ${fmt(mon, 2)} ${cur}  •  Ukupno: ${fmt(tot, 2)} ${cur}`;
        list.appendChild(row);
    });

    if (list.children.length > 0) box.style.display = 'block';
    else box.style.display = 'none';
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
    const chartBox = el('loan-chart-box');
    if (chartBox) {
        chartBox.innerHTML = '';
        renderLoanChart(chartBox, currentAmortData);
    }
    const body = el('amort-body');
    if (body) {
        body.innerHTML = '';
        const rows = amortShowAll ? currentAmortData : currentAmortData.slice(0, 12);
        rows.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.month}</td>
                <td>${fmt(row.payment, 0)}</td>
                <td style="color:#f87171;">${fmt(row.interest, 0)}</td>
                <td style="color:#34d399;">${fmt(row.principal, 0)}</td>
                <td>${fmt(row.balance, 0)}</td>
            `;
            body.appendChild(tr);
        });
    }
    const btn = el('amort-toggle-btn');
    if (btn) {
        if (currentAmortData.length <= 12) {
            btn.style.display = 'none';
        } else {
            btn.style.display = 'block';
            btn.textContent = amortShowAll ? 'Prikaži samo prvih 12 meseci' : `Prikaži sve (${currentAmortData.length}) meseci`;
        }
    }
}

function toggleAmortPreview() {
    amortShowAll = !amortShowAll;
    renderAmortPlan();
}

function renderLoanChart(container, plan) {
    const W = 320, H = 140, PAD = 30;
    const maxVal = Math.max(...plan.map(p => p.payment), 1);
    const step = Math.max(1, Math.floor(plan.length / 20));
    const sample = plan.filter((p, i) => i % step === 0 || i === plan.length - 1);

    function makePoints(getter) {
        return sample.map((p, i) => {
            const x = PAD + (i / (sample.length - 1)) * (W - 2 * PAD);
            const y = H - PAD - (getter(p) / maxVal) * (H - 2 * PAD);
            return { x, y };
        });
    }

    const intPoints = makePoints(p => p.interest);
    const priPoints = makePoints(p => p.principal);

    function pathFrom(points) {
        let s = '';
        points.forEach((p, i) => { s += (i === 0 ? 'M' : 'L') + p.x + ' ' + p.y + ' '; });
        return s;
    }

    let grid = '';
    for (let i = 0; i <= 4; i++) {
        const y = PAD + (i / 4) * (H - 2 * PAD);
        const val = maxVal - (i / 4) * maxVal;
        grid += `<line x1="${PAD}" y1="${y}" x2="${W - PAD}" y2="${y}" class="chart-grid-line"/>`;
        grid += `<text x="${PAD - 4}" y="${y + 3}" text-anchor="end" class="chart-label">${fmt(val, 0)}</text>`;
    }

    let dots = '';
    [intPoints[0], intPoints[intPoints.length - 1]].forEach(p => {
        dots += `<circle cx="${p.x}" cy="${p.y}" r="3" style="fill:#f87171;"/>`;
    });
    [priPoints[0], priPoints[priPoints.length - 1]].forEach(p => {
        dots += `<circle cx="${p.x}" cy="${p.y}" r="3" style="fill:#34d399;"/>`;
    });

    container.innerHTML = `
        <svg viewBox="0 0 ${W} ${H}" class="chart-svg" preserveAspectRatio="none">
            ${grid}
            <path d="${pathFrom(intPoints)}" class="chart-line" style="stroke: #f87171;"/>
            <path d="${pathFrom(priPoints)}" class="chart-line" style="stroke: #34d399;"/>
            ${dots}
        </svg>
        <div style="display:flex; gap:16px; justify-content:center; margin-top:6px; font-size:0.75rem;">
            <span style="color:#f87171;">● Kamata</span>
            <span style="color:#34d399;">● Glavnica</span>
        </div>
    `;
}

function calculateSplit() {
    const total = num('split-total');
    const people = num('split-people');
    const tip = num('split-tip') || 0;
    if (!total || !people || people < 1) { showToast('Unesite iznos i broj osoba.', 'error'); return; }
    const totalWithTip = total * (1 + tip / 100);
    const perPerson = totalWithTip / people;
    const sv = el('res-split-val'); if (sv) sv.innerText = money(perPerson);
    const st = el('stat-split-total'); if (st) st.innerText = money(totalWithTip) + ' RSD';
    show('split-result-box');
    show('split-stats-row');
}

function calculateTip() {
    const bill = num('tip-bill');
    const percent = num('tip-percent');
    const people = num('tip-people') || 1;
    if (!bill || percent === null) { showToast('Unesite iznos i procenat.', 'error'); return; }
    const tipAmount = bill * (percent / 100);
    const total = bill + tipAmount;
    const perPerson = total / people;
    const tv = el('res-tip-val'); if (tv) tv.innerText = money(tipAmount);
    const tt = el('stat-tip-total'); if (tt) tt.innerText = money(total) + ' RSD';
    const tp = el('stat-tip-per-person'); if (tp) tp.innerText = money(perPerson) + ' RSD';
    show('tip-result-box');
    show('tip-stats-row');
}

// ================= VALUTA — LIVE KURSNA LISTA (Frankfurter API) =================

const CURRENCIES = [
    { code: 'RSD', name: 'Srpski dinar',       flag: '🇷🇸', rate: 1 },
    { code: 'EUR', name: 'Evro',                flag: '🇪🇺', rate: 117.20 },
    { code: 'USD', name: 'Američki dolar',      flag: '🇺🇸', rate: 108.50 },
    { code: 'GBP', name: 'Britanska funta',     flag: '🇬🇧', rate: 137.80 },
    { code: 'CHF', name: 'Švajcarski franak',   flag: '🇨🇭', rate: 122.40 },
    { code: 'JPY', name: 'Japanski jen',        flag: '🇯🇵', rate: 0.72 },
    { code: 'CNY', name: 'Kineski juan',        flag: '🇨🇳', rate: 14.95 },
    { code: 'RUB', name: 'Ruska rublja',        flag: '🇷🇺', rate: 1.18 },
    { code: 'TRY', name: 'Turska lira',         flag: '🇹🇷', rate: 3.15 },
    { code: 'BAM', name: 'Konvertibilna marka', flag: '🇧🇦', rate: 59.90 },
    { code: 'HRK', name: 'Hrvatska kuna',       flag: '🇭🇷', rate: 15.55 },
    { code: 'MKD', name: 'Makedonski denar',    flag: '🇲🇰', rate: 1.90 },
    { code: 'ALL', name: 'Albanski lek',        flag: '🇦🇱', rate: 1.14 },
    { code: 'BGN', name: 'Bugarski lev',        flag: '🇧🇬', rate: 59.95 },
    { code: 'RON', name: 'Rumunski lej',        flag: '🇷🇴', rate: 23.55 },
    { code: 'HUF', name: 'Mađarska forinta',    flag: '🇭🇺', rate: 0.30 },
    { code: 'PLN', name: 'Poljski zlot',        flag: '🇵🇱', rate: 26.85 },
    { code: 'CZK', name: 'Češka kruna',         flag: '🇨🇿', rate: 4.68 },
    { code: 'SEK', name: 'Švedska kruna',       flag: '🇸🇪', rate: 10.35 },
    { code: 'NOK', name: 'Norveška kruna',      flag: '🇳🇴', rate: 9.90 },
    { code: 'DKK', name: 'Danska kruna',        flag: '🇩🇰', rate: 15.70 },
    { code: 'CAD', name: 'Kanadski dolar',      flag: '🇨🇦', rate: 78.60 },
    { code: 'AUD', name: 'Australijski dolar',  flag: '🇦🇺', rate: 71.40 },
    { code: 'NZD', name: 'Novozelandski dolar', flag: '🇳🇿', rate: 65.20 },
    { code: 'KRW', name: 'Južnokorejski von',   flag: '🇰🇷', rate: 0.079 },
    { code: 'INR', name: 'Indijska rupija',     flag: '🇮🇳', rate: 1.29 },
    { code: 'BRL', name: 'Brazilski real',      flag: '🇧🇷', rate: 19.10 },
    { code: 'MXN', name: 'Meksički pezos',      flag: '🇲🇽', rate: 5.60 },
    { code: 'ZAR', name: 'Južnoafrički rand',   flag: '🇿🇦', rate: 5.95 },
    { code: 'AED', name: 'Dirham UAE',          flag: '🇦🇪', rate: 29.55 }
];

const FX_STORAGE_KEY = 'cx_fx_rates_v2';
const FX_CACHE_HOURS = 6;

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
                if (typeof raw.rates[c.code] === 'number' && raw.rates[c.code] > 0) {
                    c.rate = raw.rates[c.code];
                }
            });
            return raw.updated || null;
        }
    } catch (e) {}
    return null;
}

function saveFxRates() {
    try {
        const rates = {};
        CURRENCIES.forEach(c => { rates[c.code] = c.rate; });
        localStorage.setItem(FX_STORAGE_KEY, JSON.stringify({
            rates,
            updated: Date.now()
        }));
    } catch (e) {}
}

function formatFxUpdated(ts) {
    if (!ts) return 'ručno uneto';
    const d = new Date(ts);
    const now = new Date();
    const diffMin = Math.round((now - d) / 60000);
    if (diffMin < 1) return 'osveženo upravo sad';
    if (diffMin < 60) return `osveženo pre ${diffMin} min`;
    const diffH = Math.round(diffMin / 60);
    if (diffH < 24) return `osveženo pre ${diffH}h`;
    const days = Math.floor(diffH / 24);
    return `osveženo pre ${days} d.`;
}

/**
 * Frankfurter API — besplatno, bez ključa, bez CORS problema.
 * Vraća kurseve bazirane na ECB (Evropska centralna banka).
 * Endpoint: https://api.frankfurter.app/latest?from=EUR&to=RSD,USD,...
 *
 * NAPOMENA: Frankfurter ne podržava RSD direktno.
 * Zato dobavljamo sve kurseve baza EUR, a RSD izračunamo iz HUF-a (Mađarska forinta je podržana)
 * ili koristimo fiksni RSD kurs kao fallback.
 *
 * Strategija:
 *   1) Pokušamo Frankfurter sa bazom EUR za sve valute koje podržava.
 *   2) RSD i valute koje Frankfurter ne podržava ostaju na ručnim vrednostima.
 */
async function fetchFrankfurterRates() {
    const supported = CURRENCIES
        .map(c => c.code)
        .filter(code => code !== 'RSD');

    const url = `https://api.frankfurter.app/latest?from=EUR&to=${supported.join(',')}`;

    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if (!data || !data.rates) throw new Error('Neispravan odgovor');

    return data.rates; // { USD: 1.08, GBP: 0.85, ... }
}

async function refreshExchangeRates(silent = false) {
    const btn = document.querySelector('.fx-refresh-btn');
    if (btn) btn.classList.add('spinning');
    setTimeout(() => { if (btn) btn.classList.remove('spinning'); }, 700);

    if (!silent) {
        showToast('Osvežavam kurseve...', 'info', 1500);
    }

    try {
        const rates = await fetchFrankfurterRates();

        // Uzimamo trenutni RSD kurs (EUR → RSD) iz lokalnog keša kao referencu
        const currentEur = CURRENCIES.find(c => c.code === 'EUR');
        const eurToRsd = currentEur ? currentEur.rate : 117.20;

        CURRENCIES.forEach(c => {
            if (c.code === 'RSD') { c.rate = 1; return; }
            if (c.code === 'EUR') { c.rate = eurToRsd; return; }

            const eurToCur = rates[c.code];
            if (typeof eurToCur === 'number' && eurToCur > 0) {
                // 1 EUR = eurToCur X  →  1 X = eurToRsd / eurToCur RSD
                c.rate = Number((eurToRsd / eurToCur).toFixed(4));
            }
        });

        saveFxRates();
        populateCurrencySelects();
        renderFxList();
        updateFxUpdatedLabel();
        calculateCurrency();

        if (!silent) {
            showToast('Kursevi osveženi (ECB)', 'success', 2000);
            vibrate(20);
            playTick(0, 1400, 0.08, 0.03);
        }
    } catch (e) {
        console.warn('Frankfurter greška:', e);
        if (!silent) {
            showToast('Nema interneta — koristim keširane kurseve', 'warning', 2500);
        }
    }
}

function populateCurrencySelects() {
    const fromSel = el('fx-from');
    const toSel = el('fx-to');
    if (!fromSel || !toSel) return;

    // Sačuvaj trenutne izbore
    const prevFrom = fromSel.value || 'RSD';
    const prevTo = toSel.value || 'EUR';

    fromSel.innerHTML = '';
    toSel.innerHTML = '';

    CURRENCIES.forEach(c => {
        const opt1 = document.createElement('option');
        opt1.value = c.code;
        opt1.textContent = `${c.flag} ${c.code} — ${c.name}`;
        fromSel.appendChild(opt1);

        const opt2 = document.createElement('option');
        opt2.value = c.code;
        opt2.textContent = `${c.flag} ${c.code} — ${c.name}`;
        toSel.appendChild(opt2);
    });

    fromSel.value = prevFrom;
    toSel.value = prevTo;
    if (!fromSel.value) fromSel.value = 'RSD';
    if (!toSel.value) toSel.value = 'EUR';
}

function renderFxList() {
    const list = el('fx-list');
    if (!list) return;
    list.innerHTML = '';
    CURRENCIES.forEach(c => {
        const item = document.createElement('div');
        item.className = 'fx-list-item';
        item.dataset.code = c.code;
        item.innerHTML = `
            <div class="fx-flag">${c.flag}</div>
            <div class="fx-list-info">
                <div class="fx-code">${c.code}</div>
                <div class="fx-name">${c.name}</div>
            </div>
            <div class="fx-value">${fmt(c.rate, 4)}<small>RSD</small></div>
        `;
        item.addEventListener('click', () => {
            const toSel = el('fx-to');
            if (toSel) {
                toSel.value = c.code;
                calculateCurrency();
            }
        });
        list.appendChild(item);
    });
    highlightFxSelected();
}

function highlightFxSelected() {
    const toSel = el('fx-to');
    if (!toSel) return;
    const cur = toSel.value;
    document.querySelectorAll('.fx-list-item').forEach(item => {
        item.classList.toggle('selected', item.dataset.code === cur);
    });
}

function updateFxUpdatedLabel() {
    const label = el('fx-updated-label');
    if (!label) return;
    const ts = getFxLastUpdate();
    label.textContent = formatFxUpdated(ts);
}

function swapCurrencies() {
    const fromSel = el('fx-from');
    const toSel = el('fx-to');
    if (!fromSel || !toSel) return;
    const tmp = fromSel.value;
    fromSel.value = toSel.value;
    toSel.value = tmp;
    calculateCurrency();
    highlightFxSelected();
    vibrate(10);
}

function getCurrencyByCode(code) {
    return CURRENCIES.find(c => c.code === code);
}

function calculateCurrency() {
    const amount = num('fx-amount');
    const fromSel = el('fx-from');
    const toSel = el('fx-to');
    if (!fromSel || !toSel) return;

    const fromCode = fromSel.value;
    const toCode = toSel.value;
    const fromCur = getCurrencyByCode(fromCode);
    const toCur = getCurrencyByCode(toCode);

    const info = el('fx-rate-info');
    if (info) {
        if (fromCur && toCur) {
            const oneFromInTo = fromCur.rate / toCur.rate;
            info.innerHTML = `1 ${fromCode} = <strong>${fmt(oneFromInTo, 4)}</strong> ${toCode}`;
        }
    }

    if (!amount) {
        hide('fx-result-box');
        highlightFxSelected();
        return;
    }

    if (!fromCur || !toCur) return;

    const amountInRsd = amount * fromCur.rate;
    const result = amountInRsd / toCur.rate;

    const fv = el('res-fx-val');
    const fu = el('res-fx-unit');
    if (fv) fv.innerText = toCur.rate >= 50 ? money(result) : fmt(result, 2);
    if (fu) fu.innerText = toCode;

    show('fx-result-box');
    highlightFxSelected();
}

// ================= ZDRAVLJE / FITNESS =================

function calculateBMI() {
    const weight = num('health-weight');
    const heightCm = num('health-height');
    const age = num('health-bmi-age');
    if (!weight || !heightCm) { showToast('Unesite težinu i visinu.', 'error'); return; }
    const heightM = heightCm / 100;
    const bmi = weight / (heightM * heightM);
    let category;
    if (age !== null && age < 18) category = 'Za mlađe od 18 god. posebna tabela';
    else if (bmi < 18.5) category = 'Pothranjenost';
    else if (bmi < 25) category = 'Normalna težina';
    else if (bmi < 30) category = 'Prekomerna težina';
    else category = 'Gojaznost';
    const bv = el('res-bmi-val'); if (bv) bv.innerText = fmt(bmi, 1);
    const bc = el('stat-bmi-category'); if (bc) bc.innerText = category;
    show('health-bmi-result-box');
    show('health-bmi-stats-row');
}

function calculateIdealWeight() {
    const height = num('health-ideal-height');
    const genderEl = el('health-gender');
    const gender = genderEl ? genderEl.value : 'male';
    if (!height) { showToast('Unesite visinu.', 'error'); return; }
    const inchesOver = Math.max(0, (height - 152.4) / 2.54);
    const ideal = (gender === 'male' ? 50 : 45.5) + (2.3 * inchesOver);
    const heightM = height / 100;
    const low = 18.5 * heightM * heightM;
    const high = 24.9 * heightM * heightM;
    const iw = el('res-ideal-weight'); if (iw) iw.innerText = fmt(ideal, 1);
    const ir = el('stat-ideal-range'); if (ir) ir.innerText = fmt(low, 1) + ' – ' + fmt(high, 1) + ' kg';
    show('health-ideal-result-box');
    show('health-ideal-stats-row');
}

function calculateBMR() {
    const weight = num('bmr-weight');
    const height = num('bmr-height');
    const age = num('bmr-age');
    const genderEl = el('bmr-gender');
    const gender = genderEl ? genderEl.value : 'male';
    const actEl = el('bmr-activity');
    const activity = actEl ? parseFloat(actEl.value) : 1.375;
    if (!weight || !height || !age) { showToast('Unesite sve podatke.', 'error'); return; }
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    bmr += (gender === 'male') ? 5 : -161;
    const bv = el('res-bmr-val'); if (bv) bv.innerText = fmt(bmr * activity, 0);
    const bb = el('stat-bmr-base'); if (bb) bb.innerText = fmt(bmr, 0) + ' kcal';
    show('bmr-result-box');
    show('bmr-stats-row');
}

function calculateHeartRate() {
    const age = num('hr-age');
    if (!age) { showToast('Unesite godine.', 'error'); return; }
    const max = 220 - age;
    const zones = [[0.5, 0.6], [0.6, 0.7], [0.7, 0.8], [0.8, 0.9], [0.9, 1.0]];
    const hm = el('res-hr-max'); if (hm) hm.innerText = fmt(max, 0);
    show('hr-result-box');
    zones.forEach((z, i) => {
        const low = Math.round(max * z[0]);
        const high = Math.round(max * z[1]);
        const ze = el(`hr-zone-${i + 1}`); if (ze) ze.innerText = `${low}–${high}`;
    });
    const zw = el('hr-zones-wrap'); if (zw) zw.style.display = 'flex';
}

function calculateRunning() {
    const distance = num('run-distance');
    const min = num('run-min') || 0;
    const sec = num('run-sec') || 0;
    if (!distance) { showToast('Unesite distancu.', 'error'); return; }
    const totalMinutes = min + (sec / 60);
    if (totalMinutes === 0) { showToast('Unesite vreme.', 'error'); return; }
    const paceMin = totalMinutes / distance;
    const paceMinWhole = Math.floor(paceMin);
    const paceSec = Math.round((paceMin - paceMinWhole) * 60);
    const speed = distance / (totalMinutes / 60);
    const rp = el('res-run-pace'); if (rp) rp.innerText = `${paceMinWhole}:${String(paceSec).padStart(2, '0')}`;
    const rs = el('stat-run-speed'); if (rs) rs.innerText = fmt(speed, 2) + ' km/h';
    const rt = el('stat-run-total'); if (rt) rt.innerText = `${min}min ${sec}s`;
    show('run-result-box');
    show('run-stats-row');
}

function calculateBikeFitness() {
    const distance = num('fitbike-distance');
    const minutes = num('fitbike-min');
    const weight = num('fitbike-weight');
    if (!distance || !minutes || !weight) { showToast('Unesite sve podatke.', 'error'); return; }
    const hours = minutes / 60;
    const speed = distance / hours;
    let met = 8.0;
    if (speed < 15) met = 6.0;
    else if (speed < 20) met = 8.0;
    else if (speed < 25) met = 10.0;
    else met = 12.0;
    const calories = met * weight * hours;
    const fs = el('res-fitbike-speed'); if (fs) fs.innerText = fmt(speed, 2);
    const fc = el('stat-fitbike-cal'); if (fc) fc.innerText = fmt(calories, 0) + ' kcal';
    show('fitbike-result-box');
    show('fitbike-stats-row');
}

function calculate1RM() {
    const weight = num('rm1-weight');
    const reps = num('rm1-reps');
    if (!weight || !reps || reps < 1 || reps > 15) {
        showToast('Unesite težinu i ponavljanja (1–15).', 'error');
        return;
    }
    const rm = weight * (1 + reps / 30);
    const rv = el('res-rm1-val'); if (rv) rv.innerText = fmt(rm, 1);
    const r90 = el('stat-rm1-90'); if (r90) r90.innerText = fmt(rm * 0.9, 1) + ' kg';
    const r80 = el('stat-rm1-80'); if (r80) r80.innerText = fmt(rm * 0.8, 1) + ' kg';
    show('rm1-result-box');
    show('rm1-stats-row');
}

function calculateWorkoutVolume() {
    const weight = num('vol-weight');
    const reps = num('vol-reps');
    const sets = num('vol-sets');
    if (!weight || !reps || !sets) { showToast('Unesite sve podatke.', 'error'); return; }
    const volume = weight * reps * sets;
    const vv = el('res-vol-val'); if (vv) vv.innerText = money(volume);
    show('vol-result-box');
}

// ================= VREME / DATUMI =================

function parseDate(value) {
    if (!value) return null;
    const parts = value.split('-').map(Number);
    if (parts.length !== 3) return null;
    return new Date(parts[0], parts[1] - 1, parts[2]);
}

const SR_DAYS = ['nedelja', 'ponedeljak', 'utorak', 'sreda', 'četvrtak', 'petak', 'subota'];
const SR_MONTHS = ['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'];

function calculateDateDifference() {
    const startVal = getTripleDate('start-date');
    const endVal = getTripleDate('end-date');
    if (!startVal || !endVal) { showToast('Unesite oba datuma.', 'error'); return; }
    let startDate = parseDate(startVal);
    let endDate = parseDate(endVal);
    if (startDate > endDate) { const t = startDate; startDate = endDate; endDate = t; }
    let years = endDate.getFullYear() - startDate.getFullYear();
    let months = endDate.getMonth() - startDate.getMonth();
    let days = endDate.getDate() - startDate.getDate();
    if (days < 0) {
        months--;
        const prevMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0);
        days += prevMonth.getDate();
    }
    if (months < 0) { years--; months += 12; }
    const totalDays = Math.round((endDate - startDate) / 86400000);
    const dv = el('res-date-val');
    if (dv) dv.innerHTML = `${years} god, ${months} mes, ${days} dana<br>(ukupno ${fmt(totalDays, 0)} dana)`;
    show('result-date-box');
}

function calculateDateShift() {
    const startVal = getTripleDate('shift-date');
    const days = num('shift-days');
    const opEl = el('shift-op');
    const op = opEl ? opEl.value : 'add';
    if (!startVal || days === null) { showToast('Unesite datum i broj dana.', 'error'); return; }
    const date = parseDate(startVal);
    const delta = op === 'sub' ? -Math.abs(days) : Math.abs(days);
    date.setDate(date.getDate() + delta);
    const dayName = SR_DAYS[date.getDay()];
    const monthName = SR_MONTHS[date.getMonth()];
    const text = `${date.getDate()}. ${monthName} ${date.getFullYear()}. (${dayName})`;
    const sv = el('res-shift-val'); if (sv) sv.innerText = text;
    show('shift-result-box');
}

function calculateAge() {
    const birthVal = getTripleDate('birth-date');
    if (!birthVal) { showToast('Unesite datum rođenja.', 'error'); return; }
    const birth = parseDate(birthVal);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (birth > today) { showToast('Datum ne može biti u budućnosti.', 'error'); return; }
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();
    if (days < 0) {
        months--;
        const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        days += prevMonth.getDate();
    }
    if (months < 0) { years--; months += 12; }
    const ay = el('res-age-years'); if (ay) ay.innerText = years;
    const ad = el('stat-age-detail'); if (ad) ad.innerText = `${months} mes, ${days} d.`;
    const nextBday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBday < today) nextBday.setFullYear(today.getFullYear() + 1);
    const daysToBday = Math.round((nextBday - today) / 86400000);
    const an = el('stat-age-next');
    if (an) an.innerText = daysToBday === 0 ? 'Danas! 🎉' : `za ${daysToBday} d.`;
    show('age-result-box');
    show('age-stats-row');
}

function calculateDayOfWeek() {
    const val = getTripleDate('dayofweek-date');
    if (!val) { showToast('Unesite datum.', 'error'); return; }
    const date = parseDate(val);
    const dayName = SR_DAYS[date.getDay()];
    const monthName = SR_MONTHS[date.getMonth()];
    const dn = el('res-day-name');
    if (dn) dn.innerText = dayName.charAt(0).toUpperCase() + dayName.slice(1);
    const dd = el('stat-day-date');
    if (dd) dd.innerText = `${date.getDate()}. ${monthName} ${date.getFullYear()}.`;
    show('dayofweek-result-box');
    show('dayofweek-stats-row');
}

function calculateWorkdays() {
    const startVal = getTripleDate('workdays-start');
    const endVal = getTripleDate('workdays-end');
    if (!startVal || !endVal) { showToast('Unesite oba datuma.', 'error'); return; }
    let start = parseDate(startVal);
    let end = parseDate(endVal);
    if (start > end) { const t = start; start = end; end = t; }
    let workdays = 0, weekend = 0, total = 0;
    const cur = new Date(start);
    while (cur <= end) {
        const day = cur.getDay();
        if (day === 0 || day === 6) weekend++; else workdays++;
        total++;
        cur.setDate(cur.getDate() + 1);
    }
    const wv = el('res-workdays-val'); if (wv) wv.innerText = fmt(workdays, 0);
    const wt = el('stat-workdays-total'); if (wt) wt.innerText = fmt(total, 0);
    const ww = el('stat-workdays-weekend'); if (ww) ww.innerText = fmt(weekend, 0);
    show('workdays-result-box');
    show('workdays-stats-row');
}

const TIME_SECONDS = {
    seconds: 1, minutes: 60, hours: 3600, days: 86400,
    weeks: 604800, months: 2592000, years: 31536000
};

const TIME_LABELS = {
    seconds: 'sek', minutes: 'min', hours: 'h', days: 'dana',
    weeks: 'nedelja', months: 'meseci', years: 'godina'
};

function convertTimeUnits() {
    const val = num('time-value');
    const fromEl = el('time-from');
    const toEl = el('time-to');
    if (!fromEl || !toEl) return;
    const from = fromEl.value;
    const to = toEl.value;
    if (val === null) { showToast('Unesite vrednost.', 'error'); return; }
    const result = val * TIME_SECONDS[from] / TIME_SECONDS[to];
    const tv = el('res-time-conv-val');
    if (tv) tv.innerText = `${fmt(result)} ${TIME_LABELS[to]}`;
    show('result-time-conv-box');
}

// ================= MERE =================

const LENGTH_FACTORS = { m: 1, km: 1000, cm: 0.01, mm: 0.001, ft: 0.3048, in: 0.0254 };
const LENGTH_LABELS  = { m: 'm', km: 'km', cm: 'cm', mm: 'mm', ft: 'ft', in: 'in' };
const WEIGHT_FACTORS = { g: 1, kg: 1000, t: 1000000, lbs: 453.592, oz: 28.3495 };
const WEIGHT_LABELS  = { g: 'g', kg: 'kg', t: 't', lbs: 'lbs', oz: 'oz' };
const AREA_FACTORS = { m2: 1, ar: 100, ha: 10000, km2: 1000000 };
const AREA_LABELS  = { m2: 'm²', ar: 'ar', ha: 'ha', km2: 'km²' };
const VOLUME_FACTORS = { L: 1, ml: 0.001, m3: 1000, galus: 3.785411784, galuk: 4.54609 };
const VOLUME_LABELS  = { L: 'L', ml: 'ml', m3: 'm³', galus: 'gal (US)', galuk: 'gal (UK)' };
const PRES_FACTORS = { bar: 1, psi: 0.0689476, kpa: 0.01, atm: 1.01325, mmhg: 0.00133322 };
const PRES_LABELS  = { bar: 'bar', psi: 'psi', kpa: 'kPa', atm: 'atm', mmhg: 'mmHg' };
const SPEED_FACTORS = { kmh: 0.277778, ms: 1, mph: 0.44704, knot: 0.514444 };
const SPEED_LABELS  = { kmh: 'km/h', ms: 'm/s', mph: 'mph', knot: 'kn' };
const DATA_FACTORS = { B: 1, KB: 1024, MB: 1048576, GB: 1073741824, TB: 1099511627776 };
const DATA_LABELS  = { B: 'B', KB: 'KB', MB: 'MB', GB: 'GB', TB: 'TB' };

function convertMeasure(prefix, factors, labels) {
    const val = num(`${prefix}-val`);
    if (val === null) { hide(`${prefix}-result-box`); return; }
    const fromEl = el(`${prefix}-from`);
    const toEl = el(`${prefix}-to`);
    if (!fromEl || !toEl) return;
    const from = fromEl.value;
    const to = toEl.value;
    const result = val * factors[from] / factors[to];
    const rv = el(`res-${prefix}-val`); if (rv) rv.innerText = fmt(result);
    const ru = el(`res-${prefix}-unit`); if (ru) ru.innerText = labels[to];
    show(`${prefix}-result-box`, true);
}

function calculateLength() { convertMeasure('length', LENGTH_FACTORS, LENGTH_LABELS); }
function calculateWeight() { convertMeasure('weight', WEIGHT_FACTORS, WEIGHT_LABELS); }
function calculateArea()   { convertMeasure('area', AREA_FACTORS, AREA_LABELS); }
function calculatePres()   { convertMeasure('pres', PRES_FACTORS, PRES_LABELS); }
function calculateSpeed()  { convertMeasure('speed', SPEED_FACTORS, SPEED_LABELS); }
function calculateData()   { convertMeasure('data', DATA_FACTORS, DATA_LABELS); }

function calculateVolumeConversion() {
    convertMeasure('volume', VOLUME_FACTORS, VOLUME_LABELS);
}

function calculateTemp() {
    const val = num('temp-val');
    if (val === null) { hide('temp-result-box'); return; }
    const fromEl = el('temp-from');
    const toEl = el('temp-to');
    if (!fromEl || !toEl) return;
    const from = fromEl.value;
    const to = toEl.value;
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

// ================= KUHINJA =================

const SPOON_GRAMS = {
    secer: 20, brasno: 10, so: 25, kakao: 8, med: 25,
    ulje: 15, mleko: 15, pirinac: 20, ovsene: 8, griz: 15
};

function calculateSpoon() {
    const ingEl = el('spoon-ingredient');
    if (!ingEl) return;
    const ing = ingEl.value;
    const val = num('spoon-val');
    const fromEl = el('spoon-from');
    const toEl = el('spoon-to');
    if (!fromEl || !toEl) return;
    const from = fromEl.value;
    const to = toEl.value;
    if (val === null) { showToast('Unesite vrednost.', 'error'); return; }
    let gPerSpoon;
    if (ing === 'custom') gPerSpoon = num('spoon-custom-g') || 20;
    else gPerSpoon = SPOON_GRAMS[ing] || 20;
    const smallSpoonG = gPerSpoon / 3;
    let grams;
    if (from === 'kasika') grams = val * gPerSpoon;
    else if (from === 'kasika_mala') grams = val * smallSpoonG;
    else grams = val;
    let result, unit;
    if (to === 'gram') { result = grams; unit = 'g'; }
    else if (to === 'kasika') { result = grams / gPerSpoon; unit = 'kašika'; }
    else { result = grams / smallSpoonG; unit = 'mala kaš.'; }
    const sv = el('res-spoon-val'); if (sv) sv.innerText = fmt(result, 2);
    const su = el('res-spoon-unit'); if (su) su.innerText = unit;
    show('spoon-result-box');
}

const CUP_ML = {
    standard: 200, velika: 250, mala: 150, solja: 150, solja_caj: 250
};

function calculateCupConversion() {
    const typeEl = el('cup-type');
    if (!typeEl) return;
    const type = typeEl.value;
    const val = num('cup-val');
    const fromEl = el('cup-from');
    const toEl = el('cup-to');
    if (!fromEl || !toEl) return;
    const from = fromEl.value;
    const to = toEl.value;
    if (val === null) { showToast('Unesite vrednost.', 'error'); return; }
    let mlPerCup;
    if (type === 'custom') mlPerCup = num('cup-custom-ml') || 200;
    else mlPerCup = CUP_ML[type] || 200;
    let ml;
    if (from === 'casa') ml = val * mlPerCup;
    else if (from === 'l') ml = val * 1000;
    else if (from === 'dl') ml = val * 100;
    else ml = val;
    let result, unit;
    if (to === 'ml') { result = ml; unit = 'ml'; }
    else if (to === 'l') { result = ml / 1000; unit = 'L'; }
    else if (to === 'dl') { result = ml / 100; unit = 'dL'; }
    else { result = ml / mlPerCup; unit = 'čaša'; }
    const cv = el('res-cup-val'); if (cv) cv.innerText = fmt(result, 2);
    const cu = el('res-cup-unit'); if (cu) cu.innerText = unit;
    show('cup-result-box');
}

function calculateOtherMeasure() {
    const typeEl = el('other-type');
    if (!typeEl) return;
    const type = typeEl.value;
    const qty = num('other-qty');
    if (!qty) { showToast('Unesite broj mera.', 'error'); return; }
    const gramsPer = { prstohvat: 0.5, prst: 2, saka: 50, kolut: 10, kocka: 5 };
    const g = qty * (gramsPer[type] || 1);
    const og = el('res-other-g'); if (og) og.innerText = fmt(g, 1);
    show('other-result-box');
}

function calculateOven() {
    const fromEl = el('oven-from');
    const toEl = el('oven-to');
    if (!fromEl || !toEl) return;
    const from = fromEl.value;
    const val = num('oven-val');
    const to = toEl.value;
    if (val === null) { showToast('Unesite vrednost.', 'error'); return; }
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
        const cToGas = [
            [135, 1], [145, 1.5], [155, 2], [165, 2.5], [175, 3], [185, 4],
            [195, 5], [205, 6], [215, 6.5], [225, 7], [235, 8], [245, 9]
        ];
        let closest = 4;
        for (const [c, g] of cToGas) { if (celsius <= c) { closest = g; break; } }
        result = closest;
        unit = 'Gas';
    }
    const ov = el('res-oven-val'); if (ov) ov.innerText = fmt(result, 0);
    const ou = el('res-oven-unit'); if (ou) ou.innerText = unit;
    show('oven-result-box');
}

function calculatePortion() {
    const orig = num('portion-orig');
    const want = num('portion-want');
    const qty = num('portion-qty');
    const unitEl = el('portion-unit');
    const unit = unitEl ? (unitEl.value.trim() || 'g') : 'g';
    if (!orig || !want || !qty) { showToast('Unesite sve podatke.', 'error'); return; }
    const factor = want / orig;
    const newQty = qty * factor;
    const pv = el('res-portion-val'); if (pv) pv.innerText = fmt(newQty, 2);
    const pu = el('res-portion-unit'); if (pu) pu.innerText = unit;
    const pf = el('stat-portion-factor'); if (pf) pf.innerText = fmt(factor, 2) + '×';
    show('portion-result-box');
    show('portion-stats-row');
}

const DRINK_DEFAULTS = {
    kafa_turska: { val: 1, unit: 'kašičica' },
    kafa_espreso: { val: 7, unit: 'g' },
    kafa_filter: { val: 10, unit: 'g' },
    caj_list: { val: 2, unit: 'g' },
    caj_kesica: { val: 1, unit: 'kesica' }
};

function calculateDrink() {
    const typeEl = el('drink-type');
    if (!typeEl) return;
    const type = typeEl.value;
    const cups = num('drink-cups');
    if (!cups) { showToast('Unesite broj šoljica.', 'error'); return; }
    const def = DRINK_DEFAULTS[type] || { val: 1, unit: 'kašičica' };
    const total = cups * def.val;
    const dv = el('res-drink-val'); if (dv) dv.innerText = fmt(total, 1);
    const du = el('res-drink-unit'); if (du) du.innerText = def.unit;
    show('drink-result-box');
}

// ================= GRAĐEVINA =================

let openingsData = { paint: [], tile: [], block: [], board: [] };

function addOpening(type) {
    openingsData[type].push({ name: '', w: 0, h: 0 });
    renderOpenings(type);
    vibrate(15);
    playTick(0, 1400, 0.06, 0.02);
}

function removeOpening(type, idx) {
    openingsData[type].splice(idx, 1);
    renderOpenings(type);
    vibrate(10);
}

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
        empty.textContent = 'Nema dodatih otvora';
        list.appendChild(empty);
        return;
    }
    openingsData[type].forEach((op, idx) => {
        const item = document.createElement('div');
        item.className = 'opening-item';

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.placeholder = 'naziv';
        nameInput.value = op.name || '';
        nameInput.oninput = (e) => updateOpening(type, idx, 'name', e.target.value);

        const wInput = document.createElement('input');
        wInput.type = 'text';
        wInput.inputMode = 'decimal';
        wInput.placeholder = 'šir. m';
        wInput.value = op.w || '';
        wInput.oninput = (e) => updateOpening(type, idx, 'w', e.target.value);

        const hInput = document.createElement('input');
        hInput.type = 'text';
        hInput.inputMode = 'decimal';
        hInput.placeholder = 'vis. m';
        hInput.value = op.h || '';
        hInput.oninput = (e) => updateOpening(type, idx, 'h', e.target.value);

        const removeBtn = document.createElement('button');
        removeBtn.className = 'opening-remove';
        removeBtn.textContent = '✕';
        removeBtn.onclick = () => removeOpening(type, idx);

        item.appendChild(nameInput);
        item.appendChild(wInput);
        item.appendChild(hInput);
        item.appendChild(removeBtn);
        list.appendChild(item);
    });
}

function getOpeningsArea(type) {
    return openingsData[type].reduce((sum, op) => {
        const w = op.w || 0;
        const h = op.h || 0;
        return sum + (w * h);
    }, 0);
}

function toggleShapeInputs() {
    const typeEl = el('shape-type');
    if (!typeEl) return;
    const type = typeEl.value;
    const rect = el('shape-rect-inputs');
    const sq = el('shape-square-inputs');
    const ci = el('shape-circle-inputs');
    const tr = el('shape-triangle-inputs');
    if (rect) rect.style.display = type === 'rect' ? 'block' : 'none';
    if (sq) sq.style.display = type === 'square' ? 'block' : 'none';
    if (ci) ci.style.display = type === 'circle' ? 'block' : 'none';
    if (tr) tr.style.display = type === 'triangle' ? 'block' : 'none';
}

function calculateShapeArea() {
    const typeEl = el('shape-type');
    if (!typeEl) return;
    const type = typeEl.value;
    let area = 0;
    if (type === 'rect') {
        const a = num('shape-a'); const b = num('shape-b');
        if (!a || !b) { showToast('Unesite dužinu i širinu.', 'error'); return; }
        area = a * b;
    } else if (type === 'square') {
        const s = num('shape-side');
        if (!s) { showToast('Unesite stranicu.', 'error'); return; }
        area = s * s;
    } else if (type === 'circle') {
        const d = num('shape-diameter');
        if (!d) { showToast('Unesite prečnik.', 'error'); return; }
        area = Math.PI * Math.pow(d / 2, 2);
    } else if (type === 'triangle') {
        const b = num('shape-base'); const h = num('shape-height');
        if (!b || !h) { showToast('Unesite osnovu i visinu.', 'error'); return; }
        area = (b * h) / 2;
    }
    const sa = el('res-shape-area'); if (sa) sa.innerText = fmt(area, 2);
    show('shape-result-box');
}

function calculatePaint() {
    const width = num('paint-width');
    const height = num('paint-height');
    const walls = num('paint-walls') || 0;
    const coverage = num('paint-coverage') || 10;
    if (!width || !height || !walls) { showToast('Unesite dimenzije zidova.', 'error'); return; }
    const grossArea = width * height * walls;
    const openingsArea = getOpeningsArea('paint');
    const netArea = Math.max(0, grossArea - openingsArea);
    const liters = netArea / coverage;
    const pl = el('res-paint-liters'); if (pl) pl.innerText = fmt(liters, 2);
    const pa = el('stat-paint-area'); if (pa) pa.innerText = fmt(netArea, 2) + ' m²';
    const po = el('stat-paint-openings'); if (po) po.innerText = fmt(openingsArea, 2) + ' m²';
    show('paint-result-box');
    show('paint-stats-row');
}

function calculateTiles() {
    const roomL = num('tile-room-l');
    const roomW = num('tile-room-w');
    const tileL = num('tile-l');
    const tileW = num('tile-w');
    const reserve = num('tile-reserve') || 0;
    if (!roomL || !roomW || !tileL || !tileW) { showToast('Unesite sve dimenzije.', 'error'); return; }
    const grossArea = roomL * roomW;
    const openingsArea = getOpeningsArea('tile');
    const netArea = Math.max(0, grossArea - openingsArea);
    const tileArea = (tileL / 100) * (tileW / 100);
    const tilesBase = netArea / tileArea;
    const tilesWithReserve = tilesBase * (1 + reserve / 100);
    const tc = el('res-tiles-count'); if (tc) tc.innerText = Math.ceil(tilesWithReserve);
    const ta = el('stat-tiles-area'); if (ta) ta.innerText = fmt(netArea, 2) + ' m²';
    const tn = el('stat-tiles-nores'); if (tn) tn.innerText = Math.ceil(tilesBase) + ' kom';
    show('tiles-result-box');
    show('tiles-stats-row');
}

function calculateLaminate() {
    const roomL = num('lam-room-l');
    const roomW = num('lam-room-w');
    const packArea = num('lam-pack');
    const reserve = num('lam-reserve') || 0;
    if (!roomL || !roomW || !packArea) { showToast('Unesite sve podatke.', 'error'); return; }
    const area = roomL * roomW;
    const areaWithReserve = area * (1 + reserve / 100);
    const packs = Math.ceil(areaWithReserve / packArea);
    const lp = el('res-lam-packs'); if (lp) lp.innerText = packs;
    const la = el('stat-lam-area'); if (la) la.innerText = fmt(area, 2) + ' m²';
    show('laminate-result-box');
    show('laminate-stats-row');
}

function calculateConcrete() {
    const l = num('beton-l');
    const w = num('beton-w');
    const h = num('beton-h');
    if (!l || !w || !h) { showToast('Unesite sve dimenzije.', 'error'); return; }
    const volume = l * w * h;
    const bm = el('res-beton-m3'); if (bm) bm.innerText = fmt(volume, 3);
    show('beton-result-box');
}

const BLOCK_DEFAULTS = {
    giter25: { l: 25, h: 19, w: 33 },
    giter20: { l: 20, h: 19, w: 33 },
    giter15: { l: 15, h: 19, w: 33 },
    siporeks: { l: 25, h: 20, w: 50 },
    cigla: { l: 25, h: 12, w: 6.5 }
};

function updateBlockDefaults() {
    const typeEl = el('block-type');
    if (!typeEl) return;
    const type = typeEl.value;
    if (type === 'custom') return;
    const def = BLOCK_DEFAULTS[type];
    if (!def) return;
    const bl = el('block-l'); if (bl) bl.value = def.l;
    const bh = el('block-h'); if (bh) bh.value = def.h;
    const bw = el('block-w'); if (bw) bw.value = def.w;
}

function calculateBlocks() {
    const wallL = num('block-wall-l');
    const wallH = num('block-wall-h');
    const blockL = num('block-l');
    const blockH = num('block-h');
    if (!wallL || !wallH || !blockL || !blockH) { showToast('Unesite dimenzije zida i bloka.', 'error'); return; }
    const grossArea = wallL * wallH;
    const openingsArea = getOpeningsArea('block');
    const netArea = Math.max(0, grossArea - openingsArea);
    const blockArea = (blockL / 100) * (blockH / 100);
    const blocks = Math.ceil(netArea / blockArea);
    const bc = el('res-blocks-count'); if (bc) bc.innerText = blocks;
    const ba = el('stat-blocks-area'); if (ba) ba.innerText = fmt(netArea, 2) + ' m²';
    const price = num('block-price');
    const bp = el('stat-blocks-price');
    if (bp) bp.innerText = price ? money(blocks * price) + ' RSD' : '—';
    show('blocks-result-box');
    show('blocks-stats-row');
}

const BOARD_DEFAULTS = {
    osb: { l: 125, w: 250 },
    regips: { l: 120, w: 200 },
    sper: { l: 125, w: 250 },
    iverica: { l: 183, w: 280 }
};

function updateBoardDefaults() {
    const typeEl = el('board-type');
    if (!typeEl) return;
    const type = typeEl.value;
    if (type === 'custom') return;
    const def = BOARD_DEFAULTS[type];
    if (!def) return;
    const bl = el('board-l'); if (bl) bl.value = def.l;
    const bw = el('board-w'); if (bw) bw.value = def.w;
}

function calculateBoards() {
    const wallL = num('board-wall-l');
    const wallH = num('board-wall-h');
    const boardL = num('board-l');
    const boardW = num('board-w');
    const reserve = num('board-reserve') || 0;
    if (!wallL || !wallH || !boardL || !boardW) { showToast('Unesite dimenzije površine i table.', 'error'); return; }
    const grossArea = wallL * wallH;
    const openingsArea = getOpeningsArea('board');
    const netArea = Math.max(0, grossArea - openingsArea);
    const singleBoardArea = (boardL / 100) * (boardW / 100);
    const baseBoards = netArea / singleBoardArea;
    const totalBoards = Math.ceil(baseBoards * (1 + reserve / 100));
    const bc = el('res-boards-count'); if (bc) bc.innerText = totalBoards;
    const ba = el('stat-boards-area'); if (ba) ba.innerText = fmt(netArea, 2) + ' m²';
    const bs = el('stat-boards-single'); if (bs) bs.innerText = fmt(singleBoardArea, 3) + ' m²';
    show('boards-result-box');
    show('boards-stats-row');
}

const CREP_DEFAULTS = { kupa: 15.5, mediteran: 12.5, betonski: 10 };

function updateCrepDefaults() {
    const typeEl = el('crep-type');
    if (!typeEl) return;
    const type = typeEl.value;
    if (type === 'custom') return;
    const per = CREP_DEFAULTS[type];
    if (per) {
        const pm = el('crep-per-m2');
        if (pm) pm.value = per;
    }
}

function calculateCrep() {
    const area = num('crep-area');
    const perM2 = num('crep-per-m2');
    const reserve = num('crep-reserve') || 0;
    if (!area || !perM2) { showToast('Unesite površinu krova i broj po m².', 'error'); return; }
    const baseCount = area * perM2;
    const totalCount = Math.ceil(baseCount * (1 + reserve / 100));
    const cc = el('res-crep-count'); if (cc) cc.innerText = totalCount;
    const cb = el('stat-crep-base'); if (cb) cb.innerText = Math.ceil(baseCount) + ' kom';
    show('crep-result-box');
    show('crep-stats-row');
}

function calculateMortar() {
    const area = num('malter-area');
    const thickness = num('malter-thickness');
    const ratioEl = el('malter-ratio');
    if (!ratioEl) return;
    const ratioStr = ratioEl.value;
    if (!area || !thickness) { showToast('Unesite površinu i debljinu.', 'error'); return; }
    const [cementPart, sandPart] = ratioStr.split(':').map(Number);
    const volume = area * (thickness / 100);
    const dryVolume = volume * 1.3;
    const totalParts = cementPart + sandPart;
    const cementVolume = dryVolume * (cementPart / totalParts);
    const sandVolume = dryVolume * (sandPart / totalParts);
    const cementKg = cementVolume * 1400;
    const sandKg = sandVolume * 1600;
    const waterL = cementKg * 0.5;
    const mt = el('res-malter-text');
    if (mt) mt.innerHTML = `<strong>${fmt(volume, 3)} m³</strong> maltera`;
    const mc = el('stat-malter-cement'); if (mc) mc.innerText = fmt(cementKg, 0) + ' kg';
    const ms = el('stat-malter-sand'); if (ms) ms.innerText = fmt(sandKg, 0) + ' kg';
    const mw = el('stat-malter-water'); if (mw) mw.innerText = fmt(waterL, 0) + ' L';
    show('malter-result-box');
    show('malter-stats-row');
}

function calculateGypsum() {
    const area = num('gips-area');
    const layersEl = el('gips-layers');
    const layers = layersEl ? parseInt(layersEl.value) : 1;
    if (!area) { showToast('Unesite površinu.', 'error'); return; }
    const sheetArea = 1.2 * 2.0;
    const totalArea = area * layers;
    const sheets = Math.ceil(totalArea / sheetArea * 1.1);
    const profilesNeeded = Math.ceil(area * 2.5 / 3);
    const screws = Math.ceil(area * 30 * layers);
    const gt = el('res-gips-text');
    if (gt) gt.innerHTML = `<strong>${fmt(area, 2)} m²</strong> × ${layers} sloja`;
    const gs = el('stat-gips-sheets'); if (gs) gs.innerText = sheets + ' kom';
    const gp = el('stat-gips-profiles'); if (gp) gp.innerText = profilesNeeded + ' kom';
    const gsc = el('stat-gips-screws'); if (gsc) gsc.innerText = screws + ' kom';
    show('gips-result-box');
    show('gips-stats-row');
}

function calculateFoundation() {
    const l = num('temelj-l');
    const w = num('temelj-w');
    const h = num('temelj-h');
    if (!l || !w || !h) { showToast('Unesite sve dimenzije.', 'error'); return; }
    const volume = l * w * h;
    const arma = volume * 80;
    const cementKg = volume * 350;
    const cementBags = Math.ceil(cementKg / 25);
    const tm = el('res-temelj-m3'); if (tm) tm.innerText = fmt(volume, 3);
    const ta = el('stat-temelj-arma'); if (ta) ta.innerText = fmt(arma, 0) + ' kg';
    const tc = el('stat-temelj-cement'); if (tc) tc.innerText = cementBags;
    show('temelj-result-box');
    show('temelj-stats-row');
}

function calculateHydro() {
    const area = num('hidro-area');
    const typeEl = el('hidro-type');
    if (!typeEl) return;
    const type = typeEl.value;
    const reserve = num('hidro-reserve') || 0;
    if (!area) { showToast('Unesite površinu.', 'error'); return; }
    const areaWithReserve = area * (1 + reserve / 100);
    let text = '';
    if (type === 'folija') {
        const rolls = Math.ceil(areaWithReserve / (1.5 * 20));
        text = `<strong>${rolls}</strong> rola folije (1.5×20m)`;
    } else if (type === 'premaz') {
        const kg = Math.ceil(areaWithReserve * 1.5);
        text = `<strong>${kg} kg</strong> premaza (~1.5 kg/m²)`;
    } else {
        const m = Math.ceil(areaWithReserve * 2.5);
        text = `<strong>${m} m</strong> trake (širina 10cm)`;
    }
    const ht = el('res-hidro-text'); if (ht) ht.innerHTML = text;
    show('hidro-result-box');
}

function calculateElectro() {
    const outlets = num('elektro-outlets') || 0;
    const switches = num('elektro-switches') || 0;
    const lights = num('elektro-lights') || 0;
    const cable = num('elektro-cable') || 0;
    if (!outlets && !switches && !lights && !cable) { showToast('Unesite bar jedan podatak.', 'error'); return; }
    const boxes = outlets + switches;
    const et = el('res-elektro-text');
    if (et) et.innerHTML = `<strong>${boxes}</strong> doza • ${fmt(cable, 0)}m kabla`;
    const eo = el('stat-elektro-out'); if (eo) eo.innerText = outlets;
    const es = el('stat-elektro-sw'); if (es) es.innerText = switches;
    const ec = el('stat-elektro-cab'); if (ec) ec.innerText = cable + ' m';
    show('elektro-result-box');
    show('elektro-stats-row');
}

function calculateJoinery() {
    const qty = num('stolarija-qty');
    const w = num('stolarija-w');
    const h = num('stolarija-h');
    if (!qty || !w || !h) { showToast('Unesite sve podatke.', 'error'); return; }
    const totalArea = qty * w * h;
    const sm = el('res-stolarija-m2'); if (sm) sm.innerText = fmt(totalArea, 2);
    show('stolarija-result-box');
}

function calculateUniversal() {
    const qty = num('univ-qty');
    const price = num('univ-price');
    if (!qty || !price) { showToast('Unesite količinu i cenu.', 'error'); return; }
    const total = qty * price;
    const ut = el('res-univ-total'); if (ut) ut.innerText = money(total);
    show('univ-result-box');
}

// ================= STRUJA =================

function calculatePower() {
    const watts = num('power-watts');
    const hours = num('power-hours');
    const price = num('power-price') || 12;
    if (!watts || !hours) { showToast('Unesite snagu i sate.', 'error'); return; }
    const kwhDay = (watts * hours) / 1000;
    const kwhMonth = kwhDay * 30;
    const kwhYear = kwhDay * 365;
    const costDay = kwhDay * price;
    const costMonth = kwhMonth * price;
    const costYear = kwhYear * price;
    const pm = el('res-power-month'); if (pm) pm.innerText = money(costMonth);
    const pd = el('stat-power-day'); if (pd) pd.innerText = money(costDay) + ' RSD';
    const py = el('stat-power-year'); if (py) py.innerText = money(costYear) + ' RSD';
    const pk = el('stat-power-kwh'); if (pk) pk.innerText = fmt(kwhMonth, 1);
    show('power-result-box');
    show('power-stats-row');
}

let powerDevices = [];
try {
    const saved = JSON.parse(localStorage.getItem('cx_power_devices'));
    if (Array.isArray(saved)) powerDevices = saved;
} catch (e) {}

function savePowerDevices() {
    try { localStorage.setItem('cx_power_devices', JSON.stringify(powerDevices)); } catch (e) {}
}

function renderPowerDevices() {
    try {
        const list = el('power-devices-list');
        if (!list) return;
        list.innerHTML = '';
        if (!powerDevices.length) {
            list.innerHTML = '<p class="section-desc" style="text-align:center; padding:10px;">Još nema dodatih uređaja.</p>';
            return;
        }
        powerDevices.forEach((dev, idx) => {
            const row = document.createElement('div');
            row.className = 'power-device-item';
            row.innerHTML = `
                <div class="power-device-info">
                    <div class="power-device-name">${dev.name || 'Uređaj ' + (idx + 1)}</div>
                    <div class="power-device-detail">${dev.watts}W × ${dev.hours}h/dan</div>
                </div>
                <button class="power-device-remove" title="Obriši">✕</button>
            `;
            row.querySelector('.power-device-remove').addEventListener('click', () => {
                powerDevices.splice(idx, 1);
                savePowerDevices();
                renderPowerDevices();
                updatePowerTotal();
            });
            list.appendChild(row);
        });
    } catch (e) { console.error('renderPowerDevices error:', e); }
}

function updatePowerTotal() {
    try {
        if (!powerDevices.length) {
            hide('power-multi-result-box');
            hide('power-multi-stats-row');
            return;
        }
        let totalMonth = 0, totalKwh = 0;
        powerDevices.forEach(dev => {
            const kwhDay = (dev.watts * dev.hours) / 1000;
            const kwhMonth = kwhDay * 30;
            totalKwh += kwhMonth;
            totalMonth += kwhMonth * (dev.price || 12);
        });
        const pt = el('res-power-total'); if (pt) pt.innerText = money(totalMonth);
        const pc = el('stat-power-count'); if (pc) pc.innerText = powerDevices.length;
        const pk = el('stat-power-total-kwh'); if (pk) pk.innerText = fmt(totalKwh, 1);
        show('power-multi-result-box');
        show('power-multi-stats-row');
    } catch (e) { console.error('updatePowerTotal error:', e); }
}

function addPowerDevice() {
    const nameEl = el('dev-name');
    const name = nameEl ? (nameEl.value.trim() || 'Uređaj') : 'Uređaj';
    const watts = num('dev-watts');
    const hours = num('dev-hours');
    const price = num('dev-price') || 12;
    if (!watts || !hours) { showToast('Unesite snagu i sate.', 'error'); return; }
    powerDevices.push({ name, watts, hours, price });
    savePowerDevices();
    renderPowerDevices();
    updatePowerTotal();
    if (nameEl) nameEl.value = '';
    const w = el('dev-watts'); if (w) w.value = '';
    const h = el('dev-hours'); if (h) h.value = '';
    showToast('Uređaj dodat', 'success', 1500);
}

function calculateWattAmps() {
    const phaseEl = el('watt-phase');
    const dirEl = el('watt-dir');
    const voltEl = el('watt-volt');
    const cosEl = el('watt-cosfi');
    const val = num('watt-val');

    if (!phaseEl || !dirEl || !voltEl || !cosEl) return;
    const phases = phaseEl.value === '3' ? 3 : 1;
    const dir = dirEl.value;
    const volts = num('watt-volt') || 230;
    const cosfi = parseNum(cosEl.value) || 0.95;

    if (val === null) {
        hide('watt-result-box');
        hide('watt-stats-row');
        return;
    }

    const sqrt3 = Math.sqrt(3);
    let result, unit, powerW, amps, recommendedFuse;

    if (dir === 'w-to-a') {
        powerW = val;
        if (phases === 3) {
            amps = powerW / (sqrt3 * volts * cosfi);
        } else {
            amps = powerW / (volts * cosfi);
        }
        result = amps;
        unit = 'A';
    } else {
        amps = val;
        if (phases === 3) {
            powerW = sqrt3 * volts * amps * cosfi;
        } else {
            powerW = volts * amps * cosfi;
        }
        result = powerW;
        unit = 'W';
    }

    const standardFuses = [6, 10, 13, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125];
    recommendedFuse = standardFuses.find(f => f >= amps * 1.1) || 125;

    const rv = el('res-watt-val'); if (rv) rv.innerText = fmt(result, 2);
    const ru = el('res-watt-unit'); if (ru) ru.innerText = unit;

    const sw = el('stat-watt-w'); if (sw) sw.innerText = fmt(powerW, 0) + ' W';
    const sa = el('stat-watt-a'); if (sa) sa.innerText = fmt(amps, 2) + ' A';
    const so = el('stat-watt-osig'); if (so) so.innerText = recommendedFuse + ' A';

    show('watt-result-box');
    show('watt-stats-row');
}

function calculateBill() {
    const visaKwh = num('fakt-visa') || 0;
    const nizaKwh = num('fakt-niza') || 0;
    const visaCena = num('fakt-cena-visa') || 12;
    const nizaCena = num('fakt-cena-niza') || 6;
    const fiksni = num('fakt-fiksni') || 0;

    if (!visaKwh && !nizaKwh) { showToast('Unesite potrošnju.', 'error'); return; }

    const visaTotal = visaKwh * visaCena;
    const nizaTotal = nizaKwh * nizaCena;
    const ukupno = visaTotal + nizaTotal + fiksni;
    const ukupnoKwh = visaKwh + nizaKwh;

    const rt = el('res-fakt-total'); if (rt) rt.innerText = money(ukupno);
    const sv = el('stat-fakt-visa'); if (sv) sv.innerText = money(visaTotal) + ' RSD';
    const sn = el('stat-fakt-niza'); if (sn) sn.innerText = money(nizaTotal) + ' RSD';
    const sk = el('stat-fakt-kwh'); if (sk) sk.innerText = fmt(ukupnoKwh, 1);

    show('fakt-result-box');
    show('fakt-stats-row');
}

function calculateCable() {
    const amps = num('kabl-amps');
    const len = num('kabl-len');
    const volts = num('kabl-volt') || 230;
    const typeEl = el('kabl-type');
    const isCopper = !typeEl || typeEl.value === 'bakr';

    if (!amps || !len) { showToast('Unesite struju i dužinu.', 'error'); return; }

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

    const maxDropV = volts * 0.05;
    const minSectionForDrop = (2 * rho * len * amps) / maxDropV;
    if (minSectionForDrop > chosen) {
        for (const s of sections) {
            if (s >= minSectionForDrop) { chosen = s; break; }
        }
    }

    const dropV = (2 * rho * len * amps) / chosen;
    const dropPct = (dropV / volts) * 100;

    const fuses = [6, 10, 13, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125];
    const recommendedFuse = fuses.find(f => f >= amps * 1.15) || 125;

    const rv = el('res-kabl-mm2'); if (rv) rv.innerText = fmt(chosen, 1);
    const so = el('stat-kabl-osig'); if (so) so.innerText = recommendedFuse + ' A';
    const sp = el('stat-kabl-pad'); if (sp) sp.innerText = fmt(dropPct, 2) + ' %';
    const sm = el('stat-kabl-mat'); if (sm) sm.innerText = isCopper ? 'Bakar' : 'Aluminijum';

    show('kabl-result-box');
    show('kabl-stats-row');
}

function calculateVoltageDrop() {
    const amps = num('pad-amps');
    const len = num('pad-len');
    const mm2 = num('pad-mm2');
    const volts = num('pad-volt') || 230;
    const matEl = el('pad-mat');
    const rho = matEl ? parseFloat(matEl.value) : 0.0178;

    if (!amps || !len || !mm2) { showToast('Unesite sve podatke.', 'error'); return; }

    const dropV = (2 * rho * len * amps) / mm2;
    const dropPct = (dropV / volts) * 100;
    const endV = volts - dropV;

    let ocena = '✅ Odlično';
    let boja = '#34d399';
    if (dropPct > 5) { ocena = '❌ Preveliki pad'; boja = '#ef4444'; }
    else if (dropPct > 3) { ocena = '⚠️ Granično'; boja = '#f59e0b'; }
    else if (dropPct > 1.5) { ocena = '✅ Prihvatljivo'; boja = '#34d399'; }

    const rv = el('res-pad-volt'); if (rv) rv.innerText = fmt(dropV, 2);
    const sp = el('stat-pad-pct'); if (sp) sp.innerText = fmt(dropPct, 2) + ' %';
    const se = el('stat-pad-end'); if (se) se.innerText = fmt(endV, 1) + ' V';
    const so = el('stat-pad-ok');
    if (so) { so.innerText = ocena; so.style.color = boja; }

    show('pad-result-box');
    show('pad-stats-row');
}

function calculateFuse() {
    const watt = num('osig-watt');
    const volts = num('osig-volt') || 230;
    const tipEl = el('osig-tip');
    const charEl = el('osig-char');
    if (!watt) { showToast('Unesite snagu.', 'error'); return; }

    const tip = tipEl ? parseFloat(tipEl.value) : 1;
    const char = charEl ? charEl.value : 'C';

    const radna = watt / volts;
    const startna = radna * tip;

    const fuses = [6, 10, 13, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125];
    const recommended = fuses.find(f => f >= startna * 1.1) || 125;

    const cableByFuse = {
        6: 1.5, 10: 1.5, 13: 1.5, 16: 2.5, 20: 2.5, 25: 4,
        32: 6, 40: 6, 50: 10, 63: 16, 80: 25, 100: 35, 125: 50
    };
    const minCable = cableByFuse[recommended] || 2.5;

    const rv = el('res-osig-val'); if (rv) rv.innerText = recommended;
    const rc = el('res-osig-char'); if (rc) rc.innerText = char;

    const sr = el('stat-osig-radna'); if (sr) sr.innerText = fmt(radna, 2) + ' A';
    const ss = el('stat-osig-start'); if (ss) ss.innerText = fmt(startna, 2) + ' A';
    const sk = el('stat-osig-kabl'); if (sk) sk.innerText = fmt(minCable, 1) + ' mm²';

    show('osig-result-box');
    show('osig-stats-row');
}

function calculateThreePhase() {
    const pozEl = el('trofaz-poz');
    const val = num('trofaz-val');
    const volts = num('trofaz-volt') || 400;
    const cosEl = el('trofaz-cosfi');
    const cosfi = cosEl ? parseNum(cosEl.value) || 0.9 : 0.9;

    if (!pozEl || val === null) { showToast('Unesite vrednost.', 'error'); return; }

    const poz = pozEl.value;
    const sqrt3 = Math.sqrt(3);
    let result, unit, powerKw, amps;

    if (poz === 'snaga') {
        powerKw = val;
        amps = (powerKw * 1000) / (sqrt3 * volts * cosfi);
        result = amps;
        unit = 'A';
    } else {
        amps = val;
        powerKw = (sqrt3 * volts * amps * cosfi) / 1000;
        result = powerKw;
        unit = 'kW';
    }

    const rv = el('res-trofaz-val'); if (rv) rv.innerText = fmt(result, 2);
    const ru = el('res-trofaz-unit'); if (ru) ru.innerText = unit;

    const sk = el('stat-trofaz-kw'); if (sk) sk.innerText = fmt(powerKw, 2) + ' kW';
    const sa = el('stat-trofaz-a'); if (sa) sa.innerText = fmt(amps, 2) + ' A';
    const st = el('stat-trofaz-tot'); if (st) st.innerText = fmt(amps * 3, 2) + ' A';

    show('trofaz-result-box');
    show('trofaz-stats-row');
}

function calculateLighting() {
    const l = num('osv-l');
    const w = num('osv-w');
    const h = num('osv-h') || 2.6;
    const tipEl = el('osv-tip');
    const wattEl = num('osv-watt') || 10;

    if (!l || !w) { showToast('Unesite dimenzije prostorije.', 'error'); return; }
    if (!tipEl) return;

    const lux = parseFloat(tipEl.value);
    const area = l * w;

    let heightFactor = 1;
    if (h > 3) heightFactor = 1 + (h - 3) * 0.15;
    else if (h > 2.7) heightFactor = 1.05;

    const lumens = area * lux * heightFactor;

    const ledLmPerW = 100;
    const totalWatt = lumens / ledLmPerW;
    const brojSijalica = Math.max(1, Math.ceil(totalWatt / wattEl));
    const ukupnoWatt = brojSijalica * wattEl;

    const rv = el('res-osv-lumen'); if (rv) rv.innerText = fmt(lumens, 0);
    const sp = el('stat-osv-pov'); if (sp) sp.innerText = fmt(area, 2) + ' m²';
    const sb = el('stat-osv-br'); if (sb) sb.innerText = brojSijalica;
    const sw = el('stat-osv-w'); if (sw) sw.innerText = fmt(ukupnoWatt, 0) + ' W';

    show('osv-result-box');
    show('osv-stats-row');
}

function calculateHeater() {
    const watt = num('grej-watt');
    const litra = num('grej-litar');
    const t1 = num('grej-t1') || 15;
    const t2 = num('grej-t2') || 60;
    const cena = num('grej-cena') || 12;

    if (!watt || !litra) { showToast('Unesite snagu i količinu vode.', 'error'); return; }
    if (t2 <= t1) { showToast('Krajnja temperatura mora biti veća.', 'error'); return; }

    const mass = litra;
    const dT = t2 - t1;
    const energyJ = mass * 4186 * dT;
    const energyKwh = energyJ / 3600000;

    const timeH = energyKwh / (watt / 1000);
    const timeMin = timeH * 60;

    const cost = energyKwh * cena;

    const rv = el('res-grej-vreme'); if (rv) rv.innerText = fmt(timeMin, 1);
    const sk = el('stat-grej-kwh'); if (sk) sk.innerText = fmt(energyKwh, 2) + ' kWh';
    const sc = el('stat-grej-cena'); if (sc) sc.innerText = money(cost) + ' RSD';
    const sj = el('stat-grej-kj'); if (sj) sj.innerText = fmt(energyJ / 1000, 0) + ' kJ';

    show('grej-result-box');
    show('grej-stats-row');
}

function calculateBattery() {
    const volt = num('bat-volt') || 12;
    const ah = num('bat-ah');
    const watt = num('bat-watt');
    const dod = num('bat-dod') || 80;

    if (!ah || !watt) { showToast('Unesite kapacitet i opterećenje.', 'error'); return; }

    const wh = volt * ah;
    const usefulWh = wh * (dod / 100);
    const hours = usefulWh / watt;
    const amp = watt / volt;

    const rv = el('res-bat-time'); if (rv) rv.innerText = fmt(hours, 2);
    const sw = el('stat-bat-wh'); if (sw) sw.innerText = fmt(wh, 1) + ' Wh';
    const su = el('stat-bat-wh-use'); if (su) su.innerText = fmt(usefulWh, 1) + ' Wh';
    const sa = el('stat-bat-amp'); if (sa) sa.innerText = fmt(amp, 2) + ' A';

    show('bat-result-box');
    show('bat-stats-row');
}

function calculateKelvin() {
    const tipEl = el('kel-tip');
    const watt = num('kel-watt') || 10;
    if (!tipEl) return;

    const kel = parseInt(tipEl.value);
    let desc = '';
    if (kel <= 2700) desc = 'Toplo belo — opuštajuće';
    else if (kel <= 3000) desc = 'Toplo belo — prijatno';
    else if (kel <= 4000) desc = 'Neutralno — fokusirano';
    else if (kel <= 5000) desc = 'Hladno belo — budno';
    else desc = 'Dnevno svetlo — precizno';

    const lumens = watt * 100;

    const rv = el('res-kel-val'); if (rv) rv.innerText = kel;
    const sd = el('stat-kel-desc'); if (sd) sd.innerText = desc;
    const sl = el('stat-kel-lum'); if (sl) sl.innerText = fmt(lumens, 0) + ' lm';

    show('kel-result-box');
    show('kel-stats-row');
}

// ================= KUPOVINA =================

function calculateUnitPrice() {
    const price = num('unit-price');
    const qty = num('unit-qty');
    const typeEl = el('unit-type');
    if (!typeEl) return;
    const type = typeEl.value;
    if (!price || !qty) { showToast('Unesite cenu i količinu.', 'error'); return; }
    let result, label;
    if (type === 'kg') { result = price / qty; label = 'RSD/kg'; }
    else if (type === 'g100') { result = (price / qty) * 100; label = 'RSD/100g'; }
    else if (type === 'L') { result = price / qty; label = 'RSD/L'; }
    else if (type === 'ml100') { result = (price / qty) * 100; label = 'RSD/100ml'; }
    else if (type === 'kom') { result = price / qty; label = 'RSD/kom'; }
    else if (type === 'm') { result = price / qty; label = 'RSD/m'; }
    const up = el('res-unit-price'); if (up) up.innerText = money(result);
    const ul = el('res-unit-label'); if (ul) ul.innerText = label;
    show('unit-result-box');
}

function calculateCompare() {
    const aPrice = num('cmp-a-price');
    const aQty = num('cmp-a-qty');
    const aUnitEl = el('cmp-a-unit');
    const aUnit = aUnitEl ? aUnitEl.value : 'kg';
    const bPrice = num('cmp-b-price');
    const bQty = num('cmp-b-qty');
    const bUnitEl = el('cmp-b-unit');
    const bUnit = bUnitEl ? bUnitEl.value : 'kg';
    if (!aPrice || !aQty || !bPrice || !bQty) { showToast('Unesite sve podatke.', 'error'); return; }

    function toBase(price, qty, unit) {
        if (unit === 'kg' || unit === 'L') return price / qty;
        if (unit === 'g' || unit === 'ml') return price / (qty / 1000);
        return price / qty;
    }

    const aBase = toBase(aPrice, aQty, aUnit);
    const bBase = toBase(bPrice, bQty, bUnit);
    const winner = aBase < bBase ? 'Proizvod A je jeftiniji' : (bBase < aBase ? 'Proizvod B je jeftiniji' : 'Ista cena');
    const diff = Math.abs(aBase - bBase) / Math.max(aBase, bBase) * 100;

    const cw = el('res-cmp-winner'); if (cw) cw.innerText = winner;
    const ca = el('stat-cmp-a'); if (ca) ca.innerText = money(aBase) + '/kg-L';
    const cb = el('stat-cmp-b'); if (cb) cb.innerText = money(bBase) + '/kg-L';
    const cd = el('stat-cmp-diff'); if (cd) cd.innerText = fmt(diff, 1) + '%';

    show('compare-result-box');
    show('compare-stats-row');
}

function calculatePromo() {
    const typeEl = el('promo-type');
    if (!typeEl) return;
    const type = typeEl.value;
    const price = num('promo-price');
    if (!price) { showToast('Unesite cenu po komadu.', 'error'); return; }

    let totalPaid, totalQty, saved, effectiveUnit;
    if (type === '2plus1') {
        totalPaid = price * 2;
        totalQty = 3;
        saved = price * 3 - totalPaid;
    } else if (type === '3plus1') {
        totalPaid = price * 3;
        totalQty = 4;
        saved = price * 4 - totalPaid;
    } else {
        const secondPct = num('promo-second-pct') || 50;
        totalPaid = price + price * (1 - secondPct / 100);
        totalQty = 2;
        saved = price * 2 - totalPaid;
    }
    effectiveUnit = totalPaid / totalQty;

    const pu = el('res-promo-unit'); if (pu) pu.innerText = money(effectiveUnit);
    const pt = el('stat-promo-total'); if (pt) pt.innerText = money(totalPaid) + ' RSD';
    const pq = el('stat-promo-qty'); if (pq) pq.innerText = totalQty;
    const ps = el('stat-promo-save'); if (ps) ps.innerText = money(saved) + ' RSD';

    show('promo-result-box');
    show('promo-stats-row');
}

function loadShoppingList() {
    try {
        const raw = JSON.parse(localStorage.getItem('cx_shopping_list_v1'));
        if (Array.isArray(raw)) return raw;
    } catch (e) {}
    return [];
}

function saveShoppingList(list) {
    try { localStorage.setItem('cx_shopping_list_v1', JSON.stringify(list)); } catch (e) {}
}

function addShoppingItem() {
    const nameEl = el('lista-name');
    const qtyEl = el('lista-qty');
    const priceEl = el('lista-price');
    if (!nameEl) return;

    const name = nameEl.value.trim();
    if (!name) { showToast('Unesite naziv stavke.', 'error'); return; }

    const list = loadShoppingList();
    list.push({
        id: Date.now() + Math.random(),
        name,
        qty: qtyEl ? qtyEl.value.trim() : '',
        price: priceEl ? (parseNum(priceEl.value) || 0) : 0,
        bought: false,
        date: Date.now()
    });
    saveShoppingList(list);
    renderShoppingList();

    nameEl.value = '';
    if (qtyEl) qtyEl.value = '';
    if (priceEl) priceEl.value = '';

    showToast('Stavka dodata', 'success', 1400);
    vibrate(15);
    playTick(0, 1400, 0.07, 0.02);
    nameEl.focus();
}

function toggleShoppingItem(id) {
    const list = loadShoppingList();
    const item = list.find(i => i.id === id);
    if (!item) return;
    item.bought = !item.bought;
    saveShoppingList(list);
    renderShoppingList();
    vibrate(10);
    playTick(0, 1300, 0.05, 0.015);
}

function removeShoppingItem(id) {
    let list = loadShoppingList();
    list = list.filter(i => i.id !== id);
    saveShoppingList(list);
    renderShoppingList();
    vibrate(15);
}

async function clearBoughtItems() {
    const list = loadShoppingList();
    const boughtCount = list.filter(i => i.bought).length;
    if (!boughtCount) { showToast('Nema kupljenih stavki.', 'info', 1500); return; }
    const ok = await showConfirm(`Obrisati ${boughtCount} kupljenih stavki?`, 'Brisanje');
    if (!ok) return;
    saveShoppingList(list.filter(i => !i.bought));
    renderShoppingList();
    showToast('Kupljeno obrisano', 'success', 1500);
}

async function clearShoppingList() {
    const list = loadShoppingList();
    if (!list.length) { showToast('Lista je već prazna.', 'info', 1500); return; }
    const ok = await showConfirm('Obrisati celu listu za kupovinu?', 'Brisanje liste');
    if (!ok) return;
    saveShoppingList([]);
    renderShoppingList();
    showToast('Lista obrisana', 'success', 1500);
}

function renderShoppingList() {
    try {
        const list = loadShoppingList();
        const box = el('lista-box');
        const itemsWrap = el('lista-items');
        const progress = el('lista-progress');
        const totalEl = el('lista-total');
        const remainEl = el('lista-remaining');

        if (!box || !itemsWrap) return;

        if (!list.length) {
            box.style.display = 'none';
            return;
        }

        box.style.display = 'flex';

        itemsWrap.innerHTML = '';

        const boughtCount = list.filter(i => i.bought).length;
        if (progress) progress.textContent = `${boughtCount} / ${list.length} kupljeno`;

        let total = 0;
        let remaining = 0;

        list.forEach(item => {
            total += item.price || 0;
            if (!item.bought) remaining += item.price || 0;

            const row = document.createElement('div');
            row.className = 'lista-item' + (item.bought ? ' bought' : '');

            const check = document.createElement('button');
            check.className = 'lista-check';
            check.textContent = item.bought ? '✓' : '';
            check.title = item.bought ? 'Vrati na listu' : 'Označi kao kupljeno';
            check.addEventListener('click', () => toggleShoppingItem(item.id));

            const info = document.createElement('div');
            info.className = 'lista-item-info';

            const nameEl = document.createElement('div');
            nameEl.className = 'lista-item-name';
            nameEl.textContent = item.name;
            info.appendChild(nameEl);

            if (item.qty) {
                const qtyEl = document.createElement('div');
                qtyEl.className = 'lista-item-qty';
                qtyEl.textContent = item.qty;
                info.appendChild(qtyEl);
            }

            const priceEl = document.createElement('div');
            priceEl.className = 'lista-item-price';
            priceEl.textContent = item.price > 0 ? money(item.price) + ' RSD' : '—';

            const removeBtn = document.createElement('button');
            removeBtn.className = 'lista-item-remove';
            removeBtn.textContent = '✕';
            removeBtn.title = 'Obriši stavku';
            removeBtn.addEventListener('click', () => removeShoppingItem(item.id));

            row.appendChild(check);
            row.appendChild(info);
            row.appendChild(priceEl);
            row.appendChild(removeBtn);

            itemsWrap.appendChild(row);
        });

        if (totalEl) totalEl.textContent = money(total) + ' RSD';
        if (remainEl) remainEl.textContent = money(remaining) + ' RSD';
    } catch (e) { console.error('renderShoppingList error:', e); }
}

function calculateBudget() {
    const total = num('budzet-total');
    const periodEl = el('budzet-period');
    const spent = num('budzet-spent') || 0;

    if (!total || total <= 0) { showToast('Unesite ukupan budžet.', 'error'); return; }
    if (!periodEl) return;

    const period = parseInt(periodEl.value);
    const daily = total / period;
    const left = Math.max(0, total - spent);
    const leftDaily = left / period;

    const rd = el('res-budzet-daily'); if (rd) rd.innerText = money(daily);
    const sl = el('stat-budzet-left'); if (sl) sl.innerText = money(left) + ' RSD';
    const sd = el('stat-budzet-days'); if (sd) sd.innerText = period + ' dana';
    const sr = el('stat-budzet-recalc'); if (sr) sr.innerText = money(leftDaily) + ' RSD';

    show('budzet-result-box');
    show('budzet-stats-row');
}

function calculateRates() {
    const cena = num('rate-cena');
    const br = num('rate-br');
    const kes = num('rate-kes');
    const infl = num('rate-infl') || 0;

    if (!cena || !br || !kes) { showToast('Unesite sve podatke.', 'error'); return; }
    if (br < 1) { showToast('Broj rata mora biti bar 1.', 'error'); return; }

    const monthly = cena / br;
    const totalRate = cena;

    const kesSaInfl = kes * Math.pow(1 + infl / 100, br / 12);
    const saving = totalRate - kesSaInfl;

    let winner = '';
    if (kesSaInfl < totalRate) winner = 'Keš je isplativiji';
    else if (kesSaInfl > totalRate) winner = 'Rate su isplativije';
    else winner = 'Isto';

    const rw = el('res-rate-winner'); if (rw) rw.innerText = winner;
    const sm = el('stat-rate-monthly'); if (sm) sm.innerText = money(monthly) + ' RSD';
    const st = el('stat-rate-total'); if (st) st.innerText = money(totalRate) + ' RSD';
    const sv = el('stat-rate-saving'); if (sv) sv.innerText = money(saving) + ' RSD';

    show('rate-result-box');
    show('rate-stats-row');
}

function calculateCardVsCash() {
    const cena = num('kart-cena');
    const popust = num('kart-popust') || 0;
    const naknada = num('kart-naknada') || 0;

    if (!cena) { showToast('Unesite cenu.', 'error'); return; }

    const kes = cena * (1 - popust / 100);
    const kartica = cena * (1 + naknada / 100);
    const diff = Math.abs(kartica - kes);

    let winner = kes < kartica ? 'Keš je isplativiji' : (kartica < kes ? 'Kartica je isplativija' : 'Isto');

    const rw = el('res-kart-winner'); if (rw) rw.innerText = winner;
    const sk = el('stat-kart-kes'); if (sk) sk.innerText = money(kes) + ' RSD';
    const ska = el('stat-kart-kart'); if (ska) ska.innerText = money(kartica) + ' RSD';
    const sd = el('stat-kart-diff'); if (sd) sd.innerText = money(diff) + ' RSD';

    show('kart-result-box');
    show('kart-stats-row');
}

function calculatePerLiter() {
    const cena = num('litar-cena');
    const qty = num('litar-qty');
    const unitEl = el('litar-unit');

    if (!cena || !qty) { showToast('Unesite cenu i zapreminu.', 'error'); return; }
    if (!unitEl) return;

    const unit = unitEl.value;
    let liters = qty;
    if (unit === 'ml') liters = qty / 1000;
    else if (unit === 'dl') liters = qty / 10;

    const perL = cena / liters;
    const perDl = perL / 10;
    const per100ml = perL / 10;

    const rv = el('res-litar-val'); if (rv) rv.innerText = money(perL);
    const sd = el('stat-litar-dl'); if (sd) sd.innerText = money(perDl) + ' RSD';
    const sm = el('stat-litar-ml100'); if (sm) sm.innerText = money(per100ml) + ' RSD';

    show('litar-result-box');
    show('litar-stats-row');
}

function calculatePerPerson() {
    const total = num('osoba-total');
    const br = num('osoba-br') || 1;
    const dana = num('osoba-dana') || 1;

    if (!total) { showToast('Unesite ukupan trošak.', 'error'); return; }
    if (br < 1) { showToast('Broj osoba mora biti bar 1.', 'error'); return; }
    if (dana < 1) { showToast('Broj dana mora biti bar 1.', 'error'); return; }

    const perPerson = total / br;
    const perDay = perPerson / dana;
    const totalDaily = total / dana;

    const rv = el('res-osoba-val'); if (rv) rv.innerText = money(perPerson);
    const sd = el('stat-osoba-dan'); if (sd) sd.innerText = money(perDay) + ' RSD';
    const su = el('stat-osoba-ukupno'); if (su) su.innerText = money(totalDaily) + ' RSD';

    show('osoba-result-box');
    show('osoba-stats-row');
}

function calculateWorthTrip() {
    const usteda = num('isplati-usteda');
    const br = num('isplati-br') || 1;
    const dist = num('isplati-dist');
    const potrosnja = num('isplati-potrosnja') || 7;
    const gorivo = num('isplati-gorivo') || 180;

    if (!usteda || !dist) { showToast('Unesite uštedu i distancu.', 'error'); return; }

    const ukupnaUsteda = usteda * br;
    const liters = (dist * 2 / 100) * potrosnja;
    const trosakPuta = liters * gorivo;
    const neto = ukupnaUsteda - trosakPuta;

    let verdict;
    if (neto > 0) verdict = `Isplati se (ušteda ${money(neto)} RSD)`;
    else if (neto < 0) verdict = `Ne isplati se (gubiš ${money(-neto)} RSD)`;
    else verdict = 'Isto — nema razlike';

    const rv = el('res-isplati-verdict'); if (rv) rv.innerText = verdict;
    const su = el('stat-isplati-usteda'); if (su) su.innerText = money(ukupnaUsteda) + ' RSD';
    const st = el('stat-isplati-trosak'); if (st) st.innerText = money(trosakPuta) + ' RSD';
    const sn = el('stat-isplati-neto'); if (sn) sn.innerText = money(neto) + ' RSD';

    show('isplati-result-box');
    show('isplati-stats-row');
}

function calculateReceipts() {
    const aTotal = num('rac-a-total');
    const aItems = num('rac-a-items');
    const bTotal = num('rac-b-total');
    const bItems = num('rac-b-items');

    if (!aTotal || !aItems || !bTotal || !bItems) { showToast('Unesite sve podatke.', 'error'); return; }

    const aAvg = aTotal / aItems;
    const bAvg = bTotal / bItems;
    const diff = Math.abs(aAvg - bAvg) / Math.max(aAvg, bAvg) * 100;

    const winner = aAvg < bAvg ? 'Račun A je isplativiji' : (bAvg < aAvg ? 'Račun B je isplativiji' : 'Isto');

    const rw = el('res-rac-winner'); if (rw) rw.innerText = winner;
    const sa = el('stat-rac-a'); if (sa) sa.innerText = money(aAvg) + ' RSD';
    const sb = el('stat-rac-b'); if (sb) sb.innerText = money(bAvg) + ' RSD';
    const sd = el('stat-rac-diff'); if (sd) sd.innerText = fmt(diff, 1) + ' %';

    show('racuni-result-box');
    show('racuni-stats-row');
}

function calculateMealCost() {
    const cena = num('rasip-cena');
    const porcija = num('rasip-porcija');
    const bacanje = num('rasip-bacanje') || 0;

    if (!cena || !porcija) { showToast('Unesite cenu i broj obroka.', 'error'); return; }
    if (porcija < 1) { showToast('Broj obroka mora biti bar 1.', 'error'); return; }

    const base = cena / porcija;
    const waste = cena * (bacanje / 100);
    const effective = (cena + waste) / porcija;

    const rv = el('res-rasip-val'); if (rv) rv.innerText = money(effective);
    const sb = el('stat-rasip-base'); if (sb) sb.innerText = money(base) + ' RSD';
    const sw = el('stat-rasip-waste'); if (sw) sw.innerText = money(waste) + ' RSD';

    show('rasip-result-box');
    show('rasip-stats-row');
}

// ================= POSAO =================

function calculateWorkTime() {
    const startEl = el('work-start');
    const endEl = el('work-end');
    if (!startEl || !endEl) return;
    const start = startEl.value;
    const end = endEl.value;
    const breakMin = num('work-break') || 0;
    const dayTypeEl = el('work-day-type');
    const dayType = dayTypeEl ? dayTypeEl.value : 'workday';
    if (!start || !end) { showToast('Unesite vreme dolaska i odlaska.', 'error'); return; }
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    let startMin = sh * 60 + sm;
    let endMin = eh * 60 + em;
    if (endMin <= startMin) endMin += 24 * 60;
    const rawMinutes = endMin - startMin;
    const totalMinutes = Math.max(0, rawMinutes - breakMin);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const rawH = Math.floor(rawMinutes / 60);
    const rawM = rawMinutes % 60;
    const dec = totalMinutes / 60;
    let multLabel = '100%';
    if (dayType === 'weekend') multLabel = '110%';
    else if (dayType === 'holiday') multLabel = '150%';
    const rw = el('res-worktime'); if (rw) rw.innerText = `${hours}h ${minutes}min`;
    const wr = el('stat-worktime-raw'); if (wr) wr.innerText = `${rawH}h ${rawM}min`;
    const wd = el('stat-worktime-dec'); if (wd) wd.innerText = fmt(dec, 2) + ' h';
    const wm = el('stat-worktime-mult'); if (wm) wm.innerText = multLabel;
    show('worktime-result-box');
    show('worktime-stats-row');
}

function calculateHourlyRate() {
    const salary = num('work-salary');
    const hours = num('work-hours');
    const typeEl = el('work-rate-type');
    const type = typeEl ? typeEl.value : 'monthly';
    if (!salary || !hours) { showToast('Unesite platu i sate.', 'error'); return; }
    let monthlySalary = salary;
    if (type === 'yearly') monthlySalary = salary / 12;
    const hourly = monthlySalary / hours;
    const daily = hourly * 8;
    const weekly = hourly * 40;
    const perMin = hourly / 60;
    const hr = el('res-hourly-rate'); if (hr) hr.innerText = money(hourly);
    const hd = el('stat-hourly-day'); if (hd) hd.innerText = money(daily) + ' RSD';
    const hw = el('stat-hourly-week'); if (hw) hw.innerText = money(weekly) + ' RSD';
    const hm = el('stat-hourly-min'); if (hm) hm.innerText = money(perMin) + ' RSD';
    show('hourly-result-box');
    show('hourly-stats-row');
}

function calculateSalary() {
    const typeEl = el('plata-type');
    const type = typeEl ? typeEl.value : 'neto-to-bruto';
    const amount = num('plata-amount');
    if (!amount) { showToast('Unesite iznos.', 'error'); return; }

    const PIO = 0.14;
    const ZDR = 0.0515;
    const NEZ = 0.0075;
    const POREZ = 0.10;
    const NEOPOREZIVO = 25000;

    let neto, bruto, pio, zdr, nez, porez;

    if (type === 'bruto-to-neto') {
        bruto = amount;
        pio = bruto * PIO;
        zdr = bruto * ZDR;
        nez = bruto * NEZ;
        const osnovica = Math.max(0, bruto - pio - zdr - nez - NEOPOREZIVO);
        porez = osnovica * POREZ;
        neto = bruto - pio - zdr - nez - porez;
    } else {
        neto = amount;
        bruto = neto / 0.65;
        for (let i = 0; i < 10; i++) {
            pio = bruto * PIO;
            zdr = bruto * ZDR;
            nez = bruto * NEZ;
            const osnovica = Math.max(0, bruto - pio - zdr - nez - NEOPOREZIVO);
            porez = osnovica * POREZ;
            const netoCalc = bruto - pio - zdr - nez - porez;
            const diff = neto - netoCalc;
            if (Math.abs(diff) < 1) break;
            bruto += diff / 0.65;
        }
        pio = bruto * PIO;
        zdr = bruto * ZDR;
        nez = bruto * NEZ;
        const osnovica = Math.max(0, bruto - pio - zdr - nez - NEOPOREZIVO);
        porez = osnovica * POREZ;
    }

    const label = el('plata-result-label');
    const val = el('res-plata-val');
    if (type === 'bruto-to-neto') {
        if (label) label.innerText = 'Neto plata';
        if (val) val.innerText = money(neto);
    } else {
        if (label) label.innerText = 'Bruto plata';
        if (val) val.innerText = money(bruto);
    }

    const sp = el('stat-plata-pio'); if (sp) sp.innerText = money(pio) + ' RSD';
    const sz = el('stat-plata-zdr'); if (sz) sz.innerText = money(zdr) + ' RSD';
    const spo = el('stat-plata-porez'); if (spo) spo.innerText = money(porez) + ' RSD';

    show('plata-result-box');
    show('plata-stats-row');
}

function calculateVacation() {
    const total = num('odmor-total') || 0;
    const used = num('odmor-used') || 0;
    const daily = num('odmor-daily') || 0;
    const left = Math.max(0, total - used);
    const pay = left * daily;
    const rl = el('res-odmor-left'); if (rl) rl.innerText = left;
    const su = el('stat-odmor-used'); if (su) su.innerText = used + ' dana';
    const sp = el('stat-odmor-pay'); if (sp) sp.innerText = money(pay) + ' RSD';
    show('odmor-result-box');
    show('odmor-stats-row');
}

function calculateNightWork() {
    const hours = num('nocni-hours');
    const rate = num('nocni-rate');
    const multEl = el('nocni-mult');
    const mult = multEl ? parseFloat(multEl.value) : 1.26;
    if (!hours || !rate) { showToast('Unesite sate i satnicu.', 'error'); return; }
    const base = hours * rate;
    const total = hours * rate * mult;
    const bonus = total - base;
    const nt = el('res-nocni-total'); if (nt) nt.innerText = money(total);
    const nb = el('stat-nocni-base'); if (nb) nb.innerText = money(base) + ' RSD';
    const nbo = el('stat-nocni-bonus'); if (nbo) nbo.innerText = money(bonus) + ' RSD';
    show('nocni-result-box');
    show('nocni-stats-row');
}

function calculateOvertime() {
    const hours = num('prek-hours');
    const rate = num('prek-rate');
    if (!hours || !rate) { showToast('Unesite sate i satnicu.', 'error'); return; }
    const first2 = Math.min(hours, 2);
    const rest = Math.max(0, hours - 2);
    const firstPay = first2 * rate * 1.26;
    const restPay = rest * rate * 1.5;
    const total = firstPay + restPay;
    const pt = el('res-prek-total'); if (pt) pt.innerText = money(total);
    const pf = el('stat-prek-first'); if (pf) pf.innerText = money(firstPay) + ' RSD';
    const pr = el('stat-prek-rest'); if (pr) pr.innerText = money(restPay) + ' RSD';
    show('prek-result-box');
    show('prek-stats-row');
}

function calculateTravelExpenses() {
    const days = num('putni-days') || 0;
    const daily = num('putni-daily') || 0;
    const fuel = num('putni-fuel') || 0;
    const hotel = num('putni-hotel') || 0;
    const dailyTotal = days * daily;
    const total = dailyTotal + fuel + hotel;
    const pt = el('res-putni-total'); if (pt) pt.innerText = money(total);
    const pd = el('stat-putni-daily-total'); if (pd) pd.innerText = money(dailyTotal) + ' RSD';
    const pf = el('stat-putni-fuel-total'); if (pf) pf.innerText = money(fuel) + ' RSD';
    const ph = el('stat-putni-hotel-total'); if (ph) ph.innerText = money(hotel) + ' RSD';
    show('putni-result-box');
    show('putni-stats-row');
}

function calculateBonuses() {
    const months = num('bonus-months') || 0;
    const salary = num('bonus-salary') || 0;
    const bonus13 = num('bonus-13th') || 0;
    const regres = num('bonus-regres') || 0;
    const meal = num('bonus-meal') || 0;
    const monthsTotal = months * salary;
    const mealTotal = meal * 12;
    const total = monthsTotal + bonus13 + regres + mealTotal;
    const bt = el('res-bonus-total'); if (bt) bt.innerText = money(total);
    const bm = el('stat-bonus-months-total'); if (bm) bm.innerText = money(monthsTotal) + ' RSD';
    const by = el('stat-bonus-yearly'); if (by) by.innerText = money(total) + ' RSD';
    show('bonus-result-box');
    show('bonus-stats-row');
}

// ================= MUZIKA =================

const NOTES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTES_FLAT  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const SCALE_INTERVALS = {
    major: [0, 2, 4, 5, 7, 9, 11],
    minor: [0, 2, 3, 5, 7, 8, 10],
    harmonic_minor: [0, 2, 3, 5, 7, 8, 11],
    melodic_minor: [0, 2, 3, 5, 7, 9, 11],
    pentatonic_major: [0, 2, 4, 7, 9],
    pentatonic_minor: [0, 3, 5, 7, 10],
    blues: [0, 3, 5, 6, 7, 10],
    dorian: [0, 2, 3, 5, 7, 9, 10],
    phrygian: [0, 1, 3, 5, 7, 8, 10],
    lydian: [0, 2, 4, 6, 7, 9, 11],
    mixolydian: [0, 2, 4, 5, 7, 9, 10],
    locrian: [0, 1, 3, 5, 6, 8, 10]
};

const CHORD_INTERVALS = {
    major: [0, 4, 7],
    minor: [0, 3, 7],
    dim: [0, 3, 6],
    aug: [0, 4, 8],
    sus2: [0, 2, 7],
    sus4: [0, 5, 7],
    '7': [0, 4, 7, 10],
    maj7: [0, 4, 7, 11],
    min7: [0, 3, 7, 10],
    dim7: [0, 3, 6, 9],
    m7b5: [0, 3, 6, 10],
    '6': [0, 4, 7, 9],
    m6: [0, 3, 7, 9],
    '9': [0, 4, 7, 10, 14],
    add9: [0, 4, 7, 14]
};

const INTERVAL_NAMES = [
    'Unison (čista prima)',
    'Mala sekunda',
    'Velika sekunda',
    'Mala terca',
    'Velika terca',
    'Čista kvarta',
    'Tritonus',
    'Čista kvinta',
    'Mala seksta',
    'Velika seksta',
    'Mala septima',
    'Velika septima',
    'Oktava'
];

function noteToSemitone(note) {
    const flats = { 'Db': 1, 'Eb': 3, 'Gb': 6, 'Ab': 8, 'Bb': 10 };
    if (flats[note] !== undefined) return flats[note];
    const idx = NOTES_SHARP.indexOf(note);
    return idx >= 0 ? idx : 0;
}

function semitoneToNote(semi) {
    semi = ((semi % 12) + 12) % 12;
    return NOTES_SHARP[semi];
}

function transposeChord(chord, steps) {
    const match = chord.match(/^([A-G][#b]?)(.*)$/);
    if (!match) return chord;
    const root = match[1];
    const rest = match[2];
    const semi = noteToSemitone(root);
    const newSemi = ((semi + steps) % 12 + 12) % 12;
    return semitoneToNote(newSemi) + rest;
}

function populateNoteSelects() {
    const allNotes = [...NOTES_SHARP];
    const selects = ['trans-orig', 'trans-new', 'scale-root', 'chord-root', 'kapo-orig',
                     'int-note1', 'int-note2', 'freq-note'];
    selects.forEach(id => {
        const sel = el(id);
        if (!sel) return;
        sel.innerHTML = '';
        allNotes.forEach(n => {
            const opt = document.createElement('option');
            opt.value = n;
            opt.textContent = n;
            sel.appendChild(opt);
        });
    });
    const to = el('trans-orig'); if (to) to.value = 'C';
    const tn = el('trans-new'); if (tn) tn.value = 'D';
    const sr = el('scale-root'); if (sr) sr.value = 'C';
    const cr = el('chord-root'); if (cr) cr.value = 'C';
    const ko = el('kapo-orig'); if (ko) ko.value = 'C';
    const i1 = el('int-note1'); if (i1) i1.value = 'C';
    const i2 = el('int-note2'); if (i2) i2.value = 'G';
    const fn = el('freq-note'); if (fn) fn.value = 'A';
}

function calculateTranspose() {
    const origEl = el('trans-orig');
    const newEl = el('trans-new');
    const chordsEl = el('trans-chords');
    if (!origEl || !newEl || !chordsEl) return;

    const orig = origEl.value;
    const newKey = newEl.value;
    const chordsRaw = chordsEl.value.trim();

    if (!chordsRaw) { showToast('Unesite akorde.', 'error'); return; }

    const origSemi = noteToSemitone(orig);
    const newSemi = noteToSemitone(newKey);
    const steps = ((newSemi - origSemi) % 12 + 12) % 12;
    const stepsSigned = steps > 6 ? steps - 12 : steps;

    const chords = chordsRaw.split(/[,\s]+/).filter(c => c);
    const transposed = chords.map(c => transposeChord(c, steps));

    const resultEl = el('res-trans-chords');
    if (resultEl) resultEl.innerText = transposed.join('  ');

    const statEl = el('stat-trans-steps');
    if (statEl) statEl.innerText = (stepsSigned >= 0 ? '+' : '') + stepsSigned + ' polutonova';

    show('trans-result-box');
    show('trans-stats-row');
}

function calculateScale() {
    const rootEl = el('scale-root');
    const typeEl = el('scale-type');
    if (!rootEl || !typeEl) return;

    const root = rootEl.value;
    const type = typeEl.value;
    const intervals = SCALE_INTERVALS[type] || SCALE_INTERVALS.major;
    const rootSemi = noteToSemitone(root);

    const notes = intervals.map(i => semitoneToNote(rootSemi + i));
    const resultEl = el('res-scale-notes');
    if (resultEl) resultEl.innerText = notes.join('  →  ');

    const countEl = el('stat-scale-count');
    if (countEl) countEl.innerText = notes.length;

    const intEl = el('stat-scale-intervals');
    if (intEl) intEl.innerText = intervals.join(', ');

    show('scale-result-box');
    show('scale-stats-row');
}

function calculateChord() {
    const rootEl = el('chord-root');
    const typeEl = el('chord-type');
    if (!rootEl || !typeEl) return;

    const root = rootEl.value;
    const type = typeEl.value;
    const intervals = CHORD_INTERVALS[type] || CHORD_INTERVALS.major;
    const rootSemi = noteToSemitone(root);

    const notes = intervals.map(i => semitoneToNote(rootSemi + i));
    const resultEl = el('res-chord-notes');
    if (resultEl) resultEl.innerText = notes.join('  -  ');

    const formulaEl = el('stat-chord-formula');
    if (formulaEl) formulaEl.innerText = intervals.join(' - ') + ' (polutonova od osnove)';

    show('chord-result-box');
    show('chord-stats-row');
}

function calculateKapo() {
    const origEl = el('kapo-orig');
    const fretEl = el('kapo-fret');
    if (!origEl || !fretEl) return;

    const orig = origEl.value;
    const fret = parseInt(fretEl.value) || 0;

    const origSemi = noteToSemitone(orig);
    const playSemi = ((origSemi - fret) % 12 + 12) % 12;
    const playKey = semitoneToNote(playSemi);

    const keyEl = el('res-kapo-key');
    if (keyEl) keyEl.innerText = playKey;

    const soundEl = el('stat-kapo-sound');
    if (soundEl) soundEl.innerText = orig;

    show('kapo-result-box');
    show('kapo-stats-row');
}

function calculateTempo() {
    const fromEl = el('tempo-from');
    const valEl = el('tempo-val');
    const noteEl = el('tempo-note');
    if (!fromEl || !valEl || !noteEl) return;

    const from = fromEl.value;
    const val = parseNum(valEl.value);
    const noteType = noteEl.value;

    if (!val || val <= 0) { showToast('Unesite vrednost.', 'error'); return; }

    const noteFactors = {
        '1': 4, '2': 2, '4': 1, '8': 0.5,
        '8d': 0.75, '16': 0.25, '16d': 0.375
    };
    const factor = noteFactors[noteType] || 1;

    let result, unit;
    if (from === 'bpm') {
        result = (60000 / val) * factor;
        unit = 'ms';
    } else {
        result = (60000 / val) / factor;
        unit = 'BPM';
    }

    const rv = el('res-tempo-val'); if (rv) rv.innerText = fmt(result, 2);
    const ru = el('res-tempo-unit'); if (ru) ru.innerText = unit;

    show('tempo-result-box');
}

function calculateInterval() {
    const n1El = el('int-note1');
    const n2El = el('int-note2');
    if (!n1El || !n2El) return;

    const n1 = n1El.value;
    const n2 = n2El.value;

    const s1 = noteToSemitone(n1);
    const s2 = noteToSemitone(n2);
    let diff = ((s2 - s1) % 12 + 12) % 12;

    const intervalName = INTERVAL_NAMES[diff] || 'Nepoznat';

    const nameEl = el('res-int-name');
    if (nameEl) nameEl.innerText = intervalName;

    const semisEl = el('stat-int-semitones');
    if (semisEl) semisEl.innerText = diff;

    const typeEl = el('stat-int-type');
    if (typeEl) {
        let tip;
        if (diff === 0) tip = 'Savršen konsonant';
        else if ([3, 4, 8, 9].includes(diff)) tip = 'Konsonant';
        else if ([1, 2, 5, 10, 11].includes(diff)) tip = 'Disonant';
        else tip = 'Tritonus';
        typeEl.innerText = tip;
    }

    show('int-result-box');
    show('int-stats-row');
}

// ================= METRONOM =================

let metronomeState = {
    running: false,
    intervalId: null,
    beat: 0,
    totalBeats: 0
};

function toggleMetronome() {
    const btn = el('metro-btn');
    if (!metronomeState.running) {
        const bpm = parseInt(el('metro-bpm').value) || 120;
        const beatEl = el('metro-beat');
        const beatUnit = beatEl ? parseInt(beatEl.value) : 4;

        if (bpm < 30 || bpm > 300) { showToast('BPM mora biti između 30 i 300.', 'error'); return; }

        const intervalMs = 60000 / bpm;
        metronomeState.running = true;
        metronomeState.beat = 0;
        metronomeState.totalBeats = 0;

        if (btn) {
            btn.textContent = '⏹ Zaustavi Metronom';
            btn.classList.add('active');
        }

        tickMetronome(beatUnit);

        metronomeState.intervalId = setInterval(() => {
            tickMetronome(beatUnit);
        }, intervalMs);

        show('metro-result-box');
        show('metro-stats-row');

        const mv = el('res-metro-val');
        if (mv) mv.innerText = bpm;

    } else {
        metronomeState.running = false;
        if (metronomeState.intervalId) {
            clearInterval(metronomeState.intervalId);
            metronomeState.intervalId = null;
        }
        if (btn) {
            btn.textContent = '▶ Pokreni Metronom';
            btn.classList.remove('active');
        }
    }
}

function tickMetronome(beatUnit) {
    metronomeState.beat = (metronomeState.beat % beatUnit) + 1;
    metronomeState.totalBeats++;

    const isFirst = metronomeState.beat === 1;
    const freq = isFirst ? 1500 : 900;
    const vol = isFirst ? 0.15 : 0.08;

    if (settings.sound) {
        const ctx = getAudio();
        if (ctx) {
            try {
                const t = ctx.currentTime;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(freq, t);
                gain.gain.setValueAtTime(vol, t);
                gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(t);
                osc.stop(t + 0.06);
            } catch (e) {}
        }
    }

    if (isFirst) vibrate(20);

    const cntEl = el('stat-metro-count');
    if (cntEl) cntEl.innerText = metronomeState.totalBeats;
    const taktEl = el('stat-metro-takt');
    if (taktEl) taktEl.innerText = metronomeState.beat + ' / ' + beatUnit;
}

function calculateFrequency() {
    const noteEl = el('freq-note');
    const octaveEl = el('freq-octave');
    if (!noteEl || !octaveEl) return;

    const note = noteEl.value;
    const octave = parseInt(octaveEl.value);

    const semi = noteToSemitone(note);
    const midiNote = (octave + 1) * 12 + semi;
    const freq = 440 * Math.pow(2, (midiNote - 69) / 12);

    const fv = el('res-freq-val'); if (fv) fv.innerText = fmt(freq, 2);

    const fn = el('stat-freq-note');
    if (fn) fn.innerText = note + octave + ' (' + fmt(freq, 2) + ' Hz)';

    show('freq-result-box');
    show('freq-stats-row');
}

function calculateDetectNote() {
    const freq = num('detect-freq');
    if (!freq || freq <= 0) { showToast('Unesite frekvenciju.', 'error'); return; }

    const midiNoteExact = 69 + 12 * Math.log2(freq / 440);
    const midiNote = Math.round(midiNoteExact);
    const octave = Math.floor(midiNote / 12) - 1;
    const semi = midiNote % 12;
    const noteName = NOTES_SHARP[semi];
    const exactFreq = 440 * Math.pow(2, (midiNote - 69) / 12);
    const offset = freq - exactFreq;

    const dn = el('res-detect-note');
    if (dn) dn.innerText = noteName + octave;

    const doEl = el('stat-detect-offset');
    if (doEl) {
        const sign = offset >= 0 ? '+' : '';
        doEl.innerText = sign + fmt(offset, 2) + ' Hz';
        if (Math.abs(offset) < 1) doEl.style.color = '#34d399';
        else if (Math.abs(offset) < 5) doEl.style.color = '#f59e0b';
        else doEl.style.color = '#ef4444';
    }

    const do2 = el('stat-detect-octave');
    if (do2) do2.innerText = octave;

    show('detect-result-box');
    show('detect-stats-row');
}

// ================= ŠTIMER (TUNER) =================

const TUNER_INSTRUMENTS = {
    'guitar-standard': {
        name: 'Gitara — standard',
        strings: [
            { note: 'E', octave: 2, freq: 82.41 },
            { note: 'A', octave: 2, freq: 110.00 },
            { note: 'D', octave: 3, freq: 146.83 },
            { note: 'G', octave: 3, freq: 196.00 },
            { note: 'B', octave: 3, freq: 246.94 },
            { note: 'E', octave: 4, freq: 329.63 }
        ]
    },
    'guitar-dropd': {
        name: 'Gitara — drop D',
        strings: [
            { note: 'D', octave: 2, freq: 73.42 },
            { note: 'A', octave: 2, freq: 110.00 },
            { note: 'D', octave: 3, freq: 146.83 },
            { note: 'G', octave: 3, freq: 196.00 },
            { note: 'B', octave: 3, freq: 246.94 },
            { note: 'E', octave: 4, freq: 329.63 }
        ]
    },
    'guitar-halfdown': {
        name: 'Gitara — half-step down',
        strings: [
            { note: 'Eb', octave: 2, freq: 77.78 },
            { note: 'Ab', octave: 2, freq: 103.83 },
            { note: 'Db', octave: 3, freq: 138.59 },
            { note: 'Gb', octave: 3, freq: 185.00 },
            { note: 'Bb', octave: 3, freq: 233.08 },
            { note: 'Eb', octave: 4, freq: 311.13 }
        ]
    },
    'bass-4': {
        name: 'Bas gitara — 4 žice',
        strings: [
            { note: 'E', octave: 1, freq: 41.20 },
            { note: 'A', octave: 1, freq: 55.00 },
            { note: 'D', octave: 2, freq: 73.42 },
            { note: 'G', octave: 2, freq: 98.00 }
        ]
    },
    'bass-5': {
        name: 'Bas gitara — 5 žica',
        strings: [
            { note: 'B', octave: 0, freq: 30.87 },
            { note: 'E', octave: 1, freq: 41.20 },
            { note: 'A', octave: 1, freq: 55.00 },
            { note: 'D', octave: 2, freq: 73.42 },
            { note: 'G', octave: 2, freq: 98.00 }
        ]
    },
    'ukulele-soprano': {
        name: 'Ukulele — sopran',
        strings: [
            { note: 'G', octave: 4, freq: 392.00 },
            { note: 'C', octave: 4, freq: 261.63 },
            { note: 'E', octave: 4, freq: 329.63 },
            { note: 'A', octave: 4, freq: 440.00 }
        ]
    },
    'ukulele-baritone': {
        name: 'Ukulele — bariton',
        strings: [
            { note: 'D', octave: 3, freq: 146.83 },
            { note: 'G', octave: 3, freq: 196.00 },
            { note: 'B', octave: 3, freq: 246.94 },
            { note: 'E', octave: 4, freq: 329.63 }
        ]
    },
    'mandolin': {
        name: 'Mandolina',
        strings: [
            { note: 'G', octave: 3, freq: 196.00 },
            { note: 'D', octave: 4, freq: 293.66 },
            { note: 'A', octave: 4, freq: 440.00 },
            { note: 'E', octave: 5, freq: 659.25 },
            { note: 'G', octave: 3, freq: 196.00 },
            { note: 'D', octave: 4, freq: 293.66 },
            { note: 'A', octave: 4, freq: 440.00 },
            { note: 'E', octave: 5, freq: 659.25 }
        ]
    },
    'violin': {
        name: 'Violina',
        strings: [
            { note: 'G', octave: 3, freq: 196.00 },
            { note: 'D', octave: 4, freq: 293.66 },
            { note: 'A', octave: 4, freq: 440.00 },
            { note: 'E', octave: 5, freq: 659.25 }
        ]
    },
    'cello': {
        name: 'Violončelo',
        strings: [
            { note: 'C', octave: 2, freq: 65.41 },
            { note: 'G', octave: 2, freq: 98.00 },
            { note: 'D', octave: 3, freq: 146.83 },
            { note: 'A', octave: 3, freq: 220.00 }
        ]
    },
    'banjo': {
        name: 'Banjo — 5 žica',
        strings: [
            { note: 'G', octave: 4, freq: 392.00 },
            { note: 'D', octave: 3, freq: 146.83 },
            { note: 'G', octave: 3, freq: 196.00 },
            { note: 'B', octave: 3, freq: 246.94 },
            { note: 'D', octave: 4, freq: 293.66 }
        ]
    },
    'kontrabas': {
        name: 'Kontrabas',
        strings: [
            { note: 'E', octave: 1, freq: 41.20 },
            { note: 'A', octave: 1, freq: 55.00 },
            { note: 'D', octave: 2, freq: 73.42 },
            { note: 'G', octave: 2, freq: 98.00 }
        ]
    }
};

let tunerOscillator = null;
let tunerGain = null;
let micStream = null;
let micAnalyser = null;
let micSource = null;
let micRunning = false;
let micRafId = null;

function getA4() {
    const a4El = el('tuner-a4');
    const v = a4El ? parseNum(a4El.value) : 440;
    return (v && v > 0) ? v : 440;
}

function renderTunerStrings() {
    const sel = el('tuner-instrument');
    if (!sel) return;
    const inst = TUNER_INSTRUMENTS[sel.value];
    const wrap = el('tuner-strings');
    if (!wrap || !inst) return;

    const a4 = getA4();
    const ratio = a4 / 440;
    wrap.innerHTML = '';

    inst.strings.forEach((s, i) => {
        const freq = s.freq * ratio;
        const btn = document.createElement('button');
        btn.className = 'tuner-string-btn';
        btn.type = 'button';
        btn.innerHTML = `
            <span class="ts-num">${i + 1}. žica</span>
            <span class="ts-note">${s.note}${s.octave}</span>
            <span class="ts-freq">${freq.toFixed(2)} Hz</span>
        `;
        btn.addEventListener('click', () => playTunerTone(freq, btn));
        wrap.appendChild(btn);
    });
}

function playTunerTone(freq, btn) {
    try {
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
            const noteDisplay = el('tuner-note-display');
            if (noteDisplay) noteDisplay.textContent = btn.querySelector('.ts-note').textContent;
            const freqDisplay = el('tuner-freq-display');
            if (freqDisplay) freqDisplay.textContent = freq.toFixed(2) + ' Hz';
        }
        const stopBtn = el('tuner-stop-btn');
        if (stopBtn) stopBtn.style.display = 'block';

        document.querySelectorAll('.tuner-string-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        vibrate(10);
    } catch (e) {
        showToast('Greška pri reprodukciji tona', 'error');
    }
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
    const stopBtn = el('tuner-stop-btn');
    if (stopBtn) stopBtn.style.display = 'none';
    document.querySelectorAll('.tuner-string-btn').forEach(b => b.classList.remove('active'));
}

/* --- Mikrofon + auto-detekcija --- */

async function toggleTunerMic() {
    const btn = el('tuner-mic-btn');
    if (micRunning) {
        stopTunerMic();
        if (btn) btn.textContent = '🎤 Uključi mikrofon';
        return;
    }

    try {
        if (!audioCtx) audioCtx = getAudio();
        if (!audioCtx) throw new Error('AudioContext nije dostupan');
        if (audioCtx.state === 'suspended') await audioCtx.resume();

        micStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false
            }
        });

        micSource = audioCtx.createMediaStreamSource(micStream);
        micAnalyser = audioCtx.createAnalyser();
        micAnalyser.fftSize = 4096;
        micAnalyser.smoothingTimeConstant = 0.6;
        micSource.connect(micAnalyser);

        micRunning = true;
        if (btn) btn.textContent = '⏹ Zaustavi mikrofon';

        const resultEl = el('tuner-mic-result');
        if (resultEl) resultEl.style.display = 'block';

        micLoop();

        vibrate(20);
        playTick(0, 1400, 0.08, 0.03);
    } catch (e) {
        console.error('Mic error:', e);
        showToast('Mikrofon nije dozvoljen ili nedostupan', 'error', 2500);
    }
}

function stopTunerMic() {
    micRunning = false;
    if (micRafId) {
        cancelAnimationFrame(micRafId);
        micRafId = null;
    }
    if (micStream) {
        micStream.getTracks().forEach(t => t.stop());
        micStream = null;
    }
    micSource = null;
    micAnalyser = null;
    const resultEl = el('tuner-mic-result');
    if (resultEl) resultEl.style.display = 'none';
}

function micLoop() {
    if (!micRunning || !micAnalyser) return;

    const buffer = new Float32Array(micAnalyser.fftSize);
    micAnalyser.getFloatTimeDomainData(buffer);

    const freq = autoCorrelate(buffer, audioCtx.sampleRate);

    if (freq > 0) {
        updateTunerDisplay(freq);
    } else {
        // Blago resetovanje
        const detectedNote = el('tuner-detected-note');
        if (detectedNote) detectedNote.textContent = '—';
        const detectedFreq = el('tuner-detected-freq');
        if (detectedFreq) detectedFreq.textContent = '— Hz';
    }

    micRafId = requestAnimationFrame(micLoop);
}

/**
 * Autokorelacija — klasičan algoritam za detekciju osnovne frekvencije.
 * Radi dobro za monofone instrumente (gitara, violina, itd.).
 */
function autoCorrelate(buffer, sampleRate) {
    const SIZE = buffer.length;
    let rms = 0;
    for (let i = 0; i < SIZE; i++) {
        rms += buffer[i] * buffer[i];
    }
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.01) return -1; // previše tiho

    // Trim tišinu sa početka/kraja
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

    // Pronađi prvi "dip" pa maksimum posle njega
    let d = 0;
    while (c[d] > c[d + 1]) d++;
    let maxval = -1, maxpos = -1;
    for (let i = d; i < newSize; i++) {
        if (c[i] > maxval) {
            maxval = c[i];
            maxpos = i;
        }
    }

    let T0 = maxpos;

    // Parabolična interpolacija za precizniju frekvenciju
    const x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
    const a = (x1 + x3 - 2 * x2) / 2;
    const b = (x3 - x1) / 2;
    if (a) T0 = T0 - b / (2 * a);

    return sampleRate / T0;
}

function updateTunerDisplay(freq) {
    const midiNoteExact = 69 + 12 * Math.log2(freq / 440);
    const midiNote = Math.round(midiNoteExact);
    const octave = Math.floor(midiNote / 12) - 1;
    const semi = ((midiNote % 12) + 12) % 12;
    const noteName = NOTES_SHARP[semi];

    const exactFreq = 440 * Math.pow(2, (midiNote - 69) / 12);
    const cents = Math.round(1200 * Math.log2(freq / exactFreq));

    const detectedNote = el('tuner-detected-note');
    if (detectedNote) detectedNote.textContent = noteName + octave;

    const detectedFreq = el('tuner-detected-freq');
    if (detectedFreq) detectedFreq.textContent = freq.toFixed(2) + ' Hz';

    // Pomeri marker na cents skali (-50 do +50)
    const marker = el('tuner-cents-marker');
    if (marker) {
        const clamped = Math.max(-50, Math.min(50, cents));
        const percent = 50 + (clamped / 50) * 45; // 5% do 95%
        marker.style.left = percent + '%';

        // Boja prema tačnosti
        if (Math.abs(cents) < 5) {
            marker.style.background = '#34d399';
        } else if (Math.abs(cents) < 15) {
            marker.style.background = '#f59e0b';
        } else {
            marker.style.background = '#ef4444';
        }
    }

    const centsLabel = el('tuner-cents-label');
    if (centsLabel) {
        const sign = cents > 0 ? '+' : '';
        centsLabel.textContent = sign + cents + ' centi';
        centsLabel.classList.remove('ok', 'close', 'far');
        if (Math.abs(cents) < 5) centsLabel.classList.add('ok');
        else if (Math.abs(cents) < 15) centsLabel.classList.add('close');
        else centsLabel.classList.add('far');
    }
}

// ================= FX DUGMAD (zvuk, vibracija) =================

function makeFxButton(key, title) {
    const btn = document.createElement('button');
    btn.className = 'icon-btn icon-btn-svg';
    btn.title = title;
    btn.setAttribute('aria-label', title);

    const svgSound = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>';
    const svgSoundOff = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>';
    const svgHaptic = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="2" width="8" height="20" rx="2"/><path d="M4 8v8"/><path d="M20 8v8"/></svg>';
    const svgHapticOff = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="2" width="8" height="20" rx="2" opacity="0.4"/><line x1="3" y1="3" x2="21" y2="21"/></svg>';

    function render() {
        if (key === 'sound') btn.innerHTML = settings.sound ? svgSound : svgSoundOff;
        else btn.innerHTML = settings.haptic ? svgHaptic : svgHapticOff;
    }

    btn.addEventListener('click', function () {
        settings[key] = !settings[key];
        saveSettings();
        render();
        updateSettingsUI();
        if (settings[key]) {
            if (key === 'sound') playTick(0, 1500, 0.08, 0.03);
            else vibrate(30);
        }
    });

    render();
    return btn;
}

function setupFxButtons() {
    const row = document.querySelector('.header-actions');
    const themeBtn = el('theme-toggle');
    if (!row || !themeBtn) return;
    if (row.querySelector('.fx-btn-wrap')) return;
    const wrap = document.createElement('div');
    wrap.className = 'fx-btn-wrap';
    wrap.style.display = 'flex';
    wrap.style.alignItems = 'center';
    wrap.style.gap = '2px';
    wrap.appendChild(makeFxButton('sound', 'Zvuk'));
    wrap.appendChild(makeFxButton('haptic', 'Vibracija'));
    row.insertBefore(wrap, themeBtn);
    wrap.appendChild(themeBtn);
}

// ================= GLOBALNI LISTENERI =================

document.addEventListener('click', function (e) {
    const target = e.target.closest('.card, .tab, .calc-btn-main, .back-btn, .swap-btn, .copy-btn, .icon-btn, .settings-toggle-btn, .favorite-chip, .qsr-item, .openings-add-btn, .fx-refresh-btn, .fx-swap-btn, .copy-btn-mini, .lista-clear-btn, .tuner-string-btn');
    if (!target) return;
    playTick(0, 1500, 0.07, 0.02);

    if (target.classList.contains('card')) {
        vibrate([40, 15, 40]);
    } else if (target.classList.contains('tab')) {
        vibrate(35);
    } else if (target.classList.contains('calc-btn-main')) {
        vibrate([30, 20, 60]);
    } else {
        vibrate(PULSE_MS);
    }
}, true);

document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' || e.target.tagName !== 'INPUT') return;
    if (e.target.id === 'home-search') return;
    if (e.target.id === 'history-search') return;
    if (e.target.classList.contains('date-part')) return;
    if (e.target.id === 'lista-name' || e.target.id === 'lista-qty' || e.target.id === 'lista-price') {
        e.preventDefault();
        addShoppingItem();
        return;
    }
    const tab = e.target.closest('.sub-tab-content');
    const btn = tab && tab.querySelector('.calc-btn-main');
    if (btn) { e.preventDefault(); e.target.blur(); btn.click(); }
});

document.addEventListener('change', function (e) {
    if (e.target.id === 'spoon-ingredient') {
        const w = el('spoon-custom-wrap');
        if (w) w.style.display = e.target.value === 'custom' ? 'flex' : 'none';
    }
    if (e.target.id === 'cup-type') {
        const w = el('cup-custom-wrap');
        if (w) w.style.display = e.target.value === 'custom' ? 'flex' : 'none';
    }
    if (e.target.id === 'promo-type') {
        const w = el('promo-second-wrap');
        if (w) w.style.display = e.target.value === 'second' ? 'flex' : 'none';
    }
    if (e.target.id === 'tuner-instrument') {
        renderTunerStrings();
    }
});

// ================= POKRETANJE =================

function initApp() {
    try {
        // Tema
        const savedTheme = localStorage.getItem('cx_theme');
        if (savedTheme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
            const tt = el('theme-toggle');
            if (tt) tt.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>';
        } else if (!savedTheme && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            document.documentElement.setAttribute('data-theme', 'light');
            const tt = el('theme-toggle');
            if (tt) tt.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>';
        }

        // Cene goriva
        const savedPrice = localStorage.getItem('cx_fuel_price');
        const p1 = el('price'); if (savedPrice && p1) p1.value = savedPrice;
        const p2 = el('road-price'); if (savedPrice && p2) p2.value = savedPrice;

        // Valuta
        const savedCurrency = localStorage.getItem('cx_default_currency');
        const ac = el('auto-currency'); if (savedCurrency && ac) ac.value = savedCurrency;

        // Profil auta
        const profile = loadAutoProfile();
        const apm = el('auto-profile-model');
        const app = el('auto-profile-plate');
        if (profile.model && apm) apm.value = profile.model;
        if (profile.plate && app) app.value = profile.plate;
        if (profile.regDate) setTripleDate('auto-profile-reg-date', profile.regDate);
        if (profile.tehDate) setTripleDate('auto-profile-teh-date', profile.tehDate);
    } catch (e) { console.error('init load error:', e); }

    // Današnji datum u prazna date-triple polja
    const today = new Date();
    const iso = today.getFullYear() + '-' +
        String(today.getMonth() + 1).padStart(2, '0') + '-' +
        String(today.getDate()).padStart(2, '0');

    ['end-date', 'shift-date', 'workdays-start', 'dayofweek-date'].forEach(id => {
        const wrap = document.querySelector(`.date-triple[data-date-id="${id}"]`);
        if (!wrap) return;
        const dayIn = wrap.querySelector('.date-day');
        if (dayIn && !dayIn.value) setTripleDate(id, iso);
    });

    try { setupDateTriples(); } catch (e) {}
    try { updateAutoStatus(); } catch (e) {}
    try { updateAutoTitle(); } catch (e) {}
    try { renderFuelHistory(); } catch (e) {}
    try { renderPowerDevices(); } catch (e) {}
    try { updatePowerTotal(); } catch (e) {}
    try { populateNoteSelects(); } catch (e) {}
    try { setupFxButtons(); } catch (e) {}
    try { setupCardReorder(); } catch (e) {}
    try { setupRipple(); } catch (e) {}
    try { updateSettingsUI(); } catch (e) {}

    try { setupTabDrag(); } catch (e) { console.error('setupTabDrag:', e); }
    try { applyTabOrder(); } catch (e) {}

    // Kursna lista — učitaj iz keša, pa ako je staro, osveži
    try {
        loadFxRates();
        populateCurrencySelects();
        renderFxList();
        updateFxUpdatedLabel();
    } catch (e) { console.error('init valuta error:', e); }

    try {
        updateAllStars();
        renderFavorites();
    } catch (e) { console.error('init favorites error:', e); }

    try { renderShoppingList(); } catch (e) { console.error('init lista error:', e); }

    try { renderHistoryPreview(); } catch (e) { console.error('init history preview error:', e); }

    // PAMĆENJE UNOSA — učitaj keš i postavi listenere
    try {
        loadInputCache();
        // Restore za trenutno aktivni ekran (home je default, ali restore sve)
        restoreInputsFor(document);
        setupInputPersistence();
    } catch (e) { console.error('init inputs error:', e); }

    // Štimer — renderuj žice za default instrument
    try { renderTunerStrings(); } catch (e) {}

    // ANDROID BACK
    try { setupBackButton(); } catch (e) { console.error('setupBackButton:', e); }

    document.title = 'Alatika — Mali alat za velika računanja';

    // Splash screen
    setTimeout(() => {
        const splash = el('splash-screen');
        if (splash) {
            splash.classList.add('hide');
            setTimeout(() => { if (splash.parentNode) splash.remove(); }, 400);
        }
        try { maybeShowDragTip(); } catch (e) {}
        try { maybeShowDragHint(); } catch (e) {}
    }, 500);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
