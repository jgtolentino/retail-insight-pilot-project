// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ziduipgymiqlcazebbim.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppZHVpcGd5bWlxbGNhemViYmltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyOTI2MTUsImV4cCI6MjA2Mzg2ODYxNX0.u1FGmqMXCh7WPzb7ed8AQ6pR7KXutFLGuNmyGTUQ16o";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);