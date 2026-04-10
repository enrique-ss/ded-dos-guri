// ==================== MASTER HUB LOGIC ====================

function renderMasterPanel() {
    const panel = document.getElementById('master-panel');
    if (panel) panel.setAttribute('data-active-tab', masterState.activeTab);

    const grid = document.getElementById('master-grid');
    if (!grid) return;
    const ids = Object.keys(connectedPlayers);
    if (ids.length === 0) {
        grid.classList.add('m-empty-state');
        grid.innerHTML = '<p>Aguardando players entrarem...</p>';
    } else {
        grid.classList.remove('m-empty-state');
        grid.innerHTML = ids.map(id => {
            const p = connectedPlayers[id];
            const hpPercent = Math.max(0, Math.min(100, (p.hp.current / p.hp.max) * 100));
            const hpClass = hpPercent < 25 ? 'danger' : (hpPercent < 50 ? 'warning' : '');
            return `
                <div class="player-card" onclick="openPlayerSheet('${id}')">
                    <div class="char-portrait-container" style="width: 60px; height: 60px; margin-bottom: 1rem;">
                        ${p.photo ? `<img src="${p.photo}" class="char-portrait" style="display:block">` : '👤'}
                    </div>
                    <strong>${p.name || 'Sem Nome'}</strong>
                    <div class="label-tiny" style="margin-top: 0.2rem;">${CLASSES[p.cls]?.name || '---'} • Nível ${p.level}</div>
                    <div class="hp-bar-container"><div class="hp-bar-fill ${hpClass}" style="width: ${hpPercent}%"></div></div>
                    <div class="conditions-hub-display" style="margin-top: 0.5rem;">${(p.conditions || []).map(id => `<span>${CONDITIONS[id]?.icon}</span>`).join('')}</div>
                    <div style="margin-top: 0.5rem; font-size: 0.85rem; font-weight: 700;">${p.hp.current} / ${p.hp.max} HP</div>
                    <button class="btn-reset-discrete" style="width:100%; margin-top: 1.5rem; font-size: 0.7rem;" onclick="event.stopPropagation(); masterSoftDeletePlayer('${id}')">Remover Personagem</button>
                </div>
            `;
        }).join('');
    }
    document.querySelectorAll('.m-nav-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === masterState.activeTab));
    document.querySelectorAll('.m-tab-content').forEach(tab => tab.classList.toggle('active', tab.id === `m-tab-${masterState.activeTab}`));
    if (masterState.activeTab === 'initiative') renderInitiative();
    if (masterState.activeTab === 'bestiary') renderBestiary();
    if (masterState.activeTab === 'log') renderLogHistory();
    if (masterState.activeTab === 'notes') {
        const area = document.getElementById('master-private-notes');
        if (area) area.value = masterState.notes;
    }
}

window.switchMasterTab = function(tabId) {
    masterState.activeTab = tabId; saveMasterState(); renderMasterPanel();
};

function renderInitiative() {
    const list = document.getElementById('initiative-list');
    if (!list) return;
    const playerInits = Object.values(connectedPlayers).filter(p => p.initiativeRoll > 0).map(p => ({ id: p.id, name: p.name, val: p.initiativeRoll, isPlayer: true }));
    const npcInits = (masterState.npcs || []).filter(n => n.initiativeRoll > 0 && !n.isDeleted).map(n => ({ id: n.id, name: n.name, val: n.initiativeRoll, isPlayer: false }));
    const all = [...playerInits, ...npcInits].sort((a, b) => b.val - a.val);
    if (all.length === 0) { 
        list.classList.add('m-empty-state');
        list.innerHTML = '<p>Ninguém em combate.</p>'; 
        return; 
    }
    list.classList.remove('m-empty-state');
    list.innerHTML = all.map(item => `
        <div class="initiative-row ${item.isPlayer ? 'player' : 'npc'}">
            <div class="init-score">${item.val}</div>
            <div class="init-name">${item.isPlayer ? '🛡️' : '👾'} ${item.name}</div>
        </div>
    `).join('');
}

function renderBestiary() {
    const grid = document.getElementById('npcs-grid');
    if (!grid) return;
    if (masterState.npcs.length === 0) { 
        grid.classList.add('m-empty-state');
        grid.innerHTML = '<p>Bestiário vazio.</p>'; 
        return; 
    }
    grid.classList.remove('m-empty-state');
    grid.innerHTML = (masterState.npcs || []).filter(n => !n.isDeleted).map(npc => {
        const hpPercent = Math.max(0, Math.min(100, (npc.hp.current / npc.hp.max) * 100));
        return `
            <div class="player-card" onclick="openNPCSheet('${npc.id}')">
                <button class="btn-ghost" onclick="event.stopPropagation(); softDeleteNPC(${npc.id})" style="position: absolute; top: 10px; right: 10px; color: var(--red);">🗑️</button>
                <div class="char-portrait-container" style="width: 60px; height: 60px; margin-bottom: 1rem;">${npc.photo ? `<img src="${npc.photo}" class="char-portrait">` : '👾'}</div>
                <strong style="font-size: 1.2rem; color: var(--gold);">${npc.name}</strong>
                <div class="hp-bar-container"><div class="hp-bar-fill" style="width: ${hpPercent}%"></div></div>
                <div style="margin-top: 0.5rem; font-size: 0.85rem; font-weight: 700;">${npc.hp.current} / ${npc.hp.max} HP</div>
            </div>
        `;
    }).join('');
}

function renderLogHistory() {
    const list = document.getElementById('master-log-history');
    if (!list) return;
    list.innerHTML = [...masterState.logHistory].reverse().map(log => `
        <div class="log-entry" style="margin-bottom: 0.5rem;">
            <div class="log-time">${log.timestamp}</div><div style="font-size: 0.85rem;">${log.text}</div>
        </div>
    `).join('');
}

window.broadcastMasterAlert = function() {
    const input = document.getElementById('master-alert-input');
    const msg = input.value.trim();
    if (msg && socket) { socket.emit('sendAlert', msg); input.value = ''; }
};

window.openPlayerSheet = function(id) {
    masterEditingId = id; masterEditingType = 'player'; state = connectedPlayers[id];
    currentView = 'sheet-view';
    const container = document.getElementById('sheet-container');
    if (container) container.classList.remove('read-only');
    render();
};

window.openNPCSheet = function(id) {
    const npc = masterState.npcs.find(n => n.id == id);
    if (!npc) return;
    masterEditingId = id; masterEditingType = 'npc'; state = npc;
    currentView = 'sheet-view';
    const container = document.getElementById('sheet-container');
    if (container) container.classList.remove('read-only');
    render();
};

window.softDeleteNPC = function(id) {
    if (!confirm("Arquivar este NPC?")) return;
    const npc = masterState.npcs.find(n => n.id == id);
    if (npc) { npc.isDeleted = true; saveMasterState(); render(); }
};

window.masterSoftDeletePlayer = function(id) {
    const p = connectedPlayers[id];
    if (p && confirm(`APAGAR a ficha de ${p.name}?`)) {
        socket.emit('masterUpdatePlayer', { targetId: id, data: { _forceDelete: true } });
    }
};

window.handleAdminCredentials = function(e) {
    e.preventDefault();
    const email = document.getElementById('admin-email').value;
    const pass = document.getElementById('admin-password').value;
    if (email === 'admin@rpg.com' && pass === 'admin123') {
        const modal = document.getElementById('admin-credentials-modal');
        if (modal) modal.remove();
        roleSelected = true; isMaster = true; isAdmin = true;
        masterState.activeTab = 'users'; saveMasterState(); render();
    } else alert("Inválido!");
};

window.closeAdminCredentials = () => { const m = document.getElementById('admin-credentials-modal'); if(m) m.remove(); };

window.showAdminCredentials = function() {
    const html = `
        <div id="admin-credentials-modal" class="full-screen-modal active" style="background: rgba(0,0,0,0.9);">
            <div class="creation-wizard fade-in" style="max-width: 400px;">
                <h2 class="cinzel" style="text-align: center; color: var(--gold); margin-bottom: 2rem;">Admin Mode</h2>
                <form id="admin-credentials-form" style="display: flex; flex-direction: column; gap: 1rem;" onsubmit="handleAdminCredentials(event)">
                    <input type="email" id="admin-email" placeholder="Email" required>
                    <input type="password" id="admin-password" placeholder="Senha" required>
                    <button type="submit" class="btn-primary">Entrar</button>
                    <button type="button" onclick="closeAdminCredentials()">Cancelar</button>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
};
