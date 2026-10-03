import "server-only";
import { createSupabaseReader } from "@/lib/supabase/server";

export async function getLatestNews() {
  const client = createSupabaseReader();
  const { data: articles, error } = await client.from("articles")
    .select("id,title,summary,media_name,original_url,published_at,is_test")
    .order("published_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(20);
  if (error) throw new Error("저장된 뉴스를 조회하지 못했습니다.");
  if (!articles?.length) return [];

  const { data: links, error: linksError } = await client.from("article_news_areas")
    .select("article_id,news_area_id").in("article_id", articles.map((article) => article.id));
  if (linksError) throw new Error("뉴스 관심영역을 조회하지 못했습니다.");
  const areaIds = [...new Set((links ?? []).map((link) => link.news_area_id))];
  let areas: { id: string; name: string }[] = [];
  if (areaIds.length) {
    const result = await client.from("news_areas").select("id,name").in("id", areaIds).is("parent_id", null).order("sort_order");
    if (result.error) throw new Error("뉴스 관심영역을 조회하지 못했습니다.");
    areas = result.data ?? [];
  }

  return articles.map((article) => ({
    ...article,
    areas: areas.filter((area) => links?.some((link) => link.article_id === article.id && link.news_area_id === area.id)),
  }));
}
