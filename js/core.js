// ==================== SYSTEM CONFIG ====================
const STORAGE_KEY_BASE = 'rpg_guri_v10';
const MASTER_STORAGE_KEY = 'rpg_guri_master_v1';

// ==================== REAL-TIME SETUP ====================
let socket;
try { socket = io(); } catch(e) { console.warn("Socket.io não disponível."); }

let isMaster = false;
let isAdmin = false; 
let connectedPlayers = {}; // { socketId: state }
let masterEditingId = null; 
let masterEditingType = 'player'; 
let isCreatingNPC = false; 
let roleSelected = false; 
let user = null;
let currentView = 'sheet-view';

// ==================== SUPABASE SETUP ====================
let supabaseClient = null;
try {
    const isPlaceholder = !SUPABASE_CONFIG || 
                         SUPABASE_CONFIG.url.includes("SUA_URL") || 
                         SUPABASE_CONFIG.anonKey.includes("SUA_KEY");

    if (typeof SUPABASE_CONFIG !== 'undefined' && !isPlaceholder) {
        supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    } else {
        console.warn("Supabase: Configurações de placeholder detectadas ou ausentes.");
    }
} catch (e) {
    console.error("Supabase: Erro crítico ao iniciar cliente:", e);
}

// ==================== STATE ====================
let state = getDefaultState();
let masterState = loadMasterState();

let wizardData = {
    active: false,
    step: 1,
    name: '', race: '', cls: '',
    bg: '', align: '', photo: '',
    personality: { traits: '', ideals: '', bonds: '', flaws: '' },
    attr: { for: 0, des: 0, con: 0, int: 0, sab: 0, car: 0 },
    skills: []
};
let wizardSelection = null; 

function getDefaultState() {
    return {
        isCreated: false,
        name: 'Herói Sem Nome',
        race: '', cls: '', bg: 'Criminoso', align: 'Leal e Bom',
        level: 1, xp: 0, hp: { current: 10, max: 10 },
        ac: 10, speed: 9, initiativeRoll: 0, hd: '1d10', photo: '',
        attr: { for: 10, des: 10, con: 10, int: 10, sab: 10, car: 10 },
        profs: [], saves: [], inspiration: false,
        attacks: [], armors: [], utility: [], gold: 0,
        cantrips: [], spellsActive: [], spellsInactive: [],
        rpTraits: '', rpIdeals: '', rpBonds: '', rpFlaws: '', rpFeats: '',
        deathSaves: { success: 0, fail: 0 },
        conditions: []
    };
}

function loadMasterState() {
    return {
        activeTab: 'players',
        initiative: [], 
        notes: '',
        npcs: [],
        worldLore: { group: '', world: '', npcs: '' }
    };
}

function saveMasterState() {
    if (user && supabaseClient) saveMasterStateToSupabase();
}

async function saveMasterStateToSupabase() {
    if (!user || !supabaseClient) return;
    const MASTER_ROW_ID = 'universal_master_data'; 
    const { error } = await supabaseClient
        .from('master_data')
        .upsert({ id: MASTER_ROW_ID, data: masterState }, { onConflict: 'id' });
    if (error) console.error("Erro ao salvar dados do Mestre no Supabase:", error);
}

async function loadMasterStateFromSupabase() {
    if (!user || !supabaseClient) return;
    const MASTER_ROW_ID = 'universal_master_data';
    const { data, error } = await supabaseClient
        .from('master_data')
        .select('data')
        .eq('id', MASTER_ROW_ID)
        .maybeSingle();
    
    if (data && data.data) {
        masterState = {
            ...masterState,
            ...data.data
        };
        if (isMaster) renderMasterPanel();
    }
}

// ==================== SYNC LOGIC ====================
function broadcastChange() {
    if (!socket || masterEditingType === 'npc') return;
    if (isMaster && masterEditingId) {
        socket.emit('masterUpdatePlayer', { targetId: masterEditingId, data: state });
    } else if (!isMaster && state.isCreated) {
        socket.emit('playerUpdate', state);
    }
}

function sendSystemLog(msg) {
    if (!socket) return;
    socket.emit('sendMessage', msg);
}

