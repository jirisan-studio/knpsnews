begin;
create function public.is_bukhansan_park_news(title text,summary text) returns boolean
language sql immutable security invoker set search_path='' as $$
 select (coalesce(title,'') || ' ' || coalesce(summary,'')) ~* '북한산[ ]*(국립공원|생태탐방원|성|둘레길)|백운대|인수봉|우이령|북한산.{0,40}(등산|산행|탐방|정상|산악|사찰|단풍|등반)'
 or not ((coalesce(title,'') || ' ' || coalesce(summary,'')) ~* '농산물|농수산물|수산물|축산물|임산물|원산지|김치|송이|버섯|수입산|밀수|북한산[ ]*(제품|상품|석탄|수산|농산|맥주|술|쌀)');
$$;
revoke all on function public.is_bukhansan_park_news(text,text) from public;
grant execute on function public.is_bukhansan_park_news(text,text) to anon,authenticated,service_role;
create or replace function public.is_domestic_park_news(title text,summary text) returns boolean
language sql immutable security invoker set search_path='' as $$
 select (case when public.is_bukhansan_park_news(title,summary)
 then coalesce(title,'') || ' ' || coalesce(summary,'')
 else replace(coalesce(title,'') || ' ' || coalesce(summary,''),'북한산','') end) ~* '국립공원공단|국립공원관리공단|국립공원연구원|야생생물보전원|해양생태보전원|국립공원교육원|국가지질공원사무국|지리산|설악산|북한산|한려해상|다도해해상|태안해안|한라산|경주국립공원|계룡산|속리산|내장산|가야산|덕유산|오대산|주왕산|치악산|월악산|소백산|변산반도|월출산|무등산|태백산|팔공산|금정산|(국내|우리나라|전국|한국의)[ ]*국립공원';
$$;
-- Recompute existing generated flags using unchanged article text; no articles removed.
update public.articles set title=title;
-- Use the precise park name for new searches, retaining the historic keyword record.
update public.collection_keywords set enabled=false where keyword='북한산';
select pg_notify('pgrst','reload schema');
commit;
