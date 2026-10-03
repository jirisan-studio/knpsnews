export function getSupabaseReadConfig(env: Record<string, string | undefined> = process.env) {
  const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!url || !key) {
    throw new Error("Supabase 조회 연결 환경변수가 필요합니다.");
  }

  const parsed = new URL(url);
  if (parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.pathname !== "/" || parsed.search || parsed.hash) {
    throw new Error("Supabase 프로젝트 URL 형식을 확인하세요.");
  }
  if (!key.startsWith("sb_publishable_")) {
    throw new Error("조회 연결에는 Supabase Publishable key만 사용하세요.");
  }

  return { url: parsed.origin, key };
}
