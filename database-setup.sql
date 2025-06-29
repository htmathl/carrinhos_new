-- Estruturas das tabelas para o Supabase

-- Tabela de itens
CREATE TABLE IF NOT EXISTS public.item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    unit TEXT NOT NULL CHECK (unit IN ('unidade', 'kg', 'litro')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de listas de compras
CREATE TABLE IF NOT EXISTS public.shopping_list (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de itens nas listas (relacionamento)
CREATE TABLE IF NOT EXISTS public.list_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    list_id UUID NOT NULL REFERENCES public.shopping_list(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES public.item(id) ON DELETE CASCADE,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_list_item_list_id ON public.list_item(list_id);
CREATE INDEX IF NOT EXISTS idx_list_item_item_id ON public.list_item(item_id);
CREATE INDEX IF NOT EXISTS idx_item_category ON public.item(category);
CREATE INDEX IF NOT EXISTS idx_shopping_list_created_at ON public.shopping_list(created_at);
CREATE INDEX IF NOT EXISTS idx_item_created_at ON public.item(created_at);

-- Políticas RLS (Row Level Security)
ALTER TABLE public.item ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_item ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas (permite tudo por enquanto)
CREATE POLICY "Allow all operations on item" ON public.item FOR ALL USING (true);
CREATE POLICY "Allow all operations on shopping_list" ON public.shopping_list FOR ALL USING (true);
CREATE POLICY "Allow all operations on list_item" ON public.list_item FOR ALL USING (true);
