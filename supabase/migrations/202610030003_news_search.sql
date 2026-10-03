begin;
create extension if not exists pg_trgm with schema extensions;
create index articles_title_trgm_idx on public.articles using gin(title extensions.gin_trgm_ops);
create index articles_summary_trgm_idx on public.articles using gin(summary extensions.gin_trgm_ops);
create function public.search_news(search_text text)
returns setof public.articles
language sql stable security invoker set search_path = '' as $$
  select a.* from public.articles a
  where not a.is_test and a.published_at >= '2026-09-01T00:00:00+09:00'::timestamptz
  and length(btrim(search_text)) between 1 and 100
  and (a.title ilike ('%' || replace(replace(replace(btrim(search_text), '\', '\\'), '%', '\%'), '_', '\_') || '%') escape '\'
    or a.summary ilike ('%' || replace(replace(replace(btrim(search_text), '\', '\\'), '%', '\%'), '_', '\_') || '%') escape '\');
$$;
revoke all on function public.search_news(text) from public;
grant execute on function public.search_news(text) to anon, authenticated, service_role;
select pg_notify('pgrst','reload schema');
commit;
