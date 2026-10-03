import nextEnv from '@next/env';
import { createSupabaseCollector } from '../src/lib/supabase/admin.ts';
import { getAreas, getCollectionKeywords } from '../src/lib/news/dictionary.ts';
import { classifyNews, descendants } from '../src/lib/news/classify.ts';
import { storeNews } from '../src/lib/news/store.ts';
nextEnv.loadEnvConfig(process.cwd());
try {
 const client=createSupabaseCollector();
 const areas=await getAreas(client), keywords=await getCollectionKeywords(client);
 const park=areas.find(a=>a.name==='지리산');
 if(!park || descendants(park.id,areas).length!==4 || !keywords.length) throw new Error('관심영역/검색어 구성 오류');
 const fixture=await client.from('article_news_areas').select('news_area_id').eq('article_id','20000000-0000-4000-8000-000000000001');
 if(fixture.error || !fixture.data.some(link=>descendants(park.id,areas).includes(link.news_area_id))) throw new Error('지리산 하위 연결 조회 실패');
 const real=await client.from('articles').select('*').eq('is_test',false).limit(1).single();
 if(real.error) throw new Error('실제 뉴스 조회 실패');
 const keyword=keywords.find(k=>real.data.collection_keywords.includes(k.keyword));
 if(!keyword) throw new Error('수집 검색어 매칭 실패');
 const ids=classifyNews(real.data,keyword,areas);
 await storeNews(client,real.data,ids); await storeNews(client,real.data,ids);
 const links=await client.from('article_news_areas').select('news_area_id').eq('article_id',real.data.id);
 if(links.error || ids.some(id=>links.data.filter(row=>row.news_area_id===id).length!==1)) throw new Error('관심영역 중복 연결 검증 실패');
 console.log(`DB dictionary verified: ${areas.length} areas, ${keywords.length} enabled keywords, parent includes all 3 regions, repeat links preserved.`);
} catch(error) {console.error(error instanceof Error?error.message:'Area verification failed');process.exitCode=1;}
