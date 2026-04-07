/**
 * RPG dos Guri – Engine v10.0
 * D&D 5e-style character sheet with Master Mode.
 */

// ==================== SYSTEM DATA ====================
const RACES = {
    humano: { name: 'Humano', modsDesc: '+1 em 3 atributos à escolha', feature: 'Aprendiz Rápido: Ganha 1 Talento (Feat) no nível 1.', speed: 9 },
    elfo: { name: 'Elfo', modsDesc: '+2 Destreza, +1 Inteligência', feature: 'Sentido Aguçado: Visão no escuro e imunidade a sono mágico.', speed: 9 },
    anao: { name: 'Anão', modsDesc: '+2 Constituição, +1 Força', feature: 'Resiliência: Resistência a veneno e +1 PV por nível.', speed: 7.5 },
    halfling: { name: 'Halfling', modsDesc: '+2 Destreza, +1 Carisma', feature: 'Sorte: Pode relançar qualquer resultado "1" no dado.', speed: 7.5 },
    meio_elfo: { name: 'Meio-Elfo', modsDesc: '+2 Carisma, +1 em outros 2', feature: 'Versatilidade: Proficiência em 2 perícias extras.', speed: 9 },
    meio_orc: { name: 'Meio-Orc', modsDesc: '+2 Força, +1 Constituição', feature: 'Tenacidade: Se cair a 1 HP, consegue se levantar e dar um ultimo ataque antes de desmaiar.', speed: 9 },
    tiefling: { name: 'Tiefling', modsDesc: '+2 Carisma, +1 Inteligência', feature: 'Legado: Resistência a fogo e 1 Truque mágico (Cantrip).', speed: 9 },
    gnomo: { name: 'Gnomo', modsDesc: '+2 Inteligência, +1 Const.', feature: 'Mente Astuta: Vantagem em salvaguardas mentais contra magia.', speed: 7.5 }
};

const CLASSES = {
    guerreiro: { name: 'Guerreiro', hp: 10, saves: ['for', 'con'], hd: '1d10', armor: 'Todas as armaduras, escudos, armas simples e marciais.', skillsDesc: 'Escolha 2: Acrobacia, Adestrar Animais, Atletismo, História, Intuição, Intimidação, Percepção e Sobrevivência.' },
    ladino: { name: 'Ladino', hp: 8, saves: ['des', 'int'], hd: '1d8', armor: 'Armaduras leves, armas simples, bestas de mão, espadas curtas, rapieiras e espadas longas.', skillsDesc: 'Escolha 4: Acrobacia, Atletismo, Atuação, Enganação, Furtividade, Intimidação... +Ferramentas de Ladrão.' },
    mago: { name: 'Mago', hp: 6, saves: ['int', 'sab'], hd: '1d6', armor: 'Adagas, dardos, fundas, bordões e bestas leves. (Nenhuma armadura).', skillsDesc: 'Escolha 2: Arcanismo, História, Investigação, Medicina e Religião.' },
    clerigo: { name: 'Clérigo', hp: 8, saves: ['sab', 'car'], hd: '1d8', armor: 'Armaduras leves e médias, escudos e armas simples.', skillsDesc: 'Escolha 2: História, Intuição, Medicina, Persuasão e Religião.' },
    paladino: { name: 'Paladino', hp: 10, saves: ['sab', 'car'], hd: '1d10', armor: 'Todas as armaduras, escudos, armas simples e marciais.', skillsDesc: 'Escolha 2: Atletismo, Intuição, Intimidação, Medicina, Persuasão e Religião.' },
    barbaro: { name: 'Bárbaro', hp: 12, saves: ['for', 'con'], hd: '1d12', armor: 'Armaduras leves e médias, escudos, armas simples e marciais.', skillsDesc: 'Escolha 2: Adestrar Animais, Atletismo, Intimidação, Natureza, Percepção e Sobrevivência.' },
    bardo: { name: 'Bardo', hp: 8, saves: ['des', 'car'], hd: '1d8', armor: 'Armaduras leves, armas simples, bestas, espadas. +3 Instrumentos.', skillsDesc: 'Escolha 3 quaisquer (O Bardo é o "pau para toda obra").' },
    patrulheiro: { name: 'Patrulheiro', hp: 10, saves: ['for', 'des'], hd: '1d10', armor: 'Armaduras leves e médias, escudos, armas simples e marciais.', skillsDesc: 'Escolha 3: Adestrar Animais, Atletismo, Intuição, Investigação, Natureza... Furtividade.' },
    feiticeiro: { name: 'Feiticeiro', hp: 6, saves: ['con', 'car'], hd: '1d6', armor: 'Adagas, dardos, fundas, bordões e bestas leves.', skillsDesc: 'Escolha 2: Arcanismo, Enganação, Intuição, Intimidação, Persuasão e Religião.' },
    bruxo: { name: 'Bruxo', hp: 8, saves: ['sab', 'car'], hd: '1d8', armor: 'Armaduras leves e armas simples.', skillsDesc: 'Escolha 2: Arcanismo, Enganação, História, Intimidação, Investigação, Natureza e Religião.' },
    druida: { name: 'Druida', hp: 8, saves: ['int', 'sab'], hd: '1d8', armor: 'Armaduras leves e médias (não usam metal!), escudos, clavas, lanças...', skillsDesc: 'Escolha 2: Adestrar Animais, Arcanismo, Intuição, Medicina, Natureza, Percepção, Religião e Sobrevivência.' }
};


