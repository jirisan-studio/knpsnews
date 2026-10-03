import Link from 'next/link';
import {parseFilters,queryHref,type SearchParams} from '@/lib/news/filters';

export function DateFilters({params,filters}:{params:SearchParams;filters?:ReturnType<typeof parseFilters>}) {
 return <section aria-label="날짜 검색" className="mt-6 rounded-2xl border border-brand/10 bg-white p-5">
  <nav aria-label="빠른 날짜" className="flex flex-wrap gap-2">
   {[['today','오늘'],['yesterday','어제'],['week','최근 7일'],['month','이번 달'],['all','전체 기간']].map(([value,label])=><Link key={value} href={queryHref(params,{period:value,date:undefined,from:undefined,to:undefined,page:undefined})} prefetch={false} aria-current={filters?.period===value?'page':undefined} className={`min-h-11 rounded-lg px-3 py-3 text-sm ${filters?.period===value?'bg-brand text-white':'bg-brand/5 text-brand'}`}>{label}</Link>)}
  </nav>
  <details className="mt-4">
   <summary className="cursor-pointer py-3 text-sm font-semibold text-brand">달력 · 특정 날짜 / 날짜 범위</summary>
   <form action="/" className="mt-3 flex flex-wrap items-end gap-3">
    <input type="hidden" name="period" value="date" />
    <label className="flex min-w-0 flex-1 flex-col gap-2 text-sm">특정 날짜<input type="date" name="date" required min="2026-09-01" defaultValue={filters?.period==='date'?filters.from:undefined} className="min-h-11 min-w-0 rounded-lg border border-slate-300 px-3" /></label>
    <button className="min-h-11 rounded-lg bg-brand px-4 text-sm text-white">날짜 조회</button>
   </form>
   <form action="/" className="mt-4 grid grid-cols-2 gap-3">
    <input type="hidden" name="period" value="custom" />
    <label className="flex min-w-0 flex-col gap-2 text-sm">시작일<input type="date" name="from" min="2026-09-01" defaultValue={filters?.period==='custom'?filters.from:'2026-09-01'} className="min-h-11 min-w-0 rounded-lg border border-slate-300 px-2" /></label>
    <label className="flex min-w-0 flex-col gap-2 text-sm">종료일<input type="date" name="to" min="2026-09-01" defaultValue={filters?.period==='custom'?filters.to:undefined} className="min-h-11 min-w-0 rounded-lg border border-slate-300 px-2" /></label>
    <button className="col-span-2 min-h-11 rounded-lg bg-brand px-4 text-sm text-white">범위 조회</button>
   </form>
  </details>
 </section>;
}
