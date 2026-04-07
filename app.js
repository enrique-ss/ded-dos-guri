/**
 * RPG dos Guri – Engine v9.1
 * Ouro, pontos de atributo distribuíveis, nível máximo 10.
 */

// ==================== SYSTEM DATA ====================
const RACES = {
    humano:    { name: 'Humano',     bonus: '+1 em Tudo',              mods: { for: 1, agi: 1, men: 1, soc: 1 } },
    elfo:      { name: 'Elfo',       bonus: '+2 INT, +1 AGI, -1 FOR',  mods: { for:-1, agi: 1, men: 2, soc: 0 } },
    anao:      { name: 'Anão',       bonus: '+2 FOR, -1 AGI',          mods: { for: 2, agi:-1, men: 0, soc: 0 } },
    qareen:    { name: 'Qareen',     bonus: '+2 CAR, +1 INT',          mods: { for: 0, agi: 0, men: 1, soc: 2 } },
    lefou:     { name: 'Lefou',      bonus: '+2 FOR, +1 AGI, -1 CAR',  mods: { for: 2, agi: 1, men: 0, soc:-1 } },
    minotauro: { name: 'Minotauro',  bonus: '+2 FOR, -1 INT',          mods: { for: 2, agi: 0, men:-1, soc: 0 } },
    golem:     { name: 'Golem',      bonus: '+2 FOR, -1 AGI',          mods: { for: 2, agi:-1, men: 0, soc: 0 } },
    silfide:   { name: 'Sílfide',    bonus: '+2 CAR, +1 INT, -2 FOR',  mods: { for:-2, agi: 1, men: 1, soc: 2 } },
    trog:      { name: 'Trog',       bonus: '+1 FOR, +1 AGI, -1 INT',  mods: { for: 1, agi: 1, men:-1, soc:-1 } },
    osteon:    { name: 'Osteon',     bonus: '+1 AGI, INT, CAR',         mods: { for: 0, agi: 1, men: 1, soc: 1 } },
    hynne:     { name: 'Hynne',      bonus: '+2 AGI, +1 CAR, -1 FOR',  mods: { for:-1, agi: 2, men: 0, soc: 1 } },
    aggelus:   { name: 'Aggelus',    bonus: '+1 CAR, +1 INT, +1 FOR',  mods: { for: 1, agi: 0, men: 1, soc: 1 } },
    sulfure:   { name: 'Sulfure',    bonus: '+2 FOR, +1 CAR, -1 INT',  mods: { for: 2, agi: 0, men:-1, soc: 1 } },
    kliren:    { name: 'Kliren',     bonus: '+2 INT, +1 CAR, -1 FOR',  mods: { for:-1, agi: 0, men: 2, soc: 1 } },
    sereia:    { name: 'Sereia',     bonus: '+2 CAR, -1 FOR, +1 AGI',  mods: { for:-1, agi: 1, men: 0, soc: 2 } }
};

const CLASSES = {
    guerreiro: { name: 'Guerreiro',  hp: 20, mp: 5,  mod: 'for', bonus: '+1 FOR / Tanque' },
    mago:      { name: 'Mago',       hp: 8,  mp: 20, mod: 'men', bonus: '+1 INT / Magias' },
    ladino:    { name: 'Ladino',     hp: 12, mp: 10, mod: 'agi', bonus: '+1 AGI / Furtivo' },
    clerigo:   { name: 'Clérigo',    hp: 16, mp: 15, mod: 'men', bonus: '+1 INT / Divino' },
    barbaro:   { name: 'Bárbaro',    hp: 24, mp: 3,  mod: 'for', bonus: '+1 FOR / Fúria' },
    paladino:  { name: 'Paladino',   hp: 20, mp: 10, mod: 'soc', bonus: '+1 CAR / Sagrado' },
    druida:    { name: 'Druida',     hp: 16, mp: 15, mod: 'men', bonus: '+1 INT / Forma' },
    bardo:     { name: 'Bardo',      hp: 12, mp: 15, mod: 'soc', bonus: '+1 CAR / Inspirar' },
    cacador:   { name: 'Caçador',    hp: 16, mp: 10, mod: 'agi', bonus: '+1 AGI / Rastrear' },
    inventor:  { name: 'Inventor',   hp: 12, mp: 15, mod: 'men', bonus: '+1 INT / Engenhocas' },
    monge:     { name: 'Monge',      hp: 14, mp: 12, mod: 'agi', bonus: '+1 AGI / Marcial' },
    feiticeiro:{ name: 'Feiticeiro', hp: 10, mp: 18, mod: 'soc', bonus: '+1 CAR / Inato' },
    cavaleiro: { name: 'Cavaleiro',  hp: 22, mp: 5,  mod: 'for', bonus: '+1 FOR / Montaria' },
    arcanista: { name: 'Arcanista',  hp: 8,  mp: 22, mod: 'men', bonus: '+1 INT / Ritual' },
    nobre:     { name: 'Nobre',      hp: 14, mp: 12, mod: 'soc', bonus: '+1 CAR / Liderança' }
};

