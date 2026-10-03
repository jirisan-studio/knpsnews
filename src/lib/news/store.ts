import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { normalizeNews } from "./normalize.ts";

export async function storeNews(client: SupabaseClient, article: ReturnType<typeof normalizeNews>, areaIds: string[] = []) {
  const result = await client.rpc("ingest_news_article", { payload: article });
  if (result.error || !result.data?.[0]?.article_id) throw new Error(`뉴스 저장 실패 (HTTP ${result.status})`);
  const { article_id: id, inserted } = result.data[0] as { article_id: string; inserted: boolean };
  if (areaIds.length) {
    const links = await client.from("article_news_areas").upsert(
      [...new Set(areaIds)].map((news_area_id) => ({ article_id: id, news_area_id })),
      { onConflict: "article_id,news_area_id", ignoreDuplicates: true },
    );
    if (links.error) throw new Error(`관심영역 연결 실패 (HTTP ${links.status})`);
  }
  return { id, inserted };
}
