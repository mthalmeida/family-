import { createClient } from '@supabase/supabase-js';

// CONFIGURAÇÃO DE VARIÁVEIS DE AMBIENTE
// Crie um arquivo .env na raiz do projeto com as seguintes variáveis:
// VITE_SUPABASE_URL=sua_url_do_supabase
// VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase

// Exemplo de arquivo .env:
// VITE_SUPABASE_URL=https://your-project-id.supabase.co
// VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL_HERE';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY_HERE';

// Criação do cliente Supabase usando variáveis de ambiente
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase