/**
 * RPG dos Guri – Engine v9.1
 * Ouro, pontos de atributo distribuíveis, nível máximo 10.
 */

// ==================== SYSTEM DATA ====================
const RACES = {
    humano: {
        name: 'Humano',
        bonus: '+1 em 3 atributos à escolha',
        mods: { choice: 3, val: 1 },
        trait: 'Aprendiz Rápido: Ganha 1 Talento (Feat) no nível 1.'
    },
    elfo: {
        name: 'Elfo',
        bonus: '+2 Destreza, +1 Inteligência',
        mods: { des: 2, int: 1 },
        trait: 'Sentido Aguçado: Visão no escuro e imunidade a sono mágico.'
    },
    meio_elfo: {
        name: 'Meio-Elfo',
        bonus: '+2 Carisma, +1 em outros 2',
        mods: { car: 2, choice: 2, val: 1 },
        trait: 'Versatilidade: Proficiência em 2 perícias extras.'
    },
    anao: {
        name: 'Anão',
        bonus: '+2 Constituição, +1 Força',
        mods: { con: 2, for: 1 },
        trait: 'Resiliência: Resistência a veneno e +1 PV por nível.'
    },
    tiefling: {
        name: 'Tiefling',
        bonus: '+2 Carisma, +1 Inteligência',
        mods: { car: 2, int: 1 },
        trait: 'Legado: Resistência a fogo e 1 Truque mágico (Cantrip).'
    },
    halfling: {
        name: 'Halfling',
        bonus: '+2 Destreza, +1 Carisma',
        mods: { des: 2, car: 1 },
        trait: 'Sorte: Pode relançar qualquer resultado "1" no dado.'
    },
    gnomo: {
        name: 'Gnomo',
        bonus: '+2 Inteligência, +1 Const.',
        mods: { int: 2, con: 1 },
        trait: 'Mente Astuta: Vantagem em salvaguardas mentais contra magia.'
    },
    meio_orc: {
        name: 'Meio-Orc',
        bonus: '+2 Força, +1 Constituição',
        mods: { for: 2, con: 1 },
        trait: 'Tenacidade: Se cair a 1 HP, consegue se levantar e dar um ultimo ataque antes de desmaiar.'
    }
};

