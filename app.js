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
const MASTER_STORAGE_KEY = 'rpg_guri_master_v1';

// ==================== REAL-TIME SETUP ====================
let socket;
try { socket = io(); } catch(e) { console.warn("Socket.io não disponível."); }

let isMaster = false;
let connectedPlayers = {}; // { socketId: state }
let masterEditingId = null; // ID do jogador ou NPC que o mestre está editando agora
let masterEditingType = 'player'; // 'player' ou 'npc'
let isCreatingNPC = false; // Flag para saber se o Wizard está criando um NPC ou um Personagem

// ==================== STATE ====================
let state = getDefaultState();
let masterState = loadMasterState();

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
        initiativeRoll: 0,
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

function loadMasterState() {
    const defaults = {
        activeTab: 'players',
        initiative: [], // { name, val, id }
        notes: '',
        logHistory: [],
        npcs: [] // Lista de fichas de NPCs (Bestiário)
    };
    
    const raw = localStorage.getItem(MASTER_STORAGE_KEY);
    if (!raw) return defaults;

    try {
        const loaded = JSON.parse(raw);
        // Merge profundo simples para garantir que arrays existam
        return {
            ...defaults,
            ...loaded,
            initiative: loaded.initiative || [],
            logHistory: loaded.logHistory || [],
            npcs: loaded.npcs || []
        };
    } catch (e) {
        console.error("Erro ao carregar dados do Mestre:", e);
        return defaults;
    }
}

function saveMasterState() {
    localStorage.setItem(MASTER_STORAGE_KEY, JSON.stringify(masterState));
}

// ==================== SYNC LOGIC ====================
function broadcastChange() {
    if (!socket || masterEditingType === 'npc') return; // NPCs não são sincronizados via rede, são locais ao mestre
    if (isMaster && masterEditingId) {
        socket.emit('masterUpdatePlayer', { targetId: masterEditingId, data: state });
    } else if (!isMaster && state.isCreated) {
        socket.emit('playerUpdate', state);
    }
}

// Helper para enviar mensagens automáticas ao log
function sendSystemLog(msg) {
    if (!socket) return;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Envia para todos
    socket.emit('sendMessage', msg);

    // Salva no histórico do mestre para persistência (Audit Log)
    masterState.logHistory.push({ timestamp, text: msg });
    saveMasterState();
    
    // Se estiver na aba de login, renderiza na hora
    if (isMaster && masterState.activeTab === 'log') renderLogHistory();
}

// Para não sobrecarregar o servidor com cada tecla digitada nos textareas
const debounceSync = debounce(() => {
    broadcastChange();
    saveState();
}, 800);

const debounceGoldLog = debounce((name, gold) => {
    sendSystemLog(`💰 <strong>${name}</strong> agora tem <strong>${gold} po</strong>.`);
}, 2000);

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

    // --- RECEBIMENTO DE LOG E ALERTAS ---
    socket.on('newLogEntry', ({ timestamp, text }) => {
        const wrapper = document.getElementById('master-log-wrapper');
        const content = document.getElementById('master-log-content');
        if (!wrapper || !content) return;

        wrapper.classList.remove('hidden');
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.innerHTML = `<div class="log-time">${timestamp}</div><div>${text}</div>`;
        content.prepend(entry);
        
        // Auto-scroll para o topo se houver muitos
        content.scrollTop = 0;
    });

    socket.on('incomingAlert', (text) => {
        const banner = document.getElementById('global-alert-banner');
        if (!banner) return;
        banner.textContent = text;
        banner.classList.remove('hidden');
        
        // Esconde após 8 segundos
        setTimeout(() => banner.classList.add('hidden'), 8000);
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
    if (isMaster && masterEditingType === 'npc') {
        const idx = masterState.npcs.findIndex(n => n.id == masterEditingId);
        if (idx !== -1) {
            masterState.npcs[idx] = { ...state };
            saveMasterState();
        }
    } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
}

function render() {
    const $ = id => document.getElementById(id);
    const roleSel = $('role-selection');
    const creation = $('creation-screen');
    const masterPanel = $('master-panel');
    const sheet = $('sheet-view');
    const items = $('items-view');
    const history = $('history-view');

    // Hide everything
    [roleSel, creation, masterPanel, sheet, items, history].forEach(el => {
        if (el) el.classList.remove('active');
    });

    if (isMaster) {
        if (isCreatingNPC) {
            if (creation) creation.classList.add('active');
        } else if (masterEditingId) {
            const targetView = $(currentView) || sheet;
            if (targetView) targetView.classList.add('active');
            renderSheet();
            if (currentView === 'items-view') renderItems();
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
        const targetView = $(currentView) || sheet;
        if (targetView) targetView.classList.add('active');
        renderSheet();
        if (currentView === 'items-view') renderItems();
    }

    // Atualizar botões de navegação
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.view === currentView) {
            btn.classList.add('active');
        }
    });
}

