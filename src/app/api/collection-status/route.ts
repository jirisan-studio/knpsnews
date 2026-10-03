import {collectorAuthorized} from '@/lib/news/authorize';
import {createSupabaseCollector} from '@/lib/supabase/admin';
import {koreanToday} from '@/lib/news/filters';
export async function GET(request:Request) {
 if(!collectorAuthorized(request)) return Response.json({error:'인증이 필요합니다.'},{status:401});
 try {
  const client=createSupabaseCollector();
  const [logs,keywords,today]=await Promise.all([
   client.from('collection_logs').select('*').order('started_at',{ascending:false}).limit(10),
   client.from('collection_keywords').select('id,keyword,news_area_id,enabled').order('keyword'),
   client.from('articles').select('id',{count:'exact',head:true}).eq('is_test',false).gte('collected_at',`${koreanToday()}T00:00:00+09:00`),
  ]);
  if(logs.error || keywords.error || today.error) throw new Error();
  return Response.json({logs:logs.data,keywords:keywords.data,todayCollected:today.count},{headers:{'Cache-Control':'no-store'}});
 } catch {return Response.json({error:'수집 상태 조회 실패'},{status:500});}
}
