-- Script para habilitar Realtime no Supabase
-- Execute este script no SQL Editor do Supabase

-- Habilitar Realtime para a tabela 'item'
ALTER PUBLICATION supabase_realtime ADD TABLE item;

-- Habilitar Realtime para a tabela 'shopping_list'
ALTER PUBLICATION supabase_realtime ADD TABLE shopping_list;

-- Habilitar Realtime para a tabela 'list_item'
ALTER PUBLICATION supabase_realtime ADD TABLE list_item;

-- Verificar se as tabelas foram adicionadas à publication
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
