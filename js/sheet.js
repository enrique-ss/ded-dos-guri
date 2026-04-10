function renderHeader() {
    const activeView = document.querySelector('.full-screen-modal.active');
    if (!activeView) return;
    const placeholder = activeView.querySelector('.character-header-placeholder');
    if (!placeholder) return;

    placeholder.innerHTML = `
        <header class="sheet-header premium-card read-only" style="margin-bottom: 1rem;">
            <div class="header-main">
                <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                    <div class="char-portrait-container">
                        👤
                        <img id="display-photo-header" src="${state.photo || ''}" alt="Avatar" class="char-portrait" style="display: ${state.photo ? 'block' : 'none'};">
                    </div>

                    <div class="header-identity">
                        <input type="text" id="display-name-header" class="char-name-input protected-field" value="${state.name}" readonly maxlength="25">
                        <div class="header-sub">
                            <div class="badge-role" id="display-class-header">${state.cls || '---'}</div>
                            <div class="badge-role" id="display-race-header">${state.race || '---'}</div>
                            <div class="badge-role" id="display-level-header">Nível ${state.level}</div>
                            <div class="badge-role" id="display-xp-header">XP ${state.xp}</div>
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
                <button class="nav-btn ${currentView === 'history-view' ? 'active' : ''}" data-view="history-view" onclick="switchView('history-view')">
                    <span>História</span>
                </button>
                
                <button class="nav-btn" id="btn-back-to-role" style="color: var(--txt-muted);">
                    <span>Voltar</span>
                </button>
                
                <button class="nav-btn btn-reset" id="btn-reset-char" style="color: var(--red); display: ${!isMaster ? 'block' : 'none'}">
                    <span>Excluir</span>
                </button>
            </div>
        </header>
    `;

    // Rebind do botão voltar (Mestre e Jogador)
    const btnBack = document.getElementById('btn-back-to-role');
    if (btnBack) {
        btnBack.onclick = () => {
            if (isMaster) {
                if (masterEditingType === 'npc') {
                    masterEditingId = null; masterState.activeTab = 'bestiary'; render();
                } else {
                    masterEditingId = null; masterState.activeTab = 'players'; render();
                }
            } else {
                roleSelected = false; render();
            }
        };
    }
    
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

    const isEditing = isMaster || !container.classList.contains('read-only');

    // 1. Text & Value Mapping (Radical Reduction)
    const mappings = {
        'display-class': CLASSES[state.cls]?.name || '---',
        'display-race': RACES[state.race]?.name || '---',
        'display-level': `Nível ${state.level}`,
        'display-xp': `XP ${state.xp}`,
        'prof-bonus': '+' + (state.profBonusOverride || (Math.ceil(state.level / 4) + 1)),
        'display-initiative': state.initiativeRoll || 0,
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
        if (!el.classList.contains('protected-field')) el.readOnly = !(isMaster || isEditing);
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
    if ($('display-hd')) $('display-hd').value = state.hd;

    // Death Saves
    ['success', 'fail'].forEach(type => {
        document.querySelectorAll(`.ds-${type}`).forEach((el, i) => el.classList.toggle('active', i < state.deathSaves[type]));
    });

    // Toggle master-editable batch
    ['display-xp', 'display-level', 'display-ac', 'display-initiative', 'display-speed', 'hp-text', 'display-hd', 'container-inspiration', 'container-prof-bonus'].forEach(id => {
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

    // Global Lore (Shared between all)
    const worldLore = JSON.parse(localStorage.getItem('rpg_world_lore') || '{}');
    ['group', 'world', 'npcs'].forEach(key => {
        const el = $(`lore-${key}`);
        if (el) {
            el.value = worldLore[key] || '';
            el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px';
            if (!isMaster) el.readOnly = true; // Só mestre mexe no global
        }
    });

    if ($('btn-reset-char')) $('btn-reset-char').style.display = (isMaster && masterEditingType === 'npc') || !isMaster ? 'block' : 'none';

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
    const gridCols = isMaster ? '2fr 1fr 1fr 40px' : '2fr 1fr 1fr';
    const config = {
        'Attack': { id: 'attacks-list', data: state.attacks, headers: ['Nome', 'Dano', 'Tipo'] },
        'Armor': { id: 'armors-list', data: state.armors, headers: ['Nome', 'Bonus', 'Peso'] },
        'Utility': { id: 'utility-list', data: state.utility, headers: ['Nome', 'Bonus', 'Quantidade'] }
    };
    Object.keys(config).forEach(type => {
        const sec = config[type];
        const el = document.getElementById(sec.id);
        if (!el) return;
        el.innerHTML = `<div class="attacks-header" style="grid-template-columns: ${gridCols};"><span>${sec.headers[0]}</span><span>${sec.headers[1]}</span><span>${sec.headers[2]}</span>${isMaster ? '<span></span>' : ''}</div>` + 
            (sec.data || []).map((item, i) => `<div class="attack-row" style="grid-template-columns: ${gridCols};"><span>${item.name}</span><span>${item.bonus || ''}</span><span>${item.qty || ''}</span>${isMaster ? `<button class="btn-ghost" onclick="removeItem('${type}', ${i})">×</button>` : ''}</div>`).join('');
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