const PERSONALITIES = {
    corajoso:   { name: 'Corajoso',    bonus: '+1 FOR',      mods: { for: 1 } },
    sabio:      { name: 'Sábio',       bonus: '+1 INT',      mods: { men: 1 } },
    astuto:     { name: 'Astuto',      bonus: '+1 AGI',      mods: { agi: 1 } },
    carismatico:{ name: 'Carismático', bonus: '+1 CAR',      mods: { soc: 1 } },
    resiliente: { name: 'Resiliente',  bonus: '+5 PV Extra', hpBonus: 5 },
    misterioso: { name: 'Misterioso',  bonus: '+1 INT, +1 AGI, -1 FOR', mods: { men: 1, agi: 1, for: -1 } },
    feroz:      { name: 'Feroz',       bonus: '+2 FOR, -1 CAR',  mods: { for: 2, soc: -1 } },
    gentil:     { name: 'Gentil',      bonus: '+2 CAR, -1 FOR',  mods: { soc: 2, for: -1 } }
};

const STORAGE_KEY = 'questpad_v9.1';
const MAX_LEVEL = 10;

// ==================== STATE ====================
let state = getDefaultState();

// Temporário: pontos sendo distribuídos no wizard (step 4)
let wizardDist = { for: 0, agi: 0, men: 0, soc: 0 };
let wizardFreePoints = 4;
let wizardGold = 0;
let wizardGoldRolled = false;

function getDefaultState() {
    return {
        isCreated: false,
        name: '', race: '', cls: '', personality: '', history: '',
        level: 1, photoData: '',
        gold: 0,
        freePoints: 0,   // pontos de atributo disponíveis no jogo
        hp: { current: 10, max: 10 },
        mp: { current: 10, max: 10 },
        attr: { for: 0, agi: 0, men: 0, soc: 0 },
        baseAttr: { for: 0, agi: 0, men: 0, soc: 0 },  // piso (raça+classe+personalidade)
        abilities: '', inventory: '',
        logs: []
    };
}

// ==================== PERSISTENCE ====================
function loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
        try { state = JSON.parse(raw); } catch (e) { /* ignore */ }
        return;
    }
    // Migração
    for (const key of ['questpad_v9', 'questpad_v8.3', 'questpad_v8.2', 'questpad_v8']) {
        const legacy = localStorage.getItem(key);
        if (legacy) {
            try {
                const old = JSON.parse(legacy);
                state.isCreated = old.isCreated || false;
                state.name = old.name || '';
                state.race = old.race || '';
                state.cls = old.class || old.cls || '';
                state.personality = old.personality || '';
                state.history = old.history || '';
                state.level = old.level || 1;
                state.photoData = old.photoPath || old.photoData || '';
                state.gold = old.gold || 0;
                state.freePoints = old.freePoints || 0;
                state.hp = old.hp || { current: 10, max: 10 };
                state.mp = old.mp || { current: 10, max: 10 };
                state.attr = old.attributes || old.attr || { for: 0, agi: 0, men: 0, soc: 0 };
                state.abilities = old.abilities || '';
                state.inventory = old.inventory || '';
                state.logs = old.logs || [];
                saveState();
            } catch (e) { /* ignore */ }
            return;
        }
    }
}

function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function addLog(msg) {
    const d = new Date();
    const t = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    state.logs.unshift({ t, msg });
    if (state.logs.length > 50) state.logs.length = 50;
}

