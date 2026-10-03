begin;
create function public.is_domestic_park_news(title text, summary text) returns boolean
language sql immutable security invoker set search_path = '' as $$
 select not ((coalesce(title,'') || ' ' || coalesce(summary,'')) ~* '해외|외국|미국|하와이|옐로스톤|요세미티|그랜드[ ]*캐니언|세쿼이아|브라이스|자이언|캐나다|밴프|재스퍼|영국|프랑스|독일|스페인|이탈리아|스위스|노르웨이|아이슬란드|유럽|일본|후지산|중국|장가계|태국|베트남|인도네시아|말레이시아|필리핀|캄보디아|라오스|네팔|히말라야|호주|오스트레일리아|뉴질랜드|아프리카|케냐|탄자니아|세렝게티|마사이[ ]*마라|크루거|남아공|브라질|아르헨티나|칠레|페루|멕시코|코스타리카|파타고니아|갈라파고스|북미|남미|북한|금강산|백두산')
 or ((coalesce(title,'') || ' ' || coalesce(summary,'')) ~* '국립공원공단|국립공원관리공단|국립공원연구원|야생생물보전원|지리산|설악산|북한산|한려해상|다도해해상|태안해안|한라산|경주국립공원|계룡산|속리산|내장산|가야산|덕유산|오대산|주왕산|치악산|월악산|소백산|변산반도|월출산|무등산|태백산|팔공산|금정산|국내[ ]*국립공원|우리나라[ ]*국립공원');
$$;
revoke all on function public.is_domestic_park_news(text,text) from public;
grant execute on function public.is_domestic_park_news(text,text) to anon,authenticated,service_role;
alter table public.articles add column is_domestic boolean generated always as (public.is_domestic_park_news(title,summary)) stored;
create index articles_domestic_published_idx on public.articles(published_at desc) where is_domestic and not is_test;
create or replace function public.search_news(search_text text)
returns setof public.articles
language sql stable security invoker set search_path = '' as $$
  select a.* from public.articles a
  where a.is_domestic and not a.is_test and a.published_at >= '2026-09-01T00:00:00+09:00'::timestamptz
  and length(btrim(search_text)) between 1 and 100
  and (a.title ilike ('%' || replace(replace(replace(btrim(search_text), '\', '\\'), '%', '\%'), '_', '\_') || '%') escape '\'
    or a.summary ilike ('%' || replace(replace(replace(btrim(search_text), '\', '\\'), '%', '\%'), '_', '\_') || '%') escape '\');
$$;
revoke all on function public.search_news(text) from public;
grant execute on function public.search_news(text) to anon, authenticated, service_role;

select pg_notify('pgrst','reload schema');
commit;
