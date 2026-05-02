import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://joropqkkmfhyatzoixoz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvcm9wcWtrbWZoeWF0em9peG96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MTkwNzcsImV4cCI6MjA5MzI5NTA3N30.qmv9TUYeb7bK5BmreD7lW31tuiOq2ZVylG_3fH8szlg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