// ==================== RENDER ====================
function render() {
    const creation = document.getElementById('creation-screen');
    const sheet = document.getElementById('sheet-view');

    if (!state.isCreated) {
        creation.classList.add('active');
        sheet.classList.add('hidden');
    } else {
        creation.classList.remove('active');
        sheet.classList.remove('hidden');
        renderSheet();
    }
}

function renderSheet() {
    const $ = id => document.getElementById(id);

    // Info
    $('display-name').textContent = state.name || '---';
    $('display-level').textContent = state.level;
    $('display-race').textContent = RACES[state.race]?.name || '---';
    $('display-class').textContent = CLASSES[state.cls]?.name || '---';
    $('display-personality').textContent = PERSONALITIES[state.personality]?.name || '---';
    $('display-history').textContent = state.history;
    $('display-gold').textContent = '💰 ' + state.gold;

    // Free points
    $('display-free-points').textContent = state.freePoints;

    // Avatar
    if (state.photoData) {
        $('char-avatar').style.backgroundImage = `url(${state.photoData})`;
    }

    // Bars
    const hpPct = state.hp.max > 0 ? (state.hp.current / state.hp.max) * 100 : 0;
    const mpPct = state.mp.max > 0 ? (state.mp.current / state.mp.max) * 100 : 0;
    $('hp-fill').style.width = hpPct + '%';
    $('mp-fill').style.width = mpPct + '%';
    $('hp-val').textContent = `${state.hp.current}/${state.hp.max}`;
    $('mp-val').textContent = `${state.mp.current}/${state.mp.max}`;

    // Controls
    $('hp-current').textContent = state.hp.current;
    $('mp-current').textContent = state.mp.current;
    $('gold-current').textContent = state.gold;

    // Attributes
    $('attr-for').textContent = state.attr.for;
    $('attr-agi').textContent = state.attr.agi;
    $('attr-men').textContent = state.attr.men;
    $('attr-soc').textContent = state.attr.soc;

    // Textareas (only if not focused)
    const abEl = $('abilities');
    const invEl = $('inventory');
    if (document.activeElement !== abEl) abEl.value = state.abilities;
    if (document.activeElement !== invEl) invEl.value = state.inventory;

    // Log
    $('history-log').innerHTML = state.logs.map(l =>
        `<div><span>[${l.t}]</span> ${l.msg}</div>`
    ).join('');
}

// ==================== WIZARD ====================
function buildGrids() {
    fillGrid('race-grid', RACES, 'race');
    fillGrid('class-grid', CLASSES, 'cls');
    fillGrid('personality-grid', PERSONALITIES, 'personality');
}

function fillGrid(containerId, dataObj, stateKey) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = Object.entries(dataObj).map(([id, item]) => `
        <div class="choice-card" data-key="${stateKey}" data-id="${id}">
            <strong>${item.name}</strong>
            ${item.bonus ? `<small>${item.bonus}</small>` : ''}
        </div>
    `).join('');
}

function goToStep(n) {
    document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('active'));
    const target = document.getElementById('step-' + n);
    if (target) target.classList.add('active');

    // Ao entrar no step 4: preparar distribuição (ouro só gera ao clicar no botão)
    if (n === 4) {
        wizardGold = 0;
        wizardGoldRolled = false;
        wizardDist = { for: 0, agi: 0, men: 0, soc: 0 };
        wizardFreePoints = 4;
        renderWizardStep4();
    }
}

function renderWizardStep4() {
    document.getElementById('create-free-points').textContent = wizardFreePoints;
    document.getElementById('create-gold').textContent = wizardGoldRolled ? wizardGold : '???';
    document.getElementById('dist-for').textContent = wizardDist.for;
    document.getElementById('dist-agi').textContent = wizardDist.agi;
    document.getElementById('dist-men').textContent = wizardDist.men;
    document.getElementById('dist-soc').textContent = wizardDist.soc;

    const rollBtn = document.getElementById('btn-roll-gold');
    if (rollBtn) rollBtn.style.display = wizardGoldRolled ? 'none' : 'inline-block';
}

function wizardDistribute(attr, dir) {
    if (dir === 1) {
        if (wizardFreePoints <= 0) return;
        wizardDist[attr]++;
        wizardFreePoints--;
    } else {
        if (wizardDist[attr] <= 0) return;
        wizardDist[attr]--;
        wizardFreePoints++;
    }
    renderWizardStep4();
}

