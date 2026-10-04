import {test} from 'node:test';
import assert from 'node:assert/strict';
import {isDomesticParkNews} from '../src/lib/news/domestic.ts';
import {collectKeyword} from '../src/lib/news/collect-keyword.ts';

test('excludes overseas-only parks but preserves domestic reports and comparisons',()=>{
 for(const title of ['하와이 화산 국립공원 해식 아치 붕괴','옐로스톤 국립공원 야생동물','캐나다 밴프 국립공원 여행','세렝게티 국립공원 사파리']) assert.equal(isDomesticParkNews({title,summary:'국립공원 소식'}),false);
 for(const title of ['지리산 탐방로 통제','국립공원공단 산불 대응','전국 국립공원 탐방로 안전 점검','설악산과 미국 국립공원 관리 비교']) assert.equal(isDomesticParkNews({title,summary:''}),true);
});

test('rejects unknown foreign parks and North Korean origin goods, keeps real mountain reports',()=>{
 for(const article of [
  {title:'시장 찾아 빵 먹는 곰',summary:'카트마이 국립공원의 연례 행사'},
  {title:'북한산 농산물 수입',summary:'북한산 송이버섯 원산지 단속'},
  {title:'중국산 김치인데 국내산 표시',summary:'양양산 또는 북한산이라고 속여 송이버섯 판매'},
 ]) assert.equal(isDomesticParkNews(article),false);
 for(const article of [
  {title:'북한산국립공원 탐방로 안내',summary:'농산물 직거래장터 개장'},
  {title:'북한산 산행 안전 점검',summary:'등산객 김치 도시락'},
  {title:'국립공원교육원 교육',summary:''},
 ]) assert.equal(isDomesticParkNews(article),true);
});

test('a domestic collecting keyword does not admit a foreign-only article',async()=>{
 let written=0;
 const result=await collectKeyword({keyword:'지리산',from:'2026-09-01T00:00:00+09:00',until:'2026-10-04T00:00:00+09:00',deadline:Date.now()+60000,
 search:async()=>({total:1,start:1,display:100,items:[{title:'하와이 국립공원 붕괴',description:'미국의 해식 아치',originallink:'https://example.com/foreign',link:'https://example.com/foreign',pubDate:'2026-10-03T01:00:00Z'}]}),
 save:async articles=>{written+=articles.length;return articles.length;}});
 assert.equal(written,0);assert.equal(result.failed,false);assert.equal(result.skipped,0);
});
