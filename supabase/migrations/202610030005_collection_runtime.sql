begin;
alter table public.collection_keywords add column last_collected_at timestamptz;
-- One active collector lease across all runtimes. A crashed worker expires after 30 min.
create table public.collection_lock (
 id boolean primary key default true check(id), owner uuid, expires_at timestamptz not null default now()
);
insert into public.collection_lock(id) values(true);
alter table public.collection_lock enable row level security;
revoke all on public.collection_lock from anon,authenticated;
grant all on public.collection_lock to service_role;
create function public.acquire_collection_lock(worker uuid) returns boolean
language plpgsql security invoker set search_path='' as $$
begin
 update public.collection_lock set owner=worker,expires_at=now()+interval '30 minutes' where id and expires_at<now();
 return found;
end;
$$;
create function public.release_collection_lock(worker uuid) returns void
language sql security invoker set search_path='' as $$
 update public.collection_lock set owner=null,expires_at=now() where id and owner=worker;
$$;
create function public.ingest_news_batch(payloads jsonb)
returns table(article_id uuid,canonical_url text,inserted boolean)
language plpgsql security invoker set search_path='' as $$
declare payload jsonb;
begin
 if jsonb_array_length(payloads)>100 then raise exception 'Batch limit exceeded';end if;
 for payload in select value from jsonb_array_elements(payloads) loop
  return query select r.article_id,payload->>'canonical_url',r.inserted from public.ingest_news_article(payload) r;
 end loop;
end;
$$;
revoke all on function public.acquire_collection_lock(uuid),public.release_collection_lock(uuid),public.ingest_news_batch(jsonb) from public,anon,authenticated;
grant execute on function public.acquire_collection_lock(uuid),public.release_collection_lock(uuid),public.ingest_news_batch(jsonb) to service_role;
select pg_notify('pgrst','reload schema');
commit;
