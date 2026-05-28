const STORAGE_KEY_BASE = 'rpg_guri_v10';
const AUTH_STORAGE_KEY = `${STORAGE_KEY_BASE}_offline_token`;
const MASTER_STORAGE_KEY = 'rpg_guri_master_v1';
const APP_MODE = window.APP_MODE || 'offline';
const isOfflineMode = APP_MODE !== 'online';

let socket;
try { socket = io(); } catch (e) { console.warn('Socket.io nao disponivel.'); }

let isMaster = false;
let connectedPlayers = {};
let masterEditingId = null;
let masterEditingType = 'player';
let isCreatingNPC = false;
let roleSelected = false;
let user = null;
let authToken = localStorage.getItem(AUTH_STORAGE_KEY) || '';
let currentView = 'sheet-view';
let userCharacters = [];
let sessionLog = [];
let isPreCreatingPlayer = false;
let targetUserIdByMaster = null;

let supabaseClient = null;
try {
    const isPlaceholder = !SUPABASE_CONFIG ||
        SUPABASE_CONFIG.url.includes('SUA_URL') ||
        SUPABASE_CONFIG.anonKey.includes('SUA_KEY');

    if (!isOfflineMode && typeof SUPABASE_CONFIG !== 'undefined' && !isPlaceholder) {
        supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    }
} catch (e) {
    console.error('Supabase: Erro critico ao iniciar cliente:', e);
}

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
        name: 'Heroi Sem Nome',
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
        activeTab: 'mesa',
        initiative: [],
        notes: '',
        npcs: [],
        monsters: [],
        tableCharacters: [],
        logHistory: [],
        worldLore: { group: '', world: '', npcs: '' }
    };
}

function getAuthHeaders(extraHeaders = {}) {
    const headers = { ...extraHeaders };
    if (isOfflineMode && authToken) {
        headers.Authorization = `Bearer ${authToken}`;
    }
    return headers;
}

async function apiRequest(url, options = {}) {
    const headers = getAuthHeaders(options.headers || {});
    if (!headers['Content-Type'] && options.body) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, { ...options, headers });
    const text = await response.text();
    const payload = text ? JSON.parse(text) : null;

    if (!response.ok) {
        throw new Error(payload?.error || 'Falha na requisicao.');
    }

    return payload;
}

async function authorizedFetch(url, options = {}) {
    const headers = getAuthHeaders(options.headers || {});
    return fetch(url, { ...options, headers });
}

function setOfflineSession(token, nextUser) {
    authToken = token;
    localStorage.setItem(AUTH_STORAGE_KEY, token);
    user = nextUser;
}

function clearOfflineSession() {
    authToken = '';
    localStorage.removeItem(AUTH_STORAGE_KEY);
}

function updateAuthFooter() {
    const footer = document.querySelector('#auth-screen .muted-text');
    if (!footer) return;
    footer.textContent = isOfflineMode
        ? 'Modo offline local em SQLite'
        : 'Powered by Supabase & Ethereal Engine v13';
}

function saveMasterState() {
    if (!user) return;

    if (isOfflineMode) {
        saveMasterStateOffline();
        return;
    }

    if (supabaseClient) saveMasterStateToSupabase();
}

async function saveMasterStateOffline() {
    try {
        await apiRequest('/api/master-state', {
            method: 'PUT',
            body: JSON.stringify({ state: masterState })
        });
    } catch (error) {
        console.error('Erro ao salvar dados do Mestre offline:', error);
    }
}

async function saveMasterStateToSupabase() {
    if (!user || !supabaseClient) return;
    const MASTER_ROW_ID = '00000000-0000-0000-0000-000000000000';
    const { error } = await supabaseClient
        .from('master_data')
        .upsert({ id: MASTER_ROW_ID, data: masterState }, { onConflict: 'id' });
    if (error) console.error('Erro ao salvar dados do Mestre no Supabase:', error);
}

