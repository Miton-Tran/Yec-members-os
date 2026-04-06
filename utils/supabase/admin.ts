import { createClient } from "@supabase/supabase-js";

/**
 * Admin Supabase Client using Service Role Key.
 * WARNING: This client bypasses all RLS policies. It must NEVER be exposed 
 * to the client-side or used in standard generic queries where user privileges apply.
 * Use exclusively inside secure Server Actions.
 */
export function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase URL or Service Role Key in Environment.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
