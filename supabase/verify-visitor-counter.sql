-- Atomic duplicate/concurrent insert protection: retain no verification visits.
begin;
do $$
declare token uuid := gen_random_uuid(); first_count jsonb; second_count jsonb;
begin
 first_count := public.record_site_visit(token);
 second_count := public.record_site_visit(token);
 if first_count is distinct from second_count then raise exception 'Duplicate visitor incremented totals'; end if;
 if (select count(*) from public.site_visit_tokens where visitor_token=token) <> 1 then raise exception 'Duplicate token rows'; end if;
end;
$$;
rollback;
