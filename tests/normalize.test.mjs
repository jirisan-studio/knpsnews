import assert from "node:assert/strict";
import test from "node:test";
import { canonicalArticleUrl, normalizeNews, plainText } from "../src/lib/news/normalize.ts";

const item = { title: '<b>지리산</b> &quot;곰&quot;', description: '환경 &amp; 보전 &#x1F43B;', originallink: 'https://example.org/news?id=12&utm_source=naver#top', link: 'https://n.news.naver.com/article/001/123', pubDate: 'Tue, 15 Sep 2026 09:00:00 +0900' };
test('preserves text and article identity while removing API markup and tracking', () => {
  const value = normalizeNews(item, '지리산');
  assert.equal(value.title, '지리산 "곰"');
  assert.equal(value.summary, '환경 & 보전 🐻');
  assert.equal(value.canonical_url, 'https://example.org/news?id=12');
  assert.equal(value.original_url, item.originallink);
  assert.equal(value.media_name, 'example.org');
  assert.equal(plainText('&#x110000;'), '�');
  assert.notEqual(canonicalArticleUrl('https://example.org/news?id=13'), value.canonical_url);
});
test('rejects executable URLs, embedded credentials and dates before the Korean archive boundary', () => {
  for (const original of ['javascript:alert(1)', 'https://user:password@example.org/']) assert.throws(() => normalizeNews({...item,originallink:original},'지리산'));
  assert.throws(() => normalizeNews({...item,pubDate:'Mon, 31 Aug 2026 23:59:59 +0900'},'지리산'));
  assert.doesNotThrow(() => normalizeNews({...item,pubDate:'Tue, 01 Sep 2026 00:00:00 +0900'},'지리산'));
  assert.throws(() => normalizeNews({...item,pubDate:'not a date'},'지리산'));
});