function renderMasterPanel() {
    const grid = document.getElementById('master-grid');
    if (!grid) return;

    // 1. Jogadores Conectados com Barras de HP
    const ids = Object.keys(connectedPlayers);
    if (ids.length === 0) {
        grid.innerHTML = '<div class="muted-text cinzel" style="grid-column: 1/-1; text-align: center; padding: 3rem;">Aguardando jogadores entrarem...</div>';
    } else {
        grid.innerHTML = ids.map(id => {
            const p = connectedPlayers[id];
            const hpPercent = Math.max(0, Math.min(100, (p.hp.current / p.hp.max) * 100));
            let hpClass = '';
            if (hpPercent < 25) hpClass = 'danger';
            else if (hpPercent < 50) hpClass = 'warning';

            return `
                <div class="choice-card player-card" onclick="openPlayerSheet('${id}')">
                    <div class="char-portrait-container" style="width: 50px; height: 50px; margin: 0 auto 1rem; font-size: 1.2rem;">
                        ${p.photo ? `<img src="${p.photo}" class="char-portrait" style="display:block">` : '👤'}
                    </div>
                    <strong style="display:block; margin-bottom: 0.3rem; font-size: 0.9rem;">${p.name || 'Sem Nome'}</strong>
                    <div class="muted-text" style="font-size: 0.65rem; text-transform: uppercase;">
                        ${CLASSES[p.cls]?.name || '---'} • Nível ${p.level}
                    </div>
                    
                    <div class="hp-bar-container">
                        <div class="hp-bar-fill ${hpClass}" style="width: ${hpPercent}%"></div>
                    </div>
                    <div style="margin-top: 0.5rem; font-size: 0.75rem; font-weight: 700;">
                        HP: ${p.hp.current} / ${p.hp.max}
                    </div>
                </div>
            `;
        }).join('');
    }

    // 2. Sincronizar Abas e Conteúdo
    document.querySelectorAll('.m-nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === masterState.activeTab);
    });
    document.querySelectorAll('.m-tab-content').forEach(tab => {
        tab.classList.toggle('active', tab.id === `m-tab-${masterState.activeTab}`);
    });

    // 3. Renderizar Ferramentas
    if (masterState.activeTab === 'initiative') renderInitiative();
    if (masterState.activeTab === 'bestiary') renderBestiary();
    if (masterState.activeTab === 'log') renderLogHistory();
    if (masterState.activeTab === 'notes') {
        const notesArea = document.getElementById('master-private-notes');
        if (notesArea) notesArea.value = masterState.notes;
    }
}

window.switchMasterTab = function(tabId) {
    masterState.activeTab = tabId;
    saveMasterState();
    renderMasterPanel();
};

// --- LÓGICA DE INICIATIVA ---


