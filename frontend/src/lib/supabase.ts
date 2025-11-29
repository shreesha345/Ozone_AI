import { createClient } from '@supabase/supabase-js';

// ============================================
// SUPABASE CONFIGURATION
// ============================================
// Replace these with your actual Supabase credentials
// You can find these in your Supabase project settings:
// https://app.supabase.com/project/_/settings/api
// ============================================

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export for use in components
export default supabase;
