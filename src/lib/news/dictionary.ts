import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { NewsArea, CollectionKeyword } from './classify.ts';

export async function getAreas(client: SupabaseClient): Promise<NewsArea[]> {
  const result = await client.from('news_areas').select('id,name,type,parent_id,aliases,sort_order').eq('active',true).order('sort_order').order('name');
  if (result.error) throw new Error('관심영역 조회 실패');
  return result.data ?? [];
}

export async function getCollectionKeywords(client: SupabaseClient): Promise<CollectionKeyword[]> {
  const result = await client.from('collection_keywords').select('id,keyword,news_area_id').eq('enabled',true).order('keyword');
  if (result.error) throw new Error('수집 검색어 조회 실패');
  return result.data ?? [];
}
