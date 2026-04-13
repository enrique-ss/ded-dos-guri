-- Dropar tabelas existentes
DROP TABLE IF EXISTS public.master_data CASCADE;
DROP TABLE IF EXISTS public.characters CASCADE;

-- 1. TABELA DE PERSONAGENS (Suporta Múltiplos Personagens)
CREATE TABLE IF NOT EXISTS public.characters (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text,
  data jsonb,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABELA DO MESTRE (Notas, Histórico, Ordem de Batalha)
CREATE TABLE IF NOT EXISTS public.master_data (
  id uuid PRIMARY KEY,
  data jsonb,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ATIVA SEGURANÇA (RLS)
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_data ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS
DROP POLICY IF EXISTS "Acesso aos personagens" ON public.characters;
CREATE POLICY "Acesso aos personagens" ON public.characters 
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Acesso mestre" ON public.master_data;
CREATE POLICY "Acesso mestre" ON public.master_data 
  FOR ALL USING (true);
