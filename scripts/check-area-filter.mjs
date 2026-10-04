import nextEnv from '@next/env';
import {createSupabaseCollector} from '../src/lib/supabase/admin.ts';
import {getAreas,getCollectionKeywords} from '../src/lib/news/dictionary.ts';
import {classifyNews,descendants} from '../src/lib/news/classify.ts';
import {normalizeNews} from '../src/lib/news/normalize.ts';
import {storeNews} from '../src/lib/news/store.ts';
import {searchNaverNews} from '../src/lib/naver/client.ts';
nextEnv.loadEnvConfig(process.cwd());
try {
 const client=createSupabaseCollector(),areas=await getAreas(client),keywords=await getCollectionKeywords(client);
 const park=areas.find(area=>area.name==='지리산국립공원'),keyword=keywords.find(k=>k.keyword==='지리산');
 if(!park || !keyword) throw new Error('지리산 사전 구성 오류');
 const page=await searchNaverNews({query:keyword.keyword,display:3});
 for(const item of page.items) {const article=normalizeNews(item,keyword.keyword);await storeNews(client,article,classifyNews(article,keyword,areas));}
 const result=await client.from('articles').select('id,article_news_areas!inner(news_area_id)',{count:'exact'}).eq('is_test',false).in('article_news_areas.news_area_id',descendants(park.id,areas));
 if(result.error || !result.count) throw new Error('실제 지리산 기사 필터 실패');
 console.log(`Live area filter verified: ${result.count} real articles, tests excluded, parent/child scope applied.`);
} catch(error) {console.error(error instanceof Error?error.message:'Area filter verification failed');process.exitCode=1;}
