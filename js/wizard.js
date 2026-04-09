// ==================== WIZARD & BUILDER LOGIC ====================

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

window.selectFromPool = (v) => { wizardSelection = (wizardSelection === v ? null : v); renderAttributeDrafter(); };
window.assignToSlot = (a) => { 
    if (wizardSelection) { wizardData.attr[a] = wizardSelection; wizardSelection = null; } 
    else { wizardData.attr[a] = 0; }
    renderAttributeDrafter(); 
};

function goToStep(n) {
    if (n > wizardData.step) {
        if (wizardData.step === 1) {
            const name = document.getElementById('create-name').value.trim();
            if (!name || !wizardData.race) { alert("Dê um nome e escolha uma Raça!"); return; }
        }
        if (wizardData.step === 2 && !wizardData.cls) { alert("Escolha uma Classe!"); return; }
        if (wizardData.step === 3) {
            const limit = parseInt(document.getElementById('skills-limit-text')?.dataset.max || 0);
            if (wizardData.skills.length < limit) { alert(`Faltam perícias!`); return; }
        }
        if (wizardData.step === 4 && Object.values(wizardData.attr).some(v => v === 0)) { alert("Distribua todos os valores!"); return; }
    }
    const titleSpan = document.querySelector('#creation-screen h1 span');
    if (titleSpan) titleSpan.textContent = isCreatingNPC ? 'NPC' : 'Herói';
    
    wizardData.step = n;
    if (n === 3) loadSkillChoices();
    if (n === 4) renderAttributeDrafter();
    
    document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('active'));
    const step = document.getElementById('step-' + n);
    if (step) step.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function loadSkillChoices() {
    const cls = CLASSES[wizardData.cls];
    let maxPicks = cls.skillChoices;
    let allowed = cls.allowSkills;
    if (wizardData.race === 'meio_elfo') { maxPicks += 2; allowed = 'all'; }

    const limitText = document.getElementById('skills-limit-text');
    if (limitText) {
        const faltam = maxPicks - wizardData.skills.length;
        limitText.innerHTML = `Escolha ${wizardData.skills.length} / ${maxPicks} perícias (<strong style="color: ${faltam > 0 ? '#4CAF50' : '#ff3333'};">Faltam ${faltam}</strong>):`;
        limitText.dataset.max = maxPicks;
    }

    const grid = document.getElementById('skills-selection-grid');
    if (grid) {
        grid.innerHTML = SKILLS.map(s => {
            if (allowed !== 'all' && !allowed.includes(s.id)) return '';
            return `
                <div class="choice-card choice-skill ${wizardData.skills.includes(s.id) ? 'selected' : ''}" data-skill="${s.id}">
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
    if (!name || !wizardData.race || !wizardData.cls) { alert('Complete o registro!'); return; }

    wizardData.personality = {
        traits: document.getElementById('create-traits').value.trim(),
        ideals: document.getElementById('create-ideals').value.trim(),
        bonds: document.getElementById('create-bonds').value.trim(),
        flaws: document.getElementById('create-flaws').value.trim()
    };

    const file = document.getElementById('create-photo').files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => finalizeWizard(name, bg, align, e.target.result);
        reader.readAsDataURL(file);
    } else finalizeWizard(name, bg, align, '');
}

function finalizeWizard(name, bg, align, photo) {
    const char = isCreatingNPC ? { ...getDefaultState() } : (state = getDefaultState());
    char.isCreated = true;
    char.name = name;
    char.race = wizardData.race;
    char.cls = wizardData.cls;
    char.photo = photo;
    char.attr = { ...wizardData.attr };
    char.profs = [...wizardData.skills];
    char.bg = bg || '---';
    char.align = align || '---';
    
    const r = RACES[char.race];
    const c = CLASSES[char.cls];
    char.speed = r.speed;
    char.hp.max = c.hp + Math.floor((char.attr.con - 10) / 2);
    char.hp.current = char.hp.max;
    char.hd = '1' + c.hd.substring(1);
    char.saves = [...c.saves];

    if (isCreatingNPC) {
        char.id = Date.now();
        masterState.npcs.push(char);
        saveMasterState();
        isCreatingNPC = false;
        sendSystemLog(`👾 NPC Criado: <strong>${name}</strong>.`);
        masterState.activeTab = 'bestiary';
        switchView('master-panel');
    } else {
        char.rpTraits = wizardData.personality.traits;
        char.rpIdeals = wizardData.personality.ideals;
        char.rpBonds = wizardData.personality.bonds;
        char.rpFlaws = wizardData.personality.flaws;
        char.rpFeats = `[RAÇA: ${r.name}]\n- ${r.modsDesc}\n- ${r.feature}\n\n[CLASSE: ${c.name}]\n- Armaduras: ${c.armor}`;
        saveState();
        if (socket) socket.emit('playerIdentify', char);
        sendSystemLog(`📜 <strong>${char.name}</strong> (${c.name}) entrou na aventura!`);
        render();
    }
}

window.startNPCCreation = function() {
    isCreatingNPC = true;
    wizardData = {
        active: true, step: 1, name: '', race: '', cls: '', bg: '', align: '', photo: '',
        personality: { traits: '', ideals: '', bonds: '', flaws: '' },
        attr: { for: 0, des: 0, con: 0, int: 0, sab: 0, car: 0 }, skills: []
    };
    const nameInput = document.getElementById('create-name');
    if (nameInput) nameInput.value = '';
    buildGrids(); switchView('creation-screen'); goToStep(1);
};
