/**
 * RPG dos Guri – Engine v11.0 (Multiusuário Real-time)
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

const BACKGROUNDS = {
    acolito: { name: 'Acólito', desc: 'Você serviu em um templo e possui conhecimentos religiosos e rituais.' },
    charlatao: { name: 'Charlatão', desc: 'Um mestre da manipulação e truques, viveu de enganar os outros.' },
    criminoso: { name: 'Criminoso', desc: 'Você tem contatos no submundo e experiência em atividades ilegais.' },
    animador: { name: 'Animador', desc: 'Ator, músico ou gladiador; você sabe como entreter uma plateia.' },
    heroi: { name: 'Herói do Povo', desc: 'Você veio de uma origem humilde e se tornou um defensor dos plebeus.' },
    artesao: { name: 'Artesão de Guilda', desc: 'Membro de uma guilda mercantil, perito em um ofício específico.' },
    eremita: { name: 'Eremita', desc: 'Você viveu em isolamento e descobriu um segredo ou iluminação.' },
    nobre: { name: 'Nobre', desc: 'Você nasceu em uma família influente e possui privilégios sociais.' },
    forasteiro: { name: 'Forasteiro', desc: 'Um sobrevivente das terras selvagens, acostumado a ambientes rudes.' },
    sabio: { name: 'Sábio', desc: 'Um estudioso dedicado à busca pelo conhecimento acadêmico.' },
    marinheiro: { name: 'Marinheiro', desc: 'Um lobo do mar, experiente em navios e navegação.' },
    soldado: { name: 'Soldado', desc: 'Você foi treinado para a guerra e serviu em um exército ou guarda.' },
    orfao: { name: 'Órfão', desc: 'Você cresceu nas ruas, sobrevivendo apenas com sua esperteza.' }
};

const ALIGNMENTS = {
    lb: { name: 'Leal/Bom', desc: 'Age com honra, compaixão e segue a lei.' },
    nb: { name: 'Neutro/Bom', desc: 'Faz o melhor que pode para ajudar os outros.' },
    cb: { name: 'Caótico/Bom', desc: 'Age conforme sua consciência, independente das leis.' },
    ln: { name: 'Leal/Neutro', desc: 'Age conforme a lei, tradição ou código pessoal.' },
    nn: { name: 'Neutro', desc: 'Afastado de dilemas morais; age com pragmatismo.' },
    cn: { name: 'Caótico/Neutro', desc: 'Segue seus caprichos; preza a liberdade individual.' },
    lm: { name: 'Leal/Mau', desc: 'Toma o que quer dentro dos limites de um código ou lei.' },
    nm: { name: 'Neutro/Mau', desc: 'Faz qualquer coisa para conseguir o que quer, sem escrúpulos.' },
    cm: { name: 'Caótico/Mau', desc: 'Age com violência impulsiva e sede de poder.' }
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

// ==================== REAL-TIME SETUP ====================
let socket;
try { socket = io(); } catch(e) { console.warn("Socket.io não disponível."); }

let isMaster = false;
let connectedPlayers = {}; // { socketId: state }
let masterEditingId = null; // ID do jogador que o mestre está editando agora

// ==================== STATE ====================
let state = getDefaultState();

// Temporal wizard state
let wizardData = {
    active: false,
    step: 1,
    name: '', race: '', cls: '',
    bg: '', align: '', photo: '',
    personality: { traits: '', ideals: '', bonds: '', flaws: '' },
    attr: { for: 0, des: 0, con: 0, int: 0, sab: 0, car: 0 },
    skills: []
};

let wizardSelection = null; // Controle de seleção do array de atributos

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
        armors: [],
        utility: [],
        gold: 0,
        rpTraits: '',
        rpIdeals: '',
        rpBonds: '',
        rpFlaws: '',
        rpFeats: '',
        deathSaves: { success: 0, fail: 0 }
    };
}

// ==================== SYNC LOGIC ====================
function broadcastChange() {
    if (!socket) return;
    if (isMaster && masterEditingId) {
        socket.emit('masterUpdatePlayer', { targetId: masterEditingId, data: state });
    } else if (!isMaster && state.isCreated) {
        socket.emit('playerUpdate', state);
    }
}

// Para não sobrecarregar o servidor com cada tecla digitada nos textareas
const debounceSync = debounce(() => {
    broadcastChange();
    saveState();
}, 800);

function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Escutas do Socket
if (socket) {
    // Mestre recebe lista de jogadores
    socket.on('updatePlayersList', (players) => {
        connectedPlayers = players;
        if (isMaster) renderMasterPanel();
    });

    // Mestre recebe atualização de algum jogador
    socket.on('playerChanged', ({ id, data }) => {
        connectedPlayers[id] = data;
        if (isMaster) {
            renderMasterPanel();
            // Se o mestre estiver vendo a ficha desse cara, atualiza a tela
            if (masterEditingId === id) {
                state = data;
                renderSheet();
            }
        }
    });

    // Jogador recebe atualização vinda do Mestre
    socket.on('serverUpdateSheet', (updatedData) => {
        if (!isMaster) {
            state = updatedData;
            saveState();
            renderSheet();
        }
    });
}

// ==================== APP LOGIC ====================
function init() {
    loadState();
    buildGrids();
    setupEvents();
    render();

    // Se já tiver ficha, identifica no servidor
    if (socket && state.isCreated && !isMaster) {
        socket.emit('playerIdentify', state);
    }
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
    const $ = id => document.getElementById(id);
    const roleSel = $('role-selection');
    const creation = $('creation-screen');
    const masterPanel = $('master-panel');
    const sheet = $('sheet-view');

    // Hide everything
    [roleSel, creation, masterPanel, sheet].forEach(el => {
        if (el) el.classList.remove('active');
    });

    if (isMaster) {
        if (masterEditingId) {
            if (sheet) {
                sheet.classList.add('active');
                renderSheet();
            }
        } else {
            if (masterPanel) {
                masterPanel.classList.add('active');
                renderMasterPanel();
            }
        }
    } else if (!state.isCreated) {
        if (wizardData.active) {
            if (creation) creation.classList.add('active');
        } else {
            if (roleSel) roleSel.classList.add('active');
        }
    } else {
        if (sheet) {
            sheet.classList.add('active');
            renderSheet();
        }
    }
}

function renderMasterPanel() {
    const grid = document.getElementById('master-grid');
    if (!grid) return;

    const ids = Object.keys(connectedPlayers);
    if (ids.length === 0) {
        grid.innerHTML = '<div class="muted-text cinzel" style="grid-column: 1/-1; text-align: center; padding: 3rem;">Aguardando jogadores entrarem...</div>';
        return;
    }

    grid.innerHTML = ids.map(id => {
        const p = connectedPlayers[id];
        return `
            <div class="choice-card player-card" onclick="openPlayerSheet('${id}')">
                <div class="char-portrait-container" style="width: 60px; height: 60px; margin: 0 auto 1rem;">
                    ${p.photo ? `<img src="${p.photo}" class="char-portrait" style="display:block">` : '👤'}
                </div>
                <strong style="display:block; margin-bottom: 0.3rem;">${p.name || 'Sem Nome'}</strong>
                <div class="muted-text" style="font-size: 0.7rem; text-transform: uppercase;">
                    ${CLASSES[p.cls]?.name || '---'} • Nível ${p.level}
                </div>
                <div style="margin-top: 1rem; font-weight: 900; color: var(--red);">
                    HP: ${p.hp.current} / ${p.hp.max}
                </div>
            </div>
        `;
    }).join('');
}

window.openPlayerSheet = function(id) {
    masterEditingId = id;
    state = connectedPlayers[id];
    
    // Remove read-only para o mestre poder editar tudo
    const container = document.getElementById('sheet-container');
    if (container) container.classList.remove('read-only');
    
    render();
};

function renderSheet() {
    const $ = id => document.getElementById(id);
    const isEditing = isMaster || !document.getElementById('sheet-container').classList.contains('read-only');

    // 1. Header
    $('display-name').value = state.name;
    const raceName = RACES[state.race]?.name || '---';
    const clsName = CLASSES[state.cls]?.name || '---';

    if ($('display-class')) $('display-class').textContent = clsName;
    if ($('display-race')) $('display-race').textContent = raceName;
    if ($('display-level')) $('display-level').textContent = `Nível ${state.level}`;

    const pImg = $('display-photo');
    if (pImg) {
        if (state.photo) {
            pImg.src = state.photo;
            pImg.style.display = 'block';
        } else {
            pImg.style.display = 'none';
        }
    }

    if ($('display-bg')) {
        $('display-bg').value = state.bg || '---';
        $('display-bg').style.height = 'auto';
        $('display-bg').style.height = $('display-bg').scrollHeight + 'px';
    }
    if ($('display-align')) {
        $('display-align').value = state.align || '---';
        $('display-align').style.height = 'auto';
        $('display-align').style.height = $('display-align').scrollHeight + 'px';
    }

    if ($('display-xp')) {
        $('display-xp').textContent = `XP ${state.xp}`;
        if (isMaster) $('display-xp').classList.add('master-editable');
        else $('display-xp').classList.remove('master-editable');
    }
    if ($('display-level')) {
        if (isMaster) $('display-level').classList.add('master-editable');
        else $('display-level').classList.remove('master-editable');
    }

    // Unlock fields for Master (except protected)
    document.querySelectorAll('#sheet-view input, #sheet-view textarea').forEach(el => {
        if (isMaster && !el.classList.contains('protected-field')) {
            el.removeAttribute('readonly');
        } else if (!isMaster && !isEditing) {
            el.setAttribute('readonly', true);
        }
    });

    // 2. Attributes
    const attrs = ['for', 'des', 'con', 'int', 'sab', 'car'];
    attrs.forEach(a => {
        const valEl = $(`val-${a}`);
        const modEl = $(`mod-${a}`);
        const parent = valEl ? valEl.closest('.attr-block') : null;
        
        if (parent) {
            if (isMaster) parent.classList.add('master-editable');
            else parent.classList.remove('master-editable');
        }
        
        const val = state.attr[a];
        const mod = Math.floor((val - 10) / 2);
        const modStr = (mod >= 0 ? '+' : '') + mod;

        if (valEl) valEl.textContent = val;
        if (modEl) modEl.textContent = modStr;
    });

    // 3. Stats
    const inspEl = $('check-inspiration');
    if (inspEl) inspEl.className = 'attr-circle' + (state.inspiration ? ' active' : '');
    
    const profBonus = Math.ceil(state.level / 4) + 1;
    $('prof-bonus').textContent = '+' + profBonus;

    renderSaves(profBonus);
    renderSkills(profBonus);

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

    // 6. Attacks & Armors & Utility Buttons
    if ($('add-attack')) $('add-attack').style.display = isMaster ? 'block' : 'none';
    if ($('add-armor')) $('add-armor').style.display = isMaster ? 'block' : 'none';
    if ($('add-utility')) $('add-utility').style.display = isMaster ? 'block' : 'none';
    if ($('btn-reset-char')) $('btn-reset-char').style.display = 'block'; // Liberado para todos

    const attacksEl = $('attacks-list');
    if (attacksEl) {
        const gridCols = isMaster ? '2fr 1fr 1fr 40px' : '2fr 1fr 1fr';
        attacksEl.innerHTML = `
            <div class="attacks-header" style="grid-template-columns: ${gridCols};">
                <span>Nome</span>
                <span>Bônus</span>
                <span>Qtde</span>
                ${isMaster ? '<span></span>' : ''}
            </div>
            ${(state.attacks || []).map((atk, i) => `
                <div class="attack-row" style="grid-template-columns: ${gridCols};">
                    <span>${atk.name}</span>
                    <span>${atk.bonus}</span>
                    <span>${atk.qty || ''}</span>
                    ${isMaster ? `<button class="btn-ghost" style="padding:0; border:none; color:var(--red); font-size:1.2rem;" onclick="removeAttack(${i})">×</button>` : ''}
                </div>
            `).join('')}
        `;
    }

    // 6.1 Armors
    const armorsEl = $('armors-list');
    if (armorsEl) {
        const gridCols = isMaster ? '2fr 1fr 1fr 40px' : '2fr 1fr 1fr';
        armorsEl.innerHTML = `
            <div class="attacks-header" style="grid-template-columns: ${gridCols};">
                <span>Nome</span>
                <span>Bônus</span>
                <span>Qtde</span>
                ${isMaster ? '<span></span>' : ''}
            </div>
            ${(state.armors || []).map((arm, i) => `
                <div class="armor-row" style="grid-template-columns: ${gridCols};">
                    <span>${arm.name}</span>
                    <span>${arm.bonus}</span>
                    <span>${arm.qty || ''}</span>
                    ${isMaster ? `<button class="btn-ghost" style="padding:0; border:none; color:var(--red); font-size:1.2rem;" onclick="removeArmor(${i})">×</button>` : ''}
                </div>
            `).join('')}
        `;
    }

    // 6.2 Utility
    const utilityEl = $('utility-list');
    if (utilityEl) {
        const gridCols = isMaster ? '2fr 1fr 1fr 40px' : '2fr 1fr 1fr';
        utilityEl.innerHTML = `
            <div class="attacks-header" style="grid-template-columns: ${gridCols};">
                <span>Nome</span>
                <span>Bônus</span>
                <span>Qtde</span>
                ${isMaster ? '<span></span>' : ''}
            </div>
            ${(state.utility || []).map((ut, i) => `
                <div class="utility-row" style="grid-template-columns: ${gridCols};">
                    <span>${ut.name}</span>
                    <span>${ut.bonus || ''}</span>
                    <span>${ut.qty || ''}</span>
                    ${isMaster ? `<button class="btn-ghost" style="padding:0; border:none; color:var(--red); font-size:1.2rem;" onclick="removeUtility(${i})">×</button>` : ''}
                </div>
            `).join('')}
        `;
    }

    if ($('gold-po')) $('gold-po').value = state.gold;
    if ($('rp-traits')) {
        $('rp-traits').value = state.rpTraits;
        $('rp-traits').style.height = 'auto';
        $('rp-traits').style.height = $('rp-traits').scrollHeight + 'px';
    }
    if ($('rp-ideals')) {
        $('rp-ideals').value = state.rpIdeals;
        $('rp-ideals').style.height = 'auto';
        $('rp-ideals').style.height = $('rp-ideals').scrollHeight + 'px';
    }
    if ($('rp-bonds')) {
        $('rp-bonds').value = state.rpBonds;
        $('rp-bonds').style.height = 'auto';
        $('rp-bonds').style.height = $('rp-bonds').scrollHeight + 'px';
    }
    if ($('rp-flaws')) {
        $('rp-flaws').value = state.rpFlaws;
        $('rp-flaws').style.height = 'auto';
        $('rp-flaws').style.height = $('rp-flaws').scrollHeight + 'px';
    }
}

function renderSaves(profBonus) {
    const attrs = ['for', 'des', 'con', 'int', 'sab', 'car'];
    document.getElementById('saves-list').innerHTML = attrs.map(a => {
        const isProf = state.saves.includes(a);
        const mod = Math.floor((state.attr[a] - 10) / 2);
        const total = mod + (isProf ? profBonus : 0);
        return `
            <div class="skill-row" onclick="toggleSave('${a}')">
                <div class="dot-check ${isProf ? 'active' : ''}"></div>
                <span class="skill-val">${(total >= 0 ? '+' : '') + total}</span>
                <span class="skill-name">${a.toUpperCase()}</span>
            </div>
        `;
    }).join('');
}

function renderSkills(profBonus) {
    document.getElementById('skills-list').innerHTML = SKILLS.map(s => {
        const isProf = state.profs.includes(s.id);
        const mod = Math.floor((state.attr[s.attr] - 10) / 2);
        const total = mod + (isProf ? profBonus : 0);
        return `
            <div class="skill-row" onclick="toggleSkill('${s.id}')">
                <div class="dot-check ${isProf ? 'active' : ''}"></div>
                <span class="skill-val">${(total >= 0 ? '+' : '') + total}</span>
                <span class="skill-name">${s.name} <small style="color:#555">(${s.attr.toUpperCase()})</small></span>
            </div>
        `;
    }).join('');
}

// ==================== WIZARD & BUILDER ====================
function buildGrids() {
    renderChoiceGrid('race-grid', RACES, wizardData.race, 'race');
    renderChoiceGrid('class-grid', CLASSES, wizardData.cls, 'cls');
    renderAttributeDrafter();
}

function renderChoiceGrid(containerId, data, selectedKey, type) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = Object.entries(data).map(([key, val]) => `
        <div class="choice-card ${selectedKey === key ? 'selected' : ''}" data-key="${type}" data-id="${key}">
            <strong>${val.name}</strong>
        </div>
    `).join('');
}

function renderAttributeDrafter() {
    const pool = document.getElementById('available-values-pool');
    if (!pool) return;
    const usedValues = Object.values(wizardData.attr).filter(v => v !== 0);
    pool.innerHTML = STANDARD_ARRAY.map(v => `
        <div class="array-chip ${usedValues.includes(v) ? 'used' : ''} ${wizardSelection === v ? 'selected' : ''}" 
             onclick="selectFromPool(${v})">${v}</div>
    `).join('');
    document.querySelectorAll('.attr-slot').forEach(slot => {
        const attr = slot.dataset.attr;
        const val = wizardData.attr[attr];
        slot.className = `attr-slot ${val !== 0 ? 'filled' : ''} ${wizardSelection ? 'active-target' : ''}`;
        slot.querySelector('.slot-display').textContent = val !== 0 ? val : '---';
        slot.onclick = () => assignToSlot(attr);
    });
}

window.selectFromPool = (v) => { 
    wizardSelection = (wizardSelection === v ? null : v); 
    renderAttributeDrafter(); 
};

window.assignToSlot = (a) => { 
    // Se clicar no slot com um valor selecionado, atribui.
    // Se clicar sem nada selecionado, "desatribui" (volta pro pool).
    if (wizardSelection) {
        wizardData.attr[a] = wizardSelection; 
        wizardSelection = null; 
    } else {
        wizardData.attr[a] = 0; 
    }
    renderAttributeDrafter(); 
};

function goToStep(n) {
    if (n > wizardData.step) {
        // Validação ao avançar
        if (wizardData.step === 1) {
            const name = document.getElementById('create-name').value.trim();
            if (!name) { alert("Dê um nome ao seu herói!"); return; }
            if (!wizardData.race) { alert("Escolha uma Raça!"); return; }
        }
        if (wizardData.step === 2) {
            if (!wizardData.cls) { alert("Escolha uma Classe!"); return; }
        }
        if (wizardData.step === 4) {
            const unset = Object.entries(wizardData.attr).filter(([k, v]) => v === 0);
            if (unset.length > 0) {
                alert(`Distribua todos os valores! Faltam: ${unset.map(u => u[0].toUpperCase()).join(', ')}`);
                return;
            }
        }
    }

    wizardData.step = n;
    if (n === 3) {
        loadSkillChoices();
    }
    if (n === 4) renderAttributeDrafter();
    if (n === 5) {
        if (Object.values(wizardData.attr).filter(v => v !== 0).length < 6) { alert("Distribua todos os valores!"); return; }
    }
    document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('active'));
    const step = document.getElementById('step-' + n);
    if (step) step.classList.add('active');
}

function loadSkillChoices() {
    const cls = CLASSES[wizardData.cls];
    let maxPicks = cls.skillChoices;
    let allowed = cls.allowSkills;

    if (wizardData.race === 'meio_elfo') {
        maxPicks += 2;
        allowed = 'all';
    }

    const limitText = document.getElementById('skills-limit-text');
    if (limitText) {
        limitText.textContent = `Escolha ${wizardData.skills.length} / ${maxPicks} perícias (Faltam ${maxPicks - wizardData.skills.length}):`;
        limitText.dataset.max = maxPicks;
    }

    const grid = document.getElementById('skills-selection-grid');
    if (grid) {
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
}

function finishCreation() {
    const name = document.getElementById('create-name').value.trim();
    const bg = document.getElementById('create-bg').value.trim();
    const align = document.getElementById('create-align').value.trim();

    if (!name || !wizardData.race || !wizardData.cls) {
        alert('Complete todas as seleções do registro!');
        return;
    }

    // Capturar dados de personalidade do formulário
    wizardData.personality.traits = document.getElementById('create-traits').value.trim();
    wizardData.personality.ideals = document.getElementById('create-ideals').value.trim();
    wizardData.personality.bonds = document.getElementById('create-bonds').value.trim();
    wizardData.personality.flaws = document.getElementById('create-flaws').value.trim();

    const fileInput = document.getElementById('create-photo');
    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => finalizeWizard(name, bg, align, e.target.result);
        reader.readAsDataURL(fileInput.files[0]);
    } else finalizeWizard(name, bg, align, '');
}

function finalizeWizard(name, bg, align, photo) {
    state = getDefaultState();
    state.isCreated = true;
    state.name = name;
    state.race = wizardData.race;
    state.cls = wizardData.cls;
    state.photo = photo;
    state.attr = { ...wizardData.attr };
    state.profs = [...wizardData.skills];
    state.bg = bg || '---';
    state.align = align || '---';
    state.rpTraits = wizardData.personality.traits || '';
    state.rpIdeals = wizardData.personality.ideals || '';
    state.rpBonds = wizardData.personality.bonds || '';
    state.rpFlaws = wizardData.personality.flaws || '';

    const race = RACES[state.race];
    const cls = CLASSES[state.cls];
    state.speed = race.speed;
    state.hp.max = cls.hp + Math.floor((state.attr.con - 10) / 2);
    state.hp.current = state.hp.max;
    state.hd = '1' + cls.hd.substring(1);
    state.saves = [...cls.saves];
    state.rpFeats = `[RAÇA: ${race.name}]\n- ${race.modsDesc}\n- ${race.feature}\n\n[CLASSE: ${cls.name}]\n- Armaduras: ${cls.armor}`;
    
    saveState();
    if (socket) socket.emit('playerIdentify', state);
    render();
}

// ==================== INTERACTIVE SHEET EVENTS ====================
function setupEvents() {
    document.addEventListener('click', e => {
        const t = e.target;

        // Role Choice
        const rCard = t.closest('.choice-card[data-role]');
        if (rCard) {
            console.log("Role selected:", rCard.dataset.role);
            if (rCard.dataset.role === 'mestre') {
                isMaster = true;
            } else {
                wizardData.active = true;
            }
            render();
            return;
        }

        if (t.id === 'btn-master-exit' || t.id === 'btn-back-to-role') {
            isMaster = false;
            wizardData.active = false;
            masterEditingId = null;
            render();
            return;
        }

        // Sheet Logic (Click to update)
        if (t.id === 'check-inspiration') {
            state.inspiration = !state.inspiration;
            renderSheet();
            broadcastChange();
        }

        if (t.id === 'hp-text') {
            const val = prompt("Alterar Atuais PV:", state.hp.current);
            if (val !== null) {
                state.hp.current = parseInt(val) || 0;
                renderSheet();
                broadcastChange();
            }
        }

        if (t.id === 'btn-reset-char') {
            if (confirm('Tem certeza que deseja resetar TUDO? Isso não pode ser desfeito.')) {
                state = getDefaultState();
                render();
                broadcastChange();
            }
        }

        if (t.id === 'add-attack') {
            if (!isMaster) return;
            const n = prompt("Nome da Arma/Magia:");
            if (!n) return;
            const b = prompt("Bônus:");
            const q = prompt("Quantidade:");
            state.attacks.push({ name: n, bonus: b, qty: q });
            renderSheet();
            broadcastChange();
        }

        if (t.id === 'add-armor') {
            if (!isMaster) return;
            const n = prompt("Nome do Item:");
            if (!n) return;
            const b = prompt("Bônus:");
            const q = prompt("Quantidade:");
            state.armors = state.armors || [];
            state.armors.push({ name: n, bonus: b, qty: q });
            renderSheet();
            broadcastChange();
        }

        if (t.id === 'add-utility') {
            if (!isMaster) return;
            const n = prompt("Nome do Item:");
            if (!n) return;
            const b = prompt("Bônus:");
            const q = prompt("Quantidade:");
            state.utility = state.utility || [];
            state.utility.push({ name: n, bonus: b, qty: q });
            renderSheet();
            broadcastChange();
        }

        // Navegação do footer
        if (t.classList.contains('nav-btn')) {
            const viewId = t.dataset.view;
            if (viewId) {
                switchView(viewId);
            }
        }

        // Master Prompts for Stats (since they are not inputs)
        if (isMaster) {
            if (t.closest('.attr-block[data-attr]')) {
                const attrKey = t.closest('.attr-block').dataset.attr;
                const val = prompt(`Mudar valor de ${attrKey.toUpperCase()}:`, state.attr[attrKey]);
                if (val !== null) { state.attr[attrKey] = parseInt(val) || 0; renderSheet(); broadcastChange(); }
            }
            if (t.id === 'display-level') {
                const val = prompt("Mudar Nível:", state.level);
                if (val !== null) { state.level = parseInt(val) || 1; renderSheet(); broadcastChange(); }
            }
            if (t.id === 'display-xp') {
                const val = prompt("Mudar XP (0 a 5):", state.xp);
                if (val !== null) { state.xp = parseInt(val) || 0; renderSheet(); broadcastChange(); }
            }
        }

        // Wizard Nav
        if (t.id?.startsWith('btn-step-')) goToStep(parseInt(t.id.split('-')[2]));
        if (t.id?.startsWith('btn-back-')) goToStep(parseInt(t.id.split('-')[2]));
        if (t.id === 'btn-finish') finishCreation();

        // Choice Cards (Race/Class/Skills)
        const cCard = t.closest('.choice-card[data-id]');
        if (cCard && !cCard.classList.contains('choice-skill')) {
            const key = cCard.dataset.key; // 'race', 'cls'
            wizardData[key] = cCard.dataset.id;
            cCard.parentElement.querySelectorAll('.choice-card').forEach(c => c.classList.remove('selected'));
            cCard.classList.add('selected');

            // Render Preview Text (Fixed!)
            let boxId = '';
            let content = '';
            
            if (key === 'race') {
                const r = RACES[cCard.dataset.id];
                boxId = 'race-desc-box';
                content = `<strong>${r.name}</strong><br><span style="color:var(--gold); font-size:0.8rem;">${r.modsDesc}</span><br><em style="font-size:0.9rem;">${r.feature}</em>`;
            } else if (key === 'cls') {
                const c = CLASSES[cCard.dataset.id];
                boxId = 'class-desc-box';
                content = `<strong>${c.name} (d${c.hd.substring(2)})</strong><br><span style="color:var(--gold); font-size:0.8rem;">Perícias: ${c.skillsDesc}</span><br><em style="font-size:0.9rem;">Equipamento: ${c.armor}</em>`;
            }

            const box = document.getElementById(boxId);
            if (box) box.innerHTML = content;
        }

        const sCard = t.closest('.choice-skill');
        if (sCard) {
            const sid = sCard.dataset.skill;
            const limitText = document.getElementById('skills-limit-text');
            const max = parseInt(limitText?.dataset.max || 0);

            if (wizardData.skills.includes(sid)) {
                wizardData.skills = wizardData.skills.filter(i => i !== sid);
            } else if (wizardData.skills.length < max) {
                wizardData.skills.push(sid);
            } else {
                alert(`Você só pode escolher ${max} perícias!`);
                return;
            }
            sCard.classList.toggle('selected');
            if (limitText) {
                limitText.textContent = `Escolha ${wizardData.skills.length} / ${max} perícias (Faltam ${max - wizardData.skills.length}):`;
            }
        }

        // Death Saves
        if (t.classList.contains('ds-success')) { state.deathSaves.success = (state.deathSaves.success + 1) % 4; renderSheet(); broadcastChange(); }
        if (t.classList.contains('ds-fail')) { state.deathSaves.fail = (state.deathSaves.fail + 1) % 4; renderSheet(); broadcastChange(); }
    });

    // Input Sync for text/numbers
    document.addEventListener('input', e => {
        const id = e.target.id;
        const val = e.target.value;

        if (id === 'display-name') state.name = val;
        if (id === 'display-ac') state.ac = parseInt(val) || 10;
        if (id === 'display-hd') state.hd = val;
        if (id === 'display-bg') state.bg = val;
        if (id === 'display-align') state.align = val;
        if (id === 'gold-po') state.gold = parseInt(val) || 0;
        if (id === 'inventory-list') state.inventory = val;
        if (id?.startsWith('rp-')) {
            if (id === 'rp-traits') state.rpTraits = val;
            if (id === 'rp-ideals') state.rpIdeals = val;
            if (id === 'rp-bonds') state.rpBonds = val;
            if (id === 'rp-flaws') state.rpFlaws = val;
            if (id === 'rp-feats') state.rpFeats = val;
        }

        // Auto-resize textareas no bloco 7
        if (['display-bg', 'display-align', 'rp-traits', 'rp-ideals', 'rp-bonds', 'rp-flaws'].includes(id)) {
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
        }

        debounceSync();
    });
}

window.toggleSave = (a) => {
    if (state.saves.includes(a)) state.saves = state.saves.filter(x => x !== a);
    else state.saves.push(a);
    renderSheet(); broadcastChange();
};

window.toggleSkill = (sid) => {
    if (state.profs.includes(sid)) state.profs = state.profs.filter(x => x !== sid);
    else state.profs.push(sid);
    renderSheet(); broadcastChange();
};

window.removeAttack = (i) => {
    state.attacks.splice(i, 1);
    renderSheet(); broadcastChange();
};

window.removeArmor = (i) => {
    state.armors.splice(i, 1);
    renderSheet(); broadcastChange();
};

window.removeUtility = (i) => {
    state.utility.splice(i, 1);
    renderSheet(); broadcastChange();
};

// ==================== NAVEGAÇÃO ====================
let currentView = 'sheet-view';

function switchView(viewId) {
    // Esconder todas as telas
    document.querySelectorAll('.full-screen-modal').forEach(el => {
        el.classList.remove('active');
    });

    // Mostrar a tela selecionada
    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.classList.add('active');
        currentView = viewId;
    }

    // Atualizar botões de navegação
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.view === viewId) {
            btn.classList.add('active');
        }
    });

    // Se mudou para tela de itens, renderizar as listas
    if (viewId === 'items-view') {
        renderItems();
    }
}

function renderItems() {
    const isMaster = state && state.isMaster;
    const gridCols = isMaster ? '2fr 1fr 1fr 40px' : '2fr 1fr 1fr';

    // Arsenal Ofensivo
    const attacksEl = document.getElementById('attacks-list');
    if (attacksEl) {
        attacksEl.innerHTML = `
            <div class="attacks-header" style="grid-template-columns: ${gridCols};">
                <span>Nome</span>
                <span>Bônus</span>
                <span>Qtde</span>
                ${isMaster ? '<span></span>' : ''}
            </div>
            ${(state.attacks || []).map((atk, i) => `
                <div class="attack-row" style="grid-template-columns: ${gridCols};">
                    <span>${atk.name}</span>
                    <span>${atk.bonus}</span>
                    <span>${atk.qty || ''}</span>
                    ${isMaster ? `<button class="btn-ghost" style="padding:0; border:none; color:var(--red); font-size:1.2rem;" onclick="removeAttack(${i})">×</button>` : ''}
                </div>
            `).join('')}
        `;
    }

    // Defensivo
    const armorsEl = document.getElementById('armors-list');
    if (armorsEl) {
        armorsEl.innerHTML = `
            <div class="attacks-header" style="grid-template-columns: ${gridCols};">
                <span>Nome</span>
                <span>Bônus</span>
                <span>Qtde</span>
                ${isMaster ? '<span></span>' : ''}
            </div>
            ${(state.armors || []).map((arm, i) => `
                <div class="armor-row" style="grid-template-columns: ${gridCols};">
                    <span>${arm.name}</span>
                    <span>${arm.bonus}</span>
                    <span>${arm.qty || ''}</span>
                    ${isMaster ? `<button class="btn-ghost" style="padding:0; border:none; color:var(--red); font-size:1.2rem;" onclick="removeArmor(${i})">×</button>` : ''}
                </div>
            `).join('')}
        `;
    }

    // Inventário
    const utilityEl = document.getElementById('utility-list');
    if (utilityEl) {
        utilityEl.innerHTML = `
            <div class="attacks-header" style="grid-template-columns: ${gridCols};">
                <span>Nome</span>
                <span>Bônus</span>
                <span>Qtde</span>
                ${isMaster ? '<span></span>' : ''}
            </div>
            ${(state.utility || []).map((ut, i) => `
                <div class="utility-row" style="grid-template-columns: ${gridCols};">
                    <span>${ut.name}</span>
                    <span>${ut.bonus || ''}</span>
                    <span>${ut.qty || ''}</span>
                    ${isMaster ? `<button class="btn-ghost" style="padding:0; border:none; color:var(--red); font-size:1.2rem;" onclick="removeUtility(${i})">×</button>` : ''}
                </div>
            `).join('')}
        `;
    }

    // Mostrar/esconder botões de adicionar
    const addAttack = document.getElementById('add-attack');
    const addArmor = document.getElementById('add-armor');
    const addUtility = document.getElementById('add-utility');
    if (addAttack) addAttack.style.display = isMaster ? 'block' : 'none';
    if (addArmor) addArmor.style.display = isMaster ? 'block' : 'none';
    if (addUtility) addUtility.style.display = isMaster ? 'block' : 'none';
}

// Start - expor função para ser chamada após carregar templates
window.initApp = init;
