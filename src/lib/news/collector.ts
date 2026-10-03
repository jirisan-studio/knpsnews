import 'server-only';
import {randomUUID} from 'node:crypto';
import {createSupabaseCollector} from '../supabase/admin.ts';
import {getAreas,getCollectionKeywords} from './dictionary.ts';
import {classifyNews} from './classify.ts';
import {koreanToday,shiftDate} from './filters.ts';
import {searchNaverNews} from '../naver/client.ts';
import {collectKeyword} from './collect-keyword.ts';

export async function collectNews(options:{kind?:'initial'|'incremental'|'manual';budgetMs?:number;keywordLimit?:number;display?:number;maxPages?:number}={}) {
 const client=createSupabaseCollector(),worker=randomUUID();
 const lock=await client.rpc('acquire_collection_lock',{worker});
 if(lock.error) throw new Error('수집 잠금 확인 실패');
 if(!lock.data) return {busy:true};
 let logId:string|undefined;
 try {
  const kind=options.kind ?? 'incremental',today=koreanToday();
  const log=await client.from('collection_logs').insert({job_kind:kind,status:'running',requested_from:'2026-09-01',requested_to:today}).select('id').single();
  if(log.error) throw new Error('수집 시작 기록 실패');
  logId=log.data.id;
  const areas=await getAreas(client),allKeywords=await getCollectionKeywords(client);
  const keywords=options.keywordLimit?allKeywords.slice(0,options.keywordLimit):allKeywords;
  const deadline=Date.now()+(options.budgetMs ?? 240_000);
  let fetched=0,saved=0,skipped=0,incomplete=false;
  const failed:string[]=[];
  for(const keyword of keywords) {
   if(Date.now()>deadline) {failed.push(keyword.keyword);incomplete=true;continue;}
   try {
    const from=kind==='initial'?'2026-09-01':keyword.last_collected_at?shiftDate(koreanToday(new Date(keyword.last_collected_at)),-2):'2026-09-01';
    const boundedFrom=from<'2026-09-01'?'2026-09-01':from;
    const result=await collectKeyword({keyword:keyword.keyword,from:`${boundedFrom}T00:00:00+09:00`,until:`${shiftDate(today,1)}T00:00:00+09:00`,deadline,display:options.display,maxPages:options.maxPages,
     search:searchNaverNews,
     save:async articles=>{
      const batch=await client.rpc('ingest_news_batch',{payloads:articles});
      if(batch.error || batch.data?.length!==articles.length) throw new Error('뉴스 일괄 저장 실패');
      const links=new Map<string,{article_id:string;news_area_id:string}>();
      for(const article of articles) {
       const id=batch.data.find((row:{canonical_url:string})=>row.canonical_url===article.canonical_url)?.article_id;
       if(!id) throw new Error('저장 기사 확인 실패');
       for(const area of classifyNews(article,keyword,areas)) links.set(`${id}:${area}`,{article_id:id,news_area_id:area});
      }
      if(links.size) {const linked=await client.from('article_news_areas').upsert([...links.values()],{onConflict:'article_id,news_area_id',ignoreDuplicates:true});if(linked.error) throw new Error('분류 연결 실패');}
      return batch.data.filter((row:{inserted:boolean})=>row.inserted).length;
     },
    });
    fetched+=result.fetched;saved+=result.saved;skipped+=result.skipped;incomplete ||= result.incomplete;
    if(result.failed) failed.push(keyword.keyword);
    // Smoke tests and interrupted workers never advance a full keyword checkpoint.
    if(!result.failed && !result.budgetLimited && !options.keywordLimit && !options.maxPages && !options.display) {
      const checkpoint=await client.from('collection_keywords').update({last_collected_at:new Date().toISOString()}).eq('id',keyword.id);
      if(checkpoint.error) failed.push(keyword.keyword);
    }
   } catch {failed.push(keyword.keyword);}
  }
  const status=!keywords.length?'failed':failed.length===keywords.length?'failed':failed.length || incomplete || skipped?'partial':'success';
  const finished=await client.from('collection_logs').update({status,finished_at:new Date().toISOString(),fetched_count:fetched,saved_count:saved,failed_keywords:failed,history_incomplete:incomplete,error_summary:status==='success'?null:`실패 검색어 ${failed.length}개; API 범위/시간 제한 ${incomplete?'있음':'없음'}; 형식 제외 ${skipped}건`}).eq('id',logId);
  if(finished.error) throw new Error('수집 완료 기록 실패');
  return {busy:false,logId,status,fetched,saved,skipped,incomplete,failedKeywords:failed};
 } catch {
  if(logId) await client.from('collection_logs').update({status:'failed',finished_at:new Date().toISOString(),error_summary:'수집 구성/DB 오류. 서버 설정과 연결을 확인해 주세요.'}).eq('id',logId);
  throw new Error('뉴스 수집 실패. 비공개 수집 기록과 서버 설정을 확인해 주세요.');
 } finally {await client.rpc('release_collection_lock',{worker});}
}