const SKILLS = [
    { id: 'acrobatics', name: 'Acrobacia', attr: 'des' },
    { id: 'athletics', name: 'Atletismo', attr: 'for' },
    { id: 'arcana', name: 'Arcanismo', attr: 'int' },
    { id: 'deception', name: 'Enganação', attr: 'car' },
    { id: 'stealth', name: 'Furtividade', attr: 'des' },
    { id: 'history', name: 'História', attr: 'int' },
    { id: 'intimidation', name: 'Intimidação', attr: 'car' },
    { id: 'insight', name: 'Intuição', attr: 'sab' },
    { id: 'investigation', name: 'Investigação', attr: 'int' },
    { id: 'medicine', name: 'Medicina', attr: 'sab' },
    { id: 'nature', name: 'Natureza', attr: 'int' },
    { id: 'perception', name: 'Percepção', attr: 'sab' },
    { id: 'persuasion', name: 'Persuasão', attr: 'car' },
    { id: 'sleight', name: 'Prestidigitação', attr: 'des' },
    { id: 'religion', name: 'Religião', attr: 'int' },
    { id: 'survival', name: 'Sobrevivência', attr: 'sab' },
    { id: 'animal', name: 'Adestrar Animais', attr: 'sab' },
    { id: 'performance', name: 'Atuação', attr: 'car' }
];

const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];
const STORAGE_KEY = 'rpg_guri_v10';

// ==================== STATE ====================
let state = getDefaultState();
let isMasterMode = false;

// Temporal wizard state
let wizardData = {
    active: false,
    name: '', race: '', cls: '', 
    bg: '', align: '', 
    attr: { for: 0, des: 0, con: 0, int: 0, sab: 0, car: 0 }
};

function getDefaultState() {
    return {
        isCreated: false,
        name: 'Herói Sem Nome',
        race: '',
        cls: '',
        bg: 'Criminoso',
        align: 'Leal e Bom',
        level: 1,
        xp: 0,
        hp: { current: 10, max: 10 },
        ac: 10,
        speed: 9,
        hd: '1d10',
        attr: { for: 10, des: 10, con: 10, int: 10, sab: 10, car: 10 },
        profs: [], // Skills IDs
        saves: [], // Attr keys like 'for', 'des'
        inspiration: false,
        attacks: [],
        inventory: '',
        gold: 0,
        rpTraits: '',
        rpIdeals: '',
        rpBonds: '',
        rpFlaws: '',
        rpFeats: '',
        deathSaves: { success: 0, fail: 0 }
    };
}