const CLASSES = {
    guerreiro: {
        name: 'Guerreiro (O Combatente)',
        hp: 10,
        saves: ['Força', 'Constituição'],
        skills: 2,
        skillList: ['Acrobacia', 'Adestrar Animais', 'Atletismo', 'História', 'Intuição', 'Intimidação', 'Percepção', 'Sobrevivência'],
        equipment: 'Todas as armaduras, escudos, armas simples e marciais.',
        bonus: ''
    },
    ladino: {
        name: 'Ladino (O Especialista/Furtivo)',
        hp: 8,
        saves: ['Destreza', 'Inteligência'],
        skills: 4,
        skillList: ['Acrobacia', 'Atletismo', 'Atuação', 'Enganação', 'Furtividade', 'Intimidação', 'Intuição', 'Investigação', 'Percepção', 'Persuasão', 'Prestidigitação'],
        equipment: 'Armaduras leves, armas simples, bestas de mão, espadas curtas, rapieiras e espadas longas.',
        bonus: 'Ganha proficiência com Ferramentas de Ladrão.'
    },
    mago: {
        name: 'Mago (O Estudioso Arcano)',
        hp: 6,
        saves: ['Inteligência', 'Sabedoria'],
        skills: 2,
        skillList: ['Arcanismo', 'História', 'Investigação', 'Medicina', 'Religião'],
        equipment: 'Adagas, dardos, fundas, bordões e bestas leves. (Nenhuma armadura).',
        bonus: ''
    },
    clerigo: {
        name: 'Clérigo (O Curandeiro/Servo Divino)',
        hp: 8,
        saves: ['Sabedoria', 'Carisma'],
        skills: 2,
        skillList: ['História', 'Intuição', 'Medicina', 'Persuasão', 'Religião'],
        equipment: 'Armaduras leves e médias, escudos e armas simples.',
        bonus: ''
    },
    paladino: {
        name: 'Paladino (O Guerreiro Sagrado)',
        hp: 10,
        saves: ['Sabedoria', 'Carisma'],
        skills: 2,
        skillList: ['Atletismo', 'Intuição', 'Intimidação', 'Medicina', 'Persuasão', 'Religião'],
        equipment: 'Todas as armaduras, escudos, armas simples e marciais.',
        bonus: ''
    },
    barbaro: {
        name: 'Bárbaro (A Fúria Primitiva)',
        hp: 12,
        saves: ['Força', 'Constituição'],
        skills: 2,
        skillList: ['Adestrar Animais', 'Atletismo', 'Intimidação', 'Natureza', 'Percepção', 'Sobrevivência'],
        equipment: 'Armaduras leves e médias, escudos, armas simples e marciais.',
        bonus: ''
    },
    bardo: {
        name: 'Bardo (O Artista/Suporte)',
        hp: 8,
        saves: ['Destreza', 'Carisma'],
        skills: 3,
        skillList: ['Acrobacia', 'Adestrar Animais', 'Arcanismo', 'Atletismo', 'Atuação', 'Enganação', 'Furtividade', 'História', 'Intimidação', 'Intuição', 'Investigação', 'Medicina', 'Natureza', 'Percepção', 'Persuasão', 'Prestidigitação', 'Religião', 'Sobrevivência'],
        equipment: 'Armaduras leves, armas simples, bestas de mão, espadas longas, rapieiras e espadas curtas.',
        bonus: 'Proficiência com 3 instrumentos musicais.'
    },
    patrulheiro: {
        name: 'Patrulheiro / Ranger (O Explorador)',
        hp: 10,
        saves: ['Força', 'Destreza'],
        skills: 3,
        skillList: ['Adestrar Animais', 'Atletismo', 'Intuição', 'Investigação', 'Natureza', 'Percepção', 'Sobrevivência', 'Furtividade'],
        equipment: 'Armaduras leves e médias, escudos, armas simples e marciais.',
        bonus: ''
    },
    feiticeiro: {
        name: 'Feiticeiro (Magia Inata/Sangue Mágico)',
        hp: 6,
        saves: ['Constituição', 'Carisma'],
        skills: 2,
        skillList: ['Arcanismo', 'Enganação', 'Intuição', 'Intimidação', 'Persuasão', 'Religião'],
        equipment: 'Adagas, dardos, fundas, bordões e bestas leves.',
        bonus: ''
    },
    bruxo: {
        name: 'Bruxo / Warlock (Pacto com Entidade)',
        hp: 8,
        saves: ['Sabedoria', 'Carisma'],
        skills: 2,
        skillList: ['Arcanismo', 'Enganação', 'História', 'Intimidação', 'Investigação', 'Natureza', 'Religião'],
        equipment: 'Armaduras leves e armas simples.',
        bonus: ''
    },
    druida: {
        name: 'Druida (Protetor da Natureza)',
        hp: 8,
        saves: ['Inteligência', 'Sabedoria'],
        skills: 2,
        skillList: ['Adestrar Animais', 'Arcanismo', 'Intuição', 'Medicina', 'Natureza', 'Percepção', 'Religião', 'Sobrevivência'],
        equipment: 'Armaduras leves e médias (não usam metal!), escudos, clavas, adagas, dardos, machadinhas, foices, bordões, cimitarras, fundas e lanças.',
        bonus: ''
    }
};

const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];


const STORAGE_KEY = 'questpad_v9.1';
const MAX_LEVEL = 10;

// ==================== STATE ====================
let state = getDefaultState();

// Temporário: dados sendo distribuídos no wizard
let wizardDist = { for: 0, des: 0, con: 0, int: 0, sab: 0, car: 0 };
let wizardRacialChoice = []; // Para raças que escolhem atributos
let wizardSkills = []; // Perícias selecionadas
let wizardGold = 0;
let wizardGoldRolled = false;

