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
        slot.querySelector('.slot-display').textContent = val !== 0 ? val : '';
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
        limitText.innerHTML = `Escolha ${wizardData.skills.length} / ${maxPicks} perícias (<strong style="color: ${faltam > 0 ? 'var(--green)' : 'var(--red)'};">Faltam ${faltam}</strong>):`;
        limitText.dataset.max = maxPicks;
    }

    const grid = document.getElementById('skills-selection-grid');
    if (grid) {
        grid.innerHTML = SKILLS.map(s => {
            if (allowed !== 'all' && !allowed.includes(s.id)) return '';
            return `
                <div class="choice-card choice-skill ${wizardData.skills.includes(s.id) ? 'selected' : ''}" data-skill="${s.id}">
                    <strong>${s.name}</strong> <small style="color: var(--gold); margin-left: 0.2rem;">(${s.attr.toUpperCase()})</small>
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
    char.bg = bg || '';
    char.align = align || '';
    
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
        masterState.activeTab = 'bestiary';
        switchView('master-panel');
    } else if (isPreCreatingPlayer) {
        // Fluxo de Pré-criação pelo Mestre
        char.rpTraits = wizardData.personality.traits;
        char.rpIdeals = wizardData.personality.ideals;
        char.rpBonds = wizardData.personality.bonds;
        char.rpFlaws = wizardData.personality.flaws;
        char.rpFeats = `[RAÇA: ${r.name}]\n- ${r.modsDesc}\n- ${r.feature}\n\n[CLASSE: ${c.name}]\n- Armaduras: ${c.armor}`;
        
        // Abre modal para o mestre escolher o e-mail do alvo antes de salvar
        openUserSelectionModal(char);
        
    } else {
        char.rpTraits = wizardData.personality.traits;
        char.rpIdeals = wizardData.personality.ideals;
        char.rpBonds = wizardData.personality.bonds;
        char.rpFlaws = wizardData.personality.flaws;
        char.rpFeats = `[RAÇA: ${r.name}]\n- ${r.modsDesc}\n- ${r.feature}\n\n[CLASSE: ${c.name}]\n- Armaduras: ${c.armor}`;
        
        state = char; // Define a ficha atual em RAM
        wizardData.active = false;
        
        // Persiste a ficha de fato no banco
        saveStateToSupabase().then(() => {
            if (socket) socket.emit('playerIdentify', state);
            roleSelected = true;
            document.getElementById('creation-screen')?.classList.remove('active');
            switchView('sheet-view');
        });
    }
}

async function finalizePlayerPreCreation(char) {
    if (!targetUserIdByMaster) return alert("Erro: ID de usuário alvo não definido.");
    
    try {
        const response = await fetch('/api/admin/characters/precreate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                targetUserId: targetUserIdByMaster,
                charData: char 
            })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            alert(`Personagem "${char.name}" vinculado com sucesso!`);
            isPreCreatingPlayer = false;
            targetUserIdByMaster = null;
            switchView('master-panel');
        } else {
            throw new Error(result.error || "Falha desconhecida no servidor");
        }
    } catch (error) {
        console.error("Erro ao salvar personagem pré-criado via API:", error);
        alert("Erro ao salvar personagem: " + error.message);
    }
}

async function openUserSelectionModal(charData) {
    const modalHtml = `
        <div id="user-selection-modal" class="active fade-in" style="position: fixed; inset: 0; background: rgba(0,0,0,0.9); backdrop-filter: blur(10px); display:flex; align-items:center; justify-content:center; z-index:99999; padding: 1.5rem;">
            <div class="premium-card" style="width: 100%; max-width: 500px; padding: 2rem;">
                <h2 class="cinzel" style="text-align: center; color: var(--gold); margin-bottom: 1rem;">Vincular ao Jogador</h2>
                <p class="muted-text txt-center">Selecione o e-mail do jogador que usará este personagem.</p>
                <div id="modal-users-list" style="max-height: 300px; overflow-y: auto; margin: 1.5rem 0; border: 1px solid var(--panel-border); border-radius: 8px; background: var(--bg-overlay);">
                    <div class="txt-center" style="padding: 2rem;">Carregando usuários...</div>
                </div>
                <div style="display:flex; gap: 1rem;">
                    <button class="btn-ghost" onclick="document.getElementById('user-selection-modal').remove()" style="flex:1;">Cancelar</button>
                    <button class="btn-primary" id="btn-confirm-link" disabled style="flex:1;">Finalizar e Salvar</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    try {
        const response = await fetch('/api/admin/users');
        const users = await response.json();
        const listDiv = document.getElementById('modal-users-list');
        
        if (!users || !Array.isArray(users)) {
            listDiv.innerHTML = '<div class="txt-center" style="padding: 2rem; color: var(--red);">Erro ao carregar lista de usuários.</div>';
            return;
        }

        listDiv.innerHTML = users.map(u => `
            <div class="user-item-link" data-id="${u.id}" style="padding: 1rem; cursor: pointer; border-bottom: 1px solid var(--panel-border); transition: 0.2s;">
                <div style="font-weight: 700; color: var(--gold);">${u.email}</div>
                <small class="muted-text">Criado em: ${new Date(u.created_at).toLocaleDateString()}</small>
            </div>
        `).join('');

        let selectedId = null;
        const items = document.querySelectorAll('.user-item-link');
        items.forEach(item => {
            item.addEventListener('click', () => {
                items.forEach(i => i.style.background = 'transparent');
                item.style.background = 'rgba(255, 190, 11, 0.1)';
                selectedId = item.dataset.id;
                document.getElementById('btn-confirm-link').disabled = false;
            });
        });

        document.getElementById('btn-confirm-link').onclick = async () => {
            if (selectedId) {
                targetUserIdByMaster = selectedId;
                await finalizePlayerPreCreation(charData);
                document.getElementById('user-selection-modal').remove();
            }
        };

    } catch (err) {
        console.error(err);
    }
}

window.startNPCCreation = function() {
    isCreatingNPC = true;
    isPreCreatingPlayer = false;
    wizardData = {
        active: true, step: 1, name: '', race: '', cls: '', bg: '', align: '', photo: '',
        personality: { traits: '', ideals: '', bonds: '', flaws: '' },
        attr: { for: 0, des: 0, con: 0, int: 0, sab: 0, car: 0 }, skills: []
    };
    const nameInput = document.getElementById('create-name');
    if (nameInput) {
        nameInput.value = '';
        nameInput.readOnly = false;
        nameInput.removeAttribute('readonly');
        nameInput.style.pointerEvents = 'auto';
        nameInput.style.userSelect = 'text';
    }
    buildGrids(); switchView('creation-screen'); goToStep(1);
};

window.startPlayerCreationByMaster = function() {
    isPreCreatingPlayer = true;
    isCreatingNPC = false;
    wizardData = {
        active: true, step: 1, name: '', race: '', cls: '', bg: '', align: '', photo: '',
        personality: { traits: '', ideals: '', bonds: '', flaws: '' },
        attr: { for: 0, des: 0, con: 0, int: 0, sab: 0, car: 0 }, skills: []
    };
    buildGrids(); switchView('creation-screen'); goToStep(1);
};
