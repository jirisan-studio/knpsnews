import nextEnv from "@next/env";
import { createSupabaseCollector } from "../src/lib/supabase/admin.ts";
import { storeNews } from "../src/lib/news/store.ts";

nextEnv.loadEnvConfig(process.cwd());
try {
  const client = createSupabaseCollector();
  const stored = await client.from("articles").select("title,summary,media_name,original_url,canonical_url,naver_url,published_at,source_type,is_test,collection_keywords").eq("is_test", false).order("collected_at",{ascending:false}).limit(1).single();
  if (stored.error) throw new Error("중복 검증 대상 조회 실패");
  const first = await storeNews(client, stored.data);
  const again = await storeNews(client, stored.data);
  const [one,two] = await Promise.all([storeNews(client,stored.data),storeNews(client,stored.data)]);
  const result = await client.from("articles").select("id,collection_keywords",{count:"exact"}).eq("canonical_url",stored.data.canonical_url);
  if (result.error || result.count !== 1 || [again,one,two].some(row=>row.id!==first.id || row.inserted)) throw new Error("DB 중복 방지 검증 실패");
  console.log("Repeated and concurrent storage verified: exactly one article, stable ID, no duplicate insert.");
} catch(error) {
  console.error(error instanceof Error ? error.message : "Deduplication verification failed.");
  process.exitCode=1;
}
