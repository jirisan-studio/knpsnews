begin;
create function public.search_news_filtered(search_text text, date_from timestamptz, date_until timestamptz, area_ids uuid[])
returns setof public.articles language sql stable security invoker set search_path = '' as $$
  select a.* from public.search_news(search_text) a
  where a.published_at >= date_from and (date_until is null or a.published_at < date_until)
    and (area_ids is null or exists (
      select 1 from public.article_news_areas link join public.news_areas area on area.id=link.news_area_id
      where link.article_id=a.id and area.active and link.news_area_id=any(area_ids)
    ));
$$;
revoke all on function public.search_news_filtered(text,timestamptz,timestamptz,uuid[]) from public;
grant execute on function public.search_news_filtered(text,timestamptz,timestamptz,uuid[]) to anon, authenticated, service_role;
select pg_notify('pgrst','reload schema');
commit;
