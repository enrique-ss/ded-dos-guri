// ==================== CHARACTER SHEET LOGIC ====================

function renderSheet() {
    const $ = id => document.getElementById(id);
    const isEditing = isMaster || !$('sheet-container').classList.contains('read-only');

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
        $('display-xp').classList.toggle('master-editable', isMaster);
    }
    if ($('display-level')) {
        $('display-level').classList.toggle('master-editable', isMaster);
    }

    document.querySelectorAll('#sheet-view input, #sheet-view textarea').forEach(el => {
        if (isMaster && !el.classList.contains('protected-field')) {
            el.removeAttribute('readonly');
        } else if (!isMaster && !isEditing) {
            el.setAttribute('readonly', true);
        }
    });

    const npcDanger = $('npc-danger-zone');
    if (npcDanger) npcDanger.style.display = (isMaster && masterEditingType === 'npc') ? 'flex' : 'none';

    const attrs = ['for', 'des', 'con', 'int', 'sab', 'car'];
    attrs.forEach(a => {
        const valEl = $(`val-${a}`);
        const modEl = $(`mod-${a}`);
        const parent = valEl ? valEl.closest('.attr-block') : null;
        if (parent) parent.classList.toggle('master-editable', isMaster);
        const val = state.attr[a];
        const mod = Math.floor((val - 10) / 2);
        if (valEl) valEl.textContent = val;
        if (modEl) modEl.textContent = (mod >= 0 ? '+' : '') + mod;
    });

    const inspEl = $('check-inspiration');
    const inspContainer = $('container-inspiration');
    if (inspEl) {
        inspEl.className = 'attr-circle' + (state.inspiration ? ' active' : '');
        if (inspContainer) inspContainer.classList.toggle('master-editable', isMaster);
    }
    
    if ($('container-prof-bonus')) $('container-prof-bonus').classList.toggle('master-editable', isMaster);
    
    const profBonus = state.profBonusOverride || (Math.ceil(state.level / 4) + 1);
    if ($('prof-bonus')) {
        $('prof-bonus').textContent = '+' + profBonus;
    }

    renderSaves(profBonus);
    renderSkills(profBonus);
    renderConditionsToggle();

    const armorBonus = (state.armors || []).reduce((acc, arm) => acc + (parseInt(arm.bonus) || 0), 0);
    const desMod = Math.floor((state.attr.des - 10) / 2);
    const totalAC = 10 + desMod + armorBonus;
    if ($('display-ac')) {
        $('display-ac').value = state.ac || totalAC;
        $('display-ac').classList.toggle('master-editable', isMaster);
    }

    if ($('display-initiative')) {
        $('display-initiative').textContent = state.initiativeRoll || 0;
        $('display-initiative').classList.toggle('master-editable', isMaster);
    }
    if ($('display-speed')) {
        $('display-speed').textContent = state.speed + 'm';
        $('display-speed').classList.toggle('master-editable', isMaster);
    }
    if ($('hp-text')) {
        $('hp-text').textContent = `${state.hp.current} / ${state.hp.max}`;
        $('hp-text').classList.toggle('master-editable', isMaster);
    }
    if ($('display-hd')) {
        $('display-hd').value = state.hd;
        $('display-hd').classList.toggle('master-editable', isMaster);
    }

    document.querySelectorAll('.ds-success').forEach((el, i) => {
        el.className = 'dot-check ds-success' + (i < state.deathSaves.success ? ' active' : '');
    });
    document.querySelectorAll('.ds-fail').forEach((el, i) => {
        el.className = 'dot-check ds-fail' + (i < state.deathSaves.fail ? ' active' : '');
    });

    if ($('add-attack')) $('add-attack').style.display = isMaster ? 'block' : 'none';
    if ($('add-armor')) $('add-armor').style.display = isMaster ? 'block' : 'none';
    if ($('add-utility')) $('add-utility').style.display = isMaster ? 'block' : 'none';
    
    const resetBtn = $('btn-reset-char');
    if (resetBtn) {
        const resetTxt = resetBtn.querySelector('span');
        if (isMaster && masterEditingType === 'npc') {
            resetBtn.className = 'nav-btn';
            if (resetTxt) resetTxt.textContent = 'Voltar';
            resetBtn.style.display = 'block';
        } else if (!isMaster) {
            resetBtn.className = 'nav-btn btn-reset';
            if (resetTxt) resetTxt.textContent = 'Excluir';
            resetBtn.style.display = 'block';
        } else {
            resetBtn.style.display = 'none';
        }
    }

    renderItems();

    if ($('gold-po')) $('gold-po').value = state.gold;
    ['traits', 'ideals', 'bonds', 'flaws', 'feats'].forEach(f => {
        const el = $(`rp-${f}`);
        if (el) {
            el.value = state[`rp${f.charAt(0).toUpperCase() + f.slice(1)}`];
            el.style.height = 'auto';
            el.style.height = el.scrollHeight + 'px';
        }
    });
}