// ==================== FINISH CREATION ====================
function finishCreation() {
    state.name = document.getElementById('create-name').value.trim() || 'Herói Sem Nome';
    state.history = document.getElementById('create-history').value.trim();

    if (!state.race || !state.cls || !state.personality) {
        alert('Escolha sua Raça, Classe e Personalidade!');
        return;
    }

    const race = RACES[state.race];
    const cls = CLASSES[state.cls];
    const pers = PERSONALITIES[state.personality];

    // 1) Calcula base (raça + classe + personalidade) — define o piso
    state.baseAttr = { for: 0, agi: 0, men: 0, soc: 0 };
    for (const k of ['for', 'agi', 'men', 'soc']) {
        state.baseAttr[k] += (race.mods[k] || 0);
    }
    state.baseAttr[cls.mod] += 1;
    if (pers.mods) {
        for (const k of Object.keys(pers.mods)) {
            state.baseAttr[k] = (state.baseAttr[k] || 0) + pers.mods[k];
        }
    }

    // 2) Atributos totais = base + pontos distribuídos no wizard
    state.attr = { ...state.baseAttr };
    for (const k of ['for', 'agi', 'men', 'soc']) {
        state.attr[k] += (wizardDist[k] || 0);
    }

    // HP / MP
    state.hp.max = cls.hp + (pers.hpBonus || 0);
    state.hp.current = state.hp.max;
    state.mp.max = cls.mp;
    state.mp.current = state.mp.max;

    // Ouro
    state.gold = wizardGold;

    // Sem pontos livres restantes da criação (todos foram usados no step 4)
    state.freePoints = 0;

    state.isCreated = true;
    addLog(`${state.name} despertou como ${cls.name} ${race.name}!`);
    addLog(`💰 Ouro inicial: ${state.gold}`);
    saveState();
    render();
}

// ==================== GAME ACTIONS ====================
function changeStat(stat, delta) {
    const s = state[stat];
    if (!s) return;
    const old = s.current;
    s.current = Math.max(0, Math.min(s.max, s.current + delta));
    if (old !== s.current) {
        addLog(`${stat.toUpperCase()} ${old} → ${s.current}`);
        saveState();
        render();
    }
}

function changeGold(delta) {
    const old = state.gold;
    state.gold = Math.max(0, state.gold + delta);
    if (old !== state.gold) {
        addLog(`💰 Ouro: ${old} → ${state.gold}`);
        saveState();
        render();
    }
}

function changeAttr(attr, dir) {
    const base = (state.baseAttr && state.baseAttr[attr]) || 0;
    if (dir === 1) {
        // Gastar ponto livre
        if (state.freePoints <= 0) return;
        state.attr[attr]++;
        state.freePoints--;
        addLog(`⭐ +1 ${attr.toUpperCase()} (ponto livre)`);
    } else {
        // Não pode ir abaixo do base (raça+classe+personalidade)
        if (state.attr[attr] <= base) return;
        state.attr[attr]--;
        state.freePoints++;
        addLog(`⭐ -1 ${attr.toUpperCase()} (ponto devolvido)`);
    }
    saveState();
    render();
}

function changeLevel(delta) {
    const newLvl = state.level + delta;
    if (newLvl < 1 || newLvl > MAX_LEVEL) return;

    state.level = newLvl;
    state.hp.max += delta * 5;
    if (state.hp.max < 1) state.hp.max = 1;
    state.hp.current = Math.min(state.hp.current, state.hp.max);

    if (delta > 0) {
        state.freePoints += 1;
        addLog(`⬆️ Subiu para NVL ${state.level} (+1 ponto de atributo)`);
    } else {
        // Ao descer de nível, remove 1 ponto livre (se tiver)
        if (state.freePoints > 0) state.freePoints--;
        addLog(`⬇️ Desceu para NVL ${state.level}`);
    }
    saveState();
    render();
}

function showTab(tabId) {
    document.querySelectorAll('.tab-pane').forEach(t => t.classList.remove('active'));
    const pane = document.getElementById('tab-' + tabId);
    if (pane) pane.classList.add('active');

    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const activeBtn = document.querySelector(`.nav-btn[data-tab="${tabId}"]`);
    if (activeBtn) activeBtn.classList.add('active');
}

