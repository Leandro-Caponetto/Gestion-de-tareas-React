
import { createClient } from '@supabase/supabase-js';

// Reemplaza con tus credenciales de Supabase
const supabaseUrl = 'https://qpdsglaxfydxmvjcisuj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwZHNnbGF4ZnlkeG12amNpc3VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MDAwMzIsImV4cCI6MjA4NjQ3NjAzMn0.7dL5trmQLLPmNktLAAFcpzR7yNwx8oBN6pXM51oD2LU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
