# D&D dos Guri

Sistema de gerenciamento de fichas de personagem para RPG de mesa, com sincronização em tempo real entre mestre e jogadores.

## Tecnologias

- Node.js + Express
- Socket.io (comunicação em tempo real)
- Supabase (banco de dados e autenticação)

## Estrutura do Projeto

```
rpg/
├── src/
│   └── index.js (servidor backend)
│   └── setup.js (setup do banco)
├── public/
│   ├── css/ (estilos)
│   ├── js/ (scripts frontend)
│   ├── templates/ (páginas HTML)
│   └── index.html
├── docs/ (documentação)
├── .env.example
├── setup.sql (SQL para criar tabelas)
├── package.json
└── README.md
```

## 🚀 Como rodar localmente

1. **Configurar variáveis de ambiente**
   - Copie `.env.example` para `.env`
   - Configure as variáveis do Supabase (URL, ANON_KEY, SERVICE_ROLE_KEY)

2. **Configurar banco de dados no Supabase**
   - Execute o SQL do arquivo `setup.sql` no SQL Editor do Supabase
   - Isso cria as tabelas `characters` e `master_data`

3. **Instalar dependências**
   ```bash
   npm install
   ```

4. **Opções de execução**
   ```bash
   npm run setup  # Drop/criar tabelas no Supabase
   npm run dev    # Iniciar servidor (porta 3001)
   npm run full   # Setup + dev (recomendado)
   npm start      # Iniciar servidor
   ```

5. **Acessar**
   - Backend: http://localhost:3001
   - Área de mestre: acessível pela senha 4444

## Variáveis de Ambiente

Copie `.env.example` para `.env` e configure suas credenciais do Supabase.
