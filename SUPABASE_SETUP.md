# Configuração do Supabase

Para que o sistema de login e salvamento na nuvem funcione, siga estes passos:

## 1. Criar Projeto no Supabase
1. Vá para [supabase.com](https://supabase.com/) e crie uma conta gratuita.
2. Crie um novo projeto (ex: "RPG dos Guri").
3. Aguarde a finalização da criação.

## 2. Configurar o Banco de Dados
No painel do Supabase, vá em **SQL Editor** e execute o seguinte script:

```sql
-- Criar tabela de personagens
create table characters (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null unique,
  name text,
  data jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ativar RLS (Row Level Security)
alter table characters enable row level security;

-- Políticas de Segurança (CUIDADO: Isso garante que um jogador não mexa na ficha do outro)
create policy "Usuários podem ver sua própria ficha" 
  on characters for select 
  using ( auth.uid() = user_id );

create policy "Usuários podem criar sua própria ficha" 
  on characters for insert 
  with check ( auth.uid() = user_id );

create policy "Usuários podem atualizar sua própria ficha" 
  on characters for update
  using ( auth.uid() = user_id );
```

## 3. Obter Credenciais
1. Vá em **Project Settings** -> **API**.
2. Copie a **Project URL**.
3. Copie a **anon public Key**.
4. Abra o arquivo `config.js` no seu projeto e cole os valores:

```javascript
const SUPABASE_CONFIG = {
    url: "SUA_URL_AQUI",
    anonKey: "SUA_KEY_AQUI"
};
```

## 4. Habilitar Login por E-mail
1. Vá em **Authentication** -> **Providers**.
2. Verifique se o provedor **Email** está habilitado (geralmente já vem por padrão).
3. (Opcional) Desabilite "Confirm Email" se quiser que o login funcione imediatamente sem precisar clicar em link no e-mail.

---
**Pronto!** Agora seu RPG tem um sistema de login real e as fichas ficam salvas online.
