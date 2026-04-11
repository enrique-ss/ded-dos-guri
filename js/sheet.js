function renderHeader() {
    const activeView = document.querySelector('.full-screen-modal.active');
    if (!activeView) return;
    const placeholder = activeView.querySelector('.character-header-placeholder');
    if (!placeholder) return;

    placeholder.innerHTML = `
        <header class="sheet-header premium-card read-only" style="margin-bottom: 1rem;">
            <div class="header-main">
                <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                    <div class="char-portrait-container" id="portrait-main" ${isMaster ? 'onclick="this.querySelector(\'input\').click()" style="cursor: pointer;"' : ''}>
                        <span style="pointer-events: none;">👤</span>
                        <img id="display-photo-header" src="${state.photo || ''}" alt="Avatar" class="char-portrait" style="display: ${state.photo ? 'block' : 'none'}; pointer-events: none;">
                        ${isMaster ? '<input type="file" accept="image/*" style="display:none" onchange="window.handleMasterPhoto(this)">' : ''}
                    </div>

                    <div class="header-identity">
                        <input type="text" id="display-name-header" class="char-name-input protected-field" value="${state.name}" ${isMaster ? '' : 'readonly'} maxlength="25">
                        <div class="header-sub">
                            <div class="badge-role" id="display-class-header">${CLASSES[state.cls]?.name || state.cls || ''}</div>
                            <div class="badge-role" id="display-race-header">${RACES[state.race]?.name || state.race || ''}</div>
                            <div class="badge-role" id="display-level-header">Nível ${state.level || 1}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="header-nav">
                <button class="nav-btn ${currentView === 'sheet-view' ? 'active' : ''}" data-view="sheet-view" onclick="switchView('sheet-view')">
                    <span>Ficha</span>
                </button>
                <button class="nav-btn ${currentView === 'items-view' ? 'active' : ''}" data-view="items-view" onclick="switchView('items-view')">
                    <span>Itens</span>
                </button>
                <button class="nav-btn ${currentView === 'habilidades-view' ? 'active' : ''}" data-view="habilidades-view" onclick="switchView('habilidades-view')">
                    <span>Magias</span>
                </button>
                <button class="nav-btn ${currentView === 'history-view' ? 'active' : ''}" data-view="history-view" onclick="switchView('history-view')">
                    <span>Notas</span>
                </button>
                ${!isMaster ? `
                <button class="nav-btn ${currentView === 'game-log-view' ? 'active' : ''}" data-view="game-log-view" onclick="switchView('game-log-view')">
                    <span>Histórico</span>
                </button>` : ''}
                
                <button class="nav-btn" id="btn-back-to-role" style="color: var(--txt-muted);">
                    <span>Voltar</span>
                </button>
                
                <button class="nav-btn btn-reset" id="btn-reset-char" style="color: var(--red); display: ${!isMaster ? 'block' : 'none'}">
                    <span>Resetar</span>
                </button>
            </div>
        </header>
    `;

    // A navegação de 'Voltar' agora é gerenciada centralmente pelo events.js via delegação de cliques.
    
    // A exclusão agora é gerenciada exclusivamente pelo events.js
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === currentView);
    });
}