function getDefaultState() {
    return {
        isCreated: false,
        name: '', race: '', cls: '',
        level: 1, photoData: '',
        gold: 0,
        freePoints: 0,   // pontos de atributo disponíveis no jogo
        hp: { current: 10, max: 10 },
        mp: { current: 10, max: 10 },
        attr: { for: 10, des: 10, con: 10, int: 10, sab: 10, car: 10 },
        baseAttr: { for: 0, des: 0, con: 0, int: 0, sab: 0, car: 0 },
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
    const attrs = ['for', 'des', 'con', 'int', 'sab', 'car'];
    attrs.forEach(a => {
        const el = $('attr-' + a);
        if (el) el.textContent = state.attr[a];
    });


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
}
function fillGrid(containerId, dataObj, stateKey) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = Object.entries(dataObj).map(([id, item]) => {
        let subText = item.bonus || item.bonus === "" ? item.bonus : item.bonus;
        // Se for classe, mostrar saves. Se for raça, mostrar bonus racial.
        if (stateKey === 'cls') {
            subText = `${item.saves.join(' e ')}`;
        } else if (stateKey === 'race') {
            subText = item.bonus;
        }

        return `
            <div class="choice-card" data-key="${stateKey}" data-id="${id}">
                <strong>${item.name}</strong>
                <small>${subText}</small>
                ${item.trait ? `<p class="card-trait">${item.trait}</p>` : ''}
            </div>
        `;
    }).join('');
}

function goToStep(n) {
    document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('active'));
    const target = document.getElementById('step-' + n);
    if (target) target.classList.add('active');

    // Ao entrar no step 3: preparar perícias
    if (n === 3) {
        renderSkillGrid();
    }

    // Ao entrar no step 4: preparar atributos e ouro
    if (n === 4) {
        if (!wizardGoldRolled) {
            wizardGold = 0;
            wizardDist = { for: 0, des: 0, con: 0, int: 0, sab: 0, car: 0 };
        }
        renderWizardStep4();
    }
}

function renderSkillGrid() {
    const cls = CLASSES[state.cls];
    if (!cls) return;

    const grid = document.getElementById('skill-grid');
    const skillCountEl = document.getElementById('skill-count');
    
    // Base skills from class
    let totalSkills = cls.skills;
    
    // Racial bonus skills
    if (state.race === 'meio_elfo') {
        totalSkills += 2; // Versatilidade: 2 perícias extras
    }

    skillCountEl.textContent = totalSkills;
    wizardSkills = [];

    grid.innerHTML = cls.skillList.map(skill => `
        <div class="choice-card mini-card skill-card" data-skill="${skill}">
            <strong>${skill}</strong>
        </div>
    `).join('');
}

function handleSkillSelection(skill, card) {
    const cls = CLASSES[state.cls];
    let max = cls.skills;
    if (state.race === 'meio_elfo') max += 2;

    const idx = wizardSkills.indexOf(skill);

    if (idx >= 0) {
        wizardSkills.splice(idx, 1);
        card.classList.remove('selected');
    } else {
        if (wizardSkills.length < max) {
            wizardSkills.push(skill);
            card.classList.add('selected');
        } else {
            alert(`Você só pode escolher ${max} perícias!`);
        }
    }
}

function renderWizardStep4() {
    const selects = document.querySelectorAll('.dist-select');
    
    selects.forEach(sel => {
        const currentVal = sel.value;
        sel.innerHTML = '<option value="">---</option>' + 
            STANDARD_ARRAY.map(v => `<option value="${v}" ${currentVal == v ? 'selected' : ''}>${v}</option>`).join('');
    });

    updateWizardSelectDisables();

    document.getElementById('create-gold').textContent = wizardGoldRolled ? wizardGold : '???';
    const rollBtn = document.getElementById('btn-roll-gold');
    if (rollBtn) rollBtn.style.display = wizardGoldRolled ? 'none' : 'inline-block';
}

function handleWizardSelectChange(e) {
    const attr = e.target.dataset.attr;
    const value = parseInt(e.target.value);
    if (attr) wizardDist[attr] = value || 0;
    updateWizardSelectDisables();
}