function rollDice(sides, bonus = 0, label = 'Resultado') {
    const res = Math.floor(Math.random() * sides) + 1;
    const overlay = document.getElementById('dice-overlay');
    document.getElementById('dice-result').textContent = res + bonus;
    document.getElementById('dice-label').textContent = `${label} (${res} + ${bonus})`;
    overlay.style.display = 'flex';
}

// ==================== ENGINE ====================
function init() {
    loadState();
    buildGrids();
    setupEvents();
    render();
}

function loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
        state = JSON.parse(raw);
    }
}

function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function render() {
    const roleSel = document.getElementById('role-selection');
    const creation = document.getElementById('creation-screen');
    const sheet = document.getElementById('sheet-view');
    const masterTgl = document.getElementById('master-toggle');

    // Hide everything first
    roleSel.classList.remove('active');
    creation.classList.remove('active');
    sheet.classList.remove('active');
    masterTgl.classList.add('hidden');

    if (!state.isCreated) {
        if (wizardData.active) {
            creation.classList.add('active');
        } else {
            roleSel.classList.add('active');
        }
    } else {
        sheet.classList.add('active');
        masterTgl.classList.remove('hidden');
        renderSheet();
    }
}

function renderSheet() {
    const $ = id => document.getElementById(id);

    // 1. Header
    $('display-name').value = state.name;
    const raceName = RACES[state.race]?.name || '---';
    const clsName = CLASSES[state.cls]?.name || '---';
    $('display-class-lvl').textContent = `${clsName} Nível ${state.level}`;
    $('display-race').textContent = raceName;
    $('display-bg').value = state.bg;
    $('display-align').value = state.align;
    $('display-xp').value = state.xp;

    // 2. Attributes (Main & Sidebar)
    const attrs = ['for', 'des', 'con', 'int', 'sab', 'car'];
    attrs.forEach(a => {
        const valEl = $(`val-${a}`);
        const modEl = $(`mod-${a}`);
        const sValEl = $(`s-val-${a}`);
        
        const val = state.attr[a];
        const mod = Math.floor((val - 10) / 2);
        const modStr = (mod >= 0 ? '+' : '') + mod;

        if (valEl) valEl.textContent = val;
        if (modEl) modEl.textContent = modStr;
        if (sValEl) {
            sValEl.textContent = val;
            const sModEl = sValEl.parentElement.querySelector('.attr-mod');
            if (sModEl) sModEl.textContent = modStr;
        }
    });

    // 3. Insp/Prof/Saves
    $('check-inspiration').className = 'square-check' + (state.inspiration ? ' active' : '');
    const profBonus = Math.ceil(state.level / 4) + 1;
    $('prof-bonus').textContent = '+' + profBonus;

    // Saves list
    const savesList = $('saves-list');
    savesList.innerHTML = attrs.map(a => {
        const isProf = state.saves.includes(a);
        const mod = Math.floor((state.attr[a] - 10) / 2);
        const total = mod + (isProf ? profBonus : 0);
        return `
            <div class="skill-row">
                <div class="dot-check ${isProf ? 'active' : ''}" data-prof-save="${a}"></div>
                <span class="skill-val">${(total >= 0 ? '+' : '') + total}</span>
                <span class="skill-name">${a.toUpperCase()}</span>
            </div>
        `;
    }).join('');

    // 4. Skills
    const skillsList = $('skills-list');
    skillsList.innerHTML = SKILLS.map(s => {
        const isProf = state.profs.includes(s.id);
        const mod = Math.floor((state.attr[s.attr] - 10) / 2);
        const total = mod + (isProf ? profBonus : 0);
        return `
            <div class="skill-row">
                <div class="dot-check ${isProf ? 'active' : ''}" data-prof-skill="${s.id}"></div>
                <span class="skill-val">${(total >= 0 ? '+' : '') + total}</span>
                <span class="skill-name">${s.name} <small style="color:#555">(${s.attr.toUpperCase()})</small></span>
            </div>
        `;
    }).join('');

    // 5. Combat
    $('display-ac').value = state.ac;
    const desMod = Math.floor((state.attr.des - 10) / 2);
    $('display-initiative').textContent = (desMod >= 0 ? '+' : '') + desMod;
    $('display-speed').textContent = state.speed + 'm';
    $('hp-text').textContent = `${state.hp.current} / ${state.hp.max}`;
    $('hp-current').value = state.hp.current;
    $('hp-max').value = state.hp.max;
    const hpPct = (state.hp.current / state.hp.max) * 100;
    $('hp-fill-bar').style.width = hpPct + '%';
    $('display-hd').value = state.hd;

    // Death Saves
    document.querySelectorAll('.ds-success').forEach((el, i) => {
        el.className = 'dot-check ds-success' + (i < state.deathSaves.success ? ' active' : '');
    });
    document.querySelectorAll('.ds-fail').forEach((el, i) => {
        el.className = 'dot-check ds-fail' + (i < state.deathSaves.fail ? ' active' : '');
    });

    // 6. Attacks
    const attacksEl = $('attacks-list');
    attacksEl.innerHTML = state.attacks.map((atk, i) => `
        <div class="attack-row">
            <input type="text" value="${atk.name}" data-atk-idx="${i}" data-field="name" ${isMasterMode ? '' : 'readonly'}>
            <input type="text" value="${atk.bonus}" data-atk-idx="${i}" data-field="bonus" ${isMasterMode ? '' : 'readonly'} style="text-align:center;">
            <input type="text" value="${atk.dmg}" data-atk-idx="${i}" data-field="dmg" ${isMasterMode ? '' : 'readonly'} style="text-align:center;">
        </div>
    `).join('');

    // 7. Inventory
    $('inventory-list').value = state.inventory;
    $('gold-po').value = state.gold;

    // 8. Roleplay
    $('rp-traits').value = state.rpTraits;
    $('rp-ideals').value = state.rpIdeals;
    $('rp-bonds').value = state.rpBonds;
    $('rp-flaws').value = state.rpFlaws;
    $('rp-feats').value = state.rpFeats;

    // Toggle Read-Only
    const sheetContainer = $('sheet-container');
    if (isMasterMode) {
        sheetContainer.classList.remove('read-only');
        document.querySelectorAll('#sheet-container input, #sheet-container textarea').forEach(el => el.removeAttribute('readonly'));
        $('master-toggle').textContent = '🔓';
    } else {
        sheetContainer.classList.add('read-only');
        document.querySelectorAll('#sheet-container input, #sheet-container textarea').forEach(el => el.setAttribute('readonly', true));
        $('master-toggle').textContent = '🔒';
    }
}

