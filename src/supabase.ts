import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lkrxjprdrqdxvsjyokfv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrcnhqcHJkcnFkeHZzanlva2Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNDIxNTAsImV4cCI6MjA5NjkxODE1MH0.HHPzsruYws2wyjpumyd9bAaGGbqepdzbgYDZhmGGuJI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
