import assert from "node:assert/strict";
import test from "node:test";
import { searchNaverNews } from "../src/lib/naver/client.ts";

const env = { NAVER_CLIENT_ID: "test-client-id", NAVER_CLIENT_SECRET: "test-client-secret" };

test("requests date-sorted Korean news without putting credentials into the URL", async () => {
  const result = await searchNaverNews({ query: "지리산 반달가슴곰", display: 1 }, env, async (url, init) => {
    assert.equal(url.searchParams.get("query"), "지리산 반달가슴곰");
    assert.equal(url.searchParams.get("sort"), "date");
    assert.equal(url.searchParams.get("start"), "1");
    assert.equal(url.href.includes(env.NAVER_CLIENT_SECRET), false);
    assert.equal(init.headers["X-Naver-Client-Secret"], env.NAVER_CLIENT_SECRET);
    return Response.json({ total: 0, start: 1, display: 0, items: [] });
  });
  assert.deepEqual(result.items, []);
});

test("rejects invalid pagination and missing credentials before calling the network", async () => {
  let called = false;
  const fetcher = async () => { called = true; return Response.json({}); };
  await assert.rejects(searchNaverNews({ query: "지리산", start: 1001 }, env, fetcher));
  await assert.rejects(searchNaverNews({ query: "지리산", display: 101 }, env, fetcher));
  await assert.rejects(searchNaverNews({ query: "지리산" }, {}, fetcher));
  assert.equal(called, false);
});

test("discards error bodies and raw network errors containing credentials", async () => {
  await assert.rejects(
    searchNaverNews({ query: "지리산" }, env, async () => new Response(env.NAVER_CLIENT_SECRET, { status: 503 })),
    (error) => error.message.includes("HTTP 503") && !error.message.includes(env.NAVER_CLIENT_SECRET),
  );
  await assert.rejects(
    searchNaverNews({ query: "지리산" }, env, async () => { throw new Error(env.NAVER_CLIENT_SECRET); }),
    (error) => !error.message.includes(env.NAVER_CLIENT_SECRET),
  );
});

test("rejects malformed and partial API payloads", async () => {
  for (const body of ["bad json", JSON.stringify({ total: 1, start: 1, display: 1, items: [{ title: "missing fields" }] })]) {
    await assert.rejects(searchNaverNews({ query: "지리산" }, env, async () => new Response(body)));
  }
});
