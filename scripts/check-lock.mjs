import nextEnv from '@next/env';
import {randomUUID} from 'node:crypto';
import {createSupabaseCollector} from '../src/lib/supabase/admin.ts';
nextEnv.loadEnvConfig(process.cwd());
const client=createSupabaseCollector(),worker=randomUUID(),other=randomUUID();
try {
 const acquired=await client.rpc('acquire_collection_lock',{worker});
 if(acquired.error || !acquired.data) throw new Error('수집 잠금 획득 실패');
 const denied=await client.rpc('acquire_collection_lock',{worker:other});
 await client.rpc('release_collection_lock',{worker:other});
 const stillDenied=await client.rpc('acquire_collection_lock',{worker:other});
 if(denied.error || denied.data || stillDenied.error || stillDenied.data) throw new Error('중복 수집 차단 실패');
 console.log('Concurrent collector rejected; wrong owner cannot release the lease.');
} catch(error) {console.error(error instanceof Error?error.message:'Lock verification failed');process.exitCode=1;}
finally {await client.rpc('release_collection_lock',{worker});}
