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
- 다음 단계: Supabase 로그인 후 기존 `knpsnews` 프로젝트를 확인하고 연결(STEP 6).

현재 화면은 구축 안내 화면이며 뉴스 조회나 수집은 아직 구현하지 않았습니다.
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

다음 단계에서 `articles`, `news_areas`, `article_news_areas`, `collection_keywords`, 수집 로그를 구성합니다.
기사와 관심영역은 다대다로 연결하고 관심영역과 검색어는 DB에서 관리합니다.
지리산은 하나의 기본 관심영역으로 제공하며 하위 지역 관계를 지원할 예정입니다.

## 보안과 환경변수

이 단계에는 환경변수가 필요 없습니다. 이후 다음 이름을 사용할 예정입니다(실제 값은 문서에 기록하지 않습니다).

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — 서버 전용
- `NAVER_CLIENT_ID` — 서버 전용
- `NAVER_CLIENT_SECRET` — 서버 전용

로컬 값은 `.env.local`, 배포 값은 Vercel의 **Project → Settings → Environment Variables**에 직접 입력합니다.
`.env*`, `.vercel`, 의존성과 빌드 결과는 Git 추적에서 제외합니다.
RLS를 활성화하고 일반 사용자는 조회만 허용합니다.

## 디자인과 확장 원칙

녹색 브랜드 색상, 밝은 배경, 한국어 시스템 글꼴, 모바일 우선의 단순한 카드 구성을 유지합니다.
향후 검색이나 뉴스 목록을 이 화면 언어에 맞춰 추가합니다.
PDF, AI, 푸시 알림, 직원 로그인은 현재 범위에 포함하지 않습니다.
DB 초기화나 정상 기능 삭제 없이 단계별 검증과 커밋을 진행합니다.
