import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://librvoubmxmedxnfzedz.supabase.co';
const supabaseAnonKey = 'sb_publishable_tMidwUYkjMz5Vq4h6i83vA_8SES9EDa';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
