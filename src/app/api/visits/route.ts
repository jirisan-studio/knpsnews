import {randomUUID} from 'node:crypto';
import {NextRequest,NextResponse} from 'next/server';
import {createSupabaseCollector} from '@/lib/supabase/admin';
export const runtime='nodejs';
export async function POST(request:NextRequest) {
 const origin=request.headers.get('origin');
 if(!origin || origin!==request.nextUrl.origin) return NextResponse.json({error:'요청 출처를 확인해 주세요.'},{status:403});
 const existing=request.cookies.get('knps_visitor')?.value;
 const visitor=existing && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(existing)?existing:randomUUID();
 try {
  const result=await createSupabaseCollector().rpc('record_site_visit',{visitor_token:visitor});
  if(result.error || !result.data) throw new Error();
  const response=NextResponse.json(result.data,{headers:{'Cache-Control':'no-store'}});
  if(visitor!==existing) response.cookies.set('knps_visitor',visitor,{httpOnly:true,secure:request.nextUrl.protocol==='https:',sameSite:'lax',path:'/',maxAge:31536000});
  return response;
 } catch {return NextResponse.json({error:'방문 집계를 불러오지 못했습니다.'},{status:503});}
}
