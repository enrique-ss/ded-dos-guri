// Gera HTML de cards de entidades (Player, NPC, Monstro)
function createEntityCardHtml(entity, type, options = {}) {
    if (!entity) return '';
    
    const { isOnline = false, dbId = null, extraClasses = '' } = options;
    const p = entity;
    
    const hpPercent = Math.max(0, Math.min(100, (p.hp.current / p.hp.max) * 100));
    const hpClass = hpPercent < 25 ? 'danger' : (hpPercent < 50 ? 'warning' : '');
    
    const dexMod = Math.floor(((p.attr?.des || 10) - 10) / 2);
    const initDisplay = (p.initiativeRoll ? p.initiativeRoll : (dexMod >= 0 ? '+' : '') + dexMod);

    // Define cor baseada no tipo
    const statColor = type === 'npc' ? '#4a90e2' : (type === 'monster' ? '#e74c3c' : 'var(--gold)');

    // Define o ID de clique e o tipo para abertura de ficha
    let clickArgs;
    if (type === 'npc') {
        clickArgs = `'npc', '${p.id}'`;
    } else if (type === 'player') {
        clickArgs = `'player', '${options.socketId}'`;
    } else if (type === 'monster') {
        clickArgs = `'monster', '${p.id}'`;
    } else {
        clickArgs = `'db_character', '${dbId}'`;
    }

    // Renderiza condições se existirem
    const conditionsHtml = (p.conditions && p.conditions.length > 0) ? `
        <div style="display: flex; flex-wrap: wrap; gap: 0.3rem; margin-top: 0.6rem; justify-content: center;">
            ${p.conditions.map(cId => {
                const cond = CONDITIONS[cId];
                return cond ? `<span style="font-size: 1.1rem; cursor: help;" title="${cond.name}">${cond.icon}</span>` : '';
            }).join('')}
        </div>
    ` : '';

    return `
        <div class="player-card ${isOnline ? 'is-online' : 'is-offline'} ${extraClasses}" onclick="openEntitySheet(${clickArgs})">
            ${isOnline ? '<div class="online-indicator" title="Online"></div>' : ''}
            
            <button class="btn-delete-card" 
                onclick="event.stopPropagation(); ${options.isMesaContext ? `removeFromMesa('${dbId || p.id}')` : `deleteEntityMaster('${dbId || p.id}', '${type}')`}" 
                title="${options.isMesaContext ? 'Remover da Mesa' : 'Excluir Permanentemente'}">×</button>
            
            <div class="char-portrait-container" style="width: 60px; height: 60px; margin-bottom: 1rem;">
                ${p.photo ? `<img src="${p.photo}" class="char-portrait" style="display:block">` : (type === 'npc' ? '👾' : (type === 'monster' ? '🐉' : '👤'))}
            </div>
            
            <strong>${p.name || 'Sem Nome'}</strong>
            <div class="label-tiny" style="margin-top: 0.2rem; font-size: 0.6rem;">
                ${RACES[p.race]?.name || p.race || ''} • ${CLASSES[p.cls]?.name || ''} • Nv.${p.level || 1}
            </div>
            
            <div class="hp-bar-container" style="margin-top: 0.6rem;">
                <div class="hp-bar-fill ${hpClass}" style="width: ${hpPercent}%"></div>
            </div>
            <div style="margin-top: 0.3rem; font-size: 0.8rem; font-weight: 800;">${p.hp.current} / ${p.hp.max} HP</div>

            <div class="card-stats-mini" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; width: 100%; margin-top: 0.8rem; border-top: 1px solid var(--panel-border); padding-top: 0.6rem;">
                <div style="display:flex; flex-direction:column; align-items:center;">
                    <label class="label-tiny" style="margin:0; font-size: 0.5rem; opacity: 0.7;">CA</label>
                    <span style="font-size: 0.85rem; font-weight: 900; color: ${statColor};">${p.ac || 10}</span>
                </div>
                <div style="display:flex; flex-direction:column; align-items:center;">
                    <label class="label-tiny" style="margin:0; font-size: 0.5rem; opacity: 0.7;">INI</label>
                    <span style="font-size: 0.85rem; font-weight: 900; color: ${statColor};">${initDisplay}</span>
                </div>
                <div style="display:flex; flex-direction:column; align-items:center;">
                    <label class="label-tiny" style="margin:0; font-size: 0.5rem; opacity: 0.7;">DESL</label>
                    <span style="font-size: 0.85rem; font-weight: 900; color: ${statColor};">${p.speed || 9}m</span>
                </div>
            </div>

            ${conditionsHtml}
            ${type === 'db_character' && p.userEmail ? `<div class="label-tiny" style="opacity: 0.5; font-size: 0.5rem; margin-top: 8px;">Dono: ${p.userEmail}</div>` : ''}
        </div>
    `;
}