function updateWizardSelectDisables() {
    const selects = document.querySelectorAll('.dist-select');
    const selectedValues = Array.from(selects).map(s => s.value).filter(v => v !== "");

    selects.forEach(sel => {
        const selVal = sel.value;
        Array.from(sel.options).forEach(opt => {
            if (opt.value === "") return;
            // Desabilita se valor já está em outro select (e não é o valor deste select atual)
            const valInUse = selectedValues.includes(opt.value);
            opt.disabled = valInUse && opt.value !== selVal;
        });
    });
}



// ==================== FINISH CREATION ====================
function finishCreation() {
    state.name = document.getElementById('create-name').value.trim() || 'Herói Sem Nome';

    if (!state.race || !state.cls) {
        alert('Escolha sua Raça e Classe!');
        return;
    }

    const race = RACES[state.race];
    const cls = CLASSES[state.cls];

    // Check skills
    let maxSkills = cls.skills;
    if (state.race === 'meio_elfo') maxSkills += 2;

    if (wizardSkills.length < maxSkills) {
        alert(`Escolha ${maxSkills} perícias!`);
        return;
    }

    // Check racial choice
    if (race.mods?.choice && wizardRacialChoice.length < race.mods.choice) {
        alert(`Escolha ${race.mods.choice} atributos extras da sua raça!`);
        return;
    }

    // Check Standard Array
    const values = Array.from(document.querySelectorAll('.dist-select'))
        .map(s => s.value)
        .filter(v => v !== "");
    
    if (values.length < 6) {
        alert('Distribua todos os valores do Array Padrão!');
        return;
    }
    
    // 1) Base do Array Padrão
    state.baseAttr = { ...wizardDist };

    // 2) Atributos totais = base + mods raciais
    state.attr = { ...state.baseAttr };
    for (const [k, v] of Object.entries(race.mods || {})) {
        if (k !== 'choice' && k !== 'val') {
            state.attr[k] += v;
        }
    }

    // 3) Atributos da escolha racial
    wizardRacialChoice.forEach(attr => {
        state.attr[attr] += (race.mods.val || 1);
    });

    // Calcular HP (D&D 5e: Classe + CON mod)
    const conMod = Math.floor(((state.attr.con || 10) - 10) / 2);
    let initialHP = cls.hp + conMod;
    
    // Bônus racial de vida (Anão: +1 PV por nível)
    if (state.race === 'anao') initialHP += 1;

    state.hp.max = initialHP;
    state.hp.current = state.hp.max;
    state.mp.max = 10;
    state.mp.current = state.mp.max;

    state.gold = wizardGold;
    state.abilities = `PERÍCIAS: ${wizardSkills.join(', ')}\n\nTESTES DE RESISTÊNCIA: ${cls.saves.join(', ')}\n\n${cls.bonus || ''}`;
    state.inventory = cls.equipment;
    state.isCreated = true;

    addLog(`${state.name} despertou como ${cls.name} ${race.name}!`);
    addLog(`👑 Traço: ${race.trait}`);
    addLog(`⚔️ Perícias: ${wizardSkills.join(', ')}`);
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
        // Não pode ir abaixo do base
        if (state.attr[attr] <= base) return;
        state.attr[attr]--;
        state.freePoints++;
        addLog(`⭐ -1 ${attr.toUpperCase()} (ponto devolvido)`);
    }
    
    // Se mudou CON, atualiza HP Max
    if (attr === 'con') {
        const conMod = Math.floor((state.attr.con - 10) / 2);
        const raceHP = state.race === 'anao' ? state.level : 0;
        state.hp.max = (CLASSES[state.cls]?.hp || 10) + (state.level - 1) * 5 + conMod + raceHP;
        state.hp.current = Math.min(state.hp.current, state.hp.max);
    }
    
    saveState();
    render();
}


