import type { NaverNewsItem } from "../naver/client.ts";

export const ARCHIVE_START = "2026-09-01";
const archiveStartInstant = Date.parse("2026-09-01T00:00:00+09:00");

export function plainText(value: string) {
  const entities: Record<string, string> = { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">", nbsp: " " };
  return value.replace(/&(#x[0-9a-f]+|#\d+|amp|quot|apos|lt|gt|nbsp);/gi, (_, entity: string) => {
    if (!entity.startsWith("#")) return entities[entity.toLowerCase()] ?? "";
    const point = entity.slice(0, 2).toLowerCase() === "#x" ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
    return point > 0 && point <= 0x10ffff && !(point >= 0xd800 && point <= 0xdfff) ? String.fromCodePoint(point) : "�";
  }).replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

export function safeArticleUrl(value: string) {
  const url = new URL(value);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) throw new Error("기사 URL 형식이 올바르지 않습니다.");
  return url;
}

export function canonicalArticleUrl(value: string) {
  const url = safeArticleUrl(value);
  url.hash = "";
  for (const name of [...url.searchParams.keys()]) {
    if (/^utm_/i.test(name) || ["fbclid", "gclid", "dclid", "msclkid"].includes(name.toLowerCase())) url.searchParams.delete(name);
  }
  url.searchParams.sort();
  return url.href;
}

export function normalizeNews(item: NaverNewsItem, keyword: string) {
  const date = Date.parse(item.pubDate);
  if (!Number.isFinite(date) || date < archiveStartInstant) throw new Error("수집 기준일 이전이거나 잘못된 기사 날짜입니다.");
  const original = safeArticleUrl(item.originallink.trim() || item.link.trim());
  const title = plainText(item.title);
  if (!title) throw new Error("기사 제목이 비어 있습니다.");
  return {
    title,
    summary: plainText(item.description),
    media_name: original.hostname, // NAVER supplies no publisher field; show truthful source domain.
    original_url: original.href,
    canonical_url: canonicalArticleUrl(original.href),
    naver_url: item.link ? safeArticleUrl(item.link).href : null,
    published_at: new Date(date).toISOString(),
    source_type: "online",
    is_test: false,
    collection_keywords: [keyword],
  };
}
