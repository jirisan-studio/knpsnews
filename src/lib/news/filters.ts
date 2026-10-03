export type SearchParams = Record<string,string|string[]|undefined>;
export const scalar = (params:SearchParams,key:string) => typeof params[key] === 'string' ? params[key] as string : '';
export const shiftDate = (date:string,days:number) => new Date(Date.parse(`${date}T00:00:00Z`)+days*86400000).toISOString().slice(0,10);
export const koreanToday = (now=new Date()) => new Date(now.getTime()+9*3600000).toISOString().slice(0,10);
function validDate(value:string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;
}
export function parseFilters(params:SearchParams,now=new Date()) {
  const today=koreanToday(now), period=scalar(params,'period') || 'today';
  let from='',to='',label='전체 기간';
  if(period==='today') {from=to=today;label='오늘';}
  else if(period==='yesterday') {from=to=shiftDate(today,-1);label='어제';}
  else if(period==='week') {from=shiftDate(today,-6);to=today;label='최근 7일';}
  else if(period==='month') {from=today.slice(0,8)+'01';to=today;label='이번 달';}
  else if(period==='date') {from=to=scalar(params,'date');label=from;}
  else if(period==='custom') {from=scalar(params,'from');to=scalar(params,'to');label=`${from || '2026-09-01'} ~ ${to || '전체'}`;}
  else if(period!=='all') throw new Error('날짜 조건을 확인해 주세요.');
  if((from && !validDate(from)) || (to && !validDate(to)) || (period==='date' && !from)) throw new Error('올바른 날짜를 선택해 주세요.');
  if((from && from < '2026-09-01') || (to && to < '2026-09-01')) throw new Error('2026년 9월 1일 이후 날짜를 선택해 주세요.');
  if(from && to && from > to) throw new Error('시작일은 종료일보다 늦을 수 없습니다.');
  const rawPage=scalar(params,'page');
  const area=scalar(params,'area');
  const q=scalar(params,'q').trim().normalize('NFKC');
  if(q.length>100) throw new Error('검색어는 100자 이내로 입력해 주세요.');
  if(area && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(area)) throw new Error('관심영역을 다시 선택해 주세요.');
  return {period,from:from || '2026-09-01',to,label,area,q,page:/^[1-9]\d{0,5}$/.test(rawPage)?Number(rawPage):1};
}
export function queryHref(params:SearchParams,changes:Record<string,string|undefined>) {
  const query=new URLSearchParams();
  for(const key of ['period','date','from','to','area','q','page']) {
    const value=Object.hasOwn(changes,key)?changes[key]:scalar(params,key);
    if(value) query.set(key,value);
  }
  return `/?${query}`;
}
