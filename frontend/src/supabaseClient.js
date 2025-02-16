// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Replace with your own Supabase credentials
const supabaseUrl = 'https://dqnoznfkjkexgtzvjpcq.supabase.co';  // Your Supabase URL
const supabaseKey = 'eeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxbm96bmZramtleGd0enZqcGNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg5NTQ4MjAsImV4cCI6MjA1NDUzMDgyMH0.nP8Zloowi4mz7MkB9ggYkcn9cady3yk9IbDsCrdhGS4';  // Your Supabase public anon key

export const supabase = createClient(supabaseUrl, supabaseKey);
