import {test} from 'node:test';
import assert from 'node:assert/strict';
import {collectKeyword} from '../src/lib/news/collect-keyword.ts';
import {collectorAuthorized} from '../src/lib/news/authorize.ts';
const item=(date)=>({title:'국립공원공단 뉴스',description:'API 요약',originallink:'https://example.com/news',link:'https://news.naver.com/news',pubDate:date});
const base={keyword:'국립공원',from:'2026-09-01T00:00:00+09:00',until:'2026-10-04T00:00:00+09:00',deadline:Date.now()+60000,display:2,maxPages:2};
test('collection excludes old/future dates and records API result truncation',async()=>{
 let saved=0,calls=0;
 const result=await collectKeyword({...base,search:async()=>{calls++;return {total:10,start:1,display:2,items:[item('2026-10-03T01:00:00Z'),item('2026-08-31T01:00:00Z')]};},save:async articles=>{saved+=articles.length;return articles.length;}});
 assert.equal(saved,1);assert.equal(calls,1);assert.equal(result.incomplete,false);
 const limit=await collectKeyword({...base,maxPages:1,search:async()=>({total:100,start:1,display:2,items:[item('2026-10-03T01:00:00Z'),item('2026-10-03T01:00:00Z')]}),save:async()=>1});
 assert.equal(limit.incomplete,true);
});
test('a later API failure retains earlier counts and expired jobs make no calls',async()=>{
 let calls=0;
 const result=await collectKeyword({...base,search:async()=>{if(++calls===2) throw new Error('private raw failure');return {total:20,start:1,display:2,items:[item('2026-10-03T01:00:00Z'),item('2026-10-03T01:00:00Z')]};},save:async()=>1});
 assert.equal(result.failed,true);assert.equal(result.saved,1);assert.equal(result.fetched,2);
 const expired=await collectKeyword({...base,deadline:0,search:async()=>{throw new Error('must not run');},save:async()=>0});
 assert.equal(expired.budgetLimited,true);assert.equal(expired.fetched,0);
});
test('collector authorization fails closed and requires the exact bearer header',()=>{
 const secret='x'.repeat(32),request=value=>new Request('https://example.com',{headers:{authorization:value}});
 assert.equal(collectorAuthorized(request(`Bearer ${secret}`),secret),true);
 for(const value of ['',secret,`Bearer ${secret}x`,`bearer ${secret}`]) assert.equal(collectorAuthorized(request(value),secret),false);
 assert.equal(collectorAuthorized(request('Bearer short'),'short'),false);
});