const debounceSync = debounce(() => {
    broadcastChange();
    saveState();
    if (user && !isMaster) saveStateToSupabase();
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

// --- SOCKET LISTENERS ---
if (socket) {
    socket.on('updatePlayersList', (players) => {
        connectedPlayers = players;
        if (isMaster) renderMasterPanel();
    });

    socket.on('playerChanged', ({ id, data }) => {
        connectedPlayers[id] = data;
        if (isMaster) {
            renderMasterPanel();
            if (masterEditingId === id) { state = data; renderSheet(); }
        }
    });

    socket.on('serverUpdateSheet', (updatedData) => {
        if (!isMaster) {
            if (updatedData && updatedData._forceDelete) {
                state = getDefaultState();
                saveState();
                if (user) saveStateToSupabase();
                roleSelected = false;
                render();
                alert("Sua ficha foi apagada pelo Mestre.");
                return;
            }
            state = updatedData;
            saveState();
            renderSheet();
            if (user) saveStateToSupabase();
        }
    });

    socket.on('newLogEntry', ({ timestamp, text }) => {
        if (!isMaster) return;
        masterState.logHistory.push({ timestamp, text });
        saveMasterState();
        if (masterState.activeTab === 'log') renderLogHistory();
    });

    socket.on('incomingAlert', (text) => {
        const banner = document.getElementById('global-alert-banner');
        if (!banner) return;
        banner.textContent = text;
        banner.classList.remove('hidden');
        setTimeout(() => banner.classList.add('hidden'), 8000);
    });
}

// ==================== CORE APP LOGIC ====================
async function init() {
    if (supabaseClient) {
        try {
            const adminEmail = 'admin@rpg.com';
            const adminPass = 'admin123';
            const { data: { user: existingUser } } = await supabaseClient.auth.getUser();
            if (!existingUser) {
                const { data: loginData, error: loginError } = await supabaseClient.auth.signInWithPassword({
                    email: adminEmail, password: adminPass
                });
                if (!loginError) { 
                    user = loginData.user; 
                    await loadStateFromSupabase(); 
                    await loadMasterStateFromSupabase();
                }
            } else {
                user = existingUser;
                await loadStateFromSupabase();
                await loadMasterStateFromSupabase();
            }
        } catch (e) {
            console.log('Setup de Admin Automático ignorado ou falhou:', e.message);
        }
    }
    loadState();
    buildGrids();
    setupEvents();
    render();
    if (socket && state.isCreated && !isMaster) {
        socket.emit('playerIdentify', { ...state, userEmail: user ? user.email : 'Convidado' });
    }
}

function loadState() {
    state = getDefaultState();
}

function saveState() {
    if (isMaster && masterEditingType === 'npc') {
        const idx = masterState.npcs.findIndex(n => n.id == masterEditingId);
        if (idx !== -1) {
            masterState.npcs[idx] = { ...state };
            saveMasterState();
        }
    }
}

async function saveStateToSupabase() {
    if (!user || !supabaseClient || !state.isCreated) return;
    const { error } = await supabaseClient
        .from('characters')
        .upsert({ user_id: user.id, name: state.name, data: state }, { onConflict: 'user_id' });
    if (error) console.error("Erro ao salvar no Supabase:", error);
}

async function loadStateFromSupabase() {
    if (!user || !supabaseClient) return;
    state = getDefaultState();
    const { data, error } = await supabaseClient
        .from('characters')
        .select('data')
        .eq('user_id', user.id)
        .maybeSingle();
    if (data && data.data) {
        state = data.data;
        saveState();
    }
}

function render() {
    const $ = id => document.getElementById(id);
    document.body.classList.toggle('is-master', isMaster);
    const views = ['auth-screen', 'role-selection', 'creation-screen', 'master-panel', 'sheet-view', 'items-view', 'habilidades-view', 'history-view'];
    views.forEach(v => { const el = $(v); if (el) el.classList.remove('active'); });

    if (!user) {
        const auth = $('auth-screen');
        if (auth) auth.classList.add('active');
        return;
    }

    if (!roleSelected) {
        const roleSel = $('role-selection');
        if (roleSel) {
            roleSel.classList.add('active');
            const isAdminUser = user && user.email === 'admin@rpg.com';
            const adminCard = roleSel.querySelector('.admin-only');
            const selectionGrid = roleSel.querySelector('.selection-grid');
            const logoutSection = roleSel.querySelector('#logout-section');
            
            if (isAdminUser) {
                if (adminCard) adminCard.style.display = 'flex';
                if (selectionGrid) selectionGrid.classList.remove('two-options');
            } else {
                if (adminCard) adminCard.style.display = 'none';
                if (selectionGrid) selectionGrid.classList.add('two-options');
            }
            if (logoutSection) logoutSection.style.display = 'block';
        }
        return;
    }

    if (isMaster) {
        if (isCreatingNPC) {
            const creation = $('creation-screen');
            if (creation) creation.classList.add('active');
        } else if (masterEditingId) {
            const targetView = $(currentView) || $('sheet-view');
            if (targetView) targetView.classList.add('active');
            renderSheet();
            if (currentView === 'items-view') renderItems();
            if (currentView === 'habilidades-view') renderHabilidades();
        } else {
            const masterPanel = $('master-panel');
            if (masterPanel) {
                masterPanel.classList.add('active');
                renderMasterPanel();
                if (isAdmin) {
                    document.querySelectorAll('.admin-only').forEach(tab => tab.style.display = 'block');
                    if (masterState.activeTab === 'users') loadUsers();
                }
            }
        }
    } else if (!state.isCreated || state.isDeleted) {
        if (wizardData.active) {
            const creation = $('creation-screen');
            if(creation) creation.classList.add('active');
        } else {
            const roleSel = $('role-selection');
            if(roleSel) roleSel.classList.add('active');
        }
    } else {
        const targetView = $(currentView) || $('sheet-view');
        if (targetView) {
            targetView.classList.remove('fade-in');
            void targetView.offsetWidth; // Trigger reflow
            targetView.classList.add('active', 'fade-in');
        }
        renderSheet();
        if (currentView === 'items-view') renderItems();
        if (currentView === 'habilidades-view') renderHabilidades();
    }

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === currentView);
    });
}

function switchView(viewId) {
    currentView = viewId;
    render();
}

window.initApp = init;
