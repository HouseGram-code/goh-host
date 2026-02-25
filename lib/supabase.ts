import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yuafzomtbiwnmjvrkjmq.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_cq6un92eSnzLPnDwE9USFQ_ZO4eYMMs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
