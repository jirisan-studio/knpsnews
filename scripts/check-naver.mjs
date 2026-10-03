import nextEnv from "@next/env";
import { searchNaverNews } from "../src/lib/naver/client.ts";

nextEnv.loadEnvConfig(process.cwd());
try {
  // Single read request, no database changes, no client credentials or article payload logged.
  const page = await searchNaverNews({ query: "국립공원공단", display: 1 });
  console.log(`NAVER connection verified. Returned items: ${page.items.length}; available matches: ${page.total}.`);
} catch (error) {
  // Messages are sanitized within our client; never log raw response bodies or headers.
  console.error(error instanceof Error ? error.message : "NAVER connection verification failed.");
  process.exitCode = 1;
}