async function loadMasterStateFromSupabase() {
    if (!user) return;

    if (isOfflineMode) {
        try {
            const payload = await apiRequest('/api/master-state');
            if (payload?.data) {
                masterState = { ...masterState, ...payload.data };
                if (isMaster) renderMasterPanel();
            }
        } catch (error) {
            console.error('Erro ao carregar dados do Mestre offline:', error);
        }
        return;
    }

    if (!supabaseClient) return;

    const MASTER_ROW_ID = '00000000-0000-0000-0000-000000000000';
    const { data } = await supabaseClient
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
                alert('Sua ficha foi apagada pelo Mestre.');
                return;
            }
            state = updatedData;
            saveState();
            renderSheet();
            if (user) saveStateToSupabase();
        }
    });

    socket.on('newLogEntry', ({ timestamp, text }) => {
        const logObj = { timestamp, text };
        sessionLog.push(logObj);

        if (isMaster) {
            if (!masterState.logHistory) masterState.logHistory = [];
            masterState.logHistory.push(logObj);
            saveMasterState();
            if (masterState.activeTab === 'log') renderLogHistory();
        } else if (currentView === 'history-view') {
            renderHistoryView();
        }
    });

    socket.on('incomingAlert', (text) => {
        const banner = document.getElementById('global-alert-banner');
        if (!banner) return;
        banner.textContent = text;
        banner.classList.remove('hidden');
        setTimeout(() => banner.classList.add('hidden'), 8000);
    });

    socket.on('dbCharactersChanged', () => {
        if (typeof window.syncDbCharacters === 'function') {
            window.syncDbCharacters();
        }
    });
}

async function init() {
    updateAuthFooter();

    if (isOfflineMode) {
        if (authToken) {
            try {
                const payload = await apiRequest('/api/auth/me');
                user = payload.user;
                await loadStateFromSupabase();
                await loadMasterStateFromSupabase();
            } catch (error) {
                clearOfflineSession();
                user = null;
            }
        }
    } else if (supabaseClient) {
        try {
            const { data: { user: existingUser } } = await supabaseClient.auth.getUser();
            if (existingUser) {
                user = existingUser;
                await loadStateFromSupabase();
                await loadMasterStateFromSupabase();
            }
        } catch (e) {
            console.log('Erro ao recuperar usuario:', e.message);
        }
    }

    buildGrids();
    setupEvents();
    render();
    if (socket && state.isCreated && !isMaster) {
        socket.emit('playerIdentify', { ...state, userEmail: user ? user.email : 'Convidado' });
    }
}

function loadState() {
    // Estado local em memoria. Persistencia principal fica no banco ativo.
}

function wipeActiveState() {
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
    if (!user || !state.isCreated) return;

    if (isOfflineMode) {
        try {
            const payload = await apiRequest('/api/characters', {
                method: 'POST',
                body: JSON.stringify({ state })
            });

            if (payload?.character?.id && !state.id) {
                state.id = payload.character.id;
                saveState();
            }
        } catch (error) {
            console.error('Erro ao salvar no banco offline:', error);
        }
        return;
    }

    if (!supabaseClient) return;

    const charData = {
        user_id: user.id,
        name: state.name,
        data: state,
        updated_at: new Date().toISOString()
    };

    if (state.id) charData.id = state.id;

    const { data, error } = await supabaseClient
        .from('characters')
        .upsert(charData)
        .select()
        .single();

    if (error) {
        console.error('Erro ao salvar no Supabase:', error);
    } else if (data && !state.id) {
        state.id = data.id;
        saveState();
    }
}

async function loadAllCharactersFromSupabase() {
    if (!user) return [];

    if (isOfflineMode) {
        try {
            const rows = await apiRequest('/api/characters');
            userCharacters = rows || [];
            return userCharacters;
        } catch (error) {
            console.error('Erro ao carregar personagens offline:', error);
            return [];
        }
    }

    if (!supabaseClient) return [];

    const { data, error } = await supabaseClient
        .from('characters')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

    if (error) {
        console.error('Erro ao carregar personagens:', error);
        return [];
    }
    userCharacters = data || [];
    return userCharacters;
}

async function loadStateFromSupabase() {
    // O carregamento completo da ficha continua disparado pela selecao do personagem.
}