function resetAll() {
    if (!confirm('Apagar este herói e recomeçar do zero?')) return;
    Object.keys(localStorage).forEach(k => {
        if (k.startsWith('questpad_')) localStorage.removeItem(k);
    });
    location.reload();
}

// ==================== EVENT DELEGATION ====================
function setupEvents() {
    document.body.addEventListener('click', (e) => {
        const t = e.target;

        // Choice cards
        const card = t.closest('.choice-card');
        if (card) {
            const key = card.dataset.key;
            const id = card.dataset.id;
            if (key && id) {
                state[key] = id;
                card.parentElement.querySelectorAll('.choice-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
            }
            return;
        }

        // Wizard distribution buttons
        const distBtn = t.closest('.dist-btn');
        if (distBtn) {
            const attr = distBtn.dataset.dist;
            const dir = parseInt(distBtn.dataset.dir);
            if (attr) wizardDistribute(attr, dir);
            return;
        }

        // Wizard steps
        if (t.closest('#btn-step-2')) { goToStep(2); return; }
        if (t.closest('#btn-step-3')) { goToStep(3); return; }
        if (t.closest('#btn-step-4')) { goToStep(4); return; }
        if (t.closest('#btn-back-1')) { goToStep(1); return; }
        if (t.closest('#btn-back-2')) { goToStep(2); return; }
        if (t.closest('#btn-back-3')) { goToStep(3); return; }
        if (t.closest('#btn-finish')) { finishCreation(); return; }

        // Gerar Ouro
        if (t.closest('#btn-roll-gold')) {
            wizardGold = Math.floor(Math.random() * 101);
            wizardGoldRolled = true;
            renderWizardStep4();
            return;
        }

        // Dashboard actions
        if (t.closest('#btn-level-up')) { changeLevel(1); return; }
        if (t.closest('#btn-level-down')) { changeLevel(-1); return; }
        if (t.closest('#btn-reset')) { resetAll(); return; }

        // Attribute +/- buttons
        const attrBtn = t.closest('.attr-btn');
        if (attrBtn) {
            const attr = attrBtn.dataset.attr;
            const dir = parseInt(attrBtn.dataset.dir);
            if (attr) changeAttr(attr, dir);
            return;
        }

        // Stat +/- buttons (PV/PM)
        const ctlBtn = t.closest('.ctl-btn');
        if (ctlBtn) {
            // Gold
            if (ctlBtn.dataset.gold !== undefined) {
                changeGold(parseInt(ctlBtn.dataset.gold));
                return;
            }
            // PV/PM
            const stat = ctlBtn.dataset.stat;
            const delta = parseInt(ctlBtn.dataset.delta);
            if (stat) changeStat(stat, delta);
            return;
        }

        // Nav tabs
        const navBtn = t.closest('.nav-btn');
        if (navBtn) {
            const tabId = navBtn.dataset.tab;
            if (tabId) showTab(tabId);
            return;
        }

        // Dice
        if (t.closest('#roll-d20')) {
            const res = Math.floor(Math.random() * 20) + 1;
            addLog(`🎲 d20 → ${res}`);
            document.getElementById('dice-result').textContent = res;
            document.getElementById('dice-overlay').style.display = 'flex';
            saveState();
            render();
            return;
        }

        // Close dice
        if (t.closest('#btn-close-dice') || t.id === 'dice-overlay') {
            document.getElementById('dice-overlay').style.display = 'none';
            return;
        }

        // Photo upload trigger
        if (t.closest('#photo-preview') || t.closest('.photo-box')) {
            document.getElementById('create-photo').click();
            return;
        }
    });

    // Textarea sync
    ['abilities', 'inventory'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('input', () => {
            state[id] = el.value;
            saveState();
        });
    });

    // Photo file
    const photoEl = document.getElementById('create-photo');
    if (photoEl) {
        photoEl.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                state.photoData = ev.target.result;
                const preview = document.getElementById('photo-preview');
                if (preview) preview.innerHTML = `<img src="${state.photoData}">`;
            };
            reader.readAsDataURL(file);
        });
    }
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    buildGrids();
    setupEvents();
    render();
});