// Garante cache de personagens do banco
async function ensureDbCharsCache(force = false) {
    if (!window._dbCharsCache || force) {
        try {
            const res = await authorizedFetch('/api/admin/characters');
            if (!res.ok) throw new Error("Erro ao buscar personagens");
            window._dbCharsCache = await res.json();
        } catch (err) {
            console.error("Erro ao preencher cache:", err);
            window._dbCharsCache = [];
        }
    }
    return window._dbCharsCache;
}

async function renderMasterPanel() {
    // Garante dados básicos antes de renderizar qualquer aba que dependa de IDs
    await ensureDbCharsCache();

    // Forçar 'mesa' como aba inicial se nenhuma estiver definida ou para garantir padrão
    if (!masterState.activeTab) masterState.activeTab = 'mesa';
    
    const panel = document.getElementById('master-panel');
    if (panel) panel.setAttribute('data-active-tab', masterState.activeTab);

    // Atualiza Sidebar
    document.querySelectorAll('.m-nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === masterState.activeTab);
    });

    // Atualiza Conteúdo
    document.querySelectorAll('.m-tab-content').forEach(tab => {
        tab.classList.toggle('active', tab.id === `m-tab-${masterState.activeTab}`);
    });
    
    // Renderiza o conteúdo específico da aba ativa
    switch(masterState.activeTab) {
        case 'mesa': await renderMesa(); break;
        case 'initiative': renderInitiative(); break;
        case 'bestiary': renderBestiary(); break; 
        case 'monsters': renderMonsters(); break; // Nova aba de Monstros
        case 'characters': await renderAllCharacters(); break;
        case 'log': renderLogHistory(); break;
        case 'notes': 
            const area = document.getElementById('master-private-notes');
            if (area) area.value = masterState.notes;
            break;
    }
}

async function renderMesa() {
    const grid = document.getElementById('mesa-grid');
    if (!grid) return;

    if (!masterState.tableCharacters || masterState.tableCharacters.length === 0) {
        grid.innerHTML = `
            <div class="m-empty-state">
                <span>Nenhum personagem na mesa ainda.</span>
            </div>
        `;
        return;
    }

    const onlineMap = {};
    grid.classList.remove('m-empty-state');
    Object.values(connectedPlayers).forEach(p => { if (p.id) onlineMap[p.id] = p; });

    grid.innerHTML = masterState.tableCharacters.map(dbId => {
        const dbChar = (window._dbCharsCache || []).find(c => c.id === dbId);
        const onlineSocketId = Object.keys(connectedPlayers).find(k => connectedPlayers[k].id === dbId);
        const onlineChar = onlineSocketId ? connectedPlayers[onlineSocketId] : null;
        const entity = onlineChar || (dbChar ? dbChar.data : null);
        if (!entity) return '';
        return createEntityCardHtml(entity, onlineChar ? 'player' : 'db_character', { isOnline: !!onlineChar, dbId: dbId, socketId: onlineSocketId, isMesaContext: true });
    }).join('');
}

function renderBestiary() {
    const grid = document.getElementById('npcs-grid');
    if (!grid) return;
    if (!masterState.npcs || masterState.npcs.length === 0) { 
        grid.innerHTML = '<div class="m-empty-state"><span>Nenhum NPC de história criado ainda.</span></div>'; 
        return; 
    }
    grid.classList.remove('m-empty-state');
    grid.innerHTML = masterState.npcs.filter(n => !n.isDeleted).map(npc => createEntityCardHtml(npc, 'npc')).join('');
}

