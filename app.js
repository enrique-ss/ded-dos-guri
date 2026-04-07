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
    guerreiro: { name: 'Guerreiro', hp: 10, saves: ['for', 'con'], hd: '1d10', armor: 'Todas as armaduras, escudos, armas simples e marciais.', skillsDesc: 'Escolha 2: Acrobacia, Adestrar Animais, Atletismo, História, Intuição, Intimidação, Percepção e Sobrevivência.', skillChoices: 2, allowSkills: ['acrobatics', 'animal', 'athletics', 'history', 'insight', 'intimidation', 'perception', 'survival'] },
    ladino: { name: 'Ladino', hp: 8, saves: ['des', 'int'], hd: '1d8', armor: 'Armaduras leves, armas simples, bestas de mão, espadas curtas, rapieiras e espadas longas.', skillsDesc: 'Escolha 4: Acrobacia, Atletismo, Atuação, Enganação, Furtividade, Intimidação... +Ferramentas de Ladrão.', skillChoices: 4, allowSkills: ['acrobatics', 'athletics', 'performance', 'deception', 'stealth', 'intimidation', 'insight', 'investigation', 'perception', 'persuasion', 'sleight'] },
    mago: { name: 'Mago', hp: 6, saves: ['int', 'sab'], hd: '1d6', armor: 'Adagas, dardos, fundas, bordões e bestas leves. (Nenhuma armadura).', skillsDesc: 'Escolha 2: Arcanismo, História, Investigação, Medicina e Religião.', skillChoices: 2, allowSkills: ['arcana', 'history', 'investigation', 'medicine', 'religion'] },
    clerigo: { name: 'Clérigo', hp: 8, saves: ['sab', 'car'], hd: '1d8', armor: 'Armaduras leves e médias, escudos e armas simples.', skillsDesc: 'Escolha 2: História, Intuição, Medicina, Persuasão e Religião.', skillChoices: 2, allowSkills: ['history', 'insight', 'medicine', 'persuasion', 'religion'] },
    paladino: { name: 'Paladino', hp: 10, saves: ['sab', 'car'], hd: '1d10', armor: 'Todas as armaduras, escudos, armas simples e marciais.', skillsDesc: 'Escolha 2: Atletismo, Intuição, Intimidação, Medicina, Persuasão e Religião.', skillChoices: 2, allowSkills: ['athletics', 'insight', 'intimidation', 'medicine', 'persuasion', 'religion'] },
    barbaro: { name: 'Bárbaro', hp: 12, saves: ['for', 'con'], hd: '1d12', armor: 'Armaduras leves e médias, escudos, armas simples e marciais.', skillsDesc: 'Escolha 2: Adestrar Animais, Atletismo, Intimidação, Natureza, Percepção e Sobrevivência.', skillChoices: 2, allowSkills: ['animal', 'athletics', 'intimidation', 'nature', 'perception', 'survival'] },
    bardo: { name: 'Bardo', hp: 8, saves: ['des', 'car'], hd: '1d8', armor: 'Armaduras leves, armas simples, bestas, espadas. +3 Instrumentos.', skillsDesc: 'Escolha 3 quaisquer (O Bardo é o "pau para toda obra").', skillChoices: 3, allowSkills: 'all' },
    patrulheiro: { name: 'Patrulheiro', hp: 10, saves: ['for', 'des'], hd: '1d10', armor: 'Armaduras leves e médias, escudos, armas simples e marciais.', skillsDesc: 'Escolha 3: Adestrar Animais, Atletismo, Intuição, Investigação, Natureza... Furtividade.', skillChoices: 3, allowSkills: ['animal', 'athletics', 'insight', 'investigation', 'nature', 'perception', 'survival', 'stealth'] },
    feiticeiro: { name: 'Feiticeiro', hp: 6, saves: ['con', 'car'], hd: '1d6', armor: 'Adagas, dardos, fundas, bordões e bestas leves.', skillsDesc: 'Escolha 2: Arcanismo, Enganação, Intuição, Intimidação, Persuasão e Religião.', skillChoices: 2, allowSkills: ['arcana', 'deception', 'insight', 'intimidation', 'persuasion', 'religion'] },
    bruxo: { name: 'Bruxo', hp: 8, saves: ['sab', 'car'], hd: '1d8', armor: 'Armaduras leves e armas simples.', skillsDesc: 'Escolha 2: Arcanismo, Enganação, História, Intimidação, Investigação, Natureza e Religião.', skillChoices: 2, allowSkills: ['arcana', 'deception', 'history', 'intimidation', 'investigation', 'nature', 'religion'] },
    druida: { name: 'Druida', hp: 8, saves: ['int', 'sab'], hd: '1d8', armor: 'Armaduras leves e médias (não usam metal!), escudos, clavas, lanças...', skillsDesc: 'Escolha 2: Adestrar Animais, Arcanismo, Intuição, Medicina, Natureza, Percepção, Religião e Sobrevivência.', skillChoices: 2, allowSkills: ['animal', 'arcana', 'insight', 'medicine', 'nature', 'perception', 'religion', 'survival'] }
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

