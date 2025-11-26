import { createClient } from '@supabase/supabase-js' 
 
const supabaseUrl = 'https://imctfcviqkriwqlldwgi.supabase.co' 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltY3RmY3ZpcWtyaXdxbGxkd2dpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxMDIxNjQsImV4cCI6MjA3OTY3ODE2NH0.4zjNLSvGLuHgca2DaBT74ZN63fOLymru9YGCvo9v5u0' 
 
export const supabase = createClient(supabaseUrl, supabaseKey) 