function renderMonsters() {
    const grid = document.getElementById('monsters-grid');
    if (!grid) return;
    if (!masterState.monsters || masterState.monsters.length === 0) { 
        grid.innerHTML = '<div class="m-empty-state"><span>Seu bestiário está vazio.</span></div>'; 
        return; 
    }
    grid.classList.remove('m-empty-state');
    grid.innerHTML = masterState.monsters.filter(n => !n.isDeleted).map(monster => createEntityCardHtml(monster, 'monster')).join('');
}

async function renderAllCharacters() {
    const grid = document.getElementById('all-characters-grid');
    if (!grid) return;

    grid.innerHTML = '<div class="m-empty-state"><div class="loader-spinner"></div>Buscando no banco...</div>';
    
    // Usa o helper compartilhado para buscar dados
    const chars = await ensureDbCharsCache(true); // 'true' para forçar refresh manual se solicitado pelo botão
    
    if (!chars || chars.length === 0) {
        grid.innerHTML = '<div class="m-empty-state"><span>Nenhum personagem encontrado no banco.</span></div>';
        return;
    }

    grid.classList.remove('m-empty-state');
    grid.innerHTML = chars.map(c => createEntityCardHtml(c.data, 'db_character', { dbId: c.id })).join('');
}

window.openMesaSetup = async function() {
    // Busca personagens do banco se não tiver cache
    if (!window._dbCharsCache) {
        const res = await authorizedFetch('/api/admin/characters');
        window._dbCharsCache = await res.json();
    }
    
    const chars = window._dbCharsCache || [];
    
    const html = `
        <div id="mesa-setup-modal" class="active fade-in" style="position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); display:flex; align-items:center; justify-content:center; z-index:99999; padding: 1rem;">
            <div class="premium-card" style="width: 100%; max-width: 400px; padding: 1.5rem; max-height: 90vh; overflow-y: auto;">
                <h2 class="cinzel" style="text-align: center; color: var(--gold); margin-bottom: 1rem; font-size: 1.2rem;">Adicionar à Mesa</h2>
                <div style="max-height: 50vh; overflow-y: auto; margin-bottom: 1rem;" id="mesa-selection-list">
                    ${chars.map(c => `
                        <label style="display:flex; justify-content:space-between; align-items:center; background: var(--bg-overlay); padding: 0.6rem; margin-bottom: 0.4rem; border-radius: 8px; cursor: pointer;">
                            <span style="font-weight:700;">
                                <input type="checkbox" class="mesa-check" value="${c.id}" ${masterState.tableCharacters.includes(c.id) ? 'checked' : ''} style="margin-right: 8px;"> 
                                ${c.data.name}
                            </span>
                            <span class="label-tiny">${c.owner_email || 'Herói'}</span>
                        </label>
                    `).join('')}
                </div>
                <div style="display:flex; gap: 0.5rem;">
                    <button class="btn-ghost" onclick="document.getElementById('mesa-setup-modal').remove()" style="flex:1;">Cancelar</button>
                    <button class="btn-primary" onclick="window.confirmMesaSetup()" style="flex:1;">Salvar</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
};

window.confirmMesaSetup = function() {
    const checks = document.querySelectorAll('.mesa-check:checked');
    masterState.tableCharacters = Array.from(checks).map(c => c.value);
    saveMasterState();
    document.getElementById('mesa-setup-modal').remove();
    renderMesa();
};

window.deleteEntityMaster = async function(id, type) {
    const msg = type === 'monster' ? "Deseja excluir este Monstro permanentemente?" : (type === 'npc' ? "Deseja excluir este NPC permanentemente?" : "Deseja excluir este personagem PERMANENTEMENTE do banco de dados?");
    if (!confirm(msg)) return;

    if (type === 'npc') {
        masterState.npcs = masterState.npcs.filter(n => n.id != id);
        saveMasterState(); renderBestiary();
    } else if (type === 'monster') {
        masterState.monsters = (masterState.monsters || []).filter(n => n.id != id);
        saveMasterState(); renderMonsters();
    } else {
        try {
            const res = await authorizedFetch(`/api/admin/characters/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Erro ao excluir no servidor");
            
            masterState.tableCharacters = masterState.tableCharacters.filter(tid => tid != id);
            if (window._dbCharsCache) window._dbCharsCache = window._dbCharsCache.filter(c => c.id != id);
            
            saveMasterState(); renderMesa(); renderAllCharacters();
            
        } catch (err) {
            alert("Erro ao excluir: " + err.message);
        }
    }
};

