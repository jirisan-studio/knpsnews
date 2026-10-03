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
  const { error, status } = await client.from("news_areas").select("id").limit(1);
  if (error && !(status === 404 && error.code === "PGRST205")) {
    console.error(`Data API returned HTTP ${status}.`);
    throw new Error("Data API read failed");
  }
  console.log("Supabase Data API connection verified using public privileges.");
  console.log(error ? "News schema is not exposed yet (expected before STEP 7)." : "News area table read verified.");
} catch (error) {
  // Never log keys, request headers, raw server responses, or environment values.
  console.error("Supabase connection failed. Check the URL, publishable key, Data API setting, and network.");
  const networkCode = error?.cause?.code;
  if (typeof networkCode === "string" && /^[A-Z_0-9]+$/.test(networkCode)) console.error(`Network error code: ${networkCode}`);
  process.exitCode = 1;
}
