-- Explicit STEP 8 fixture; not a real news article. Safe to re-run.
begin;
insert into public.news_areas (id, name, type, parent_id, sort_order, aliases) values
  ('10000000-0000-4000-8000-000000000001', '지리산', 'park', null, 10, array['노고단', '천왕봉', '중산리', '뱀사골']),
  ('10000000-0000-4000-8000-000000000002', '야생생물보전원', 'institute', null, 100, array['반달가슴곰'])
on conflict (id) do nothing;
insert into public.news_areas (id, name, type, parent_id, sort_order, aliases) values
  ('10000000-0000-4000-8000-000000000003', '지리산경남', 'park', '10000000-0000-4000-8000-000000000001', 11, '{}')
on conflict (id) do nothing;

insert into public.articles (
  id, title, summary, media_name, original_url, canonical_url, published_at, source_type, is_test
) values (
  '20000000-0000-4000-8000-000000000001',
  '[테스트] 지리산 반달가슴곰 관련 뉴스 연결 확인',
  '실제 언론보도가 아닙니다. Supabase에 저장한 제목, 요약, 발행일과 여러 뉴스 관심영역이 화면에 표시되는지 확인하는 테스트 데이터입니다.',
  '연결 확인용 테스트 데이터',
  'https://www.knps.or.kr/',
  'https://www.knps.or.kr/?knpsnews-test=jirisan-20260915',
  '2026-09-15T09:00:00+09:00',
  'manual', true
) on conflict (id) do nothing;

insert into public.article_news_areas (article_id, news_area_id) values
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001'),
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002'),
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000003')
on conflict do nothing;
commit;
