import nextEnv from '@next/env';
nextEnv.loadEnvConfig(process.cwd());
try {
 const secret=process.env.CRON_SECRET;
 if(!secret || secret.length<32) throw new Error('로컬 수집 인증값은 32자 이상이어야 합니다.');
 const collect=process.argv.includes('--collect');
 const path=collect?'/api/collect':'/api/collection-status';
 const response=await fetch(`https://knpsnews.vercel.app${path}`,{
  headers:{authorization:`Bearer ${secret}`},redirect:'error',signal:AbortSignal.timeout(collect?295000:15000),
 });
 console.log(`Production ${collect?'collection':'private status'}: HTTP ${response.status}`);
 if(!response.ok) throw new Error(response.status===401?'로컬과 Vercel 수집 인증값 일치 여부를 확인해 주세요.':'운영 서버 설정과 비공개 수집 로그를 확인해 주세요.');
 const data=await response.json();
 if(collect) console.log(JSON.stringify({status:data.status,fetched:data.fetched,saved:data.saved,incomplete:data.incomplete,failedKeywords:data.failedKeywords}));
 else console.log(JSON.stringify({todayCollected:data.todayCollected,enabledKeywords:data.keywords?.filter(row=>row.enabled).length,lastCollection:data.logs?.[0]?.status}));
 if(collect && data.status==='failed') process.exitCode=1;
} catch(error) {console.error(error instanceof Error && !error.message.includes('fetch')?error.message:'운영 연결 검증 실패. 인증정보는 출력하지 않았습니다.');process.exitCode=1;}
