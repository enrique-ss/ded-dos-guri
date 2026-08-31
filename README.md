# D&D dos Guri

Painel virtual para gerenciamento de sessões de RPG de mesa com foco em fichas de personagem interativas. Oferece atualização e sincronização em tempo real de estatísticas, atributos e itens entre o mestre e os jogadores usando WebSockets, além de salvar dados na nuvem via Supabase.

## Como rodar

1. Copie `.env.example` para `.env` e preencha as chaves do Supabase.
2. Execute a estrutura SQL do arquivo `setup.sql` no painel do Supabase.
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Inicie o servidor:
   ```bash
   npm run dev
   ```
5. Acesse `http://localhost:3001` no navegador.

## Scripts

- `npm run dev`: Inicia o servidor local de desenvolvimento.
- `npm run setup`: Verifica as configurações do ambiente.
- `npm start`: Inicia o servidor em produção.

## Stack

- Node.js + Express
- Socket.io
- Supabase (PostgreSQL)
- HTML, CSS e JavaScript puro
