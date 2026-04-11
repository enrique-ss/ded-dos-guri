async function handleAuth(mode) {
    const email = mode === 'login' ? document.getElementById('auth-email').value : document.getElementById('signup-email').value;
    const password = mode === 'login' ? document.getElementById('auth-password').value : document.getElementById('signup-password').value;

    if (!supabaseClient) return alert("Supabase não configurado. Adicione sua URL e Key no arquivo config.js.");

    try {
        let result;
        if (mode === 'login') {
            result = await supabaseClient.auth.signInWithPassword({ email, password });
        } else {
            result = await supabaseClient.auth.signUp({ email, password });
        }

        if (result.error) {
            alert("Erro de Autenticação: " + result.error.message);
        } else if (result.data.user) {
            user = result.data.user;
            await loadStateFromSupabase();
            
            if (mode === 'signup' && !result.data.session) {
                alert("Cadastro realizado! Verifique seu e-mail para confirmar a conta antes de entrar.");
                return;
            }

            if (socket && state.isCreated && !isMaster) {
                socket.emit('playerIdentify', { ...state, userEmail: user.email });
            }
            render();
        }
    } catch (err) {
        console.error("Erro fatal no Auth:", err);
        alert("Ocorreu um erro inesperado ao processar o login.");
    }
}

function toggleAuthMode(mode) {
    const card = document.getElementById('auth-inner-card');
    if (card) {
        card.classList.toggle('is-flipped', mode === 'signup');
    }
}

async function logout() {
    if (supabaseClient) await supabaseClient.auth.signOut();
    user = null;
    sessionStorage.removeItem('adminAuth');
    location.reload();
}

async function clearSession() {
    try {
        if (supabaseClient) await supabaseClient.auth.signOut();
    } catch (e) {
        console.warn("Erro ao deslogar do Supabase:", e);
    }
    user = null;
    roleSelected = false;
    isMaster = false;
    sessionStorage.removeItem('adminAuth');
    window.location.href = window.location.origin + window.location.pathname;
}

async function loadUsers() {
    const listEl = document.getElementById('users-list');
    if (!listEl) return;
    
    listEl.innerHTML = '<div class="loader-spinner"></div><p>Buscando usuários...</p>';
    
    try {
        const response = await fetch('/api/admin/users');
        const users = await response.json();
        
        if (!users || users.length === 0) {
            listEl.innerHTML = '<div class="muted-text txt-center">Nenhum usuário no sistema.</div>';
            return;
        }

        listEl.innerHTML = `
            <div style="background: var(--bg-overlay); border-radius: 12px; padding: 1.5rem;">
                <h3 style="color: var(--gold); margin-bottom: 1rem;">Todos os Usuários (${users.length})</h3>
                ${users.map(u => `
                    <div style="padding: 0.75rem; border-bottom: 1px solid var(--panel-border); display: flex; justify-content: space-between; align-items: center;">
                        <span>${u.email}</span>
                        <small style="color: var(--txt-muted);">Criado: ${new Date(u.created_at).toLocaleDateString('pt-BR')}</small>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        listEl.innerHTML = '<div class="muted-text txt-center">Erro ao carregar dados do servidor.</div>';
    }
}

window.logout = logout;
window.clearSession = clearSession;
