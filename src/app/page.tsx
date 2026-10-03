import { connection } from "next/server";
import { getLatestNews } from "@/lib/news/read";

const publishedDate = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false,
});

export default async function Home() {
  await connection();
  let articles: Awaited<ReturnType<typeof getLatestNews>> = [];
  let readFailed = false;
  try {
    articles = await getLatestNews();
  } catch {
    readFailed = true;
  }
  return (
    <div className="min-h-dvh">
      <header className="border-b border-brand/10 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-5 py-5">
          <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white">
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
              <path d="m3 19 7-13 4 7 2-4 5 10H3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            </svg>
          </span>
          <div>
            <p className="text-lg font-bold tracking-wide text-brand">KNPS NEWS</p>
            <p className="text-xs text-slate-600">국립공원 뉴스 아카이브</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-10 sm:py-16">
        <p className="mb-3 text-sm font-semibold text-brand">국립공원 소식을 한곳에</p>
        <h1 className="text-3xl font-bold leading-snug tracking-tight sm:text-4xl">
          업무에 필요한 뉴스,<br />쉽고 빠르게 확인하세요.
        </h1>
        <p className="mt-5 max-w-lg text-base leading-7 text-slate-600">
          날짜와 뉴스 관심영역, 키워드로 국립공원 관련 언론보도를 찾아보는 공간입니다.
        </p>

        <section aria-labelledby="setup-title" className="mt-9 rounded-2xl border border-brand/10 bg-white p-6 sm:p-8">
          <span className="rounded-full bg-brand/5 px-3 py-1 text-xs font-semibold text-brand">서비스 구축 중</span>
          <h2 id="setup-title" className="mt-5 text-xl font-bold">저장된 뉴스</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {readFailed
              ? "뉴스를 불러오지 못했습니다. 잠시 후 다시 접속해 주세요."
              : articles.length
                ? "DB 연결을 확인하고 있습니다. 테스트 표시는 실제 언론보도가 아닙니다."
                : "아직 저장된 뉴스가 없습니다. 뉴스 수집 연결을 준비하고 있습니다."}
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
                <p className="mt-4 text-sm leading-6 text-slate-600">{article.summary}</p>
                <a href={article.original_url} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-11 items-center rounded-lg border border-brand/20 px-4 text-sm font-semibold text-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand">
                  {article.is_test ? "공식 사이트 (테스트 링크)" : "원문 보기"}
                  <span className="sr-only"> · 새 창에서 열기</span>
                </a>
              </article>
            ))}
          </section>
        )}
      </main>

      <footer className="mx-auto max-w-3xl px-5 pb-8 text-xs leading-5 text-slate-500">
        국립공원공단 직원을 위한 뉴스 아카이브 · KNPS NEWS
      </footer>
    </div>
  );
}