function renderSaves(profBonus) {
    const list = document.getElementById('saves-list');
    if (!list) return;
    const attrs = ['for', 'des', 'con', 'int', 'sab', 'car'];
    list.innerHTML = attrs.map(a => {
        const isProf = state.saves.includes(a);
        const mod = Math.floor((state.attr[a] - 10) / 2);
        const total = mod + (isProf ? profBonus : 0);
        return `
            <div class="skill-row ${isMaster ? 'master-editable' : ''}" onclick="toggleSave('${a}')">
                <div class="dot-check ${isProf ? 'active' : ''}"></div>
                <span class="skill-val">${(total >= 0 ? '+' : '') + total}</span>
                <span class="skill-name">${a.toUpperCase()}</span>
            </div>
        `;
    }).join('');
}

function renderSkills(profBonus) {
    const list = document.getElementById('skills-list');
    if (!list) return;
    list.innerHTML = SKILLS.map(s => {
        const isProf = state.profs.includes(s.id);
        const mod = Math.floor((state.attr[s.attr] - 10) / 2);
        const total = mod + (isProf ? profBonus : 0);
        return `
            <div class="skill-row ${isMaster ? 'master-editable' : ''}" onclick="toggleSkill('${s.id}')">
                <div class="dot-check ${isProf ? 'active' : ''}"></div>
                <span class="skill-val">${(total >= 0 ? '+' : '') + total}</span>
                <span class="skill-name">
                    ${s.name} <small style="color:var(--txt-muted); font-size: 0.65rem; margin-left: 0.4rem;">(${s.attr.toUpperCase()})</small>
                </span>
            </div>
        `;
    }).join('');
}

function renderConditionsToggle() {
    const container = document.getElementById('conditions-toggle-grid');
    if (!container) return;
    if (!isMaster) {
        if ((state.conditions || []).length === 0) {
            container.innerHTML = '<div class="muted-text" style="font-size:0.7rem; padding: 0.5rem;">Nenhuma condição ativa.</div>';
            return;
        }
        container.innerHTML = (state.conditions || []).map(id => {
            const c = CONDITIONS[id];
            return `<div class="status-badge active" title="${c.name}">${c.icon} ${c.name}</div>`;
        }).join('');
    } else {
        container.innerHTML = Object.entries(CONDITIONS).map(([id, c]) => {
            const isActive = (state.conditions || []).includes(id);
            return `
                <div class="status-toggle-item ${isActive ? 'active' : ''}" onclick="toggleCondition('${id}')" title="${c.name}">
                    <span class="status-icon">${c.icon}</span>
                    <span class="status-name">${c.name}</span>
                </div>
            `;
        }).join('');
    }
}

function renderItems() {
    const gridCols = isMaster ? '2fr 1fr 1fr 40px' : '2fr 1fr 1fr';
    const sections = [
        { id: 'attacks-list', data: state.attacks, type: 'Attack', icon: '⚔️' },
        { id: 'armors-list', data: state.armors, type: 'Armor', icon: '🛡️' },
        { id: 'utility-list', data: state.utility, type: 'Utility', icon: '📦' }
    ];
    sections.forEach(sec => {
        const el = document.getElementById(sec.id);
        if (el) {
            el.innerHTML = `
                <div class="attacks-header" style="grid-template-columns: ${gridCols};">
                    <span>Nome</span><span>Bônus</span><span>Qtde</span>${isMaster ? '<span></span>' : ''}
                </div>
                ${(sec.data || []).map((item, i) => `
                    <div class="attack-row" style="grid-template-columns: ${gridCols};">
                        <span>${item.name}</span><span>${item.bonus || ''}</span><span>${item.qty || ''}</span>
                        ${isMaster ? `<button class="btn-ghost" style="padding:0; border:none; color:var(--red); font-size:1.2rem;" onclick="remove${sec.type}(${i})">×</button>` : ''}
                    </div>
                `).join('')}
            `;
        }
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

window.toggleCondition = function(id) {
    if (!isMaster) return;
    state.conditions = state.conditions || [];
    if (state.conditions.includes(id)) state.conditions = state.conditions.filter(c => c !== id);
    else {
        state.conditions.push(id);
        sendSystemLog(`⚠️ <strong>${state.name}</strong> sob: <strong>${CONDITIONS[id].name}</strong> ${CONDITIONS[id].icon}`);
    }
    renderSheet(); broadcastChange(); saveState();
};

window.removeAttack = (i) => { state.attacks.splice(i, 1); renderSheet(); broadcastChange(); };
window.removeArmor = (i) => { state.armors.splice(i, 1); renderSheet(); broadcastChange(); };
window.removeUtility = (i) => { state.utility.splice(i, 1); renderSheet(); broadcastChange(); };
