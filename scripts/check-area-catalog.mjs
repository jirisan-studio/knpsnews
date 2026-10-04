import nextEnv from '@next/env';
import assert from 'node:assert/strict';
import {createSupabaseCollector} from '../src/lib/supabase/admin.ts';
import {getAreas,getCollectionKeywords} from '../src/lib/news/dictionary.ts';
import {areaCatalog} from './area-catalog.mjs';
nextEnv.loadEnvConfig(process.cwd());
try {
 const client=createSupabaseCollector();
 const areas=await getAreas(client),keywords=await getCollectionKeywords(client);
 const roots=areas.filter(area=>!area.parent_id);
 assert.deepEqual(roots.map(area=>area.name),areaCatalog.map(area=>area.name));
 for(const expected of areaCatalog) {
  const actual=roots.find(area=>area.name===expected.name);
  assert.equal(actual.type,expected.type);
  assert.ok(keywords.some(keyword=>keyword.keyword===actual.name && keyword.news_area_id===actual.id));
 }
 const parent=roots.find(area=>area.name==='지리산국립공원');
 assert.equal(parent.id,'10000000-0000-4000-8000-000000000001');
 assert.equal(areas.filter(area=>area.parent_id===parent.id).length,3);
 const linked=await client.from('article_news_areas').select('news_area_id',{count:'exact',head:true}).in('news_area_id',roots.map(area=>area.id));
 if(linked.error || !linked.count) throw new Error();
 console.log(JSON.stringify({parks:roots.filter(area=>area.type==='park').length,ecoCenters:roots.filter(area=>area.type==='eco_center').length,other:roots.filter(area=>area.type==='other').length,enabledKeywords:keywords.length,articleAreaLinks:linked.count,preservedJirisanId:true}));
} catch {console.error('Requested area catalog verification failed; credentials not printed.');process.exitCode=1;}
