async function handleAuth(mode) {
    const email = mode === 'login' ? document.getElementById('auth-email').value : document.getElementById('signup-email').value;
    const password = mode === 'login' ? document.getElementById('auth-password').value : document.getElementById('signup-password').value;

    try {
        if (isOfflineMode) {
            const payload = await apiRequest(`/api/auth/${mode === 'login' ? 'login' : 'register'}`, {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            setOfflineSession(payload.token, payload.user);
            await loadStateFromSupabase();

            if (socket && state.isCreated && !isMaster) {
                socket.emit('playerIdentify', { ...state, userEmail: user.email });
            }

            render();
            return;
        }

        if (!supabaseClient) {
            alert("Supabase nao configurado. Ative APP_MODE=online e informe as chaves do projeto.");
            return;
        }

        let result;
        if (mode === 'login') {
            result = await supabaseClient.auth.signInWithPassword({ email, password });
        } else {
            result = await supabaseClient.auth.signUp({ email, password });
        }

        if (result.error) {
            alert("Erro de autenticacao: " + result.error.message);
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
        alert(err.message || "Ocorreu um erro inesperado ao processar a autenticacao.");
    }
}

function toggleAuthMode(mode) {
    const card = document.getElementById('auth-inner-card');
    if (card) {
        card.classList.toggle('is-flipped', mode === 'signup');
    }
}

async function logout() {
    if (isOfflineMode) {
        clearOfflineSession();
        user = null;
        location.reload();
        return;
    }

    if (supabaseClient) await supabaseClient.auth.signOut();
    user = null;
    location.reload();
}

async function clearSession() {
    if (isOfflineMode) {
        clearOfflineSession();
    } else {
        try {
            if (supabaseClient) await supabaseClient.auth.signOut();
        } catch (e) {
            console.warn("Erro ao deslogar do Supabase:", e);
        }
    }

    user = null;
    roleSelected = false;
    isMaster = false;
    window.location.href = window.location.origin + window.location.pathname;
}

window.logout = logout;
window.clearSession = clearSession;
