import {scalar,type SearchParams} from '@/lib/news/filters';
export function KeywordSearch({params}:{params:SearchParams}) {
 return <form action="/" role="search" className="mt-6 flex gap-2">
  {['period','date','from','to','area'].map(key=><input key={key} type="hidden" name={key} value={scalar(params,key)} />)}
  <label htmlFor="news-keyword" className="sr-only">뉴스 키워드</label>
  <input id="news-keyword" type="search" name="q" maxLength={100} defaultValue={scalar(params,'q')} placeholder="제목·요약 검색 (예: 반달가슴곰)" className="min-h-12 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 text-sm" />
  <button className="min-h-12 rounded-xl bg-brand px-5 text-sm font-semibold text-white">검색</button>
 </form>;
}
