import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseReadConfig } from "./config.ts";

/** Never import this module into user-facing client components. */
export function createSupabaseCollector(env: Record<string, string | undefined> = process.env) {
  const { url } = getSupabaseReadConfig(env);
  const key = env.SUPABASE_SECRET_KEY?.trim();
  if (!key?.startsWith("sb_secret_")) throw new Error("Supabase 서버 수집용 Secret key 설정이 필요합니다.");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store", signal: AbortSignal.timeout(10_000) }) },
  });
}
