begin;
create table public.site_visit_days (
 day date primary key,
 visitors bigint not null default 0 check (visitors >= 0)
);
create table public.site_visit_tokens (
 day date not null,
 visitor_token uuid not null,
 primary key(day,visitor_token)
);
alter table public.site_visit_days enable row level security;
alter table public.site_visit_tokens enable row level security;
revoke all on public.site_visit_days,public.site_visit_tokens from anon,authenticated;
grant all on public.site_visit_days,public.site_visit_tokens to service_role;
create function public.record_site_visit(visitor_token uuid) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare
 visit_day date := (now() at time zone 'Asia/Seoul')::date;
 inserted_count integer;
 today_count bigint;
 total_count bigint;
begin
 if visitor_token is null then raise exception 'Visitor token required'; end if;
 insert into public.site_visit_tokens(day,visitor_token) values(visit_day,visitor_token) on conflict do nothing;
 get diagnostics inserted_count = row_count;
 if inserted_count > 0 then
  insert into public.site_visit_days(day,visitors) values(visit_day,1)
  on conflict(day) do update set visitors=public.site_visit_days.visitors+1;
 end if;
 select coalesce(visitors,0) into today_count from public.site_visit_days where day=visit_day;
 select coalesce(sum(visitors),0) into total_count from public.site_visit_days;
 return jsonb_build_object('today',coalesce(today_count,0),'total',total_count);
end;
$$;
revoke all on function public.record_site_visit(uuid) from public;
grant execute on function public.record_site_visit(uuid) to service_role;
select pg_notify('pgrst','reload schema');
commit;
