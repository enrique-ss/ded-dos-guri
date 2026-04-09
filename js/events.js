// ==================== EVENT LISTENERS & DELEGATION ====================

function setupEvents() {
    document.addEventListener('click', e => {
        const t = e.target;

        // Role Selection
        const rCard = t.closest('.choice-card[data-role]');
        if (rCard) {
            const role = rCard.dataset.role;
            if (role === 'admin') { 
                localStorage.setItem('adminAuth', 'true'); 
                window.location.href = '/admin'; 
                return; 
            }
            if (role === 'mestre') {
                if (prompt("Código do Mestre:") === "4444") {
                    roleSelected = true; isMaster = true; masterState.activeTab = 'players'; saveMasterState();
                } else alert("Código incorreto!");
            } else { roleSelected = true; wizardData.active = true; }
            render(); return;
        }

        // Common Nav
        if (t.closest('#btn-master-exit') || t.closest('#btn-back-to-role')) {
            if (isMaster && masterEditingId) {
                const prev = masterEditingType === 'npc' ? 'bestiary' : 'players';
                masterEditingId = null; masterEditingType = 'player'; masterState.activeTab = prev;
            } else { roleSelected = false; isMaster = false; isAdmin = false; }
            render(); return;
        }

        // Sheet Actions
        if (t.closest('#container-inspiration')) {
            if (isMaster) {
                state.inspiration = !state.inspiration;
                sendSystemLog(`✨ <strong>${state.name}</strong> ${state.inspiration ? 'ganhou' : 'usou'} Inspiração!`);
                renderSheet(); broadcastChange();
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

        if (t.closest('#btn-reset-char')) {
            if (isMaster && masterEditingType === 'npc') {
                masterEditingId = null; masterState.activeTab = 'bestiary'; render();
            } else if (!isMaster && confirm('EXCLUIR personagem?')) {
                const old = state.name; state = getDefaultState(); saveState();
                if (user && supabaseClient) supabaseClient.from('characters').update({ name: null, data: state }).eq('user_id', user.id).then();
                sendSystemLog(`☠️ <strong>${old}</strong> apagou sua ficha.`);
                roleSelected = false; isMaster = false; isAdmin = false; render();
            }
            return;
        }

        // Master UI
        const sidebarToggle = t.closest('#master-sidebar-toggle') || t.closest('#master-sidebar-close');
        if (sidebarToggle) {
            const sb = document.getElementById('master-sidebar');
            if (sb) sb.classList.toggle('sidebar-hidden');
            return;
        }

        const mNav = t.closest('.m-nav-btn');
        if (mNav && mNav.dataset.tab) {
            switchMasterTab(mNav.dataset.tab);
            if (mNav.dataset.tab === 'users' && isAdmin) loadUsers();
            if (window.innerWidth <= 900 && mNav.id !== 'btn-master-exit') {
                const sb = document.getElementById('master-sidebar');
                if (sb) sb.classList.add('sidebar-hidden');
            }
            return;
        }

        const nav = t.closest('.nav-btn');
        if (nav && nav.dataset.view) switchView(nav.dataset.view);

        // Stats Prompts
        if (isMaster) {
            const attrBox = t.closest('.attr-block[data-attr]');
            if (attrBox) {
                const key = attrBox.dataset.attr;
                const val = prompt(`${key.toUpperCase()}:`, state.attr[key]);
                if (val !== null) { state.attr[key] = parseInt(val) || 0; renderSheet(); broadcastChange(); }
            }
            if (t.id === 'display-level') {
                const val = prompt("Nível:", state.level);
                if (val !== null) { 
                    state.level = parseInt(val) || 1; 
                    sendSystemLog(`🌟 <strong>${state.name}</strong> Nível ${state.level}`);
                    renderSheet(); broadcastChange(); 
                }
            }
            if (t.id === 'display-xp') {
                const val = prompt("XP:", state.xp);
                if (val !== null) {
                    state.xp = parseInt(val) || 0;
                    sendSystemLog(`📈 <strong>${state.name}</strong> agora tem ${state.xp} XP`);
                    renderSheet(); broadcastChange();
                }
            }
            if (t.id === 'display-class') {
                const val = prompt("Alterar Classe:", state.cls);
                if (val !== null) { state.cls = val; renderSheet(); broadcastChange(); }
            }
            if (t.id === 'display-race') {
                const val = prompt("Alterar Raça:", state.race);
                if (val !== null) { state.race = val; renderSheet(); broadcastChange(); }
            }
        }

        // Wizard steps
        const stepMatch = t.id?.match(/btn-(step|back)-(\d+)/);
        if (stepMatch) goToStep(parseInt(stepMatch[2]));
        if (t.id === 'btn-finish') finishCreation();

        // Wizard selections
        const cCard = t.closest('.choice-card[data-id]');
        if (cCard && !cCard.classList.contains('choice-skill')) {
            const k = cCard.dataset.key;
            wizardData[k] = cCard.dataset.id;
            cCard.parentElement.querySelectorAll('.choice-card').forEach(c => c.classList.remove('selected'));
            cCard.classList.add('selected');

            const boxId = k === 'race' ? 'race-desc-box' : 'class-desc-box';
            const val = k === 'race' ? RACES[wizardData[k]] : CLASSES[wizardData[k]];
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
            const worldLore = JSON.parse(localStorage.getItem('rpg_world_lore') || '{}');
            worldLore[id.replace('lore-', '')] = e.target.value;
            localStorage.setItem('rpg_world_lore', JSON.stringify(worldLore));
            broadcastChange(); // Notifica outros clientes que o lore mudou
        }
    });

    // Auto-save fields as they type
    document.addEventListener('input', (e) => {
        const id = e.target.id;
        const val = e.target.value;
        if (id === 'master-private-notes') { masterState.notes = val; saveMasterState(); return; }
        if (id === 'display-name') state.name = val;
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
