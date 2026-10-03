import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseReadConfig } from "./config";

/** Public privileges only. Collection credentials must use a separate module. */
export function createSupabaseReader() {
  const { url, key } = getSupabaseReadConfig();
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store", signal: AbortSignal.timeout(10_000) }),
    },
  });
}