function changeLevel(delta) {
    const newLvl = state.level + delta;
    if (newLvl < 1 || newLvl > MAX_LEVEL) return;

    state.level = newLvl;
    
    // Scaling HP D&D 5e style (roughly 5 per level + CON mod)
    const conMod = Math.floor((state.attr.con - 10) / 2);
    const raceHP = state.race === 'anao' ? state.level : 0;
    state.hp.max = (CLASSES[state.cls]?.hp || 10) + (state.level - 1) * 5 + conMod + raceHP;
    
    state.hp.current = Math.min(state.hp.current, state.hp.max);

    if (delta > 0) {
        state.freePoints += 1;
        addLog(`⬆️ Subiu para NVL ${state.level} (+1 ponto de atributo)`);
    } else {
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

        // Role Selection
        const roleCard = t.closest('.role-card');
        if (roleCard) {
            const role = roleCard.dataset.role;
            if (role === 'jogador') {
                goToStep(1);
            } else {
                document.getElementById('creation-screen').classList.remove('active');
                document.getElementById('mestre-view').classList.add('active');
            }
            return;
        }

        // Back to menu from mestre
        if (t.id === 'btn-mestre-back') {
            document.getElementById('mestre-view').classList.remove('active');
            document.getElementById('creation-screen').classList.add('active');
            goToStep(0);
            return;
        }

        // Choice cards
        const card = t.closest('.choice-card');
        if (card) {
            const key = card.dataset.key;
            const id = card.dataset.id;
            
            // Skill selection
            if (card.classList.contains('skill-card')) {
                handleSkillSelection(card.dataset.skill, card);
                return;
            }

            // Racial attribute choice
            if (card.dataset.racialAttr) {
                const attr = card.dataset.racialAttr;
                const race = RACES[state.race];
                const idx = wizardRacialChoice.indexOf(attr);
                if (idx >= 0) {
                    wizardRacialChoice.splice(idx, 1);
                    card.classList.remove('selected');
                } else if (wizardRacialChoice.length < race.mods.choice) {
                    wizardRacialChoice.push(attr);
                    card.classList.add('selected');
                }
                return;
            }

            if (key && id) {
                state[key] = id;
                card.parentElement.querySelectorAll('.choice-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');

                // Racial choice visibility
                if (key === 'race') {
                    const area = document.getElementById('racial-choice-area');
                    const race = RACES[id];
                    wizardRacialChoice = [];
                    if (race.mods?.choice) {
                        area.classList.remove('hidden');
                        document.getElementById('racial-choice-label').textContent = `Escolha ${race.mods.choice} atributos (+${race.mods.val || 1}):`;
                        area.querySelectorAll('.mini').forEach(m => {
                            m.classList.remove('selected');
                            // Para Meio-Elfo, não pode escolher Carisma novamente (já ganha +2)
                            if (id === 'meio_elfo' && m.dataset.racialAttr === 'car') {
                                m.style.opacity = '0.3';
                                m.style.pointerEvents = 'none';
                            } else {
                                m.style.opacity = '1';
                                m.style.pointerEvents = 'auto';
                            }
                        });
                    } else {
                        area.classList.add('hidden');
                    }
                }

                // Class info visibility
                if (key === 'cls') {
                    const info = document.getElementById('class-info-box');
                    const cls = CLASSES[id];
                    info.classList.remove('hidden');
                    document.getElementById('class-saves').innerHTML = `<strong>Testes de Resistência:</strong> ${cls.saves.join(' e ')}`;
                    document.getElementById('class-profs').innerHTML = `<strong>Armas e Armaduras:</strong> ${cls.equipment} <br> <strong>Perícias:</strong> Escolha ${cls.skills} da lista. ${cls.bonus ? `<br> <strong>Bônus:</strong> ${cls.bonus}` : ''}`;
                }
            }
            return;
        }

        // Wizard steps
        if (t.closest('#btn-step-2')) { goToStep(2); return; }
        if (t.closest('#btn-step-3')) { goToStep(3); return; }
        if (t.closest('#btn-step-4')) { goToStep(4); return; }
        if (t.closest('#btn-back-0')) { goToStep(0); return; }
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

        // Botão Descanso
        if (t.closest('#btn-rest')) {
            state.hp.current = state.hp.max;
            state.mp.current = state.mp.max;
            addLog(`🏨 Descanso completo (PV/PM restaurados)`);
            saveState();
            render();
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

    // Wizard select sync
    document.querySelectorAll('.dist-select').forEach(sel => {
        sel.addEventListener('change', handleWizardSelectChange);
    });
}


// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    buildGrids();
    setupEvents();
    render();
});
