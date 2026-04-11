// Sistema de Carregamento de Templates
const TemplateLoader = {
    async loadTemplate(templateName) {
        try {
            const response = await fetch(`templates/${templateName}.html`);
            if (!response.ok) throw new Error(`Failed to load ${templateName}`);
            return await response.text();
        } catch (error) {
            console.error('Error loading template:', error);
            return '';
        }
    },

    async loadAllTemplates() {
        const templates = ['auth', 'role-selection', 'character-selection', 'creation-screen', 'master-panel', 'sheet-view', 'items-view', 'habilidades-view', 'history-view', 'game-log-view'];
        const app = document.getElementById('app');
        
        for (const template of templates) {
            const html = await this.loadTemplate(template);
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            app.appendChild(tempDiv.firstElementChild);
        }
    }
};

// Carregar templates ao iniciar e então inicializar o app
document.addEventListener('DOMContentLoaded', async () => {
    await TemplateLoader.loadAllTemplates();
    // Chamar inicialização do app após carregar templates
    if (typeof initApp === 'function') {
        initApp();
    }
});
