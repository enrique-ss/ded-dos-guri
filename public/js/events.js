const debounceMasterList = debounce(() => {
    if (isMaster) renderMasterPanel();
}, 1000);

window.handleMasterPhoto = (input) => {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            state.photo = e.target.result;
            renderSheet();
            broadcastChange();
            if (isMaster && masterEditingType === 'player') debounceMasterList();
        };
        reader.readAsDataURL(file);
    }
};

function setupEvents() {

    document.addEventListener('click', async e => {
        const t = e.target;

        // Seleção de papel
        const rCard = t.closest('.choice-card[data-role]');
        if (rCard) {
            const role = rCard.dataset.role;
            if (role === 'mestre') {
                if (prompt("Código do Mestre:") === "4444") {
                    if (user) await loadMasterStateFromSupabase(); // Força update do state do mestre
                    roleSelected = true; isMaster = true; masterState.activeTab = 'mesa'; 
                    wipeActiveState(); // Garante que começa com o estado limpo sem ficha de player
                    render();
                } else alert("Código incorreto!");
            } else { 
                // Fluxo Jogador: Abre tela de seleção
                renderCharacterSelection();
            }
            return;
        }

        // Seleção de personagem
        const charCard = t.closest('.char-card[data-id]');
        if (charCard) {
            const charId = charCard.dataset.id;
            const charObj = userCharacters.find(c => c.id === charId);
            if (charObj) {
                state = charObj.data;
                state.id = charId; // Garantir que o ID está no state
                roleSelected = true;
                isMaster = false;
                wizardData.active = false;
                document.getElementById('character-selection')?.classList.remove('active');
                
                // Identificar para o mestre
                if (socket) {
                    socket.emit('playerIdentify', { ...state, userEmail: user.email });
                }
                
                render();
            }
            return;
        }

        if (t.closest('#btn-new-character')) {
            wipeActiveState();
            roleSelected = true;
            isMaster = false;
            wizardData.active = true;
            wizardData.step = 1;
            document.getElementById('character-selection')?.classList.remove('active');
            if (typeof resetWizardUI === 'function') resetWizardUI();
            render();
            return;
        }

        if (t.closest('#btn-back-to-role-from-selection')) {
            document.getElementById('character-selection')?.classList.remove('active');
            document.getElementById('role-selection')?.classList.add('active');
            return;
        }

        // Navegação comum
        if (t.closest('#btn-master-exit') || t.closest('#btn-back-to-role')) {
            if (isMaster) {
                if (masterEditingId) {
                    const prev = masterEditingType === 'npc' ? 'bestiary' : 'mesa';
                    masterEditingId = null; masterEditingType = 'player'; masterState.activeTab = prev;
                    wipeActiveState(); render();
                } else {
                    // Sair do painel do mestre para a seleção de papel
                    roleSelected = false; isMaster = false; render();
                }
            } else {
                // Fluxo Jogador Sair da Criação ou Ficha
                if (wizardData.active) {
                    wizardData.active = false;
                    renderCharacterSelection();
                    render();
                } else {
                    // Sair da ficha para a lista de personagens
                    if (socket) socket.emit('playerLeave');
                    state = getDefaultState();
                    renderCharacterSelection();
                    render();
                }
            }
            return;
        }

        // Ações da ficha
        if (t.closest('#container-inspiration')) {
            if (isMaster) {
                const current = state.inspiration === true ? 1 : (parseInt(state.inspiration) || 0);
                const val = prompt("Pontos de Inspiração:", current);
                if (val !== null) {
                    state.inspiration = parseInt(val) || 0;
                    renderSheet(); broadcastChange();
                }
            }
        }
        if (t.id === 'hp-text') {
            if (isMaster) {
                const cur = state.hp.current;
                const max = state.hp.max;
                
                const newVal = prompt(`Alterar PV Atuais (Máx: ${max}):`, cur);
                if (newVal !== null) {
                    let finalVal = parseInt(newVal) || 0;
                    // Regra: Não pode passar da vida máxima
                    if (finalVal > max) {
                        alert(`Atenção: A vida atual não pode ultrapassar o máximo (${max}). Definindo para o máximo.`);
                        finalVal = max;
                    }
                    state.hp.current = finalVal;
                    sendSystemLog(`❤️ <strong>${state.name}</strong>: PV definidos para <strong>${state.hp.current}/${max}</strong>`);
                }

                if (confirm("Deseja alterar a Vida MÁXIMA também?")) {
                    const newMax = prompt("Nova Vida Máxima:", max);
                    if (newMax !== null) {
                        state.hp.max = parseInt(newMax) || 1;
                        if (state.hp.current > state.hp.max) state.hp.current = state.hp.max;
                        sendSystemLog(`💖 <strong>${state.name}</strong>: Vida Máxima alterada para <strong>${state.hp.max}</strong>`);
                    }
                }
                
                renderSheet(); broadcastChange();
            }
        }
        if (t.id === 'display-speed') {
            if (isMaster) {
                const val = prompt("Alterar Deslocamento (em metros):", state.speed);
                if (val !== null) {
                    state.speed = parseInt(val) || 0;
                    sendSystemLog(`🏃 <strong>${state.name}</strong>: Deslocamento agora é <strong>${state.speed}m</strong>`);
                    renderSheet(); broadcastChange();
                }
            }
        }
        if (t.id === 'display-hd') {
             if (isMaster) {
                 const currentHD = state.hd || '1d8';
                 const val = prompt("Alterar Dados de Vida (ex: 1d10, 2d8):", currentHD);
                 if (val !== null) {
                     state.hd = val;
                     renderSheet(); broadcastChange();
                 }
             }
        }
        if (t.id === 'display-initiative') {
            if (isMaster) {
                const val = prompt("Iniciativa:", state.initiativeRoll);
                if (val !== null) {
                    state.initiativeRoll = parseInt(val) || 0;
                    sendSystemLog(`⚔️ <strong>${state.name}</strong>: Iniciativa ${state.initiativeRoll}`);
                    renderSheet(); broadcastChange();
                }
            }
        }

        if (t.closest('#display-photo-header') || t.closest('.char-portrait-container')) {
            if (isMaster) {
                document.getElementById('master-photo-uploader')?.click();
            }
        }

        // Interface do mestre
        const sidebarToggle = t.closest('#master-sidebar-toggle') || t.closest('#master-sidebar-close');
        if (sidebarToggle) {
            const sb = document.getElementById('master-sidebar');
            if (sb) sb.classList.toggle('sidebar-hidden');
            return;
        }

        const mNav = t.closest('.m-nav-btn');
        if (mNav && mNav.dataset.tab) {
            switchMasterTab(mNav.dataset.tab);
            if (window.innerWidth <= 900 && mNav.id !== 'btn-master-exit') {
                const sb = document.getElementById('master-sidebar');
                if (sb) sb.classList.add('sidebar-hidden');
            }
            return;
        }

        const nav = t.closest('.nav-btn');
        if (nav && nav.dataset.view) switchView(nav.dataset.view);

        // Alteração de atributos
        if (isMaster) {
            const attrBox = t.closest('.attr-block[data-attr]');
            if (attrBox) {
                const key = attrBox.dataset.attr;
                const val = prompt(`${key.toUpperCase()}:`, state.attr[key]);
                if (val !== null) { state.attr[key] = parseInt(val) || 0; renderSheet(); broadcastChange(); }
            }
            if (t.id === 'display-level-header') {
                const val = prompt("Nível:", state.level);
                if (val !== null) { 
                    state.level = parseInt(val) || 1; 
                    sendSystemLog(`🌟 <strong>${state.name}</strong> Nível ${state.level}`);
                    renderSheet(); broadcastChange(); 
                }
            }
            if (t.id === 'display-xp-header') {
                const val = prompt("XP:", state.xp);
                if (val !== null) {
                    state.xp = parseInt(val) || 0;
                    sendSystemLog(`📈 <strong>${state.name}</strong> agora tem ${state.xp} XP`);
                    renderSheet(); broadcastChange();
                }
            }
            if (t.id === 'display-class-header') {
                const val = prompt("Alterar Classe:", state.cls);
                if (val !== null) { state.cls = val; renderSheet(); broadcastChange(); }
            }
            if (t.id === 'display-race-header') {
                const val = prompt("Alterar Raça:", state.race);
                if (val !== null) { state.race = val; renderSheet(); broadcastChange(); }
            }
            
            // Criação de itens pelo mestre
            if (t.id === 'add-attack') {
                const name = prompt("Nome:");
                if (name) {
                    const bonus = prompt("Dano:");
                    const qty = prompt("Tipo:");
                    state.attacks = state.attacks || [];
                    state.attacks.push({ name, bonus, qty });
                    renderSheet(); broadcastChange();
                }
            }
            if (t.id === 'add-armor') {
                const name = prompt("Nome:");
                if (name) {
                    const bonus = prompt("Bonus:");
                    const qty = prompt("Peso:");
                    state.armors = state.armors || [];
                    state.armors.push({ name, bonus, qty });
                    renderSheet(); broadcastChange();
                }
            }
            if (t.id === 'add-utility') {
                const name = prompt("Nome:");
                if (name) {
                    const bonus = prompt("Bonus:");
                    const qty = prompt("Quantidade:");
                    state.utility = state.utility || [];
                    state.utility.push({ name, bonus, qty });
                    renderSheet(); broadcastChange();
                }
            }

            // Magias e truques
            if (t.id === 'add-cantrip') {
                const name = prompt("Nome do Truque:");
                if (name) {
                    const bonus = prompt("Efeito:");
                    const qty = prompt("Dano:");
                    state.cantrips = state.cantrips || [];
                    state.cantrips.push({ name, bonus, qty });
                    renderHabilidades(); broadcastChange();
                }
            }
            if (t.id === 'add-spell-active') {
                const name = prompt("Nome da Magia:");
                if (name) {
                    const bonus = prompt("Efeito:");
                    const qty = prompt("Dano:");
                    state.spellsActive = state.spellsActive || [];
                    state.spellsActive.push({ name, bonus, qty });
                    renderHabilidades(); broadcastChange();
                }
            }
            if (t.id === 'add-spell-inactive') {
                const name = prompt("Nome da Magia:");
                if (name) {
                    const bonus = prompt("Efeito:");
                    const qty = prompt("Dano:");
                    state.spellsInactive = state.spellsInactive || [];
                    state.spellsInactive.push({ name, bonus, qty });
                    renderHabilidades(); broadcastChange();
                }
            }
        }

        // Passos do wizard
        const stepMatch = t.id?.match(/btn-(step|back)-(\d+)/);
        if (stepMatch) goToStep(parseInt(stepMatch[2]));
        if (t.id === 'btn-finish') finishCreation();

        // Seleções do wizard
        const cCard = t.closest('.choice-card[data-id]');
        if (cCard && !cCard.classList.contains('choice-skill')) {
            const k = cCard.dataset.key;
            wizardData[k] = cCard.dataset.id;
            cCard.parentElement.querySelectorAll('.choice-card').forEach(c => c.classList.remove('selected'));
            cCard.classList.add('selected');

            const boxId = k === 'race' ? 'race-desc-box' : 'class-desc-box';
            const val = k === 'race' ? RACES[wizardData[k]] : CLASSES[wizardData[k]];
            if (k === 'cls' && val.icon) {
                const titleHeading = document.getElementById('class-title-step');
                if (titleHeading) titleHeading.textContent = `Classe: ${val.icon}`;
            }

            const box = document.getElementById(boxId);
            if (box) {
                if(k==='race') box.innerHTML = `<strong>${val.name}</strong><br><span>${val.modsDesc}</span>`;
                else box.innerHTML = `<strong>${val.name} (d${val.hd.substring(2)})</strong><br><span>Perícias: ${val.skillsDesc}</span>`;
            }
        }

        const sCard = t.closest('.choice-skill');
        if (sCard) {
            const sid = sCard.dataset.skill;
            const max = parseInt(document.getElementById('skills-limit-text')?.dataset.max || 0);
            if (wizardData.skills.includes(sid)) wizardData.skills = wizardData.skills.filter(i => i !== sid);
            else if (wizardData.skills.length < max) wizardData.skills.push(sid);
            else { alert(`Max ${max}!`); return; }
            sCard.classList.toggle('selected');
            loadSkillChoices(); // Refresh text
        }

        if (t.closest('#container-prof-bonus')) {
            if (isMaster) {
                const current = state.profBonusOverride || (Math.ceil(state.level / 4) + 1);
                const val = prompt("Alterar Bônus de Proficiência (Manual):", current);
                if (val !== null) {
                    state.profBonusOverride = parseInt(val) || 0;
                    renderSheet(); broadcastChange();
                }
            }
        }
        if (t.classList.contains('ds-success') && isMaster) { state.deathSaves.success = (state.deathSaves.success + 1) % 4; renderSheet(); broadcastChange(); }
        if (t.classList.contains('ds-fail') && isMaster) { state.deathSaves.fail = (state.deathSaves.fail + 1) % 4; renderSheet(); broadcastChange(); }
    });

    document.addEventListener('input', e => {
        if (!isMaster) return;
        const id = e.target.id;
        if (id.startsWith('lore-')) {
            masterState.worldLore = masterState.worldLore || {};
            masterState.worldLore[id.replace('lore-', '')] = e.target.value;
            saveMasterState();
            broadcastChange();
        }
    });

    // Auto-salvar campos
    document.addEventListener('input', (e) => {
        if (!isMaster && !wizardData.active) return; // Jogadores não editam
        const id = e.target.id;
        const val = e.target.value;
        if (id === 'master-private-notes') { masterState.notes = val; saveMasterState(); return; }
        if (id === 'display-name' || id === 'display-name-header') { 
            state.name = val; 
            if (isMaster && masterEditingType === 'player') debounceMasterList(); 
        }
        if (id === 'display-ac') state.ac = parseInt(val) || 10;
        if (id === 'display-hd') state.hd = val;
        if (id === 'display-bg') state.bg = val;
        if (id === 'display-align') state.align = val;
        if (id === 'gold-po') { state.gold = parseInt(val) || 0; debounceGoldLog(state.name, state.gold); }
        if (id === 'inventory-list') state.inventory = val;
        if (id?.startsWith('rp-')) {
            const map = { 'rp-traits': 'rpTraits', 'rp-ideals': 'rpIdeals', 'rp-bonds': 'rpBonds', 'rp-flaws': 'rpFlaws', 'rp-feats': 'rpFeats' };
            if (map[id]) state[map[id]] = val;
        }
        if (['display-bg', 'display-align', 'rp-traits', 'rp-ideals', 'rp-bonds', 'rp-flaws'].includes(id)) {
            e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px';
        }
        debounceSync();
    });
}

