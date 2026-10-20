import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://vrdtldzsiwisuvnfmqpf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_GEM29b9zIJsB9erx2N6Q-g_20Uc8Iv1';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);