import nextEnv from '@next/env';
import {createClient} from '@supabase/supabase-js';
import {getSupabaseReadConfig} from '../src/lib/supabase/config.ts';
nextEnv.loadEnvConfig(process.cwd());
try {
 const {url,key}=getSupabaseReadConfig(), client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const result=await client.rpc('search_news',{search_text:'지리산'}).select('id,title,summary,is_test');
 if(result.error || !result.data.length || result.data.some(row=>row.is_test || !`${row.title} ${row.summary}`.includes('지리산'))) throw new Error('키워드 조회 오류');
 const combined=await client.rpc('search_news_filtered',{search_text:'약초',date_from:'2026-10-03T00:00:00+09:00',date_until:'2026-10-04T00:00:00+09:00',area_ids:['10000000-0000-4000-8000-000000000001']},{count:'exact'}).select('id,title,summary,published_at').order('published_at',{ascending:false}).order('id',{ascending:false}).range(0,19);
 if(combined.error || combined.count!==1 || combined.data.length!==1) throw new Error('복합 검색 오류');
 const empty=await client.rpc('search_news_filtered',{search_text:'약초',date_from:'2026-10-02T00:00:00+09:00',date_until:'2026-10-03T00:00:00+09:00',area_ids:['10000000-0000-4000-8000-000000000001']},{count:'exact'}).select('id');
 if(empty.error || empty.count!==0) throw new Error('복합 날짜 조건 오류');
 for(const search_text of ['%', '_', '"),(id.gt.0']) {
  const probe=await client.rpc('search_news',{search_text}).select('title,summary');
  if(probe.error || probe.data.some(row=>!`${row.title} ${row.summary}`.includes(search_text))) throw new Error('검색어 리터럴 처리 오류');
 }
 console.log(`Public keyword search verified: ${result.data.length} literal matches; wildcard and punctuation do not broaden results.`);
} catch(error) {console.error(error instanceof Error?error.message:'Keyword search verification failed; no sensitive values logged.');process.exitCode=1;}
