// ==================== MASTER HUB LOGIC ====================

/**
 * Função central para gerar o HTML de qualquer card de entidade (Player, NPC, DB Character)
 * Garante padronização visual em todo o painel do mestre.
 */
function createEntityCardHtml(entity, type, options = {}) {
    if (!entity) return '';
    
    const { isOnline = false, dbId = null, extraClasses = '' } = options;
    const p = entity;
    
    const hpPercent = Math.max(0, Math.min(100, (p.hp.current / p.hp.max) * 100));
    const hpClass = hpPercent < 25 ? 'danger' : (hpPercent < 50 ? 'warning' : '');
    
    const dexMod = Math.floor(((p.attr?.des || 10) - 10) / 2);
    const initDisplay = (p.initiativeRoll ? p.initiativeRoll : (dexMod >= 0 ? '+' : '') + dexMod);

    // Define o ID de clique e o tipo para abertura de ficha
    let clickArgs;
    if (type === 'npc') {
        clickArgs = `'npc', '${p.id}'`;
    } else if (type === 'player') {
        clickArgs = `'player', '${options.socketId}'`;
    } else {
        clickArgs = `'db_character', '${dbId}'`;
    }

    return `
        <div class="player-card ${isOnline ? 'is-online' : 'is-offline'} ${extraClasses}" onclick="openEntitySheet(${clickArgs})">
            ${isOnline ? '<div class="online-indicator" title="Online"></div>' : ''}
            
            <button class="btn-delete-card" 
                onclick="event.stopPropagation(); ${options.isMesaContext ? `removeFromMesa('${dbId || p.id}')` : `deleteEntityMaster('${dbId || p.id}', '${type}')`}" 
                title="${options.isMesaContext ? 'Remover da Mesa' : 'Excluir Permanentemente'}">×</button>
            
            <div class="char-portrait-container" style="width: 60px; height: 60px; margin-bottom: 1rem;">
                ${p.photo ? `<img src="${p.photo}" class="char-portrait" style="display:block">` : (type === 'npc' ? '👾' : '👤')}
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
                    <span style="font-size: 0.85rem; font-weight: 900; color: var(--gold);">${p.ac || 10}</span>
                </div>
                <div style="display:flex; flex-direction:column; align-items:center;">
                    <label class="label-tiny" style="margin:0; font-size: 0.5rem; opacity: 0.7;">INI</label>
                    <span style="font-size: 0.85rem; font-weight: 900; color: var(--gold);">${initDisplay}</span>
                </div>
                <div style="display:flex; flex-direction:column; align-items:center;">
                    <label class="label-tiny" style="margin:0; font-size: 0.5rem; opacity: 0.7;">DESL</label>
                    <span style="font-size: 0.85rem; font-weight: 900; color: var(--gold);">${p.speed || 9}m</span>
                </div>
            </div>

            ${type === 'db_character' && p.userEmail ? `<div class="label-tiny" style="opacity: 0.5; font-size: 0.5rem; margin-top: 8px;">Dono: ${p.userEmail}</div>` : ''}
        </div>
    `;
}

