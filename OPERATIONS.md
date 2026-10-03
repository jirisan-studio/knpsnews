# KNPS NEWS 운영 안내

## 운영 인증정보 설정

Vercel `naturekr-5699's projects → knpsnews → Settings → Environment Variables`에서 **Production**에 다음 값을 직접 추가하고 저장합니다.

- `SUPABASE_SECRET_KEY`: 로컬 `.env.local`에 입력한 서버 전용 Supabase 키
- `NAVER_CLIENT_ID`: 기존 API HUB 애플리케이션의 ID
- `NAVER_CLIENT_SECRET`: 기존 API HUB 애플리케이션의 Secret
- `CRON_SECRET`: 비밀번호 관리자 등으로 만든 32자 이상의 임의 문자열. 로컬 `.env.local`에도 같은 값 입력

공개 조회용 `NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`는 이미 Production에 설정했습니다.
Secret은 채팅/스크린샷/Git에 올리지 않습니다. 입력 후 새 배포가 필요합니다.
자동수집은 운영 배포에만 적용되며 인증정보 설정 전 호출은 401로 차단됩니다.

## 수집 방식

`vercel.json`의 UTC 21:00은 다음 날 한국시간 06:00입니다. 현재 사용자 선택에 따라 하루 1회 수집합니다.
[Vercel Hobby 스케줄](https://vercel.com/docs/cron-jobs/usage-and-pricing)은 하루 1회와 약 1시간의 실행 오차를 허용합니다.
`/api/collect`는 정확한 Bearer 인증값을 요구하며 실행 시간은 300초, 내부 작업 예산은 240초입니다.
운영 프로젝트의 Fluid Compute 및 함수 실행 한도를 확인합니다. 한도를 임의로 유료 업그레이드하지 않습니다.

활성 검색어를 DB에서 읽고 NAVER API HUB 날짜순 검색 → 정리 → canonical URL 원자적 저장 → 규칙 기반 다중 영역 연결 → 비공개 기록 순으로 처리합니다.
한 번에 최대 100건을 저장하며 검색어당 최대 1,000개 결과를 조회합니다. API 범위, 시간 제한, 잘못된 기사 형식은 부분 완료로 기록합니다.
검색어별 마지막 수집시각을 유지하고 다음 수집은 한국시간 2일을 겹쳐 지연 기사와 중복을 처리합니다. 실패 검색어는 체크포인트를 이동시키지 않습니다.
DB 잠금으로 동시 작업을 차단하고 중단된 작업의 잠금은 30분 후 만료됩니다. `running` 기록이 오래 남으면 서버 중단/시간 초과를 확인합니다.
뉴스 조회는 NAVER 호출 없이 공개 읽기 키로 DB만 읽으므로 수집 API 장애와 분리됩니다.

## 초기 적재와 수동 실행

로컬 서버 설정을 준비한 관리자가 아래 명령으로 실행합니다.

```sh
npm run collect -- --initial
npm run collection:status
```

초기 적재는 **2026-09-01** 한국시간부터 현재까지를 요청합니다. 검색어별 API 상한 때문에 모든 과거 기사를 완벽하게 복원할 수는 없습니다.
`history_incomplete=true`, `status=partial`이면 조회 한계가 있었으므로 전체 복원 완료로 보고하지 않습니다.
초기 적재 명령은 최대 25분 예산으로 실행합니다. 부분 완료 시 반환값과 비공개 로그를 확인합니다.
일반 증분 수집은 `npm run collect`, 소량 연결 검증은 `npm run collect -- --smoke`입니다.
소량 검증은 검색어 2개/각 3건으로 제한해 의도적으로 부분 완료가 되며 정상 수집 체크포인트를 이동시키지 않습니다.

## 상태와 장애 확인

`npm run collection:status`는 최신 수집 기록, 오늘 저장된 기사 수, 검색어 활성 상태와 마지막 수집시각을 보여줍니다.
원격에서는 인증된 `/api/collection-status`를 사용할 수 있습니다. 일반 사용자에게 DB 로그/검색어 관리 권한을 주지 않습니다.
수집 실패 시 Vercel 프로젝트의 Logs와 Supabase `collection_logs`의 상태/실패 검색어/안전한 오류 요약을 확인합니다.
원본 API 응답/요청 헤더/Secret을 오류 메시지에 추가하지 않습니다. 조회 장애와 수집 장애는 따로 점검합니다.

## 관심영역과 검색어 관리

Supabase Table Editor에서 `news_areas`의 `name/type/parent_id/active/sort_order/aliases`를 관리합니다.
UI는 활성 부모 영역만 기본 메뉴로 보여주고 선택 영역의 모든 하위 지역을 포함합니다. 별칭은 제목·요약 매칭에 사용합니다.
`collection_keywords`에 `keyword`, 필요하면 `news_area_id`를 지정하고 `enabled=true`로 추가합니다. 비활성화는 `enabled=false`로 변경합니다.
같은 기사에서 여러 검색어와 영역이 발견되면 정보를 합치며 기존 연결을 삭제하지 않습니다.
폭넓은 검색어는 연예/관광 등의 주변 기사를 포함할 수 있으므로 운영자가 검색어와 사전을 조정합니다. AI 분류는 없습니다.

## 배포와 검증

GitHub `main` 변경은 Vercel에 배포됩니다. 환경변수 변경 후에는 Redeploy로 새 배포를 만듭니다.
`npm test`, `npm run lint`, `npm run build`, `npm run check:security`를 확인한 후 운영 화면을 점검합니다.
원문 전문은 저장하지 않고 제목, API 요약, 출처 도메인, 발행시각, URL과 분류만 저장합니다.
DB 초기화/테스트 원본 삭제/기존 정상 기능 제거 없이 변경합니다. 실제 휴대폰 테스트와 운영 예약 실행 확인 전 완료를 선언하지 않습니다.
