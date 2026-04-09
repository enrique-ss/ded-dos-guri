// ==================== RADICAL CHARACTER SHEET ENGINE ====================

function renderSheet() {
    const $ = id => document.getElementById(id);
    const isEditing = isMaster || !$('sheet-container').classList.contains('read-only');

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
    if ($('check-inspiration')) $('check-inspiration').className = 'attr-circle' + (state.inspiration ? ' active' : '');
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
            el.value = state[f] || (f.length < 5 ? '---' : '');
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
                <span class="skill-name">${s.name} ${s.attr !== s.id ? `<small>(${s.attr.toUpperCase()})</small>` : ''}</span>
            </div>`;
    }).join('');
}

function renderConditionsToggle() {
    const container = document.getElementById('conditions-toggle-grid');
    if (!container) return;
    const conds = state.conditions || [];
    if (!isMaster) {
        container.innerHTML = conds.length ? conds.map(id => `<div class="status-badge active">${CONDITIONS[id].icon} ${CONDITIONS[id].name}</div>`).join('') : '<div class="muted-text">Nenhuma condição ativa.</div>';
    } else {
        container.innerHTML = Object.entries(CONDITIONS).map(([id, c]) => `
            <div class="status-toggle-item ${conds.includes(id) ? 'active' : ''}" onclick="toggleCondition('${id}')">
                <span class="status-icon">${c.icon}</span><span class="status-name">${c.name}</span>
            </div>`).join('');
    }
}

function renderItems() {
    const gridCols = isMaster ? '2fr 1fr 1fr 40px' : '2fr 1fr 1fr';
    [{ id: 'attacks-list', data: state.attacks, type: 'Attack' }, { id: 'armors-list', data: state.armors, type: 'Armor' }, { id: 'utility-list', data: state.utility, type: 'Utility' }].forEach(sec => {
        const el = document.getElementById(sec.id);
        if (!el) return;
        el.innerHTML = `<div class="attacks-header" style="grid-template-columns: ${gridCols};"><span>Nome</span><span>Bônus</span><span>Qtde</span>${isMaster ? '<span></span>' : ''}</div>` + 
            (sec.data || []).map((item, i) => `<div class="attack-row" style="grid-template-columns: ${gridCols};"><span>${item.name}</span><span>${item.bonus || ''}</span><span>${item.qty || ''}</span>${isMaster ? `<button class="btn-ghost" onclick="removeItem('${sec.type}', ${i})">×</button>` : ''}</div>`).join('');
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
