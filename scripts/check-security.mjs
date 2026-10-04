import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseReadConfig } from "../src/lib/supabase/config.ts";

nextEnv.loadEnvConfig(process.cwd());
try {
  const { url, key } = getSupabaseReadConfig();
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(10_000) }) },
  });
  const missingId = "00000000-0000-0000-0000-000000000000";
  // Empty insert cannot satisfy required article fields; updates/deletes target no real row.
  const checks = [
    ["Article insert blocked", () => client.from("articles").insert({})],
    ["Article update blocked", () => client.from("articles").update({ title: "permission probe" }).eq("id", missingId)],
    ["Article delete blocked", () => client.from("articles").delete().eq("id", missingId)],
    ["Collection keywords private", () => client.from("collection_keywords").select("id").limit(0)],
    ["Collection logs private", () => client.from("collection_logs").select("id").limit(0)],
    ["Ingestion function private", () => client.rpc("ingest_news_article", { payload: {} })],
    ["Batch ingestion private", () => client.rpc("ingest_news_batch", { payloads: [] })],
    ["Collector lock private", () => client.from('collection_lock').select('id').limit(0)],
    ["Visitor identities private", () => client.from('site_visit_tokens').select('day').limit(0)],
    ["Visitor totals write private", () => client.from('site_visit_days').insert({})],
    ["Visitor counting function private", () => client.rpc('record_site_visit',{visitor_token:missingId})],
  ];
  for (const [name, query] of checks) {
    const { error, status } = await query();
    const blocked = error && (status === 401 || status === 403 || (status === 404 && ["PGRST205", "PGRST202"].includes(error.code)));
    if (!blocked) throw new Error(name);
    console.log(`${name}: verified`);
  }
} catch {
  console.error("Security verification failed. Review RLS, table privileges and connectivity. No sensitive values logged.");
  process.exitCode = 1;
}