window.startBattleSetup = function() {
    // Puxa apenas quem está na Mesa
    const mesaPlayers = (masterState.tableCharacters || []).map(dbId => {
        const dbChar = (window._dbCharsCache || []).find(c => c.id === dbId);
        const onlineSocketId = Object.keys(connectedPlayers).find(k => connectedPlayers[k].id === dbId);
        const p = onlineSocketId ? connectedPlayers[onlineSocketId] : (dbChar ? dbChar.data : null);
        if (!p) return null;
        const dexMod = Math.floor(((p.attr?.des || 10) - 10) / 2);
        const init = p.initiativeRoll || dexMod;
        return { id: dbId, name: p.name, init: init, isPlayer: true, socketId: onlineSocketId };
    }).filter(p => p !== null);

    const getInic = (n) => n.initiativeRoll || Math.floor(((n.attr?.des || 10) - 10) / 2);

    const npcs = (masterState.npcs || []).filter(n => !n.isDeleted).map(n => ({ id: n.id, name: n.name, init: getInic(n), isPlayer: false }));
    const monsters = (masterState.monsters || []).filter(n => !n.isDeleted).map(n => ({ id: n.id, name: n.name, init: getInic(n), isPlayer: false }));
    
    const html = `
        <div id="battle-setup-modal" class="active fade-in" style="position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); display:flex; align-items:center; justify-content:center; z-index:99999; padding: 1rem;">
            <div class="premium-card" style="width: 100%; max-width: 400px; padding: 1.5rem; max-height: 90vh; overflow-y: auto;">
                <h2 class="cinzel" style="text-align: center; color: var(--gold); margin-bottom: 1rem; font-size: 1.2rem;">Setup de Batalha</h2>
                <div style="max-height: 50vh; overflow-y: auto; margin-bottom: 1rem;">
                    <h3 style="color: var(--gold); font-size: 0.85rem; margin-bottom: 0.4rem; border-bottom: 1px solid var(--panel-border);">Mesa</h3>
                    ${mesaPlayers.map(p => `
                        <label style="display:flex; justify-content:space-between; align-items:center; background: var(--bg-overlay); padding: 0.5rem; margin-bottom: 0.3rem; border-radius: 6px;">
                            <span><input type="checkbox" class="battle-check player-check" value="${p.id}" data-name="${p.name}" data-init="${p.init}" checked data-socket="${p.socketId || ''}"> ${p.name}</span>
                            <span class="label-tiny">Ini: ${p.init}</span>
                        </label>
                    `).join('')}
                    
                    <h3 style="color: var(--gold); font-size: 0.85rem; margin-top:0.8rem; border-bottom: 1px solid var(--panel-border);">NPCs & Aliados</h3>
                    ${npcs.map(n => `
                        <label style="display:flex; justify-content:space-between; align-items:center; background: var(--bg-overlay); padding: 0.5rem; margin-bottom: 0.3rem; border-radius: 6px;">
                            <span><input type="checkbox" class="battle-check npc-check" value="${n.id}" data-name="${n.name}" data-init="${n.init}" data-type="npc"> ${n.name}</span>
                            <span class="label-tiny">Ini: ${n.init}</span>
                        </label>
                    `).join('')}

                    <h3 style="color: var(--gold); font-size: 0.85rem; margin-top:0.8rem; border-bottom: 1px solid var(--panel-border);">Bestiário</h3>
                    ${monsters.map(n => `
                        <label style="display:flex; justify-content:space-between; align-items:center; background: var(--bg-overlay); padding: 0.5rem; margin-bottom: 0.3rem; border-radius: 6px;">
                            <span><input type="checkbox" class="battle-check npc-check" value="${n.id}" data-name="${n.name}" data-init="${n.init}" data-type="monster"> ${n.name}</span>
                            <span class="label-tiny">Ini: ${n.init}</span>
                        </label>
                    `).join('')}
                </div>
                <div style="display:flex; gap: 0.5rem;">
                    <button class="btn-ghost" onclick="document.getElementById('battle-setup-modal').remove()" style="flex:1;">Cancelar</button>
                    <button class="btn-primary" onclick="window.confirmBattleSetup()" style="flex:1;">Gerar Ordem</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
};

window.confirmBattleSetup = function() {
    const checks = document.querySelectorAll('.battle-check:checked');
    const combatants = Array.from(checks).map(c => ({
        id: c.value,
        name: c.dataset.name,
        val: parseInt(c.dataset.init) || 0,
        isPlayer: c.classList.contains('player-check'),
        type: c.dataset.type || (c.classList.contains('player-check') ? 'player' : 'npc'),
        socketId: c.dataset.socket
    })).sort((a,b) => b.val - a.val);
    
    masterState.battleOrder = combatants;
    saveMasterState();
    
    combatants.forEach(c => {
        if (c.isPlayer && c.socketId) socket.emit('masterUpdatePlayer', { targetId: c.socketId, data: { ...connectedPlayers[c.socketId], inBattle: true } });
        else if (c.type === 'monster') { const monster = (masterState.monsters || []).find(n => n.id == c.id); if (monster) monster.inBattle = true; }
        else { const npc = masterState.npcs.find(n => n.id == c.id); if (npc) npc.inBattle = true; }
    });

    sendSystemLog(`⚔️ <strong>Início de Combate!</strong>`);
    document.getElementById('battle-setup-modal').remove();
    renderInitiative();
};

window.switchMasterTab = function(tabId) {
    masterState.activeTab = tabId; saveMasterState(); renderMasterPanel();
};

function renderInitiative() {
    const list = document.getElementById('initiative-list');
    if (!list) return;
    const hasBattle = masterState.battleOrder && masterState.battleOrder.length > 0;
    const btnStart = document.getElementById('btn-start-battle');
    const btnEnd = document.getElementById('btn-end-battle');
    if (btnStart) btnStart.style.display = hasBattle ? 'none' : 'block';
    if (btnEnd) btnEnd.style.display = hasBattle ? 'block' : 'none';
    if (!hasBattle) { 
        list.innerHTML = '<div class="m-empty-state">Nenhum combate ativo.</div>'; 
        return; 
    }
    list.classList.remove('m-empty-state');
    list.innerHTML = masterState.battleOrder.map(item => {
        let entity;
        if (item.isPlayer) {
            entity = connectedPlayers[item.socketId];
        } else if (item.type === 'monster') {
            entity = (masterState.monsters || []).find(n => n.id == item.id);
        } else {
            entity = masterState.npcs.find(n => n.id == item.id);
        }
        const hpStr = entity ? `<span style="font-size:0.85rem; opacity:0.8; font-weight: 500; margin-left: 12px; color: var(--gold);">HP: ${entity.hp.current}/${entity.hp.max}</span>` : '';
        const dangerStr = entity && entity.hp.current <= 0 ? 'color: var(--red); text-decoration: line-through; opacity: 0.6;' : 'color: var(--txt);';
        const borderColor = item.isPlayer ? 'var(--gold)' : (item.type === 'monster' ? 'var(--red)' : '#4a90e2');
        return `
            <div class="initiative-row" style="display: flex; align-items: center; background: rgba(255,255,255,0.03); margin-bottom: 0.5rem; padding: 0.5rem 1rem; border-radius: 10px; border-left: 4px solid ${borderColor};">
                <div class="init-score" style="font-size: 1.4rem; font-weight: 900; color: var(--gold); min-width: 40px; text-align: center; margin-right: 1rem;">${item.val}</div>
                <div class="init-name" style="flex: 1; ${dangerStr}"><strong style="font-size: 1rem;">${item.name}</strong> ${hpStr}</div>
            </div>
        `;
    }).join('');
}

window.endBattle = function() {
    if(!confirm("Encerrar a batalha atual?")) return;
    masterState.battleOrder.forEach(c => {
        if (c.isPlayer && c.socketId) socket.emit('masterUpdatePlayer', { targetId: c.socketId, data: { ...connectedPlayers[c.socketId], inBattle: false } });
        else if (!c.isPlayer) { const npc = masterState.npcs.find(n => n.id == c.id); if (npc) npc.inBattle = false; }
    });
    masterState.battleOrder = [];
    saveMasterState();
    sendSystemLog(`🏁 <strong>Batalha encerrada!</strong>`);
    renderInitiative();
};

function renderLogHistory() {
    const list = document.getElementById('master-log-history');
    if (!list) return;
    list.innerHTML = [...masterState.logHistory].reverse().map(log => `
        <div class="log-entry" style="margin-bottom: 0.5rem;">
            <div class="log-time">${log.timestamp}</div><div style="font-size: 0.85rem;">${log.text}</div>
        </div>
    `).join('');
}

window.openEntitySheet = function(type, id) {
    let entity;
    if (type === 'player') entity = connectedPlayers[id];
    else if (type === 'npc') entity = masterState.npcs.find(n => n.id == id);
    else if (type === 'monster') entity = (masterState.monsters || []).find(n => n.id == id);
    else if (type === 'db_character') {
        const charEntry = (window._dbCharsCache || []).find(c => c.id === id);
        if (charEntry) entity = charEntry.data;
    }
    
    if (!entity) return;
    masterEditingId = id;
    masterEditingType = type === 'db_character' ? 'player' : type; 
    state = entity;
    currentView = 'sheet-view';
    const container = document.getElementById('sheet-container');
    if (container) container.classList.remove('read-only');
    render();
};

window.openPlayerSheet = id => openEntitySheet('player', id);
window.openNPCSheet = id => openEntitySheet('npc', id);
window.openDatabaseCharacter = id => openEntitySheet('db_character', id);

window.clearMasterLog = function() {
    if (confirm('Tem certeza que deseja apagar todo o histórico?')) {
        masterState.logHistory = [];
        saveMasterState();
        renderLogHistory();
    }
};

window.removeFromMesa = function(id) {
    if (!confirm("Deseja remover este personagem da mesa? (Ele continuará salvo no seu Banco de Dados)")) return;
    masterState.tableCharacters = (masterState.tableCharacters || []).filter(tid => tid != id);
    saveMasterState();
    renderMesa();
};

window.openNPCGeneratorSetup = function() {
    const raceOps = Object.keys(RACES).map(k => `<option value="${k}">${RACES[k].name}</option>`).join('');
    const classOps = Object.keys(CLASSES).map(k => `<option value="${k}">${CLASSES[k].name}</option>`).join('');
    const html = `
        <div id="npc-gen-modal" class="active fade-in" style="position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(10px); display:flex; align-items:center; justify-content:center; z-index:99999; padding: 1rem;">
            <div class="premium-card" style="width: 100%; max-width: 380px; padding: 1.5rem; max-height: 90vh; overflow-y: auto;">
                <h2 class="cinzel" style="text-align: center; color: var(--gold); margin-bottom: 1rem; font-size: 1.2rem;">Gerador de NPC</h2>
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label class="label-tiny">Nome (opcional)</label><input type="text" id="gen-npc-name" class="premium-input full-width" placeholder="Deixe vazio para nome aleatório" style="padding: 0.5rem;">
                    <label class="label-tiny" style="margin-top: 0.5rem;">Raça</label><select id="gen-npc-race" class="premium-input full-width" style="padding: 0.5rem;">${raceOps}</select>
                    <label class="label-tiny" style="margin-top: 0.5rem;">Classe</label><select id="gen-npc-class" class="premium-input full-width" style="padding: 0.5rem;">${classOps}</select>
                    <label class="label-tiny" style="margin-top: 0.5rem;">Nível</label><input type="number" id="gen-npc-level" class="premium-input full-width" value="1" style="padding: 0.5rem;">
                </div>
                <div style="display:flex; gap: 0.5rem; margin-top: 1rem;"><button class="btn-ghost" onclick="document.getElementById('npc-gen-modal').remove()" style="flex:1;">Cancelar</button><button class="btn-primary" onclick="window.confirmNPCGeneration()" style="flex:1;">Gerar</button></div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
};

