import {collectorAuthorized} from '@/lib/news/authorize';
import {collectNews} from '@/lib/news/collector';
export const runtime='nodejs';
export const maxDuration=300;
export async function GET(request:Request) {
 if(!collectorAuthorized(request)) return Response.json({error:'인증이 필요합니다.'},{status:401,headers:{'Cache-Control':'no-store'}});
 try {const result=await collectNews();return Response.json(result,{status:result.busy?409:result.status==='success'?200:207,headers:{'Cache-Control':'no-store'}});}
 catch {return Response.json({error:'수집 실패. 비공개 수집 기록을 확인해 주세요.'},{status:500});}
}
