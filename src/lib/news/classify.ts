export type NewsArea = { id: string; name: string; type: string; parent_id: string | null; aliases: string[]; sort_order: number };
export type CollectionKeyword = { id: string; keyword: string; news_area_id: string | null; last_collected_at?:string|null };

const comparable = (value: string) => value.normalize('NFKC').replace(/\s+/g, '').toLocaleLowerCase('ko-KR');

export function ancestors(ids: string[], areas: NewsArea[]) {
  const selected = new Set(ids);
  for (const id of selected) {
    const parent = areas.find(area => area.id === id)?.parent_id;
    if (parent && areas.some(area => area.id === parent)) selected.add(parent);
  }
  return [...selected];
}

export function descendants(id: string, areas: NewsArea[]) {
  const selected = new Set([id]);
  for (const parent of selected) {
    for (const area of areas) if (area.parent_id === parent) selected.add(area.id);
  }
  return [...selected];
}

export function classifyNews(article: { title: string; summary: string }, keyword: CollectionKeyword, areas: NewsArea[]) {
  const text = comparable(`${article.title} ${article.summary}`);
  const matched = areas.filter(area => [area.name, ...area.aliases].some(term => term.trim() && text.includes(comparable(term)))).map(area => area.id);
  if (keyword.news_area_id && areas.some(area => area.id === keyword.news_area_id)) matched.push(keyword.news_area_id);
  return ancestors(matched, areas);
}