window.openMonsterGeneratorSetup = function() {
    const raceOps = Object.keys(RACES).map(k => `<option value="${k}">${RACES[k].name}</option>`).join('');
    const classOps = Object.keys(CLASSES).map(k => `<option value="${k}">${CLASSES[k].name}</option>`).join('');
    const html = `
        <div id="monster-gen-modal" class="active fade-in" style="position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(10px); display:flex; align-items:center; justify-content:center; z-index:99999; padding: 1rem;">
            <div class="premium-card" style="width: 100%; max-width: 380px; padding: 1.5rem; max-height: 90vh; overflow-y: auto;">
                <h2 class="cinzel" style="text-align: center; color: var(--gold); margin-bottom: 1rem; font-size: 1.2rem;">Gerador de Monstros</h2>
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label class="label-tiny">Nome (opcional)</label><input type="text" id="gen-monster-name" class="premium-input full-width" placeholder="Deixe vazio para nome aleatório" style="padding: 0.5rem;">
                    <label class="label-tiny" style="margin-top: 0.5rem;">Raça</label><select id="gen-monster-race" class="premium-input full-width" style="padding: 0.5rem;">${raceOps}</select>
                    <label class="label-tiny" style="margin-top: 0.5rem;">Classe</label><select id="gen-monster-class" class="premium-input full-width" style="padding: 0.5rem;">${classOps}</select>
                    <label class="label-tiny" style="margin-top: 0.5rem;">Nível</label><input type="number" id="gen-monster-level" class="premium-input full-width" value="1" style="padding: 0.5rem;">
                </div>
                <div style="display:flex; gap: 0.5rem; margin-top: 1rem;"><button class="btn-ghost" onclick="document.getElementById('monster-gen-modal').remove()" style="flex:1;">Cancelar</button><button class="btn-primary" onclick="window.confirmMonsterGeneration()" style="flex:1;">Gerar</button></div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
};

window.confirmNPCGeneration = function() {
    const name = document.getElementById('gen-npc-name').value.trim();
    const race = document.getElementById('gen-npc-race').value;
    const cls = document.getElementById('gen-npc-class').value;
    const level = parseInt(document.getElementById('gen-npc-level').value) || 1;
    window.generateRandomNPC(race, cls, level, name);
    document.getElementById('npc-gen-modal').remove();
};

window.confirmMonsterGeneration = function() {
    const name = document.getElementById('gen-monster-name').value.trim();
    const race = document.getElementById('gen-monster-race').value;
    const cls = document.getElementById('gen-monster-class').value;
    const level = parseInt(document.getElementById('gen-monster-level').value) || 1;
    window.generateRandomMonster(race, cls, level, name);
    document.getElementById('monster-gen-modal').remove();
};

window.generateRandomNPC = function(targetRace, targetCls, targetLevel, customName = null) {
    const name = customName || "NPC_" + Math.floor(Math.random()*1000);
    const hpMax = (CLASSES[targetCls].hp + 2) * targetLevel;
    const npc = {
        ...getDefaultState(), id: Date.now(), isCreated: true, name, race: targetRace, cls: targetCls, level: targetLevel,
        hp: { current: hpMax, max: hpMax }, speed: RACES[targetRace].speed || 9, ac: 10
    };
    masterState.npcs.push(npc); saveMasterState(); renderBestiary();
};

window.generateRandomMonster = function(targetRace, targetCls, targetLevel, customName = null) {
    const name = customName || "Monstro_" + Math.floor(Math.random()*1000);
    const hpMax = (CLASSES[targetCls].hp + 2) * targetLevel;
    const monster = {
        ...getDefaultState(), id: Date.now(), isCreated: true, name, race: targetRace, cls: targetCls, level: targetLevel,
        hp: { current: hpMax, max: hpMax }, speed: RACES[targetRace].speed || 9, ac: 10
    };
    if (!masterState.monsters) masterState.monsters = [];
    masterState.monsters.push(monster); saveMasterState(); renderMonsters();
};

window.openCharacterCreationModal = async function() {
    try {
        const res = await authorizedFetch('/api/admin/users');
        if (!res.ok) throw new Error('Erro ao buscar usuários');
        const users = await res.json();
        
        const userOptions = users.map(u => `<option value="${u.id}">${u.email}</option>`).join('');
        const raceOps = Object.keys(RACES).map(k => `<option value="${k}">${RACES[k].name}</option>`).join('');
        const classOps = Object.keys(CLASSES).map(k => `<option value="${k}">${CLASSES[k].name}</option>`).join('');
        
        const html = `
            <div id="char-create-modal" class="active fade-in" style="position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(10px); display:flex; align-items:center; justify-content:center; z-index:99999; padding: 1rem;">
                <div class="premium-card" style="width: 100%; max-width: 380px; padding: 1.5rem; max-height: 90vh; overflow-y: auto;">
                    <h2 class="cinzel" style="text-align: center; color: var(--gold); margin-bottom: 1rem; font-size: 1.2rem;">Criar Personagem</h2>
                    <div class="form-group" style="margin-bottom: 1rem;">
                        <label class="label-tiny">Nome</label><input type="text" id="char-create-name" class="premium-input full-width" placeholder="Nome do herói" style="padding: 0.5rem;">
                        <label class="label-tiny" style="margin-top: 0.5rem;">Jogador</label><select id="char-create-user" class="premium-input full-width" style="padding: 0.5rem;">${userOptions}</select>
                        <label class="label-tiny" style="margin-top: 0.5rem;">Raça</label><select id="char-create-race" class="premium-input full-width" style="padding: 0.5rem;">${raceOps}</select>
                        <label class="label-tiny" style="margin-top: 0.5rem;">Classe</label><select id="char-create-class" class="premium-input full-width" style="padding: 0.5rem;">${classOps}</select>
                        <label class="label-tiny" style="margin-top: 0.5rem;">Nível</label><input type="number" id="char-create-level" class="premium-input full-width" value="1" style="padding: 0.5rem;">
                    </div>
                    <div style="display:flex; gap: 0.5rem; margin-top: 1rem;">
                        <button class="btn-ghost" onclick="document.getElementById('char-create-modal').remove()" style="flex:1;">Cancelar</button>
                        <button class="btn-primary" onclick="window.confirmCharacterCreation()" style="flex:1;">Criar</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    } catch (err) {
        alert('Erro ao carregar usuários: ' + err.message);
    }
};

