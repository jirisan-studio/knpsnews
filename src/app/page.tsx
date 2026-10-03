export default function Home() {
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
          <h2 id="setup-title" className="mt-5 text-xl font-bold">뉴스 아카이브를 준비하고 있습니다</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            아직 뉴스 데이터가 연결되지 않았습니다. 연결 후 저장된 기사 목록과 검색 기능을 제공할 예정입니다.
          </p>
          <p className="mt-5 border-t border-slate-100 pt-5 text-sm leading-6 text-slate-600">
            초기 수집 기준일은 <time dateTime="2026-09-01" className="font-semibold text-brand">2026년 9월 1일</time>입니다.
            과거 기사 제공 범위는 뉴스 API에서 확인 가능한 검색결과에 따라 달라집니다.
          </p>
        </section>
      </main>

      <footer className="mx-auto max-w-3xl px-5 pb-8 text-xs leading-5 text-slate-500">
        국립공원공단 직원을 위한 뉴스 아카이브 · KNPS NEWS
      </footer>
    </div>
  );
}