// ==================== WIZARD LOGIC ====================
function buildGrids() {
    const raceGrid = document.getElementById('race-grid');
    raceGrid.innerHTML = Object.entries(RACES).map(([id, r]) => `
        <div class="choice-card" data-key="race" data-id="${id}">
            <strong>${r.name}</strong>
        </div>
    `).join('');

    const classGrid = document.getElementById('class-grid');
    classGrid.innerHTML = Object.entries(CLASSES).map(([id, c]) => `
        <div class="choice-card" data-key="cls" data-id="${id}">
            <strong>${c.name}</strong>
        </div>
    `).join('');

    renderStandardArraySelectors();
}

function renderStandardArraySelectors() {
    const selects = document.querySelectorAll('.dist-select');
    selects.forEach(sel => {
        const val = sel.value;
        sel.innerHTML = '<option value="">---</option>' + 
            STANDARD_ARRAY.map(v => `<option value="${v}" ${val == v ? 'selected' : ''}>${v}</option>`).join('');
        
        sel.onchange = () => updateStandardArrayDisables();
    });
    updateStandardArrayDisables();
}

function updateStandardArrayDisables() {
    const selects = document.querySelectorAll('.dist-select');
    const usedValues = Array.from(selects).map(s => s.value).filter(v => v !== "");
    
    selects.forEach(sel => {
        const currentVal = sel.value;
        Array.from(sel.options).forEach(opt => {
            if (opt.value === "") return;
            const isUsedElsewhere = usedValues.includes(opt.value) && opt.value !== currentVal;
            opt.disabled = isUsedElsewhere;
        });
    });
}

function goToStep(n) {
    document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('active'));
    document.getElementById('step-' + n).classList.add('active');
}