/** 
 * Garante que a cache de personagens do banco esteja preenchida. 
 * Resolvido problema onde Mesa só funcionava após entrar na aba Personagens.
 */
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
        <div id="mesa-setup-modal" class="active fade-in" style="position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); display:flex; align-items:center; justify-content:center; z-index:99999; padding: 1.5rem;">
            <div class="premium-card" style="width: 100%; max-width: 500px; padding: 2rem;">
                <h2 class="cinzel" style="text-align: center; color: var(--gold); margin-bottom: 1rem;">Gerenciar Mesa</h2>
                <div style="max-height: 400px; overflow-y: auto; margin-bottom: 1.5rem;" id="mesa-selection-list">
                    ${chars.map(c => `
                        <label style="display:flex; justify-content:space-between; align-items:center; background: var(--bg-overlay); padding: 0.8rem; margin-bottom: 0.5rem; border-radius: 8px; cursor: pointer;">
                            <span style="font-weight:700;">
                                <input type="checkbox" class="mesa-check" value="${c.id}" ${masterState.tableCharacters.includes(c.id) ? 'checked' : ''} style="margin-right: 10px;"> 
                                ${c.data.name}
                            </span>
                            <span class="label-tiny">${c.owner_email || 'Herói'}</span>
                        </label>
                    `).join('')}
                </div>
                <div style="display:flex; gap: 1rem;">
                    <button class="btn-ghost" onclick="document.getElementById('mesa-setup-modal').remove()" style="flex:1;">Cancelar</button>
                    <button class="btn-primary" onclick="window.confirmMesaSetup()" style="flex:1;">Salvar Mesa</button>
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
        <div id="battle-setup-modal" class="active fade-in" style="position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); display:flex; align-items:center; justify-content:center; z-index:99999; padding: 1.5rem;">
            <div class="premium-card" style="width: 100%; max-width: 500px; padding: 2rem;">
                <h2 class="cinzel" style="text-align: center; color: var(--gold); margin-bottom: 1rem;">Setup de Batalha</h2>
                <div style="max-height: 400px; overflow-y: auto; margin-bottom: 1.5rem;">
                    <h3 style="color: var(--gold); font-size: 0.9rem; margin-bottom: 0.5rem; border-bottom: 1px solid var(--panel-border);">Mesa</h3>
                    ${mesaPlayers.map(p => `
                        <label style="display:flex; justify-content:space-between; align-items:center; background: var(--bg-overlay); padding: 0.8rem; margin-bottom: 0.5rem; border-radius: 8px;">
                            <span><input type="checkbox" class="battle-check player-check" value="${p.id}" data-name="${p.name}" data-init="${p.init}" checked data-socket="${p.socketId || ''}"> ${p.name}</span>
                            <span class="label-tiny">Ini: ${p.init}</span>
                        </label>
                    `).join('')}
                    
                    <h3 style="color: var(--gold); font-size: 0.9rem; margin-top:1rem; border-bottom: 1px solid var(--panel-border);">NPCs & Aliados</h3>
                    ${npcs.map(n => `
                        <label style="display:flex; justify-content:space-between; align-items:center; background: var(--bg-overlay); padding: 0.8rem; margin-bottom: 0.5rem; border-radius: 8px;">
                            <span><input type="checkbox" class="battle-check npc-check" value="${n.id}" data-name="${n.name}" data-init="${n.init}"> ${n.name}</span>
                            <span class="label-tiny">Ini: ${n.init}</span>
                        </label>
                    `).join('')}

                    <h3 style="color: var(--gold); font-size: 0.9rem; margin-top:1rem; border-bottom: 1px solid var(--panel-border);">Bestiário</h3>
                    ${monsters.map(n => `
                        <label style="display:flex; justify-content:space-between; align-items:center; background: var(--bg-overlay); padding: 0.8rem; margin-bottom: 0.5rem; border-radius: 8px;">
                            <span><input type="checkbox" class="battle-check npc-check" value="${n.id}" data-name="${n.name}" data-init="${n.init}"> ${n.name}</span>
                            <span class="label-tiny">Ini: ${n.init}</span>
                        </label>
                    `).join('')}
                </div>
                <div style="display:flex; gap: 1rem;">
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
        socketId: c.dataset.socket
    })).sort((a,b) => b.val - a.val);
    
    masterState.battleOrder = combatants;
    saveMasterState();
    
    combatants.forEach(c => {
        if (c.isPlayer && c.socketId) socket.emit('masterUpdatePlayer', { targetId: c.socketId, data: { ...connectedPlayers[c.socketId], inBattle: true } });
        else if (!c.isPlayer) { const npc = masterState.npcs.find(n => n.id == c.id); if (npc) npc.inBattle = true; }
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
    const btnEnd = document.getElementById('btn-end-battle');
    if (btnEnd) btnEnd.style.display = hasBattle ? 'block' : 'none';
    if (!hasBattle) { 
        list.innerHTML = '<div class="m-empty-state">Nenhum combate ativo.</div>'; 
        return; 
    }
    list.classList.remove('m-empty-state');
    list.innerHTML = masterState.battleOrder.map(item => {
        let entity = item.isPlayer ? connectedPlayers[item.socketId] : masterState.npcs.find(n => n.id == item.id);
        const hpStr = entity ? `<span style="font-size:0.85rem; opacity:0.8; font-weight: 500; margin-left: 12px; color: var(--gold);">HP: ${entity.hp.current}/${entity.hp.max}</span>` : '';
        const dangerStr = entity && entity.hp.current <= 0 ? 'color: var(--red); text-decoration: line-through; opacity: 0.6;' : 'color: var(--txt);';
        return `
            <div class="initiative-row" style="display: flex; align-items: center; background: rgba(255,255,255,0.03); margin-bottom: 0.5rem; padding: 0.5rem 1rem; border-radius: 10px; border-left: 4px solid ${item.isPlayer ? 'var(--gold)' : 'var(--red)'};">
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
        <div id="npc-gen-modal" class="active fade-in" style="position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(10px); display:flex; align-items:center; justify-content:center; z-index:99999; padding: 1.5rem;">
            <div class="premium-card" style="width: 100%; max-width: 450px; padding: 2.5rem;">
                <h2 class="cinzel" style="text-align: center; color: var(--gold); margin-bottom: 2rem;">Gerador de NPC</h2>
                <div class="form-group" style="margin-bottom: 2rem;">
                    <label class="label-tiny">Raça</label><select id="gen-npc-race" class="premium-input full-width">${raceOps}</select>
                    <label class="label-tiny">Classe</label><select id="gen-npc-class" class="premium-input full-width">${classOps}</select>
                    <label class="label-tiny">Nível</label><input type="number" id="gen-npc-level" class="premium-input full-width" value="1">
                </div>
                <div style="display:flex; gap: 1rem;"><button class="btn-ghost" onclick="document.getElementById('npc-gen-modal').remove()">Cancelar</button><button class="btn-primary" onclick="window.confirmNPCGeneration()">Gerar</button></div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
};

window.confirmNPCGeneration = function() {
    const race = document.getElementById('gen-npc-race').value;
    const cls = document.getElementById('gen-npc-class').value;
    const level = parseInt(document.getElementById('gen-npc-level').value) || 1;
    window.generateRandomNPC(race, cls, level);
    document.getElementById('npc-gen-modal').remove();
};

window.generateRandomNPC = function(targetRace, targetCls, targetLevel) {
    const name = "NPC_" + Math.floor(Math.random()*1000);
    const hpMax = (CLASSES[targetCls].hp + 2) * targetLevel;
    const npc = {
        ...getDefaultState(), id: Date.now(), isCreated: true, name, race: targetRace, cls: targetCls, level: targetLevel,
        hp: { current: hpMax, max: hpMax }, speed: RACES[targetRace].speed || 9, ac: 10
    };
    masterState.npcs.push(npc); saveMasterState(); renderBestiary();
};