// Temporal wizard state
let wizardData = {
    active: false,
    active: false,
    name: '', race: '', cls: '',
    bg: '', align: '', photo: '',
    personality: { traits: '', ideals: '', bonds: '', flaws: '' },
    attr: { for: 0, des: 0, con: 0, int: 0, sab: 0, car: 0 },
    skills: []
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
        photo: '',
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

    // Hide everything first
    roleSel.classList.remove('active');
    creation.classList.remove('active');
    sheet.classList.remove('active');

    if (!state.isCreated) {
        if (wizardData.active) {
            creation.classList.add('active');
        } else {
            roleSel.classList.add('active');
        }
    } else {
        sheet.classList.add('active');
        renderSheet();
    }
}

function renderSheet() {
    const $ = id => document.getElementById(id);

    // 1. Header
    $('display-name').value = state.name;
    const raceName = RACES[state.race]?.name || '---';
    const clsName = CLASSES[state.cls]?.name || '---';

    if ($('display-class')) $('display-class').textContent = clsName;
    if ($('display-level')) $('display-level').textContent = `Nível ${state.level}`;
    $('display-race').textContent = raceName;

    if (state.photo) {
        $('display-photo').src = state.photo;
        $('display-photo').style.display = 'block';
    } else {
        $('display-photo').style.display = 'none';
        $('display-photo').src = '';
    }

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
    const inspEl = $('check-inspiration');
    if (inspEl) {
        inspEl.className = 'attr-circle' + (state.inspiration ? ' active' : '');
    }
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
    $('display-hd').value = state.hd;

    // Death Saves
    document.querySelectorAll('.ds-success').forEach((el, i) => {
        el.className = 'dot-check ds-success' + (i < state.deathSaves.success ? ' active' : '');
    });
    document.querySelectorAll('.ds-fail').forEach((el, i) => {
        el.className = 'dot-check ds-fail' + (i < state.deathSaves.fail ? ' active' : '');
    });

    // 6. Attacks
    // Attacks list (read-only view)
    const attacksEl = $('attacks-list');
    attacksEl.innerHTML = state.attacks.map((atk, i) => `
        <div class="attack-row">
            <span>${atk.name}</span>
            <span style="text-align:center;">${atk.bonus}</span>
            <span style="text-align:center;">${atk.dmg}</span>
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
    if (n === 3) {
        if (!wizardData.cls || !wizardData.race) { alert("Escolha Raça e Classe primeiro."); return; }
        loadSkillChoices();
    }
    if (n === 5) {
        const selects = document.querySelectorAll('.dist-select');
        let currentValues = [];
        selects.forEach(s => {
            const val = parseInt(s.value);
            if (!isNaN(val)) {
                wizardData.attr[s.dataset.attr] = val;
                currentValues.push(val);
            }
        });

        let missing = [];
        for (let a of STANDARD_ARRAY) {
            if (!currentValues.includes(a)) {
                missing.push(a);
            }
        }
        if (missing.length > 0) {
            alert(`Distribua todos os atributos! Valores faltantes: ${missing.join(', ')}`);
            return;
        }
    }
    document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('active'));
    document.getElementById('step-' + n).classList.add('active');
}

function loadSkillChoices() {
    const cls = CLASSES[wizardData.cls];
    let maxPicks = cls.skillChoices;
    let allowed = cls.allowSkills;

    if (wizardData.race === 'meio_elfo') {
        maxPicks += 2;
        allowed = 'all';
    }

    document.getElementById('skills-limit-text').textContent = `Escolha ${wizardData.skills.length} / ${maxPicks} perícias (Faltam ${maxPicks - wizardData.skills.length}):`;
    document.getElementById('skills-limit-text').dataset.max = maxPicks;

    const grid = document.getElementById('skills-selection-grid');
    grid.innerHTML = SKILLS.map(s => {
        if (allowed !== 'all' && !allowed.includes(s.id)) return '';
        const isSelected = wizardData.skills.includes(s.id);
        return `
            <div class="choice-card choice-skill ${isSelected ? 'selected' : ''}" data-skill="${s.id}">
                <strong>${s.name}</strong> <small>(${s.attr.toUpperCase()})</small>
            </div>
        `;
    }).join('');
}

function finishCreation() {
    const fileInput = document.getElementById('create-photo');
    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            finalizeWizardState(e.target.result);
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        finalizeWizardState('');
    }
}

function finalizeWizardState(photoBase64) {
    const name = document.getElementById('create-name').value.trim();
    const bg = document.getElementById('create-bg').value.trim();
    const align = document.getElementById('create-align').value.trim();
    const tr = document.getElementById('create-traits').value.trim();
    const id = document.getElementById('create-ideals').value.trim();
    const bo = document.getElementById('create-bonds').value.trim();
    const fl = document.getElementById('create-flaws').value.trim();

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
    state.photo = photoBase64;
    state.rpTraits = tr;
    state.rpIdeals = id;
    state.rpBonds = bo;
    state.rpFlaws = fl;
    state.attr = { ...wizardData.attr };
    state.profs = [...wizardData.skills];

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
        if (t.id === 'btn-step-4') goToStep(4);
        if (t.id === 'btn-step-5') goToStep(5);
        if (t.id === 'btn-finish') {
            const max = parseInt(document.getElementById('skills-limit-text')?.dataset.max || 0);
            if (wizardData.skills.length < max) {
                alert(`Você precisa escolher exatamente ${max} perícias antes de continuar!`);
                return;
            }
            finishCreation();
        }

        if (t.id === 'btn-back-0') goToStep(0);
        if (t.id === 'btn-back-1') goToStep(1);
        if (t.id === 'btn-back-2') goToStep(2);
        if (t.id === 'btn-back-3') goToStep(3);
        if (t.id === 'btn-back-4') goToStep(4);

        // Skill Selection
        const sCard = t.closest('.choice-skill');
        if (sCard) {
            const sid = sCard.dataset.skill;
            const max = parseInt(document.getElementById('skills-limit-text').dataset.max || 0);
            if (wizardData.skills.includes(sid)) {
                wizardData.skills = wizardData.skills.filter(id => id !== sid);
            } else {
                if (wizardData.skills.length >= max) {
                    alert('Você já escolheu o máximo de perícias para sua classe!');
                    return;
                }
                wizardData.skills.push(sid);
            }
            loadSkillChoices();
            return;
        }

        // Reset
        if (t.id === 'btn-reset-char') {
            if (confirm('REDEFINIR FICHA? Isso apagará tudo.')) {
                localStorage.removeItem(STORAGE_KEY);
                location.reload();
            }
        }
    });

    // Input Sync is completely removed since it's a fixed sheet after creation
}


init();
