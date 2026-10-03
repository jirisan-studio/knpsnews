begin;
create function public.ingest_news_article(payload jsonb)
returns table(article_id uuid, inserted boolean)
language plpgsql security invoker set search_path = '' as $$
declare
  stored_id uuid;
  was_inserted boolean;
begin
  insert into public.articles (
    title, summary, media_name, original_url, canonical_url, naver_url,
    published_at, source_type, is_test, collection_keywords
  ) values (
    payload->>'title', payload->>'summary', payload->>'media_name',
    payload->>'original_url', payload->>'canonical_url', payload->>'naver_url',
    (payload->>'published_at')::timestamptz, 'online', false,
    array(select jsonb_array_elements_text(payload->'collection_keywords'))
  ) on conflict (canonical_url) do nothing returning id into stored_id;
  was_inserted := found;

  if not was_inserted then
    update public.articles a set collection_keywords = array(
      select distinct value from unnest(a.collection_keywords || array(
        select jsonb_array_elements_text(payload->'collection_keywords')
      )) as value order by value
    ) where a.canonical_url = payload->>'canonical_url'
      returning a.id into stored_id;
  end if;
  if stored_id is null then raise exception 'Article ingestion failed'; end if;
  return query select stored_id, was_inserted;
end;
$$;
revoke all on function public.ingest_news_article(jsonb) from public, anon, authenticated;
grant execute on function public.ingest_news_article(jsonb) to service_role;
select pg_notify('pgrst', 'reload schema');
commit;
