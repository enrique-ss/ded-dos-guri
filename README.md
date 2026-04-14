# D&D dos Guri

Sistema de gerenciamento de fichas de personagem para RPG de mesa, com sincronizacao em tempo real entre mestre e jogadores.

## Tecnologias

- Node.js + Express
- Socket.io
- Supabase

## Estrutura do Projeto

```text
rpg/
|-- src/
|   |-- index.js
|   `-- setup.js
|-- public/
|   |-- css/
|   |-- js/
|   |-- templates/
|   `-- index.html
|-- docs/
|-- .env.example
|-- setup.sql
|-- package.json
`-- README.md
```

## Como rodar localmente

1. Configure as variaveis de ambiente
   - Copie `.env.example` para `.env`
   - Preencha `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY`

2. Configure o banco no Supabase
   - Execute o SQL do arquivo `setup.sql` no SQL Editor
   - Isso cria as tabelas `characters` e `master_data`

3. Instale as dependencias
   ```bash
   npm install
   ```

4. Inicie a aplicacao
   ```bash
   npm run dev
   ```

   Ou, se preferir manter o comando antigo:
   ```bash
   npm run full
   ```

5. Acesse
   - App: `http://localhost:3001`
   - Area de mestre: senha `4444`

## Scripts

- `npm run dev`: inicia o servidor local
- `npm run full`: mesmo comportamento do `dev`, mantido por compatibilidade
- `npm run setup`: checa se o ambiente local esta pronto
- `npm start`: inicia o servidor
