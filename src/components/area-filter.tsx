import {scalar,type SearchParams} from '@/lib/news/filters';
import type {NewsArea} from '@/lib/news/classify';
export function AreaFilter({params,areas}:{params:SearchParams;areas:NewsArea[]}) {
 return <form action="/" className="mt-4 flex flex-wrap items-end gap-3 rounded-2xl border border-brand/10 bg-white p-5">
  {['period','date','from','to','q'].map(key=><input key={key} type="hidden" name={key} value={scalar(params,key)} />)}
  <label className="flex min-w-0 flex-1 flex-col gap-2 text-sm font-semibold">뉴스 관심영역
   <select key={scalar(params,'area')} name="area" defaultValue={scalar(params,'area')} className="min-h-11 min-w-0 rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal">
    <option value="">전체 관심영역</option>
    {[['park','국립공원'],['institute','전문기관'],['eco_center','생태탐방원'],['other','기타']].map(([type,label])=><optgroup key={type} label={label}>{areas.filter(area=>!area.parent_id && area.type===type).map(area=><option key={area.id} value={area.id}>{area.name}</option>)}</optgroup>)}
   </select>
  </label>
  <button className="min-h-11 rounded-lg bg-brand px-4 text-sm text-white">관심영역 적용</button>
 </form>;
}
