import {normalizeNews} from './normalize.ts';
import type {NaverNewsPage} from '../naver/client.ts';

export async function collectKeyword(options:{
 keyword:string;from:string;until:string;display?:number;maxPages?:number;deadline:number;
 search:(request:{query:string;display:number;start:number})=>Promise<NaverNewsPage>;
 save:(articles:ReturnType<typeof normalizeNews>[])=>Promise<number>;
}) {
 const display=options.display ?? 100, maxPages=options.maxPages ?? 10;
 let fetched=0,saved=0,skipped=0,incomplete=false,failed=false,budgetLimited=false;
 for(let page=0;page<maxPages;page++) {
  if(Date.now()>options.deadline) {incomplete=true;budgetLimited=true;break;}
  const start=page*display+1;
  if(start+display-1>1000) {incomplete=true;break;}
  let result:NaverNewsPage;
  try {result=await options.search({query:options.keyword,display,start});} catch {failed=true;break;}
  fetched+=result.items.length;
  const batch:ReturnType<typeof normalizeNews>[]=[];
  let reachedBoundary=false;
  for(const item of result.items) {
   const time=Date.parse(item.pubDate);
   if(!Number.isNaN(time) && time<Date.parse(options.from)) {reachedBoundary=true;continue;}
   if(!Number.isNaN(time) && time>=Date.parse(options.until)) continue;
   try {batch.push(normalizeNews(item,options.keyword));} catch {skipped++;}
  }
  if(batch.length) {try {saved+=await options.save(batch);} catch {failed=true;break;}}
  if(reachedBoundary || result.items.length<display || start+result.items.length>result.total) break;
  if(page===maxPages-1 || start+display>1000) incomplete=true;
 }
 return {fetched,saved,skipped,incomplete,failed,budgetLimited};
}