function finishCreation() {
    const name = document.getElementById('create-name').value.trim();
    const bg = document.getElementById('create-bg').value.trim();
    const align = document.getElementById('create-align').value.trim();
    
    if (!name || !wizardData.race || !wizardData.cls) {
        alert('Complete o registro primeiro!');
        return;
    }

    const selects = document.querySelectorAll('.dist-select');
    const attrValues = Array.from(selects).map(s => parseInt(s.value));
    if (attrValues.some(v => isNaN(v))) {
        alert('Distribua todos os atributos!');
        return;
    }

    // Assign Base
    selects.forEach(s => {
        wizardData.attr[s.dataset.attr] = parseInt(s.value);
    });

    // Finalize State
    state = getDefaultState();
    state.name = name;
    state.race = wizardData.race;
    state.cls = wizardData.cls;
    state.bg = bg;
    state.align = align;
    state.attr = { ...wizardData.attr };

    const race = RACES[state.race];
    const cls = CLASSES[state.cls];

    // Combine features into rpFeats string
    state.rpFeats = `[RAÇA: ${race.name}]\n- ${race.modsDesc}\n- ${race.feature}\n\n[CLASSE: ${cls.name}]\n- Armaduras & Armas: ${cls.armor}\n- Perícias: ${cls.skillsDesc}`;

    state.speed = race.speed;

    // Apply Class Base
    const conMod = Math.floor((state.attr.con - 10) / 2);
    state.hp.max = cls.hp + conMod;
    state.hp.current = state.hp.max;
    state.hd = '1' + cls.hd.substring(1); // 1d10, etc.
    state.saves = [...cls.saves];

    state.isCreated = true;
    saveState();
    render();
}

