function renderHeader() {
    const activeViews = document.querySelectorAll('.full-screen-modal.active');
    if (activeViews.length === 0) return;

    activeViews.forEach(activeView => {
        const placeholder = activeView.querySelector('.character-header-placeholder');
        if (!placeholder) return;

        const viewId = activeView.id;

        placeholder.innerHTML = `
            <header class="sheet-header premium-card read-only mb-md">
                <div class="header-main">
                    <div class="d-flex gap-md align-center flex-wrap">
                        <div class="char-portrait-container cursor-pointer" id="portrait-main" ${isMaster ? 'onclick="this.querySelector(\'input\').click()"' : ''}>
                            <span style="pointer-events: none;">👤</span>
                            <img id="display-photo-header" src="${state.photo || ''}" alt="Avatar" class="char-portrait" style="display: ${state.photo ? 'block' : 'none'}; pointer-events: none;">
                            ${isMaster ? '<input type="file" accept="image/*" class="hidden" onchange="window.handleMasterPhoto(this)">' : ''}
                        </div>

                        <div class="header-identity">
                            <input type="text" id="display-name-header" class="char-name-input protected-field" value="${state.name}" ${isMaster ? '' : 'readonly'}>
                            <div class="header-sub">
                                <div class="badge-role" id="display-class-header">${CLASSES[state.cls]?.name || state.cls || ''}</div>
                                <div class="badge-role" id="display-race-header">${RACES[state.race]?.name || state.race || ''}</div>
                                <div class="badge-role" id="display-level-header">Nível ${state.level || 1}</div>
                                ${isMaster && masterEditingOwner ? `<div class="badge-role badge-owner" id="display-owner-header">👤 ${masterEditingOwner}</div>` : ''}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="header-nav">
                    <button class="nav-btn ${viewId === 'sheet-view' ? 'active' : ''}" data-view="sheet-view" onclick="switchView('sheet-view')">
                        <span>Ficha</span>
                    </button>
                    <button class="nav-btn ${viewId === 'items-view' ? 'active' : ''}" data-view="items-view" onclick="switchView('items-view')">
                        <span>Itens</span>
                    </button>
                    <button class="nav-btn ${viewId === 'habilidades-view' ? 'active' : ''}" data-view="habilidades-view" onclick="switchView('habilidades-view')">
                        <span>Magias</span>
                    </button>
                    <button class="nav-btn ${viewId === 'history-view' ? 'active' : ''}" data-view="history-view" onclick="switchView('history-view')">
                        <span>Notas</span>
                    </button>
                    ${!isMaster ? `
                    <button class="nav-btn ${viewId === 'game-log-view' ? 'active' : ''}" data-view="game-log-view" onclick="switchView('game-log-view')">
                        <span>Histórico</span>
                    </button>` : ''}
                    
                    <button class="nav-btn font-weight-bold pdf-btn-color" onclick="window.downloadPDF()">
                        <span>📥 PDF</span>
                    </button>

                    <button class="nav-btn muted-text" id="btn-back-to-role">
                        <span>Voltar</span>
                    </button>
                </div>
            </header>
        `;
    });

    // Navegação e exclusão gerenciadas pelo events.js
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

    const isEditing = isMaster; // Apenas mestre edita após criação

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

    // Foto
    document.querySelectorAll('#display-photo').forEach(pImg => {
        pImg.src = state.photo || '';
        pImg.style.display = state.photo ? 'block' : 'none';
    });

    // Preencher campos PDF de Alma e Personalidade
    if ($('display-bg-pdf')) $('display-bg-pdf').value = state.bg || '';
    if ($('display-align-pdf')) $('display-align-pdf').value = state.align || '';
    if ($('rp-traits-pdf')) $('rp-traits-pdf').value = state.rpTraits || '';
    if ($('rp-ideals-pdf')) $('rp-ideals-pdf').value = state.rpIdeals || '';
    if ($('rp-bonds-pdf')) $('rp-bonds-pdf').value = state.rpBonds || '';
    if ($('rp-flaws-pdf')) $('rp-flaws-pdf').value = state.rpFlaws || '';

    // Campos
    document.querySelectorAll('input, textarea').forEach(el => {
        if (!el.classList.contains('protected-field')) el.readOnly = !isMaster;
    });

    const profBonus = state.profBonusOverride || (Math.ceil(state.level / 4) + 1);
    
    // Atributos
    ['for', 'des', 'con', 'int', 'sab', 'car'].forEach(a => {
        const val = state.attr[a];
        const mod = Math.floor((val - 10) / 2);
        if ($(`val-${a}`)) $(`val-${a}`).textContent = val;
        if ($(`mod-${a}`)) $(`mod-${a}`).textContent = (mod >= 0 ? '+' : '') + mod;
        if ($(`val-${a}`)?.closest('.attr-block')) $(`val-${a}`).closest('.attr-block').classList.toggle('master-editable', isMaster);
    });

    // Lógica
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

    // Salvamentos de morte
    ['success', 'fail'].forEach(type => {
        document.querySelectorAll(`.ds-${type}`).forEach((el, i) => el.classList.toggle('active', i < state.deathSaves[type]));
    });

    // Editável pelo mestre
    ['display-level', 'display-ac', 'display-initiative', 'display-speed', 'hp-text', 'display-hd', 'container-inspiration', 'container-prof-bonus', 'display-name-header', 'display-photo-header'].forEach(id => {
        if ($(id)) $(id).classList.toggle('master-editable', isMaster);
    });

    // Sub-renderizações
    renderSkillBlock('saves-list', ['for', 'des', 'con', 'int', 'sab', 'car'], 'saves', profBonus);
    renderSkillBlock('skills-list', SKILLS, 'profs', profBonus);
    renderConditionsToggle();
    renderItems();

    // Campos RP
    ['bg', 'align', 'rpTraits', 'rpIdeals', 'rpBonds', 'rpFlaws'].forEach(f => {
        const id = f.startsWith('rp') ? `rp-${f.slice(2).toLowerCase()}` : `display-${f}`;
        const el = $(id);
        if (el) {
            el.value = state[f] || '';
            el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px';
        }
    });

    // Lore global
    const worldLore = masterState.worldLore || {};
    ['group', 'world', 'npcs'].forEach(key => {
        const el = $(`lore-${key}`);
        if (el) {
            el.value = worldLore[key] || '';
            el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px';
            if (!isMaster) el.readOnly = true; 
        }
    });

    // Visibilidade de criação de itens
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
                <span class="skill-name">${s.name} ${s.attr !== s.id ? `<small class="color-gold" style="margin-left: 0.2rem;">(${s.attr.toUpperCase()})</small>` : ''}</span>
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

// Handlers globais
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
    // Determina função de remoção baseada no container
    if (['attacks-list', 'armors-list', 'utility-list'].includes(containerId)) {
        removeItem(type, i);
    } else {
        removeAbility(type, i);
    }
};

