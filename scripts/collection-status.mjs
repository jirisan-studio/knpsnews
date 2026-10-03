import nextEnv from '@next/env';
import {createSupabaseCollector} from '../src/lib/supabase/admin.ts';
import {koreanToday} from '../src/lib/news/filters.ts';
nextEnv.loadEnvConfig(process.cwd());
try {
 const client=createSupabaseCollector();
 const [logs,keywords,today]=await Promise.all([
  client.from('collection_logs').select('job_kind,status,started_at,finished_at,fetched_count,saved_count,failed_keywords,error_summary,history_incomplete').order('started_at',{ascending:false}).limit(5),
  client.from('collection_keywords').select('keyword,enabled,last_collected_at').order('keyword'),
  client.from('articles').select('id',{count:'exact',head:true}).eq('is_test',false).gte('collected_at',`${koreanToday()}T00:00:00+09:00`),
 ]);
 if(logs.error || keywords.error || today.error) throw new Error();
 console.log(JSON.stringify({todayCollected:today.count,logs:logs.data,keywords:keywords.data},null,2));
} catch {console.error('비공개 수집 상태 조회 실패. 서버 설정을 확인해 주세요.');process.exitCode=1;}
