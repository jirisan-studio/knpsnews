import nextEnv from "@next/env";
import { createSupabaseCollector } from "../src/lib/supabase/admin.ts";
import { searchNaverNews } from "../src/lib/naver/client.ts";
import { normalizeNews } from "../src/lib/news/normalize.ts";

nextEnv.loadEnvConfig(process.cwd());
try {
  const client = createSupabaseCollector();
  const keyword = "국립공원공단";
  const page = await searchNaverNews({ query: keyword, display: 1 });
  if (!page.items.length) throw new Error("검증할 뉴스가 없습니다.");
  const article = normalizeNews(page.items[0], keyword);
  const saved = await client.from("articles").upsert(article, { onConflict: "canonical_url", ignoreDuplicates: true }).select("id");
  if (saved.error) throw new Error(`DB 저장 실패 (HTTP ${saved.status})`);
  const stored = await client.from("articles").select("id,title,summary,published_at,is_test").eq("canonical_url", article.canonical_url).single();
  if (stored.error || stored.data.title !== article.title || stored.data.summary !== article.summary || stored.data.is_test) throw new Error("DB 저장 후 조회 검증 실패");
  console.log(`Real news storage verified. Inserted rows: ${saved.data.length}; read-back matched.`);
} catch (error) {
  // Only our sanitized errors are logged, never Supabase error payloads or environment values.
  console.error(error instanceof Error ? error.message : "Storage verification failed.");
  process.exitCode = 1;
}
