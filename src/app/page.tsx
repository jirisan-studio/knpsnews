import { connection } from "next/server";
import { getLatestNews } from "@/lib/news/read";
import Link from 'next/link';
import {parseFilters,queryHref} from '@/lib/news/filters';
import {DateFilters} from '@/components/date-filters';
import {AreaFilter} from '@/components/area-filter';
import {getAreas} from '@/lib/news/dictionary';
import {createSupabaseReader} from '@/lib/supabase/server';
import type {NewsArea} from '@/lib/news/classify';
import {KeywordSearch} from '@/components/keyword-search';
import {VisitorCounter} from '@/components/visitor-counter';

const publishedDate = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false,
});

export default async function Home({searchParams}: {searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  await connection();
  const params = await searchParams;
  let filters:ReturnType<typeof parseFilters> | undefined;
  let filterError='';
  try {filters=parseFilters(params);} catch(error) {filterError=error instanceof Error?error.message:'검색 조건을 확인해 주세요.';}
  const page=filters?.page ?? 1;
  let articles: Awaited<ReturnType<typeof getLatestNews>>['articles'] = [];
  let count = 0;
  let areas:NewsArea[]=[];
  let readFailed = false;
  try {
    areas=await getAreas(createSupabaseReader());
    if(filters?.area && !areas.some(area=>area.id===filters?.area)) {filterError='현재 사용할 수 없는 관심영역입니다.';filters=undefined;}
    if(filters) ({articles,count} = await getLatestNews(filters,areas));
  } catch {
    readFailed = true;
  }
  return (
    <div className="min-h-dvh">
      <header className="border-b border-brand/10 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-5 py-5">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- The requested logo action must reload the home document, including when already at home. */}
          <a href="/" aria-label="KNPS NEWS 홈으로 이동" className="flex items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand">
          <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white">
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
              <path d="m3 19 7-13 4 7 2-4 5 10H3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            </svg>
          </span>
          <div>
            <p className="text-lg font-bold tracking-wide text-brand">KNPS NEWS</p>
            <p className="text-xs text-slate-600">국립공원 뉴스 아카이브</p>
          </div>
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-6 sm:py-10">
        <p className="mb-3 text-sm font-semibold text-brand">국립공원 소식을 한곳에</p>
        <h1 className="max-w-lg text-base font-bold leading-7 text-slate-800">
          날짜와 뉴스 관심영역, 키워드로 국립공원 관련 언론보도를 찾아보는 공간입니다.
        </h1>

        <KeywordSearch params={params} />
        <DateFilters params={params} filters={filters} />
        <AreaFilter params={params} areas={areas} />
        <section aria-labelledby="setup-title" className="mt-5 rounded-2xl border border-brand/10 bg-white p-6 sm:p-8">
          <h2 id="setup-title" className="text-xl font-bold">{filters?.label || '검색 결과'} · {count}건</h2>
          {filters?.area && <p className="mt-2 text-sm font-semibold text-brand">{areas.find(area=>area.id===filters.area)?.name}</p>}
          {filters?.q && <p className="mt-2 text-sm text-slate-600">검색어: {filters.q}</p>}
          <Link href="/" prefetch={false} className="mt-3 inline-flex min-h-11 items-center text-sm text-brand underline underline-offset-4">검색 조건 초기화</Link>
          {filterError && <p role="alert" className="mt-3 text-sm text-red-700">{filterError}</p>}
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {readFailed
              ? "뉴스를 불러오지 못했습니다. 잠시 후 다시 접속해 주세요."
              : articles.length
                ? "최신 발행순으로 표시합니다. 요약은 NAVER 뉴스 검색에서 제공한 내용입니다."
                : "표시할 뉴스가 없습니다."}
          </p>
          <p className="mt-5 border-t border-slate-100 pt-5 text-sm leading-6 text-slate-600">
            초기 수집 기준일은 <time dateTime="2026-09-01" className="font-semibold text-brand">2026년 9월 1일</time>입니다.
            과거 기사 제공 범위는 뉴스 API에서 확인 가능한 검색결과에 따라 달라집니다.
          </p>
        </section>

        {articles.length > 0 && (
          <section aria-label="뉴스 목록" className="mt-5 space-y-4">
            {articles.map((article) => (
              <article key={article.id} className="rounded-2xl border border-brand/10 bg-white p-6 sm:p-8">
                <div className="flex flex-wrap gap-2">
                  {article.is_test && <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">테스트 데이터</span>}
                  {article.areas.map((area) => <span key={area.id} className="rounded-full bg-brand/5 px-3 py-1 text-xs text-brand">{area.name}</span>)}
                </div>
                <h2 className="mt-4 text-lg font-bold leading-7">{article.title}</h2>
                <p className="mt-3 text-xs leading-5 text-slate-500">
                  {article.media_name} · <time dateTime={article.published_at}>{publishedDate.format(new Date(article.published_at))}</time>
                </p>
                <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600 sm:line-clamp-none">{article.summary}</p>
                <p className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">{article.collection_keywords.map((keyword:string) => <span key={keyword}>#{keyword}</span>)}</p>
                <a href={article.original_url} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-11 items-center rounded-lg border border-brand/20 px-4 text-sm font-semibold text-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand">
                  {article.is_test ? "공식 사이트 (테스트 링크)" : "원문 보기"}
                  <span className="sr-only"> · 새 창에서 열기</span>
                </a>
              </article>
            ))}
          </section>
        )}
        {!readFailed && count > 0 && <nav aria-label="뉴스 페이지" className="mt-6 flex min-h-11 items-center justify-between text-sm text-brand">
          {page > 1 ? <Link href={queryHref(params,{page:String(page-1)})} prefetch={false} className="rounded-lg border border-brand/20 px-4 py-3">이전</Link> : <span />}
          <span>{page} / {Math.ceil(count/20)} 페이지</span>
          {page * 20 < count ? <Link href={queryHref(params,{page:String(page+1)})} prefetch={false} className="rounded-lg border border-brand/20 px-4 py-3">다음</Link> : <span />}
        </nav>}
      </main>

      <footer className="mx-auto max-w-3xl px-5 pb-8 text-xs leading-5 text-slate-500">
        <p>국립공원공단 직원을 위한 뉴스 아카이브 · KNPS NEWS / 기획·제작: 이태건 | 개발 지원: ChatGPT</p>
        <VisitorCounter />
      </footer>
    </div>
  );
}
