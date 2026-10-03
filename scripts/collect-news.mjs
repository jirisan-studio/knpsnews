import nextEnv from '@next/env';
import {collectNews} from '../src/lib/news/collector.ts';
nextEnv.loadEnvConfig(process.cwd());
try {
 const smoke=process.argv.includes('--smoke'),initial=process.argv.includes('--initial');
 const result=await collectNews({kind:initial?'initial':smoke?'manual':'incremental',budgetMs:initial?1500000:240000,...(smoke?{keywordLimit:2,display:3,maxPages:1}:{})});
 console.log(JSON.stringify(result));
 if(result.busy || result.status==='failed' || (!smoke && result.status==='partial')) process.exitCode=1;
} catch {console.error('뉴스 수집 실패. 비공개 DB 로그와 서버 설정을 확인해 주세요. 인증정보는 출력하지 않았습니다.');process.exitCode=1;}
