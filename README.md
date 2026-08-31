# D&D dos Guri

Painel virtual para RPG de mesa com edição e sincronização de fichas em tempo real entre mestre e jogadores via WebSockets e Supabase.

## Como rodar

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Crie o arquivo `.env` a partir do modelo (`APP_MODE=offline`):
   ```bash
   cp .env.example .env
   ```
3. Inicialize o banco de dados e rode a aplicação:
   ```bash
   npm run setup
   npm run dev
   ```
4. Abra `http://localhost:3001` no navegador.

## Scripts

- `npm run setup`: Reseta o banco de dados SQLite local.
- `npm run dev`: Inicia a aplicação em modo de desenvolvimento.
- `npm start`: Inicia o servidor em modo de produção.

## Documentação e Stack

### Tecnologias
- **Backend:** Node.js, Express.js, Socket.io, Supabase (PostgreSQL).
- **Frontend:** HTML5, CSS3, JavaScript puro.
- **Banco de dados:** SQLite (`better-sqlite3`) e Supabase (PostgreSQL).

### Documentação Adicional
Consulte os arquivos [docs/DOCUMENTACAO_TECNICA.md](docs/DOCUMENTACAO_TECNICA.md) e [docs/DOCUMENTACAO_DIDATICA.md](docs/DOCUMENTACAO_DIDATICA.md) para obter detalhes de implantação e arquitetura.
