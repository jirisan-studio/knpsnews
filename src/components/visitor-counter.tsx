'use client';
import {useEffect,useState} from 'react';
type Counts={today:number;total:number};
let pending:Promise<Counts>|undefined;
export function VisitorCounter() {
 const [counts,setCounts]=useState<Counts|null>(null);
 const [failed,setFailed]=useState(false);
 useEffect(()=>{
  let active=true;
  pending ??= fetch('/api/visits',{method:'POST',credentials:'same-origin',cache:'no-store'})
   .then(async response=>{if(!response.ok) throw new Error();return response.json() as Promise<Counts>;});
  pending.then(data=>{if(active) setCounts(data);}).catch(()=>{pending=undefined;if(active) setFailed(true);});
  return ()=>{active=false;};
 },[]);
 return <p className="mt-3" aria-live="polite">방문자 · {counts?`오늘 ${counts.today.toLocaleString('ko-KR')}명 / 누적 ${counts.total.toLocaleString('ko-KR')}명`:failed?'집계 정보를 불러오지 못했습니다.':'집계 중…'}<span className="block text-slate-400">같은 브라우저는 하루 1회 집계합니다.</span></p>;
}
