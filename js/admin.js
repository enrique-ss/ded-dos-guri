// Admin Panel JavaScript - Obsidian Edition
class AdminPanel {
    constructor() {
        this.supabase = null;
        this.characters = [];
        this.users = [];
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.checkAuth();
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }

        // Search
        const searchBox = document.getElementById('searchBox');
        if (searchBox) {
            searchBox.addEventListener('input', (e) => {
                this.filterUsers(e.target.value);
            });
        }
    }

    async handleLogin() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('errorMessage');

        // Credenciais fixas para admin (Padronizadas com app.js)
        if (email === 'admin@rpg.com' && password === 'admin123') {
            sessionStorage.setItem('adminAuth', 'true');
            this.showDashboard();
            this.initializeSupabase();
            await this.loadData();
        } else {
            errorDiv.textContent = 'Credenciais de Admin inválidas!';
            errorDiv.classList.remove('hidden');
            setTimeout(() => errorDiv.classList.add('hidden'), 3000);
        }
    }

    initializeSupabase() {
        try {
            if (typeof SUPABASE_CONFIG !== 'undefined') {
                this.supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
            }
        } catch (error) {
            console.error('Erro Supabase Admin:', error);
        }
    }

    handleLogout() {
        sessionStorage.removeItem('adminAuth');
        window.location.href = '/'; // Volta para a tela inicial do RPG
    }

    async checkAuth() {
        const localAuth = sessionStorage.getItem('adminAuth') === 'true';
        
        if (localAuth) {
            this.showDashboard();
            this.initializeSupabase();
            await this.loadData();
            return;
        }

        this.initializeSupabase();
        if (this.supabase) {
            const { data: { user } } = await this.supabase.auth.getUser();
            if (user && user.email === 'admin@rpg.com') {
                sessionStorage.setItem('adminAuth', 'true');
                this.showDashboard();
                await this.loadData();
                return;
            }
        }
        
        this.showLogin();
    }

    showLogin() {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('adminDashboard').style.display = 'none';
        document.body.style.overflow = 'hidden';
    }

    showDashboard() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
        document.body.style.overflow = 'auto';
    }

    async loadData() {
        try {
            // Busca usuários reais via Servidor (Bridge segura)
            const response = await fetch('/api/admin/users');
            const realUsers = await response.json();

            // Busca personagens para saber quem tem ficha
            let characters = [];
            if (this.supabase) {
                const { data } = await this.supabase.from('characters').select('user_id');
                characters = data || [];
            }

            this.users = realUsers.map(u => ({
                id: u.id,
                email: u.email,
                lastSignIn: u.last_sign_in_at,
                hasChar: characters.some(c => c.user_id === u.id)
            }));
            
            this.renderUsers();
        } catch (error) {
            console.error('Erro ao carregar banco de dados:', error);
            const container = document.getElementById('usersContainer');
            if (container) container.innerHTML = `<div class="muted-text txt-center" style="padding: 2rem; color: var(--red);">Erro: ${error.message}</div>`;
        }
    }

    renderUsers() {
        const container = document.getElementById('usersContainer');
        if (!container) return;
        container.innerHTML = '';

        if (this.users.length === 0) {
            container.innerHTML = '<div class="muted-text txt-center" style="padding: 3rem;">Nenhum usuário no sistema.</div>';
            return;
        }

        this.users.forEach(user => {
            const lastDate = user.lastSignIn ? new Date(user.lastSignIn).toLocaleDateString() : '';
            const row = document.createElement('div');
            row.className = 'user-row fade-in';
            row.innerHTML = `
                <div class="muted-text" style="font-family: monospace; font-size: 0.8rem;">${user.id.substring(0, 8)}...</div>
                <div style="font-weight: 600; color: var(--gold);">${user.email}</div>
                <div class="txt-center">${user.hasChar ? '✅ Tem Ficha' : '❌ Sem Ficha'}</div>
                <div class="status-badge" style="background: ${user.lastSignIn ? 'var(--green)' : '#888'};">
                    ${user.lastSignIn ? 'Ativo' : 'Pendente'}
                </div>
            `;
            container.appendChild(row);
        });
    }

    filterUsers(term) {
        const filtered = this.users.filter(u => u.email.toLowerCase().includes(term.toLowerCase()));
        const container = document.getElementById('usersContainer');
        if (!container) return;
        
        container.innerHTML = '';
        if (filtered.length === 0) {
            container.innerHTML = '<div class="muted-text txt-center" style="padding: 3rem;">Nenhum usuário encontrado.</div>';
            return;
        }

        filtered.forEach(user => {
            const row = document.createElement('div');
            row.className = 'user-row';
            row.innerHTML = `
                <div class="muted-text" style="font-family: monospace; font-size: 0.8rem;">${user.id.substring(0, 8)}...</div>
                <div style="font-weight: 600; color: var(--gold);">${user.email}</div>
                <div class="txt-center">${user.charCount} ficha(s)</div>
                <div class="status-badge">Ativo</div>
            `;
            container.appendChild(row);
        });
    }

    async refreshData() {
        const container = document.getElementById('usersContainer');
        if (container) container.innerHTML = '<div class="muted-text txt-center" style="padding: 3rem;">Sincronizando...</div>';
        await this.loadData();
    }
}

// Inicializar
const adminPanel = new AdminPanel();
