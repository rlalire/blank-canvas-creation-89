// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = "https://gulfivzefivqthfgtmky.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1bGZpdnplZml2cXRoZmd0bWt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI3NDEwOTMsImV4cCI6MjA0ODMxNzA5M30.OK6J22nIhU8Cv258wdgwl3OoN91q_A4ChZcZsZ6Z1Po";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);