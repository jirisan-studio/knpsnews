import "server-only";
import { createSupabaseReader } from "@/lib/supabase/server";
import { getAreas } from './dictionary.ts';
import { ancestors } from './classify.ts';
import type { parseFilters } from './filters.ts';
import { shiftDate } from './filters.ts';

export async function getLatestNews(filters:ReturnType<typeof parseFilters>) {
  const {page}=filters;
  const client = createSupabaseReader();
  let query = client.from("articles")
    .select("id,title,summary,media_name,original_url,published_at,is_test,collection_keywords", {count:'exact'})
    .eq('is_test',false).gte('published_at',`${filters.from}T00:00:00+09:00`);
  if(filters.to) query=query.lt('published_at',`${shiftDate(filters.to,1)}T00:00:00+09:00`);
  const { data: articles, error, count } = await query
    .order("published_at", { ascending: false })
    .order("id", { ascending: false })
    .range((page - 1) * 20, page * 20 - 1);
  if (error) throw new Error("저장된 뉴스를 조회하지 못했습니다.");
  if (!articles?.length) return {articles:[], count:count ?? 0};

  const { data: links, error: linksError } = await client.from("article_news_areas")
    .select("article_id,news_area_id").in("article_id", articles.map((article) => article.id));
  if (linksError) throw new Error("뉴스 관심영역을 조회하지 못했습니다.");
  const areas = await getAreas(client);

  return {count:count ?? 0, articles:articles.map((article) => ({
    ...article,
    areas: areas.filter(area => !area.parent_id && ancestors((links ?? []).filter(link => link.article_id === article.id).map(link => link.news_area_id),areas).includes(area.id)),
  }))};
}
