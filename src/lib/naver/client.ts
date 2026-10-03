import "server-only";

export type NaverNewsItem = {
  title: string;
  originallink: string;
  link: string;
  description: string;
  pubDate: string;
};

export type NaverNewsPage = {
  total: number;
  start: number;
  display: number;
  items: NaverNewsItem[];
};

function isItem(item: unknown): item is NaverNewsItem {
  if (!item || typeof item !== "object") return false;
  const row = item as Record<string, unknown>;
  return ["title", "originallink", "link", "description", "pubDate"].every((name) => typeof row[name] === "string");
}

export async function searchNaverNews(
  request: { query: string; start?: number; display?: number },
  env: Record<string, string | undefined> = process.env,
  fetcher: typeof fetch = fetch,
): Promise<NaverNewsPage> {
  const query = request.query.trim();
  const start = request.start ?? 1;
  const display = request.display ?? 100;
  if (!query || !Number.isInteger(start) || start < 1 || start > 1000 || !Number.isInteger(display) || display < 1 || display > 100) {
    throw new Error("NAVER 뉴스 검색 조건이 올바르지 않습니다.");
  }
  const clientId = env.NAVER_CLIENT_ID?.trim();
  const clientSecret = env.NAVER_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) throw new Error("NAVER 서버 연결 환경변수가 필요합니다.");

  const url = new URL("https://openapi.naver.com/v1/search/news.json");
  url.search = new URLSearchParams({ query, start: String(start), display: String(display), sort: "date" }).toString();
  let response: Response;
  try {
    response = await fetcher(url, {
      headers: { "X-Naver-Client-Id": clientId, "X-Naver-Client-Secret": clientSecret },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
      redirect: "error",
    });
  } catch {
    // Do not propagate fetch errors that could contain request/credential details.
    throw new Error("NAVER 뉴스 API에 연결하지 못했습니다.");
  }
  if (!response.ok) throw new Error(`NAVER 뉴스 API 오류 (HTTP ${response.status})`);

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new Error("NAVER 뉴스 API 응답 형식이 올바르지 않습니다.");
  }
  if (!data || typeof data !== "object") throw new Error("NAVER 뉴스 API 응답 형식이 올바르지 않습니다.");
  const row = data as Record<string, unknown>;
  if (
    !Number.isInteger(row.total) || Number(row.total) < 0 ||
    !Number.isInteger(row.start) || Number(row.start) < 1 ||
    !Number.isInteger(row.display) || Number(row.display) < 0 ||
    !Array.isArray(row.items) || !row.items.every(isItem)
  ) throw new Error("NAVER 뉴스 API 응답 형식이 올바르지 않습니다.");

  return { total: Number(row.total), start: Number(row.start), display: Number(row.display), items: row.items };
}
