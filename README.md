# knpsnews
국립공원공단 뉴스 아카이브 

국립공원공단 직원이 휴대폰에서 날짜 × 뉴스 관심영역 × 키워드로 언론보도를 찾는 서비스입니다.
기준 명세는 [MASTER_SPEC.txt](./MASTER_SPEC.txt)에 보존합니다.

## 현재 진행 상태

- STEP 1: 기존 README와 초기 커밋 확인. 원격 저장소와 로컬 일치 확인.
- STEP 2: Next.js App Router + TypeScript + Tailwind CSS 기본 프로젝트 구성.
- STEP 3: 로컬 화면 표시, 빌드, 코드 검사, 타입 검사 통과. 상세 결과는 [개발 기록](./DEVELOPMENT.md) 참조.
- STEP 4: 기본 프로젝트 커밋 `0a7eb6c`를 GitHub `main`에 반영.
- STEP 5: Vercel 최초 배포 성공. [서비스 주소](https://knpsnews.vercel.app/)에서 기본 화면 확인.
- STEP 6: Supabase 공개 조회 연결을 로컬에서 검증. Vercel Production 조회용 환경변수 설정 완료.
- STEP 7: 뉴스 DB 5개 테이블 생성, RLS 및 공개 조회/쓰기 차단 검증.
- STEP 8: 실제 DB의 명확히 표시된 테스트 기사 1건을 조회해 표시. NAVER 연결은 아직 미구현.
- STEP 9~10: NAVER API HUB 서버 연결과 실제 뉴스 검색 성공. 서버 전용 모듈/오류 처리 검증.
- 다음 단계: 검색한 뉴스 DB 저장(STEP 11). 사용자 직접 Supabase 수집용 Secret key 입력 필요.

현재 화면은 구축 안내와 DB 연결 확인용 테스트 기사입니다. 실제 뉴스 수집과 검색 기능은 아직 구현하지 않았습니다.
초기 데이터 수집 시작일은 반드시 **2026-09-01**입니다.

## 로컬 실행

Node.js 22 이상과 npm을 사용합니다. 현재 확인한 환경은 Node.js 24입니다.

```sh
npm ci
npm run dev
```

브라우저에서 http://localhost:3000 을 열면 KNPS NEWS 구축 안내가 표시됩니다.

```sh
npm run lint
npm run typecheck
npm run build
npm run start
```

`typecheck`는 최초 실행 시 `npm run dev` 또는 `npm run build`로 Next.js 타입 파일을 생성한 뒤 실행합니다.

## 최초 Vercel 배포

1. Vercel에서 `naturekr-5699` 계정 또는 해당 작업 공간을 선택합니다.
2. **Add New → Project**에서 `jirisan-studio/knpsnews`를 가져옵니다.
3. Framework Preset은 **Next.js**, Root Directory는 저장소 최상위(`./`)로 유지합니다.
4. **Deploy**를 누릅니다. 최초 안내 화면에는 환경변수가 필요 없습니다.
5. 배포된 주소에서 KNPS NEWS 화면과 모바일 레이아웃을 확인합니다.

GitHub 접근 권한 승인과 로그인이 필요한 경우 사용자가 직접 진행합니다.
이후 DB와 뉴스 API 연결 단계에서 필요한 환경변수만 추가합니다.

## 예정된 시스템 구조

NAVER 뉴스 API → 서버 수집 → 정리 / 중복 제거 / 규칙 기반 분류 → Supabase → 뉴스 조회 화면.
사용자 접속으로 NAVER API를 호출하지 않으며 기사 전문을 저장하지 않습니다.

`articles`, `news_areas`, `article_news_areas`, `collection_keywords`, `collection_logs`를 구성했습니다.
기사와 관심영역은 다대다로 연결하고 관심영역과 검색어는 DB에서 관리합니다.
지리산은 하나의 기본 관심영역으로 제공하며 하위 지역 관계를 지원할 예정입니다.

## 보안과 환경변수

조회 연결에는 `.env.example`의 두 `NEXT_PUBLIC_` 값을 사용합니다. 실제 값은 Git에 기록하지 않습니다.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — 공개 조회용, 권한은 RLS와 DB GRANT로 제한
- `SUPABASE_SECRET_KEY` — 향후 수집 단계 서버 전용
- `NAVER_CLIENT_ID` — 서버 전용
- `NAVER_CLIENT_SECRET` — 서버 전용

로컬 값은 `.env.local`, 배포 값은 Vercel의 **Project → Settings → Environment Variables**에 직접 입력합니다.
`npm run check:supabase`로 조회 연결을 검사합니다. DB 구축 전에는 뉴스 테이블 미노출 상태가 표시됩니다.
`npm run check:security`로 실제 공개 API의 쓰기 차단과 관리 테이블 비공개 상태를 검증합니다.
Supabase의 현행 Publishable / Secret 키 이름을 사용합니다. Legacy anon / service_role 키를 공개 변수에 넣지 않습니다.
`.env*`, `.vercel`, 의존성과 빌드 결과는 Git 추적에서 제외합니다.
RLS를 활성화하고 일반 사용자는 조회만 허용합니다.

## NAVER 연결 (STEP 9~10)

`src/lib/naver/client.ts`는 서버 전용입니다. 브라우저 뉴스 조회와 연결하지 않았습니다.
뉴스 검색을 날짜순으로 요청하며, 잘못된 검색 조건/응답/타임아웃/HTTP 오류를 처리합니다.
키는 요청 헤더에만 넣고 오류 응답 본문과 원본 네트워크 오류를 로그에 남기지 않습니다.

1. NAVER Cloud Platform의 NAVER API HUB에서 기존 `knpsnews` 애플리케이션을 엽니다.
2. 로컬 `.env.local`의 `NAVER_CLIENT_ID=`와 `NAVER_CLIENT_SECRET=` 오른쪽에 각각 값을 직접 붙여넣고 저장합니다.
3. 키를 채팅으로 보내지 않고 입력 완료만 알려주면 에이전트가 `npm run check:naver`로 실제 호출을 검증합니다.

공식 요청 사양: https://api.ncloud-docs.com/docs/naver-api-hub-search-news
API HUB 전용 URL `/search/v1/news`와 `X-NCP-APIGW-API-KEY-ID` / `X-NCP-APIGW-API-KEY` 헤더를 사용합니다.
실제 뉴스 검색 1건 응답을 확인했습니다. 초기 수집/실제 뉴스 DB 저장/자동수집은 이후 단계입니다.
`npm test`는 네트워크 호출 없이 오류 처리와 키가 URL/오류에 포함되지 않는지 검증합니다.

## 다음 단계: 수집용 DB 키 입력

Supabase **Project Settings → API Keys → Secret keys**에서 기존 Secret key를 확인합니다.
로컬 `.env.local`의 `SUPABASE_SECRET_KEY=` 오른쪽에 값을 직접 입력해 저장합니다.
조회용 Publishable key와 다른 서버 전용 키입니다. `NEXT_PUBLIC_` 변수에는 넣지 않습니다.
API 키를 채팅에 보내지 않고 입력 완료만 알려주면 다음 단계 실제 저장 검증을 진행합니다.
운영 자동수집을 연결할 때는 같은 서버 전용 값을 Vercel Environment Variables에도 사용자가 직접 설정합니다.

## DB 구조 적용

이미 운영 프로젝트에 첫 마이그레이션을 적용했습니다. 같은 파일을 재실행하지 않습니다.
새 환경에서는 SQL Editor에서 `supabase/migrations/202610030001_news_schema.sql`을 한 번 실행합니다.
`supabase/verify-schema.sql`로 RLS와 테이블 권한을 확인합니다.
public schema 노출을 유지하되 자동 신규 테이블 노출은 끄고, SQL GRANT로 필요한 세 테이블만 조회 허용합니다.
검색어/수집 로그에는 일반 사용자 권한이나 정책을 추가하지 않습니다.

STEP 8 테스트 데이터는 `supabase/fixtures/connection-test.sql`로 저장했습니다.
`is_test=true`, `source_type=manual`로 실제 언론보도와 구분하며 링크는 국립공원공단 홈페이지입니다.
화면은 최신 20건만 조회하고 발행시간은 한국 시간으로 표시합니다.
실제 수집 시작 시 운영 조회에서 `is_test=false` 조건을 적용해 테스트 기사를 제외합니다(원본은 삭제하지 않음).
세부 지역은 DB에 보존하고 기본 화면의 관심영역 표시는 지리산으로 통합합니다.

## 디자인과 확장 원칙

녹색 브랜드 색상, 밝은 배경, 한국어 시스템 글꼴, 모바일 우선의 단순한 카드 구성을 유지합니다.
향후 검색이나 뉴스 목록을 이 화면 언어에 맞춰 추가합니다.
PDF, AI, 푸시 알림, 직원 로그인은 현재 범위에 포함하지 않습니다.
DB 초기화나 정상 기능 삭제 없이 단계별 검증과 커밋을 진행합니다.