// ==================== EVENTS ====================
function setupEvents() {
    document.addEventListener('click', e => {
        const t = e.target;

        // Role Card
        const rCard = t.closest('.choice-card[data-role]');
        if (rCard) {
            if (rCard.dataset.role === 'jogador') {
                wizardData.active = true;
                render();
            } else {
                alert('Modo Mestre em desenvolvimento. Por enquanto, crie um personagem como Jogador.');
            }
            return;
        }

        // Back to Role Selection
        if (t.id === 'btn-back-to-role') {
            wizardData.active = false;
            render();
            return;
        }

        // Choice Card (Race/Class)
        const cCard = t.closest('.choice-card[data-id]');
        if (cCard) {
            const key = cCard.dataset.key;
            wizardData[key] = cCard.dataset.id;
            cCard.parentElement.querySelectorAll('.choice-card').forEach(c => c.classList.remove('selected'));
            cCard.classList.add('selected');

            // Render Preview Text
            if (key === 'race') {
                const r = RACES[cCard.dataset.id];
                const box = document.getElementById('race-desc-box');
                if (box) box.innerHTML = `<strong>${r.name}</strong><br><span style="color:var(--gold);">${r.modsDesc}</span><br><em>${r.feature}</em>`;
            } else if (key === 'cls') {
                const c = CLASSES[cCard.dataset.id];
                const box = document.getElementById('class-desc-box');
                if (box) box.innerHTML = `<strong>${c.name}</strong><br><span style="color:var(--gold);">Armas e Armaduras:</span> ${c.armor}<br><span style="color:var(--gold);">Perícias:</span> ${c.skillsDesc}`;
            }
        }

        // Wizard Nav
        if (t.id === 'btn-step-2') goToStep(2);
        if (t.id === 'btn-step-3') goToStep(3);
        if (t.id === 'btn-back-0') goToStep(0);
        if (t.id === 'btn-back-1') goToStep(1);
        if (t.id === 'btn-back-2') goToStep(2);
        if (t.id === 'btn-finish') finishCreation();

        // Master Toggle
        if (t.id === 'master-toggle') {
            isMasterMode = !isMasterMode;
            render();
            return;
        }

        // Dice Roll from Attributes/Skills
        const rollAttr = t.closest('.attr-block');
        if (rollAttr && !isMasterMode) {
            const attr = rollAttr.dataset.attr;
            const mod = Math.floor((state.attr[attr] - 10) / 2);
            rollDice(20, mod, `Teste de ${attr.toUpperCase()}`);
            return;
        }

        const rollSkill = t.closest('.skill-row');
        if (rollSkill && !isMasterMode) {
            const val = parseInt(rollSkill.querySelector('.skill-val').textContent);
            const name = rollSkill.querySelector('.skill-name').textContent;
            rollDice(20, val, `Teste de ${name}`);
            return;
        }

        // Checkboxes (Only in master mode or specific interactions)
        if (t.classList.contains('dot-check') || t.classList.contains('square-check')) {
            if (!isMasterMode && !t.id.includes('ds-')) return; // Allow death saves if player is dying? Maybe.

            if (t.id === 'check-inspiration') state.inspiration = !state.inspiration;
            if (t.dataset.profSkill) {
                const sid = t.dataset.profSkill;
                if (state.profs.includes(sid)) state.profs = state.profs.filter(x => x !== sid);
                else state.profs.push(sid);
            }
            if (t.dataset.profSave) {
                const aid = t.dataset.profSave;
                if (state.saves.includes(aid)) state.saves = state.saves.filter(x => x !== aid);
                else state.saves.push(aid);
            }
            if (t.classList.contains('ds-success')) {
                state.deathSaves.success = (state.deathSaves.success + 1) % 4;
            }
            if (t.classList.contains('ds-fail')) {
                state.deathSaves.fail = (state.deathSaves.fail + 1) % 4;
            }

            saveState();
            render();
        }

        // HP Controls
        if (t.classList.contains('hp-control')) {
            const delta = parseInt(t.dataset.delta);
            state.hp.current = Math.max(0, Math.min(state.hp.max, state.hp.current + delta));
            saveState();
            render();
        }

        // Add Attack
        if (t.id === 'add-attack') {
            if (!isMasterMode) return;
            state.attacks.push({ name: 'Nova Arma', bonus: '+0', dmg: '1d6' });
            saveState();
            render();
        }

        // Close Dice
        if (t.id === 'close-dice' || t.id === 'dice-overlay') {
            document.getElementById('dice-overlay').style.display = 'none';
        }

        // Reset
        if (t.id === 'btn-reset-char') {
            if (confirm('REDEFINIR FICHA? Isso apagará tudo.')) {
                localStorage.removeItem(STORAGE_KEY);
                location.reload();
            }
        }
    });

    // Input Sync
    document.addEventListener('input', e => {
        if (!isMasterMode) return;
        const t = e.target;
        if (t.id === 'display-name') state.name = t.value;
        if (t.id === 'display-bg') state.bg = t.value;
        if (t.id === 'display-align') state.align = t.value;
        if (t.id === 'display-xp') state.xp = parseInt(t.value) || 0;
        if (t.id === 'hp-current') state.hp.current = parseInt(t.value) || 0;
        if (t.id === 'hp-max') state.hp.max = parseInt(t.value) || 0;
        if (t.id === 'display-ac') state.ac = parseInt(t.value) || 10;
        if (t.id === 'display-hd') state.hd = t.value;
        if (t.id === 'inventory-list') state.inventory = t.value;
        if (t.id === 'gold-po') state.gold = parseInt(t.value) || 0;
        if (t.id === 'rp-traits') state.rpTraits = t.value;
        if (t.id === 'rp-ideals') state.rpIdeals = t.value;
        if (t.id === 'rp-bonds') state.rpBonds = t.value;
        if (t.id === 'rp-flaws') state.rpFlaws = t.value;
        if (t.id === 'rp-feats') state.rpFeats = t.value;

        // Attacks dynamic sync
        if (t.dataset.atkIdx !== undefined) {
            const idx = t.dataset.atkIdx;
            const field = t.dataset.field;
            state.attacks[idx][field] = t.value;
        }

        saveState();
        // We don't render on every input keydown to avoid losing focus, 
        // but we might need to update dependent values like Modifiers if Attributes change.
        // For simplicity in this demo, attributes are only changed in the wizard or if I add controls here.
    });
}

init();
