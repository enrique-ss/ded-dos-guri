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
    window.location.href = window.location.origin + window.location.pathname;
}

window.logout = logout;
window.clearSession = clearSession;