let isRenderingSelection = false;

window.deleteCharacter = async function(charId) {
    if (!confirm('Deseja realmente excluir este personagem?')) return;
    
    try {
        if (!isOfflineMode && supabaseClient) {
            const { error } = await supabaseClient
                .from('characters')
                .delete()
                .eq('id', charId)
                .eq('user_id', user.id);
            
            if (error) throw error;
        } else {
            const headers = getAuthHeaders();
            const res = await fetch(`/api/characters/${charId}`, { 
                method: 'DELETE',
                headers: headers
            });
            if (!res.ok) throw new Error('Erro ao excluir personagem');
        }
        
        // Atualiza lista
        userCharacters = userCharacters.filter(c => c.id !== charId);
        renderCharacterSelection();
    } catch (err) {
        alert('Erro ao excluir personagem: ' + err.message);
    }
};

async function renderCharacterSelection() {
    if (isRenderingSelection) return;
    isRenderingSelection = true;

    try {
        const list = await loadAllCharactersFromSupabase();
        const container = document.getElementById('characters-list-grid');
        if (!container) return;

        container.innerHTML = '';
        
        // Personagens existentes
        list.forEach(char => {
            const data = char.data;
            const card = document.createElement('div');
            card.className = 'choice-card char-card';
            card.dataset.id = char.id;
            card.innerHTML = `
                <button class="btn-delete-char" onclick="event.stopPropagation(); deleteCharacter('${char.id}')" title="Excluir personagem">×</button>
                <div class="char-name">${data.name || 'Herói Sem Nome'}</div>
                <div class="char-meta">${data.race} ${data.cls} - Nível ${data.level}</div>
            `;
            container.appendChild(card);
        });

        // Botão novo personagem
        const newCard = document.createElement('div');
        newCard.className = 'choice-card char-card char-card-new';
        newCard.id = 'btn-new-character';
        newCard.innerHTML = `
            <div class="char-name" style="color: var(--gold);">+ Novo Personagem</div>
            <div class="char-meta">Comece uma nova lenda</div>
        `;
        container.appendChild(newCard);

        // Troca de tela
        document.getElementById('role-selection')?.classList.remove('active');
        document.getElementById('character-selection')?.classList.add('active');
    } finally {
        isRenderingSelection = false;
    }
}
