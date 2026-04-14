// Configuracoes do Supabase
const SUPABASE_CONFIG = {
    url: window.SUPABASE_URL || 'SUA_URL_SUPABASE',
    anonKey: window.SUPABASE_ANON_KEY || 'SUA_KEY_SUPABASE'
};

// Em producao, o servidor pode injetar window.SUPABASE_URL e window.SUPABASE_ANON_KEY.