function renderInitiative() {
    const list = document.getElementById('initiative-list');
    if (!list) return;

    // 1. Coletar jogadores conectados que rolaram iniciativa
    const playerInits = Object.values(connectedPlayers)
        .filter(p => p.initiativeRoll > 0)
        .map(p => ({ 
            id: p.id || 'player', 
            name: p.name, 
            val: p.initiativeRoll, 
            isPlayer: true 
        }));

    // 2. Coletar NPCs do Bestiário que rolaram iniciativa
    const npcInits = (masterState.npcs || [])
        .filter(n => n.initiativeRoll > 0)
        .map(n => ({ 
            id: n.id, 
            name: n.name, 
            val: n.initiativeRoll, 
            isPlayer: false 
        }));

    // 3. Fundir e Ordenar
    const allInits = [...playerInits, ...npcInits].sort((a, b) => b.val - a.val);

    if (allInits.length === 0) {
        list.innerHTML = '<div class="muted-text txt-center" style="padding: 3rem;">Nenhum herói ou vilão em combate no momento.</div>';
        return;
    }

    list.innerHTML = allInits.map(item => `
        <div class="initiative-row ${item.isPlayer ? 'player' : 'npc'} fade-in" style="${!item.isPlayer ? 'border-left-color: var(--red);' : ''}">
            <div class="init-score">${item.val}</div>
            <div class="init-name cinzel">${item.isPlayer ? '🛡️' : '👾'} ${item.name}</div>
        </div>
    `).join('');
}

function renderBestiary() {
    const grid = document.getElementById('npcs-grid');
    if (!grid) return;

    if (masterState.npcs.length === 0) {
        grid.innerHTML = '<div class="muted-text txt-center" style="grid-column: 1/-1; padding: 4rem;">O Bestiário está vazio. Crie monstros para populá-lo!</div>';
        return;
    }

    grid.innerHTML = masterState.npcs.map(npc => {
        const hpPercent = Math.max(0, Math.min(100, (npc.hp.current / npc.hp.max) * 100));
        let hpClass = '';
        if (hpPercent < 25) hpClass = 'danger';
        else if (hpPercent < 50) hpClass = 'warning';

        return `
            <div class="choice-card player-card fade-in" onclick="openNPCSheet('${npc.id}')">
                <div class="char-portrait-container" style="width: 50px; height: 50px; margin: 0 auto 1rem; font-size: 1.2rem;">
                    ${npc.photo ? `<img src="${npc.photo}" class="char-portrait" style="display:block">` : '👾'}
                </div>
                <strong style="display:block; margin-bottom: 0.3rem; font-size: 0.9rem;">${npc.name}</strong>
                <div class="muted-text" style="font-size: 0.65rem; text-transform: uppercase;">
                    ${RACES[npc.race]?.name || '---'} • ${CLASSES[npc.cls]?.name || '---'}
                </div>
                
                <div class="hp-bar-container">
                    <div class="hp-bar-fill ${hpClass}" style="width: ${hpPercent}%"></div>
                </div>
                <div style="margin-top: 0.5rem; font-size: 0.75rem; font-weight: 700;">
                    HP: ${npc.hp.current} / ${npc.hp.max}
                </div>
            </div>
        `;
    }).join('');
}

window.addNPCToInitiative = function(npcId) {
    const npc = masterState.npcs.find(n => n.id === npcId);
    if (!npc) return;

    const val = prompt(`Iniciativa para ${npc.name} (Dado Físico + Modificador):`, Math.floor((npc.attr.des - 10) / 2));
    if (val === null) return;

    const score = parseInt(val) || 0;
    
    // NPCs na iniciativa são simples { name, val, id, isPlayer: false }
    masterState.initiative.push({
        id: Date.now(),
        name: npc.name,
        val: score
    });

    saveMasterState();
    sendSystemLog(`👾 <strong>${npc.name}</strong> entrou no combate com iniciativa <strong>${score}</strong>.`);
    
    // Muda para a aba de iniciativa para ver o resultado
    switchMasterTab('initiative'); 
};

window.deleteNPC = function(npcId) {
    if (confirm("Deseja apagar este NPC permanentemente?")) {
        masterState.npcs = masterState.npcs.filter(n => n.id !== npcId);
        saveMasterState();
        renderBestiary();
    }
};

