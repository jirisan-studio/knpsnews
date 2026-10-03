begin;
-- Initial MVP dictionary follows the master specification; extend this data, not UI code.
insert into public.news_areas(name,type,sort_order,aliases) values
 ('지리산','park',10,array['노고단','천왕봉','중산리','뱀사골']),
 ('설악산','park',20,array['대청봉','울산바위']),
 ('북한산','park',30,array['백운대']),
 ('태안해안','park',40,array['태안해안국립공원']),
 ('한려해상','park',50,array['한려해상국립공원']),
 ('다도해해상','park',60,array['다도해해상국립공원']),
 ('기타 국립공원','park',90,array[]::text[]),
 ('국립공원연구원','institute',100,array['국립공원 연구원']),
 ('야생생물보전원','institute',110,array['반달가슴곰','야생생물 보전원']),
 ('북한산생태탐방원','eco_center',200,array['북한산 생태탐방원']),
 ('지리산생태탐방원','eco_center',210,array['지리산 생태탐방원']),
 ('기타 생태탐방원','eco_center',290,array[]::text[])
on conflict(name) do nothing;

insert into public.news_areas(name,type,parent_id,sort_order,aliases)
select child.name,'park',parent.id,child.sort_order,child.aliases
from public.news_areas parent cross join (values
 ('지리산경남',11,array['지리산경남사무소','지리산 경남']),
 ('지리산전남',12,array['지리산전남사무소','지리산 전남']),
 ('지리산전북',13,array['지리산전북사무소','지리산 전북'])
) child(name,sort_order,aliases) where parent.name='지리산'
on conflict(name) do nothing;

insert into public.collection_keywords(keyword,news_area_id) values
 ('국립공원공단',null),('국립공원',null),('국립공원 산불',null),('국립공원 탐방로',null)
on conflict do nothing;
insert into public.collection_keywords(keyword,news_area_id)
select name,id from public.news_areas where active and name not in ('기타 국립공원','기타 생태탐방원')
on conflict do nothing;
insert into public.collection_keywords(keyword,news_area_id)
select keywords.keyword,a.id from (values
 ('지리산국립공원','지리산'),('설악산국립공원','설악산'),('반달가슴곰','야생생물보전원')
) keywords(keyword,area_name) join public.news_areas a on a.name=keywords.area_name
on conflict do nothing;
commit;
