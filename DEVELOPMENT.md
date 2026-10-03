# 개발 기록

## 2026-10-03 — 기본 프로젝트 (STEP 1~3)

- 기존 파일: README.md. 기존 초기 커밋 `4a01951`과 원격 HEAD 일치, 작업 트리 변경 없음 확인.
- Node.js 24.11.1 / npm 11.6.2 / Git 사용 가능 확인.
- Next.js 16.3.8 / React 19.3.0 / Tailwind CSS 4.3.3 / TypeScript 구성.
- 기존 README 소개를 유지하고 실행 및 배포 안내 추가. 마스터 지시문 원본 보존.
- `npm run build`: 성공. 홈 화면과 404 화면 정적 생성 확인.
- `npm run typecheck`: 성공.
- `npm run lint`: 오류 0, 경고 0.
- 로컬 서버 HTTP 200, KNPS NEWS와 수집 기준일 2026-09-01 포함 확인.
- 브라우저에서 한국어 제목, 구축 안내, 초기 수집일 및 데스크톱 화면 확인.
- 모바일 너비 검사는 브라우저 도구에서 적용이 일관되지 않아 시각 검증 완료로 기록하지 않음. 실제 기기 검증은 STEP 21에 수행.
- Vercel 가져오기 페이지에서 로그인되지 않은 상태 확인. 계정 로그인은 사용자가 직접 수행해야 함.

## 2026-10-03 — GitHub 반영 (STEP 4)

- `0a7eb6c` (`Initial Next.js setup`)를 `origin/main`에 반영 완료.
- 로컬 `main`과 `origin/main` 일치, 미반영 변경 없음 확인.

## 2026-10-03 — Vercel 최초 배포 (STEP 5)

- 사용자 로그인 후 `naturekr-5699` / `naturekr-5699's projects` 작업 공간 확인.
- 연결된 GitHub 저장소 `jirisan-studio/knpsnews`, `main` 브랜치 가져오기.
- 프로젝트 이름 `knpsnews`, Application Preset `Next.js`, Root Directory `./`, 환경변수 없이 최초 배포.
- Vercel 배포 성공 화면 확인. 배포 대상은 `0a7eb6c`.
- 서비스 주소: https://knpsnews.vercel.app/
- 실제 배포 주소에서 KNPS NEWS 제목, 구축 안내, 초기 수집 기준일 2026-09-01 및 스타일 표시 확인.
- Supabase 대시보드는 로그인 화면으로 이동함. STEP 6 진행을 위해 사용자 로그인 필요.

## 다음 단계

Supabase 로그인 후 기존 `knpsnews` 프로젝트와 보안 설정을 확인하고 연결(STEP 6)을 진행한다.
현재는 뉴스 목록, DB, API, 검색, 자동수집 기능을 구현하지 않았다.
Secret 입력과 계정 권한 승인은 사용자가 직접 수행한다.

## 2026-10-03 — Supabase 조회 연결 (STEP 6)

- 기존 프로젝트 `knpsnews` / `wrhllrxbgxzxjhmlhsph`, Healthy 상태 확인.
- Data API ON, Automatically expose new tables OFF, 기존 사용자 테이블 없음 확인.
- Connect 화면의 공개 Publishable key만 사용. Secret / service_role 키에 접근하지 않음.
- `.env.local`은 Git 제외. Vercel Production에 URL과 Publishable key 설정.
- 공식 `@supabase/supabase-js` 조회 클라이언트와 server-only 모듈 추가.
- API 루트 경로는 HTTP 401을 반환했으나 Auth 설정 API는 200, 실제 테이블 조회는 PGRST205(테이블 미구축)로 연결 검증.
- 재사용 검사 명령은 API 루트 대신 공식 클라이언트로 뉴스 테이블을 조회하도록 수정.
- `npm run check:supabase`, 빌드, 타입 검사, 코드 검사 통과.
- 아직 뉴스 테이블이 없으므로 DB 데이터 조회 성공을 선언하지 않음. STEP 7에서 재검증.
