-- Run once in the existing knpsnews project. Atomic, no existing tables replaced.
begin;

create table public.news_areas (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (length(trim(name)) > 0),
  type text not null check (type in ('park', 'institute', 'eco_center', 'other')),
  parent_id uuid references public.news_areas(id),
  active boolean not null default true,
  sort_order integer not null default 0,
  aliases text[] not null default '{}',
  check (parent_id is distinct from id)
);

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) > 0),
  summary text not null default '',
  media_name text not null,
  original_url text not null check (original_url ~ '^https?://'),
  canonical_url text not null unique check (canonical_url ~ '^https?://'),
  naver_url text check (naver_url is null or naver_url ~ '^https?://'),
  published_at timestamptz not null,
  collected_at timestamptz not null default now(),
  source_type text not null default 'online' check (source_type in ('online', 'archive_pdf', 'manual')),
  collection_keywords text[] not null default '{}',
  is_test boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.article_news_areas (
  article_id uuid not null references public.articles(id) on delete cascade,
  news_area_id uuid not null references public.news_areas(id),
  primary key (article_id, news_area_id)
);

create table public.collection_keywords (
  id uuid primary key default gen_random_uuid(),
  keyword text not null check (length(trim(keyword)) > 0),
  news_area_id uuid references public.news_areas(id),
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);
create unique index collection_keyword_global_unique on public.collection_keywords(keyword) where news_area_id is null;
create unique index collection_keyword_area_unique on public.collection_keywords(keyword, news_area_id) where news_area_id is not null;

create table public.collection_logs (
  id uuid primary key default gen_random_uuid(),
  job_kind text not null check (job_kind in ('initial', 'incremental', 'manual')),
  status text not null check (status in ('running', 'success', 'partial', 'failed')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  fetched_count integer not null default 0 check (fetched_count >= 0),
  saved_count integer not null default 0 check (saved_count >= 0),
  failed_keywords text[] not null default '{}',
  error_summary text,
  requested_from date,
  requested_to date,
  history_incomplete boolean not null default false,
  check (requested_to is null or requested_from is null or requested_to >= requested_from)
);

create index articles_published_at_idx on public.articles(published_at desc, id desc);
create index articles_collected_at_idx on public.articles(collected_at desc);
create index news_areas_parent_idx on public.news_areas(parent_id);
create index article_news_areas_area_idx on public.article_news_areas(news_area_id, article_id);
create index collection_keywords_enabled_idx on public.collection_keywords(enabled) where enabled;
create index collection_logs_started_idx on public.collection_logs(started_at desc);

alter table public.news_areas enable row level security;
alter table public.articles enable row level security;
alter table public.article_news_areas enable row level security;
alter table public.collection_keywords enable row level security;
alter table public.collection_logs enable row level security;

revoke all on public.news_areas, public.articles, public.article_news_areas,
  public.collection_keywords, public.collection_logs from anon, authenticated;
grant usage on schema public to anon, authenticated, service_role;
grant select on public.news_areas, public.articles, public.article_news_areas to anon, authenticated;
grant all on public.news_areas, public.articles, public.article_news_areas,
  public.collection_keywords, public.collection_logs to service_role;

create policy "read_active_news_areas" on public.news_areas
  for select to anon, authenticated using (active);
create policy "read_articles" on public.articles
  for select to anon, authenticated using (true);
create policy "read_article_areas" on public.article_news_areas
  for select to anon, authenticated using (
    exists (select 1 from public.news_areas where id = news_area_id and active)
  );
-- No browser write grants or write policies. Keywords/logs are server-only.

comment on column public.news_areas.aliases is 'Data-managed deterministic place/institution dictionary';
comment on column public.articles.summary is 'Only NAVER API description; never full article text';
comment on column public.articles.canonical_url is 'Normalized URL used as database deduplication key';
comment on column public.articles.is_test is 'Explicitly labeled connection fixtures, excluded from operational news';
comment on column public.collection_logs.error_summary is 'Sanitized summary only; never API keys, headers or raw responses';

select pg_notify('pgrst', 'reload schema');
commit;
