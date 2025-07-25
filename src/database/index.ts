import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from '../supabaseConfig';

export const db = createClient(supabaseConfig.url, supabaseConfig.key);