function renderSheet() {
    const $ = id => document.getElementById(id);
    renderHeader();
    
    // Procura o container principal (pode ser ID ou Classe dependendo da aba)
    const container = document.getElementById('sheet-container') || document.querySelector('.sheet-container');
    if (!container) return;

    const isEditing = isMaster; // APENAS MESTRE EDITA APÓS CRIAÇÃO

    // 1. Text & Value Mapping (Radical Reduction)
    const mappings = {
        'display-class': CLASSES[state.cls]?.name || '',
        'display-race': RACES[state.race]?.name || '',
        'display-level': `Nível ${state.level}`,
        'prof-bonus': '+' + (state.profBonusOverride || (Math.ceil(state.level / 4) + 1)),
        'display-initiative': state.initiativeRoll || Math.floor((state.attr.des - 10) / 2),
        'display-speed': state.speed + 'm',
        'hp-text': `${state.hp.current} / ${state.hp.max}`,
        'gold-po': state.gold
    };

    Object.entries(mappings).forEach(([id, val]) => {
        const el = $(id);
        if (el) el[el.tagName === 'INPUT' ? 'value' : 'textContent'] = val;
    });

    document.querySelectorAll('#display-name').forEach(el => el.value = state.name);

    // 2. Photo Handling
    document.querySelectorAll('#display-photo').forEach(pImg => {
        pImg.src = state.photo || '';
        pImg.style.display = state.photo ? 'block' : 'none';
    });

    // 3. Status & Logic Batch
    document.querySelectorAll('input, textarea').forEach(el => {
        if (!el.classList.contains('protected-field')) el.readOnly = !isMaster;
    });

    const profBonus = state.profBonusOverride || (Math.ceil(state.level / 4) + 1);
    
    // 4. Attribute Refactor
    ['for', 'des', 'con', 'int', 'sab', 'car'].forEach(a => {
        const val = state.attr[a];
        const mod = Math.floor((val - 10) / 2);
        if ($(`val-${a}`)) $(`val-${a}`).textContent = val;
        if ($(`mod-${a}`)) $(`mod-${a}`).textContent = (mod >= 0 ? '+' : '') + mod;
        if ($(`val-${a}`)?.closest('.attr-block')) $(`val-${a}`).closest('.attr-block').classList.toggle('master-editable', isMaster);
    });

    // 5. Consolidated Logic
    if ($('check-inspiration')) {
        const insp = state.inspiration === true ? 1 : (parseInt(state.inspiration) || 0);
        $('check-inspiration').textContent = insp;
        $('check-inspiration').className = 'attr-circle' + (insp > 0 ? ' active' : '');
    }
    if ($('display-ac')) $('display-ac').value = state.ac || (10 + Math.floor((state.attr.des - 10) / 2) + (state.armors || []).reduce((acc, arm) => acc + (parseInt(arm.bonus) || 0), 0));
    if ($('display-hd')) {
        const defaultHD = (state.level || 1) + ' ' + (CLASSES[state.cls]?.hd || 'd8');
        $('display-hd').textContent = state.hd || defaultHD;
    }

    // Death Saves
    ['success', 'fail'].forEach(type => {
        document.querySelectorAll(`.ds-${type}`).forEach((el, i) => el.classList.toggle('active', i < state.deathSaves[type]));
    });

    // Toggle master-editable batch
    ['display-level', 'display-ac', 'display-initiative', 'display-speed', 'hp-text', 'display-hd', 'container-inspiration', 'container-prof-bonus', 'display-name-header', 'display-photo-header'].forEach(id => {
        if ($(id)) $(id).classList.toggle('master-editable', isMaster);
    });

    // Sub-renders
    renderSkillBlock('saves-list', ['for', 'des', 'con', 'int', 'sab', 'car'], 'saves', profBonus);
    renderSkillBlock('skills-list', SKILLS, 'profs', profBonus);
    renderConditionsToggle();
    renderItems();

    // Individual RP fields (History Tab)
    ['bg', 'align', 'rpTraits', 'rpIdeals', 'rpBonds', 'rpFlaws'].forEach(f => {
        const id = f.startsWith('rp') ? `rp-${f.slice(2).toLowerCase()}` : `display-${f}`;
        const el = $(id);
        if (el) {
            el.value = state[f] || '';
            el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px';
        }
    });

    // Global Lore (Carregado do masterState vindo do servidor)
    const worldLore = masterState.worldLore || {};
    ['group', 'world', 'npcs'].forEach(key => {
        const el = $(`lore-${key}`);
        if (el) {
            el.value = worldLore[key] || '';
            el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px';
            if (!isMaster) el.readOnly = true; 
        }
    });

    if ($('btn-reset-char')) $('btn-reset-char').style.display = !isMaster ? 'block' : 'none';

    // Item creation visibility
    if ($('add-attack')) $('add-attack').style.display = isMaster ? 'block' : 'none';
    if ($('add-armor')) $('add-armor').style.display = isMaster ? 'block' : 'none';
    if ($('add-utility')) $('add-utility').style.display = isMaster ? 'block' : 'none';
}

function renderSkillBlock(containerId, dataSource, stateKey, profBonus) {
    const list = document.getElementById(containerId);
    if (!list) return;
    list.innerHTML = (containerId === 'saves-list' ? dataSource.map(a => ({ id: a, name: a.toUpperCase(), attr: a })) : dataSource).map(s => {
        const isProf = state[stateKey].includes(s.id);
        const mod = Math.floor((state.attr[s.attr] - 10) / 2);
        const total = mod + (isProf ? profBonus : 0);
        return `
            <div class="skill-row ${isMaster ? 'master-editable' : ''}" onclick="${containerId === 'saves-list' ? 'toggleSave' : 'toggleSkill'}('${s.id}')">
                <div class="dot-check ${isProf ? 'active' : ''}"></div>
                <span class="skill-val">${(total >= 0 ? '+' : '') + total}</span>
                <span class="skill-name">${s.name} ${s.attr !== s.id ? `<small style="color: var(--gold); margin-left: 0.2rem;">(${s.attr.toUpperCase()})</small>` : ''}</span>
            </div>`;
    }).join('');
}

function renderConditionsToggle() {
    const container = document.getElementById('conditions-toggle-grid');
    if (!container) return;
    const conds = state.conditions || [];
    if (!isMaster) {
        container.innerHTML = conds.length ? conds.map(id => `<div class="status-badge active" data-condition="${id}">${CONDITIONS[id].icon} ${CONDITIONS[id].name}</div>`).join('') : '';
    } else {
        container.innerHTML = Object.entries(CONDITIONS).map(([id, c]) => `
            <div class="status-toggle-item ${conds.includes(id) ? 'active' : ''}" data-condition="${id}" onclick="toggleCondition('${id}')">
                <span class="status-icon">${c.icon}</span><span class="status-name">${c.name}</span>
            </div>`).join('');
    }
}

function renderItems() {
    const config = {
        'Attack': { id: 'attacks-list', data: state.attacks, headers: ['Nome', 'Dano', 'Tipo'] },
        'Armor': { id: 'armors-list', data: state.armors, headers: ['Nome', 'Bônus', 'Peso'] },
        'Utility': { id: 'utility-list', data: state.utility, headers: ['Nome', 'Bônus', 'Qtd'] }
    };
    Object.keys(config).forEach(type => {
        const sec = config[type];
        renderGenericTable(sec.id, sec.data, sec.headers, type, (t, i) => removeItem(t, i));
    });
}

// Global Handlers
window.toggleSave = (a) => toggleList('saves', a);
window.toggleSkill = (s) => toggleList('profs', s);
function toggleList(key, val) { if (!isMaster) return; state[key] = state[key].includes(val) ? state[key].filter(x => x !== val) : [...state[key], val]; renderSheet(); broadcastChange(); }

window.toggleCondition = (id) => {
    if (!isMaster) return;
    state.conditions = (state.conditions || []).includes(id) ? state.conditions.filter(c => c !== id) : [...(state.conditions || []), id];
    if (state.conditions.includes(id)) sendSystemLog(`⚠️ <strong>${state.name}</strong> sob: <strong>${CONDITIONS[id].name}</strong> ${CONDITIONS[id].icon}`);
    renderSheet(); broadcastChange(); saveState();
};

window.removeItem = (type, i) => { state[type.toLowerCase() === 'attack' ? 'attacks' : type.toLowerCase() + 's'].splice(i, 1); renderSheet(); broadcastChange(); };

function renderHabilidades() {
    renderHeader();
    const config = {
        'Cantrip': { id: 'cantrips-list', data: state.cantrips, headers: ['Nome', 'Efeito', 'Dano'] },
        'SpellActive': { id: 'spells-active-list', data: state.spellsActive, headers: ['Nome', 'Efeito', 'Dano'] },
        'SpellInactive': { id: 'spells-inactive-list', data: state.spellsInactive, headers: ['Nome', 'Efeito', 'Dano'] }
    };
    Object.keys(config).forEach(type => {
        const sec = config[type];
        renderGenericTable(sec.id, sec.data, sec.headers, type, (t, i) => removeAbility(t, i));
    });

    const $ = id => document.getElementById(id);
    if ($('add-cantrip')) $('add-cantrip').style.display = isMaster ? 'block' : 'none';
    if ($('add-spell-active')) $('add-spell-active').style.display = isMaster ? 'block' : 'none';
    if ($('add-spell-inactive')) $('add-spell-inactive').style.display = isMaster ? 'block' : 'none';
}

function renderGenericTable(containerId, data, headers, type, removeFn) {
    const el = document.getElementById(containerId);
    if (!el) return;
    if (!data || data.length === 0) { el.innerHTML = ''; return; }

    const gridCols = isMaster ? '3fr 5fr 2fr 40px' : '3fr 5fr 2fr';
    
    el.innerHTML = `<div class="premium-table-header" style="grid-template-columns: ${gridCols};">
        <span>${headers[0]}</span><span>${headers[1]}</span><span>${headers[2]}</span>${isMaster ? '<span></span>' : ''}
    </div>` + 
    data.map((item, i) => `
        <div class="premium-table-row" style="grid-template-columns: ${gridCols};">
            <span class="wrap-text">${item.name}</span>
            <span class="wrap-text">${item.bonus || ''}</span>
            <span class="wrap-text">${item.qty || ''}</span>
            ${isMaster ? `<button onclick="removeGenericItem('${type}', ${i}, '${containerId}')">×</button>` : ''}
        </div>`).join('');
}

window.removeGenericItem = (type, i, containerId) => {
    // Determine which removal function to use based on containerId or type
    if (['attacks-list', 'armors-list', 'utility-list'].includes(containerId)) {
        removeItem(type, i);
    } else {
        removeAbility(type, i);
    }
};

function renderHistoryView() {
    renderHeader();
    const $ = id => document.getElementById(id);
    const container = $('sheet-container');
    if (!container) return;

    // Preservamos o layout padrão da ficha: Header + Body
    container.innerHTML = `
        <div class="character-header-placeholder"></div>
        <div class="sheet-body" style="display: block; padding-top: 0;">
            <div class="premium-card" style="min-height: 60vh; display: flex; flex-direction: column;">
                <div class="m-header" style="margin-bottom: 1.5rem; border-bottom: 1px solid var(--panel-border); padding-bottom: 1rem;">
                    <div class="m-header-info">
                        <h2 class="cinzel" style="font-size: 1.2rem;">Crônicas da Sessão</h2>
                        <p class="muted-text" style="font-size: 0.8rem;">Registro compartilhado de todas as ações importantes da mesa</p>
                    </div>
                </div>
                <div id="player-history-list" class="log-history" style="flex: 1; overflow-y: auto;">
                    ${sessionLog.length === 0 ? '<p class="muted-text txt-center" style="padding: 3rem; opacity: 0.5;">As crônicas ainda estão em branco...</p>' : sessionLog.map(log => `
                        <div class="log-entry" style="margin-bottom: 0.8rem;">
                            <div class="log-time">${log.timestamp}</div>
                            <div style="font-size: 0.9rem; line-height: 1.4;">${log.text}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    renderHeader(); // Re-popula o cabeçalho no novo placeholder

    // Auto-scroll para o final
    const list = $('player-history-list');
    if (list) list.scrollTop = list.scrollHeight;
}

window.removeAbility = (type, i) => { 
    const keyMap = { 'Cantrip': 'cantrips', 'SpellActive': 'spellsActive', 'SpellInactive': 'spellsInactive' };
    state[keyMap[type]].splice(i, 1); 
    renderHabilidades(); broadcastChange(); 
};
