begin;
-- Preserve original area IDs and all existing article/child links.
update public.news_areas set name='지리산국립공원' where name='지리산';
update public.news_areas set name='설악산국립공원' where name='설악산';
update public.news_areas set name='북한산국립공원' where name='북한산';
update public.news_areas set name='태안해안국립공원' where name='태안해안';
update public.news_areas set name='한려해상국립공원' where name='한려해상';
update public.news_areas set name='다도해해상국립공원' where name='다도해해상';
insert into public.news_areas(name,type,sort_order,aliases,active) values
 ('지리산국립공원','park',1,array['지리산','노고단','천왕봉','중산리','뱀사골']::text[],true),
 ('경주국립공원','park',2,array['경주']::text[],true),
 ('한려해상국립공원','park',3,array['한려해상']::text[],true),
 ('가야산국립공원','park',4,array['가야산']::text[],true),
 ('주왕산국립공원','park',5,array['주왕산']::text[],true),
 ('팔공산국립공원','park',6,array['팔공산']::text[],true),
 ('금정산국립공원','park',7,array['금정산']::text[],true),
 ('내장산국립공원','park',8,array['내장산']::text[],true),
 ('덕유산국립공원','park',9,array['덕유산']::text[],true),
 ('다도해해상국립공원','park',10,array['다도해해상']::text[],true),
 ('변산반도국립공원','park',11,array['변산반도']::text[],true),
 ('월출산국립공원','park',12,array['월출산']::text[],true),
 ('무등산국립공원','park',13,array['무등산']::text[],true),
 ('계룡산국립공원','park',14,array['계룡산']::text[],true),
 ('속리산국립공원','park',15,array['속리산']::text[],true),
 ('태안해안국립공원','park',16,array['태안해안']::text[],true),
 ('월악산국립공원','park',17,array['월악산']::text[],true),
 ('소백산국립공원','park',18,array['소백산']::text[],true),
 ('설악산국립공원','park',19,array['설악산','대청봉','울산바위']::text[],true),
 ('오대산국립공원','park',20,array['오대산']::text[],true),
 ('북한산국립공원','park',21,array['북한산','백운대']::text[],true),
 ('치악산국립공원','park',22,array['치악산']::text[],true),
 ('태백산국립공원','park',23,array['태백산']::text[],true),
 ('지리산생태탐방원','eco_center',101,array['지리산 생태탐방원']::text[],true),
 ('한려해상생태탐방원','eco_center',102,array['한려해상 생태탐방원']::text[],true),
 ('가야산생태탐방원','eco_center',103,array['가야산 생태탐방원']::text[],true),
 ('무등산생태탐방원','eco_center',104,array['무등산 생태탐방원']::text[],true),
 ('내장산생태탐방원','eco_center',105,array['내장산 생태탐방원']::text[],true),
 ('변산반도생태탐방원','eco_center',106,array['변산반도 생태탐방원']::text[],true),
 ('소백산생태탐방원','eco_center',107,array['소백산 생태탐방원']::text[],true),
 ('계룡산생태탐방원','eco_center',108,array['계룡산 생태탐방원']::text[],true),
 ('북한산생태탐방원','eco_center',109,array['북한산 생태탐방원']::text[],true),
 ('설악산생태탐방원','eco_center',110,array['설악산 생태탐방원']::text[],true),
 ('야생생물보전원','other',201,array['반달가슴곰','야생생물 보전원']::text[],true),
 ('국립공원연구원','other',202,array[]::text[],true),
 ('해양생태보전원','other',203,array[]::text[],true),
 ('국립공원교육원','other',204,array[]::text[],true),
 ('국가지질공원사무국','other',205,array[]::text[],true)
on conflict(name) do update set type=excluded.type,sort_order=excluded.sort_order,aliases=excluded.aliases,active=true;
update public.news_areas set active=false where name in ('기타 국립공원','기타 생태탐방원');
insert into public.collection_keywords(keyword,news_area_id)
select name,id from public.news_areas where active and parent_id is null
on conflict do nothing;
update public.collection_keywords k set enabled=false from public.news_areas a where k.news_area_id=a.id and not a.active;
-- Reclassify already stored title/summary and observed search terms without deleting links.
insert into public.article_news_areas(article_id,news_area_id)
select article.id,area.id from public.articles article cross join public.news_areas area
where area.active and not article.is_test and exists (
 select 1 from unnest(array[area.name] || area.aliases) term
 where length(btrim(term))>0 and strpos(
  regexp_replace(lower(article.title || ' ' || article.summary || ' ' || array_to_string(article.collection_keywords,' ')), '[[:space:]]', '', 'g'),
  regexp_replace(lower(term),'[[:space:]]','','g'))>0
)
on conflict do nothing;
select pg_notify('pgrst','reload schema');
commit;