function renderLogHistory() {
    const list = document.getElementById('master-log-history');
    if (!list) return;

    if (masterState.logHistory.length === 0) {
        list.innerHTML = '<div class="muted-text txt-center" style="padding: 3rem;">Nenhuma atividade registrada ainda.</div>';
        return;
    }

    // Mostra os logs mais recentes primeiro no topo do histórico
    list.innerHTML = [...masterState.logHistory].reverse().map(log => `
        <div class="log-entry" style="margin-bottom: 0.5rem; background: rgba(255,255,255,0.03);">
            <div class="log-time">${log.timestamp}</div>
            <div style="font-size: 0.85rem;">${log.text}</div>
        </div>
    `).join('');
}

// --- LÓGICA DE ALERTAS ---
window.broadcastMasterAlert = function() {
    const input = document.getElementById('master-alert-input');
    const msg = input.value.trim();
    if (!msg || !socket) return;

    socket.emit('sendAlert', msg);
    input.value = ''; // Limpa após enviar alerta rápido
};

window.openPlayerSheet = function(id) {
    masterEditingId = id;
    masterEditingType = 'player';
    state = connectedPlayers[id];
    
    // Remove read-only para o mestre poder editar tudo
    const container = document.getElementById('sheet-container');
    if (container) container.classList.remove('read-only');
    
    render();
};

window.openNPCSheet = function(id) {
    const npc = masterState.npcs.find(n => n.id == id);
    if (!npc) return;

    masterEditingId = id;
    masterEditingType = 'npc';
    state = npc; // O NPC local vira o estado ativo para edição

    const container = document.getElementById('sheet-container');
    if (container) container.classList.remove('read-only');

    render();
};

