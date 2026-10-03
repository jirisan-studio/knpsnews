-- Read-only security verification. All five tables must have rls_enabled=true.
select c.relname as table_name, c.relrowsecurity as rls_enabled,
  has_table_privilege('anon', c.oid, 'SELECT') as public_read,
  has_table_privilege('anon', c.oid, 'INSERT') as public_insert,
  has_table_privilege('anon', c.oid, 'UPDATE') as public_update,
  has_table_privilege('anon', c.oid, 'DELETE') as public_delete,
  has_table_privilege('authenticated', c.oid, 'INSERT') as signed_in_insert,
  has_table_privilege('authenticated', c.oid, 'UPDATE') as signed_in_update,
  has_table_privilege('authenticated', c.oid, 'DELETE') as signed_in_delete
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('articles', 'news_areas', 'article_news_areas', 'collection_keywords', 'collection_logs')
order by c.relname;