function render() {
    const $ = id => document.getElementById(id);
    document.body.classList.toggle('is-master', isMaster);
    const views = ['auth-screen', 'role-selection', 'character-selection', 'creation-screen', 'master-panel', 'sheet-view', 'items-view', 'habilidades-view', 'history-view', 'game-log-view'];
    views.forEach(v => { const el = $(v); if (el) el.classList.remove('active'); });

    if (!user) {
        const auth = $('auth-screen');
        if (auth) auth.classList.add('active');
        return;
    }

    if (!roleSelected) {
        const roleSel = $('role-selection');
        const charSel = $('character-selection');

        if (charSel && charSel.classList.contains('active')) return;

        if (roleSel) {
            roleSel.classList.add('active');
            const logoutSection = roleSel.querySelector('#logout-section');
            if (logoutSection) logoutSection.style.display = 'block';
        }
        return;
    }

    if (isMaster) {
        if (isCreatingNPC || isPreCreatingPlayer) {
            const creation = $('creation-screen');
            if (creation) creation.classList.add('active');
        } else if (masterEditingId) {
            const targetView = $(currentView) || $('sheet-view');
            if (targetView) targetView.classList.add('active');
            if (currentView === 'game-log-view') renderSessionLog();
            else {
                renderSheet();
                if (currentView === 'items-view') renderItems();
                if (currentView === 'habilidades-view') renderHabilidades();
            }
        } else {
            const masterPanel = $('master-panel');
            if (masterPanel) {
                masterPanel.classList.add('active');
                renderMasterPanel();
            }
        }
    } else if (!state.isCreated || state.isDeleted) {
        if (wizardData.active) {
            const creation = $('creation-screen');
            if (creation) creation.classList.add('active');
        } else {
            const charSel = $('character-selection');
            if (charSel) charSel.classList.add('active');
        }
    } else {
        const targetView = $(currentView) || $('sheet-view');
        if (targetView) {
            targetView.classList.add('active');
        }
        if (currentView === 'game-log-view') renderSessionLog();
        else {
            renderSheet();
            if (currentView === 'items-view') renderItems();
            if (currentView === 'habilidades-view') renderHabilidades();
        }
    }

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === currentView);
    });
}

function switchView(viewId) {
    currentView = viewId;
    render();
}

/* Função de navegação entre telas - baseada na biblioteca */
function mostrarTela(id) {
    document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));

    const elementoTela = document.getElementById(id);
    if (elementoTela) {
        elementoTela.classList.add('active');
    }

    document.querySelectorAll('.side-btn').forEach((btn) => btn.classList.remove('active'));

    const botoes = document.querySelectorAll('.side-btn');
    botoes.forEach((btn) => {
        if (btn.onclick && btn.onclick.toString().includes(id)) {
            btn.classList.add('active');
        }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Fechar menu mobile se estiver aberto
    if (typeof closeMobileMenu === 'function' && window.innerWidth <= 900) {
        closeMobileMenu();
    }
}

// Expor globalmente
window.mostrarTela = mostrarTela;

/* Funções auxiliares para menu mobile - baseadas na biblioteca */
function toggleMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobileOverlay');
    
    if (sidebar && overlay) {
        sidebar.classList.toggle('mobile-open');
        overlay.classList.toggle('active');
    }
}

function closeMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobileOverlay');
    
    if (sidebar && overlay) {
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('active');
    }
}

function toggleTheme() {
    const rootElement = document.documentElement;
    const isLight = rootElement.getAttribute('data-theme') === 'light';
    
    if (isLight) {
        rootElement.removeAttribute('data-theme');
        localStorage.setItem('rpg_theme', 'dark');
    } else {
        rootElement.setAttribute('data-theme', 'light');
        localStorage.setItem('rpg_theme', 'light');
    }
}

// Expor globalmente
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;
window.toggleTheme = toggleTheme;

window.apiRequest = apiRequest;
window.authorizedFetch = authorizedFetch;
window.setOfflineSession = setOfflineSession;
window.clearOfflineSession = clearOfflineSession;
window.isOfflineMode = isOfflineMode;
window.initApp = init;