function renderSheet() {
    const $ = id => document.getElementById(id);
    const isEditing = isMaster || !document.getElementById('sheet-container').classList.contains('read-only');

    // 1. Header (Sync all instances)
    const raceName = RACES[state.race]?.name || '---';
    const clsName = CLASSES[state.cls]?.name || '---';

    document.querySelectorAll('#display-name').forEach(el => el.value = state.name);
    document.querySelectorAll('#display-class').forEach(el => el.textContent = clsName);
    document.querySelectorAll('#display-race').forEach(el => el.textContent = raceName);
    document.querySelectorAll('#display-level').forEach(el => el.textContent = `Nível ${state.level}`);
    document.querySelectorAll('#display-xp').forEach(el => el.textContent = `XP ${state.xp}`);

    document.querySelectorAll('#display-photo').forEach(pImg => {
        if (state.photo) {
            pImg.src = state.photo;
            pImg.style.display = 'block';
        } else {
            pImg.style.display = 'none';
        }
    });

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

    // Show/Hide NPC Danger Zone
    const npcDanger = document.getElementById('npc-danger-zone');
    if (npcDanger) {
        npcDanger.style.display = (isMaster && masterEditingType === 'npc') ? 'flex' : 'none';
    }

    // Attributes
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
    const desMod = Math.floor((state.attr.des - 10) / 2);
    
    // Calcular CA Automática
    const armorBonus = (state.armors || []).reduce((acc, arm) => acc + (parseInt(arm.bonus) || 0), 0);
    const baseAC = 10 + desMod;
    const totalAC = baseAC + armorBonus;
    
    // Atualizar UI de CA
    const acInput = $('display-ac');
    if (acInput) {
        acInput.value = state.ac || totalAC; // Respeita override manual se existir, senão usa calculado
    }

    $('display-initiative').textContent = state.initiativeRoll || 0;
    
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
                <span class="skill-name">${s.name} <small style="color:var(--txt-muted)">(${s.attr.toUpperCase()})</small></span>
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

    if (n === 1 && isCreatingNPC) {
        document.querySelector('#creation-screen h1 span').textContent = 'NPC';
    } else if (n === 1) {
        document.querySelector('#creation-screen h1 span').textContent = 'Herói';
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
    // Se for NPC, salvamos na lista do mestre
    if (isCreatingNPC) {
        const npcState = { ...getDefaultState() };
        npcState.isCreated = true;
        npcState.name = name;
        npcState.race = wizardData.race;
        npcState.cls = wizardData.cls;
        npcState.photo = photo;
        npcState.attr = { ...wizardData.attr };
        npcState.profs = [...wizardData.skills];
        npcState.bg = bg || '---';
        npcState.align = align || '---';
        npcState.id = Date.now(); // ID único para o NPC (no mestre)

        const race = RACES[npcState.race] || { speed: 9 };
        const cls = CLASSES[npcState.cls] || { hp: 8, hd: '1d8', saves: [] };
        
        npcState.speed = race.speed;
        npcState.ac = 10 + Math.floor((npcState.attr.des - 10) / 2);
        npcState.hp.max = (cls.hp || 10) + Math.floor((npcState.attr.con - 10) / 2);
        npcState.hp.current = npcState.hp.max;
        npcState.hd = '1' + (cls.hd?.substring(1) || 'd8');
        npcState.saves = [...(cls.saves || [])];

        // Garantir que masterState.npcs exista antes do push
        if (!Array.isArray(masterState.npcs)) masterState.npcs = [];
        
        masterState.npcs.push(npcState);
        saveMasterState();
        isCreatingNPC = false;
        sendSystemLog(`👾 Mestre criou um novo NPC: <strong>${name}</strong>.`);
        
        masterState.activeTab = 'bestiary'; // Forçar aba de NPCs ao voltar
        switchView('master-panel');
        renderMasterPanel();
        return;
    }

    // Fluxo normal do Jogador
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
    sendSystemLog(`📜 <strong>${state.name}</strong> (${CLASSES[state.cls].name}) acaba de entrar na aventura!`);
    render();
}

window.startNPCCreation = function() {
    isCreatingNPC = true;
    wizardData = {
        active: true,
        step: 1,
        name: '', race: '', cls: '',
        bg: '', align: '', photo: '',
        personality: { traits: '', ideals: '', bonds: '', flaws: '' },
        attr: { for: 0, des: 0, con: 0, int: 0, sab: 0, car: 0 },
        skills: []
    };
    buildGrids();
    
    // Limpar campos do DOM se existirem
    const nameInput = document.getElementById('create-name');
    if (nameInput) nameInput.value = '';
    
    switchView('creation-screen');
    goToStep(1);
};

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
            if (isMaster && masterEditingId) {
                // Se o mestre estiver editando alguém, apenas volta para o painel
                const prevTab = masterEditingType === 'npc' ? 'bestiary' : 'players';
                masterEditingId = null;
                masterEditingType = 'player';
                masterState.activeTab = prevTab;
                render();
            } else {
                // Caso contrário (está no painel ou é jogador), reseta tudo (refresh)
                window.location.reload();
            }
            return;
        }

        // Sheet Logic (Click to update)
        if (t.id === 'check-inspiration') {
            if (!isMaster) return;
            state.inspiration = !state.inspiration;
            sendSystemLog(`✨ <strong>${state.name}</strong> ${state.inspiration ? 'ganhou' : 'usou'} Inspiração!`);
            renderSheet();
            broadcastChange();
        }

        if (t.id === 'hp-text') {
            if (!isMaster) return;
            const oldHp = state.hp.current;
            const val = prompt("Alterar Atuais PV:", oldHp);
            if (val !== null) {
                state.hp.current = parseInt(val) || 0;
                const diff = state.hp.current - oldHp;
                if (diff !== 0) {
                    sendSystemLog(`❤️ <strong>${state.name}</strong>: HP ${diff > 0 ? 'ganhou' : 'perdeu'} ${Math.abs(diff)} (Total: ${state.hp.current}/${state.hp.max})`);
                }
                renderSheet();
                broadcastChange();
            }
        }

        if (t.id === 'display-initiative') {
            const val = prompt("Resultado do Dado Físico + Modificador:", state.initiativeRoll);
            if (val !== null) {
                state.initiativeRoll = parseInt(val) || 0;
                sendSystemLog(`⚔️ <strong>${state.name}</strong> definiu sua iniciativa para <strong>${state.initiativeRoll}</strong>.`);
                renderSheet();
                broadcastChange();
            }
        }

        if (t.id === 'btn-delete-current-npc') {
            if (confirm("Deseja apagar este NPC permanentemente?")) {
                const idToDelete = masterEditingId;
                masterState.npcs = masterState.npcs.filter(n => n.id != idToDelete);
                saveMasterState();
                
                // Retornar ao painel
                masterEditingId = null;
                masterEditingType = 'player';
                masterState.activeTab = 'bestiary';
                render();
            }
            return;
        }

        if (t.closest('#btn-reset-char')) {
            if (confirm('Tem certeza que deseja resetar TUDO? Isso não pode ser desfeito.')) {
                const oldName = state.name;
                state = getDefaultState();
                sendSystemLog(`♻️ A ficha de <strong>${oldName}</strong> foi resetada pelo Mestre.`);
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
            sendSystemLog(`⚔️ <strong>${state.name}</strong> adicionou novo ataque: <strong>${n}</strong> (+${b})`);
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
            sendSystemLog(`🛡️ <strong>${state.name}</strong> equipou: <strong>${n}</strong> (+${b})`);
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

        // NAVEGAÇÃO DO Hub do Mestre (Abas)
        const mNavBtn = t.closest('.m-nav-btn');
        if (mNavBtn) {
            switchMasterTab(mNavBtn.dataset.tab);
            return;
        }

        // Navegação do footer
        const nBtn = t.closest('.nav-btn');
        if (nBtn) {
            const viewId = nBtn.dataset.view;
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
                const oldLvl = state.level;
                const val = prompt("Mudar Nível:", oldLvl);
                if (val !== null && parseInt(val) !== oldLvl) { 
                    state.level = parseInt(val) || 1; 
                    sendSystemLog(`🌟 <strong>${state.name}</strong> subiu para o <strong>Nível ${state.level}</strong>!`);
                    renderSheet(); broadcastChange(); 
                }
            }
            if (t.id === 'display-xp') {
                const oldXp = state.xp;
                const val = prompt("Mudar XP (0 a 5):", oldXp);
                if (val !== null && parseInt(val) !== oldXp) { 
                    state.xp = parseInt(val) || 0; 
                    const diff = state.xp - oldXp;
                    sendSystemLog(`📈 <strong>${state.name}</strong> ${diff > 0 ? 'ganhou' : 'perdeu'} ${Math.abs(diff)} XP (Total: ${state.xp})`);
                    renderSheet(); broadcastChange(); 
                }
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
        if (t.classList.contains('ds-success')) { if(!isMaster) return; state.deathSaves.success = (state.deathSaves.success + 1) % 4; renderSheet(); broadcastChange(); }
        if (t.classList.contains('ds-fail')) { if(!isMaster) return; state.deathSaves.fail = (state.deathSaves.fail + 1) % 4; renderSheet(); broadcastChange(); }
    });

    // Input Sync for text/numbers
    document.addEventListener('input', e => {
        const id = e.target.id;
        const val = e.target.value;

        if (id === 'master-private-notes') {
            masterState.notes = val;
            saveMasterState();
            return;
        }

        if (id === 'display-name') state.name = val;
        if (id === 'display-ac') state.ac = parseInt(val) || 10;
        if (id === 'display-hd') state.hd = val;
        if (id === 'display-bg') state.bg = val;
        if (id === 'display-align') state.align = val;
        if (id === 'gold-po') {
            state.gold = parseInt(val) || 0;
            // Debounce o log de ouro para não spammar ao digitar
            debounceGoldLog(state.name, state.gold);
        }
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
    if (!isMaster) return;
    if (state.saves.includes(a)) state.saves = state.saves.filter(x => x !== a);
    else state.saves.push(a);
    renderSheet(); broadcastChange();
};

window.toggleSkill = (sid) => {
    if (!isMaster) return;
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
    currentView = viewId;
    render();
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