window.confirmCharacterCreation = async function() {
    const userId = document.getElementById('char-create-user').value;
    const name = document.getElementById('char-create-name').value.trim();
    const race = document.getElementById('char-create-race').value;
    const cls = document.getElementById('char-create-class').value;
    const level = parseInt(document.getElementById('char-create-level').value) || 1;
    
    if (!name) {
        alert('Por favor, insira um nome para o personagem.');
        return;
    }
    
    if (!userId) {
        alert('Por favor, selecione um jogador.');
        return;
    }
    
    const hpMax = (CLASSES[cls].hp + 2) * level;
    const charData = {
        ...getDefaultState(),
        id: crypto.randomUUID(),
        name: name,
        race: race,
        cls: cls,
        level: level,
        hp: { current: hpMax, max: hpMax },
        ac: 10,
        speed: RACES[race].speed || 9
    };
    
    try {
        const res = await authorizedFetch('/api/admin/characters/precreate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ targetUserId: userId, charData })
        });
        
        if (!res.ok) throw new Error('Erro ao criar personagem');
        
        document.getElementById('char-create-modal').remove();
        window._dbCharsCache = null; // Limpar cache para forçar refresh
        renderAllCharacters();
        alert('Personagem criado com sucesso!');
    } catch (err) {
        alert('Erro ao criar personagem: ' + err.message);
    }
};
