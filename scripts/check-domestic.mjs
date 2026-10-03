import nextEnv from '@next/env';
import {createClient} from '@supabase/supabase-js';
import assert from 'node:assert/strict';
import {isDomesticParkNews} from '../src/lib/news/domestic.ts';
nextEnv.loadEnvConfig(process.cwd());
try {
 const client=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false}});
 let checked=0,excluded=0;
 for(let offset=0;;offset+=500) {
  const {data,error}=await client.from('articles').select('title,summary,is_domestic').eq('is_test',false).order('id').range(offset,offset+499);
  if(error) throw new Error();
  for(const row of data) {assert.equal(row.is_domestic,isDomesticParkNews(row));checked++;if(!row.is_domestic) excluded++;}
  if(data.length<500) break;
 }
 const foreign=await client.rpc('search_news',{search_text:'하와이'}).eq('is_domestic',true);
 if(foreign.error) throw new Error();
 assert.ok(foreign.data.every(row=>isDomesticParkNews(row)));
 const oldest=await client.from('articles').select('published_at').eq('is_test',false).eq('is_domestic',true).order('published_at').limit(1);
 if(oldest.error) throw new Error();
 console.log(JSON.stringify({checked,excluded,visible:checked-excluded,earliestDomestic:oldest.data[0]?.published_at}));
} catch {console.error('Domestic article filtering verification failed. No credentials printed.');process.exitCode=1;}
