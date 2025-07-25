import { createClient } from '@supabase/supabase-js';

// CONFIGURAÇÃO DO SUPABASE
// Substitua estas variáveis pelas suas próprias credenciais do Supabase
// Você pode encontrar essas informações no painel do Supabase em Settings > API
const supabaseUrl = 'YOUR_SUPABASE_URL_HERE'; // Ex: 'https://your-project-id.supabase.co'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY_HERE'; // Ex: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

export const supabaseConfig = {
  url: supabaseUrl,
  key: supabaseAnonKey
};

// Criação do cliente Supabase
// Este cliente será usado em toda a aplicação para interagir com o banco de dados
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export { supabase };