function renderSessionLog() {
    renderHeader();
    const $ = id => document.getElementById(id);
    const list = $('player-history-list');
    if (!list) return;

    list.innerHTML = sessionLog.length === 0 
        ? '<p class="muted-text text-center p-lg" style="opacity: 0.5;">As crônicas ainda estão em branco...</p>' 
        : sessionLog.map(log => `
            <div class="log-entry mb-sm">
                <div class="log-time">${log.timestamp}</div>
                <div class="font-size-sm" style="line-height: 1.4;">${log.text}</div>
            </div>
        `).join('');
    
    // Auto-scroll
    list.scrollTop = list.scrollHeight;
}

window.removeAbility = (type, i) => { 
    const keyMap = { 'Cantrip': 'cantrips', 'SpellActive': 'spellsActive', 'SpellInactive': 'spellsInactive' };
    state[keyMap[type]].splice(i, 1); 
    renderHabilidades(); broadcastChange(); 
};

window.downloadPDF = function() {
    const prevView = currentView;
    const viewsToPrint = ['sheet-view'];

    // 1. Mark body to trigger print stylesheet
    document.body.classList.add('is-printing-all');

    // 2. Enable active class on all views to make them visible to print
    viewsToPrint.forEach(v => {
        const el = document.getElementById(v);
        if (el) {
            el.classList.add('active');
            el.classList.add('print-force-active');
        }
    });

    // 3. Temporarily render each view to ensure it is fully filled with fresh details
    const origCurrentView = currentView;

    currentView = 'sheet-view';
    renderHeader();
    renderSheet();

    currentView = 'history-view';
    renderHeader();
    // Force history values mapping
    ['bg', 'align', 'rpTraits', 'rpIdeals', 'rpBonds', 'rpFlaws'].forEach(f => {
        const id = f.startsWith('rp') ? `rp-${f.slice(2).toLowerCase()}` : `display-${f}`;
        const el = document.getElementById(id);
        if (el) el.value = state[f] || '';
    });

    // Restore global view tracker
    currentView = origCurrentView;

    // 4. Trigger high resolution browser print/save as PDF
    setTimeout(() => {
        window.print();

        // 5. Clean up classes and return layout to screen-only state
        document.body.classList.remove('is-printing-all');
        viewsToPrint.forEach(v => {
            const el = document.getElementById(v);
            if (el) {
                el.classList.remove('print-force-active');
                if (v !== prevView) {
                    el.classList.remove('active');
                }
            }
        });

        switchView(prevView);
    }, 250);
};
