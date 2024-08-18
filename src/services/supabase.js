import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ggegpfjdywpnrhktkfff.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnZWdwZmpkeXdwbnJoa3RrZmZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM3NDA5NzUsImV4cCI6MjAzOTMxNjk3NX0.ds_D7p2oxW2J9C2fx8pwRfkJ28Tmuu_8BZwwgwxRQsM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)